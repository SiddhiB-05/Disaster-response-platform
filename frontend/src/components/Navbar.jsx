import React from 'react';
import { Activity, ShieldAlert, Cpu, Map, Layers, RefreshCw, GitBranch, Home, CloudRain, Bot, PhoneCall } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetDemo, activeAlert }) {
  const tabs = [
    { id: 'landing', label: 'STI', icon: Activity },
    { id: 'architecture', label: 'ARCHITECTURE', icon: GitBranch },
    { id: 'report', label: 'REPORT INCIDENT', icon: ShieldAlert },
    { id: 'queue', label: 'PRIORITY QUEUE', icon: Activity },
    { id: 'scipy', label: 'SCIPY MATCHING', icon: Cpu },
    { id: 'map', label: 'TACTICAL MAP', icon: Map },
    { id: 'shelters', label: 'SHELTERS & HOSPITALS', icon: Home },
    { id: 'weather', label: 'WEATHER & RISK', icon: CloudRain },
    { id: 'chatbot', label: 'AI CHATBOT', icon: Bot },
    { id: 'offline', label: 'SMS & OFFLINE', icon: PhoneCall },
    { id: 'pipeline', label: 'GEMINI AI PIPELINE', icon: Layers },
  ];


  return (
    <header className="border-b-4 border-tactile-border bg-tactile-oliveHeader text-white">
      {/* Top Ticker Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-tactile-oliveDark text-xs font-mono border-b border-tactile-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tactile-accent/20 border border-tactile-accent text-tactile-accent font-bold">
            <span className="w-2 h-2 rounded-full bg-tactile-accent animate-pulse"></span>
            SYSTEM STATUS: OPERATIONAL
          </span>
          <span className="hidden sm:inline text-gray-300">
            DISASTER RESPONSE PLATFORM // PS-05 // ROURKELA DEMO ZONE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onResetDemo}
            className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold rounded border border-black shadow-sm transition"
            title="Reset to hackathon demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            1-CLICK DEMO SEED
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#385135]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-tactile-accent text-black font-mono font-black text-xl flex items-center justify-center border-2 border-black shadow-tactile-sm">
            STI
          </div>
          <div>
            <h1 className="font-mono font-extrabold text-lg leading-tight tracking-wider uppercase">
              DISASTER EARLY-WARNING & RESOURCE COORDINATION
            </h1>
            <p className="text-xs text-tactile-grid font-mono">
              AI incident extraction • 0-100 priority engine • SciPy linear allocation
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex flex-wrap gap-1.5 mt-2 lg:mt-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase transition border-2 border-black ${
                  isActive
                    ? 'bg-tactile-accent text-black shadow-tactile-sm transform -translate-y-0.5'
                    : 'bg-tactile-oliveDark text-white hover:bg-tactile-olive hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Disaster Alert Ticker */}
      {activeAlert && (
        <div className="bg-red-700 text-white px-4 py-1.5 font-mono text-xs font-bold flex items-center justify-between border-t-2 border-black animate-pulse">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-black text-red-400 border border-red-500 uppercase">
              {activeAlert.simulated ? 'SIMULATED ALERT' : 'OFFICIAL ALERT'}
            </span>
            <span>
              [{activeAlert.alert_type.toUpperCase()} - {activeAlert.district.toUpperCase()}] {activeAlert.message}
            </span>
          </div>
          <span className="text-red-200 text-[10px]">SEVERITY: {activeAlert.severity.toUpperCase()}</span>
        </div>
      )}
    </header>
  );
}
