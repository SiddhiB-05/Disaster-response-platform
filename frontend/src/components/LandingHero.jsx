import React from 'react';
import { ArrowRight, ArrowDown, Database, Cpu, Brain, ShieldCheck } from 'lucide-react';
import AgenticWorkflow from './AgenticWorkflow';

export default function LandingHero({ onNavigate, activeTab, totalIncidents = 5 }) {
  const navTabs = [
    { id: 'landing', label: 'STI' },
    { id: 'architecture', label: 'ARCHITECTURE' },
    { id: 'pipeline', label: 'AGENTS' },
    { id: 'queue', label: 'DASHBOARD' },
    { id: 'scipy', label: 'PIPELINE' },
    { id: 'report', label: 'REPORT INCIDENT' },
  ];

  const handleExploreWorkflow = () => {
    const el = document.getElementById('agent-workflow');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('pipeline');
    }
  };

  return (
    <div className="w-full min-h-screen bg-tactile-bg tactile-grid-bg text-tactile-border flex flex-col justify-between selection:bg-tactile-accent selection:text-black">
      
      {/* Top Navbar Header */}
      <header className="w-full bg-[#D5DDD3] border-b-2 border-black px-4 py-2.5 flex flex-wrap items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`px-3 py-1 font-mono text-xs font-extrabold uppercase border-2 border-black transition shadow-tactile-sm ${
                activeTab === tab.id
                  ? 'bg-tactile-accent text-black'
                  : 'bg-[#C5D0C3] text-black hover:bg-tactile-accent hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        {/* Main Grid: Left Hero Main Card + Right Brain Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Hero Main Card */}
          <div className="lg:col-span-8 bg-[#EAEFE8] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-10 flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              {/* Operational Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E2C1D] text-white border border-black font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-tactile-accent animate-pulse"></span>
                SYSTEM STATUS: OPERATIONAL
              </div>

              {/* Stacked Heading */}
              <div className="font-mono font-black text-3xl sm:text-5xl lg:text-6xl text-tactile-border leading-[1.1] tracking-tight uppercase">
                <div>DISASTER RESPONSE</div>
                <div className="inline-block bg-tactile-accent text-black px-3 py-1 mt-1 border-2 border-black shadow-tactile-sm">
                  INTELLIGENCE
                </div>
                <div className="mt-1">ROURKELA ZONE</div>
              </div>

              {/* Subtitle Paragraph */}
              <p className="font-sans text-sm sm:text-base text-gray-800 leading-relaxed max-w-2xl font-medium">
                Four autonomous AI agents transform raw disaster incident reports into predictive priority scores and deployment-ready action plans — in real time.
              </p>

              {/* Technical Meta Tag */}
              <div className="font-mono text-xs font-bold text-gray-500 tracking-wider uppercase">
                AGENTIC AI PLATFORM // {totalIncidents} INCIDENTS REGISTERED // ROURKELA DISASTER DATASET
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => onNavigate('queue')}
                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-tactile-accent hover:bg-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition hover:-translate-y-0.5 active:translate-y-0.5"
              >
                LAUNCH DASHBOARD
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleExploreWorkflow}
                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#E2E8E0] hover:bg-white text-black font-mono font-bold text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition hover:-translate-y-0.5 active:translate-y-0.5"
              >
                EXPLORE AGENTIC WORKFLOW
                <ArrowDown className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('report')}
                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1E2C1D] hover:bg-tactile-olive text-white font-mono font-bold text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition hover:-translate-y-0.5 active:translate-y-0.5"
              >
                SUBMIT CITIZEN REPORT
                <ShieldCheck className="w-5 h-5 text-tactile-accent" />
              </button>
            </div>
          </div>

          {/* Right Column: Big Green Graphic Card + Stat Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            
            {/* Big Green Brain Graphic Card */}
            <div className="flex-1 bg-tactile-accent border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-8 flex items-center justify-center min-h-[260px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#1E2C1D_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <Brain className="w-32 h-32 sm:w-40 sm:h-40 text-black stroke-[1.5] relative z-10 transition transform group-hover:scale-105" />
            </div>

            {/* Bottom Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Stat 1: Real Incident Count */}
              <div className="bg-[#EAEFE8] border-2 border-black shadow-tactile p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-tactile-olive" />
                  <span className="w-2 h-2 rounded-full bg-tactile-accent animate-ping"></span>
                </div>
                <div className="font-mono font-black text-2xl sm:text-3xl text-black pt-2">
                  {totalIncidents}
                </div>
                <div className="font-mono text-[10px] font-bold uppercase text-gray-600 leading-tight">
                  INCIDENTS ANALYZED & PROCESSED
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#1E2C1D] text-white border-2 border-black shadow-tactile p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <Cpu className="w-5 h-5 text-tactile-accent" />
                </div>
                <div className="font-mono font-black text-2xl sm:text-3xl text-tactile-accent pt-2">
                  4
                </div>
                <div className="font-mono text-[10px] font-bold uppercase text-gray-300 leading-tight">
                  AI AGENTS & ENGINES
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Agentic Workflow Visual Section */}
      <AgenticWorkflow />

      {/* Ticker Banner at Bottom */}
      <footer className="w-full bg-tactile-accent border-t-2 border-black py-2.5 px-4 overflow-hidden">
        <div className="font-mono text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap flex items-center justify-between gap-8 animate-marquee">
          <span>◆ {totalIncidents} INCIDENTS ANALYZED & REGISTERED</span>
          <span>◆ GEMINI AI NLP EXTRACTION</span>
          <span>◆ SCIPY LINEAR SUM OPTIMIZATION</span>
          <span>◆ DETERMINISTIC 0-100 PRIORITY ENGINE</span>
          <span>◆ REAL-TIME DISASTER COORDINATION</span>
          <span>◆ ROURKELA CONTROL HQ</span>
        </div>
      </footer>

    </div>
  );
}
