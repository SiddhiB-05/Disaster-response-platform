import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Shield, Hospital, Building, AlertTriangle } from 'lucide-react';

// Invalidate size component to handle tab switches smoothly
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Custom Leaflet Markers using HTML DivIcon with rich tactical styling
const createTacticalIcon = (bgColor, borderColor, text, label, isPulse = false) => {
  const pulseHtml = isPulse
    ? `<span style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background-color: ${bgColor};
        opacity: 0.6;
        animation: radar-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        pointer-events: none;
      "></span>`
    : '';

  return L.divIcon({
    className: 'custom-tactile-leaflet-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${pulseHtml}
        <div style="
          position: relative;
          background-color: ${bgColor};
          border: 3px solid ${borderColor};
          min-width: 32px;
          height: 32px;
          padding: 0 6px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 900;
          font-size: 11px;
          white-space: nowrap;
          letter-spacing: 0.5px;
        ">
          ${text}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Distinct, vibrant color-coded icons for each category requested by user
const redZoneIcon = createTacticalIcon('#DC2626', '#991B1B', '🔴 RED ZONE', 'RED ZONE', true);
const habImmediateIcon = createTacticalIcon('#EF4444', '#7F1D1D', '🚨 IMMEDIATE', 'IMMEDIATE TIER', true);
const habShortIcon = createTacticalIcon('#F59E0B', '#78350F', '⚡ SHORT-TERM', 'SHORT-TERM TIER');
const habMediumIcon = createTacticalIcon('#3B82F6', '#1E3A8A', '📅 MEDIUM-TERM', 'MEDIUM-TERM TIER');
const safeSiteIcon = createTacticalIcon('#10B981', '#064E3B', '🛡️ SAFE SITE', 'SAFE RELOCATION SITE');
const redIcon = createTacticalIcon('#E53E3E', '#9B2C2C', '!', 'HIGH INCIDENT', true);
const yellowIcon = createTacticalIcon('#DD6B20', '#7B341E', '!', 'MED INCIDENT');
const greenIcon = createTacticalIcon('#38A169', '#22543D', '!', 'LOW INCIDENT');
const blueResourceIcon = createTacticalIcon('#2563EB', '#1E3A8A', '🚑 RESCUE', 'RESCUE RESOURCE');
const facilityIcon = createTacticalIcon('#8B5CF6', '#4C1D95', '🏥 FACILITY', 'CRITICAL FACILITY');

export default function MapView({
  incidents = [],
  resources = [],
  facilities = [],
  redZones = [],
  relocationSites = [],
  habitations = []
}) {
  // Layer visibility toggles
  const [showRedZones, setShowRedZones] = React.useState(true);
  const [showImmediate, setShowImmediate] = React.useState(true);
  const [showShortTerm, setShowShortTerm] = React.useState(true);
  const [showSafeSites, setShowSafeSites] = React.useState(true);
  const [showIncidents, setShowIncidents] = React.useState(true);
  const [showResources, setShowResources] = React.useState(true);

  // Default Map Center: Multi-State Hazard Region (22.2604, 84.8536)
  const center = [22.2604, 84.8536];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Interactive Layer Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-slate-900 border-2 border-slate-800 p-5 rounded-2xl shadow-2xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase rounded-full border border-red-500/30">
              SDMA GIS COMMAND // MULTI-HAZARD & RELOCATION MAP
            </span>
            <h2 className="text-xl md:text-2xl font-mono font-black uppercase mt-1 text-white tracking-tight">
              TACTICAL MULTI-HAZARD RED ZONES & RELOCATION MAP
            </h2>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Active Layers: <strong className="text-emerald-400 font-bold">
              {[showRedZones && 'Red Zones', showImmediate && 'Immediate Tier', showShortTerm && 'Short-Term Tier', showSafeSites && 'Safe Sites'].filter(Boolean).join(' • ') || 'None'}
            </strong>
          </div>
        </div>

        {/* Interactive Color-Coded Layer Legend & Filter Toggles */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2.5 font-mono text-xs font-bold">
          <button
            onClick={() => setShowRedZones(!showRedZones)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showRedZones
                ? 'bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-950/50'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white animate-pulse"></span>
            <span>🔴 RED ZONE</span>
          </button>

          <button
            onClick={() => setShowImmediate(!showImmediate)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showImmediate
                ? 'bg-red-900/40 border-red-400 text-red-300 shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white"></span>
            <span>🚨 IMMEDIATE TIER</span>
          </button>

          <button
            onClick={() => setShowShortTerm(!showShortTerm)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showShortTerm
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white"></span>
            <span>⚡ SHORT-TERM TIER</span>
          </button>

          <button
            onClick={() => setShowSafeSites(!showSafeSites)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showSafeSites
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></span>
            <span>🛡️ SAFE RELOCATION SITE</span>
          </button>

          <button
            onClick={() => setShowResources(!showResources)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              showResources
                ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-lg'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white"></span>
            <span>🚑 RESCUE RESOURCE</span>
          </button>
        </div>
      </motion.div>

      {/* Leaflet Map Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 p-3 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="h-[620px] w-full rounded-xl overflow-hidden border border-slate-700 relative">
          <MapContainer
            center={center}
            zoom={10}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizer />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 1. Multi-Hazard Red Zones (Circle polygons + high visibility markers) */}
            {showRedZones && redZones.map((rz) => (
              <React.Fragment key={`rz-${rz.id}`}>
                <Marker position={[rz.latitude, rz.longitude]} icon={redZoneIcon}>
                  <Popup>
                    <div className="font-sans text-xs space-y-1.5 p-1 min-w-[200px]">
                      <div className="font-extrabold text-sm text-red-700 border-b border-red-200 pb-1">
                        🔴 RED ZONE: {rz.name}
                      </div>
                      <div><strong>Hazard Type:</strong> <span className="text-red-600 font-bold">{rz.hazard_type}</span></div>
                      <div><strong>Hazard Intensity:</strong> <span className="font-bold">{rz.hazard_intensity}/100</span> ({rz.risk_level})</div>
                      <div><strong>Population at Risk:</strong> {rz.population_at_risk?.toLocaleString()} citizens</div>
                      <div><strong>District / State:</strong> {rz.district}, {rz.state}</div>
                      <div className="text-[11px] text-gray-600 italic border-t pt-1 mt-1">"{rz.disaster_history_summary}"</div>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={[rz.latitude, rz.longitude]}
                  radius={(rz.radius_km || 5.0) * 1000}
                  pathOptions={{
                    color: '#DC2626',
                    fillColor: '#EF4444',
                    fillOpacity: 0.35,
                    weight: 3,
                    dashArray: '8,8'
                  }}
                />
              </React.Fragment>
            ))}

            {/* 2. Safer Relocation Sites */}
            {showSafeSites && relocationSites.map((site) => (
              <Marker key={`site-${site.id}`} position={[site.latitude, site.longitude]} icon={safeSiteIcon}>
                <Popup>
                  <div className="font-sans text-xs space-y-1.5 p-1 min-w-[200px]">
                    <div className="font-extrabold text-sm text-emerald-800 border-b border-emerald-200 pb-1">
                      🛡️ SAFE RELOCATION SITE: {site.name}
                    </div>
                    <div><strong>Suitability Score:</strong> <span className="text-emerald-700 font-bold">{site.suitability_score}%</span></div>
                    <div><strong>Carrying Capacity:</strong> {site.current_occupied} / {site.max_capacity_people} people</div>
                    <div><strong>Elevation:</strong> {site.elevation_m} meters | <strong>Slope:</strong> {site.slope_degree}°</div>
                    <div><strong>Infrastructure Score:</strong> {site.infrastructure_score}/100</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 3. Vulnerable Habitations (Immediate, Short-Term, Medium-Term) */}
            {habitations.map((hab) => {
              const isImmediate = hab.relocation_tier === 'IMMEDIATE';
              const isShort = hab.relocation_tier === 'SHORT_TERM';
              
              if (isImmediate && !showImmediate) return null;
              if (isShort && !showShortTerm) return null;

              const hIcon = isImmediate
                ? habImmediateIcon
                : isShort
                ? habShortIcon
                : habMediumIcon;

              return (
                <Marker key={`hab-${hab.id}`} position={[hab.latitude, hab.longitude]} icon={hIcon}>
                  <Popup>
                    <div className="font-sans text-xs space-y-1.5 p-1 min-w-[200px]">
                      <div className="font-extrabold text-sm text-slate-900 border-b pb-1">
                        🏡 {hab.name}
                      </div>
                      <div><strong>Relocation Tier:</strong> <span className="font-bold text-red-600">{hab.relocation_tier}</span></div>
                      <div><strong>Priority Score:</strong> <span className="font-bold text-red-700">{hab.relocation_priority_score}/100</span></div>
                      <div><strong>Population:</strong> {hab.population} (Children: {hab.vulnerable_children_count}, Elderly: {hab.vulnerable_elderly_count})</div>
                      <div><strong>Housing Type:</strong> {hab.housing_type}</div>
                      <div><strong>Past Disasters:</strong> {hab.disaster_history_count} occurrences</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 4. Incident Markers */}
            {showIncidents && incidents.map((inc) => {
              const icon = inc.priority_category === 'HIGH' ? redIcon : inc.priority_category === 'MEDIUM' ? yellowIcon : greenIcon;
              return (
                <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={icon}>
                  <Popup>
                    <div className="font-sans text-xs space-y-1 p-1">
                      <div className="font-extrabold text-sm text-black border-b pb-1">
                        #{inc.id} - {inc.incident_type} ({inc.priority_score}/100 {inc.priority_category})
                      </div>
                      <div><strong>Location:</strong> {inc.location_name}</div>
                      <div><strong>Description:</strong> "{inc.description}"</div>
                      <div><strong>Affected:</strong> {inc.people_affected} persons</div>
                      <div><strong>Status:</strong> <span className="font-bold text-blue-700">{inc.status}</span></div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 5. Rescue Resource Markers */}
            {showResources && resources.map((res) => (
              <Marker key={`res-${res.id}`} position={[res.latitude, res.longitude]} icon={blueResourceIcon}>
                <Popup>
                  <div className="font-sans text-xs space-y-1 p-1">
                    <div className="font-extrabold text-sm text-blue-800 border-b pb-1">
                      🚑 {res.name} ({res.status})
                    </div>
                    <div><strong>Type:</strong> {res.type}</div>
                    <div><strong>Capabilities:</strong> {res.capability}</div>
                    <div><strong>Capacity:</strong> {res.capacity} persons</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 6. Critical Facilities Markers */}
            {facilities.map((fac) => (
              <React.Fragment key={`fac-${fac.id}`}>
                <Marker position={[fac.latitude, fac.longitude]} icon={facilityIcon}>
                  <Popup>
                    <div className="font-sans text-xs space-y-1 p-1">
                      <div className="font-extrabold text-sm text-purple-900 border-b pb-1">
                        🏥 {fac.name}
                      </div>
                      <div><strong>Type:</strong> {fac.facility_type}</div>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={[fac.latitude, fac.longitude]}
                  radius={1500}
                  pathOptions={{ color: '#805AD5', fillColor: '#805AD5', fillOpacity: 0.08, weight: 1, dashArray: '4,4' }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </motion.div>
    </div>
  );
}


