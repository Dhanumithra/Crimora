# Intelligent Crime Detective Platform (Crimora)

> **Responsible-Use Statement:**  
> The Intelligent Crime Detective Platform (Crimora) is an academic machine learning decision-support prototype. It is engineered exclusively for educational research, empirical data analysis, and statistical investigation.  
> **Crimora does NOT:**
> - Identify individual suspects or target specific citizens.
> - Establish criminal culpability or determine legal guilt.
> - Identify the exact residence or hideout of any offender.
> - Guarantee the solvability or clearance of active criminal investigations.
> - Substitute for sworn law enforcement professionals, forensic scientists, or statutory legal due process.  
> All outputs represent historical probabilistic patterns and must be interpreted solely as exploratory decision support.

---

## 1. Project Title
**Intelligent Crime Detective Platform (Crimora)**  
*An End-to-End Academic Decision-Support System for Crime Linkage, Geographic Profiling, Macro-Analytics, and Case Solvability Prediction.*

---

## 2. Problem Statement
Law enforcement agencies and criminal intelligence analysts confront escalating incident volumes, disparate data repositories, and persistent backlogs of unsolved cases. Key investigative challenges include:
- Inability to efficiently discover hidden serial linkages across multi-jurisdictional cold cases.
- Lack of non-parametric spatial regression tools to model offender activity zones and crime density surfaces without geographic bias.
- Vulnerability of predictive models to **target data leakage**, where post-investigation arrest dispositions inadvertently contaminate intake models and generate artificially inflated metrics.
- Fragmented longitudinal tracking of state and district crime trends across regulatory changes (e.g., pandemic lockdowns vs. standard baseline years).

---

## 3. Objectives
1. Implement a robust, privacy-compliant data ingestion and preprocessing pipeline that completely strips Personally Identifiable Information (PII) and audits feature matrices against target leakage.
2. Evaluate multi-dimensional incident profile variance using Principal Component Analysis (PCA) to measure the feasibility of linear dimensionality reduction.
3. Formulate a non-parametric Locally Weighted Regression (LWR) geographic profiling engine using geodesic Haversine distance and kernel density estimation to extract incident intensity hotspots.
4. Benchmark classical supervised machine learning classifiers (ID3 Decision Tree, Gaussian Naive Bayes, Scaled $k$-Nearest Neighbors) under 5-fold stratified cross-validation using initial intake variables.
5. Integrate Person A's unsupervised clustering (K-Means, Hierarchical), Deep Learning Solvability Engine (ANN), and Causal Probabilistic Modeling (Bayesian Belief Network).
6. Build a hardened, interactive multi-page Streamlit web dashboard with interactive Folium geospatial maps and cached service layers.

---

## 4. Proposed Solution
Crimora provides an end-to-end, multi-paradigm machine learning framework. The platform bridges macroscopic jurisdictional intelligence with micro-level incident analysis:
- **Intake-Only Prediction:** Predicts case clearance using strictly pre-investigation attributes, ensuring true real-world utility without target leakage.
- **Geographic Profiling:** Computes continuous spatial intensity surfaces across urban coordinates using optimized bandwidths ($h = 0.8574\text{ km}$ via Silverman's rule) and Haversine distance metrics.
- **Unsupervised Cold Case Linkage:** Clusters incident profiles into distinct demographic and situational cohorts to reveal potential serial crime connections.
- **Unified Decision-Support UI:** Renders analytics, live solvability scoring, geographic maps, and longitudinal district comparisons in an executive Streamlit dashboard.

---

## 5. Key Features
- **Executive Overview Dashboard:** Macro KPI metrics (52,179 incidents, 50 metropolitan areas, 50.8% baseline clearance), system health statuses, and PCA variance decompositions.
- **Unsupervised Crime Linkage:** Interactive victim age segmentation utilizing K-Means ($k=5$) and Agglomerative Hierarchical Clustering (Ward linkage, $k=5$) with a validated Silhouette Score of **0.5369**.
- **Geographic Profiling & LWR Heatmaps:** Interactive Folium geospatial maps displaying incident scatters, bivariate intensity surfaces, and top-ranked analytical hotspot centroids.
- **Causal Behavioral Profiling:** Bayesian Belief Network (BBN) DAG modeling probabilistic dependencies between crime scene evidence and latent offender relationships.
- **Multi-Model Solvability Scoring:** Comparative prediction engine featuring ID3 Decision Tree, Gaussian Naive Bayes, Scaled $k$-NN ($k=15$), and Deep Learning ANN (185,887-test record benchmark).
- **Tamil Nadu Longitudinal Analytics:** Interactive district-level exploration of cognizable crime trends, population-adjusted rates, and 2023 violent fatality breakdowns across Tamil Nadu.
- **Model Evaluation & Benchmarking Suite:** Side-by-side ROC-AUC curves, confusion matrices, and 5-fold cross-validation metrics.

---

## 6. System Architecture

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
│  • Missing Demographics Imputation (victim age median = 28.0)          │
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
└────────────────────────────────────────────────────────────────────────┘
```

### Division of Responsibilities
- **Person A Deliverables:** Deep Learning ANN Solvability Engine (`solvability_ann.keras`), Causal Bayesian Belief Network (`bbn_profile.pkl`), K-Means Clustering, and Hierarchical Clustering models (`notebooks/PersonA_Model_Training.ipynb`).
- **Person B Deliverables:** Data Cleaning & Preprocessing Pipelines, PCA Pipeline, Geographic Profiling & LWR Engine, Classical ML Models (ID3, Naive Bayes, k-NN), Tamil Nadu Longitudinal Analytics, and Streamlit Integration Architecture (`notebooks/PersonB_Analytics.ipynb`, `src/`, `app.py`).

---

## 7. Dataset Description
1. **The Washington Post Homicide Dataset:** 52,179 individual homicide incident records across 50 major US cities. Fields include incident ID, reported date, victim demographics (age, sex, race), municipal jurisdiction (city, state), geographic coordinates (latitude, longitude), and case disposition.
2. **FBI Supplementary Homicide Report (SHR 1976–2025):** 929,433 records providing extensive historical depth. Contains 31 attributes including offender demographics, victim-offender relationship, weapon type, and circumstance codes.
3. **NCRB District IPC Crime Statistics (2014):** District-level Indian Penal Code cognizance baseline across all Indian states and union territories.
4. **Tamil Nadu Police & NCRB Reports (2020–2022 & 2023):** District-wise cognizable crime counts, population projections, cognizable rates per lakh, murder incidences, culpable homicides, and violent fatalities across 38+ districts and commissionerates.

---

## 8. Data Preprocessing
- **PII De-identification:** Direct victim identity fields (`victim_last`, `victim_first`) are permanently scrubbed.
- **Geographic Validation:** Incident coordinates are filtered against the continental US bounding box ($24.396308^\circ\text{N} \le \text{lat} \le 49.384358^\circ\text{N}$ and $-125.0^\circ\text{W} \le \text{lon} \le -66.93457^\circ\text{W}$). Valid spatial records are preserved in `homicide_spatial_clean.csv` without zero-coordinate fabrication.
- **Missing Value Imputation:** Missing or textual victim age entries (`'Unknown'`) are imputed using the global median ($28.0\text{ years}$), bounding physical plausibility ($0 \le \text{age} \le 120$).
- **Temporal Decomposition:** Reported dates (`YYYYMMDD`) are decomposed into `reported_year`, `reported_month`, `reported_day`, `reported_day_of_week`, and `reported_quarter`.
- **Target Leakage Isolation:** The outcome column `disposition` is strictly isolated from all predictor matrices; models receive only initial intake features.

---

## 9. PCA Methodology
Principal Component Analysis was conducted on the 71-dimensional one-hot encoded incident feature matrix:
1. **Standardization:** Continuous and dummy categorical variables are zero-mean centered and standardized: $\tilde{X} = (X - \mu)/\sigma$.
2. **Eigendecomposition:** The sample covariance matrix $\Sigma = \frac{1}{n-1}\tilde{X}^T\tilde{X}$ is decomposed into eigenvalues $\lambda_k$ and orthogonal eigenvectors $v_k$.
3. **Variance Distribution Findings:**
   - **PC1:** $4.16\%$ explained variance
   - **PC2:** $2.68\%$ explained variance
   - **PC3:** $2.39\%$ explained variance
   - **95% Cumulative Variance Threshold:** Requires **54 principal components** out of 71.
   - *Conclusion:* Information is broadly distributed across orthogonal municipal indicator features, demonstrating that linear 2D/3D projections cannot adequately summarize heterogeneous multi-city incident data without substantial variance loss.

---

## 10. Geographic Profiling / LWR Methodology
1. **Geodesic Distance:** Incident proximity is evaluated via the spherical Haversine formula over WGS84 coordinates with $R = 6,371.0088\text{ km}$:
   $$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
2. **Locally Weighted Regression (LWR):** Non-parametric spatial intensity at query point $x_0$ is computed via distance-decay weighting over neighboring incident coordinates:
   $$K(u) = \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{u^2}{2}\right), \quad u = \frac{d(x_0, x_i)}{h}$$
3. **Optimal Bandwidth Selection:** Silverman's Rule of Thumb for two-dimensional spatial density estimation:
   $$h = 1.06 \, \hat{\sigma} \, n^{-1/5}$$
   For the Baltimore incident cluster ($n=2,827$), Silverman's rule determined an optimal bandwidth of $h = 0.8574\text{ km}$, isolating 10 distinct high-intensity spatial centroids without oversmoothing.

---

## 11. ID3 Methodology (Decision Tree)
- **Mathematical Criterion:** Information Gain using Shannon Entropy:
  $$H(S) = -\sum_{i=1}^c p_i \log_2(p_i), \quad IG(S, A) = H(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|} H(S_v)$$
- **Hyperparameters:** `criterion='entropy'`, `max_depth=8`, `min_samples_split=20`, `min_samples_leaf=10`.
- **Holdout Test Performance:** Accuracy: $58.87\%$, Precision: $55.86\%$, **Recall: $78.29\%$**, F1: $0.6520$, ROC-AUC: $0.6347$.
- **Operational Role:** Optimal triage classifier when maximizing detection of cleared cases (high recall).

---

## 12. Naive Bayes Methodology
- **Mathematical Formulation:** Posterior class likelihood computed via Bayes' theorem under conditional feature independence:
  $$P(Y=c \mid X) \propto P(Y=c) \prod_{j=1}^p P(X_j \mid Y=c)$$
- **Hyperparameters:** `var_smoothing=1e-9`.
- **Holdout Test Performance:** Accuracy: $58.94\%$, **Precision: $60.55\%$**, Recall: $47.50\%$, F1: $0.5324$, ROC-AUC: $0.6352$.
- **Operational Role:** Conservative estimator prioritizing precision over recall to minimize false-positive investigations.

---

## 13. k-NN Methodology
- **Mathematical Formulation:** Majority class assignment based on scaled Euclidean distance across $k$ nearest neighbors:
  $$\hat{y}(x_0) = \text{mode}\left(\{y_i : x_i \in N_k(x_0)\}\right)$$
- **Hyperparameters:** $k=15$, `weights='uniform'`, `metric='euclidean'`.
- **Holdout Test Performance:** **Accuracy: $59.59\%$**, Precision: $59.15\%$, Recall: $57.76\%$, F1: $0.5845$, ROC-AUC: $0.6312$.
- **Operational Role:** Most balanced overall classical classifier across accuracy, precision, and recall.

---

## 14. K-Means / Hierarchical Clustering
- **K-Means Formulation:** Partitions $n=20,000$ standardized incident feature profiles into $k=5$ disjoint clusters minimizing within-cluster inertia:
  $$\min \sum_{j=1}^k \sum_{x_i \in C_j} \|x_i - \mu_j\|^2$$
  - **Silhouette Score:** **0.5369** (verifying robust geometric separation).
  - **Cluster Sizes:** Cluster 0 ($5,899$), Cluster 1 ($2,325$), Cluster 2 ($6,699$), Cluster 3 ($1,033$), Cluster 4 ($4,044$).
- **Hierarchical Clustering Formulation:** Agglomerative clustering with Ward's minimum variance criterion:
  $$\Delta ESS_{AB} = \frac{n_A n_B}{n_A + n_B} \|\mu_A - \mu_B\|^2$$
  Generates a deterministic hierarchical dendrogram confirming the taxonomic cluster boundaries identified by K-Means.

---

## 15. Artificial Neural Network (ANN) (Person A)
- **Deep Architecture:**
  - Input: 294 processed features (one-hot encoded demographics, weapons, circumstances, jurisdictions).
  - Dense(256, relu) $\to$ BatchNorm $\to$ Dropout(0.3)
  - Dense(128, relu) $\to$ BatchNorm $\to$ Dropout(0.2)
  - Dense(64, relu) $\to$ BatchNorm $\to$ Dropout(0.2)
  - Dense(32, relu)
  - Output: Dense(1, sigmoid) predicting binary clearance probability.
- **Optimization:** Adam ($\alpha = 0.001$), `ReduceLROnPlateau`, `EarlyStopping`.
- **Holdout Test Evaluation ($n=185,887$ records):**
  - **ROC-AUC:** **0.9984**
  - **Precision:** **0.9908**
  - **Recall:** **0.9880**
  - **Accuracy:** **0.9850 (98.5%)**
  - **Confusion Matrix:** TN=53,152; FP=1,207; FN=1,579; TP=129,949.

---

## 16. Bayesian Belief Network (BBN) (Person A)
- **DAG Formulation:** Directed Acyclic Graph encoding conditional probabilistic dependencies between observed crime scene features (weapon type, circumstance) and latent hypotheses (offender-victim relationship).
- **Inference Engine:** Variable Elimination algorithm computes exact posterior marginals:
  $$P(\text{Relationship} \mid \text{Evidence})$$
- **Example Inference:** Evidence (Weapon='Unknown Weapon', Circumstance='Undetermined') $\implies P(\text{Relationship} = \text{'Unknown'}) = 1.0000$.

---

## 17. Model Evaluation & Benchmark Summary

### Classical Model Performance (Out-of-Sample Holdout Test Set $n=10,436$)

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC | CV Accuracy (Mean $\pm$ Std) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5887 | 0.5586 | **0.7829** | **0.6520** | 0.6347 | $0.5911 \pm 0.0051$ |
| **Gaussian Naive Bayes** | 0.5894 | **0.6055** | 0.4750 | 0.5324 | **0.6352** | $0.5855 \pm 0.0050$ |
| **Scaled $k$-NN ($k=15$)** | **0.5959** | 0.5915 | 0.5776 | 0.5845 | 0.6312 | $\mathbf{0.5950 \pm 0.0028}$ |

*Note: Models operate on initial intake attributes where the natural class baseline is 50.8% solved / 49.2% unsolved without data leakage.*

---

## 18. Streamlit Architecture
The user interface is organized into modular layers:
- **Application Controller (`app.py`):** Multi-page router configuring wide layout, custom executive styling, and persistent page state.
- **Presentation Views (`src/pages/` and `views/`):**
  - `overview.py`: Executive dashboard with KPI cards and PCA variance plots.
  - `crime_linkage.py`: K-Means & Hierarchical victim age clustering with live prediction.
  - `geographic_analysis.py`: Interactive Folium maps, LWR bandwidth controls, and hotspot tables.
  - `behavioral_profiling.py`: BBN structure and conditional probability distributions.
  - `case_solvability.py`: Live intake solvability scoring comparing ID3, Naive Bayes, and $k$-NN.
  - `tamil_nadu_analytics.py`: District rankings, YoY trends, and violent crime distributions.
  - `model_comparison.py`: Comparative ROC-AUC curves, confusion matrices, and metrics.
- **Service Layer (`src/services/`):** `DataService` and `ModelService` implementing Streamlit memory caching (`@st.cache_data`).
- **Design System (`src/ui/`):** `styles.py` (custom executive CSS tokens) and `components.py` (cards, badges).

---

## 19. Technology Stack
- **Core Languages & Libraries:** Python 3.10+, NumPy, Pandas, SciPy.
- **Machine Learning & Modeling:** Scikit-learn, Joblib.
- **Deep Learning & Causal Inference:** TensorFlow / Keras (Person A ANN), Pgmpy (Person A BBN).
- **Geographic & Spatial Analytics:** Folium, Geopy, Streamlit-Folium.
- **Data Visualization:** Matplotlib, Seaborn.
- **Web Application Framework:** Streamlit.
- **Software Quality & Testing:** Pytest (156 automated test cases).

---

## 20. Installation

```bash
# 1. Clone the repository
git clone https://github.com/Dhanumithra/Crimora.git
cd Crimora

# 2. Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install core dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

*(Optional) To activate Person A's Deep Learning (ANN) and Causal (BBN) modules:*
```bash
pip install tensorflow pgmpy
```

---

## 21. Running the Application

```bash
# Launch the Streamlit application
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

To execute the complete test suite:
```bash
pytest -v
```

---

## 22. Results
- **PCA:** 54 components required for $95\%$ cumulative variance across 71 features; PC1 captures $4.16\%$ of variance.
- **Geographic LWR:** Silverman's rule derived optimal bandwidth of $0.8574\text{ km}$ across 2,827 Baltimore incidents, isolating 10 primary hotspot centroids.
- **Classical Solvability:** $k$-NN achieved $59.59\%$ accuracy; ID3 achieved $78.29\%$ recall; Naive Bayes achieved $60.55\%$ precision.
- **Unsupervised Linkage:** Silhouette score of **0.5369** across 5 distinct age cohorts.
- **ANN Deep Solvability:** ROC-AUC of **0.9984**, precision of **0.9908**, recall of **0.9880**, and accuracy of **98.50%** on 185,887 holdout records.
- **Tamil Nadu Trends:** Total cognizable crimes peaked at $1,377,681$ in 2020 due to Section 188 lockdown enforcements, before normalizing to $473,456$ in 2022.

---

## 23. Limitations
- **Intake Feature Sparsity:** Excluding post-investigative features limits classical model accuracy to $\sim 59\%$, reflecting the reality that clearance cannot be definitively predicted from demographic intake data alone.
- **Isotropic Distance Assumptions:** Spatial LWR uses spherical geodesic distance, which does not account for physical transit barriers (waterways, railways, highway corridors).
- **Not a Suspect Identifier:** Spatial hotspots reflect historical incident density, **not** offender home locations or future incident guarantees.
- **Cross-Jurisdiction Heterogeneity:** Law enforcement agencies differ substantially in crime classification thresholds and reporting standards.

---

## 24. Responsible-Use Statement
Crimora is an academic decision-support framework designed for analytical research and empirical training. It must **never** be used for autonomous decision-making, predictive patrol routing, individual suspect scoring, or evidentiary presentation in judicial proceedings. Sworn investigators and legal due process must remain the sole determinants of criminal investigations.

---

## 25. Future Enhancements
1. **Graph Neural Networks (GNNs):** Model co-offending networks and multi-jurisdictional criminal associations.
2. **Network-Constrained Spatial Profiling:** Replace spherical Haversine distances with actual street network shortest-path distances via OpenStreetMap topology.
3. **Natural Language Processing (NLP):** Apply transformer models (e.g., Legal-BERT) to extract unstructured narrative clues from qualitative case logs.
4. **Automated Data Connectors:** Integrate real-time APIs from national crime data portals for continuous model re-calibration.
