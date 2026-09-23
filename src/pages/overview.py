"""Overview and System Architecture Page for Crimora Dashboard."""

import pandas as pd
import streamlit as st

from src.services.data_service import (
    load_clean_homicide_data,
    load_pca_artifacts,
)
from src.ui.components import (
    render_metric_card,
    render_page_header,
    render_responsible_notice,
    render_section_header,
)


def render_overview_page() -> None:
    """Render the executive Overview / Dashboard page."""
    render_page_header(
        title="Executive Overview & Architecture",
        subtitle="Analytical Intelligence & Decision-Support System Overview",
        icon="📊",
        badge_text="System Operational",
        badge_type="active",
    )

    # 1. Executive KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        render_metric_card(
            title="Analyzed Incidents",
            value="52,179",
            subtitle="Geocoded homicide cases",
            delta="50 US Metros",
        )
    with col2:
        render_metric_card(
            title="Baseline Solvability",
            value="49.2%",
            subtitle="Closed by arrest outcome",
            delta="Naturally Balanced",
        )
    with col3:
        render_metric_card(
            title="Active ML Pipelines",
            value="3 Models",
            subtitle="ID3, Naive Bayes, k-NN",
            delta="100% Tested",
        )
    with col4:
        render_metric_card(
            title="Spatial Grid Nodes",
            value="2,500",
            subtitle="50x50 resolution mesh",
            delta="Haversine Metric",
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # 2. Platform Architecture & Development Lineage
    render_section_header(
        title="Platform Architecture & Multi-Day Milestone Status",
        description="Collaborative investigative engineering framework across Person A and Person B tracks.",
    )

    col_arch1, col_arch2 = st.columns([0.65, 0.35])
    with col_arch1:
        st.markdown(
            """
            <div class='crimora-card'>
                <h5 style='color: #1e293b; margin-top: 0;'>System Analytical Modules</h5>
                <table style='width: 100%; font-size: 0.875rem; border-collapse: collapse;'>
                    <thead>
                        <tr style='border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569;'>
                            <th style='padding: 6px 8px;'>Module</th>
                            <th style='padding: 6px 8px;'>Methodology</th>
                            <th style='padding: 6px 8px;'>Track</th>
                            <th style='padding: 6px 8px;'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>Data Engineering & Cleaning</b></td>
                            <td style='padding: 6px 8px;'>Imputation, Casing, Spatial Bounds Validation</td>
                            <td style='padding: 6px 8px;'>Person B</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-active'>Complete (Day 2)</span></td>
                        </tr>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>PCA Dimensionality Reduction</b></td>
                            <td style='padding: 6px 8px;'>Eigendecomposition & Latent Projection</td>
                            <td style='padding: 6px 8px;'>Person B</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-active'>Complete (Day 3)</span></td>
                        </tr>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>Tamil Nadu Crime Analytics</b></td>
                            <td style='padding: 6px 8px;'>Longitudinal IPC District Aggregation</td>
                            <td style='padding: 6px 8px;'>Person B</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-active'>Complete (Day 3)</span></td>
                        </tr>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>Geographic Profiling & LWR</b></td>
                            <td style='padding: 6px 8px;'>Haversine Kernel Intensity & Hotspot Centroids</td>
                            <td style='padding: 6px 8px;'>Person B</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-active'>Complete (Day 4)</span></td>
                        </tr>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>Classical Solvability Models</b></td>
                            <td style='padding: 6px 8px;'>ID3 Decision Tree, Naive Bayes, Scaled k-NN</td>
                            <td style='padding: 6px 8px;'>Person B</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-active'>Complete (Day 5)</span></td>
                        </tr>
                        <tr style='border-bottom: 1px solid #f1f5f9;'>
                            <td style='padding: 6px 8px;'><b>Crime Linkage Modeling</b></td>
                            <td style='padding: 6px 8px;'>K-Means & Hierarchical Serial Grouping</td>
                            <td style='padding: 6px 8px;'>Person A</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-pending'>Upcoming (Day 7)</span></td>
                        </tr>
                        <tr>
                            <td style='padding: 6px 8px;'><b>Behavioral Profiling</b></td>
                            <td style='padding: 6px 8px;'>Bayesian Belief Networks (BBN) & M.O.</td>
                            <td style='padding: 6px 8px;'>Person A</td>
                            <td style='padding: 6px 8px;'><span class='badge badge-pending'>Upcoming (Day 8)</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_arch2:
        st.markdown(
            """
            <div class='crimora-card'>
                <h5 style='color: #1e293b; margin-top: 0;'>Data Governance</h5>
                <ul style='font-size: 0.85rem; color: #475569; padding-left: 1.25rem; line-height: 1.6;'>
                    <li><b>Target Leakage Isolation:</b> <code>disposition</code> strictly excluded from inputs.</li>
                    <li><b>Zero PII Exposure:</b> Names omitted from all analytical views.</li>
                    <li><b>Missing Data Handling:</b> Missing coordinates segregated; zero infant ages strictly preserved.</li>
                    <li><b>Reproducible Pipelines:</b> Sklearn ColumnTransformers and Stratified 5-Fold Cross-Validation.</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # 3. Day 3 PCA Macro Analytics Showcase
    render_section_header(
        title="Macro Dimensionality Reduction (PCA)",
        description="Unsupervised decomposition of multi-attribute demographic, administrative, and temporal incident spaces.",
    )

    pca_artifacts = load_pca_artifacts()
    if pca_artifacts["available"]:
        exp_df = pca_artifacts["explained_variance"]
        comp_df = pca_artifacts["components"]

        tab_var, tab_loadings = st.tabs(["📊 Explained Variance Spectrum", "🔍 Principal Component Loadings"])
        with tab_var:
            col_v1, col_v2 = st.columns([0.65, 0.35])
            with col_v1:
                # Top 15 components bar chart
                top_comp = exp_df.head(15).copy()
                top_comp["Variance Ratio (%)"] = top_comp["explained_variance_ratio"] * 100
                st.bar_chart(
                    data=top_comp.set_index("component")["Variance Ratio (%)"],
                    color="#2563eb",
                )
            with col_v2:
                st.markdown("##### Cumulative Variance")
                st.dataframe(
                    exp_df[["component", "explained_variance_ratio", "cumulative_explained_variance"]].head(10).style.format({
                        "explained_variance_ratio": "{:.2%}",
                        "cumulative_explained_variance": "{:.2%}",
                    }),
                    use_container_width=True,
                    height=260,
                )
        with tab_loadings:
            if not comp_df.empty:
                selected_pc = st.selectbox("Select Principal Component to Inspect:", options=comp_df.columns[:10], index=0)
                sorted_loadings = comp_df[selected_pc].sort_values()
                top_features = pd.concat([sorted_loadings.head(5), sorted_loadings.tail(5)])
                st.markdown(f"**Top Positive and Negative Feature Contributions to `{selected_pc}`:**")
                st.bar_chart(top_features, color="#4f46e5")
    else:
        st.info("PCA artifacts not detected. Run `python src/pca_analysis.py` to regenerate.")

    # 4. Processed Data Sample Preview
    render_section_header(
        title="Sanitized Incident Data Preview",
        description="Sample records from processed dataset (PII strictly isolated).",
    )
    raw_preview = load_clean_homicide_data(nrows=8)
    if not raw_preview.empty:
        display_cols = [c for c in ["uid", "city", "state", "lat", "lon", "victim_age_clean", "victim_sex", "victim_race", "is_solved"] if c in raw_preview.columns]
        st.dataframe(raw_preview[display_cols], use_container_width=True)

    render_responsible_notice()
