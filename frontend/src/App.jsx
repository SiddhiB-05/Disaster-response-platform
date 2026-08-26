import React, { useState, useEffect } from 'react';
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
import { incidentService, resourceService, facilityService, alertService, demoService, setupWebSocket } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [incRes, resRes, facRes, altRes] = await Promise.all([
        incidentService.getIncidents(),
        resourceService.getResources(),
        facilityService.getFacilities(),
        alertService.getAlerts()
      ]);
      setIncidents(incRes);
      setResources(resRes);
      setFacilities(facRes);
      setAlerts(altRes);
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
    setLoading(true);
    try {
      await demoService.resetData();
      await fetchData();
      alert("Synthetic Rourkela demo state re-seeded successfully!");
    } catch (err) {
      console.error("Demo reset error:", err);
      alert("Failed to reset demo data.");
    } finally {
      setLoading(false);
    }
  };

  const activeAlert = alerts.find(a => a.is_active || a.status === 'ACTIVE') || alerts[0];

  if (activeTab === 'landing') {
    return (
      <LandingHero
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        totalIncidents={incidents.length}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tactile-bg text-tactile-border selection:bg-tactile-accent selection:text-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        activeAlert={activeAlert}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'architecture' && (
          <SystemArchitecture onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'report' && (
          <CitizenForm
            onIncidentSubmitted={() => { fetchData(); setActiveTab('queue'); }}
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
      </main>


      <footer className="border-t-2 border-black bg-tactile-oliveDark text-white py-3 px-6 text-xs font-mono flex flex-wrap items-center justify-between">
        <div>
          <span className="font-bold text-tactile-accent">PS-05 REAL-TIME DISASTER EARLY-WARNING PLATFORM</span>
          <span className="ml-2 text-gray-400">| Gemini AI NLP • SciPy Allocation Engine</span>
        </div>
        <div className="text-gray-400 mt-1 sm:mt-0">
          ROURKELA SECTOR 6 DISASTER RESPONSE REGION
        </div>
      </footer>
    </div>
  );
}
