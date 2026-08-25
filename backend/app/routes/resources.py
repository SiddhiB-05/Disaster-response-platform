from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models, schemas

router = APIRouter(prefix="/api/resources", tags=["Resources"])

@router.get("", response_model=List[schemas.ResourceResponse])
def list_resources(db: Session = Depends(get_db)):
    """List all resources."""
    return db.query(models.Resource).all()

@router.post("", response_model=schemas.ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(resource_in: schemas.ResourceCreate, db: Session = Depends(get_db)):
    """Create a new rescue resource."""
    resource = models.Resource(
        name=resource_in.name,
        type=resource_in.type,
        capability=resource_in.capability,
        latitude=resource_in.latitude,
        longitude=resource_in.longitude,
        capacity=resource_in.capacity,
        status=resource_in.status,
        is_demo=False
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource

@router.put("/{resource_id}/status", response_model=schemas.ResourceResponse)
def update_resource_status(resource_id: int, status_update: schemas.ResourceStatusUpdate, db: Session = Depends(get_db)):
    """Update status of a resource (AVAILABLE, ASSIGNED, BUSY, OFFLINE)."""
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    valid_statuses = ["AVAILABLE", "ASSIGNED", "BUSY", "OFFLINE"]
    new_status = status_update.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    res.status = new_status
    db.commit()
    db.refresh(res)
    return res
