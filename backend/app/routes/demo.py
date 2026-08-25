from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.database import models
from app.ai.gemini_service import gemini_extractor
from app.scoring.priority_engine import priority_engine

router = APIRouter(prefix="/api/demo", tags=["Demo Controller"])

# Demo coordinate offsets around Rourkela Sector 6 (22.2604, 84.8536)
FACILITIES_SEED = [
    {"name": "Rourkela Government Hospital (RGH)", "facility_type": "Hospital", "latitude": 22.2530, "longitude": 84.8510},
    {"name": "Sector 6 Emergency Command HQ", "facility_type": "Emergency Center", "latitude": 22.2604, "longitude": 84.8536},
    {"name": "Brahmani River Major Bridge", "facility_type": "Bridge", "latitude": 22.2420, "longitude": 84.8350},
    {"name": "DAV Public School Relief Center", "facility_type": "School", "latitude": 22.2680, "longitude": 84.8620},
]

RESOURCES_SEED = [
    {
        "name": "ODRAF Rescue Team Alpha",
        "type": "Rescue Team",
        "capability": "Flood Rescue, Boat Operations",
        "latitude": 22.2570,
        "longitude": 84.8480,
        "capacity": 15,
        "status": "AVAILABLE"
    },
    {
        "name": "NDRF Tactical Unit 2",
        "type": "Rescue Team",
        "capability": "Flood, Landslide, Collapse Rescue",
        "latitude": 22.2690,
        "longitude": 84.8650,
        "capacity": 20,
        "status": "AVAILABLE"
    },
    {
        "name": "Rourkela Central Medical Squad 1",
        "type": "Medical Team",
        "capability": "Medical Emergency, First Aid",
        "latitude": 22.2535,
        "longitude": 84.8515,
        "capacity": 8,
        "status": "AVAILABLE"
    },
    {
        "name": "Advanced Life Support Ambulance 04",
        "type": "Ambulance",
        "capability": "Medical Emergency, Trauma Transport",
        "latitude": 22.2510,
        "longitude": 84.8490,
        "capacity": 2,
        "status": "AVAILABLE"
    },
    {
        "name": "Public Works Heavy Clearance Unit",
        "type": "Engineering Team",
        "capability": "Road Blockage, Debris Removal, Landslide",
        "latitude": 22.2740,
        "longitude": 84.8710,
        "capacity": 10,
        "status": "AVAILABLE"
    }
]

INCIDENTS_SEED = [
    {
        "location_name": "Sector 6 Housing Board, Block C",
        "latitude": 22.2612,
        "longitude": 84.8542,
        "incident_type": "Flood",
        "description": "Water has entered several houses and 8 people are trapped inside. Two of them are elderly."
    },
    {
        "location_name": "Koel Nagar Main Road Junction",
        "latitude": 22.2540,
        "longitude": 84.8590,
        "incident_type": "Medical Emergency",
        "description": "An elderly stroke patient needs urgent medical evacuation as water is rising near the house."
    },
    {
        "location_name": "Brahmani River Bypass Highway",
        "latitude": 22.2450,
        "longitude": 84.8380,
        "incident_type": "Road Blockage",
        "description": "A massive uprooted tree and flood mud have completely blocked the highway preventing supply trucks."
    },
    {
        "location_name": "Sector 8 Market Complex",
        "latitude": 22.2710,
        "longitude": 84.8630,
        "incident_type": "Building Damage",
        "description": "A boundary wall collapsed due to torrential rains and 3 shopkeepers are injured."
    },
    {
        "location_name": "Chhend Colony Extension",
        "latitude": 22.2380,
        "longitude": 84.8250,
        "incident_type": "Water Shortage",
        "description": "The local community water pipe broke. 50 families have no clean drinking water."
    }
]

@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed sample facilities, resources, disaster alert, and incidents for instant testing."""
    # 1. Critical Facilities
    if db.query(models.CriticalFacility).count() == 0:
        for f in FACILITIES_SEED:
            db.add(models.CriticalFacility(**f))

    # 2. Resources
    if db.query(models.Resource).count() == 0:
        for r in RESOURCES_SEED:
            db.add(models.Resource(**r))

    # 3. Active Disaster Alert
    if db.query(models.DisasterAlert).count() == 0:
        db.add(models.DisasterAlert(
            alert_type="Flood",
            district="Rourkela",
            severity="Severe",
            message="SIMULATED ALERT: Flash flood advisory issued for Sector 6, Koel Nagar, and Brahmani basin due to heavy discharge.",
            is_active=True,
            simulated=True,
            timestamp=datetime.utcnow()
        ))
    db.commit()

    # Fetch facilities & resources for scoring
    facilities = db.query(models.CriticalFacility).all()
    facility_dicts = [{"name": f.name, "latitude": f.latitude, "longitude": f.longitude} for f in facilities]
    available_res_count = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").count()

    # 4. Citizen Incidents
    created_incidents = []
    if db.query(models.Incident).count() == 0:
        for seed_inc in INCIDENTS_SEED:
            # AI extraction
            ai_data = gemini_extractor.extract_incident_metadata(
                description=seed_inc["description"],
                fallback_incident_type=seed_inc["incident_type"]
            )
            # Scoring
            score_res = priority_engine.calculate_priority(
                severity=ai_data["severity"],
                people_affected=ai_data["people_affected"],
                vulnerable_people=ai_data["vulnerable_people"],
                urgency=ai_data["urgency"],
                incident_lat=seed_inc["latitude"],
                incident_lon=seed_inc["longitude"],
                critical_facilities=facility_dicts,
                available_resources_count=available_res_count,
                minutes_elapsed=2.0
            )

            inc_obj = models.Incident(
                location_name=seed_inc["location_name"],
                latitude=seed_inc["latitude"],
                longitude=seed_inc["longitude"],
                incident_type=ai_data["incident_type"],
                description=seed_inc["description"],
                ai_severity=ai_data["severity"],
                people_affected=ai_data["people_affected"],
                vulnerable_people=ai_data["vulnerable_people"],
                urgency=ai_data["urgency"],
                priority_score=score_res["priority_score"],
                priority_category=score_res["priority_category"],
                score_breakdown=score_res["score_breakdown"],
                status="UNASSIGNED",
                created_at=datetime.utcnow()
            )
            db.add(inc_obj)
            created_incidents.append(inc_obj)
        db.commit()

    return {
        "status": "success",
        "message": "Demo data successfully seeded!",
        "incidents_count": db.query(models.Incident).count(),
        "resources_count": db.query(models.Resource).count(),
        "facilities_count": db.query(models.CriticalFacility).count()
    }

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reset all database tables and re-seed clean state for live demonstration."""
    db.query(models.Assignment).delete()
    db.query(models.Incident).delete()
    db.query(models.Resource).delete()
    db.query(models.CriticalFacility).delete()
    db.query(models.DisasterAlert).delete()
    db.commit()

    return seed_demo_data(db)
