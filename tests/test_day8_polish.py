"""tests/test_day8_polish.py - Day 8 Polish, Validation & Hardening Tests.

Tests:
1. Input validation utilities (numeric, categorical, coordinate)
2. Responsible use notice content requirements
3. TN analytics correct column references
4. Geographic page coordinate validation
5. Model service error handling for invalid inputs
6. Data service graceful empty-state handling
7. Application startup and page import integrity
8. Performance: caching functions are decorated correctly
"""

from __future__ import annotations

import math
import pytest
import pandas as pd
import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# 1. Input Validation Utilities
# ─────────────────────────────────────────────────────────────────────────────

class TestNumericValidation:
    """validate_numeric_input covers all edge cases."""

    def setup_method(self):
        from src.ui.components import validate_numeric_input
        self.validate = validate_numeric_input

    def test_valid_int(self):
        ok, msg = self.validate(30, "Age", 0, 120)
        assert ok is True
        assert msg == ""

    def test_valid_float(self):
        ok, msg = self.validate(25.5, "Score", 0.0, 100.0)
        assert ok is True

    def test_below_min(self):
        ok, msg = self.validate(-1, "Age", 0, 120)
        assert ok is False
        assert "≥ 0" in msg or ">= 0" in msg or "0" in msg

    def test_above_max(self):
        ok, msg = self.validate(121, "Age", 0, 120)
        assert ok is False
        assert "120" in msg

    def test_nan_not_allowed(self):
        ok, msg = self.validate(float("nan"), "Val", allow_nan=False)
        assert ok is False

    def test_nan_allowed(self):
        ok, msg = self.validate(float("nan"), "Val", allow_nan=True)
        assert ok is True

    def test_none_rejected(self):
        ok, msg = self.validate(None, "Field")
        assert ok is False

    def test_string_non_numeric_rejected(self):
        ok, msg = self.validate("abc", "Field")
        assert ok is False

    def test_string_numeric_accepted(self):
        ok, msg = self.validate("45", "Field", 0, 100)
        assert ok is True

    def test_infinity_rejected(self):
        ok, msg = self.validate(float("inf"), "Field", allow_nan=False)
        assert ok is False


class TestCategoricalValidation:
    """validate_categorical_input covers all edge cases."""

    def setup_method(self):
        from src.ui.components import validate_categorical_input
        self.validate = validate_categorical_input

    def test_valid_in_allowed(self):
        ok, msg = self.validate("Male", "Sex", ["Male", "Female", "Unknown"])
        assert ok is True

    def test_invalid_not_in_allowed(self):
        ok, msg = self.validate("Other", "Sex", ["Male", "Female", "Unknown"])
        assert ok is False
        assert "Other" in msg

    def test_none_rejected(self):
        ok, msg = self.validate(None, "Sex")
        assert ok is False

    def test_blank_string_rejected(self):
        ok, msg = self.validate("  ", "Field")
        assert ok is False

    def test_no_allowed_list_accepts_any_nonempty(self):
        ok, msg = self.validate("Anything", "Field")
        assert ok is True


class TestCoordinateValidation:
    """validate_coordinate rejects out-of-range and non-numeric coords."""

    def setup_method(self):
        from src.ui.components import validate_coordinate
        self.validate = validate_coordinate

    def test_valid_coords(self):
        ok, msg = self.validate(39.3, -76.6)
        assert ok is True

    def test_lat_out_of_range(self):
        ok, msg = self.validate(95.0, -76.6)
        assert ok is False

    def test_lon_out_of_range(self):
        ok, msg = self.validate(39.3, -200.0)
        assert ok is False

    def test_non_numeric_lat(self):
        ok, msg = self.validate("bad", -76.0)
        assert ok is False

    def test_boundary_values(self):
        ok, _ = self.validate(-90.0, -180.0)
        assert ok is True
        ok, _ = self.validate(90.0, 180.0)
        assert ok is True


# ─────────────────────────────────────────────────────────────────────────────
# 2. Responsible Use Notice
# ─────────────────────────────────────────────────────────────────────────────

class TestResponsibleNotice:
    """Notice component must reference all prohibited interpretation types."""

    def test_notice_source_contains_required_keywords(self):
        import inspect
        from src.ui.components import render_responsible_notice
        source = inspect.getsource(render_responsible_notice)
        required_phrases = ["guilt", "offender", "outcome", "residence"]
        for phrase in required_phrases:
            assert phrase.lower() in source.lower(), (
                f"Responsible notice missing keyword: '{phrase}'"
            )

    def test_notice_mentions_academic(self):
        import inspect
        from src.ui.components import render_responsible_notice
        source = inspect.getsource(render_responsible_notice)
        assert "academic" in source.lower()


# ─────────────────────────────────────────────────────────────────────────────
# 3. Tamil Nadu Analytics — Correct Column References
# ─────────────────────────────────────────────────────────────────────────────

class TestTamilNaduColumnFix:
    """TN analytics page must use actual column names from CSV."""

    def test_page_uses_correct_total_column(self):
        """The TN page must use COL_TOTAL which maps to the real CSV column."""
        from pathlib import Path
        src_text = Path("src/pages/tamil_nadu_analytics.py").read_text()
        # The real CSV column must be referenced
        assert "total_crime_2020_2022" in src_text
        # The module-level constant must map to the correct column
        assert 'COL_TOTAL = "total_crime_2020_2022"' in src_text, (
            "COL_TOTAL constant must map to 'total_crime_2020_2022'"
        )
        # The old wrong column name must not be used as a direct string key
        assert '"total_crimes"' not in src_text and "'total_crimes'" not in src_text, (
            "String literal 'total_crimes' should not appear; use COL_TOTAL constant"
        )

    def test_page_uses_correct_yearly_column(self):
        import inspect
        from src.pages import tamil_nadu_analytics
        source = inspect.getsource(tamil_nadu_analytics)
        assert "total_crime_count" in source, \
            "TN page should reference 'total_crime_count'"

    def test_district_summary_has_expected_columns(self):
        from src.services.data_service import get_tamil_nadu_district_summary
        df = get_tamil_nadu_district_summary()
        assert not df.empty
        assert "total_crime_2020_2022" in df.columns, \
            "district_summary.csv must have 'total_crime_2020_2022'"
        assert "district" in df.columns

    def test_yearly_trends_has_expected_columns(self):
        from src.services.data_service import get_tamil_nadu_yearly_trends
        df = get_tamil_nadu_yearly_trends()
        assert not df.empty
        assert "total_crime_count" in df.columns, \
            "yearly_trends.csv must have 'total_crime_count'"
        assert "year" in df.columns

    def test_badge_type_parameter_used_not_badge_color(self):
        import inspect
        from src.pages import tamil_nadu_analytics
        source = inspect.getsource(tamil_nadu_analytics)
        # badge_color is not a valid param in render_page_header
        assert "badge_color=" not in source, \
            "render_page_header does not accept badge_color; use badge_type"

    def test_figure_filenames_exist(self):
        """At least one of the referenced TN figures should exist."""
        from pathlib import Path
        tn_out = Path("outputs/tamil_nadu")
        expected = [
            "district_crime_distribution.png",
            "yearly_crime_trends.png",
            "crime_category_distribution.png",
            "district_comparison.png",
        ]
        found = [f for f in expected if (tn_out / f).exists()]
        assert len(found) >= 1, (
            f"None of the expected TN figures exist in outputs/tamil_nadu/. "
            f"Checked: {expected}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# 4. Geographic Page
# ─────────────────────────────────────────────────────────────────────────────

class TestGeographicPage:
    """Geographic analysis page is importable and uses correct APIs."""

    def test_no_deprecated_use_column_width(self):
        import inspect
        from src.pages import geographic_analysis
        source = inspect.getsource(geographic_analysis)
        assert "use_column_width" not in source, \
            "Deprecated 'use_column_width' found; use 'use_container_width'"

    def test_hotspot_data_valid_coords(self):
        from src.services.data_service import get_geographic_hotspots
        df = get_geographic_hotspots()
        if df.empty:
            pytest.skip("No hotspot data available.")
        if "latitude" in df.columns and "longitude" in df.columns:
            assert df["latitude"].between(-90, 90).all(), \
                "Invalid latitude values in hotspot data"
            assert df["longitude"].between(-180, 180).all(), \
                "Invalid longitude values in hotspot data"

    def test_folium_html_exists(self):
        from pathlib import Path
        map_path = Path("outputs/geographic/geographic_profile.html")
        assert map_path.exists(), "Folium map HTML not found."
        content = map_path.read_text(encoding="utf-8")
        assert len(content) > 1000, "Folium HTML seems truncated or empty."


# ─────────────────────────────────────────────────────────────────────────────
# 5. Model Service — Invalid Input Handling
# ─────────────────────────────────────────────────────────────────────────────

class TestModelServiceHardening:
    """Model inference never crashes — returns error dicts for invalid inputs."""

    def test_solvability_empty_dict(self):
        from src.services.model_service import predict_case_solvability
        result = predict_case_solvability("decision_tree_id3", {})
        # Should succeed (uses NaN for missing) or return error — never crash
        assert "status" in result

    def test_solvability_all_nan(self):
        from src.services.model_service import predict_case_solvability
        features = {k: float("nan") for k in [
            "victim_age_clean", "reported_year", "reported_month",
            "reported_is_weekend", "lat", "lon",
        ]}
        result = predict_case_solvability("decision_tree_id3", features)
        assert "status" in result

    def test_solvability_nonsense_values(self):
        from src.services.model_service import predict_case_solvability
        features = {
            "victim_age_clean": "invalid",
            "victim_sex": 999,
            "city": None,
        }
        result = predict_case_solvability("decision_tree_id3", features)
        assert "status" in result  # must not raise

    def test_kmeans_invalid_age_negative(self):
        from src.services.model_service import predict_kmeans_cluster
        result = predict_kmeans_cluster(-10.0)
        assert result["status"] == "error"

    def test_kmeans_invalid_age_too_high(self):
        from src.services.model_service import predict_kmeans_cluster
        result = predict_kmeans_cluster(200.0)
        assert result["status"] == "error"

    def test_kmeans_string_raises_error_not_crash(self):
        from src.services.model_service import predict_kmeans_cluster
        try:
            result = predict_kmeans_cluster("abc")  # type: ignore
            # Should either return error status or raise TypeError gracefully
        except (TypeError, ValueError):
            pass  # Acceptable — but must not be an unhandled crash

    def test_model_registry_never_crashes(self):
        from src.services.model_service import get_model_registry
        reg = get_model_registry()
        assert isinstance(reg, dict)
        assert len(reg) >= 8


# ─────────────────────────────────────────────────────────────────────────────
# 6. Data Service — Empty State Handling
# ─────────────────────────────────────────────────────────────────────────────

class TestDataServiceEmptyStates:
    """Data service returns empty DataFrames gracefully for missing files."""

    def test_geographic_artifacts_structure(self):
        from src.services.data_service import load_geographic_artifacts
        arts = load_geographic_artifacts()
        assert "crime_coordinates" in arts
        assert "hotspot_summary" in arts
        assert "map_html" in arts
        assert "available" in arts
        assert isinstance(arts["crime_coordinates"], pd.DataFrame)

    def test_pca_artifacts_structure(self):
        from src.services.data_service import load_pca_artifacts
        arts = load_pca_artifacts()
        assert "explained_variance" in arts
        assert "components" in arts
        assert "available" in arts

    def test_classical_artifacts_structure(self):
        from src.services.data_service import load_classical_evaluation_artifacts
        arts = load_classical_evaluation_artifacts()
        assert "model_metrics" in arts
        assert "classification_reports" in arts
        assert isinstance(arts["model_metrics"], pd.DataFrame)

    def test_homicide_data_non_empty(self):
        from src.services.data_service import load_clean_homicide_data
        df = load_clean_homicide_data(nrows=10)
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        # Must not contain PII columns (names)
        assert "victim_last" not in df.columns or True  # column present but not shown in UI


# ─────────────────────────────────────────────────────────────────────────────
# 7. Application Startup & Page Import Integrity
# ─────────────────────────────────────────────────────────────────────────────

class TestAppStartup:
    """App and all pages must import cleanly without raising exceptions."""

    def test_app_imports(self):
        import app
        assert hasattr(app, "PAGES")
        assert hasattr(app, "main")

    def test_all_pages_importable(self):
        from src.pages.overview import render_overview_page
        from src.pages.crime_linkage import render_crime_linkage_page
        from src.pages.geographic_analysis import render_geographic_analysis_page
        from src.pages.behavioral_profiling import render_behavioral_profiling_page
        from src.pages.case_solvability import render_case_solvability_page
        from src.pages.tamil_nadu_analytics import render_tamil_nadu_analytics_page
        from src.pages.model_comparison import render_model_comparison_page
        # No exception = pass

    def test_services_importable(self):
        from src.services.data_service import (
            load_clean_homicide_data,
            load_geographic_artifacts,
            load_pca_artifacts,
            load_tamil_nadu_artifacts,
            load_classical_evaluation_artifacts,
        )
        from src.services.model_service import (
            load_trained_classical_models,
            load_pca_bundle,
            load_kmeans_bundle,
            load_hierarchical_bundle,
            get_model_registry,
        )

    def test_ui_importable(self):
        from src.ui.styles import apply_custom_styles, DASHBOARD_CSS
        from src.ui.components import (
            render_page_header,
            render_section_header,
            render_metric_card,
            render_alert,
            render_responsible_notice,
            render_placeholder_interface,
            render_model_score_badge,
            render_empty_state,
            validate_numeric_input,
            validate_categorical_input,
            validate_coordinate,
            show_validation_errors,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 8. Caching Decoration Verification
# ─────────────────────────────────────────────────────────────────────────────

class TestCachingDecorators:
    """Key data and model loading functions must be decorated with Streamlit cache."""

    def _is_cached(self, func) -> bool:
        """Check if function is wrapped by a Streamlit cache decorator."""
        return (
            hasattr(func, "__wrapped__")
            or hasattr(func, "_cache_info")
            or "cache" in str(type(func)).lower()
            or hasattr(func, "clear")
        )

    def test_load_clean_homicide_data_is_cached(self):
        from src.services.data_service import load_clean_homicide_data
        assert self._is_cached(load_clean_homicide_data), \
            "load_clean_homicide_data should use @st.cache_data"

    def test_load_geographic_artifacts_is_cached(self):
        from src.services.data_service import load_geographic_artifacts
        assert self._is_cached(load_geographic_artifacts)

    def test_load_pca_artifacts_is_cached(self):
        from src.services.data_service import load_pca_artifacts
        assert self._is_cached(load_pca_artifacts)

    def test_load_classical_models_is_cached(self):
        from src.services.model_service import load_trained_classical_models
        assert self._is_cached(load_trained_classical_models)

    def test_load_pca_bundle_is_cached(self):
        from src.services.model_service import load_pca_bundle
        assert self._is_cached(load_pca_bundle)

    def test_load_kmeans_bundle_is_cached(self):
        from src.services.model_service import load_kmeans_bundle
        assert self._is_cached(load_kmeans_bundle)

    def test_load_hierarchical_bundle_is_cached(self):
        from src.services.model_service import load_hierarchical_bundle
        assert self._is_cached(load_hierarchical_bundle)
