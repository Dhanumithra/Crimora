# Presentation-Ready Academic Slide Outline (20 Slides) — Crimora

> **Responsible-Use Statement:**  
> Crimora is an academic machine learning decision-support prototype. It does not identify suspects, determine guilt, locate offender residences, guarantee case solvability, or replace sworn law enforcement investigators.

---

### Slide 1: Title & Authorship
- **Title:** Intelligent Crime Detective Platform (Crimora)
- **Subtitle:** An End-to-End Academic Decision-Support System for Crime Linkage, Spatial Profiling, and Solvability Prediction
- **Collaborators:** Person A (Deep Solvability, Causal BBN, Clustering) & Person B (Data Pipelines, PCA, Spatial LWR, Classical ML, Web Application)
- **Domain:** Machine Learning & Applied Computational Criminology

---

### Slide 2: Problem Statement
- Escalating incident volumes strain investigative law enforcement resources.
- Critical patterns across multi-jurisdictional cold cases remain fragmented across siloed records.
- Investigators lack unified, leak-free statistical decision-support tools for triage, spatial clustering, and macro-trend analysis.

---

### Slide 3: Motivation
- Traditional investigative review relies heavily on manual hypothesis formulation.
- Machine learning provides opportunities for pattern discovery across decades of historical incidents.
- Urgent necessity for ethical, non-prescriptive, leak-free decision support that respects privacy and due process.

---

### Slide 4: Project Objectives
- Engineer an end-to-end data pipeline scrubbing PII and preventing predictive target leakage.
- Apply Principal Component Analysis (PCA) to evaluate incident profile dimensionality.
- Formulate Locally Weighted Regression (LWR) over geodesic coordinates for spatial hotspot analysis.
- Benchmark classical and deep learning models for case solvability triage.
- Deliver an interactive, responsive Streamlit dashboard with geospatial Folium mapping.

---

### Slide 5: Existing Systems & Limitations
- **Current Approach:** Manual case review, isolated desktop spreadsheets, proprietary commercial GIS black-boxes.
- **Flaws:** Susceptible to cognitive bias; predictive models often suffer from post-incident target leakage; lack of standardized reproducibility and open scientific evaluation.

---

### Slide 6: Proposed System (Crimora)
- **Modular Multi-Paradigm Platform:** Combines unsupervised clustering, non-parametric spatial regression, classical ML, and deep neural networks.
- **Rigorous Anti-Leakage Protocol:** Evaluates clearance strictly on intake-available variables.
- **Dual Perspective:** Macro-jurisdictional analytics (Tamil Nadu) paired with micro-incident profiling (US Homicides & SHR).

---

### Slide 7: System Architecture
- **Pipeline:** Datasets $\to$ Cleaning $\to$ Feature Engineering $\to$ PCA / Spatial LWR $\to$ ML Models $\to$ Evaluation $\to$ Streamlit UI $\to$ Interactive Analytics.
- **Collaborative Ownership:** Clear segregation of Person A (Deep ANN, BBN, Clustering) and Person B (Pipelines, PCA, Spatial LWR, Classical ML, Web Platform).
- **Hardened Caching:** Sub-second retrieval via `@st.cache_data`.

---

### Slide 8: Datasets Utilized
- **Washington Post Homicide Dataset:** 52,179 records across 50 major US cities.
- **FBI Supplementary Homicide Report (SHR 1976–2025):** 929,433 records for deep neural network training.
- **NCRB District IPC 2014:** All-India district benchmark.
- **Tamil Nadu State Police & NCRB (2020–2023):** District-wise cognizable crimes, populations, and murder statistics.

---

### Slide 9: Data Preprocessing & Hygiene
- **PII Scrubbing:** Victim surnames and given names permanently stripped.
- **Geographic Validation:** Continental US bounding box filtering; zero coordinates preserved as missing without artificial imputation.
- **Temporal Decomposition:** Parsing reported dates into seasonal, weekly, and quarterly features.
- **Anti-Leakage Audit:** Total exclusion of `disposition` from predictor matrices.

---

### Slide 10: PCA Dimensionality Reduction
- Applied to 71 one-hot encoded and standardized features.
- **Variance Distribution:** PC1 explains $4.16\%$, PC2 explains $2.68\%$, PC3 explains $2.39\%$.
- **Finding:** 54 components required to achieve $95\%$ cumulative variance, showing that high-cardinality municipal variables cannot be trivially compressed without substantial information loss.

---

### Slide 11: Unsupervised Crime Linkage
- **Objective:** Group cold cases and incident profiles with similar demographic and contextual profiles.
- **K-Means ($k=5$):** Validated with Silhouette Score of **0.5369** across 20,000 incident profiles.
- **Hierarchical Clustering:** Bottom-up Agglomerative Clustering with Ward's linkage confirming structural cluster boundaries.

---

### Slide 12: Geographic Profiling & Spatial LWR
- **Distance Metric:** Geodesic Haversine spherical distance formula ($R = 6,371.0088\text{ km}$).
- **Non-Parametric LWR:** Gaussian, Epanechnikov, and Tricube kernels.
- **Bandwidth Optimization:** Silverman's Rule of Thumb yields $h = 0.8574\text{ km}$ for the Baltimore cluster ($n=2,827$), isolating 10 distinct high-intensity spatial centroids.

---

### Slide 13: Behavioral Profiling & Causal Modeling (BBN)
- **Directed Acyclic Graph (DAG):** Models probabilistic dependencies between observed crime scene evidence (weapons, circumstances) and latent hypotheses (offender relationship).
- **Exact Inference Engine:** Variable Elimination calculates posterior marginals (e.g., $P(\text{Relationship} \mid \text{Evidence})$).
- Handled in graceful standby when `pgmpy` is offline.

---

### Slide 14: Case Solvability Prediction
- Predicts case clearance (`is_solved` $\in \{0, 1\}$) from intake attributes.
- **Classifiers Benchmarked:** ID3 Decision Tree, Gaussian Naive Bayes, Scaled $k$-Nearest Neighbors ($k=15$).
- **Anti-Leakage Realism:** Natural baseline of $50.8\%$ clearance; models operate at $\sim 59\%$ accuracy with realistic predictive value.

---

### Slide 15: Rigorous Model Evaluation
- **Stratified 5-Fold Cross-Validation:** Eliminates partition bias across 41,743 training records.
- **Holdout Test Evaluation ($n=10,436$):**
  - **ID3:** Accuracy $58.87\%$, Precision $55.86\%$, Recall $78.29\%$, F1 $0.6520$, ROC-AUC $0.6347$.
  - **Naive Bayes:** Accuracy $58.94\%$, Precision $60.55\%$, Recall $47.50\%$, F1 $0.5324$, ROC-AUC $0.6352$.
  - **$k$-NN ($k=15$):** Accuracy $59.59\%$, Precision $59.15\%$, Recall $57.76\%$, F1 $0.5845$, ROC-AUC $0.6312$.

---

### Slide 16: Streamlit Application Architecture
- **Layered Design:** `app.py` coordinator, `src/pages/` views, `src/services/` data orchestration, `src/ui/` styling.
- **Executive UI:** Professional custom CSS theme, responsive metric KPI cards, Folium interactive heatmaps.
- **Robustness:** 156 passing automated pytest suites; graceful standby handlers for optional heavy frameworks.

---

### Slide 17: Macro Analytics: Tamil Nadu Crime Trends
- **Longitudinal Trend:** 2014 benchmark ($193,200$ IPC crimes); 2020 surge ($1,377,681$ cases) driven by pandemic Section 188 lockdown enforcements; normalization in 2021 ($756,753$) and 2022 ($473,456$).
- **District Insights (2022):** Chennai leads volume ($39,138$ cases, $8.3\%$ share); Trichy City exhibits highest rate per capita ($1,992.8$ per lakh).

---

### Slide 18: System Limitations
- **Data Limitations:** Asymmetric multi-agency reporting and historical record sparsity.
- **Spatial Assumptions:** Isotropic distance neglects physical transit barriers and street topology.
- **Not a Suspect Finder:** Does not pinpoint criminal residences or predict individual behavior.
- **Feature Sparsity:** Intake-only demographics cap classical accuracy around $59\%$.

---

### Slide 19: Future Scope & Enhancements
- Integrate Graph Neural Networks (GNNs) for co-offending network discovery.
- Implement network-constrained street routing distances in spatial regression.
- Natural Language Processing (NLP) over narrative investigative case logs.
- Automated API connectors for real-time state Open Government Data portals.

---

### Slide 20: Conclusion & Responsible-Use Summary
- Successfully delivered a robust, leak-free academic crime analytics decision-support platform.
- Demonstrates complementary strengths across unsupervised clustering, non-parametric spatial regression, classical ML, and deep learning.
- Strict commitment to responsible AI: tool assists human investigators, never replaces due process or individual rights.
