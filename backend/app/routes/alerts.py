from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models, schemas
from app.config import settings

router = APIRouter(prefix="/api/alerts", tags=["Disaster Alerts"])

@router.get("", response_model=List[schemas.DisasterAlertResponse])
def list_alerts(db: Session = Depends(get_db)):
    """Fetch active disaster alerts."""
    return db.query(models.DisasterAlert).order_by(models.DisasterAlert.timestamp.desc()).all()

@router.post("/trigger", response_model=schemas.DisasterAlertResponse, status_code=status.HTTP_201_CREATED)
def trigger_alert(alert_in: schemas.DisasterAlertCreate, db: Session = Depends(get_db)):
    """Trigger a synthetic disaster alert for hackathon demonstration."""
    # Deactivate older alerts of same type/district
    db.query(models.DisasterAlert).filter(
        models.DisasterAlert.district == alert_in.district
    ).update({"is_active": False})
    
    alert = models.DisasterAlert(
        alert_type=alert_in.alert_type,
        district=alert_in.district,
        severity=alert_in.severity,
        message=alert_in.message,
        is_active=True,
        simulated=True,
        timestamp=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
