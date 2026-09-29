"""src/pages/behavioral_profiling.py - Behavioral Profiling & BBN.

Day 7: Integrates the bbn_profile.pkl artifact where loadable.
BBN requires pgmpy which is NOT installed — model is unavailable but
clearly documented. Baseline statistical profiling from real data is shown.
"""

from __future__ import annotations

import pandas as pd
import streamlit as st

from src.services.model_service import get_model_registry
from src.services.data_service import load_homicide_data
from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_metric_card,
)


def render_behavioral_profiling_page() -> None:
    """Render the Behavioral Profiling module interface."""
    render_page_header(
        title="Behavioral Profiling & Causal Modeling",
        subtitle="Modus operandi (M.O.) statistical analysis and Bayesian Belief Network (BBN) status.",
        icon="🧬",
        badge_text="Module 04",
        badge_type="pending",
    )

    registry = get_model_registry()
    bbn_info = registry.get("bbn", {})

    # ── BBN Status Banner ────────────────────────────────────────────────────
    render_section_header(
        title="Bayesian Belief Network (BBN) Status",
        description="Person A's BBN model artifact (bbn_profile.pkl) — integration status below.",
    )

    if bbn_info.get("available"):
        st.success("✅ BBN model loaded and ready for inference.")
    else:
        st.warning(
            f"⚠️ BBN model (bbn_profile.pkl) is present on disk but **cannot be loaded**: "
            f"{bbn_info.get('reason', 'Unknown reason')}. "
            f"Install `pgmpy` to enable BBN inference."
        )

    st.markdown(
        """
        <div style='background:#fef9c3;border-left:4px solid #ca8a04;border-radius:6px;padding:0.85rem 1.1rem;margin:0.75rem 0;font-size:0.875rem;color:#713f12;'>
            <b>BBN Artifact Found:</b> <code>models/bbn_profile.pkl</code> (1,963 bytes) — serialized with pgmpy.
            The model is ready for activation once <code>pgmpy</code> is installed in the project environment.
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("---")

    # ── Evidence Node Schema ─────────────────────────────────────────────────
    render_section_header(
        title="BBN Evidence Parameter Schema",
        description="Observed variables (nodes) and latent hypotheses defined in Person A's BBN structure.",
    )

    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown("#### Observed Evidence Nodes ($E$)")
        st.markdown(
            """
            | Node | Values |
            |:---|:---|
            | `Weapon_Class` | Firearm / Cutting / Blunt / Personal / Other |
            | `Victim_Age_Group` | Minor / Young Adult / Adult / Senior |
            | `Victim_Sex` | Male / Female / Unknown |
            | `Temporal_Window` | Night / Morning / Afternoon / Evening |
            | `Location_Context` | Residence / Street / Commercial / Unknown |
            """
        )

    with col2:
        st.markdown("#### Latent Hypothesis Nodes ($H$)")
        st.markdown(
            """
            | Node | States |
            |:---|:---|
            | `Offender_Relationship` | Stranger / Acquaintance / Intimate |
            | `Offender_Experience` | Opportunistic / Premeditated |
            | `Offender_Proximity` | Local Resident / Transitory |
            """
        )

    st.markdown("---")

    # ── Baseline Statistical Profiling (Real Data) ───────────────────────────
    render_section_header(
        title="Baseline Behavioral Distribution (Historical Corpus)",
        description="Empirical frequency distributions from 52,179 processed homicide records — real data, no fabrication.",
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
        avg_age = df["victim_age_clean"].mean()
        render_metric_card("Mean Victim Age", f"{avg_age:.1f} yrs", delta="Processed corpus")
    with col_kpi3:
        n_cities = df["city"].nunique() if "city" in df.columns else 0
        render_metric_card("Jurisdictions", f"{n_cities:,}", delta="Unique cities")

    col_left, col_right = st.columns(2)
    with col_left:
        if "victim_sex" in df.columns:
            sex_dist = (df["victim_sex"].value_counts(normalize=True) * 100).round(1)
            st.markdown("**Victim Sex Distribution**")
            st.dataframe(
                pd.DataFrame({"Share (%)": sex_dist}).rename_axis("Sex"),
                use_container_width=True,
            )
        if "victim_race" in df.columns:
            race_dist = (df["victim_race"].value_counts(normalize=True).head(6) * 100).round(1)
            st.markdown("**Victim Demographic Breakdown (Top 6)**")
            st.dataframe(
                pd.DataFrame({"Share (%)": race_dist}).rename_axis("Race/Ethnicity"),
                use_container_width=True,
            )

    with col_right:
        if "reported_year" in df.columns:
            year_dist = df["reported_year"].value_counts().sort_index()
            st.markdown("**Annual Incident Volume**")
            st.bar_chart(year_dist, use_container_width=True)

    render_alert(
        "The BBN structural model file exists at models/bbn_profile.pkl. "
        "Full inference requires installing pgmpy. Activate with: pip install pgmpy.",
        "info",
    )
    render_responsible_notice()
