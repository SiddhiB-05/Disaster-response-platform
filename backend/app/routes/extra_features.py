from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.config import settings
from app.ai.gemini_service import gemini_extractor

router = APIRouter(prefix="/api/v1", tags=["Advanced Disaster Features"])

class ChatbotRequest(BaseModel):
    message: str = Field(..., example="What should I do if flood water enters my home?")
    disaster_type: Optional[str] = Field("Flood", example="Flood")
    location: Optional[str] = Field("Sector 6, Rourkela", example="Sector 6, Rourkela")

class ChatbotResponse(BaseModel):
    response: str
    suggested_actions: List[str]
    emergency_contacts: List[Dict[str, str]]
    source: str

@router.get("/weather/telemetry")
def get_weather_telemetry():
    """
    Live/Simulated Weather Telemetry & Early Risk Prediction Engine for Rourkela Zone.
    """
    return {
        "location": "Rourkela Sector 6 Disaster Zone",
        "district": "Sundargarh, Odisha",
        "latitude": settings.DEFAULT_LAT,
        "longitude": settings.DEFAULT_LON,
        "timestamp": datetime.utcnow().isoformat(),
        "current_weather": {
            "temperature_c": 28.5,
            "condition": "Heavy Rainfall & Thunderstorm",
            "rainfall_mm_per_hr": 48.2,
            "wind_speed_kmh": 65.0,
            "humidity_percent": 94,
            "pressure_hpa": 998.2
        },
        "river_monitoring": {
            "river_name": "Brahmani River Basin",
            "current_water_level_meters": 12.8,
            "danger_level_meters": 14.0,
            "status": "HIGH_ALERT",
            "discharge_rate_cusecs": 145000
        },
        "risk_prediction": {
            "overall_risk_score": 84.5,
            "risk_level": "RED (CRITICAL)",
            "predicted_hazard": "Brahmani River Inundation & Flash Flood",
            "vulnerable_sectors": [
                "Sector 6 Housing Board Low-Lying Zone",
                "Sector 8 Market Complex Basin",
                "Brahmani Highway Bridge Approach Road"
            ],
            "recommended_early_action": "Issue evacuation advisory for Sector 6 low-lying quarters; position ODRAF water rescue boats at Sector 4 Fire Station."
        },
        "historical_memory": {
            "total_historical_incidents_analyzed": 8173,
            "historical_peak_monsoon_month": "August - September",
            "matching_historical_pattern": "Simulated match with August 2020 Brahmani Flood Surge (92% pattern match)."
        }
    }

@router.post("/chatbot/message", response_model=ChatbotResponse)
def get_chatbot_guidance(req: ChatbotRequest):
    """
    AI Emergency Chatbot Assistant: Dynamically generates step-by-step disaster guidance using Gemini 1.5/2.5 Flash API with model fallbacks.
    """
    result = gemini_extractor.generate_chatbot_response(
        message=req.message,
        disaster_type=req.disaster_type or "Flood",
        location=req.location or "Sector 6, Rourkela"
    )
    
    return ChatbotResponse(
        response=result.get("response", "Stay safe and follow emergency instructions."),
        suggested_actions=result.get("suggested_actions", ["Submit Incident Report", "Call Helpline (1077)"]),
        emergency_contacts=result.get("emergency_contacts", [
            {"name": "Rourkela Emergency Control Desk", "number": "1077"},
            {"name": "Fire & Rescue Station", "number": "101"},
            {"name": "Ambulance Response Unit", "number": "108"}
        ]),
        source=result.get("source", "Gemini AI Assistant")
    )



@router.get("/emergency/contacts")
def get_emergency_contacts():
    """
    Offline Emergency Helplines & Survival Checklists.
    """
    return {
        "state": "Odisha, India",
        "district": "Rourkela (Sundargarh)",
        "helplines": [
            {"service": "District Disaster Helpline", "number": "1077", "type": "Toll-Free 24/7"},
            {"service": "NDRF Emergency Helpline", "number": "1078", "type": "National Response"},
            {"service": "Medical Ambulance", "number": "108", "type": "Emergency Health"},
            {"service": "Fire & Rescue Service", "number": "101", "type": "Fire Dep't"},
            {"service": "Police Emergency", "number": "112 / 100", "type": "Law & Order"},
            {"service": "ODRAF Rourkela Base", "number": "+91 661-2540101", "type": "Water Rescue Squad"}
        ],
        "offline_safety_protocols": [
            "Keep emergency kit ready with torch, power bank, dry food, clean drinking water, and essential medicines.",
            "Store emergency numbers offline on your mobile SIM.",
            "If mobile networks fail, tune into All India Radio Rourkela (102.6 FM) for official disaster broadcasts."
        ]
    }
