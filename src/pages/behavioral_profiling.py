"""src/pages/behavioral_profiling.py - Behavioral Profiling (Person A Placeholder).

Displays an investigative interface for behavioral pattern extraction,
modus operandi (M.O.) analysis, and Bayesian Belief Network (BBN) causal modeling.
Marked clearly as Person A scope without fabricated or mock outputs.
"""

from __future__ import annotations

import streamlit as st
import pandas as pd

from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_placeholder_interface,
)
from src.services.data_service import load_homicide_data


def render_behavioral_profiling_page() -> None:
    """Render the Behavioral Profiling module interface."""
    render_page_header(
        title="Behavioral Profiling & Causal Modeling",
        subtitle="Modus operandi (M.O.) signature extraction and Bayesian Belief Network (BBN) behavioral inference.",
        badge_text="Module 04",
        badge_color="amber",
    )

    render_placeholder_interface(
        module_name="Behavioral Profiling & BBN Inference",
        owner="Person A",
        description=(
            "This module establishes probabilistic causal links between crime scene characteristics, "
            "weapon choices, victim vulnerability indices, and offender behavioral traits using Bayesian "
            "Belief Networks (BBN) and unsupervised pattern mining."
        ),
        expected_inputs=[
            "Crime scene location type & environmental context",
            "Weapon category & physical evidence markers",
            "Victim demographics (Age, Gender, Vulnerability markers)",
            "Temporal dispatch delay and response indicators",
            "Offender behavioral signature markers (Overkill, Trophy, Staging)",
        ],
        expected_outputs=[
            "Directed Acyclic Graph (DAG) causal structure visualization",
            "Posterior probability distributions for offender behavioral traits",
            "Modus Operandi (M.O.) consistency score across linked cases",
            "Probabilistic evidence node sensitivity & counterfactual explanations",
        ],
    )

    render_section_header(
        title="BBN Evidence Parameter Specification",
        description="Inspect the target parameter schema and observable feature distribution from processed homicide data.",
    )

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("#### Configured Evidence Nodes (Schema)")
        st.markdown(
            """
            When Person A completes Day 5 BBN modeling, the following evidence variables will be conditioned
            to infer unobserved latent offender traits:
            
            * **Observed Nodes ($E$):**
                - `Weapon_Class`: Firearm / Cutting Instrument / Blunt Object / Personal / Other
                - `Victim_Age_Group`: Minor (<18) / Young Adult (18-29) / Adult (30-49) / Senior (50+)
                - `Victim_Sex`: Male / Female / Unknown
                - `Temporal_Window`: Night / Morning / Afternoon / Evening
                - `Location_Context`: Residence / Street / Commercial / Transit / Unknown
            
            * **Latent Hypotheses ($H$):**
                - `Offender_Relationship`: Stranger vs Acquaintance vs Intimate Partner
                - `Offender_Criminal_Experience`: Opportunistic vs Premeditated
                - `Offender_Proximity`: Resident Local vs Transitory
            """
        )

    with col2:
        st.markdown("#### Baseline Observable Distributions")
        df = load_homicide_data()
        if not df.empty:
            if "victim_sex" in df.columns:
                sex_dist = df["victim_sex"].value_counts(normalize=True).round(3) * 100
                st.markdown("**Victim Sex Distribution in Historical Corpus:**")
                st.dataframe(
                    pd.DataFrame({"Percentage (%)": sex_dist}),
                    use_container_width=True,
                )
            if "victim_race" in df.columns:
                race_dist = df["victim_race"].value_counts(normalize=True).head(5).round(3) * 100
                st.markdown("**Top Victim Demographics (Race/Ethnicity):**")
                st.dataframe(
                    pd.DataFrame({"Percentage (%)": race_dist}),
                    use_container_width=True,
                )
        else:
            st.info("Historical baseline data unavailable.")

    render_alert(
        "Bayesian parameter learning requires structure estimation (e.g., PC Algorithm or Hill Climbing) "
        "and conditional probability distribution (CPD) estimation, scheduled for Person A completion.",
        alert_type="info",
    )

    render_responsible_notice()
