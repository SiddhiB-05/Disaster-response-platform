from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models, schemas

router = APIRouter(prefix="/api/v1/facilities", tags=["Critical Facilities"])

@router.get("", response_model=List[schemas.CriticalFacilityResponse])
def list_facilities(db: Session = Depends(get_db)):
    """List active critical facilities."""
    return db.query(models.CriticalFacility).filter(models.CriticalFacility.is_active == True).all()
