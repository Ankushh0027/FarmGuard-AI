import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import { DEMO_SCENARIOS, PUMP_CAPACITIES } from '../config/agriculturalData';

const FarmContext = createContext();

const EMPTY_FARM = {
  crop: '',
  area_acres: '',
  soil_type: 'alluvial',
  current_irrigation_mm: '',
  location: 'Uttar Pradesh',
  rainfall_probability: 0,
  forecast_rainfall_mm: 0,
  soil_moisture_percent: '',
  pump_hp: 5,
  electricity_tariff: 6,
};

export function FarmProvider({ children }) {
  const [farm, setFarm] = useState(EMPTY_FARM);
  const [hasFarmProfile, setHasFarmProfile] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', service: 'FarmGuard' });
  const [activities, setActivities] = useState([]);

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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...item
    }, ...prev.slice(0, 24)]);
  };

  const loadExampleScenario = (scenarioKey = 'wheat_up') => {
    const scenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS.wheat_up;
    const { label, ...farmFields } = scenario;
    setFarm(prev => ({ ...prev, ...farmFields }));
    setHasFarmProfile(true);
    setLatestAnalysis(null); // Clear any old results so user explicitly analyzes
  };

  const clearFarmData = () => {
    setFarm(EMPTY_FARM);
    setHasFarmProfile(false);
    setLatestAnalysis(null);
  };

  const updateFarmField = (field, value) => {
    setFarm(prev => ({ ...prev, [field]: value }));
    setHasFarmProfile(true);
    // If crop changes, invalidate any stale previous analysis
    if (field === 'crop' && latestAnalysis) {
      setLatestAnalysis(null);
    }
  };

  return (
    <FarmContext.Provider value={{
      farm,
      setFarm,
      hasFarmProfile,
      setHasFarmProfile,
      latestAnalysis,
      setLatestAnalysis,
      systemHealth,
      activities,
      addActivity,
      loadExampleScenario,
      clearFarmData,
      updateFarmField,
    }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
