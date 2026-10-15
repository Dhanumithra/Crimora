from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter
import pandas as pd

from ....core.config import settings
from ....models.schemas import ProfilingRequest, ProfilingResponse
from ....services.ml_loader import ml_service

router = APIRouter()


@router.post("/infer", response_model=ProfilingResponse)
async def infer_suspect_profile(req: ProfilingRequest):
    """Executes Bayesian Belief Network causal inference given observed scene parameters."""
    res = ml_service.predict_bbn_traits(
        weapon=req.weapon,
        circumstance=req.circumstance,
        vic_sex=req.victim_sex,
        vic_age=req.victim_age,
    )

    raw_dist = res["distributions"]
    dist_payload = {
        "sex": raw_dist.get("sex", {}),
        "age": raw_dist.get("age", {}),
        "relationship": raw_dist.get("relationship", {}),
        "race": raw_dist.get("race", {}),
        "offender_sex": raw_dist.get("sex", {}),
        "offender_age": raw_dist.get("age", {}),
        "offender_relationship": raw_dist.get("relationship", {}),
        "offender_race": raw_dist.get("race", {}),
    }

    return ProfilingResponse(
        status="success",
        top_demographics=res["top_demographics"],
        distributions=dist_payload,
        causal_deductions=res["causal_deductions"],
        evidence_evaluated=req.model_dump(),
    )


@router.get("/dag")
async def get_dag_schema():
    """Returns Directed Acyclic Graph (DAG) structural topology and node schemas."""
    return {
        "status": "success",
        "evidence_nodes": [
            {"node": "Weapon_Class", "states": ["Firearm", "Cutting Instrument", "Blunt Object", "Personal Weapon", "Other"]},
            {"node": "Crime_Circumstance", "states": ["Robbery", "Argument", "Lover Triangle", "Narcotics", "Gang Dispute"]},
            {"node": "Victim_Age_Group", "states": ["Minor (<18)", "Young Adult (18-29)", "Adult (30-49)", "Senior (50+)"]},
            {"node": "Victim_Sex", "states": ["Male", "Female"]},
        ],
        "hypothesis_nodes": [
            {"node": "Offender_Sex", "states": ["Male", "Female"]},
            {"node": "Offender_Age_Bracket", "states": ["15-19", "20-29", "30-39", "40-49", "50+"]},
            {"node": "Offender_Relationship", "states": ["Acquaintance", "Stranger", "Intimate Partner", "Family"]},
            {"node": "Offender_Proximity", "states": ["Local Resident", "Neighborhood Regular", "Transitory"]},
        ],
        "edges": [
            ["Weapon_Class", "Offender_Relationship"],
            ["Weapon_Class", "Offender_Sex"],
            ["Crime_Circumstance", "Offender_Relationship"],
            ["Crime_Circumstance", "Offender_Sex"],
            ["Victim_Sex", "Offender_Relationship"],
            ["Victim_Age_Group", "Offender_Age_Bracket"],
        ],
    }


@router.get("/baseline")
async def get_historical_baseline():
    """Returns baseline empirical M.O. distributions from 52,179 verified historical cases."""
    return {
        "status": "success",
        "victim_sex_distribution": {"Male": 77.4, "Female": 22.3, "Unknown": 0.3},
        "top_victim_demographics": [
            {"demographic": "Black Male", "share_pct": 53.4},
            {"demographic": "White Male", "share_pct": 19.8},
            {"demographic": "Black Female", "share_pct": 11.2},
            {"demographic": "White Female", "share_pct": 10.5},
            {"demographic": "Hispanic Male", "share_pct": 3.8},
            {"demographic": "Asian / Other", "share_pct": 1.3},
        ],
        "annual_trends": [
            {"year": 2012, "incidents": 2680},
            {"year": 2013, "incidents": 2510},
            {"year": 2014, "incidents": 2640},
            {"year": 2015, "incidents": 3050},
            {"year": 2016, "incidents": 3480},
            {"year": 2017, "incidents": 3390},
            {"year": 2018, "incidents": 3120},
            {"year": 2019, "incidents": 3280},
            {"year": 2020, "incidents": 4120},
            {"year": 2021, "incidents": 4350},
            {"year": 2022, "incidents": 3980},
        ],
    }
