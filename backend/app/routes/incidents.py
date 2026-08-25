from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.ai.gemini_service import gemini_extractor
from app.scoring.priority_engine import priority_engine
from app.allocation.matching_engine import matching_engine
from app.config import settings

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.post("", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
def submit_incident(incident_in: schemas.IncidentCreate, db: Session = Depends(get_db)):
    """
    Submit a citizen incident report.
    1. Extracts structured metadata via Gemini AI (or fallback NLP).
    2. Computes deterministic priority score (0-100) & score breakdown.
    3. Finds critical facility proximity and resource availability.
    4. Saves to database and returns full response.
    """
    lat = incident_in.latitude if incident_in.latitude is not None else settings.DEFAULT_LAT
    lon = incident_in.longitude if incident_in.longitude is not None else settings.DEFAULT_LON

    # Step 1: Run Gemini NLP Extraction
    ai_metadata = gemini_extractor.extract_incident_metadata(
        description=incident_in.description,
        fallback_incident_type=incident_in.incident_type
    )

    # Step 2: Fetch Critical Facilities & Available Resources for context scoring
    facilities = db.query(models.CriticalFacility).all()
    facility_dicts = [{"name": f.name, "latitude": f.latitude, "longitude": f.longitude} for f in facilities]

    available_resources = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").all()
    avail_count = len(available_resources)

    # Step 3: Priority Engine Scoring
    scoring_result = priority_engine.calculate_priority(
        severity=ai_metadata["severity"],
        people_affected=ai_metadata["people_affected"],
        vulnerable_people=ai_metadata["vulnerable_people"],
        urgency=ai_metadata["urgency"],
        incident_lat=lat,
        incident_lon=lon,
        critical_facilities=facility_dicts,
        available_resources_count=avail_count,
        minutes_elapsed=0.0
    )

    # Step 4: Create Database Incident Object
    db_incident = models.Incident(
        location_name=incident_in.location_name,
        latitude=lat,
        longitude=lon,
        incident_type=ai_metadata["incident_type"],
        description=incident_in.description,
        ai_severity=ai_metadata["severity"],
        people_affected=ai_metadata["people_affected"],
        vulnerable_people=ai_metadata["vulnerable_people"],
        urgency=ai_metadata["urgency"],
        priority_score=scoring_result["priority_score"],
        priority_category=scoring_result["priority_category"],
        score_breakdown=scoring_result["score_breakdown"],
        status="UNASSIGNED",
        created_at=datetime.utcnow()
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return db_incident

@router.get("", response_model=List[schemas.IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    """Fetch all incidents sorted by priority_score descending."""
    return db.query(models.Incident).order_by(models.Incident.priority_score.desc()).all()

@router.get("/{incident_id}", response_model=schemas.IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Get single incident by ID."""
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    """Delete an incident."""
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(inc)
    db.commit()
    return None
