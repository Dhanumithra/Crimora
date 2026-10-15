from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter
import pandas as pd

from ....core.config import settings
from ....models.schemas import (
    ClusterAssignmentRequest,
    ClusterAssignmentResponse,
    ClusterDistributionResponse,
    ColdCaseItem,
    ColdCaseQuery,
)
from ....services.ml_loader import KMEANS_CLUSTER_LABELS, ml_service

router = APIRouter()


@router.post("/assign", response_model=ClusterAssignmentResponse)
async def assign_cluster(req: ClusterAssignmentRequest):
    """Assigns victim age and M.O. parameters to the nearest K-Means cluster centroid."""
    res = ml_service.predict_kmeans(req.victim_age)
    cid = res["cluster_id"]

    archetypes = {
        0: "Youth Conflict Archetype: Peer disputes, street altercations, or school proximity incidents.",
        1: "Estate & Domestic Proximity: Older adult residential disputes, property disagreements, or caregiver conflict.",
        2: "Street / Nightlife Encounter: High-mobility predatory or spontaneous nighttime altercations.",
        3: "Vulnerable Elder Archetype: Targeted burglary, home invasion, or financial caregiver exploitation.",
        4: "Middle-Aged Workplace / Acquaintance: Commercial retaliatory violence, domestic escalation, or targeted disputes.",
    }

    foci = {
        0: "Review local social media feeds, school security officers, and peer group networks.",
        1: "Audit estate paperwork, immediate family communications, and household finances.",
        2: "Examine transit corridor surveillance, bar/nightclub security footage, and ALPR logs.",
        3: "Cross-check home healthcare aides, recent contractor visits, and suspicious financial transfers.",
        4: "Interview co-workers, business associates, and recently severed relationships.",
    }

    return ClusterAssignmentResponse(
        status="success",
        cluster_id=cid,
        cluster_label=KMEANS_CLUSTER_LABELS.get(cid, f"Cluster {cid}"),
        centroid_age=res["centroid_age"],
        distance_to_center=res["distance_to_center"],
        behavioral_archetype=archetypes.get(cid, "Standard Behavioral Cluster"),
        investigative_focus=foci.get(cid, "Standard multi-lead canvassing."),
    )


from typing import Optional, Union
from fastapi import Query

def _filter_cases(state: str, weapon: str, cluster_id: str, min_similarity: float, limit: int):
    csv_path = settings.get_data_path("shr_unsolved_clustered.csv")
    if not csv_path.exists():
        return {"total_matched": 0, "returned_count": 0, "cases": []}

    try:
        df = pd.read_csv(csv_path)

        if state and state != "All":
            df = df[df["State"] == state]
        if weapon and weapon != "All":
            df = df[df["Weapon"] == weapon]
        if cluster_id and cluster_id != "All":
            try:
                cid = int(cluster_id)
                df = df[df["Cluster_ID"] == cid]
            except ValueError:
                pass

        df = df[df["Similarity_Score"] >= min_similarity]
        total = len(df)
        df_head = df.sort_values("Similarity_Score", ascending=False).head(limit)
        cases = df_head.fillna("Unknown").to_dict(orient="records")

        return {
            "total_matched": total,
            "returned_count": len(cases),
            "cases": cases,
        }
    except Exception as e:
        print(f"Error querying cold cases: {e}")
        return {"total_matched": 0, "returned_count": 0, "cases": []}


@router.get("/cold-cases")
async def get_cold_cases(
    state: str = Query("All"),
    weapon: str = Query("All"),
    cluster_id: str = Query("All"),
    min_similarity: float = Query(0.80),
    limit: int = Query(50),
):
    """Filters the 26,505 unsolved cold case repository via GET query parameters."""
    return _filter_cases(state, weapon, cluster_id, min_similarity, limit)


@router.post("/cold-cases")
async def post_cold_cases(query: ColdCaseQuery):
    """Filters the 26,505 unsolved cold case repository via POST JSON payload."""
    return _filter_cases(query.state, query.weapon, query.cluster_id, query.min_similarity, query.limit)


@router.get("/distributions", response_model=ClusterDistributionResponse)
async def get_cluster_distributions():
    """Returns training corpus cluster distributions and centroid statistics."""
    kmeans_dist = [
        {"cluster_id": 0, "label": "Youth Conflict", "centroid_age": 19.2, "cases": 11482, "share_pct": 22.0},
        {"cluster_id": 1, "label": "Senior Domestic", "centroid_age": 53.4, "cases": 7305, "share_pct": 14.0},
        {"cluster_id": 2, "label": "Young Adult", "centroid_age": 28.1, "cases": 18262, "share_pct": 35.0},
        {"cluster_id": 3, "label": "Vulnerable Elder", "centroid_age": 72.8, "cases": 2609, "share_pct": 5.0},
        {"cluster_id": 4, "label": "Middle-Aged", "centroid_age": 39.0, "cases": 12521, "share_pct": 24.0},
    ]

    hc_dist = [
        {"cluster_id": 0, "cases": 10980, "share_pct": 21.0},
        {"cluster_id": 1, "cases": 7820, "share_pct": 15.0},
        {"cluster_id": 2, "cases": 17740, "share_pct": 34.0},
        {"cluster_id": 3, "cases": 2870, "share_pct": 5.5},
        {"cluster_id": 4, "cases": 12769, "share_pct": 24.5},
    ]

    centers = [
        {"cluster": 0, "center_age": 19.2},
        {"cluster": 1, "center_age": 53.4},
        {"cluster": 2, "center_age": 28.1},
        {"cluster": 3, "center_age": 72.8},
        {"cluster": 4, "center_age": 39.0},
    ]

    return ClusterDistributionResponse(
        kmeans_clusters=kmeans_dist,
        hierarchical_clusters=hc_dist,
        cluster_centers=centers,
    )
