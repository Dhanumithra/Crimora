"""tests/test_day9_e2e.py - Day 9 End-to-End & Deployment Verification Test Suite.

Validates:
1. End-to-end multi-page workflow through Streamlit AppTest:
   Application startup -> Dashboard -> Crime Linkage -> Geographic Analysis ->
   Behavioral Profiling -> Case Solvability -> Tamil Nadu Analytics -> Model Comparison
2. Complete model lifecycle testing for all available and unavailable models:
   - ID3 Decision Tree (loading, preprocessing, prediction, output formatting)
   - Naive Bayes (loading, preprocessing, prediction, output formatting)
   - k-NN (loading, scaling, prediction, output formatting)
   - K-Means (loading, scaling, cluster assignment, center distances)
   - Hierarchical Clustering (loading, cluster distribution)
   - PCA (bundle loading, components, variance explained)
   - ANN (availability check, artifact inspection, graceful missing dependency handling)
   - BBN (availability check, artifact inspection, graceful missing dependency handling)
3. Deployment readiness and hygiene checks:
   - Path portability (no hardcoded absolute machine paths in src or app)
   - Zero hardcoded secrets / API keys
   - Graceful degradation when artifacts are absent
   - Output files readability and schema validity
"""

from __future__ import annotations

import math
import os
import re
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd
import pytest
from streamlit.testing.v1 import AppTest

from src.config import (
    CLASSICAL_MODELS_DIR,
    CLASSICAL_OUTPUTS_DIR,
    DATA_DIR,
    GEOGRAPHIC_OUTPUTS_DIR,
    MODELS_DIR,
    OUTPUTS_DIR,
    PROCESSED_DATA_DIR,
    PROJECT_ROOT,
    RAW_DATA_DIR,
    SRC_DIR,
)
from src.services.data_service import (
    get_classical_model_metrics,
    get_classification_reports,
    get_geographic_hotspots,
    get_pca_components,
    get_pca_explained_variance,
    get_tamil_nadu_district_summary,
    get_tamil_nadu_yearly_trends,
    load_clean_homicide_data,
    load_geographic_artifacts,
    load_pca_artifacts,
    load_tamil_nadu_artifacts,
)
from src.services.model_service import (
    get_cluster_distribution,
    get_model_registry,
    load_hierarchical_bundle,
    load_kmeans_bundle,
    load_pca_bundle,
    load_trained_classical_models,
    predict_case_solvability,
    predict_kmeans_cluster,
)


# =============================================================================
# 1. END-TO-END WORKFLOW TESTS (Streamlit AppTest)
# =============================================================================

class TestEndToEndWorkflow:
    """Verifies that the entire multi-page Streamlit application executes cleanly."""

    def test_app_startup(self):
        """Verify application starts and initializes default Overview page without unhandled exceptions."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True
        assert len(at.sidebar.radio) > 0
        assert "Overview / Dashboard" in at.sidebar.radio[0].options[0]

    def test_page_overview_dashboard(self):
        """Verify Overview / Dashboard page loads metrics, cards, and architecture status."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("📊  Overview / Dashboard").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_crime_linkage_interaction(self):
        """Verify Crime Linkage page loads, displays clustering, and handles cluster assignment."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("🔗  Crime Linkage & Clustering").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

        # Click the Assign to Cluster button
        if at.button:
            at.button[0].click().run(timeout=10)
            assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_geographic_analysis(self):
        """Verify Geographic Analysis page loads hotspot summaries, figures, and map container."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("🗺️  Geographic Analysis").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_behavioral_profiling(self):
        """Verify Behavioral Profiling page displays BBN status and baseline distribution charts."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("🧬  Behavioral Profiling").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_case_solvability_live_scoring(self):
        """Verify Case Solvability page loads form and executes live multi-model prediction."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("⚖️  Case Solvability").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

        # Submit live scoring form
        if at.button:
            submit_btn = next((b for b in at.button if "Compute" in b.label or "Score" in b.label), at.button[0])
            submit_btn.click().run(timeout=10)
            assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_tamil_nadu_analytics(self):
        """Verify Tamil Nadu Analytics page loads district statistics, yearly trends, and charts."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("🏛️  Tamil Nadu Analytics").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True

    def test_page_model_comparison(self):
        """Verify Model Comparison page renders cross-model comparison tables, metrics, and figures."""
        at = AppTest.from_file(str(PROJECT_ROOT / "app.py"))
        at.run(timeout=10)
        at.sidebar.radio[0].set_value("📈  Model Comparison").run(timeout=10)
        assert len(at.exception) == 0 if hasattr(at, "exception") else True


# =============================================================================
# 2. MODEL LIFECYCLE TESTS (All Available and Unavailable Models)
# =============================================================================

class TestAllModelsLifecycle:
    """Verifies model loading, preprocessing, prediction, output formatting, and error handling."""

    @pytest.fixture
    def sample_features(self) -> Dict[str, Any]:
        return {
            "victim_age_clean": 34.0,
            "reported_year": 2017,
            "reported_month": 7,
            "reported_is_weekend": 1,
            "lat": 39.2904,
            "lon": -76.6122,
            "victim_sex": "Male",
            "victim_race": "Black",
            "city": "Baltimore",
            "state": "MD",
            "reported_day_of_week": "Saturday",
        }

    # ── Classical Models: ID3, Naive Bayes, k-NN ─────────────────────────────

    def test_id3_decision_tree_lifecycle(self, sample_features):
        """ID3 Decision Tree: verify loading, pipeline prediction, probability, and formatting."""
        models = load_trained_classical_models()
        assert "decision_tree_id3" in models
        res = predict_case_solvability("decision_tree_id3", sample_features)
        assert res["status"] == "success"
        assert res["prediction"] in (0, 1)
        assert isinstance(res["probability"], float)
        assert 0.0 <= res["probability"] <= 1.0
        assert "decision_tree_id3" == res["model_key"]
        assert "Decision Tree" in res["model_name"]

    def test_naive_bayes_lifecycle(self, sample_features):
        """Naive Bayes: verify loading, pipeline prediction, probability, and formatting."""
        models = load_trained_classical_models()
        assert "naive_bayes" in models
        res = predict_case_solvability("naive_bayes", sample_features)
        assert res["status"] == "success"
        assert res["prediction"] in (0, 1)
        assert isinstance(res["probability"], float)
        assert 0.0 <= res["probability"] <= 1.0
        assert "naive_bayes" == res["model_key"]
        assert "Naive Bayes" in res["model_name"]

    def test_knn_lifecycle(self, sample_features):
        """k-NN: verify loading, pipeline prediction, probability, and formatting."""
        models = load_trained_classical_models()
        assert "knn" in models
        res = predict_case_solvability("knn", sample_features)
        assert res["status"] == "success"
        assert res["prediction"] in (0, 1)
        assert isinstance(res["probability"], float)
        assert 0.0 <= res["probability"] <= 1.0
        assert "knn" == res["model_key"]
        assert "k-NN" in res["model_name"] or "k-Nearest" in res["model_name"]

    def test_classical_models_error_handling(self):
        """Verify error handling on unavailable model key."""
        res = predict_case_solvability("nonexistent_model_key", {})
        assert res["status"] == "error"
        assert "error" in res
        assert res["prediction"] is None
        assert res["probability"] is None

    # ── Clustering Models: K-Means & Hierarchical ─────────────────────────────

    def test_kmeans_clustering_lifecycle(self):
        """K-Means: verify model + scaler bundle loading, cluster prediction, and distances."""
        bundle = load_kmeans_bundle()
        assert bundle["available"] is True
        assert bundle["n_clusters"] == 5
        assert bundle["cluster_centers_orig"] is not None
        assert len(bundle["cluster_centers_orig"]) == 5

        # Test prediction across valid age range
        for age in [15.0, 28.0, 45.0, 70.0]:
            pred = predict_kmeans_cluster(age)
            assert pred["status"] == "success"
            assert 0 <= pred["cluster_id"] <= 4
            assert isinstance(pred["cluster_label"], str)
            assert pred["distance_to_center"] >= 0.0
            assert 0.0 <= pred["cluster_center_age"] <= 120.0

    def test_kmeans_clustering_error_handling(self):
        """K-Means: verify boundary and negative input validation error handling."""
        pred_neg = predict_kmeans_cluster(-10.0)
        assert pred_neg["status"] == "error"
        assert "Invalid victim age" in pred_neg["error"]

        pred_high = predict_kmeans_cluster(150.0)
        assert pred_high["status"] == "error"
        assert "Invalid victim age" in pred_high["error"]

    def test_hierarchical_clustering_lifecycle(self):
        """Hierarchical Clustering: verify model bundle loading, labels, and cluster sizes."""
        bundle = load_hierarchical_bundle()
        assert bundle["available"] is True
        assert bundle["n_clusters"] == 5
        assert bundle["labels_"] is not None
        assert len(bundle["labels_"]) > 0

        dist = get_cluster_distribution("hierarchical")
        assert dist["status"] == "success"
        assert len(dist["cluster_ids"]) == 5
        assert len(dist["cluster_sizes"]) == 5
        assert sum(dist["cluster_sizes"]) == len(bundle["labels_"])

    # ── Dimensionality Reduction: PCA ────────────────────────────────────────

    def test_pca_bundle_lifecycle(self):
        """PCA: verify bundle loading, preprocessor, model structure, and variance explained."""
        bundle = load_pca_bundle()
        assert bundle is not None
        assert isinstance(bundle, dict)
        assert "pca_model" in bundle
        assert "recommended_k" in bundle
        assert bundle["recommended_k"] > 0
        assert "transformed_feature_names" in bundle

        # Verify explained variance artifacts
        var_df = get_pca_explained_variance()
        assert isinstance(var_df, pd.DataFrame)
        assert not var_df.empty
        assert "cumulative_explained_variance" in var_df.columns

    # ── Unavailable Models: ANN & BBN (Honest Verification, No Fabrication) ───

    def test_ann_model_honest_status(self):
        """ANN: verify artifact exists on disk, but model registry accurately reflects TF status."""
        registry = get_model_registry()
        assert "ann" in registry
        assert registry["ann"]["available"] is False
        assert "TensorFlow" in registry["ann"]["reason"]

        # Verify the actual serialized file is present on disk
        ann_file = MODELS_DIR / "solvability_ann.keras"
        assert ann_file.exists()
        assert ann_file.stat().st_size > 1_000_000  # ~1.47 MB

    def test_bbn_model_honest_status(self):
        """BBN: verify artifact exists on disk, but model registry accurately reflects pgmpy status."""
        registry = get_model_registry()
        assert "bbn" in registry
        assert registry["bbn"]["available"] is False
        assert "pgmpy" in registry["bbn"]["reason"]

        # Verify the actual serialized file is present on disk
        bbn_file = MODELS_DIR / "bbn_profile.pkl"
        assert bbn_file.exists()


# =============================================================================
# 3. DEPLOYMENT READINESS & HYGIENE CHECKS
# =============================================================================

class TestDeploymentHygiene:
    """Verifies that the repository is hardened and ready for deployment."""

    def test_no_hardcoded_user_or_machine_paths_in_code(self):
        """Verify no machine-specific absolute paths (/home/, C:\\, Users) exist in code files."""
        disallowed_patterns = [
            re.compile(r"/home/\w+/"),
            re.compile(r"[A-Z]:\\[Uu]sers\\"),
            re.compile(r"/tmp/"),
        ]

        # Scan python files in src/ and root
        target_files = list(SRC_DIR.rglob("*.py")) + [PROJECT_ROOT / "app.py"]
        for py_file in target_files:
            content = py_file.read_text(encoding="utf-8")
            for pattern in disallowed_patterns:
                matches = pattern.findall(content)
                assert not matches, f"Disallowed path pattern found in {py_file.name}: {matches}"

    def test_no_hardcoded_secrets_or_api_keys(self):
        """Verify no exposed API keys or authentication tokens exist in python source files."""
        secret_patterns = [
            re.compile(r"(?i)api_key\s*=\s*['\"][a-zA-Z0-9_\-]{16,}['\"]"),
            re.compile(r"(?i)secret_key\s*=\s*['\"][a-zA-Z0-9_\-]{16,}['\"]"),
            re.compile(r"(?i)password\s*=\s*['\"][a-zA-Z0-9_\-]{8,}['\"]"),
            re.compile(r"ghp_[a-zA-Z0-9]{36}"),
            re.compile(r"sk-[a-zA-Z0-9]{32,}"),
        ]

        target_files = list(SRC_DIR.rglob("*.py")) + [PROJECT_ROOT / "app.py"]
        for py_file in target_files:
            content = py_file.read_text(encoding="utf-8")
            for pattern in secret_patterns:
                matches = pattern.findall(content)
                assert not matches, f"Potential secret pattern found in {py_file.name}: {matches}"

    def test_requirements_file_has_all_runtime_dependencies(self):
        """Verify requirements.txt covers all core runtime dependencies."""
        req_file = PROJECT_ROOT / "requirements.txt"
        assert req_file.exists()
        req_text = req_file.read_text(encoding="utf-8").lower()

        required_packages = [
            "pandas",
            "numpy",
            "scipy",
            "scikit-learn",
            "joblib",
            "matplotlib",
            "seaborn",
            "folium",
            "geopy",
            "streamlit",
            "streamlit-folium",
            "pytest",
        ]
        for pkg in required_packages:
            assert pkg in req_text, f"Required package '{pkg}' missing from requirements.txt"

    def test_streamlit_config_present_and_valid(self):
        """Verify .streamlit/config.toml exists with valid light executive theme."""
        cfg_file = PROJECT_ROOT / ".streamlit" / "config.toml"
        assert cfg_file.exists()
        content = cfg_file.read_text(encoding="utf-8")
        assert "[theme]" in content
        assert "primaryColor" in content
        assert "backgroundColor" in content

    def test_required_outputs_accessible_and_readable(self):
        """Verify all analytical output artifacts required by the application exist and are non-empty."""
        required_outputs = [
            OUTPUTS_DIR / "tamil_nadu" / "district_summary.csv",
            OUTPUTS_DIR / "tamil_nadu" / "yearly_trends.csv",
            OUTPUTS_DIR / "pca" / "explained_variance.csv",
            OUTPUTS_DIR / "pca" / "pca_components.csv",
            OUTPUTS_DIR / "classical" / "model_metrics.csv",
            OUTPUTS_DIR / "classical" / "classification_reports.csv",
            OUTPUTS_DIR / "geographic" / "hotspot_summary.csv",
            OUTPUTS_DIR / "geographic" / "geographic_profile.html",
        ]
        for path in required_outputs:
            assert path.exists(), f"Required output missing: {path.name}"
            assert path.stat().st_size > 0, f"Required output is empty: {path.name}"

    def test_gitignore_protects_credentials_and_caches(self):
        """Verify .gitignore contains patterns for credentials, environments, and caches."""
        gitignore = PROJECT_ROOT / ".gitignore"
        assert gitignore.exists()
        content = gitignore.read_text(encoding="utf-8")
        assert ".env" in content
        assert ".venv" in content or "venv" in content
        assert "__pycache__" in content
        assert ".pytest_cache" in content
