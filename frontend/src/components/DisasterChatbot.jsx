import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Shield, Sparkles, Phone, AlertCircle } from 'lucide-react';
import { extraService } from '../services/api';

const QUICK_ACTIONS_BY_DISASTER = {
  Flood: ["Flood Evacuation Steps", "Submerged Bridge Safety", "Nearest Safe Shelter"],
  Cyclone: ["Cyclone Wind & Storm Safety", "Power Outage Protocol", "Nearest Storm Shelter"],
  Medical: ["Medical Emergency Protocol", "Trauma & CPR First Aid", "Ambulance Response (108)"],
  Fire: ["Fire Evacuation & Smoke Safety", "Burn First Aid Protocol", "Call Fire Station (101)"],
  "Building Collapse": ["Trapped in Collapse Safety", "Debris Rescue Protocol", "Call Rescue Helpline (1077)"]
};

export default function DisasterChatbot() {
  const [disasterType, setDisasterType] = useState(() => {
    return localStorage.getItem('drishti_last_reported_disaster') || 'Flood';
  });

  const [messages, setMessages] = useState([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: "👋 Hello! I am your AI Emergency Disaster Assistant for Rourkela.\nHow can I guide you? Ask any question or choose an emergency action below.",
      actions: QUICK_ACTIONS_BY_DISASTER[localStorage.getItem('drishti_last_reported_disaster') || 'Flood'],
      contacts: [
        { name: "Emergency Control Desk", number: "1077" },
        { name: "Medical Ambulance", number: "108" }
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to newest message or typing indicator
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleDisasterTypeChange = (newType) => {
    setDisasterType(newType);
    const newActions = QUICK_ACTIONS_BY_DISASTER[newType] || ["Emergency Action Plan", "Nearest Safe Shelter", "Emergency Helplines"];
    // Open a fresh clean chat thread for the new disaster type
    setMessages([
      {
        id: `msg-${Date.now()}-init`,
        sender: 'bot',
        text: `👋 Hello! I am your AI Emergency Disaster Assistant for Rourkela.\nCurrently loaded hazard protocol: ${newType.toUpperCase()}.\nHow can I guide you with ${newType} safety in Sector 6?`,
        actions: newActions,
        contacts: [
          { name: "Emergency Control Desk", number: "1077" },
          { name: "Medical Ambulance", number: "108" }
        ]
      }
    ]);
  };


  const handleSend = async (msgToSend) => {
    const text = msgToSend || inputMsg;
    if (!text.trim()) return;

    const userMsgId = `msg-${Date.now()}-user`;
    const userMessage = { id: userMsgId, sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    if (!msgToSend) setInputMsg('');

    setLoading(true);

    try {
      const res = await extraService.getChatbotGuidance({
        message: text,
        disaster_type: disasterType,
        location: "Sector 6, Rourkela"
      });

      const botMsgId = `msg-${Date.now()}-bot`;
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: res.response,
          actions: res.suggested_actions,
          contacts: res.emergency_contacts
        }
      ]);
      setLiveAnnouncement(`AI Assistant responded: ${res.response?.slice(0, 100)}`);
    } catch (err) {
      console.error("Chatbot error:", err);
      const botMsgId = `msg-${Date.now()}-bot-fallback`;
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: "⚠️ Offline Guidance Protocol:\n1. Move to higher ground immediately.\n2. Do not cross flooded bridges or moving water.\n3. Call District Emergency Control: 1077.",
          actions: ["Find Nearest Shelter", "Call Emergency Helpline 1077"],
          contacts: [{ name: "District Control Room", number: "1077" }]
        }
      ]);
      setLiveAnnouncement("AI Assistant returned emergency fallback instructions.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-tactile-oliveDark text-white p-5 border-2 border-black shadow-[6px_6px_0px_#1E2C1D] flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-tactile-accent text-black rounded border border-black shadow-tactile-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white">AI DISASTER EMERGENCY CHATBOT</h2>
            <p className="text-xs text-gray-300 font-sans">
              Instant step-by-step emergency guidance for citizens in disaster zones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={disasterType}
            onChange={(e) => handleDisasterTypeChange(e.target.value)}
            className="px-3 py-1.5 bg-black text-white border border-white/40 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent cursor-pointer"
          >
            <option value="Flood">Disaster: Flood</option>
            <option value="Cyclone">Disaster: Cyclone</option>
            <option value="Medical">Disaster: Medical</option>
            <option value="Fire">Disaster: Fire</option>
            <option value="Building Collapse">Disaster: Building Collapse</option>
          </select>
          <button
            onClick={() => handleDisasterTypeChange(disasterType)}
            className="px-3 py-1.5 bg-white text-black hover:bg-tactile-accent border border-black text-xs font-bold uppercase transition-colors shadow-tactile-sm"
          >
            NEW CHAT
          </button>
        </div>

      </motion.div>


      {/* Chat Messages Container */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-4 h-[440px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: m.sender === 'user' ? 12 : -12, y: 4 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-8 h-8 rounded bg-tactile-olive text-white flex items-center justify-center font-bold flex-shrink-0 border border-black shadow-sm">
                AI
              </div>
            )}

            <div className={`max-w-xl p-4 border-2 border-black space-y-3 font-sans text-xs shadow-tactile-sm ${
              m.sender === 'user'
                ? 'bg-tactile-accent text-black font-bold'
                : 'bg-tactile-bg text-black'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{m.text ? m.text.replaceAll('**', '') : ''}</p>

              {/* Action Chip Buttons with Stagger */}
              {m.actions && m.actions.length > 0 && (
                <div className="pt-2 border-t border-black/20 flex flex-wrap gap-1.5 font-mono">
                  {m.actions.map((act, aIdx) => (
                    <motion.button
                      key={aIdx}
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                      onClick={() => handleSend(act)}
                      className="px-2.5 py-1 bg-white hover:bg-tactile-accent border border-black text-[11px] font-bold text-black shadow-tactile-sm transition-colors"
                    >
                      {act}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Emergency Contact Badges */}
              {m.contacts && m.contacts.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 font-mono">
                  {m.contacts.map((c, cIdx) => (
                    <motion.a
                      key={cIdx}
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 1 }}
                      href={`tel:${c.number}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold border border-black shadow-sm hover:bg-red-700 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> {c.name}: {c.number}
                    </motion.a>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold flex-shrink-0 border border-black shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {/* 3-Dot Typing Indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded bg-tactile-olive text-white flex items-center justify-center font-bold flex-shrink-0 border border-black">
                AI
              </div>
              <div className="p-3 bg-tactile-bg border-2 border-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tactile-oliveDark animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-tactile-oliveDark animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-tactile-oliveDark animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] font-mono text-gray-600 font-bold ml-2">Consulting emergency protocols...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 font-mono"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask AI: e.g. What to do if water enters my home?"
          className="flex-1 px-4 py-3 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
        />
        <motion.button
          type="submit"
          disabled={loading || !inputMsg.trim()}
          whileHover={!loading && inputMsg.trim() ? { y: -1 } : {}}
          whileTap={!loading && inputMsg.trim() ? { y: 1 } : {}}
          className="px-6 py-3 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-xs uppercase border-2 border-black shadow-tactile flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> SEND
        </motion.button>
      </form>
    </div>
  );
}
