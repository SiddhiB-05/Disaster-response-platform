from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.core.websocket import ws_manager

router = APIRouter(prefix="/api/v1/alerts", tags=["Disaster Alerts"])

@router.get("", response_model=List[schemas.DisasterAlertResponse])
def list_alerts(db: Session = Depends(get_db)):
    """List all disaster alerts."""
    return db.query(models.DisasterAlert).order_by(models.DisasterAlert.created_at.desc()).all()

@router.post("/trigger", response_model=schemas.DisasterAlertResponse, status_code=status.HTTP_201_CREATED)
async def trigger_alert(
    alert_in: schemas.DisasterAlertCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger a clearly labeled synthetic flood or cyclone disaster alert."""
    # Resolve any existing active alerts of same hazard type
    existing_active = db.query(models.DisasterAlert).filter(models.DisasterAlert.status == "ACTIVE").all()
    for active in existing_active:
        active.status = "RESOLVED"

    alert = models.DisasterAlert(
        hazard_type=alert_in.hazard_type.upper(),
        title=alert_in.title or f"{alert_in.hazard_type.upper()} EMERGENCY WARNING",
        description=alert_in.description,
        severity=alert_in.severity,
        district=alert_in.district or "Rourkela",
        latitude=alert_in.latitude or 22.2604,
        longitude=alert_in.longitude or 84.8536,
        radius_km=alert_in.radius_km or 15.0,
        source="State Disaster Response Authority (Synthetic Demo)",
        is_synthetic=True,
        status="ACTIVE",
        starts_at=datetime.utcnow(),
        created_at=datetime.utcnow()
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Broadcast WebSocket update
    background_tasks.add_task(
        ws_manager.broadcast_event,
        "alert_updated",
        {
            "id": alert.id,
            "public_ref": alert.public_ref,
            "hazard_type": alert.hazard_type,
            "severity": alert.severity,
            "description": alert.description,
            "is_active": True
        }
    )

    return alert

@router.post("/{alert_id}/resolve", response_model=schemas.DisasterAlertResponse)
async def resolve_alert(
    alert_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Mark an active alert as resolved."""
    alert = db.query(models.DisasterAlert).filter(models.DisasterAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "RESOLVED"
    alert.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    background_tasks.add_task(
        ws_manager.broadcast_event,
        "alert_updated",
        {
            "id": alert.id,
            "status": "RESOLVED",
            "is_active": False
        }
    )

    return alert
