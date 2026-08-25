# PS-05: Real-Time Disaster Early-Warning & Resource Coordination Platform

A real-time disaster-response decision-support platform designed to transform raw citizen incident reports into structured AI intelligence, transparent priority scores (0–100), and mathematically optimized rescue resource dispatches using SciPy.

---

## 🏛️ Tactical System Architecture

```
Official / Synthetic Alert (Flood / Cyclone)
                    ↓
Citizen Incident Reports (Location + Type + Description)
                    ↓
Gemini AI NLP Extraction (Structured JSON)
                    ↓
Deterministic Priority Engine (0–100 Weighted Score)
                    ↓
Geospatial Proximity Matrix (Haversine Formula)
                    ↓
SciPy Resource Allocation Engine (scipy.optimize.linear_sum_assignment)
                    ↓
Live Authority Command Dashboard (Streamlit + PyDeck 3D Map)
                    ↓
Real-Time Resource Status Update (AVAILABLE → BUSY / ASSIGNED)
```

---

## ⚡ Tech Stack

- **Citizen Frontend**: React, Vite, Tailwind CSS (Tactile Neo-Brutalist Command Interface)
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy (SQLite repository layer easily swappable with PostgreSQL + PostGIS)
- **AI NLP Extraction**: Google Gemini API (`gemini-2.5-flash`) + Smart Fallback NLP Parser
- **Priority Engine**: Transparent 5-Factor Weighted Formula (0–100 Score)
- **Optimization**: Python SciPy (`scipy.optimize.linear_sum_assignment`)
- **Geospatial**: Haversine Spherical Distance Formula & Leaflet / PyDeck
- **Authority Dashboard**: Streamlit + PyDeck 3D Map + Heatmap Layer
- **Containerization**: Docker & Docker Compose

---

## 🎯 Priority Scoring Formula (0–100)

$$\text{Priority Score} = 0.35 \times \text{Severity} + 0.25 \times \text{People Affected} + 0.15 \times \text{Facility Proximity} + 0.15 \times \text{Resource Availability} + 0.10 \times \text{Time Elapsed}$$

### Score Classification:
- **70 – 100**: HIGH PRIORITY (Red)
- **40 – 69**: MEDIUM PRIORITY (Yellow)
- **0 – 39**: LOW PRIORITY (Green)

Every score comes with an **Explainable Score Breakdown** (e.g. `Severity: 32.0/35`, `People: 22.5/25`, `Facility: 14.2/15`, `Resource: 13.5/15`, `Time: 10.0/10`) to provide complete algorithmic transparency.

---

## 🚀 Quick Start Guide

### Option A: Local Development

#### 1. Start Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Documentation available at: `http://localhost:8000/docs`*

#### 2. Start Citizen Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Citizen Portal running at: `http://localhost:5173`*

#### 3. Start Authority Dashboard (Streamlit + PyDeck)
```bash
cd dashboard
pip install -r requirements.txt
streamlit run streamlit_app.py --server.port 8501
```
*Authority Command Center running at: `http://localhost:8501`*

---

### Option B: Docker Compose

```bash
docker-compose up --build
```

---

## 🎬 3-Minute Hackathon Demonstration Workflow

1. **Step 1: Synthetic Alert Trigger**
   - Open Streamlit Dashboard (`http://localhost:8501`) or Citizen Portal.
   - Trigger a simulated **FLOOD ALERT** for District Rourkela.

2. **Step 2: Submit Citizen Incidents**
   - Open Citizen Portal (`http://localhost:5173`).
   - Use GPS / Preset Locations and enter text descriptions (e.g. *"Water has entered several houses and 8 people are trapped. Two of them are elderly."*).

3. **Step 3: AI Structured Extraction**
   - Watch Gemini AI convert unstructured report into structured JSON (`people_affected: 8`, `vulnerable_people: true`, `severity: High`).

4. **Step 4: Priority Scoring Engine**
   - View transparent 0–100 Priority Score (e.g. **92/100 HIGH**) with breakdown.

5. **Step 5: Live Authority Dashboard**
   - Open Streamlit Dashboard to view PyDeck 3D incident markers, density heatmap, and priority queue sorted descending.

6. **Step 6: SciPy Resource Matching Engine**
   - Click **"RUN SCIPY OPTIMIZE ALGORITHM"** to compute globally optimal assignments based on Haversine distance and capability matrices.

7. **Step 7: Resource Dispatch**
   - Click **[ASSIGN RESOURCE]**.
   - Watch Resource Status transition dynamically from **AVAILABLE → BUSY** and Incident Status update to **ASSIGNED**.
