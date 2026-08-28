import React, { useState, useEffect } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import SystemArchitecture from './components/SystemArchitecture';
import CitizenForm from './components/CitizenForm';
import IncidentQueue from './components/IncidentQueue';
import SciPyMatcher from './components/SciPyMatcher';
import MapView from './components/MapView';
import ShelterMedicalDirectory from './components/ShelterMedicalDirectory';
import WeatherRiskPredictor from './components/WeatherRiskPredictor';
import DisasterChatbot from './components/DisasterChatbot';
import SmsIvrSimulator from './components/SmsIvrSimulator';
import OfflineEmergencyInfo from './components/OfflineEmergencyInfo';
import AIPipelineInspector from './components/AIPipelineInspector';
import PageTransition from './components/motion/PageTransition';
import Tactical3DBackground from './components/background/Tactical3DBackground';
import { incidentService, resourceService, facilityService, alertService, demoService, setupWebSocket } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchData = async () => {
    try {
      const [incRes, resRes, facRes, altRes] = await Promise.all([
        incidentService.getIncidents(),
        resourceService.getResources(),
        facilityService.getFacilities(),
        alertService.getAlerts()
      ]);
      setIncidents(incRes || []);
      setResources(resRes || []);
      setFacilities(facRes || []);
      setAlerts(altRes || []);
    } catch (err) {
      console.error("Data fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time WebSocket events
    const cleanupWs = setupWebSocket((event) => {
      console.log("[WebSocket Event]", event);
      fetchData(); // Refetch authoritative data on real-time event
    });

    // Auto-refresh poll fallback every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => {
      cleanupWs();
      clearInterval(interval);
    };
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await demoService.resetData();
      await fetchData();
      alert("Synthetic Rourkela demo state re-seeded successfully!");
    } catch (err) {
      console.error("Demo reset error:", err);
      alert("Failed to reset demo data.");
    } finally {
      setIsResetting(false);
    }
  };

  const activeAlert = alerts.find(a => a.is_active || a.status === 'ACTIVE') || alerts[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-transparent text-tactile-border selection:bg-tactile-accent selection:text-black font-sans relative">
        {/* Fixed Interactive 3D Tactical Command Background */}
        <Tactical3DBackground activeTab={activeTab} />

        <AnimatePresence mode="wait">
          {activeTab === 'landing' ? (
            <PageTransition key="tab-landing" className="w-full">
              <LandingHero
                activeTab={activeTab}
                onNavigate={(tab) => setActiveTab(tab)}
                totalIncidents={incidents.length}
              />
            </PageTransition>
          ) : (
            <motion.div
              key="dashboard-shell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-screen flex flex-col justify-between"
            >
              <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onResetDemo={handleResetDemo}
                isResetting={isResetting}
                activeAlert={activeAlert}
              />

              <main className="flex-1 pb-12">
                <AnimatePresence mode="wait">
                  <PageTransition key={`tab-${activeTab}`} className="w-full">
                    {activeTab === 'architecture' && (
                      <SystemArchitecture onNavigate={(tab) => setActiveTab(tab)} />
                    )}

                    {activeTab === 'report' && (
                      <CitizenForm
                        onIncidentSubmitted={() => { fetchData(); }}
                        onNavigate={(tab) => setActiveTab(tab)}
                      />
                    )}

                    {activeTab === 'queue' && (
                      <IncidentQueue
                        incidents={incidents}
                        resources={resources}
                        onRefreshData={fetchData}
                      />
                    )}

                    {activeTab === 'scipy' && (
                      <SciPyMatcher
                        incidents={incidents}
                        resources={resources}
                        onRefreshData={fetchData}
                      />
                    )}

                    {activeTab === 'map' && (
                      <MapView
                        incidents={incidents}
                        resources={resources}
                        facilities={facilities}
                      />
                    )}

                    {activeTab === 'shelters' && (
                      <ShelterMedicalDirectory />
                    )}

                    {activeTab === 'weather' && (
                      <WeatherRiskPredictor />
                    )}

                    {activeTab === 'chatbot' && (
                      <DisasterChatbot />
                    )}

                    {activeTab === 'offline' && (
                      <div className="space-y-8">
                        <SmsIvrSimulator />
                        <OfflineEmergencyInfo />
                      </div>
                    )}

                    {activeTab === 'pipeline' && (
                      <AIPipelineInspector />
                    )}
                  </PageTransition>
                </AnimatePresence>
              </main>

              <footer className="border-t-2 border-black bg-tactile-oliveDark text-white py-3 px-6 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-tactile-accent">PS-05 REAL-TIME DISASTER EARLY-WARNING PLATFORM</span>
                  <span className="ml-2 text-gray-400">| Gemini AI NLP • SciPy Allocation Engine</span>
                </div>
                <div className="text-gray-400">
                  ROURKELA SECTOR 6 DISASTER RESPONSE REGION
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
