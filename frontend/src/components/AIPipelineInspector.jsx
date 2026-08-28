import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Sparkles, ArrowRight, ShieldCheck, Database, Layers, Code2 } from 'lucide-react';
import AgenticWorkflow from './AgenticWorkflow';
import { scaleReveal, itemFadeUp } from '../motion/variants';

export default function AIPipelineInspector() {
  return (
    <div className="space-y-6">
      <AgenticWorkflow />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6"
      >
        <div className="bg-white p-6 tactile-box space-y-4 shadow-[6px_6px_0px_#1E2C1D]">
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <h3 className="font-mono font-bold text-base uppercase text-tactile-border flex items-center gap-2">
              <Database className="w-5 h-5 text-tactile-olive" />
              SCIPY OPTIMIZATION ALGORITHM IMPLEMENTATION
            </h3>
            <span className="px-2 py-0.5 bg-tactile-accent text-black font-mono text-[10px] font-black border border-black uppercase">
              PYTHON ENGINE CORE
            </span>
          </div>

          <div className="relative overflow-hidden border-2 border-black">
            {/* One-time scanline reveal */}
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-tactile-accent/40 pointer-events-none z-10"
            />

            <pre className="bg-tactile-oliveDark text-white p-4 font-mono text-xs overflow-x-auto leading-relaxed selection:bg-tactile-accent selection:text-black">
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
      </motion.div>
    </div>
  );
}
