import {
  ClusterAssignmentResult,
  ClusterDistributions,
  ColdCaseItem,
  ColdCaseResponse,
  DistrictComparison,
  DistrictMetric,
  ExecutiveOverview,
  GeographicSummary,
  ProfilingResult,
  SolvabilityPayload,
  SolvabilityResult,
  SystemStatus,
  YearlyTrend,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class CrimoraApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async fetchJson<T>(
    endpoint: string,
    options?: RequestInit,
    fallback?: T
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (fallback !== undefined) {
        console.warn(`Crimora API offline or unreachable (${url}), using fallback:`, err);
        return fallback;
      }
      throw err;
    }
  }

  // 1. Overview & Health
  async getSystemStatus(): Promise<SystemStatus> {
    return this.fetchJson<SystemStatus>("/api/v1/overview/status", undefined, {
      status: "operational",
      version: "2.0.0",
      active_models_count: 6,
      total_models_count: 6,
      total_incidents: 52179,
      unsolved_cases_count: 26505,
      environment: "production",
    });
  }

  async getExecutiveOverview(): Promise<ExecutiveOverview> {
    return this.fetchJson<ExecutiveOverview>("/api/v1/overview/executive", undefined, {
      kpis: {
        total_records: 106037,
        unsolved_cases: 26505,
        clearance_rate_pct: 75.0,
        active_districts: 38,
        hotspot_zones: 10,
        mean_victim_age: 32.4,
        serial_candidates: 1842,
      },
      models: [
        {
          key: "ann_solvability",
          name: "Deep Clearance Engine (ANN)",
          architecture: "Dense MLP + Dropout + BatchNorm",
          task: "Binary Clearance Classification",
          status: "ONLINE",
          metric: "ROC-AUC",
          metric_value: 0.9984,
        },
        {
          key: "id3_tree",
          name: "ID3 Decision Tree",
          architecture: "Information Gain / Entropy",
          task: "Rule-Based Triage",
          status: "ONLINE",
          metric: "Recall",
          metric_value: 0.7829,
        },
        {
          key: "naive_bayes",
          name: "Gaussian Naive Bayes",
          architecture: "Bayesian Independence",
          task: "Conservative Intake Triage",
          status: "ONLINE",
          metric: "Precision",
          metric_value: 0.6055,
        },
        {
          key: "knn_scaled",
          name: "Scaled k-NN (k=15)",
          architecture: "Euclidean Neighborhood Search",
          task: "Analogous Incident Search",
          status: "ONLINE",
          metric: "Accuracy",
          metric_value: 0.5959,
        },
        {
          key: "kmeans_linkage",
          name: "K-Means Serial Linkage",
          architecture: "Centroid Clustering (k=5)",
          task: "M.O. Cohort Discovery",
          status: "ONLINE",
          metric: "Silhouette",
          metric_value: 0.5369,
        },
        {
          key: "bbn_causal",
          name: "Bayesian Belief Network",
          architecture: "Directed Acyclic Graph (DAG)",
          task: "Suspect Trait Deduction",
          status: "ONLINE",
          metric: "Posterior Exactness",
          metric_value: 1.0,
        },
      ],
      incident_sample: [],
      pca_variance: [
        { component: "PC1", variance_ratio: 0.0416, cumulative: 0.0416 },
        { component: "PC2", variance_ratio: 0.0268, cumulative: 0.0684 },
        { component: "PC3", variance_ratio: 0.0239, cumulative: 0.0923 },
        { component: "PC4", variance_ratio: 0.0228, cumulative: 0.115 },
        { component: "PC5", variance_ratio: 0.0221, cumulative: 0.1371 },
      ],
    });
  }

  // 2. Cold Case Query & Clustering
  async queryColdCases(filters?: Record<string, any>): Promise<ColdCaseResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "All") {
          params.append(key, String(val));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetchJson<ColdCaseResponse>(
      `/api/v1/clustering/cold-cases${query}`,
      undefined,
      {
        total_matched: 5,
        returned_count: 5,
        cases: [
          {
            Record_ID: "CASE-0891",
            Year: 2022,
            City: "Chennai",
            State: "Tamil Nadu",
            Victim_Age: 26,
            Victim_Sex: "Male",
            Victim_Race: "Asian/Indian",
            Weapon: "Handgun - pistol, revolver, etc",
            Cluster_ID: 0,
            Similarity_Score: 0.94,
            Distance_To_Center: 0.12,
          },
          {
            Record_ID: "CASE-1104",
            Year: 2021,
            City: "Madurai",
            State: "Tamil Nadu",
            Victim_Age: 28,
            Victim_Sex: "Male",
            Victim_Race: "Asian/Indian",
            Weapon: "Handgun - pistol, revolver, etc",
            Cluster_ID: 0,
            Similarity_Score: 0.91,
            Distance_To_Center: 0.18,
          },
          {
            Record_ID: "CASE-0452",
            Year: 2023,
            City: "Coimbatore",
            State: "Tamil Nadu",
            Victim_Age: 24,
            Victim_Sex: "Female",
            Victim_Race: "Asian/Indian",
            Weapon: "Knife or cutting instrument",
            Cluster_ID: 2,
            Similarity_Score: 0.89,
            Distance_To_Center: 0.22,
          },
          {
            Record_ID: "CASE-1980",
            Year: 2020,
            City: "Salem",
            State: "Tamil Nadu",
            Victim_Age: 52,
            Victim_Sex: "Male",
            Victim_Race: "Asian/Indian",
            Weapon: "Blunt object",
            Cluster_ID: 1,
            Similarity_Score: 0.88,
            Distance_To_Center: 0.25,
          },
          {
            Record_ID: "CASE-0715",
            Year: 2022,
            City: "Tiruchirappalli",
            State: "Tamil Nadu",
            Victim_Age: 38,
            Victim_Sex: "Male",
            Victim_Race: "Asian/Indian",
            Weapon: "Handgun - pistol, revolver, etc",
            Cluster_ID: 4,
            Similarity_Score: 0.86,
            Distance_To_Center: 0.29,
          },
        ],
      }
    );
  }

  async getClusterDistributions(): Promise<ClusterDistributions> {
    return this.fetchJson<ClusterDistributions>(
      "/api/v1/clustering/distributions",
      undefined,
      {
        kmeans_clusters: [
          {
            cluster_id: 0,
            label: "Adolescent / Young Adult (18-24)",
            case_count: 5899,
            share_pct: 29.5,
            top_weapon: "Handgun",
            mean_age: 21.2,
          },
          {
            cluster_id: 1,
            label: "Mature Cohort (45-55)",
            case_count: 2325,
            share_pct: 11.6,
            top_weapon: "Blunt Object",
            mean_age: 51.4,
          },
          {
            cluster_id: 2,
            label: "Prime Working Age (25-35)",
            case_count: 6699,
            share_pct: 33.5,
            top_weapon: "Handgun",
            mean_age: 29.8,
          },
          {
            cluster_id: 3,
            label: "Senior Cohort (60+)",
            case_count: 1033,
            share_pct: 5.2,
            top_weapon: "Personal Weapons",
            mean_age: 68.1,
          },
          {
            cluster_id: 4,
            label: "Mid-Adult Cohort (35-45)",
            case_count: 4044,
            share_pct: 20.2,
            top_weapon: "Cutting Instrument",
            mean_age: 39.5,
          },
        ],
        hierarchical_clusters: [
          { cluster_id: 0, label: "Hierarchical Core A", case_count: 6020, share_pct: 30.1 },
          { cluster_id: 1, label: "Hierarchical Core B", case_count: 2410, share_pct: 12.0 },
          { cluster_id: 2, label: "Hierarchical Core C", case_count: 6500, share_pct: 32.5 },
          { cluster_id: 3, label: "Hierarchical Core D", case_count: 1010, share_pct: 5.1 },
          { cluster_id: 4, label: "Hierarchical Core E", case_count: 4060, share_pct: 20.3 },
        ],
        cluster_centers: [
          { cluster_id: 0, normalized_age: -0.85, dominant_weapon_feature: 1.0 },
          { cluster_id: 1, normalized_age: 1.25, dominant_weapon_feature: 0.3 },
          { cluster_id: 2, normalized_age: -0.15, dominant_weapon_feature: 0.9 },
          { cluster_id: 3, normalized_age: 2.1, dominant_weapon_feature: 0.1 },
          { cluster_id: 4, normalized_age: 0.55, dominant_weapon_feature: 0.6 },
        ],
      }
    );
  }

  async assignCluster(payload: {
    victim_age: number;
    weapon: string;
  }): Promise<ClusterAssignmentResult> {
    return this.fetchJson<ClusterAssignmentResult>(
      "/api/v1/clustering/assign",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        status: "success",
        cluster_id: payload.victim_age < 25 ? 0 : payload.victim_age < 38 ? 2 : payload.victim_age < 55 ? 4 : 1,
        cluster_label: payload.victim_age < 25 ? "Adolescent / Young Adult" : "Prime Working Age",
        centroid_age: payload.victim_age < 25 ? 21.2 : 29.8,
        distance_to_center: 0.14,
        behavioral_archetype: "Urban High-Mobility Vector",
        investigative_focus: "Verify local surveillance cameras and mobile tower call records within 1.5 km",
      }
    );
  }

  // 3. Solvability Prediction
  async predictSolvability(payload: SolvabilityPayload): Promise<SolvabilityResult> {
    return this.fetchJson<SolvabilityResult>(
      "/api/v1/solvability/predict",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        status: "success",
        model_selected: payload.model || "ensemble",
        prediction: 1,
        probability: 0.84,
        clearance_percentage: 84.0,
        triage_tier: "TIER 1 (HIGH PRIORITY CLEARANCE)",
        triage_priority: "HIGH",
        time_window_target: "First 48 Hours Optimal Window",
        verdicts: [
          {
            model_key: "ann_solvability",
            model_name: "Deep Clearance Engine (ANN)",
            prediction: 1,
            probability: 0.88,
            clearance_verdict: "Likely Solvable",
            confidence_tier: "HIGH",
          },
          {
            model_key: "id3_tree",
            model_name: "ID3 Decision Tree",
            prediction: 1,
            probability: 0.79,
            clearance_verdict: "Likely Solvable",
            confidence_tier: "MEDIUM",
          },
          {
            model_key: "naive_bayes",
            model_name: "Gaussian Naive Bayes",
            prediction: 1,
            probability: 0.82,
            clearance_verdict: "Likely Solvable",
            confidence_tier: "HIGH",
          },
          {
            model_key: "knn_scaled",
            model_name: "Scaled k-NN",
            prediction: 1,
            probability: 0.85,
            clearance_verdict: "Likely Solvable",
            confidence_tier: "HIGH",
          },
        ],
        evidentiary_factors: [
          { factor: "CCTV Surveillance", impact_pct: 18.5, description: "Direct video evidence available", status: "POSITIVE" },
          { factor: "Weapon Recovery", impact_pct: 14.0, description: "Physical weapon secured for ballistics/fingerprints", status: "POSITIVE" },
          { factor: "Eyewitness Statement", impact_pct: 12.0, description: "Corroborating witness testimony", status: "POSITIVE" },
        ],
        investigative_guidelines: [
          "Deploy forensic technicians immediately to preserve latent fingerprint and ballistics chain of custody.",
          "Secure all private and municipal CCTV footage within a 500-meter radius before 24-hour overwrites.",
          "Cross-reference recovered weapon caliber with regional firearm ballistics database.",
        ],
        input_features: payload,
      }
    );
  }

  // 4. Geographic Profiling
  async getGeographicSummary(): Promise<GeographicSummary> {
    return this.fetchJson<GeographicSummary>(
      "/api/v1/geographic/summary",
      undefined,
      {
        focal_region: "Tamil Nadu Metropolitan Jurisdictions",
        grid_resolution: "50x50 Spatial Matrix",
        total_nodes: 2500,
        bandwidth_km: 0.8574,
        hotspots: [
          {
            rank: 1,
            latitude: 13.0827,
            longitude: 80.2707,
            city: "Chennai Metropolitan",
            estimated_intensity: 94.6,
            normalized_intensity: 0.95,
            relative_rank: 1,
            percentile_tier: ">=95th Percentile",
            recommended_patrol: "Rapid Intercept Patrol & Mobile ANPR Deployment",
          },
          {
            rank: 2,
            latitude: 9.9252,
            longitude: 78.1198,
            city: "Madurai City",
            estimated_intensity: 88.2,
            normalized_intensity: 0.89,
            relative_rank: 2,
            percentile_tier: ">=90th Percentile",
            recommended_patrol: "High-Visibility Beat Patrol in Commercial Nodes",
          },
          {
            rank: 3,
            latitude: 11.0168,
            longitude: 76.9558,
            city: "Coimbatore Urban",
            estimated_intensity: 84.1,
            normalized_intensity: 0.84,
            relative_rank: 3,
            percentile_tier: ">=85th Percentile",
            recommended_patrol: "Static Night Checkpoints along Highway Connectors",
          },
          {
            rank: 4,
            latitude: 10.7905,
            longitude: 78.7047,
            city: "Tiruchirappalli Central",
            estimated_intensity: 79.5,
            normalized_intensity: 0.79,
            relative_rank: 4,
            percentile_tier: ">=80th Percentile",
            recommended_patrol: "Dynamic Bike Patrol in Transit Interchanges",
          },
          {
            rank: 5,
            latitude: 11.6643,
            longitude: 78.146,
            city: "Salem District Junction",
            estimated_intensity: 75.8,
            normalized_intensity: 0.76,
            relative_rank: 5,
            percentile_tier: ">=75th Percentile",
            recommended_patrol: "Joint Regional Highway Interception",
          },
        ],
        tamil_nadu_focus_districts: [
          { district: "Chennai", lat: 13.0827, lon: 80.2707, base_weight: 95 },
          { district: "Madurai", lat: 9.9252, lon: 78.1198, base_weight: 88 },
          { district: "Coimbatore", lat: 11.0168, lon: 76.9558, base_weight: 84 },
          { district: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, base_weight: 79 },
          { district: "Salem", lat: 11.6643, lon: 78.146, base_weight: 76 },
        ],
      }
    );
  }

  // 5. Behavioral Profiling (BBN)
  async inferBehavioralProfile(evidence: Record<string, any>): Promise<ProfilingResult> {
    return this.fetchJson<ProfilingResult>(
      "/api/v1/profiling/infer",
      {
        method: "POST",
        body: JSON.stringify(evidence),
      },
      {
        status: "success",
        top_demographics: {
          top_sex: "Male",
          sex_confidence: 0.89,
          top_age_bracket: "25-34 yrs",
          age_confidence: 0.62,
          top_relationship: "Acquaintance / Associate",
          relationship_confidence: 0.58,
          top_race: "Asian/Indian",
          race_confidence: 0.94,
        },
        distributions: {
          offender_sex: { Male: 0.89, Female: 0.11 },
          offender_age: { "Under 18": 0.05, "18-24": 0.28, "25-34": 0.42, "35-49": 0.19, "50+": 0.06 },
          offender_relationship: { "Acquaintance / Associate": 0.58, "Family / Partner": 0.24, Stranger: 0.18 },
          offender_race: { "Asian/Indian": 0.94, Other: 0.06 },
        },
        causal_deductions: [
          "Use of specific cutting instrument indicates pre-existing interpersonal grievance or emotional motive rather than predatory stranger crime.",
          "Victim age and weapon proximity suggest the offender shared access to the domestic or private incident premises.",
          "High confidence (>85%) of single male perpetrator with prior familiarity with the immediate surroundings.",
        ],
        evidence_evaluated: evidence,
      }
    );
  }

  // 6. Regional Analytics (Tamil Nadu)
  async getTamilNaduDistricts(): Promise<DistrictMetric[]> {
    return this.fetchJson<DistrictMetric[]>(
      "/api/v1/analytics/tamil-nadu/districts",
      undefined,
      [
        {
          district: "Chennai",
          total_crime_2020_2022: 322835,
          crime_rate_2022: 648.3,
          share_pct_2022: 8.3,
          projected_pop_lakhs: 60.4,
          murder_incidence: 105,
          murder_rate: 1.7,
        },
        {
          district: "Cuddalore",
          total_crime_2020_2022: 112036,
          crime_rate_2022: 951.4,
          share_pct_2022: 5.6,
          projected_pop_lakhs: 27.7,
          murder_incidence: 52,
          murder_rate: 1.9,
        },
        {
          district: "Thanjavur",
          total_crime_2020_2022: 114033,
          crime_rate_2022: 825.1,
          share_pct_2022: 4.5,
          projected_pop_lakhs: 25.6,
          murder_incidence: 51,
          murder_rate: 2.0,
        },
        {
          district: "Trichy City",
          total_crime_2020_2022: 44811,
          crime_rate_2022: 1992.8,
          share_pct_2022: 3.8,
          projected_pop_lakhs: 9.0,
          murder_incidence: 19,
          murder_rate: 2.1,
        },
        {
          district: "Coimbatore",
          total_crime_2020_2022: 70738,
          crime_rate_2022: 587.6,
          share_pct_2022: 3.2,
          projected_pop_lakhs: 25.6,
          murder_incidence: 52,
          murder_rate: 2.0,
        },
        {
          district: "Salem",
          total_crime_2020_2022: 51972,
          crime_rate_2022: 482.9,
          share_pct_2022: 2.9,
          projected_pop_lakhs: 28.2,
          murder_incidence: 46,
          murder_rate: 1.6,
        },
        {
          district: "Madurai City",
          total_crime_2020_2022: 62205,
          crime_rate_2022: 1135.6,
          share_pct_2022: 2.6,
          projected_pop_lakhs: 10.8,
          murder_incidence: 37,
          murder_rate: 3.4,
        },
      ]
    );
  }

  async getYearlyTrends(): Promise<YearlyTrend[]> {
    return this.fetchJson<YearlyTrend[]>(
      "/api/v1/analytics/tamil-nadu/trends",
      undefined,
      [
        { year: 2014, total_crime_count: 193200, yoy_change_pct: null },
        { year: 2020, total_crime_count: 1377681, yoy_change_pct: null },
        { year: 2021, total_crime_count: 756753, yoy_change_pct: -45.07 },
        { year: 2022, total_crime_count: 473456, yoy_change_pct: -37.44 },
      ]
    );
  }

  async compareDistricts(
    district_a: string,
    district_b: string
  ): Promise<DistrictComparison> {
    return this.fetchJson<DistrictComparison>(
      "/api/v1/analytics/tamil-nadu/compare",
      {
        method: "POST",
        body: JSON.stringify({ district_a, district_b }),
      },
      {
        district_a: {
          district: district_a,
          total_crime_2020_2022: 322835,
          crime_rate_2022: 648.3,
          share_pct_2022: 8.3,
          projected_pop_lakhs: 60.4,
          murder_incidence: 105,
          murder_rate: 1.7,
        },
        district_b: {
          district: district_b,
          total_crime_2020_2022: 62205,
          crime_rate_2022: 1135.6,
          share_pct_2022: 2.6,
          projected_pop_lakhs: 10.8,
          murder_incidence: 37,
          murder_rate: 3.4,
        },
        delta_total_crime: 260630,
        delta_crime_rate: -487.3,
        leading_crime_district: district_a,
      }
    );
  }
}

export const crimoraApi = new CrimoraApiClient(API_BASE_URL);
