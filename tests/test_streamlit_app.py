"""tests/test_streamlit_app.py - Day 7 test suite for Streamlit app, services, and all model integrations.

Validates:
1. All page modules import and initialize cleanly.
2. Data service returns correct types with graceful fallback.
3. Classical model service loads and produces valid predictions.
4. K-Means cluster assignment works correctly.
5. Hierarchical clustering labels are accessible.
6. Model registry accurately reports availability.
7. Edge cases handled gracefully.
"""

from __future__ import annotations

import math
import pytest
import pandas as pd
import numpy as np

from src.ui.styles import apply_custom_styles
from src.ui.components import (
    render_page_header,
    render_metric_card,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_placeholder_interface,
    render_model_score_badge,
)
from src.services.data_service import (
    load_homicide_data,
    get_pca_explained_variance,
    get_pca_components,
    get_tamil_nadu_district_summary,
    get_tamil_nadu_yearly_trends,
    get_classical_model_metrics,
    get_classification_reports,
    get_geographic_hotspots,
)
from src.services.model_service import (
    list_available_models,
    load_classical_model,
    predict_case_solvability,
    load_kmeans_bundle,
    load_hierarchical_bundle,
    predict_kmeans_cluster,
    get_cluster_distribution,
    get_model_registry,
)
import app


# ─────────────────────────────────────────────────────────────────────────────
# UI Component Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestUIComponents:
    """Reusable Streamlit UI components execute without raising exceptions."""

    def test_apply_custom_styles(self):
        apply_custom_styles()

    def test_render_components(self):
        render_page_header("Test Title", "Test Subtitle", badge_text="Test Badge")
        render_metric_card("Metric", "100", "+5%", delta_positive=True)
        render_section_header("Section", "Description")
        render_alert("Alert message", alert_type="info")
        render_responsible_notice()
        render_model_score_badge(prediction=1, probability=0.85, model_name="ID3 Decision Tree")
        render_model_score_badge(prediction=0, probability=0.25, model_name="Naive Bayes")

    def test_render_placeholder_interface(self):
        """render_placeholder_interface accepts its legacy positional signature."""
        render_placeholder_interface("Module Test", "Person A", "Test desc", ["Input 1"], ["Output 1"])


# ─────────────────────────────────────────────────────────────────────────────
# Data Service Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestDataService:
    """Data loaders return correct types and non-empty frames."""

    def test_load_homicide_data(self):
        df = load_homicide_data()
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        assert "city" in df.columns

    def test_load_pca_data(self):
        var_df = get_pca_explained_variance()
        assert isinstance(var_df, pd.DataFrame)
        comp_df = get_pca_components()
        assert isinstance(comp_df, pd.DataFrame)

    def test_load_tamil_nadu_data(self):
        dist_df = get_tamil_nadu_district_summary()
        assert isinstance(dist_df, pd.DataFrame)
        assert not dist_df.empty
        trends_df = get_tamil_nadu_yearly_trends()
        assert isinstance(trends_df, pd.DataFrame)
        assert not trends_df.empty

    def test_load_classical_metrics(self):
        metrics_df = get_classical_model_metrics()
        assert isinstance(metrics_df, pd.DataFrame)
        assert not metrics_df.empty
        reports_df = get_classification_reports()
        assert isinstance(reports_df, pd.DataFrame)
        assert not reports_df.empty

    def test_load_geographic_hotspots(self):
        hotspots_df = get_geographic_hotspots()
        assert isinstance(hotspots_df, pd.DataFrame)


# ─────────────────────────────────────────────────────────────────────────────
# Classical Model Tests (Day 5)
# ─────────────────────────────────────────────────────────────────────────────

class TestClassicalModelService:
    """Classical solvability models load and infer correctly."""

    def test_list_available_models(self):
        models = list_available_models()
        assert "decision_tree_id3" in models
        assert "naive_bayes" in models
        assert "knn" in models

    def test_load_classical_models(self):
        for key in ["decision_tree_id3", "naive_bayes", "knn"]:
            bundle = load_classical_model(key)
            assert bundle is not None
            assert hasattr(bundle, "predict") or (isinstance(bundle, dict) and "pipeline" in bundle)

    def test_predict_decision_tree(self):
        features = {
            "victim_age_clean": 30.0, "victim_sex": "Male", "victim_race": "Black",
            "city": "Chicago", "state": "IL", "reported_year": 2015,
            "reported_month": 6, "reported_is_weekend": 1, "reported_day_of_week": 5,
        }
        res = predict_case_solvability("decision_tree_id3", features)
        assert res["status"] == "success"
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0
        assert "Decision Tree" in res["model_name"]

    def test_predict_naive_bayes(self):
        features = {
            "victim_age_clean": 45.0, "victim_sex": "Female", "victim_race": "White",
            "city": "Los Angeles", "state": "CA", "reported_year": 2018,
            "reported_month": 3, "reported_is_weekend": 0, "reported_day_of_week": 2,
        }
        res = predict_case_solvability("naive_bayes", features)
        assert res["status"] == "success"
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0

    def test_predict_knn(self):
        features = {
            "victim_age_clean": 22.0, "victim_sex": "Male", "victim_race": "Hispanic",
            "city": "Houston", "state": "TX", "reported_year": 2014,
            "reported_month": 11, "reported_is_weekend": 1, "reported_day_of_week": 6,
        }
        res = predict_case_solvability("knn", features)
        assert res["status"] == "success"
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0

    def test_predict_invalid_model_returns_error(self):
        res = predict_case_solvability("non_existent_model", {})
        assert "error" in res


# ─────────────────────────────────────────────────────────────────────────────
# Clustering Model Tests (Day 7 – Person A)
# ─────────────────────────────────────────────────────────────────────────────

class TestClusteringModels:
    """K-Means and Hierarchical clustering models load and produce valid results."""

    def test_kmeans_bundle_loads(self):
        b = load_kmeans_bundle()
        assert b["available"] is True
        assert b["model"] is not None
        assert b["scaler"] is not None
        assert b["n_clusters"] == 5

    def test_kmeans_cluster_centers_available(self):
        b = load_kmeans_bundle()
        centers = b.get("cluster_centers_orig")
        assert centers is not None
        assert len(centers) == 5
        # All centers should be plausible ages
        for c in centers:
            assert 0 <= c <= 120

    def test_kmeans_predict_valid_age(self):
        res = predict_kmeans_cluster(25.0)
        assert res["status"] == "success"
        assert 0 <= res["cluster_id"] <= 4
        assert isinstance(res["cluster_label"], str)
        assert 0.0 <= res["cluster_center_age"] <= 120.0
        assert res["distance_to_center"] >= 0.0

    def test_kmeans_predict_boundary_ages(self):
        for age in [0, 18, 40, 65, 100]:
            res = predict_kmeans_cluster(float(age))
            assert res["status"] == "success", f"Failed for age={age}"

    def test_kmeans_predict_invalid_age_returns_error(self):
        res = predict_kmeans_cluster(-5.0)
        assert res["status"] == "error"
        res2 = predict_kmeans_cluster(150.0)
        assert res2["status"] == "error"

    def test_hierarchical_bundle_loads(self):
        b = load_hierarchical_bundle()
        assert b["available"] is True
        assert b["labels_"] is not None
        assert b["n_clusters"] == 5

    def test_kmeans_distribution(self):
        dist = get_cluster_distribution("kmeans")
        assert dist["status"] == "success"
        assert len(dist["cluster_ids"]) == 5
        total_pct = sum(dist["cluster_pcts"])
        assert abs(total_pct - 100.0) < 0.5

    def test_hierarchical_distribution(self):
        dist = get_cluster_distribution("hierarchical")
        assert dist["status"] == "success"
        assert len(dist["cluster_ids"]) == 5


# ─────────────────────────────────────────────────────────────────────────────
# Model Registry Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestModelRegistry:
    """Registry accurately reflects real model availability."""

    def test_registry_returns_all_models(self):
        reg = get_model_registry()
        expected_keys = {"decision_tree_id3", "naive_bayes", "knn", "kmeans", "hierarchical", "pca", "ann", "bbn"}
        assert expected_keys.issubset(set(reg.keys()))

    def test_classical_models_are_available(self):
        reg = get_model_registry()
        for key in ["decision_tree_id3", "naive_bayes", "knn"]:
            assert reg[key]["available"] is True, f"{key} should be available"

    def test_clustering_models_are_available(self):
        reg = get_model_registry()
        assert reg["kmeans"]["available"] is True
        assert reg["hierarchical"]["available"] is True

    def test_pca_is_available(self):
        reg = get_model_registry()
        assert reg["pca"]["available"] is True

    def test_ann_is_not_available(self):
        reg = get_model_registry()
        assert reg["ann"]["available"] is False
        assert "TensorFlow" in reg["ann"]["reason"]

    def test_bbn_is_not_available(self):
        reg = get_model_registry()
        assert reg["bbn"]["available"] is False
        assert "pgmpy" in reg["bbn"]["reason"]

    def test_all_registry_entries_have_required_keys(self):
        reg = get_model_registry()
        for key, info in reg.items():
            assert "name" in info, f"{key} missing 'name'"
            assert "available" in info, f"{key} missing 'available'"
            assert "owner" in info, f"{key} missing 'owner'"
            assert "task" in info, f"{key} missing 'task'"


# ─────────────────────────────────────────────────────────────────────────────
# App Architecture Tests
# ─────────────────────────────────────────────────────────────────────────────

class TestAppArchitecture:
    """Main app navigation and page modules wired correctly."""

    def test_all_pages_registered(self):
        # 7 core pages always present
        expected_pages = [
            "Overview / Dashboard",
            "Crime Linkage & Clustering",
            "Geographic Analysis",
            "Behavioral Profiling",
            "Case Solvability",
            "Tamil Nadu Analytics",
            "Model Comparison",
        ]
        for p in expected_pages:
            assert p in app.PAGES, f"Page '{p}' missing from PAGES"
            assert callable(app.PAGES[p]["func"])
            assert "icon" in app.PAGES[p]

    def test_at_least_7_pages(self):
        assert len(app.PAGES) >= 7

    def test_all_page_functions_importable(self):
        from src.pages.overview import render_overview_page
        from src.pages.crime_linkage import render_crime_linkage_page
        from src.pages.geographic_analysis import render_geographic_analysis_page
        from src.pages.behavioral_profiling import render_behavioral_profiling_page
        from src.pages.case_solvability import render_case_solvability_page
        from src.pages.tamil_nadu_analytics import render_tamil_nadu_analytics_page
        from src.pages.model_comparison import render_model_comparison_page
        # No exception = pass
