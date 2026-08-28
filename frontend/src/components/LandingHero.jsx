import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowDown, Database, Cpu, Brain, ShieldCheck } from 'lucide-react';
import AgenticWorkflow from './AgenticWorkflow';
import AnimatedNumber from './motion/AnimatedNumber';
import Marquee from './motion/Marquee';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { wipeX, scaleReveal, itemFadeUp } from '../motion/variants';

export default function LandingHero({ onNavigate, activeTab, totalIncidents = 5 }) {
  const navTabs = [
    { id: 'landing', label: 'HOME' },
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
    <div className="w-full min-h-screen bg-transparent text-tactile-border flex flex-col justify-between selection:bg-tactile-accent selection:text-black">
      
      {/* Top Navbar Header matching Image 2 (Bigger Width & Height) */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-black px-6 py-4 flex items-center justify-center sticky top-0 z-50 shadow-sm">
        <nav className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap w-full max-w-7xl mx-auto" aria-label="Landing Navigation">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-6 py-2.5 font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-black transition-transform shadow-[4px_4px_0px_#1E2C1D] hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-[#6DBE5A] text-black'
                    : 'bg-white text-black hover:bg-[#6DBE5A] hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>



      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        {/* Main Grid: Left Hero Main Card + Right Brain Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Hero Main Card */}
          <StaggerContainer
            stagger={0.06}
            className="lg:col-span-8 bg-[#EAEFE8] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-10 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-6">
              {/* Operational Status Pill */}
              <StaggerItem>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E2C1D] text-white border border-black font-mono text-xs font-bold uppercase tracking-wider">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-tactile-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tactile-accent"></span>
                  </span>
                  SYSTEM STATUS: OPERATIONAL
                </div>
              </StaggerItem>

              {/* Stacked Heading with Wipe */}
              <StaggerItem className="font-mono font-black text-3xl sm:text-5xl lg:text-6xl text-tactile-border leading-[1.1] tracking-tight uppercase">
                <div>DISASTER RESPONSE</div>
                <motion.div
                  variants={wipeX}
                  initial="initial"
                  animate="animate"
                  className="inline-block bg-tactile-accent text-black px-3 py-1 mt-1 border-2 border-black shadow-tactile-sm"
                >
                  INTELLIGENCE
                </motion.div>
                <div className="mt-1">ROURKELA ZONE</div>
              </StaggerItem>

              {/* Subtitle Paragraph */}
              <StaggerItem>
                <p className="font-sans text-sm sm:text-base text-gray-800 leading-relaxed max-w-2xl font-medium">
                  Four autonomous AI agents transform raw disaster incident reports into predictive priority scores and deployment-ready action plans — in real time.
                </p>
              </StaggerItem>

              {/* Technical Meta Tag */}
              <StaggerItem>
                <div className="font-mono text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-1.5">
                  <span>AGENTIC AI PLATFORM // </span>
                  <AnimatedNumber value={totalIncidents} className="text-black font-black" />
                  <span> INCIDENTS REGISTERED // ROURKELA DISASTER DATASET</span>
                </div>
              </StaggerItem>
            </div>

            {/* Action Buttons */}
            <StaggerItem className="flex flex-wrap gap-4 pt-4">
              <motion.button
                onClick={() => onNavigate('queue')}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                className="group flex items-center justify-center gap-3 px-6 py-3.5 bg-tactile-accent hover:bg-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition-colors"
              >
                LAUNCH DASHBOARD
                <motion.span
                  className="inline-block"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </motion.button>

              <motion.button
                onClick={handleExploreWorkflow}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                className="group flex items-center justify-center gap-3 px-6 py-3.5 bg-[#E2E8E0] hover:bg-white text-black font-mono font-bold text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition-colors"
              >
                EXPLORE AGENTIC WORKFLOW
                <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
              </motion.button>

              <motion.button
                onClick={() => onNavigate('report')}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1E2C1D] hover:bg-tactile-olive text-white font-mono font-bold text-sm uppercase tracking-wider border-2 border-black shadow-tactile transition-colors"
              >
                SUBMIT CITIZEN REPORT
                <ShieldCheck className="w-5 h-5 text-tactile-accent" />
              </motion.button>
            </StaggerItem>
          </StaggerContainer>

          {/* Right Column: Big Green Graphic Card + Stat Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
            
            {/* Big Green Brain Graphic Card with subtle ambient hover */}
            <motion.div
              variants={scaleReveal}
              initial="initial"
              animate="animate"
              className="flex-1 bg-tactile-accent border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-8 flex items-center justify-center min-h-[260px] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#1E2C1D_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <Brain className="w-32 h-32 sm:w-40 sm:h-40 text-black stroke-[1.5] transition-transform duration-300 group-hover:scale-105" />
              </motion.div>
            </motion.div>

            {/* Bottom Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Stat 1: Real Incident Count with AnimatedNumber */}
              <motion.div
                variants={itemFadeUp}
                initial="initial"
                animate="animate"
                className="bg-[#EAEFE8] border-2 border-black shadow-tactile p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-tactile-olive" />
                  <span className="relative flex h-2 w-2">
                    <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-tactile-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tactile-accent"></span>
                  </span>
                </div>
                <div className="font-mono font-black text-2xl sm:text-3xl text-black pt-2">
                  <AnimatedNumber value={totalIncidents} />
                </div>
                <div className="font-mono text-[10px] font-bold uppercase text-gray-600 leading-tight">
                  INCIDENTS ANALYZED & PROCESSED
                </div>
              </motion.div>

              {/* Stat 2: 4 AI Agents */}
              <motion.div
                variants={itemFadeUp}
                initial="initial"
                animate="animate"
                className="bg-[#1E2C1D] text-white border-2 border-black shadow-tactile p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Cpu className="w-5 h-5 text-tactile-accent" />
                </div>
                <div className="font-mono font-black text-2xl sm:text-3xl text-tactile-accent pt-2">
                  <AnimatedNumber value={4} />
                </div>
                <div className="font-mono text-[10px] font-bold uppercase text-gray-300 leading-tight">
                  AI AGENTS & ENGINES
                </div>
              </motion.div>

            </div>

          </div>

        </div>

      </div>

      {/* EXPLORE PLATFORM Bento Grid Section matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E2C1D] text-tactile-accent border-2 border-black flex items-center justify-center font-black text-sm">
              ↓
            </div>
            <h3 className="font-black text-2xl uppercase tracking-tight text-black">
              EXPLORE PLATFORM
            </h3>
            <div className="hidden sm:block h-0.5 w-48 bg-black"></div>
          </div>

          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            // NAVIGATION
          </span>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 01: System Architecture (Tall Dark Green Card #162415) */}
          <motion.div
            onClick={() => onNavigate('architecture')}
            whileHover={{ y: -3 }}
            className="md:col-span-4 bg-[#162415] text-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 flex flex-col justify-between space-y-8 cursor-pointer group"
          >
            <div className="space-y-6">
              <span className="px-2.5 py-1 bg-tactile-accent text-black font-mono font-black text-xs uppercase border border-black inline-block">
                01
              </span>

              <h3 className="font-mono font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
                SYSTEM <br />
                <span className="text-tactile-accent">ARCHITECTURE</span>
              </h3>

              <p className="font-mono text-xs sm:text-sm text-gray-300 leading-relaxed">
                How the platform transforms raw data into actionable intelligence.
              </p>
            </div>

            <div className="pt-6 border-t border-white/20 flex items-center justify-between font-mono text-xs font-bold">
              <span className="text-gray-300 group-hover:text-tactile-accent transition-colors">
                View Architecture
              </span>
              <div className="w-10 h-10 bg-tactile-accent text-black border border-black flex items-center justify-center font-black text-base shadow-tactile-sm group-hover:bg-emerald-400 transition-transform group-hover:translate-x-1">
                →
              </div>
            </div>
          </motion.div>

          {/* Middle Column: Card 02 (AI Agent Workflow) & Card 03 (Data Pipeline) */}
          <div className="md:col-span-4 flex flex-col gap-6 justify-between">
            
            {/* Card 02: AI Agent Workflow (Bright Green Card #6DBE5A) */}
            <motion.div
              onClick={handleExploreWorkflow}
              whileHover={{ y: -3 }}
              className="flex-1 bg-[#6DBE5A] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-black text-white font-mono font-black text-xs uppercase">
                  02
                </span>
                <Brain className="w-8 h-8 text-black" />
              </div>

              <div>
                <h4 className="font-mono font-black text-xl text-black uppercase leading-tight">
                  AI AGENT WORKFLOW
                </h4>
                <p className="font-mono text-xs text-black/80 font-bold mt-1">
                  4 Autonomous Agents
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono font-black text-xl text-black inline-block transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </div>
            </motion.div>

            {/* Card 03: Data Pipeline (White Card) */}
            <motion.div
              onClick={() => onNavigate('pipeline')}
              whileHover={{ y: -3 }}
              className="flex-1 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-tactile-accent text-black font-mono font-black text-xs uppercase border border-black">
                  03
                </span>
                <span className="font-mono font-bold text-gray-400 text-sm">{`>_`}</span>
              </div>

              <div>
                <h4 className="font-mono font-black text-xl text-black uppercase leading-tight">
                  DATA<span className="text-tactile-accent">PIPELINE</span>
                </h4>
                <p className="font-mono text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  DATASET • FEATURES • MODELS
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Card 04 (Live Dashboard) & Digital Clock */}
          <div className="md:col-span-4 flex flex-col gap-6 justify-between">
            
            {/* Card 04: Live Dashboard (Light Cyan Card #8ADEE0) */}
            <motion.div
              onClick={() => onNavigate('queue')}
              whileHover={{ y: -3 }}
              className="flex-1 bg-[#8ADEE0] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 bg-black text-white font-mono font-black text-xs uppercase">
                  LIVE
                </span>
                <ShieldCheck className="w-6 h-6 text-black/60" />
              </div>

              <div>
                <h4 className="font-mono font-black text-2xl text-black uppercase leading-tight">
                  LIVE <br /> DASHBOARD
                </h4>
                <p className="font-mono text-[11px] font-bold text-black/70 mt-2">
                  • Map • Incidents • Analytics
                </p>
              </div>
            </motion.div>

            {/* Digital LED Clock Card (Dark Green #162415) */}
            <div className="flex-1 bg-[#162415] text-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 flex flex-col justify-between space-y-2">
              <div className="font-mono text-[10px] font-bold text-tactile-accent uppercase tracking-widest">
                SYSTEM TIME • GMT+5:30 • 24H
              </div>
              <DigitalClock />
            </div>

          </div>

        </div>

        {/* Bottom Banner: Ready to Deploy matching Screenshot 1 */}
        <motion.div
          onClick={() => onNavigate('queue')}
          whileHover={{ y: -2 }}
          className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tactile-accent border-2 border-black shadow-tactile-sm">
              <Brain className="w-7 h-7 text-black" />
            </div>
            <div>
              <h4 className="font-mono font-black text-xl text-black uppercase">
                READY TO DEPLOY
              </h4>
              <p className="font-mono text-xs text-gray-600 font-medium">
                Launch the live dashboard — Map, Incidents, Anomaly Monitor, and Action Plans.
              </p>
            </div>
          </div>

          <div className="w-12 h-12 bg-tactile-accent text-black border-2 border-black flex items-center justify-center font-black text-xl shadow-tactile-sm group-hover:bg-emerald-400 transition-transform group-hover:translate-x-1">
            →
          </div>
        </motion.div>

      </div>

      {/* Agentic Workflow Visual Section */}
      <AgenticWorkflow />

      {/* Seamless Marquee Ticker at Bottom - Broader, Taller, & Bolder */}
      <footer className="w-full bg-tactile-accent border-t-4 border-black py-5 sm:py-6 px-6 overflow-hidden shadow-lg">
        <Marquee speed={28} className="font-mono text-sm sm:text-base font-black text-black uppercase tracking-widest">
          <div className="flex items-center gap-10 sm:gap-14 px-6 whitespace-nowrap">
            <span>◆ {totalIncidents} INCIDENTS ANALYZED & REGISTERED</span>
            <span>◆ GEMINI AI NLP EXTRACTION</span>
            <span>◆ SCIPY LINEAR SUM OPTIMIZATION</span>
            <span>◆ DETERMINISTIC 0-100 PRIORITY ENGINE</span>
            <span>◆ REAL-TIME DISASTER COORDINATION</span>
            <span>◆ ROURKELA CONTROL HQ</span>
          </div>
        </Marquee>
      </footer>


    </div>
  );
}

// Digital Dot-Matrix LED Clock Helper Component
function DigitalClock() {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono font-black text-4xl sm:text-5xl tracking-widest text-[#6DBE5A] select-none py-1">
      {timeStr || '09:15'}
    </div>
  );
}

