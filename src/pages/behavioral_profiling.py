"""src/pages/behavioral_profiling.py - Behavioral Profiling & Bayesian Inference.

Causal Behavioral & Suspect Demographic Profiling Engine:
Enables investigators to input observed crime scene evidence (weapon, circumstance, victim profile)
and infer probabilistic suspect demographics, offender-victim relationships, and M.O. signatures.
"""

from __future__ import annotations

import pandas as pd
import streamlit as st

from src.services.data_service import load_homicide_data
from src.services.model_service import predict_bbn_suspect_profile
from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_metric_card,
)


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

CIRCUMSTANCES_LIST = [
    "Robbery",
    "Other arguments",
    "Argument over money/property",
    "Lover triangle",
    "Brawl due to alcohol",
    "Narcotic drug laws",
    "Gangland killings",
    "Institutional",
    "Undetermined",
]


def render_behavioral_profiling_page() -> None:
    """Render the Behavioral Profiling & Suspect Inference interface."""
    render_page_header(
        title="Behavioral Profiling & Causal Modeling",
        subtitle="Probabilistic suspect demographic inference and Modus Operandi (M.O.) analysis.",
        icon="🧬",
        badge_text="Module 04",
        badge_type="active",
    )

    # ── Status banner ────────────────────────────────────────────────────────
    st.markdown("""
    <div style='background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:0.75rem 1.1rem;margin-bottom:1.25rem;font-size:0.875rem;color:#166534;'>
        <b>Bayesian Causal Inference Engine Active:</b> Inferred posterior marginals evaluate weapon lethality, interpersonal proximity, and victim vulnerability against historical behavioral priors.
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2, tab3, tab4 = st.tabs([
        "🎯 Suspect Demographic Profiler",
        "🕸️ Causal Directed Acyclic Graph (DAG)",
        "📊 Historical M.O. Distributions",
        "📋 Behavioral Interview Protocols",
    ])

    with tab1:
        _render_profiler_tab()
    with tab2:
        _render_dag_tab()
    with tab3:
        _render_historical_tab()
    with tab4:
        _render_interview_tab()

    render_responsible_notice()


def _render_profiler_tab() -> None:
    """Interactive suspect demographic and relationship inference form."""
    render_section_header(
        title="Crime Scene Evidence & Modus Operandi Form",
        description="Select known crime scene observations to generate a calibrated probabilistic suspect demographic profile.",
    )

    with st.form("bbn_profiling_form"):
        col1, col2 = st.columns(2)

        with col1:
            weapon = st.selectbox("Observed / Recovered Weapon", options=WEAPONS_LIST, index=0)
            circumstance = st.selectbox("Crime Scene Circumstance", options=CIRCUMSTANCES_LIST, index=0)

        with col2:
            vic_sex = st.selectbox("Victim Sex", options=["Male", "Female", "Unknown"], index=0)
            vic_age = st.slider("Victim Age Range", min_value=1, max_value=90, value=28)

        submit_btn = st.form_submit_button("🧬 Generate Inferred Suspect Profile", type="primary", use_container_width=True)

    if submit_btn:
        features = {
            "weapon": weapon,
            "circumstance": circumstance,
            "victim_sex": vic_sex,
            "victim_age": vic_age,
        }
        res = predict_bbn_suspect_profile(features)

        st.markdown("---")
        st.subheader("🎯 Inferred Suspect Demographic Profile")
        st.caption(f"Evaluated evidence: Weapon ({weapon}), Circumstance ({circumstance}), Victim ({vic_sex}, {vic_age} yrs).")

        top_traits = res["top_traits"]
        top_sex, conf_sex = top_traits["sex"]
        top_age, conf_age = top_traits["age_group"]
        top_rel, conf_rel = top_traits["relationship"]
        top_race, conf_race = top_traits["race"]

        # 1. Metric Cards with Confidence Progress Bars
        col_m1, col_m2, col_m3, col_m4 = st.columns(4)
        with col_m1:
            st.metric("Likely Offender Sex", top_sex, f"{conf_sex*100:.1f}% Conf.")
            st.progress(float(conf_sex))
        with col_m2:
            st.metric("Likely Age Group", top_age, f"{conf_age*100:.1f}% Conf.")
            st.progress(float(conf_age))
        with col_m3:
            st.metric("Likely Relationship", top_rel, f"{conf_rel*100:.1f}% Conf.")
            st.progress(float(conf_rel))
        with col_m4:
            st.metric("Likely Race / Ethnicity", top_race, f"{conf_race*100:.1f}% Conf.")
            st.progress(float(conf_race))

        st.markdown("<br>", unsafe_allow_html=True)

        # 2. Probability Distribution Charts
        st.subheader("Detailed Posterior Probability Distributions")
        c1, c2, c3 = st.columns(3)

        with c1:
            st.caption("Offender Sex Distribution")
            df_sex = pd.DataFrame(list(res["sex_distribution"].items()), columns=["Sex", "Probability"]).set_index("Sex")
            st.bar_chart(df_sex, height=280)

        with c2:
            st.caption("Offender Age Bracket Distribution")
            df_age = pd.DataFrame(list(res["age_distribution"].items()), columns=["Age Bracket", "Probability"]).set_index("Age Bracket")
            st.bar_chart(df_age, height=280)

        with c3:
            st.caption("Offender-Victim Relationship")
            df_rel = pd.DataFrame(list(res["relationship_distribution"].items()), columns=["Relationship", "Probability"]).set_index("Relationship")
            st.bar_chart(df_rel, height=280)

        # 3. Actionable Causal Deductions
        st.markdown("---")
        st.subheader("💡 Causal Deductions & Investigative Leads")
        for reason in res["reasoning"]:
            st.info(reason)


def _render_dag_tab() -> None:
    """Render the causal Bayesian Directed Acyclic Graph structure and evidence schema."""
    render_section_header(
        title="Probabilistic Causal Network (DAG) Schema",
        description="Structural relationships between observed physical evidence nodes and latent hypothesis nodes.",
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### Observed Evidence Nodes ($E$)")
        st.markdown(
            """
            | Node | Type | Possible States / Values |
            |:---|:---|:---|
            | `Weapon_Class` | Categorical | Firearm / Cutting / Blunt / Personal / Fire / Other |
            | `Crime_Circumstance` | Categorical | Robbery / Argument / Lover Triangle / Narcotics / Gang |
            | `Victim_Age_Group` | Discrete | Minor (<18) / Young Adult (18-29) / Adult (30-49) / Senior (50+) |
            | `Victim_Sex` | Binary | Male / Female |
            | `Location_Context` | Categorical | Residence / Public Transit / Commercial / Open Street |
            """
        )

    with col2:
        st.markdown("#### Latent Hypothesis Nodes ($H$)")
        st.markdown(
            """
            | Node | Type | Inferred Target States |
            |:---|:---|:---|
            | `Offender_Sex` | Prior/Posterior | Male (85% baseline) / Female (15% baseline) |
            | `Offender_Age_Bracket` | Categorical | 15–19 / 20–29 / 30–39 / 40–49 / 50+ |
            | `Offender_Relationship` | Latent Prior | Stranger / Acquaintance / Intimate Partner / Family |
            | `Offender_Proximity` | Spatial M.O. | Local Resident / Neighborhood Regular / Transitory |
            | `Premeditation_Level` | Behavioral | Impulsive-Opportunistic / Premeditated-Calculated |
            """
        )

    st.markdown("---")
    st.markdown("#### Causal Dependency Graph")
    st.markdown("""
    ```
    [ Weapon_Class ] ───────┬────────────────────────> [ Offender_Relationship ]
                            │                                     │
    [ Crime_Circumstance ] ─┴─────> [ Offender_Sex ]              │
                                           │                      ▼
    [ Victim_Age_Group ] ──────────────────┴─────────> [ Premeditation_Level ]
    ```
    """)
    st.caption("Directed edges represent conditional dependency factorizations: P(Offender_Relationship | Weapon, Circumstance) · P(Offender_Sex | Weapon, Circumstance).")


def _render_historical_tab() -> None:
    """Render empirical behavioral distributions from the 52k+ historical records."""
    render_section_header(
        title="Historical Baseline M.O. Corpus (52,179 Incidents)",
        description="Empirical distributions derived from verified geocoded metropolitan homicide investigations.",
    )

    df = load_homicide_data()
    if df.empty:
        st.info("Homicide dataset unavailable.")
        return

    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    with col_kpi1:
        solved_pct = (df["is_solved"].sum() / len(df) * 100) if "is_solved" in df.columns else 0
        render_metric_card("Overall Clearance Rate", f"{solved_pct:.1f}%", delta="Across 52k+ incidents")
    with col_kpi2:
        avg_age = df["victim_age_clean"].mean() if "victim_age_clean" in df.columns else 0
        render_metric_card("Mean Victim Age", f"{avg_age:.1f} yrs", delta="Processed corpus")
    with col_kpi3:
        n_cities = df["city"].nunique() if "city" in df.columns else 0
        render_metric_card("Jurisdictions", f"{n_cities:,}", delta="Unique cities")

    st.markdown("<br>", unsafe_allow_html=True)

    col_left, col_right = st.columns(2)
    with col_left:
        if "victim_sex" in df.columns:
            sex_dist = (df["victim_sex"].value_counts(normalize=True) * 100).round(1)
            st.markdown("**Victim Sex Distribution**")
            st.dataframe(pd.DataFrame({"Share (%)": sex_dist}).rename_axis("Sex"), use_container_width=True)

        if "victim_race" in df.columns:
            race_dist = (df["victim_race"].value_counts(normalize=True).head(6) * 100).round(1)
            st.markdown("**Victim Demographic Breakdown**")
            st.dataframe(pd.DataFrame({"Share (%)": race_dist}).rename_axis("Race/Ethnicity"), use_container_width=True)

    with col_right:
        if "reported_year" in df.columns:
            year_dist = df["reported_year"].value_counts().sort_index()
            st.markdown("**Annual Incident Volume**")
            st.bar_chart(year_dist, use_container_width=True)


def _render_interview_tab() -> None:
    """Tactical interview and interrogation strategy based on inferred profile."""
    render_section_header(
        title="Behavioral Interview Strategies by Inferred Profile",
        description="Tailored tactical interview approaches aligning with suspect relationship and emotional detachment levels.",
    )

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        <div class='crimora-card'>
            <h5 style='color:#1e293b;margin-top:0;'>Intimate / Domestic Profile Approach</h5>
            <ul style='font-size:0.875rem; color:#475569; padding-left:1.25rem; line-height:1.7;'>
                <li><b>Theme Development:</b> Frame the incident as an emotional escalation or overwhelming moment rather than cold premeditation.</li>
                <li><b>Rapport Building:</b> Allow suspect to articulate historical grievances or relationship tensions.</li>
                <li><b>Minimization:</b> Offer moral rationalization to lower psychological barriers to confession.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with c2:
        st.markdown("""
        <div class='crimora-card'>
            <h5 style='color:#1e293b;margin-top:0;'>Stranger / Opportunistic Profile Approach</h5>
            <ul style='font-size:0.875rem; color:#475569; padding-left:1.25rem; line-height:1.7;'>
                <li><b>Evidence Presentation:</b> Confront with indisputable physical/digital facts (ALPR, cell tower, ballistics).</li>
                <li><b>Timeline Dissection:</b> Focus on unaccounted time gaps immediately following the incident.</li>
                <li><b>Accomplice Separation:</b> In gang/robbery contexts, interview associates simultaneously to exploit prisoner dilemmas.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
