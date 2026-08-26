from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# Incident Schemas
class IncidentCreate(BaseModel):
    location_name: str = Field(..., example="Sector 6, Rourkela")
    district: Optional[str] = Field("Rourkela", example="Rourkela")
    latitude: Optional[float] = Field(None, example=22.2612)
    longitude: Optional[float] = Field(None, example=84.8542)
    incident_type: str = Field(..., example="Flood/Water Rescue")
    description: str = Field(..., example="Water has entered several houses and 8 people are trapped. Two of them are elderly.")
    reporter_name: Optional[str] = Field(None, example="Siddhi B")
    contact_phone: Optional[str] = Field(None, example="+91 9876543210")
    reporter_phone: Optional[str] = Field(None, example="+91 9876543210")
    photo_url: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1547683905-f686c993aae5")
    people_affected: Optional[int] = Field(None, example=8)

class IncidentStatusUpdate(BaseModel):
    status: str # REPORTED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED

class IncidentResponse(BaseModel):
    id: int
    public_ref: Optional[str] = None
    alert_id: Optional[int] = None
    location_name: str
    district: str
    latitude: float
    longitude: float
    incident_type: str
    raw_description: str
    description: str
    reporter_name: Optional[str] = None
    contact_phone: Optional[str] = None
    reporter_phone: Optional[str] = None
    photo_url: Optional[str] = None
    severity_color: Optional[str] = "GREEN"
    ai_severity: str
    people_affected: int
    vulnerable_people: bool
    urgency: str
    extraction_confidence: float
    extraction_notes: Optional[List[str]] = None
    nlp_source: str
    priority_score: float
    priority_category: str
    score_breakdown: Optional[Dict[str, Any]] = None
    status: str
    duplicate_warning: bool
    assigned_resource_id: Optional[int] = None
    reported_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceCreate(BaseModel):
    name: str = Field(..., example="ODRAF Rescue Team Alpha")
    type: str = Field(..., example="Rescue Team")
    capability: str = Field(..., example="water_rescue,medical")
    latitude: float = Field(..., example=22.2570)
    longitude: float = Field(..., example=84.8480)
    capacity: int = Field(15, example=15)
    status: str = Field("AVAILABLE", example="AVAILABLE")

class ResourceResponse(BaseModel):
    id: int
    public_ref: Optional[str] = None
    name: str
    type: str
    capability: str
    capacity: int
    latitude: float
    longitude: float
    status: str
    is_demo: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class ResourceStatusUpdate(BaseModel):
    status: str  # AVAILABLE, RESERVED, BUSY, OFFLINE

# Disaster Alert Schemas
class DisasterAlertCreate(BaseModel):
    hazard_type: str = Field(..., example="Flood")
    title: str = Field(..., example="Brahmani River Basin Flash Flood Warning")
    description: str = Field(..., example="High water levels expected along sector 6 and sector 8 low-lying areas.")
    severity: str = Field("Severe", example="Severe")
    district: Optional[str] = "Rourkela"
    latitude: Optional[float] = 22.2604
    longitude: Optional[float] = 84.8536
    radius_km: Optional[float] = 15.0
    is_synthetic: Optional[bool] = True

class DisasterAlertResponse(BaseModel):
    id: int
    public_ref: Optional[str] = None
    hazard_type: str
    alert_type: str
    title: Optional[str] = None
    description: str
    message: str
    severity: str
    district: str
    latitude: float
    longitude: float
    radius_km: float
    source: str
    is_synthetic: bool
    simulated: bool
    status: str
    is_active: bool
    starts_at: datetime
    created_at: datetime
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
    address: Optional[str] = None
    phone: Optional[str] = None
    capacity: Optional[int] = 500
    current_occupancy: Optional[int] = 120
    contact_person: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentRequest(BaseModel):
    incident_id: int
    resource_id: int

class AssignmentConfirmRequest(BaseModel):
    incident_id: int
    resource_id: int
    reason: Optional[str] = None

class AssignmentStatusUpdate(BaseModel):
    status: str # RECOMMENDED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

class AssignmentResponse(BaseModel):
    id: int
    incident_id: int
    resource_id: int
    optimization_run_id: Optional[str] = None
    distance_km: float
    estimated_travel_minutes: float
    compatibility_score: float
    optimizer_cost: float
    reason: Optional[str] = None
    status: str
    assigned_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    incident: Optional[IncidentResponse] = None
    resource: Optional[ResourceResponse] = None

    class Config:
        from_attributes = True

# SciPy Optimization Output Schema
class RecommendationItem(BaseModel):
    incident_id: int
    incident_ref: Optional[str] = None
    incident_location: str
    incident_type: str
    priority_score: float
    priority_category: str
    people_affected: int
    vulnerable_people: bool
    recommended_resource_id: int
    recommended_resource_ref: Optional[str] = None
    recommended_resource_name: str
    recommended_resource_type: str
    distance_km: float
    eta_minutes: float
    compatibility_score: float
    optimizer_cost: float
    is_compatible: bool
    match_status: str
    rationale: str

class OptimizationResponse(BaseModel):
    optimization_run_id: str
    total_incidents_processed: int
    total_resources_available: int
    total_assigned: int
    execution_time_ms: float
    assignments: List[RecommendationItem]

# Audit Event Schema
class AuditEventResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    event_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    actor: str
    metadata_json: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
