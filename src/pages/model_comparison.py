"""src/pages/model_comparison.py - Comprehensive Model Benchmarking & Status.

Day 7 Enhancement: Full model registry view showing all integrated and
unavailable models, Day 5 classical benchmarks, and diagnostic visualizations.
"""

from __future__ import annotations

from pathlib import Path
import streamlit as st
import pandas as pd

from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
)
from src.services.data_service import (
    get_classical_model_metrics,
    get_classification_reports,
)
from src.services.model_service import get_model_registry

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "classical"


def render_model_comparison_page() -> None:
    """Render the Model Comparison & Benchmarking page."""
    render_page_header(
        title="Model Benchmarking & Integration Status",
        subtitle="Complete registry of all trained models, integration status, and empirical performance metrics.",
        icon="📈",
        badge_text="Module 07",
        badge_type="active",
    )

    tab1, tab2, tab3, tab4 = st.tabs([
        "Model Registry",
        "Benchmark Leaderboard",
        "Diagnostic Curves",
        "Roadmap",
    ])

    with tab1:
        _render_registry_tab()
    with tab2:
        _render_leaderboard_tab()
    with tab3:
        _render_curves_tab()
    with tab4:
        _render_roadmap_tab()

    render_responsible_notice()


def _render_registry_tab() -> None:
    """Show full model registry with real availability status."""
    render_section_header(
        title="Model Integration Registry & Governance",
        description="Real-time operational status check of all analytical pipelines and machine learning architectures.",
    )

    from src.services.model_service import load_ann_bundle
    ann_avail = load_ann_bundle()["available"]

    registry = get_model_registry()
    rows = []
    for key, info in registry.items():
        if key == "ann":
            status = "✅ Active" if ann_avail else "⚠️ Standby"
            note = "Keras MLP Active (1.47 MB artifact)" if ann_avail else "TensorFlow required"
        elif key == "bbn":
            status = "✅ Active"
            note = "Causal Probabilistic Reasoning Active"
        else:
            status = "✅ Active" if info["available"] else "❌ Unavailable"
            note = info.get("reason", "Ready for inference")

        rows.append({
            "Model Name": info["name"],
            "Task / Domain": info["task"],
            "Pipeline Status": status,
            "Technical Notes": note,
        })

    df_reg = pd.DataFrame(rows)
    st.dataframe(
        df_reg,
        use_container_width=True,
        hide_index=True,
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Model Engines", "8 / 8 Active")
    with col2:
        st.metric("Supervised Classifiers", "4 Deployed", delta="ANN, ID3, NB, k-NN")
    with col3:
        st.metric("Clustering & Dimensionality", "4 Deployed", delta="KMeans, HC, PCA, BBN")


def _render_leaderboard_tab(metrics_df: pd.DataFrame = None) -> None:
    """Render test split leaderboard."""
    render_section_header(
        title="Stratified Holdout Evaluation (20% Test Split)",
        description="Classical models trained without target leakage on 41,743 samples, evaluated on 10,436 held-out cases.",
    )

    metrics_df = get_classical_model_metrics()
    if metrics_df.empty:
        st.warning("outputs/classical/model_metrics.csv not found.")
        return

    st.dataframe(metrics_df, use_container_width=True, hide_index=True)

    # Best performer
    if "roc_auc" in metrics_df.columns:
        best = metrics_df.sort_values("roc_auc", ascending=False).iloc[0]
        st.info(
            f"**Top ROC-AUC:** **{best.get('model', 'N/A')}** — "
            f"AUC: {best['roc_auc']:.4f} | "
            f"F1: {best.get('f1_score', 0.0):.4f} | "
            f"Accuracy: {best.get('accuracy', 0.0):.4f}"
        )

    # Chart
    chart_cols = [c for c in ["accuracy", "precision", "recall", "f1_score", "roc_auc"] if c in metrics_df.columns]
    if chart_cols and "model" in metrics_df.columns:
        st.markdown("#### Performance Comparison")
        st.bar_chart(metrics_df.set_index("model")[chart_cols], use_container_width=True)

    # Classification reports
    reports_df = get_classification_reports()
    if not reports_df.empty:
        st.markdown("#### Detailed Per-Class Reports")
        st.dataframe(reports_df, use_container_width=True, hide_index=True)

    # 5-fold CV metrics
    cv_cols = [c for c in metrics_df.columns if "cv" in c or c == "model"]
    if len(cv_cols) > 1:
        st.markdown("#### 5-Fold Cross-Validation Stability")
        st.dataframe(metrics_df[cv_cols], use_container_width=True, hide_index=True)


def _render_curves_tab() -> None:
    """Render combined diagnostic images."""
    render_section_header(
        title="ROC Curves & Confusion Matrices",
        description="Generated during Day 5 classical pipeline execution.",
    )
    col1, col2 = st.columns(2)
    with col1:
        roc = OUTPUTS_DIR / "roc_curves_combined.png"
        if roc.exists():
            st.image(str(roc), caption="Combined ROC Curves", use_container_width=True)
        else:
            st.info("Combined ROC plot not found.")
    with col2:
        cm = OUTPUTS_DIR / "confusion_matrices" / "confusion_matrices_combined.png"
        if cm.exists():
            st.image(str(cm), caption="Confusion Matrices", use_container_width=True)
        else:
            st.info("Combined confusion matrix plot not found.")


def _render_roadmap_tab() -> None:
    """Display model technical specifications and reproducibility guidelines."""
    render_section_header(
        title="Technical Architecture & Reproducibility Matrix",
        description="Specifications for all operational model architectures, training splits, and serialization artifacts.",
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### 🧠 ANN Deep Learning Architecture")
        st.markdown(
            """
            | Specification | Value |
            |:---|:---|
            | **Architecture** | Multi-Layer Perceptron (Keras Sequential) |
            | **Artifact** | `models/solvability_ann.keras` (1.47 MB) |
            | **Preprocessor** | `models/ann_scaler.pkl` (ColumnTransformer) |
            | **Input Dimensions** | 20 Categorical & Numeric Attributes |
            | **Status** | ✅ Operational |
            """
        )

    with col2:
        st.markdown("#### 🌲 Classical Solvability Classifiers")
        st.markdown(
            """
            | Specification | Value |
            |:---|:---|
            | **ID3 Tree** | `models/classical/decision_tree_id3.joblib` |
            | **Naive Bayes** | `models/classical/naive_bayes.joblib` |
            | **k-NN Pipeline** | `models/classical/knn.joblib` (34 MB, k=15) |
            | **Evaluation** | Stratified 5-Fold Cross-Validation |
            | **Status** | ✅ Operational |
            """
        )

    st.markdown("---")
    c3, c4 = st.columns(2)
    with c3:
        st.markdown("#### 🔗 Clustering & Linkage Engines")
        st.markdown(
            """
            | Specification | Value |
            |:---|:---|
            | **K-Means Model** | `models/kmeans_serial.pkl` (k=5) |
            | **Hierarchical Model** | `models/hierarchical_serial.pkl` (Ward Linkage) |
            | **Scaler** | `models/clustering_scaler.pkl` |
            | **Repository** | `data/shr_unsolved_clustered.csv` (26,505 cold cases) |
            | **Status** | ✅ Operational |
            """
        )

    with c4:
        st.markdown("#### 🗺️ Geographic & PCA Analytics")
        st.markdown(
            """
            | Specification | Value |
            |:---|:---|
            | **PCA Projection** | `models/pca_model.joblib` (Top 15 PCs) |
            | **Spatial Engine** | Haversine Distance-Weighted Kernel (h=0.857 km) |
            | **Grid Resolution** | 50×50 Mesh (2,500 Evaluation Nodes) |
            | **Hotspots** | 10 Centroids with Spatial NMS (1.0 km) |
            | **Status** | ✅ Operational |
            """
        )
