"""src/pages/case_solvability.py - Case Solvability & Outcome Prediction.

Day 7 Enhancement: Integrates classical ML models (ID3, Naive Bayes, k-NN)
for real-time case scoring. ANN is documented as unavailable (TF not installed).
All models use the shared preprocessing pipeline — never retrained here.
"""

from __future__ import annotations

from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np

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
    load_trained_classical_models,
    get_model_registry,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "classical"

# Canonical model options (classical only — ANN not available)
MODEL_OPTIONS = [
    ("decision_tree_id3", "ID3 Decision Tree (Entropy Criterion)"),
    ("naive_bayes", "Naive Bayes (GaussianNB)"),
    ("knn", "k-NN (k=15, Scaled Euclidean)"),
]


def render_case_solvability_page() -> None:
    """Render the Case Solvability module interface."""
    render_page_header(
        title="Case Solvability & Outcome Estimation",
        subtitle="Real-time solvability scoring using Day 5 Classical ML Pipelines (ID3, Naive Bayes, k-NN).",
        icon="⚖️",
        badge_text="Module 05",
        badge_type="active",
    )

    # ── Model availability summary ────────────────────────────────────────────
    registry = get_model_registry()
    classical = load_trained_classical_models()
    status_cols = st.columns(4)
    icons = {True: "✅", False: "❌"}
    model_keys_display = [
        ("decision_tree_id3", "ID3 Tree"),
        ("naive_bayes", "Naive Bayes"),
        ("knn", "k-NN"),
        ("ann", "ANN"),
    ]
    for i, (key, label) in enumerate(model_keys_display):
        avail = registry.get(key, {}).get("available", False)
        reason = registry.get(key, {}).get("reason", "")
        with status_cols[i]:
            if avail:
                st.success(f"{icons[avail]} {label}")
            else:
                st.error(f"{icons[avail]} {label}")
                if reason:
                    st.caption(reason)

    st.markdown("---")

    tab1, tab2, tab3 = st.tabs([
        "Live Case Scoring",
        "Model Diagnostic Metrics",
        "Diagnostic Visualizations",
    ])

    with tab1:
        _render_live_scoring_tab(classical)
    with tab2:
        _render_metrics_tab()
    with tab3:
        _render_visualizations_tab()

    render_responsible_notice()


def _render_live_scoring_tab(classical: dict) -> None:
    """Interactive case input form and real-time inference section."""
    render_section_header(
        title="Interactive Case Scoring Form",
        description=(
            "Enter observed case attributes to compute clearance probability. "
            "Preprocessing pipelines apply feature imputation and encoding without target leakage."
        ),
    )

    df = load_homicide_data()
    cities = sorted(df["city"].dropna().unique().tolist()) if not df.empty and "city" in df.columns else ["Los Angeles", "Chicago"]
    states = sorted(df["state"].dropna().unique().tolist()) if not df.empty and "state" in df.columns else ["CA", "IL"]
    races = sorted(df["victim_race"].dropna().unique().tolist()) if not df.empty and "victim_race" in df.columns else ["Black", "White"]
    sexes = ["Male", "Female", "Unknown"]

    # Only offer loaded models
    available_options = [(k, lbl) for k, lbl in MODEL_OPTIONS if k in classical]
    if not available_options:
        render_alert("No solvability models are currently loaded. Check models/classical/ directory.", "error")
        return

    col_model, _ = st.columns([1, 1])
    with col_model:
        model_choice = st.selectbox(
            "Select Model Pipeline",
            options=available_options,
            format_func=lambda x: x[1],
        )[0]

    st.markdown("---")

    with st.form("case_scoring_form"):
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown("##### Victim Demographics")
            victim_age = st.slider("Victim Age", min_value=0, max_value=100, value=28)
            victim_sex = st.selectbox("Victim Sex", options=sexes)
            victim_race = st.selectbox("Victim Race / Demographics", options=races)
        with col2:
            st.markdown("##### Incident Location")
            city = st.selectbox("Incident City", options=cities)
            state = st.selectbox("State Code", options=states)
            is_weekend = st.radio(
                "Occurred on Weekend?", options=[0, 1],
                format_func=lambda x: "Yes" if x == 1 else "No", horizontal=True,
            )
        with col3:
            st.markdown("##### Temporal Context")
            reported_year = st.number_input("Reported Year", min_value=2000, max_value=2026, value=2015, step=1)
            reported_month = st.slider("Reported Month", min_value=1, max_value=12, value=6)
            reported_day_of_week = st.selectbox(
                "Day of Week",
                options=list(range(7)),
                format_func=lambda x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][x],
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
            "lat": np.nan,
            "lon": np.nan,
        }
        with st.spinner("Running inference pipeline..."):
            result = predict_case_solvability(model_choice, feature_dict)

        if "error" in result and result.get("status") == "error":
            render_alert(f"Scoring error: {result['error']}", "error")
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
                st.dataframe(
                    pd.DataFrame([{"Feature": k, "Value": str(v)} for k, v in feature_dict.items() if k not in ("lat", "lon")]),
                    use_container_width=True, hide_index=True,
                )


def _render_metrics_tab() -> None:
    """Render performance tables from Day 5 evaluation."""
    render_section_header(
        title="Day 5 Classical Model Benchmarks",
        description="Stratified holdout test (20%) and 5-fold cross-validation metrics.",
    )
    metrics_df = get_classical_model_metrics()
    if not metrics_df.empty:
        st.dataframe(metrics_df, use_container_width=True)
    else:
        st.warning("outputs/classical/model_metrics.csv not found.")

    reports_df = get_classification_reports()
    if not reports_df.empty:
        st.markdown("#### Per-Class Classification Reports")
        st.dataframe(reports_df, use_container_width=True)


def _render_visualizations_tab() -> None:
    """Render saved confusion matrices and ROC curves."""
    render_section_header(
        title="Diagnostic Curves & Confusion Matrices",
        description="Artifacts generated during Day 5 pipeline execution.",
    )
    col1, col2 = st.columns(2)
    with col1:
        roc_path = OUTPUTS_DIR / "roc_curves_combined.png"
        if roc_path.exists():
            st.image(str(roc_path), caption="Multi-Model ROC Curve Comparison", use_container_width=True)
        else:
            st.info("Combined ROC plot not found.")
    with col2:
        cm_path = OUTPUTS_DIR / "confusion_matrices" / "confusion_matrices_combined.png"
        if cm_path.exists():
            st.image(str(cm_path), caption="Normalized Confusion Matrices", use_container_width=True)
        else:
            st.info("Combined Confusion Matrix plot not found.")

    st.markdown("---")
    st.markdown("#### Individual Model Performance")
    model_label_map = {
        "id3_decision_tree": ("decision_tree_id3", "ID3 Decision Tree"),
        "naive_bayes": ("naive_bayes", "Naive Bayes"),
        "knn": ("knn", "k-NN"),
    }
    sel = st.selectbox(
        "Select Model",
        options=list(model_label_map.keys()),
        format_func=lambda x: model_label_map[x][1],
    )
    file_key, label = model_label_map[sel]
    img_col1, img_col2 = st.columns(2)
    with img_col1:
        cm_single = OUTPUTS_DIR / "confusion_matrices" / f"{file_key}_confusion_matrix.png"
        if cm_single.exists():
            st.image(str(cm_single), caption=f"{label} — Confusion Matrix", use_container_width=True)
        else:
            st.info(f"Confusion matrix for {label} not found.")
    with img_col2:
        st.info("Individual ROC curves not separately saved. See combined plot above.")
