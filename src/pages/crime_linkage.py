"""Crime Linkage Analysis Page (Person A Track Placeholder)."""

import streamlit as st

from src.services.data_service import load_clean_homicide_data
from src.ui.components import (
    render_page_header,
    render_placeholder_interface,
    render_responsible_notice,
    render_section_header,
)


def render_crime_linkage_page() -> None:
    """Render the Crime Linkage analysis page."""
    render_page_header(
        title="Crime Linkage Analysis",
        subtitle="Unsupervised Clustering & Modus Operandi Series Grouping",
        icon="🔗",
        badge_text="Person A Track",
        badge_type="pending",
    )

    # 1. Methodology & Status Card
    render_placeholder_interface(
        feature_title="Serial Crime Linkage Engine",
        owner="Person A",
        planned_day="Day 7",
        methodology="K-Means Clustering & Agglomerative Hierarchical Linkage across multi-attribute behavioral signatures.",
        input_schema=[
            "Incident weapon classification (Handgun, Knife, Blunt Object)",
            "Temporal interval delta between consecutive incidents (days)",
            "Geographic distance matrix (spherical km separation)",
            "Victim demographic similarity vectors (Age, Sex, Race)",
            "Location situational typologies (Residence, Alley, Street)",
        ],
        expected_output="Cluster assignment indices, intra-cluster silhouette cohesion scores, linkage confidence matrices, and suggested potential series groupings.",
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # 2. Interactive Parameter Configuration Shell
    render_section_header(
        title="Linkage Parameter Configuration Shell",
        description="Pre-wired analytical controls ready for model binding upon Person A model validation.",
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        st.slider("Linkage Similarity Threshold (Cosine)", min_value=0.50, max_value=0.99, value=0.85, step=0.01)
    with col2:
        st.selectbox("Hierarchical Linkage Criterion", options=["ward", "complete", "average", "single"], index=0)
    with col3:
        st.number_input("Target Number of Clusters (k)", min_value=2, max_value=25, value=5, step=1)

    st.markdown("##### Feature Importance Weighting Scheme")
    col_w1, col_w2, col_w3, col_w4 = st.columns(4)
    with col_w1:
        st.checkbox("Spatial Proximity (Haversine)", value=True, disabled=False)
    with col_w2:
        st.checkbox("Temporal Interval Cadence", value=True, disabled=False)
    with col_w3:
        st.checkbox("Weapon / M.O. Signature", value=True, disabled=False)
    with col_w4:
        st.checkbox("Victim Demographic Profile", value=True, disabled=False)

    st.info("Simulation Status: Controls are active. Awaiting Person A serialization of linkage model weights to produce live series clusters.")

    # 3. Unlinked Incidents Exploration Pool
    render_section_header(
        title="Unsolved Incident Data Pool for Linkage Query",
        description="Filterable candidate pool of open cases from data/processed/homicide_clean.csv.",
    )
    df_raw = load_clean_homicide_data(nrows=500)
    if not df_raw.empty:
        unsolved_pool = df_raw[df_raw["is_solved"] == 0].copy()
        if not unsolved_pool.empty:
            cols = [c for c in ["uid", "city", "state", "reported_date_clean", "reported_year", "victim_age_clean", "victim_sex", "victim_race"] if c in unsolved_pool.columns]
            st.dataframe(unsolved_pool[cols].head(10), use_container_width=True)

    render_responsible_notice()
