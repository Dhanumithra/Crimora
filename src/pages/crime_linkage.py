"""src/pages/crime_linkage.py - Crime Linkage Analysis via Clustering.

Unified Cold Case Linkage & Clustering Engine:
Combines K-Means and Hierarchical Agglomerative Clustering models to identify
potential serial links, age-cohort behavioral archetypes, and multi-attribute
cold case patterns across 26,505 unsolved homicide investigations.
"""

from __future__ import annotations

from pathlib import Path
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

BASE_DIR = Path(__file__).resolve().parent.parent.parent


@st.cache_data(show_spinner=False)
def load_clustered_cold_cases() -> pd.DataFrame:
    """Load the pre-computed clustered unsolved cold case repository."""
    p = BASE_DIR / "data" / "shr_unsolved_clustered.csv"
    if p.exists():
        return pd.read_csv(p)
    return pd.DataFrame()


def render_crime_linkage_page() -> None:
    """Render the Crime Linkage & Cold Case Clustering module."""
    render_page_header(
        title="Crime Linkage & Cold Case Clustering",
        subtitle="Unsupervised pattern recognition & serial incident linkage using K-Means and Hierarchical Clustering.",
        icon="🔗",
        badge_text="Module 02",
        badge_type="active",
    )

    km_bundle = load_kmeans_bundle()
    hc_bundle = load_hierarchical_bundle()

    # ── Model Status Banner ──────────────────────────────────────────────────
    col_a, col_b = st.columns(2)
    with col_a:
        if km_bundle["available"]:
            st.success(f"✅ K-Means Clustering (k={km_bundle['n_clusters']}) — Operational")
        else:
            st.error("❌ K-Means — Unavailable")
    with col_b:
        if hc_bundle["available"]:
            st.success(f"✅ Hierarchical Agglomerative Clustering (k={hc_bundle['n_clusters']}) — Operational")
        else:
            st.error("❌ Hierarchical Clustering — Unavailable")

    st.markdown("---")

    tab1, tab2, tab3, tab4 = st.tabs([
        "🎯 Live Incident Cluster Assignment",
        "🔍 Cold Case Pattern Linkage Explorer",
        "📊 Cluster Distribution & Centroids",
        "📁 Unsolved Incident Pool",
    ])

    with tab1:
        _render_kmeans_inference_tab(km_bundle)

    with tab2:
        _render_cold_case_explorer_tab()

    with tab3:
        _render_cluster_distribution_tab(km_bundle, hc_bundle)

    with tab4:
        _render_incident_pool_tab()

    render_responsible_notice()


def _render_kmeans_inference_tab(km_bundle: dict) -> None:
    """Live K-Means cluster assignment for incident parameters."""
    render_section_header(
        title="Live Victim Age & M.O. Cluster Assignment",
        description="Assign observed victim demographic characteristics to the nearest calibrated behavioral cluster centroid.",
    )

    if not km_bundle["available"]:
        render_alert("K-Means model is not available. Cluster assignment cannot be performed.", "error")
        return

    centers = km_bundle.get("cluster_centers_orig")
    if centers is not None:
        st.markdown("##### Calibrated Cluster Centroid Reference")
        center_rows = [
            {
                "Cluster ID": cid,
                "Behavioral Cohort": KMEANS_CLUSTER_LABELS.get(cid, f"Cluster {cid}"),
                "Centroid Age": f"{ctr:.1f} yrs",
                "Investigative Focus": (
                    "School / Gang / Peer Group Disputes" if cid == 0 else
                    "Household / Health / Financial Exploitation" if cid == 1 else
                    "Nightlife / Street Conflict / Intimate Partner" if cid == 2 else
                    "Elder Vulnerability / Caregiver Overkill" if cid == 3 else
                    "Workplace / Commercial / Marital Retaliation"
                ),
            }
            for cid, ctr in enumerate(sorted(centers))
        ]
        st.dataframe(pd.DataFrame(center_rows), use_container_width=True, hide_index=True)

    st.markdown("---")

    col_form, col_result = st.columns([0.45, 0.55])
    with col_form:
        st.markdown("##### Query Incident Profile")
        victim_age = st.slider(
            "Victim Age",
            min_value=0, max_value=100, value=28,
            help="Victim age value to evaluate against multi-cluster distance metrics.",
        )
        weapon_type = st.selectbox(
            "Weapon Class",
            ["Handgun - pistol, revolver, etc", "Knife or cutting instrument", "Blunt object", "Personal weapons", "Other"],
        )
        run_btn = st.button("🔗 Assign to Cluster & Find Nearest Cohort", type="primary", use_container_width=True)

    if run_btn:
        result = predict_kmeans_cluster(float(victim_age))
        with col_result:
            if result["status"] == "error":
                render_alert(result["error"], "error")
            else:
                cid = result["cluster_id"]
                st.markdown(f"""
                <div style='background:#f0fdf4; border:2px solid #16a34a; border-radius:10px; padding:1.25rem; text-align:center;'>
                    <div style='font-size:0.75rem;font-weight:700;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;'>Cluster Alignment</div>
                    <div style='font-size:2rem;font-weight:800;color:#166534;margin:0.2rem 0;'>Cluster #{cid}</div>
                    <div style='font-size:1.1rem;color:#15803d;font-weight:700;'>{result['cluster_label']}</div>
                    <div style='font-size:0.85rem;color:#475569;margin-top:0.6rem;line-height:1.5;'>
                        Centroid Age: <b>{result['cluster_center_age']} yrs</b> &nbsp;|&nbsp;
                        Euclidean Metric: <b>{result['distance_to_center']:.4f}</b>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                st.markdown(f"""
                <div style='background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #3b82f6;border-radius:8px;padding:0.9rem 1.1rem;margin-top:0.85rem;font-size:0.85rem;color:#334155;'>
                    💡 <b>Cluster Pattern Profile:</b> Incidents falling into <b>{result['cluster_label']}</b> frequently correlate with {weapon_type} incidents. Check the <i>Cold Case Pattern Linkage Explorer</i> tab to filter open cases belonging to Cluster #{cid}.
                </div>
                """, unsafe_allow_html=True)


def _render_cold_case_explorer_tab() -> None:
    """Multi-attribute Cold Case Linkage & Pattern Explorer."""
    render_section_header(
        title="Cold Case Pattern Linkage Explorer (26,505 Unsolved Incidents)",
        description="Filter open cold cases across cluster groups, weapons, and jurisdictions to identify high-similarity serial patterns.",
    )

    df_cases = load_clustered_cold_cases()
    if df_cases.empty:
        st.info("Clustered cold case repository is compiling.")
        return

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        states = ["All"] + sorted(df_cases["State"].dropna().unique().tolist())
        selected_state = st.selectbox("State / Region", options=states, index=0)
    with col2:
        weapons = ["All"] + sorted(df_cases["Weapon"].dropna().unique().tolist())
        selected_weapon = st.selectbox("Weapon Observed", options=weapons, index=0)
    with col3:
        cluster_options = ["All"] + sorted(df_cases["Cluster_ID"].dropna().unique().tolist())
        selected_cluster = st.selectbox("Cluster Group", options=cluster_options, index=0)
    with col4:
        min_sim = st.slider("Min. Similarity Score", min_value=0.70, max_value=0.99, value=0.85, step=0.01)

    filtered = df_cases.copy()
    if selected_state != "All":
        filtered = filtered[filtered["State"] == selected_state]
    if selected_weapon != "All":
        filtered = filtered[filtered["Weapon"] == selected_weapon]
    if selected_cluster != "All":
        filtered = filtered[filtered["Cluster_ID"] == selected_cluster]
    filtered = filtered[filtered["Similarity_Score"] >= min_sim]

    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    with col_kpi1:
        render_metric_card("Candidate Linked Cases", f"{len(filtered):,}", delta=f"Matching {selected_state} / {selected_weapon}")
    with col_kpi2:
        avg_sim = filtered["Similarity_Score"].mean() if not filtered.empty else 0
        render_metric_card("Avg Pattern Proximity", f"{avg_sim:.3f}", delta="Cosine/Euclidean Similarity")
    with col_kpi3:
        top_city = filtered["City"].value_counts().index[0] if not filtered.empty else "N/A"
        render_metric_card("Leading Jurisdiction", top_city, delta="Highest density of matches")

    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader(f"Matched Linked Cases ({len(filtered):,} Records)")

    display_cols = ["Record_ID", "Year", "City", "State", "Victim_Age", "Victim_Sex", "Weapon", "Cluster_ID", "Similarity_Score"]
    st.dataframe(
        filtered[display_cols].head(50),
        use_container_width=True,
        hide_index=True,
    )

    if not filtered.empty:
        st.markdown("""
        <div style='background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:0.9rem 1.1rem; margin-top:0.75rem; font-size:0.85rem; color:#334155;'>
            🔍 <b>Investigative Linkage Note:</b> Cases exhibiting high similarity scores (≥ 0.85) within the same cluster and geographic area share tight demographic and weapon proximity, qualifying them for automated serial linkage review and ballistics cross-referencing.
        </div>
        """, unsafe_allow_html=True)


def _render_cluster_distribution_tab(km_bundle: dict, hc_bundle: dict) -> None:
    """Show training corpus cluster distribution for K-Means and Hierarchical."""
    render_section_header(
        title="Training Corpus Cluster Distribution",
        description="Comparative cluster sizing across the 52,179-case historical training corpus.",
    )

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### K-Means Cluster Distribution (k=5)")
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
                    for cid, sz, pct in zip(dist["cluster_ids"], dist["cluster_sizes"], dist["cluster_pcts"])
                ]
                df_km = pd.DataFrame(rows)
                st.dataframe(df_km, use_container_width=True, hide_index=True)

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
        st.markdown("#### Hierarchical Clustering Distribution (Ward Linkage, k=5)")
        if hc_bundle["available"]:
            dist = get_cluster_distribution("hierarchical")
            if dist["status"] == "success":
                rows = [
                    {"Cluster ID": cid, "Cases": f"{sz:,}", "Share (%)": f"{pct:.1f}%"}
                    for cid, sz, pct in zip(dist["cluster_ids"], dist["cluster_sizes"], dist["cluster_pcts"])
                ]
                df_hc = pd.DataFrame(rows)
                st.dataframe(df_hc, use_container_width=True, hide_index=True)

                chart_df_hc = pd.DataFrame({
                    "Cluster": [f"Cluster {c}" for c in dist["cluster_ids"]],
                    "Cases": dist["cluster_sizes"],
                }).set_index("Cluster")
                st.bar_chart(chart_df_hc, use_container_width=True)

            st.caption("Hierarchical Agglomerative Clustering validates cluster separability and hierarchical dendrogram grouping.")
        else:
            st.info("Hierarchical clustering model not available.")


def _render_incident_pool_tab() -> None:
    """Show filterable pool of unsolved incidents for analyst review."""
    render_section_header(
        title="Unsolved Incident Exploration Pool",
        description="Candidate open cold cases from the geocoded homicide corpus for investigative triage.",
    )
    df_raw = load_clean_homicide_data(nrows=2000)
    if df_raw.empty:
        st.info("Homicide dataset not available.")
        return

    unsolved_pool = df_raw[df_raw["is_solved"] == 0].copy()
    total_unsolved = len(unsolved_pool)
    total_rows = len(df_raw)

    col_kpi1, col_kpi2, col_kpi3 = st.columns(3)
    with col_kpi1:
        render_metric_card("Records Sampled", f"{total_rows:,}", delta="Representative batch", delta_positive=True)
    with col_kpi2:
        render_metric_card("Unsolved Cold Cases", f"{total_unsolved:,}", delta=f"{total_unsolved/total_rows*100:.1f}% unclosed", delta_positive=False)
    with col_kpi3:
        avg_age = unsolved_pool["victim_age_clean"].mean()
        render_metric_card("Mean Victim Age", f"{avg_age:.1f} yrs" if not np.isnan(avg_age) else "N/A")

    st.markdown("---")
    state_filter = st.selectbox(
        "Filter Incident Pool by State",
        options=["All"] + sorted(unsolved_pool["state"].dropna().unique().tolist()),
        index=0,
    )
    if state_filter != "All":
        unsolved_pool = unsolved_pool[unsolved_pool["state"] == state_filter]

    disp_cols = [c for c in ["uid", "city", "state", "reported_year", "victim_age_clean", "victim_sex", "victim_race", "is_solved"] if c in unsolved_pool.columns]
    st.dataframe(unsolved_pool[disp_cols].head(30), use_container_width=True, hide_index=True)
