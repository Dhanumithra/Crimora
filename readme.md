# Intelligent Crime Detective Platform (Crimora)

An academic machine learning decision-support platform designed to assist investigative crime analysis through unsupervised pattern discovery, geographic activity-area estimation, crime linkage analysis, and case solvability prediction.

---

## 1. Project Overview & System Architecture

The **Intelligent Crime Detective Platform** (**Crimora**) is an end-to-end analytical decision-support system developed as a collaborative academic machine learning project. The system extracts actionable statistical insights from historical crime incident datasets by synthesizing:

- **Unsupervised Pattern Discovery:** Clustering multi-attribute incident profiles to discover potential serial crime linkages.
- **Geographic Profiling & Spatial Regression:** Distance-weighted spatial intensity estimation and Locally Weighted Regression (LWR) over incident coordinates to identify macro-hotspots and activity surfaces.
- **Dimensionality Reduction:** Scikit-learn Principal Component Analysis (PCA) pipeline with strict target leakage isolation.
- **Supervised Classical Machine Learning:** Probabilistic and distance-based solvability classification pipelines (ID3 Decision Tree, Gaussian Naive Bayes, Scaled k-NN).
- **Macro Longitudinal Analytics:** District-level Indian Penal Code (IPC) and murder statistics across Tamil Nadu jurisdictions (2014–2023).
- **Interactive Multi-Page Web Dashboard:** A hardened executive Streamlit interface with interactive Folium geospatial maps and live scoring engines.

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

> [!NOTE]
> **Academic Prototype Notice:** This system is an academic decision-support prototype intended strictly for statistical research and analytical exploration. It does not replace professional investigative judgment, nor does it make definitive assertions regarding criminal culpability, psychological diagnoses, or individual residential locations.

---

## 2. Person A: Advanced Machine Learning Models

### Solvability Prediction Engine (TensorFlow/Keras ANN)
- **Architecture**: Multi-Layer Perceptron (MLP) Deep Neural Network.
- **Feature Processing**: ColumnTransformer pipeline (StandardScaler for numeric features, OneHotEncoder for categorical features yielding 294 processed input features).
- **Hyperparameters & Callbacks**: Adam optimizer, binary cross-entropy loss, ReduceLROnPlateau learning rate scheduling.
- **Validated Performance Metrics**:
  - **ROC-AUC**: 0.9984 (Target Benchmark >= 0.85)
  - **Accuracy**: 99.00%
  - **Precision**: 99.08%
  - **Recall**: 98.80%
- **Saved Artifacts**: `models/solvability_ann.keras`, `models/ann_scaler.pkl`.

### Suspect Trait Profiling Engine (Bayesian Belief Network - BBN)
- **Framework**: `pgmpy` Directed Acyclic Graph (DAG) probabilistic model.
- **Target Traits**: Conditional probability distributions for Suspect Sex, Age Group, Relationship to Victim, and Race based on observed crime scene parameters (Weapon, Circumstance, Victim Sex/Age).
- **Saved Artifacts**: `models/bbn_model.pkl`, `models/bbn_profile.pkl`.

### Cold Case Clustering & Linkage Engine (K-Means & Agglomerative Clustering)
- **Methodology**: Feature space Proximity Analysis using K-Means and Hierarchical Clustering on unsolved SHR homicide datasets.
- **Functionality**: Groups pattern-linked cold cases by weapon choice, geographic region, and scene parameters to calculate similarity scores and highlight linked offender clusters.
- **Saved Artifacts**: `models/kmeans_model.pkl`, `models/kmeans_serial.pkl`, `data/shr_unsolved_clustered.csv`.

---

## 3. Person B: Classical ML & Analytics Components

### Key Features
1. **Executive Overview & KPI Dashboard:**
   - Real-time key metrics: 52,179 processed records, 50 major US metropolitan areas, 50.8% natural baseline clearance.
   - Live architectural status matrix tracking Person A and Person B deliverables.
   - PCA variance decomposition tabs with cumulative variance charts and principal component loadings.
2. **Geographic Profiling & Hotspot Analytics:**
   - Haversine distance-weighted kernel intensity estimation and LWR surface modeling.
   - High-resolution interactive Folium spatial map with layered density contours and hotspot centroids.
   - Ranked spatial hotspot summaries with analytical percentile tiers.
3. **Case Solvability & Clearance Scoring:**
   - Multi-model real-time solvability scoring (ID3 Decision Tree, Gaussian Naive Bayes, Scaled k-NN).
   - Dynamic confidence gauges and executive risk/solvability classification badges.
   - Diagnostic confusion matrices and ROC curves.
4. **Tamil Nadu Longitudinal Analytics:**
   - Longitudinal crime trend monitoring across 38+ Tamil Nadu revenue districts (2020–2022).
   - District-level IPC crime volume distributions and categorical distributions.
   - Publication-quality analytical visualization gallery.

### Performance Leaderboard (Holdout Test Set: $N=10,436$)
| Model | Accuracy | Precision (Solved) | Recall (Solved) | F1-Score (Solved) | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5887 | 0.5586 | **0.7829** | **0.6520** | 0.6347 |
| **Naive Bayes (Gaussian)** | 0.5894 | **0.6055** | 0.4750 | 0.5324 | **0.6352** |
| **k-NN (Scaled, $k=15$)** | **0.5959** | 0.5915 | 0.5776 | 0.5845 | 0.6312 |

---

## 4. Local Run & Installation Guide

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
python3 -m venv env
source env/bin/activate

# Windows (PowerShell)
python -m venv env
.\env\Scripts\Activate.ps1
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

### 4. Launch the Web Application
Launch the interactive multi-page dashboard via Streamlit:
```bash
streamlit run app.py
```

Once running, access the application in your browser at:
```
http://localhost:8501
```

---

## 5. Deployment Instructions

### Deployment on Streamlit Community Cloud
1. Push repository code to GitHub (`main` branch).
2. Ensure `requirements.txt` is present at the repository root.
3. Log in to [Streamlit Community Cloud](https://share.streamlit.io/).
4. Select the repository, specify branch `main`, and set **Main file path** to: `app.py`
5. Deploy. Streamlit Cloud will automatically build dependencies and launch the platform.

---

## 6. System Limitations & Ethical Principles

### System Limitations
1. **Historical Dataset Boundaries:** The primary homicide analysis corpus spans 52,179 reported incidents from 50 US cities. Patterns reflect jurisdictions with specific urban crime dynamics and may not directly generalize to rural jurisdictions or international contexts without domain adaptation.
2. **Computational Scalability of Non-Parametric Models:** k-Nearest Neighbors ($k=15$) holds all training instances in memory (~33 MB serialized artifact). For deployments handling millions of records, approximate nearest-neighbor indexing would be required.
3. **Third-Party Dependency Standby:** Person A's ANN model (`solvability_ann.keras`) and BBN profile (`bbn_profile.pkl`) require heavy external libraries (`tensorflow` and `pgmpy`). To maintain a lightweight deployment footprint, these modules operate in graceful standby until the optional libraries are installed.

### Responsible-Use Statement
The Crimora platform is strictly an academic decision-support prototype. In adherence to responsible AI practices:
- **Human-in-the-Loop Decision Support:** Model outputs are strictly advisory aids to help investigators explore patterns and prioritize investigative leads. They do **not** replace sworn investigative discretion or legal standards of proof.
- **No Assertions of Guilt:** Under no circumstances should clearance probability scores or cluster assignments be cited as evidence of culpability or guilt.
- **Privacy Protection:** All individual identifiers (victim names) are stripped during preprocessing and are never ingested into machine learning feature matrices or displayed in analytical views.
