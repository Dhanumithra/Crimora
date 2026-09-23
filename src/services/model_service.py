"""Model Service Module for Streamlit Inference.

Provides cached model retrieval and real-time case solvability scoring:
- Loads fitted classical classification pipelines (ID3, Naive Bayes, k-NN)
- Loads fitted PCA pipeline bundle
- Prepares feature payloads and computes class probabilities
- Handles missing model artifacts gracefully with clean error feedback
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
import streamlit as st

from src.config import CLASSICAL_MODELS_DIR, MODELS_DIR

MODEL_DISPLAY_NAMES = {
    "decision_tree_id3": "ID3 Decision Tree (Entropy Criterion)",
    "id3_decision_tree": "ID3 Decision Tree (Entropy Criterion)",
    "naive_bayes": "Naive Bayes Pipeline",
    "knn": "k-Nearest Neighbors (k-NN)",
}


@st.cache_resource(show_spinner=False)
def load_trained_classical_models() -> Dict[str, Any]:
    """Retrieve fitted classical classification pipelines with caching.

    Returns:
        Dict[str, Any]: Mapping of model keys to loaded sklearn Pipelines or dict bundles.
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
                models[key] = joblib.load(filepath)
            except Exception:
                pass

    return models


def list_available_models() -> List[str]:
    """List available model identifiers."""
    models = load_trained_classical_models()
    return list(models.keys())


def load_classical_model(model_key: str) -> Optional[Any]:
    """Load a specific model pipeline or bundle by key.

    Args:
        model_key: Key of the model.

    Returns:
        Pipeline/dict or None.
    """
    models = load_trained_classical_models()
    return models.get(model_key)


@st.cache_resource(show_spinner=False)
def load_pca_bundle() -> Optional[Dict[str, Any]]:
    """Retrieve fitted PCA pipeline bundle with caching.

    Returns:
        Optional[Dict[str, Any]]: Loaded PCA bundle dict or None if absent.
    """
    pca_file = MODELS_DIR / "pca_model.joblib"
    if pca_file.exists():
        try:
            return joblib.load(pca_file)
        except Exception:
            return None
    return None


def predict_case_solvability(
    model_key: str,
    feature_dict: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute real-time solvability inference on a single case input dictionary.

    Args:
        model_key: Identifier of model ('decision_tree_id3', 'naive_bayes', 'knn').
        feature_dict: Dictionary mapping feature names to user-provided values.

    Returns:
        Dict[str, Any]: Result containing status, prediction (0/1), probability (0.0–1.0),
                        confidence, and error message if applicable.
    """
    models = load_trained_classical_models()
    if model_key not in models:
        msg = f"Model '{model_key}' is not available on disk."
        return {
            "status": "error",
            "error": msg,
            "message": msg,
            "prediction": None,
            "probability": None,
            "model_name": MODEL_DISPLAY_NAMES.get(model_key, model_key),
        }

    raw_model = models[model_key]
    # Check if raw_model is a dict bundle containing 'pipeline'
    if isinstance(raw_model, dict) and "pipeline" in raw_model:
        pipeline = raw_model["pipeline"]
    else:
        pipeline = raw_model

    # Required feature schema order matching Day 5 training
    expected_cols = [
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

    # Assemble 1-row DataFrame
    input_row: Dict[str, Any] = {}
    for col in expected_cols:
        input_row[col] = feature_dict.get(col, np.nan)

    input_df = pd.DataFrame([input_row])

    try:
        pred = int(pipeline.predict(input_df)[0])
        prob = 0.5
        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba(input_df)[0]
            if len(probs) >= 2:
                prob = float(probs[1])

        model_name = MODEL_DISPLAY_NAMES.get(model_key, model_key)
        return {
            "status": "success",
            "prediction": pred,
            "probability": round(prob, 4),
            "model_key": model_key,
            "model_name": model_name,
        }
    except Exception as e:
        msg = f"Inference execution failed: {str(e)}"
        return {
            "status": "error",
            "error": msg,
            "message": msg,
            "prediction": None,
            "probability": None,
            "model_name": MODEL_DISPLAY_NAMES.get(model_key, model_key),
        }
