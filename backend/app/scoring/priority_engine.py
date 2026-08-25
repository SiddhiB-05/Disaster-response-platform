import math
from typing import Dict, Any, List, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the Great Circle / Haversine distance in kilometers between two lat/lon points.
    Formula:
      a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
      c = 2·atan2(√a, √(1-a))
      d = R · c
    """
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 4)

class PriorityScoringEngine:
    """
    Deterministic & Transparent Disaster Priority Scoring Engine (0 - 100 Score).
    
    Formula:
        priority_score = 0.35 * severity_norm
                       + 0.25 * people_affected_norm
                       + 0.15 * facility_proximity_norm
                       + 0.15 * resource_availability_norm
                       + 0.10 * time_elapsed_norm
    """
    
    SEVERITY_MAPPING = {
        "LOW": 25.0,
        "MEDIUM": 50.0,
        "HIGH": 80.0,
        "CRITICAL": 100.0
    }
    
    @staticmethod
    def normalize_severity(severity: str, vulnerable_people: bool) -> tuple[float, str, Optional[str]]:
        sev_upper = severity.upper().strip()
        
        # Default mapping fallback
        if sev_upper not in PriorityScoringEngine.SEVERITY_MAPPING:
            if "CRIT" in sev_upper:
                sev_upper = "CRITICAL"
            elif "HIGH" in sev_upper or "SEVERE" in sev_upper:
                sev_upper = "HIGH"
            elif "MED" in sev_upper:
                sev_upper = "MEDIUM"
            else:
                sev_upper = "LOW"
        
        vulnerability_note = None
        # Vulnerability Promotion Rule: If vulnerable people are present and severity < HIGH, raise by 1 enum level
        if vulnerable_people:
            if sev_upper == "LOW":
                sev_upper = "MEDIUM"
                vulnerability_note = "Severity promoted from LOW to MEDIUM due to presence of vulnerable individuals (children/elderly/disabled)."
            elif sev_upper == "MEDIUM":
                sev_upper = "HIGH"
                vulnerability_note = "Severity promoted from MEDIUM to HIGH due to presence of vulnerable individuals (children/elderly/disabled)."

        norm_score = PriorityScoringEngine.SEVERITY_MAPPING[sev_upper]
        return norm_score, sev_upper, vulnerability_note

    @staticmethod
    def normalize_people_affected(count: int, vulnerable_people: bool) -> tuple[float, str]:
        c = max(0, count)
        if c == 0:
            base_norm = 0.0
        elif c == 1:
            base_norm = 20.0
        elif 2 <= c <= 5:
            base_norm = 40.0
        elif 6 <= c <= 10:
            base_norm = 65.0
        elif 11 <= c <= 25:
            base_norm = 85.0
        else: # 26+
            base_norm = 100.0

        bonus = 10.0 if vulnerable_people else 0.0
        final_norm = min(100.0, base_norm + bonus)
        
        expl = f"{c} person(s) affected → base score {base_norm:.0f}"
        if bonus > 0:
            expl += f" + {bonus:.0f} vulnerable bonus"
        expl += f" = {final_norm:.0f}/100"
        
        return final_norm, expl

    @staticmethod
    def normalize_facility_proximity(
        incident_lat: float,
        incident_lon: float,
        facilities: List[Dict[str, Any]]
    ) -> tuple[float, float, str, str]:
        if not facilities:
            return 50.0, 999.0, "None", "No active critical facility nearby (default 50/100)."

        min_dist = 999999.0
        nearest_fac_name = "Facility"
        
        for fac in facilities:
            f_lat = fac.get("latitude")
            f_lon = fac.get("longitude")
            if f_lat is None or f_lon is None:
                continue
            dist = haversine_distance(incident_lat, incident_lon, f_lat, f_lon)
            if dist < min_dist:
                min_dist = dist
                nearest_fac_name = fac.get("name", "Critical Facility")

        if min_dist > 900000.0:
            return 50.0, 999.0, "None", "No facilities evaluated."

        # Formula: max(0, 100 - (distance_km / 20) * 100)
        norm_score = max(0.0, 100.0 - (min_dist / 20.0) * 100.0)
        norm_score = round(norm_score, 1)

        expl = f"Nearest facility '{nearest_fac_name}' at {min_dist:.2f} km → proximity score {norm_score:.1f}/100."
        return norm_score, min_dist, nearest_fac_name, expl

    @staticmethod
    def normalize_resource_availability(
        incident_lat: float,
        incident_lon: float,
        available_resources: List[Dict[str, Any]]
    ) -> tuple[float, str]:
        if not available_resources:
            return 0.0, "No compatible available resources in system (0/100)."

        # Find distance to closest available resource
        distances = []
        for r in available_resources:
            r_lat = r.get("latitude")
            r_lon = r.get("longitude")
            if r_lat is not None and r_lon is not None:
                dist = haversine_distance(incident_lat, incident_lon, r_lat, r_lon)
                distances.append(dist)

        if not distances:
            return 0.0, "No available resources with valid coordinates (0/100)."

        min_res_dist = min(distances)

        if min_res_dist <= 2.0:
            norm_score = 100.0
            range_str = "within 2 km"
        elif min_res_dist <= 5.0:
            norm_score = 85.0
            range_str = "within 5 km"
        elif min_res_dist <= 10.0:
            norm_score = 65.0
            range_str = "within 10 km"
        elif min_res_dist <= 20.0:
            norm_score = 40.0
            range_str = "within 20 km"
        else:
            norm_score = 20.0
            range_str = f"beyond 20 km ({min_res_dist:.1f} km)"

        expl = f"Closest compatible available resource is {range_str} → availability score {norm_score:.0f}/100."
        return norm_score, expl

    @staticmethod
    def normalize_time_elapsed(elapsed_minutes: float) -> tuple[float, str]:
        mins = max(0.0, elapsed_minutes)
        # min(100, elapsed_minutes / 180 * 100)
        norm_score = min(100.0, (mins / 180.0) * 100.0)
        norm_score = round(norm_score, 1)

        expl = f"{mins:.1f} minutes elapsed since report ({norm_score:.1f}/100 component, maxes at 180 mins)."
        return norm_score, expl

    @classmethod
    def calculate_priority(
        cls,
        severity: str,
        people_affected: int,
        vulnerable_people: bool,
        incident_lat: float,
        incident_lon: float,
        facilities: List[Dict[str, Any]],
        available_resources: List[Dict[str, Any]],
        elapsed_minutes: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculate deterministic priority score (0-100) and return breakdown.
        """
        # 1. Severity Factor (Weight 0.35, Max 35.0 pts)
        sev_norm, effective_sev, sev_note = cls.normalize_severity(severity, vulnerable_people)
        sev_pts = round(0.35 * sev_norm, 1)
        sev_expl = f"Severity '{effective_sev}' normalized to {sev_norm:.0f}/100."
        if sev_note:
            sev_expl += f" ({sev_note})"

        # 2. People Affected Factor (Weight 0.25, Max 25.0 pts)
        ppl_norm, ppl_expl = cls.normalize_people_affected(people_affected, vulnerable_people)
        ppl_pts = round(0.25 * ppl_norm, 1)

        # 3. Facility Proximity Factor (Weight 0.15, Max 15.0 pts)
        fac_norm, min_fac_dist, nearest_fac_name, fac_expl = cls.normalize_facility_proximity(
            incident_lat, incident_lon, facilities
        )
        fac_pts = round(0.15 * fac_norm, 1)

        # 4. Resource Availability Factor (Weight 0.15, Max 15.0 pts)
        res_norm, res_expl = cls.normalize_resource_availability(
            incident_lat, incident_lon, available_resources
        )
        res_pts = round(0.15 * res_norm, 1)

        # 5. Time Elapsed Factor (Weight 0.10, Max 10.0 pts)
        time_norm, time_expl = cls.normalize_time_elapsed(elapsed_minutes)
        time_pts = round(0.10 * time_norm, 1)

        # Final Score: Sum of awarded points, rounded to nearest integer, clamped 0-100
        raw_sum = sev_pts + ppl_pts + fac_pts + res_pts + time_pts
        final_score = int(round(max(0.0, min(100.0, raw_sum))))

        # Classification exact boundaries: 70-100 HIGH, 40-69 MEDIUM, 0-39 LOW
        if final_score >= 70:
            category = "HIGH"
        elif final_score >= 40:
            category = "MEDIUM"
        else:
            category = "LOW"

        breakdown = {
            "total_score": final_score,
            "category": category,
            "components": {
                "severity": {
                    "raw_input": severity,
                    "effective_severity": effective_sev,
                    "normalized_value": sev_norm,
                    "weight": 0.35,
                    "awarded_points": sev_pts,
                    "max_points": 35.0,
                    "explanation": sev_expl
                },
                "people_affected": {
                    "raw_input": people_affected,
                    "vulnerable_people": vulnerable_people,
                    "normalized_value": ppl_norm,
                    "weight": 0.25,
                    "awarded_points": ppl_pts,
                    "max_points": 25.0,
                    "explanation": ppl_expl
                },
                "facility_proximity": {
                    "nearest_facility": nearest_fac_name,
                    "distance_km": round(min_fac_dist, 2) if min_fac_dist < 900 else None,
                    "normalized_value": fac_norm,
                    "weight": 0.15,
                    "awarded_points": fac_pts,
                    "max_points": 15.0,
                    "explanation": fac_expl
                },
                "resource_availability": {
                    "normalized_value": res_norm,
                    "weight": 0.15,
                    "awarded_points": res_pts,
                    "max_points": 15.0,
                    "explanation": res_expl
                },
                "time_elapsed": {
                    "elapsed_minutes": round(elapsed_minutes, 1),
                    "normalized_value": time_norm,
                    "weight": 0.10,
                    "awarded_points": time_pts,
                    "max_points": 10.0,
                    "explanation": time_expl
                }
            },
            "formula_string": "0.35*Severity + 0.25*PeopleAffected + 0.15*FacilityProximity + 0.15*ResourceAvailability + 0.10*TimeElapsed"
        }

        return {
            "priority_score": float(final_score),
            "priority_category": category,
            "score_breakdown": breakdown
        }

priority_engine = PriorityScoringEngine()
