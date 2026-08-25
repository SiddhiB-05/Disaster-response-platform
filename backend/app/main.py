from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.database import engine, Base, SessionLocal
from app.routes import incidents, resources, alerts, facilities, assignments, demo

# Initialize Database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Auto-seed demo data if database is empty
    db = SessionLocal()
    try:
        from app.routes.demo import seed_demo_data
        seed_demo_data(db)
        print("[Startup] Disaster Response Platform Backend initialized and demo data seeded.")
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(incidents.router)
app.include_router(resources.router)
app.include_router(alerts.router)
app.include_router(facilities.router)
app.include_router(assignments.router)
app.include_router(demo.router)

@app.get("/")
def root():
    return {
        "status": "OPERATIONAL",
        "system": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
