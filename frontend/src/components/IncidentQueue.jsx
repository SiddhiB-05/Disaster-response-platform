import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, UserCheck, ShieldAlert, ChevronRight, Info, Check, Cpu } from 'lucide-react';
import { assignmentService } from '../services/api';
import AnimatedNumber from './motion/AnimatedNumber';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { toastVariants } from '../motion/variants';

export default function IncidentQueue({ incidents = [], resources = [], onRefreshData }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');
  const hasLoadedInitially = useRef(false);

  // Sync selected incident with latest incident array data
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || (incidents.length > 0 && selectedIncidentId === null ? null : incidents.find(i => i.id === selectedIncidentId));

  useEffect(() => {
    if (incidents.length > 0 && !hasLoadedInitially.current) {
      setSelectedIncidentId(incidents[0].id);
      hasLoadedInitially.current = true;
    }
  }, [incidents]);

  const availableResources = resources.filter((r) => r.status === 'AVAILABLE');

  const handleAssign = async (incidentId, resourceId) => {
    setAssigningId(incidentId);
    setAssignSuccessMsg('');
    try {
      await assignmentService.assignResource(incidentId, resourceId, "Dispatched from priority queue");
      setAssignSuccessMsg(`Resource successfully dispatched! Resource status updated to BUSY.`);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setAssignSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Assignment error:', err);
      const detail = err.response?.data?.detail || 'Failed to assign resource.';
      alert(detail);
    } finally {
      setAssigningId(null);
    }
  };

  const highCount = incidents.filter(i => i.priority_category === 'HIGH').length;
  const medCount = incidents.filter(i => i.priority_category === 'MEDIUM').length;
  const lowCount = incidents.filter(i => i.priority_category === 'LOW').length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex flex-wrap items-center justify-between bg-white p-4 tactile-box"
      >
        <div>
          <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-xs font-bold uppercase">
            LIVE PRIORITY QUEUE // SORTED BY SCORE DESCENDING
          </span>
          <h2 className="text-xl font-mono font-extrabold uppercase mt-1 text-tactile-border">
            DISASTER INCIDENT RESPONSE DISPATCH QUEUE
          </h2>
        </div>
        <div className="flex gap-3 font-mono text-xs font-bold mt-2 sm:mt-0">
          <span className="px-3 py-1 bg-red-100 border border-red-600 text-red-800 flex items-center gap-1.5">
            HIGH: <AnimatedNumber value={highCount} />
          </span>
          <span className="px-3 py-1 bg-amber-100 border border-amber-600 text-amber-800 flex items-center gap-1.5">
            MED: <AnimatedNumber value={medCount} />
          </span>
          <span className="px-3 py-1 bg-emerald-100 border border-emerald-600 text-emerald-800 flex items-center gap-1.5">
            LOW: <AnimatedNumber value={lowCount} />
          </span>
        </div>
      </motion.div>

      {/* Accessible Toast Notification */}
      <AnimatePresence>
        {assignSuccessMsg && (
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="status"
            aria-live="polite"
            className="p-3 bg-emerald-600 text-white font-mono text-xs font-bold border-2 border-black flex items-center justify-between shadow-tactile-sm"
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> {assignSuccessMsg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Left Queue List, Right Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-7 space-y-3">
          {incidents.length === 0 ? (
            <div className="bg-white p-8 tactile-box text-center font-mono text-gray-500">
              No incidents in queue. Submit a report or click "1-CLICK DEMO SEED".
            </div>
          ) : (
            incidents.map((incident) => {
              const isHigh = incident.priority_category === 'HIGH';
              const isMedium = incident.priority_category === 'MEDIUM';
              const isAssigned = incident.status === 'ASSIGNED';
              const isSelected = selectedIncident?.id === incident.id;

              return (
                <motion.div
                  layout="position"
                  key={`queue-item-${incident.id}`}
                  onClick={() => setSelectedIncidentId(incident.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`bg-white p-4 tactile-box transition-colors cursor-pointer ${
                    isSelected ? 'ring-4 ring-tactile-accent bg-emerald-50/60 shadow-[6px_6px_0px_#1E2C1D]' : 'hover:bg-gray-50'
                  } ${isHigh ? 'border-l-8 border-l-red-600' : isMedium ? 'border-l-8 border-l-amber-500' : 'border-l-8 border-l-emerald-600'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gray-500">#INC-00{incident.id}</span>
                        <span className="font-mono text-xs font-extrabold uppercase px-2 py-0.5 bg-tactile-card border border-black">
                          {incident.incident_type}
                        </span>
                        <span className={`px-2 py-0.5 font-mono text-xs font-extrabold uppercase border border-black ${
                          isAssigned ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-black'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                      <h3 className="font-mono font-bold text-base text-tactile-border">
                        {incident.location_name}
                      </h3>
                      <p className="text-xs text-gray-700 font-sans mt-1 line-clamp-2">
                        "{incident.description}"
                      </p>
                    </div>

                    {/* Priority Badge */}
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`px-3 py-1.5 font-mono font-black text-sm border-2 border-black ${
                        isHigh ? 'bg-red-600 text-white shadow-tactile-sm' :
                        isMedium ? 'bg-amber-500 text-black shadow-tactile-sm' : 'bg-emerald-600 text-white shadow-tactile-sm'
                      }`}>
                        <AnimatedNumber value={incident.priority_score} decimals={1} /> / 100
                      </div>
                      <span className="font-mono text-[10px] font-bold block mt-1 uppercase text-gray-600">
                        {incident.priority_category} PRIORITY
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-3 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs font-mono text-gray-600">
                    <span>AFFECTED: <strong>{incident.people_affected} persons</strong></span>
                    <span>SEVERITY: <strong>{incident.ai_severity}</strong></span>
                    <span className="text-tactile-olive font-bold flex items-center gap-1">
                      VIEW EXPLAINABILITY BREAKDOWN <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right Inspector & Resource Dispatch Panel with AnimatePresence */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              <motion.div
                key={`inspector-${selectedIncident.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="bg-white p-5 tactile-box space-y-4"
              >
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-tactile-oliveDark">
                    INCIDENT INSPECTOR // #INC-00{selectedIncident.id}
                  </span>
                  <span className={`px-2 py-0.5 font-mono text-xs font-bold border border-black ${
                    selectedIncident.status === 'ASSIGNED' ? 'bg-blue-600 text-white' : 'bg-amber-400 text-black'
                  }`}>
                    {selectedIncident.status}
                  </span>
                </div>

                {/* Details Header */}
                <div>
                  <h3 className="font-mono font-bold text-lg text-tactile-border">
                    {selectedIncident.location_name}
                  </h3>
                  <p className="text-xs font-sans text-gray-700 bg-tactile-card p-2.5 border border-black mt-2">
                    "{selectedIncident.description}"
                  </p>
                </div>

                {/* Score Breakdown Transparency Box */}
                <div className="p-4 bg-tactile-oliveDark text-white border-2 border-black space-y-2 font-mono">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-xs font-bold uppercase text-tactile-accent flex items-center gap-1">
                      <Info className="w-4 h-4" /> EXPLAINABLE SCORE BREAKDOWN
                    </span>
                    <span className="text-base font-black text-white">
                      <AnimatedNumber value={selectedIncident.priority_score} decimals={1} />/100
                    </span>
                  </div>

                  {selectedIncident.score_breakdown && (
                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex justify-between">
                        <span>Severity Weight (35%):</span>
                        <span className="font-bold text-tactile-accent">{selectedIncident.score_breakdown.severity_component}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>People Affected (25%):</span>
                        <span className="font-bold text-tactile-accent">{selectedIncident.score_breakdown.people_affected_component}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Facility Proximity (15%):</span>
                        <span className="font-bold text-tactile-accent">{selectedIncident.score_breakdown.critical_facility_component}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resource Availability (15%):</span>
                        <span className="font-bold text-tactile-accent">{selectedIncident.score_breakdown.resource_availability_component}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Elapsed (10%):</span>
                        <span className="font-bold text-tactile-accent">{selectedIncident.score_breakdown.time_component}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 text-[11px] text-gray-300">
                        Nearest Facility: {selectedIncident.score_breakdown.nearest_facility} ({selectedIncident.score_breakdown.facility_distance_km} km)
                      </div>
                    </div>
                  )}
                </div>

                {/* Resource Dispatcher Section */}
                <div className="p-4 bg-tactile-card border-2 border-black space-y-3">
                  <h4 className="font-mono font-bold text-xs uppercase text-tactile-border flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-tactile-olive" />
                    RESCUE RESOURCE DISPATCH CONTROL
                  </h4>

                  {selectedIncident.status === 'ASSIGNED' ? (
                    <div className="p-3 bg-blue-100 border border-blue-600 text-blue-900 font-mono text-xs space-y-1">
                      <div className="font-bold">✓ RESOURCE ASSIGNED & DISPATCHED</div>
                      <div>Resource ID #{selectedIncident.assigned_resource_id} is currently handling this emergency.</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block font-mono text-xs font-bold text-gray-700">
                        SELECT AVAILABLE COMPATIBLE TEAM:
                      </label>
                      
                      {availableResources.length === 0 ? (
                        <div className="p-2 bg-red-100 text-red-800 font-mono text-xs border border-red-500">
                          No resources currently AVAILABLE.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {availableResources.map((res) => (
                            <div
                              key={res.id}
                              className="p-2.5 bg-white border-2 border-black flex items-center justify-between text-xs font-mono"
                            >
                              <div>
                                <div className="font-bold">{res.name}</div>
                                <div className="text-[10px] text-gray-600">{res.type} • Cap: {res.capability}</div>
                              </div>
                              <motion.button
                                onClick={() => handleAssign(selectedIncident.id, res.id)}
                                disabled={assigningId === selectedIncident.id}
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 1 }}
                                className="px-3 py-1 bg-tactile-accent hover:bg-emerald-400 text-black font-bold uppercase border border-black shadow-tactile-sm transition disabled:opacity-50"
                              >
                                {assigningId === selectedIncident.id ? 'DISPATCHING...' : 'ASSIGN'}
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-inspector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-6 tactile-box text-center font-mono text-xs text-gray-500 space-y-2"
              >
                <Info className="w-8 h-8 text-tactile-olive mx-auto" />
                <p className="font-bold text-black uppercase">SELECT AN INCIDENT FROM THE QUEUE</p>
                <p>Click any incident card on the left to inspect its transparent AI score breakdown and dispatch rescue resources.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
