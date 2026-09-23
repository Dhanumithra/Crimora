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
| **ID3 Decision Tree Classifier** | - | **Primary Owner** | Completed (Day 5) |
| **Naive Bayes Classifier** | - | **Primary Owner** | Completed (Day 5) |
| **k-Nearest Neighbors (k-NN) Classifier** | - | **Primary Owner** | Completed (Day 5) |
| **Streamlit Dashboard UI Architecture & Multi-Page Shell** | - | **Primary Owner** | Completed (Day 6) |
| **Artificial Neural Networks (ANN)** | Primary Owner | Clean Interface Integration | Person A |
| **Bayesian Belief Networks (BBN)** | Primary Owner | Clean Interface Integration | Person A |
| **K-Means & Hierarchical Clustering** | Primary Owner | Clean Interface Integration | Person A |
| **Behavioral & Crime Linkage Models** | Primary Owner | Interface & Evaluation | Person A |

---

## 4. Current Development Progress

**Phase: Day 6 Complete — Complete Streamlit Application Shell & Multi-Page Analytics Dashboard**

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
- [x] **Day 5: Classical Machine Learning Models (Decision Trees, Naive Bayes, k-NN)**
  - Target variable audit (`is_solved`: 50.8% Class 0 vs 49.2% Class 1; natural balance verified)
  - Strict target leakage prevention (excluding `disposition`, PII, and identifiers)
  - Preprocessing ColumnTransformer fitted strictly on training data
  - ID3 Decision Tree (`criterion="entropy"`, regularized `max_depth=8`)
  - Naive Bayes (`GaussianNB`) baseline probabilistic solver
  - Scaled k-NN (`KNeighborsClassifier`, $k=15$, distance-weighted with `StandardScaler`)
  - Reusable modeling module ([`src/classical_models.py`](src/classical_models.py))
  - Evaluation diagnostics module ([`src/model_evaluation.py`](src/model_evaluation.py))
  - Classical pipeline runner ([`src/run_classical_pipeline.py`](src/run_classical_pipeline.py))
  - Serialized model artifacts in `models/classical/`
  - Metric reports in `outputs/classical/model_metrics.csv` and `outputs/classical/classification_reports.csv`
  - Diagnostic figures in `outputs/classical/confusion_matrices/` and `outputs/classical/roc_curves/`
  - Classical modeling unit tests ([`tests/test_classical_models.py`](tests/test_classical_models.py))
- [x] **Day 6: Streamlit Application Shell & Multi-Page Dashboard**
  - Application entry point with responsive layout & navigation ([`app.py`](app.py))
  - Custom UI theme & CSS stylesheet ([`src/ui/styles.py`](src/ui/styles.py))
  - Modular UI component library ([`src/ui/components.py`](src/ui/components.py))
  - Robust cached Data Service layer ([`src/services/data_service.py`](src/services/data_service.py))
  - Cached Model & Real-Time Inference Service layer ([`src/services/model_service.py`](src/services/model_service.py))
  - **7 Functional Multi-Page Dashboards:**
    1. **Overview / Dashboard** ([`src/pages/overview.py`](src/pages/overview.py)): KPIs, architecture matrix, PCA variance tabs
    2. **Crime Linkage** ([`src/pages/crime_linkage.py`](src/pages/crime_linkage.py)): Person A placeholder with similarity parameter controls
    3. **Geographic Analysis** ([`src/pages/geographic_analysis.py`](src/pages/geographic_analysis.py)): Folium HTML map embed, hotspot rankings, spatial diagnostics
    4. **Behavioral Profiling** ([`src/pages/behavioral_profiling.py`](src/pages/behavioral_profiling.py)): Person A placeholder with BBN schema specification
    5. **Case Solvability** ([`src/pages/case_solvability.py`](src/pages/case_solvability.py)): Real-time case scoring form, confidence gauge, diagnostic plots
    6. **Tamil Nadu Analytics** ([`src/pages/tamil_nadu_analytics.py`](src/pages/tamil_nadu_analytics.py)): District rankings, longitudinal trends (2020-2022), publication figures
    7. **Model Comparison** ([`src/pages/model_comparison.py`](src/pages/model_comparison.py)): Holdout test leaderboard, 5-fold CV stability, ROC curves, Person A roadmap
  - Streamlit test suite ([`tests/test_streamlit_app.py`](tests/test_streamlit_app.py))
- [ ] **Day 7 (Upcoming): Final Integration, Full Pipeline Validation & Polish**


### Day 5 Classical Model Performance Summary

#### Holdout Test Set ($N=10,436$ stratified test samples)
| Model | Accuracy | Precision (Solved) | Recall (Solved) | F1-Score (Solved) | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5887 | 0.5586 | 0.7829 | 0.6520 | 0.6347 |
| **Naive Bayes (Gaussian)** | 0.5894 | 0.6055 | 0.4750 | 0.5324 | 0.6352 |
| **k-NN (Scaled, $k=15$)** | 0.5959 | 0.5915 | 0.5776 | 0.5845 | 0.6312 |

#### Stratified 5-Fold Cross-Validation ($N=41,743$ training samples)
| Model | CV Accuracy (Mean $\pm$ Std) | CV Precision | CV Recall | CV F1-Score | CV ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5911 $\pm$ 0.0051 | 0.5666 | 0.7235 | 0.6348 | 0.6344 |
| **Naive Bayes (Gaussian)** | 0.5855 $\pm$ 0.0050 | 0.6024 | 0.4650 | 0.5241 | 0.6288 |
| **k-NN (Scaled, $k=15$)** | 0.5950 $\pm$ 0.0028 | 0.5904 | 0.5771 | 0.5837 | 0.6339 |

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
│   ├── pca_model.joblib                # Fitted PCA pipeline bundle
│   └── classical/                      # Day 5 Classical ML models
│       ├── decision_tree_id3.joblib    # ID3 Decision Tree classifier
│       ├── naive_bayes.joblib          # Gaussian Naive Bayes classifier
│       └── knn.joblib                  # Scaled k-NN classifier
│
├── notebooks/
│   ├── PersonA_Model_Training.ipynb    # Person A modeling notebook
│   └── PersonB_Analytics.ipynb         # Person B analytics notebook (Days 1–5)
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
│   ├── classical_models.py             # Day 5 Classical ML pipelines
│   ├── model_evaluation.py             # Evaluation metrics, CV, and plots
│   ├── run_cleaning_pipeline.py        # Day 2 pipeline runner
│   ├── run_geographic_pipeline.py      # Day 4 spatial profiling pipeline runner
│   ├── run_classical_pipeline.py       # Day 5 classical ML pipeline runner
│   ├── ui/                             # Day 6 UI Theme & Component system
│   │   ├── __init__.py
│   │   ├── styles.py                   # Executive styling tokens & CSS injection
│   │   └── components.py               # Reusable headers, cards, badges, alerts
│   ├── services/                       # Day 6 Cached data & model inference services
│   │   ├── __init__.py
│   │   ├── data_service.py             # Cached data artifact accessors
│   │   └── model_service.py            # Cached model inference & scoring engine
│   └── pages/                          # Day 6 Multi-page dashboard modules
│       ├── __init__.py
│       ├── overview.py                 # Executive Dashboard & PCA variance
│       ├── crime_linkage.py            # Serial incident linkage (Person A)
│       ├── geographic_analysis.py      # Spatial KDE, LWR & Folium map
│       ├── behavioral_profiling.py     # M.O. & BBN causal modeling (Person A)
│       ├── case_solvability.py         # Real-time scoring via ID3, NB, k-NN
│       ├── tamil_nadu_analytics.py     # District rankings & longitudinal trends
│       └── model_comparison.py         # Benchmarks, 5-fold CV & ROC curves
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
│   ├── geographic/                     # Day 4 Geographic profiling artifacts
│   │   ├── crime_coordinates.csv       # PII-free sanitized coordinate export
│   │   ├── geographic_grid.csv         # Regular 2D mesh grid with intensity
│   │   ├── hotspot_summary.csv         # Ranked analytical hotspot centroids
│   │   ├── incident_distribution.png   # Point pattern scatter with KDE contours
│   │   ├── intensity_surface.png       # Continuous normalized intensity heatmap
│   │   ├── hotspot_analysis.png        # Hotspot centroids & 95th percentile boundary
│   │   ├── incidents_vs_intensity.png  # Raw incidents vs activity area surface
│   │   └── geographic_profile.html     # Interactive Folium map
│   └── classical/                      # Day 5 Classical ML outputs
│       ├── model_metrics.csv           # Model performance and 5-fold CV metrics
│       ├── classification_reports.csv  # Precision, recall, f1, support per class
│       ├── confusion_matrices/         # Confusion matrix heatmaps
│       └── roc_curves/                 # Multi-model ROC comparison curves
│
└── tests/                              # Automated test suites (61 passing tests)
    ├── __init__.py
    ├── test_config.py                  # Path and configuration tests
    ├── test_cleaning.py                # Data cleaning and feature tests
    ├── test_pca_analysis.py            # PCA pipeline and leakage isolation tests
    ├── test_tn_analytics.py            # Tamil Nadu analytics tests
    ├── test_geographic.py             # Spatial validation, distance, and LWR tests
    ├── test_classical_models.py        # Classical ML and evaluation tests
    └── test_streamlit_app.py           # Streamlit UI, services & inference tests
```

---

## 6. Technology Stack

- **Language**: Python 3.10+ (tested on Python 3.14)
- **Data Engineering**: `pandas`, `numpy`, `scipy`
- **Machine Learning**: `scikit-learn`, `joblib`
- **Geographic Information Systems**: `folium`, `streamlit-folium`
- **Visualization**: `matplotlib`, `seaborn`
- **Web Interface**: `streamlit`
- **Testing & Quality Assurance**: `pytest`, `unittest`

---

## 7. Quickstart & Verification

### Launching the Interactive Streamlit Dashboard
```bash
streamlit run app.py
```
*Access the multi-page dashboard locally at `http://localhost:8501`.*

### Running the Complete Test Suite
Execute all 61 automated tests across Days 1–6 (100% pass rate):
```bash
pytest tests/ -v
```


### Running Pipeline Runners
```bash
# Day 2 Data Cleaning Pipeline
python src/run_cleaning_pipeline.py

# Day 3 PCA & Tamil Nadu Analytics Pipelines
python src/pca_analysis.py
python src/tn_analytics.py

# Day 4 Geographic Profiling & LWR Pipeline
python src/run_geographic_pipeline.py

# Day 5 Classical Machine Learning Pipeline
python src/run_classical_pipeline.py
```

---

## 8. Data Ethics & Responsible-Use Statement

This platform is strictly an academic decision-support prototype. In accordance with ethical machine learning principles:
- **Decision-Support Only**: Outputs assist human analysts in organizing historical patterns; they do not replace human investigative discretion.
- **Defensible Terminology**: Results are framed as *case solvability predictions*, *model estimates*, and *historical patterns*.
- **No Guarantees or Accusations**: The system makes **no assertion** that a real-world case will or will not be solved, nor does it establish individual culpability.
- **Privacy Safeguards**: All personally identifiable information (PII) such as victim names is excluded from analytical models.
- **Spatial Estimates**: Geographic profiling reflects historical activity areas and crime concentration surfaces, never suspect residence.

