import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Shield, AlertTriangle, CheckCircle2, Clock, Cpu, Users, UserCheck, Layers, FileText, Check, ArrowRight } from 'lucide-react';
import { incidentService } from '../services/api';
import AnimatedNumber from './motion/AnimatedNumber';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { toastVariants, itemFadeUp, scaleReveal } from '../motion/variants';

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

const SUBMISSION_STAGES = [
  "Extracting incident details via Gemini NLP...",
  "Evaluating proximity to hospitals & shelters...",
  "Calculating deterministic 0-100 priority score...",
  "Registering report into emergency queue..."
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [gpsAcquiring, setGpsAcquiring] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);

  // Rotate submission stages while loading
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setStageIndex((prev) => (prev + 1) % SUBMISSION_STAGES.length);
      }, 700);
    } else {
      setStageIndex(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleGetGPSLocation = () => {
    if ('geolocation' in navigator) {
      setGpsAcquiring(true);
      setGpsStatus('Acquiring browser GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
          setLocationName(`GPS Position (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setGpsStatus('GPS coordinates captured!');
          setGpsAcquiring(false);
          setTimeout(() => setGpsStatus(''), 3500);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsStatus('GPS permission denied. Using preset Rourkela coordinates.');
          setGpsAcquiring(false);
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

  const handleExampleSelect = (ex, idx) => {
    setSelectedExample(idx);
    setDescription(ex);
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
        people_affected: peopleAffected ? parseInt(peopleAffected, 10) : null,
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="lg:col-span-7 bg-white border-[3px] border-black shadow-[6px_6px_0px_#101010] p-6 space-y-6"
      >
        <div className="border-b-[3px] border-black pb-3 flex items-center justify-between">
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
              <motion.button
                key={idx}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={() => handleExampleSelect(ex, idx)}
                className={`px-2.5 py-1.5 border-2 border-black text-[11px] font-medium text-left truncate max-w-full transition-colors ${
                  description === ex
                    ? 'bg-tactile-accent text-black font-bold shadow-tactile-sm'
                    : 'bg-gray-100 hover:bg-tactile-accent/40 text-black'
                }`}
              >
                "{ex.slice(0, 50)}..."
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
          
          {/* Location Controls */}
          <div className="p-4 bg-amber-50 border-2 border-black space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-extrabold uppercase text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" /> INCIDENT LOCATION (ROURKELA) *
              </label>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                onClick={handleGetGPSLocation}
                disabled={gpsAcquiring}
                className="px-3 py-1 bg-black text-white hover:bg-emerald-700 font-bold border-2 border-black shadow-tactile-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  {gpsAcquiring && (
                    <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-tactile-accent opacity-75"></span>
                  )}
                  <Navigation className="w-3.5 h-3.5" />
                </span>
                {gpsAcquiring ? 'ACQUIRING...' : 'ALLOW BROWSER GPS'}
              </motion.button>
            </div>

            <AnimatePresence>
              {gpsStatus && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] text-emerald-800 font-bold"
                >
                  {gpsStatus}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-gray-700 mb-1">LOCATION NAME</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold focus:outline-none focus:ring-2 focus:ring-black transition"
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
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold focus:outline-none focus:ring-2 focus:ring-black transition"
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
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold focus:outline-none focus:ring-2 focus:ring-black transition"
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
                  className={`px-2 py-0.5 text-[10px] border border-black font-bold transition ${
                    locationName === p.name ? 'bg-tactile-accent text-black shadow-tactile-sm' : 'bg-white hover:bg-gray-200'
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
                className="w-full px-3 py-2.5 border-2 border-black bg-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full px-3 py-2.5 border-2 border-black bg-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
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
              className="w-full px-3 py-2.5 border-2 border-black bg-white font-sans text-xs focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Describe what is happening in detail. Mention if children, elderly, sick, or pregnant individuals are present..."
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              AI NLP will extract severity, headcount, vulnerability status, and rescue requirements.
            </p>
          </div>

          {/* Optional Reporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-gray-50 border-2 border-black">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">REPORTER NAME (OPTIONAL)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. Siddhi B"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">PHONE NUMBER (OPTIONAL)</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. +91 94031 54066"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">INCIDENT PHOTO URL (OPTIONAL)</label>
              <input
                type="url"
                value={photoUrl || ''}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-1.5 border-2 border-black bg-white text-xs focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://... photo link"
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
              className="w-4 h-4 border-2 border-black accent-black cursor-pointer"
            />
            <label htmlFor="privacy" className="text-[11px] text-gray-700 font-bold cursor-pointer">
              I consent to sharing this location with emergency disaster response authorities for rescue coordination.
            </label>
          </div>

          {/* Single Shake Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3 bg-red-100 border-2 border-red-600 text-red-900 flex items-center gap-2 animate-nudge"
                role="alert"
                aria-live="assertive"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action Button with Multi-stage real indicator */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { y: -1 } : {}}
            whileTap={!loading ? { y: 1 } : {}}
            className="w-full py-4 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-sm uppercase border-[3px] border-black shadow-[4px_4px_0px_#101010] flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2 font-mono">
                <span className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin"></span>
                <span>{SUBMISSION_STAGES[stageIndex]}</span>
              </div>
            ) : (
              <>
                ANALYZE & REGISTER INCIDENT REPORT →
              </>
            )}
          </motion.button>

        </form>
      </motion.div>

      {/* Right Column: Structured AI Result Inspection Card */}
      <div className="lg:col-span-5 space-y-4">
        <AnimatePresence mode="wait">
          {submissionResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.25 }}
              className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#101010] p-6 space-y-5 font-mono"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
                <div>
                  <span className="text-[11px] font-extrabold text-gray-500">REF: {submissionResult.public_ref || `INC-${submissionResult.id}`}</span>
                  <h3 className="font-black text-lg text-black">INCIDENT REGISTERED</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 border-2 border-black text-emerald-900 font-black text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> PROCESSED
                </span>
              </div>

              {/* Score & Priority Category Card */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`p-4 border-[3px] border-black shadow-[4px_4px_0px_#101010] flex items-center justify-between ${
                  submissionResult.priority_category === 'HIGH' ? 'bg-red-500 text-white' :
                  submissionResult.priority_category === 'MEDIUM' ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-black uppercase">PRIORITY CLASSIFICATION</div>
                  <div className="text-3xl font-black flex items-baseline gap-1">
                    <AnimatedNumber value={submissionResult.priority_score} decimals={1} />
                    <span className="text-lg">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1.5 bg-black text-white font-black text-sm border-2 border-white uppercase">
                    {submissionResult.priority_category} PRIORITY
                  </span>
                </div>
              </motion.div>

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

              {/* 5-Component Priority Breakdown Table with sequential reveal */}
              {submissionResult.score_breakdown && submissionResult.score_breakdown.components && (
                <div className="border-2 border-black p-3 bg-white space-y-2 text-xs">
                  <div className="font-extrabold uppercase border-b border-black pb-1">
                    5-FACTOR TRANSPARENT BREAKDOWN
                  </div>
                  
                  <StaggerContainer stagger={0.04} className="space-y-1 text-[11px]">
                    {Object.entries(submissionResult.score_breakdown.components).map(([k, v]) => (
                      <StaggerItem key={k} className="flex items-center justify-between py-1 border-b border-gray-100">
                        <span className="font-bold">{k.replace("_", " ").toUpperCase()}:</span>
                        <span className="font-black bg-gray-100 px-2 py-0.5 border border-black">
                          <AnimatedNumber value={v.awarded_points} decimals={1} /> / {v.max_points.toFixed(1)} pts
                        </span>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {/* Lifecycle Status Timeline with left-to-right draw */}
              <div className="p-3.5 bg-black text-white border-2 border-black space-y-2 text-xs">
                <div className="font-bold text-tactile-accent uppercase border-b border-white/20 pb-1 flex items-center justify-between">
                  <span>STATUS TIMELINE</span>
                  <span>{submissionResult.status}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 font-mono">
                  <span className={submissionResult.status === 'REPORTED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>REPORTED</span>
                  <span className="text-gray-500">→</span>
                  <span className={submissionResult.status === 'VERIFIED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>VERIFIED</span>
                  <span className="text-gray-500">→</span>
                  <span className={submissionResult.status === 'ASSIGNED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>ASSIGNED</span>
                  <span className="text-gray-500">→</span>
                  <span className={submissionResult.status === 'IN_PROGRESS' ? 'text-tactile-accent font-black' : 'text-gray-400'}>IN_PROGRESS</span>
                  <span className="text-gray-500">→</span>
                  <span className={submissionResult.status === 'RESOLVED' ? 'text-tactile-accent font-black' : 'text-gray-400'}>RESOLVED</span>
                </div>
              </div>

              {/* Quick Jump to Queue Button */}
              {onNavigate && (
                <motion.button
                  onClick={() => onNavigate('queue')}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  className="w-full py-2.5 bg-tactile-oliveDark text-white hover:bg-black font-bold text-xs uppercase border-2 border-black shadow-tactile-sm flex items-center justify-center gap-2 transition-colors"
                >
                  VIEW IN PRIORITY QUEUE <ArrowRight className="w-4 h-4 text-tactile-accent" />
                </motion.button>
              )}

            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#101010] p-6 text-center font-mono space-y-3"
            >
              <Shield className="w-12 h-12 text-black mx-auto" />
              <h3 className="font-black text-base uppercase">READY FOR INCIDENT REPORTING</h3>
              <p className="font-sans text-xs text-gray-700 leading-relaxed">
                Fill out the emergency report form on the left and click <strong>"ANALYZE & REGISTER INCIDENT REPORT →"</strong> to trigger Gemini AI extraction, Haversine proximity evaluation, and deterministic 0-100 priority scoring.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
