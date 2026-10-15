export interface SystemStatus {
  status: string;
  version: string;
  active_models_count: number;
  total_models_count: number;
  total_incidents: number;
  unsolved_cases_count: number;
  environment: string;
}

export interface ModelRegistryItem {
  key: string;
  name: string;
  architecture: string;
  task: string;
  status: string;
  metric: string;
  metric_value: number;
}

export interface ExecutiveOverview {
  kpis: {
    total_records: number;
    unsolved_cases: number;
    clearance_rate_pct: number;
    active_districts: number;
    hotspot_zones: number;
    mean_victim_age: number;
    serial_candidates: number;
  };
  models: ModelRegistryItem[];
  incident_sample: Array<Record<string, any>>;
  pca_variance: Array<{ component: string; variance_ratio: number; cumulative: number }>;
}

export interface SolvabilityPayload {
  model?: string;
  victim_age: number;
  victim_sex: string;
  victim_race: string;
  victim_count: number;
  weapon: string;
  circumstance: string;
  relationship: string;
  city: string;
  state: string;
  year: number;
  month: number;
  is_weekend: number;
  day_of_week: number;
}

export interface SingleModelVerdict {
  model_key: string;
  model_name: string;
  prediction: number;
  probability: number;
  clearance_verdict: string;
  confidence_tier: string;
}

export interface SolvabilityResult {
  status: string;
  model_selected: string;
  prediction: number;
  probability: number;
  clearance_percentage: number;
  triage_tier: string;
  triage_priority: string;
  time_window_target: string;
  verdicts: SingleModelVerdict[];
  investigative_guidelines: string[];
  input_features: Record<string, any>;
}

export interface ClusterAssignmentResult {
  status: string;
  cluster_id: number;
  cluster_label: string;
  centroid_age: number;
  distance_to_center: number;
  behavioral_archetype: string;
  investigative_focus: string;
}

export interface ColdCaseItem {
  Record_ID: string;
  Year: number;
  City: string;
  State: string;
  Victim_Age: number;
  Victim_Sex: string;
  Victim_Race: string;
  Weapon: string;
  Cluster_ID: number;
  Similarity_Score: number;
  Distance_To_Center: number;
}

export interface ColdCaseResponse {
  total_matched: number;
  returned_count: number;
  cases: ColdCaseItem[];
}

export interface ClusterDistributions {
  kmeans_clusters: Array<{
    cluster_id: number;
    label: string;
    case_count: number;
    share_pct: number;
    top_weapon: string;
    mean_age: number;
  }>;
  hierarchical_clusters: Array<{
    cluster_id: number;
    label: string;
    case_count: number;
    share_pct: number;
  }>;
  cluster_centers: Array<{
    cluster_id: number;
    normalized_age: number;
    dominant_weapon_feature: number;
  }>;
}

export interface HotspotCentroid {
  rank: number;
  latitude: number;
  longitude: number;
  city: string;
  estimated_intensity: number;
  normalized_intensity: number;
  relative_rank: number;
  percentile_tier: string;
  recommended_patrol: string;
}

export interface GeographicSummary {
  focal_region: string;
  grid_resolution: string;
  total_nodes: number;
  bandwidth_km: number;
  hotspots: HotspotCentroid[];
  tamil_nadu_focus_districts: Array<{
    district: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lon?: number;
    base_weight?: number;
  }>;
}

export interface DemographicInference {
  top_sex: string;
  sex_confidence: number;
  top_age_bracket: string;
  age_confidence: number;
  top_relationship: string;
  relationship_confidence: number;
  top_race: string;
  race_confidence: number;
}

export interface ProfilingResult {
  status: string;
  top_demographics: DemographicInference;
  distributions: {
    offender_sex: Record<string, number>;
    offender_age: Record<string, number>;
    offender_relationship: Record<string, number>;
    offender_race: Record<string, number>;
  };
  causal_deductions: string[];
  evidence_evaluated: Record<string, any>;
}

export interface DistrictMetric {
  district: string;
  total_crime_2020_2022: number;
  crime_rate_2022: number;
  share_pct_2022: number;
  projected_pop_lakhs: number;
  murder_incidence: number;
  murder_rate: number;
}

export interface YearlyTrend {
  year: number;
  total_crime_count: number;
  yoy_change_pct: number | null;
}

export interface DistrictComparison {
  district_a: DistrictMetric;
  district_b: DistrictMetric;
  delta_total_crime: number;
  delta_crime_rate: number;
  leading_crime_district: string;
}
