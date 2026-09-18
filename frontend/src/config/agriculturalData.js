/**
 * FarmGuard AI — Centralized Agricultural Configuration
 * Matches backend calculation rules, crop constants, and supported parameters.
 */

export const SUPPORTED_CROPS = [
  {
    id: 'wheat',
    name: 'Wheat (Gehu)',
    icon: '🌾',
    season: 'Rabi (Winter)',
    typicalAcreage: '1 – 10 acres',
    targetMoisture: 65,
    criticalMoisture: 40,
    baseDepthMm: 50,
    residuePerAcreTonnes: 1.9,
    description: 'Moderate water requirement. Needs water during crown root initiation (20-25 days) and flowering.',
  },
  {
    id: 'rice',
    name: 'Rice / Paddy (Dhan)',
    icon: '🌾',
    season: 'Kharif (Monsoon)',
    typicalAcreage: '2 – 15 acres',
    targetMoisture: 85,
    criticalMoisture: 60,
    baseDepthMm: 75,
    residuePerAcreTonnes: 2.5,
    description: 'High water requirement crop. Requires moisture during tillering and panicle development.',
  },
  {
    id: 'maize',
    name: 'Maize (Makka / Corn)',
    icon: '🌽',
    season: 'Kharif / Rabi',
    typicalAcreage: '1 – 8 acres',
    targetMoisture: 60,
    criticalMoisture: 35,
    baseDepthMm: 45,
    residuePerAcreTonnes: 2.0,
    description: 'Medium water requirement. Sensitive to waterlogging; critical during silking and tasseling.',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ganna)',
    icon: '🎋',
    season: 'Annual / Perennial',
    typicalAcreage: '2 – 20 acres',
    targetMoisture: 75,
    criticalMoisture: 50,
    baseDepthMm: 65,
    residuePerAcreTonnes: 3.5,
    description: 'High water feeder with long vegetative growth. High stubble residue suitable for trash blanketing.',
  },
];

export const SUPPORTED_SOILS = [
  { id: 'alluvial', name: 'Alluvial Soil (Doab / Gangetic)', desc: 'Balanced moisture retention and drainage', icon: '🌱' },
  { id: 'loamy', name: 'Loamy Soil (Mattyar)', desc: 'Optimal balanced moisture and root aeration', icon: '🪴' },
  { id: 'sandy loam', name: 'Sandy Loam (Balui)', desc: 'Light texture, drains fast, needs frequent light water', icon: '🏖️' },
  { id: 'clayey', name: 'Clayey Soil (Chikni)', desc: 'Heavy soil, holds water longer, high water retention', icon: '🧱' },
  { id: 'clay loam', name: 'Clay Loam (Domat)', desc: 'Good nutrient and water holding capacity', icon: '🌿' },
  { id: 'sandy', name: 'Sandy Soil (Retili)', desc: 'Very fast drainage, low water holding', icon: '⏳' },
  { id: 'black', name: 'Black Soil (Regur / Kali)', desc: 'Deep clay, high moisture holding, cracks when dry', icon: '🖤' },
  { id: 'red', name: 'Red Soil (Lal)', desc: 'Moderate water holding, benefits from mulching', icon: '🔴' },
];

export const SUPPORTED_REGIONS = [
  { name: 'Uttar Pradesh', defaultET0: 4.2, lat: 26.8467, lon: 80.9462, climate: 'Subtropical Gangetic Plains' },
  { name: 'Punjab', defaultET0: 4.5, lat: 30.9010, lon: 75.8573, climate: 'Semi-arid / Canal Irrigated Plains' },
  { name: 'Haryana', defaultET0: 4.4, lat: 29.6857, lon: 76.9905, climate: 'North-Western Indo-Gangetic Plains' },
  { name: 'Bihar', defaultET0: 3.9, lat: 25.5941, lon: 85.1376, climate: 'Humid Middle Gangetic Plains' },
  { name: 'Madhya Pradesh', defaultET0: 4.6, lat: 23.2599, lon: 77.4126, climate: 'Central Plateau & Hills' },
  { name: 'Rajasthan', defaultET0: 5.2, lat: 26.9124, lon: 75.7873, climate: 'Arid / Western Dry Region' },
  { name: 'Gujarat', defaultET0: 4.8, lat: 23.0225, lon: 72.5714, climate: 'Gujarat Plains & Hills' },
  { name: 'Maharashtra', defaultET0: 4.7, lat: 18.5204, lon: 73.8567, climate: 'Western Plateau & Hills' },
  { name: 'West Bengal', defaultET0: 3.8, lat: 22.5726, lon: 88.3639, climate: 'Lower Gangetic Plain' },
  { name: 'Karnataka', defaultET0: 4.3, lat: 12.9716, lon: 77.5946, climate: 'Southern Plateau & Hills' },
  { name: 'Tamil Nadu', defaultET0: 4.5, lat: 13.0827, lon: 80.2707, climate: 'East Coast Plains & Hills' },
  { name: 'Andhra Pradesh', defaultET0: 4.6, lat: 16.5062, lon: 80.6480, climate: 'Southern Coastal Plains' },
  { name: 'Telangana', defaultET0: 4.6, lat: 17.3850, lon: 78.4867, climate: 'Central Deccan Plateau' },
];

export const PUMP_CAPACITIES = [
  { hp: 3, label: '3 HP Pump (Small farm / Shallow)', dischargeLph: 18000, kwDraw: 2.5 },
  { hp: 5, label: '5 HP Pump (Standard Submersible Tubewell)', dischargeLph: 28000, kwDraw: 3.73 },
  { hp: 7.5, label: '7.5 HP Pump (Medium Deep Tubewell)', dischargeLph: 42000, kwDraw: 5.6 },
  { hp: 10, label: '10 HP Pump (High Capacity / Deep Borewell)', dischargeLph: 55000, kwDraw: 7.5 },
];

/**
 * Clearly labeled DEMO / BENCHMARK scenarios for hackathon evaluation.
 * Loaded ONLY when the user explicitly clicks "Load Example Scenario".
 */
export const DEMO_SCENARIOS = {
  wheat_up: {
    label: 'Scenario 1: Wheat in UP (Dry soil 35%, 20% rain, Pump 1000 L/min)',
    crop: 'wheat',
    area_acres: 2.0,
    soil_type: 'sandy loam',
    current_irrigation_mm: 30.0,
    location: 'Uttar Pradesh',
    rainfall_probability: 20.0,
    forecast_rainfall_mm: 6.4,
    soil_moisture_percent: 35.0,
    pump_flow_lpm: 1000,
    pump_hp: 5,
  },
  rice_punjab: {
    label: 'Scenario 2: Rice in Punjab (Rain forecast 22.5 mm, Pump 1200 L/min)',
    crop: 'rice',
    area_acres: 5.0,
    soil_type: 'alluvial',
    current_irrigation_mm: 60.0,
    location: 'Punjab',
    rainfall_probability: 85.0,
    forecast_rainfall_mm: 22.5,
    soil_moisture_percent: 55.0,
    pump_flow_lpm: 1200,
    pump_hp: 7.5,
  },
  maize_bihar: {
    label: 'Scenario 3: Maize in Bihar (Dry 30%, no rain, no pump flow entered)',
    crop: 'maize',
    area_acres: 3.0,
    soil_type: 'loamy',
    current_irrigation_mm: 40.0,
    location: 'Bihar',
    rainfall_probability: 10.0,
    forecast_rainfall_mm: 0.0,
    soil_moisture_percent: 30.0,
    pump_flow_lpm: '',
    pump_hp: 5,
  },
  sugarcane_maharashtra: {
    label: 'Scenario 4: Sugarcane in Maharashtra (Trash blanketing, no pump flow)',
    crop: 'sugarcane',
    area_acres: 4.0,
    soil_type: 'black',
    current_irrigation_mm: 65.0,
    location: 'Maharashtra',
    rainfall_probability: 15.0,
    forecast_rainfall_mm: 0.0,
    soil_moisture_percent: 45.0,
    pump_flow_lpm: '',
    pump_hp: 5,
  },
};
