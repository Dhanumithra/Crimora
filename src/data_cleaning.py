"""Data Cleaning and Normalization Utilities.

Provides reusable, robust functions for whitespace trimming, categorical normalization,
duplicate detection, missing value handling, date parsing, numerical coercion,
and spatial coordinate validation.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd


def load_csv(
    file_path: Union[str, Path],
    encodings_to_try: Optional[List[str]] = None,
    **kwargs: Any,
) -> pd.DataFrame:
    """Load a CSV file with automatic fallback across standard encodings.

    Args:
        file_path: Path to the CSV file.
        encodings_to_try: List of encodings to attempt (default: utf-8, latin-1, iso-8859-1, cp1252).
        **kwargs: Additional keyword arguments passed to pd.read_csv.

    Returns:
        pd.DataFrame: Loaded dataframe.

    Raises:
        FileNotFoundError: If file_path does not exist.
        ValueError: If file cannot be decoded by any attempted encoding.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Source file not found: {path}")

    if encodings_to_try is None:
        encodings_to_try = ["utf-8", "latin-1", "iso-8859-1", "cp1252"]

    last_error: Optional[Exception] = None
    for enc in encodings_to_try:
        try:
            return pd.read_csv(path, encoding=enc, **kwargs)
        except (UnicodeDecodeError, UnicodeError) as exc:
            last_error = exc
            continue

    raise ValueError(
        f"Failed to read CSV at {path} with encodings {encodings_to_try}. Error: {last_error}"
    )


def strip_whitespace(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Strip leading and trailing whitespace from string columns in a DataFrame.

    Does not modify the original DataFrame; returns a cleaned copy.

    Args:
        df: Input DataFrame.
        columns: Optional list of columns to strip. If None, strips all object/string columns.

    Returns:
        pd.DataFrame: Cleaned DataFrame copy.
    """
    df_clean = df.copy()
    target_cols = columns if columns is not None else df_clean.select_dtypes(include=["object", "string"]).columns

    for col in target_cols:
        if col in df_clean.columns and (
            df_clean[col].dtype == "object" or isinstance(df_clean[col].dtype, pd.StringDtype)
        ):
            df_clean[col] = df_clean[col].apply(lambda x: x.strip() if isinstance(x, str) else x)

    return df_clean


def normalize_categorical(
    series: pd.Series,
    case_style: Optional[str] = "title",
    strip: bool = True,
    value_mapping: Optional[Dict[str, str]] = None,
) -> pd.Series:
    """Normalize categorical strings for formatting consistency without altering distinct categories.

    Args:
        series: Input pandas Series.
        case_style: Desired casing ('lower', 'upper', 'title', or None).
        strip: Whether to strip leading/trailing whitespace.
        value_mapping: Optional dictionary mapping legacy/inconsistent labels to standardized names.

    Returns:
        pd.Series: Normalized series.
    """
    s = series.copy()

    def _clean_val(val: Any) -> Any:
        if not isinstance(val, str):
            return val
        clean = val.strip() if strip else val
        if case_style == "lower":
            clean = clean.lower()
        elif case_style == "upper":
            clean = clean.upper()
        elif case_style == "title":
            clean = clean.title()
        if value_mapping and clean in value_mapping:
            clean = value_mapping[clean]
        elif value_mapping and val in value_mapping:
            clean = value_mapping[val]
        return clean

    return s.apply(_clean_val)


def detect_duplicates(
    df: pd.DataFrame,
    subset: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Inspect and report exact duplicate rows or duplicate keys.

    Args:
        df: Input DataFrame.
        subset: Optional list of columns to consider for identifying duplicates.

    Returns:
        Dict[str, Any]: Report dictionary with total rows, duplicate count, percentage,
                        and sample duplicate indices/rows.
    """
    num_rows = len(df)
    duplicate_mask = df.duplicated(subset=subset, keep="first")
    duplicate_count = int(duplicate_mask.sum())
    duplicate_pct = round(float((duplicate_count / num_rows) * 100), 2) if num_rows > 0 else 0.0

    return {
        "total_rows": num_rows,
        "duplicate_count": duplicate_count,
        "duplicate_percentage": duplicate_pct,
        "subset_columns": subset,
        "duplicate_indices": df[duplicate_mask].index.tolist()[:10],
    }


def report_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Generate a structured summary DataFrame of missing values across all columns.

    Args:
        df: Input DataFrame.

    Returns:
        pd.DataFrame: Summary table containing column, missing count, missing percentage, and dtype.
    """
    total_rows = len(df)
    missing_count = df.isnull().sum()
    missing_pct = (missing_count / total_rows * 100).round(2) if total_rows > 0 else 0.0

    report_df = pd.DataFrame({
        "column": df.columns,
        "missing_count": missing_count.values,
        "missing_percentage": missing_pct.values,
        "dtype": [str(t) for t in df.dtypes.values],
    })

    return report_df.sort_values(by="missing_count", ascending=False).reset_index(drop=True)


def parse_dates_safely(
    series: pd.Series,
    format: Optional[str] = None,
    errors: str = "coerce",
) -> pd.Series:
    """Parse date fields safely into pandas datetime, handling numeric YYYYMMDD and irregular lengths.

    Malformed dates (such as 9-digit integers with entry typos) are coerced to NaT
    instead of throwing unhandled exceptions.

    Args:
        series: Input series containing date values.
        format: Explicit datetime format string (e.g., '%Y%m%d').
        errors: Error handling mode ('coerce', 'raise', 'ignore').

    Returns:
        pd.Series: Datetime series with pd.NaT for invalid dates.
    """
    s = series.copy()

    # If already datetime, return as is
    if pd.api.types.is_datetime64_any_dtype(s):
        return s

    # If numeric representation (like 20100504), convert to string
    if pd.api.types.is_numeric_dtype(s):
        s_str = s.astype(str).str.strip().str.split(".").str[0]
    else:
        s_str = s.astype(str).str.strip()

    # Use pd.to_datetime with coerce
    if format:
        return pd.to_datetime(s_str, format=format, errors=errors)
    return pd.to_datetime(s_str, errors=errors)


def coerce_numeric(
    series: pd.Series,
    sentinel_strings: Optional[List[str]] = None,
) -> pd.Series:
    """Coerce string or mixed series to numeric float, converting non-numeric sentinels to NaN.

    Preserves valid zero (0) values (such as infant ages or zero crime counts)
    without replacing them with missing indicators.

    Args:
        series: Input series.
        sentinel_strings: List of string representations to replace with NaN
                          (defaults to ['Unknown', 'unknown', '-', 'N/C', 'NA', 'None', '?']).

    Returns:
        pd.Series: Coerced numeric float64 series.
    """
    if sentinel_strings is None:
        sentinel_strings = ["Unknown", "unknown", "-", "N/C", "NA", "None", "?", ""]

    s = series.copy()

    # Replace designated sentinel strings with NaN first
    if s.dtype == "object" or isinstance(s.dtype, pd.StringDtype):
        s = s.replace(sentinel_strings, np.nan)
        # Remove formatting commas if present (e.g. '168,450')
        s = s.astype(str).str.replace(",", "", regex=False)
        s = s.replace(["nan", "None", "<NA>"], np.nan)

    return pd.to_numeric(s, errors="coerce")


def validate_coordinates(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
) -> pd.Series:
    """Validate geographic coordinates against physical spherical limits.

    Valid ranges:
        - Latitude: -90.0 to 90.0
        - Longitude: -180.0 to 180.0

    Does NOT replace coordinates with 0 or fake locations.
    Returns a boolean mask of valid coordinates.

    Args:
        df: Input DataFrame.
        lat_col: Column name for latitude.
        lon_col: Column name for longitude.

    Returns:
        pd.Series: Boolean series (True = valid, False = missing or out-of-bounds).
    """
    if lat_col not in df.columns or lon_col not in df.columns:
        raise KeyError(f"Coordinate columns '{lat_col}' and/or '{lon_col}' not found in DataFrame.")

    lat = pd.to_numeric(df[lat_col], errors="coerce")
    lon = pd.to_numeric(df[lon_col], errors="coerce")

    # Both must be non-null and within valid boundaries
    is_valid_lat = lat.notnull() & (lat >= -90.0) & (lat <= 90.0)
    is_valid_lon = lon.notnull() & (lon >= -180.0) & (lon <= 180.0)

    return is_valid_lat & is_valid_lon


def identify_total_rows(
    series: pd.Series,
    patterns: Optional[List[str]] = None,
) -> pd.Series:
    """Identify aggregate/summary rows (such as 'Total' or 'TOTAL DISTRICT(S)').

    Args:
        series: District or region series.
        patterns: List of regex/string patterns indicating summary rows.

    Returns:
        pd.Series: Boolean mask where True indicates a summary row.
    """
    if patterns is None:
        patterns = ["^total$", "^total district\\(s\\)$", "^state total$", "^all india$"]

    s_clean = series.astype(str).str.strip().str.lower()
    combined_pattern = "|".join(patterns)
    return s_clean.str.contains(combined_pattern, regex=True, na=False)
