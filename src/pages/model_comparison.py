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
        title="Model Integration Registry (Day 7)",
        description="Real-time availability check of all model artifacts in the models/ directory.",
    )

    registry = get_model_registry()
    rows = []
    for key, info in registry.items():
        rows.append({
            "Model": info["name"],
            "Owner": info["owner"],
            "Task": info["task"],
            "Status": "✅ Loaded" if info["available"] else "❌ Unavailable",
            "Reason / Note": info.get("reason", ""),
        })

    df_reg = pd.DataFrame(rows)
    # Style available vs unavailable
    def highlight_status(row):
        if "✅" in row["Status"]:
            return ["background-color: #f0fdf4"] * len(row)
        else:
            return ["background-color: #fef2f2"] * len(row)

    st.dataframe(
        df_reg.style.apply(highlight_status, axis=1),
        use_container_width=True,
        hide_index=True,
    )

    loaded = sum(1 for v in registry.values() if v["available"])
    total = len(registry)
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Models Loaded", f"{loaded}/{total}")
    with col2:
        st.metric("Person B Models", f"{sum(1 for v in registry.values() if v['available'] and v['owner']=='Person B')}")
    with col3:
        st.metric("Person A Models Active", f"{sum(1 for v in registry.values() if v['available'] and v['owner']=='Person A')}")


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
    """Display dependency requirements and upcoming model roadmap."""
    render_section_header(
        title="Person A Models — Activation Requirements",
        description="Model artifacts are present on disk. Runtime dependencies prevent loading.",
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### 🧠 ANN — Artificial Neural Network")
        st.markdown(
            """
            | Item | Status |
            |:---|:---|
            | **Artifact file** | `models/solvability_ann.keras` (1.47 MB) ✅ |
            | **ANN Scaler** | `models/ann_scaler.pkl` — sklearn version mismatch ⚠️ |
            | **Runtime** | TensorFlow / Keras — NOT installed ❌ |
            | **Activation** | `pip install tensorflow` |
            """
        )

    with col2:
        st.markdown("#### 🕸️ BBN — Bayesian Belief Network")
        st.markdown(
            """
            | Item | Status |
            |:---|:---|
            | **Artifact file** | `models/bbn_profile.pkl` (1.96 KB) ✅ |
            | **Runtime** | pgmpy — NOT installed ❌ |
            | **Activation** | `pip install pgmpy` |
            """
        )

    render_alert(
        "Installing the required libraries will enable ANN and BBN inference without any code changes. "
        "The model service will automatically detect and load them on the next app restart.",
        "info",
    )
