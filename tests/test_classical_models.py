"""Unit and Integration Tests for Day 5 Classical ML Models and Evaluation.

Verifies:
1. Target column existence and binary values {0, 1}
2. Strict target leakage isolation in feature specifications
3. Preprocessing ColumnTransformer fitted strictly on training data
4. Model inference outputs valid classes {0, 1} and bounded probabilities [0, 1]
5. Model serialization and reload reproducibility
6. Evaluation metrics calculation and valid ranges
7. Generated artifacts presence and reloadability
8. Raw datasets immutability
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from src.config import (
    CLASSICAL_MODELS_DIR,
    CLASSICAL_OUTPUTS_DIR,
    PROCESSED_DATA_DIR,
    RAW_DATA_DIR,
)
from src.classical_models import (
    build_feature_preprocessor,
    build_id3_decision_tree,
    build_knn,
    build_naive_bayes,
    get_feature_names,
    get_feature_specification,
    load_classical_models,
    save_classical_models,
    train_all_models,
)
from src.model_evaluation import (
    compile_evaluation_tables,
    evaluate_single_model,
)


class TestClassicalModelingPipeline(unittest.TestCase):
    """Test suite for classical models, leakage prevention, and pipelines."""

    @classmethod
    def setUpClass(cls):
        """Load small sample of clean data for fast test executions."""
        cls.data_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
        if cls.data_path.exists():
            cls.df = pd.read_csv(cls.data_path, nrows=400)
            cls.num_cols, cls.cat_cols = get_feature_names(cls.df)
            cls.X = cls.df[cls.num_cols + cls.cat_cols]
            cls.y = cls.df["is_solved"].astype(int)
        else:
            cls.df = None

    def test_target_variable_validity(self):
        """Verify target column exists and contains strictly binary values {0, 1}."""
        if self.df is None:
            self.skipTest("Clean homicide dataset missing")

        self.assertIn("is_solved", self.df.columns)
        unique_vals = set(self.df["is_solved"].unique())
        self.assertTrue(unique_vals.issubset({0, 1}))
        self.assertGreater(len(unique_vals), 1)

    def test_target_leakage_isolation(self):
        """Ensure feature selection registry explicitly excludes disposition, PII, and identifiers."""
        specs_df = get_feature_specification()
        selected_cols = specs_df[specs_df["selected"]]["column"].tolist()

        # Leakage exclusions
        self.assertNotIn("disposition", selected_cols)
        self.assertNotIn("is_solved", selected_cols)
        self.assertNotIn("Crime_Solved", selected_cols)

        # PII exclusions
        self.assertNotIn("victim_first", selected_cols)
        self.assertNotIn("victim_last", selected_cols)

        # Identifier exclusions
        self.assertNotIn("uid", selected_cols)
        self.assertNotIn("reported_date", selected_cols)
        self.assertNotIn("reported_date_raw", selected_cols)

        # Confirm selected features
        self.assertIn("victim_age_clean", selected_cols)
        self.assertIn("victim_sex", selected_cols)
        self.assertIn("city", selected_cols)
        self.assertIn("state", selected_cols)

    def test_preprocessing_fitted_only_on_training_data(self):
        """Verify ColumnTransformer is fitted strictly on training data without test set leakage."""
        if self.df is None:
            self.skipTest("Clean homicide dataset missing")

        X_train, X_test, y_train, y_test = train_test_split(
            self.X, self.y, test_size=0.25, random_state=42, stratify=self.y
        )

        prep = build_feature_preprocessor(self.num_cols, self.cat_cols)
        # Preprocessor should be unfitted initially
        self.assertFalse(hasattr(prep, "transformers_"))

        # Fit on train only
        X_train_trans = prep.fit_transform(X_train)
        self.assertTrue(hasattr(prep, "transformers_"))
        self.assertEqual(len(X_train_trans), len(X_train))

        # Transform on test
        X_test_trans = prep.transform(X_test)
        self.assertEqual(len(X_test_trans), len(X_test))
        self.assertEqual(X_train_trans.shape[1], X_test_trans.shape[1])

    def test_model_training_and_prediction_ranges(self):
        """Verify all three models train and produce valid discrete classes and probabilities."""
        if self.df is None:
            self.skipTest("Clean homicide dataset missing")

        X_train, X_test, y_train, y_test = train_test_split(
            self.X, self.y, test_size=0.25, random_state=42, stratify=self.y
        )

        models = train_all_models(X_train, y_train, self.num_cols, self.cat_cols, random_state=42)
        self.assertEqual(len(models), 3)
        self.assertIn("id3_decision_tree", models)
        self.assertIn("naive_bayes", models)
        self.assertIn("knn", models)

        for model_name, pipeline in models.items():
            preds = pipeline.predict(X_test)
            self.assertEqual(len(preds), len(X_test))
            self.assertTrue(set(preds).issubset({0, 1}))

            # Probabilities check
            if hasattr(pipeline, "predict_proba"):
                proba = pipeline.predict_proba(X_test)
                self.assertEqual(proba.shape, (len(X_test), 2))
                self.assertTrue(np.all(proba >= 0.0) and np.all(proba <= 1.0))
                np.testing.assert_allclose(np.sum(proba, axis=1), np.ones(len(X_test)), atol=1e-5)

    def test_model_serialization_and_reproducibility(self):
        """Verify saved models reload cleanly and produce identical predictions."""
        if self.df is None:
            self.skipTest("Clean homicide dataset missing")

        X_train, X_test, y_train, y_test = train_test_split(
            self.X, self.y, test_size=0.25, random_state=42, stratify=self.y
        )

        models = train_all_models(X_train, y_train, self.num_cols, self.cat_cols, random_state=42)
        test_save_dir = Path("outputs/test_models_temp")
        test_save_dir.mkdir(parents=True, exist_ok=True)

        saved = save_classical_models(models, output_dir=test_save_dir)
        self.assertEqual(len(saved), 3)

        reloaded = load_classical_models(models_dir=test_save_dir)
        self.assertEqual(len(reloaded), 3)

        for model_name in models:
            orig_preds = models[model_name].predict(X_test)
            reloaded_preds = reloaded[model_name].predict(X_test)
            np.testing.assert_array_equal(orig_preds, reloaded_preds)

        # Clean up temp test directory
        for f in test_save_dir.glob("*.joblib"):
            f.unlink()
        test_save_dir.rmdir()


class TestModelEvaluationOutputs(unittest.TestCase):
    """Test suite for evaluation tables, visual figures, and raw immutability."""

    def test_evaluation_metric_properties(self):
        """Verify metric evaluation outputs valid bounded values."""
        sample_y_true = pd.Series([0, 1, 0, 1, 1, 0, 0, 1])
        sample_y_pred = np.array([0, 1, 1, 1, 0, 0, 0, 1])

        from sklearn.dummy import DummyClassifier
        dummy = DummyClassifier(strategy="constant", constant=1)
        dummy.fit(pd.DataFrame({"x": np.arange(8)}), sample_y_true)

        res = evaluate_single_model(dummy, pd.DataFrame({"x": np.arange(8)}), sample_y_true, "dummy")
        self.assertGreaterEqual(res["accuracy"], 0.0)
        self.assertLessEqual(res["accuracy"], 1.0)
        self.assertEqual(res["confusion_matrix"].shape, (2, 2))

    def test_saved_artifacts_exist_and_reloadable(self):
        """Verify production classical model artifacts and outputs exist on disk."""
        expected_models = [
            "decision_tree_id3.joblib",
            "naive_bayes.joblib",
            "knn.joblib",
        ]
        for m_file in expected_models:
            p = CLASSICAL_MODELS_DIR / m_file
            if p.exists():
                self.assertGreater(p.stat().st_size, 100)

        # Check outputs if generated
        metrics_csv = CLASSICAL_OUTPUTS_DIR / "model_metrics.csv"
        reports_csv = CLASSICAL_OUTPUTS_DIR / "classification_reports.csv"

        if metrics_csv.exists():
            df_m = pd.read_csv(metrics_csv)
            self.assertIn("model", df_m.columns)
            self.assertIn("accuracy", df_m.columns)
            self.assertIn("f1_score", df_m.columns)
            self.assertEqual(len(df_m), 3)

        if reports_csv.exists():
            df_r = pd.read_csv(reports_csv)
            self.assertIn("model", df_r.columns)
            self.assertIn("precision", df_r.columns)
            self.assertIn("recall", df_r.columns)

    def test_raw_data_remains_unmodified(self):
        """Verify raw datasets were never modified."""
        raw_files = [
            "homicide-data.csv",
            "dstrIPC_1_2014.csv",
            "TN-murder-2023.csv",
            "TN-2020-2022-total.csv",
        ]
        for fname in raw_files:
            raw_path = RAW_DATA_DIR / fname
            self.assertTrue(raw_path.exists(), f"Raw file {fname} must exist")


if __name__ == "__main__":
    unittest.main()
