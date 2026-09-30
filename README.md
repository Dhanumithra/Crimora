# Intelligent Crime Detective Platform (Crimora)

An academic machine learning decision-support platform designed to assist investigative crime analysis through unsupervised pattern discovery, geographic activity-area estimation, crime linkage analysis, and case solvability prediction.

---

## 1. Project Overview

The **Intelligent Crime Detective Platform** (**Crimora**) is an end-to-end analytical decision-support system developed as a collaborative academic machine learning project. The system extracts actionable statistical insights from historical crime incident datasets by synthesizing:

- **Unsupervised Pattern Discovery:** Clustering multi-attribute incident profiles to discover potential serial crime linkages.
- **Geographic Profiling & Spatial Regression:** Distance-weighted spatial intensity estimation and Locally Weighted Regression (LWR) over incident coordinates to identify macro-hotspots and activity surfaces.
- **Dimensionality Reduction:** Scikit-learn Principal Component Analysis (PCA) pipeline with strict target leakage isolation.
- **Supervised Classical Machine Learning:** Probabilistic and distance-based solvability classification pipelines (ID3 Decision Tree, Gaussian Naive Bayes, Scaled k-NN).
- **Macro Longitudinal Analytics:** District-level Indian Penal Code (IPC) and murder statistics across Tamil Nadu jurisdictions (2014–2023).
- **Interactive Multi-Page Web Dashboard:** A hardened executive Streamlit interface with interactive Folium geospatial maps and live scoring engines.

> [!NOTE]
> **Academic Prototype Notice:** This system is an academic decision-support prototype intended strictly for statistical research and analytical exploration. It does not replace professional investigative judgment, nor does it make definitive assertions regarding criminal culpability, psychological diagnoses, or individual residential locations.

---

## 2. Key Features

1. **Executive Overview & KPI Dashboard:**
   - Real-time key metrics: 52,179 processed records, 50 major US metropolitan areas, 50.8% natural baseline clearance.
   - Live architectural status matrix tracking Person A and Person B deliverables.
   - PCA variance decomposition tabs with cumulative variance charts and principal component loadings.
2. **Crime Linkage & Cold Case Clustering:**
   - Unsupervised victim age segmentation using K-Means ($k=5$) and Agglomerative Hierarchical Clustering (Ward linkage, $k=5$).
   - Real-time victim age cluster assignment with Euclidean distance-to-centroid computation.
   - Interactive unsolved case pool explorer with dynamic state and weapon filtering.
3. **Geographic Profiling & Hotspot Analytics:**
   - Haversine distance-weighted kernel intensity estimation and LWR surface modeling.
   - High-resolution interactive Folium spatial map with layered density contours and hotspot centroids.
   - Ranked spatial hotspot summaries with analytical percentile tiers.
4. **Behavioral Profiling & Causal Modeling (Person A):**
   - Architectural framework for Bayesian Belief Network (BBN) probabilistic suspect profiling.
   - Prior distribution baselines and evidence node specifications.
5. **Case Solvability & Clearance Scoring:**
   - Multi-model real-time solvability scoring (ID3 Decision Tree, Gaussian Naive Bayes, Scaled k-NN).
   - Dynamic confidence gauges and executive risk/solvability classification badges.
   - Diagnostic confusion matrices and ROC curves.
6. **Tamil Nadu Longitudinal Analytics:**
   - Longitudinal crime trend monitoring across 38+ Tamil Nadu revenue districts (2020–2022).
   - District-level IPC crime volume distributions and categorical distributions.
   - Publication-quality analytical visualization gallery.
7. **Model Comparison & Evaluation Benchmarks:**
   - Standardized holdout test set benchmarks ($N=10,436$) and stratified 5-fold cross-validation ($N=41,743$).
   - Live Model Availability Registry dynamically tracking runtime activation status across all 8 models.

---

## 3. Platform Architecture

The platform follows a layered, modular architecture designed for maintainability, portability, and robust error handling:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STREAMLIT WEB APPLICATION (app.py)                   │
├────────────────────────────────────────────────────────────────────────┤
│  Overview  │  Linkage  │  Geographic  │  Behavioral  │  Solvability    │
│  Dashboard │  Cluster  │   Analysis   │   Profiling  │   & Scoring     │
├────────────┴───────────┴──────────────┴──────────────┴─────────────────┤
│                     UI COMPONENT & STYLING LAYER                       │
│  src/ui/styles.py (Executive CSS) │ src/ui/components.py (Cards/Badges) │
├────────────────────────────────────────────────────────────────────────┤
│                     SERVICE & ORCHESTRATION LAYER                      │
│  src/services/data_service.py     │ src/services/model_service.py      │
│  - @st.cache_data                 │ - @st.cache_resource               │
│  - Graceful missing file handling │ - Live model registry & inference  │
├────────────────────────────────────────────────────────────────────────┤
│                      ANALYTICAL & MODEL PIPELINES                      │
│  src/geo_utils.py & lwr_profiler.py  │ src/classical_models.py (ID3/NB) │
│  src/pca_analysis.py                 │ src/tn_analytics.py             │
│  src/data_cleaning.py                │ src/feature_engineering.py      │
├────────────────────────────────────────────────────────────────────────┤
│                         SERIALIZED ARTIFACTS                           │
│  models/classical/*.joblib  │ models/kmeans_serial.pkl │ models/pca_*.joblib│
│  outputs/geographic/*       │ outputs/tamil_nadu/*     │ outputs/classical/*│
├────────────────────────────────────────────────────────────────────────┤
│                           DATASETS LAYER                               │
│  data/processed/ (Cleaned CSVs)    │ data/raw/ (Immutable Source CSVs) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Two-Member Team Responsibilities

| Component / Module | Person A | Person B (Active Track) | Current Status |
| :--- | :---: | :---: | :---: |
| **Data Ingestion & Cleaning Pipeline** | - | **Primary Owner** | Completed (Day 1–2) |
| **Feature Engineering & Sanitization** | - | **Primary Owner** | Completed (Day 2) |
| **Principal Component Analysis (PCA)** | - | **Primary Owner** | Completed (Day 3) |
| **Tamil Nadu Crime Analytics** | - | **Primary Owner** | Completed (Day 3) |
| **Geographic Profiling & LWR Surface** | - | **Primary Owner** | Completed (Day 4) |
| **Interactive Folium Web Map** | - | **Primary Owner** | Completed (Day 4) |
| **ID3 Decision Tree Classifier** | - | **Primary Owner** | Completed (Day 5) |
| **Naive Bayes Classifier** | - | **Primary Owner** | Completed (Day 5) |
| **k-Nearest Neighbors (k-NN)** | - | **Primary Owner** | Completed (Day 5) |
| **Streamlit Multi-Page Shell & UI** | - | **Primary Owner** | Completed (Day 6) |
| **Cross-Module Model Integration** | - | **Primary Owner** | Completed (Day 7) |
| **UI Polish, Validation & Hardening** | - | **Primary Owner** | Completed (Day 8) |
| **Deployment Readiness & E2E Testing** | - | **Primary Owner** | Completed (Day 9) |
| **K-Means & Hierarchical Clustering** | Primary Owner | Integrated into UI | Active & Operational |
| **Artificial Neural Network (ANN)** | Primary Owner | Graceful Fallback | Artifact present (Requires TF) |
| **Bayesian Belief Network (BBN)** | Primary Owner | Architectural Frame | Artifact present (Requires pgmpy) |

---

## 5. Technology Stack

- **Core Runtime:** Python 3.10+ (tested on Python 3.14.7)
- **Data Engineering:** `pandas` (>=2.2.0), `numpy` (>=1.26.0), `scipy` (>=1.12.0)
- **Machine Learning:** `scikit-learn` (>=1.4.0), `joblib` (>=1.3.0)
- **Geographic Information Systems (GIS):** `folium` (>=0.16.0), `geopy` (>=2.4.0), `streamlit-folium` (>=0.18.0)
- **Visualization:** `matplotlib` (>=3.8.0), `seaborn` (>=0.13.0)
- **Web Application & Interactive UI:** `streamlit` (>=1.32.0)
- **Automated Testing & QA:** `pytest` (>=8.0.0)

---

## 6. Model Modules & Operational Status

The platform manages 8 distinct machine learning and statistical models via a centralized registry ([`src/services/model_service.py`](src/services/model_service.py)):

| Model Identifier | Algorithm | Owner | Primary Task | Operational Status |
| :--- | :--- | :---: | :--- | :---: |
| `decision_tree_id3` | ID3 Decision Tree (`entropy`) | Person B | Solvability Scoring | ✅ Operational |
| `naive_bayes` | Gaussian Naive Bayes | Person B | Solvability Scoring | ✅ Operational |
| `knn` | Scaled k-NN ($k=15$) | Person B | Solvability Scoring | ✅ Operational |
| `kmeans` | K-Means ($k=5$, VicAge) | Person A | Victim Age Clustering | ✅ Operational |
| `hierarchical` | Agglomerative Clustering (Ward) | Person A | Pattern Clustering | ✅ Operational |
| `pca` | Principal Component Analysis | Person B | Variance Analysis | ✅ Operational |
| `ann` | Multilayer Perceptron (Keras) | Person A | Deep Solvability | ⚠️ Standby (`tensorflow` required) |
| `bbn` | Bayesian Belief Network | Person A | Suspect Demographics | ⚠️ Standby (`pgmpy` required) |

### Performance Leaderboard (Holdout Test Set: $N=10,436$)

| Model | Accuracy | Precision (Solved) | Recall (Solved) | F1-Score (Solved) | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5887 | 0.5586 | **0.7829** | **0.6520** | 0.6347 |
| **Naive Bayes (Gaussian)** | 0.5894 | **0.6055** | 0.4750 | 0.5324 | **0.6352** |
| **k-NN (Scaled, $k=15$)** | **0.5959** | 0.5915 | 0.5776 | 0.5845 | 0.6312 |

---

## 7. Setup & Installation Instructions

### Prerequisites
- Python 3.10 to 3.14
- Git
- Recommended: 4 GB+ RAM for spatial and k-NN inference

### 1. Clone the Repository
```bash
git clone https://github.com/Dhanumithra/Crimora.git
cd Crimora
```

### 2. Create and Activate a Virtual Environment
```bash
# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

*(Optional) To enable Person A's Deep Learning (ANN) and Causal (BBN) modules:*
```bash
pip install tensorflow pgmpy
```

---

## 8. Local Execution

Launch the interactive multi-page dashboard:
```bash
streamlit run app.py
```

Once running, access the application in your browser at:
```
http://localhost:8501
```

### Running Pipeline Runners (Optional / Re-generation)
```bash
# Day 2: Data Cleaning & Feature Engineering
python src/run_cleaning_pipeline.py

# Day 3: PCA Analysis & Tamil Nadu Ingestion
python src/pca_analysis.py
python src/tn_analytics.py

# Day 4: Geographic Profiling & LWR Map Generation
python src/run_geographic_pipeline.py

# Day 5: Classical Model Training & Evaluation
python src/run_classical_pipeline.py
```

---

## 9. Automated Testing & Quality Assurance

The project includes an end-to-end automated test suite containing **156 unit, integration, and E2E tests** (100% pass rate):

```bash
# Run the full automated test suite
pytest -v

# Run only Day 9 end-to-end and deployment tests
pytest tests/test_day9_e2e.py -v
```

### Test Coverage Breakdown
- `tests/test_config.py` (5 tests): Directory management and portable path resolution.
- `tests/test_cleaning.py` (13 tests): Missing value imputation, age sanitization, target derivation.
- `tests/test_pca_analysis.py` (4 tests): Dimensionality reduction and target leakage prevention.
- `tests/test_tn_analytics.py` (7 tests): Tamil Nadu district crime metrics and schemas.
- `tests/test_geographic.py` (10 tests): Haversine distance, LWR kernel solver, grid generation.
- `tests/test_classical_models.py` (8 tests): ID3, Naive Bayes, and k-NN training pipelines.
- `tests/test_streamlit_app.py` (32 tests): UI components, data services, model integrations.
- `tests/test_day8_polish.py` (53 tests): Input validation, hardening, coordinate limits, caching.
- `tests/test_day9_e2e.py` (24 tests): Multi-page AppTest workflows, model lifecycles, deployment hygiene.

---

## 10. Deployment Instructions

### Deployment on Streamlit Community Cloud
1. Push repository code to GitHub (`main` branch).
2. Ensure `requirements.txt` is present at the repository root.
3. Log in to [Streamlit Community Cloud](https://share.streamlit.io/).
4. Select the repository, specify branch `main`, and set **Main file path** to:
   ```
   app.py
   ```
5. Deploy. Streamlit Cloud will automatically build dependencies and launch the platform.

### Deployment on Linux / Virtual Machine (Systemd)
Create a systemd service file at `/etc/systemd/system/crimora.service`:
```ini
[Unit]
Description=Crimora Streamlit Platform
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/Crimora
ExecStart=/var/www/Crimora/.venv/bin/streamlit run app.py --server.port 8501 --server.headless true
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable crimora
sudo systemctl start crimora
```

---

## 11. System Limitations

1. **Historical Dataset Boundaries:** The primary homicide analysis corpus spans 52,179 reported incidents from 50 US cities. Patterns reflect jurisdictions with specific urban crime dynamics and may not directly generalize to rural jurisdictions or international contexts without domain adaptation.
2. **Missing Feature Sensitivity:** Classical solvability models rely on situational incident variables (weapon, location, victim demographic markers). Unreported or unrecorded crime attributes can introduce variance in individual clearance probabilities.
3. **Computational Scalability of Non-Parametric Models:** k-Nearest Neighbors ($k=15$) holds all training instances in memory (~33 MB serialized artifact). For deployments handling millions of records, approximate nearest-neighbor indexing (e.g., FAISS / HNSW) would be required.
4. **Third-Party Dependency Standby:** Person A's ANN model (`solvability_ann.keras`) and BBN profile (`bbn_profile.pkl`) require heavy external libraries (`tensorflow` and `pgmpy`). To maintain a lightweight deployment footprint, these modules operate in graceful standby until the optional libraries are installed.

---

## 12. Responsible-Use Statement & Ethical Principles

The Crimora platform is strictly an academic decision-support prototype. In adherence to responsible AI practices:

- **Human-in-the-Loop Decision Support:** Model outputs are strictly advisory aids to help investigators explore patterns and prioritize investigative leads. They do **not** replace sworn investigative discretion or legal standards of proof.
- **No Assertions of Guilt:** Under no circumstances should clearance probability scores or cluster assignments be cited as evidence of culpability or guilt.
- **Privacy Protection:** All individual identifiers (victim names) are stripped during preprocessing and are never ingested into machine learning feature matrices or displayed in analytical views.
- **Geographic Activity Surfaces vs. Residence:** Spatial density surfaces and hotspot clusters estimate historical incident concentrations; they do **not** indicate suspect residence or personal whereabouts.
- **Bias Awareness:** Crime incident reporting practices vary historically across jurisdictions. Users and analysts must critically evaluate algorithmic recommendations in light of potential systemic reporting disparities.
