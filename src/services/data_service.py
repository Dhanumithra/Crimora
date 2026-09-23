"""Data Service Module for Streamlit Dashboard.

Provides robust, cached data loading routines for:
- Processed homicide incident data
- Geographic profiling & hotspot artifacts
- PCA explained variance and loadings
- Tamil Nadu longitudinal crime statistics
- Classical ML performance metrics and classification reports
- Feature dictionary documentation

Implements graceful error handling: returns empty structures or None
instead of crashing the app when optional artifacts are absent.
"""

from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union
import pandas as pd
import streamlit as st

from src.config import (
    CLASSICAL_OUTPUTS_DIR,
    GEOGRAPHIC_OUTPUTS_DIR,
    OUTPUTS_DIR,
    PROCESSED_DATA_DIR,
)


@st.cache_data(show_spinner=False)
def load_clean_homicide_data(nrows: Optional[int] = None) -> pd.DataFrame:
    """Load the processed homicide dataset with caching.

    Args:
        nrows: Optional limit for previewing.

    Returns:
        pd.DataFrame: Cleaned DataFrame, or empty DataFrame if missing.
    """
    csv_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
    if not csv_path.exists():
        return pd.DataFrame()
    try:
        return pd.read_csv(csv_path, nrows=nrows)
    except Exception:
        return pd.DataFrame()


@st.cache_data(show_spinner=False)
def load_geographic_artifacts() -> Dict[str, Any]:
    """Load Day 4 Geographic profiling data artifacts and HTML map.

    Returns:
        Dict[str, Any]: Mapping of artifact keys to loaded DataFrames or HTML content.
    """
    artifacts: Dict[str, Any] = {
        "crime_coordinates": pd.DataFrame(),
        "geographic_grid": pd.DataFrame(),
        "hotspot_summary": pd.DataFrame(),
        "map_html": None,
        "available": False,
    }

    coords_file = GEOGRAPHIC_OUTPUTS_DIR / "crime_coordinates.csv"
    grid_file = GEOGRAPHIC_OUTPUTS_DIR / "geographic_grid.csv"
    hotspots_file = GEOGRAPHIC_OUTPUTS_DIR / "hotspot_summary.csv"
    map_file = GEOGRAPHIC_OUTPUTS_DIR / "geographic_profile.html"

    if coords_file.exists():
        try:
            artifacts["crime_coordinates"] = pd.read_csv(coords_file)
            artifacts["available"] = True
        except Exception:
            pass

    if grid_file.exists():
        try:
            artifacts["geographic_grid"] = pd.read_csv(grid_file)
        except Exception:
            pass

    if hotspots_file.exists():
        try:
            artifacts["hotspot_summary"] = pd.read_csv(hotspots_file)
        except Exception:
            pass

    if map_file.exists():
        try:
            with open(map_file, "r", encoding="utf-8") as f:
                artifacts["map_html"] = f.read()
        except Exception:
            pass

    return artifacts


@st.cache_data(show_spinner=False)
def load_pca_artifacts() -> Dict[str, Any]:
    """Load Day 3 PCA explained variance and loadings artifacts.

    Returns:
        Dict[str, Any]: PCA analysis DataFrames.
    """
    pca_dir = OUTPUTS_DIR / "pca"
    artifacts: Dict[str, Any] = {
        "explained_variance": pd.DataFrame(),
        "components": pd.DataFrame(),
        "feature_selection": pd.DataFrame(),
        "available": False,
    }

    var_file = pca_dir / "explained_variance.csv"
    comp_file = pca_dir / "pca_components.csv"
    sel_file = pca_dir / "pca_feature_selection.csv"

    if var_file.exists():
        try:
            artifacts["explained_variance"] = pd.read_csv(var_file)
            artifacts["available"] = True
        except Exception:
            pass

    if comp_file.exists():
        try:
            artifacts["components"] = pd.read_csv(comp_file, index_col=0)
        except Exception:
            pass

    if sel_file.exists():
        try:
            artifacts["feature_selection"] = pd.read_csv(sel_file)
        except Exception:
            pass

    return artifacts


@st.cache_data(show_spinner=False)
def load_tamil_nadu_artifacts() -> Dict[str, Any]:
    """Load Day 3 Tamil Nadu district summary and yearly trends.

    Returns:
        Dict[str, Any]: Tamil Nadu crime DataFrames.
    """
    tn_dir = OUTPUTS_DIR / "tamil_nadu"
    artifacts: Dict[str, Any] = {
        "district_summary": pd.DataFrame(),
        "yearly_trends": pd.DataFrame(),
        "available": False,
    }

    dist_file = tn_dir / "district_summary.csv"
    trends_file = tn_dir / "yearly_trends.csv"

    if dist_file.exists():
        try:
            artifacts["district_summary"] = pd.read_csv(dist_file)
            artifacts["available"] = True
        except Exception:
            pass

    if trends_file.exists():
        try:
            artifacts["yearly_trends"] = pd.read_csv(trends_file)
        except Exception:
            pass

    return artifacts


@st.cache_data(show_spinner=False)
def load_classical_evaluation_artifacts() -> Dict[str, Any]:
    """Load Day 5 classical model evaluation metrics and classification reports.

    Returns:
        Dict[str, Any]: Model performance DataFrames.
    """
    artifacts: Dict[str, Any] = {
        "model_metrics": pd.DataFrame(),
        "classification_reports": pd.DataFrame(),
        "available": False,
    }

    metrics_file = CLASSICAL_OUTPUTS_DIR / "model_metrics.csv"
    reports_file = CLASSICAL_OUTPUTS_DIR / "classification_reports.csv"

    if metrics_file.exists():
        try:
            artifacts["model_metrics"] = pd.read_csv(metrics_file)
            artifacts["available"] = True
        except Exception:
            pass

    if reports_file.exists():
        try:
            artifacts["classification_reports"] = pd.read_csv(reports_file)
        except Exception:
            pass

    return artifacts


@st.cache_data(show_spinner=False)
def load_feature_dictionary_text() -> str:
    """Load markdown documentation of the feature dictionary.

    Returns:
        str: Feature dictionary markdown content.
    """
    dict_path = OUTPUTS_DIR / "person_b_feature_dictionary.md"
    if dict_path.exists():
        try:
            with open(dict_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return ""
    return ""


# Aliases & Convenience Accessors
load_homicide_data = load_clean_homicide_data


def get_pca_explained_variance() -> pd.DataFrame:
    """Convenience getter for PCA explained variance."""
    return load_pca_artifacts().get("explained_variance", pd.DataFrame())


def get_pca_components() -> pd.DataFrame:
    """Convenience getter for PCA components."""
    return load_pca_artifacts().get("components", pd.DataFrame())


def get_tamil_nadu_district_summary() -> pd.DataFrame:
    """Convenience getter for Tamil Nadu district summary."""
    return load_tamil_nadu_artifacts().get("district_summary", pd.DataFrame())


def get_tamil_nadu_yearly_trends() -> pd.DataFrame:
    """Convenience getter for Tamil Nadu yearly trends."""
    return load_tamil_nadu_artifacts().get("yearly_trends", pd.DataFrame())


def get_classical_model_metrics() -> pd.DataFrame:
    """Convenience getter for Classical ML model metrics."""
    return load_classical_evaluation_artifacts().get("model_metrics", pd.DataFrame())


def get_classification_reports() -> pd.DataFrame:
    """Convenience getter for Classical ML classification reports."""
    return load_classical_evaluation_artifacts().get("classification_reports", pd.DataFrame())


def get_geographic_hotspots() -> pd.DataFrame:
    """Convenience getter for Geographic hotspot summary."""
    return load_geographic_artifacts().get("hotspot_summary", pd.DataFrame())

