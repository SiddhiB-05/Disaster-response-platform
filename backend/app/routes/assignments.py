from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.allocation.matching_engine import matching_engine, haversine_distance

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

@router.post("", response_model=schemas.AssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_resource(req: schemas.AssignmentRequest, db: Session = Depends(get_db)):
    """
    Assign a specific rescue resource to an incident.
    - Updates resource status to BUSY
    - Updates incident status to ASSIGNED
    - Creates assignment record
    """
    incident = db.query(models.Incident).filter(models.Incident.id == req.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    resource = db.query(models.Resource).filter(models.Resource.id == req.resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Calculate distance
    dist = haversine_distance(incident.latitude, incident.longitude, resource.latitude, resource.longitude)

    # State transitions
    incident.status = "ASSIGNED"
    incident.assigned_resource_id = resource.id

    resource.status = "BUSY" # As required in prompt: AVAILABLE -> ASSIGNED / BUSY

    assignment = models.Assignment(
        incident_id=incident.id,
        resource_id=resource.id,
        distance_km=round(dist, 2),
        status="DISPATCHED",
        assigned_at=datetime.utcnow()
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment

@router.post("/optimize", response_model=schemas.OptimizationResponse)
def run_scipy_optimization(db: Session = Depends(get_db)):
    """
    Run SciPy linear_sum_assignment bipartite optimization across all UNASSIGNED incidents and AVAILABLE resources.
    Returns global optimal pairings.
    """
    incidents = db.query(models.Incident).filter(models.Incident.status == "UNASSIGNED").all()
    resources = db.query(models.Resource).filter(models.Resource.status == "AVAILABLE").all()

    inc_dicts = [
        {
            "id": inc.id,
            "location_name": inc.location_name,
            "incident_type": inc.incident_type,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "priority_score": inc.priority_score,
            "status": inc.status
        }
        for inc in incidents
    ]

    res_dicts = [
        {
            "id": res.id,
            "name": res.name,
            "type": res.type,
            "capability": res.capability,
            "latitude": res.latitude,
            "longitude": res.longitude,
            "status": res.status
        }
        for res in resources
    ]

    recommendations = matching_engine.optimize_bipartite_assignment(inc_dicts, res_dicts)

    return {
        "total_incidents_processed": len(inc_dicts),
        "total_assigned": len(recommendations),
        "assignments": recommendations
    }

@router.get("", response_model=List[schemas.AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    """List all dispatch assignments."""
    return db.query(models.Assignment).order_by(models.Assignment.assigned_at.desc()).all()
