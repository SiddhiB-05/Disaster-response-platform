from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.database import models
from app.ai.gemini_service import gemini_extractor
from app.scoring.priority_engine import priority_engine

router = APIRouter(prefix="/api/v1/demo", tags=["Demo Controller"])

# Rourkela Critical Facilities Seed Data
FACILITIES_SEED = [
    {"name": "Rourkela Government Hospital (RGH)", "facility_type": "Hospital", "latitude": 22.2530, "longitude": 84.8510, "is_active": True},
    {"name": "Sector 6 Emergency Command & Control Room", "facility_type": "Emergency Control Room", "latitude": 22.2604, "longitude": 84.8536, "is_active": True},
    {"name": "Rourkela Central Fire Station", "facility_type": "Fire Station", "latitude": 22.2560, "longitude": 84.8450, "is_active": True},
    {"name": "Brahmani River Highway Police Station", "facility_type": "Police Station", "latitude": 22.2420, "longitude": 84.8350, "is_active": True},
    {"name": "DAV Public School Emergency Relief Shelter", "facility_type": "Shelter", "latitude": 22.2680, "longitude": 84.8620, "is_active": True},
    {"name": "Sector 19 Community Relief Hall", "facility_type": "Shelter", "latitude": 22.2740, "longitude": 84.8710, "is_active": True}
]

# 10 Varied Rourkela Rescue Resources with distinct capabilities & statuses
RESOURCES_SEED = [
    {
        "name": "ODRAF Rescue Team Alpha (Boat Ops)",
        "type": "NDRF/Rescue Team",
        "capability": "water_rescue,boat,flood,odraf",
        "capacity": 15,
        "latitude": 22.2570,
        "longitude": 84.8480,
        "status": "AVAILABLE"
    },
    {
        "name": "NDRF Tactical Search Unit 2",
        "type": "NDRF/Rescue Team",
        "capability": "search_and_rescue,collapse,landslide,ndrf",
        "capacity": 20,
        "latitude": 22.2690,
        "longitude": 84.8650,
        "status": "AVAILABLE"
    },
    {
        "name": "Rourkela Central Medical Mobile Unit 1",
        "type": "Medical Team",
        "capability": "medical,first aid,trauma",
        "capacity": 8,
        "latitude": 22.2535,
        "longitude": 84.8515,
        "status": "AVAILABLE"
    },
    {
        "name": "Advanced Life Support Ambulance 04",
        "type": "Ambulance",
        "capability": "medical,ambulance,trauma",
        "capacity": 2,
        "latitude": 22.2510,
        "longitude": 84.8490,
        "status": "AVAILABLE"
    },
    {
        "name": "Fire Tender Unit 01 (Rourkela Central)",
        "type": "Fire Truck",
        "capability": "fire,fire_suppression,hazmat",
        "capacity": 6,
        "latitude": 22.2560,
        "longitude": 84.8450,
        "status": "AVAILABLE"
    },
    {
        "name": "PWD Heavy Debris Removal Unit",
        "type": "Relief Vehicle",
        "capability": "debris_clearance,road,engineering,landslide",
        "capacity": 10,
        "latitude": 22.2740,
        "longitude": 84.8710,
        "status": "AVAILABLE"
    },
    {
        "name": "Rourkela Police Patrol Unit 09",
        "type": "Police Unit",
        "capability": "search_and_rescue,police,traffic_control",
        "capacity": 4,
        "latitude": 22.2420,
        "longitude": 84.8350,
        "status": "AVAILABLE"
    },
    {
        "name": "ODRAF Rescue Team Bravo (Water Rescue)",
        "type": "NDRF/Rescue Team",
        "capability": "water_rescue,boat,flood,odraf",
        "capacity": 12,
        "latitude": 22.2480,
        "longitude": 84.8390,
        "status": "AVAILABLE"
    },
    {
        "name": "Basic Life Support Ambulance 08",
        "type": "Ambulance",
        "capability": "medical,ambulance",
        "capacity": 2,
        "latitude": 22.2630,
        "longitude": 84.8580,
        "status": "BUSY"
    },
    {
        "name": "Disaster Relief Supply Vehicle 03",
        "type": "Relief Vehicle",
        "capability": "shelter,food,water,general",
        "capacity": 25,
        "latitude": 22.2660,
        "longitude": 84.8610,
        "status": "AVAILABLE"
    }
]

# Sample Incidents spanning High, Medium, and Low Priority
INCIDENTS_SEED = [
    {
        "location_name": "Sector 6 Housing Board, Block C",
        "district": "Rourkela",
        "latitude": 22.2612,
        "longitude": 84.8542,
        "incident_type": "FLOOD_WATER_RESCUE",
        "description": "Water has entered several houses and 8 people are trapped. Two of them are elderly.",
        "people_affected": 8,
        "reporter_name": "Ramesh K",
        "contact_phone": "+91 98765 43210"
    },
    {
        "location_name": "Koel Nagar Main Road Junction",
        "district": "Rourkela",
        "latitude": 22.2540,
        "longitude": 84.8590,
        "incident_type": "MEDICAL_EMERGENCY",
        "description": "An elderly stroke patient needs urgent medical evacuation as water is rising near the house.",
        "people_affected": 1,
        "reporter_name": "Anita S",
        "contact_phone": "+91 98123 45678"
    },
    {
        "location_name": "Brahmani River Bypass Highway",
        "district": "Rourkela",
        "latitude": 22.2450,
        "longitude": 84.8380,
        "incident_type": "LANDSLIDE_ROAD_BLOCK",
        "description": "A massive uprooted tree and flood mud have completely blocked the highway preventing supply trucks.",
        "people_affected": 0,
        "reporter_name": "Highway Patrol",
        "contact_phone": "+91 94370 12345"
    },
    {
        "location_name": "Sector 8 Market Complex",
        "district": "Rourkela",
        "latitude": 22.2710,
        "longitude": 84.8630,
        "incident_type": "BUILDING_COLLAPSE",
        "description": "A boundary wall collapsed due to torrential rains and 3 shopkeepers are injured.",
        "people_affected": 3,
        "reporter_name": "Market Union",
        "contact_phone": "+91 98610 98765"
    },
    {
        "location_name": "Chhend Colony Extension",
        "district": "Rourkela",
        "latitude": 22.2380,
        "longitude": 84.8250,
        "incident_type": "OTHER",
        "description": "The local community water pipe broke. 50 families have no clean drinking water.",
        "people_affected": 50,
        "reporter_name": "Chhend Welfare",
        "contact_phone": "+91 99371 11223"
    }
]

@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed synthetic Rourkela facilities, resources, active flood alert, and incidents."""
    # 1. Critical Facilities
    if db.query(models.CriticalFacility).count() == 0:
        for f in FACILITIES_SEED:
            db.add(models.CriticalFacility(**f))

    # 2. Resources
    if db.query(models.Resource).count() == 0:
        for r in RESOURCES_SEED:
            db.add(models.Resource(**r))

    # 3. Active Disaster Alert (Clearly labeled synthetic demo alert)
    if db.query(models.DisasterAlert).count() == 0:
        db.add(models.DisasterAlert(
            hazard_type="FLOOD",
            title="SYNTHETIC DEMO: FLASH FLOOD ADVISORY",
            description="SIMULATED ALERT: Flash flood advisory issued for Sector 6, Koel Nagar, and Brahmani basin due to heavy river discharge.",
            severity="Severe",
            district="Rourkela",
            latitude=22.2604,
            longitude=84.8536,
            radius_km=15.0,
            source="State Disaster Management Authority (Synthetic Demo)",
            is_synthetic=True,
            status="ACTIVE",
            starts_at=datetime.utcnow()
        ))
    db.commit()

    # Fetch facilities & resources for scoring
    facilities = db.query(models.CriticalFacility).filter(models.CriticalFacility.is_active == True).all()
    facility_dicts = [{"name": f.name, "latitude": f.latitude, "longitude": f.longitude} for f in facilities]
    
    available_resources = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").all()
    resource_dicts = [{"name": r.name, "latitude": r.latitude, "longitude": r.longitude, "capability": r.capability} for r in available_resources]

    # 4. Incidents
    if db.query(models.Incident).count() == 0:
        active_alert = db.query(models.DisasterAlert).first()
        for seed_inc in INCIDENTS_SEED:
            ai_data = gemini_extractor.extract_incident_metadata(
                description=seed_inc["description"],
                fallback_type_hint=seed_inc["incident_type"],
                explicit_people_count=seed_inc["people_affected"]
            )

            score_res = priority_engine.calculate_priority(
                severity=ai_data["severity"],
                people_affected=ai_data["people_affected"],
                vulnerable_people=ai_data["vulnerable_people"],
                incident_lat=seed_inc["latitude"],
                incident_lon=seed_inc["longitude"],
                facilities=facility_dicts,
                available_resources=resource_dicts,
                elapsed_minutes=2.0
            )

            inc_obj = models.Incident(
                alert_id=active_alert.id if active_alert else None,
                incident_type=ai_data["incident_type"],
                location_name=seed_inc["location_name"],
                district=seed_inc["district"],
                latitude=seed_inc["latitude"],
                longitude=seed_inc["longitude"],
                raw_description=seed_inc["description"],
                reporter_name=seed_inc.get("reporter_name"),
                contact_phone=seed_inc.get("contact_phone"),
                ai_severity=ai_data["severity"],
                people_affected=ai_data["people_affected"],
                vulnerable_people=ai_data["vulnerable_people"],
                urgency="HIGH" if score_res["priority_score"] >= 70 else "MEDIUM",
                extraction_confidence=ai_data.get("confidence", 0.90),
                extraction_notes=ai_data.get("extraction_notes", []),
                nlp_source=ai_data.get("nlp_source", "fallback"),
                priority_score=score_res["priority_score"],
                priority_category=score_res["priority_category"],
                score_breakdown=score_res["score_breakdown"],
                status="REPORTED",
                reported_at=datetime.utcnow()
            )
            db.add(inc_obj)
        db.commit()

    return {
        "status": "success",
        "message": "Synthetic Rourkela demo data successfully seeded!",
        "incidents_count": db.query(models.Incident).count(),
        "resources_count": db.query(models.Resource).count(),
        "facilities_count": db.query(models.CriticalFacility).count(),
        "alerts_count": db.query(models.DisasterAlert).count()
    }

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reset all database tables and re-seed clean synthetic Rourkela state."""
    db.query(models.AuditEvent).delete()
    db.query(models.Assignment).delete()
    db.query(models.Incident).delete()
    db.query(models.Resource).delete()
    db.query(models.CriticalFacility).delete()
    db.query(models.DisasterAlert).delete()
    db.commit()

    return seed_demo_data(db)
