import React, { useState } from 'react';
import { Bot, Send, User, Shield, Sparkles, Phone, AlertCircle } from 'lucide-react';
import { extraService } from '../services/api';

export default function DisasterChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hello! I am your AI Emergency Disaster Assistant for Rourkela.\nHow can I guide you? You can ask about flood safety, evacuation steps, medical emergencies, or nearest shelters.",

      actions: ["Flood Evacuation Steps", "Medical Emergency Protocol", "Nearest Safe Shelter"],
      contacts: [
        { name: "Emergency Control Desk", number: "1077" },
        { name: "Medical Ambulance", number: "108" }
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [disasterType, setDisasterType] = useState('Flood');
  const [loading, setLoading] = useState(false);

  const handleSend = async (msgToSend) => {
    const text = msgToSend || inputMsg;
    if (!text.trim()) return;

    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    if (!msgToSend) setInputMsg('');

    setLoading(true);

    try {
      const res = await extraService.getChatbotGuidance({
        message: text,
        disaster_type: disasterType,
        location: "Sector 6, Rourkela"
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.response,
          actions: res.suggested_actions,
          contacts: res.emergency_contacts
        }
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠️ **Offline Guidance Protocol**:\n1. Move to higher ground immediately.\n2. Do not cross flooded bridges or moving water.\n3. Call District Emergency Control: **1077**.",
          actions: ["Find Nearest Shelter", "Call Emergency Helpline 1077"],
          contacts: [{ name: "District Control Room", number: "1077" }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Header */}
      <div className="bg-tactile-oliveDark text-white p-5 border-2 border-black shadow-[6px_6px_0px_#1E2C1D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-tactile-accent text-black rounded">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white">AI DISASTER EMERGENCY CHATBOT</h2>
            <p className="text-xs text-gray-300 font-sans">
              Instant step-by-step emergency guidance for citizens in disaster zones.
            </p>
          </div>
        </div>

        <select
          value={disasterType}
          onChange={(e) => setDisasterType(e.target.value)}
          className="px-3 py-1.5 bg-black text-white border border-white/40 text-xs font-bold focus:outline-none"
        >
          <option value="Flood">Disaster: Flood</option>
          <option value="Cyclone">Disaster: Cyclone</option>
          <option value="Medical">Disaster: Medical</option>
          <option value="Fire">Disaster: Fire</option>
        </select>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-4 h-[420px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {m.sender === 'bot' && (
              <div className="w-8 h-8 rounded bg-tactile-olive text-white flex items-center justify-center font-bold flex-shrink-0">
                AI
              </div>
            )}

            <div className={`max-w-xl p-4 border-2 border-black space-y-3 font-sans text-xs ${
              m.sender === 'user'
                ? 'bg-tactile-accent text-black font-bold'
                : 'bg-tactile-bg text-black'
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{m.text ? m.text.replaceAll('**', '') : ''}</p>


              {/* Action Chip Buttons */}
              {m.actions && m.actions.length > 0 && (
                <div className="pt-2 border-t border-black/20 flex flex-wrap gap-1.5 font-mono">
                  {m.actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(act)}
                      className="px-2.5 py-1 bg-white hover:bg-tactile-accent border border-black text-[11px] font-bold text-black shadow-tactile-sm transition"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}

              {/* Emergency Contact Badges */}
              {m.contacts && m.contacts.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 font-mono">
                  {m.contacts.map((c, cIdx) => (
                    <a
                      key={cIdx}
                      href={`tel:${c.number}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold border border-black"
                    >
                      <Phone className="w-3 h-3" /> {c.name}: {c.number}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 p-2">
            <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            AI Assistant thinking...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 font-mono"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask AI: e.g. What to do if water enters my home?"
          className="flex-1 px-4 py-3 border-2 border-black bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-xs uppercase border-2 border-black shadow-tactile flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4" /> SEND
        </button>
      </form>
    </div>
  );
}
