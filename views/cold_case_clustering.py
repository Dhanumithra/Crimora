import os
import joblib
import pandas as pd
import numpy as np
import streamlit as st

@st.cache_data
def load_clustering_artifacts():
    """Loads dataset and trained clustering models."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_path = os.path.join(base_dir, 'data', 'shr_unsolved_clustered.csv')
    kmeans_path = os.path.join(base_dir, 'models', 'kmeans_model.pkl')
    if not os.path.exists(kmeans_path):
        kmeans_path = os.path.join(base_dir, 'models', 'kmeans_serial.pkl')
    
    df = None
    kmeans = None

    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
    elif os.path.exists(os.path.join(base_dir, 'datasets', 'shr_unsolved_clustered.csv')):
        df = pd.read_csv(os.path.join(base_dir, 'datasets', 'shr_unsolved_clustered.csv'))
        
    if os.path.exists(kmeans_path):
        kmeans = joblib.load(kmeans_path)

    return df, kmeans

def render_clustering_page():
    st.header("🔗 Linked Cold Case & Pattern Cluster Analysis")
    st.markdown("Discover linked unsolved homicide cases using K-Means & Hierarchical Clustering algorithms.")

    df_clustered, kmeans_model = load_clustering_artifacts()

    if df_clustered is None:
        st.warning("Clustered dataset file not found in `data/` or `datasets/`. Displaying interactive filter view.")
        # Mock dataset generator for testing if offline
        df_clustered = pd.DataFrame({
            'Record_ID': [f"CASE-{i:05d}" for i in range(1001, 1051)],
            'State': np.random.choice(['California', 'Texas', 'Florida', 'New York'], 50),
            'Weapon': np.random.choice(['Handgun', 'Knife', 'Blunt object'], 50),
            'Cluster_ID': np.random.choice([0, 1, 2, 3], 50),
            'Similarity_Score': np.random.uniform(0.72, 0.98, 50).round(2),
            'Year': np.random.randint(1990, 2023, 50)
        })

    # Sidebar Filter Options
    st.subheader("Filter Cold Cases by Cluster Attributes")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        default_states = list(df_clustered['State'].unique()[:2])
        selected_state = st.multiselect("Select State/Region", options=df_clustered['State'].unique(), default=default_states)
    with col2:
        default_weapons = list(df_clustered['Weapon'].unique()[:2])
        selected_weapon = st.multiselect("Select Weapon", options=df_clustered['Weapon'].unique(), default=default_weapons)
    with col3:
        cluster_id = st.selectbox("Select Cluster Group", options=sorted(df_clustered['Cluster_ID'].unique()))

    # Apply Filters
    filtered_df = df_clustered[
        (df_clustered['State'].isin(selected_state)) &
        (df_clustered['Weapon'].isin(selected_weapon)) &
        (df_clustered['Cluster_ID'] == cluster_id)
    ]

    st.markdown("---")
    st.subheader(f"Identified Linked Cold Cases (Cluster #{cluster_id})")
    st.caption(f"Showing {len(filtered_df)} linked cases matching pattern criteria.")

    st.dataframe(
        filtered_df[['Record_ID', 'Year', 'State', 'Weapon', 'Similarity_Score', 'Cluster_ID']],
        use_container_width=True
    )

    if not filtered_df.empty:
        st.info("💡 **Investigative Note**: Cases grouped under the same cluster display high feature proximity across weapon choice, location, and victim profiles, indicating potential serial or linked offender patterns.")

if __name__ == "__main__":
    st.set_page_config(page_title="Cold Case Clustering", layout="wide")
    render_clustering_page()
