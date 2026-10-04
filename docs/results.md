# Verified Empirical Results Summary — Intelligent Crime Detective Platform (Crimora)

> **Responsible-Use Statement:**  
> Crimora is an academic decision-support prototype. The empirical metrics presented below reflect historical statistical data modeling and do not constitute investigative proof, individual suspect identification, or automated determination of guilt.

---

## 1. Executive Summary of Results Across All Modules

| Analytics Domain / Model | Primary Dataset & Scale | Primary Metric | Secondary Metric | Operational Status |
| :--- | :--- | :--- | :--- | :--- |
| **PCA Dimensionality Reduction** | Washington Post (52,179 rows, 71 cols) | 54 components for 95% variance | PC1 = 4.16% variance | Fully Operational |
| **LWR Geographic Profiling** | Baltimore Police cluster (2,827 pts) | Bandwidth $h = 0.8574\text{ km}$ | Top Hotspot: Rank 1 ($39.302^\circ\text{N}$) | Fully Operational |
| **ID3 Decision Tree Classifier** | Holdout test set ($n=10,436$) | Test Accuracy: $58.87\%$ | Test Recall: $78.29\%$ | Fully Operational |
| **Gaussian Naive Bayes** | Holdout test set ($n=10,436$) | Test Accuracy: $58.94\%$ | Test Precision: $60.55\%$ | Fully Operational |
| **Scaled $k$-NN Classifier ($k=15$)**| Holdout test set ($n=10,436$) | Test Accuracy: $59.59\%$ | Test ROC-AUC: $0.6312$ | Fully Operational |
| **K-Means Clustering ($k=5$)** | Standardized sample ($n=20,000$) | Silhouette Score: **0.5369** | Inertia partitioned into 5 cohorts | Fully Operational |
| **Hierarchical Clustering** | Standardized sample ($n=20,000$) | Ward linkage tree ($k=5$) | Exact hierarchical dendrogram | Fully Operational |
| **Tamil Nadu Longitudinal** | NCRB & TN State (2014–2023) | 2020 Peak: $1,377,681$ cases | 2022 Total: $473,456$ ($-37.4\%$) | Fully Operational |
| **ANN Solvability Engine (Person A)**| SHR Dataset ($n=185,887$ test) | ROC-AUC: **0.9984** | Test Accuracy: **98.50%** | Artifact Validated |
| **Bayesian Belief Network (Person A)**| SHR Causal Profile (DAG) | Exact Variable Elimination | P(Unknown Rel \| Undet) = 1.00 | Artifact Validated |

---

## 2. Supervised Classical Machine Learning Evaluation

All classical classifiers were trained on identical training sets ($n=41,743$) and evaluated on an out-of-sample holdout test partition ($n=10,436$) with 5-fold stratified cross-validation.

### 2.1 Holdout Test Performance Comparison

| Model | Accuracy | Precision | Recall | Macro F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | 0.5887 | 0.5586 | **0.7829** | **0.6520** | 0.6347 |
| **Gaussian Naive Bayes** | 0.5894 | **0.6055** | 0.4750 | 0.5324 | **0.6352** |
| **Scaled $k$-NN ($k=15$)** | **0.5959** | 0.5915 | 0.5776 | 0.5845 | 0.6312 |

### 2.2 5-Fold Stratified Cross-Validation Stability

| Model | CV Accuracy (Mean $\pm$ Std) | CV Precision | CV Recall | CV F1-Score | CV ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ID3 Decision Tree** | $0.5911 \pm 0.0051$ | 0.5666 | 0.7235 | 0.6348 | 0.6344 |
| **Gaussian Naive Bayes** | $0.5855 \pm 0.0050$ | 0.6024 | 0.4650 | 0.5241 | 0.6288 |
| **Scaled $k$-NN ($k=15$)** | $\mathbf{0.5950 \pm 0.0028}$ | 0.5904 | 0.5771 | 0.5837 | 0.6339 |

### 2.3 Detailed Classification Reports (Holdout Test Set)

```
========================================================================================
ID3 DECISION TREE (Holdout Test n=10,436)
Class               Precision    Recall    F1-Score    Support
----------------------------------------------------------------------------------------
0 (Unsolved)           0.6558    0.4007      0.4974       5,301
1 (Solved)             0.5586    0.7829      0.6520       5,135
----------------------------------------------------------------------------------------
Macro Average          0.6072    0.5918      0.5747      10,436
Weighted Average       0.6079    0.5887      0.5735      10,436
========================================================================================

GAUSSIAN NAIVE BAYES (Holdout Test n=10,436)
Class               Precision    Recall    F1-Score    Support
----------------------------------------------------------------------------------------
0 (Unsolved)           0.5793    0.7002      0.6340       5,301
1 (Solved)             0.6055    0.4750      0.5324       5,135
----------------------------------------------------------------------------------------
Macro Average          0.5924    0.5876      0.5832      10,436
Weighted Average       0.5922    0.5894      0.5840      10,436
========================================================================================

SCALED k-NN (k=15) (Holdout Test n=10,436)
Class               Precision    Recall    F1-Score    Support
----------------------------------------------------------------------------------------
0 (Unsolved)           0.6000    0.6137      0.6067       5,301
1 (Solved)             0.5915    0.5776      0.5845       5,135
----------------------------------------------------------------------------------------
Macro Average          0.5958    0.5956      0.5956      10,436
Weighted Average       0.5958    0.5959      0.5958      10,436
========================================================================================
```

---

## 3. Dimensionality Reduction: PCA Findings

- **Total Dimensions:** 71 one-hot encoded and scaled features.
- **Top Eigenvalue Contributions:**
  - **PC1:** $4.16\%$ explained variance
  - **PC2:** $2.68\%$ explained variance
  - **PC3:** $2.39\%$ explained variance
  - **PC4:** $2.28\%$ explained variance
  - **PC5:** $2.21\%$ explained variance
- **Cumulative Thresholds:**
  - $50\%$ cumulative variance: 23 components
  - $80\%$ cumulative variance: 42 components
  - **$95\%$ cumulative variance: 54 components**
- **Analytical Takeaway:** High jurisdictional variance distributes information evenly across orthogonal axes, demonstrating that simple 2D projections do not capture the complexity of multi-city incident records.

---

## 4. Geographic Profiling & Spatial Hotspot Centroids

Using the localized Baltimore incident cluster ($n=2,827$), Silverman's rule determined an optimal bandwidth of $h = 0.8574\text{ km}$. The top identified spatial hotspot centroids are:

| Rank | Latitude | Longitude | Estimated Intensity | Normalized Intensity | Percentile Tier | Jurisdiction |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | $39.302423$ | $-76.643620$ | $0.048834$ | $1.0000$ | $\ge 95.0\text{th}$ | Baltimore |
| **2** | $39.292191$ | $-76.643620$ | $0.047705$ | $0.9769$ | $\ge 95.0\text{th}$ | Baltimore |
| **3** | $39.309244$ | $-76.594226$ | $0.047138$ | $0.9653$ | $\ge 95.0\text{th}$ | Baltimore |
| **4** | $39.302423$ | $-76.585994$ | $0.043479$ | $0.8903$ | $\ge 95.0\text{th}$ | Baltimore |
| **5** | $39.316066$ | $-76.602458$ | $0.043022$ | $0.8810$ | $\ge 95.0\text{th}$ | Baltimore |

---

## 5. Unsupervised Cold Case Clustering Results

Trained on standardized incident profiles ($n=20,000$ sample):
- **Silhouette Coefficient:** **0.5369** (confirming mathematically distinct cluster separation).
- **Cluster Breakdown ($k=5$):**
  - **Cluster 0:** 5,899 cases ($29.50\%$)
  - **Cluster 1:** 2,325 cases ($11.62\%$)
  - **Cluster 2:** 6,699 cases ($33.50\%$)
  - **Cluster 3:** 1,033 cases ($5.16\%$)
  - **Cluster 4:** 4,044 cases ($20.22\%$)
- **Hierarchical Clustering:** Agglomerative clustering with Ward's linkage independently reproduced congruent cluster geometries, validating cluster stability.

---

## 6. Tamil Nadu Longitudinal Macro Analytics

Longitudinal analysis of Tamil Nadu crime trends reveals significant macro-level shifts:

### 6.1 State-Level Temporal Trends
- **2014:** $193,200$ cases (Cognizable IPC crimes only; historical benchmark).
- **2020:** $1,377,681$ cases (Total Cognizable IPC + SLL crimes; pandemic surge driven by Section 188 / regulatory curfew violations).
- **2021:** $756,753$ cases ($-45.07\%$ year-over-year decline as lockdowns relaxed).
- **2022:** $473,456$ cases ($-37.44\%$ year-over-year decline, normalizing toward pre-pandemic baselines).

### 6.2 Top District Crime Volume (2022)
1. **Chennai:** $39,138$ incidents ($8.3\%$ state share; rate: $648.3$ per lakh population).
2. **Cuddalore:** $26,361$ incidents ($5.6\%$ state share; rate: $951.4$ per lakh population).
3. **Thanjavur:** $21,106$ incidents ($4.5\%$ state share; rate: $825.1$ per lakh population).
4. **Trichy City:** $17,954$ incidents ($3.8\%$ state share; rate: $1,992.8$ per lakh population).

---

## 7. Deep Learning Solvability Engine (ANN) Results (Person A)

Evaluated on the full holdout test partition of the Supplementary Homicide Report ($n=185,887$ records):
- **ROC-AUC:** **0.9984**
- **Precision:** **0.9908**
- **Recall:** **0.9880**
- **Accuracy:** **0.9850 (98.5%)**
- **Confusion Matrix:**
  - True Negatives (Unsolved correctly identified): $53,152$
  - False Positives (Unsolved misclassified as Solved): $1,207$
  - False Negatives (Solved misclassified as Unsolved): $1,579$
  - True Positives (Solved correctly identified): $129,949$

---

## 8. Scientifically Grounded Conclusion on Model Comparisons

1. **Intake Features vs. Deep Scene Features:** The classical models operate strictly on baseline intake features (victim demographics and jurisdiction), where the natural clearance baseline is $50.8\%$. Under these rigorous anti-leakage constraints, accuracies around $59\%$ with ROC-AUCs of $0.63$ reflect realistic operational boundaries.
2. **Complementary Strengths:**
   - **ID3 Decision Tree** is optimal when maximizing detection of solvable incidents (Recall = $78.29\%$).
   - **Naive Bayes** is optimal when minimizing false investigations (Precision = $60.55\%$).
   - **$k$-NN** provides the most balanced general classification ($59.59\%$ accuracy, $0.5845$ F1).
   - **ANN** demonstrates high capacity on rich, detailed micro-engine records ($98.5\%$ accuracy, $0.9984$ ROC-AUC).
