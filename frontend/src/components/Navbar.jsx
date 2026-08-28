import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, Cpu, Map, Layers, RefreshCw, GitBranch, Home, CloudRain, Bot, PhoneCall, Radio, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetDemo, activeAlert, isResetting = false }) {
  const navRef = useRef(null);

  const tabs = [
    { id: 'landing', label: 'HOME', icon: Activity },
    { id: 'architecture', label: 'ARCHITECTURE', icon: GitBranch },
    { id: 'report', label: 'REPORT INCIDENT', icon: ShieldAlert },
    { id: 'queue', label: 'PRIORITY QUEUE', icon: Activity },
    { id: 'scipy', label: 'SCIPY MATCHING', icon: Cpu },
    { id: 'map', label: 'TACTICAL MAP', icon: Map },
    { id: 'shelters', label: 'SHELTERS & HOSPITALS', icon: Home },
    { id: 'weather', label: 'WEATHER & RISK', icon: CloudRain },
    { id: 'chatbot', label: 'AI CHATBOT', icon: Bot },
    { id: 'offline', label: 'SMS & OFFLINE', icon: PhoneCall },
    { id: 'pipeline', label: 'AI PIPELINE', icon: Layers },
  ];

  // Auto-scroll active tab into center view when activeTab changes
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  const handleTabClick = (tabId, e) => {
    setActiveTab(tabId);
    if (e && e.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleManualScroll = (offset) => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b-4 border-black bg-[#162415] text-white">
      
      {/* 1. Top Ticker Status Bar - Scrolls smoothly off-screen with the page */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 bg-[#0F1A0E] text-xs font-mono border-b border-black">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#6DBE5A]/20 border border-[#6DBE5A]/60 text-[#6DBE5A] font-extrabold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-[#6DBE5A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6DBE5A]"></span>
            </span>
            SYSTEM STATUS: OPERATIONAL
          </span>
          <span className="hidden sm:inline text-gray-400 font-semibold text-[11px] tracking-wider uppercase">
            PS-05 REAL-TIME DISASTER PLATFORM // ROURKELA ZONE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            onClick={onResetDemo}
            disabled={isResetting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded border border-black shadow-sm transition-colors disabled:opacity-60"
            title="Reset to hackathon demo state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'RESETTING...' : 'RESET DEMO STATE'}
          </motion.button>
        </div>
      </div>

      {/* 2. Main Header Branding Bar - Scrolls smoothly off-screen with the page */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#162415] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6DBE5A] text-black border-2 border-black flex items-center justify-center font-black shadow-tactile-sm shrink-0">
            <Radio className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-black text-base sm:text-lg leading-tight tracking-tight uppercase text-white">
                DISASTER EARLY-WARNING & RESOURCE COORDINATION
              </h1>
              <span className="px-2 py-0.5 bg-[#6DBE5A] text-black font-mono font-black text-[10px] uppercase border border-black hidden md:inline-block">
                ROURKELA HQ
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono font-semibold mt-0.5">
              AI Incident Extraction • 0-100 Priority Engine • SciPy Linear Allocation • Real-Time Directives
            </p>
          </div>
        </div>
      </div>

      {/* 3. High-Contrast Navigation Tabs Bar - PINS PERFECTLY STICKY TO TOP 0 WITH AUTO-SCROLL */}
      <div className="sticky top-0 z-50 bg-[#1E2C1D] border-b-2 border-black shadow-lg flex items-center px-2 py-2">
        
        {/* Left Scroll Chevron Arrow */}
        <button
          onClick={() => handleManualScroll(-220)}
          className="p-1.5 bg-[#162415] hover:bg-[#6DBE5A] text-white hover:text-black border border-black rounded transition-colors shrink-0 mr-2"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Scrollable Tabs Container */}
        <div
          ref={navRef}
          className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-2 scroll-smooth py-0.5"
        >
          <nav className="flex items-center gap-2 min-w-max" aria-label="Dashboard Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={(e) => handleTabClick(tab.id, e)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-[2px_2px_0px_#000] shrink-0 ${
                    isActive
                      ? 'bg-[#6DBE5A] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                      : 'bg-white text-black hover:bg-[#6DBE5A] hover:text-black'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-black" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Scroll Chevron Arrow */}
        <button
          onClick={() => handleManualScroll(220)}
          className="p-1.5 bg-[#162415] hover:bg-[#6DBE5A] text-white hover:text-black border border-black rounded transition-colors shrink-0 ml-2"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Active Disaster Alert Bar */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
            className="sticky top-[52px] z-40 overflow-hidden bg-red-700 text-white border-b-2 border-black"
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
