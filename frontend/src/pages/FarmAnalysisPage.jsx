import React, { useState } from 'react';
import {
  Droplets,
  Sprout,
  CloudRain,
  Sun,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Leaf,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import {
  SUPPORTED_CROPS,
  SUPPORTED_SOILS,
  SUPPORTED_REGIONS,
  PUMP_CAPACITIES,
  DEMO_SCENARIOS
} from '../config/agriculturalData';
import { analyzeFarm } from '../services/api';
import Badge from '../components/Badge';

export default function FarmAnalysisPage({ setActivePage }) {
  const {
    farm,
    setFarm,
    latestAnalysis,
    setLatestAnalysis,
    addActivity,
    loadExampleScenario,
    clearFarmData
  } = useFarm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSuccess, setWeatherSuccess] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showPumpOptions, setShowPumpOptions] = useState(false);

  // Handle live weather fetch from Open-Meteo
  const handleFetchWeather = async () => {
    setWeatherLoading(true);
    setError(null);
    try {
      const regionData = SUPPORTED_REGIONS.find(r => r.name === farm.location) || SUPPORTED_REGIONS[0];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${regionData.lat}&longitude=${regionData.lon}&daily=precipitation_sum,precipitation_probability_max&current_weather=true&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Live weather fetch failed');
      const data = await res.json();

      const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 0;
      const rainSum = data.daily?.precipitation_sum?.[0] ?? 0;

      setFarm(prev => ({
        ...prev,
        rainfall_probability: rainProb,
        forecast_rainfall_mm: Number(rainSum.toFixed(1)),
      }));
      setWeatherSuccess(true);
      setTimeout(() => setWeatherSuccess(false), 3500);
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
      setFarm(prev => ({
        ...prev,
        rainfall_probability: 20,
        forecast_rainfall_mm: 5.0,
      }));
    } finally {
      setWeatherLoading(false);
    }
  };

  // Submit calculation to backend
  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!farm.crop) {
      setError('Please select what crop you are growing.');
      return;
    }
    const area = parseFloat(farm.area_acres);
    if (!area || area <= 0) {
      setError('Please enter a valid field area (e.g., 2.0 acres).');
      return;
    }
    const moisture = parseFloat(farm.soil_moisture_percent);
    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      setError('Please provide a soil moisture percentage between 0% and 100%.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      crop: farm.crop,
      area_acres: area,
      soil_type: farm.soil_type || 'alluvial',
      soil_moisture_percent: moisture,
      location: farm.location || 'Uttar Pradesh',
      rainfall_probability: Number(farm.rainfall_probability || 0),
      forecast_rainfall_mm: farm.forecast_rainfall_mm !== '' && farm.forecast_rainfall_mm !== null
        ? Number(farm.forecast_rainfall_mm)
        : null,
      current_irrigation_mm: farm.current_irrigation_mm ? Number(farm.current_irrigation_mm) : 35.0,
    };

    try {
      const response = await analyzeFarm(payload);

      setLatestAnalysis({
        data: response,
        timestamp: new Date().toLocaleTimeString(),
        submittedInput: { ...payload },
      });

      addActivity({
        title: `${farm.crop.toUpperCase()} Water Plan (${area} ac in ${farm.location})`,
        type: 'ANALYSIS',
        status: response.recommendation?.status || 'Calculated',
        location: farm.location,
        recommended_mm: response.recommendation?.recommended_irrigation_mm ?? 0,
        water_saved_l: response.water_analysis?.water_savings_liters ?? 0,
        requestId: response.request_id || 'fg-trace',
      });
    } catch (err) {
      setError(err.message || 'Error communicating with backend calculation engine.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCropObj = SUPPORTED_CROPS.find(c => c.id === farm.crop);
  const selectedPumpObj = PUMP_CAPACITIES.find(p => p.hp === (farm.pump_hp || 5)) || PUMP_CAPACITIES[1];

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const residue = analysis?.residue_management || null;
  const envImpact = analysis?.environmental_impact || null;
  const assumptions = analysis?.assumptions || [];

  // Pumping runtime and savings derived dynamically
  const waterVolLiters = waterAnalysis?.recommended_irrigation_liters ?? (
    rec ? Math.round(rec.recommended_irrigation_mm * (parseFloat(farm.area_acres) || 1) * 4046.86) : 0
  );
  const pumpRuntimeHours = Number((waterVolLiters / selectedPumpObj.dischargeLph).toFixed(1));
  const pumpHoursSaved = waterAnalysis?.pump_hours_saved ?? (
    waterAnalysis?.water_savings_liters
      ? Number((waterAnalysis.water_savings_liters / selectedPumpObj.dischargeLph).toFixed(1))
      : 0
  );
  const electricitySavedKwh = Number((pumpHoursSaved * selectedPumpObj.kwDraw).toFixed(1));
  const moneySavedInr = Math.round(electricitySavedKwh * (farm.electricity_tariff || 6));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Demo Load Action */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              Check My Water Need
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Tell us about your field and crop. FarmGuard will calculate your water plan and energy savings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Try Example Field:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              onChange={(e) => {
                if (e.target.value) {
                  loadExampleScenario(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Example Scenario...</option>
              {Object.entries(DEMO_SCENARIOS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--status-danger)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Flow */}
      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* STEP 1: CROP SELECTOR */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} style={{ color: 'var(--primary-400)' }} />
                1. What are you growing?
              </h3>
              <p className="card-subtitle">Choose the crop for this watering decision</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {SUPPORTED_CROPS.map((c) => {
              const isSelected = farm.crop === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFarm(prev => ({ ...prev, crop: c.id }))}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary-400)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{c.icon}</span>
                    {isSelected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--primary-300)' : 'var(--text-main)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.season} • Target moisture: {c.targetMoisture}%
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={14} />
            <span>Don't see your crop? Currently supporting major North & Central Indian grain and cash crops. More coming soon.</span>
          </div>
        </div>

        {/* STEP 2: FIELD SIZE & LOCATION */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} style={{ color: 'var(--accent-blue)' }} />
                2. How big is your field & where is it?
              </h3>
              <p className="card-subtitle">Field size determines total volume (Litres) and pumping time</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '12px' }}>
            <div>
              <label className="form-label">Field Area</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="100"
                  className="form-input"
                  style={{ fontSize: '1.1rem', fontWeight: 600 }}
                  placeholder="e.g. 2.0"
                  value={farm.area_acres}
                  onChange={(e) => setFarm(prev => ({ ...prev, area_acres: e.target.value }))}
                  required
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Acres
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                Enter total acreage of the plot to be watered.
              </div>
            </div>

            <div>
              <label className="form-label">Farm Location (State)</label>
              <select
                className="form-select"
                value={farm.location}
                onChange={(e) => setFarm(prev => ({ ...prev, location: e.target.value }))}
              >
                {SUPPORTED_REGIONS.map(r => (
                  <option key={r.name} value={r.name}>{r.name} ({r.climate})</option>
                ))}
              </select>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                Used for local weather forecast and regional evapotranspiration ($ET_0$).
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: SOIL MOISTURE & SOIL TYPE */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Droplets size={18} style={{ color: 'var(--primary-400)' }} />
                3. How wet is your soil currently?
              </h3>
              <p className="card-subtitle">Select your soil condition or enter estimated moisture percentage</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {/* 3 Visual Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 25 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: farm.soil_moisture_percent === 25 ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  background: farm.soil_moisture_percent === 25 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🏜️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Dry Soil</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~25% moisture</div>
              </button>

              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 45 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: farm.soil_moisture_percent === 45 ? '2px solid var(--primary-400)' : '1px solid var(--border-subtle)',
                  background: farm.soil_moisture_percent === 45 ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🌱</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Medium Moisture</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~45% moisture</div>
              </button>

              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 75 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: farm.soil_moisture_percent === 75 ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                  background: farm.soil_moisture_percent === 75 ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>💧</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Moist / Saturated</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~75% moisture</div>
              </button>
            </div>

            {/* Slider and Exact Number Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px', background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={farm.soil_moisture_percent || 0}
                  onChange={(e) => setFarm(prev => ({ ...prev, soil_moisture_percent: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--primary-400)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  <span>0% (Bone dry)</span>
                  <span>50% (Normal field capacity)</span>
                  <span>100% (Saturated)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  style={{ width: '80px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}
                  value={farm.soil_moisture_percent}
                  onChange={(e) => setFarm(prev => ({ ...prev, soil_moisture_percent: e.target.value }))}
                  required
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>

            {/* Soil Type Selector */}
            <div>
              <label className="form-label">Soil Type</label>
              <select
                className="form-select"
                value={farm.soil_type}
                onChange={(e) => setFarm(prev => ({ ...prev, soil_type: e.target.value }))}
              >
                {SUPPORTED_SOILS.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name} — {s.desc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STEP 4: WEATHER & RAIN CHECK */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CloudRain size={18} style={{ color: 'var(--accent-blue)' }} />
                4. Is rain expected in your area?
              </h3>
              <p className="card-subtitle">If rain is coming, FarmGuard credits it to save you pumping water</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Live Rain Forecast ({farm.location})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {farm.forecast_rainfall_mm > 0
                    ? `Rain expected: ${farm.forecast_rainfall_mm} mm (${farm.rainfall_probability}% probability)`
                    : (farm.rainfall_probability > 0
                      ? `${farm.rainfall_probability}% chance of light showers`
                      : 'No rain forecast in next 24-48 hours')}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleFetchWeather}
                disabled={weatherLoading}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                <CloudRain size={14} className={weatherLoading ? 'spin' : ''} />
                {weatherLoading ? 'Checking Weather...' : (weatherSuccess ? '✓ Weather Updated!' : 'Auto-Check Live Weather')}
              </button>
            </div>

            {/* Manual rain adjustment if desired */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Rain Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={farm.rainfall_probability}
                  onChange={(e) => setFarm(prev => ({ ...prev, rainfall_probability: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Expected Rain Depth (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.5"
                  className="form-input"
                  value={farm.forecast_rainfall_mm}
                  onChange={(e) => setFarm(prev => ({ ...prev, forecast_rainfall_mm: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Optional Tubewell Pump & Electricity Settings */}
        <div className="card" style={{ padding: '14px 20px' }}>
          <button
            type="button"
            onClick={() => setShowPumpOptions(!showPumpOptions)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={16} style={{ color: 'var(--accent-gold)' }} />
              <span>Pump & Electricity Settings (Optional)</span>
            </div>
            {showPumpOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPumpOptions && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <label className="form-label">Pump Capacity</label>
                <select
                  className="form-select"
                  value={farm.pump_hp || 5}
                  onChange={(e) => setFarm(prev => ({ ...prev, pump_hp: Number(e.target.value) }))}
                >
                  {PUMP_CAPACITIES.map(p => (
                    <option key={p.hp} value={p.hp}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Electricity Tariff (₹/kWh)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-input"
                  value={farm.electricity_tariff || 6}
                  onChange={(e) => setFarm(prev => ({ ...prev, electricity_tariff: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* MAIN SUBMIT CTA */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '14px 24px',
              fontSize: '1.08rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <Droplets size={20} />
            {loading ? 'Calculating Water Plan...' : 'Calculate My Water Need 💧'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearFarmData}
            style={{ padding: '14px 18px', fontSize: '0.88rem' }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </form>

      {/* RESULT SECTION: YOUR FARM'S WATER PLAN */}
      {analysis && rec && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
          <div className="card" style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.4)'
          }}>
            {/* 1. Decision Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  DECISION FOR YOUR FIELD
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', textTransform: 'capitalize' }}>
                  Your {farm.crop} Water Plan
                </h2>
              </div>

              <div style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: rec.recommended_irrigation_mm === 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: rec.recommended_irrigation_mm === 0 ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                color: rec.recommended_irrigation_mm === 0 ? 'var(--accent-blue)' : 'var(--primary-300)',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} />
                <span>{rec.status}</span>
              </div>
            </div>

            {/* 2. In Simple Words Box */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.98rem', marginBottom: '6px' }}>
                🗣️ In Simple Words:
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                {rec.explanation}
              </p>
            </div>

            {/* 3. Primary Metrics Grid */}
            <div className="grid-3" style={{ marginBottom: '20px' }}>
              {/* Recommended Water */}
              <div style={{ padding: '18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                  💧 Recommended Water
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-300)', margin: '4px 0' }}>
                  {rec.recommended_irrigation_mm} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>mm</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  ≈ <strong style={{ color: 'var(--text-main)' }}>{waterVolLiters.toLocaleString()} Litres</strong> for your {farm.area_acres} acres
                </div>
              </div>

              {/* Water You Save */}
              <div style={{ padding: '18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                  💧 Water You Could Save
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '4px 0' }}>
                  {waterAnalysis?.water_savings_liters ? `${waterAnalysis.water_savings_liters.toLocaleString()}` : '0'} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>L</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {waterAnalysis?.water_savings_percent
                    ? `${waterAnalysis.water_savings_percent}% reduction vs baseline flood watering`
                    : 'Optimal precision depth'}
                </div>
              </div>

              {/* Pumping Time & Electricity */}
              <div style={{ padding: '18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                  ⚡ Pump & Electricity Impact
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '4px 0' }}>
                  {pumpRuntimeHours} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Estimated pump runtime ({selectedPumpObj.hp} HP tubewell) • <strong style={{ color: 'var(--accent-gold)' }}>{pumpHoursSaved} hrs saved</strong> (₹{moneySavedInr})
                </div>
              </div>
            </div>

            {/* 4. Verified Farm Input Context Checklist */}
            <div style={{
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <span><strong>Crop:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{farm.crop}</span></span>
              <span><strong>Area:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.area_acres} Acres</span></span>
              <span><strong>Soil Moisture:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.soil_moisture_percent}%</span></span>
              <span><strong>Soil Type:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{farm.soil_type}</span></span>
              <span><strong>Rain Offset:</strong> <span style={{ color: 'var(--accent-blue)' }}>{rec.expected_rain_offset_mm || 0} mm</span></span>
              <span><strong>Location:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.location}</span></span>
            </div>

            {/* 5. Environmental Benefit */}
            {envImpact && (
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: 'rgba(16, 185, 129, 0.06)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf size={18} style={{ color: '#a7f3d0' }} />
                  <span><strong>Environmental Benefit:</strong> Prevents excess groundwater pumping and avoids <strong style={{ color: 'var(--primary-300)' }}>{envImpact.co2e_avoided_kg} kg CO₂e</strong> carbon emissions.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActivePage?.('savings')}
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  View Full Savings Breakdown →
                </button>
              </div>
            )}

            {/* 6. Expandable Technical Calculation Details */}
            <div style={{ marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0
                }}
              >
                {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showTechnicalDetails ? 'Hide technical calculation details' : 'See calculation details (ET₀, K_c, soil retention & trace)'}</span>
              </button>

              {showTechnicalDetails && (
                <div style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div><strong>Soil Depletion:</strong> {rec.soil_depletion_percent}% below target capacity</div>
                  <div><strong>Rain Forecast Status:</strong> {rec.rain_forecast_status}</div>
                  <div><strong>Assumptions Applied:</strong></div>
                  <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                    {assumptions.map((a, i) => (
                      <li key={i}>{a.text}</li>
                    ))}
                  </ul>
                  {analysis.request_id && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '6px' }}>
                      Audit Correlation ID: {analysis.request_id}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Run Another Analysis CTA */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                Adjust Conditions & Recalculate
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  clearFarmData();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                Check Another Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
