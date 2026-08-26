import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import { extraService } from '../services/api';

export default function WeatherRiskPredictor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await extraService.getWeatherTelemetry();
      setData(res);
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>FETCHING LIVE TELEMETRY & HISTORICAL DISASTER PATTERNS...</span>
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
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
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

          <button
            onClick={fetchWeather}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-tactile-oliveDark text-white border border-black shadow-tactile-sm text-xs font-bold hover:bg-black transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> REFRESH FEEDS
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="p-4 bg-emerald-50 border-2 border-black space-y-1">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-emerald-800" /> RAINFALL INTENSITY
            </div>
            <div className="text-2xl font-black text-black">
              {w.rainfall_mm_per_hr} <span className="text-sm font-bold text-gray-600">mm/hr</span>
            </div>
            <div className="text-[10px] text-emerald-800 font-bold uppercase">
              Heavy Monsoon Downpour
            </div>
          </div>

          <div className="p-4 bg-amber-50 border-2 border-black space-y-1">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-amber-800" /> BRAHMANI RIVER LEVEL
            </div>
            <div className="text-2xl font-black text-black">
              {r.current_water_level_meters} <span className="text-sm font-bold text-gray-600">meters</span>
            </div>
            <div className="text-[10px] text-amber-900 font-bold uppercase">
              Danger Mark: {r.danger_level_meters}m (HIGH ALERT)
            </div>
          </div>

          <div className="p-4 bg-cyan-50 border-2 border-black space-y-1">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-800" /> WIND VELOCITY
            </div>
            <div className="text-2xl font-black text-black">
              {w.wind_speed_kmh} <span className="text-sm font-bold text-gray-600">km/h</span>
            </div>
            <div className="text-[10px] text-cyan-900 font-bold uppercase">
              Gale Force Wind Gusts
            </div>
          </div>

          <div className="p-4 bg-red-50 border-2 border-black space-y-1">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-800" /> EARLY RISK SCORE
            </div>
            <div className="text-2xl font-black text-red-700">
              {pred.overall_risk_score} <span className="text-sm font-bold text-gray-600">/ 100</span>
            </div>
            <div className="text-[10px] text-red-900 font-black uppercase">
              {pred.risk_level}
            </div>
          </div>

        </div>
      </div>

      {/* AI Risk Prediction Card & Historical Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Risk Prediction Card */}
        <div className="lg:col-span-7 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
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
              <ul className="space-y-1">
                {pred.vulnerable_sectors?.map((sec, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 bg-tactile-bg border border-black font-mono font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    {sec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-tactile-oliveDark text-white border-2 border-black space-y-1 font-mono">
              <span className="text-tactile-accent font-bold uppercase text-[11px] block">
                RECOMMENDED EARLY ACTION PLAN:
              </span>
              <p className="text-xs text-gray-200 font-sans leading-relaxed">
                {pred.recommended_early_action}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Historical Memory Card */}
        <div className="lg:col-span-5 bg-white border-2 border-black shadow-[6px_6px_0px_#1E2C1D] p-6 space-y-4">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-black text-lg text-black uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-tactile-olive" />
              HISTORICAL DISASTER MEMORY
            </h3>
          </div>

          <div className="p-4 bg-amber-50 border-2 border-black space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="text-gray-700 font-bold">Historical Dataset Analyzed:</span>
              <span className="font-black text-black">{hist.total_historical_incidents_analyzed?.toLocaleString()} incidents</span>
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
        </div>

      </div>
    </div>
  );
}
