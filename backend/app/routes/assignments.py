from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.allocation.matching_engine import matching_engine, haversine_distance, AVERAGE_EMERGENCY_SPEED_KMH
from app.core.websocket import ws_manager

router = APIRouter(prefix="/api/v1/assignments", tags=["Assignments & SciPy Optimization"])

def create_audit_event(
    db: Session,
    entity_type: str,
    entity_id: int,
    event_type: str,
    old_value: str = None,
    new_value: str = None,
    actor: str = "authority",
    metadata_json: dict = None
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

@router.post("/optimize", response_model=schemas.OptimizationResponse)
def run_scipy_optimization(db: Session = Depends(get_db)):
    """
    Execute SciPy linear_sum_assignment bipartite matching across all open/unassigned incidents and AVAILABLE resources.
    Returns global optimal preview recommendations WITHOUT mutating database state.
    """
    open_incidents = db.query(models.Incident).filter(
        models.Incident.status.in_(["REPORTED", "VERIFIED", "UNASSIGNED"])
    ).all()

    available_resources = db.query(models.Resource).filter(
        models.Resource.status == "AVAILABLE"
    ).all()

    inc_dicts = [
        {
            "id": inc.id,
            "public_ref": inc.public_ref,
            "location_name": inc.location_name,
            "incident_type": inc.incident_type,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "priority_score": inc.priority_score,
            "priority_category": inc.priority_category,
            "people_affected": inc.people_affected,
            "vulnerable_people": inc.vulnerable_people,
            "status": inc.status
        }
        for inc in open_incidents
    ]

    res_dicts = [
        {
            "id": res.id,
            "public_ref": res.public_ref,
            "name": res.name,
            "type": res.type,
            "capability": res.capability,
            "capacity": res.capacity,
            "latitude": res.latitude,
            "longitude": res.longitude,
            "status": res.status
        }
        for res in available_resources
    ]

    result = matching_engine.optimize_bipartite_assignment(inc_dicts, res_dicts)
    return result

@router.post("/confirm", response_model=schemas.AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def confirm_assignment(
    req: schemas.AssignmentConfirmRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Transactional Authority Confirmation:
    1. Validates incident and resource existence & availability.
    2. Updates resource status AVAILABLE -> BUSY.
    3. Updates incident status REPORTED/UNASSIGNED -> ASSIGNED.
    4. Creates Assignment record and AuditEvent log.
    5. Broadcasts real-time WebSocket update.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == req.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident #{req.incident_id} not found")

    resource = db.query(models.Resource).filter(models.Resource.id == req.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail=f"Resource #{req.resource_id} not found")

    # Race condition protection: Check resource is AVAILABLE
    if resource.status != "AVAILABLE":
        raise HTTPException(
            status_code=409,
            detail=f"Resource '{resource.name}' is currently {resource.status} and cannot be assigned."
        )

    # Compute Haversine Distance & Travel ETA
    dist_km = haversine_distance(incident.latitude, incident.longitude, resource.latitude, resource.longitude)
    eta_mins = round((dist_km / AVERAGE_EMERGENCY_SPEED_KMH) * 60.0, 1)

    # Evaluate capability match
    is_feasible, cap_penalty, match_quality = matching_engine.evaluate_capability_match(
        incident.incident_type, resource.capability
    )

    # Transactional state updates
    old_inc_status = incident.status
    old_res_status = resource.status

    incident.status = "ASSIGNED"
    incident.assigned_resource_id = resource.id
    incident.updated_at = datetime.utcnow()

    resource.status = "BUSY"
    resource.updated_at = datetime.utcnow()

    assignment = models.Assignment(
        incident_id=incident.id,
        resource_id=resource.id,
        distance_km=round(dist_km, 2),
        estimated_travel_minutes=eta_mins,
        compatibility_score=1.0 if is_feasible else 0.5,
        optimizer_cost=round(dist_km + 0.75 * (100.0 - incident.priority_score) + cap_penalty, 2),
        reason=req.reason or f"Dispatched {resource.name} ({resource.type}) to {incident.location_name}.",
        status="ASSIGNED",
        assigned_at=datetime.utcnow()
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Audit Events
    create_audit_event(
        db,
        entity_type="Incident",
        entity_id=incident.id,
        event_type="DISPATCHED",
        old_value=old_inc_status,
        new_value="ASSIGNED",
        actor="authority",
        metadata_json={"resource_id": resource.id, "resource_name": resource.name}
    )
    create_audit_event(
        db,
        entity_type="Resource",
        entity_id=resource.id,
        event_type="STATUS_CHANGED",
        old_value=old_res_status,
        new_value="BUSY",
        actor="authority",
        metadata_json={"assigned_incident_id": incident.id}
    )

    # Broadcast WebSocket updates
    background_tasks.add_task(
        ws_manager.broadcast_event,
        "assignment_updated",
        {
            "assignment_id": assignment.id,
            "incident_id": incident.id,
            "resource_id": resource.id,
            "incident_status": "ASSIGNED",
            "resource_status": "BUSY",
            "assigned_at": assignment.assigned_at.isoformat()
        }
    )

    return assignment

@router.patch("/{assignment_id}/status", response_model=schemas.AssignmentResponse)
async def update_assignment_status(
    assignment_id: int,
    status_in: schemas.AssignmentStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Advance assignment lifecycle:
    - IN_PROGRESS: sets started_at timestamp, incident status -> IN_PROGRESS
    - COMPLETED: sets completed_at timestamp, releases resource status BUSY -> AVAILABLE, sets incident status -> RESOLVED
    - CANCELLED: releases resource status BUSY -> AVAILABLE, sets incident status -> REPORTED
    """
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    new_status = status_in.status.upper()
    old_status = assignment.status
    assignment.status = new_status

    incident = db.query(models.Incident).filter(models.Incident.id == assignment.incident_id).first()
    resource = db.query(models.Resource).filter(models.Resource.id == assignment.resource_id).first()

    if new_status == "IN_PROGRESS":
        assignment.started_at = datetime.utcnow()
        if incident:
            incident.status = "IN_PROGRESS"
            incident.updated_at = datetime.utcnow()

    elif new_status == "COMPLETED":
        assignment.completed_at = datetime.utcnow()
        if incident:
            incident.status = "RESOLVED"
            incident.resolved_at = datetime.utcnow()
            incident.updated_at = datetime.utcnow()
        if resource:
            resource.status = "AVAILABLE"
            resource.updated_at = datetime.utcnow()

    elif new_status == "CANCELLED":
        if incident:
            incident.status = "REPORTED"
            incident.assigned_resource_id = None
            incident.updated_at = datetime.utcnow()
        if resource:
            resource.status = "AVAILABLE"
            resource.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assignment)

    create_audit_event(
        db,
        entity_type="Assignment",
        entity_id=assignment.id,
        event_type="STATUS_CHANGED",
        old_value=old_status,
        new_value=new_status,
        actor="authority"
    )

    background_tasks.add_task(
        ws_manager.broadcast_event,
        "assignment_updated",
        {
            "assignment_id": assignment.id,
            "status": new_status,
            "incident_status": incident.status if incident else None,
            "resource_status": resource.status if resource else None
        }
    )

    return assignment

@router.get("", response_model=List[schemas.AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    """List all dispatch assignments sorted by assignment time descending."""
    return db.query(models.Assignment).order_by(models.Assignment.assigned_at.desc()).all()
