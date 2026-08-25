import React from 'react';
import { Cpu, Sparkles, ArrowRight, ShieldCheck, Database, Layers } from 'lucide-react';
import AgenticWorkflow from './AgenticWorkflow';

export default function AIPipelineInspector() {
  return (
    <div className="space-y-6">
      <AgenticWorkflow />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white p-6 tactile-box space-y-4">
          <h3 className="font-mono font-bold text-base uppercase text-tactile-border border-b-2 border-black pb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-tactile-olive" />
            SCIPY OPTIMIZATION ALGORITHM IMPLEMENTATION
          </h3>
          <pre className="bg-tactile-oliveDark text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black leading-relaxed">
{`from scipy.optimize import linear_sum_assignment
import numpy as np

# Construct Cost Matrix for unassigned incidents x available rescue resources
# Cost = Haversine_Distance + Incompatibility_Penalty - Priority_Score_Discount
cost_matrix = np.zeros((num_incidents, num_resources))

for i, incident in enumerate(unassigned_incidents):
    for j, resource in enumerate(available_resources):
        dist = haversine_distance(incident.lat, incident.lon, resource.lat, resource.lon)
        compatible = is_capability_matching(incident.type, resource.capability)
        cost_matrix[i, j] = dist + (0 if compatible else 500) - (0.05 * incident.priority_score)

# Global Optimal Bipartite Matching
row_ind, col_ind = linear_sum_assignment(cost_matrix)`}
          </pre>
        </div>
      </div>
    </div>
  );
}

