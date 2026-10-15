# CRIMORA Production Web Stack Guide
**Decoupled Architecture: Next.js 14 + FastAPI + Leaflet + Shadcn UI**

---

## 1. Architecture Overview

CRIMORA has been completely overhauled from the monolithic Streamlit prototype into a decoupled, high-performance, dark-theme web application designed for police detectives and crime analysts.

```text
crimora/
├── backend/                  # Python 3.10+ FastAPI Async Inference Engine
│   ├── app/
│   │   ├── api/v1/endpoints/ # 6 Core Module Endpoints
│   │   ├── core/             # Security, CORS, and Path Config
│   │   ├── models/           # Pydantic V2 Validation Schemas
│   │   └── services/         # ML Loader, LWR Engine, Pre-trained weights
│   ├── artifacts/            # Keras ANN, Scalers, BBN, Joblib Models
│   ├── data/                 # 26,505 Clustered Cold Cases & Tamil Nadu Data
│   ├── Dockerfile            # Container deployment for Render / Hugging Face
│   ├── render.yaml           # One-click Render Free Web Service config
│   ├── requirements.txt      # FastAPI, TensorFlow, Scikit-learn, pgmpy
│   ├── main.py               # Local runner
│   └── test_endpoints.py     # Endpoint verification test suite (12/12 passing)
│
└── frontend/                 # Next.js 14 App Router, TypeScript, Tailwind CSS
    ├── src/
    │   ├── app/              # Routes: /, /solvability, /clustering, /geographic,
    │   │                     #         /profiling, /analytics, /models
    │   ├── components/       # Shadcn UI primitives, Leaflet Maps, Glassmorphic Nav
    │   ├── lib/              # api_client.ts (with resilient offline fallbacks)
    │   └── types/            # api.ts (TypeScript interface contracts)
    ├── vercel.json           # Vercel Zero-Config & API rewrite proxy
    ├── tailwind.config.js    # Slate/Zinc dark aesthetic with cyan/emerald glows
    └── package.json          # Next.js 14, Recharts, Leaflet, Lucide React
```

---

## 2. Core Functional Modules

| Module | Description | Backend Service / Model | Frontend Route |
| :--- | :--- | :--- | :--- |
| **01. Executive Overview** | System status, live model registry, KPIs, PCA variance | `overview.py` (`ml_loader`) | `/` |
| **02. Serial Case Linkage** | K-Means & Hierarchical clustering over 26,505 cold cases | `clustering.py` (`kmeans_serial.pkl`) | `/clustering` |
| **03. Geographic Profiling** | 50×50 spatial grid, Locally Weighted Regression (LWR) | `geographic.py` (`lwr_engine.py`) | `/geographic` |
| **04. Behavioral Profiling** | Discrete Bayesian Belief Network demographic posteriors | `profiling.py` (`bbn_profile.pkl`) | `/profiling` |
| **05. Solvability Engine** | Multi-model clearance triage (ANN, ID3 Tree, Naive Bayes, k-NN) | `solvability.py` (`solvability_ann.keras`) | `/solvability` |
| **06. Regional Analytics** | Tamil Nadu longitudinal IPC crime statistics (2014-2023) | `analytics.py` (Longitudinal IPC) | `/analytics` |

---

## 3. Local Development Quickstart

### Step A: Start the FastAPI Backend (Port 8000)
```powershell
cd d:\SEM_5\ML\PROJECT\CRIMORA\crimora\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger OpenAPI Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Step B: Start the Next.js Frontend (Port 3000)
```powershell
cd d:\SEM_5\ML\PROJECT\CRIMORA\crimora\frontend
npm run dev
```
- Open browser at `http://localhost:3000`
- Use `Cmd + K` or `Ctrl + K` anywhere in the app to open the Command Palette.

---

## 4. 100% Free-Tier Deployment Strategy

| Tier | Provider | Deployment Steps |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | 1. Import repository on [Vercel](https://vercel.com).<br>2. Set Root Directory to `frontend`.<br>3. Set `NEXT_PUBLIC_API_BASE_URL` to your production backend URL.<br>4. Deploy with zero configuration. |
| **Backend API** | **Render** or **Hugging Face Spaces** | 1. Create a free Web Service on [Render](https://render.com).<br>2. Connect repo and point to `backend/render.yaml` or use the provided `backend/Dockerfile`.<br>3. Free 512MB RAM comfortably executes Scikit-learn, TensorFlow CPU, and pgmpy. |
| **Spatial Database** | **Supabase** or **Neon** | 1. Create a free 500MB PostgreSQL project on Supabase or Neon.<br>2. Enable PostGIS extension: `CREATE EXTENSION postgis;`.<br>3. Set `DATABASE_URL` in backend environment variables. |

---

## 5. Verification & Testing

To run the automated verification suite verifying all 12 REST endpoints:
```powershell
cd d:\SEM_5\ML\PROJECT\CRIMORA\crimora\backend
python test_endpoints.py
```
Expected output:
```text
Result: 12/12 endpoints passed.
ALL BACKEND ENDPOINTS OPERATIONAL!
```
