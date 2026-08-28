import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Shield, FileText, Download, CheckCircle, WifiOff } from 'lucide-react';
import { extraService } from '../services/api';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { itemFadeUp } from '../motion/variants';

export default function OfflineEmergencyInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await extraService.getEmergencyContacts();
      setData(res);
    } catch (err) {
      console.error("Emergency contacts fetch error:", err);
      // Local fallback
      setData({
        district: "Rourkela (Sundargarh)",
        helplines: [
          { service: "District Disaster Control Room", number: "1077", type: "Toll-Free 24/7" },
          { service: "NDRF Emergency Helpline", number: "1078", type: "National Response" },
          { service: "Medical Ambulance", number: "108", type: "Emergency Health" },
          { service: "Fire & Rescue Service", number: "101", type: "Fire Dep't" },
          { service: "Police Control Room", number: "112 / 100", type: "Law & Order" },
          { service: "ODRAF Rourkela Water Rescue Base", number: "+91 661-2540101", type: "Water Rescue Squad" }
        ],
        offline_safety_protocols: [
          "Keep emergency kit ready with torch, power bank, dry food, clean drinking water, and essential medicines.",
          "Store emergency numbers offline on your mobile SIM.",
          "If mobile networks fail, tune into All India Radio Rourkela (102.6 FM) for official disaster broadcasts."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-tactile-oliveDark text-white p-6 border-2 border-black shadow-[6px_6px_0px_#1E2C1D] flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <span className="px-2.5 py-1 bg-amber-400 text-black font-black text-xs uppercase flex items-center gap-1.5 w-fit">
            <WifiOff className="w-3.5 h-3.5" /> ACCESSIBLE OFFLINE & ONLINE
          </span>
          <h2 className="text-2xl font-black mt-2 text-white">
            OFFLINE EMERGENCY HELPLINES & SURVIVAL PROTOCOLS
          </h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Verified emergency contact directory and offline survival instructions for Rourkela & Odisha District Control Rooms.
          </p>
        </div>

        <motion.button
          onClick={() => window.print()}
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          className="flex items-center gap-1.5 px-4 py-2 bg-tactile-accent text-black font-black text-xs border-2 border-black shadow-tactile hover:bg-emerald-400 transition-colors"
        >
          <Download className="w-4 h-4" /> PRINT EMERGENCY SHEET
        </motion.button>
      </motion.div>

      {/* Grid of Emergency Numbers with Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div
              key={`contact-sk-${sk}`}
              className="bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-5 space-y-3"
            >
              <div className="w-20 h-4 tactile-skeleton rounded" />
              <div className="w-40 h-5 tactile-skeleton rounded" />
              <div className="w-full h-9 tactile-skeleton rounded mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <StaggerContainer stagger={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.helplines?.map((item, idx) => (
            <StaggerItem
              key={idx}
              className="bg-white border-2 border-black shadow-[4px_4px_0px_#1E2C1D] p-5 space-y-3 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
            >
              <div>
                <span className="px-2 py-0.5 bg-gray-100 border border-black text-[10px] font-bold text-gray-700 uppercase">
                  {item.type}
                </span>
                <h3 className="font-black text-sm text-black mt-1.5">
                  {item.service}
                </h3>
              </div>

              <motion.a
                href={`tel:${item.number}`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 1 }}
                className="w-full py-2.5 bg-tactile-accent text-black font-black text-xs uppercase border-2 border-black shadow-tactile-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4" /> DIAL {item.number}
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Offline Safety Protocols Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.15 }}
        className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4"
      >
        <h3 className="font-black text-base text-black uppercase border-b-2 border-black pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-tactile-olive" />
          OFFLINE EMERGENCY SURVIVAL CHECKLIST
        </h3>

        <StaggerContainer stagger={0.04} className="space-y-3">
          {data?.offline_safety_protocols?.map((proto, idx) => (
            <StaggerItem
              key={idx}
              className="flex items-start gap-3 p-3 bg-tactile-bg border border-black font-sans text-xs text-gray-800 font-bold"
            >
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>{proto}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>

    </div>
  );
}
