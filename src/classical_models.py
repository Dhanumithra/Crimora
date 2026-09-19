"""Classical Machine Learning Models for Case Solvability Module.

Implements reusable estimators and pipelines for Person B (Day 5):
1. ID3-style Decision Tree Classifier (criterion="entropy")
2. Naive Bayes Classifier (GaussianNB)
3. k-Nearest Neighbors Classifier (k-NN, with feature scaling)

Includes strict feature selection with target leakage isolation,
reproducible pipeline assembly, and artifact persistence.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from src.config import CLASSICAL_MODELS_DIR


# =====================================================================
# 1. Feature Specification and Leakage Prevention
# =====================================================================

FEATURE_SPECIFICATIONS: List[Dict[str, Any]] = [
    # Excluded: Target and Target Leakage
    {"column": "is_solved", "selected": False, "role": "target_variable", "reason": "Ground-truth binary clearance label to predict"},
    {"column": "disposition", "selected": False, "role": "target_leakage", "reason": "Ground-truth case disposition directly revealing arrest outcome"},

    # Excluded: Identifiers and Personally Identifiable Information (PII)
    {"column": "uid", "selected": False, "role": "identifier", "reason": "Unique case identifier"},
    {"column": "victim_first", "selected": False, "role": "pii", "reason": "Personally identifying victim first name"},
    {"column": "victim_last", "selected": False, "role": "pii", "reason": "Personally identifying victim last name"},
    {"column": "reported_date", "selected": False, "role": "raw_temporal", "reason": "Raw unparsed date integer"},
    {"column": "reported_date_raw", "selected": False, "role": "raw_temporal", "reason": "Raw date string with potential typos"},
    {"column": "reported_date_clean", "selected": False, "role": "datetime_object", "reason": "Datetime object from which calendar features were derived"},
    {"column": "victim_age", "selected": False, "role": "raw_numerical", "reason": "Unparsed raw age string with sentinels"},
    {"column": "valid_coords", "selected": False, "role": "administrative_flag", "reason": "Boolean spatial quality flag"},
    {"column": "reported_day", "selected": False, "role": "high_variance_temporal", "reason": "High-variance day-of-month integer without cyclical meaning"},

    # Selected Numerical Features
    {"column": "victim_age_clean", "selected": True, "role": "numerical", "reason": "Clean continuous victim age (infant 0 preserved, missing imputed)"},
    {"column": "reported_year", "selected": True, "role": "numerical", "reason": "Macro annual trend"},
    {"column": "reported_month", "selected": True, "role": "numerical", "reason": "Seasonal month indicator"},
    {"column": "reported_is_weekend", "selected": True, "role": "numerical", "reason": "Binary weekend occurrence indicator"},
    {"column": "lat", "selected": True, "role": "numerical", "reason": "Continuous latitude coordinate"},
    {"column": "lon", "selected": True, "role": "numerical", "reason": "Continuous longitude coordinate"},

    # Selected Categorical Features
    {"column": "victim_sex", "selected": True, "role": "categorical", "reason": "Demographic gender category"},
    {"column": "victim_race", "selected": True, "role": "categorical", "reason": "Demographic race/ethnicity category"},
    {"column": "city", "selected": True, "role": "categorical", "reason": "Metropolitan jurisdiction"},
    {"column": "state", "selected": True, "role": "categorical", "reason": "State jurisdiction"},
    {"column": "reported_day_of_week", "selected": True, "role": "categorical", "reason": "Day-of-week cyclical pattern"},
]


def get_feature_specification() -> pd.DataFrame:
    """Return the structured feature selection and leakage audit table.

    Returns:
        pd.DataFrame: Table with columns ['column', 'selected', 'role', 'reason'].
    """
    return pd.DataFrame(FEATURE_SPECIFICATIONS)


def get_feature_names(df: Optional[pd.DataFrame] = None) -> Tuple[List[str], List[str]]:
    """Get the active list of numerical and categorical feature names.

    Args:
        df: Optional DataFrame to filter available columns.

    Returns:
        Tuple[List[str], List[str]]: (numeric_features, categorical_features)
    """
    spec_df = get_feature_specification()
    selected_df = spec_df[spec_df["selected"]]

    num_cols = selected_df[selected_df["role"] == "numerical"]["column"].tolist()
    cat_cols = selected_df[selected_df["role"] == "categorical"]["column"].tolist()

    if df is not None:
        num_cols = [c for c in num_cols if c in df.columns]
        cat_cols = [c for c in cat_cols if c in df.columns]

    return num_cols, cat_cols


# =====================================================================
# 2. Pipeline and Preprocessing Assembly
# =====================================================================

def build_feature_preprocessor(
    numeric_features: List[str],
    categorical_features: List[str],
) -> ColumnTransformer:
    """Construct an sklearn ColumnTransformer for numerical and categorical preprocessing.

    - Numericals: SimpleImputer(strategy='median') (preserves valid 0 infant ages)
    - Categoricals: SimpleImputer(strategy='constant', fill_value='Unknown') + OneHotEncoder(handle_unknown='ignore')

    Args:
        numeric_features: List of continuous feature column names.
        categorical_features: List of discrete nominal feature column names.

    Returns:
        ColumnTransformer: Preprocessing transformer.
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, numeric_features),
            ("cat", cat_pipeline, categorical_features),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    return preprocessor


def build_id3_decision_tree(
    preprocessor: ColumnTransformer,
    max_depth: int = 8,
    min_samples_split: int = 20,
    min_samples_leaf: int = 10,
    random_state: int = 42,
) -> Pipeline:
    """Build an ID3-style Decision Tree Pipeline using Information Gain (Entropy).

    Args:
        preprocessor: Fitted or unfitted ColumnTransformer.
        max_depth: Maximum tree depth for regularized interpretability.
        min_samples_split: Minimum node samples required to split.
        min_samples_leaf: Minimum samples required at a leaf node.
        random_state: Random state for deterministic splits.

    Returns:
        Pipeline: ID3 Decision Tree Pipeline.
    """
    dt_classifier = DecisionTreeClassifier(
        criterion="entropy",
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        random_state=random_state,
    )
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", dt_classifier),
    ])


def build_naive_bayes(
    preprocessor: ColumnTransformer,
    var_smoothing: float = 1e-9,
) -> Pipeline:
    """Build a Naive Bayes Pipeline (GaussianNB).

    Operates on the preprocessed numerical and one-hot encoded representation
    assuming conditional independence.

    Args:
        preprocessor: ColumnTransformer.
        var_smoothing: Portion of the largest variance added to variances for calculation stability.

    Returns:
        Pipeline: Naive Bayes Pipeline.
    """
    nb_classifier = GaussianNB(var_smoothing=var_smoothing)
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", nb_classifier),
    ])


def build_knn(
    preprocessor: ColumnTransformer,
    n_neighbors: int = 15,
    weights: str = "distance",
    metric: str = "euclidean",
    n_jobs: int = -1,
) -> Pipeline:
    """Build a k-Nearest Neighbors Pipeline with explicit feature scaling.

    Note: StandardScaler is strictly included prior to the distance-based k-NN estimator.

    Args:
        preprocessor: ColumnTransformer.
        n_neighbors: Number of nearest neighbors k.
        weights: Weight function ('uniform' or 'distance').
        metric: Distance metric ('euclidean', 'manhattan').
        n_jobs: Number of parallel CPU workers (-1 for all).

    Returns:
        Pipeline: Scaled k-NN Pipeline.
    """
    knn_classifier = KNeighborsClassifier(
        n_neighbors=n_neighbors,
        weights=weights,
        metric=metric,
        n_jobs=n_jobs,
    )
    return Pipeline([
        ("preprocessor", preprocessor),
        ("scaler", StandardScaler()),
        ("classifier", knn_classifier),
    ])


# =====================================================================
# 3. Model Training and Serialization
# =====================================================================

def train_all_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    numeric_features: List[str],
    categorical_features: List[str],
    random_state: int = 42,
) -> Dict[str, Pipeline]:
    """Assemble and train all three classical classification models on training data.

    Strictly ensures preprocessing is fitted ONLY on training features (no leakage).

    Args:
        X_train: Training feature DataFrame.
        y_train: Training ground-truth target Series.
        numeric_features: List of numeric feature names.
        categorical_features: List of categorical feature names.
        random_state: Seed for reproducibility.

    Returns:
        Dict[str, Pipeline]: Dictionary mapping model name to fitted Pipeline.
    """
    models: Dict[str, Pipeline] = {}

    # 1. ID3 Decision Tree
    preprocessor_dt = build_feature_preprocessor(numeric_features, categorical_features)
    dt_pipeline = build_id3_decision_tree(preprocessor_dt, random_state=random_state)
    dt_pipeline.fit(X_train, y_train)
    models["id3_decision_tree"] = dt_pipeline

    # 2. Naive Bayes
    preprocessor_nb = build_feature_preprocessor(numeric_features, categorical_features)
    nb_pipeline = build_naive_bayes(preprocessor_nb)
    nb_pipeline.fit(X_train, y_train)
    models["naive_bayes"] = nb_pipeline

    # 3. k-NN (Scaled)
    preprocessor_knn = build_feature_preprocessor(numeric_features, categorical_features)
    knn_pipeline = build_knn(preprocessor_knn)
    knn_pipeline.fit(X_train, y_train)
    models["knn"] = knn_pipeline

    return models


def save_classical_models(
    models: Dict[str, Pipeline],
    output_dir: Union[str, Path] = CLASSICAL_MODELS_DIR,
) -> Dict[str, Path]:
    """Serialize fitted model pipelines to disk using joblib.

    Args:
        models: Dictionary mapping model names to fitted Pipelines.
        output_dir: Destination directory.

    Returns:
        Dict[str, Path]: Map of model identifiers to saved file paths.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    saved_paths: Dict[str, Path] = {}

    filename_map = {
        "id3_decision_tree": "decision_tree_id3.joblib",
        "naive_bayes": "naive_bayes.joblib",
        "knn": "knn.joblib",
    }

    for model_name, pipeline in models.items():
        fname = filename_map.get(model_name, f"{model_name}.joblib")
        save_file = out_path / fname
        joblib.dump(pipeline, save_file)
        saved_paths[model_name] = save_file

    return saved_paths


def load_classical_models(
    models_dir: Union[str, Path] = CLASSICAL_MODELS_DIR,
) -> Dict[str, Pipeline]:
    """Load serialized classical models from disk.

    Args:
        models_dir: Source directory.

    Returns:
        Dict[str, Pipeline]: Map of model identifiers to loaded Pipelines.
    """
    path = Path(models_dir)
    loaded_models: Dict[str, Pipeline] = {}

    file_map = {
        "id3_decision_tree": "decision_tree_id3.joblib",
        "naive_bayes": "naive_bayes.joblib",
        "knn": "knn.joblib",
    }

    for model_key, fname in file_map.items():
        model_file = path / fname
        if model_file.exists():
            loaded_models[model_key] = joblib.load(model_file)

    return loaded_models
