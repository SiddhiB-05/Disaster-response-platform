import React, { useState } from 'react';
import { Cpu, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { assignmentService } from '../services/api';

export default function SciPyMatcher({ incidents, resources, onRefreshData }) {
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [assigningPair, setAssigningPair] = useState(null);

  const unassignedIncidents = incidents.filter(i => i.status === 'UNASSIGNED');
  const availableResources = resources.filter(r => r.status === 'AVAILABLE');

  const handleRunSciPy = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.runOptimization();
      setOptimizationResult(res);
    } catch (err) {
      console.error('SciPy optimization error:', err);
      alert('Failed to run SciPy optimization.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAssignment = async (incidentId, resourceId) => {
    setAssigningPair(incidentId);
    try {
      await assignmentService.assignResource(incidentId, resourceId);
      if (onRefreshData) onRefreshData();
      handleRunSciPy(); // Refresh optimization recommendations
    } catch (err) {
      console.error('Failed to assign resource:', err);
      alert('Assignment failed.');
    } finally {
      setAssigningPair(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white p-5 tactile-box flex flex-wrap items-center justify-between">
        <div>
          <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-xs font-bold uppercase">
            MATHEMATICAL ALLOCATION ENGINE // scipy.optimize.linear_sum_assignment
          </span>
          <h2 className="text-xl font-mono font-bold uppercase mt-1 text-tactile-border">
            SCIPY MULTI-INCIDENT RESOURCE OPTIMIZATION
          </h2>
        </div>

        <button
          onClick={handleRunSciPy}
          disabled={loading}
          className="px-4 py-2 bg-tactile-accent hover:bg-emerald-500 text-black font-mono font-extrabold text-xs uppercase border-2 border-black shadow-tactile flex items-center gap-2 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              SOLVING BIPARTITE MATRIX...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              RUN SCIPY OPTIMIZE ALGORITHM
            </>
          )}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-white p-4 tactile-box border-l-4 border-l-amber-500">
          <span className="text-gray-500 text-xs block font-bold">UNASSIGNED INCIDENTS</span>
          <span className="text-2xl font-black text-amber-600">{unassignedIncidents.length}</span>
        </div>
        <div className="bg-white p-4 tactile-box border-l-4 border-l-blue-600">
          <span className="text-gray-500 text-xs block font-bold">AVAILABLE RESCUE TEAMS</span>
          <span className="text-2xl font-black text-blue-600">{availableResources.length}</span>
        </div>
        <div className="bg-white p-4 tactile-box border-l-4 border-l-tactile-accent">
          <span className="text-gray-500 text-xs block font-bold">MATHEMATICAL MATCHES</span>
          <span className="text-2xl font-black text-emerald-700">
            {optimizationResult ? optimizationResult.total_assigned : '0'}
          </span>
        </div>
      </div>

      {/* Optimization Results Table */}
      {optimizationResult ? (
        <div className="bg-white p-6 tactile-box space-y-4">
          <h3 className="font-mono font-bold text-sm uppercase text-tactile-border border-b-2 border-black pb-2 flex items-center justify-between">
            <span>SCIPY BIPARTITE OPTIMAL MATCHING RECOMMENDATIONS</span>
            <span className="text-xs font-normal text-gray-500">HAVERSINE DISTANCE + PRIORITY DISCOUNT COST MATRIX</span>
          </h3>

          {optimizationResult.assignments.length === 0 ? (
            <div className="p-6 bg-tactile-card border border-black text-center font-mono text-xs text-gray-600">
              No unassigned incidents or available resources left to match.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-tactile-oliveDark text-white border-2 border-black">
                    <th className="p-3 border border-black">INCIDENT</th>
                    <th className="p-3 border border-black">PRIORITY</th>
                    <th className="p-3 border border-black">RECOMMENDED RESOURCE</th>
                    <th className="p-3 border border-black">HAVERSINE DISTANCE</th>
                    <th className="p-3 border border-black">CAPABILITY CHECK</th>
                    <th className="p-3 border border-black text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-2 border-black">
                  {optimizationResult.assignments.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/60 bg-white">
                      <td className="p-3 border border-black">
                        <div className="font-bold text-black">#{item.incident_id} - {item.incident_location}</div>
                        <div className="text-[10px] text-gray-600">{item.incident_type}</div>
                      </td>
                      <td className="p-3 border border-black font-black text-red-600">
                        {item.priority_score} / 100
                      </td>
                      <td className="p-3 border border-black">
                        <div className="font-bold text-blue-900">{item.recommended_resource_name}</div>
                        <div className="text-[10px] text-gray-600">{item.recommended_resource_type}</div>
                      </td>
                      <td className="p-3 border border-black font-bold">
                        {item.distance_km} km
                      </td>
                      <td className="p-3 border border-black">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                          item.is_compatible ? 'bg-emerald-100 border-emerald-600 text-emerald-800' : 'bg-red-100 border-red-600 text-red-800'
                        }`}>
                          {item.is_compatible ? '✓ COMPATIBLE' : '⚠️ SUB-OPTIMAL'}
                        </span>
                      </td>
                      <td className="p-3 border border-black text-center">
                        <button
                          onClick={() => handleExecuteAssignment(item.incident_id, item.recommended_resource_id)}
                          disabled={assigningPair === item.incident_id}
                          className="px-3 py-1 bg-tactile-accent hover:bg-emerald-500 text-black font-bold uppercase border border-black shadow-tactile-sm transition"
                        >
                          CONFIRM DISPATCH
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 tactile-box text-center space-y-3">
          <Cpu className="w-10 h-10 text-tactile-olive mx-auto" />
          <h3 className="font-mono font-bold text-base uppercase">READY TO EXECUTE SCIPY MATCHING</h3>
          <p className="font-sans text-xs text-gray-600 max-w-xl mx-auto">
            Click "RUN SCIPY OPTIMIZE ALGORITHM" above to construct the bipartite distance cost matrix and compute globally optimal pairings using <code className="font-mono bg-gray-200 px-1">scipy.optimize.linear_sum_assignment</code>.
          </p>
        </div>
      )}
    </div>
  );
}
