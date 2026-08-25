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
    facility_type = Column(String, nullable=False)  # Hospital, Fire Station, Police Station, Shelter, Emergency Control Room
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
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
    entity_type = Column(String, nullable=False, index=True) # Incident, Resource, Alert, Assignment
    entity_id = Column(Integer, nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)  # CREATED, STATUS_CHANGED, DISPATCHED, RECALCULATED
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    actor = Column(String, default="system")                 # citizen, authority, system
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
