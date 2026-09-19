"""Classical Machine Learning Pipeline Runner for Case Solvability (Day 5).

Executes the complete Day 5 workflow:
1. Loads cleaned homicide dataset from data/processed/homicide_clean.csv
2. Validates schema and target variable (is_solved)
3. Enforces strict target leakage isolation and feature selection
4. Performs stratified 80/20 train/test split prior to fitting
5. Executes 5-fold stratified cross-validation on training data
6. Fits ID3 Decision Tree, Naive Bayes, and Scaled k-NN pipelines
7. Evaluates holdout test metrics (Accuracy, Precision, Recall, F1, ROC-AUC)
8. Serializes trained model pipelines under models/classical/
9. Generates evaluation tables and publication-quality figures in outputs/classical/
"""

from pathlib import Path
import sys
from typing import Any, Dict

import pandas as pd
from sklearn.model_selection import train_test_split

# Ensure project root in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.config import CLASSICAL_MODELS_DIR, CLASSICAL_OUTPUTS_DIR, PROCESSED_DATA_DIR
from src.classical_models import (
    get_feature_names,
    get_feature_specification,
    load_classical_models,
    save_classical_models,
    train_all_models,
)
from src.model_evaluation import (
    compile_evaluation_tables,
    evaluate_single_model,
    export_evaluation_artifacts,
    perform_cross_validation,
    plot_confusion_matrices,
    plot_roc_curves,
)


def run_classical_pipeline(
    data_path: Optional[Path] = None,
    test_size: float = 0.2,
    cv_folds: int = 5,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Execute the end-to-end classical machine learning pipeline.

    Args:
        data_path: Path to processed CSV (default: data/processed/homicide_clean.csv).
        test_size: Proportion of holdout test set (default 0.2).
        cv_folds: Number of stratified cross-validation folds (default 5).
        random_state: Seed for deterministic splits and training.

    Returns:
        Dict[str, Any]: Execution summary dictionary.
    """
    CLASSICAL_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    CLASSICAL_OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    csv_file = data_path if data_path is not None else PROCESSED_DATA_DIR / "homicide_clean.csv"
    if not csv_file.exists():
        raise FileNotFoundError(f"Processed dataset missing at: {csv_file}")

    print("=== [DAY 5] CLASSICAL ML PIPELINE INITIALIZED ===")
    df = pd.read_csv(csv_file)
    print(f"Loaded dataset: {csv_file.name} ({len(df):,} rows)")

    # 1. Target Validation
    target_col = "is_solved"
    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in dataset.")

    y = df[target_col].astype(int)
    class_counts = y.value_counts().to_dict()
    print(f"Target variable '{target_col}': Class 0 = {class_counts.get(0, 0):,}, Class 1 = {class_counts.get(1, 0):,}")

    # 2. Feature Selection and Leakage Audit
    spec_df = get_feature_specification()
    leakage_cols = spec_df[spec_df["role"].isin(["target_leakage", "target_variable"])]["column"].tolist()
    print(f"Target leakage isolation: Strictly excluding {leakage_cols}")

    num_cols, cat_cols = get_feature_names(df)
    features = num_cols + cat_cols
    X = df[features].copy()
    print(f"Selected {len(features)} features ({len(num_cols)} numerical, {len(cat_cols)} categorical)")

    # 3. Stratified Train/Test Split (BEFORE any fitting or preprocessing)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )
    print(f"Train split: {len(X_train):,} samples; Test split: {len(X_test):,} samples (stratified)")

    # 4. Stratified 5-Fold Cross-Validation on Training Split
    print(f"Executing {cv_folds}-fold Stratified Cross-Validation on training data...")
    # Assemble unfitted models for CV
    from src.classical_models import (
        build_feature_preprocessor,
        build_id3_decision_tree,
        build_knn,
        build_naive_bayes,
    )
    cv_models = {
        "id3_decision_tree": build_id3_decision_tree(build_feature_preprocessor(num_cols, cat_cols), random_state=random_state),
        "naive_bayes": build_naive_bayes(build_feature_preprocessor(num_cols, cat_cols)),
        "knn": build_knn(build_feature_preprocessor(num_cols, cat_cols)),
    }
    cv_results = perform_cross_validation(
        models=cv_models,
        X_train=X_train,
        y_train=y_train,
        n_splits=cv_folds,
        random_state=random_state,
    )
    print("Cross-Validation complete.")

    # 5. Fit All Pipelines on Training Set
    print("Fitting production pipelines on complete training set...")
    fitted_models = train_all_models(
        X_train=X_train,
        y_train=y_train,
        numeric_features=num_cols,
        categorical_features=cat_cols,
        random_state=random_state,
    )

    # 6. Save Model Artifacts
    saved_model_paths = save_classical_models(fitted_models, output_dir=CLASSICAL_MODELS_DIR)
    print(f"Saved {len(saved_model_paths)} models to {CLASSICAL_MODELS_DIR}")

    # 7. Evaluate on Holdout Test Set
    print("Evaluating models on holdout test set...")
    eval_results: Dict[str, Dict[str, Any]] = {}
    for model_name, pipeline in fitted_models.items():
        eval_results[model_name] = evaluate_single_model(
            pipeline=pipeline,
            X_test=X_test,
            y_test=y_test,
            model_name=model_name,
        )

    # 8. Compile and Export Metrics Tables
    metrics_df, reports_df = compile_evaluation_tables(eval_results, cv_results)
    metrics_path, reports_path = export_evaluation_artifacts(
        metrics_df=metrics_df,
        reports_df=reports_df,
        output_dir=CLASSICAL_OUTPUTS_DIR,
    )
    print(f"Saved metrics to: {metrics_path}")
    print(f"Saved classification reports to: {reports_path}")

    # 9. Generate Diagnostic Visualizations
    cm_paths = plot_confusion_matrices(eval_results, output_dir=CLASSICAL_OUTPUTS_DIR)
    roc_path = plot_roc_curves(eval_results, y_test, output_dir=CLASSICAL_OUTPUTS_DIR)
    print(f"Saved confusion matrix figures: {len(cm_paths)} plots")
    print(f"Saved ROC curves figure: {roc_path.name}")

    print("=== [DAY 5] PIPELINE EXECUTION COMPLETE ===")
    return {
        "dataset": csv_file.name,
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target": target_col,
        "features": features,
        "models_trained": list(fitted_models.keys()),
        "saved_models": {k: str(v) for k, v in saved_model_paths.items()},
        "metrics_file": str(metrics_path),
        "reports_file": str(reports_path),
        "confusion_matrix_plots": {k: str(v) for k, v in cm_paths.items()},
        "roc_curve_plot": str(roc_path),
        "metrics_summary": metrics_df.to_dict(orient="records"),
    }


if __name__ == "__main__":
    summary = run_classical_pipeline()
    print("\n--- Summary Results ---")
    metrics_df = pd.DataFrame(summary["metrics_summary"])
    print(metrics_df.to_string(index=False))
