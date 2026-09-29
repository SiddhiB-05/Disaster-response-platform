from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.database import Base

def generate_public_ref(prefix: str) -> str:
    """Generate a clean public reference string, e.g. INC-2026-A1B2."""
    short_hash = uuid.uuid4().hex[:6].upper()
    year = datetime.utcnow().year
    return f"{prefix}-{year}-{short_hash}"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("INC"))
    alert_id = Column(Integer, ForeignKey("disaster_alerts.id"), nullable=True)
    
    incident_type = Column(String, nullable=False, index=True)
    location_name = Column(String, nullable=False)
    district = Column(String, default="Rourkela", index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    raw_description = Column(Text, nullable=False)
    
    # Optional Citizen Contact Info
    reporter_name = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    
    # Extracted AI Fields
    ai_severity = Column(String, default="MEDIUM")       # HIGH, MEDIUM, LOW, CRITICAL
    people_affected = Column(Integer, default=1)
    vulnerable_people = Column(Boolean, default=False)
    urgency = Column(String, default="MEDIUM")
    extraction_confidence = Column(Float, default=1.0)
    extraction_notes = Column(JSON, nullable=True)        # List of notes or warnings
    nlp_source = Column(String, default="fallback")        # gemini or fallback
    
    # Priority Engine Output
    priority_score = Column(Float, default=0.0, index=True) # 0-100
    priority_category = Column(String, default="LOW", index=True) # HIGH, MEDIUM, LOW
    score_breakdown = Column(JSON, nullable=True)
    
    # Operational Lifecycle
    status = Column(String, default="REPORTED", index=True) # REPORTED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED
    duplicate_warning = Column(Boolean, default=False)
    assigned_resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    
    # Reporter Contact & Media Info
    photo_url = Column(String, nullable=True)
    reporter_phone = Column(String, nullable=True)
    severity_color = Column(String, default="GREEN")       # RED, ORANGE, GREEN

    reported_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Backward Compatibility attribute alias for created_at
    @property
    def created_at(self):
        return self.reported_at

    @property
    def description(self):
        return self.raw_description

    # Relationships
    alert = relationship("DisasterAlert", back_populates="incidents")
    assigned_resource = relationship("Resource", back_populates="assigned_incidents")
    assignments = relationship("Assignment", back_populates="incident", cascade="all, delete-orphan")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("RES"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)           # Ambulance, Rescue Boat, Fire Truck, NDRF/Rescue Team, Police Unit, Relief Vehicle
    capability = Column(String, nullable=False)     # Comma-separated capabilities, e.g. "water_rescue,medical"
    capacity = Column(Integer, default=10)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="AVAILABLE", index=True) # AVAILABLE, RESERVED, BUSY, OFFLINE
    is_demo = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_incidents = relationship("Incident", back_populates="assigned_resource")
    assignments = relationship("Assignment", back_populates="resource")

class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("ALT"))
    hazard_type = Column(String, nullable=False)     # Flood, Cyclone, Landslide, Severe Weather
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)       # Severe, Warning, Advisory
    district = Column(String, nullable=False, default="Rourkela")
    latitude = Column(Float, default=22.2604)
    longitude = Column(Float, default=84.8536)
    radius_km = Column(Float, default=15.0)
    source = Column(String, default="State Disaster Management Authority")
    is_synthetic = Column(Boolean, default=True)
    status = Column(String, default="ACTIVE", index=True) # ACTIVE, RESOLVED
    
    starts_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Backward compatibility properties
    @property
    def alert_type(self):
        return self.hazard_type
    
    @property
    def message(self):
        return self.description

    @property
    def is_active(self):
        return self.status == "ACTIVE"

    @property
    def simulated(self):
        return self.is_synthetic

    @property
    def timestamp(self):
        return self.created_at

    incidents = relationship("Incident", back_populates="alert")

class CriticalFacility(Base):
    __tablename__ = "critical_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    facility_type = Column(String, nullable=False)  # Hospital, Safe Shelter, Fire Station, Police Station, Emergency Control Room
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=120)
    contact_person = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, index=True)
    optimization_run_id = Column(String, nullable=True)
    
    distance_km = Column(Float, nullable=False)
    estimated_travel_minutes = Column(Float, default=15.0)
    compatibility_score = Column(Float, default=1.0)
    optimizer_cost = Column(Float, default=0.0)
    reason = Column(Text, nullable=True)
    
    status = Column(String, default="RECOMMENDED", index=True) # RECOMMENDED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    assigned_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True) # Incident, Resource, Alert, Assignment, RedZone, RelocationSite
    entity_id = Column(Integer, nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)  # CREATED, STATUS_CHANGED, DISPATCHED, RECALCULATED, RED_ZONE_UPDATED
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    actor = Column(String, default="system")                 # citizen, authority, system
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class RedZone(Base):
    __tablename__ = "red_zones"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("RED"))
    name = Column(String, nullable=False)
    district = Column(String, nullable=False, default="State Region")
    state = Column(String, nullable=False, default="Odisha / Multi-State")
    hazard_type = Column(String, nullable=False) # Landslide, Flood, Coastal Erosion, Cloudburst, Multi-Hazard
    hazard_intensity = Column(Float, default=85.0) # 0 to 100
    risk_level = Column(String, default="HIGH_RISK") # CRITICAL_RED, HIGH_RISK, MODERATE_WARNING
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=5.0)
    polygon_geojson = Column(JSON, nullable=True)
    
    population_at_risk = Column(Integer, default=1500)
    vulnerable_habitations_count = Column(Integer, default=3)
    disaster_history_summary = Column(Text, nullable=True)
    status = Column(String, default="ACTIVE_RED_ZONE", index=True) # ACTIVE_RED_ZONE, WARNING_ZONE, MITIGATED
    
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    habitations = relationship("VulnerableHabitation", back_populates="red_zone", cascade="all, delete-orphan")


class RelocationSite(Base):
    __tablename__ = "relocation_sites"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("SIT"))
    name = Column(String, nullable=False)
    district = Column(String, nullable=False, default="State Region")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    total_area_sqkm = Column(Float, default=2.5)
    max_capacity_people = Column(Integer, default=5000)
    current_occupied = Column(Integer, default=800)
    
    elevation_m = Column(Float, default=120.0)
    slope_degree = Column(Float, default=4.5)
    soil_stability_index = Column(Float, default=88.0)
    distance_from_red_zone_km = Column(Float, default=14.5)
    infrastructure_score = Column(Float, default=82.0)
    
    suitability_score = Column(Float, default=85.0)
    status = Column(String, default="OPTIMAL", index=True) # OPTIMAL, NEAR_CAPACITY, FULL
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    habitations = relationship("VulnerableHabitation", back_populates="assigned_site")


class VulnerableHabitation(Base):
    __tablename__ = "vulnerable_habitations"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("HAB"))
    name = Column(String, nullable=False)
    district = Column(String, nullable=False, default="State Region")
    
    red_zone_id = Column(Integer, ForeignKey("red_zones.id"), nullable=True)
    assigned_site_id = Column(Integer, ForeignKey("relocation_sites.id"), nullable=True)
    
    population = Column(Integer, default=450)
    vulnerable_children_count = Column(Integer, default=120)
    vulnerable_elderly_count = Column(Integer, default=80)
    poverty_index = Column(Float, default=65.0)
    housing_type = Column(String, default="Kutcha") # Kutcha, Semi-Pucca, Pucca
    disaster_history_count = Column(Integer, default=4)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    relocation_priority_score = Column(Float, default=0.0, index=True)
    relocation_tier = Column(String, default="IMMEDIATE", index=True) # IMMEDIATE, SHORT_TERM, MEDIUM_TERM
    relocation_status = Column(String, default="PENDING_RELOCATION", index=True)
    
    scoring_breakdown = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    red_zone = relationship("RedZone", back_populates="habitations")
    assigned_site = relationship("RelocationSite", back_populates="habitations")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    public_ref = Column(String, unique=True, index=True, default=lambda: generate_public_ref("OFF"))
    officer_id = Column(String, unique=True, index=True, nullable=False) # e.g. OFF-191-SDMA
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    department = Column(String, default="State Disaster Management Authority (SDMA)")
    role = Column(String, default="Government Officer")
    badge_number = Column(String, nullable=True)
    district = Column(String, default="Rourkela Zone")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

