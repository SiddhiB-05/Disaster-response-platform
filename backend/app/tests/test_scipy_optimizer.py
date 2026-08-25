import pytest
from app.allocation.matching_engine import matching_engine

def test_scipy_bipartite_matching_exact_capability():
    incidents = [
        {
            "id": 1,
            "public_ref": "INC-001",
            "location_name": "Sector 6 Flood Zone",
            "incident_type": "FLOOD_WATER_RESCUE",
            "latitude": 22.2604,
            "longitude": 84.8536,
            "priority_score": 85.0,
            "priority_category": "HIGH",
            "people_affected": 8,
            "vulnerable_people": True
        }
    ]

    resources = [
        {
            "id": 10,
            "public_ref": "RES-010",
            "name": "ODRAF Boat Unit 1",
            "type": "NDRF/Rescue Team",
            "capability": "water_rescue,boat,flood",
            "capacity": 10,
            "latitude": 22.2570,
            "longitude": 84.8480,
            "status": "AVAILABLE"
        },
        {
            "id": 11,
            "public_ref": "RES-011",
            "name": "Fire Tender Unit 01",
            "type": "Fire Truck",
            "capability": "fire,fire_suppression",
            "capacity": 5,
            "latitude": 22.2560,
            "longitude": 84.8450,
            "status": "AVAILABLE"
        }
    ]

    res = matching_engine.optimize_bipartite_assignment(incidents, resources)
    assert res["total_assigned"] == 1
    assignment = res["assignments"][0]
    assert assignment["incident_id"] == 1
    assert assignment["recommended_resource_id"] == 10  # Selected boat unit over fire truck
    assert assignment["is_compatible"] is True

def test_scipy_high_priority_scarcity_allocation():
    # Two incidents: Incident 1 is Critical (Score 95), Incident 2 is Low (Score 25)
    incidents = [
        {
            "id": 1,
            "location_name": "Hospital Flooded",
            "incident_type": "MEDICAL_EMERGENCY",
            "latitude": 22.2600,
            "longitude": 84.8500,
            "priority_score": 95.0,
            "priority_category": "HIGH"
        },
        {
            "id": 2,
            "location_name": "Small Road Debris",
            "incident_type": "MEDICAL_EMERGENCY",
            "latitude": 22.2550,
            "longitude": 84.8490,
            "priority_score": 25.0,
            "priority_category": "LOW"
        }
    ]

    # Only 1 ambulance available
    resources = [
        {
            "id": 101,
            "name": "ALS Ambulance 01",
            "type": "Ambulance",
            "capability": "medical,ambulance",
            "capacity": 2,
            "latitude": 22.2540,
            "longitude": 84.8480,
            "status": "AVAILABLE"
        }
    ]

    res = matching_engine.optimize_bipartite_assignment(incidents, resources)
    assert res["total_assigned"] == 1
    # Critical incident #1 must get the scarce ambulance despite incident #2 being 100 meters closer to resource!
    assert res["assignments"][0]["incident_id"] == 1

def test_empty_optimization_inputs():
    res = matching_engine.optimize_bipartite_assignment([], [])
    assert res["total_assigned"] == 0
    assert res["assignments"] == []
