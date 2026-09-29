import pytest
from app.scoring.relocation_engine import relocation_engine

def test_habitation_priority_calculation():
    # Test Immediate Tier Assignment
    res = relocation_engine.calculate_habitation_priority(
        hazard_intensity=90.0,
        population=500,
        vulnerable_children=150,
        vulnerable_elderly=100,
        poverty_index=75.0,
        housing_type="Kutcha",
        disaster_history_count=5
    )
    assert res["score"] >= 75.0
    assert res["tier"] == "IMMEDIATE"

def test_site_suitability_calculation():
    score = relocation_engine.calculate_site_suitability(
        elevation_m=200.0,
        slope_degree=4.0,
        soil_stability=90.0,
        dist_from_red_zone_km=15.0,
        infra_rating=85.0
    )
    assert score >= 80.0

def test_carrying_capacity_allocation():
    habitations = [
        {
            "id": 1,
            "name": "Habitation A",
            "population": 400,
            "latitude": 22.26,
            "longitude": 84.85,
            "relocation_priority_score": 90.0,
            "relocation_tier": "IMMEDIATE"
        }
    ]
    sites = [
        {
            "id": 10,
            "name": "Safe Site 1",
            "max_capacity_people": 2000,
            "current_occupied": 200,
            "latitude": 22.28,
            "longitude": 84.88,
            "suitability_score": 92.0
        }
    ]
    res = relocation_engine.optimize_relocation_allocation(habitations, sites)
    assert res["successfully_allocated"] == 1
    assert res["allocations"][0]["allocated_site_id"] == 10
