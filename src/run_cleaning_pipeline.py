"""Data Cleaning Pipeline Runner for Day 2.

Ingests raw datasets from data/raw/ without modifying them,
executes comprehensive data cleaning, normalization, spatial validation,
and generates clean datasets in data/processed/.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path when executed directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.config import PROCESSED_DATA_DIR, RAW_DATA_DIR
from src.data_cleaning import (
    coerce_numeric,
    identify_total_rows,
    load_csv,
    parse_dates_safely,
    strip_whitespace,
    validate_coordinates,
)
from src.feature_engineering import (
    create_target_solvability,
    extract_temporal_features,
    standardize_tamil_nadu_districts,
)


def clean_homicide_dataset() -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Clean the raw homicide-data.csv dataset.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: (homicide_clean, homicide_spatial_clean)
    """
    raw_path = RAW_DATA_DIR / "homicide-data.csv"
    df = load_csv(raw_path, encodings_to_try=["latin-1", "utf-8"])

    # 1. Whitespace stripping across all string columns
    df = strip_whitespace(df)

    # 2. Date normalization: convert integer reported_date (YYYYMMDD) to datetime
    # Note: 2 malformed dates with 9 digits (201511018, 201511105) are coerced to NaT
    df["reported_date_raw"] = df["reported_date"]
    df["reported_date_clean"] = parse_dates_safely(df["reported_date"], format="%Y%m%d", errors="coerce")

    # 3. Calendar feature extraction
    df = extract_temporal_features(df, date_col="reported_date_clean", prefix="reported_")

    # 4. Numeric age coercion: preserve 'Unknown' as np.nan, preserve infant age 0
    df["victim_age_clean"] = coerce_numeric(df["victim_age"], sentinel_strings=["Unknown", "unknown", ""])

    # 5. Geographic coordinate validation: -90 <= lat <= 90, -180 <= lon <= 180
    df["valid_coords"] = validate_coordinates(df, lat_col="lat", lon_col="lon")

    # 6. Target variable derivation with explicit leakage warning
    is_solved, _ = create_target_solvability(df["disposition"], arrest_value="Closed by arrest")
    df["is_solved"] = is_solved

    # 7. Spatial clean subset (strictly records with valid non-null coordinates)
    df_spatial = df[df["valid_coords"]].copy().reset_index(drop=True)

    return df, df_spatial


def clean_dstr_ipc_2014_dataset() -> pd.DataFrame:
    """Clean the raw dstrIPC_1_2014.csv dataset.

    Returns:
        pd.DataFrame: Cleaned NCRB IPC district dataset.
    """
    raw_path = RAW_DATA_DIR / "dstrIPC_1_2014.csv"
    df = load_csv(raw_path, encodings_to_try=["utf-8", "latin-1"])

    # 1. Strip whitespace on string columns
    df = strip_whitespace(df)

    # 2. Flag state-level summary/aggregate rows (District == 'Total')
    df["is_total_row"] = identify_total_rows(df["District"], patterns=["^total$"])

    # 3. Standardize column names (strip whitespace if any)
    df.columns = [c.strip() for c in df.columns]

    return df


def clean_tn_total_2020_2022_dataset() -> pd.DataFrame:
    """Clean the raw TN-2020-2022-total.csv dataset.

    Returns:
        pd.DataFrame: Cleaned longitudinal Tamil Nadu crime dataset.
    """
    raw_path = RAW_DATA_DIR / "TN-2020-2022-total.csv"
    df = load_csv(raw_path, encodings_to_try=["utf-8", "latin-1"])

    df = strip_whitespace(df)

    # Rename columns for clarity and standard naming conventions
    rename_map = {
        "Districts": "district",
        "2020": "crime_count_2020",
        "2021": "crime_count_2021",
        "2022": "crime_count_2022",
        "Share in percentage (2022)": "share_pct_2022",
        "Projected population (lakhs)": "projected_pop_lakhs",
        "Rate of Cognizable crime (IPC+SLL)": "rate_cognizable_crime_2022",
    }
    df = df.rename(columns=rename_map)

    # Standardize district transliterations
    df["district_standardized"] = standardize_tamil_nadu_districts(df["district"])

    # Coerce numeric counts: convert 'N/C' (Not Created, e.g. for Avadi/Tambaram) to NaN
    df["crime_count_2020"] = coerce_numeric(df["crime_count_2020"], sentinel_strings=["N/C", "nc", "-"])
    df["crime_count_2021"] = coerce_numeric(df["crime_count_2021"], sentinel_strings=["N/C", "nc", "-"])
    df["crime_count_2022"] = coerce_numeric(df["crime_count_2022"])

    # Flag state aggregate row: TOTAL DISTRICT(S)
    df["is_total_row"] = identify_total_rows(df["district"], patterns=["^total district\\(s\\)$", "^total$"])

    return df


def clean_tn_murder_2023_dataset() -> pd.DataFrame:
    """Clean the raw TN-murder-2023.csv dataset.

    Returns:
        pd.DataFrame: Cleaned Tamil Nadu 2023 murder/homicide dataset.
    """
    raw_path = RAW_DATA_DIR / "TN-murder-2023.csv"
    df = load_csv(raw_path, encodings_to_try=["utf-8", "latin-1"])

    df = strip_whitespace(df)

    rename_map = {
        "Sl No": "sl_no",
        "Districts/City": "district",
        "Murder - Incidence": "murder_incidence",
        "Murder - Victims": "murder_victims",
        "Murder - Rate": "murder_rate",
        "Culpable homicide - Incidence": "culpable_homicide_incidence",
        "Culpable Homicide - Victims": "culpable_homicide_victims",
        "Culpable Homicides - Rate": "culpable_homicide_rate",
        "Causing Death by Negligence - Incidence": "negligence_death_incidence",
        "Causing Death by Negligence - Victims": "negligence_death_victims",
        "Causing Death by Negligence - Rate": "negligence_death_rate",
    }
    df = df.rename(columns=rename_map)

    # Standardize district names
    df["district_standardized"] = standardize_tamil_nadu_districts(df["district"])

    # Convert '-' rates (non-residential units: Cyber Cell, Railways) to NaN
    rate_cols = ["murder_rate", "culpable_homicide_rate", "negligence_death_rate"]
    for col in rate_cols:
        df[col] = coerce_numeric(df[col], sentinel_strings=["-", "N/A", ""])

    # Flag aggregate summary row
    df["is_total_row"] = identify_total_rows(df["district"], patterns=["^total district\\(s\\)$", "^total$"])

    return df


def run_all_cleaning() -> Dict[str, Path]:
    """Execute the complete cleaning pipeline and serialize results to data/processed/.

    Returns:
        Dict[str, Path]: Map of dataset identifiers to output paths.
    """
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    outputs: Dict[str, Path] = {}

    print("Cleaning homicide-data.csv...")
    df_hom_clean, df_hom_spatial = clean_homicide_dataset()
    hom_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
    hom_spatial_path = PROCESSED_DATA_DIR / "homicide_spatial_clean.csv"
    df_hom_clean.to_csv(hom_path, index=False)
    df_hom_spatial.to_csv(hom_spatial_path, index=False)
    outputs["homicide_clean"] = hom_path
    outputs["homicide_spatial_clean"] = hom_spatial_path
    print(f"  -> Saved {hom_path} ({len(df_hom_clean)} rows)")
    print(f"  -> Saved {hom_spatial_path} ({len(df_hom_spatial)} rows)")

    print("Cleaning dstrIPC_1_2014.csv...")
    df_ipc_clean = clean_dstr_ipc_2014_dataset()
    ipc_path = PROCESSED_DATA_DIR / "dstr_ipc_2014_clean.csv"
    df_ipc_clean.to_csv(ipc_path, index=False)
    outputs["dstr_ipc_2014_clean"] = ipc_path
    print(f"  -> Saved {ipc_path} ({len(df_ipc_clean)} rows)")

    print("Cleaning TN-2020-2022-total.csv...")
    df_tn_tot_clean = clean_tn_total_2020_2022_dataset()
    tn_tot_path = PROCESSED_DATA_DIR / "tn_crime_total_2020_2022_clean.csv"
    df_tn_tot_clean.to_csv(tn_tot_path, index=False)
    outputs["tn_crime_total_2020_2022_clean"] = tn_tot_path
    print(f"  -> Saved {tn_tot_path} ({len(df_tn_tot_clean)} rows)")

    print("Cleaning TN-murder-2023.csv...")
    df_tn_mrd_clean = clean_tn_murder_2023_dataset()
    tn_mrd_path = PROCESSED_DATA_DIR / "tn_murder_2023_clean.csv"
    df_tn_mrd_clean.to_csv(tn_mrd_path, index=False)
    outputs["tn_murder_2023_clean"] = tn_mrd_path
    print(f"  -> Saved {tn_mrd_path} ({len(df_tn_mrd_clean)} rows)")

    print("\nAll datasets cleaned and serialized to data/processed/ successfully.")
    return outputs


if __name__ == "__main__":
    run_all_cleaning()
