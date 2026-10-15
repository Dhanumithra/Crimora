"""src/pages/case_solvability.py - Case Solvability & Outcome Prediction.

Unified Solvability Engine:
Integrates Deep Learning ANN (Keras MLP) and Classical ML Pipelines
(ID3 Decision Tree, Naive Bayes, k-NN) with multi-model consensus,
real-time scoring, actionable investigative triage, and comprehensive diagnostics.
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
    render_metric_card,
)
from src.services.data_service import (
    get_classical_model_metrics,
    get_classification_reports,
    load_homicide_data,
)
from src.services.model_service import (
    predict_case_solvability,
    load_trained_classical_models,
    load_ann_bundle,
    get_model_registry,
    MODEL_DISPLAY_NAMES,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "classical"

MODEL_OPTIONS = [
    ("ann", "Deep Learning ANN (Multi-Layer Perceptron)"),
    ("decision_tree_id3", "ID3 Decision Tree (Entropy Criterion)"),
    ("naive_bayes", "Naive Bayes (GaussianNB)"),
    ("knn", "k-NN (k=15, Scaled Euclidean)"),
    ("ensemble", "⚡ Cross-Model Consensus (All 4 Engines)"),
]

WEAPONS_LIST = [
    "Handgun - pistol, revolver, etc",
    "Knife or cutting instrument",
    "Firearm, type not stated",
    "Personal weapons",
    "Blunt object",
    "Shotgun",
    "Rifle",
    "Strangulation",
    "Fire",
    "Unknown",
]

RELATIONSHIPS_LIST = [
    "Acquaintance",
    "Stranger",
    "Wife",
    "Husband",
    "Girlfriend",
    "Boyfriend",
    "Friend",
    "Neighbor",
    "Son",
    "Daughter",
    "In-law",
    "Unknown",
]

CIRCUMSTANCES_LIST = [
    "Robbery",
    "Other arguments",
    "Argument over money/property",
    "Brawl due to alcohol",
    "Lover triangle",
    "Narcotic drug laws",
    "Gangland killings",
    "Institutional",
    "Undetermined",
    "Unknown",
]


def render_case_solvability_page() -> None:
    """Render the Case Solvability & Clearance Prediction module."""
    render_page_header(
        title="Case Solvability & Clearance Prediction",
        subtitle="Multi-model real-time scoring powered by Deep Learning ANN and Classical ML Pipelines.",
        icon="⚖️",
        badge_text="Core Solvability Engine",
        badge_type="active",
    )

    # ── Model Status Banner ──────────────────────────────────────────────────
    classical = load_trained_classical_models()
    ann_bundle = load_ann_bundle()

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.success("✅ ID3 Decision Tree — Active")
    with c2:
        st.success("✅ Naive Bayes — Active")
    with c3:
        st.success("✅ k-NN (k=15) — Active")
    with c4:
        if ann_bundle["available"]:
            st.success("✅ Deep Learning ANN — Active")
        else:
            st.warning("⚠️ ANN — Fallback Mode")

    st.markdown("---")

    tab1, tab2, tab3, tab4 = st.tabs([
        "🎯 Live Case Solvability Scoring",
        "📊 Model Diagnostic Benchmarks",
        "📈 ROC & Confusion Matrices",
        "💡 Investigative Action Guide",
    ])

    with tab1:
        _render_live_scoring_tab(classical, ann_bundle)
    with tab2:
        _render_metrics_tab()
    with tab3:
        _render_visualizations_tab()
    with tab4:
        _render_guidance_tab()

    render_responsible_notice()


def _render_live_scoring_tab(classical: dict, ann_bundle: dict) -> None:
    """Interactive case input form and real-time inference section."""
    render_section_header(
        title="Incident Parameters & Evidence Input",
        description="Enter observed case attributes to compute real-time clearance probability and tactical triage priority.",
    )

    df = load_homicide_data()
    cities = sorted(df["city"].dropna().unique().tolist()) if not df.empty and "city" in df.columns else ["Los Angeles", "Chicago", "Baltimore", "Houston", "Philadelphia"]
    states = sorted(df["state"].dropna().unique().tolist()) if not df.empty and "state" in df.columns else ["California", "Illinois", "Maryland", "Texas", "Pennsylvania"]
    races = ["Black", "White", "Hispanic", "Asian", "American Indian", "Unknown"]
    sexes = ["Male", "Female", "Unknown"]

    # Model selector
    col_model, col_mode_info = st.columns([0.6, 0.4])
    with col_model:
        selected_model = st.selectbox(
            "Select Prediction Engine:",
            options=[k for k, _ in MODEL_OPTIONS],
            format_func=lambda k: dict(MODEL_OPTIONS).get(k, k),
            index=0,
        )
    with col_mode_info:
        if selected_model == "ensemble":
            st.info("⚡ **Consensus Mode:** Queries ANN, Decision Tree, Naive Bayes, and k-NN simultaneously and displays comparative confidence spreads.")
        elif selected_model == "ann":
            st.info("🧠 **ANN Mode:** Multi-layer Perceptron Neural Network trained on multi-attribute incident encodings.")
        else:
            st.info(f"📊 **Classical ML Mode:** Trained with 5-fold cross-validation and strict leakage isolation.")

    st.markdown("---")

    with st.form("solvability_case_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown("##### 👤 Victim Demographics")
            victim_age = st.slider("Victim Age", min_value=0, max_value=100, value=28)
            victim_sex = st.selectbox("Victim Sex", options=sexes, index=0)
            victim_race = st.selectbox("Victim Race / Demographics", options=races, index=0)
            vic_count = st.number_input("Additional Victims Count", min_value=0, max_value=10, value=0)

        with col2:
            st.markdown("##### 📍 Incident Context")
            state = st.selectbox("State / Region", options=states, index=0)
            city = st.selectbox("City / Jurisdiction", options=cities, index=0)
            weapon = st.selectbox("Weapon Observed", options=WEAPONS_LIST, index=0)
            circumstance = st.selectbox("Crime Circumstance", options=CIRCUMSTANCES_LIST, index=0)

        with col3:
            st.markdown("##### ⏱️ Temporal & Relationship")
            relationship = st.selectbox("Known Relationship to Victim", options=RELATIONSHIPS_LIST, index=0)
            reported_year = st.number_input("Incident Year", min_value=1980, max_value=2026, value=2022, step=1)
            reported_month = st.slider("Incident Month", min_value=1, max_value=12, value=7)
            is_weekend = st.radio("Occurred on Weekend?", options=[0, 1], format_func=lambda x: "Yes" if x == 1 else "No", horizontal=True)
            day_of_week = st.selectbox("Day of Week", options=list(range(7)), format_func=lambda x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][x], index=4)

        submit_btn = st.form_submit_button("🔍 Compute Solvability Score", type="primary", use_container_width=True)

    if submit_btn:
        feature_dict = {
            "victim_age": float(victim_age),
            "victim_age_clean": float(victim_age),
            "victim_sex": str(victim_sex),
            "victim_race": str(victim_race),
            "victim_count": int(vic_count),
            "city": str(city),
            "state": str(state),
            "weapon": str(weapon),
            "circumstance": str(circumstance),
            "relationship": str(relationship),
            "reported_year": int(reported_year),
            "year": int(reported_year),
            "reported_month": int(reported_month),
            "reported_is_weekend": int(is_weekend),
            "reported_day_of_week": int(day_of_week),
            "lat": np.nan,
            "lon": np.nan,
        }

        st.markdown("---")
        st.subheader("🎯 Solvability Assessment & Investigative Triage")

        if selected_model == "ensemble":
            _render_ensemble_results(feature_dict)
        else:
            _render_single_model_results(selected_model, feature_dict)


def _render_single_model_results(model_key: str, feature_dict: dict) -> None:
    """Render prediction for an individual model."""
    with st.spinner(f"Running inference with {MODEL_DISPLAY_NAMES.get(model_key, model_key)}..."):
        res = predict_case_solvability(model_key, feature_dict)

    if res.get("status") == "error":
        render_alert(f"Inference error: {res.get('error', 'Unknown error')}", "error")
        return

    prob = res["probability"]
    score_pct = round(prob * 100, 1)
    model_name = res["model_name"]

    c1, c2, c3 = st.columns([0.35, 0.35, 0.30])
    with c1:
        render_model_score_badge(
            prediction=res["prediction"],
            probability=prob,
            model_name=model_name,
        )

    with c2:
        if score_pct >= 75.0:
            st.markdown(f"""
            <div style='background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #16a34a; border-radius:8px; padding:1.2rem; height:100%;'>
                <h4 style='color:#15803d; margin-top:0;'>🟢 High Solvability Potential ({score_pct}%)</h4>
                <p style='color:#166534; font-size:0.875rem; margin-bottom:0;'>
                    Attributes exhibit strong clearance indicators (identifiable relationship, physical evidence proximity, or standard weapon signatures).
                </p>
            </div>
            """, unsafe_allow_html=True)
        elif score_pct >= 45.0:
            st.markdown(f"""
            <div style='background:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; border-radius:8px; padding:1.2rem; height:100%;'>
                <h4 style='color:#b45309; margin-top:0;'>🟡 Moderate Solvability ({score_pct}%)</h4>
                <p style='color:#92400e; font-size:0.875rem; margin-bottom:0;'>
                    Clearance hinges on timely investigative breakthroughs. Re-interview witnesses and canvass local electronic surveillance.
                </p>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div style='background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:8px; padding:1.2rem; height:100%;'>
                <h4 style='color:#b91c1c; margin-top:0;'>🔴 Low Solvability / Cold-Case Risk ({score_pct}%)</h4>
                <p style='color:#991b1b; font-size:0.875rem; margin-bottom:0;'>
                    Case features match historical low-clearance patterns (stranger violence, firearm without immediate leads). Deploy specialized linkage protocols.
                </p>
            </div>
            """, unsafe_allow_html=True)

    with c3:
        st.markdown(f"""
        <div class='crimora-card' style='height:100%;'>
            <div style='font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;'>Recommended Priority</div>
            <div style='font-size:1.4rem; font-weight:800; color:#0f172a; margin:0.4rem 0;'>
                {'Priority Level 1' if score_pct >= 75 else ('Priority Level 2' if score_pct >= 45 else 'Cold-Case Queue')}
            </div>
            <div style='font-size:0.8rem; color:#475569;'>
                Target window: { '0–48 Hours' if score_pct >= 75 else ('48–120 Hours' if score_pct >= 45 else 'Extended Forensic Linkage') }
            </div>
        </div>
        """, unsafe_allow_html=True)


def _render_ensemble_results(feature_dict: dict) -> None:
    """Render consensus across all 4 ML engines."""
    engines = ["ann", "decision_tree_id3", "naive_bayes", "knn"]
    results = []

    with st.spinner("Executing consensus query across all 4 machine learning pipelines..."):
        for eng in engines:
            r = predict_case_solvability(eng, feature_dict)
            if r.get("status") == "success":
                results.append(r)

    if not results:
        render_alert("All model engines returned errors.", "error")
        return

    probs = [r["probability"] for r in results]
    avg_prob = float(np.mean(probs))
    avg_score = round(avg_prob * 100, 1)

    col_gauge, col_verdict, col_spread = st.columns([0.35, 0.35, 0.30])
    with col_gauge:
        render_model_score_badge(
            prediction=1 if avg_prob >= 0.5 else 0,
            probability=avg_prob,
            model_name="Cross-Model Consensus",
        )

    with col_verdict:
        status_color = "#16a34a" if avg_score >= 75 else ("#d97706" if avg_score >= 45 else "#dc2626")
        tier_label = "HIGH SOLVABILITY" if avg_score >= 75 else ("MODERATE SOLVABILITY" if avg_score >= 45 else "LOW SOLVABILITY")
        st.markdown(f"""
        <div style='background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid {status_color}; border-radius:8px; padding:1.2rem; height:100%;'>
            <div style='font-size:0.75rem; font-weight:700; color:{status_color}; text-transform:uppercase;'>Consensus Tier</div>
            <div style='font-size:1.35rem; font-weight:800; color:#0f172a; margin:0.3rem 0;'>{tier_label}</div>
            <p style='font-size:0.85rem; color:#475569; margin:0;'>
                Average clearance probability: <b>{avg_score}%</b> across {len(results)} independent machine learning models.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with col_spread:
        min_p = round(min(probs) * 100, 1)
        max_p = round(max(probs) * 100, 1)
        st.markdown(f"""
        <div class='crimora-card' style='height:100%;'>
            <div style='font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase;'>Model Agreement Spread</div>
            <div style='font-size:1.25rem; font-weight:800; color:#1e293b; margin:0.3rem 0;'>{min_p}% &ndash; {max_p}%</div>
            <div style='font-size:0.8rem; color:#64748b;'>Variance: &plusmn;{round(float(np.std(probs))*100, 1)}%</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("#### Model-by-Model Confidence Breakdown")
    comparison_rows = []
    chart_data = {}
    for r in results:
        m_prob = round(r["probability"] * 100, 1)
        comparison_rows.append({
            "Engine": r["model_name"],
            "Probability (%)": f"{m_prob}%",
            "Predicted Outcome": "Solved (Closed)" if r["prediction"] == 1 else "Unsolved (Open)",
            "Confidence Level": "Very High" if m_prob >= 80 else ("High" if m_prob >= 65 else ("Moderate" if m_prob >= 45 else "Low")),
        })
        chart_data[r["model_name"]] = m_prob

    col_tbl, col_chart = st.columns([0.55, 0.45])
    with col_tbl:
        st.dataframe(pd.DataFrame(comparison_rows), use_container_width=True, hide_index=True)
    with col_chart:
        df_chart = pd.DataFrame(list(chart_data.items()), columns=["Model", "Clearance Probability (%)"]).set_index("Model")
        st.bar_chart(df_chart, use_container_width=True)


def _render_metrics_tab() -> None:
    """Render performance tables from evaluation pipelines."""
    render_section_header(
        title="Cross-Validated Performance Benchmarks",
        description="Stratified holdout test (20%) and 5-fold cross-validation metrics across all solvability models.",
    )
    metrics_df = get_classical_model_metrics()
    if not metrics_df.empty:
        st.dataframe(metrics_df, use_container_width=True, hide_index=True)
    else:
        st.info("Performance benchmarks table is being indexed.")

    reports_df = get_classification_reports()
    if not reports_df.empty:
        st.markdown("#### Per-Class Diagnostic Classification Reports")
        st.dataframe(reports_df, use_container_width=True)


def _render_visualizations_tab() -> None:
    """Render saved confusion matrices and ROC curves."""
    render_section_header(
        title="Diagnostic Curves & Confusion Matrices",
        description="Empirical evaluation artifacts generated during multi-model training.",
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


def _render_guidance_tab() -> None:
    """Render actionable investigative guidelines for clearance optimization."""
    render_section_header(
        title="Tactical Clearance Optimization Checklist",
        description="Actionable investigative recommendations to maximize the probability of case clearance.",
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("""
        <div class='crimora-card'>
            <h5 style='color:#1e293b;margin-top:0;'>Golden 48-Hour Protocol</h5>
            <ul style='font-size:0.875rem; color:#475569; padding-left:1.25rem; line-height:1.7;'>
                <li><b>Witness Canvassing:</b> Re-interview first responders and immediate 911 callers within 6 hours.</li>
                <li><b>Electronic Geofencing:</b> Secure tower dumps and automated license plate reader (ALPR) logs.</li>
                <li><b>Ballistics Rapid Turnaround:</b> Cross-match cartridge casings in NIBIN within 24 hours.</li>
                <li><b>Digital Footprint:</b> Preserve social media messaging and GPS coordinates of known associates.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class='crimora-card'>
            <h5 style='color:#1e293b;margin-top:0;'>Cold-Case Transition Protocol</h5>
            <ul style='font-size:0.875rem; color:#475569; padding-left:1.25rem; line-height:1.7;'>
                <li><b>Secondary Evidence Audit:</b> Re-examine unspent ammunition and latent touch DNA.</li>
                <li><b>Linkage Clustering:</b> Query Crimora Crime Linkage module for matching M.O. patterns.</li>
                <li><b>Geographic Profiling:</b> Compute spatial activity anchors using the LWR Kernel module.</li>
                <li><b>Familial Genetic Genealogy:</b> Screen unidentified biological samples through state databases.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
