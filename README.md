# Intelligent Crime Detective Platform

An academic machine learning decision-support platform designed to assist investigative analysis through pattern discovery, geographic activity-area estimation, crime linkage analysis, and case solvability estimation.

---

## 1. Project Description

The **Intelligent Crime Detective Platform** is an analytical system developed as a collaborative academic machine learning project. The system investigates methods of extracting actionable statistical insights from reported crime incident datasets. By combining unsupervised pattern discovery, spatial regression techniques, and supervised classification models, the platform serves as an investigative decision-support tool.

> [!NOTE]
> **Academic Prototype Notice:** This system is an academic decision-support prototype intended strictly for research and statistical analysis. It does not replace professional investigative judgment, nor does it make definitive assertions regarding criminal culpability, psychological diagnoses, or individual residential locations.

---

## 2. Project Objectives

The platform provides a unified pipeline addressing several analytical goals:

1. **Potential Crime Linkage Analysis**: Exploring statistical similarities and behavioral signatures across incident reports to suggest potential crime series.
2. **Geographic / Spatial Crime Analysis**: Estimating geographic activity areas and spatial density surfaces using distance-weighted spatial intensity estimation and locally weighted regression (LWR).
3. **Behavioral Pattern Profiling**: Clustering multi-attribute incident characteristics into behavioral archetypes.
4. **Case Solvability Estimation**: Estimating the likelihood of case clearance based on incident-level characteristics and investigative markers.
5. **Tamil Nadu Crime Analytics**: Analyzing district-level IPC patterns and longitudinally tracking crime trends across Tamil Nadu jurisdictions.
6. **Machine Learning Model Comparison**: Evaluating diverse classification, regression, and clustering algorithms using standardized metrics.
7. **Interactive Visualization**: Providing an intuitive Streamlit interface equipped with interactive Folium geospatial mapping.

---

## 3. Two-Member Team Responsibilities

The project is developed collaboratively by a two-member engineering team with clear separation of concerns:

| Component / Focus Area | Person A | Person B (Active Track) | Status |
| :--- | :---: | :---: | :---: |
| **Data Engineering & Ingestion Pipeline** | - | **Primary Owner** | Completed (Day 1) |
| **Dataset Cleaning & Schema Validation** | - | **Primary Owner** | Completed (Day 2) |
| **Feature Engineering & Transformation** | - | **Primary Owner** | Completed (Day 2) |
| **Principal Component Analysis (PCA)** | - | **Primary Owner** | Completed (Day 3) |
| **Tamil Nadu Crime Analytics** | - | **Primary Owner** | Completed (Day 3) |
| **Locally Weighted Regression (LWR) / Spatial Profiling** | - | **Primary Owner** | Completed (Day 4) |
| **Folium Geospatial Visualization** | - | **Primary Owner** | Completed (Day 4) |
| **ID3 Decision Tree Classifier** | - | **Primary Owner** | Planned (Day 5) |
| **Naive Bayes Classifier** | - | **Primary Owner** | Planned (Day 5) |
| **k-Nearest Neighbors (k-NN) Classifier** | - | **Primary Owner** | Planned (Day 5) |
| **Artificial Neural Networks (ANN)** | Primary Owner | Clean Interface Integration | Person A |
| **Bayesian Belief Networks (BBN)** | Primary Owner | Clean Interface Integration | Person A |
| **K-Means & Hierarchical Clustering** | Primary Owner | Clean Interface Integration | Person A |
| **Behavioral & Crime Linkage Models** | Primary Owner | Interface & Evaluation | Person A |
| **Streamlit Dashboard UI Architecture** | - | **Primary Owner** | Planned (Day 9–10) |

---

## 4. Current Development Progress

**Phase: Day 4 Complete — Geographic Profiling and Locally Weighted Regression (LWR)**

- [x] **Day 1: Foundation & Data Engineering Setup**
  - Portable configuration module ([`src/config.py`](file:///home/Dharsit/ML-Project/Crimora/src/config.py))
  - Read-only schema inspection utility ([`src/data_inspection.py`](file:///home/Dharsit/ML-Project/Crimora/src/data_inspection.py))
  - Smoke tests and directory validation ([`tests/test_config.py`](file:///home/Dharsit/ML-Project/Crimora/tests/test_config.py))
- [x] **Day 2: Data Cleaning & Feature Engineering Pipeline**
  - Robust data cleaning utilities ([`src/data_cleaning.py`](file:///home/Dharsit/ML-Project/Crimora/src/data_cleaning.py))
  - Quality reporting & audit utilities ([`src/data_quality.py`](file:///home/Dharsit/ML-Project/Crimora/src/data_quality.py))
  - Temporal & spatial feature engineering ([`src/feature_engineering.py`](file:///home/Dharsit/ML-Project/Crimora/src/feature_engineering.py))
  - Automated cleaning runner ([`src/run_cleaning_pipeline.py`](file:///home/Dharsit/ML-Project/Crimora/src/run_cleaning_pipeline.py))
  - Cleaned datasets generated in `data/processed/`
  - Comprehensive feature dictionary ([`outputs/person_b_feature_dictionary.md`](file:///home/Dharsit/ML-Project/Crimora/outputs/person_b_feature_dictionary.md))
  - Cleaning unit tests ([`tests/test_cleaning.py`](file:///home/Dharsit/ML-Project/Crimora/tests/test_cleaning.py))
- [x] **Day 3: PCA Dimensionality Reduction & Tamil Nadu Analytics**
  - Scikit-learn PCA pipeline with target leakage isolation ([`src/pca_analysis.py`](file:///home/Dharsit/ML-Project/Crimora/src/pca_analysis.py))
  - Serialized PCA bundle ([`models/pca_model.joblib`](file:///home/Dharsit/ML-Project/Crimora/models/pca_model.joblib))
  - Scree plots, loadings matrices, and cumulative variance figures in `outputs/pca/`
  - Tamil Nadu district crime aggregation and longitudinal trend analysis ([`src/tn_analytics.py`](file:///home/Dharsit/ML-Project/Crimora/src/tn_analytics.py))
  - Tamil Nadu analytical figures in `outputs/tamil_nadu/`
  - Unit tests ([`tests/test_pca_analysis.py`](file:///home/Dharsit/ML-Project/Crimora/tests/test_pca_analysis.py), [`tests/test_tn_analytics.py`](file:///home/Dharsit/ML-Project/Crimora/tests/test_tn_analytics.py))
- [x] **Day 4: Geographic Profiling & Locally Weighted Regression (LWR)**
  - Spatial utilities, spherical Haversine distance, and grid generation ([`src/geo_utils.py`](file:///home/Dharsit/ML-Project/Crimora/src/geo_utils.py))
  - Kernel spatial intensity estimation and closed-form LWR solver ([`src/lwr_profiler.py`](file:///home/Dharsit/ML-Project/Crimora/src/lwr_profiler.py))
  - End-to-end spatial pipeline runner ([`src/run_geographic_pipeline.py`](file:///home/Dharsit/ML-Project/Crimora/src/run_geographic_pipeline.py))
  - PII-free coordinate export ([`outputs/geographic/crime_coordinates.csv`](file:///home/Dharsit/ML-Project/Crimora/outputs/geographic/crime_coordinates.csv))
  - Regular 2D spatial grid ([`outputs/geographic/geographic_grid.csv`](file:///home/Dharsit/ML-Project/Crimora/outputs/geographic/geographic_grid.csv))
  - Analytical hotspot summary ([`outputs/geographic/hotspot_summary.csv`](file:///home/Dharsit/ML-Project/Crimora/outputs/geographic/hotspot_summary.csv))
  - Four publication-quality visual diagnostics in `outputs/geographic/`
  - Interactive Folium web map ([`outputs/geographic/geographic_profile.html`](file:///home/Dharsit/ML-Project/Crimora/outputs/geographic/geographic_profile.html))
  - Person B analytics notebook updated ([`notebooks/PersonB_Analytics.ipynb`](file:///home/Dharsit/ML-Project/Crimora/notebooks/PersonB_Analytics.ipynb))
  - Spatial unit and integration tests ([`tests/test_geographic.py`](file:///home/Dharsit/ML-Project/Crimora/tests/test_geographic.py))
- [ ] **Day 5 (Upcoming): Classification Models (Decision Trees, Naive Bayes, k-NN)**

---

## 5. Repository Structure

```
Crimora/
├── app.py                              # Streamlit application entry point
├── requirements.txt                    # Python dependencies
├── README.md                           # Comprehensive project documentation
├── .gitignore                          # Git exclusions (data, artifacts, caches)
│
├── data/
│   ├── raw/                            # Ingested raw source datasets (immutable)
│   │   ├── homicide-data.csv
│   │   ├── dstrIPC_1_2014.csv
│   │   ├── TN-murder-2023.csv
│   │   └── TN-2020-2022-total.csv
│   └── processed/                      # Cleaned, standardized datasets
│       ├── homicide_clean.csv
│       ├── homicide_spatial_clean.csv
│       ├── dstr_ipc_2014_clean.csv
│       ├── tn_crime_total_2020_2022_clean.csv
│       └── tn_murder_2023_clean.csv
│
├── models/                             # Serialized model artifacts
│   └── pca_model.joblib                # Fitted PCA pipeline bundle
│
├── notebooks/
│   ├── PersonA_Model_Training.ipynb    # Person A modeling notebook
│   └── PersonB_Analytics.ipynb         # Person B analytics notebook (Days 1–4)
│
├── src/                                # Core reusable Python modules
│   ├── __init__.py
│   ├── config.py                       # Project paths and directory management
│   ├── data_inspection.py              # Read-only schema inspector
│   ├── data_cleaning.py                # Cleaning and normalization utilities
│   ├── data_quality.py                 # Summary and quality audit generators
│   ├── feature_engineering.py          # Feature extraction and encoding
│   ├── pca_analysis.py                 # PCA fitting, loadings, and scree plots
│   ├── tn_analytics.py                 # Tamil Nadu district analytics
│   ├── geo_utils.py                    # Coordinate validation, distance, grids
│   ├── lwr_profiler.py                 # Kernel spatial profiling and LWR solver
│   ├── run_cleaning_pipeline.py        # Day 2 pipeline runner
│   └── run_geographic_pipeline.py      # Day 4 spatial profiling pipeline runner
│
├── outputs/                            # Generated reports, CSVs, and visualizations
│   ├── person_b_feature_dictionary.md  # Detailed feature documentation
│   ├── pca/                            # Day 3 PCA artifacts and plots
│   │   ├── explained_variance.csv
│   │   ├── pca_components.csv
│   │   ├── pca_feature_selection.csv
│   │   ├── pca_transformed.csv
│   │   ├── explained_variance_by_component.png
│   │   ├── cumulative_explained_variance.png
│   │   ├── pca_2d_projection.png
│   │   └── pca_feature_contributions.png
│   ├── tamil_nadu/                     # Day 3 Tamil Nadu analytics artifacts
│   │   ├── district_summary.csv
│   │   ├── yearly_trends.csv
│   │   ├── district_crime_distribution.png
│   │   ├── yearly_crime_trends.png
│   │   ├── crime_rate_vs_population_2022.png
│   │   └── murder_rate_by_district_2023.png
│   └── geographic/                     # Day 4 Geographic profiling artifacts
│       ├── crime_coordinates.csv       # PII-free sanitized coordinate export
│       ├── geographic_grid.csv         # Regular 2D mesh grid with intensity
│       ├── hotspot_summary.csv         # Ranked analytical hotspot centroids
│       ├── incident_distribution.png   # Point pattern scatter with KDE contours
│       ├── intensity_surface.png       # Continuous normalized intensity heatmap
│       ├── hotspot_analysis.png        # Hotspot centroids & 95th percentile boundary
│       ├── incidents_vs_intensity.png  # Raw incidents vs activity area surface
│       └── geographic_profile.html     # Interactive Folium map
│
└── tests/                              # Automated test suites (39 passing tests)
    ├── __init__.py
    ├── test_config.py                  # Path and configuration tests
    ├── test_cleaning.py                # Data cleaning and feature tests
    ├── test_pca_analysis.py            # PCA pipeline and leakage isolation tests
    ├── test_tn_analytics.py            # Tamil Nadu analytics and rate calculation tests
    └── test_geographic.py             # Spatial validation, distance, and LWR tests
```

---

## 6. Technology Stack

- **Language**: Python 3.10+ (tested on Python 3.14)
- **Data Engineering**: `pandas`, `numpy`, `scipy`
- **Machine Learning**: `scikit-learn`, `joblib`
- **Geographic Information Systems**: `folium`
- **Visualization**: `matplotlib`, `seaborn`
- **Web Interface**: `streamlit`
- **Testing & Quality Assurance**: `pytest`, `unittest`

---

## 7. Quickstart & Verification

### Running the Test Suite
Execute the comprehensive automated test suite (all 39 tests pass with 100% success):
```bash
pytest tests/ -v
```

### Running the Day 2 Cleaning Pipeline
```bash
python src/run_cleaning_pipeline.py
```

### Running the Day 3 PCA & Tamil Nadu Analytics Pipelines
```bash
python src/pca_analysis.py
python src/tn_analytics.py
```

### Running the Day 4 Geographic Profiling Pipeline
```bash
python src/run_geographic_pipeline.py
```

---

## 8. Data Ethics & Responsible-Use Statement

This platform is strictly an academic decision-support prototype. In accordance with ethical machine learning principles:
- **Decision-Support Only**: Outputs assist analysts in organizing historical patterns; they do not replace human investigative discretion.
- **Defensible Terminology**: Results are framed as *historical crime concentrations*, *spatial patterns*, *geographic activity-area estimates*, and *analytical hotspots*.
- **No Accusations or Residence Inference**: The system makes **no assertion** regarding an individual's residence, identity, or guilt.
- **Privacy Safeguards**: All personally identifiable information (PII) such as victim names is excluded from analytical exports.
