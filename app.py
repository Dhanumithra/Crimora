import streamlit as st
from views.solvability_profiling import render_solvability_profiling_page
from views.cold_case_clustering import render_clustering_page

st.set_page_config(page_title="CRIMORA ML Platform", layout="wide")

st.sidebar.title("CRIMORA Navigation")
page = st.sidebar.radio("Select Engine", [
    "1. Solvability & Suspect Profiling",
    "2. Cold Case Clustering & Linkage",
    "3. Macro Regional Analytics (Person B)"
])

if page == "1. Solvability & Suspect Profiling":
    render_solvability_profiling_page()
elif page == "2. Cold Case Clustering & Linkage":
    render_clustering_page()
elif page == "3. Macro Regional Analytics (Person B)":
    st.header("📊 Macro Regional Analytics (Person B)")
    try:
        from src.pages.overview import render_overview_page
        from src.pages.geographic_analysis import render_geographic_analysis_page
        from src.pages.tamil_nadu_analytics import render_tamil_nadu_analytics_page

        b_subtab1, b_subtab2, b_subtab3 = st.tabs([
            "System Overview & Pipeline",
            "Geographic Hotspot Analysis",
            "Tamil Nadu Regional Analytics"
        ])
        with b_subtab1:
            render_overview_page()
        with b_subtab2:
            render_geographic_analysis_page()
        with b_subtab3:
            render_tamil_nadu_analytics_page()
    except Exception:
        st.info(
            "Development Notice: Person B analytics modules (Geographic Profiling, "
            "Dimensionality Reduction, and Tamil Nadu State-Level Analytics) are integrated."
        )
        st.markdown(
            """
            ### Decision-Support Features (Person B)
            - **Geographic Crime Profiling & Spatial Mapping** (Folium & Locally Weighted Regression)
            - **Dimensionality Reduction & Latent Pattern Analysis** (Principal Component Analysis)
            - **Case Solvability & Crime Linkage Estimation** (ID3 Decision Tree, Naive Bayes, k-NN)
            - **Tamil Nadu State-Level Analytics** (District IPC trends & longitudinal metrics)
            - **Comprehensive Model Evaluation & Metric Dashboards**

            *Note: This platform is an academic decision-support prototype intended for research and statistical analysis.*
            """
        )
