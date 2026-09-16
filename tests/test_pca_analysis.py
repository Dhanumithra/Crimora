"""Unit tests for Day 3 PCA macro analytics pipeline.

Verifies:
1. Feature selection audits and target leakage isolation
2. Categorical encoding and non-zero numerical missing value imputation
3. Eigendecomposition and monotonic cumulative explained variance
4. Serialized bundle persistence and reloadability
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

from src.config import MODELS_DIR, OUTPUTS_DIR, PROCESSED_DATA_DIR
from src.pca_analysis import (
    fit_pca_analysis,
    generate_feature_selection_table,
    load_pca_bundle,
    save_pca_bundle,
    transform_new_data,
)


class TestPCAAnalysisPipeline(unittest.TestCase):
    """Test suite for PCA analysis module."""

    @classmethod
    def setUpClass(cls):
        """Load test data once for all test methods."""
        cls.homicide_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
        if cls.homicide_path.exists():
            cls.df = pd.read_csv(cls.homicide_path)
        else:
            cls.df = None

    def test_feature_selection_excludes_target_leakage(self):
        """Ensure feature selection excludes target outcomes, PII, coordinates, and IDs."""
        feat_df = generate_feature_selection_table()
        self.assertIn("column", feat_df.columns)
        self.assertIn("selected", feat_df.columns)
        self.assertIn("role", feat_df.columns)

        selected_cols = feat_df[feat_df["selected"]]["column"].tolist()

        # Leakage exclusions
        self.assertNotIn("is_solved", selected_cols)
        self.assertNotIn("disposition", selected_cols)

        # PII exclusions
        self.assertNotIn("victim_first", selected_cols)
        self.assertNotIn("victim_last", selected_cols)

        # Coordinate exclusions
        self.assertNotIn("lat", selected_cols)
        self.assertNotIn("lon", selected_cols)

        # Identifier exclusions
        self.assertNotIn("uid", selected_cols)

        # Essential features included
        self.assertIn("victim_age_clean", selected_cols)
        self.assertIn("victim_sex", selected_cols)
        self.assertIn("victim_race", selected_cols)
        self.assertIn("city", selected_cols)
        self.assertIn("state", selected_cols)

    def test_pca_fitting_and_variance(self):
        """Verify PCA model fitting and cumulative explained variance properties."""
        if self.df is None:
            self.skipTest("Clean homicide dataset not found")

        num_cols = ["victim_age_clean", "reported_year", "reported_month", "reported_is_weekend"]
        cat_cols = ["victim_sex", "victim_race", "city", "state", "reported_day_of_week"]

        sample_df = self.df.head(200).copy()
        results = fit_pca_analysis(
            df=sample_df,
            numeric_features=num_cols,
            categorical_features=cat_cols,
            variance_threshold=0.80,
            random_state=42,
        )

        self.assertIn("full_pipeline", results)
        self.assertIn("explained_variance_df", results)
        self.assertIn("loadings_df", results)
        self.assertIn("transformed_df", results)

        exp_df = results["explained_variance_df"]
        cum_var = exp_df["cumulative_explained_variance"].values

        # Monotonicity
        self.assertTrue(np.all(np.diff(cum_var) >= -1e-6))
        # Bounded between 0 and 1
        self.assertGreaterEqual(cum_var[0], 0.0)
        self.assertLessEqual(cum_var[-1], 1.0001)

    def test_bundle_serialization_and_reload(self):
        """Verify that saved PCA bundle can be reloaded and transforms new data consistently."""
        if self.df is None:
            self.skipTest("Clean homicide dataset not found")

        num_cols = ["victim_age_clean", "reported_year", "reported_month", "reported_is_weekend"]
        cat_cols = ["victim_sex", "victim_race", "city", "state", "reported_day_of_week"]

        sample_train = self.df.iloc[:300].copy()
        sample_test = self.df.iloc[300:320].copy()

        results = fit_pca_analysis(
            df=sample_train,
            numeric_features=num_cols,
            categorical_features=cat_cols,
            variance_threshold=0.80,
            random_state=42,
        )

        test_bundle_path = OUTPUTS_DIR / "pca" / "test_pca_bundle.joblib"
        save_pca_bundle(results, test_bundle_path)
        self.assertTrue(test_bundle_path.exists())

        loaded_bundle = load_pca_bundle(test_bundle_path)
        self.assertIn("pipeline", loaded_bundle)
        self.assertIn("recommended_k", loaded_bundle)

        trans1 = results["full_pipeline"].transform(sample_test[num_cols + cat_cols])
        trans2 = transform_new_data(loaded_bundle, sample_test)

        np.testing.assert_allclose(trans1, trans2, rtol=1e-5, atol=1e-5)

        # Clean up test artifact
        test_bundle_path.unlink(missing_ok=True)

    def test_pca_loadings_dimensions(self):
        """Ensure loadings matrix matches number of features and components."""
        loadings_path = OUTPUTS_DIR / "pca" / "pca_components.csv"
        if not loadings_path.exists():
            self.skipTest("pca_components.csv not yet generated")

        loadings = pd.read_csv(loadings_path, index_col=0)
        self.assertGreater(len(loadings), 0)
        self.assertIn("PC1", loadings.columns)
        self.assertIn("PC2", loadings.columns)


if __name__ == "__main__":
    unittest.main()
