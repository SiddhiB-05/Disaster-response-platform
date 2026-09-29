from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.database import models
from app.ai.gemini_service import gemini_extractor
from app.scoring.priority_engine import priority_engine

router = APIRouter(prefix="/api/v1/demo", tags=["Demo Controller"])

# Rourkela Critical Facilities Seed Data (Safe Shelters, Hospitals, Control Centers)
FACILITIES_SEED = [
    {
        "name": "Rourkela Government Hospital (RGH) Trauma Center",
        "facility_type": "Hospital",
        "latitude": 22.2530,
        "longitude": 84.8510,
        "address": "Panposh Road, Sector 19, Rourkela",
        "phone": "+91 661-2540102 / 108",
        "capacity": 450,
        "current_occupancy": 310,
        "contact_person": "Dr. A. K. Mohanty (Chief Medical Officer)",
        "is_active": True
    },
    {
        "name": "Hi-Tech Medical College & Emergency Hospital",
        "facility_type": "Hospital",
        "latitude": 22.2410,
        "longitude": 84.8290,
        "address": "Rourkela Bypass, Near Brahmani Bridge",
        "phone": "+91 661-2400500",
        "capacity": 300,
        "current_occupancy": 180,
        "contact_person": "Emergency Desk",
        "is_active": True
    },
    {
        "name": "CWS Hospital Sector 5 Emergency Center",
        "facility_type": "Hospital",
        "latitude": 22.2640,
        "longitude": 84.8490,
        "address": "Sector 5 Township, Rourkela",
        "phone": "+91 661-2642222",
        "capacity": 200,
        "current_occupancy": 95,
        "contact_person": "Medical Superintendent",
        "is_active": True
    },
    {
        "name": "NIT Rourkela Indoor Stadium Safe Shelter",
        "facility_type": "Safe Shelter",
        "latitude": 22.2505,
        "longitude": 84.9048,
        "address": "NIT Campus, Sector 1, Rourkela",
        "phone": "+91 661-2462020",
        "capacity": 1200,
        "current_occupancy": 340,
        "contact_person": "Prof. S. Das (Shelter Coordinator)",
        "is_active": True
    },
    {
        "name": "DAV Public School Sector 6 Cyclone & Flood Relief Shelter",
        "facility_type": "Safe Shelter",
        "latitude": 22.2680,
        "longitude": 84.8620,
        "address": "Sector 6 Housing Board, Rourkela",
        "phone": "+91 661-2640888",
        "capacity": 600,
        "current_occupancy": 210,
        "contact_person": "Principal Coordinator",
        "is_active": True
    },
    {
        "name": "Sector 19 Community Multi-Purpose Relief Hall",
        "facility_type": "Safe Shelter",
        "latitude": 22.2740,
        "longitude": 84.8710,
        "address": "Sector 19 Market Complex, Rourkela",
        "phone": "+91 94370 12345",
        "capacity": 800,
        "current_occupancy": 150,
        "contact_person": "District Red Cross Volunteer",
        "is_active": True
    },
    {
        "name": "Sector 6 Emergency Command & Control Room",
        "facility_type": "Emergency Control Room",
        "latitude": 22.2604,
        "longitude": 84.8536,
        "address": "Sector 6 Municipal Building",
        "phone": "1077 (Toll-Free Helpline)",
        "capacity": 100,
        "current_occupancy": 45,
        "contact_person": "District Magistrate Control Desk",
        "is_active": True
    },
    {
        "name": "Rourkela Central Fire Station & Rescue Depot",
        "facility_type": "Fire Station",
        "latitude": 22.2560,
        "longitude": 84.8450,
        "address": "Main Road, Sector 4, Rourkela",
        "phone": "101 / +91 661-2540101",
        "capacity": 50,
        "current_occupancy": 20,
        "contact_person": "Fire Station Officer",
        "is_active": True
    }
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

    # 5. Multi-Hazard Red Zones
    if db.query(models.RedZone).count() == 0:
        rz1 = models.RedZone(
            name="Wayanad Chooralmala Debris-Flow Belt",
            district="Wayanad",
            state="Kerala",
            hazard_type="Landslide",
            hazard_intensity=92.0,
            risk_level="CRITICAL_RED",
            latitude=11.6050,
            longitude=76.0830,
            radius_km=4.5,
            population_at_risk=2400,
            vulnerable_habitations_count=3,
            disaster_history_summary="Catastrophic hill-slope collapse & debris flows during extreme monsoon spells."
        )
        rz2 = models.RedZone(
            name="Brahmani River Sector 6 Inundation Zone",
            district="Rourkela",
            state="Odisha",
            hazard_type="Flood",
            hazard_intensity=88.0,
            risk_level="CRITICAL_RED",
            latitude=22.2604,
            longitude=84.8536,
            radius_km=6.0,
            population_at_risk=3500,
            vulnerable_habitations_count=4,
            disaster_history_summary="Annual river bank breach causing 2-3m flood inundation in low-lying housing."
        )
        rz3 = models.RedZone(
            name="Kendrapara Coastal Erosion Red Belt",
            district="Kendrapara",
            state="Odisha",
            hazard_type="Coastal Erosion",
            hazard_intensity=85.0,
            risk_level="HIGH_RISK",
            latitude=20.5000,
            longitude=86.7500,
            radius_km=8.0,
            population_at_risk=1800,
            vulnerable_habitations_count=2,
            disaster_history_summary="Active sea ingress eating 15m of shoreline annually during cyclonic surges."
        )
        rz4 = models.RedZone(
            name="Uttarkashi Mandakini Cloudburst Corridor",
            district="Uttarkashi",
            state="Uttarakhand",
            hazard_type="Cloudburst",
            hazard_intensity=90.0,
            risk_level="CRITICAL_RED",
            latitude=30.7300,
            longitude=78.4400,
            radius_km=5.0,
            population_at_risk=1200,
            vulnerable_habitations_count=2,
            disaster_history_summary="Sudden intense convective cloudbursts causing flash floods and rockfalls."
        )
        db.add_all([rz1, rz2, rz3, rz4])
        db.commit()

    # 6. Safer Relocation Sites
    if db.query(models.RelocationSite).count() == 0:
        s1 = models.RelocationSite(
            name="Meppadi Safe Tableland Colony Site A",
            district="Wayanad",
            latitude=11.5500,
            longitude=76.1200,
            total_area_sqkm=3.5,
            max_capacity_people=5000,
            current_occupied=900,
            elevation_m=280.0,
            slope_degree=3.2,
            soil_stability_index=94.0,
            distance_from_red_zone_km=14.2,
            infrastructure_score=88.0,
            suitability_score=92.0
        )
        s2 = models.RelocationSite(
            name="Sector 19 Safe Ridge Township Site B",
            district="Rourkela",
            latitude=22.2800,
            longitude=84.8800,
            total_area_sqkm=5.0,
            max_capacity_people=7500,
            current_occupied=1200,
            elevation_m=145.0,
            slope_degree=2.5,
            soil_stability_index=90.0,
            distance_from_red_zone_km=12.0,
            infrastructure_score=92.0,
            suitability_score=94.0
        )
        s3 = models.RelocationSite(
            name="Rajnagar Inland Safe Plateau Site C",
            district="Kendrapara",
            latitude=20.5800,
            longitude=86.6800,
            total_area_sqkm=4.0,
            max_capacity_people=4500,
            current_occupied=400,
            elevation_m=95.0,
            slope_degree=1.5,
            soil_stability_index=88.0,
            distance_from_red_zone_km=18.5,
            infrastructure_score=82.0,
            suitability_score=89.0
        )
        db.add_all([s1, s2, s3])
        db.commit()

    # 7. Vulnerable Habitations
    if db.query(models.VulnerableHabitation).count() == 0:
        rz_list = db.query(models.RedZone).all()
        rz_map = {rz.name: rz.id for rz in rz_list}

        h1 = models.VulnerableHabitation(
            name="Chooralmala Riverside Slum",
            district="Wayanad",
            red_zone_id=rz_map.get("Wayanad Chooralmala Debris-Flow Belt"),
            population=520,
            vulnerable_children_count=140,
            vulnerable_elderly_count=95,
            poverty_index=78.0,
            housing_type="Kutcha",
            disaster_history_count=6,
            latitude=11.6010,
            longitude=76.0810,
            relocation_priority_score=88.5,
            relocation_tier="IMMEDIATE"
        )
        h2 = models.VulnerableHabitation(
            name="Sector 6 Low-Lying Kutcha Settlement",
            district="Rourkela",
            red_zone_id=rz_map.get("Brahmani River Sector 6 Inundation Zone"),
            population=850,
            vulnerable_children_count=210,
            vulnerable_elderly_count=130,
            poverty_index=72.0,
            housing_type="Kutcha",
            disaster_history_count=4,
            latitude=22.2590,
            longitude=84.8520,
            relocation_priority_score=82.0,
            relocation_tier="IMMEDIATE"
        )
        h3 = models.VulnerableHabitation(
            name="Satabhaya Coastal Erosion Habitation",
            district="Kendrapara",
            red_zone_id=rz_map.get("Kendrapara Coastal Erosion Red Belt"),
            population=420,
            vulnerable_children_count=110,
            vulnerable_elderly_count=80,
            poverty_index=84.0,
            housing_type="Kutcha",
            disaster_history_count=5,
            latitude=20.5050,
            longitude=86.7450,
            relocation_priority_score=79.5,
            relocation_tier="IMMEDIATE"
        )
        h4 = models.VulnerableHabitation(
            name="Mandakini River Bank Colony",
            district="Uttarkashi",
            red_zone_id=rz_map.get("Uttarkashi Mandakini Cloudburst Corridor"),
            population=380,
            vulnerable_children_count=90,
            vulnerable_elderly_count=60,
            poverty_index=60.0,
            housing_type="Semi-Pucca",
            disaster_history_count=3,
            latitude=30.7280,
            longitude=78.4380,
            relocation_priority_score=68.0,
            relocation_tier="SHORT_TERM"
        )
        h5 = models.VulnerableHabitation(
            name="Panposh Buffer Extension Hamlet",
            district="Rourkela",
            red_zone_id=rz_map.get("Brahmani River Sector 6 Inundation Zone"),
            population=310,
            vulnerable_children_count=50,
            vulnerable_elderly_count=30,
            poverty_index=45.0,
            housing_type="Pucca",
            disaster_history_count=1,
            latitude=22.2520,
            longitude=84.8420,
            relocation_priority_score=42.0,
            relocation_tier="MEDIUM_TERM"
        )
        db.add_all([h1, h2, h3, h4, h5])
        db.commit()

    return {
        "status": "success",
        "message": "Synthetic Disaster Platform & Proactive SDMA Relocation demo data successfully seeded!",
        "incidents_count": db.query(models.Incident).count(),
        "resources_count": db.query(models.Resource).count(),
        "facilities_count": db.query(models.CriticalFacility).count(),
        "alerts_count": db.query(models.DisasterAlert).count(),
        "red_zones_count": db.query(models.RedZone).count(),
        "relocation_sites_count": db.query(models.RelocationSite).count(),
        "vulnerable_habitations_count": db.query(models.VulnerableHabitation).count()
    }

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reset all database tables and re-seed clean synthetic Rourkela & SDMA state."""
    db.query(models.AuditEvent).delete()
    db.query(models.Assignment).delete()
    db.query(models.Incident).delete()
    db.query(models.Resource).delete()
    db.query(models.CriticalFacility).delete()
    db.query(models.DisasterAlert).delete()
    db.query(models.VulnerableHabitation).delete()
    db.query(models.RelocationSite).delete()
    db.query(models.RedZone).delete()
    db.commit()

    return seed_demo_data(db)

