import React from 'react';
import { GitBranch, Database, Cpu, Layout, Search, Radio, Shield, ArrowRight, Check } from 'lucide-react';

export default function SystemArchitecture({ onNavigate }) {
  return (
    <div className="w-full bg-tactile-bg tactile-grid-bg py-12 px-4 sm:px-6 text-tactile-border selection:bg-tactile-accent selection:text-black">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header matching Screenshot 1 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-tactile-accent border-2 border-black shadow-tactile-sm mx-auto">
            <GitBranch className="w-7 h-7 text-black" />
          </div>
          
          <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-tactile-border">
            SYSTEM ARCHITECTURE
          </h2>
          
          <p className="font-mono text-sm sm:text-base text-gray-700 max-w-xl mx-auto">
            Orchestrating data, predictive models, and autonomous agents.
          </p>
          
          <div className="w-48 h-1 bg-tactile-accent mx-auto border border-black"></div>
        </div>

        {/* Main System Diagram Box matching Screenshot 1 */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-10 space-y-8">
          
          {/* 3 Flow Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Node 1: Left Light Green Box */}
            <div className="md:col-span-4 bg-[#D4E8CE] border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center">
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
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex justify-center text-tactile-olive font-black text-2xl">
              →
            </div>

            {/* Node 2: Middle Dark Green Orchestrator Box */}
            <div className="md:col-span-4 bg-[#1E2C1D] text-white border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center">
              <span className="w-3 h-3 rounded-full bg-tactile-accent border border-black absolute top-3 right-3 animate-ping"></span>
              <Cpu className="w-10 h-10 text-tactile-accent mx-auto" />
              
              <h3 className="font-mono font-black text-lg text-tactile-accent uppercase">
                AI ORCHESTRATOR
              </h3>
              
              {/* 4 Agent Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold pt-2">
                <div className="p-2 bg-black border border-white/20 text-tactile-accent">01 NLP Parser</div>
                <div className="p-2 bg-black border border-white/20 text-tactile-accent">02 Predictor</div>
                <div className="p-2 bg-black border border-white/20 text-tactile-accent">03 SciPy Matcher</div>
                <div className="p-2 bg-black border border-white/20 text-tactile-accent">04 Action Planner</div>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex justify-center text-tactile-olive font-black text-2xl">
              →
            </div>

            {/* Node 3: Right Live Dashboard Box */}
            <div className="md:col-span-3 bg-white border-2 border-black shadow-tactile-sm p-6 relative space-y-4 text-center">
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
            </div>

          </div>

          {/* Tech Badges Bar at bottom of diagram */}
          <div className="pt-6 border-t-2 border-dashed border-gray-300 flex flex-wrap justify-center gap-2 font-mono text-xs font-bold">
            <span className="px-3 py-1 bg-tactile-card border border-black">FASTAPI</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">GEMINI NLP</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">PRIORITY SCORING ENGINE</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">SCIPY OPTIMIZE</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">REACT.JS</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">LEAFLET / PYDECK</span>
            <span className="px-3 py-1 bg-tactile-card border border-black">STREAMLIT</span>
          </div>

        </div>

        {/* Section 2: Core Capabilities Grid matching Screenshot 2 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-mono font-bold text-sm uppercase text-tactile-border">
            <span className="p-1 bg-tactile-accent border border-black text-black">⚙️</span>
            CORE CAPABILITIES
            <div className="flex-1 h-0.5 bg-gray-300 ml-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Capability Card 1 */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
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
            </div>

            {/* Capability Card 2 */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
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
            </div>

            {/* Capability Card 3 */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
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
            </div>

          </div>
        </div>

        {/* Section 3: Action Banner matching Screenshot 3 */}
        <div 
          onClick={() => onNavigate && onNavigate('queue')}
          className="bg-tactile-accent border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 flex flex-wrap items-center justify-between cursor-pointer hover:bg-emerald-400 transition"
        >
          <div>
            <h3 className="font-mono font-black text-2xl sm:text-3xl text-black uppercase">
              EXPERIENCE THE ARCHITECTURE →
            </h3>
            <p className="font-mono text-xs text-black/80 mt-1">
              See the predictive priority models, NLP parser, and SciPy optimizer in action.
            </p>
          </div>

          <div className="w-12 h-12 bg-white border-2 border-black shadow-tactile-sm flex items-center justify-center mt-4 sm:mt-0">
            <ArrowRight className="w-6 h-6 text-black" />
          </div>
        </div>

      </div>
    </div>
  );
}
