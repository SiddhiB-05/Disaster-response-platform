from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.database import models, schemas

router = APIRouter(prefix="/api/v1/audit", tags=["Audit Log"])

@router.get("", response_model=List[schemas.AuditEventResponse])
def list_audit_events(
    entity_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List recent audit events across the platform."""
    query = db.query(models.AuditEvent)
    if entity_type:
        query = query.filter(models.AuditEvent.entity_type == entity_type)
    return query.order_by(models.AuditEvent.timestamp.desc()).limit(limit).all()
