"""Unit tests for Day 2 data cleaning, quality assessment, and feature engineering utilities.

Verifies date parsing, coordinate validation, numeric coercion, missingness reports,
duplicate detection, and target leakage safeguards.
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd

from src.config import PROCESSED_DATA_DIR, RAW_DATA_DIR
from src.data_cleaning import (
    coerce_numeric,
    detect_duplicates,
    identify_total_rows,
    normalize_categorical,
    parse_dates_safely,
    report_missing_values,
    strip_whitespace,
    validate_coordinates,
)
from src.data_quality import dataset_summary, duplicate_report, profile_columns
from src.feature_engineering import (
    create_target_solvability,
    extract_temporal_features,
    flag_target_leakage_columns,
    standardize_tamil_nadu_districts,
)


class TestDataCleaningUtilities(unittest.TestCase):
    """Test suite for reusable cleaning operations."""

    def test_strip_whitespace(self):
        """Ensure string columns have leading/trailing whitespace removed."""
        df = pd.DataFrame({
            "name": ["  Chennai  ", "Madurai ", " Coimbatore"],
            "num": [1, 2, 3],
        })
        cleaned = strip_whitespace(df)
        self.assertEqual(cleaned["name"].tolist(), ["Chennai", "Madurai", "Coimbatore"])
        self.assertEqual(cleaned["num"].tolist(), [1, 2, 3])

    def test_normalize_categorical(self):
        """Test casing normalization and mapping."""
        series = pd.Series(["  chennai", "CHENNAI  ", "Madurai", "thoothugudi"])
        mapping = {"Thoothugudi": "Thoothukudi"}
        normalized = normalize_categorical(series, case_style="title", strip=True, value_mapping=mapping)
        self.assertEqual(normalized.tolist(), ["Chennai", "Chennai", "Madurai", "Thoothukudi"])

    def test_detect_duplicates(self):
        """Test duplicate detection reporting."""
        df = pd.DataFrame({
            "id": [1, 2, 2, 3],
            "val": ["a", "b", "b", "c"],
        })
        rep = detect_duplicates(df)
        self.assertEqual(rep["total_rows"], 4)
        self.assertEqual(rep["duplicate_count"], 1)
        self.assertEqual(rep["duplicate_percentage"], 25.0)

    def test_parse_dates_safely(self):
        """Test parsing dates including numeric YYYYMMDD and malformed entries."""
        # Standard integer dates and 9-digit malformed entry
        dates = pd.Series([20100504, 20121231, 201511018, "invalid"])
        parsed = parse_dates_safely(dates, format="%Y%m%d", errors="coerce")
        self.assertEqual(str(parsed.iloc[0].date()), "2010-05-04")
        self.assertEqual(str(parsed.iloc[1].date()), "2012-12-31")
        self.assertTrue(pd.isna(parsed.iloc[2]))  # Malformed 9-digit coerced to NaT
        self.assertTrue(pd.isna(parsed.iloc[3]))  # String 'invalid' coerced to NaT

    def test_coerce_numeric_preserves_zero(self):
        """Test numeric coercion preserves infant age 0 and converts 'Unknown' / '-' to NaN."""
        ages = pd.Series(["0", "25", "Unknown", "-", "N/C", "0.5"])
        coerced = coerce_numeric(ages)
        self.assertEqual(coerced.iloc[0], 0.0)  # Preserved 0
        self.assertEqual(coerced.iloc[1], 25.0)
        self.assertTrue(np.isnan(coerced.iloc[2]))  # 'Unknown' -> NaN
        self.assertTrue(np.isnan(coerced.iloc[3]))  # '-' -> NaN
        self.assertTrue(np.isnan(coerced.iloc[4]))  # 'N/C' -> NaN
        self.assertEqual(coerced.iloc[5], 0.5)

    def test_validate_coordinates(self):
        """Ensure coordinate validation flags only valid geographic coordinates."""
        df = pd.DataFrame({
            "lat": [35.0, 95.0, -95.0, np.nan, 25.0],
            "lon": [-106.0, -106.0, -106.0, -106.0, 190.0],
        })
        valid_mask = validate_coordinates(df, lat_col="lat", lon_col="lon")
        expected = [True, False, False, False, False]
        self.assertEqual(valid_mask.tolist(), expected)

    def test_identify_total_rows(self):
        """Test summary row identification."""
        districts = pd.Series(["Chennai", "Total", "Coimbatore", "TOTAL DISTRICT(S)", "Madurai"])
        mask = identify_total_rows(districts)
        self.assertEqual(mask.tolist(), [False, True, False, True, False])


class TestFeatureEngineeringUtilities(unittest.TestCase):
    """Test suite for feature extraction and leakage prevention."""

    def test_extract_temporal_features(self):
        """Test calendar attribute extraction."""
        df = pd.DataFrame({"date": pd.to_datetime(["2020-01-01", "2020-06-15"])})
        extracted = extract_temporal_features(df, date_col="date", prefix="rep_")
        self.assertIn("rep_year", extracted.columns)
        self.assertIn("rep_month", extracted.columns)
        self.assertIn("rep_day_of_week", extracted.columns)
        self.assertEqual(extracted["rep_year"].tolist(), [2020, 2020])
        self.assertEqual(extracted["rep_month"].tolist(), [1, 6])

    def test_create_target_solvability_and_leakage(self):
        """Test solvability target generation and ensure leakage warning."""
        disposition = pd.Series(["Closed by arrest", "Open/No arrest", "Closed without arrest"])
        target, warning = create_target_solvability(disposition)
        self.assertEqual(target.tolist(), [1, 0, 0])
        self.assertIn("LEAKAGE WARNING", warning)

    def test_flag_target_leakage_columns(self):
        """Test identification of leakage risk columns."""
        cols = ["uid", "victim_age", "disposition", "lat", "lon", "is_solved"]
        flagged = flag_target_leakage_columns(cols)
        self.assertIn("disposition", flagged)
        self.assertIn("is_solved", flagged)
        self.assertNotIn("victim_age", flagged)

    def test_standardize_tamil_nadu_districts(self):
        """Test district name transliteration harmonization."""
        s = pd.Series(["Thoothugudi", "Thirunelveli", "Chennai"])
        harmonized = standardize_tamil_nadu_districts(s)
        self.assertEqual(harmonized.tolist(), ["Thoothukudi", "Tirunelveli", "Chennai"])


class TestProcessedDatasetsIntegrity(unittest.TestCase):
    """Test suite ensuring processed files exist, can be loaded, and raw files are protected."""

    def test_processed_files_exist_and_reload(self):
        """Ensure all 5 processed datasets exist and can be reloaded."""
        expected_files = [
            "homicide_clean.csv",
            "homicide_spatial_clean.csv",
            "dstr_ipc_2014_clean.csv",
            "tn_crime_total_2020_2022_clean.csv",
            "tn_murder_2023_clean.csv",
        ]
        for fname in expected_files:
            file_path = PROCESSED_DATA_DIR / fname
            self.assertTrue(file_path.exists(), f"Missing processed file: {fname}")
            df = pd.read_csv(file_path)
            self.assertGreater(len(df), 0, f"File {fname} is empty")

    def test_spatial_dataset_has_no_null_coordinates(self):
        """Verify that homicide_spatial_clean.csv contains strictly valid coordinates."""
        spatial_path = PROCESSED_DATA_DIR / "homicide_spatial_clean.csv"
        df_spatial = pd.read_csv(spatial_path)
        self.assertEqual(df_spatial["lat"].isnull().sum(), 0)
        self.assertEqual(df_spatial["lon"].isnull().sum(), 0)
        self.assertTrue((df_spatial["lat"] >= -90.0).all() and (df_spatial["lat"] <= 90.0).all())
        self.assertTrue((df_spatial["lon"] >= -180.0).all() and (df_spatial["lon"] <= 180.0).all())


if __name__ == "__main__":
    unittest.main()
