import os
import sys
from pathlib import Path
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_callout(doc, text, title="NOTE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=160)
    
    # Left border styling
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="1D4ED8"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    
    run_t = p.add_run(f"[{title}] ")
    run_t.bold = True
    run_t.font.name = "Arial"
    run_t.font.size = Pt(9.5)
    run_t.font.color.rgb = RGBColor(29, 78, 216)
    
    run_b = p.add_run(text)
    run_b.font.name = "Arial"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table(table, header_bg="1E3A8A", alt_row_bg="F8FAFC"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        
        for cell in row.cells:
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            
            # borders
            tcPr = cell._tc.get_or_add_tcPr()
            b = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:left w:val="none"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:right w:val="none"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(b)
            
            if is_header:
                set_cell_background(cell, header_bg)
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    for r in p.runs:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
                        r.font.size = Pt(9.5)
                        r.font.name = "Arial"
            else:
                if i % 2 == 1:
                    set_cell_background(cell, alt_row_bg)
                else:
                    set_cell_background(cell, "FFFFFF")
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    for r in p.runs:
                        r.font.size = Pt(9)
                        r.font.name = "Arial"
                        r.font.color.rgb = RGBColor(30, 41, 59)

def main():
    doc = Document()
    
    # Page Setup
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
    
    # Normal Style
    normal = doc.styles['Normal']
    normal.font.name = 'Arial'
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor(30, 41, 59)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.15
    
    # ── COVER / TITLE ──
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(18)
    title_p.paragraph_format.space_after = Pt(4)
    run_t = title_p.add_run("CRIMORA: INTELLIGENT CRIME DETECTIVE PLATFORM")
    run_t.bold = True
    run_t.font.size = Pt(22)
    run_t.font.name = "Arial"
    run_t.font.color.rgb = RGBColor(15, 23, 42)
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Comprehensive Engineering Documentation, Machine Learning Architecture, Feature Functionality, Viva Voce Guide & Technical Compendium")
    run_sub.font.size = Pt(11)
    run_sub.font.name = "Arial"
    run_sub.font.color.rgb = RGBColor(37, 99, 235)
    run_sub.bold = True
    
    # Project Metadata Box
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.columns[0].width = Inches(2.2)
    meta_tbl.columns[1].width = Inches(4.3)
    meta_data = [
        ("Project Title:", "CRIMORA (AI Crime Analytics & Investigative Support System)"),
        ("Authors & Roles:", "Person A: Dhanumithra (Model Training & Deep Learning)\nPerson B: Dharsit (Data Engineering, Analytics & Classical ML)"),
        ("Institutional Course:", "Semester 5 - Machine Learning Project"),
        ("Full Stack Implementation:", "FastAPI (Python) Backend + Next.js 14 (TypeScript) Command Deck"),
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        cell_k, cell_v = meta_tbl.rows[row_idx].cells
        cell_k.text = k
        cell_v.text = v
    format_table(meta_tbl, header_bg="0F172A", alt_row_bg="F1F5F9")
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    add_callout(doc, "CRIMORA is an academic investigative decision-support system designed to assist police detectives, forensic analysts, and crime researchers. It models statistical likelihoods and historical patterns to accelerate evidence triage, connect cold cases, and identify high-risk patrol zones. It does NOT replace legal due process or statutory human investigation.", "DISCLAIMER & PURPOSE")
    
    # ── SECTION 1: ABOUT THE PROJECT ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("1. About the Project")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    h1_r.font.name = "Arial"
    
    p = doc.add_paragraph()
    p.add_run("CRIMORA ").bold = True
    p.add_run("(derived from 'Crime' and 'Aura/Intelligence') is an end-to-end, multi-paradigm Machine Learning platform engineered to empower modern law enforcement agencies with data-driven decision support. It bridges macroscopic jurisdictional crime analytics (such as Tamil Nadu state-wide crime metrics) with microscopic incident-level predictive modeling (case solvability, serial MO matching, and behavioral profiling).")
    
    p = doc.add_paragraph()
    p.add_run("In modern police administration, detectives face massive incident backlogs, overwhelming volumes of case paperwork, and limited investigative manpower during the critical first 48 hours of an offense (the 'Golden Hour'). CRIMORA transforms raw incident databases into actionable tactical intelligence, helping investigators prioritize leads, unmask serial patterns across cold cases, and deploy patrol beats where offenses are statistically concentrated.")
    
    # ── SECTION 2: PROBLEM STATEMENT ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("2. The Problem Statement")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run("Traditional criminal justice systems confront five major computational and operational bottlenecks:")
    
    bullets = [
        ("The Cold Case Silo Problem:", "Law enforcement jurisdictions maintain tens of thousands of unsolved homicide and robbery files. Detectives in District A often remain unaware that a newly reported case shares an identical victim demographic, weapon choice, or Modus Operandi (MO) with an unsolved case in District B."),
        ("Target Data Leakage in Predictive Policing:", "Many existing research models inadvertently use information recorded AFTER an arrest is already made (such as post-arrest suspect identity or case disposition) to predict whether the case will be solved. This creates artificially high, fake accuracy scores that fail completely when tested on newly reported active crime scenes."),
        ("Golden-Hour Evidence Triage Decay:", "Criminological research proves that the likelihood of solving a crime decays sharply after the first 24 to 72 hours. Without automated scoring, field officers lack objective guidance on which forensic leads (CCTV, ballistics, eyewitnesses) provide the highest marginal solvability boost."),
        ("Spatial Inefficiency in Beat Patrols:", "Police patrol allocations often rely on static intuition or outdated police station boundaries, resulting in either over-policing peaceful areas or under-policing rapidly emerging criminal transit corridors."),
        ("Fragmented State-Level Historical Telemetry:", "State agencies (such as the Tamil Nadu Police) record annual cognizable crime figures under the Indian Penal Code (IPC), but these reports sit in static tabular PDFs without interactive comparative analytics or population-adjusted benchmarking."),
    ]
    for b_title, b_desc in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        r1 = bp.add_run(b_title + " ")
        r1.bold = True
        bp.add_run(b_desc)
        
    # ── SECTION 3: THE PROPOSED SOLUTION ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("3. The Proposed Solution")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run("CRIMORA resolves these challenges through a unified, privacy-compliant multi-paradigm Machine Learning architecture:")
    
    sol_points = [
        ("Strict 'Intake-Only' Predictive Framework:", "CRIMORA's solvability models only accept evidentiary features known at the time of initial First Information Report (FIR) filing. It completely excludes post-investigation outcome labels, ensuring genuine real-world validity without data leakage."),
        ("Unsupervised Serial Linkage Engine:", "Leverages K-Means clustering and Ward Agglomerative Hierarchical clustering to group 26,505 cold cases into 5 distinct behavioral/demographic clusters, instantly surfacing cross-jurisdiction MO matches."),
        ("Causal Behavioral Profiling (BBN):", "Implements a Directed Acyclic Graph (DAG) Bayesian Belief Network that infers unknown suspect attributes (likely gender, age group, victim-offender relationship) based purely on physical evidence and circumstance."),
        ("Geographic Profiling via Locally Weighted Regression (LWR):", "Applies geodesic Haversine distance and adaptive kernel density estimation to map incident intensity hotspots across urban centers (e.g. Chennai, Coimbatore, Madurai)."),
        ("Longitudinal Tamil Nadu Crime Intelligence:", "Digitizes and models 10 years (2014-2023) of IPC district data across 38 Tamil Nadu districts with population-normalized crime rate benchmarking."),
    ]
    for st, sd in sol_points:
        sp = doc.add_paragraph(style='List Bullet')
        r1 = sp.add_run(st + " ")
        r1.bold = True
        sp.add_run(sd)
        
    # Architecture Diagram in Text
    p_diag = doc.add_paragraph()
    p_diag.paragraph_format.space_before = Pt(6)
    p_diag.paragraph_format.space_after = Pt(6)
    r_diag = p_diag.add_run(
"""+-----------------------------------------------------------------------------------+
|                           CRIMORA SYSTEM ARCHITECTURE                             |
+-----------------------------------------------------------------------------------+
| 1. DATA INGESTION & LEAKAGE FILTER                                                |
|    - WashPost (52,179 cases) | FBI SHR (929,433 cases) | TN Police (38 Districts) |
|    - PII Stripped | Missing Imputed (Median 28.0) | Strict Target Isolation       |
+-----------------------------------------+-----------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
+-----------------------+   +-----------------------+   +-----------------------+
|  PERSON A TRACK       |   |  PERSON B TRACK       |   |  GEOSPATIAL ENGINE    |
|  - Deep ANN (Keras)   |   |  - ID3 Decision Tree  |   |  - Spatial LWR Kernel |
|  - K-Means (k=5)      |   |  - Gaussian Naive B.  |   |  - Haversine Distance |
|  - Hierarchical (Ward)|   |  - Scaled k-NN (k=15) |   |  - TN Hotspot Ranks   |
|  - Bayesian Net (BBN) |   |  - PCA Decomposition  |   |  - Interactive Leaflet|
+-----------------------+   +-----------------------+   +-----------------------+
        |                               |                               |
        +-------------------------------+-------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|               FASTAPI MICROSERVICES BACKEND (Uvicorn / Python 3.10)               |
|      - REST API Endpoints: /solvability, /clustering, /geographic, /analytics     |
|      - In-Memory Route Cache (60s TTL) | Calibrated Fallback Diagnostics          |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|             NEXT.JS 14 TACTICAL COMMAND DECK (TypeScript + Tailwind CSS)          |
|      - Real-Time Route Prefetching (<50ms) | Top Progress Laser Loader            |
|      - Responsive DEFCON System Status | Recharts Visuals | Dark HUD Glassmorphism|
+-----------------------------------------------------------------------------------+"""
    )
    r_diag.font.name = "Consolas"
    r_diag.font.size = Pt(7.5)
    r_diag.font.color.rgb = RGBColor(15, 23, 42)

    # ── SECTION 4: ABOUT THE MODELS USED ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("4. About the Machine Learning Models Used")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run("What is a Machine Learning Model in Simple English?").bold = True
    p.add_run("\nThink of a Machine Learning model like an experienced police detective who has reviewed 100,000 historical criminal cases. A human being cannot memorize 100,000 case files at once, but a mathematical algorithm can look at all past cases, identify hidden statistical patterns (e.g., 'crimes involving handguns in dark alleys between 1 AM and 4 AM have a specific pattern of solvability'), and use those historical rules to analyze a new, unseen case in milliseconds.")
    
    models_detail = [
        ("1. Artificial Neural Network (ANN) - Deep Learning",
         "What it is in general:", "Inspired by the human brain. It consists of multiple layers of artificial 'neurons' that pass information through weighted connections, allowing the computer to recognize complex, non-linear relationships.",
         "How it works in CRIMORA:", "Built using TensorFlow/Keras with a 4-layer Deep Dense architecture (256 -> 128 -> 64 -> 32 neurons) with Batch Normalization and Dropout layers to prevent overfitting. It outputs a continuous probability score from 0.0 to 1.0 indicating case clearance likelihood.",
         "Analogy:", "A multi-department task force where junior officers inspect individual clues, senior detectives combine those clues into hypotheses, and the police chief makes the final clearance decision."),
        
        ("2. ID3 Decision Tree Classifier",
         "What it is in general:", "A flowchart-like tree structure that repeatedly asks yes/no questions about features to categorize an event.",
         "How it works in CRIMORA:", "Trained using Shannon Entropy and Information Gain. It inspects evidentiary parameters (e.g. Is a weapon recovered? Was an eyewitness present?) to split cases into solved vs. unsolved leaves.",
         "Analogy:", "A standard police intake checklist: 'Did the witness see the vehicle? Yes -> Follow branch A. No -> Follow branch B'."),
        
        ("3. Gaussian Naive Bayes Classifier",
         "What it is in general:", "A fast probabilistic classifier based on Bayes' Theorem that assumes each feature contributes independently to the probability of the outcome.",
         "How it works in CRIMORA:", "Calculates the baseline probability of clearance and updates it by multiplying the likelihood of observing each individual piece of scene evidence.",
         "Analogy:", "A forensic calculator that multiplies independent statistical likelihoods together to produce a conservative clearance estimate."),
        
        ("4. Scaled k-Nearest Neighbors (k-NN)",
         "What it is in general:", "A metric-space classifier that finds the 'k' most similar past records in the dataset and assigns the majority outcome.",
         "How it works in CRIMORA:", "Uses scaled Euclidean distance with k=15 neighbors. When a new incident is submitted, it searches historical case records to find the 15 closest incidents and votes on solvability.",
         "Analogy:", "Asking a veteran archivist: 'Show me the 15 cases in our archives that look most identical to this scene, and tell me whether those 15 cases were solved or unsolved'."),
         
        ("5. K-Means Clustering (Unsupervised Serial Linkage)",
         "What it is in general:", "An unsupervised learning algorithm that groups unlabelled data into 'k' clusters based on geometric closeness to cluster centers (centroids).",
         "How it works in CRIMORA:", "Groups 26,505 unsolved cold cases into k=5 clusters based on standardized victim age, weapon type, and incident traits without needing any human labels.",
         "Analogy:", "Organizing thousands of unsolved paper files on a large table into 5 neat stacks where all files in each stack share common circumstances."),
         
        ("6. Agglomerative Hierarchical Clustering",
         "What it is in general:", "A bottom-up clustering technique that starts with every data point in its own cluster and progressively merges the closest clusters together into a tree-like dendrogram.",
         "How it works in CRIMORA:", "Uses Ward's minimum variance criterion to build a taxonomic tree of cold case cohorts, mathematically validating that the 5 K-Means clusters represent true natural groupings.",
         "Analogy:", "A family tree that shows which criminal MO patterns are closely related 'siblings' and which belong to entirely different 'families'."),
         
        ("7. Principal Component Analysis (PCA)",
         "What it is in general:", "A mathematical technique that simplifies high-dimensional data by rotating the axes into new, uncorrelated directions called Principal Components.",
         "How it works in CRIMORA:", "Evaluated across 71 one-hot encoded incident features. It proved that 95% of crime information requires at least 54 components, demonstrating that crime data is too complex to reduce into a simple 2D plane.",
         "Analogy:", "Taking a 3D sculpture and projecting its shadow on a 2D wall. Sometimes the shadow tells the whole story; in crime analytics, PCA proved you need the full 3D sculpture."),
         
        ("8. Bayesian Belief Network (BBN - Causal Behavioral Profiler)",
         "What it is in general:", "A probabilistic graphical model representing a set of variables and their conditional dependencies via a Directed Acyclic Graph (DAG).",
         "How it works in CRIMORA:", "Models the causal relationships: Weapon + Circumstance -> Offender-Victim Relationship -> Suspect Gender and Age. Uses exact Variable Elimination to infer the hidden suspect profile when only the crime scene evidence is known.",
         "Analogy:", "Sherlock Holmes deductive reasoning: If the weapon was a kitchen knife and the scene was a residential bedroom, the statistical likelihood of an intimate acquaintance jumps from 18% to over 42%."),
         
        ("9. Locally Weighted Regression (LWR - Geospatial Kernel)",
         "What it is in general:", "A non-parametric regression algorithm that does not fit a single global line; instead, it fits a localized model around the exact point being evaluated using distance-decay weights.",
         "How it works in CRIMORA:", "Calculates geodesic Haversine distance between crime points and applies a Gaussian radial basis kernel with Silverman's rule optimal bandwidth (h=0.8574 km) to generate smooth crime density maps.",
         "Analogy:", "Dropping pebbles into a pond. Ripples overlap and create tall waves where multiple pebbles hit close together, highlighting intense crime hotspots."),
    ]
    
    for m_title, m_gen, m_gen_d, m_work, m_work_d, m_an, m_an_d in models_detail:
        h2 = doc.add_heading(level=2)
        h2_r = h2.add_run(m_title)
        h2_r.font.color.rgb = RGBColor(30, 58, 138)
        
        p = doc.add_paragraph()
        p.add_run(m_gen + " ").bold = True
        p.add_run(m_gen_d)
        
        p = doc.add_paragraph()
        p.add_run(m_work + " ").bold = True
        p.add_run(m_work_d)
        
        p = doc.add_paragraph()
        p.add_run(m_an + " ").bold = True
        p.add_run(m_an_d)
        
    # ── SECTION 5: DATASET USED ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("5. Datasets Used & Data Pipeline")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run("CRIMORA integrates four heterogeneous real-world datasets across national, international, and regional jurisdictional levels:")
    
    ds_tbl = doc.add_table(rows=5, cols=4)
    ds_tbl.columns[0].width = Inches(1.8)
    ds_tbl.columns[1].width = Inches(1.1)
    ds_tbl.columns[2].width = Inches(1.8)
    ds_tbl.columns[3].width = Inches(1.8)
    
    ds_rows = [
        ("Dataset Name", "Volume", "Jurisdiction / Scope", "Used For"),
        ("Washington Post Homicide Dataset", "52,179 records", "50 Major US Metropolitan Cities (2007-2017)", "Intake Classical Models (ID3, NB, k-NN), PCA decomposition, LWR spatial analysis"),
        ("FBI Supplementary Homicide Report (SHR)", "929,433 records", "United States National SHR Baseline (1976-2025)", "Deep ANN Solvability Engine (185,887 holdout test set) and BBN Behavioral Profiler"),
        ("Tamil Nadu State Crime Reports", "38 Districts", "Tamil Nadu State Crime Records Bureau (2020-2023)", "Tamil Nadu District IPC Trends, Murder breakdowns, and Leaflet Spatial Density"),
        ("NCRB District IPC Crime Statistics", "Full India", "National Crime Records Bureau (2014 Baseline)", "Longitudinal national IPC baseline & macro comparisons across 36 states/UTs"),
    ]
    for r_idx, row in enumerate(ds_rows):
        for c_idx, val in enumerate(row):
            ds_tbl.rows[r_idx].cells[c_idx].text = val
    format_table(ds_tbl)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    
    p = doc.add_paragraph()
    p.add_run("Columns and Features Used in Model Training:").bold = True
    
    cols_desc = [
        ("victim_age_clean (Continuous Float):", "Normalized victim age with unknown codes (99, 999) replaced by the robust median (28.0 years). Infant age 0 is strictly preserved."),
        ("victim_sex (Categorical String):", "Male, Female, or Unknown. Used in demographic triage and Bayesian causal inference."),
        ("victim_race (Categorical String):", "Demographic categorization normalized across reporting standards."),
        ("reported_year / reported_month / reported_day (Integers):", "Temporal decomposition extracting seasonality and longitudinal macro trends."),
        ("reported_is_weekend (Binary 0/1):", "Indicator flag (Friday night through Sunday) reflecting weekend violent crime surges."),
        ("reported_day_of_week (Integer 0-6):", "Day index representing cyclical weekly patterns."),
        ("city / state (Categorical Strings):", "Jurisdiction identifiers anchoring regional law enforcement operational baselines."),
        ("lat / lon (Geographic Float Coordinates):", "WGS84 spatial coordinates validated against geographic bounding boxes for Haversine distance calculations."),
        ("weapon (Categorical String):", "Handgun, Knife or cutting instrument, Blunt object, Firearm, Personal weapons (hands/feet), etc."),
        ("circumstance (Categorical String):", "Robbery, Lover triangle, Argument, Narcotic drug trade, Burglary, Gang conflict, Undetermined."),
        ("suspect_lead_status (Categorical Intake):", "UNKNOWN_OFFENDER, IDENTIFIED_FLEEING, SUSPECT_NAMED. Represents evidentiary state at initial scene intake."),
    ]
    for c_name, c_expl in cols_desc:
        cp = doc.add_paragraph(style='List Bullet')
        r1 = cp.add_run(c_name + " ")
        r1.bold = True
        cp.add_run(c_expl)
        
    # ── SECTION 6: MODEL TRAINING MATRIX & METRICS ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("6. Model Training Matrix, Scores & Authorship")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph()
    p.add_run("The development of CRIMORA was split between two engineers (Person A and Person B). The table below outlines the exact models, who built them, how they were trained, and their validated benchmark scores:")
    
    m_tbl = doc.add_table(rows=9, cols=6)
    m_tbl.columns[0].width = Inches(1.3)
    m_tbl.columns[1].width = Inches(0.9)
    m_tbl.columns[2].width = Inches(1.2)
    m_tbl.columns[3].width = Inches(1.1)
    m_tbl.columns[4].width = Inches(1.1)
    m_tbl.columns[5].width = Inches(0.9)
    
    matrix_rows = [
        ("Model Name", "Author", "Architecture", "Training Strategy", "Evaluation Metric", "Score"),
        ("Deep Learning Solvability ANN", "Person A (Dhanumithra)", "4-Layer Dense (256-128-64-32) + BatchNorm", "Adam, EarlyStopping, 294 One-Hot Features", "ROC-AUC\nAccuracy", "0.9984\n98.50%"),
        ("ID3 Decision Tree", "Person B (Dharsit)", "Entropy-Partitioned Tree (Max Depth=8)", "5-Fold Stratified Cross-Validation", "Recall\nF1-Score", "78.29%\n0.6520"),
        ("Gaussian Naive Bayes", "Person B (Dharsit)", "Conditional Probability (var_smoothing=1e-9)", "5-Fold Stratified Cross-Validation", "Precision\nROC-AUC", "60.55%\n0.6352"),
        ("Scaled k-NN (k=15)", "Person B (Dharsit)", "Euclidean Metric-Space Voting (k=15)", "5-Fold Stratified Cross-Validation", "Accuracy\nROC-AUC", "59.59%\n0.6312"),
        ("K-Means Serial Linkage", "Person A (Dhanumithra)", "Centroid Partitioning (k=5 Clusters)", "20,000 Unsolved Cold Case Profiles", "Silhouette Score", "0.5369"),
        ("Agglomerative Hierarchical", "Person A (Dhanumithra)", "Ward Minimum Variance Linkage", "Dendrogram verification on cold cases", "Cophenetic Correlation", "0.6840"),
        ("Principal Component Analysis", "Person B (Dharsit)", "Covariance Eigendecomposition", "71-Dimensional One-Hot Matrix", "Cumulative Variance (54 PCs)", "95.00%"),
        ("Bayesian Belief Net (BBN)", "Person A (Dhanumithra)", "Directed Acyclic Graph (DAG) + Var. Elim.", "Conditional probability tables on SHR", "Posterior Accuracy", "88.50%"),
    ]
    for r_idx, row in enumerate(matrix_rows):
        for c_idx, val in enumerate(row):
            m_tbl.rows[r_idx].cells[c_idx].text = val
    format_table(m_tbl)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    
    add_callout(doc, "Why do classical models have ~60% accuracy while the Deep ANN has 98.5%? Classical models (ID3, Naive Bayes, k-NN) are evaluated strictly on pre-investigation initial intake features (natural class balance is 50.8% solved / 49.2% unsolved). A score of 60% with 78.3% recall is realistic and leak-free. The Deep ANN is trained on multi-attribute evidentiary matrices with 294 features including recovered weapons and forensic profiles, achieving enterprise-grade 98.5% accuracy.", "IMPORTANT VIVA INSIGHT: THE DUAL-BENCHMARK DESIGN")

    # ── SECTION 7: FUNCTIONALITY OF EACH FEATURE ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("7. Functionality of Platform Features")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    features = [
        ("Feature 1: Executive Overview & Command Status Deck (Route: '/')",
         "Presents high-level macroscopic KPIs: Total records analyzed (106,037), Unsolved cold case dossiers (26,505), Statewide clearance rate (75.0%), and Active Tamil Nadu districts (38). Includes an interactive DEFCON Operational Posture widget (DEFCON 4 Normal Beat to DEFCON 1 Critical Saturation) and live PCA variance decomposition charts."),
        
        ("Feature 2: Case Solvability & Triage Priority Engine (Route: '/solvability')",
         "Enables investigating officers to input crime scene parameters (victim demographics, weapon recovered, forensic DNA/fingerprints present, CCTV footage captured, eyewitness availability, location). Instantly outputs the clearance probability, assigned priority tier (Tier 1 Golden Hour Critical to Tier 4 Archive Review), and tactical directives for first responders."),
         
        ("Feature 3: Serial Pattern Linkage & MO Matcher (Route: '/clustering')",
         "Allows detectives to cross-reference newly reported cases against 26,505 unsolved cold cases. The algorithm assigns the case to one of 5 distinct Modus Operandi clusters (e.g. 'Youth Street Interaction', 'Elder Vulnerability', 'Domestic Conflict') and displays top analogous historical dossiers with matching similarity scores."),
         
        ("Feature 4: Geographic Profiling & Spatial Hotspots (Route: '/geographic')",
         "Renders an interactive high-tech Dark Matter Leaflet map over Tamil Nadu. Uses Locally Weighted Regression (LWR) to display continuous density heatmaps, tactical sector beacons (Chennai, Madurai, Coimbatore, Salem, Tiruchirappalli), and automated patrol recommendations for high-risk zones."),
         
        ("Feature 5: Behavioral Profiler & Suspect Inference (Route: '/profiling')",
         "Uses the Bayesian Belief Network (BBN) to infer unknown suspect profiles. When detectives only know crime scene evidence (e.g. Weapon: Knife; Circumstance: Lover triangle; Victim: 28-year-old female), the BBN deduces the statistical likelihood of suspect gender (85% Male), age bracket (20-29), and relationship (42% Intimate Partner / Acquaintance)."),
         
        ("Feature 6: Tamil Nadu Regional Crime Analytics (Route: '/analytics')",
         "An interactive longitudinal database covering 10 years (2014-2023) of IPC cognizable crimes across all 38 districts of Tamil Nadu. Features an interactive area trend chart, head-to-head district comparison tool (e.g., Chennai vs. Madurai), and a searchable district league table with population-normalized crime rates."),
         
        ("Feature 7: System Governance & Model Integrity Registry (Route: '/models')",
         "Displays the active health, architecture, parameters, and benchmark scores of all 8 machine learning models. Provides real-time operational status, diagnostic uptime telemetry, and transparency logs for algorithmic accountability."),
    ]
    for f_title, f_desc in features:
        h2 = doc.add_heading(level=2)
        h2_r = h2.add_run(f_title)
        h2_r.font.color.rgb = RGBColor(30, 58, 138)
        p = doc.add_paragraph()
        p.add_run(f_desc)
        
    # ── SECTION 8: REAL-WORLD APPLICATIONS ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("8. Real-World Applications")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    apps = [
        ("Police Control Rooms & Command Centers:", "Supervisors use the Executive Overview and DEFCON posture widget to dynamically allocate patrol vehicles and tactical units during city-wide emergency situations."),
        ("Station House Officers (SHOs) & First Responders:", "When an FIR is lodged, officers input initial scene facts into the Solvability Engine to identify whether the case has a high golden-hour clearance probability and which forensic steps (CCTV review, ANPR checks) must be executed immediately."),
        ("State Crime Records Bureau (SCRB) & CID:", "Detectives investigating long-dormant cold cases use the Serial Pattern Linkage module to identify cross-district serial offenders who strike across multiple jurisdictions."),
        ("Strategic Police Patrol Planning:", "City police commissioners use the Geographic Profiling LWR heatmaps to position evening checkpoints and high-visibility mobile beats precisely where predicted criminal density is highest."),
    ]
    for at, ad in apps:
        ap = doc.add_paragraph(style='List Bullet')
        r1 = ap.add_run(at + " ")
        r1.bold = True
        ap.add_run(ad)
        
    # ── SECTION 9: FUTURE ENHANCEMENTS ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("9. Future Enhancements & Scalability")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    enhancements = [
        ("Multimodal Large Language Model (LLM) Integration:", "Directly parse unstructured handwritten or scanned FIR documents using Vision-Language Models (e.g. Gemini 1.5 Pro) to auto-extract structured parameters without manual form filling."),
        ("Real-Time Automated Number Plate Recognition (ANPR) Feeds:", "Integrate live highway ANPR and municipal CCTV feeds to flag vehicles associated with high-priority serial clusters in real time."),
        ("Ballistics & Forensic Multi-Modal Embedding:", "Expand the Cold Case Linkage engine to include vectorized ballistics striation images and latent fingerprint vector embeddings using Contrastive Representation Learning (CLIP)."),
        ("Mobile Offline Tactical Deployment:", "Package the decision-support engine into a lightweight Progressive Web App (PWA) with ONNX Runtime for offline use by field beat constables in remote rural stations."),
    ]
    for et, ed in enhancements:
        ep = doc.add_paragraph(style='List Bullet')
        r1 = ep.add_run(et + " ")
        r1.bold = True
        ep.add_run(ed)

    # ── SECTION 10: TECHNOLOGY STACK ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("10. Complete Technology Stack")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    tech_tbl = doc.add_table(rows=7, cols=3)
    tech_tbl.columns[0].width = Inches(1.8)
    tech_tbl.columns[1].width = Inches(2.3)
    tech_tbl.columns[2].width = Inches(2.4)
    
    t_rows = [
        ("Layer / Domain", "Technologies & Libraries", "Purpose & Role"),
        ("Frontend Client", "Next.js 14 (App Router), TypeScript, React, Tailwind CSS", "Dark HUD command deck, client-side caching, sub-50ms route switching, instant top progress loader"),
        ("Data Visualization", "Recharts, Lucide React, Leaflet, React-Leaflet", "Interactive area charts, radar widgets, high-contrast dark spatial map canvas"),
        ("Backend Web Server", "FastAPI, Uvicorn, Pydantic v2, Python 3.10+", "High-concurrency asynchronous REST API, request schema validation, in-memory caching"),
        ("Machine Learning", "Scikit-learn, SciPy, NumPy, Pandas, Joblib", "Classical classifiers (ID3, NB, k-NN), K-Means, Hierarchical clustering, PCA decomposition"),
        ("Deep Learning", "TensorFlow 2.x, Keras", "4-layer Deep Neural Network Clearance Engine (Batch Normalization, Dropout)"),
        ("Probabilistic Inference", "Pgmpy (Probabilistic Graphical Models)", "Bayesian Belief Network (BBN) DAG & exact Variable Elimination reasoning"),
    ]
    for r_idx, row in enumerate(t_rows):
        for c_idx, val in enumerate(row):
            tech_tbl.rows[r_idx].cells[c_idx].text = val
    format_table(tech_tbl)
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ── SECTION 11: VIVA VOCE QUESTIONS & ANSWERS ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("11. Comprehensive Viva Voce Questions & Answers")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    viva_qa = [
        ("Q1: What is CRIMORA and what is its primary objective?",
         "Answer: CRIMORA is an academic investigative decision-support platform designed to assist police detectives and crime analysts. It uses machine learning to predict case solvability from initial crime scene parameters, link unsolved cold cases using unsupervised clustering, infer unknown suspect traits via Bayesian causal modeling, and map spatial crime density using locally weighted regression."),
         
        ("Q2: What is 'Target Data Leakage' and how did you prevent it?",
         "Answer: Target data leakage occurs when a model is trained using features that would only be known after the target event has occurred. In crime prediction, using 'arrest date', 'suspect name', or 'case disposition' to predict solvability creates artificially high accuracy (near 100%) that fails in reality. We prevented this by strictly enforcing an 'Intake-Only' feature matrix, selecting only variables recorded at the time of initial FIR lodging."),
         
        ("Q3: Why do the classical models (ID3, Naive Bayes, k-NN) have ~60% accuracy while the Deep ANN has 98.5%?",
         "Answer: This dual benchmark is intentional: Classical models were trained strictly on minimal intake features (victim age, sex, race, location, date) where the natural baseline split is 50.8% solved / 49.2% unsolved. Achieving 60% accuracy with 78.3% recall is a realistic, leak-free intake screening result. The Deep ANN was trained on the extensive FBI SHR dataset with 294 one-hot features including specific weapon mechanics and circumstances, achieving an enterprise-grade 98.5% accuracy."),
         
        ("Q4: What is the significance of the 78.29% Recall score in the ID3 Decision Tree?",
         "Answer: In criminal investigation, Recall measures the proportion of truly solvable cases correctly flagged by the system. A high Recall (78.29%) means very few solvable cases are missed or prematurely closed. In policing, a False Negative (giving up on a solvable case) is far worse than a False Positive (investigating a difficult case)."),
         
        ("Q5: How does the Bayesian Belief Network (BBN) work in your project?",
         "Answer: The BBN is a Directed Acyclic Graph (DAG) that models causal dependencies between crime scene evidence and latent suspect demographics: P(Relationship | Weapon, Circumstance). When an investigator inputs observable facts (e.g., Weapon: Knife; Circumstance: Lover triangle), the algorithm uses exact Variable Elimination to calculate the posterior probability of the suspect's gender, age group, and relationship to the victim."),
         
        ("Q6: How does the K-Means clustering algorithm link cold cases?",
         "Answer: K-Means partitions 26,505 unsolved cold cases into 5 distinct behavioral clusters in metric space. When a new unsolved case occurs, its feature vector is mapped to the nearest cluster centroid. The system then queries all historical cold cases belonging to that cluster, ranking them by similarity score to reveal potential serial crime sprees."),
         
        ("Q7: What is the Silhouette Score and what does your score of 0.5369 mean?",
         "Answer: The Silhouette Score measures how similar a data point is to its own cluster compared to other clusters, ranging from -1 to +1. A score of 0.5369 indicates strong, robust cluster separation, proving that the 5 Modus Operandi clusters represent distinct criminological cohorts rather than random groupings."),
         
        ("Q8: Why did you use Locally Weighted Regression (LWR) instead of standard linear regression for geographic profiling?",
         "Answer: Standard linear regression assumes a global linear trend across the entire map, which is unrealistic for crime. Crime clusters in non-linear, localized geographic pockets. LWR is a non-parametric method that fits localized models using distance-decay kernel weights (Haversine formula), allowing the system to identify tight, realistic neighborhood hotspots."),
         
        ("Q9: What was the finding from your Principal Component Analysis (PCA)?",
         "Answer: PCA was conducted on 71 one-hot encoded features. It revealed that reaching the 95% cumulative explained variance threshold required 54 principal components. This proved that crime incident data has high intrinsic dimensionality and cannot be compressed into 2 or 3 linear components without losing crucial investigative information."),
         
        ("Q10: What is the role of FastAPI and Next.js in your system architecture?",
         "Answer: FastAPI serves as the high-performance asynchronous Python backend that hosts and runs the machine learning models. Next.js 14 serves as the modern client-side tactical command deck, utilizing server component prefetching, interactive Leaflet maps, and an instant laser progress bar to deliver sub-50ms page transitions."),
         
        ("Q11: How did you handle missing values in victim age?",
         "Answer: We inspected the distribution and found text codes such as 'Unknown', 99, and 999. We replaced these with the median age of 28.0 years. We strictly avoided imputing missing values with 0, because an age of 0 represents infant victims, which is a critical criminological category that must not be corrupted."),
         
        ("Q12: What distance metric was used for geographic profiling and why?",
         "Answer: We used the spherical Haversine formula over WGS84 geographic coordinates (latitude and longitude) with Earth radius R = 6,371.0 km. Euclidean distance is inaccurate for geographic coordinates because lines of longitude converge at the poles."),
         
        ("Q13: What loss function and optimizer were used to train the Deep ANN?",
         "Answer: The model was trained using the Binary Cross-Entropy loss function (since clearance is a binary 0/1 classification) and the Adam optimizer (learning rate = 0.001) with ReduceLROnPlateau and EarlyStopping callbacks to prevent overfitting."),
         
        ("Q14: What is the difference between Person A and Person B deliverables?",
         "Answer: Person A (Dhanumithra) focused on Model Training & Deep Learning: the 4-layer Keras ANN Solvability Engine, the Bayesian Belief Network causal profiler, and K-Means/Hierarchical unsupervised cold case clustering. Person B (Dharsit) focused on Data Engineering & Classical ML: PII scrubbing, leakage prevention, PCA decomposition, LWR spatial regression, ID3/Naive Bayes/k-NN classifiers, and Tamil Nadu longitudinal analytics."),
         
        ("Q15: How can this system be applied directly by the Tamil Nadu Police?",
         "Answer: Tamil Nadu district police stations can use the Longitudinal Analytics and LWR Geographic modules to track local IPC crime surges, benchmark district clearance rates against the statewide average, and optimize evening beat patrols across critical sectors like Chennai Central, Madurai South, and Coimbatore Industrial corridors."),
    ]
    
    for q, a in viva_qa:
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        qp = doc.add_paragraph()
        qr = qp.add_run(q)
        qr.bold = True
        qr.font.color.rgb = RGBColor(15, 23, 42)
        
        ap = doc.add_paragraph()
        ap.add_run(a)
        
    # ── SECTION 12: GLOSSARY OF TERMS ──
    h1 = doc.add_heading(level=1)
    h1_r = h1.add_run("12. Glossary of Technical Terms (Simple Explanations)")
    h1_r.font.color.rgb = RGBColor(15, 23, 42)
    
    terms = [
        ("Accuracy:", "The percentage of total predictions that the model got right (both solved and unsolved)."),
        ("Precision:", "Out of all cases the model flagged as 'Solvable', how many were ACTUALLY solved. High precision means very few false alarms."),
        ("Recall (Sensitivity):", "Out of all truly solved cases, how many did the model correctly identify. High recall means the model misses almost no solvable cases."),
        ("F1-Score:", "The harmonic balance between Precision and Recall. It is especially useful when the dataset has an uneven balance of classes."),
        ("ROC-AUC:", "Receiver Operating Characteristic - Area Under Curve. A score from 0.5 (random guessing) to 1.0 (perfect prediction) measuring how well the model separates solved cases from unsolved cases."),
        ("Silhouette Score:", "A metric from -1 to +1 measuring how distinct and compact clusters are in unsupervised learning. A score above 0.5 indicates solid, well-separated clusters."),
        ("Target Data Leakage:", "A machine learning flaw where the model is accidentally trained using future information that wouldn't be available at the time of prediction."),
        ("One-Hot Encoding:", "Converting categorical words (like 'Handgun', 'Knife') into binary columns of 1s and 0s so mathematical algorithms can process them."),
        ("Directed Acyclic Graph (DAG):", "A network of connected variables with directional arrows that never form a closed loop; used in Bayesian Networks to represent causal flow."),
        ("Centroid:", "The mathematical center point of a cluster in multi-dimensional space."),
        ("Batch Normalization:", "A deep learning technique that normalizes the inputs of each layer to stabilize and accelerate training."),
        ("Dropout:", "Randomly turning off a fraction of neurons during training to prevent the network from memorizing the data (prevents overfitting)."),
        ("Haversine Distance:", "The exact curved-surface distance between two latitude and longitude points on Earth."),
        ("Silverman's Rule:", "A statistical formula used to calculate the ideal smoothing bandwidth (h) for kernel density estimation so heatmaps are neither too blurry nor too noisy."),
    ]
    for term, definition in terms:
        tp = doc.add_paragraph(style='List Bullet')
        r1 = tp.add_run(term + " ")
        r1.bold = True
        tp.add_run(definition)
        
    # Save the document
    output_dir = Path("d:/SEM_5/ML/PROJECT/CRIMORA/crimora/docs")
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "CRIMORA_Comprehensive_Project_Documentation.docx"
    doc.save(str(out_path))
    
    # Also save a copy at root for immediate convenience
    root_copy = Path("d:/SEM_5/ML/PROJECT/CRIMORA/crimora/CRIMORA_Documentation.docx")
    doc.save(str(root_copy))
    print(f"Documentation saved successfully to:\n1. {out_path}\n2. {root_copy}")

if __name__ == "__main__":
    main()
