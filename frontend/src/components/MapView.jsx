import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Shield, Hospital, Building, AlertTriangle } from 'lucide-react';

// Custom Leaflet Markers using HTML DivIcon
const createCustomIcon = (color, text) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #000;
        box-shadow: 2px 2px 0px #000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: monospace;
        font-weight: bold;
        font-size: 11px;
      ">
        ${text}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const redIcon = createCustomIcon('#E53E3E', '!');
const yellowIcon = createCustomIcon('#DD6B20', '!');
const greenIcon = createCustomIcon('#38A169', '!');
const blueResourceIcon = createCustomIcon('#2B6CB0', 'R');
const facilityIcon = createCustomIcon('#805AD5', 'F');

export default function MapView({ incidents, resources, facilities }) {
  // Default Map Center: Rourkela Sector 6 (22.2604, 84.8536)
  const center = [22.2604, 84.8536];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white p-5 tactile-box flex flex-wrap items-center justify-between">
        <div>
          <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-xs font-bold uppercase">
            GIS LAYER // ROURKELA SECTOR 6 DISASTER ZONE
          </span>
          <h2 className="text-xl font-mono font-bold uppercase mt-1 text-tactile-border">
            TACTICAL INCIDENT & RESOURCE GEOSPATIAL MAP
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 font-mono text-xs font-bold">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-red-100 border border-red-600 text-red-800">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-black"></span> HIGH INCIDENT
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-600 text-amber-800">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-black"></span> MED INCIDENT
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 border border-blue-600 text-blue-800">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-black"></span> RESCUE RESOURCE
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 border border-purple-600 text-purple-800">
            <span className="w-3 h-3 rounded-full bg-purple-600 border border-black"></span> CRITICAL FACILITY
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white p-3 tactile-box">
        <div className="h-[550px] w-full border-2 border-black">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Incidents Markers */}
            {incidents.map((inc) => {
              const icon = inc.priority_category === 'HIGH' ? redIcon : inc.priority_category === 'MEDIUM' ? yellowIcon : greenIcon;
              return (
                <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={icon}>
                  <Popup>
                    <div className="font-mono text-xs space-y-1">
                      <div className="font-bold text-sm text-black border-b pb-1">
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

            {/* Resources Markers */}
            {resources.map((res) => (
              <Marker key={`res-${res.id}`} position={[res.latitude, res.longitude]} icon={blueResourceIcon}>
                <Popup>
                  <div className="font-mono text-xs space-y-1">
                    <div className="font-bold text-sm text-blue-800 border-b pb-1">
                      {res.name} ({res.status})
                    </div>
                    <div><strong>Type:</strong> {res.type}</div>
                    <div><strong>Capabilities:</strong> {res.capability}</div>
                    <div><strong>Capacity:</strong> {res.capacity} persons</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Critical Facilities Markers */}
            {facilities.map((fac) => (
              <React.Fragment key={`fac-${fac.id}`}>
                <Marker position={[fac.latitude, fac.longitude]} icon={facilityIcon}>
                  <Popup>
                    <div className="font-mono text-xs space-y-1">
                      <div className="font-bold text-sm text-purple-900 border-b pb-1">
                        {fac.name}
                      </div>
                      <div><strong>Type:</strong> {fac.facility_type}</div>
                    </div>
                  </Popup>
                </Marker>

                {/* 1.5 km Proximity Radius Circle */}
                <Circle
                  center={[fac.latitude, fac.longitude]}
                  radius={1500}
                  pathOptions={{ color: '#805AD5', fillColor: '#805AD5', fillOpacity: 0.08, weight: 1, dashArray: '4,4' }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
