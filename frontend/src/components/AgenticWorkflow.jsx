import React from 'react';
import { motion } from 'motion/react';
import { Brain, Database, FileText, Target, Shield, ClipboardList, CheckCircle2 } from 'lucide-react';
import { containerStagger, itemFadeUp, itemSlideRight, itemSlideLeft } from '../motion/variants';

export default function AgenticWorkflow() {
  const steps = [
    { label: 'RAW DATA', icon: Database, bg: 'bg-[#E2E8E0]' },
    { label: 'AGENT 01: NLP PARSER', icon: FileText, bg: 'bg-[#6DBE5A]' },
    { label: 'AGENT 02: PRIORITY ENGINE', icon: Target, bg: 'bg-[#6DBE5A]' },
    { label: 'AGENT 03: SCIPY MATCHER', icon: Shield, bg: 'bg-[#6DBE5A]' },
    { label: 'AGENT 04: ACTION PLANNER', icon: ClipboardList, bg: 'bg-[#6DBE5A]' },
    { label: 'ACTION PLAN', icon: CheckCircle2, bg: 'bg-[#4EA93B]' },
  ];

  return (
    <div id="agent-workflow" className="w-full bg-transparent py-16 px-4 sm:px-6 text-tactile-border selection:bg-tactile-accent selection:text-black">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-tactile-accent border-2 border-black shadow-tactile-sm mx-auto">
            <Brain className="w-7 h-7 text-black" />
          </div>
          
          <h2 className="font-mono font-black text-4xl sm:text-5xl uppercase tracking-tight text-tactile-border">
            AGENTIC WORKFLOW
          </h2>
          
          <p className="font-mono text-sm sm:text-base text-gray-700 max-w-xl mx-auto">
            Four AI agents transforming raw data into deployment plans.
          </p>
          
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-48 h-1 bg-tactile-accent mx-auto border border-black origin-center"
          />
        </motion.div>

        {/* Top Horizontal Pipeline Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25 }}
          className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 overflow-x-auto"
        >
          <div className="flex items-center justify-between min-w-[700px] gap-4 relative">
            {/* Connecting dashed line with progressive draw */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.1 }}
              className="absolute top-1/2 left-8 right-8 h-0.5 border-t-2 border-dashed border-gray-400 -translate-y-4 z-0 origin-left"
            />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.22, delay: 0.1 + idx * 0.08 }}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <div className={`w-14 h-14 ${step.bg} border-2 border-black shadow-tactile-sm rounded-full flex items-center justify-center transition-transform hover:scale-105`}>
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="px-2 py-0.5 bg-tactile-card border border-black font-mono text-[10px] font-extrabold uppercase text-black text-center whitespace-nowrap">
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Vertical Timeline Container */}
        <div className="relative py-8">
          
          {/* Central Vertical Timeline Track with progressive height growth */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute left-1/2 top-0 bottom-0 w-2 bg-[#6DBE5A] border-x border-black -translate-x-1/2 hidden md:block origin-top"
          />

          <div className="space-y-16">
            
            {/* AGENT 01 (Left Card - Sage Green Background #7AA874) */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="md:text-right md:pr-12"
              >
                <div className="bg-[#7AA874] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 relative overflow-hidden space-y-4 text-left transition-transform hover:-translate-y-0.5">
                  <span className="absolute top-2 right-4 font-mono font-black text-7xl text-black/10 select-none">
                    01
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border-2 border-black shadow-tactile-sm">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-black/80 block">AGENT 01</span>
                      <h3 className="font-mono font-black text-xl text-black uppercase">
                        NLP DESCRIPTION PARSER
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-black font-medium leading-relaxed">
                    Accepts raw incident descriptions in Kannada, Hindi, mixed-language, or broken English and extracts structured incident metadata using Gemini with structured prompting.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] font-extrabold uppercase">
                    <span className="px-2 py-1 bg-white border border-black text-black">GEMINI 2.5 FLASH</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">STRUCTURED PROMPTING</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">MULTILINGUAL NLP</span>
                  </div>

                  <div className="bg-[#EAEFE8] border border-black p-4 font-mono text-xs text-black space-y-2">
                    <div className="text-gray-700 font-bold">→ INPUT</div>
                    <div className="text-gray-900 bg-white p-2 border border-gray-300">
                      Raw text description (any language - Hindi, English, mixed)
                    </div>
                    <div className="text-gray-700 font-bold pt-1">OUTPUT →</div>
                    <div className="text-emerald-900 bg-white p-2 border border-gray-300 font-bold">
                      {`{ incident_type, severity, people_affected, vulnerable_people, urgency }`}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Timeline Node 01 */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-tactile-oliveDark text-tactile-accent border-2 border-black rounded-full font-mono font-bold text-xs flex items-center justify-center shadow-tactile-sm hidden md:flex z-10"
              >
                01
              </motion.div>

              <div />
            </div>

            {/* AGENT 02 (Right Card - Cyan/Blue Card #4ED0E1) */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div />

              {/* Timeline Node 02 */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-tactile-oliveDark text-tactile-accent border-2 border-black rounded-full font-mono font-bold text-xs flex items-center justify-center shadow-tactile-sm hidden md:flex z-10"
              >
                02
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="md:pl-12"
              >
                <div className="bg-[#4ED0E1] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 relative overflow-hidden space-y-4 text-left transition-transform hover:-translate-y-0.5">
                  <span className="absolute top-2 right-4 font-mono font-black text-7xl text-black/10 select-none">
                    02
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border-2 border-black shadow-tactile-sm">
                      <Target className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-black/80 block">AGENT 02</span>
                      <h3 className="font-mono font-black text-xl text-black uppercase">
                        PREDICTION & PRIORITY ENGINE
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-black font-medium leading-relaxed">
                    A transparent 5-factor weighted scoring engine calculating deterministic priority score (0-100) based on severity, headcount, facility proximity, and resource availability.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] font-extrabold uppercase">
                    <span className="px-2 py-1 bg-white border border-black text-black">5-FACTOR WEIGHTED</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">0-100 SCORING</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">EXPLAINABLE BREAKDOWN</span>
                  </div>

                  <div className="bg-[#EAEFE8] border border-black p-4 font-mono text-xs text-black space-y-2">
                    <div className="text-gray-700 font-bold">→ INPUT</div>
                    <div className="text-gray-900 bg-white p-2 border border-gray-300">
                      Extracted JSON: severity, headcount, vulnerability, facility distance
                    </div>
                    <div className="text-gray-700 font-bold pt-1">OUTPUT →</div>
                    <div className="text-blue-900 bg-white p-2 border border-gray-300 font-bold">
                      {`{ priority_score: 92.0, priority_category: "HIGH", score_breakdown }`}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AGENT 03 (Left Card - Light Green Card) */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="md:text-right md:pr-12"
              >
                <div className="bg-[#EAEFE8] border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 relative overflow-hidden space-y-4 text-left transition-transform hover:-translate-y-0.5">
                  <span className="absolute top-2 right-4 font-mono font-black text-7xl text-black/10 select-none">
                    03
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-tactile-accent border-2 border-black shadow-tactile-sm">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-gray-700 block">AGENT 03</span>
                      <h3 className="font-mono font-black text-xl text-black uppercase">
                        SCIPY ALLOCATION DETECTOR
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-gray-800 font-medium leading-relaxed">
                    An optimized spatial allocation engine constructing a Haversine distance matrix and solving global bipartite matching using scipy.optimize.linear_sum_assignment.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] font-extrabold uppercase">
                    <span className="px-2 py-1 bg-white border border-black text-black">HAVERSINE DISTANCE</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">SCIPY.OPTIMIZE</span>
                    <span className="px-2 py-1 bg-white border border-black text-black">BIPARTITE MATCHING</span>
                  </div>

                  <div className="bg-white border border-black p-4 font-mono text-xs text-black space-y-2">
                    <div className="text-gray-700 font-bold">→ INPUT</div>
                    <div className="text-gray-900 bg-[#F4F7F3] p-2 border border-gray-300">
                      Unassigned incidents x Available rescue resources distance matrix
                    </div>
                    <div className="text-gray-700 font-bold pt-1">OUTPUT →</div>
                    <div className="text-purple-900 bg-[#F4F7F3] p-2 border border-gray-300 font-bold">
                      {`{ incident_id, recommended_resource_id, distance_km, match_status }`}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Timeline Node 03 */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-tactile-oliveDark text-tactile-accent border-2 border-black rounded-full font-mono font-bold text-xs flex items-center justify-center shadow-tactile-sm hidden md:flex z-10"
              >
                03
              </motion.div>

              <div />
            </div>

            {/* AGENT 04 (Right Card - Dark Olive Card) */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div />

              {/* Timeline Node 04 */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-tactile-oliveDark text-tactile-accent border-2 border-black rounded-full font-mono font-bold text-xs flex items-center justify-center shadow-tactile-sm hidden md:flex z-10"
              >
                04
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="md:pl-12"
              >
                <div className="bg-[#1E2C1D] text-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 sm:p-8 relative overflow-hidden space-y-4 text-left transition-transform hover:-translate-y-0.5">
                  <span className="absolute top-2 right-4 font-mono font-black text-7xl text-white/10 select-none">
                    04
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-tactile-accent border-2 border-black shadow-tactile-sm">
                      <ClipboardList className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase text-tactile-accent block">AGENT 04</span>
                      <h3 className="font-mono font-black text-xl text-white uppercase">
                        ACTION PLANNER & DISPATCHER
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-gray-300 font-medium leading-relaxed">
                    Generates field-ready deployment plans by combining prediction results with incident context and sending structured response streaming via SSE.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] font-extrabold uppercase">
                    <span className="px-2 py-1 bg-black border border-tactile-accent text-tactile-accent">STREAMING DISPATCH</span>
                    <span className="px-2 py-1 bg-black border border-tactile-accent text-tactile-accent">ACTION PLANNER</span>
                    <span className="px-2 py-1 bg-black border border-tactile-accent text-tactile-accent">REAL-TIME STATES</span>
                  </div>

                  <div className="bg-black/50 border border-white/20 p-4 font-mono text-xs text-white space-y-2">
                    <div className="text-gray-400 font-bold">→ INPUT</div>
                    <div className="text-gray-200 bg-black p-2 border border-white/20">
                      Full incident context: location, priority score, optimal resource match
                    </div>
                    <div className="text-gray-400 font-bold pt-1">OUTPUT →</div>
                    <div className="text-tactile-accent bg-black p-2 border border-white/20 font-bold">
                      Six labeled sections: Officers, Barricades, Diversion, Clearance Time, Escalation Trigger, Public Advisory
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
