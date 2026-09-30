"""Dashboard CSS Styles and Design Tokens for Streamlit UI.

Day 8 Polish: refined spacing, typography, card elevations, table styles,
button states, and responsive column gutters. Design direction unchanged:
light background, deep navy text, blue/indigo accents, clean white cards.
"""

import streamlit as st


DASHBOARD_CSS = """
<style>
/* ── Google Fonts ───────────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── Main Container ─────────────────────────────────────────────────────── */
.stApp {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9375rem;
    line-height: 1.6;
}

/* ── Typography ─────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
    color: #0f172a !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
    line-height: 1.3 !important;
    font-family: 'Inter', sans-serif !important;
}
h2 { font-size: 1.5rem !important; }
h3 { font-size: 1.25rem !important; }
h4 { font-size: 1.05rem !important; }
h5 { font-size: 0.95rem !important; }

p, li, td, th {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #334155;
    line-height: 1.65;
}

code {
    background: #f1f5f9;
    color: #475569;
    padding: 0.1em 0.4em;
    border-radius: 4px;
    font-size: 0.875em;
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
section[data-testid="stSidebar"] {
    background-color: #ffffff !important;
    border-right: 1px solid #e2e8f0 !important;
}

section[data-testid="stSidebar"] .stRadio label {
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    color: #1e293b !important;
    padding: 4px 0 !important;
}

section[data-testid="stSidebar"] .stRadio [data-testid="stMarkdownContainer"] p {
    font-size: 0.875rem;
    color: #1e293b;
}

/* ── Main content padding ───────────────────────────────────────────────── */
.main .block-container {
    padding-top: 1.5rem;
    padding-bottom: 2rem;
    max-width: 1280px;
}

/* ── Page HR dividers ───────────────────────────────────────────────────── */
hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.25rem 0;
}

/* ── Card Containers ────────────────────────────────────────────────────── */
.crimora-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03);
}

.crimora-card-highlight {
    background: #ffffff;
    border: 1px solid #c7d2fe;
    border-left: 4px solid #4f46e5;
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px 0 rgba(79,70,229,0.06);
}

.crimora-card-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #16a34a;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
}

.crimora-card-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #d97706;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
}

.crimora-card-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #dc2626;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
}

/* ── Metric Cards ───────────────────────────────────────────────────────── */
.metric-container {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
    height: 100%;
}

.metric-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    margin-bottom: 0.4rem;
}

.metric-value {
    font-size: 1.625rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.25;
}

.metric-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
}

/* ── Status Badges ──────────────────────────────────────────────────────── */
.badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
}

.badge-active {
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
}

.badge-pending {
    background-color: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
}

.badge-info {
    background-color: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
}

.badge-danger {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

/* ── Responsible Use Notice ─────────────────────────────────────────────── */
.notice-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #64748b;
    border-radius: 6px;
    padding: 0.85rem 1.1rem;
    margin-top: 1.75rem;
    margin-bottom: 1.5rem;
    font-size: 0.8125rem;
    color: #334155;
    line-height: 1.55;
}

/* ── Tables ─────────────────────────────────────────────────────────────── */
[data-testid="stDataFrame"] {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

/* ── Tab Bar ────────────────────────────────────────────────────────────── */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0;
}

.stTabs [data-baseweb="tab"] {
    padding: 8px 18px;
    border-radius: 6px 6px 0 0;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
    background: transparent;
}

.stTabs [aria-selected="true"] {
    color: #2563eb !important;
    font-weight: 600 !important;
    border-bottom: 2px solid #2563eb !important;
    background: transparent !important;
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
button[kind="primary"] {
    background: #2563eb !important;
    border: none !important;
    border-radius: 7px !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
    padding: 0.5rem 1.25rem !important;
}

button[kind="secondary"] {
    border-radius: 7px !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
}

/* ── Form elements ──────────────────────────────────────────────────────── */
[data-testid="stSelectbox"] > div,
[data-testid="stNumberInput"] > div,
[data-testid="stSlider"] > div {
    border-radius: 6px;
}

[data-testid="stTextInput"] input {
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    font-size: 0.875rem;
}

/* ── Expanders ──────────────────────────────────────────────────────────── */
[data-testid="stExpander"] {
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background: #ffffff !important;
}

/* ── Info/Warning/Error boxes ───────────────────────────────────────────── */
[data-testid="stAlert"] {
    border-radius: 8px !important;
    font-size: 0.875rem !important;
}

/* ── Empty state helper ─────────────────────────────────────────────────── */
.empty-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
}
</style>
"""


def apply_custom_styles() -> None:
    """Inject executive dashboard CSS into the Streamlit app."""
    st.markdown(DASHBOARD_CSS, unsafe_allow_html=True)
