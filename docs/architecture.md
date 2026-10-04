# System Architecture — Intelligent Crime Detective Platform (Crimora)

> **Responsible-Use Notice:**  
> Crimora is an academic machine learning decision-support prototype developed for empirical crime analytics research. It does **not** identify individual suspects, prove criminal culpability, locate offender residences, guarantee case solvability, or substitute for sworn law enforcement investigators or due process.

---

## 1. High-Level End-to-End Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. HETEROGENEOUS DATASETS                       │
│  • Washington Post Homicide Dataset (52,179 incidents, 50 US cities)   │
│  • Supplementary Homicide Report (SHR 1976–2025, 929,433 records)      │
│  • NCRB District IPC Crime Statistics 2014                             │
│  • Tamil Nadu State Crime Records Bureau (2020–2022 & 2023 Murder)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    2. DATA CLEANING & RECONCILIATION                   │
│  • PII Stripping (victim surname & given name)                         │
│  • Spatial Bounding Box Filtering & Imputation (lat/lon integrity)     │
│  • Temporal Decomp (year, month, day, day-of-week, quarter)            │
│  • Missing Demographics Imputation (victim age median)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             3. FEATURE ENGINEERING & LEAKAGE PREVENTION                │
│  • Strict Exclusion of Target Variables (`disposition`, `is_solved`)   │
│  • Categorical Encoding (One-Hot dummy matrix, 71 dimensions)          │
│  • Numeric Robust Scaling (StandardScaler on continuous features)      │
│  • Haversine Spatial Distance Matrices & Pairwise Neighborhoods        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  4A. DIMENSIONALITY REDUCTION & PCA  │  │  4B. GEOGRAPHIC PROFILING    │
│  • Covariance Matrix Eigendecomp     │  │  • Kernel Density / LWR      │
│  • 95% Cumulative Variance Threshold │  │  • Silverman's Rule Bandwidth│
│  • Component Loading Analysis        │  │  • Spatial Hotspot Surfaces  │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    └─────────────────┬──────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     5. MACHINE LEARNING MODEL SUITE                    │
│                                                                        │
│   ┌──────────────────────────────┐    ┌──────────────────────────────┐ │
│   │ Person A Track               │    │ Person B Track               │ │
│   ├──────────────────────────────┤    ├──────────────────────────────┤ │
│   │ • K-Means Clustering (k=5)   │    │ • ID3 Decision Tree          │ │
│   │ • Hierarchical Cluster (Ward)│    │ • Gaussian Naive Bayes       │ │
│   │ • ANN Solvability Engine     │    │ • Scaled k-NN Classifier     │ │
│   │ • Bayesian Belief Net (BBN)  │    │ • Macro Spatial LWR Engine   │ │
│   └──────────────────────────────┘    └──────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  6. RIGOROUS MODEL EVALUATION LAYER                    │
│  • 5-Fold Stratified Cross-Validation (Leak-Free Out-of-Fold)          │
│  • Accuracy, Precision, Recall, Macro F1-Score, ROC-AUC Curves         │
│  • Confusion Matrices & Error Surface Diagnostics                      │
│  • Silhouette Score Validation for Unsupervised Clusters               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             7. PRESENTATION & STREAMLIT APPLICATION (app.py)           │
│  • Executive Theme Configuration (.streamlit/config.toml)              │
│  • Cached Service Layer (@st.cache_data / DataService / ModelService)  │
│  • Interactive Folium Geospatial Heatmaps & Marker Clusters            │
│  • Multi-Tab Responsive Navigation & Live Incident Profiling           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               8. INTERACTIVE CRIME ANALYTICS DASHBOARD                 │
│  [1] Overview & KPIs     [2] Crime Linkage    [3] Geographic Analysis  │
│  [4] Behavioral Profile  [5] Solvability Pred [6] Tamil Nadu Analytics │
│  [7] Model Benchmarks    [8] ANN / BBN Deep Engines (Person A)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Division of Technical Responsibilities

| Subsystem / Pipeline Component | Primary Ownership | Secondary Support | Core Implementation Artifacts |
| :--- | :--- | :--- | :--- |
| **Data Cleaning & Pipeline Engineering** | **Person B** | Person A | `src/data_cleaning.py`, `src/data_quality.py`, `src/feature_engineering.py` |
| **Dimensionality Reduction (PCA)** | **Person B** | Person A | `src/pca_analysis.py`, `models/pca_model.joblib`, `outputs/pca/` |
| **Geographic Profiling & LWR** | **Person B** | Person A | `src/geo_utils.py`, `src/lwr_profiler.py`, `outputs/geographic/` |
| **Supervised Classical ML (ID3, NB, k-NN)** | **Person B** | Person A | `src/classical_models.py`, `src/model_evaluation.py`, `models/classical/` |
| **Longitudinal Tamil Nadu Analytics** | **Person B** | Person A | `src/tn_analytics.py`, `src/pages/tamil_nadu_analytics.py`, `outputs/tamil_nadu/` |
| **Unsupervised Cold Case Clustering** | **Person A** | Person B | `notebooks/PersonA_Model_Training.ipynb`, `models/kmeans_serial.pkl`, `models/hierarchical_serial.pkl` |
| **Deep Learning Solvability Engine (ANN)**| **Person A** | Person B | `models/solvability_ann.keras`, `models/ann_scaler.pkl`, `views/solvability_profiling.py` |
| **Causal Probabilistic Network (BBN)** | **Person A** | Person B | `models/bbn_profile.pkl`, `src/pages/behavioral_profiling.py` |
| **Streamlit Architectural Integration** | **Person B** | Person A | `app.py`, `src/services/`, `src/ui/`, `src/pages/` |
| **Test Suite & Deployment Hardening** | **Person B** | Person A | `tests/` (156 automated test suites across all modules) |

---

## 3. Component Interaction & Data Flow Architecture

### 3.1 Data Flow Pipeline
1. **Raw Ingestion:** Data files reside in `data/raw/`. The system ingests the Washington Post homicide dataset, SHR data, and NCRB/TN state reports.
2. **Cleaning & Standardization:** `run_cleaning_pipeline.py` audits schema consistency, scrubs personal identifiable information (PII), enforces geospatial validity, and standardizes categorical case categories.
3. **Feature Separation:** The pipeline splits feature matrices strictly:
   - *Target Variable:* `is_solved` (binary: 1 = Closed by arrest / Closed without arrest; 0 = Open/No arrest).
   - *Direct Leakage Drop:* `disposition` is completely removed before training classical ML models.
   - *Predictor Matrix:* Victim demographic indicators (age, sex, race) and administrative jurisdiction (city, state).
4. **Model Execution Layer:**
   - Classical classifiers evaluate clearance likelihood based on initial intake features.
   - Spatial profiling computes spatial intensity without demographic bias.
   - Clustering segments incidents into behavioral and demographic cohorts.
5. **Caching & Presentation Layer:**
   - `DataService` and `ModelService` employ Streamlit memory caching (`@st.cache_data`) to prevent redundant disk I/O and serialize model inferences in milliseconds.
   - Renderers in `src/pages/` and `views/` present interactive charts, maps, and tables.

---

## 4. Operational Standby and Fallback Architecture

To ensure lightweight execution in resource-constrained environments:
- **Core Runtime:** Powered by `scikit-learn`, `pandas`, `numpy`, `scipy`, `folium`, and `streamlit`.
- **Standby Isolation:** Heavy dependencies (`tensorflow` for the 1.47 MB ANN model and `pgmpy` for the BBN model) are handled via graceful fallback mechanisms. If the runtime lacks GPU/TensorFlow, the dashboard displays verified offline benchmarks, architecture diagrams, and activation instructions without crashing.
