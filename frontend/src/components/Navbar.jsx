import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, Cpu, Map, Layers, RefreshCw, GitBranch, Home, CloudRain, Bot, PhoneCall, AlertTriangle } from 'lucide-react';
import Marquee from './motion/Marquee';

export default function Navbar({ activeTab, setActiveTab, onResetDemo, activeAlert, isResetting = false }) {
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
    <header className="border-b-4 border-tactile-border bg-tactile-oliveHeader text-white relative z-40">
      {/* Top Ticker Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-tactile-oliveDark text-xs font-mono border-b border-tactile-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-tactile-accent/15 border border-tactile-accent/50 text-tactile-accent font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-tactile-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tactile-accent"></span>
            </span>
            SYSTEM STATUS: OPERATIONAL
          </span>
          <span className="hidden sm:inline text-gray-300">
            DISASTER RESPONSE PLATFORM // PS-05 // ROURKELA DEMO ZONE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            onClick={onResetDemo}
            disabled={isResetting}
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold rounded border border-black shadow-sm transition-colors disabled:opacity-60"
            title="Reset to hackathon demo state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'SEEDING...' : '1-CLICK DEMO SEED'}
          </motion.button>
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

        {/* Tab Buttons with LayoutId highlight */}
        <nav className="flex flex-wrap gap-1.5 mt-2 lg:mt-0" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-black transition-all ${
                  isActive
                    ? 'bg-tactile-accent text-black shadow-tactile-sm transform -translate-y-0.5'
                    : 'bg-tactile-oliveDark text-white hover:bg-tactile-olive hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabGlow"
                    className="absolute inset-0 bg-tactile-accent -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Disaster Alert Bar with AnimatePresence and Calm Radar Ring */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
            className="overflow-hidden bg-red-700 text-white border-t-2 border-black"
          >
            <div className="px-4 py-1.5 font-mono text-xs font-bold flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-200"></span>
                </span>
                <span className="px-1.5 py-0.5 bg-black text-red-400 border border-red-500 uppercase text-[10px] shrink-0 font-extrabold">
                  {activeAlert.simulated ? 'SIMULATED ALERT' : 'OFFICIAL ALERT'}
                </span>
                <div className="truncate text-white">
                  <span className="text-red-200">[{activeAlert.alert_type?.toUpperCase()} - {activeAlert.district?.toUpperCase()}]</span>{' '}
                  <span className="text-white font-medium">{activeAlert.message}</span>
                </div>
              </div>
              <span className="text-red-200 text-[10px] shrink-0 font-extrabold tracking-wider">
                SEVERITY: {activeAlert.severity?.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
