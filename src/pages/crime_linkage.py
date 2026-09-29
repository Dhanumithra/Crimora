"""src/pages/crime_linkage.py - Crime Linkage Analysis via Clustering.

Day 7: Integrates available clustering models (K-Means + Hierarchical
Agglomerative Clustering) for victim-age-based grouping analysis.
ANN and BBN are not available (missing runtime dependencies) — displayed clearly.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import streamlit as st

from src.services.data_service import load_clean_homicide_data
from src.services.model_service import (
    predict_kmeans_cluster,
    get_cluster_distribution,
    load_kmeans_bundle,
    load_hierarchical_bundle,
    KMEANS_CLUSTER_LABELS,
)
from src.ui.components import (
    render_page_header,
    render_section_header,
    render_alert,
    render_responsible_notice,
    render_metric_card,
)


def render_crime_linkage_page() -> None:
    """Render the Crime Linkage Analysis page with integrated clustering models."""
    render_page_header(
        title="Crime Linkage Analysis",
        subtitle="Victim age-based clustering using K-Means and Hierarchical Agglomerative Clustering (Person A models).",
        icon="🔗",
        badge_text="Person A Models Integrated",
        badge_type="active",
    )

    km_bundle = load_kmeans_bundle()
    hc_bundle = load_hierarchical_bundle()

    # ── Model availability banner ────────────────────────────────────────────
    col_a, col_b = st.columns(2)
    with col_a:
        if km_bundle["available"]:
            st.success(f"✅ K-Means (k={km_bundle['n_clusters']}) — Loaded")
        else:
            st.error("❌ K-Means — Unavailable (model file missing)")
    with col_b:
        if hc_bundle["available"]:
            st.success(f"✅ Hierarchical Clustering (k={hc_bundle['n_clusters']}) — Loaded")
        else:
            st.error("❌ Hierarchical Clustering — Unavailable (model file missing)")

    st.markdown("---")

    tab1, tab2, tab3 = st.tabs([
        "Live Cluster Assignment (K-Means)",
        "Training Cluster Distribution",
        "Unlinked Incident Pool",
    ])

    with tab1:
        _render_kmeans_inference_tab(km_bundle)

    with tab2:
        _render_cluster_distribution_tab(km_bundle, hc_bundle)

    with tab3:
        _render_incident_pool_tab()

    render_responsible_notice()


def _render_kmeans_inference_tab(km_bundle: dict) -> None:
    """Live K-Means cluster assignment for a given victim age."""
    render_section_header(
        title="Live Victim Age Cluster Assignment",
        description="K-Means assigns a victim age to one of 5 age-based behavioral clusters trained on the homicide corpus.",
    )

    if not km_bundle["available"]:
        render_alert("K-Means model is not available. Cluster assignment cannot be performed.", "error")
        return

    # Show cluster centers
    centers = km_bundle.get("cluster_centers_orig")
    if centers is not None:
        st.markdown("##### Fitted Cluster Center Ages (Original Scale)")
        center_rows = [
            {"Cluster ID": cid, "Label": KMEANS_CLUSTER_LABELS.get(cid, f"Cluster {cid}"),
             "Center Age (yrs)": f"{ctr:.1f}"}
            for cid, ctr in enumerate(sorted(centers))
        ]
        st.dataframe(pd.DataFrame(center_rows), use_container_width=True, hide_index=True)

    st.markdown("---")

    col_form, col_result = st.columns([1, 1])
    with col_form:
        st.markdown("##### Enter Victim Age for Cluster Query")
        victim_age = st.slider(
            "Victim Age",
            min_value=0, max_value=100, value=28,
            help="Victim age value to assign to the nearest K-Means cluster centroid.",
        )
        run_btn = st.button("Assign to Cluster", type="primary", key="kmeans_infer_btn")

    if run_btn:
        result = predict_kmeans_cluster(float(victim_age))
        with col_result:
            if result["status"] == "error":
                render_alert(result["error"], "error")
            else:
                st.markdown(f"""
                <div style='background:#f0fdf4; border:2px solid #16a34a; border-radius:10px; padding:1.1rem; margin-top:0.5rem; text-align:center;'>
                    <div style='font-size:0.8rem;font-weight:700;color:#475569;margin-bottom:0.3rem;'>K-MEANS CLUSTER ASSIGNMENT</div>
                    <div style='font-size:1.8rem;font-weight:800;color:#15803d;'>Cluster {result['cluster_id']}</div>
                    <div style='font-size:1rem;color:#166534;font-weight:600;margin-top:0.2rem;'>{result['cluster_label']}</div>
                    <div style='font-size:0.825rem;color:#64748b;margin-top:0.5rem;'>
                        Center: {result['cluster_center_age']} yrs &nbsp;|&nbsp;
                        Distance to centroid: {result['distance_to_center']:.4f}
                    </div>
                </div>
                """, unsafe_allow_html=True)


def _render_cluster_distribution_tab(km_bundle: dict, hc_bundle: dict) -> None:
    """Show training corpus cluster distribution for K-Means and Hierarchical."""
    render_section_header(
        title="Training Corpus Cluster Distribution",
        description="How the 52,179-case training corpus is distributed across the 5 fitted clusters.",
    )

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### K-Means Distribution")
        if km_bundle["available"]:
            dist = get_cluster_distribution("kmeans")
            if dist["status"] == "success":
                rows = [
                    {
                        "Cluster ID": cid,
                        "Label": KMEANS_CLUSTER_LABELS.get(cid, f"Cluster {cid}"),
                        "Cases": f"{sz:,}",
                        "Share (%)": f"{pct:.1f}%",
                    }
                    for cid, sz, pct in zip(
                        dist["cluster_ids"], dist["cluster_sizes"], dist["cluster_pcts"]
                    )
                ]
                df_km = pd.DataFrame(rows)
                st.dataframe(df_km, use_container_width=True, hide_index=True)

                # Bar chart of cluster sizes
                chart_df = pd.DataFrame({
                    "Cluster": [KMEANS_CLUSTER_LABELS.get(c, f"C{c}") for c in dist["cluster_ids"]],
                    "Cases": dist["cluster_sizes"],
                }).set_index("Cluster")
                st.bar_chart(chart_df, use_container_width=True)
            else:
                render_alert(dist["error"], "warning")
        else:
            st.info("K-Means model not available.")

    with col2:
        st.markdown("#### Hierarchical Clustering Distribution")
        if hc_bundle["available"]:
            dist = get_cluster_distribution("hierarchical")
            if dist["status"] == "success":
                rows = [
                    {"Cluster ID": cid, "Cases": f"{sz:,}", "Share (%)": f"{pct:.1f}%"}
                    for cid, sz, pct in zip(
                        dist["cluster_ids"], dist["cluster_sizes"], dist["cluster_pcts"]
                    )
                ]
                df_hc = pd.DataFrame(rows)
                st.dataframe(df_hc, use_container_width=True, hide_index=True)

                chart_df_hc = pd.DataFrame({
                    "Cluster": [f"Cluster {c}" for c in dist["cluster_ids"]],
                    "Cases": dist["cluster_sizes"],
                }).set_index("Cluster")
                st.bar_chart(chart_df_hc, use_container_width=True)

            render_alert(
                "Hierarchical Agglomerative Clustering (Ward linkage) does not support predict() on new data points. "
                "The distribution shown reflects the fitted labels from the 52,179-case training corpus.",
                "info",
            )
        else:
            st.info("Hierarchical clustering model not available.")


def _render_incident_pool_tab() -> None:
    """Show filterable pool of unsolved incidents for analyst review."""
    render_section_header(
        title="Unsolved Incident Exploration Pool",
        description="Candidate open cases from data/processed/homicide_clean.csv for manual cluster review.",
    )
    df_raw = load_clean_homicide_data(nrows=1000)
    if df_raw.empty:
        st.info("Homicide dataset not available.")
        return

    unsolved_pool = df_raw[df_raw["is_solved"] == 0].copy()
    total_unsolved = len(unsolved_pool)
    total_rows = len(df_raw)

    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    with col_kpi1:
        render_metric_card("Records Loaded", f"{total_rows:,}", delta="First 1,000 rows", delta_positive=True)
    with col_kpi2:
        render_metric_card("Unsolved Cases", f"{total_unsolved:,}", delta=f"{total_unsolved/total_rows*100:.1f}% of sample", delta_positive=False)
    with col_kpi3:
        avg_age = unsolved_pool["victim_age_clean"].mean()
        render_metric_card("Avg Victim Age (Unsolved)", f"{avg_age:.1f} yrs" if not np.isnan(avg_age) else "N/A")

    st.markdown("---")
    state_filter = st.selectbox(
        "Filter by State",
        options=["All"] + sorted(unsolved_pool["state"].dropna().unique().tolist()),
        index=0,
    )
    if state_filter != "All":
        unsolved_pool = unsolved_pool[unsolved_pool["state"] == state_filter]

    disp_cols = [c for c in ["city", "state", "reported_year", "victim_age_clean", "victim_sex", "victim_race", "is_solved"] if c in unsolved_pool.columns]
    st.dataframe(unsolved_pool[disp_cols].head(15), use_container_width=True, hide_index=True)
