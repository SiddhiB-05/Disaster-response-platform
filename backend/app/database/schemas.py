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


# Red Zone Schemas
class RedZoneCreate(BaseModel):
    name: str = Field(..., example="Wayanad Landslide Hazard Belt Zone A")
    district: str = Field(..., example="Wayanad")
    state: str = Field("Kerala", example="Kerala")
    hazard_type: str = Field(..., example="Landslide") # Landslide, Flood, Coastal Erosion, Cloudburst, Multi-Hazard
    hazard_intensity: float = Field(85.0, example=85.0)
    risk_level: str = Field("CRITICAL_RED", example="CRITICAL_RED")
    latitude: float = Field(..., example=11.6050)
    longitude: float = Field(..., example=76.0830)
    radius_km: float = Field(5.0, example=5.0)
    population_at_risk: int = Field(1500, example=1500)
    disaster_history_summary: Optional[str] = "Frequent debris flows & slope failures during monsoon."

class RedZoneResponse(BaseModel):
    id: int
    public_ref: str
    name: str
    district: str
    state: str
    hazard_type: str
    hazard_intensity: float
    risk_level: str
    latitude: float
    longitude: float
    radius_km: float
    polygon_geojson: Optional[Dict[str, Any]] = None
    population_at_risk: int
    vulnerable_habitations_count: int
    disaster_history_summary: Optional[str] = None
    status: str
    last_updated_at: datetime

    class Config:
        from_attributes = True


# Relocation Site Schemas
class RelocationSiteCreate(BaseModel):
    name: str = Field(..., example="Meppadi Safe Tableland Colony Site B")
    district: str = Field(..., example="Wayanad")
    latitude: float = Field(..., example=11.5500)
    longitude: float = Field(..., example=76.1200)
    total_area_sqkm: float = Field(3.0, example=3.0)
    max_capacity_people: int = Field(4000, example=4000)
    elevation_m: float = Field(240.0, example=240.0)
    slope_degree: float = Field(3.5, example=3.5)
    soil_stability_index: float = Field(92.0, example=92.0)
    distance_from_red_zone_km: float = Field(12.5, example=12.5)
    infrastructure_score: float = Field(88.0, example=88.0)

class RelocationSiteResponse(BaseModel):
    id: int
    public_ref: str
    name: str
    district: str
    latitude: float
    longitude: float
    total_area_sqkm: float
    max_capacity_people: int
    current_occupied: int
    remaining_capacity: float
    elevation_m: float
    slope_degree: float
    soil_stability_index: float
    distance_from_red_zone_km: float
    infrastructure_score: float
    suitability_score: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Vulnerable Habitation Schemas
class VulnerableHabitationCreate(BaseModel):
    name: str = Field(..., example="Chooralmala Riverside Settlement")
    district: str = Field(..., example="Wayanad")
    red_zone_id: Optional[int] = None
    population: int = Field(520, example=520)
    vulnerable_children_count: int = Field(140, example=140)
    vulnerable_elderly_count: int = Field(95, example=95)
    poverty_index: float = Field(72.0, example=72.0)
    housing_type: str = Field("Kutcha", example="Kutcha")
    disaster_history_count: int = Field(5, example=5)
    latitude: float = Field(..., example=11.6010)
    longitude: float = Field(..., example=76.0810)

class VulnerableHabitationResponse(BaseModel):
    id: int
    public_ref: str
    name: str
    district: str
    red_zone_id: Optional[int] = None
    assigned_site_id: Optional[int] = None
    population: int
    vulnerable_children_count: int
    vulnerable_elderly_count: int
    poverty_index: float
    housing_type: str
    disaster_history_count: int
    latitude: float
    longitude: float
    relocation_priority_score: float
    relocation_tier: str
    relocation_status: str
    scoring_breakdown: Optional[Dict[str, Any]] = None
    updated_at: datetime

    class Config:
        from_attributes = True


# SDMA Policy Brief Schema
class SDMAPolicyReportRequest(BaseModel):
    district: Optional[str] = "All Districts"
    target_state: Optional[str] = "Odisha & Vulnerable States"


# Auth / User Schemas
class UserSignup(BaseModel):
    full_name: str = Field(..., example="Commander Rajesh Sharma")
    officer_id: str = Field(..., example="OFF-191-SDMA")
    email: str = Field(..., example="officer.sih@sdma.gov.in")
    password: str = Field(..., example="disaster123")
    department: Optional[str] = Field("State Disaster Management Authority (SDMA)", example="State Disaster Management Authority (SDMA)")
    role: Optional[str] = Field("Government Officer", example="Government Officer")
    district: Optional[str] = Field("Rourkela Zone", example="Rourkela Zone")
    badge_number: Optional[str] = Field(None, example="SDMA-7892")

class UserLogin(BaseModel):
    officer_id_or_email: str = Field(..., example="OFF-191-SDMA")
    password: str = Field(..., example="disaster123")

class UserResponse(BaseModel):
    id: int
    public_ref: str
    officer_id: str
    email: str
    full_name: str
    department: str
    role: str
    district: str
    badge_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse

