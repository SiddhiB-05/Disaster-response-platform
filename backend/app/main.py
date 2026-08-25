from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.database import engine, Base, SessionLocal
from app.routes import incidents, resources, alerts, facilities, assignments, audit, demo
from app.core.websocket import ws_manager

# Create Database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed demo dataset on startup if empty
    db = SessionLocal()
    try:
        from app.routes.demo import seed_demo_data
        seed_demo_data(db)
        print("[Startup] PS-05 Disaster Platform Backend initialized and synthetic Rourkela demo data seeded.")
    except Exception as e:
        print(f"[Startup] Note on auto-seeding: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Real-Time Disaster Early-Warning & Resource Coordination Platform API",
    lifespan=lifespan
)

# Enable CORS for React Frontend and Streamlit Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned API v1 Routers
app.include_router(incidents.router)
app.include_router(resources.router)
app.include_router(alerts.router)
app.include_router(facilities.router)
app.include_router(assignments.router)
app.include_router(audit.router)
app.include_router(demo.router)

# Backwards Compatible Route Aliases for legacy /api pathing
app.include_router(incidents.router, prefix="/api", tags=["Incidents Legacy"])
app.include_router(resources.router, prefix="/api", tags=["Resources Legacy"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts Legacy"])
app.include_router(facilities.router, prefix="/api", tags=["Facilities Legacy"])
app.include_router(assignments.router, prefix="/api", tags=["Assignments Legacy"])
app.include_router(demo.router, prefix="/api", tags=["Demo Legacy"])

@app.websocket("/api/v1/ws")
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time WebSocket event stream endpoint."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "status": "OPERATIONAL",
        "system": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "location": "Rourkela, Odisha, India",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
