# Intelligent Crime Detective Platform

 HEAD
An academic machine learning decision-support platform that analyzes historical crime incident patterns, estimates geographic activity areas and crime concentration surfaces, and evaluates case solvability markers.

See [README.md](README.md) for full documentation, project architecture, pipeline instructions, and test suites.
=======
An academic machine learning decision-support platform designed to assist investigative analysis through pattern discovery, geographic activity-area estimation, crime linkage analysis, and case solvability estimation.

---

## 1. Project Description

The **Intelligent Crime Detective Platform** is an analytical system developed as a collaborative academic machine learning project. The system investigates methods of extracting actionable statistical insights from reported crime incident datasets. By combining unsupervised pattern discovery, spatial regression techniques, and supervised classification models, the platform serves as an investigative decision-support tool.

> **Academic Prototype Notice:** This system is an academic decision-support prototype intended strictly for research and statistical analysis. It does not replace professional investigative judgment, nor does it make definitive assertions regarding criminal culpability, psychological diagnoses, or individual residential locations.

---

## 2. Project Objectives

The platform provides a unified pipeline addressing several analytical goals:

1. **Potential Crime Linkage Analysis**: Exploring statistical similarities and behavioral signatures across incident reports to suggest potential crime series.
2. **Geographic / Spatial Crime Analysis**: Estimating geographic activity areas and spatial density surfaces using spatial smoothing and regression.
3. **Behavioral Pattern Profiling**: Clustering multi-attribute incident characteristics into behavioral archetypes.
4. **Case Solvability Estimation**: Estimating the likelihood of case clearance based on incident-level characteristics and investigative markers.
5. **Tamil Nadu Crime Analytics**: Analyzing district-level IPC patterns, longitudinally tracking trends across Tamil Nadu jurisdictions.
6. **Machine Learning Model Comparison**: Evaluating diverse classification, regression, and clustering algorithms using standardized metrics.
7. **Interactive Visualization**: Providing an intuitive Streamlit interface equipped with interactive Folium geospatial mapping.

---

## 3. Two-Member Team Responsibilities

The project is developed collaboratively by a two-member engineering team with clear separation of concerns:

| Component / Focus Area | Person A | Person B (Current Focus) |
| :--- | :---: | :---: |
| **Artificial Neural Networks (ANN)** | Primary Owner | Clean Interface Integration |
| **Bayesian Belief Networks (BBN)** | Primary Owner | Clean Interface Integration |
| **K-Means Clustering** | Primary Owner | Clean Interface Integration |
| **Hierarchical Clustering** | Primary Owner | Clean Interface Integration |
| **Behavioral & Crime Linkage Models** | Primary Owner | Interface & Evaluation |
| **Data Engineering & Ingestion Pipeline** | - | **Primary Owner** |
| **Dataset Cleaning & Schema Validation** | - | **Primary Owner** |
| **Feature Engineering & Transformation** | - | **Primary Owner** |
| **Principal Component Analysis (PCA)** | - | **Primary Owner** |
| **Locally Weighted Regression (LWR) / Spatial Profiling** | - | **Primary Owner** |
| **ID3 Decision Tree Classifier** | - | **Primary Owner** |
| **Naive Bayes Classifier** | - | **Primary Owner** |
| **k-Nearest Neighbors (k-NN) Classifier** | - | **Primary Owner** |
| **Tamil Nadu Crime Analytics** | - | **Primary Owner** |
| **Streamlit Architecture & Dashboard UI** | - | **Primary Owner** |
| **Folium Geospatial Visualization** | - | **Primary Owner** |
| **Deployment & Foundation Architecture** | - | **Primary Owner** |

---

## 4. Technology Stack

- **Language**: Python 3.10+
- **Data Engineering & Analysis**: `pandas`, `numpy`, `scipy`
- **Machine Learning**: `scikit-learn`, `joblib`
- **Geographic Information Systems (GIS)**: `folium`, `geopy`, `streamlit-folium`
- **Visualization**: `matplotlib`, `seaborn`
- **Web Application Interface**: `streamlit`
- **Testing & Quality Assurance**: `pytest`, `unittest`

*(Person A maintains neural network and probabilistic graph dependencies such as TensorFlow and pgmpy independently).*

---

## 5. Current Development Phase

**Phase: Day 1 of 10 — Foundation & Data Engineering Setup**

- [x] Repository structure established
- [x] Portable configuration module (`src/config.py`) implemented
- [x] Robust, read-only dataset inspection utility (`src/data_inspection.py`) implemented
- [x] Safe `.gitignore` configured to prevent data or secret leakage
- [x] Person B interactive analytics notebook skeleton created (`notebooks/PersonB_Analytics.ipynb`)
- [x] Streamlit placeholder application created (`app.py`)
- [x] Smoke tests and path validation suite implemented (`tests/test_config.py`)
- [ ] *Day 2 (Upcoming): Ingestion, raw schema inspection, and data cleaning*

---

## 6. Repository Structure

```
crime-detective-platform/
│
├── app.py                          # Streamlit application entry point
├── requirements.txt                # Python package dependencies
├── README.md                       # Project documentation & guidelines
├── .gitignore                      # Safe Git exclusions (data, caches, credentials)
│
├── data/
│   ├── raw/                        # Ingested raw source datasets (unmodified)
│   └── processed/                  # Cleaned, encoded, and engineered datasets
│
├── models/                         # Serialized model artifacts and parameters
│
├── notebooks/
│   └── PersonB_Analytics.ipynb     # Person B analytics and EDA notebook
│
├── src/
│   ├── __init__.py                 # Package initializer
│   ├── config.py                   # Portable filesystem paths & constants
│   └── data_inspection.py          # Read-only CSV schema inspection utility
│
├── outputs/                        # Generated figures, tables, and metric reports
│
├── assets/                         # Static media, figures, and diagrams
│
└── tests/
    ├── __init__.py                 # Test package initializer
    └── test_config.py              # Configuration and inspection smoke tests
```

---

## 7. Planned Machine Learning Modules

### Person B Planned Modules
1. **Dimensionality Reduction**: Principal Component Analysis (PCA) for multi-attribute spatial-temporal compression.
2. **Geographic Spatial Estimation**: Locally Weighted Regression (LWR) for estimating crime density surfaces and activity areas.
3. **Solvability Classification**:
   - ID3 Decision Tree algorithm for interpretable rule extraction.
   - Naive Bayes Classifier for probabilistic baseline solvability estimation.
   - k-Nearest Neighbors (k-NN) for instance-based linkage similarity.
4. **Longitudinal State Analytics**: Time-series aggregation and district-level profiling of Tamil Nadu IPC statistics.

### Person A Planned Modules
1. **Pattern Modeling**: Artificial Neural Networks (ANN) for complex non-linear pattern synthesis.
2. **Causal Reasoning**: Bayesian Belief Networks (BBN) for conditional probability reasoning under uncertainty.
3. **Behavioral Clustering**: K-Means and Agglomerative Hierarchical Clustering for grouping behavioral moduses operandi.

---

## 8. Data Ethics and Responsible-Use Statement

This system is strictly an academic decision-support prototype. Machine learning models in criminal justice domains can perpetuate historical sampling biases and socioeconomic disparities if misapplied or over-interpreted.

To ensure responsible academic use:
- **Decision-Support Only**: The platform is engineered to assist human analysts with pattern organization; it does not replace expert investigative judgment.
- **Probabilistic Phrasing**: Model outputs must always be framed probabilistically (e.g., *activity-area estimation*, *case solvability estimation*, *crime linkage analysis*).
- **No Definitive Accusations**: The system makes no claim of definitively identifying perpetrators, diagnosing psychological conditions, or fixing residential addresses.
- **Privacy Protection**: Datasets containing personally identifiable information (PII) must be anonymized before ingestion, and raw data files are excluded from version control.
