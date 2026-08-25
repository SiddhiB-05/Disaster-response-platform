import numpy as np
import uuid
from scipy.optimize import linear_sum_assignment
from typing import List, Dict, Any, Optional
from app.scoring.priority_engine import haversine_distance

# Documented average emergency vehicle response speed (km/h)
AVERAGE_EMERGENCY_SPEED_KMH = 40.0

# Mandatory Capability Requirements Mapping
CAPABILITY_REQUIREMENTS = {
    "FLOOD_WATER_RESCUE": {
        "required": ["water_rescue", "boat", "flood", "odraf", "ndrf"],
        "fallback": ["search_and_rescue", "rescue team"]
    },
    "MEDICAL_EMERGENCY": {
        "required": ["medical", "ambulance", "first aid", "trauma"],
        "fallback": ["rescue team"]
    },
    "FIRE_HAZARD": {
        "required": ["fire", "fire_suppression", "hazmat"],
        "fallback": ["emergency team"]
    },
    "BUILDING_COLLAPSE": {
        "required": ["search_and_rescue", "collapse", "heavy", "ndrf"],
        "fallback": ["medical", "rescue team"]
    },
    "CYCLONE_WIND_DAMAGE": {
        "required": ["search_and_rescue", "debris_clearance", "shelter", "odraf"],
        "fallback": ["rescue team", "relief vehicle"]
    },
    "LANDSLIDE_ROAD_BLOCK": {
        "required": ["debris_clearance", "road", "engineering", "landslide"],
        "fallback": ["rescue team"]
    },
    "MISSING_TRAPPED_PERSON": {
        "required": ["search_and_rescue", "police", "ndrf"],
        "fallback": ["rescue team"]
    },
    "OTHER": {
        "required": ["rescue", "general", "emergency"],
        "fallback": ["rescue team", "relief vehicle"]
    }
}

class ResourceMatchingEngine:
    """
    SciPy Hungarian Bipartite Matching Engine (`scipy.optimize.linear_sum_assignment`).
    Combines Haversine distance, priority score, capability exact/fallback matches, and vehicle capacity.
    """

    @staticmethod
    def evaluate_capability_match(incident_type: str, resource_capability: str) -> tuple[bool, float, str]:
        """
        Evaluate capability match quality:
        Returns (is_feasible, penalty_cost, match_quality_label)
        - Exact match: True, 0.0 penalty cost
        - Fallback match: True, 30.0 penalty cost
        - Infeasible match: False, 1,000,000.0 penalty cost
        """
        inc_key = incident_type.upper().replace(" ", "_")
        cap_reqs = CAPABILITY_REQUIREMENTS.get(inc_key, CAPABILITY_REQUIREMENTS["OTHER"])
        
        cap_str = resource_capability.lower()

        # Check exact required capabilities
        for req in cap_reqs["required"]:
            if req.lower() in cap_str:
                return True, 0.0, "EXACT_CAPABILITY_MATCH"

        # Check universal capability keywords ("all", "general", "full", "unlimited")
        if any(k in cap_str for k in ["all", "general", "full", "multi-hazard"]):
            return True, 10.0, "UNIVERSAL_CAPABILITY_MATCH"

        # Check fallback capabilities
        for fall in cap_reqs["fallback"]:
            if fall.lower() in cap_str:
                return True, 35.0, "FALLBACK_CAPABILITY_MATCH"

        # Incompatible match penalty
        return False, 1_000_000.0, "INCOMPATIBLE"

    def optimize_bipartite_assignment(
        self,
        incidents: List[Dict[str, Any]],
        available_resources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Global optimization using scipy.optimize.linear_sum_assignment.
        
        Cost formula:
            cost = distance_km
                 + 0.75 * (100 - priority_score)
                 + capability_penalty
                 + capacity_penalty
        """
        import time
        start_time = time.time()
        
        run_id = f"OPT-{uuid.uuid4().hex[:8].upper()}"

        if not incidents or not available_resources:
            return {
                "optimization_run_id": run_id,
                "total_incidents_processed": len(incidents),
                "total_resources_available": len(available_resources),
                "total_assigned": 0,
                "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                "assignments": []
            }

        num_incidents = len(incidents)
        num_resources = len(available_resources)

        # Build Cost Matrix (num_incidents x num_resources)
        cost_matrix = np.zeros((num_incidents, num_resources))

        for i, inc in enumerate(incidents):
            inc_lat = inc["latitude"]
            inc_lon = inc["longitude"]
            inc_type = inc.get("incident_type", "OTHER")
            priority = inc.get("priority_score", 50.0)

            for j, res in enumerate(available_resources):
                res_lat = res["latitude"]
                res_lon = res["longitude"]
                res_cap = res.get("capability", "")
                capacity = res.get("capacity", 1)

                # 1. Haversine Distance (km)
                dist_km = haversine_distance(inc_lat, inc_lon, res_lat, res_lon)

                # 2. Priority Urgency Term: 0.75 * (100 - priority)
                # High priority (e.g. 90) yields small term (7.5 km equiv cost)
                # Low priority (e.g. 20) yields large term (60 km equiv cost)
                priority_term = 0.75 * (100.0 - priority)

                # 3. Capability Penalty
                is_feasible, cap_penalty, match_label = self.evaluate_capability_match(inc_type, res_cap)

                # 4. Capacity Penalty (small incentive for higher capacity)
                cap_bonus = 0.0 if capacity > 5 else 2.0

                # Total Cost
                total_cost = dist_km + priority_term + cap_penalty + cap_bonus
                cost_matrix[i, j] = total_cost

        # Run SciPy Hungarian Algorithm
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        assignments = []
        for r, c in zip(row_ind, col_ind):
            inc = incidents[r]
            res = available_resources[c]
            cost_val = cost_matrix[r, c]

            # Discard impossible pairings where penalty exceeds threshold (e.g. 500,000)
            if cost_val >= 500_000.0:
                continue

            dist_km = haversine_distance(inc["latitude"], inc["longitude"], res["latitude"], res["longitude"])
            is_feasible, cap_penalty, match_quality = self.evaluate_capability_match(
                inc.get("incident_type", "OTHER"),
                res.get("capability", "")
            )
            
            # Estimated Travel Time in minutes
            eta_minutes = round((dist_km / AVERAGE_EMERGENCY_SPEED_KMH) * 60.0, 1)

            # Rationale construction
            priority_val = inc.get("priority_score", 50.0)
            rationale = (
                f"Assigned '{res['name']}' ({res['type']}) to Incident #{inc['id']} at {inc['location_name']}. "
                f"Distance: {dist_km:.2f} km (ETA ~{eta_minutes} mins). Priority Score: {priority_val:.0f}/100. "
                f"Capability Match: {match_quality}."
            )

            assignments.append({
                "incident_id": inc["id"],
                "incident_ref": inc.get("public_ref", f"INC-{inc['id']}"),
                "incident_location": inc["location_name"],
                "incident_type": inc.get("incident_type", "OTHER"),
                "priority_score": priority_val,
                "priority_category": inc.get("priority_category", "MEDIUM"),
                "people_affected": inc.get("people_affected", 1),
                "vulnerable_people": inc.get("vulnerable_people", False),
                "recommended_resource_id": res["id"],
                "recommended_resource_ref": res.get("public_ref", f"RES-{res['id']}"),
                "recommended_resource_name": res["name"],
                "recommended_resource_type": res["type"],
                "distance_km": round(dist_km, 2),
                "eta_minutes": eta_minutes,
                "compatibility_score": 1.0 if cap_penalty == 0.0 else 0.7,
                "optimizer_cost": round(cost_val, 2),
                "is_compatible": is_feasible,
                "match_status": "RECOMMENDED" if cap_penalty == 0.0 else "SUB_OPTIMAL",
                "rationale": rationale
            })

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "optimization_run_id": run_id,
            "total_incidents_processed": num_incidents,
            "total_resources_available": num_resources,
            "total_assigned": len(assignments),
            "execution_time_ms": execution_time_ms,
            "assignments": assignments
        }

matching_engine = ResourceMatchingEngine()
