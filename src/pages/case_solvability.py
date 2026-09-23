"""src/pages/case_solvability.py - Case Solvability & Outcome Prediction.

Integrates Day 5 Classical ML models (ID3 Decision Tree, Naive Bayes, k-NN)
for real-time case solvability scoring, confidence evaluation, and diagnostic audit.
"""

from __future__ import annotations

import os
from pathlib import Path
import streamlit as st
import pandas as pd

from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_model_score_badge,
)
from src.services.data_service import (
    get_classical_model_metrics,
    get_classification_reports,
    load_homicide_data,
)
from src.services.model_service import (
    predict_case_solvability,
    list_available_models,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "classical"


def render_case_solvability_page() -> None:
    """Render the Case Solvability module interface."""
    render_page_header(
        title="Case Solvability & Outcome Estimation",
        subtitle="Real-time case scoring using Day 5 trained Classical Machine Learning pipelines.",
        badge_text="Module 05",
        badge_color="green",
    )

    tab1, tab2, tab3 = st.tabs([
        "Live Case Scoring & Inference",
        "Model Diagnostic Metrics",
        "Diagnostic Visualizations",
    ])

    with tab1:
        _render_live_scoring_tab()

    with tab2:
        _render_metrics_tab()

    with tab3:
        _render_visualizations_tab()

    render_responsible_notice()


def _render_live_scoring_tab() -> None:
    """Render the interactive case input form and real-time inference section."""
    render_section_header(
        title="Interactive Case Scoring Form",
        description="Enter observed case attributes to compute clearance probability using pre-trained pipelines without target leakage.",
    )

    # Load homicide data for realistic dropdown values
    df = load_homicide_data()
    
    cities = sorted(df["city"].dropna().unique().tolist()) if not df.empty and "city" in df.columns else ["Los Angeles", "Chicago", "Houston", "Philadelphia"]
    states = sorted(df["state"].dropna().unique().tolist()) if not df.empty and "state" in df.columns else ["CA", "IL", "TX", "PA"]
    races = sorted(df["victim_race"].dropna().unique().tolist()) if not df.empty and "victim_race" in df.columns else ["Black", "White", "Hispanic", "Asian", "Unknown"]
    sexes = ["Male", "Female", "Unknown"]

    col_model, col_empty = st.columns([1, 1])
    with col_model:
        model_choice = st.selectbox(
            "Select Evaluation Pipeline",
            options=[
                ("decision_tree_id3", "ID3-Style Decision Tree (Entropy Criterion)"),
                ("naive_bayes", "Multinomial / Gaussian Naive Bayes Pipeline"),
                ("knn", "k-Nearest Neighbors (Standardized Features)"),
            ],
            format_func=lambda x: x[1],
            index=0,
            help="Choose which Day 5 model to evaluate this incident against.",
        )[0]

    st.markdown("---")

    with st.form("case_scoring_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown("##### Victim Demographics")
            victim_age = st.slider("Victim Age", min_value=0, max_value=100, value=28)
            victim_sex = st.selectbox("Victim Sex", options=sexes, index=0)
            victim_race = st.selectbox("Victim Race / Demographics", options=races, index=0)

        with col2:
            st.markdown("##### Incident Location")
            city = st.selectbox("Incident City", options=cities, index=0)
            state = st.selectbox("State Code", options=states, index=0)
            is_weekend = st.radio("Occurred on Weekend?", options=[0, 1], format_func=lambda x: "Yes" if x == 1 else "No", horizontal=True)

        with col3:
            st.markdown("##### Temporal Context")
            reported_year = st.number_input("Reported Year", min_value=2000, max_value=2026, value=2015, step=1)
            reported_month = st.slider("Reported Month", min_value=1, max_value=12, value=6)
            reported_day_of_week = st.selectbox(
                "Day of Week",
                options=[0, 1, 2, 3, 4, 5, 6],
                format_func=lambda x: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][x],
                index=3,
            )

        submit_btn = st.form_submit_button("Compute Solvability Score", type="primary", use_container_width=True)

    if submit_btn:
        feature_dict = {
            "victim_age_clean": float(victim_age),
            "victim_sex": str(victim_sex),
            "victim_race": str(victim_race),
            "city": str(city),
            "state": str(state),
            "reported_year": int(reported_year),
            "reported_month": int(reported_month),
            "reported_is_weekend": int(is_weekend),
            "reported_day_of_week": int(reported_day_of_week),
        }

        with st.spinner("Executing pipeline inference..."):
            result = predict_case_solvability(model_choice, feature_dict)

        if "error" in result:
            render_alert(f"Scoring error: {result['error']}", alert_type="error")
        else:
            st.markdown("### Inference Result")
            res_col1, res_col2 = st.columns([1, 1])

            with res_col1:
                render_model_score_badge(
                    prediction=result["prediction"],
                    probability=result["probability"],
                    model_name=result["model_name"],
                )

            with res_col2:
                st.markdown("#### Input Feature Vector")
                feature_df = pd.DataFrame(
                    [{"Feature": k, "Assigned Value": str(v)} for k, v in feature_dict.items()]
                )
                st.dataframe(feature_df, use_container_width=True, hide_index=True)


def _render_metrics_tab() -> None:
    """Render performance comparison tables from Day 5."""
    render_section_header(
        title="Day 5 Classical Model Benchmarks",
        description="Empirical performance metrics evaluated on stratified holdout test split (20%) and 5-fold cross-validation.",
    )

    metrics_df = get_classical_model_metrics()
    if not metrics_df.empty:
        st.markdown("#### Holdout Test & Cross-Validation Metrics")
        st.dataframe(metrics_df, use_container_width=True)
    else:
        st.warning("Holdout metrics file outputs/classical/model_metrics.csv not found.")

    reports_df = get_classification_reports()
    if not reports_df.empty:
        st.markdown("#### Per-Class Detailed Classification Reports")
        st.dataframe(reports_df, use_container_width=True)


def _render_visualizations_tab() -> None:
    """Render saved confusion matrices and ROC curves."""
    render_section_header(
        title="Diagnostic Curves & Confusion Matrices",
        description="Visual evaluation artifacts generated during Day 5 model training.",
    )

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### Combined ROC Curves")
        roc_path = OUTPUTS_DIR / "roc_curves_combined.png"
        if roc_path.exists():
            st.image(str(roc_path), caption="Multi-Model ROC Curve Comparison", use_container_width=True)
        else:
            st.info("Combined ROC plot not found.")

    with col2:
        st.markdown("#### Combined Confusion Matrices")
        cm_path = OUTPUTS_DIR / "confusion_matrices_combined.png"
        if cm_path.exists():
            st.image(str(cm_path), caption="Normalized Confusion Matrices", use_container_width=True)
        else:
            st.info("Combined Confusion Matrix plot not found.")

    st.markdown("---")
    st.markdown("#### Individual Model Performance Plots")

    model_keys = ["decision_tree_id3", "naive_bayes", "knn"]
    model_labels = ["ID3 Decision Tree", "Naive Bayes", "k-Nearest Neighbors"]

    sel_model = st.selectbox("Select Model for Detailed Inspection", options=list(zip(model_keys, model_labels)), format_func=lambda x: x[1])
    sel_key = sel_model[0]

    img_col1, img_col2 = st.columns(2)
    with img_col1:
        roc_single = OUTPUTS_DIR / "roc_curves" / f"{sel_key}_roc.png"
        if roc_single.exists():
            st.image(str(roc_single), caption=f"{sel_model[1]} - ROC Curve", use_container_width=True)
        else:
            st.info(f"ROC curve for {sel_key} not found.")

    with img_col2:
        cm_single = OUTPUTS_DIR / "confusion_matrices" / f"{sel_key}_cm.png"
        if cm_single.exists():
            st.image(str(cm_single), caption=f"{sel_model[1]} - Confusion Matrix", use_container_width=True)
        else:
            st.info(f"Confusion matrix for {sel_key} not found.")
