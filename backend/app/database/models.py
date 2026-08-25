from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    incident_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    # Structured AI fields
    ai_severity = Column(String, default="Medium")  # High, Medium, Low
    people_affected = Column(Integer, default=1)
    vulnerable_people = Column(Boolean, default=False)
    urgency = Column(String, default="Medium")      # High, Medium, Low
    
    # Calculated fields
    priority_score = Column(Float, default=0.0)      # 0-100
    priority_category = Column(String, default="LOW")# HIGH, MEDIUM, LOW
    score_breakdown = Column(JSON, nullable=True)   # Score breakdown dictionary
    
    # Operational fields
    status = Column(String, default="UNASSIGNED")   # UNASSIGNED, ASSIGNED, RESOLVED
    assigned_resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    assigned_resource = relationship("Resource", back_populates="assigned_incidents")
    assignments = relationship("Assignment", back_populates="incident")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)           # Rescue Team, Medical Team, Ambulance, Fire Brigade
    capability = Column(String, nullable=False)     # Comma-separated or JSON string, e.g. "Flood,Landslide"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=10)
    status = Column(String, default="AVAILABLE")    # AVAILABLE, ASSIGNED, BUSY, OFFLINE
    is_demo = Column(Boolean, default=True)
    
    # Relationships
    assigned_incidents = relationship("Incident", back_populates="assigned_resource")
    assignments = relationship("Assignment", back_populates="resource")

class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, nullable=False)     # Flood, Cyclone, Landslide, Severe Weather
    district = Column(String, nullable=False)
    severity = Column(String, nullable=False)       # Severe, Warning, Advisory
    message = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    simulated = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class CriticalFacility(Base):
    __tablename__ = "critical_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    facility_type = Column(String, nullable=False)  # Hospital, School, Bridge, Emergency Center
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    distance_km = Column(Float, nullable=False)
    status = Column(String, default="DISPATCHED")   # DISPATCHED, IN_PROGRESS, COMPLETED
    assigned_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")
