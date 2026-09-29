from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime


from app.database.database import get_db
from app.database import models, schemas
from app.scoring.relocation_engine import relocation_engine
from app.ai.gemini_service import gemini_extractor
from app.core.websocket import ws_manager

router = APIRouter(prefix="/api/v1/relocation", tags=["Proactive Relocation & SDMA Decision Support"])

# ---------------------------------------------------------
# 1. Multi-Hazard Red Zone Endpoints
# ---------------------------------------------------------

@router.get("/red-zones", response_model=List[schemas.RedZoneResponse])
def get_red_zones(
    hazard_type: Optional[str] = Query(None, description="Filter by Landslide, Flood, Coastal Erosion, Cloudburst, Multi-Hazard"),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve all identified Multi-Hazard Red Zones."""
    query = db.query(models.RedZone)
    if hazard_type:
        query = query.filter(models.RedZone.hazard_type.ilike(f"%{hazard_type}%"))
    if district:
        query = query.filter(models.RedZone.district.ilike(f"%{district}%"))
    return query.order_by(models.RedZone.hazard_intensity.desc()).all()


@router.post("/red-zones", response_model=schemas.RedZoneResponse, status_code=201)
def create_red_zone(
    payload: schemas.RedZoneCreate,
    db: Session = Depends(get_db)
):
    """Dynamically register a new Multi-Hazard Red Zone."""
    red_zone = models.RedZone(
        name=payload.name,
        district=payload.district,
        state=payload.state,
        hazard_type=payload.hazard_type,
        hazard_intensity=payload.hazard_intensity,
        risk_level=payload.risk_level,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=payload.radius_km,
        population_at_risk=payload.population_at_risk,
        disaster_history_summary=payload.disaster_history_summary
    )
    db.add(red_zone)
    db.commit()
    db.refresh(red_zone)

    # Broadcast WebSocket notification
    ws_manager.broadcast_sync({
        "event": "RED_ZONE_CREATED",
        "red_zone": {
            "id": red_zone.id,
            "name": red_zone.name,
            "hazard_type": red_zone.hazard_type,
            "intensity": red_zone.hazard_intensity
        }
    })

    return red_zone


@router.put("/red-zones/{zone_id}/intensity", response_model=schemas.RedZoneResponse)
def update_red_zone_intensity(
    zone_id: int,
    hazard_intensity: float = Query(..., ge=0.0, le=100.0, description="New dynamic hazard intensity (0-100)"),
    db: Session = Depends(get_db)
):
    """Dynamically update hazard intensity of a Red Zone (e.g. monsoon rainfall surge, landslide alert)."""
    red_zone = db.query(models.RedZone).filter(models.RedZone.id == zone_id).first()
    if not red_zone:
        raise HTTPException(status_code=404, detail="Red Zone not found")

    old_intensity = red_zone.hazard_intensity
    red_zone.hazard_intensity = hazard_intensity
    if hazard_intensity >= 80.0:
        red_zone.risk_level = "CRITICAL_RED"
    elif hazard_intensity >= 50.0:
        red_zone.risk_level = "HIGH_RISK"
    else:
        red_zone.risk_level = "MODERATE_WARNING"

    red_zone.last_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(red_zone)

    # Automatically recalculate priority for all habitations inside this Red Zone
    habitations = db.query(models.VulnerableHabitation).filter(models.VulnerableHabitation.red_zone_id == zone_id).all()
    for hab in habitations:
        result = relocation_engine.calculate_habitation_priority(
            hazard_intensity=red_zone.hazard_intensity,
            population=hab.population,
            vulnerable_children=hab.vulnerable_children_count,
            vulnerable_elderly=hab.vulnerable_elderly_count,
            poverty_index=hab.poverty_index,
            housing_type=hab.housing_type,
            disaster_history_count=hab.disaster_history_count
        )
        hab.relocation_priority_score = result["score"]
        hab.relocation_tier = result["tier"]
        hab.scoring_breakdown = result["breakdown"]
    
    db.commit()

    # Broadcast WebSocket update
    ws_manager.broadcast_sync({
        "event": "RED_ZONE_INTENSITY_UPDATED",
        "red_zone_id": red_zone.id,
        "name": red_zone.name,
        "old_intensity": old_intensity,
        "new_intensity": hazard_intensity,
        "risk_level": red_zone.risk_level
    })

    return red_zone


# ---------------------------------------------------------
# 2. Safer Relocation Site & Carrying Capacity Endpoints
# ---------------------------------------------------------

@router.get("/sites", response_model=List[schemas.RelocationSiteResponse])
def get_relocation_sites(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List candidate safer relocation sites and carrying capacity metrics."""
    query = db.query(models.RelocationSite)
    if district:
        query = query.filter(models.RelocationSite.district.ilike(f"%{district}%"))
    
    sites = query.all()
    # Dynamically compute remaining capacity and suitability score
    for s in sites:
        rem_cap = max(0, s.max_capacity_people - s.current_occupied)
        s.remaining_capacity = round((rem_cap / max(1, s.max_capacity_people)) * 100.0, 1)
        s.suitability_score = relocation_engine.calculate_site_suitability(
            elevation_m=s.elevation_m,
            slope_degree=s.slope_degree,
            soil_stability=s.soil_stability_index,
            dist_from_red_zone_km=s.distance_from_red_zone_km,
            infra_rating=s.infrastructure_score
        )
        if s.remaining_capacity <= 5.0:
            s.status = "FULL"
        elif s.remaining_capacity <= 25.0:
            s.status = "NEAR_CAPACITY"
        else:
            s.status = "OPTIMAL"

    return sites


@router.post("/sites", response_model=schemas.RelocationSiteResponse, status_code=201)
def create_relocation_site(
    payload: schemas.RelocationSiteCreate,
    db: Session = Depends(get_db)
):
    """Register a new safe alternative site for relocation."""
    suitability = relocation_engine.calculate_site_suitability(
        elevation_m=payload.elevation_m,
        slope_degree=payload.slope_degree,
        soil_stability=payload.soil_stability_index,
        dist_from_red_zone_km=payload.distance_from_red_zone_km,
        infra_rating=payload.infrastructure_score
    )

    site = models.RelocationSite(
        name=payload.name,
        district=payload.district,
        latitude=payload.latitude,
        longitude=payload.longitude,
        total_area_sqkm=payload.total_area_sqkm,
        max_capacity_people=payload.max_capacity_people,
        elevation_m=payload.elevation_m,
        slope_degree=payload.slope_degree,
        soil_stability_index=payload.soil_stability_index,
        distance_from_red_zone_km=payload.distance_from_red_zone_km,
        infrastructure_score=payload.infrastructure_score,
        suitability_score=suitability
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


# ---------------------------------------------------------
# 3. Vulnerable Habitation Prioritization Endpoints
# ---------------------------------------------------------

@router.get("/habitations", response_model=List[schemas.VulnerableHabitationResponse])
def get_vulnerable_habitations(
    tier: Optional[str] = Query(None, description="IMMEDIATE, SHORT_TERM, MEDIUM_TERM"),
    db: Session = Depends(get_db)
):
    """Get vulnerable habitations prioritized by relocation tier."""
    query = db.query(models.VulnerableHabitation)
    if tier:
        query = query.filter(models.VulnerableHabitation.relocation_tier == tier.upper())
    return query.order_by(models.VulnerableHabitation.relocation_priority_score.desc()).all()


@router.post("/habitations", response_model=schemas.VulnerableHabitationResponse, status_code=201)
def create_vulnerable_habitation(
    payload: schemas.VulnerableHabitationCreate,
    db: Session = Depends(get_db)
):
    """Register a vulnerable habitation and compute initial relocation priority."""
    hazard_intensity = 75.0
    if payload.red_zone_id:
        red_zone = db.query(models.RedZone).filter(models.RedZone.id == payload.red_zone_id).first()
        if red_zone:
            hazard_intensity = red_zone.hazard_intensity

    p_res = relocation_engine.calculate_habitation_priority(
        hazard_intensity=hazard_intensity,
        population=payload.population,
        vulnerable_children=payload.vulnerable_children_count,
        vulnerable_elderly=payload.vulnerable_elderly_count,
        poverty_index=payload.poverty_index,
        housing_type=payload.housing_type,
        disaster_history_count=payload.disaster_history_count
    )

    hab = models.VulnerableHabitation(
        name=payload.name,
        district=payload.district,
        red_zone_id=payload.red_zone_id,
        population=payload.population,
        vulnerable_children_count=payload.vulnerable_children_count,
        vulnerable_elderly_count=payload.vulnerable_elderly_count,
        poverty_index=payload.poverty_index,
        housing_type=payload.housing_type,
        disaster_history_count=payload.disaster_history_count,
        latitude=payload.latitude,
        longitude=payload.longitude,
        relocation_priority_score=p_res["score"],
        relocation_tier=p_res["tier"],
        scoring_breakdown=p_res["breakdown"]
    )
    db.add(hab)
    db.commit()
    db.refresh(hab)
    return hab


@router.post("/prioritize-all")
def trigger_prioritization_engine(db: Session = Depends(get_db)):
    """Trigger AI multi-hazard re-scoring across all registered habitations."""
    habitations = db.query(models.VulnerableHabitation).all()
    red_zones = {rz.id: rz.hazard_intensity for rz in db.query(models.RedZone).all()}

    updated_count = 0
    tier_counts = {"IMMEDIATE": 0, "SHORT_TERM": 0, "MEDIUM_TERM": 0}

    for hab in habitations:
        h_intensity = red_zones.get(hab.red_zone_id, 70.0)
        p_res = relocation_engine.calculate_habitation_priority(
            hazard_intensity=h_intensity,
            population=hab.population,
            vulnerable_children=hab.vulnerable_children_count,
            vulnerable_elderly=hab.vulnerable_elderly_count,
            poverty_index=hab.poverty_index,
            housing_type=hab.housing_type,
            disaster_history_count=hab.disaster_history_count
        )
        hab.relocation_priority_score = p_res["score"]
        hab.relocation_tier = p_res["tier"]
        hab.scoring_breakdown = p_res["breakdown"]
        tier_counts[p_res["tier"]] += 1
        updated_count += 1

    db.commit()

    return {
        "status": "SUCCESS",
        "habitations_re-scored": updated_count,
        "tier_breakdown": tier_counts
    }


@router.post("/allocate-carrying-capacity")
def allocate_relocation_sites(db: Session = Depends(get_db)):
    """Execute carrying capacity aware optimization for vulnerable habitations to safe sites."""
    habitations = db.query(models.VulnerableHabitation).filter(
        models.VulnerableHabitation.relocation_status != "RELOCATED"
    ).all()

    sites = db.query(models.RelocationSite).all()

    hab_dicts = [
        {
            "id": h.id,
            "name": h.name,
            "population": h.population,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "relocation_priority_score": h.relocation_priority_score,
            "relocation_tier": h.relocation_tier
        } for h in habitations
    ]

    site_dicts = [
        {
            "id": s.id,
            "name": s.name,
            "max_capacity_people": s.max_capacity_people,
            "current_occupied": s.current_occupied,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "suitability_score": s.suitability_score or 80.0
        } for s in sites
    ]

    result = relocation_engine.optimize_relocation_allocation(hab_dicts, site_dicts)

    # Update database allocations
    for alloc in result["allocations"]:
        hab_id = alloc["habitation_id"]
        site_id = alloc["allocated_site_id"]
        h_obj = db.query(models.VulnerableHabitation).filter(models.VulnerableHabitation.id == hab_id).first()
        if h_obj:
            h_obj.assigned_site_id = site_id

    db.commit()

    return result


# ---------------------------------------------------------
# 4. SDMA Actionable Policy & Decision Brief Endpoint
# ---------------------------------------------------------

@router.post("/sdma-policy-report")
def generate_sdma_policy_report(
    payload: schemas.SDMAPolicyReportRequest,
    db: Session = Depends(get_db)
):
    """Generate AI-driven State Disaster Management Authority (SDMA) policy report."""
    red_zones_count = db.query(models.RedZone).count()
    total_pop_at_risk = db.query(models.RedZone).all()
    pop_sum = sum(rz.population_at_risk for rz in total_pop_at_risk) if total_pop_at_risk else 15000
    
    imm_count = db.query(models.VulnerableHabitation).filter(
        models.VulnerableHabitation.relocation_tier == "IMMEDIATE"
    ).count()

    report = gemini_extractor.generate_sdma_policy_brief(
        district=payload.district or "State Wide",
        target_state=payload.target_state or "Odisha & Vulnerable States",
        red_zones_count=red_zones_count or 5,
        vulnerable_population=pop_sum or 12500,
        immediate_relocation_count=imm_count or 3
    )

    return report
