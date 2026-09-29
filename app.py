"""app.py - Crimora Intelligent Crime Detective Platform.

Day 7 Unified Application Shell.
Merges Person A (ANN/BBN/Clustering views) and Person B (Geographic/PCA/Tamil Nadu/Classical ML)
into a single multi-page Streamlit dashboard.

Person A models: ANN (TF required), BBN (pgmpy required) — loaded gracefully or shown as unavailable.
Person B models: ID3, Naive Bayes, k-NN, PCA, KMeans, Hierarchical — all operational.
"""

from __future__ import annotations

import importlib
import streamlit as st

# ── Page configuration (must be first Streamlit call) ────────────────────────
st.set_page_config(
    page_title="Crimora | Intelligent Crime Detective Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Apply custom executive UI styles ─────────────────────────────────────────
from src.ui.styles import apply_custom_styles
apply_custom_styles()

# ── Person B page renderers (always available) ────────────────────────────────
from src.pages.overview import render_overview_page
from src.pages.crime_linkage import render_crime_linkage_page
from src.pages.geographic_analysis import render_geographic_analysis_page
from src.pages.behavioral_profiling import render_behavioral_profiling_page
from src.pages.case_solvability import render_case_solvability_page
from src.pages.tamil_nadu_analytics import render_tamil_nadu_analytics_page
from src.pages.model_comparison import render_model_comparison_page

# ── Person A view renderers (optional — graceful fallback if TF missing) ──────
def _try_import_person_a():
    """Attempt to import Person A's views; return None functions on failure."""
    try:
        spec = importlib.util.spec_from_file_location(
            "views.solvability_profiling",
            "views/solvability_profiling.py",
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod.render_solvability_profiling_page
    except Exception:
        return None

_person_a_solvability = _try_import_person_a()

# ── Navigation registry ───────────────────────────────────────────────────────
PAGES = {
    "Overview / Dashboard": {
        "func": render_overview_page,
        "icon": "📊",
        "owner": "Person B",
    },
    "Crime Linkage & Clustering": {
        "func": render_crime_linkage_page,
        "icon": "🔗",
        "owner": "Person A + B",
    },
    "Geographic Analysis": {
        "func": render_geographic_analysis_page,
        "icon": "🗺️",
        "owner": "Person B",
    },
    "Behavioral Profiling": {
        "func": render_behavioral_profiling_page,
        "icon": "🧬",
        "owner": "Person A",
    },
    "Case Solvability": {
        "func": render_case_solvability_page,
        "icon": "⚖️",
        "owner": "Person B",
    },
    "Tamil Nadu Analytics": {
        "func": render_tamil_nadu_analytics_page,
        "icon": "🏛️",
        "owner": "Person B",
    },
    "Model Comparison": {
        "func": render_model_comparison_page,
        "icon": "📈",
        "owner": "Person A + B",
    },
}

# Add ANN Solvability page if Person A's view loaded
if _person_a_solvability is not None:
    PAGES["ANN Solvability (Person A)"] = {
        "func": _person_a_solvability,
        "icon": "🤖",
        "owner": "Person A",
    }


def _render_ann_unavailable() -> None:
    """Fallback render when TensorFlow is not installed."""
    from src.ui.components import render_page_header, render_alert
    render_page_header(
        title="ANN Solvability & Suspect Profiling (Person A)",
        subtitle="Artificial Neural Network model requires TensorFlow.",
        icon="🤖",
        badge_text="Dependency Missing",
        badge_type="pending",
    )
    st.error(
        "**ANN model unavailable:** TensorFlow is not installed in the current environment. "
        "Install with: `pip install tensorflow` and restart the app."
    )
    st.info(
        "The ANN artifact (`models/solvability_ann.keras`, 1.47 MB) is present on disk. "
        "Once TensorFlow is installed, the full ANN solvability form will activate automatically."
    )


def main() -> None:
    """Application entry point and sidebar navigation routing."""
    # Sidebar branding
    st.sidebar.markdown(
        """
        <div style="padding:0.5rem 0 1rem 0;border-bottom:1px solid #e2e8f0;margin-bottom:1rem;">
            <div style="font-size:1.35rem;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:0.5rem;">
                <span>🛡️</span><span>CRIMORA</span>
            </div>
            <div style="font-size:0.75rem;color:#64748b;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;">
                Intelligent Detective Platform
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Navigation
    page_options = list(PAGES.keys())
    formatted = [f"{PAGES[p]['icon']}  {p}" for p in page_options]
    selected_fmt = st.sidebar.radio("Navigation", options=formatted, index=0, label_visibility="collapsed")
    selected_key = page_options[formatted.index(selected_fmt)]

    # System status
    from src.services.model_service import get_model_registry
    registry = get_model_registry()
    loaded_count = sum(1 for v in registry.values() if v["available"])
    total_count = len(registry)
    ann_ok = "✅" if _person_a_solvability is not None else "❌"

    st.sidebar.markdown("---")
    st.sidebar.markdown(
        f"""
        <div style="background:#f1f5f9;padding:0.75rem 1rem;border-radius:8px;font-size:0.75rem;color:#475569;margin-bottom:1rem;">
            <div style="font-weight:700;color:#1e293b;margin-bottom:0.4rem;">SYSTEM STATUS</div>
            <div>• Models loaded: {loaded_count}/{total_count}</div>
            <div>• ID3 / NB / k-NN: ✅ Active</div>
            <div>• KMeans / HC: ✅ Active</div>
            <div>• ANN (TF): {ann_ok} {'Active' if _person_a_solvability else 'TF not installed'}</div>
            <div>• BBN (pgmpy): ❌ pgmpy not installed</div>
            <div>• Corpus: 52,179 records</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.sidebar.markdown(
        """<div style="font-size:0.7rem;color:#94a3b8;line-height:1.4;padding:0 0.25rem;">
        <strong>Decision-Support Notice:</strong> Crimora outputs are investigative aids
        and do not constitute legal determinations of guilt or criminal clearance.
        </div>""",
        unsafe_allow_html=True,
    )

    # Route to page
    page_func = PAGES[selected_key]["func"]
    page_func()


if __name__ == "__main__":
    main()
