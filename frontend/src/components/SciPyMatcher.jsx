import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, Check } from 'lucide-react';
import { assignmentService } from '../services/api';
import AnimatedNumber from './motion/AnimatedNumber';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { toastVariants } from '../motion/variants';

export default function SciPyMatcher({ incidents = [], resources = [], onRefreshData }) {
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [assigningPair, setAssigningPair] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const unassignedIncidents = incidents.filter(i => ['REPORTED', 'VERIFIED', 'UNASSIGNED'].includes(i.status));
  const availableResources = resources.filter(r => r.status === 'AVAILABLE');

  const handleRunSciPy = async () => {
    setLoading(true);
    setSuccessMsg('');
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
    setSuccessMsg('');
    try {
      await assignmentService.confirmAssignment(
        incidentId,
        resourceId,
        "Authority confirmed SciPy Hungarian recommendation."
      );
      setSuccessMsg(`Resource successfully dispatched! Status updated to BUSY.`);
      if (onRefreshData) onRefreshData();
      handleRunSciPy(); // Refresh optimization recommendations
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to confirm assignment:', err);
      alert(err.response?.data?.detail || 'Assignment confirmation failed.');
    } finally {
      setAssigningPair(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
      {/* Header Box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white p-5 border-[3px] border-black shadow-[6px_6px_0px_#101010] flex flex-wrap items-center justify-between gap-3 relative overflow-hidden"
      >
        {/* Matrix scan line treatment when loading */}
        {loading && (
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-tactile-accent/30 to-transparent pointer-events-none"
          />
        )}

        <div>
          <span className="px-2.5 py-0.5 bg-black text-white font-bold uppercase border border-black">
            MATHEMATICAL ALLOCATION ENGINE // scipy.optimize.linear_sum_assignment
          </span>
          <h2 className="text-xl font-black uppercase mt-1 text-black">
            SCIPY MULTI-INCIDENT RESOURCE OPTIMIZATION
          </h2>
        </div>

        <motion.button
          onClick={handleRunSciPy}
          disabled={loading}
          whileHover={!loading ? { y: -1 } : {}}
          whileTap={!loading ? { y: 1 } : {}}
          className="px-5 py-3 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-xs uppercase border-[3px] border-black shadow-[4px_4px_0px_#101010] flex items-center gap-2 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              SOLVING HUNGARIAN MATRIX...
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              RUN SCIPY OPTIMIZE ALGORITHM
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Accessible Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="status"
            aria-live="polite"
            className="p-3 bg-emerald-600 text-white font-bold border-[3px] border-black shadow-[4px_4px_0px_#101010] flex items-center gap-2"
          >
            <Check className="w-5 h-5 flex-shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row with AnimatedNumber */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white p-4 border-[3px] border-black shadow-[4px_4px_0px_#101010] border-l-8 border-l-amber-500"
        >
          <span className="text-gray-600 font-bold block uppercase">OPEN / UNASSIGNED INCIDENTS</span>
          <span className="text-2xl font-black text-amber-600">
            <AnimatedNumber value={unassignedIncidents.length} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white p-4 border-[3px] border-black shadow-[4px_4px_0px_#101010] border-l-8 border-l-blue-600"
        >
          <span className="text-gray-600 font-bold block uppercase">AVAILABLE RESCUE TEAMS</span>
          <span className="text-2xl font-black text-blue-600">
            <AnimatedNumber value={availableResources.length} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white p-4 border-[3px] border-black shadow-[4px_4px_0px_#101010] border-l-8 border-l-emerald-600"
        >
          <span className="text-gray-600 font-bold block uppercase">MATHEMATICAL MATCHES</span>
          <span className="text-2xl font-black text-emerald-700">
            <AnimatedNumber value={optimizationResult ? optimizationResult.total_assigned : 0} />
          </span>
        </motion.div>
      </div>

      {/* Optimization Results Table */}
      <AnimatePresence mode="wait">
        {optimizationResult ? (
          <motion.div
            key="results-table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="bg-white p-6 border-[3px] border-black shadow-[6px_6px_0px_#101010] space-y-4"
          >
            <div className="font-black text-sm uppercase text-black border-b-[3px] border-black pb-2 flex items-center justify-between flex-wrap gap-2">
              <span>SCIPY BIPARTITE OPTIMAL MATCHING RECOMMENDATIONS</span>
              <span className="text-xs font-normal text-gray-600">
                EXECUTION: {optimizationResult.execution_time_ms} ms
              </span>
            </div>

            {optimizationResult.assignments.length === 0 ? (
              <div className="p-6 bg-amber-50 border-2 border-black text-center font-bold text-gray-700">
                No unassigned incidents or available resources left to match.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white border-2 border-black">
                      <th className="p-3 border border-black">INCIDENT</th>
                      <th className="p-3 border border-black">PRIORITY</th>
                      <th className="p-3 border border-black">RECOMMENDED RESOURCE</th>
                      <th className="p-3 border border-black">HAVERSINE DIST / ETA</th>
                      <th className="p-3 border border-black">CAPABILITY MATCH</th>
                      <th className="p-3 border border-black text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-2 border-black">
                    {optimizationResult.assignments.map((item, idx) => (
                      <motion.tr
                        key={`assign-row-${item.incident_id}-${idx}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.25) }}
                        className="hover:bg-emerald-50 bg-white transition-colors"
                      >
                        <td className="p-3 border border-black">
                          <div className="font-black text-black">#{item.incident_id} [{item.incident_ref}]</div>
                          <div className="text-[11px] text-gray-700">{item.incident_location}</div>
                          <div className="text-[10px] text-gray-500">{item.incident_type}</div>
                        </td>
                        <td className="p-3 border border-black font-black text-red-600">
                          {item.priority_score} / 100 ({item.priority_category})
                        </td>
                        <td className="p-3 border border-black">
                          <div className="font-bold text-blue-900">{item.recommended_resource_name}</div>
                          <div className="text-[10px] text-gray-600">{item.recommended_resource_type}</div>
                        </td>
                        <td className="p-3 border border-black font-bold">
                          <div>{item.distance_km} km</div>
                          <div className="text-[10px] text-gray-500">ETA ~{item.eta_minutes} mins</div>
                        </td>
                        <td className="p-3 border border-black">
                          <span className={`px-2 py-0.5 border border-black text-[10px] font-bold ${
                            item.is_compatible ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                          }`}>
                            {item.match_status}
                          </span>
                        </td>
                        <td className="p-3 border border-black text-center">
                          <motion.button
                            onClick={() => handleExecuteAssignment(item.incident_id, item.recommended_resource_id)}
                            disabled={assigningPair === item.incident_id}
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 1 }}
                            className="px-3 py-1.5 bg-tactile-accent hover:bg-emerald-400 text-black font-black uppercase border-2 border-black shadow-tactile-sm transition disabled:opacity-50"
                          >
                            {assigningPair === item.incident_id ? 'CONFIRMING...' : 'CONFIRM DISPATCH'}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty-scipy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-8 border-[3px] border-black shadow-[6px_6px_0px_#101010] text-center space-y-3"
          >
            <Cpu className="w-10 h-10 text-black mx-auto" />
            <h3 className="font-black text-base uppercase">READY TO EXECUTE SCIPY MATCHING</h3>
            <p className="font-sans text-xs text-gray-700 max-w-xl mx-auto">
              Click "RUN SCIPY OPTIMIZE ALGORITHM" above to construct the cost matrix and compute globally optimal pairings using <code className="font-mono bg-gray-200 px-1 border border-black">scipy.optimize.linear_sum_assignment</code>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
