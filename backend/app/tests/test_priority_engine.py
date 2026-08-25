import pytest
from app.scoring.priority_engine import priority_engine, haversine_distance

def test_haversine_known_distances():
    # Rourkela Sector 6 HQ (22.2604, 84.8536) to RGH Hospital (22.2530, 84.8510)
    dist = haversine_distance(22.2604, 84.8536, 22.2530, 84.8510)
    assert 0.7 <= dist <= 1.1, f"Expected distance ~0.87km, got {dist}"

    # Symmetry test
    dist_rev = haversine_distance(22.2530, 84.8510, 22.2604, 84.8536)
    assert dist == dist_rev

    # Same point test
    dist_zero = haversine_distance(22.2604, 84.8536, 22.2604, 84.8536)
    assert dist_zero == 0.0

def test_vulnerability_promotion_rule():
    facilities = [{"name": "RGH", "latitude": 22.2604, "longitude": 84.8536}]
    resources = [{"latitude": 22.2604, "longitude": 84.8536}]

    # Without vulnerable people -> MEDIUM severity (50 norm)
    res1 = priority_engine.calculate_priority(
        severity="MEDIUM",
        people_affected=2,
        vulnerable_people=False,
        incident_lat=22.2604,
        incident_lon=84.8536,
        facilities=facilities,
        available_resources=resources
    )

    # With vulnerable people -> promoted to HIGH severity (80 norm)
    res2 = priority_engine.calculate_priority(
        severity="MEDIUM",
        people_affected=2,
        vulnerable_people=True,
        incident_lat=22.2604,
        incident_lon=84.8536,
        facilities=facilities,
        available_resources=resources
    )

    assert res2["priority_score"] > res1["priority_score"]
    assert res2["score_breakdown"]["components"]["severity"]["effective_severity"] == "HIGH"

def test_exact_boundary_classifications():
    facilities = [{"name": "RGH", "latitude": 22.2604, "longitude": 84.8536}]
    resources = [{"latitude": 22.2604, "longitude": 84.8536}]

    # Low priority scenario
    res_low = priority_engine.calculate_priority(
        severity="LOW",
        people_affected=1,
        vulnerable_people=False,
        incident_lat=22.2604,
        incident_lon=84.8536,
        facilities=[],
        available_resources=[],
        elapsed_minutes=0.0
    )
    assert res_low["priority_score"] <= 39
    assert res_low["priority_category"] == "LOW"

    # Critical / High priority scenario
    res_high = priority_engine.calculate_priority(
        severity="CRITICAL",
        people_affected=15,
        vulnerable_people=True,
        incident_lat=22.2604,
        incident_lon=84.8536,
        facilities=facilities,
        available_resources=resources,
        elapsed_minutes=60.0
    )
    assert res_high["priority_score"] >= 70
    assert res_high["priority_category"] == "HIGH"
