import React from 'react';
import { motion } from 'motion/react';
import { GitBranch, Database, Cpu, Terminal, Search, Radio, Shield, ArrowRight, Check } from 'lucide-react';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';

export default function SystemArchitecture({ onNavigate }) {
  const orchestratorAgents = [
    { label: '01 NLP Parser', delay: 0.1 },
    { label: '02 Predictor', delay: 0.2 },
    { label: '03 Anomaly AI', delay: 0.3 },
    { label: '04 Action Planner', delay: 0.4 },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent py-12 px-4 sm:px-6 text-tactile-border selection:bg-tactile-accent selection:text-black">


      <div className="max-w-6xl mx-auto space-y-16">

        {/* Section Header matching Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#162415] text-[#6DBE5A] border-2 border-black shadow-tactile-sm mx-auto">
            <GitBranch className="w-7 h-7 text-[#6DBE5A]" />
          </div>

          <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-tactile-border">
            SYSTEM ARCHITECTURE
          </h2>

          <p className="font-mono text-sm sm:text-base text-gray-700 max-w-xl mx-auto">
            Orchestrating data, predictive models, and autonomous agents.
          </p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-64 h-1 bg-[#6DBE5A] mx-auto border border-black origin-center"
          />
        </motion.div>

        {/* Main System Diagram Box with matching 3-node flowchart layout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-10 space-y-8 relative overflow-hidden"
        >
          {/* Subtle Diagonal Lined Background Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#1E2C1D_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none"></div>

          {/* 3 Flow Nodes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10">

            {/* Node 1: Left Light Green Box (#D4E9D0) */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: 0.15 }}
              className="lg:col-span-3 bg-[#D4E9D0] border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#6DBE5A] border border-black absolute top-3 right-3"></span>

              <div className="w-12 h-12 bg-transparent mx-auto flex items-center justify-center">
                <Database className="w-10 h-10 text-black stroke-[1.8]" />
              </div>

              <h3 className="font-mono font-black text-base text-black uppercase tracking-tight">
                ROURKELA DATASET
              </h3>

              <p className="font-mono text-[11px] text-gray-700 leading-tight">
                8,173 Historical Incidents <br /> + Live Feed
              </p>

              <div className="flex justify-center gap-1.5 pt-2">
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[9px] font-black border border-black">CSV</span>
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[9px] font-black border border-black">API</span>
              </div>
            </motion.div>

            {/* Connecting Arrow 1 */}
            <div className="hidden lg:flex lg:col-span-1 justify-center text-black font-black text-xl">
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </div>

            {/* Node 2: Middle Dark Green Orchestrator Box (#162415) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.2 }}
              className="lg:col-span-4 bg-[#162415] text-white border-2 border-black shadow-tactile p-6 relative space-y-4 text-center"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#6DBE5A] border border-black absolute top-3 right-3"></span>

              <div className="w-12 h-12 bg-transparent mx-auto flex items-center justify-center">
                <Cpu className="w-10 h-10 text-[#6DBE5A] stroke-[1.8]" />
              </div>

              <h3 className="font-mono font-black text-lg text-[#6DBE5A] uppercase tracking-tight">
                AI ORCHESTRATOR
              </h3>

              {/* 4 Agent Grid Chips matching Screenshot */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold pt-2">
                {orchestratorAgents.map((agent, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.3 + agent.delay }}
                    className="p-2 bg-black/60 border border-emerald-500/40 text-emerald-400 hover:border-[#6DBE5A] hover:text-[#6DBE5A] transition-colors text-left font-mono"
                  >
                    {agent.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Connecting Arrow 2 */}
            <div className="hidden lg:flex lg:col-span-1 justify-center text-black font-black text-xl">
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                →
              </motion.span>
            </div>

            {/* Node 3: Right White Live Dashboard Box */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: 0.3 }}
              className="lg:col-span-3 bg-white border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-black absolute top-3 right-3"></span>

              <div className="w-12 h-12 bg-transparent mx-auto flex items-center justify-center">
                <Terminal className="w-10 h-10 text-black stroke-[1.8]" />
              </div>

              <h3 className="font-mono font-black text-base text-black uppercase tracking-tight">
                LIVE DASHBOARD
              </h3>

              <p className="font-mono text-[11px] text-gray-700 leading-tight">
                Map • Alerts • Deployment Plans
              </p>

              <div className="flex justify-center gap-1.5 pt-2">
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[9px] font-black border border-black">SSE</span>
                <span className="px-2 py-0.5 bg-[#6DBE5A] text-black font-mono text-[9px] font-black border border-black">REAL-TIME</span>
              </div>
            </motion.div>

          </div>

          {/* Tech Badges Bar at bottom of diagram matching Screenshot */}
          <div className="pt-6 border-t-2 border-dashed border-gray-300 flex flex-wrap justify-center gap-2 font-mono text-xs font-bold relative z-10">
            {['FASTAPI', 'GEMINI NLP', 'PRIORITY SCORING ENGINE', 'SCIPY OPTIMIZE', 'REACT.JS', 'LEAFLET / PYDECK', 'SSE STREAMING'].map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-[#EAEFE8] border border-black hover:bg-white transition-colors">
                {tech}
              </span>
            ))}
          </div>

        </motion.div>

        {/* Section 2: Core Capabilities Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-mono font-bold text-sm uppercase text-tactile-border">
            <span className="p-1 bg-[#6DBE5A] border border-black text-black">⚙️</span>
            CORE CAPABILITIES
            <div className="flex-1 h-0.5 bg-gray-300 ml-2"></div>
          </div>

          <StaggerContainer stagger={0.06} className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Capability Card 1 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[10px] font-bold">SYS_01</span>
                <Search className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                PREDICTIVE INTELLIGENCE
              </h3>

              <ul className="space-y-2 font-mono text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Priority Classification
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Explainable Score Breakdown
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Sub-100ms Inference
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> 5 Feature Component Scores
                </li>
              </ul>
            </StaggerItem>

            {/* Capability Card 2 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[10px] font-bold">SYS_02</span>
                <Radio className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                REAL-TIME ANOMALY DETECTION
              </h3>

              <ul className="space-y-2 font-mono text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Facility Proximity Index
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> PyDeck 3D Heatmap
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> High-Priority Flash Alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Radius Buffer Evaluation
                </li>
              </ul>
            </StaggerItem>

            {/* Capability Card 3 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#162415] text-[#6DBE5A] font-mono text-[10px] font-bold">SYS_03</span>
                <Shield className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                AUTOMATED RESPONSE PLANS
              </h3>

              <ul className="space-y-2 font-mono text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> SciPy linear_sum_assignment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Haversine Distance Matrix
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> Dynamic Resource States
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6DBE5A] flex-shrink-0" /> PyDeck Dispatch Visualization
                </li>
              </ul>
            </StaggerItem>

          </StaggerContainer>
        </div>

        {/* CTA Action Banner */}
        <motion.div
          onClick={() => onNavigate && onNavigate('queue')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-[#6DBE5A] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition-transform"
        >
          <div>
            <h3 className="font-mono font-black text-2xl uppercase text-black">
              EXPERIENCE THE ARCHITECTURE
            </h3>
            <p className="font-mono text-xs text-black/80 font-bold mt-1">
              Launch the live authority dashboard and execute SciPy matching in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 px-6 py-3 bg-black text-white font-mono font-black text-sm uppercase border-2 border-black shadow-tactile-sm">
            LAUNCH DASHBOARD
            <ArrowRight className="w-4 h-4 text-[#6DBE5A]" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
