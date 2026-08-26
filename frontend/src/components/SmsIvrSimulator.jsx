import React, { useState } from 'react';
import { PhoneCall, MessageSquare, SignalHigh, Check, Phone, ShieldCheck } from 'lucide-react';

export default function SmsIvrSimulator() {
  const [mode, setMode] = useState('SMS'); // SMS or IVR
  const [smsText, setSmsText] = useState('RESCUE FLOOD Sector 6 Rourkela 4 people trapped near temple');
  const [phoneNum, setPhoneNum] = useState('+91 94031 54066');
  const [sentLog, setSentLog] = useState([]);
  const [ivrStep, setIvrStep] = useState(0);

  const handleSendSms = (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      mode: 'SMS',
      from: phoneNum,
      to: '1912 (Disaster SMS Gateway)',
      text: smsText,
      status: 'DELIVERED (GATEWAY VERIFIED)',
      reply: '✅ SMS ACKNOWLEDGED by ODRAF Control. Incident #INC-SMS-804 registered. Priority: HIGH.'
    };

    setSentLog([logEntry, ...sentLog]);
    setSmsText('');
  };

  const ivrOptions = [
    { text: "Welcome to Odisha Disaster Helpline 1077 / 1912. Press 1 for Flood Emergency, Press 2 for Medical Ambulance.", option: 1 },
    { text: "You selected FLOOD EMERGENCY. Speak your area or press 6 for Rourkela Sector 6.", option: 2 },
    { text: "Rourkela Sector 6 Recorded. Press 1 if people are trapped, Press 2 for food & shelter.", option: 3 },
    { text: "✅ IVR DISPATCH VERIFIED. ODRAF Rescue Boat Unit 01 dispatched to Sector 6. Stay on roof.", option: 4 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Top Banner */}
      <div className="bg-tactile-oliveDark text-white p-6 border-2 border-black shadow-[6px_6px_0px_#1E2C1D] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-amber-400 text-black font-black text-xs uppercase">
            OFFLINE NETWORK PROTOCOL
          </span>
          <h2 className="text-2xl font-black mt-2 flex items-center gap-2">
            <SignalHigh className="w-6 h-6 text-tactile-accent" />
            SMS & IVR EMERGENCY GATEWAY SIMULATOR
          </h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Allows citizens to register disaster incidents and receive warnings via standard SMS (1912) and IVR Phone Call (1077) even without mobile internet.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-black/40 p-1 border border-white/20">
          <button
            onClick={() => setMode('SMS')}
            className={`px-4 py-2 text-xs font-black transition ${mode === 'SMS' ? 'bg-tactile-accent text-black' : 'text-white hover:bg-white/10'}`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" /> SMS GATEWAY (1912)
          </button>
          <button
            onClick={() => setMode('IVR')}
            className={`px-4 py-2 text-xs font-black transition ${mode === 'IVR' ? 'bg-tactile-accent text-black' : 'text-white hover:bg-white/10'}`}
          >
            <PhoneCall className="w-4 h-4 inline mr-1" /> IVR CALL (1077)
          </button>
        </div>
      </div>

      {mode === 'SMS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SMS Simulator Form */}
          <div className="lg:col-span-6 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-tactile-olive" /> SIMULATE OFFLINE SMS REPORT
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                SMS GATEWAY 1912 ACTIVE
              </span>
            </div>

            <form onSubmit={handleSendSms} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">CITIZEN MOBILE NUMBER</label>
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">SMS TEXT CONTENT</label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-tactile-accent"
                  placeholder="e.g. RESCUE FLOOD Sector 6 4 people trapped"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-tactile-accent hover:bg-emerald-400 text-black font-black text-xs uppercase border-2 border-black shadow-tactile transition"
              >
                TRANSMIT SMS REPORT OVER CELL TOWER →
              </button>
            </form>
          </div>

          {/* SMS Audit Log */}
          <div className="lg:col-span-6 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
            <h3 className="font-black text-sm uppercase border-b-2 border-black pb-2">
              SMS TRANSMISSION LOG ({sentLog.length})
            </h3>

            {sentLog.length === 0 ? (
              <p className="text-xs text-gray-500 font-sans italic text-center py-8">
                No offline SMS messages transmitted yet. Try sending an SMS on the left!
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {sentLog.map((log, idx) => (
                  <div key={idx} className="p-3 bg-tactile-bg border-2 border-black space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                      <span>From: {log.from}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="font-bold text-black font-sans">"{log.text}"</p>
                    <div className="p-2 bg-emerald-100 border border-emerald-700 text-emerald-900 text-[11px] font-bold">
                      {log.reply}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* IVR Interactive Call Simulator */
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-8 max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-tactile-oliveDark text-tactile-accent flex items-center justify-center mx-auto border-2 border-black shadow-tactile">
            <PhoneCall className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-black uppercase">
              TOLL-FREE IVR HELPLINE 1077
            </span>
            <h3 className="text-xl font-black text-black uppercase">
              AUTOMATED DISASTER PHONE RESPONSE
            </h3>
          </div>

          <div className="p-6 bg-tactile-bg border-2 border-black space-y-4">
            <p className="text-sm font-sans font-bold text-gray-800 italic leading-relaxed">
              "{ivrOptions[ivrStep].text}"
            </p>

            <div className="flex justify-center gap-3 pt-2">
              {ivrStep < 3 ? (
                <button
                  onClick={() => setIvrStep(ivrStep + 1)}
                  className="px-6 py-2.5 bg-tactile-accent text-black font-black text-xs border-2 border-black shadow-tactile hover:bg-emerald-400 transition"
                >
                  PRESS KEY → NEXT IVR STEP
                </button>
              ) : (
                <button
                  onClick={() => setIvrStep(0)}
                  className="px-6 py-2.5 bg-tactile-oliveDark text-white font-black text-xs border-2 border-black shadow-tactile transition"
                >
                  RESTART IVR CALL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
