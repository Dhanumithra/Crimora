"""Dashboard CSS Styles and Design Tokens for Streamlit UI.

Implements an executive analytical theme:
- Light neutral background (#f8fafc / #ffffff)
- Deep navy typography (#0f172a, #1e293b)
- Sophisticated blue/indigo accents (#2563eb, #4f46e5)
- Elevated card containers with crisp borders and subtle shadows
- Responsive layout adjustments
"""

import streamlit as st


DASHBOARD_CSS = """
<style>
/* Main Container & Background */
.stApp {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header & Typography */
h1, h2, h3, h4, h5, h6 {
    color: #0f172a !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
}

/* Sidebar Styling */
section[data-testid="stSidebar"] {
    background-color: #ffffff !important;
    border-right: 1px solid #e2e8f0 !important;
}

section[data-testid="stSidebar"] .stRadio label {
    font-weight: 500 !important;
    color: #1e293b !important;
}

/* Card Containers */
.crimora-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.crimora-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
}

.crimora-card-highlight {
    background: #ffffff;
    border: 1px solid #c7d2fe;
    border-left: 4px solid #4f46e5;
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 3px 0 rgba(79, 70, 229, 0.06);
}

/* Metric Display Cards */
.metric-container {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
}

.metric-title {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 0.35rem;
}

.metric-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
}

.metric-subtitle {
    font-size: 0.775rem;
    color: #94a3b8;
    margin-top: 0.25rem;
}

/* Status Badges */
.badge {
    display: inline-block;
    padding: 0.2rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.badge-active {
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
}

.badge-pending {
    background-color: #fef3c7;
    color: #d97706;
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

/* Responsible Use Notice Banner */
.notice-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #64748b;
    border-radius: 6px;
    padding: 0.85rem 1.15rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.825rem;
    color: #334155;
    line-height: 1.5;
}

/* Clean Tables */
.dataframe {
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
}

.stTabs [data-baseweb="tab"] {
    padding: 8px 16px;
    border-radius: 6px 6px 0 0;
    color: #475569;
    font-weight: 500;
}

.stTabs [aria-selected="true"] {
    color: #2563eb !important;
    font-weight: 600 !important;
    border-bottom: 2px solid #2563eb !important;
}
</style>
"""


def apply_custom_styles() -> None:
    """Inject custom executive dashboard CSS into the Streamlit app."""
    st.markdown(DASHBOARD_CSS, unsafe_allow_html=True)
