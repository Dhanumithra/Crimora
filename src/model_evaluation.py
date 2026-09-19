"""Model Evaluation and Diagnostics Module for Case Solvability.

Provides objective evaluation utilities for classical classification models:
- Standard classification metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC
- Stratified K-Fold Cross-Validation for stability analysis
- Structured classification report extraction
- Publication-quality confusion matrix heatmaps
- Multi-model ROC curve visualizations
- Metric table serialization (CSV)

Adheres strictly to academic decision-support guidelines:
Reports performance metrics objectively without ranking models as 'best',
using neutral terminology ('case solvability prediction', 'model estimate', 'historical patterns').
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline

from src.config import CLASSICAL_OUTPUTS_DIR


# =====================================================================
# 1. Single and Multi-Model Evaluation
# =====================================================================

def evaluate_single_model(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    model_name: str,
) -> Dict[str, Any]:
    """Evaluate a fitted classification pipeline on holdout test data.

    Args:
        pipeline: Fitted sklearn Pipeline.
        X_test: Test features DataFrame.
        y_test: Ground-truth target Series.
        model_name: Human-readable model identifier.

    Returns:
        Dict[str, Any]: Evaluation dictionary containing scalar metrics, confusion matrix,
                        probabilities, and raw classification report.
    """
    y_pred = pipeline.predict(X_test)

    # Probabilities for ROC-AUC
    y_proba: Optional[np.ndarray] = None
    roc_auc: Optional[float] = None
    if hasattr(pipeline, "predict_proba"):
        try:
            proba = pipeline.predict_proba(X_test)
            if proba.shape[1] == 2:
                y_proba = proba[:, 1]
                roc_auc = float(roc_auc_score(y_test, y_proba))
        except Exception:
            y_proba = None
            roc_auc = None

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred)
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else np.nan,
        "confusion_matrix": cm,
        "y_pred": y_pred,
        "y_proba": y_proba,
        "report_dict": report_dict,
    }


def perform_cross_validation(
    models: Dict[str, Pipeline],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    n_splits: int = 5,
    random_state: int = 42,
) -> Dict[str, Dict[str, float]]:
    """Execute Stratified K-Fold Cross-Validation across all classical models.

    Args:
        models: Dictionary of model pipelines.
        X_train: Training features.
        y_train: Training target.
        n_splits: Number of folds (default 5).
        random_state: Random state for deterministic fold partitioning.

    Returns:
        Dict[str, Dict[str, float]]: Map of model names to cross-validation summary metrics.
    """
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    cv_results: Dict[str, Dict[str, float]] = {}

    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]

    for model_name, pipeline in models.items():
        scores = cross_validate(
            pipeline,
            X_train,
            y_train,
            cv=skf,
            scoring=scoring,
            n_jobs=-1,
            return_train_score=False,
        )
        cv_results[model_name] = {
            "cv_accuracy_mean": round(float(np.mean(scores["test_accuracy"])), 4),
            "cv_accuracy_std": round(float(np.std(scores["test_accuracy"])), 4),
            "cv_precision_mean": round(float(np.mean(scores["test_precision"])), 4),
            "cv_recall_mean": round(float(np.mean(scores["test_recall"])), 4),
            "cv_f1_mean": round(float(np.mean(scores["test_f1"])), 4),
            "cv_roc_auc_mean": round(float(np.mean(scores["test_roc_auc"])), 4),
        }

    return cv_results


def compile_evaluation_tables(
    eval_results: Dict[str, Dict[str, Any]],
    cv_results: Optional[Dict[str, Dict[str, float]]] = None,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Compile model metrics comparison table and structured classification reports DataFrame.

    Args:
        eval_results: Dict mapping model names to evaluate_single_model results.
        cv_results: Optional cross-validation results from perform_cross_validation.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: (metrics_summary_df, classification_reports_df)
    """
    # 1. Metrics summary table
    summary_rows: List[Dict[str, Any]] = []
    for model_name, res in eval_results.items():
        row = {
            "model": model_name,
            "accuracy": res["accuracy"],
            "precision": res["precision"],
            "recall": res["recall"],
            "f1_score": res["f1_score"],
            "roc_auc": res["roc_auc"],
        }
        if cv_results and model_name in cv_results:
            row.update(cv_results[model_name])
        summary_rows.append(row)

    metrics_df = pd.DataFrame(summary_rows)

    # 2. Detailed classification reports table
    report_rows: List[Dict[str, Any]] = []
    for model_name, res in eval_results.items():
        rep = res["report_dict"]
        for label, metrics in rep.items():
            if isinstance(metrics, dict):
                report_rows.append({
                    "model": model_name,
                    "class_or_metric": label,
                    "precision": round(metrics.get("precision", 0.0), 4),
                    "recall": round(metrics.get("recall", 0.0), 4),
                    "f1_score": round(metrics.get("f1-score", 0.0), 4),
                    "support": int(metrics.get("support", 0)),
                })

    reports_df = pd.DataFrame(report_rows)
    return metrics_df, reports_df


# =====================================================================
# 2. Diagnostic Visualizations
# =====================================================================

def plot_confusion_matrices(
    eval_results: Dict[str, Dict[str, Any]],
    output_dir: Union[str, Path] = CLASSICAL_OUTPUTS_DIR,
) -> Dict[str, Path]:
    """Generate individual and combined confusion matrix heatmaps.

    Args:
        eval_results: Evaluation results dictionary.
        output_dir: Destination directory.

    Returns:
        Dict[str, Path]: Map of plot names to saved file paths.
    """
    cm_dir = Path(output_dir) / "confusion_matrices"
    cm_dir.mkdir(parents=True, exist_ok=True)
    plot_paths: Dict[str, Path] = {}

    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams.update({"font.sans-serif": "DejaVu Sans", "font.size": 10})

    class_names = ["Unsolved (0)", "Solved (1)"]

    # Individual plots
    for model_name, res in eval_results.items():
        cm = res["confusion_matrix"]
        fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=class_names,
            yticklabels=class_names,
            cbar=False,
            ax=ax,
        )
        ax.set_title(f"Confusion Matrix — {model_name.replace('_', ' ').title()}", fontsize=11, fontweight="bold", pad=10)
        ax.set_xlabel("Predicted Case Solvability Label", fontsize=10)
        ax.set_ylabel("Ground Truth Outcome", fontsize=10)
        fig.tight_layout()

        p_file = cm_dir / f"{model_name}_confusion_matrix.png"
        fig.savefig(p_file, bbox_inches="tight")
        plt.close(fig)
        plot_paths[f"{model_name}_cm"] = p_file

    # Combined 1x3 panel
    n_models = len(eval_results)
    fig, axes = plt.subplots(1, n_models, figsize=(5.5 * n_models, 5), dpi=300)
    if n_models == 1:
        axes = [axes]

    for idx, (model_name, res) in enumerate(eval_results.items()):
        cm = res["confusion_matrix"]
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=class_names,
            yticklabels=class_names,
            cbar=False,
            ax=axes[idx],
        )
        axes[idx].set_title(model_name.replace('_', ' ').title(), fontsize=11, fontweight="bold")
        axes[idx].set_xlabel("Predicted Label")
        if idx == 0:
            axes[idx].set_ylabel("Ground Truth Outcome")
        else:
            axes[idx].set_ylabel("")

    fig.suptitle("Case Solvability Prediction — Model Confusion Matrices", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()

    comb_file = cm_dir / "confusion_matrices_combined.png"
    fig.savefig(comb_file, bbox_inches="tight")
    plt.close(fig)
    plot_paths["combined_cm"] = comb_file

    return plot_paths


def plot_roc_curves(
    eval_results: Dict[str, Dict[str, Any]],
    y_test: pd.Series,
    output_dir: Union[str, Path] = CLASSICAL_OUTPUTS_DIR,
) -> Path:
    """Generate multi-model Receiver Operating Characteristic (ROC) curve comparison plot.

    Args:
        eval_results: Dict mapping model names to evaluation outputs.
        y_test: Ground-truth test target.
        output_dir: Destination directory.

    Returns:
        Path: Path to saved ROC plot image.
    """
    roc_dir = Path(output_dir) / "roc_curves"
    roc_dir.mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(8, 7), dpi=300)

    # Color palette
    colors = {
        "id3_decision_tree": "#1f77b4",
        "naive_bayes": "#2ca02c",
        "knn": "#d62728",
    }

    for model_name, res in eval_results.items():
        y_proba = res.get("y_proba")
        auc = res.get("roc_auc")
        label_name = model_name.replace('_', ' ').title()

        if y_proba is not None and np.isfinite(auc):
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            color = colors.get(model_name, "#333333")
            ax.plot(
                fpr,
                tpr,
                color=color,
                linewidth=2.0,
                label=f"{label_name} (AUC = {auc:.3f})",
            )

    # 45-degree random chance baseline
    ax.plot([0, 1], [0, 1], color="gray", linestyle="--", linewidth=1.2, label="Random Chance (AUC = 0.500)")

    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=11)
    ax.set_title("Case Solvability Models — Receiver Operating Characteristic (ROC)", fontsize=12, fontweight="bold", pad=12)
    ax.legend(loc="lower right", frameon=True, fontsize=10)
    fig.tight_layout()

    save_path = roc_dir / "roc_curves_combined.png"
    fig.savefig(save_path, bbox_inches="tight")
    plt.close(fig)

    return save_path


def export_evaluation_artifacts(
    metrics_df: pd.DataFrame,
    reports_df: pd.DataFrame,
    output_dir: Union[str, Path] = CLASSICAL_OUTPUTS_DIR,
) -> Tuple[Path, Path]:
    """Serialize model evaluation summary and classification reports to CSV.

    Args:
        metrics_df: Summary metrics table.
        reports_df: Detailed classification reports table.
        output_dir: Destination folder.

    Returns:
        Tuple[Path, Path]: (metrics_path, reports_path)
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    metrics_file = out_path / "model_metrics.csv"
    reports_file = out_path / "classification_reports.csv"

    metrics_df.to_csv(metrics_file, index=False)
    reports_df.to_csv(reports_file, index=False)

    return metrics_file, reports_file
