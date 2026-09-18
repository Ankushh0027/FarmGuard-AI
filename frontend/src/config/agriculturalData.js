/**
 * FarmGuard AI — Centralized Agricultural Configuration
 * Matches backend calculation rules, crop constants, and supported parameters.
 */

export const SUPPORTED_CROPS = [
  {
    id: 'wheat',
    name: 'Wheat',
    season: 'Rabi (Winter)',
    typicalAcreage: '1 – 10 acres',
    targetMoisture: 65,
    criticalMoisture: 40,
    baseDepthMm: 50,
    residuePerAcreTonnes: 1.9,
    description: 'Moderate water requirement crop. Sensitive to moisture stress during crown root initiation and flowering.',
  },
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    season: 'Kharif (Monsoon)',
    typicalAcreage: '2 – 15 acres',
    targetMoisture: 85,
    criticalMoisture: 60,
    baseDepthMm: 75,
    residuePerAcreTonnes: 2.5,
    description: 'High water requirement crop. Requires standing water or saturated soil during tillering and panicle development.',
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    season: 'Kharif / Rabi',
    typicalAcreage: '1 – 8 acres',
    targetMoisture: 60,
    criticalMoisture: 35,
    baseDepthMm: 45,
    residuePerAcreTonnes: 2.0,
    description: 'Medium water requirement crop. Susceptible to waterlogging; sensitive during silking and tasseling.',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    season: 'Annual / Perennial',
    typicalAcreage: '2 – 20 acres',
    targetMoisture: 75,
    criticalMoisture: 50,
    baseDepthMm: 65,
    residuePerAcreTonnes: 3.5,
    description: 'Heavy water feeder crop with long vegetative growth. High stubble residue suitable for trash blanketing.',
  },
];

export const SUPPORTED_SOILS = [
  { id: 'alluvial', name: 'Alluvial Soil', desc: 'Indo-Gangetic plains, fertile with balanced drainage' },
  { id: 'loamy', name: 'Loamy Soil', desc: 'Optimal balanced moisture retention and aeration' },
  { id: 'sandy loam', name: 'Sandy Loam', desc: 'Light texture, fast infiltration, requires frequent light irrigation' },
  { id: 'clayey', name: 'Clayey Soil', desc: 'Heavy texture, high water retention, risk of waterlogging' },
  { id: 'clay loam', name: 'Clay Loam', desc: 'Balanced clay-sand-silt mixture with good nutrient holding' },
  { id: 'sandy', name: 'Sandy Soil', desc: 'Coarse texture, low moisture retention, high leaching' },
  { id: 'black', name: 'Black Soil (Regur / Vertisol)', desc: 'High clay content, deep cracking, high water holding' },
  { id: 'red', name: 'Red Soil (Alfisol)', desc: 'Porous structure, moderate water holding, needs organic mulching' },
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

/**
 * Clearly labeled DEMO / BENCHMARK scenarios for hackathon evaluation.
 * Loaded ONLY when the user explicitly clicks "Load Example Scenario".
 */
export const DEMO_SCENARIOS = {
  wheat_up: {
    label: 'Scenario 1: Wheat in Uttar Pradesh (Dry soil, 20% rain)',
    crop: 'wheat',
    area_acres: 2.0,
    soil_type: 'sandy loam',
    current_irrigation_mm: 30.0,
    location: 'Uttar Pradesh',
    rainfall_probability: 20.0,
    forecast_rainfall_mm: 6.4,
    soil_moisture_percent: 35.0,
  },
  rice_punjab: {
    label: 'Scenario 2: Rice / Paddy in Punjab (Western Disturbance rain forecast)',
    crop: 'rice',
    area_acres: 5.0,
    soil_type: 'alluvial',
    current_irrigation_mm: 60.0,
    location: 'Punjab',
    rainfall_probability: 85.0,
    forecast_rainfall_mm: 22.5,
    soil_moisture_percent: 55.0,
  },
  maize_bihar: {
    label: 'Scenario 3: Maize in Bihar (Low moisture, no rain)',
    crop: 'maize',
    area_acres: 3.0,
    soil_type: 'loamy',
    current_irrigation_mm: 40.0,
    location: 'Bihar',
    rainfall_probability: 10.0,
    forecast_rainfall_mm: 0.0,
    soil_moisture_percent: 30.0,
  },
  sugarcane_maharashtra: {
    label: 'Scenario 4: Sugarcane in Maharashtra (Heavy residue optimization)',
    crop: 'sugarcane',
    area_acres: 4.0,
    soil_type: 'black',
    current_irrigation_mm: 65.0,
    location: 'Maharashtra',
    rainfall_probability: 15.0,
    forecast_rainfall_mm: 0.0,
    soil_moisture_percent: 45.0,
  },
};
