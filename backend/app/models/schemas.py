from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Health & Overview Schemas ────────────────────────────────────────────────
class SystemStatusResponse(BaseModel):
    status: str = "operational"
    version: str = "2.0.0"
    active_models_count: int
    total_models_count: int
    total_incidents: int
    unsolved_cases_count: int
    environment: str


class ModelRegistryItem(BaseModel):
    key: str
    name: str
    architecture: str
    task: str
    status: str
    metric: str
    metric_value: float


class ExecutiveOverviewResponse(BaseModel):
    kpis: Dict[str, Any]
    models: List[ModelRegistryItem]
    incident_sample: List[Dict[str, Any]]
    pca_variance: List[Dict[str, Any]]


# ── Solvability Schemas ──────────────────────────────────────────────────────
class EvidentiaryImpact(BaseModel):
    factor: str
    impact_pct: float
    description: str
    status: str = "POSITIVE"  # "POSITIVE" | "NEGATIVE" | "NEUTRAL"


class SolvabilityRequest(BaseModel):
    model: str = Field(default="ann", description="ann | ensemble")
    victim_age: float = Field(default=28.0, ge=0.0, le=100.0)
    victim_sex: str = Field(default="Male")
    victim_race: str = Field(default="Indian / General")
    victim_count: int = Field(default=0, ge=0)
    weapon: str = Field(default="Personal Weapons (Hands/Fists)")
    circumstance: str = Field(default="Robbery")
    relationship: Optional[str] = Field(default="Unknown / Stranger")
    suspect_lead_status: Optional[str] = Field(default="UNKNOWN_OFFENDER")
    cctv_footage: Optional[bool] = Field(default=False)
    forensic_dna_fingerprints: Optional[bool] = Field(default=False)
    eyewitness_present: Optional[bool] = Field(default=False)
    weapon_recovered: Optional[bool] = Field(default=False)
    vehicle_identified: Optional[bool] = Field(default=False)
    city: str = Field(default="Chennai")
    state: str = Field(default="Tamil Nadu")
    year: int = Field(default=2024, ge=1976, le=2026)
    month: int = Field(default=7, ge=1, le=12)
    is_weekend: int = Field(default=1, ge=0, le=1)
    day_of_week: int = Field(default=4, ge=0, le=6)


class SingleModelVerdict(BaseModel):
    model_key: str
    model_name: str
    prediction: int
    probability: float
    clearance_verdict: str
    confidence_tier: str


class SolvabilityResponse(BaseModel):
    status: str
    model_selected: str
    prediction: int
    probability: float
    clearance_percentage: float
    triage_tier: str
    triage_priority: str
    time_window_target: str
    verdicts: List[SingleModelVerdict] = []
    evidentiary_factors: List[EvidentiaryImpact] = []
    investigative_guidelines: List[str]
    input_features: Dict[str, Any]


# ── Clustering & Crime Linkage Schemas ───────────────────────────────────────
class ClusterAssignmentRequest(BaseModel):
    victim_age: float = Field(default=28.0, ge=0.0, le=100.0)
    weapon: str = Field(default="Handgun - pistol, revolver, etc")


class ClusterAssignmentResponse(BaseModel):
    status: str
    cluster_id: int
    cluster_label: str
    centroid_age: float
    distance_to_center: float
    behavioral_archetype: str
    investigative_focus: str


class ColdCaseQuery(BaseModel):
    state: Optional[str] = "All"
    weapon: Optional[str] = "All"
    cluster_id: Optional[str] = "All"
    min_similarity: float = Field(default=0.80, ge=0.5, le=1.0)
    limit: int = Field(default=50, ge=1, le=500)


class ColdCaseItem(BaseModel):
    Record_ID: str
    Year: int
    City: str
    State: str
    Victim_Age: float
    Victim_Sex: str
    Victim_Race: str
    Weapon: str
    Cluster_ID: int
    Similarity_Score: float
    Distance_To_Center: float


class ClusterDistributionResponse(BaseModel):
    kmeans_clusters: List[Dict[str, Any]]
    hierarchical_clusters: List[Dict[str, Any]]
    cluster_centers: List[Dict[str, Any]]


# ── Geographic Profiling Schemas ─────────────────────────────────────────────
class HotspotCentroid(BaseModel):
    rank: int
    latitude: float
    longitude: float
    city: str
    estimated_intensity: float
    normalized_intensity: float
    relative_rank: int
    percentile_tier: str
    recommended_patrol: str


class GeographicSummaryResponse(BaseModel):
    focal_region: str
    grid_resolution: str
    total_nodes: int
    bandwidth_km: float
    hotspots: List[HotspotCentroid]
    tamil_nadu_focus_districts: List[Dict[str, Any]]


class LWRKernelQuery(BaseModel):
    latitude: float
    longitude: float
    bandwidth: float = 0.857


# ── Behavioral Profiling (BBN) Schemas ───────────────────────────────────────
class ProfilingRequest(BaseModel):
    weapon: str = Field(default="Knife or cutting instrument")
    circumstance: str = Field(default="Lover triangle")
    victim_sex: str = Field(default="Female")
    victim_age: float = Field(default=30.0, ge=1.0, le=100.0)


class DemographicInference(BaseModel):
    top_sex: str
    sex_confidence: float
    top_age_bracket: str
    age_confidence: float
    top_relationship: str
    relationship_confidence: float
    top_race: str
    race_confidence: float


class ProfilingResponse(BaseModel):
    status: str
    top_demographics: DemographicInference
    distributions: Dict[str, Dict[str, float]]
    causal_deductions: List[str]
    evidence_evaluated: Dict[str, Any]


# ── Tamil Nadu Regional Analytics Schemas ────────────────────────────────────
class DistrictItem(BaseModel):
    district: str
    total_crime_2020_2022: int
    crime_rate_2022: float
    share_pct_2022: float
    projected_pop_lakhs: float
    murder_incidence: int
    murder_rate: float


class YearlyTrend(BaseModel):
    year: int
    total_crime_count: int
    yoy_change_pct: Optional[float] = None


class DistrictComparisonRequest(BaseModel):
    district_a: str
    district_b: str


class DistrictComparisonResponse(BaseModel):
    district_a: DistrictItem
    district_b: DistrictItem
    delta_total_crime: int
    delta_crime_rate: float
    leading_crime_district: str
