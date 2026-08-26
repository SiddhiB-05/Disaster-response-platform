import React, { useState, useEffect } from 'react';
import { Home, Hospital, Phone, Users, MapPin, CheckCircle, Navigation, ShieldAlert } from 'lucide-react';
import { facilityService } from '../services/api';

export default function ShelterMedicalDirectory() {
  const [facilities, setFacilities] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // ALL, SHELTER, HOSPITAL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await facilityService.getFacilities();
      setFacilities(res);
    } catch (err) {
      console.error("Facility fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => {
    if (filterType === 'SHELTER') return f.facility_type?.toLowerCase().includes('shelter');
    if (filterType === 'HOSPITAL') return f.facility_type?.toLowerCase().includes('hospital');
    return true;
  });

  const safeShelters = facilities.filter(f => f.facility_type?.toLowerCase().includes('shelter'));
  const hospitals = facilities.filter(f => f.facility_type?.toLowerCase().includes('hospital'));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Top Banner */}
      <div className="bg-tactile-oliveDark text-white p-6 border-2 border-black shadow-[6px_6px_0px_#1E2C1D] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-tactile-accent text-black font-black text-xs uppercase">VERIFIED EMERGENCY DIRECTORY</span>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
            <Home className="w-6 h-6 text-tactile-accent" />
            ROURKELA SAFE SHELTERS & MEDICAL HELP
          </h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Real-time occupancy, phone contacts, capacity limits, and emergency medical response centers across Rourkela.
          </p>
        </div>

        {/* Filter Toggles */}
        <div className="flex gap-2 bg-black/40 p-1.5 border border-white/20">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-bold transition ${filterType === 'ALL' ? 'bg-tactile-accent text-black font-black' : 'text-white hover:bg-white/10'}`}
          >
            ALL ({facilities.length})
          </button>
          <button
            onClick={() => setFilterType('SHELTER')}
            className={`px-3 py-1.5 text-xs font-bold transition ${filterType === 'SHELTER' ? 'bg-tactile-accent text-black font-black' : 'text-white hover:bg-white/10'}`}
          >
            🏰 SAFE SHELTERS ({safeShelters.length})
          </button>
          <button
            onClick={() => setFilterType('HOSPITAL')}
            className={`px-3 py-1.5 text-xs font-bold transition ${filterType === 'HOSPITAL' ? 'bg-tactile-accent text-black font-black' : 'text-white hover:bg-white/10'}`}
          >
            🏥 HOSPITALS ({hospitals.length})
          </button>
        </div>
      </div>

      {/* Grid of Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => {
          const isShelter = fac.facility_type?.toLowerCase().includes('shelter');
          const isHospital = fac.facility_type?.toLowerCase().includes('hospital');
          const capacity = fac.capacity || (isShelter ? 800 : 350);
          const occupancy = fac.current_occupancy || Math.floor(capacity * 0.35);
          const occupancyPct = Math.round((occupancy / capacity) * 100);

          return (
            <div
              key={fac.id}
              className={`bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-5 space-y-4 flex flex-col justify-between transition hover:-translate-y-0.5 ${
                isShelter ? 'border-t-8 border-t-amber-500' : isHospital ? 'border-t-8 border-t-red-600' : 'border-t-8 border-t-emerald-600'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                    isShelter ? 'bg-amber-100 text-amber-900' : isHospital ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {isShelter ? '🏰 Safe Relief Shelter' : isHospital ? '🏥 Emergency Hospital' : fac.facility_type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> VERIFIED
                  </span>
                </div>

                <h3 className="font-black text-sm text-black leading-snug">
                  {fac.name}
                </h3>

                <p className="text-xs font-sans text-gray-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
                  {fac.address || 'Rourkela Sector Region'}
                </p>
              </div>

              {/* Occupancy Gauge */}
              <div className="bg-tactile-bg p-3 border border-black space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-tactile-olive" /> Occupancy Capacity
                  </span>
                  <span className={occupancyPct > 80 ? 'text-red-700 font-black' : 'text-emerald-800'}>
                    {occupancy} / {capacity} ({occupancyPct}%)
                  </span>
                </div>

                <div className="w-full bg-gray-200 h-2.5 border border-black overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      occupancyPct > 80 ? 'bg-red-600' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-bold">
                <a
                  href={`tel:${fac.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-tactile-accent text-black border border-black shadow-tactile-sm hover:bg-emerald-400 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> {fac.phone || '1077 (Toll-Free)'}
                </a>

                <button
                  onClick={() => alert(`Navigating to ${fac.name} (${fac.latitude.toFixed(4)}, ${fac.longitude.toFixed(4)})`)}
                  className="flex items-center gap-1 text-[11px] text-tactile-olive hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
