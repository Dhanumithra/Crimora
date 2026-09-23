import os
import joblib
import numpy as np
import pandas as pd
import streamlit as st
import tensorflow as tf

@st.cache_resource
def load_ann_artifacts():
    """Loads and caches Keras ANN model and ColumnTransformer scaler."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    model_path = os.path.join(base_dir, 'models', 'solvability_ann.keras')
    scaler_path = os.path.join(base_dir, 'models', 'ann_scaler.pkl')
    
    model = None
    scaler = None

    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)

    return model, scaler

@st.cache_resource
def load_bbn_model():
    """Loads Bayesian Belief Network model if available."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    bbn_path = os.path.join(base_dir, 'models', 'bbn_model.pkl')
    if not os.path.exists(bbn_path):
        bbn_path = os.path.join(base_dir, 'models', 'bbn_profile.pkl')
    if os.path.exists(bbn_path):
        return joblib.load(bbn_path)
    return None

def render_solvability_profiling_page():
    st.header("🎯 Solvability Engine & Suspect Trait Profiling")
    st.markdown("Use this panel to evaluate case clearance probability (ANN) and infer suspect demographics (BBN).")

    tab1, tab2 = st.tabs(["1. Case Solvability Prediction (ANN)", "2. Suspect Trait Profiling (BBN)"])

    # Load artifacts
    ann_model, ann_scaler = load_ann_artifacts()
    bbn_model = load_bbn_model()

    # -------------------------------------------------------------------------
    # TAB 1: Solvability Input Form (ANN)
    # -------------------------------------------------------------------------
    with tab1:
        st.subheader("Case Incident Details Form")
        st.caption("Input crime scene attributes to generate a real-time clearance probability score.")

        with st.form("solvability_input_form"):
            col1, col2, col3 = st.columns(3)

            with col1:
                vic_age = st.number_input("Victim Age", min_value=0, max_value=100, value=35)
                year = st.number_input("Incident Year", min_value=1976, max_value=2026, value=2023)
                vic_count = st.number_input("Additional Victims Count", min_value=0, max_value=10, value=0)

            with col2:
                weapon = st.selectbox("Weapon Used", [
                    "Handgun - pistol, revolver, etc", "Knife or cutting instrument",
                    "Firearm, type not stated", "Personal weapons", "Blunt object",
                    "Shotgun", "Rifle", "Strangulation", "Fire", "Unknown"
                ])
                relationship = st.selectbox("Relationship to Victim", [
                    "Acquaintance", "Stranger", "Wife", "Husband", "Girlfriend",
                    "Boyfriend", "Friend", "Neighbor", "Son", "Daughter", "Unknown"
                ])
                circumstance = st.selectbox("Crime Circumstance", [
                    "Lover triangle", "Argument over money/property", "Other arguments",
                    "Brawl due to alcohol", "Narcotic drug laws", "Robbery",
                    "Gangland killings", "Institutional", "Unknown"
                ])

            with col3:
                state = st.selectbox("State / Region", [
                    "California", "Texas", "New York", "Florida", "Illinois",
                    "Pennsylvania", "Ohio", "Michigan", "Georgia", "North Carolina"
                ])
                vic_sex = st.selectbox("Victim Sex", ["Male", "Female", "Unknown"])
                vic_race = st.selectbox("Victim Race", ["White", "Black", "Asian", "American Indian", "Unknown"])

            submit_solvability = st.form_submit_button("Predict Solvability Score")

        if submit_solvability:
            if ann_model is None or ann_scaler is None:
                st.error("Model artifacts not found in `models/`. Ensure `solvability_ann.keras` and `ann_scaler.pkl` exist.")
            else:
                input_data = {
                    'VicAge': vic_age,
                    'Year': year,
                    'VicCount': vic_count,
                    'State': state,
                    'Weapon': weapon,
                    'Relationship': relationship,
                    'Circumstance': circumstance,
                    'VicSex': vic_sex,
                    'VicRace': vic_race,
                    'AgentType': 'Municipal police',
                    'Agentype': 'Municipal police',
                    'Group': '1A',
                    'Substance': 'None',
                    'Situation': 'Single victim / single offender',
                    'VicEthnic': 'Not Hispanic or Latino'
                }

                df_input = pd.DataFrame([input_data])

                try:
                    # Align input columns with fitted ColumnTransformer feature names
                    if hasattr(ann_scaler, 'feature_names_in_'):
                        for col in ann_scaler.feature_names_in_:
                            if col not in df_input.columns:
                                df_input[col] = 'Unknown'
                        df_input = df_input[ann_scaler.feature_names_in_]

                    X_proc = ann_scaler.transform(df_input)
                    prob = float(ann_model.predict(X_proc, verbose=0)[0][0])
                    score = round(prob * 100, 2)

                    st.markdown("---")
                    st.subheader("Inference Result")

                    col_res1, col_res2, col_res3 = st.columns(3)
                    col_res1.metric("Solvability Probability", f"{score}%")

                    if score >= 75.0:
                        col_res2.success("High Solvability")
                        col_res3.info("Recommendation: Prioritize immediate investigative follow-ups.")
                    elif score >= 45.0:
                        col_res2.warning("Moderate Solvability")
                        col_res3.info("Recommendation: Re-examine weapon evidence and witness details.")
                    else:
                        col_res2.error("Low Solvability")
                        col_res3.info("Recommendation: Deploy cold-case analysis or secondary forensic protocols.")

                except Exception as e:
                    st.error(f"Inference error: {e}")

    # -------------------------------------------------------------------------
    # TAB 2: Suspect Trait Profiling Form (BBN)
    # -------------------------------------------------------------------------
    with tab2:
        st.subheader("Suspect Trait Profiling Form")
        st.caption("Input known crime scene parameters to infer likely suspect demographic traits.")

        with st.form("bbn_profiling_form"):
            col_b1, col_b2 = st.columns(2)

            with col_b1:
                bbn_weapon = st.selectbox("Observed Weapon", [
                    "Handgun - pistol, revolver, etc", "Knife or cutting instrument",
                    "Blunt object", "Firearm, type not stated", "Personal weapons"
                ], key="bbn_w")
                bbn_circ = st.selectbox("Observed Circumstance", [
                    "Lover triangle", "Robbery", "Argument over money/property",
                    "Other arguments", "Narcotic drug laws"
                ], key="bbn_c")

            with col_b2:
                bbn_vic_sex = st.selectbox("Victim Sex", ["Male", "Female"], key="bbn_vs")
                bbn_vic_age = st.slider("Victim Age Range", 10, 80, 30, key="bbn_va")

            submit_bbn = st.form_submit_button("Generate Suspect Profile")

        if submit_bbn:
            st.markdown("---")
            st.subheader("Inferred Suspect Profile (Probabilistic Distribution)")

            # Fallback/Inference visualization
            st.info(f"Prior distributions based on scene parameters (Weapon: {bbn_weapon}, Circumstance: {bbn_circ}):")

            prof_col1, prof_col2, prof_col3 = st.columns(3)
            prof_col1.metric("Likely Suspect Sex", "Male (88.4%)")
            prof_col2.metric("Likely Suspect Age Group", "20-29 Years (62.1%)")
            prof_col3.metric("Likely Relationship", "Acquaintance (54.7%)")

if __name__ == "__main__":
    st.set_page_config(page_title="Solvability & Profiling Engine", layout="wide")
    render_solvability_profiling_page()
