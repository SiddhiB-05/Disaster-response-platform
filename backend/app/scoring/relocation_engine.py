import math
from typing import List, Dict, Any, Tuple
from app.scoring.priority_engine import haversine_distance

class RelocationEngine:
    """
    Proactive Multi-Hazard Relocation Engine for State Disaster Management Authorities (SDMA).
    
    Formula:
        Relocation Priority Score (R) = 0.35 * Hazard_Intensity 
                                      + 0.25 * Demographic_Vulnerability 
                                      + 0.20 * Disaster_History_Impact 
                                      + 0.20 * Structural_Risk
    """

    @staticmethod
    def calculate_site_suitability(
        elevation_m: float,
        slope_degree: float,
        soil_stability: float,
        dist_from_red_zone_km: float,
        infra_rating: float
    ) -> float:
        """
        Calculate site suitability score (0-100).
        Lower slope (< 10 deg) and higher elevation above flood lines yield higher suitability.
        """
        if slope_degree <= 5.0:
            slope_score = 100.0
        elif slope_degree <= 10.0:
            slope_score = 80.0
        elif slope_degree <= 15.0:
            slope_score = 50.0
        else:
            slope_score = 20.0

        dist_score = min(100.0, (dist_from_red_zone_km / 10.0) * 100.0)

        suitability = (0.25 * slope_score +
                       0.25 * soil_stability +
                       0.25 * dist_score +
                       0.25 * infra_rating)
        
        return round(max(0.0, min(100.0, suitability)), 1)

    @staticmethod
    def calculate_habitation_priority(
        hazard_intensity: float,
        population: int,
        vulnerable_children: int,
        vulnerable_elderly: int,
        poverty_index: float,
        housing_type: str,
        disaster_history_count: int
    ) -> Dict[str, Any]:
        """
        Calculate deterministic relocation priority score (0-100) and assign tier.
        """
        h_score = max(0.0, min(100.0, hazard_intensity))
        h_pts = round(0.35 * h_score, 1)

        vulnerable_ratio = (vulnerable_children + vulnerable_elderly) / max(1, population)
        demo_score = min(100.0, (vulnerable_ratio * 70.0) + (poverty_index * 0.30))
        demo_pts = round(0.25 * demo_score, 1)

        if disaster_history_count == 0:
            hist_score = 10.0
        elif disaster_history_count <= 2:
            hist_score = 45.0
        elif disaster_history_count <= 4:
            hist_score = 75.0
        else:
            hist_score = 100.0
        hist_pts = round(0.20 * hist_score, 1)

        ht_upper = housing_type.upper()
        if "KUTCHA" in ht_upper or "TEMPORARY" in ht_upper:
            struct_score = 100.0
        elif "SEMI" in ht_upper:
            struct_score = 60.0
        else:
            struct_score = 25.0
        struct_pts = round(0.20 * struct_score, 1)

        total_score = round(max(0.0, min(100.0, h_pts + demo_pts + hist_pts + struct_pts)), 1)

        if total_score >= 75.0:
            tier = "IMMEDIATE"
        elif total_score >= 50.0:
            tier = "SHORT_TERM"
        else:
            tier = "MEDIUM_TERM"

        breakdown = {
            "total_score": total_score,
            "tier": tier,
            "components": {
                "hazard_intensity": {"score": h_score, "pts": h_pts, "weight": 0.35},
                "demographic_vulnerability": {"score": round(demo_score, 1), "pts": demo_pts, "weight": 0.25},
                "disaster_history": {"score": hist_score, "pts": hist_pts, "weight": 0.20},
                "structural_risk": {"score": struct_score, "pts": struct_pts, "weight": 0.20}
            }
        }

        return {
            "score": total_score,
            "tier": tier,
            "breakdown": breakdown
        }

    @classmethod
    def optimize_relocation_allocation(
        cls,
        habitations: List[Dict[str, Any]],
        sites: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Allocate vulnerable habitations to safe relocation sites respecting carrying capacity.
        """
        sorted_habitations = sorted(
            habitations,
            key=lambda x: x.get("relocation_priority_score", 0),
            reverse=True
        )

        site_capacities = {}
        for s in sites:
            max_cap = s.get("max_capacity_people", 5000)
            curr_occ = s.get("current_occupied", 0)
            site_capacities[s["id"]] = max(0, max_cap - curr_occ)

        allocations = []
        unassigned = []

        for hab in sorted_habitations:
            hab_pop = hab.get("population", 100)
            hab_lat = hab.get("latitude")
            hab_lon = hab.get("longitude")

            best_site = None
            best_cost = 999999.0

            for s in sites:
                site_id = s["id"]
                avail_cap = site_capacities[site_id]

                if avail_cap >= hab_pop:
                    dist = haversine_distance(hab_lat, hab_lon, s["latitude"], s["longitude"])
                    suitability = s.get("suitability_score", 70.0)
                    cost = dist / (max(1.0, suitability) / 100.0)

                    if cost < best_cost:
                        best_cost = cost
                        best_site = s

            if best_site:
                site_id = best_site["id"]
                site_capacities[site_id] -= hab_pop
                allocations.append({
                    "habitation_id": hab["id"],
                    "habitation_name": hab["name"],
                    "habitation_population": hab_pop,
                    "relocation_tier": hab.get("relocation_tier", "IMMEDIATE"),
                    "priority_score": hab.get("relocation_priority_score", 0),
                    "allocated_site_id": site_id,
                    "allocated_site_name": best_site["name"],
                    "distance_km": round(haversine_distance(hab_lat, hab_lon, best_site["latitude"], best_site["longitude"]), 2),
                    "site_suitability": best_site.get("suitability_score", 80),
                    "remaining_site_capacity": site_capacities[site_id]
                })
            else:
                unassigned.append({
                    "habitation_id": hab["id"],
                    "habitation_name": hab["name"],
                    "population": hab_pop,
                    "reason": "Exceeds carrying capacity of available safe sites in range"
                })

        return {
            "total_habitations_processed": len(habitations),
            "successfully_allocated": len(allocations),
            "unassigned_habitations": len(unassigned),
            "allocations": allocations,
            "unassigned": unassigned
        }

relocation_engine = RelocationEngine()
