import React from 'react';
import { motion } from 'motion/react';
import { GitBranch, Database, Cpu, Layout, Search, Radio, Shield, ArrowRight, Check } from 'lucide-react';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { itemFadeUp, scaleReveal } from '../motion/variants';

export default function SystemArchitecture({ onNavigate }) {
  const orchestratorAgents = [
    { label: '01 NLP Parser', delay: 0.15 },
    { label: '02 Predictor', delay: 0.25 },
    { label: '03 SciPy Matcher', delay: 0.35 },
    { label: '04 Action Planner', delay: 0.45 },
  ];

  return (
    <div className="w-full bg-tactile-bg tactile-grid-bg py-12 px-4 sm:px-6 text-tactile-border selection:bg-tactile-accent selection:text-black">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-tactile-accent border-2 border-black shadow-tactile-sm mx-auto">
            <GitBranch className="w-7 h-7 text-black" />
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
            className="w-48 h-1 bg-tactile-accent mx-auto border border-black origin-center"
          />
        </motion.div>

        {/* Main System Diagram Box with sequential flow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-10 space-y-8"
        >
          
          {/* 3 Flow Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Node 1: Left Light Green Box */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: 0.15 }}
              className="md:col-span-4 bg-[#D4E8CE] border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center"
            >
              <span className="w-3 h-3 rounded-full bg-tactile-accent border border-black absolute top-3 right-3"></span>
              <Database className="w-10 h-10 text-tactile-olive mx-auto" />
              
              <h3 className="font-mono font-black text-lg text-black uppercase">
                ROURKELA DATASET
              </h3>
              
              <p className="font-mono text-xs text-gray-700">
                8,173 Historical Incidents + Live Citizen Feed
              </p>
              
              <div className="flex justify-center gap-2 pt-2">
                <span className="px-2 py-0.5 bg-[#1E2C1D] text-white font-mono text-[10px] font-bold">CSV</span>
                <span className="px-2 py-0.5 bg-[#1E2C1D] text-white font-mono text-[10px] font-bold">API</span>
              </div>
            </motion.div>

            {/* Arrow 1 with subtle pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.25 }}
              className="hidden md:flex justify-center text-tactile-olive font-black text-2xl"
            >
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.div>

            {/* Node 2: Middle Dark Green Orchestrator Box */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.2 }}
              className="md:col-span-4 bg-[#1E2C1D] text-white border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center"
            >
              <span className="relative flex h-3 w-3 absolute top-3 right-3">
                <span className="animate-radar absolute inline-flex h-full w-full rounded-full bg-tactile-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-tactile-accent border border-black"></span>
              </span>
              <Cpu className="w-10 h-10 text-tactile-accent mx-auto" />
              
              <h3 className="font-mono font-black text-lg text-tactile-accent uppercase">
                AI ORCHESTRATOR
              </h3>
              
              {/* 4 Agent Grid with brief sequential activation */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold pt-2">
                {orchestratorAgents.map((agent, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.3 + agent.delay }}
                    className="p-2 bg-black border border-white/20 text-tactile-accent hover:border-tactile-accent transition-colors"
                  >
                    {agent.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Arrow 2 with subtle pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.35 }}
              className="hidden md:flex justify-center text-tactile-olive font-black text-2xl"
            >
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                →
              </motion.span>
            </motion.div>

            {/* Node 3: Right Live Dashboard Box */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: 0.3 }}
              className="md:col-span-3 bg-white border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center"
            >
              <span className="w-3 h-3 rounded-full bg-cyan-400 border border-black absolute top-3 right-3"></span>
              <Layout className="w-10 h-10 text-black mx-auto" />
              
              <h3 className="font-mono font-black text-lg text-black uppercase">
                LIVE DASHBOARD
              </h3>
              
              <p className="font-mono text-xs text-gray-700">
                PyDeck Map • Priority Queue • Dispatch
              </p>
              
              <div className="flex justify-center gap-2 pt-2">
                <span className="px-2 py-0.5 bg-black text-tactile-accent font-mono text-[10px] font-bold">SSE</span>
                <span className="px-2 py-0.5 bg-tactile-accent text-black font-mono text-[10px] font-bold">REAL-TIME</span>
              </div>
            </motion.div>

          </div>

          {/* Tech Badges Bar at bottom of diagram */}
          <div className="pt-6 border-t-2 border-dashed border-gray-300 flex flex-wrap justify-center gap-2 font-mono text-xs font-bold">
            {['FASTAPI', 'GEMINI NLP', 'PRIORITY SCORING ENGINE', 'SCIPY OPTIMIZE', 'REACT.JS', 'LEAFLET / PYDECK', 'STREAMLIT'].map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-tactile-card border border-black hover:bg-white transition-colors">
                {tech}
              </span>
            ))}
          </div>

        </motion.div>

        {/* Section 2: Core Capabilities Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-mono font-bold text-sm uppercase text-tactile-border">
            <span className="p-1 bg-tactile-accent border border-black text-black">⚙️</span>
            CORE CAPABILITIES
            <div className="flex-1 h-0.5 bg-gray-300 ml-2"></div>
          </div>

          <StaggerContainer stagger={0.06} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Capability Card 1 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-[10px] font-bold">SYS_01</span>
                <Search className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                PREDICTIVE INTELLIGENCE
              </h3>

              <p className="font-sans text-xs text-gray-700 leading-relaxed font-medium">
                Deterministic Priority Engine & Gemini AI parsing classify incident priority and calculate transparent 0-100 scores giving authorities advance warning before disaster escalates.
              </p>

              <div className="space-y-2 pt-2 font-mono text-xs text-black">
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Priority Classification
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Score Breakdown Transparency
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Sub-100ms Inference
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> 5 Weighted Feature Components
                </div>
              </div>
            </StaggerItem>

            {/* Capability Card 2 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-[10px] font-bold">SYS_02</span>
                <Radio className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                REAL-TIME ANOMALY DETECTION
              </h3>

              <p className="font-sans text-xs text-gray-700 leading-relaxed font-medium">
                Haversine Distance Engine continuously monitors proximity to critical facilities (Hospitals, Bridges, Schools) to flag risks before they become crises.
              </p>

              <div className="space-y-2 pt-2 font-mono text-xs text-black">
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Facility Proximity Distance
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> 3D PyDeck Heatmap Scoring
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> High Priority Alert Triggers
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Radius Buffer Polygon Integration
                </div>
              </div>
            </StaggerItem>

            {/* Capability Card 3 */}
            <StaggerItem className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1E2C1D]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-tactile-oliveDark text-white font-mono text-[10px] font-bold">SYS_03</span>
                <Shield className="w-5 h-5 text-black" />
              </div>

              <h3 className="font-mono font-black text-base uppercase text-black">
                AUTOMATED RESPONSE PLANS
              </h3>

              <p className="font-sans text-xs text-gray-700 leading-relaxed font-medium">
                SciPy bipartite optimization calculates globally optimal rescue team assignments and streams field-ready deployment plans specifying team capabilities and ETAs.
              </p>

              <div className="space-y-2 pt-2 font-mono text-xs text-black">
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> SciPy linear_sum_assignment
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Transparent Score Breakdown
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Dynamic Resource State Transitions
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tactile-accent font-bold">⚡</span> Real-Time PyDeck Dispatch
                </div>
              </div>
            </StaggerItem>

          </StaggerContainer>
        </div>

        {/* Section 3: Action Banner with hover motion */}
        <motion.div 
          onClick={() => onNavigate && onNavigate('queue')}
          whileHover={{ y: -2 }}
          whileTap={{ y: 1 }}
          className="group bg-tactile-accent border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 flex flex-wrap items-center justify-between cursor-pointer hover:bg-emerald-400 transition-colors"
        >
          <div>
            <h3 className="font-mono font-black text-2xl sm:text-3xl text-black uppercase">
              EXPERIENCE THE ARCHITECTURE →
            </h3>
            <p className="font-mono text-xs text-black/80 mt-1">
              See the predictive priority models, NLP parser, and SciPy optimizer in action.
            </p>
          </div>

          <div className="w-12 h-12 bg-white border-2 border-black shadow-tactile-sm flex items-center justify-center mt-4 sm:mt-0 transition-transform group-hover:translate-x-1">
            <ArrowRight className="w-6 h-6 text-black" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
