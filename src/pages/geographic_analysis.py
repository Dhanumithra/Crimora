"""Geographic Profiling and Spatial Hotspot Analysis Page."""

import os
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

from src.config import GEOGRAPHIC_OUTPUTS_DIR
from src.services.data_service import load_geographic_artifacts
from src.ui.components import (
    render_metric_card,
    render_page_header,
    render_responsible_notice,
    render_section_header,
)


def render_geographic_analysis_page() -> None:
    """Render the Geographic Profiling and Hotspot analysis page."""
    render_page_header(
        title="Geographic Profiling & Hotspot Analytics",
        subtitle="Distance-Weighted Spatial Intensity & Activity-Area Estimation",
        icon="🗺️",
        badge_text="Day 4 Integrated",
        badge_type="active",
    )

    # 1. Spatial Summary KPIs
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        render_metric_card(
            title="Benchmark Region",
            value="Baltimore, MD",
            subtitle="Focal metropolitan area",
            delta="2,827 geocoded homicides",
        )
    with col2:
        render_metric_card(
            title="Spatial Grid Mesh",
            value="50 × 50",
            subtitle="2,500 evaluation nodes",
            delta="~320m resolution",
        )
    with col3:
        render_metric_card(
            title="Bandwidth (h)",
            value="0.857 km",
            subtitle="Silverman's rule of thumb",
            delta="Gaussian Kernel",
        )
    with col4:
        render_metric_card(
            title="Identified Hotspots",
            value="10 Centroids",
            subtitle=">=95th percentile cutoff",
            delta="1.0 km spatial separation",
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # 2. Interactive Folium Geospatial Map
    render_section_header(
        title="Interactive Geospatial Map (Folium / Leaflet)",
        description="Multi-layer interactive visualization with incident clusters, continuous spatial heatmap, and ranked analytical hotspot markers.",
    )

    geo_artifacts = load_geographic_artifacts()
    map_html = geo_artifacts.get("map_html")

    if map_html:
        st.markdown(
            "<div style='border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem;'>",
            unsafe_allow_html=True,
        )
        components.html(map_html, height=580, scrolling=True)
        st.markdown("</div>", unsafe_allow_html=True)
        st.caption("Layer Control in top-right toggles between Incident Points, HeatMap, and Hotspot Centroids.")
    else:
        st.warning("Interactive Folium map file not found. Run `python src/run_geographic_pipeline.py` to generate.")

    # 3. Analytical Hotspot Summary Table
    render_section_header(
        title="Analytical Hotspot Centroids",
        description="Top high-intensity concentration centroids extracted using spatial non-maximum suppression.",
    )

    hotspots_df = geo_artifacts.get("hotspot_summary")
    if not hotspots_df.empty:
        col_t1, col_t2 = st.columns([0.7, 0.3])
        with col_t1:
            st.dataframe(
                hotspots_df.style.format({
                    "latitude": "{:.5f}",
                    "longitude": "{:.5f}",
                    "estimated_intensity": "{:.4e}",
                    "normalized_intensity": "{:.3f}",
                }),
                use_container_width=True,
            )
        with col_t2:
            st.markdown(
                """
                <div class='crimora-card'>
                    <h6 style='color: #1e293b; margin: 0 0 6px 0;'>Hotspot Interpretive Guide</h6>
                    <p style='font-size: 0.8rem; color: #64748b; line-height: 1.5;'>
                        <b>Normalized Intensity:</b> Relative density scaled to [0, 1] where 1.0 represents peak municipal concentration.<br><br>
                        <b>Spatial Suppression:</b> Centroids enforce a 1.0 km minimum geodesic buffer to isolate distinct neighborhood corridors.
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )
    else:
        st.info("Hotspot summary data unavailable.")

    # 4. Diagnostic Visualizations Gallery
    render_section_header(
        title="Geographic Profiling Diagnostics Gallery",
        description="Publication-quality static spatial analytics generated during pipeline execution.",
    )

    tab1, tab2, tab3, tab4 = st.tabs([
        "📍 Incident Distribution",
        "🔥 Intensity Surface",
        "🎯 Hotspot Analysis",
        "⚖️ Incidents vs. Surface",
    ])

    plots = {
        "dist": GEOGRAPHIC_OUTPUTS_DIR / "incident_distribution.png",
        "surface": GEOGRAPHIC_OUTPUTS_DIR / "intensity_surface.png",
        "hotspot": GEOGRAPHIC_OUTPUTS_DIR / "hotspot_analysis.png",
        "compare": GEOGRAPHIC_OUTPUTS_DIR / "incidents_vs_intensity.png",
    }

    with tab1:
        if plots["dist"].exists():
            st.image(str(plots["dist"]), use_column_width=True, caption="Historical Crime Incident Spatial Distribution with 2D KDE Contours")
        else:
            st.info("Incident distribution plot not found.")

    with tab2:
        if plots["surface"].exists():
            st.image(str(plots["surface"]), use_column_width=True, caption="Continuous Geographic Activity-Area Intensity Surface (Magma Colormap)")
        else:
            st.info("Intensity surface plot not found.")

    with tab3:
        if plots["hotspot"].exists():
            st.image(str(plots["hotspot"]), use_column_width=True, caption="Hotspot Centroids Overlaid on 95th Percentile Intensity Boundary")
        else:
            st.info("Hotspot analysis plot not found.")

    with tab4:
        if plots["compare"].exists():
            st.image(str(plots["compare"]), use_column_width=True, caption="Side-by-Side Comparison: Raw Point Incidents vs. Distance-Weighted Activity Surface")
        else:
            st.info("Comparison plot not found.")

    render_responsible_notice()
