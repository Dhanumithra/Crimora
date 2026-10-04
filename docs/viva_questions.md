# Comprehensive Academic Viva Questions & Concise Answers — Crimora

> **Academic Context & Disclaimer:**  
> Crimora is an academic machine learning decision-support prototype. It does not identify suspects, determine guilt, locate offender residences, guarantee case solvability, or replace judicial due process. All answers reflect the actual technical implementation within the repository.

---

### Q1: Why was the Intelligent Crime Detective Platform (Crimora) developed?
**Answer:** To develop an end-to-end academic decision-support platform that explores how unsupervised clustering, spatial regression (LWR), dimensionality reduction (PCA), classical machine learning, and deep learning can extract analytical patterns from historical crime records without committing target leakage or overstepping ethical boundaries.

### Q2: Which primary datasets are used in this project?
**Answer:** Four primary datasets:
1. *The Washington Post Homicide Dataset* (52,179 records across 50 US cities).
2. *FBI Supplementary Homicide Report (SHR 1976–2025)* (929,433 records for deep ANN & BBN modeling).
3. *NCRB District IPC Crime Statistics 2014* (India-wide district baseline).
4. *Tamil Nadu State Police & NCRB Reports* (2020–2022 cognizable crimes & 2023 violent fatalities across 38+ districts).

### Q3: What is target leakage and how is it prevented in your solvability prediction pipeline?
**Answer:** Target leakage occurs when features recorded after or as a direct consequence of the target outcome are included as predictors. In Crimora, the `disposition` field ("Closed by arrest", "Closed without arrest", "Open/No arrest") was used to define the binary target `is_solved`, but was strictly purged from all feature matrices prior to training. Models only receive initial intake attributes (demographics, jurisdiction).

### Q4: How were missing demographic and spatial values handled during preprocessing?
**Answer:** Direct PII (`victim_first`, `victim_last`) was completely stripped. Missing or invalid victim ages were imputed with the global median ($28.0\text{ years}$). For spatial data, records outside continental US coordinates were isolated into `homicide_clean.csv`, while valid coordinates were preserved in `homicide_spatial_clean.csv` without fabricating artificial zero-coordinate replacements.

### Q5: What role does Principal Component Analysis (PCA) play in this project?
**Answer:** PCA was applied to the 71-dimensional one-hot encoded incident matrix to analyze covariance structure and assess whether incident profiles can be compressed into a lower-dimensional subspace while preserving $95\%$ of cumulative variance.

### Q6: Why did PCA require 54 principal components to achieve 95% cumulative variance?
**Answer:** Because the dataset contains high-cardinality nominal variables (50 discrete cities) that one-hot encode into numerous orthogonal binary dimensions. Information is broadly distributed rather than concentrated in a few linear axes (PC1 explains $4.16\%$, PC2 explains $2.68\%$, and PC3 explains $2.39\%$).

### Q7: What mathematical formula is used to calculate distances in geographic profiling?
**Answer:** The spherical Haversine formula over WGS84 geodesic coordinates:
$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
with Earth radius $R = 6,371.0088\text{ km}$, computing true surface distances between incident coordinates.

### Q8: What is Locally Weighted Regression (LWR) in geographic profiling?
**Answer:** LWR is a non-parametric spatial intensity estimator that assigns decaying weights to neighboring crime incidents based on their distance from a query evaluation point $x_0$ using a kernel function (Gaussian, Epanechnikov, or Tricube) scaled by bandwidth $h$.

### Q9: How was the bandwidth parameter ($h$) chosen for spatial LWR?
**Answer:** Using Silverman's Rule of Thumb adapted for two-dimensional spatial coordinate distributions:
$$h = 1.06 \, \hat{\sigma} \, n^{-1/5}$$
For the Baltimore cluster ($n=2,827$), Silverman's rule produced an optimal bandwidth of $h = 0.8574\text{ km}$, balancing local spatial variation with noise reduction.

### Q10: How does the ID3 Decision Tree algorithm split nodes?
**Answer:** It splits nodes by maximizing Information Gain based on Shannon Entropy:
$$H(S) = -\sum p_i \log_2(p_i), \quad IG(S, A) = H(S) - \sum \frac{|S_v|}{|S|} H(S_v)$$
In our implementation, `criterion='entropy'` with `max_depth=8` achieved the highest recall ($78.29\%$) among classical models.

### Q11: What assumption underlies the Gaussian Naive Bayes classifier?
**Answer:** It assumes that, conditioned on the class label (cleared vs. uncleared), all input features are mutually independent:
$$P(Y=c \mid X) \propto P(Y=c) \prod P(X_j \mid Y=c)$$
Continuous variables are modeled via normal distributions with variance smoothing (`var_smoothing=1e-9`). It achieved the highest classical precision ($60.55\%$).

### Q12: How was k-Nearest Neighbors (k-NN) parameterized and how did it perform?
**Answer:** With $k=15$ neighbors, uniform distance weighting, and Euclidean distance on standardized features. It achieved the highest overall holdout accuracy among classical models at $59.59\%$ with balanced precision ($59.15\%$) and recall ($57.76\%$).

### Q13: Why are the classical model accuracies around 59% instead of 90%+?
**Answer:** Because our models strictly adhere to data hygiene by excluding post-investigation leakage variables. Predicting whether an investigation will clear using only initial demographic attributes and municipal jurisdiction against a natural $50.8\%$ clearance baseline has an inherently low signal-to-noise ratio. Reporting realistic $\sim 59\%$ accuracy proves methodological integrity.

### Q14: How does K-Means clustering assist in cold case linkage?
**Answer:** It partitions standardized incident profiles into $k=5$ clusters by minimizing within-cluster sum of squares. It groups incidents into coherent demographic cohorts (e.g., adolescent, young adult, mature, senior) with a validated Silhouette Score of **0.5369**.

### Q15: How does Hierarchical Agglomerative Clustering differ from K-Means in Crimora?
**Answer:** K-Means requires pre-specifying $k$ and relies on iterative centroid updates from random seeds. Hierarchical Agglomerative Clustering uses a bottom-up approach with Ward's minimum variance criterion, generating a deterministic dendrogram that validated the structural cluster boundaries found by K-Means.

### Q16: What is the architecture of Person A's Deep Learning ANN model?
**Answer:** A Multilayer Perceptron implemented in Keras:
- Input: 294 processed features (one-hot encoded demographics, weapons, circumstances).
- Hidden: Dense(256) $\to$ BatchNorm $\to$ Dropout(0.3) $\to$ Dense(128) $\to$ BatchNorm $\to$ Dropout(0.2) $\to$ Dense(64) $\to$ BatchNorm $\to$ Dropout(0.2) $\to$ Dense(32).
- Output: Dense(1, activation='sigmoid').
- Optimizer: Adam ($\alpha=0.001$) with ReduceLROnPlateau and EarlyStopping.

### Q17: What performance did the ANN Solvability Engine achieve?
**Answer:** On the 185,887-record holdout test set of the SHR dataset:
- ROC-AUC: **0.9984**
- Precision: **0.9908**
- Recall: **0.9880**
- Accuracy: **0.9850 (98.5%)**
- Confusion Matrix: TN=53,152; FP=1,207; FN=1,579; TP=129,949.

### Q18: What is a Bayesian Belief Network (BBN) and how is it used in Person A's module?
**Answer:** A BBN is a Directed Acyclic Graph (DAG) that represents conditional probabilistic dependencies between variables. In Crimora, it models crime scene evidence (weapon type, circumstance) to infer posterior probabilities over latent hypotheses (such as offender-victim relationship: Stranger vs. Family vs. Acquaintance).

### Q19: Why was Stratified 5-Fold Cross-Validation used rather than a single train-test split?
**Answer:** Stratified $k$-fold cross-validation ensures that every fold maintains the exact class clearance ratio ($50.8\%$ solved / $49.2\%$ unsolved), preventing split bias and providing reliable estimates of mean performance and generalization variance across different data subsets.

### Q20: What explains the surge in Tamil Nadu crime statistics in 2020?
**Answer:** Total cognizable crimes surged to 1,377,681 cases in 2020 due to widespread registration of regulatory and curfew violations under Section 188 IPC and Special and Local Laws (SLL) during COVID-19 pandemic lockdowns. In 2021, cases fell by $45.07\%$, and in 2022 fell an additional $37.44\%$ to 473,456 cases as reporting normalized.

### Q21: What are the key architectural layers of the Streamlit application?
**Answer:**
1. *Presentation Layer:* Multi-page views (`app.py`, `src/pages/`, `views/`).
2. *UI & Styling Layer:* `src/ui/styles.py` (executive CSS) and `src/ui/components.py` (metric cards, headers).
3. *Service & Orchestration Layer:* `DataService` (data loading/caching) and `ModelService` (model loading/inference).
4. *Core Analytics & Persistence Layer:* `src/` modules and pre-computed joblib/keras model artifacts in `models/`.

### Q22: Why are `@st.cache_data` decorators utilized across data services?
**Answer:** To avoid redundant disk reads, repeated CSV parsing, and model re-deserialization on every Streamlit user interaction, ensuring sub-second UI response times and low memory consumption.

### Q23: Why do the ANN and BBN modules operate in standby mode in standard local runs?
**Answer:** The core platform runs on standard lightweight scientific Python (`scikit-learn`, `pandas`, `scipy`). The ANN and BBN require heavy third-party frameworks (`tensorflow` and `pgmpy`). To maintain portability and avoid multi-gigabyte container dependencies, the system gracefully detects their presence and provides informative standby views with precomputed benchmarks when they are not installed.

### Q24: Can geographic profiling in this system identify where a criminal lives?
**Answer:** Absolutely not. Geographic profiling and LWR estimate historical incident density surfaces (where crimes occurred), which often represent commercial areas or transport corridors. Inferring an offender's residence from crime locations requires psychological and behavioral assumptions that this statistical model does not make.

### Q25: What ethical risks are associated with automated crime prediction?
**Answer:** Key risks include:
1. *Feedback loops:* Directing patrol resources to historically over-policed areas based on arrest rates.
2. *Algorithmic confirmation bias:* Investigators treating statistical probabilities as deterministic evidence.
Crimora mitigates these by stripping PII, evaluating population-normalized rates, enforcing data leakage boundaries, and presenting all tools strictly as non-prescriptive academic decision-support.

### Q26: What is the difference between Precision and Recall in crime solvability prediction?
**Answer:**
- *Precision* is the proportion of cases flagged as "likely solvable" that were actually cleared. High precision prevents wasting scarce investigative hours on false leads (Naive Bayes achieved $60.55\%$).
- *Recall* is the proportion of all cleared cases that the model successfully flagged. High recall ensures fewer solvable cases are prematurely abandoned (ID3 achieved $78.29\%$).

### Q27: How does Crimora ensure software quality and reproducibility?
**Answer:** Through an automated test suite with **156 pytest unit, integration, and end-to-end tests** covering data cleaning, PCA variance criteria, LWR spatial solvers, classical model lifecycles, Streamlit service caching, and deployment hygiene (verifying no hardcoded paths or secrets).

### Q28: What future enhancements are recommended for this platform?
**Answer:**
1. Integration of Graph Neural Networks (GNNs) for co-offending network analysis.
2. Incorporating street network routing topology into LWR instead of Euclidean/Haversine distance.
3. Natural Language Processing (NLP) over narrative investigative case notes.
4. Geospatial expansion to additional state crime registries using standardized Open Government Data APIs.
