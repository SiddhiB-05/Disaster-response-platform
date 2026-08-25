from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.core.websocket import ws_manager

router = APIRouter(prefix="/api/v1/resources", tags=["Resources"])

@router.get("", response_model=List[schemas.ResourceResponse])
def list_resources(
    status_filter: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch rescue resources with optional status and type filtering."""
    query = db.query(models.Resource)
    if status_filter:
        query = query.filter(models.Resource.status == status_filter.upper())
    if resource_type:
        query = query.filter(models.Resource.type == resource_type)
    return query.order_by(models.Resource.id.asc()).all()

@router.post("", response_model=schemas.ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(res_in: schemas.ResourceCreate, db: Session = Depends(get_db)):
    """Create a new rescue resource."""
    resource = models.Resource(
        name=res_in.name,
        type=res_in.type,
        capability=res_in.capability,
        capacity=res_in.capacity,
        latitude=res_in.latitude,
        longitude=res_in.longitude,
        status=res_in.status.upper(),
        is_demo=False
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource

@router.patch("/{resource_id}/status", response_model=schemas.ResourceResponse)
async def update_resource_status(
    resource_id: int,
    status_in: schemas.ResourceStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Update resource operational status (AVAILABLE, RESERVED, BUSY, OFFLINE)."""
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    old_status = res.status
    res.status = status_in.status.upper()
    res.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(res)

    background_tasks.add_task(
        ws_manager.broadcast_event,
        "resource_updated",
        {
            "id": res.id,
            "name": res.name,
            "old_status": old_status,
            "new_status": res.status
        }
    )

    return res
