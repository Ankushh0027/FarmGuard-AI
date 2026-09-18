import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

const FarmContext = createContext();

const INITIAL_FARM = {
  crop: 'wheat',
  area_acres: 2.0,
  soil_type: 'sandy loam',
  current_irrigation_mm: 30.0,
  location: 'Uttar Pradesh',
  rainfall_probability: 20.0,
  forecast_rainfall_mm: 6.4,
  soil_moisture_percent: 35.0,
};

export function FarmProvider({ children }) {
  const [farm, setFarm] = useState(INITIAL_FARM);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', service: 'FarmGuard' });
  const [activities, setActivities] = useState([
    {
      id: 'act-001',
      type: 'ANALYSIS',
      title: 'Irrigation Optimization — 2.0 Acres Wheat',
      location: 'Uttar Pradesh',
      recommended_mm: 20.7,
      water_saved_l: 75272,
      timestamp: '10 minutes ago',
      status: 'success',
      requestId: 'fg-88ef412a9b31',
    },
    {
      id: 'act-002',
      type: 'ADVISOR',
      title: 'AI Advisor Consultation: Western Disturbance Rain Alert',
      location: 'Punjab',
      recommended_mm: 0.0,
      water_saved_l: 323748,
      timestamp: '1 hour ago',
      status: 'postponed',
      requestId: 'fg-31ba762cd901',
    },
    {
      id: 'act-003',
      type: 'SECURITY',
      title: 'Prompt Injection Defense Triggered & Blocked',
      location: 'System Guardrail',
      recommended_mm: null,
      water_saved_l: null,
      timestamp: '3 hours ago',
      status: 'blocked',
      requestId: 'fg-sec-90141f22',
    }
  ]);

  useEffect(() => {
    async function check() {
      const res = await checkHealth();
      setSystemHealth(res);
    }
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = (item) => {
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      ...item
    }, ...prev.slice(0, 19)]);
  };

  return (
    <FarmContext.Provider value={{
      farm,
      setFarm,
      latestAnalysis,
      setLatestAnalysis,
      systemHealth,
      activities,
      addActivity,
    }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
