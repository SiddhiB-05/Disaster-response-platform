from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Incident Schemas
class IncidentCreate(BaseModel):
    location_name: str = Field(..., example="Sector 6, Rourkela")
    latitude: Optional[float] = Field(None, example=22.2604)
    longitude: Optional[float] = Field(None, example=84.8536)
    incident_type: str = Field(..., example="Flood")
    description: str = Field(..., example="8 people are trapped inside their houses due to high flood water.")

class IncidentResponse(BaseModel):
    id: int
    location_name: str
    latitude: float
    longitude: float
    incident_type: str
    description: str
    ai_severity: str
    people_affected: int
    vulnerable_people: bool
    urgency: str
    priority_score: float
    priority_category: str
    score_breakdown: Optional[Dict[str, Any]] = None
    status: str
    assigned_resource_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceCreate(BaseModel):
    name: str
    type: str
    capability: str
    latitude: float
    longitude: float
    capacity: int = 10
    status: str = "AVAILABLE"

class ResourceResponse(BaseModel):
    id: int
    name: str
    type: str
    capability: str
    latitude: float
    longitude: float
    capacity: int
    status: str
    is_demo: bool

    class Config:
        from_attributes = True

class ResourceStatusUpdate(BaseModel):
    status: str  # AVAILABLE, ASSIGNED, BUSY, OFFLINE

# Disaster Alert Schemas
class DisasterAlertCreate(BaseModel):
    alert_type: str = Field(..., example="Flood")
    district: str = Field(..., example="Rourkela")
    severity: str = Field(..., example="Severe")
    message: str = Field(..., example="FLASH FLOOD ALERT: Water levels rising rapidly in Sector 6 & Sector 8.")

class DisasterAlertResponse(BaseModel):
    id: int
    alert_type: str
    district: str
    severity: str
    message: str
    is_active: bool
    simulated: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# Critical Facility Schema
class CriticalFacilityResponse(BaseModel):
    id: int
    name: str
    facility_type: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentRequest(BaseModel):
    incident_id: int
    resource_id: int

class AssignmentResponse(BaseModel):
    id: int
    incident_id: int
    resource_id: int
    distance_km: float
    status: str
    assigned_at: datetime
    incident: Optional[IncidentResponse] = None
    resource: Optional[ResourceResponse] = None

    class Config:
        from_attributes = True

# SciPy Optimization Output Schema
class RecommendationItem(BaseModel):
    incident_id: int
    incident_location: str
    incident_type: str
    priority_score: float
    recommended_resource_id: int
    recommended_resource_name: str
    recommended_resource_type: str
    distance_km: float
    match_status: str

class OptimizationResponse(BaseModel):
    total_incidents_processed: int
    total_assigned: int
    assignments: List[RecommendationItem]
