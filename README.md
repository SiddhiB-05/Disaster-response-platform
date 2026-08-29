# 🛡️ DRISHTi: Real-Time Disaster Early-Warning & Resource Coordination Platform

[![CI/CD Pipeline](https://github.com/smit45-m/Disaster-response-platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/smit45-m/Disaster-response-platform/actions/workflows/deploy.yml)
[![AWS Deployment](https://img.shields.io/badge/AWS-EC2%20%7C%20ap--south--1-orange?logo=amazon-aws)](https://aws.amazon.com)
[![SSL Security](https://img.shields.io/badge/SSL-HTTPS%20Padlock%20Verified-brightgreen?logo=letsencrypt)](https://therefore-pointing-downtown-save.trycloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An end-to-end disaster-response decision-support platform designed for **Rourkela, Odisha, India**. The platform converts unstructured citizen incident reports into structured AI intelligence, computes a transparent 0–100 priority score, evaluates Haversine distance matrix, executes SciPy Hungarian bipartite resource matching, streams real-time updates via WebSockets, and provides interactive GIS command dashboards.

---

## 🌐 Official Live Links

| Resource | URL | Description |
|---|---|---|
| 🔒 **Primary Web App (HTTPS)** | [https://therefore-pointing-downtown-save.trycloudflare.com](https://therefore-pointing-downtown-save.trycloudflare.com) | **Official Secure Live Platform** with 100% Trusted SSL Padlock |
| 📑 **Interactive Swagger API Docs** | [https://therefore-pointing-downtown-save.trycloudflare.com/docs](https://therefore-pointing-downtown-save.trycloudflare.com/docs) | Live OpenAPI REST API explorer & testing suite |
| 🌟 **Custom Registered Domain** | [http://disasterresponse.click](http://disasterresponse.click) | Registered AWS Route 53 domain pointing to EC2 Elastic IP |
| 🌐 **Direct Cloud IP** | [http://13.204.160.135](http://13.204.160.135) | Direct Static Elastic IP on AWS Mumbai (`ap-south-1`) |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["User Interfaces"]
        CitizenUI["Citizen React Frontend<br/>(Neo-Brutalist DRISHTi UI)"]
        DashboardUI["Authority Command Dashboard<br/>(Tactical Map & Queue)"]
    end

    subgraph Nginx["Nginx Reverse Proxy (Port 80 / 443)"]
        Proxy["SSL Termination & WebSocket Upgrades"]
    end

    subgraph Backend["FastAPI Backend Engine (Port 8000)"]
        API["FastAPI REST & WebSocket Controllers<br/>(/api/v1)"]
        GeminiService["Gemini AI & Fallback NLP Extractor"]
        ScoringEngine["Transparent Priority Engine (0-100)"]
        SciPyOptimizer["SciPy Allocation Engine<br/>(linear_sum_assignment)"]
        HaversineMath["Haversine Distance Calculator"]
        WSManager["WebSocket Event Broadcaster"]
    end

    subgraph Database["Relational Store (Port 5432)"]
        DB[(PostgreSQL 15 / Persistent Volume)]
    end

    CitizenUI -->|HTTPS / WSS| Proxy
    DashboardUI -->|HTTPS / WSS| Proxy
    Proxy --> API
    
    API --> GeminiService
    API --> ScoringEngine
    API --> SciPyOptimizer
    SciPyOptimizer --> HaversineMath
    ScoringEngine --> HaversineMath
    
    API --> DB
    API --> WSManager
    WSManager -.->|Real-time WS Events| Proxy
```

---

## ⚡ Quick Start with Docker Compose

To start all services locally with Docker Compose:

```bash
docker compose up --build
```

### Access URLs

- **Citizen React Portal**: `http://localhost:5173`
- **FastAPI Backend & Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Streamlit Authority Command Dashboard**: `http://localhost:8501`

---

## 🚀 Production AWS Deployment (<$10/Month)

The platform is deployed on **AWS EC2 (Mumbai `ap-south-1`)** with persistent PostgreSQL 15, FastAPI, React 18, and Nginx.

```bash
# Provision Infrastructure
cd terraform
terraform init
terraform apply -auto-approve
```

---

## 🔑 Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key. If omitted or API fails, heuristic fallback parser is active. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model version for structured JSON extraction. |
| `DATABASE_URL` | `postgresql://...` | Database connection URI (PostgreSQL 15 in production, SQLite in dev). |
| `API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API URL for dashboard & frontend communication. |
| `VITE_API_BASE_URL` | `/api/v1` | React frontend Vite backend endpoint. |

---

## 📊 Priority Scoring Formula & Deterministic Engine

The priority score $P \in [0, 100]$ is computed deterministically using five weighted normalized components ($C_i \in [0, 100]$):

$$P = 0.35 \times C_{\text{severity}} + 0.25 \times C_{\text{people}} + 0.15 \times C_{\text{facility}} + 0.15 \times C_{\text{resource}} + 0.10 \times C_{\text{time}}$$

### Factor Mappings

1. **Severity ($C_{\text{severity}}$)**: LOW = 25, MEDIUM = 50, HIGH = 80, CRITICAL = 100.
   - *Vulnerability Promotion Rule*: If vulnerable individuals (children/elderly/disabled) are present and severity < HIGH, severity is promoted by one enum step.
2. **People Affected ($C_{\text{people}}$)**: 0 $\rightarrow$ 0; 1 $\rightarrow$ 20; 2–5 $\rightarrow$ 40; 6–10 $\rightarrow$ 65; 11–25 $\rightarrow$ 85; 26+ $\rightarrow$ 100 (+10 pts if vulnerable people present, capped at 100).
3. **Facility Proximity ($C_{\text{facility}}$)**: $\max(0, 100 - (\text{dist}_{\text{km}} / 20) \times 100)$ to nearest active critical facility.
4. **Resource Availability ($C_{\text{resource}}$)**: 100 (<2 km), 85 (<5 km), 65 (<10 km), 40 (<20 km), 20 (>20 km), 0 (none compatible).
5. **Time Elapsed ($C_{\text{time}}$)**: $\min(100, (\text{elapsed\_minutes} / 180) \times 100)$.

### Priority Classification

- **70–100**: HIGH PRIORITY (Red)
- **40–69**: MEDIUM PRIORITY (Yellow/Amber)
- **0–39**: LOW PRIORITY (Green)

---

## 🤖 SciPy Resource Allocation Engine

Global multi-incident resource allocation uses `scipy.optimize.linear_sum_assignment` over an incident-by-resource cost matrix:

$$\text{Cost}_{i, j} = \text{Distance}_{\text{km}} + 0.75 \times (100 - P_i) + \text{Penalty}_{\text{capability}} + \text{Penalty}_{\text{capacity}}$$

- **Capability Penalty**: 0 for exact match, 35 for valid fallback, `1_000_000` for infeasible pairs.
- **Scarcity Behavior**: High-priority incidents ($P_i \ge 70$) are strongly favored for nearby resources over slightly closer low-priority incidents.
- **Transactional Confirmation**: Optimization produces previews; dispatching calls `/api/v1/assignments/confirm` to update resource status `AVAILABLE` $\rightarrow$ `BUSY` and incident status `REPORTED` $\rightarrow$ `ASSIGNED`.

---

## 🎬 3-Minute Hackathon Demo Script

1. **Trigger Alert**: Click **⚡ TRIGGER SYNTHETIC ALERT** for Flood in Rourkela.
2. **Verify Alert**: Observe live alert ticker in Citizen Portal.
3. **Submit Citizen Report**: Click sample chip: *"Water has entered several houses and 8 people are trapped. Two of them are elderly."*
4. **Inspect AI & Score**: Observe structured extraction (8 people, vulnerable true, High severity) and HIGH priority classification score ($\ge 70$).
5. **Inspect 3D Map**: View incident column on tactical map.
6. **Run SciPy Optimizer**: Click **⚙️ RUN SCIPY OPTIMIZE ALGORITHM**, inspect match recommendations, distance, ETA, and cost.
7. **Confirm Dispatch**: Click **CONFIRM DISPATCH**. Observe resource change `AVAILABLE` $\rightarrow$ `BUSY` and incident change to `ASSIGNED`.
8. **Complete Lifecycle**: Advance assignment to `COMPLETED`. Verify resource returns to `AVAILABLE` and incident becomes `RESOLVED`.

---

## 🧪 Testing & CI/CD

Run backend unit & integration tests:

```bash
cd backend
PYTHONPATH=. pytest app/tests/ -v
```

Run frontend build check:

```bash
cd frontend
npm run build
```
