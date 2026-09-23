"""src/pages/tamil_nadu_analytics.py - Tamil Nadu Crime Analytics.

Visualizes Day 3 longitudinal IPC crime analytics across Tamil Nadu districts (2020-2022),
including district rankings, annual trends, and visual diagnostic figures.
"""

from __future__ import annotations

from pathlib import Path
import streamlit as st
import pandas as pd

from src.ui.components import (
    render_page_header,
    render_section_header,
    render_metric_card,
    render_alert,
    render_responsible_notice,
)
from src.services.data_service import (
    get_tamil_nadu_district_summary,
    get_tamil_nadu_yearly_trends,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "tamil_nadu"


def render_tamil_nadu_analytics_page() -> None:
    """Render the Tamil Nadu Analytics dashboard page."""
    render_page_header(
        title="Tamil Nadu Crime Analytics & Trends",
        subtitle="Longitudinal IPC crime pattern analysis across Tamil Nadu administrative districts (2020–2022).",
        badge_text="Module 06",
        badge_color="blue",
    )

    district_df = get_tamil_nadu_district_summary()
    trends_df = get_tamil_nadu_yearly_trends()

    # Executive KPI Cards
    if not district_df.empty:
        total_districts = len(district_df)
        total_crimes = int(district_df["total_crimes"].sum()) if "total_crimes" in district_df.columns else 0
        top_district = str(district_df.iloc[0]["district"]) if "district" in district_df.columns else "N/A"
        top_district_crimes = int(district_df.iloc[0]["total_crimes"]) if "total_crimes" in district_df.columns else 0
        top_district_share = (top_district_crimes / total_crimes * 100) if total_crimes > 0 else 0

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            render_metric_card(
                title="Districts Tracked",
                value=f"{total_districts}",
                delta="100% Administrative Coverage",
                delta_positive=True,
            )
        with col2:
            render_metric_card(
                title="Total Recorded Incidents",
                value=f"{total_crimes:,}",
                delta="2020 - 2022 Cumulative",
                delta_positive=True,
            )
        with col3:
            render_metric_card(
                title="Highest Incident District",
                value=top_district,
                delta=f"{top_district_crimes:,} incidents",
                delta_positive=False,
            )
        with col4:
            render_metric_card(
                title="Top District Crime Share",
                value=f"{top_district_share:.1f}%",
                delta="Of State Total",
                delta_positive=False,
            )

    tab1, tab2, tab3 = st.tabs([
        "District Summary & Rankings",
        "Longitudinal Trends (2020-2022)",
        "Publication Figures & Visualizations",
    ])

    with tab1:
        _render_district_summary_tab(district_df)

    with tab2:
        _render_yearly_trends_tab(trends_df)

    with tab3:
        _render_figures_tab()

    render_responsible_notice()


def _render_district_summary_tab(district_df: pd.DataFrame) -> None:
    """Render district rankings and filterable data table."""
    render_section_header(
        title="District Crime Summary & Proportional Share",
        description="Comprehensive aggregation of total cases, yearly breakdowns, and district-level distribution.",
    )

    if district_df.empty:
        st.warning("Tamil Nadu district summary data (district_summary.csv) not found.")
        return

    # Filter by search
    search_query = st.text_input("Filter Districts by Name", placeholder="e.g. Chennai, Coimbatore, Madurai...")
    filtered_df = district_df
    if search_query and "district" in district_df.columns:
        filtered_df = district_df[district_df["district"].str.contains(search_query, case=False, na=False)]

    st.markdown(f"**Showing {len(filtered_df)} of {len(district_df)} administrative districts:**")
    st.dataframe(filtered_df, use_container_width=True, hide_index=True)

    if "district" in district_df.columns and "total_crimes" in district_df.columns:
        st.markdown("#### Top 10 Districts by Total Incidents")
        top10 = district_df.head(10)[["district", "total_crimes"]].set_index("district")
        st.bar_chart(top10, use_container_width=True)


def _render_yearly_trends_tab(trends_df: pd.DataFrame) -> None:
    """Render longitudinal yearly trends."""
    render_section_header(
        title="Year-over-Year Crime Trajectory",
        description="Analysis of incident progression across reporting years 2020 through 2022.",
    )

    if trends_df.empty:
        st.warning("Tamil Nadu yearly trends data (yearly_trends.csv) not found.")
        return

    st.dataframe(trends_df, use_container_width=True, hide_index=True)

    if "year" in trends_df.columns and "total_crimes" in trends_df.columns:
        chart_data = trends_df.set_index("year")[["total_crimes"]]
        st.line_chart(chart_data, use_container_width=True)


def _render_figures_tab() -> None:
    """Render visual figures saved during Day 3 analysis."""
    render_section_header(
        title="Generated Analytical Visualizations",
        description="High-resolution distribution figures produced during Day 3 analytics pipeline execution.",
    )

    figures = [
        ("district_crime_distribution.png", "District Crime Distribution (Total Incidents)"),
        ("yearly_crime_trends.png", "Yearly Trend Comparison (2020 - 2022)"),
        ("top_districts_by_crime.png", "Top Districts by Cumulative Volume"),
        ("violent_crime_trends.png", "Violent vs Non-Violent Trajectories"),
        ("ipc_breakdown.png", "IPC Major Head Crime Breakdown"),
    ]

    for fname, title in figures:
        fig_path = OUTPUTS_DIR / fname
        if fig_path.exists():
            st.markdown(f"#### {title}")
            st.image(str(fig_path), caption=title, use_container_width=True)
            st.markdown("---")
