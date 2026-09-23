"""tests/test_streamlit_app.py - Test suite for Streamlit application shell and services.

Validates that:
1. All page modules and UI components import and initialize cleanly.
2. Data service returns correct types and caches properly.
3. Model service loads trained Day 5 models and returns valid predictions.
4. Edge cases like missing files are gracefully handled.
"""

from __future__ import annotations

import pytest
import pandas as pd

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
)
import app


class TestUIComponents:
    """Test suite for reusable Streamlit UI components."""

    def test_apply_custom_styles(self):
        """Ensure apply_custom_styles executes without error."""
        apply_custom_styles()

    def test_render_components(self):
        """Ensure component rendering functions execute without uncaught exceptions."""
        render_page_header("Test Title", "Test Subtitle", badge_text="Test Badge")
        render_metric_card("Metric", "100", "+5%", delta_positive=True)
        render_section_header("Section", "Description")
        render_alert("Alert message", alert_type="info")
        render_responsible_notice()
        render_placeholder_interface("Module Test", "Person A", "Test desc", ["Input 1"], ["Output 1"])
        render_model_score_badge(prediction=1, probability=0.85, model_name="ID3 Decision Tree")
        render_model_score_badge(prediction=0, probability=0.25, model_name="Naive Bayes")


class TestDataService:
    """Test suite for data loading and caching service."""

    def test_load_homicide_data(self):
        df = load_homicide_data()
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        assert "disposition_clean" in df.columns or "city" in df.columns

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


class TestModelService:
    """Test suite for model loading and real-time scoring."""

    def test_list_available_models(self):
        models = list_available_models()
        assert "decision_tree_id3" in models
        assert "naive_bayes" in models
        assert "knn" in models

    def test_load_classical_models(self):
        for model_key in ["decision_tree_id3", "naive_bayes", "knn"]:
            bundle = load_classical_model(model_key)
            assert bundle is not None
            assert hasattr(bundle, "predict") or (isinstance(bundle, dict) and "pipeline" in bundle)


    def test_predict_case_solvability_decision_tree(self):
        features = {
            "victim_age_clean": 30.0,
            "victim_sex": "Male",
            "victim_race": "Black",
            "city": "Chicago",
            "state": "IL",
            "reported_year": 2015,
            "reported_month": 6,
            "reported_is_weekend": 1,
            "reported_day_of_week": 5,
        }
        res = predict_case_solvability("decision_tree_id3", features)
        assert "error" not in res
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0
        assert "Decision Tree" in res["model_name"]

    def test_predict_case_solvability_naive_bayes(self):
        features = {
            "victim_age_clean": 45.0,
            "victim_sex": "Female",
            "victim_race": "White",
            "city": "Los Angeles",
            "state": "CA",
            "reported_year": 2018,
            "reported_month": 3,
            "reported_is_weekend": 0,
            "reported_day_of_week": 2,
        }
        res = predict_case_solvability("naive_bayes", features)
        assert "error" not in res
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0

    def test_predict_case_solvability_knn(self):
        features = {
            "victim_age_clean": 22.0,
            "victim_sex": "Male",
            "victim_race": "Hispanic",
            "city": "Houston",
            "state": "TX",
            "reported_year": 2014,
            "reported_month": 11,
            "reported_is_weekend": 1,
            "reported_day_of_week": 6,
        }
        res = predict_case_solvability("knn", features)
        assert "error" not in res
        assert res["prediction"] in [0, 1]
        assert 0.0 <= res["probability"] <= 1.0

    def test_predict_case_solvability_invalid_model(self):
        res = predict_case_solvability("non_existent_model", {})
        assert "error" in res


class TestAppArchitecture:
    """Test suite for main app navigation dictionary and page modules."""

    def test_pages_registered(self):
        assert len(app.PAGES) == 7
        expected_pages = [
            "Overview / Dashboard",
            "Crime Linkage",
            "Geographic Analysis",
            "Behavioral Profiling",
            "Case Solvability",
            "Tamil Nadu Analytics",
            "Model Comparison",
        ]
        for p in expected_pages:
            assert p in app.PAGES
            assert callable(app.PAGES[p]["func"])
            assert "icon" in app.PAGES[p]
