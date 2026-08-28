import React from 'react';

/**
 * High-performance CSS/SVG neo-brutalist fallback for low-power devices,
 * disabled WebGL, mobile, or prefers-reduced-motion environments.
 */
export default function TacticalFallback({ activeTab = 'landing' }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[#E2E8E0]"
    >
      {/* Neo-brutalist Perspective Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="fallback-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1E2C1D" strokeWidth="1" />
          </pattern>
          <linearGradient id="fallback-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E2C1D" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#1E2C1D" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1E2C1D" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Perspective Grid Plane */}
        <rect width="100%" height="100%" fill="url(#fallback-grid)" />

        {/* Tactical Crosshairs and Range Rings */}
        <g stroke="#1E2C1D" strokeWidth="1.5" fill="none" opacity="0.35">
          <circle cx="75%" cy="35%" r="120" strokeDasharray="6,6" />
          <circle cx="75%" cy="35%" r="220" strokeDasharray="3,6" />
          <line x1="75%" y1="10%" x2="75%" y2="60%" strokeDasharray="4,4" />
          <line x1="55%" y1="35%" x2="95%" y2="35%" strokeDasharray="4,4" />
        </g>

        {/* Representative Static Tactical Nodes */}
        <g>
          {/* Emergency Node (Red) */}
          <circle cx="72%" cy="30%" r="5" fill="#E53E3E" stroke="#1E2C1D" strokeWidth="1.5" />
          <circle cx="72%" cy="30%" r="14" fill="none" stroke="#E53E3E" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

          {/* Warning Node (Amber) */}
          <circle cx="82%" cy="24%" r="4.5" fill="#DD6B20" stroke="#1E2C1D" strokeWidth="1.5" />

          {/* Low Priority Incident (Green) */}
          <circle cx="66%" cy="42%" r="4" fill="#6DBE5A" stroke="#1E2C1D" strokeWidth="1.5" />

          {/* Resource Node (Teal) */}
          <rect x="78%" y="45%" width="9" height="9" fill="#319795" stroke="#1E2C1D" strokeWidth="1.5" />

          {/* Facility Node (Purple) */}
          <rect x="62%" y="22%" width="8" height="8" fill="#805AD5" stroke="#1E2C1D" strokeWidth="1.5" />

          {/* Vector route */}
          <path d="M 78% 45% L 72% 30%" stroke="#456942" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.45" />
        </g>
      </svg>

      {/* Subtle Vignette for Neo-Brutalist readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E2E8E0]/40 to-[#E2E8E0]/90" />
    </div>
  );
}
