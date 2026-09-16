"""Geographic and Spatial Utilities Module.

Provides robust, reusable spatial functions for:
- Detecting coordinate columns dynamically
- Validating physical latitude [-90, 90] and longitude [-180, 180] limits
- Preserving and segregating missing/invalid coordinates without synthetic replacement
- Numeric coordinate coercion
- Vectorized Haversine spherical distance calculation
- High-efficiency pairwise spatial distance computation
- Regular bounding box and 2D spatial grid generation
- Sanitized coordinate dataset serialization (PII-free)
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd


def find_coordinate_columns(df: pd.DataFrame) -> Tuple[Optional[str], Optional[str]]:
    """Identify latitude and longitude column names in a DataFrame.

    Searches exact matches first, then case-insensitive prefix/keyword matches.

    Args:
        df: Input DataFrame.

    Returns:
        Tuple[Optional[str], Optional[str]]: (lat_col, lon_col) or (None, None) if not identified.
    """
    col_lower = {col.lower(): col for col in df.columns}

    # Common exact names
    lat_candidates = ["lat", "latitude", "y", "lat_deg", "incident_lat"]
    lon_candidates = ["lon", "lng", "longitude", "x", "lon_deg", "incident_lon"]

    found_lat: Optional[str] = None
    found_lon: Optional[str] = None

    for candidate in lat_candidates:
        if candidate in col_lower:
            found_lat = col_lower[candidate]
            break

    for candidate in lon_candidates:
        if candidate in col_lower:
            found_lon = col_lower[candidate]
            break

    # Fallback: substring search if exact not found
    if not found_lat:
        for low_name, orig in col_lower.items():
            if "lat" in low_name and "relation" not in low_name:
                found_lat = orig
                break

    if not found_lon:
        for low_name, orig in col_lower.items():
            if ("lon" in low_name or "lng" in low_name) and "relation" not in low_name:
                found_lon = orig
                break

    return found_lat, found_lon


def validate_latitude(series: pd.Series) -> pd.Series:
    """Validate latitude values against physical spherical bounds [-90.0, 90.0].

    Args:
        series: Pandas Series of latitude candidates.

    Returns:
        pd.Series: Boolean mask where True indicates valid finite latitude.
    """
    numeric_lat = pd.to_numeric(series, errors="coerce")
    return numeric_lat.notna() & (numeric_lat >= -90.0) & (numeric_lat <= 90.0)


def validate_longitude(series: pd.Series) -> pd.Series:
    """Validate longitude values against physical spherical bounds [-180.0, 180.0].

    Args:
        series: Pandas Series of longitude candidates.

    Returns:
        pd.Series: Boolean mask where True indicates valid finite longitude.
    """
    numeric_lon = pd.to_numeric(series, errors="coerce")
    return numeric_lon.notna() & (numeric_lon >= -180.0) & (numeric_lon <= 180.0)


def coerce_coordinates(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
) -> pd.DataFrame:
    """Convert coordinate columns to standard numeric float64.

    Does not modify the original DataFrame; returns a copy with coerced floats.
    Invalid strings or non-numeric tokens become np.nan (never 0.0).

    Args:
        df: Input DataFrame.
        lat_col: Latitude column name.
        lon_col: Longitude column name.

    Returns:
        pd.DataFrame: DataFrame copy with coerced float coordinate columns.
    """
    df_clean = df.copy()
    df_clean[lat_col] = pd.to_numeric(df_clean[lat_col], errors="coerce").astype(float)
    df_clean[lon_col] = pd.to_numeric(df_clean[lon_col], errors="coerce").astype(float)
    return df_clean


def filter_valid_coordinates(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
) -> pd.DataFrame:
    """Filter records containing valid, non-null, within-bounds geographic coordinates.

    Strictly preserves coordinate integrity without replacing missing coordinates with 0.

    Args:
        df: Input DataFrame.
        lat_col: Latitude column name.
        lon_col: Longitude column name.

    Returns:
        pd.DataFrame: Filtered DataFrame with only physically valid coordinates.
    """
    valid_lat = validate_latitude(df[lat_col])
    valid_lon = validate_longitude(df[lon_col])
    valid_mask = valid_lat & valid_lon
    return df[valid_mask].copy().reset_index(drop=True)


def extract_missing_coordinates(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
) -> pd.DataFrame:
    """Extract and segregate records with missing or out-of-bounds coordinates.

    Args:
        df: Input DataFrame.
        lat_col: Latitude column name.
        lon_col: Longitude column name.

    Returns:
        pd.DataFrame: DataFrame containing only records with invalid/missing coordinates.
    """
    valid_lat = validate_latitude(df[lat_col])
    valid_lon = validate_longitude(df[lon_col])
    invalid_mask = ~(valid_lat & valid_lon)
    return df[invalid_mask].copy().reset_index(drop=True)


def haversine_distance(
    lat1: Union[float, np.ndarray, pd.Series],
    lon1: Union[float, np.ndarray, pd.Series],
    lat2: Union[float, np.ndarray, pd.Series],
    lon2: Union[float, np.ndarray, pd.Series],
    earth_radius_km: float = 6371.0,
) -> Union[float, np.ndarray]:
    """Calculate the great-circle distance between points on a sphere via Haversine formula.

    Supports scalar, array, or broadcasting inputs.

    Args:
        lat1: Latitude of point 1 in decimal degrees.
        lon1: Longitude of point 1 in decimal degrees.
        lat2: Latitude of point 2 in decimal degrees.
        lon2: Longitude of point 2 in decimal degrees.
        earth_radius_km: Mean Earth radius in kilometers (default: 6371.0 km).

    Returns:
        Distance in kilometers.
    """
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)

    a = (
        np.sin(delta_phi / 2.0) ** 2
        + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0) ** 2
    )
    # Clip to [0, 1] to prevent floating point inaccuracies beyond arcsin domain
    a = np.clip(a, 0.0, 1.0)
    c = 2.0 * np.arcsin(np.sqrt(a))
    return earth_radius_km * c


def pairwise_haversine_matrix(
    coords_a: np.ndarray,
    coords_b: np.ndarray,
    earth_radius_km: float = 6371.0,
) -> np.ndarray:
    """Compute pairwise Haversine distance matrix between two sets of coordinates.

    Args:
        coords_a: Array of shape (N, 2) where col 0 is latitude, col 1 is longitude.
        coords_b: Array of shape (M, 2) where col 0 is latitude, col 1 is longitude.
        earth_radius_km: Earth radius in km (default: 6371.0 km).

    Returns:
        np.ndarray: Distance matrix of shape (N, M) with distances in kilometers.
    """
    lat1 = np.radians(coords_a[:, 0])[:, np.newaxis]  # (N, 1)
    lon1 = np.radians(coords_a[:, 1])[:, np.newaxis]  # (N, 1)

    lat2 = np.radians(coords_b[:, 0])[np.newaxis, :]  # (1, M)
    lon2 = np.radians(coords_b[:, 1])[np.newaxis, :]  # (1, M)

    dphi = lat2 - lat1
    dlambda = lon2 - lon1

    a = (
        np.sin(dphi / 2.0) ** 2
        + np.cos(lat1) * np.cos(lat2) * np.sin(dlambda / 2.0) ** 2
    )
    a = np.clip(a, 0.0, 1.0)
    c = 2.0 * np.arcsin(np.sqrt(a))
    return earth_radius_km * c


def calculate_geographic_bounds(
    df: pd.DataFrame,
    lat_col: str = "lat",
    lon_col: str = "lon",
    buffer_ratio: float = 0.05,
) -> Dict[str, float]:
    """Calculate the geographic bounding box of coordinates with an optional margin buffer.

    Args:
        df: Input DataFrame.
        lat_col: Latitude column name.
        lon_col: Longitude column name.
        buffer_ratio: Fraction of bounding span to add as padding (default 0.05 = 5%).

    Returns:
        Dict[str, float]: Bounding box dictionary with min_lat, max_lat, min_lon, max_lon,
                          span_lat_km, span_lon_km.
    """
    valid_df = filter_valid_coordinates(df, lat_col=lat_col, lon_col=lon_col)
    if valid_df.empty:
        raise ValueError("Cannot calculate bounding box: no valid coordinates found.")

    min_lat = float(valid_df[lat_col].min())
    max_lat = float(valid_df[lat_col].max())
    min_lon = float(valid_df[lon_col].min())
    max_lon = float(valid_df[lon_col].max())

    lat_span = max_lat - min_lat
    lon_span = max_lon - min_lon

    lat_pad = lat_span * buffer_ratio if lat_span > 0 else 0.01
    lon_pad = lon_span * buffer_ratio if lon_span > 0 else 0.01

    bounded_min_lat = max(-90.0, min_lat - lat_pad)
    bounded_max_lat = min(90.0, max_lat + lat_pad)
    bounded_min_lon = max(-180.0, min_lon - lon_pad)
    bounded_max_lon = min(180.0, max_lon + lon_pad)

    # Approximate spans in km
    mid_lat = (min_lat + max_lat) / 2.0
    span_lat_km = float(haversine_distance(min_lat, min_lon, max_lat, min_lon))
    span_lon_km = float(haversine_distance(mid_lat, min_lon, mid_lat, max_lon))

    return {
        "min_lat": bounded_min_lat,
        "max_lat": bounded_max_lat,
        "min_lon": bounded_min_lon,
        "max_lon": bounded_max_lon,
        "raw_min_lat": min_lat,
        "raw_max_lat": max_lat,
        "raw_min_lon": min_lon,
        "raw_max_lon": max_lon,
        "span_lat_km": span_lat_km,
        "span_lon_km": span_lon_km,
    }


def generate_spatial_grid(
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float,
    resolution_lat: int = 50,
    resolution_lon: int = 50,
) -> pd.DataFrame:
    """Generate a regular 2D evaluation mesh grid of latitude and longitude coordinates.

    Args:
        min_lat: Minimum latitude.
        max_lat: Maximum latitude.
        min_lon: Minimum longitude.
        max_lon: Maximum longitude.
        resolution_lat: Number of grid steps along latitude (y-axis).
        resolution_lon: Number of grid steps along longitude (x-axis).

    Returns:
        pd.DataFrame: DataFrame with columns ['grid_id', 'lat_idx', 'lon_idx', 'latitude', 'longitude'].
    """
    if min_lat >= max_lat:
        raise ValueError(f"min_lat ({min_lat}) must be strictly less than max_lat ({max_lat}).")
    if min_lon >= max_lon:
        raise ValueError(f"min_lon ({min_lon}) must be strictly less than max_lon ({max_lon}).")

    lats = np.linspace(min_lat, max_lat, resolution_lat)
    lons = np.linspace(min_lon, max_lon, resolution_lon)

    # 2D Meshgrid
    lat_grid, lon_grid = np.meshgrid(lats, lons, indexing="ij")

    n_lat, n_lon = lat_grid.shape
    lat_indices, lon_indices = np.meshgrid(np.arange(n_lat), np.arange(n_lon), indexing="ij")

    flat_lats = lat_grid.ravel()
    flat_lons = lon_grid.ravel()
    flat_lat_idx = lat_indices.ravel()
    flat_lon_idx = lon_indices.ravel()

    grid_df = pd.DataFrame({
        "grid_id": np.arange(len(flat_lats)),
        "lat_idx": flat_lat_idx,
        "lon_idx": flat_lon_idx,
        "latitude": flat_lats,
        "longitude": flat_lons,
    })

    return grid_df


def export_clean_crime_coordinates(
    df: pd.DataFrame,
    output_path: Union[str, Path],
    lat_col: str = "lat",
    lon_col: str = "lon",
) -> pd.DataFrame:
    """Export sanitized crime coordinates containing only analytical fields (PII-free).

    Preserves case outcome and analytical identifiers while omitting victim names.

    Args:
        df: Input DataFrame containing cleaned crime records.
        output_path: Target CSV destination path.
        lat_col: Latitude column name.
        lon_col: Longitude column name.

    Returns:
        pd.DataFrame: The sanitized exported DataFrame.
    """
    valid_df = filter_valid_coordinates(df, lat_col=lat_col, lon_col=lon_col)

    # Core analytical columns to include (if present)
    preferred_cols = [
        "uid",
        "city",
        "state",
        lat_col,
        lon_col,
        "reported_date_clean",
        "reported_year",
        "reported_month",
        "reported_day_of_week",
        "reported_is_weekend",
        "is_solved",
        "disposition",
    ]

    selected_cols = [c for c in preferred_cols if c in valid_df.columns]

    # Explicitly ensure no PII fields are included
    pii_fields = ["victim_first", "victim_last", "name", "first_name", "last_name", "ssn", "phone"]
    selected_cols = [c for c in selected_cols if c.lower() not in pii_fields]

    out_df = valid_df[selected_cols].copy()

    # Standardize coordinate column names if needed
    if lat_col != "latitude" and "latitude" not in out_df.columns:
        out_df["latitude"] = out_df[lat_col]
    if lon_col != "longitude" and "longitude" not in out_df.columns:
        out_df["longitude"] = out_df[lon_col]

    dest = Path(output_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(dest, index=False)

    return out_df
