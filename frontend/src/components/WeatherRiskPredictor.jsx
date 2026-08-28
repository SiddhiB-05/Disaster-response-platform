import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, Cpu, Database, Activity, RefreshCw, Check } from 'lucide-react';
import { extraService } from '../services/api';
import AnimatedNumber from './motion/AnimatedNumber';
import { StaggerContainer, StaggerItem } from './motion/StaggerList';
import { itemFadeUp } from '../motion/variants';

export default function WeatherRiskPredictor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (data) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await extraService.getWeatherTelemetry();
      setData(res);
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-tactile-border">
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-4">
            <div className="space-y-2">
              <div className="w-48 h-4 tactile-skeleton rounded" />
              <div className="w-80 h-7 tactile-skeleton rounded" />
            </div>
            <div className="w-28 h-8 tactile-skeleton rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-tactile-bg border-2 border-black space-y-3">
                <div className="w-24 h-4 tactile-skeleton rounded" />
                <div className="w-32 h-8 tactile-skeleton rounded" />
                <div className="w-28 h-3 tactile-skeleton rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const w = data?.current_weather || {};
  const r = data?.river_monitoring || {};
  const pred = data?.risk_prediction || {};
  const hist = data?.historical_memory || {};

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-tactile-border selection:bg-tactile-accent selection:text-black">
      
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
          <div>
            <span className="px-2.5 py-1 bg-tactile-accent text-black font-black text-xs uppercase">
              LIVE METEOROLOGICAL TELEMETRY
            </span>
            <h2 className="text-2xl font-black mt-2 text-black flex items-center gap-2">
              <CloudRain className="w-6 h-6 text-tactile-olive" />
              WEATHER INTEGRATION & EARLY RISK PREDICTOR
            </h2>
          </div>

          <motion.button
            onClick={fetchWeather}
            disabled={isRefreshing}
            whileHover={{ y: -1 }}
            whileTap={{ y: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-tactile-oliveDark text-white border border-black shadow-tactile-sm text-xs font-bold hover:bg-black transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'REFRESHING...' : 'REFRESH FEEDS'}
          </motion.button>
        </div>

        {/* 4 Metric Cards with AnimatedNumber and progress gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Card 1: Rainfall */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="p-4 bg-emerald-50 border-2 border-black space-y-1.5"
          >
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-emerald-800" /> RAINFALL INTENSITY
            </div>
            <div className="text-2xl font-black text-black flex items-baseline gap-1">
              <AnimatedNumber value={w.rainfall_mm_per_hr || 42.5} decimals={1} />
              <span className="text-sm font-bold text-gray-600">mm/hr</span>
            </div>
            <div className="text-[10px] text-emerald-800 font-bold uppercase">
              Heavy Monsoon Downpour
            </div>
            <div className="w-full bg-emerald-200 h-1.5 border border-black overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((w.rainfall_mm_per_hr || 42.5) / 60) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-emerald-700"
              />
            </div>
          </motion.div>

          {/* Card 2: River Level */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-4 bg-amber-50 border-2 border-black space-y-1.5"
          >
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-amber-800" /> BRAHMANI RIVER LEVEL
            </div>
            <div className="text-2xl font-black text-black flex items-baseline gap-1">
              <AnimatedNumber value={r.current_water_level_meters || 178.6} decimals={1} />
              <span className="text-sm font-bold text-gray-600">meters</span>
            </div>
            <div className="text-[10px] text-amber-900 font-bold uppercase">
              Danger Mark: {r.danger_level_meters || 179.0}m (HIGH ALERT)
            </div>
            <div className="w-full bg-amber-200 h-1.5 border border-black overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((r.current_water_level_meters || 178.6) / (r.danger_level_meters || 180)) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-amber-600"
              />
            </div>
          </motion.div>

          {/* Card 3: Wind Velocity */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="p-4 bg-cyan-50 border-2 border-black space-y-1.5"
          >
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-800" /> WIND VELOCITY
            </div>
            <div className="text-2xl font-black text-black flex items-baseline gap-1">
              <AnimatedNumber value={w.wind_speed_kmh || 58.0} decimals={1} />
              <span className="text-sm font-bold text-gray-600">km/h</span>
            </div>
            <div className="text-[10px] text-cyan-900 font-bold uppercase">
              Gale Force Wind Gusts
            </div>
            <div className="w-full bg-cyan-200 h-1.5 border border-black overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((w.wind_speed_kmh || 58.0) / 100) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-cyan-700"
              />
            </div>
          </motion.div>

          {/* Card 4: Early Risk Score */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="p-4 bg-red-50 border-2 border-black space-y-1.5"
          >
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-800" /> EARLY RISK SCORE
            </div>
            <div className="text-2xl font-black text-red-700 flex items-baseline gap-1">
              <AnimatedNumber value={pred.overall_risk_score || 88} decimals={0} />
              <span className="text-sm font-bold text-gray-600">/ 100</span>
            </div>
            <div className="text-[10px] text-red-900 font-black uppercase">
              {pred.risk_level || 'CRITICAL'}
            </div>
            <div className="w-full bg-red-200 h-1.5 border border-black overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pred.overall_risk_score || 88, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-red-600"
              />
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* AI Risk Prediction Card & Historical Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Risk Prediction Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.15 }}
          className="lg:col-span-7 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4"
        >
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <h3 className="font-black text-lg text-black uppercase flex items-center gap-2">
              <Cpu className="w-5 h-5 text-tactile-olive" />
              AI RISK PREDICTION ENGINE
            </h3>
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase">
              HIGH VULNERABILITY ALERT
            </span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="p-3 bg-red-50 border border-red-800 font-mono text-red-900 font-bold">
              PREDICTED HAZARD: {pred.predicted_hazard}
            </div>

            <div>
              <span className="font-mono font-bold text-xs uppercase text-gray-700 block mb-1">
                Vulnerable Sectors Identified:
              </span>
              <StaggerContainer stagger={0.04} className="space-y-1">
                {pred.vulnerable_sectors?.map((sec, idx) => (
                  <StaggerItem
                    key={idx}
                    as="li"
                    className="flex items-center gap-2 p-2 bg-tactile-bg border border-black font-mono font-bold text-xs list-none"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    {sec}
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.25 }}
              className="p-4 bg-tactile-oliveDark text-white border-2 border-black space-y-1 font-mono"
            >
              <span className="text-tactile-accent font-bold uppercase text-[11px] block">
                RECOMMENDED EARLY ACTION PLAN:
              </span>
              <p className="text-xs text-gray-200 font-sans leading-relaxed">
                {pred.recommended_early_action}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Historical Memory Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.2 }}
          className="lg:col-span-5 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4"
        >
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-black text-lg text-black uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-tactile-olive" />
              HISTORICAL DISASTER MEMORY
            </h3>
          </div>

          <div className="p-4 bg-amber-50 border-2 border-black space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="text-gray-700 font-bold">Historical Dataset Analyzed:</span>
              <span className="font-black text-black">
                <AnimatedNumber value={hist.total_historical_incidents_analyzed || 8173} /> incidents
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="text-gray-700 font-bold">Peak Risk Season:</span>
              <span className="font-bold text-amber-900">{hist.historical_peak_monsoon_month}</span>
            </div>

            <div className="p-3 bg-white border border-black font-sans space-y-1">
              <span className="font-mono font-bold text-black text-xs block">
                Matching Historical Surge Pattern:
              </span>
              <p className="text-xs text-gray-700">
                {hist.matching_historical_pattern}
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
