import math
from typing import Dict, Any, List

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in kilometers between two lat/lon coordinates."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PriorityScoringEngine:
    """
    Transparent Weighted Priority Scoring Engine (0-100 Score)
    
    Formula:
      priority_score = 0.35 * severity_score (max 35)
                     + 0.25 * people_affected_score (max 25)
                     + 0.15 * critical_facility_score (max 15)
                     + 0.15 * resource_availability_score (max 15)
                     + 0.10 * time_score (max 10)
    """

    @staticmethod
    def calculate_priority(
        severity: str,
        people_affected: int,
        vulnerable_people: bool,
        urgency: str,
        incident_lat: float,
        incident_lon: float,
        critical_facilities: List[Dict[str, Any]],
        available_resources_count: int = 2,
        minutes_elapsed: float = 0.0
    ) -> Dict[str, Any]:
        
        # 1. Severity Score (Max 35)
        severity_upper = severity.upper()
        if severity_upper == "HIGH":
            base_sev = 32.0
            if vulnerable_people or urgency.upper() == "HIGH":
                base_sev = 35.0
        elif severity_upper == "MEDIUM":
            base_sev = 22.0
            if vulnerable_people:
                base_sev = 26.0
        else: # LOW
            base_sev = 10.0

        severity_score = round(min(35.0, base_sev), 1)

        # 2. People Affected Score (Max 25)
        # 2.5 points per person up to max 25 (10+ people = 25 pts)
        people_score_raw = min(25.0, max(2.5, people_affected * 2.5))
        if vulnerable_people:
            people_score_raw = min(25.0, people_score_raw + 3.0)
        people_affected_score = round(people_score_raw, 1)

        # 3. Critical Facility Proximity Score (Max 15)
        min_distance_km = 999.0
        nearest_facility_name = "None"
        if critical_facilities:
            for fac in critical_facilities:
                dist = haversine_distance(incident_lat, incident_lon, fac["latitude"], fac["longitude"])
                if dist < min_distance_km:
                    min_distance_km = dist
                    nearest_facility_name = fac.get("name", "Facility")

        if min_distance_km <= 1.0:
            facility_score = 15.0
        elif min_distance_km <= 5.0:
            facility_score = max(5.0, 15.0 - ((min_distance_km - 1.0) * 2.5))
        elif min_distance_km <= 10.0:
            facility_score = max(2.0, 5.0 - ((min_distance_km - 5.0) * 0.6))
        else:
            facility_score = 2.0

        critical_facility_score = round(facility_score, 1)

        # 4. Resource Availability Score (Max 15)
        # Scarcity of resources increases priority urgency
        if available_resources_count == 0:
            res_avail_score = 15.0 # Maximum bottleneck urgency
        elif available_resources_count == 1:
            res_avail_score = 13.5
        elif available_resources_count == 2:
            res_avail_score = 11.0
        else:
            res_avail_score = 8.0
        resource_availability_score = round(res_avail_score, 1)

        # 5. Time Since Report Score (Max 10)
        if minutes_elapsed < 5.0:
            time_score = 10.0
        elif minutes_elapsed < 30.0:
            time_score = 8.5
        elif minutes_elapsed < 60.0:
            time_score = 6.0
        else:
            time_score = 4.0

        # Total Priority Score (Normalized 0 - 100)
        total_score = round(
            severity_score +
            people_affected_score +
            critical_facility_score +
            resource_availability_score +
            time_score, 1
        )
        total_score = max(0.0, min(100.0, total_score))

        # Classification
        if total_score >= 70.0:
            category = "HIGH"
        elif total_score >= 40.0:
            category = "MEDIUM"
        else:
            category = "LOW"

        breakdown = {
            "total_score": total_score,
            "category": category,
            "severity_component": f"{severity_score}/35.0",
            "people_affected_component": f"{people_affected_score}/25.0",
            "critical_facility_component": f"{critical_facility_score}/15.0",
            "resource_availability_component": f"{resource_availability_score}/15.0",
            "time_component": f"{time_score}/10.0",
            "nearest_facility": nearest_facility_name,
            "facility_distance_km": round(min_distance_km, 2) if min_distance_km < 900 else "N/A"
        }

        return {
            "priority_score": total_score,
            "priority_category": category,
            "score_breakdown": breakdown
        }

priority_engine = PriorityScoringEngine()
