import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { relocationService } from '../services/api';
import { AlertTriangle, ShieldCheck, MapPin, Users, Home, TrendingUp, Cpu, Activity, RefreshCw, FileText, CheckCircle, ArrowRight, X } from 'lucide-react';

export default function RelocationPlanner() {
  const [redZones, setRedZones] = useState([]);
  const [sites, setSites] = useState([]);
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState('ALL');
  const [sdmaReport, setSdmaReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState(null);
  
  // Selected Habitation Profile Modal State
  const [selectedHabitation, setSelectedHabitation] = useState(null);

  // Authority Weight Configurator State
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [weights, setWeights] = useState({
    hazardIntensity: 35,
    demographicVulnerability: 25,
    disasterHistory: 20,
    structuralRisk: 20
  });

  // Demo Simulation State
  const [demoStep, setDemoStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rzData, siteData, habData] = await Promise.all([
        relocationService.getRedZones(),
        relocationService.getSites(),
        relocationService.getHabitations()
      ]);
      setRedZones(rzData || []);
      setSites(siteData || []);
      setHabitations(habData || []);
    } catch (err) {
      console.error("Failed to fetch relocation data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntensity = async (zoneId, newIntensity) => {
    try {
      await relocationService.updateRedZoneIntensity(zoneId, parseFloat(newIntensity));
      fetchData();
    } catch (err) {
      alert("Failed to update hazard intensity.");
    }
  };

  const handleAllocate = async () => {
    setAllocating(true);
    try {
      const res = await relocationService.allocateCarryingCapacity();
      setAllocationResult(res);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to run carrying capacity allocation.");
    } finally {
      setAllocating(false);
    }
  };

  const handleGenerateSDMAReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await relocationService.generateSDMAReport({
        district: "State Multi-Hazard Region",
        target_state: "State Disaster Management Authority"
      });
      setSdmaReport(report);
    } catch (err) {
      console.error(err);
      alert("Failed to generate SDMA Policy Brief.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // 1-Click Hackathon Demo Simulator (12-step complete workflow)
  const runDemoSimulation = async () => {
    setIsSimulating(true);
    setDemoStep(1);
    
    // Step 1-3: Hazard Intensity Increases -> Risk Score Updates -> Red Zone Created
    await new Promise(r => setTimeout(r, 1200));
    setDemoStep(2);
    if (redZones.length > 0) {
      await handleUpdateIntensity(redZones[0].id, 96.0);
    }

    await new Promise(r => setTimeout(r, 1200));
    setDemoStep(3);
    
    // Step 4-6: Relocation Priority Re-calculated -> Immediate Tier -> Safe Sites Discovered
    await new Promise(r => setTimeout(r, 1200));
    setDemoStep(4);
    await relocationService.prioritizeAll();
    await fetchData();

    await new Promise(r => setTimeout(r, 1200));
    setDemoStep(5);
    
    // Step 7-10: Carrying Capacity Calculated -> Safe Route -> Resources Allocated -> Plan Generated
    await handleAllocate();
    setDemoStep(6);
    await handleGenerateSDMAReport();

    await new Promise(r => setTimeout(r, 1000));
    setDemoStep(7);
    setIsSimulating(false);
  };

  const filteredHabitations = activeTier === 'ALL'
    ? habitations
    : habitations.filter(h => h.relocation_tier === activeTier);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'IMMEDIATE':
        return <span className="px-2.5 py-1 bg-red-600 text-white font-mono text-[11px] font-black uppercase border border-black shadow-[2px_2px_0px_#000]">🔴 IMMEDIATE (0-3M)</span>;
      case 'SHORT_TERM':
        return <span className="px-2.5 py-1 bg-amber-500 text-black font-mono text-[11px] font-black uppercase border border-black shadow-[2px_2px_0px_#000]">🟠 SHORT-TERM (3-12M)</span>;
      case 'MEDIUM_TERM':
        return <span className="px-2.5 py-1 bg-blue-600 text-white font-mono text-[11px] font-black uppercase border border-black shadow-[2px_2px_0px_#000]">🟡 MEDIUM-TERM (1-3Y)</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-700 text-white font-mono text-[11px] font-black uppercase border border-black">{tier}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 font-sans text-tactile-border">
      
      {/* DRISHTi Tactile Header Banner */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#162415] text-[#6DBE5A] font-mono text-xs font-black uppercase border border-black tracking-wider">
                PS 26191 // SDMA INTELLIGENT RELOCATION PLATFORM
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6DBE5A] animate-radar"></span>
                AI HAZARD RISK ENGINE ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-black uppercase mt-2 text-tactile-border tracking-tight">
              MULTI-HAZARD RED-ZONE & CARRYING CAPACITY RELOCATION PLANNING
            </h1>
            <p className="font-sans text-sm text-gray-700 font-medium mt-1 max-w-4xl">
              Proactively identifies hazard-based Red Zones (landslides, flash floods, coastal erosion, cloudbursts), calculates explainable vulnerability scores, evaluates safe relocation site carrying capacities, and generates decision support plans for State Disaster Management Authorities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runDemoSimulation}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Activity className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? `SIMULATING STEP ${demoStep}/7...` : '⚡ RUN 1-CLICK DEMO SCENARIO'}</span>
            </button>

            <button
              onClick={handleAllocate}
              disabled={allocating}
              className="px-4 py-2.5 bg-[#6DBE5A] hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{allocating ? 'OPTIMIZING ALLOCATION...' : 'EXECUTE CARRYING CAPACITY ALLOCATION'}</span>
            </button>

            <button
              onClick={handleGenerateSDMAReport}
              disabled={generatingReport}
              className="px-4 py-2.5 bg-[#162415] hover:bg-[#1E2C1D] text-white font-mono font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#6DBE5A]" />
              <span>{generatingReport ? 'GENERATING BRIEF...' : 'GENERATE SDMA POLICY BRIEF'}</span>
            </button>
          </div>
        </div>

        {/* Tactical Key Performance Indicator (KPI) Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t-2 border-black">
          <div className="bg-[#EAEFE8] p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-gray-600 uppercase block">Total Habitations</span>
            <span className="font-mono text-xl font-black text-black">{habitations.length}</span>
          </div>

          <div className="bg-red-100 p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-red-900 uppercase block">Red-Zone Habitations</span>
            <span className="font-mono text-xl font-black text-red-700">{redZones.reduce((s, r) => s + (r.vulnerable_habitations_count || 1), 0)}</span>
          </div>

          <div className="bg-red-50 p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-red-900 uppercase block">🔴 Immediate Tier</span>
            <span className="font-mono text-xl font-black text-red-800">{habitations.filter(h => h.relocation_tier === 'IMMEDIATE').length}</span>
          </div>

          <div className="bg-amber-50 p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-amber-900 uppercase block">🟠 Short-Term Tier</span>
            <span className="font-mono text-xl font-black text-amber-800">{habitations.filter(h => h.relocation_tier === 'SHORT_TERM').length}</span>
          </div>

          <div className="bg-emerald-50 p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-emerald-900 uppercase block">Safe Relocation Sites</span>
            <span className="font-mono text-xl font-black text-emerald-800">{sites.length} Approved</span>
          </div>

          <div className="bg-blue-50 p-3 border-2 border-black shadow-[3px_3px_0px_#1E2C1D]">
            <span className="font-mono text-[10px] font-bold text-blue-900 uppercase block">Available Capacity</span>
            <span className="font-mono text-xl font-black text-blue-800">
              {sites.reduce((sum, s) => sum + Math.max(0, s.max_capacity_people - s.current_occupied), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Red Zones + Vulnerable Habitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Red Zones List & Modifier */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="font-mono font-black text-base uppercase text-tactile-border flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 border border-black"></span>
                MULTI-HAZARD RED ZONES
              </h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 font-mono text-[10px] font-bold uppercase border border-red-600">
                UNSAFE ZONES
              </span>
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {redZones.map((rz) => (
                <div key={rz.id} className="bg-[#EAEFE8] border-2 border-black p-4 space-y-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-mono font-bold text-sm text-black uppercase">{rz.name}</h3>
                      <div className="text-xs text-gray-600 font-mono">{rz.district}, {rz.state}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-black text-white font-mono text-[10px] font-bold uppercase border border-black">
                      {rz.hazard_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-white p-2 border border-black">
                      <span className="text-gray-500 block text-[10px]">Hazard Score</span>
                      <span className="font-black text-red-600 text-sm">{rz.hazard_intensity}/100</span>
                    </div>
                    <div className="bg-white p-2 border border-black">
                      <span className="text-gray-500 block text-[10px]">Population at Risk</span>
                      <span className="font-black text-black text-sm">{rz.population_at_risk?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Explainable AI Why Red Zone Section */}
                  <div className="bg-white p-2.5 border border-black text-[11px] space-y-1">
                    <span className="font-mono font-bold text-red-700 uppercase block">WHY RED ZONE?</span>
                    <ul className="text-gray-700 space-y-0.5 list-disc list-inside">
                      <li>High exposure to active {rz.hazard_type.toLowerCase()} hazards</li>
                      <li>Historical debris flow & inundation frequency</li>
                      <li>Current risk status: <strong className="text-black">{rz.risk_level}</strong></li>
                    </ul>
                  </div>

                  {/* Intensity Trigger Controls */}
                  <div className="pt-2 border-t border-black flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-gray-700">Rainfall/Slope Surge:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        defaultValue={rz.hazard_intensity}
                        onBlur={(e) => handleUpdateIntensity(rz.id, e.target.value)}
                        className="w-16 bg-white border border-black px-1.5 py-0.5 font-mono text-xs font-bold text-center"
                      />
                      <button
                        onClick={() => handleUpdateIntensity(rz.id, rz.hazard_intensity + 5)}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-bold uppercase border border-black"
                      >
                        +5 RISK
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Vulnerable Habitations & Relocation Engine */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-5 space-y-4">
            
            {/* Header + Filter Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-black pb-3">
              <div>
                <h2 className="font-mono font-black text-base uppercase text-tactile-border flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 border border-black"></span>
                  VULNERABLE HABITATION RELOCATION PRIORITIZATION
                </h2>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  Click any habitation to inspect explainable AI risk factors, safe relocation options, and routes.
                </p>
              </div>

              <div className="flex font-mono text-xs font-bold border-2 border-black bg-[#EAEFE8]">
                {['ALL', 'IMMEDIATE', 'SHORT_TERM', 'MEDIUM_TERM'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTier(t)}
                    className={`px-3 py-1 uppercase transition-colors ${
                      activeTier === t ? 'bg-black text-white' : 'text-black hover:bg-gray-200'
                    }`}
                  >
                    {t === 'ALL' ? 'ALL TIERS' : t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Habitations List */}
            <div className="space-y-4">
              {filteredHabitations.map((hab) => (
                <div
                  key={hab.id}
                  onClick={() => setSelectedHabitation(hab)}
                  className="bg-[#EAEFE8] hover:bg-[#e2e8e0] border-2 border-black p-4 space-y-3 shadow-[3px_3px_0px_#000] cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-black text-base text-black uppercase">{hab.name}</h3>
                        <span className="font-mono text-xs text-gray-600">({hab.district})</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-700 mt-1">
                        <span>👥 Pop: <strong className="text-black">{hab.population}</strong></span>
                        <span>👶 Vulnerable: <strong className="text-black">{hab.vulnerable_children_count + hab.vulnerable_elderly_count}</strong></span>
                        <span>🏠 Structure: <strong className="text-amber-800">{hab.housing_type}</strong></span>
                        <span>Disasters: <strong className="text-black">{hab.disaster_history_count} hits</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-gray-500 font-bold uppercase block">Relocation Score</span>
                        <span className="font-mono text-xl font-black text-red-600">{hab.relocation_priority_score}/100</span>
                      </div>
                      {getTierBadge(hab.relocation_tier)}
                    </div>
                  </div>

                  {/* Explainable AI Why Prioritized Snippet */}
                  <div className="bg-white p-3 border border-black text-xs space-y-1">
                    <span className="font-mono font-bold text-red-700 uppercase flex items-center justify-between">
                      <span>WHY THIS HABITATION IS PRIORITIZED?</span>
                      <span className="text-gray-500 text-[10px]">CLICK FOR FULL PROFILE & ROUTE →</span>
                    </span>
                    <p className="text-gray-700 font-medium">
                      High score ({hab.relocation_priority_score}) driven by {hab.housing_type} structure vulnerability, {hab.vulnerable_children_count + hab.vulnerable_elderly_count} high-risk individuals, and {hab.disaster_history_count} previous disaster hits.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Relocation Sites & Carrying Capacity Dashboard */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="font-mono font-black text-lg uppercase text-tactile-border flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-600 border border-black"></span>
              SAFE RELOCATION CANDIDATE SITES & CARRYING CAPACITY EVALUATION
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Evaluates tableland plateaus, slope (&lt; 10 deg), elevation, soil stability, road connectivity, and infrastructure load limits.
            </p>
          </div>

          <button
            onClick={handleAllocate}
            className="px-4 py-2 bg-[#6DBE5A] hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            RE-EVALUATE CARRYING CAPACITIES
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sites.map((site) => {
            const occPercentage = Math.round((site.current_occupied / (site.max_capacity_people || 1)) * 100);
            const remaining = Math.max(0, site.max_capacity_people - site.current_occupied);

            return (
              <div key={site.id} className="bg-[#EAEFE8] border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_#000]">
                <div className="flex justify-between items-start border-b border-black pb-2">
                  <div>
                    <h3 className="font-mono font-bold text-base text-black uppercase">{site.name}</h3>
                    <span className="font-mono text-xs text-gray-600">{site.district}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#6DBE5A] text-black font-mono text-xs font-black uppercase border border-black">
                    SUITABILITY: {site.suitability_score}%
                  </span>
                </div>

                {/* Carrying Capacity Gauge */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-bold uppercase">Carrying Capacity:</span>
                    <span className="font-black text-black">{site.current_occupied} / {site.max_capacity_people} ({occPercentage}%)</span>
                  </div>
                  <div className="w-full bg-white h-3 border border-black p-0.5">
                    <div
                      className={`h-full transition-all ${
                        occPercentage > 85 ? 'bg-red-600' : occPercentage > 60 ? 'bg-amber-500' : 'bg-[#6DBE5A]'
                      }`}
                      style={{ width: `${Math.min(100, occPercentage)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-800 font-bold">
                    Available Capacity: +{remaining.toLocaleString()} people
                  </div>
                </div>

                {/* Infrastructure Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-black">
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Elevation</span>
                    <span className="font-bold text-black">{site.elevation_m} meters</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Terrain Slope</span>
                    <span className="font-bold text-emerald-700">{site.slope_degree}° (Gentle)</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Soil Stability</span>
                    <span className="font-bold text-black">{site.soil_stability_index}/100</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Infrastructure</span>
                    <span className="font-bold text-blue-700">{site.infrastructure_score}/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED HABITATION PROFILE MODAL */}
      <AnimatePresence>
        {selectedHabitation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6"
            >
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-black text-[#6DBE5A] font-mono text-xs font-bold uppercase tracking-wider">
                    HABITATION PROFILE // {selectedHabitation.relocation_tier} TIER
                  </span>
                  <h2 className="text-2xl font-mono font-black uppercase text-black mt-1">
                    {selectedHabitation.name}
                  </h2>
                  <div className="text-xs text-gray-600 font-mono">Location: {selectedHabitation.district} | Coordinates: {selectedHabitation.latitude}, {selectedHabitation.longitude}</div>
                </div>
                <button
                  onClick={() => setSelectedHabitation(null)}
                  className="p-1.5 bg-black text-white hover:bg-red-600 transition-colors border border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Explainable AI Why Prioritized Section */}
              <div className="bg-red-50 border-2 border-black p-4 space-y-2">
                <h4 className="font-mono font-black text-sm text-red-900 uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  WHY THIS HABITATION IS PRIORITIZED (SCORE: {selectedHabitation.relocation_priority_score}/100)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2">
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Hazard Exposure</span>
                    <span className="font-black text-red-600 text-sm">35% Weight</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Vulnerability</span>
                    <span className="font-black text-red-600 text-sm">25% Weight</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Disaster Hits</span>
                    <span className="font-black text-red-600 text-sm">{selectedHabitation.disaster_history_count} Occurrences</span>
                  </div>
                  <div className="bg-white p-2 border border-black">
                    <span className="text-gray-500 block text-[10px]">Housing Risk</span>
                    <span className="font-black text-amber-700 text-sm">{selectedHabitation.housing_type}</span>
                  </div>
                </div>
              </div>

              {/* Relocation Options & Destination Match */}
              <div className="space-y-3">
                <h4 className="font-mono font-black text-sm text-black uppercase">SAFE RELOCATION OPTIONS & ROUTE EVALUATION</h4>
                <div className="space-y-3">
                  {sites.map((s) => (
                    <div key={s.id} className="bg-[#EAEFE8] border-2 border-black p-4 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <div className="font-mono font-bold text-sm text-black">{s.name}</div>
                        <div className="text-xs font-mono text-gray-600">Suitability: {s.suitability_score}% | Remaining Capacity: {s.max_capacity_people - s.current_occupied} citizens</div>
                      </div>
                      <button
                        onClick={() => {
                          alert(`Relocation Plan generated from ${selectedHabitation.name} to ${s.name}! Safe route calculated bypassing high-risk flood zones.`);
                          setSelectedHabitation(null);
                        }}
                        className="px-3 py-1.5 bg-[#6DBE5A] hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase border border-black shadow-[2px_2px_0px_#000]"
                      >
                        CREATE RELOCATION PLAN →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SDMA AI POLICY BRIEF SECTION */}
      {sdmaReport && (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#1E2C1D] p-6 space-y-6">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <span className="px-3 py-1 bg-black text-[#6DBE5A] font-mono text-xs font-black uppercase">
                OFFICIAL SDMA POLICY BRIEFING
              </span>
              <h2 className="text-2xl font-mono font-black uppercase text-black mt-2">{sdmaReport.title}</h2>
              <div className="text-xs text-gray-600 font-mono">Region: {sdmaReport.district} | Authority: {sdmaReport.state}</div>
            </div>
            <button
              onClick={() => setSdmaReport(null)}
              className="px-3 py-1 bg-black text-white font-mono text-xs font-bold uppercase border border-black"
            >
              CLOSE BRIEF
            </button>
          </div>

          <div className="bg-[#EAEFE8] p-4 border-2 border-black space-y-2">
            <h4 className="font-mono font-bold text-xs text-black uppercase">Executive Summary</h4>
            <p className="font-sans text-sm text-gray-800 leading-relaxed font-medium">{sdmaReport.executive_summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-4 border-2 border-black space-y-3">
              <h4 className="font-mono font-bold text-xs text-red-900 uppercase">Immediate Directives (0-3 Months)</h4>
              <ul className="space-y-1.5 text-xs font-sans text-gray-800 list-disc list-inside">
                {sdmaReport.immediate_directives?.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50 p-4 border-2 border-black space-y-3">
              <h4 className="font-mono font-bold text-xs text-emerald-900 uppercase">Carrying Capacity Strategy</h4>
              <p className="text-xs text-gray-800 font-sans">{sdmaReport.carrying_capacity_strategy}</p>
              <div className="pt-2 border-t border-black font-mono text-xs font-bold text-emerald-800">
                Estimated Rehabilitation Budget: ₹{sdmaReport.rehabilitation_budget_est_crores} Crores
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
