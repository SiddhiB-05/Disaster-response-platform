import numpy as np
from scipy.optimize import linear_sum_assignment
from typing import List, Dict, Any, Optional
from app.scoring.priority_engine import haversine_distance

class ResourceMatchingEngine:
    """
    Optimized Disaster Resource Matching Engine using SciPy linear_sum_assignment.
    Combines Haversine distance, Capability matching, Resource Availability, and Priority weighting.
    """

    @staticmethod
    def is_capability_matching(incident_type: str, resource_capability: str) -> bool:
        """Check if resource capability matches the incident requirements."""
        inc_lower = incident_type.lower()
        cap_lower = resource_capability.lower()

        if "general" in cap_lower or "all" in cap_lower or "rescue" in cap_lower:
            return True
        if inc_lower in cap_lower:
            return True
        if "flood" in inc_lower and ("flood" in cap_lower or "water" in cap_lower or "boat" in cap_lower):
            return True
        if "medical" in inc_lower and ("medical" in cap_lower or "ambulance" in cap_lower or "first aid" in cap_lower):
            return True
        if "fire" in inc_lower and ("fire" in cap_lower or "hazard" in cap_lower):
            return True
        if "road" in inc_lower and ("road" in cap_lower or "clearance" in cap_lower or "debris" in cap_lower or "landslide" in cap_lower):
            return True
        if "building" in inc_lower and ("collapse" in cap_lower or "landslide" in cap_lower or "heavy" in cap_lower):
            return True
        return False

    def find_best_single_resource(
        self,
        incident_type: str,
        incident_lat: float,
        incident_lon: float,
        available_resources: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Find single closest compatible available resource for an incident."""
        if not available_resources:
            return None

        candidates = []
        for res in available_resources:
            if res.get("status") not in ["AVAILABLE"]:
                continue

            dist = haversine_distance(incident_lat, incident_lon, res["latitude"], res["longitude"])
            compatible = self.is_capability_matching(incident_type, res.get("capability", ""))

            # Score: dist + penalty if incompatible
            score = dist + (0.0 if compatible else 1000.0)
            candidates.append({
                "resource": res,
                "distance_km": round(dist, 2),
                "is_compatible": compatible,
                "score": score
            })

        if not candidates:
            return None

        candidates.sort(key=lambda x: x["score"])
        best = candidates[0]
        return {
            "resource_id": best["resource"]["id"],
            "resource_name": best["resource"]["name"],
            "resource_type": best["resource"]["type"],
            "distance_km": best["distance_km"],
            "is_compatible": best["is_compatible"]
        }

    def optimize_bipartite_assignment(
        self,
        incidents: List[Dict[str, Any]],
        available_resources: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Multi-Incident Multi-Resource Global Optimization using SciPy linear_sum_assignment.
        """
        if not incidents or not available_resources:
            return []

        # Filter active incidents and available resources
        unassigned_incidents = [inc for inc in incidents if inc.get("status") == "UNASSIGNED"]
        usable_resources = [res for res in available_resources if res.get("status") == "AVAILABLE"]

        if not unassigned_incidents or not usable_resources:
            return []

        num_incidents = len(unassigned_incidents)
        num_resources = len(usable_resources)

        # Build Cost Matrix (num_incidents x num_resources)
        cost_matrix = np.zeros((num_incidents, num_resources))

        for i, inc in enumerate(unassigned_incidents):
            inc_lat = inc["latitude"]
            inc_lon = inc["longitude"]
            inc_type = inc["incident_type"]
            p_score = inc.get("priority_score", 50.0)

            for j, res in enumerate(usable_resources):
                res_lat = res["latitude"]
                res_lon = res["longitude"]
                res_cap = res.get("capability", "")

                dist = haversine_distance(inc_lat, inc_lon, res_lat, res_lon)
                compatible = self.is_capability_matching(inc_type, res_cap)

                # Cost function:
                # 1. Base distance (km)
                # 2. Incompatibility penalty (+500 km equivalent cost)
                # 3. High Priority Discount (-0.1 * priority_score so urgent incidents get closer resources)
                incompatibility_penalty = 0.0 if compatible else 500.0
                priority_discount = 0.05 * p_score

                cost = dist + incompatibility_penalty - priority_discount
                cost_matrix[i, j] = max(0.1, cost)

        # Run SciPy Hungarian Algorithm / Bipartite Linear Sum Assignment
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        assignments = []
        for r, c in zip(row_ind, col_ind):
            inc = unassigned_incidents[r]
            res = usable_resources[c]

            dist = haversine_distance(inc["latitude"], inc["longitude"], res["latitude"], res["longitude"])
            compatible = self.is_capability_matching(inc["incident_type"], res.get("capability", ""))

            assignments.append({
                "incident_id": inc["id"],
                "incident_location": inc["location_name"],
                "incident_type": inc["incident_type"],
                "priority_score": inc.get("priority_score", 0.0),
                "recommended_resource_id": res["id"],
                "recommended_resource_name": res["name"],
                "recommended_resource_type": res["type"],
                "distance_km": round(dist, 2),
                "is_compatible": compatible,
                "match_status": "RECOMMENDED" if compatible else "SUB_OPTIMAL"
            })

        return assignments

matching_engine = ResourceMatchingEngine()
