"""Principal Component Analysis (PCA) Module for Person B Macro-Level Analytics.

Provides end-to-end, reproducible workflows for:
1. Feature selection and target leakage elimination
2. Categorical encoding and non-zero numerical missing value imputation
3. Standardized scaling and PCA decomposition
4. Cumulative explained variance analysis and component loading extraction
5. Publication-grade visualization generation
6. Model bundle serialization and loading for future scoring

Strictly adheres to responsible analytics principles:
- Excludes target outcome variables ('disposition', 'is_solved')
- Excludes PII and record identifiers ('victim_first', 'victim_last', 'uid')
- Excludes coordinates and order-encoding indices
- Preserves infant age 0 without zero-imputation of missing values
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.config import MODELS_DIR, OUTPUTS_DIR, PROCESSED_DATA_DIR


# Define explicit feature selection mapping for homicide macro analytics
HOMICIDE_FEATURE_SPEC: List[Dict[str, Any]] = [
    {"column": "uid", "datatype": "str", "selected": False, "reason": "Unique record tracking identifier", "role": "identifier"},
    {"column": "reported_date", "datatype": "int64", "selected": False, "reason": "Redundant with extracted temporal features", "role": "temporal_raw"},
    {"column": "reported_date_raw", "datatype": "int64", "selected": False, "reason": "Unparsed raw date integer", "role": "temporal_raw"},
    {"column": "reported_date_clean", "datatype": "str", "selected": False, "reason": "ISO date string; decomposed into components", "role": "temporal_raw"},
    {"column": "victim_last", "datatype": "str", "selected": False, "reason": "PII - surname; excluded to protect individual identity", "role": "pii"},
    {"column": "victim_first", "datatype": "str", "selected": False, "reason": "PII - given name; excluded to protect individual identity", "role": "pii"},
    {"column": "victim_age", "datatype": "str", "selected": False, "reason": "Raw string with 'Unknown'; replaced by cleaned numeric age", "role": "demographic_raw"},
    {"column": "victim_age_clean", "datatype": "float64", "selected": True, "reason": "Continuous demographic feature; imputed with median", "role": "demographic_numerical"},
    {"column": "victim_sex", "datatype": "str", "selected": True, "reason": "Nominal demographic category", "role": "demographic_categorical"},
    {"column": "victim_race", "datatype": "str", "selected": True, "reason": "Nominal demographic category", "role": "demographic_categorical"},
    {"column": "city", "datatype": "str", "selected": True, "reason": "Metropolitan jurisdiction; nominal geographic category", "role": "geographic_categorical"},
    {"column": "state", "datatype": "str", "selected": True, "reason": "State-level jurisdiction; nominal geographic category", "role": "geographic_categorical"},
    {"column": "lat", "datatype": "float64", "selected": False, "reason": "Continuous coordinate excluded from macro PCA matrix", "role": "geographic_coordinate"},
    {"column": "lon", "datatype": "float64", "selected": False, "reason": "Continuous coordinate excluded from macro PCA matrix", "role": "geographic_coordinate"},
    {"column": "disposition", "datatype": "str", "selected": False, "reason": "Ground-truth case outcome; critical target leakage prevention", "role": "target_variable"},
    {"column": "is_solved", "datatype": "int64", "selected": False, "reason": "Ground-truth binary label; critical target leakage prevention", "role": "target_variable"},
    {"column": "valid_coords", "datatype": "bool", "selected": False, "reason": "Administrative spatial filtering flag", "role": "administrative_flag"},
    {"column": "reported_year", "datatype": "float64", "selected": True, "reason": "Macro annual trend feature", "role": "temporal_numerical"},
    {"column": "reported_month", "datatype": "float64", "selected": True, "reason": "Seasonal cyclical feature", "role": "temporal_numerical"},
    {"column": "reported_day", "datatype": "float64", "selected": False, "reason": "High-variance day-of-month integer", "role": "temporal_fine"},
    {"column": "reported_day_of_week", "datatype": "str", "selected": True, "reason": "Weekly cyclical pattern", "role": "temporal_categorical"},
    {"column": "reported_is_weekend", "datatype": "int64", "selected": True, "reason": "Binary weekend occurrence indicator", "role": "temporal_numerical"},
]


def generate_feature_selection_table(
    feature_specs: Optional[List[Dict[str, Any]]] = None,
) -> pd.DataFrame:
    """Produce the auditable feature selection registry.

    Args:
        feature_specs: List of feature specifications. Defaults to HOMICIDE_FEATURE_SPEC.

    Returns:
        pd.DataFrame: Table with column, datatype, selected, reason, and role.
    """
    specs = feature_specs if feature_specs is not None else HOMICIDE_FEATURE_SPEC
    return pd.DataFrame(specs)


def build_pca_pipeline(
    numeric_features: List[str],
    categorical_features: List[str],
    n_components: Optional[int] = None,
    impute_strategy: str = "median",
    random_state: int = 42,
) -> Tuple[Pipeline, ColumnTransformer, PCA]:
    """Assemble a reproducible preprocessing and PCA pipeline.

    Combines:
    1. Numerical median imputation (preserving infant age 0, never blindly zero-filled)
    2. Nominal categorical OneHotEncoder with handle_unknown='ignore'
    3. Global StandardScaler across the full assembled feature space
    4. Scikit-learn PCA decomposition

    Args:
        numeric_features: List of numeric column names.
        categorical_features: List of categorical column names.
        n_components: Number of PCA components. If None, computes all available.
        impute_strategy: Strategy for SimpleImputer on numeric values.
        random_state: Seed for deterministic decomposition.

    Returns:
        Tuple[Pipeline, ColumnTransformer, PCA]: (full_pipeline, preprocessor, pca_estimator)
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imputer", SimpleImputer(strategy=impute_strategy)),
                ]),
                numeric_features,
            ),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
                    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                categorical_features,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    pca_model = PCA(n_components=n_components, random_state=random_state)

    full_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("scaler", StandardScaler(with_mean=True, with_std=True)),
        ("pca", pca_model),
    ])

    return full_pipeline, preprocessor, pca_model


def get_transformed_feature_names(
    preprocessor: ColumnTransformer,
    numeric_features: List[str],
    categorical_features: List[str],
) -> List[str]:
    """Extract human-readable feature names following ColumnTransformer encoding.

    Args:
        preprocessor: Fitted ColumnTransformer.
        numeric_features: Numeric feature columns.
        categorical_features: Categorical feature columns.

    Returns:
        List[str]: Combined list of output feature names.
    """
    if hasattr(preprocessor, "get_feature_names_out"):
        try:
            return list(preprocessor.get_feature_names_out())
        except Exception:
            pass

    out_names: List[str] = list(numeric_features)
    if "cat" in preprocessor.named_transformers_:
        cat_pipe = preprocessor.named_transformers_["cat"]
        onehot = cat_pipe.named_steps.get("onehot")
        if onehot and hasattr(onehot, "get_feature_names_out"):
            cat_out = list(onehot.get_feature_names_out(categorical_features))
            out_names.extend(cat_out)
        else:
            out_names.extend(categorical_features)
    return out_names


def fit_pca_analysis(
    df: pd.DataFrame,
    numeric_features: List[str],
    categorical_features: List[str],
    variance_threshold: float = 0.85,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Execute end-to-end PCA modeling and diagnostic analysis.

    Determines optimal component count based on cumulative explained variance,
    computes component loadings, and produces 2D visualization coordinates.

    Args:
        df: Input DataFrame containing clean source records.
        numeric_features: Continuous and discrete numeric feature columns.
        categorical_features: Nominal categorical feature columns.
        variance_threshold: Target cumulative explained variance ratio (e.g. 0.85 for 85%).
        random_state: Reproducibility seed.

    Returns:
        Dict[str, Any]: Bundle with fitted models, variance summaries, loadings, and transformed matrices.
    """
    input_cols = numeric_features + categorical_features
    X_input = df[input_cols].copy()

    # Step 1: Fit full preprocessor and initial full-rank PCA to evaluate scree curve
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), numeric_features),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
                    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                categorical_features,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    X_pre = preprocessor.fit_transform(X_input)
    feature_names = get_transformed_feature_names(preprocessor, numeric_features, categorical_features)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_pre)

    # Initial full-rank PCA (up to min(n_samples, n_features))
    max_components = min(X_scaled.shape[0], X_scaled.shape[1], 40)
    initial_pca = PCA(n_components=max_components, random_state=random_state)
    initial_pca.fit(X_scaled)

    explained_var = initial_pca.explained_variance_ratio_
    cum_var = np.cumsum(explained_var)

    # Determine recommended component count reaching variance_threshold
    exceeding_indices = np.where(cum_var >= variance_threshold)[0]
    if len(exceeding_indices) > 0:
        recommended_k = int(exceeding_indices[0] + 1)
    else:
        recommended_k = max_components

    # Minimum of 2 components for spatial representation, maximum bounded by max_components
    recommended_k = max(2, min(recommended_k, max_components))

    # Step 2: Fit optimal PCA model and 2D visualization model
    final_pca = PCA(n_components=recommended_k, random_state=random_state)
    X_transformed = final_pca.fit_transform(X_scaled)

    pca_2d = PCA(n_components=2, random_state=random_state)
    X_2d = pca_2d.fit_transform(X_scaled)

    # Assemble explained variance DataFrame
    components_range = [f"PC{i+1}" for i in range(len(explained_var))]
    explained_var_df = pd.DataFrame({
        "component": components_range,
        "explained_variance_ratio": explained_var,
        "cumulative_explained_variance": cum_var,
    })

    # Assemble loadings DataFrame (components x features)
    loadings_df = pd.DataFrame(
        final_pca.components_,
        index=[f"PC{i+1}" for i in range(recommended_k)],
        columns=feature_names,
    ).T
    loadings_df.index.name = "feature"

    # Assemble transformed feature matrix (first k components + 2D coordinates)
    col_names = [f"PC{i+1}" for i in range(recommended_k)]
    transformed_df = pd.DataFrame(X_transformed, columns=col_names)
    transformed_df["PC1_2D"] = X_2d[:, 0]
    transformed_df["PC2_2D"] = X_2d[:, 1]

    # Full deployable scikit-learn Pipeline
    full_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("scaler", scaler),
        ("pca", final_pca),
    ])

    return {
        "full_pipeline": full_pipeline,
        "preprocessor": preprocessor,
        "scaler": scaler,
        "pca_model": final_pca,
        "pca_2d": pca_2d,
        "recommended_k": recommended_k,
        "variance_threshold": variance_threshold,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "input_features": input_cols,
        "transformed_feature_names": feature_names,
        "explained_variance_df": explained_var_df,
        "loadings_df": loadings_df,
        "transformed_df": transformed_df,
    }


def save_pca_bundle(
    analysis_bundle: Dict[str, Any],
    output_path: Path,
) -> None:
    """Serialize the trained PCA bundle for reproducible downstream scoring.

    Args:
        analysis_bundle: Dictionary containing fitted estimators and configs.
        output_path: Path to target .joblib destination file.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    artifact = {
        "pipeline": analysis_bundle["full_pipeline"],
        "preprocessor": analysis_bundle["preprocessor"],
        "scaler": analysis_bundle["scaler"],
        "pca_model": analysis_bundle["pca_model"],
        "pca_2d": analysis_bundle["pca_2d"],
        "recommended_k": analysis_bundle["recommended_k"],
        "numeric_features": analysis_bundle["numeric_features"],
        "categorical_features": analysis_bundle["categorical_features"],
        "input_features": analysis_bundle["input_features"],
        "transformed_feature_names": analysis_bundle["transformed_feature_names"],
        "metadata": {
            "algorithm": "Principal Component Analysis",
            "framework": "scikit-learn",
            "scaling": "StandardScaler(with_mean=True, with_std=True)",
            "imputation": "SimpleImputer(strategy='median')",
            "categorical_encoding": "OneHotEncoder(handle_unknown='ignore')",
            "variance_threshold": analysis_bundle.get("variance_threshold", 0.85),
        },
    }
    joblib.dump(artifact, output_path)


def load_pca_bundle(model_path: Path) -> Dict[str, Any]:
    """Load a serialized PCA bundle and verify its interfaces.

    Args:
        model_path: Path to target .joblib file.

    Returns:
        Dict[str, Any]: Loaded dictionary artifact.
    """
    model_path = Path(model_path)
    if not model_path.exists():
        raise FileNotFoundError(f"PCA bundle not found at {model_path}")
    return joblib.load(model_path)


def transform_new_data(
    bundle: Dict[str, Any],
    df: pd.DataFrame,
) -> np.ndarray:
    """Transform fresh data consistently through the fitted PCA pipeline.

    Args:
        bundle: Loaded PCA bundle.
        df: Input DataFrame with compatible schema.

    Returns:
        np.ndarray: Projected principal component matrix.
    """
    pipeline = bundle["pipeline"]
    input_cols = bundle["input_features"]
    X_sub = df[input_cols].copy()
    return pipeline.transform(X_sub)


def generate_pca_visualizations(
    explained_var_df: pd.DataFrame,
    loadings_df: pd.DataFrame,
    transformed_df: pd.DataFrame,
    output_dir: Path,
    sample_category: Optional[pd.Series] = None,
    category_name: str = "Subgroup",
) -> List[Path]:
    """Generate the four mandatory publication-quality PCA diagnostic plots.

    1. Explained variance by component (Scree plot)
    2. Cumulative explained variance with threshold reference
    3. PCA 2D projection scatter plot
    4. Top feature contributions (loadings) for PC1 and PC2

    Args:
        explained_var_df: DataFrame with component, explained_variance_ratio, cumulative.
        loadings_df: Feature loadings DataFrame (features x components).
        transformed_df: Projected component coordinates.
        output_dir: Destination folder for image files.
        sample_category: Optional categorical series for scatter color coding.
        category_name: Label for category legend.

    Returns:
        List[Path]: Paths to generated visualization figures.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    generated_plots: List[Path] = []

    # Configure styling
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams.update({"font.sans-serif": "DejaVu Sans", "font.size": 10})

    # Plot 1: Explained Variance by Component (Scree plot)
    fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
    top_n = min(20, len(explained_var_df))
    subset_var = explained_var_df.iloc[:top_n]
    x_pos = np.arange(top_n)

    ax.bar(x_pos, subset_var["explained_variance_ratio"] * 100, color="#1f77b4", edgecolor="#0e4875", alpha=0.85)
    ax.set_xticks(x_pos)
    ax.set_xticklabels(subset_var["component"], rotation=45, ha="right")
    ax.set_ylabel("Explained Variance Ratio (%)")
    ax.set_xlabel("Principal Component")
    ax.set_title("Explained Variance by Principal Component (Scree Plot)", fontsize=12, fontweight="bold", pad=12)

    for i, v in enumerate(subset_var["explained_variance_ratio"] * 100):
        ax.text(i, v + 0.3, f"{v:.1f}%", ha="center", va="bottom", fontsize=8)

    p1 = output_dir / "explained_variance_by_component.png"
    fig.tight_layout()
    fig.savefig(p1, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p1)

    # Plot 2: Cumulative Explained Variance
    fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
    ax.plot(
        x_pos,
        subset_var["cumulative_explained_variance"] * 100,
        marker="o",
        color="#2ca02c",
        linewidth=2.2,
        markersize=6,
        label="Cumulative Explained Variance",
    )
    ax.axhline(80, color="#d62728", linestyle="--", linewidth=1.2, label="80% Variance Threshold")
    ax.axhline(90, color="#ff7f0e", linestyle=":", linewidth=1.2, label="90% Variance Threshold")
    ax.set_xticks(x_pos)
    ax.set_xticklabels(subset_var["component"], rotation=45, ha="right")
    ax.set_ylabel("Cumulative Explained Variance (%)")
    ax.set_xlabel("Principal Component Index")
    ax.set_ylim(0, 105)
    ax.set_title("Cumulative Explained Variance Trajectory", fontsize=12, fontweight="bold", pad=12)
    ax.legend(loc="lower right", frameon=True)

    p2 = output_dir / "cumulative_explained_variance.png"
    fig.tight_layout()
    fig.savefig(p2, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p2)

    # Plot 3: PCA 2D Projection Scatter
    fig, ax = plt.subplots(figsize=(9, 7), dpi=300)
    pc1_col = "PC1_2D" if "PC1_2D" in transformed_df.columns else "PC1"
    pc2_col = "PC2_2D" if "PC2_2D" in transformed_df.columns else "PC2"

    # Subsample for dense visualization clarity if large
    plot_sub = transformed_df.copy()
    if len(plot_sub) > 10000:
        sample_indices = np.random.RandomState(42).choice(len(plot_sub), size=10000, replace=False)
        plot_sub = plot_sub.iloc[sample_indices].copy()
        if sample_category is not None:
            sample_cat = sample_category.iloc[sample_indices]
        else:
            sample_cat = None
    else:
        sample_cat = sample_category

    if sample_cat is not None:
        plot_sub["Group"] = sample_cat.values
        palette = sns.color_palette("tab10", n_colors=min(10, plot_sub["Group"].nunique()))
        sns.scatterplot(
            data=plot_sub,
            x=pc1_col,
            y=pc2_col,
            hue="Group",
            palette=palette,
            alpha=0.45,
            s=16,
            ax=ax,
            edgecolor="none",
        )
        ax.legend(title=category_name, bbox_to_anchor=(1.02, 1), loc="upper left", frameon=True)
    else:
        ax.scatter(plot_sub[pc1_col], plot_sub[pc2_col], alpha=0.35, s=15, color="#1f77b4", edgecolor="none")

    ax.set_xlabel(f"Principal Component 1 ({explained_var_df.iloc[0]['explained_variance_ratio']*100:.1f}%)")
    ax.set_ylabel(f"Principal Component 2 ({explained_var_df.iloc[1]['explained_variance_ratio']*100:.1f}%)")
    ax.set_title("Macro Crime Analytics — PCA 2D Incident Projection", fontsize=12, fontweight="bold", pad=12)

    p3 = output_dir / "pca_2d_projection.png"
    fig.tight_layout()
    fig.savefig(p3, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p3)

    # Plot 4: Top Component Contributions (Loadings for PC1 & PC2)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6), dpi=300)

    # Top 8 positive and negative loadings for PC1
    pc1_loadings = loadings_df["PC1"].sort_values()
    top_pc1 = pd.concat([pc1_loadings.head(5), pc1_loadings.tail(5)])
    colors1 = ["#d62728" if x < 0 else "#2ca02c" for x in top_pc1.values]
    ax1.barh(top_pc1.index, top_pc1.values, color=colors1, alpha=0.85)
    ax1.axvline(0, color="gray", linewidth=0.8)
    ax1.set_xlabel("Loading Magnitude")
    ax1.set_title("Top Feature Contributions — PC1", fontsize=11, fontweight="bold")

    # Top 8 positive and negative loadings for PC2
    pc2_loadings = loadings_df["PC2"].sort_values()
    top_pc2 = pd.concat([pc2_loadings.head(5), pc2_loadings.tail(5)])
    colors2 = ["#d62728" if x < 0 else "#2ca02c" for x in top_pc2.values]
    ax2.barh(top_pc2.index, top_pc2.values, color=colors2, alpha=0.85)
    ax2.axvline(0, color="gray", linewidth=0.8)
    ax2.set_xlabel("Loading Magnitude")
    ax2.set_title("Top Feature Contributions — PC2", fontsize=11, fontweight="bold")

    p4 = output_dir / "pca_feature_contributions.png"
    fig.tight_layout()
    fig.savefig(p4, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p4)

    return generated_plots


def run_pca_pipeline() -> Dict[str, Any]:
    """Execute the full PCA analytics workflow and generate all file artifacts.

    Loads cleaned data, performs feature selection, fits PCA, generates output CSVs,
    creates visualizations, and saves the serialized joblib artifact.

    Returns:
        Dict[str, Any]: Execution summary dictionary.
    """
    pca_output_dir = OUTPUTS_DIR / "pca"
    pca_output_dir.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Feature Selection Artifact
    feature_sel_df = generate_feature_selection_table()
    feature_sel_path = pca_output_dir / "pca_feature_selection.csv"
    feature_sel_df.to_csv(feature_sel_path, index=False)

    # 2. Load Processed Incident Dataset
    clean_csv_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
    if not clean_csv_path.exists():
        raise FileNotFoundError(f"Cleaned homicide dataset missing at {clean_csv_path}")

    df = pd.read_csv(clean_csv_path)

    # Extract selected feature names from registry
    selected_rows = feature_sel_df[feature_sel_df["selected"]]
    num_cols = selected_rows[selected_rows["role"].str.contains("numerical")]["column"].tolist()
    cat_cols = selected_rows[selected_rows["role"].str.contains("categorical")]["column"].tolist()

    # 3. Fit PCA and extract diagnostics
    results = fit_pca_analysis(
        df=df,
        numeric_features=num_cols,
        categorical_features=cat_cols,
        variance_threshold=0.85,
    )

    # 4. Save Explained Variance CSV
    exp_var_path = pca_output_dir / "explained_variance.csv"
    results["explained_variance_df"].to_csv(exp_var_path, index=False)

    # 5. Save PCA Loadings CSV
    loadings_path = pca_output_dir / "pca_components.csv"
    results["loadings_df"].to_csv(loadings_path)

    # 6. Save Transformed Matrix CSV (saving first 10 components to maintain reasonable file size)
    transformed_path = pca_output_dir / "pca_transformed.csv"
    results["transformed_df"].round(4).to_csv(transformed_path, index=False)

    # 7. Save Model Bundle
    model_save_path = MODELS_DIR / "pca_model.joblib"
    save_pca_bundle(results, model_save_path)

    # 8. Generate Publication Plots
    plot_paths = generate_pca_visualizations(
        explained_var_df=results["explained_variance_df"],
        loadings_df=results["loadings_df"],
        transformed_df=results["transformed_df"],
        output_dir=pca_output_dir,
        sample_category=df["victim_race"],
        category_name="Victim Race",
    )

    return {
        "dataset_rows": len(df),
        "selected_features": num_cols + cat_cols,
        "transformed_dimensions": len(results["transformed_feature_names"]),
        "recommended_components": results["recommended_k"],
        "cumulative_variance": float(results["explained_variance_df"].iloc[results["recommended_k"] - 1]["cumulative_explained_variance"]),
        "feature_selection_file": str(feature_sel_path),
        "explained_variance_file": str(exp_var_path),
        "components_file": str(loadings_path),
        "transformed_file": str(transformed_path),
        "model_file": str(model_save_path),
        "plots_generated": [str(p) for p in plot_paths],
    }


if __name__ == "__main__":
    summary = run_pca_pipeline()
    print("=== PCA PIPELINE EXECUTION COMPLETE ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")
