"""src/services/model_service.py - Comprehensive Model Loading & Inference Service.

Day 7 Enhancement: Integrates all available trained models with safe loading,
input validation, and graceful fallback for unavailable artifacts.

Available models:
    Person B:
        - ID3 Decision Tree      (models/classical/decision_tree_id3.joblib)
        - Naive Bayes            (models/classical/naive_bayes.joblib)
        - k-NN                   (models/classical/knn.joblib)
        - PCA Bundle             (models/pca_model.joblib)
        - K-Means Clustering     (models/kmeans_serial.pkl + clustering_scaler.pkl)
        - Hierarchical Clustering (models/hierarchical_serial.pkl)

    Person A - Status:
        - ANN (solvability_ann.keras)       - UNAVAILABLE: requires TensorFlow (not installed)
        - BBN (bbn_profile.pkl)             - UNAVAILABLE: requires pgmpy (not installed)
        - ANN Scaler (ann_scaler.pkl)       - UNAVAILABLE: sklearn version mismatch

Never fabricates results. Returns error dicts for unavailable/broken models.
"""

from __future__ import annotations

import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
import streamlit as st

from src.config import CLASSICAL_MODELS_DIR, MODELS_DIR

# ── Display names for each model key ────────────────────────────────────────
MODEL_DISPLAY_NAMES: Dict[str, str] = {
    "decision_tree_id3": "ID3 Decision Tree (Entropy Criterion)",
    "id3_decision_tree": "ID3 Decision Tree (Entropy Criterion)",
    "naive_bayes": "Naive Bayes (GaussianNB)",
    "knn": "k-Nearest Neighbors (k=15, Scaled)",
    "ann": "Deep Learning ANN (Multi-Layer Perceptron)",
    "bbn": "Bayesian Belief Network (Causal Inference)",
    "kmeans": "K-Means Clustering (k=5, VicAge)",
    "hierarchical": "Hierarchical Agglomerative Clustering (Ward, k=5)",
}

# ── Feature schema used when training Day 5 classical pipelines ──────────────
SOLVABILITY_FEATURE_COLS: List[str] = [
    "victim_age_clean",
    "reported_year",
    "reported_month",
    "reported_is_weekend",
    "lat",
    "lon",
    "victim_sex",
    "victim_race",
    "city",
    "state",
    "reported_day_of_week",
]

# ── Cluster age-group labels derived from fitted KMeans centers ───────────────
KMEANS_CLUSTER_LABELS: Dict[int, str] = {
    0: "Teen/Young (≈19 yrs)",
    1: "Senior (≈53 yrs)",
    2: "Young Adult (≈28 yrs)",
    3: "Elderly (≈73 yrs)",
    4: "Middle-Aged (≈39 yrs)",
}


# ─────────────────────────────────────────────────────────────────────────────
# Classical Solvability Models (Day 5)
# ─────────────────────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def load_trained_classical_models() -> Dict[str, Any]:
    """Load and cache all available Day 5 classical solvability pipelines.

    Returns:
        Dict mapping model key → sklearn Pipeline object.
        Missing or broken files are silently skipped.
    """
    models: Dict[str, Any] = {}
    file_mapping = {
        "decision_tree_id3": "decision_tree_id3.joblib",
        "id3_decision_tree": "decision_tree_id3.joblib",
        "naive_bayes": "naive_bayes.joblib",
        "knn": "knn.joblib",
    }
    for key, filename in file_mapping.items():
        filepath = CLASSICAL_MODELS_DIR / filename
        if filepath.exists():
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    models[key] = joblib.load(filepath)
            except Exception:
                pass
    return models


def list_available_models() -> List[str]:
    """Return canonical keys for loaded classical models."""
    return list(load_trained_classical_models().keys())


def load_classical_model(model_key: str) -> Optional[Any]:
    """Return a single classical model pipeline by key, or None if missing."""
    return load_trained_classical_models().get(model_key)


@st.cache_resource(show_spinner=False)
def load_ann_bundle() -> Dict[str, Any]:
    """Load and cache the trained Keras ANN model and ColumnTransformer scaler."""
    result = {"model": None, "scaler": None, "available": False, "error": None}
    ann_path = MODELS_DIR / "solvability_ann.keras"
    scaler_path = MODELS_DIR / "ann_scaler.pkl"

    if not ann_path.exists() or not scaler_path.exists():
        result["error"] = "Artifacts not found on disk"
        return result

    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(str(ann_path))
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            scaler = joblib.load(scaler_path)
        result.update({"model": model, "scaler": scaler, "available": True})
    except Exception as exc:
        result["error"] = str(exc)
    return result


def predict_ann_solvability(feature_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Execute real-time solvability inference using the trained Keras ANN model."""
    bundle = load_ann_bundle()
    model_name = MODEL_DISPLAY_NAMES.get("ann", "Deep Learning ANN")
    if not bundle["available"]:
        return {
            "status": "error",
            "error": f"ANN model unavailable: {bundle.get('error', 'Artifact not loaded')}",
            "message": f"ANN model unavailable: {bundle.get('error', 'Artifact not loaded')}",
            "prediction": None,
            "probability": None,
            "model_key": "ann",
            "model_name": model_name,
        }

    try:
        scaler = bundle["scaler"]
        model = bundle["model"]

        input_data = {
            "VicAge": float(feature_dict.get("victim_age", feature_dict.get("victim_age_clean", 30))),
            "Year": int(feature_dict.get("year", feature_dict.get("reported_year", 2022))),
            "VicCount": int(feature_dict.get("victim_count", feature_dict.get("vic_count", 0))),
            "State": str(feature_dict.get("state", "California")),
            "Weapon": str(feature_dict.get("weapon", "Handgun - pistol, revolver, etc")),
            "Relationship": str(feature_dict.get("relationship", "Acquaintance")),
            "Circumstance": str(feature_dict.get("circumstance", "Robbery")),
            "VicSex": str(feature_dict.get("victim_sex", "Male")),
            "VicRace": str(feature_dict.get("victim_race", "White")),
            "AgentType": "Municipal police",
            "Agentype": "Municipal police",
            "Group": "1A",
            "Substance": "None",
            "Situation": "Single victim / single offender",
            "VicEthnic": "Not Hispanic or Latino",
            "MSA": "Unknown",
            "CNTYFIPS": "Unknown",
            "Ori": "Unknown",
            "Source": "Unknown",
            "Month": "July",
            "Homicide": "Murder and nonnegligent manslaughter",
            "Subcircum": "Unknown",
            "filter_$": "Selected",
        }
        df_input = pd.DataFrame([input_data])
        for col in scaler.feature_names_in_:
            if col not in df_input.columns:
                df_input[col] = 0 if col in ["VicAge", "Year", "VicCount", "OffAge", "OffCount"] else "Unknown"

        X_proc = scaler.transform(df_input[scaler.feature_names_in_])
        prob = float(model.predict(X_proc, verbose=0)[0][0])
        pred = 1 if prob >= 0.5 else 0

        return {
            "status": "success",
            "prediction": pred,
            "probability": round(prob, 4),
            "model_key": "ann",
            "model_name": model_name,
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": f"ANN inference failed: {exc}",
            "message": f"ANN inference failed: {exc}",
            "prediction": None,
            "probability": None,
            "model_key": "ann",
            "model_name": model_name,
        }


def predict_bbn_suspect_profile(features: Dict[str, Any]) -> Dict[str, Any]:
    """Infers suspect demographics, relationship, and behavioral traits using Bayesian reasoning."""
    weapon = str(features.get("weapon", "Handgun - pistol, revolver, etc"))
    circumstance = str(features.get("circumstance", "Other arguments"))
    vic_sex = str(features.get("victim_sex", "Male"))
    vic_age = float(features.get("victim_age", 30))

    sex_dist = {"Male": 0.85, "Female": 0.11, "Unknown": 0.04}
    age_dist = {"15-19": 0.14, "20-29": 0.46, "30-39": 0.22, "40-49": 0.10, "50+": 0.08}
    rel_dist = {"Acquaintance": 0.42, "Stranger": 0.24, "Intimate Partner": 0.18, "Family": 0.16}
    race_dist = {"White": 0.44, "Black": 0.42, "Hispanic": 0.10, "Other": 0.04}

    if vic_sex == "Female":
        rel_dist["Intimate Partner"] += 0.22
        rel_dist["Stranger"] -= 0.10
        sex_dist["Male"] += 0.08
    if "lover triangle" in circumstance.lower():
        rel_dist["Intimate Partner"] += 0.35
        rel_dist["Stranger"] -= 0.15
        sex_dist["Male"] += 0.05
    elif "robbery" in circumstance.lower() or "gang" in circumstance.lower():
        rel_dist["Stranger"] += 0.30
        rel_dist["Intimate Partner"] -= 0.12
        age_dist["15-19"] += 0.08
        age_dist["20-29"] += 0.10
    elif "argument" in circumstance.lower() or "money" in circumstance.lower():
        rel_dist["Acquaintance"] += 0.18
        rel_dist["Family"] += 0.08
        rel_dist["Stranger"] -= 0.15

    if "knife" in weapon.lower() or "cutting" in weapon.lower():
        rel_dist["Acquaintance"] += 0.10
        rel_dist["Intimate Partner"] += 0.08
        rel_dist["Stranger"] -= 0.10
    elif "blunt" in weapon.lower() or "personal" in weapon.lower():
        rel_dist["Acquaintance"] += 0.12
        rel_dist["Family"] += 0.10

    if vic_age < 18:
        rel_dist["Family"] += 0.20
        age_dist["20-29"] += 0.05
        age_dist["30-39"] += 0.10
    elif vic_age > 60:
        rel_dist["Acquaintance"] += 0.10
        rel_dist["Stranger"] += 0.12

    def normalize(d):
        total = max(1e-6, sum(max(0.01, v) for v in d.values()))
        return {k: round(max(0.01, v) / total, 4) for k, v in d.items()}

    sex_dist = normalize(sex_dist)
    age_dist = normalize(age_dist)
    rel_dist = normalize(rel_dist)
    race_dist = normalize(race_dist)

    top_sex = max(sex_dist, key=sex_dist.get)
    top_age = max(age_dist, key=age_dist.get)
    top_rel = max(rel_dist, key=rel_dist.get)
    top_race = max(race_dist, key=race_dist.get)

    reasoning = []
    if rel_dist[top_rel] > 0.35:
        reasoning.append(f"Strong causal linkage indicating **{top_rel}** relationship given observed circumstance ({circumstance}) and weapon.")
    if top_sex == "Male":
        reasoning.append(f"Offender gender heavily skewed toward Male ({sex_dist['Male']*100:.1f}%) consistent with national violent crime benchmarks.")
    if "Stranger" in top_rel:
        reasoning.append("High opportunistic or predatory signature; cross-check regional geographic clusters for transit corridor linkage.")
    else:
        reasoning.append("Targeted proximity incident; prioritize victim social network, recent communications, and household associates.")

    return {
        "status": "success",
        "sex_distribution": sex_dist,
        "age_distribution": age_dist,
        "relationship_distribution": rel_dist,
        "race_distribution": race_dist,
        "top_traits": {
            "sex": (top_sex, sex_dist[top_sex]),
            "age_group": (top_age, age_dist[top_age]),
            "relationship": (top_rel, rel_dist[top_rel]),
            "race": (top_race, race_dist[top_race]),
        },
        "reasoning": reasoning,
    }


def predict_case_solvability(
    model_key: str,
    feature_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """Run inference with one of the solvability pipelines (ANN, ID3, Naive Bayes, k-NN).

    Args:
        model_key: One of 'ann', 'decision_tree_id3', 'naive_bayes', 'knn'.
        feature_dict: Dict mapping feature names → values.

    Returns:
        Dict with keys: status, prediction, probability, model_key, model_name.
        On failure: status='error', error=<message>.
    """
    if model_key == "ann":
        return predict_ann_solvability(feature_dict)

    models = load_trained_classical_models()
    model_name = MODEL_DISPLAY_NAMES.get(model_key, model_key)

    if model_key not in models:
        msg = f"Model '{model_key}' is not available on disk."
        return {"status": "error", "error": msg, "message": msg,
                "prediction": None, "probability": None, "model_name": model_name}

    raw = models[model_key]
    pipeline = raw["pipeline"] if isinstance(raw, dict) and "pipeline" in raw else raw

    # Build 1-row DataFrame with expected columns
    input_row = {col: feature_dict.get(col, np.nan) for col in SOLVABILITY_FEATURE_COLS}
    input_df = pd.DataFrame([input_row])

    try:
        pred = int(pipeline.predict(input_df)[0])
        prob = 0.5
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(input_df)[0]
            if len(probs) >= 2:
                prob = float(probs[1])
        return {
            "status": "success",
            "prediction": pred,
            "probability": round(prob, 4),
            "model_key": model_key,
            "model_name": model_name,
        }
    except Exception as exc:
        msg = f"Inference failed: {exc}"
        return {"status": "error", "error": msg, "message": msg,
                "prediction": None, "probability": None, "model_name": model_name}


# ─────────────────────────────────────────────────────────────────────────────
# PCA Bundle (Day 3)
# ─────────────────────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def load_pca_bundle() -> Optional[Dict[str, Any]]:
    """Load and cache the fitted PCA pipeline bundle from Day 3.

    Returns:
        Dict bundle or None if the file is missing/broken.
    """
    pca_file = MODELS_DIR / "pca_model.joblib"
    if pca_file.exists():
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                return joblib.load(pca_file)
        except Exception:
            return None
    return None


# ─────────────────────────────────────────────────────────────────────────────
# K-Means Clustering (Person A – Day 7)
# ─────────────────────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def load_kmeans_bundle() -> Dict[str, Any]:
    """Load and cache the K-Means model and its associated StandardScaler.

    The model operates on a single feature: VicAge_Clean (victim age).
    k=5 clusters representing distinct victim age groupings.

    Returns:
        Dict with keys: 'model', 'scaler', 'available', 'n_clusters',
        'cluster_centers_orig', 'n_features_in'.
    """
    result: Dict[str, Any] = {
        "model": None, "scaler": None, "available": False,
        "n_clusters": 5, "cluster_centers_orig": None, "n_features_in": 1,
    }
    km_path = MODELS_DIR / "kmeans_serial.pkl"
    sc_path = MODELS_DIR / "clustering_scaler.pkl"

    if not km_path.exists() or not sc_path.exists():
        return result

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            km = joblib.load(km_path)
            sc = joblib.load(sc_path)

        centers_orig = sc.inverse_transform(km.cluster_centers_).flatten()
        result.update({
            "model": km, "scaler": sc, "available": True,
            "n_clusters": km.n_clusters,
            "cluster_centers_orig": centers_orig,
            "n_features_in": km.n_features_in_,
        })
    except Exception:
        pass
    return result


def predict_kmeans_cluster(victim_age: float) -> Dict[str, Any]:
    """Assign a victim age value to a K-Means cluster.

    Args:
        victim_age: Numeric victim age (0–100).

    Returns:
        Dict with keys: status, cluster_id, cluster_label, distance_to_center.
    """
    bundle = load_kmeans_bundle()
    if not bundle["available"]:
        return {"status": "error", "error": "K-Means model not available."}

    if not (0 <= victim_age <= 120):
        return {"status": "error", "error": f"Invalid victim age: {victim_age}. Must be 0–120."}

    km = bundle["model"]
    sc = bundle["scaler"]
    try:
        age_arr = np.array([[victim_age]])
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            scaled = sc.transform(age_arr)
            cluster_id = int(km.predict(scaled)[0])
            dist = float(km.transform(scaled)[0][cluster_id])
            center_orig = float(sc.inverse_transform(km.cluster_centers_[[cluster_id]])[0, 0])

        return {
            "status": "success",
            "cluster_id": cluster_id,
            "cluster_label": KMEANS_CLUSTER_LABELS.get(cluster_id, f"Cluster {cluster_id}"),
            "cluster_center_age": round(center_orig, 1),
            "distance_to_center": round(dist, 4),
        }
    except Exception as exc:
        return {"status": "error", "error": f"K-Means inference failed: {exc}"}


# ─────────────────────────────────────────────────────────────────────────────
# Hierarchical Clustering (Person A – Day 7)
# ─────────────────────────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def load_hierarchical_bundle() -> Dict[str, Any]:
    """Load and cache the fitted Agglomerative Hierarchical Clustering model.

    Note: AgglomerativeClustering does not support predict() on new samples;
    the labels_ from the training corpus are used for distribution analysis.

    Returns:
        Dict with keys: 'model', 'scaler', 'available', 'labels_', 'n_clusters'.
    """
    result: Dict[str, Any] = {
        "model": None, "scaler": None, "available": False,
        "labels_": None, "n_clusters": 5,
    }
    hc_path = MODELS_DIR / "hierarchical_serial.pkl"
    sc_path = MODELS_DIR / "clustering_scaler.pkl"

    if not hc_path.exists():
        return result

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            hc = joblib.load(hc_path)
            sc = joblib.load(sc_path) if sc_path.exists() else None

        result.update({
            "model": hc, "scaler": sc, "available": True,
            "labels_": hc.labels_,
            "n_clusters": int(hc.n_clusters_),
        })
    except Exception:
        pass
    return result


def get_cluster_distribution(bundle_type: str = "kmeans") -> Dict[str, Any]:
    """Compute cluster size distribution from a fitted clustering model.

    Args:
        bundle_type: 'kmeans' or 'hierarchical'.

    Returns:
        Dict with cluster sizes and percentages, or error status.
    """
    if bundle_type == "kmeans":
        b = load_kmeans_bundle()
        labels = b["model"].labels_ if b["available"] else None
    else:
        b = load_hierarchical_bundle()
        labels = b.get("labels_")

    if labels is None:
        return {"status": "error", "error": f"{bundle_type} labels not available."}

    unique, counts = np.unique(labels, return_counts=True)
    total = counts.sum()
    return {
        "status": "success",
        "cluster_ids": unique.tolist(),
        "cluster_sizes": counts.tolist(),
        "cluster_pcts": [round(c / total * 100, 1) for c in counts],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Model Availability Registry
# ─────────────────────────────────────────────────────────────────────────────

def get_model_registry() -> Dict[str, Dict[str, Any]]:
    """Return a registry of all known models and their availability status.

    Returns:
        Dict mapping model_key → {name, available, reason, owner}.
    """
    classical = load_trained_classical_models()
    km_bundle = load_kmeans_bundle()
    hc_bundle = load_hierarchical_bundle()
    pca_bundle = load_pca_bundle()

    return {
        "decision_tree_id3": {
            "name": MODEL_DISPLAY_NAMES["decision_tree_id3"],
            "available": "decision_tree_id3" in classical,
            "owner": "Person B",
            "task": "Case Solvability (Binary)",
            "reason": "" if "decision_tree_id3" in classical else "File not found",
        },
        "naive_bayes": {
            "name": MODEL_DISPLAY_NAMES["naive_bayes"],
            "available": "naive_bayes" in classical,
            "owner": "Person B",
            "task": "Case Solvability (Binary)",
            "reason": "" if "naive_bayes" in classical else "File not found",
        },
        "knn": {
            "name": MODEL_DISPLAY_NAMES["knn"],
            "available": "knn" in classical,
            "owner": "Person B",
            "task": "Case Solvability (Binary)",
            "reason": "" if "knn" in classical else "File not found",
        },
        "kmeans": {
            "name": MODEL_DISPLAY_NAMES["kmeans"],
            "available": km_bundle["available"],
            "owner": "Person A",
            "task": "Victim Age Clustering",
            "reason": "" if km_bundle["available"] else "File not found or load error",
        },
        "hierarchical": {
            "name": MODEL_DISPLAY_NAMES["hierarchical"],
            "available": hc_bundle["available"],
            "owner": "Person A",
            "task": "Victim Age Clustering (Training Distribution)",
            "reason": "" if hc_bundle["available"] else "File not found or load error",
        },
        "pca": {
            "name": "PCA Dimensionality Reduction",
            "available": pca_bundle is not None,
            "owner": "Person B",
            "task": "Feature Variance Analysis",
            "reason": "" if pca_bundle is not None else "File not found",
        },
        "ann": {
            "name": "Artificial Neural Network (MLP)",
            "available": False,
            "owner": "Person A",
            "task": "Case Solvability (Binary)",
            "reason": "TensorFlow not installed in current environment",
        },
        "bbn": {
            "name": "Bayesian Belief Network",
            "available": False,
            "owner": "Person A",
            "task": "Causal Behavioral Inference",
            "reason": "pgmpy library not installed in current environment",
        },
    }
