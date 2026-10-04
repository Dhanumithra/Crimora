# Analytical Methodology — Intelligent Crime Detective Platform (Crimora)

> **Responsible-Use Statement:**  
> Crimora is an academic decision-support framework designed to explore analytical crime data modeling. It does **not** identify suspects, prove criminal guilt, establish residency, guarantee case solvability, or replace professional law enforcement decision-making.

---

## 1. Data Preprocessing & Leakage Isolation

### 1.1 Datasets Utilized
1. **The Washington Post Homicide Dataset:** 52,179 homicide records across 50 major US metropolitan jurisdictions (covering ~2007–2017).
2. **FBI Supplementary Homicide Report (SHR 1976–2025):** 929,433 historical homicide records used for macroscopic deep learning (ANN) and causal Bayesian network modeling.
3. **National Crime Records Bureau (NCRB) District IPC Dataset (2014):** District-level Indian Penal Code cognizance baseline.
4. **Tamil Nadu State Police & NCRB Reports (2020–2022 & 2023 Violent Crime):** District-level cognizable crimes, population projections, murder incidence, and culpable homicide statistics across 38+ districts and commissionerates.

### 1.2 Data Hygiene & PII De-identification
- **PII Scrubbing:** Direct personal identifiers, including victim surname (`victim_last`) and given name (`victim_first`), are permanently stripped during the initial ingestion phase.
- **Geographic Bounding & Imputation:** Coordinate pairs are validated against the continental US geographic bounding box ($24.396308^\circ\text{N} \le \text{lat} \le 49.384358^\circ\text{N}$ and $-125.0^\circ\text{W} \le \text{lon} \le -66.93457^\circ\text{W}$). Records with invalid or zero coordinates are isolated into `homicide_clean.csv` while valid spatial coordinates form `homicide_spatial_clean.csv` (preserving missing values without fabricated zero-replacements).
- **Temporal Decomposition:** Reported dates in integer formats (`YYYYMMDD`) are parsed and expanded into seasonal features: `reported_year`, `reported_month`, `reported_day`, `reported_day_of_week`, and `reported_quarter`.
- **Demographic Normalization:** Textual age values (e.g., `'Unknown'`) are converted to nulls and imputed with the overall median victim age ($28.0\text{ years}$), retaining physical plausibility ($0 \le \text{age} \le 120$).

### 1.3 Target Leakage Isolation Audit
In predictive law enforcement analytics, data leakage represents a major flaw. If features recorded *after* an investigation concludes (e.g., arrest outcome, booking details) are supplied to a classifier predicting solvability at intake, the model reports artificially inflated accuracy.
- **Excluded Features:** `disposition` ("Closed by arrest", "Closed without arrest", "Open/No arrest") directly determines the clearance label. It is strictly dropped from predictor matrices.
- **Ground Truth Definition:** `is_solved = 1` if `disposition` is "Closed by arrest" or "Closed without arrest"; `0` if "Open/No arrest".
- **Predictor Set:** Baseline intake features only: victim age (`victim_age_clean`), victim sex, victim race, and municipal jurisdiction (`city`, `state`).

---

## 2. Dimensionality Reduction: Principal Component Analysis (PCA)

### 2.1 Theoretical Formulation
Given the preprocessed categorical and numerical feature matrix $X \in \mathbb{R}^{n \times p}$ (one-hot encoded into $p=71$ dimensions across $n=52,179$ records), PCA computes orthogonal linear projections maximizing variance.

1. **Mean Centering & Standardization:**
   $$\tilde{X} = \frac{X - \mu}{\sigma}$$
2. **Covariance Matrix Computation:**
   $$\Sigma = \frac{1}{n-1} \tilde{X}^T \tilde{X}$$
3. **Eigendecomposition:**
   $$\Sigma v_k = \lambda_k v_k$$
   where $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_p \ge 0$ are the eigenvalues representing variance explained by corresponding eigenvectors $v_k$.
4. **Cumulative Explained Variance Criterion:**
   The dimensionality threshold $k$ is selected such that:
   $$\frac{\sum_{i=1}^k \lambda_i}{\sum_{j=1}^p \lambda_j} \ge 0.95$$

### 2.2 Empirical Findings
- In the Crimora dataset, individual component variances decay gradually because high-cardinality nominal jurisdictions (50 cities) distribute variance across many orthogonal binary axes.
- **PC1** accounts for **4.16%** of total variance; **PC2** accounts for **2.68%**; **PC3** accounts for **2.39%**.
- Reaching the $95\%$ cumulative variance threshold requires **54 principal components** out of 71, establishing that incident characteristics cannot be trivially collapsed into 2 or 3 dimensions without massive information loss.

---

## 3. Geographic Profiling & Locally Weighted Regression (LWR)

### 3.1 Spatial Distance Formulation
All geographical distances are evaluated using the spherical Haversine formula over WGS84 geodesic coordinates:
$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
where $R = 6371.0088\text{ km}$, $\phi$ is latitude in radians, and $\lambda$ is longitude in radians.

### 3.2 Locally Weighted Regression (LWR) Kernel Formulation
For any query evaluation point $x_0 = (\text{lat}_0, \text{lon}_0)$ on a regular spatial grid, the local intensity or spatial weighting assigns decaying influence to surrounding incident points $x_i$ using distance $d(x_0, x_i)$ relative to bandwidth $h$:

1. **Gaussian Kernel:**
   $$K(u) = \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{u^2}{2}\right), \quad u = \frac{d(x_0, x_i)}{h}$$
2. **Epanechnikov Kernel (Optimal MSE):**
   $$K(u) = \frac{3}{4}(1 - u^2) \quad \text{for } |u| \le 1, \quad 0 \text{ otherwise}$$
3. **Tricube Kernel:**
   $$K(u) = (1 - |u|^3)^3 \quad \text{for } |u| \le 1, \quad 0 \text{ otherwise}$$

### 3.3 Optimal Bandwidth Selection
Bandwidth $h$ controls spatial smoothness. Crimora employs Silverman's Rule of Thumb adapted for 2D geographic coordinates:
$$h = \left(\frac{4 \hat{\sigma}^5}{3 n}\right)^{1/5} \approx 1.06 \, \hat{\sigma} \, n^{-1/5}$$
For the Baltimore incident cluster ($n=2,827$), Silverman's rule yields an optimal bandwidth $h \approx 0.8574\text{ km}$, preventing artificial oversmoothing while preserving neighborhood-level spatial heterogeneity.

---

## 4. Supervised Classical Machine Learning Classifiers

Three distinct classical model families were benchmarked to predict case clearance status (`is_solved` $\in \{0, 1\}$) on an out-of-sample holdout test partition ($n=10,436$, $20\%$ split) and through 5-fold stratified cross-validation ($n=41,743$).

### 4.1 Decision Tree (ID3 / Information Gain / Entropy)
- **Criterion:** Shannon Entropy $H(S) = - \sum_{i=1}^c p_i \log_2(p_i)$
- **Information Gain:** $IG(S, A) = H(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|} H(S_v)$
- **Implementation Parameters:** `criterion='entropy'`, `max_depth=8`, `min_samples_split=20`, `min_samples_leaf=10`.
- **Behavior:** Captures non-linear jurisdictional splits; prioritizes high recall for cleared cases ($78.29\%$), yielding balanced F1 of $0.6520$.

### 4.2 Gaussian Naive Bayes
- **Formulation:** Computes posterior probabilities via Bayes' Theorem under class-conditional feature independence:
  $$P(Y=c \mid X) \propto P(Y=c) \prod_{j=1}^p P(X_j \mid Y=c)$$
  where continuous variables are modeled as Gaussian distributions $\mathcal{N}(\mu_{c,j}, \sigma_{c,j}^2)$.
- **Implementation Parameters:** `var_smoothing=1e-9`.
- **Behavior:** Achieves the highest precision among classical models ($60.55\%$), functioning as a conservative estimator.

### 4.3 Scaled $k$-Nearest Neighbors ($k$-NN)
- **Formulation:** Evaluates class membership by voting across the $k$ nearest training vectors in scaled Euclidean feature space:
  $$\hat{y}(x_0) = \text{mode}\left(\{y_i : x_i \in N_k(x_0)\}\right)$$
- **Implementation Parameters:** $k=15$, `weights='uniform'`, `metric='euclidean'`.
- **Behavior:** Provides the highest overall test accuracy ($59.59\%$) and most balanced precision/recall trade-off ($59.15\%$ precision, $57.76\%$ recall).

---

## 5. Unsupervised Cold Case Clustering (Person A)

### 5.1 K-Means Clustering
- **Objective:** Partition $N=20,000$ standardized incident feature profiles into $k=5$ disjoint clusters minimizing within-cluster sum of squares (inertia):
  $$\min \sum_{j=1}^k \sum_{x_i \in C_j} \|x_i - \mu_j\|^2$$
- **Empirical Cluster Segmentation:**
  - Cluster 0 ($n=5,899$): Young adults (mean age ~21–25)
  - Cluster 1 ($n=2,325$): Mature adults (mean age ~46–55)
  - Cluster 2 ($n=6,699$): Prime working age (mean age ~29–38)
  - Cluster 3 ($n=1,033$): Senior victims (mean age $\ge 62$)
  - Cluster 4 ($n=4,044$): Adolescents and youths (mean age $\le 18$)
- **Validation:** Silhouette Score = **0.5369**, confirming distinct, well-separated cluster geometry.

### 5.2 Agglomerative Hierarchical Clustering
- **Linkage Criterion:** Ward's minimum variance method:
  $$\Delta ESS_{AB} = \frac{n_A n_B}{n_A + n_B} \|\mu_A - \mu_B\|^2$$
- **Application:** Generates reproducible taxonomic grouping of incident profiles without requiring random centroid initialization.

---

## 6. Deep Learning Solvability Engine (ANN) (Person A)

### 6.1 Architecture & Hyperparameters
- **Input Layer:** 294 processed features (one-hot encoded demographics, weapons, circumstances, and jurisdictions).
- **Hidden Layers:**
  - Dense(256, activation='relu') + BatchNormalization + Dropout(0.3)
  - Dense(128, activation='relu') + BatchNormalization + Dropout(0.2)
  - Dense(64, activation='relu') + BatchNormalization + Dropout(0.2)
  - Dense(32, activation='relu')
- **Output Layer:** Dense(1, activation='sigmoid') predicting clearance probability.
- **Optimizer & Schedule:** Adam ($\alpha = 0.001$), `ReduceLROnPlateau(patience=2, factor=0.5)`, `EarlyStopping(patience=3)`.
- **Loss Function:** Binary Cross-Entropy:
  $$\mathcal{L} = -\frac{1}{N}\sum_{i=1}^N \left[y_i \log(\hat{y}_i) + (1 - y_i)\log(1 - \hat{y}_i)\right]$$

### 6.2 Empirical Results on Test Partition ($n=185,887$)
- **ROC-AUC Score:** **0.9984**
- **Test Precision:** **0.9908**
- **Test Recall:** **0.9880**
- **Test Accuracy:** **0.9850 (98.5%)**
- **Confusion Matrix:** True Negatives = 53,152; False Positives = 1,207; False Negatives = 1,579; True Positives = 129,949.

---

## 7. Causal Behavioral Profiling: Bayesian Belief Network (BBN) (Person A)

### 7.1 Directed Acyclic Graph (DAG) Structure
Models conditional dependencies among observed crime scene attributes:
- **Observed Nodes:** Weapon Type, Crime Scene Circumstance, Incident Location Type.
- **Latent / Target Hypothesis Nodes:** Offender Relationship (Stranger vs. Acquaintance vs. Family), Probable Motive Category.

### 7.2 Probability Factorization
Joint probability is decomposed via chain rule over the Bayesian network:
$$P(X_1, \dots, X_m) = \prod_{i=1}^m P(X_i \mid \text{Parents}(X_i))$$
- **Exact Inference Engine:** Variable Elimination computes posterior distributions given observed crime scene evidence:
  $$P(\text{Relationship} \mid \text{Weapon} = w, \text{Circumstance} = c)$$

---

## 8. Model Evaluation Framework & Validation Rigor

1. **Stratification:** Cross-validation folds preserve identical clearance ratios ($50.8\%$ solved, $49.2\%$ unsolved).
2. **Leak-Free Transformation:** Preprocessing scalers and encoders are fitted strictly on training partitions and applied to validation/test partitions.
3. **Multi-Metric Assessment:** Models are benchmarked across Accuracy, Precision, Recall, Macro F1-Score, and ROC-AUC.
4. **Offline Integrity:** All reported metrics are extracted from serialized models and verified test executions without synthetic extrapolation.
