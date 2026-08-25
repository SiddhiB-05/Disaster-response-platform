import pytest
from app.ai.gemini_service import gemini_extractor

def test_heuristic_nlp_extraction_numbers_and_vulnerability():
    text = "Water has entered several houses and 8 people are trapped inside. Two of them are elderly."
    extracted = gemini_extractor._heuristic_fallback_extraction(text, "Flood")

    assert extracted["incident_type"] == "FLOOD_WATER_RESCUE"
    assert extracted["people_affected"] == 8
    assert extracted["vulnerable_people"] is True
    assert extracted["severity"] == "HIGH"
    assert "rescue_boat" in extracted["needs"]

def test_heuristic_nlp_medical_extraction():
    text = "An elderly stroke patient needs urgent medical evacuation as water is rising near the house."
    extracted = gemini_extractor._heuristic_fallback_extraction(text, "Medical Emergency")

    assert extracted["incident_type"] == "MEDICAL_EMERGENCY"
    assert extracted["vulnerable_people"] is True
    assert extracted["severity"] == "HIGH"
    assert "medical_support" in extracted["needs"]

def test_explicit_people_count_override():
    text = "Flood in sector 6"
    extracted = gemini_extractor.extract_incident_metadata(text, "Flood", explicit_people_count=12)

    assert extracted["people_affected"] == 12
