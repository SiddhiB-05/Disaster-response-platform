# PS-05: Real-Time Disaster Early-Warning & Resource Coordination Platform

An end-to-end disaster-response decision-support platform designed for **Rourkela, Odisha, India**. The platform converts unstructured citizen incident reports into structured AI intelligence, computes a transparent 0–100 priority score, evaluates Haversine distance matrix, executes SciPy Hungarian bipartite resource matching, streams real-time updates via WebSockets, and provides a Streamlit PyDeck 3D command dashboard.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["User Interfaces"]
        CitizenUI["Citizen React Frontend<br/>(Port 5173 - Neo-Brutalist)"]
        DashboardUI["Authority Command Dashboard<br/>(Port 8501 - Streamlit PyDeck 3D)"]
    end

    subgraph Backend["FastAPI Backend (Port 8000)"]
        API["FastAPI REST & WebSocket Controllers<br/>(/api/v1)"]
        GeminiService["Gemini AI & Fallback NLP Extractor"]
        ScoringEngine["Transparent Priority Engine (0-100)"]
        SciPyOptimizer["SciPy Allocation Engine<br/>(linear_sum_assignment)"]
        HaversineMath["Haversine Distance Calculator"]
        WSManager["WebSocket Event Broadcaster"]
        DB[(SQLAlchemy ORM<br/>SQLite / PostgreSQL)]
    end

    CitizenUI -->|POST /api/v1/incidents| API
    DashboardUI -->|GET /api/v1/incidents & POST /assignments/confirm| API
    
    API --> GeminiService
    API --> ScoringEngine
    API --> SciPyOptimizer
    SciPyOptimizer --> HaversineMath
    ScoringEngine --> HaversineMath
    
    API --> DB
    API --> WSManager
    WSManager -.->|Real-time WS Events| CitizenUI
    WSManager -.->|Real-time WS Events| DashboardUI
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

## 🚀 Manual Local Setup

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m app.main
```

### 2. Citizen Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Streamlit Command Dashboard Setup

```bash
cd dashboard
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

---

## 🔑 Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini API key. If omitted or API fails, heuristic fallback parser is active. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model version for structured JSON extraction. |
| `DATABASE_URL` | `sqlite:///./disaster_response.db` | Database connection URI (SQLite default, swappable to PostgreSQL). |
| `API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API URL for dashboard & frontend communication. |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | React frontend Vite backend endpoint. |

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

1. **Trigger Alert**: Open Streamlit Dashboard (`http://localhost:8501`), click **⚡ TRIGGER SYNTHETIC ALERT** for Flood in Rourkela.
2. **Verify Alert**: Observe live alert ticker in Citizen Portal (`http://localhost:5173`).
3. **Submit Citizen Report**: Click sample chip: *"Water has entered several houses and 8 people are trapped. Two of them are elderly."*
4. **Inspect AI & Score**: Observe structured extraction (8 people, vulnerable true, High severity) and HIGH priority classification score ($\ge 70$).
5. **Inspect 3D Map**: View incident column on PyDeck 3D map in Streamlit dashboard.
6. **Run SciPy Optimizer**: Click **⚙️ RUN SCIPY OPTIMIZE ALGORITHM**, inspect match recommendations, distance, ETA, and cost.
7. **Confirm Dispatch**: Click **CONFIRM DISPATCH**. Observe resource change `AVAILABLE` $\rightarrow$ `BUSY` and incident change to `ASSIGNED`.
8. **Complete Lifecycle**: Advance assignment to `COMPLETED`. Verify resource returns to `AVAILABLE` and incident becomes `RESOLVED`.

---

## 🧪 Testing

Run backend unit & integration tests:

```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest app/tests/ -v
```

Run frontend build check:

```bash
cd frontend
npm run build
```

---

## 🐘 Replacing SQLite with PostgreSQL / PostGIS

To switch from SQLite to PostgreSQL/PostGIS:

1. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/disaster_db
   ```
2. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
