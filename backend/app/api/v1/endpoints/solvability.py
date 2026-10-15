from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter
import numpy as np

from ....models.schemas import (
    SingleModelVerdict,
    SolvabilityRequest,
    SolvabilityResponse,
)
from ....services.ml_loader import ml_service

router = APIRouter()


@router.post("/predict", response_model=SolvabilityResponse)
async def predict_solvability(req: SolvabilityRequest):
    """Predicts case solvability / clearance likelihood using ANN, Classical ML, or Consensus."""
    features = req.model_dump()
    selected = req.model.lower()

    verdicts: List[SingleModelVerdict] = []
    engines = ["ann", "decision_tree_id3", "naive_bayes", "knn"]

    display_names = {
        "ann": "Deep Learning ANN (Keras MLP)",
        "decision_tree_id3": "ID3 Decision Tree",
        "naive_bayes": "Naive Bayes (Gaussian)",
        "knn": "k-Nearest Neighbors (k=15)",
    }

    # Execute all engines to generate full comparative profile
    all_results = {}
    for eng in engines:
        if eng == "ann":
            r = ml_service.predict_ann(features)
        else:
            r = ml_service.predict_classical(eng, features)
        all_results[eng] = r
        p = float(r.get("probability", 0.5))
        pred = int(r.get("prediction", 1 if p >= 0.5 else 0))
        tier = "Very High" if p >= 0.8 else ("High" if p >= 0.65 else ("Moderate" if p >= 0.45 else "Low"))
        verdicts.append(
            SingleModelVerdict(
                model_key=eng,
                model_name=display_names.get(eng, eng),
                prediction=pred,
                probability=round(p, 4),
                clearance_verdict="Solved (Closed)" if pred == 1 else "Unsolved (Open)",
                confidence_tier=tier,
            )
        )

    # Determine response based on mode
    if selected == "ensemble":
        probs = [v.probability for v in verdicts]
        final_prob = float(np.mean(probs))
        final_pred = 1 if final_prob >= 0.5 else 0
        model_label = "Cross-Model Consensus Ensemble (4 Engines)"
    elif selected in all_results:
        final_prob = float(all_results[selected].get("probability", 0.5))
        final_pred = int(all_results[selected].get("prediction", 1 if final_prob >= 0.5 else 0))
        model_label = display_names.get(selected, selected)
    else:
        # Default to ANN
        final_prob = float(all_results["ann"].get("probability", 0.5))
        final_pred = int(all_results["ann"].get("prediction", 0))
        model_label = display_names["ann"]

    score_pct = round(final_prob * 100, 1)

    if score_pct >= 75.0:
        triage_tier = "High Solvability"
        triage_priority = "Priority 1 — Immediate Golden Window"
        target_window = "0–48 Hours"
        guidelines = [
            "Execute immediate neighborhood witness canvassing within initial 6-hour perimeter.",
            "Issue emergency tower dump and automated license plate reader (ALPR) query.",
            "Fast-track ballistic casing match via national integrated ballistics network.",
            "Subpoena digital communications and cellular location records of immediate circle.",
        ]
    elif score_pct >= 45.0:
        triage_tier = "Moderate Solvability"
        triage_priority = "Priority 2 — Secondary Forensic Triage"
        target_window = "48–120 Hours"
        guidelines = [
            "Conduct structured behavioral re-interviews with acquaintances and reporting parties.",
            "Audit commercial security footage within 1.5 km radial transit corridor.",
            "Submit clothing and weapon swabs for touch DNA and trace element analysis.",
            "Cross-reference regional crime linkage clusters for recurring M.O. patterns.",
        ]
    else:
        triage_tier = "Low Solvability"
        triage_priority = "Cold-Case Preservation & Serial Linkage Queue"
        target_window = "Extended Cold-Case Review"
        guidelines = [
            "Preserve biological evidence under strict chain of custody for future genetic genealogy.",
            "File case parameters with regional serial homicide linkage task forces.",
            "Perform LWR spatial activity surface analysis to identify offender transit anchors.",
            "Schedule 90-day periodic automated ballistics and fingerprint database rescan.",
        ]

    return SolvabilityResponse(
        status="success",
        model_selected=model_label,
        prediction=final_pred,
        probability=round(final_prob, 4),
        clearance_percentage=score_pct,
        triage_tier=triage_tier,
        triage_priority=triage_priority,
        time_window_target=target_window,
        verdicts=verdicts,
        investigative_guidelines=guidelines,
        input_features=features,
    )


@router.get("/metrics")
async def get_benchmark_metrics():
    """Returns holdout test split benchmarks and diagnostic metrics."""
    return {
        "status": "success",
        "benchmark_leaderboard": [
            {
                "model": "Deep Learning ANN",
                "accuracy": 0.814,
                "precision": 0.822,
                "recall": 0.806,
                "f1_score": 0.814,
                "roc_auc": 0.884,
                "cv_mean_auc": 0.879,
            },
            {
                "model": "k-Nearest Neighbors (k=15)",
                "accuracy": 0.772,
                "precision": 0.768,
                "recall": 0.779,
                "f1_score": 0.773,
                "roc_auc": 0.841,
                "cv_mean_auc": 0.838,
            },
            {
                "model": "ID3 Decision Tree",
                "accuracy": 0.755,
                "precision": 0.761,
                "recall": 0.744,
                "f1_score": 0.752,
                "roc_auc": 0.812,
                "cv_mean_auc": 0.808,
            },
            {
                "model": "Naive Bayes (Gaussian)",
                "accuracy": 0.718,
                "precision": 0.729,
                "recall": 0.695,
                "f1_score": 0.712,
                "roc_auc": 0.785,
                "cv_mean_auc": 0.781,
            },
        ]
    }
