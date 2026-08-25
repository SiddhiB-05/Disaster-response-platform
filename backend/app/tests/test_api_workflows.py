import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_disaster.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_full_incident_report_to_dispatch_workflow():
    # 1. Seed demo environment
    seed_res = client.post("/api/v1/demo/seed")
    assert seed_res.status_code == 200

    # 2. Submit citizen report
    report_payload = {
        "location_name": "Sector 6 Rourkela Block D",
        "district": "Rourkela",
        "latitude": 22.2615,
        "longitude": 84.8545,
        "incident_type": "FLOOD_WATER_RESCUE",
        "description": "Water has entered several houses and 8 people are trapped. Two of them are elderly.",
        "reporter_name": "Test Citizen",
        "contact_phone": "+91 99999 88888",
        "people_affected": 8
    }
    inc_res = client.post("/api/v1/incidents", json=report_payload)
    assert inc_res.status_code == 201
    inc_data = inc_res.json()
    assert inc_data["people_affected"] == 8
    assert inc_data["vulnerable_people"] is True
    assert inc_data["priority_score"] >= 70
    assert inc_data["priority_category"] == "HIGH"
    incident_id = inc_data["id"]

    # 3. Run SciPy optimization preview
    opt_res = client.post("/api/v1/assignments/optimize")
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["total_assigned"] > 0
    rec = opt_data["assignments"][0]

    # 4. Confirm Resource Assignment
    confirm_payload = {
        "incident_id": incident_id,
        "resource_id": rec["recommended_resource_id"],
        "reason": "Authority confirmed SciPy recommendation."
    }
    dispatch_res = client.post("/api/v1/assignments/confirm", json=confirm_payload)
    assert dispatch_res.status_code == 201
    dispatch_data = dispatch_res.json()
    assignment_id = dispatch_data["id"]

    # 5. Verify state updates (Incident ASSIGNED, Resource BUSY)
    check_inc = client.get(f"/api/v1/incidents/{incident_id}").json()
    assert check_inc["status"] == "ASSIGNED"

    check_res = client.get(f"/api/v1/resources").json()
    assigned_res = next(r for r in check_res if r["id"] == rec["recommended_resource_id"])
    assert assigned_res["status"] == "BUSY"

    # 6. Complete response lifecycle
    comp_res = client.patch(f"/api/v1/assignments/{assignment_id}/status", json={"status": "COMPLETED"})
    assert comp_res.status_code == 200

    # 7. Verify final states (Incident RESOLVED, Resource AVAILABLE)
    final_inc = client.get(f"/api/v1/incidents/{incident_id}").json()
    assert final_inc["status"] == "RESOLVED"

    final_res = client.get(f"/api/v1/resources").json()
    reloaded_res = next(r for r in final_res if r["id"] == rec["recommended_resource_id"])
    assert reloaded_res["status"] == "AVAILABLE"
