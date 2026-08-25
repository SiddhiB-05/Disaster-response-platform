from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database import models, schemas
from app.ai.gemini_service import gemini_extractor
from app.scoring.priority_engine import priority_engine
from app.config import settings
from app.core.websocket import ws_manager

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

def create_audit_event(
    db: Session,
    entity_type: str,
    entity_id: int,
    event_type: str,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    actor: str = "citizen",
    metadata_json: Optional[dict] = None
):
    audit = models.AuditEvent(
        entity_type=entity_type,
        entity_id=entity_id,
        event_type=event_type,
        old_value=old_value,
        new_value=new_value,
        actor=actor,
        metadata_json=metadata_json,
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

@router.post("", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
async def submit_incident(
    incident_in: schemas.IncidentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submit citizen incident report.
    1. Runs Gemini AI extraction or fallback NLP parser.
    2. Respects explicit user-entered people_affected count if provided.
    3. Calculates transparent 5-component priority score (0-100).
    4. Detects duplicates and creates database record + Audit log.
    """
    lat = incident_in.latitude if incident_in.latitude is not None else settings.DEFAULT_LAT
    lon = incident_in.longitude if incident_in.longitude is not None else settings.DEFAULT_LON

    # Step 1: Check duplicate within last 5 mins
    five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
    existing_dup = db.query(models.Incident).filter(
        models.Incident.raw_description == incident_in.description,
        models.Incident.reported_at >= five_mins_ago
    ).first()
    
    is_duplicate = existing_dup is not None

    # Step 2: AI Metadata Extraction
    ai_data = gemini_extractor.extract_incident_metadata(
        description=incident_in.description,
        fallback_type_hint=incident_in.incident_type,
        explicit_people_count=incident_in.people_affected
    )

    # Step 3: Fetch Facilities & Available Resources for context scoring
    facilities = db.query(models.CriticalFacility).filter(models.CriticalFacility.is_active == True).all()
    facility_dicts = [{"name": f.name, "latitude": f.latitude, "longitude": f.longitude} for f in facilities]

    available_resources = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").all()
    resource_dicts = [{"name": r.name, "latitude": r.latitude, "longitude": r.longitude, "capability": r.capability} for r in available_resources]

    # Step 4: Compute Priority Score
    score_res = priority_engine.calculate_priority(
        severity=ai_data["severity"],
        people_affected=ai_data["people_affected"],
        vulnerable_people=ai_data["vulnerable_people"],
        incident_lat=lat,
        incident_lon=lon,
        facilities=facility_dicts,
        available_resources=resource_dicts,
        elapsed_minutes=0.0
    )

    # Step 5: Check Active Alert link
    active_alert = db.query(models.DisasterAlert).filter(models.DisasterAlert.status == "ACTIVE").first()

    # Step 6: Create Database Incident Record
    db_incident = models.Incident(
        alert_id=active_alert.id if active_alert else None,
        incident_type=ai_data["incident_type"],
        location_name=incident_in.location_name,
        district=incident_in.district or "Rourkela",
        latitude=lat,
        longitude=lon,
        raw_description=incident_in.description,
        reporter_name=incident_in.reporter_name,
        contact_phone=incident_in.contact_phone,
        ai_severity=ai_data["severity"],
        people_affected=ai_data["people_affected"],
        vulnerable_people=ai_data["vulnerable_people"],
        urgency="HIGH" if score_res["priority_score"] >= 70 else "MEDIUM",
        extraction_confidence=ai_data.get("confidence", 0.90),
        extraction_notes=ai_data.get("extraction_notes", []),
        nlp_source=ai_data.get("nlp_source", "fallback"),
        priority_score=score_res["priority_score"],
        priority_category=score_res["priority_category"],
        score_breakdown=score_res["score_breakdown"],
        status="REPORTED",
        duplicate_warning=is_duplicate,
        reported_at=datetime.utcnow()
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    # Step 7: Create Audit Event
    create_audit_event(
        db,
        entity_type="Incident",
        entity_id=db_incident.id,
        event_type="CREATED",
        new_value=f"Status: REPORTED, Priority: {db_incident.priority_score}",
        actor="citizen" if not incident_in.reporter_name else incident_in.reporter_name,
        metadata_json={
            "public_ref": db_incident.public_ref,
            "nlp_source": db_incident.nlp_source,
            "priority_category": db_incident.priority_category
        }
    )

    # Broadcast WebSocket event
    background_tasks.add_task(
        ws_manager.broadcast_event,
        "incident_created",
        {
            "id": db_incident.id,
            "public_ref": db_incident.public_ref,
            "location_name": db_incident.location_name,
            "priority_score": db_incident.priority_score,
            "priority_category": db_incident.priority_category,
            "status": db_incident.status
        }
    )

    return db_incident

@router.get("", response_model=List[schemas.IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = None,
    priority_category: Optional[str] = None,
    incident_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List incidents sorted by priority_score descending."""
    query = db.query(models.Incident)
    if status_filter:
        query = query.filter(models.Incident.status == status_filter.upper())
    if priority_category:
        query = query.filter(models.Incident.priority_category == priority_category.upper())
    if incident_type:
        query = query.filter(models.Incident.incident_type == incident_type)
        
    return query.order_by(models.Incident.priority_score.desc(), models.Incident.reported_at.desc()).all()

@router.get("/{incident_id}", response_model=schemas.IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Fetch single incident by ID."""
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident #{incident_id} not found")
    return inc

@router.post("/{incident_id}/recalculate", response_model=schemas.IncidentResponse)
async def recalculate_incident_priority(
    incident_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Recalculate deterministic priority score based on elapsed time and updated resource availability.
    """
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Compute elapsed minutes
    elapsed = (datetime.utcnow() - inc.reported_at).total_seconds() / 60.0

    facilities = db.query(models.CriticalFacility).filter(models.CriticalFacility.is_active == True).all()
    facility_dicts = [{"name": f.name, "latitude": f.latitude, "longitude": f.longitude} for f in facilities]

    available_resources = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").all()
    resource_dicts = [{"name": r.name, "latitude": r.latitude, "longitude": r.longitude, "capability": r.capability} for r in available_resources]

    old_score = inc.priority_score
    old_cat = inc.priority_category

    score_res = priority_engine.calculate_priority(
        severity=inc.ai_severity,
        people_affected=inc.people_affected,
        vulnerable_people=inc.vulnerable_people,
        incident_lat=inc.latitude,
        incident_lon=inc.longitude,
        facilities=facility_dicts,
        available_resources=resource_dicts,
        elapsed_minutes=elapsed
    )

    inc.priority_score = score_res["priority_score"]
    inc.priority_category = score_res["priority_category"]
    inc.score_breakdown = score_res["score_breakdown"]
    inc.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)

    create_audit_event(
        db,
        entity_type="Incident",
        entity_id=inc.id,
        event_type="RECALCULATED",
        old_value=f"Score: {old_score} ({old_cat})",
        new_value=f"Score: {inc.priority_score} ({inc.priority_category})",
        actor="system"
    )

    background_tasks.add_task(
        ws_manager.broadcast_event,
        "score_recalculated",
        {
            "id": inc.id,
            "priority_score": inc.priority_score,
            "priority_category": inc.priority_category
        }
    )

    return inc

@router.patch("/{incident_id}/status", response_model=schemas.IncidentResponse)
async def update_incident_status(
    incident_id: int,
    status_in: schemas.IncidentStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = inc.status
    new_status = status_in.status.upper()
    inc.status = new_status
    inc.updated_at = datetime.utcnow()

    if new_status == "RESOLVED":
        inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)

    create_audit_event(
        db,
        entity_type="Incident",
        entity_id=inc.id,
        event_type="STATUS_CHANGED",
        old_value=old_status,
        new_value=new_status,
        actor="authority"
    )

    background_tasks.add_task(
        ws_manager.broadcast_event,
        "incident_updated",
        {
            "id": inc.id,
            "status": inc.status,
            "updated_at": inc.updated_at.isoformat()
        }
    )

    return inc

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(inc)
    db.commit()
    return None
