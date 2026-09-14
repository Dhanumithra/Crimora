"""Generic Feature Engineering Utilities for Person B.

Focuses exclusively on non-model-training feature transformations:
temporal feature extraction, target labeling with leakage warnings,
spatial coordinate flags, and district name harmonization.

NOTE: Model implementations (PCA, LWR, ID3, Naive Bayes, k-NN) are reserved
for subsequent development days in accordance with the project roadmap.
"""

from typing import List, Optional, Tuple
import numpy as np
import pandas as pd

# List of column patterns that represent post-incident or outcome information
# and must NOT be used as predictive inputs in solvability modeling.
LEAKAGE_INDICATOR_KEYWORDS: List[str] = [
    "disposition",
    "is_solved",
    "cleared",
    "arrest",
    "solved",
    "outcome",
    "resolution",
]


def extract_temporal_features(
    df: pd.DataFrame,
    date_col: str,
    prefix: str = "reported_",
) -> pd.DataFrame:
    """Extract standard calendar attributes from a datetime column.

    Does not introduce target leakage; extracts only calendar artifacts of incident reporting.

    Args:
        df: Input DataFrame.
        date_col: Name of datetime-like column.
        prefix: Prefix for newly engineered features.

    Returns:
        pd.DataFrame: DataFrame copy with extracted temporal columns.
    """
    df_out = df.copy()
    dt_series = pd.to_datetime(df_out[date_col], errors="coerce")

    df_out[f"{prefix}year"] = dt_series.dt.year.astype("Int64")
    df_out[f"{prefix}month"] = dt_series.dt.month.astype("Int64")
    df_out[f"{prefix}day"] = dt_series.dt.day.astype("Int64")
    df_out[f"{prefix}day_of_week"] = dt_series.dt.day_name()
    df_out[f"{prefix}is_weekend"] = dt_series.dt.dayofweek.isin([5, 6]).astype("Int64")

    return df_out


def create_target_solvability(
    series: pd.Series,
    arrest_value: str = "Closed by arrest",
) -> Tuple[pd.Series, str]:
    """Derive binary case solvability target strictly as an evaluation label.

    WARNING - TARGET LEAKAGE PREVENTION:
    This output represents the ground-truth outcome of an investigation.
    Under NO circumstance should this column (or any derivative) be supplied
    as an input feature to training pipelines. It is solely the dependent variable (y).

    Args:
        series: Disposition series (e.g. from homicide-data.csv).
        arrest_value: Category denoting successful closure by arrest.

    Returns:
        Tuple[pd.Series, str]: (binary target series [1=arrest, 0=unsolved/closed without arrest],
                                leakage warning string).
    """
    target = (series.astype(str).str.strip().str.lower() == arrest_value.lower()).astype(int)
    warning = (
        "CRITICAL LEAKAGE WARNING: 'is_solved' is a ground-truth TARGET variable. "
        "Do NOT include in feature matrices (X)."
    )
    return target, warning


def flag_target_leakage_columns(
    columns: List[str],
    keywords: Optional[List[str]] = None,
) -> List[str]:
    """Identify columns that present high risk of target leakage in solvability prediction.

    Args:
        columns: List of feature names in the dataset.
        keywords: Keywords indicating case outcomes or investigative resolution.

    Returns:
        List[str]: Columns flagged as containing outcome information.
    """
    if keywords is None:
        keywords = LEAKAGE_INDICATOR_KEYWORDS

    flagged: List[str] = []
    for col in columns:
        col_lower = col.lower()
        if any(kw in col_lower for kw in keywords):
            flagged.append(col)
    return flagged


def standardize_tamil_nadu_districts(series: pd.Series) -> pd.Series:
    """Harmonize Tamil Nadu district name transliterations across NCRB and state datasets.

    Args:
        series: Series of district strings.

    Returns:
        pd.Series: Harmonized district names.
    """
    mapping = {
        "Thoothugudi": "Thoothukudi",
        "Thirunelveli": "Tirunelveli",
        "Thirunelveli City": "Tirunelveli City",
        "Thiruvallur": "Tiruvallur",
        "Thiruvannamalai": "Tiruvannamalai",
        "Thiruvarur": "Tiruvarur",
        "Ramnathapuram": "Ramanathapuram",
        "Pudukottai": "Pudukkottai",
    }
    s = series.astype(str).str.strip()
    return s.replace(mapping)


def calculate_crime_rate_per_lakh(
    crime_incidence: pd.Series,
    population_lakhs: pd.Series,
) -> pd.Series:
    """Calculate rate of crime incidence per lakh population safely.

    Returns NaN for non-residential police jurisdictions or unrecorded population bases.

    Args:
        crime_incidence: Total recorded incident count.
        population_lakhs: Projected population in lakhs (100,000s).

    Returns:
        pd.Series: Crime rate per lakh.
    """
    pop = pd.to_numeric(population_lakhs, errors="coerce")
    inc = pd.to_numeric(crime_incidence, errors="coerce")

    # Replace zero population with NaN to avoid division by zero
    valid_pop = pop.replace(0, np.nan)
    return (inc / valid_pop).round(2)
