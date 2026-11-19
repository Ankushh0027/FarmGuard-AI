import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  checkHealth,
  fetchFarms,
  saveFarmApi,
  updateFarmApi,
  deleteFarmApi,
  resetFarmsApi
} from '../services/api';
import { DEMO_SCENARIOS, PUMP_CAPACITIES } from '../config/agriculturalData';
import { getTranslations } from '../utils/i18n';

const FarmContext = createContext();

const STORAGE_KEY_FARMS = 'farmguard_farms_v2';
const STORAGE_KEY_ACTIVE_ID = 'farmguard_active_farm_id_v2';

export const INITIAL_FARMS = [
  {
    id: 'farm-1',
    name: 'North Tubewell Plot (उत्तर खेत)',
    crop: 'wheat',
    area_acres: 2.0,
    area_hectares: 0.81,
    soil_type: 'alluvial',
    current_irrigation_mm: 35.0,
    location: 'Uttar Pradesh',
    rainfall_probability: 15,
    forecast_rainfall_mm: 0,
    soil_moisture_percent: 58,
    pump_flow_lpm: 460,
    pump_hp: 5,
    electricity_tariff: 6,
    sowing_date: '2026-10-25',
    notes: 'Near tube-well #1. Sown on Oct 25. Regular alluvial loam.',
    latitude: 26.8524,
    longitude: 80.9412,
    gps_accuracy: 5.2,
    location_captured_at: '2026-10-25T08:30:00Z',
    location_source: 'gps',
    boundary_coordinates: [
      [26.8530, 80.9405],
      [26.8532, 80.9422],
      [26.8518, 80.9420],
      [26.8516, 80.9403]
    ]
  },
  {
    id: 'farm-2',
    name: 'Canal Side Plot (नहर वाला खेत)',
    crop: 'rice',
    area_acres: 1.5,
    area_hectares: 0.61,
    soil_type: 'clayey',
    current_irrigation_mm: 65.0,
    location: 'Punjab',
    rainfall_probability: 20,
    forecast_rainfall_mm: 0,
    soil_moisture_percent: 74,
    pump_flow_lpm: 700,
    pump_hp: 7.5,
    electricity_tariff: 6,
    sowing_date: '2026-07-10',
    notes: 'Heavy clay soil, canal sub-distributary access. High water retention.',
    latitude: 30.9085,
    longitude: 75.8532,
    gps_accuracy: 4.8,
    location_captured_at: '2026-07-10T09:15:00Z',
    location_source: 'gps',
    boundary_coordinates: [
      [30.9092, 75.8525],
      [30.9093, 75.8540],
      [30.9078, 75.8539],
      [30.9077, 75.8524]
    ]
  },
  {
    id: 'farm-3',
    name: 'South Borewell Plot (दक्षिण बोरवेल)',
    crop: 'maize',
    area_acres: 3.0,
    area_hectares: 1.21,
    soil_type: 'sandy loam',
    current_irrigation_mm: 40.0,
    location: 'Haryana',
    rainfall_probability: 10,
    forecast_rainfall_mm: 0,
    soil_moisture_percent: 38,
    pump_flow_lpm: 460,
    pump_hp: 5,
    electricity_tariff: 6,
    sowing_date: '2026-09-01',
    notes: 'Permeable sandy loam. Root zone drying faster, requires monitoring.',
    latitude: 29.6912,
    longitude: 76.9854,
    gps_accuracy: 6.0,
    location_captured_at: '2026-09-01T10:00:00Z',
    location_source: 'manual',
    boundary_coordinates: [
      [29.6922, 76.9842],
      [29.6924, 76.9868],
      [29.6902, 76.9866],
      [29.6900, 76.9840]
    ]
  }
];

export function FarmProvider({ children }) {
  // 1. Multi-farm state with localStorage persistence
  const [farms, setFarms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FARMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved farms from localStorage', e);
    }
    return INITIAL_FARMS;
  });

  const [activeFarmId, setActiveFarmId] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (savedId) return savedId;
    } catch (e) {
      console.warn('Failed to get active farm id', e);
    }
    return 'farm-1';
  });

  // Active farm object
  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0] || INITIAL_FARMS[0];
  const [farm, setFarm] = useState(activeFarm);
  const [hasFarmProfile, setHasFarmProfile] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking', service: 'FarmGuard' });
  const [activities, setActivities] = useState([]);

  // Language state
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('farmguard_lang') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('farmguard_lang', newLang);
    } catch (e) {
      console.warn('Failed to persist language preference', e);
    }
  };

  const t = getTranslations(language);

  // Sync activeFarm changes to `farm`
  useEffect(() => {
    if (activeFarm) {
      setFarm(activeFarm);
      setHasFarmProfile(true);
    }
  }, [activeFarmId, farms]);

  // Load farms from FastAPI persistent backend on startup
  useEffect(() => {
    let isMounted = true;
    async function syncWithBackend() {
      try {
        const remoteFarms = await fetchFarms();
        if (isMounted && remoteFarms && Array.isArray(remoteFarms) && remoteFarms.length > 0) {
          setFarms(remoteFarms);
          const currentActive = remoteFarms.find(f => f.id === activeFarmId) || remoteFarms[0];
          setActiveFarmId(currentActive.id);
          setFarm(currentActive);
        }
      } catch (err) {
        console.warn('Backend sync failed, continuing with cached farms:', err);
      }
    }
    syncWithBackend();
    return () => { isMounted = false; };
  }, []);

  // Save farms array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(farms));
    } catch (e) {
      console.warn('Failed to persist farms to localStorage', e);
    }
  }, [farms]);

  // Save activeFarmId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeFarmId);
    } catch (e) {
      console.warn('Failed to persist active farm id', e);
    }
  }, [activeFarmId]);

  // Periodic health check
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

  // Multi-farm actions
  const selectFarm = (farmId) => {
    const target = farms.find(f => f.id === farmId);
    if (target) {
      setActiveFarmId(farmId);
      setFarm(target);
      setLatestAnalysis(null); // Clear previous analysis for fresh check
      addActivity({
        type: 'FARM_SELECT',
        title: `Switched active field: ${target.name}`,
        details: `${target.crop.toUpperCase()} (${target.area_acres} ac) in ${target.location}`
      });
    }
  };

  const addFarm = async (newFarmData) => {
    const newId = newFarmData.id || `farm-${Date.now()}`;
    const createdFarm = {
      id: newId,
      name: newFarmData.name || `Field ${farms.length + 1}`,
      crop: newFarmData.crop || 'wheat',
      area_acres: parseFloat(newFarmData.area_acres) || 2.0,
      area_hectares: newFarmData.area_hectares ? parseFloat(newFarmData.area_hectares) : Number((parseFloat(newFarmData.area_acres || 2.0) * 0.404686).toFixed(2)),
      soil_type: newFarmData.soil_type || 'alluvial',
      current_irrigation_mm: parseFloat(newFarmData.current_irrigation_mm) || 35.0,
      location: newFarmData.location || 'Uttar Pradesh',
      rainfall_probability: parseFloat(newFarmData.rainfall_probability) || 0,
      forecast_rainfall_mm: parseFloat(newFarmData.forecast_rainfall_mm) || 0,
      soil_moisture_percent: parseFloat(newFarmData.soil_moisture_percent) || 55,
      pump_flow_lpm: parseFloat(newFarmData.pump_flow_lpm) || 460,
      pump_hp: parseFloat(newFarmData.pump_hp) || 5,
      electricity_tariff: parseFloat(newFarmData.electricity_tariff) || 6,
      sowing_date: newFarmData.sowing_date || new Date().toISOString().split('T')[0],
      notes: newFarmData.notes || '',
      // Geolocation & Mapping fields
      latitude: newFarmData.latitude !== undefined && newFarmData.latitude !== null ? parseFloat(newFarmData.latitude) : 26.8524,
      longitude: newFarmData.longitude !== undefined && newFarmData.longitude !== null ? parseFloat(newFarmData.longitude) : 80.9412,
      gps_accuracy: newFarmData.gps_accuracy !== undefined ? newFarmData.gps_accuracy : null,
      location_captured_at: newFarmData.location_captured_at || new Date().toISOString(),
      location_source: newFarmData.location_source || 'manual',
      boundary_coordinates: Array.isArray(newFarmData.boundary_coordinates) ? newFarmData.boundary_coordinates : []
    };

    setFarms(prev => [...prev, createdFarm]);
    setActiveFarmId(createdFarm.id);
    setFarm(createdFarm);
    setLatestAnalysis(null);

    // Persist to FastAPI backend
    try {
      await saveFarmApi(createdFarm);
    } catch (e) {
      console.warn('Backend saveFarmApi failed, saved to local cache:', e);
    }

    addActivity({
      type: 'FARM_ADD',
      title: `Added new field: ${createdFarm.name}`,
      details: `${createdFarm.crop.toUpperCase()} (${createdFarm.area_acres} ac)`
    });

    return createdFarm;
  };

  const updateFarm = async (farmId, updatedFields) => {
    setFarms(prev => prev.map(f => {
      if (f.id === farmId) {
        return { ...f, ...updatedFields };
      }
      return f;
    }));

    if (farmId === activeFarmId) {
      setFarm(prev => ({ ...prev, ...updatedFields }));
      if (updatedFields.crop || updatedFields.soil_type || updatedFields.area_acres) {
        setLatestAnalysis(null);
      }
    }

    // Persist to FastAPI backend
    try {
      await updateFarmApi(farmId, updatedFields);
    } catch (e) {
      console.warn('Backend updateFarmApi failed, saved to local cache:', e);
    }
  };

  const deleteFarm = async (farmId) => {
    if (farms.length <= 1) {
      alert(t.atLeastOneField || 'You must have at least one farm field.');
      return false;
    }
    const remaining = farms.filter(f => f.id !== farmId);
    setFarms(remaining);

    if (activeFarmId === farmId) {
      const nextActive = remaining[0];
      setActiveFarmId(nextActive.id);
      setFarm(nextActive);
      setLatestAnalysis(null);
    }

    // Persist to FastAPI backend
    try {
      await deleteFarmApi(farmId);
    } catch (e) {
      console.warn('Backend deleteFarmApi failed, removed from local cache:', e);
    }

    addActivity({
      type: 'FARM_DELETE',
      title: `Deleted farm field`,
      details: `Field ID: ${farmId}`
    });

    return true;
  };

  const resetToDefaultFarms = async () => {
    try {
      const resetFarms = await resetFarmsApi();
      if (resetFarms && Array.isArray(resetFarms) && resetFarms.length > 0) {
        setFarms(resetFarms);
        setActiveFarmId(resetFarms[0].id);
        setFarm(resetFarms[0]);
        setLatestAnalysis(null);
        return;
      }
    } catch (e) {
      console.warn('resetFarmsApi fallback:', e);
    }

    setFarms(INITIAL_FARMS);
    setActiveFarmId('farm-1');
    setFarm(INITIAL_FARMS[0]);
    setLatestAnalysis(null);
    try {
      localStorage.removeItem(STORAGE_KEY_FARMS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    } catch (e) {
      // ignore
    }
  };

  // Backward compatible updateFarmField
  const updateFarmField = (field, value) => {
    setFarm(prev => {
      const updated = { ...prev, [field]: value };
      // Also sync back to farms array
      setFarms(prevFarms => prevFarms.map(f => {
        if (f.id === activeFarmId) {
          return { ...f, [field]: value };
        }
        return f;
      }));
      return updated;
    });
    setHasFarmProfile(true);

    if (field === 'crop' && latestAnalysis) {
      setLatestAnalysis(null);
    }
  };

  const loadExampleScenario = (scenarioKey = 'wheat_up') => {
    const scenario = DEMO_SCENARIOS[scenarioKey] || DEMO_SCENARIOS.wheat_up;
    const { label, ...farmFields } = scenario;
    setFarm(prev => ({ ...prev, ...farmFields }));
    updateFarm(activeFarmId, farmFields);
    setHasFarmProfile(true);
    setLatestAnalysis(null);
  };

  const clearFarmData = () => {
    const emptyFields = {
      crop: '',
      area_acres: '',
      soil_type: 'alluvial',
      current_irrigation_mm: '',
      location: 'Uttar Pradesh',
      rainfall_probability: 0,
      forecast_rainfall_mm: 0,
      soil_moisture_percent: '',
      pump_flow_lpm: '',
      pump_hp: 5,
      electricity_tariff: 6,
    };
    setFarm(emptyFields);
    updateFarm(activeFarmId, emptyFields);
    setHasFarmProfile(false);
    setLatestAnalysis(null);
  };

  const isLiveBackend = systemHealth.status === 'ok' || systemHealth.status === 'healthy';
  const isDemoMode = !isLiveBackend;

  return (
    <FarmContext.Provider value={{
      farm,
      setFarm,
      farms,
      activeFarmId,
      activeFarm,
      selectFarm,
      addFarm,
      updateFarm,
      deleteFarm,
      resetToDefaultFarms,
      hasFarmProfile,
      setHasFarmProfile,
      latestAnalysis,
      setLatestAnalysis,
      systemHealth,
      isLiveBackend,
      isDemoMode,
      activities,
      addActivity,
      loadExampleScenario,
      clearFarmData,
      updateFarmField,
      language,
      setLanguage,
      t,
    }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
