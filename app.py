"""app.py - Intelligent Crime Detective Platform.

Streamlit Application Shell and Multi-Page Analytics Dashboard.
Integrated Day 1-6 Person B analytical modules and Person A placeholders.
"""

from __future__ import annotations

import streamlit as st

# Configure page metadata first before any other Streamlit calls
st.set_page_config(
    page_title="Crimora | Intelligent Crime Detective Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Apply custom UI styling
from src.ui.styles import apply_custom_styles
apply_custom_styles()

# Import page renderers
from src.pages.overview import render_overview_page
from src.pages.crime_linkage import render_crime_linkage_page
from src.pages.geographic_analysis import render_geographic_analysis_page
from src.pages.behavioral_profiling import render_behavioral_profiling_page
from src.pages.case_solvability import render_case_solvability_page
from src.pages.tamil_nadu_analytics import render_tamil_nadu_analytics_page
from src.pages.model_comparison import render_model_comparison_page


PAGES = {
    "Overview / Dashboard": {
        "func": render_overview_page,
        "icon": "📊",
        "description": "System KPI overview, pipeline architecture & PCA variance",
    },
    "Crime Linkage": {
        "func": render_crime_linkage_page,
        "icon": "🔗",
        "description": "Serial incident association & similarity mining (Person A)",
    },
    "Geographic Analysis": {
        "func": render_geographic_analysis_page,
        "icon": "🗺️",
        "description": "Spatial KDE, LWR intensity surface & Folium hotspot map",
    },
    "Behavioral Profiling": {
        "func": render_behavioral_profiling_page,
        "icon": "🧬",
        "description": "M.O. signature extraction & Bayesian Belief Network (Person A)",
    },
    "Case Solvability": {
        "func": render_case_solvability_page,
        "icon": "⚖️",
        "description": "Live case scoring via ID3 Decision Tree, Naive Bayes & k-NN",
    },
    "Tamil Nadu Analytics": {
        "func": render_tamil_nadu_analytics_page,
        "icon": "🏛️",
        "description": "Longitudinal IPC district-level trends (2020–2022)",
    },
    "Model Comparison": {
        "func": render_model_comparison_page,
        "icon": "📈",
        "description": "Holdout test benchmarks, 5-fold CV & diagnostic curves",
    },
}


def main() -> None:
    """Application entry point and sidebar navigation routing."""
    # Sidebar Branding
    st.sidebar.markdown(
        """
        <div style="padding: 0.5rem 0 1rem 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 1rem;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
                <span>🛡️</span> <span>CRIMORA</span>
            </div>
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
                Intelligent Detective Platform
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Sidebar Navigation Selection
    page_options = list(PAGES.keys())
    page_icons = [PAGES[p]["icon"] for p in page_options]
    
    # Format labels with icons
    formatted_options = [f"{PAGES[p]['icon']}  {p}" for p in page_options]

    selected_formatted = st.sidebar.radio(
        "Navigation",
        options=formatted_options,
        index=0,
        label_visibility="collapsed",
    )

    # Resolve selected page key
    selected_page_key = page_options[formatted_options.index(selected_formatted)]

    # Sidebar System Status Box
    st.sidebar.markdown("---")
    st.sidebar.markdown(
        """
        <div style="background-color: #f1f5f9; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.75rem; color: #475569; margin-bottom: 1rem;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 0.25rem;">
                SYSTEM STATUS: OPERATIONAL
            </div>
            <div>• Core Engine: Person B (Days 1–6)</div>
            <div>• Corpus: 52,179 Cleaned Records</div>
            <div>• Spatial Engine: KDE / LWR Active</div>
            <div>• Inference: Classical ML Ready</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Sidebar Responsible AI Note
    st.sidebar.markdown(
        """
        <div style="font-size: 0.7rem; color: #94a3b8; line-height: 1.4; padding: 0 0.25rem;">
            <strong>Decision-Support Notice:</strong> Crimora outputs are investigative decision-support aids and do not constitute legal determinations of guilt or definitive criminal clearance.
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Route to selected page
    page_info = PAGES[selected_page_key]
    page_func = page_info["func"]
    page_func()


if __name__ == "__main__":
    main()
