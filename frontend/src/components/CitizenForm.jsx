import React, { useState } from 'react';
import { MapPin, Send, AlertTriangle, CheckCircle, Sparkles, Navigation, Shield, UserCheck, Map, BarChart2, Layers, Cpu, Clock, Check } from 'lucide-react';
import { incidentService } from '../services/api';

const LOCATION_PRESETS = [
  { name: 'Sector 6, Rourkela (Housing Board)', lat: 22.2612, lon: 84.8542 },
  { name: 'Koel Nagar Main Road Junction', lat: 22.2540, lon: 84.8590 },
  { name: 'Brahmani River Highway Bridge', lat: 22.2450, lon: 84.8380 },
  { name: 'Sector 8 Market Complex', lat: 22.2710, lon: 84.8630 },
  { name: 'Chhend Colony Extension', lat: 22.2380, lon: 84.8250 },
];

const INCIDENT_TYPES = [
  'Flood',
  'Cyclone',
  'Landslide',
  'Medical Emergency',
  'Road Blockage',
  'Building Damage',
  'Fire',
  'Water Shortage',
  'Other'
];

export default function CitizenForm({ onIncidentSubmitted, onNavigate }) {
  const [formMode, setFormMode] = useState('structured'); // 'structured' or 'raw'
  const [locationName, setLocationName] = useState('Sector 6, Rourkela');
  const [latitude, setLatitude] = useState(22.2604);
  const [longitude, setLongitude] = useState(84.8536);
  const [incidentType, setIncidentType] = useState('Flood');
  const [eventCause, setEventCause] = useState('Water Influx & Trapped Citizens');
  const [corridorType, setCorridorType] = useState('Critical Disaster Corridor');
  const [responseType, setResponseType] = useState('Rescue Team & Ambulance');
  const [selectedModel, setSelectedModel] = useState('gemini-flash');
  const [description, setDescription] = useState('8 people are trapped inside their houses due to high flood water. Two elderly citizens need immediate assistance.');
  
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('Acquiring GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationName(`GPS Position (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          setGpsStatus('GPS coordinates captured!');
          setTimeout(() => setGpsStatus(''), 3000);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsStatus('GPS permission denied. Using manual fallback location.');
          setTimeout(() => setGpsStatus(''), 4000);
        }
      );
    } else {
      setGpsStatus('Geolocation not supported by browser.');
    }
  };

  const handlePresetSelect = (preset) => {
    setLocationName(preset.name);
    setLatitude(preset.lat);
    setLongitude(preset.lon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please enter an incident description.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        location_name: locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        incident_type: incidentType,
        description: description
      };

      const result = await incidentService.submitReport(payload);
      setSubmissionResult(result);
      if (onIncidentSubmitted) {
        onIncidentSubmitted(result);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg('Failed to submit report. Please check if FastAPI backend is running at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-tactile-bg tactile-grid-bg min-h-screen pb-12 selection:bg-tactile-accent selection:text-black">
      
      {/* Sub-header Navigation Bar matching Screenshots 1 & 2 */}
      <div className="bg-white border-b-2 border-black px-4 py-2 flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
        <button 
          onClick={() => onNavigate && onNavigate('map')}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-gray-100 border-2 border-black shadow-tactile-sm transition"
        >
          <Map className="w-4 h-4" /> CITY MAP
        </button>

        <button 
          className="flex items-center gap-1.5 px-4 py-1.5 bg-tactile-accent text-black border-2 border-black shadow-tactile-sm transition font-black"
        >
          + SUBMIT INCIDENT
        </button>

        <button 
          onClick={() => onNavigate && onNavigate('queue')}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-gray-100 border-2 border-black shadow-tactile-sm transition"
        >
          <BarChart2 className="w-4 h-4" /> ANALYTICS & QUEUE
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Box matching Screenshots 1 & 2 */}
        <div className="lg:col-span-7 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-6">
          
          {/* Header Title */}
          <div className="border-b-2 border-black pb-3">
            <h2 className="font-mono font-black text-xl text-tactile-border uppercase flex items-center gap-2">
              <MapPin className="w-5 h-5 text-tactile-olive" />
              SUBMIT NEW INCIDENT
            </h2>
          </div>

          {/* Mode Toggle Buttons matching Screenshot 1 */}
          <div className="grid grid-cols-2 border-2 border-black font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => setFormMode('structured')}
              className={`py-2.5 flex items-center justify-center gap-2 transition ${
                formMode === 'structured'
                  ? 'bg-tactile-accent text-black font-black border-r-2 border-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-r-2 border-black'
              }`}
            >
              := STRUCTURED
            </button>
            <button
              type="button"
              onClick={() => setFormMode('raw')}
              className={`py-2.5 flex items-center justify-center gap-2 transition ${
                formMode === 'raw'
                  ? 'bg-tactile-accent text-black font-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              A RAW TEXT
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 font-mono">
            
            {/* Row 1: Event Type & Corridor Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                  EVENT TYPE *
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                >
                  {INCIDENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                  CORRIDOR TYPE *
                </label>
                <select
                  value={corridorType}
                  onChange={(e) => setCorridorType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                >
                  <option value="Critical Disaster Corridor">Critical Disaster Corridor</option>
                  <option value="Sector 6 Basin Zone">Sector 6 Basin Zone</option>
                  <option value="Non-corridor">Non-corridor</option>
                </select>
              </div>
            </div>

            {/* Row 2: Event Cause */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                EVENT CAUSE *
              </label>
              <select
                value={eventCause}
                onChange={(e) => setEventCause(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
              >
                <option value="Water Influx & Trapped Citizens">Water Influx & Trapped Citizens</option>
                <option value="Medical Emergency / Evacuation">Medical Emergency / Evacuation</option>
                <option value="Tree / Road Debris Blockage">Tree / Road Debris Blockage</option>
                <option value="Building Boundary Collapse">Building Boundary Collapse</option>
                <option value="Infrastructure Damage">Infrastructure Damage</option>
              </select>
            </div>

            {/* Row 3: Zone/Area & Response Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                  ZONE / AREA *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g., Sector 6, Rourkela"
                    className="flex-1 px-3 py-2 border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="px-2.5 py-2 bg-tactile-oliveDark text-white font-mono text-[11px] font-bold border-2 border-black shadow-tactile-sm flex items-center gap-1"
                    title="Get GPS location"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    GPS
                  </button>
                </div>

                {gpsStatus && (
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">{gpsStatus}</p>
                )}

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {LOCATION_PRESETS.slice(0, 3).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className={`px-2 py-0.5 text-[10px] border border-black rounded ${
                        locationName === p.name ? 'bg-tactile-accent font-bold' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {p.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                  RESPONSE TYPE *
                </label>
                <select
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                >
                  <option value="Rescue Team & Ambulance">Rescue Team & Ambulance</option>
                  <option value="Flood Rescue Boat Operations">Flood Rescue Boat Operations</option>
                  <option value="Medical Squad Evacuation">Medical Squad Evacuation</option>
                  <option value="Heavy Debris Clearance">Heavy Debris Clearance</option>
                </select>
              </div>
            </div>

            {/* Row 4: AI Model Selector matching Screenshot 2 */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1.5 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-tactile-olive" />
                AI MODEL * <span className="text-gray-500 font-normal">(Agent 1 NLP + Agent 4 Plan)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-flash')}
                  className={`p-2.5 text-left border-2 border-black transition ${
                    selectedModel === 'gemini-flash'
                      ? 'bg-emerald-50 border-tactile-accent ring-2 ring-tactile-accent font-bold'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>GEMINI 2.5 FLASH</span>
                    <span className="px-1.5 py-0.5 bg-gray-200 border border-black text-[9px]">Fast</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Google DeepMind</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-pro')}
                  className={`p-2.5 text-left border-2 border-black transition ${
                    selectedModel === 'gemini-pro'
                      ? 'bg-emerald-50 border-tactile-accent ring-2 ring-tactile-accent font-bold'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>GEMINI 1.5 PRO</span>
                    <span className="px-1.5 py-0.5 bg-gray-200 border border-black text-[9px]">Smart</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Google DeepMind</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModel('fallback-nlp')}
                  className={`p-2.5 text-left border-2 border-black transition ${
                    selectedModel === 'fallback-nlp'
                      ? 'bg-emerald-50 border-tactile-accent ring-2 ring-tactile-accent font-bold'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>HEURISTIC NLP</span>
                    <span className="px-1.5 py-0.5 bg-gray-200 border border-black text-[9px]">Light</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Local Rule Engine</div>
                </button>
              </div>
            </div>

            {/* Row 5: Text Description Area */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                DESCRIBE THE INCIDENT (ANY LANGUAGE) *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black font-sans text-xs focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                placeholder="e.g. 8 people are trapped inside their houses due to high flood water. Two elderly citizens need immediate assistance."
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Our AI will automatically extract cause, severity, headcount, and vulnerability type.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 border-2 border-red-600 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Large Green Action Submit Button matching Screenshot 2 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-tactile-accent hover:bg-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_#1E2C1D] flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  ANALYZING & COMPUTING PRIORITY SCORE...
                </>
              ) : (
                <>
                  ANALYZE & GENERATE PLAN →
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-gray-500">
              * Zone / Area and AI Model are required for submission
            </p>

          </form>
        </div>

        {/* Right Output Panel matching Image 5 from reference screenshots */}
        <div className="lg:col-span-5 space-y-4">
          {submissionResult ? (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-5 animate-fade-in font-mono">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-mono text-xs font-black uppercase text-tactile-border flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-tactile-olive" /> INCIDENT OUTPUT
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-600 text-emerald-800 text-[10px] font-bold">
                  ✓ PROCESSED
                </span>
              </div>

              {/* Card 1: Parsed from Description */}
              <div className="bg-tactile-card border-2 border-black p-4 space-y-2">
                <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  ① PARSED FROM DESCRIPTION
                </div>
                <p className="text-xs font-sans text-gray-700 italic">
                  "{submissionResult.description}"
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-white border border-black text-[10px]">
                    Severity: <strong>{submissionResult.ai_severity}</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-black text-[10px]">
                    Action Required: <strong>YES</strong>
                  </span>
                </div>
              </div>

              {/* Card 2: Prediction Result */}
              <div className="bg-amber-50 border-2 border-black p-4 space-y-3">
                <div className="text-xs font-bold text-black">
                  PREDICTION RESULT
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 text-xs font-black border-2 border-black shadow-tactile-sm ${
                    submissionResult.priority_category === 'HIGH' ? 'bg-red-600 text-white' :
                    submissionResult.priority_category === 'MEDIUM' ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
                  }`}>
                    {submissionResult.priority_category} PRIORITY
                  </span>
                  <span className="text-xs font-bold text-gray-600">
                    Confidence: 100%
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-black text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Estimated Resolution Time
                  </div>
                  <div className="text-sm font-black text-black">
                    45 minutes (Dispatch In Progress)
                  </div>
                </div>
              </div>

              {/* Card 3: Field Action Plan */}
              <div className="bg-[#1E2C1D] text-white border-2 border-black p-4 space-y-2">
                <div className="text-xs font-bold text-tactile-accent flex items-center justify-between border-b border-white/20 pb-1">
                  <span>ACTION PLAN</span>
                  <span className="text-[10px] text-gray-300">GEMINI-2.5-INSTANT</span>
                </div>

                <p className="text-xs font-sans leading-relaxed text-gray-200 pt-1">
                  Officers: 4 rescue personnel from Sector 6 Command Station deployed to incident location with flood rescue boats and medical kits.
                </p>
                <div className="text-[10px] text-gray-400">
                  Diversion: Traffic rerouted around Brahmani Bypass bridge.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 text-center font-mono space-y-3">
              <Shield className="w-10 h-10 text-tactile-olive mx-auto" />
              <h3 className="font-bold text-sm uppercase">READY FOR INCIDENT ANALYSIS</h3>
              <p className="font-sans text-xs text-gray-600">
                Fill in the incident details on the left and click <strong>"ANALYZE & GENERATE PLAN →"</strong> to execute Gemini AI NLP extraction and calculate priority scores.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
