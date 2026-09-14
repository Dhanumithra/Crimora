# Person B — Preliminary Feature Dictionary

**Project:** Intelligent Crime Detective Platform  
**Phase:** Day 2 — Dataset Cleaning & Feature Engineering  
**Role:** Person B (Data Engineering, Geospatial Profiling, Classification Models)  

---

## Overview

This feature dictionary documents the structural schema, semantic definition, data quality characteristics, and downstream machine learning utility of attributes discovered across the raw and cleaned datasets. 

Features are classified into one of the following standardized categories:
- **`identifier`**: Unique administrative record tracking keys.
- **`target`**: Ground-truth case outcomes or dependent variables (STRICTLY ISOLATED TO PREVENT TARGET LEAKAGE).
- **`numerical`**: Quantitative counts, rates, ages, or percentages.
- **`categorical`**: Nominal or ordinal discrete groupings.
- **`geographic`**: Spatial coordinates (latitude/longitude) or administrative territorial units (districts, cities, states).
- **`temporal`**: Dates, years, months, or day-of-week indicators.
- **`administrative`**: Summary flags or reporting metadata.
- **`unsuitable for modeling`**: Personally identifying information (PII) or high-cardinality noise.

---

## 1. Homicide Incidents Dataset (`homicide-data.csv` / `homicide_clean.csv`)

| Dataset | Column | Original Datatype | Meaning | Feature Type | Missing % | Potential ML Usage | Transformation Performed / Planned | Notes & Warnings |
|---|---|---|---|---|---|---|---|---|
| `homicide-data.csv` | `uid` | `str` | Unique case tracking identifier | `identifier` | 0.00% | Primary key for dataset indexing and audit trail | Preserved as unique ID | Not a feature. Do not supply to models. |
| `homicide-data.csv` | `reported_date` | `int64` | Date homicide was reported (YYYYMMDD) | `temporal` | 0.00% | Seasonality, longitudinal trend analysis, time-to-arrest | Converted to `reported_date_clean` (`datetime64`). 2 malformed dates (`201511018`, `201511105`) safely coerced to `NaT`. | Calendar components extracted (`year`, `month`, `day`, `day_of_week`, `is_weekend`). |
| `homicide-data.csv` | `victim_last` | `str` | Victim surname | `unsuitable for modeling` | 0.002% (1 row) | None | Whitespace stripped. Excluded from all ML pipelines. | **PII Protection**: Must not be used as a predictive feature. |
| `homicide-data.csv` | `victim_first` | `str` | Victim given name | `unsuitable for modeling` | 0.00% | None | Whitespace stripped. Excluded from all ML pipelines. | **PII Protection**: Must not be used as a predictive feature. |
| `homicide-data.csv` | `victim_race` | `str` | Reported racial classification of victim | `categorical` | 0.00% | Demographic feature for exploratory subgroup parity analysis | Categories stripped and title-cased (`Black`, `Hispanic`, `White`, `Unknown`, `Other`, `Asian`). | High frequency of `Unknown` preserved as distinct category. |
| `homicide-data.csv` | `victim_age` | `str` | Age of homicide victim | `numerical` | 0.00% (raw) | Predictor for case solvability models (ID3, Naive Bayes, k-NN) | Coerced to numeric `victim_age_clean` (`float64`). 2,999 `"Unknown"` strings converted to `NaN`. | **Vital Rule**: Infant age 0 is preserved as valid numerical 0. `NaN` must NOT be imputed with 0. |
| `homicide-data.csv` | `victim_sex` | `str` | Biological sex of victim | `categorical` | 0.00% | Solvability predictor, behavioral pattern profiling | Categories stripped (`Male`, `Female`, `Unknown`). | `Unknown` preserved as analytical category. |
| `homicide-data.csv` | `city` | `str` | Municipal jurisdiction of incident | `geographic` | 0.00% | Macro-spatial grouping, fixed-effect stratification | Whitespace stripped. 50 metropolitan cities across the United States. | Spatial clustering and comparative analysis. |
| `homicide-data.csv` | `state` | `str` | US State code | `geographic` | 0.00% | State-level jurisdictional grouping | Whitespace stripped (28 states represented). | Administrative aggregation. |
| `homicide-data.csv` | `lat` | `float64` | Incident latitude coordinate | `geographic` | 0.11% (60 rows) | Spatial density estimation, Locally Weighted Regression (LWR), Folium GIS maps | Validated within $[-90, 90]$. Flagged via `valid_coords`. Filtered in `homicide_spatial_clean.csv`. | **Vital Rule**: Missing coordinates are NOT filled with 0. Spatial models use strictly valid points. |
| `homicide-data.csv` | `lon` | `float64` | Incident longitude coordinate | `geographic` | 0.11% (60 rows) | Spatial density estimation, Locally Weighted Regression (LWR), Folium GIS maps | Validated within $[-180, 180]$. Flagged via `valid_coords`. Filtered in `homicide_spatial_clean.csv`. | **Vital Rule**: Missing coordinates are NOT filled with 0. |
| `homicide-data.csv` | `disposition` | `str` | Final reported legal clearance status | `target` | 0.00% | Ground-truth target for case clearance classification | Preserved raw categories: `Closed by arrest`, `Open/No arrest`, `Closed without arrest`. | **TARGET ONLY**. Ground-truth label. |
| `homicide_clean.csv` | `is_solved` | `int64` | Binary solvability indicator ($1=$ Closed by arrest, $0=$ Unsolved/Closed w/o arrest) | `target` | 0.00% | Ground-truth dependent variable ($y$) for Day 4 ID3 and Naive Bayes models | Derived strictly from `disposition`. | **CRITICAL TARGET LEAKAGE WARNING**: Under no circumstances may `is_solved` or `disposition` be used as input features ($X$). |
| `homicide_clean.csv` | `valid_coords` | `bool` | Flag indicating valid, physical non-null coordinates | `administrative` | 0.00% | Spatial filter mask for GIS and LWR pipelines | Derived from bounding box sanity check. | 52,119 records valid; 60 records missing coordinates. |

---

## 2. Tamil Nadu Longitudinal Totals (`TN-2020-2022-total.csv` / `tn_crime_total_2020_2022_clean.csv`)

| Dataset | Column | Original Datatype | Meaning | Feature Type | Missing % | Potential ML Usage | Transformation Performed / Planned | Notes & Warnings |
|---|---|---|---|---|---|---|---|---|
| `TN-2020-2022-total.csv` | `Districts` / `district` | `str` | Tamil Nadu police district or city commission | `geographic` | 0.00% | District-level profiling and geographic mapping | Stripped, mapped via `standardize_tamil_nadu_districts` to harmonize spelling variations. | Includes standard districts plus commissionerates and specialized units. |
| `TN-2020-2022-total.csv` | `2020` / `crime_count_2020` | `str` | Total cognizable crimes recorded in 2020 | `numerical` | 4.00% (2 rows) | Time-series trend analysis, district ranking | Coerced to `float64`. `"N/C"` (Not Created) in Avadi and Tambaram mapped to `NaN`. | Jurisdictions established in 2021/2022 lacked separate 2020 figures. |
| `TN-2020-2022-total.csv` | `2021` / `crime_count_2021` | `str` | Total cognizable crimes recorded in 2021 | `numerical` | 4.00% (2 rows) | Time-series trend analysis, multi-year rate of change | Coerced to `float64`. `"N/C"` in Avadi and Tambaram mapped to `NaN`. | Missingness is structurally meaningful. |
| `TN-2020-2022-total.csv` | `2022` / `crime_count_2022` | `int64` | Total cognizable crimes recorded in 2022 | `numerical` | 0.00% | Cross-sectional crime intensity feature | Preserved as integer count. | Baseline year for spatial mapping. |
| `TN-2020-2022-total.csv` | `Share in percentage (2022)` | `float64` | Percentage contribution to total state crime | `numerical` | 0.00% | District proportion metric | Preserved as float percentage. | Proportional weight. |
| `TN-2020-2022-total.csv` | `Projected population (lakhs)` | `float64` | Projected census population in 100,000s | `numerical` | 0.00% | Denominator for per-capita rate calculations | Specialized units (Cyber, Railways) have 0.0 population. | Non-residential units must be handled when computing rates. |
| `TN-2020-2022-total.csv` | `Rate of Cognizable crime (IPC+SLL)` | `float64` | Crime rate per 100,000 population in 2022 | `numerical` | 0.00% | Comparative regional safety metric | Preserved as float. | Official state-reported rate. |
| `tn_crime_total_2020_2022_clean.csv` | `is_total_row` | `bool` | Flag for state-level aggregate row | `administrative` | 0.00% | Filter to prevent double-counting when aggregating | Set to `True` for row `TOTAL DISTRICT(S)`. | Must be filtered out during district-level statistical modeling. |

---

## 3. Tamil Nadu Murder & Homicide 2023 (`TN-murder-2023.csv` / `tn_murder_2023_clean.csv`)

| Dataset | Column | Original Datatype | Meaning | Feature Type | Missing % | Potential ML Usage | Transformation Performed / Planned | Notes & Warnings |
|---|---|---|---|---|---|---|---|---|
| `TN-murder-2023.csv` | `Sl No` / `sl_no` | `float64` | Serial sequence number | `identifier` | 1.96% (1 row) | Display numbering | Preserved; `NaN` on the `TOTAL DISTRICT(S)` row. | Exclude from modeling. |
| `TN-murder-2023.csv` | `Districts/City` / `district` | `str` | Police district or city jurisdiction | `geographic` | 0.00% | Spatial unit for Folium chloropleth mapping | Standardized using `standardize_tamil_nadu_districts`. | Standardized district names. |
| `TN-murder-2023.csv` | `Murder - Incidence` | `int64` | Number of reported murder cases in 2023 | `numerical` | 0.00% | Primary violent crime intensity feature | Cleaned as integer. | District-level count. |
| `TN-murder-2023.csv` | `Murder - Victims` | `int64` | Total count of murder victims in 2023 | `numerical` | 0.00% | Severity indicator (multi-victim incidents) | Cleaned as integer. | Ratio of victims to incidents indicates mass/multi-casualty events. |
| `TN-murder-2023.csv` | `Murder - Rate` | `str` | Murder rate per lakh population | `numerical` | 7.84% (4 rows) | Relative violent crime risk index | Coerced to `float64`. Hyphens (`"-"`) in Railway and Cyber units mapped to `NaN`. | Non-residential units have undefined rates per capita. |
| `TN-murder-2023.csv` | `Culpable homicide - Incidence` | `int64` | Cases of culpable homicide not amounting to murder | `numerical` | 0.00% | Violent crime feature | Preserved as integer count. | Secondary violent category. |
| `TN-murder-2023.csv` | `Culpable Homicide - Victims` | `int64` | Victims of culpable homicide | `numerical` | 0.00% | Severity metric | Preserved as integer count. | Victim counts. |
| `TN-murder-2023.csv` | `Culpable Homicides - Rate` | `str` | Culpable homicide rate per lakh population | `numerical` | 7.84% (4 rows) | Violent crime rate | Coerced to `float64`. Hyphens (`"-"`) mapped to `NaN`. | Missingness reflects lack of territorial population base. |
| `TN-murder-2023.csv` | `Causing Death by Negligence - Incidence` | `int64` | Negligent death cases (e.g. vehicular accidents) | `numerical` | 0.00% | Unintentional fatality metric | Preserved as integer count. | Reflects traffic/industrial safety. |
| `TN-murder-2023.csv` | `Causing Death by Negligence - Victims` | `int64` | Victims of negligent deaths | `numerical` | 0.00% | Unintentional fatality severity | Preserved as integer count. | High incidence in highway corridors. |
| `TN-murder-2023.csv` | `Causing Death by Negligence - Rate` | `float64` | Rate of negligent death per lakh | `numerical` | 7.84% (4 rows) | Accidental fatality risk rate | Preserved as `float64`. | Missing in 4 specialized units. |
| `tn_murder_2023_clean.csv` | `is_total_row` | `bool` | Flag for state total summary row | `administrative` | 0.00% | Aggregation guard | Set to `True` for row `TOTAL DISTRICT(S)`. | Exclude from district models. |

---

## 4. NCRB National District IPC Crime Dataset (`dstrIPC_1_2014.csv` / `dstr_ipc_2014_clean.csv`)

| Dataset | Column | Original Datatype | Meaning | Feature Type | Missing % | Potential ML Usage | Transformation Performed / Planned | Notes & Warnings |
|---|---|---|---|---|---|---|---|---|
| `dstrIPC_1_2014.csv` | `States/UTs` | `str` | State or Union Territory name | `geographic` | 0.00% | State-level clustering, comparative grouping | Whitespace trimmed (36 unique states/UTs). | Administrative grouping. |
| `dstrIPC_1_2014.csv` | `District` | `str` | District name or 'Total' summary marker | `geographic` | 0.00% | District-level crime profiling | Whitespace trimmed (838 rows total). | Contains 36 rows where `District == 'Total'`. |
| `dstrIPC_1_2014.csv` | `Year` | `int64` | Reporting calendar year (2014) | `temporal` | 0.00% | Temporal baseline | Constant across all rows ($2014$). | Preserved for multi-year linkage. |
| `dstrIPC_1_2014.csv` | 88 Crime IPC Categories | `int64` | Recorded counts across IPC offenses (Murder, Rape, Theft, Riots, Cheating, etc.) | `numerical` | 0.00% | Feature matrix for PCA dimensionality reduction, crime pattern profiling, and unsupervised clustering | Verified: zero nulls, zero negative counts. Whitespace stripped from column headers. | High dimensional multi-attribute matrix ideal for PCA. |
| `dstr_ipc_2014_clean.csv` | `is_total_row` | `bool` | Flag for state-level 'Total' summary rows | `administrative` | 0.00% | Partitioning mask | Set to `True` for 36 state aggregate rows. | **Crucial**: Summing without filtering `is_total_row` doubles all statistics. |

---

## 5. Summary of Target Leakage Safeguards

1. **`disposition` & `is_solved`**:
   - `is_solved` is strictly an outcome variable indicating whether the investigation successfully identified and arrested a suspect.
   - Any feature engineered from `disposition` (e.g. arrest flags, clearance time derived from arrest date) will cause 100% target leakage if supplied to a model predicting solvability.
   - Solvability models must strictly utilize incident-time attributes: location (`city`, `state`, coordinates), timing (`reported_month`, `day_of_week`), and victim demographics (`victim_age_clean`, `victim_sex`, `victim_race`).
