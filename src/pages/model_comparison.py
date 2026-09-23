"""src/pages/model_comparison.py - Classical & Advanced Model Benchmarking.

Presents rigorous comparative evaluation of Day 5 Classical ML models
(Decision Tree, Naive Bayes, k-NN) alongside reserved slots for Person A advanced models.
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

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "classical"


def render_model_comparison_page() -> None:
    """Render the Model Comparison & Benchmarking page."""
    render_page_header(
        title="Comprehensive Model Benchmarking & Evaluation",
        subtitle="Empirical performance audit of classical machine learning models evaluated on stratified test split and 5-fold cross-validation.",
        badge_text="Module 07",
        badge_color="purple",
    )

    metrics_df = get_classical_model_metrics()
    reports_df = get_classification_reports()

    tab1, tab2, tab3, tab4 = st.tabs([
        "Benchmark Leaderboard",
        "Cross-Validation Stability",
        "Diagnostic Curves",
        "Roadmap: Advanced Models (Person A)",
    ])

    with tab1:
        _render_leaderboard_tab(metrics_df)

    with tab2:
        _render_cv_stability_tab(metrics_df)

    with tab3:
        _render_curves_tab()

    with tab4:
        _render_roadmap_tab()

    render_responsible_notice()


def _render_leaderboard_tab(metrics_df: pd.DataFrame) -> None:
    """Render test split leaderboard comparing models across accuracy, F1, and AUC."""
    render_section_header(
        title="Stratified Holdout Evaluation Leaderboard (20% Test Split)",
        description="Models trained without target leakage and evaluated on unseen cases. Resampling (SMOTE) applied strictly within training folds.",
    )

    if metrics_df.empty:
        st.warning("Model metrics file (outputs/classical/model_metrics.csv) not found.")
        return

    # Filter columns for holdout test
    test_cols = [c for c in metrics_df.columns if "test" in c or c in ["model", "model_name"]]
    if test_cols:
        st.dataframe(metrics_df[test_cols], use_container_width=True, hide_index=True)
    else:
        st.dataframe(metrics_df, use_container_width=True, hide_index=True)

    # Best performer highlight
    if "test_roc_auc" in metrics_df.columns:
        best_model_row = metrics_df.sort_values(by="test_roc_auc", ascending=False).iloc[0]
        st.markdown(
            f"""
            > **Top Performing Architecture:** **{best_model_row.get('model_name', best_model_row.get('model', 'N/A'))}** 
            > achieved highest discriminant power with **ROC-AUC: {best_model_row['test_roc_auc']:.4f}** 
            > and **Test F1-Score: {best_model_row.get('test_f1', 0.0):.4f}**.
            """
        )

    # Bar chart comparison of test metrics
    chart_cols = [c for c in ["test_accuracy", "test_precision", "test_recall", "test_f1", "test_roc_auc"] if c in metrics_df.columns]
    if chart_cols and "model_name" in metrics_df.columns:
        chart_data = metrics_df.set_index("model_name")[chart_cols]
        st.markdown("#### Multi-Metric Comparison")
        st.bar_chart(chart_data, use_container_width=True)


def _render_cv_stability_tab(metrics_df: pd.DataFrame) -> None:
    """Render 5-fold cross-validation stability analysis."""
    render_section_header(
        title="5-Fold Cross-Validation Stability Analysis",
        description="Assessing model variance and generalization consistency across stratified folds.",
    )

    if metrics_df.empty:
        st.warning("Model metrics data unavailable.")
        return

    cv_cols = [c for c in metrics_df.columns if "cv" in c or c in ["model", "model_name"]]
    if cv_cols:
        st.dataframe(metrics_df[cv_cols], use_container_width=True, hide_index=True)
    else:
        st.info("Cross-validation specific columns not found in metrics summary.")


def _render_curves_tab() -> None:
    """Render combined ROC curves and confusion matrix artifacts."""
    render_section_header(
        title="Comparative ROC Curves & Confusion Matrices",
        description="Diagnostic curves visual comparison across ID3 Decision Tree, Naive Bayes, and k-NN.",
    )

    col1, col2 = st.columns(2)
    with col1:
        roc_img = OUTPUTS_DIR / "roc_curves_combined.png"
        if roc_img.exists():
            st.image(str(roc_img), caption="Combined ROC Curves (Holdout Split)", use_container_width=True)
        else:
            st.info("Combined ROC plot not found.")

    with col2:
        cm_img = OUTPUTS_DIR / "confusion_matrices_combined.png"
        if cm_img.exists():
            st.image(str(cm_img), caption="Normalized Confusion Matrices Comparison", use_container_width=True)
        else:
            st.info("Combined Confusion Matrix plot not found.")


def _render_roadmap_tab() -> None:
    """Display upcoming advanced models roadmap (Person A)."""
    render_section_header(
        title="Person A Advanced Models Integration Roadmap",
        description="Reserved benchmarking slots for Person A deep learning and probabilistic models.",
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### Artificial Neural Network (ANN / MLP)")
        st.markdown(
            """
            * **Status:** Scheduled for Person A Day 5/7 integration
            * **Architecture:** Multi-Layer Perceptron (MLP) with Dropout and ReLU activations
            * **Loss Function:** Binary Cross-Entropy with class weight calibration
            * **Expected Role:** Capture non-linear feature interactions between temporal rhythms and spatial coordinates
            """
        )
        st.info("ANN benchmark results will be displayed once Person A completes model training.")

    with col2:
        st.markdown("#### Bayesian Belief Network (BBN)")
        st.markdown(
            """
            * **Status:** Scheduled for Person A Day 5/7 integration
            * **Inference Engine:** Exact variable elimination / Loopy belief propagation
            * **Structural Form:** Directed Acyclic Graph (DAG) over observable crime attributes
            * **Expected Role:** Transparent causal reasoning and probabilistic query answering under missing evidence
            """
        )
        st.info("BBN benchmark results will be displayed once Person A completes model training.")

    render_alert(
        "Benchmarking tables will dynamically incorporate ANN and BBN metrics upon completion without altering classical ML baseline benchmarks.",
        alert_type="info",
    )
