"""src/pages/tamil_nadu_analytics.py - Tamil Nadu Crime Analytics.

Day 8 Polish:
- Fixed column references to match actual district_summary.csv schema
  (total_crime_2020_2022, total_crime_count, etc.)
- Corrected figure filenames to match outputs/tamil_nadu/ directory
- Fixed badge_color → badge_type parameter
- Added input validation for search filter
- Improved table column display names and number formatting
- Added KPI cards sourced from real data
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
    render_empty_state,
)
from src.services.data_service import (
    get_tamil_nadu_district_summary,
    get_tamil_nadu_yearly_trends,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs" / "tamil_nadu"

# Actual column names in district_summary.csv
COL_DISTRICT = "district"
COL_TOTAL = "total_crime_2020_2022"
COL_SHARE = "share_pct_2022"
COL_POP = "projected_pop_lakhs"
COL_RATE = "rate_cognizable_crime_2022"
COL_MURDER = "murder_incidence"
COL_MURDER_RATE = "murder_rate"
COL_FATALITIES = "violent_fatalities_total_2023"

# Actual column names in yearly_trends.csv
COL_YEAR = "year"
COL_YEARLY_COUNT = "total_crime_count"
COL_YOY = "yoy_change_pct"

# Display-friendly labels for raw columns
DISPLAY_LABELS = {
    COL_DISTRICT: "District",
    "crime_count_2020": "Crimes 2020",
    "crime_count_2021": "Crimes 2021",
    "crime_count_2022": "Crimes 2022",
    COL_SHARE: "Share % (2022)",
    COL_POP: "Pop. (Lakhs)",
    COL_RATE: "Crime Rate (2022)",
    COL_MURDER: "Murder Incidence",
    COL_MURDER_RATE: "Murder Rate",
    COL_FATALITIES: "Violent Fatalities (2023)",
    COL_TOTAL: "Total Crimes (2020–22)",
}


def render_tamil_nadu_analytics_page() -> None:
    """Render the Tamil Nadu Analytics dashboard page."""
    render_page_header(
        title="Tamil Nadu Crime Analytics & Trends",
        subtitle=(
            "Longitudinal IPC crime pattern analysis across Tamil Nadu "
            "administrative districts (2020–2022). Source: NCRB district dataset."
        ),
        icon="🏛️",
        badge_text="Module 06",
        badge_type="active",
    )

    district_df = get_tamil_nadu_district_summary()
    trends_df = get_tamil_nadu_yearly_trends()

    # ── Executive KPI Cards ─────────────────────────────────────────────────
    _render_kpi_cards(district_df, trends_df)

    st.markdown("---")

    tab1, tab2, tab3 = st.tabs([
        "📋  District Summary & Rankings",
        "📈  Annual Trends (2014–2022)",
        "🖼️  Publication Figures",
    ])

    with tab1:
        _render_district_summary_tab(district_df)
    with tab2:
        _render_yearly_trends_tab(trends_df)
    with tab3:
        _render_figures_tab()

    render_responsible_notice()


def _render_kpi_cards(district_df: pd.DataFrame, trends_df: pd.DataFrame) -> None:
    """Compute and display top-level KPI metrics from real data."""
    col1, col2, col3, col4 = st.columns(4)

    total_districts = len(district_df) if not district_df.empty else 0
    with col1:
        render_metric_card(
            "Districts Tracked",
            str(total_districts),
            delta="100% Administrative Coverage",
            delta_positive=True,
        )

    if not district_df.empty and COL_TOTAL in district_df.columns:
        total_crimes = int(district_df[COL_TOTAL].sum())
        with col2:
            render_metric_card(
                "Total Recorded Incidents",
                f"{total_crimes:,}",
                delta="2020–2022 Cumulative",
                delta_positive=True,
            )
        # Top district by total
        top_row = district_df.loc[district_df[COL_TOTAL].idxmax()]
        top_name = str(top_row.get(COL_DISTRICT, "N/A"))
        top_total = int(top_row.get(COL_TOTAL, 0))
        with col3:
            render_metric_card(
                "Highest Incident District",
                top_name,
                delta=f"{top_total:,} incidents",
                delta_positive=False,
            )
        share = top_total / total_crimes * 100 if total_crimes > 0 else 0.0
        with col4:
            render_metric_card(
                "Top District Crime Share",
                f"{share:.1f}%",
                delta="Of State Total",
                delta_positive=False,
            )
    else:
        with col2:
            st.info("District data not available.")


def _render_district_summary_tab(district_df: pd.DataFrame) -> None:
    """Render district rankings and filterable data table."""
    render_section_header(
        title="District Crime Summary & Proportional Share",
        description=(
            "Aggregated totals, yearly breakdowns, crime rates, and murder statistics "
            "per Tamil Nadu administrative district."
        ),
    )

    if district_df.empty:
        render_empty_state(
            "Tamil Nadu district summary data (district_summary.csv) not found. "
            "Run the Tamil Nadu analytics pipeline to generate it."
        )
        return

    # ── Search filter with validation ─────────────────────────────────────
    search_raw = st.text_input(
        "Filter Districts by Name",
        placeholder="e.g. Chennai, Coimbatore, Madurai…",
        max_chars=60,
    )
    search_query = search_raw.strip()

    # Validate: disallow suspicious characters
    suspicious = set("<>{}[]|\\^`")
    if any(c in suspicious for c in search_query):
        st.warning("Filter query contains unsupported characters. Please use plain text.")
        search_query = ""

    filtered_df = district_df.copy()
    if search_query and COL_DISTRICT in district_df.columns:
        filtered_df = district_df[
            district_df[COL_DISTRICT].str.contains(search_query, case=False, na=False, regex=False)
        ]

    st.caption(f"Showing **{len(filtered_df)}** of **{len(district_df)}** districts.")

    # Select display columns that actually exist
    display_cols = [c for c in [
        COL_DISTRICT, "crime_count_2020", "crime_count_2021", "crime_count_2022",
        COL_TOTAL, COL_SHARE, COL_RATE, COL_MURDER, COL_MURDER_RATE,
    ] if c in filtered_df.columns]

    # Rename for readability
    display_df = filtered_df[display_cols].rename(columns=DISPLAY_LABELS)

    # Format numeric columns
    fmt = {}
    if "Share % (2022)" in display_df.columns:
        fmt["Share % (2022)"] = "{:.2f}%"
    if "Crime Rate (2022)" in display_df.columns:
        fmt["Crime Rate (2022)"] = "{:.1f}"
    if "Murder Rate" in display_df.columns:
        fmt["Murder Rate"] = "{:.2f}"

    if fmt:
        st.dataframe(
            display_df.style.format(fmt),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.dataframe(display_df, use_container_width=True, hide_index=True)

    # ── Bar chart of top 10 by total crimes ──────────────────────────────
    if COL_TOTAL in district_df.columns and COL_DISTRICT in district_df.columns:
        st.markdown("#### Top 10 Districts by Total Incidents (2020–2022)")
        top10 = (
            district_df[[COL_DISTRICT, COL_TOTAL]]
            .sort_values(COL_TOTAL, ascending=False)
            .head(10)
            .set_index(COL_DISTRICT)
            .rename(columns={COL_TOTAL: "Total Crimes"})
        )
        st.bar_chart(top10, use_container_width=True)


def _render_yearly_trends_tab(trends_df: pd.DataFrame) -> None:
    """Render longitudinal yearly crime trend data."""
    render_section_header(
        title="Year-over-Year Crime Trajectory",
        description=(
            "Annual incident count progression from 2014 (historical NCRB benchmark) "
            "through 2022, including year-over-year percentage changes."
        ),
    )

    if trends_df.empty:
        render_empty_state(
            "Tamil Nadu yearly trends data (yearly_trends.csv) not found."
        )
        return

    # Clean display columns
    display_cols = [c for c in [COL_YEAR, COL_YEARLY_COUNT, COL_YOY, "reporting_scope", "context_notes"] if c in trends_df.columns]
    display_df = trends_df[display_cols].rename(columns={
        COL_YEAR: "Year",
        COL_YEARLY_COUNT: "Total Crime Count",
        COL_YOY: "YoY Change (%)",
        "reporting_scope": "Reporting Scope",
        "context_notes": "Context Notes",
    })

    # Format YoY percentage
    fmt = {}
    if "YoY Change (%)" in display_df.columns:
        fmt["YoY Change (%)"] = "{:.1f}%"

    if fmt:
        st.dataframe(
            display_df.style.format(fmt),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.dataframe(display_df, use_container_width=True, hide_index=True)

    # ── Line chart ────────────────────────────────────────────────────────
    if COL_YEAR in trends_df.columns and COL_YEARLY_COUNT in trends_df.columns:
        chart_data = (
            trends_df[[COL_YEAR, COL_YEARLY_COUNT]]
            .set_index(COL_YEAR)
            .rename(columns={COL_YEARLY_COUNT: "Total Crime Count"})
        )
        st.line_chart(chart_data, use_container_width=True)


def _render_figures_tab() -> None:
    """Render visual figures saved during Day 3 pipeline execution."""
    render_section_header(
        title="Generated Analytical Visualizations",
        description=(
            "High-resolution publication figures produced during Day 3 "
            "Tamil Nadu analytics pipeline execution."
        ),
    )

    # Use exact filenames that exist in outputs/tamil_nadu/
    figures = [
        ("district_crime_distribution.png", "District Crime Distribution (Total Incidents per District)"),
        ("yearly_crime_trends.png", "Yearly Crime Trend Comparison (2020–2022)"),
        ("crime_category_distribution.png", "Crime Category Distribution by IPC Classification"),
        ("district_comparison.png", "District-Level Comparative Analysis"),
    ]

    rendered_any = False
    for fname, title in figures:
        fig_path = OUTPUTS_DIR / fname
        if fig_path.exists():
            st.markdown(f"#### {title}")
            st.image(str(fig_path), caption=title, use_container_width=True)
            st.markdown("---")
            rendered_any = True

    if not rendered_any:
        render_empty_state(
            "No visualization figures found in outputs/tamil_nadu/. "
            "Run the Tamil Nadu analytics pipeline to generate them."
        )
