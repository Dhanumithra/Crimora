"""Unit tests for Day 3 Tamil Nadu crime analytics module.

Verifies:
1. Dataset ingestion and filtering of summary rows (is_total_row)
2. Non-negative crime incidence counts
3. Safe crime rate denominators (no fabricated per-capita rates without population)
4. Yearly trend calculations and year-over-year growth metrics
5. District ranking and comparison integrity
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd

from src.config import OUTPUTS_DIR, PROCESSED_DATA_DIR
from src.tn_analytics import (
    build_district_summary,
    build_yearly_trends,
    compare_districts,
    compute_basic_statistics,
    load_tn_datasets,
    rank_districts,
)


class TestTamilNaduAnalytics(unittest.TestCase):
    """Test suite for Tamil Nadu analytics module."""

    @classmethod
    def setUpClass(cls):
        """Load datasets once for all test cases."""
        try:
            cls.df_total, cls.df_murder, cls.df_ipc_tn = load_tn_datasets()
        except FileNotFoundError:
            cls.df_total = None
            cls.df_murder = None
            cls.df_ipc_tn = None

    def test_load_tn_datasets(self):
        """Verify successful dataset ingestion and non-empty rows."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        self.assertGreater(len(self.df_total), 0)
        self.assertGreater(len(self.df_murder), 0)
        self.assertGreater(len(self.df_ipc_tn), 0)

    def test_district_summary_excludes_total_row(self):
        """Ensure aggregate total row is strictly filtered out from district summary."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        summary = build_district_summary(self.df_total, self.df_murder)
        self.assertNotIn("TOTAL DISTRICT(S)", summary["district"].values)
        self.assertNotIn("Total", summary["district"].values)

    def test_district_summary_non_negative_counts(self):
        """Ensure no negative crime incidence counts exist in the summary."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        summary = build_district_summary(self.df_total, self.df_murder)
        num_cols = summary.select_dtypes(include=[np.number]).columns
        for col in num_cols:
            valid_vals = summary[col].dropna()
            self.assertTrue(
                (valid_vals >= 0).all(),
                f"Column {col} contains negative counts: {valid_vals[valid_vals < 0].tolist()}",
            )

    def test_no_fabricated_rates_for_zero_population(self):
        """Verify units with zero population (e.g. Railways, Cyber Cell) do not report false per-capita rates."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        summary = build_district_summary(self.df_total, self.df_murder)
        zero_pop = summary[summary["projected_pop_lakhs"] == 0]
        self.assertGreater(len(zero_pop), 0)

        # Murder rate must be NaN for non-residential zero-pop units
        for _, row in zero_pop.iterrows():
            self.assertTrue(
                pd.isna(row.get("murder_rate")),
                f"Expected NaN murder_rate for zero population district {row['district']}, got {row.get('murder_rate')}",
            )

    def test_yearly_trends_calculation(self):
        """Verify longitudinal trends structure and mathematical growth rate computation."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        trends = build_yearly_trends(self.df_total, self.df_ipc_tn)
        self.assertIn("year", trends.columns)
        self.assertIn("total_crime_count", trends.columns)
        self.assertIn("yoy_change_pct", trends.columns)

        # Verify positive counts
        self.assertTrue((trends["total_crime_count"] > 0).all())

        # Verify 2021 YoY change is calculated relative to 2020
        c2020 = trends[trends["year"] == 2020]["total_crime_count"].values[0]
        c2021 = trends[trends["year"] == 2021]["total_crime_count"].values[0]
        expected_change = round(((c2021 - c2020) / c2020) * 100, 2)
        actual_change = trends[trends["year"] == 2021]["yoy_change_pct"].values[0]
        self.assertAlmostEqual(expected_change, actual_change, places=2)

    def test_rank_districts(self):
        """Verify ranking utility orders values correctly."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        summary = build_district_summary(self.df_total, self.df_murder)
        ranked = rank_districts(summary, "crime_count_2022", top_n=5)
        self.assertEqual(len(ranked), 5)
        self.assertEqual(ranked["rank"].tolist(), [1, 2, 3, 4, 5])
        # Decreasing order
        counts = ranked["crime_count_2022"].tolist()
        self.assertTrue(all(counts[i] >= counts[i + 1] for i in range(len(counts) - 1)))

    def test_compare_districts(self):
        """Verify district comparison returns expected subset."""
        if self.df_total is None:
            self.skipTest("Tamil Nadu datasets not found")

        summary = build_district_summary(self.df_total, self.df_murder)
        comp = compare_districts(summary, ["Chennai", "Coimbatore City"])
        self.assertEqual(len(comp), 2)
        self.assertIn("district", comp.columns)


if __name__ == "__main__":
    unittest.main()
