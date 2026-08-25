import React, { useState } from 'react';
import { MapPin, Navigation, Shield, AlertTriangle, CheckCircle2, Clock, Cpu, Users, UserCheck, Layers, FileText } from 'lucide-react';
import { incidentService } from '../services/api';

const ROURKELA_PRESETS = [
  { name: 'Sector 6, Rourkela (Housing Board)', lat: 22.2612, lon: 84.8542 },
  { name: 'Koel Nagar Main Road Junction', lat: 22.2540, lon: 84.8590 },
  { name: 'Brahmani River Highway Bridge', lat: 22.2450, lon: 84.8380 },
  { name: 'Sector 8 Market Complex', lat: 22.2710, lon: 84.8630 },
  { name: 'Chhend Colony Extension', lat: 22.2380, lon: 84.8250 },
];

const INCIDENT_TYPES = [
  { id: 'FLOOD_WATER_RESCUE', label: 'Flood / Water Rescue' },
  { id: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
  { id: 'FIRE_HAZARD', label: 'Fire Hazard' },
  { id: 'BUILDING_COLLAPSE', label: 'Building Collapse' },
  { id: 'CYCLONE_WIND_DAMAGE', label: 'Cyclone / Wind Damage' },
  { id: 'LANDSLIDE_ROAD_BLOCK', label: 'Landslide / Road Block' },
  { id: 'MISSING_TRAPPED_PERSON', label: 'Missing / Trapped Person' },
  { id: 'OTHER', label: 'Other Disaster Incident' },
];

const QUICK_EXAMPLES = [
  "Water has entered several houses and 8 people are trapped. Two of them are elderly.",
  "An elderly stroke patient needs urgent medical evacuation as water is rising near the house.",
  "A massive uprooted tree and flood mud have completely blocked the highway preventing supply trucks.",
  "A boundary wall collapsed due to torrential rains and 3 shopkeepers are injured."
];

export default function CitizenForm({ onIncidentSubmitted, onNavigate }) {
  const [locationName, setLocationName] = useState('Sector 6, Rourkela');
  const [district, setDistrict] = useState('Rourkela');
  const [latitude, setLatitude] = useState(22.2612);
  const [longitude, setLongitude] = useState(84.8542);
  const [incidentType, setIncidentType] = useState('FLOOD_WATER_RESCUE');
  const [description, setDescription] = useState('Water has entered several houses and 8 people are trapped. Two of them are elderly.');
  const [peopleAffected, setPeopleAffected] = useState(8);
  const [reporterName, setReporterName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGetGPSLocation = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('Acquiring browser GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
          setLocationName(`GPS Position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setGpsStatus('GPS coordinates captured!');
          setTimeout(() => setGpsStatus(''), 3000);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsStatus('GPS permission denied. Using preset Rourkela coordinates.');
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
    if (description.length < 10) {
      setErrorMsg('Description must be at least 10 characters long.');
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMsg('Invalid latitude/longitude coordinates.');
      return;
    }
    if (!privacyConsent) {
      setErrorMsg('Please accept the privacy consent to submit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        location_name: locationName,
        district: district || 'Rourkela',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        incident_type: incidentType,
        description: description,
        people_affected: peopleAffected ? parseInt(peopleAffected, 10) : None,
        reporter_name: reporterName || null,
        contact_phone: contactPhone || null
      };

      const result = await incidentService.submitReport(payload);
      setSubmissionResult(result);
      if (onIncidentSubmitted) {
        onIncidentSubmitted(result);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit report. Ensure FastAPI backend is running at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Column: Citizen Incident Form */}
      <div className="lg:col-span-7 bg-white border-3 border-black shadow-[6px_6px_0px_#101010] p-6 space-y-6">
        
        <div className="border-b-3 border-black pb-3 flex items-center justify-between">
          <h2 className="font-mono font-black text-xl text-black uppercase flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            SUBMIT EMERGENCY INCIDENT REPORT
          </h2>
          <span className="px-2.5 py-1 bg-emerald-100 border-2 border-black font-mono text-[11px] font-bold text-emerald-900">
            DEMO ZONE: ROURKELA
          </span>
        </div>

        {/* Example Quick Presets Chips */}
        <div className="space-y-1.5 font-mono text-xs">
          <span className="font-bold text-gray-700 uppercase">⚡ Click to load sample incident descriptions:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(ex)}
                className="px-2 py-1 bg-gray-100 hover:bg-tactile-accent hover:text-black border-2 border-black text-[11px] font-medium text-left truncate max-w-full transition"
              >
                "{ex.slice(0, 55)}..."
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
          
          {/* Location Controls */}
          <div className="p-4 bg-amber-50 border-2 border-black space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold uppercase text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" /> INCIDENT LOCATION (ROURKELA) *
              </label>
              <button
                type="button"
                onClick={handleGetGPSLocation}
                className="px-3 py-1 bg-black text-white hover:bg-emerald-600 font-bold border-2 border-black shadow-tactile-sm flex items-center gap-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                ALLOW BROWSER GPS
              </button>
            </div>

            {gpsStatus && <p className="text-[11px] text-emerald-800 font-bold">{gpsStatus}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">LOCATION NAME</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">LATITUDE</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">LONGITUDE</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  required
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-[10px] font-bold text-gray-600 py-0.5">Presets:</span>
              {ROURKELA_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`px-2 py-0.5 text-[10px] border border-black font-bold ${
                    locationName === p.name ? 'bg-tactile-accent text-black' : 'bg-white hover:bg-gray-200'
                  }`}
                >
                  {p.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Type & Affected People */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold uppercase text-gray-900 mb-1">
                INCIDENT TYPE *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-black bg-white font-bold text-xs"
              >
                {INCIDENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-extrabold uppercase text-gray-900 mb-1">
                PEOPLE AFFECTED / TRAPPED
              </label>
              <input
                type="number"
                min="0"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-black bg-white font-bold text-xs"
                placeholder="e.g. 8"
              />
            </div>
          </div>

          {/* Natural Language Report Description */}
          <div>
            <label className="block font-extrabold uppercase text-gray-900 mb-1">
              NATURAL LANGUAGE INCIDENT DESCRIPTION *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-black bg-white font-sans text-xs focus:ring-2 focus:ring-black"
              placeholder="Describe what is happening in detail. Mention if children, elderly, sick, or pregnant individuals are present..."
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              AI NLP will extract severity, headcount, vulnerability status, and rescue requirements.
            </p>
          </div>

          {/* Optional Reporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 border-2 border-black">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">REPORTER NAME (OPTIONAL)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-black bg-white"
                placeholder="e.g. Sidhi B"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">PHONE NUMBER (OPTIONAL)</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-black bg-white"
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="w-4 h-4 border-2 border-black accent-black"
            />
            <label htmlFor="privacy" className="text-[11px] text-gray-700 font-bold">
              I consent to sharing this location with emergency disaster response authorities for rescue coordination.
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-sm uppercase border-3 border-black shadow-[4px_4px_0px_#101010] flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></span>
                RUNNING AI NLP & DETERMINISTIC PRIORITY ENGINE...
              </>
            ) : (
              <>
                ANALYZE & REGISTER INCIDENT REPORT →
              </>
            )}
          </button>

        </form>
      </div>

      {/* Right Column: Structured AI Result Inspection Card */}
      <div className="lg:col-span-5 space-y-4">
        {submissionResult ? (
          <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#101010] p-6 space-y-5 font-mono animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div>
                <span className="text-[11px] font-extrabold text-gray-500">REF: {submissionResult.public_ref || `INC-${submissionResult.id}`}</span>
                <h3 className="font-black text-lg text-black">INCIDENT REGISTERED</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 border-2 border-black text-emerald-900 font-black text-xs">
                ✓ PROCESSED
              </span>
            </div>

            {/* Score & Priority Category Card */}
            <div className={`p-4 border-3 border-black shadow-[4px_4px_0px_#101010] flex items-center justify-between ${
              submissionResult.priority_category === 'HIGH' ? 'bg-red-500 text-white' :
              submissionResult.priority_category === 'MEDIUM' ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-white'
            }`}>
              <div>
                <div className="text-xs font-black uppercase">PRIORITY CLASSIFICATION</div>
                <div className="text-3xl font-black">{submissionResult.priority_score} / 100</div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1.5 bg-black text-white font-black text-sm border-2 border-white uppercase">
                  {submissionResult.priority_category} PRIORITY
                </span>
              </div>
            </div>

            {/* Extracted AI JSON Card */}
            <div className="bg-amber-50 border-2 border-black p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold border-b border-black/20 pb-1">
                <span className="flex items-center gap-1"><Cpu className="w-4 h-4 text-black" /> AI EXTRACTION METADATA</span>
                <span className="px-2 py-0.5 bg-white border border-black text-[10px]">
                  SOURCE: <strong>{submissionResult.nlp_source?.toUpperCase()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>• Type: <strong>{submissionResult.incident_type}</strong></div>
                <div>• Severity: <strong>{submissionResult.ai_severity}</strong></div>
                <div>• Affected: <strong>{submissionResult.people_affected} people</strong></div>
                <div>• Vulnerable: <strong>{submissionResult.vulnerable_people ? 'YES (PRIORITY)' : 'NO'}</strong></div>
              </div>
            </div>

            {/* 5-Component Priority Breakdown Table */}
            {submissionResult.score_breakdown && submissionResult.score_breakdown.components && (
              <div className="border-2 border-black p-3 bg-white space-y-2 text-xs">
                <div className="font-extrabold uppercase border-b border-black pb-1">
                  5-FACTOR TRANSPARENT BREAKDOWN
                </div>
                
                <div className="space-y-1 text-[11px]">
                  {Object.entries(submissionResult.score_breakdown.components).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-gray-100">
                      <span className="font-bold">{k.replace("_", " ").toUpperCase()}:</span>
                      <span className="font-black bg-gray-100 px-2 py-0.5 border border-black">
                        {v.awarded_points.toFixed(1)} / {v.max_points.toFixed(1)} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifecycle Status Timeline */}
            <div className="p-3.5 bg-black text-white border-2 border-black space-y-2 text-xs">
              <div className="font-bold text-tactile-accent uppercase border-b border-white/20 pb-1 flex items-center justify-between">
                <span>STATUS TIMELINE</span>
                <span>{submissionResult.status}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className={submissionResult.status === 'REPORTED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>REPORTED</span>
                <span>→</span>
                <span className={submissionResult.status === 'VERIFIED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>VERIFIED</span>
                <span>→</span>
                <span className={submissionResult.status === 'ASSIGNED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>ASSIGNED</span>
                <span>→</span>
                <span className={submissionResult.status === 'IN_PROGRESS' ? 'text-tactile-accent font-black' : 'text-gray-400'}>IN_PROGRESS</span>
                <span>→</span>
                <span className={submissionResult.status === 'RESOLVED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>RESOLVED</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#101010] p-6 text-center font-mono space-y-3">
            <Shield className="w-12 h-12 text-black mx-auto" />
            <h3 className="font-black text-base uppercase">READY FOR INCIDENT REPORTING</h3>
            <p className="font-sans text-xs text-gray-700 leading-relaxed">
              Fill out the emergency report form on the left and click <strong>"ANALYZE & REGISTER INCIDENT REPORT →"</strong> to trigger Gemini AI extraction, Haversine proximity evaluation, and deterministic 0-100 priority scoring.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
