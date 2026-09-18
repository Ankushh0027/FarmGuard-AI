import React, { useState } from 'react';
import {
  Droplets,
  Sprout,
  CloudRain,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Leaf,
  Clock,
  Gauge,
  HelpCircle,
  ArrowRight
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

  // Perform Real Calculation
  const handleCalculate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    // Validation
    if (!farm.crop) {
      setError('Please select the crop you are growing (e.g. Wheat, Rice, Maize, Sugarcane).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const area = parseFloat(farm.area_acres);
    if (!area || isNaN(area) || area <= 0) {
      setError('Please enter a valid field size greater than 0 (e.g., 0.5, 1.25, 2.5 acres).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const moisture = parseFloat(farm.soil_moisture_percent);
    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      setError('Please provide a valid soil moisture value between 0% and 100%.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

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

      const rec = response.irrigation_recommendation || response.recommendation;

      addActivity({
        title: `${farm.crop.toUpperCase()} Water Plan (${area} ac in ${farm.location})`,
        type: 'ANALYSIS',
        status: rec?.status || 'Calculated',
        location: farm.location,
        recommended_mm: rec?.recommended_irrigation_mm ?? 0,
        water_saved_l: response.water_analysis?.water_savings_liters ?? 0,
        requestId: response.request_id || 'fg-trace',
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resultElement = document.getElementById('water-plan-results');
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'Error connecting to the FarmGuard calculation engine. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCropObj = SUPPORTED_CROPS.find(c => c.id === farm.crop);
  const selectedPumpObj = PUMP_CAPACITIES.find(p => p.hp === (farm.pump_hp || 5)) || PUMP_CAPACITIES[1];

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const residue = analysis?.residue_estimate || analysis?.residue_management || null;
  const envImpact = analysis?.environmental_impact || null;
  const assumptions = analysis?.assumptions || [];

  // Pumping runtime and savings derived dynamically
  const areaValue = parseFloat(farm.area_acres) || 1.0;
  const waterVolLiters = waterAnalysis?.recommended_irrigation_liters ?? (
    rec ? Math.round(rec.recommended_irrigation_mm * areaValue * 4046.86) : 0
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
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              Check My Water Need
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Enter your field details to get a simple irrigation recommendation and energy savings estimate.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Example Field:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
              onChange={(e) => {
                if (e.target.value) {
                  loadExampleScenario(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Load Demo Field...</option>
              {Object.entries(DEMO_SCENARIOS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '14px 18px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: 'var(--status-danger)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} />
          <span><strong>Please note:</strong> {error}</span>
        </div>
      )}

      {/* 5-Step Field Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* SECTION 1: CROP SELECTION */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} style={{ color: 'var(--color-brand)' }} />
                1. What are you growing?
              </h3>
              <p className="card-subtitle">Choose the crop you want to irrigate</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {SUPPORTED_CROPS.map((c) => {
              const isSelected = farm.crop === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFarm(prev => ({ ...prev, crop: c.id }));
                    if (latestAnalysis) setLatestAnalysis(null);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                    background: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{c.icon}</span>
                    {isSelected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: isSelected ? 'var(--color-brand-dark)' : 'var(--text-main)' }}>
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
            <span>Currently supporting major regional food and cash crops. Additional crop profiles can be configured.</span>
          </div>
        </div>

        {/* SECTION 2: FULLY DYNAMIC FIELD SIZE */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} style={{ color: 'var(--accent-sky)' }} />
                2. How big is your field?
              </h3>
              <p className="card-subtitle">Enter the exact area of the field to be irrigated</p>
            </div>
          </div>

          <div style={{ maxWidth: '420px' }}>
            <label className="form-label">Field Area</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                step="any"
                min="0.1"
                max="500"
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                placeholder="e.g. 2.5"
                value={farm.area_acres}
                onChange={(e) => setFarm(prev => ({ ...prev, area_acres: e.target.value }))}
              />
              <div style={{
                padding: '9px 14px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}>
                Acres
              </div>
            </div>

            {/* Optional Quick Shortcuts underneath */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Quick select:</span>
              {[0.5, 1.0, 2.0, 5.0, 10.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFarm(prev => ({ ...prev, area_acres: val }))}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    background: Number(farm.area_acres) === val ? 'var(--color-brand-muted)' : 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: Number(farm.area_acres) === val ? 'var(--color-brand-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {val} ac
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} style={{ color: 'var(--color-brand)' }} />
                3. Where is your farm?
              </h3>
              <p className="card-subtitle">Used for regional evapotranspiration ($ET_0$) and weather integration</p>
            </div>
          </div>

          <div style={{ maxWidth: '420px' }}>
            <label className="form-label">State / Region</label>
            <select
              className="form-select"
              value={farm.location}
              onChange={(e) => setFarm(prev => ({ ...prev, location: e.target.value }))}
            >
              {SUPPORTED_REGIONS.map(r => (
                <option key={r.name} value={r.name}>{r.name} ({r.climate})</option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 4: SOIL MOISTURE & TYPE */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Droplets size={18} style={{ color: 'var(--color-brand)' }} />
                4. How wet is your soil now?
              </h3>
              <p className="card-subtitle">Choose a simple soil condition or enter an approximate percentage</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 3 Visual Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 25 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: Number(farm.soil_moisture_percent) === 25 ? '2px solid var(--accent-amber)' : '1px solid var(--border-default)',
                  background: Number(farm.soil_moisture_percent) === 25 ? 'var(--accent-amber-muted)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🏜️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>DRY</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~25% moisture</div>
              </button>

              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 45 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: Number(farm.soil_moisture_percent) === 45 ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  background: Number(farm.soil_moisture_percent) === 45 ? 'var(--color-brand-muted)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🌱</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>MODERATE</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~45% moisture</div>
              </button>

              <button
                type="button"
                onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: 75 }))}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: Number(farm.soil_moisture_percent) === 75 ? '2px solid var(--accent-sky)' : '1px solid var(--border-default)',
                  background: Number(farm.soil_moisture_percent) === 75 ? 'var(--accent-sky-muted)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>💧</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>WET</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>~75% moisture</div>
              </button>
            </div>

            {/* Slider and Exact Number Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px', background: 'var(--bg-surface-subtle)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={farm.soil_moisture_percent || 0}
                  onChange={(e) => setFarm(prev => ({ ...prev, soil_moisture_percent: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--color-brand)', cursor: 'pointer' }}
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
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
              </div>
            </div>

            {/* Soil Type */}
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

        {/* SECTION 5: WEATHER & RAIN */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CloudRain size={18} style={{ color: 'var(--accent-sky)' }} />
                5. Is rain expected in your area?
              </h3>
              <p className="card-subtitle">Upcoming rain is credited to reduce unnecessary tubewell pumping</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-surface-subtle)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Live Weather Forecast for {farm.location}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {farm.forecast_rainfall_mm > 0
                    ? `Rain expected: ${farm.forecast_rainfall_mm} mm (${farm.rainfall_probability}% probability)`
                    : (farm.rainfall_probability > 0
                      ? `${farm.rainfall_probability}% probability of rain`
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

            {/* Manual rain values if needed */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
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
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Forecast Rain Depth (mm)</label>
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

        {/* OPTIONAL: PUMP & ELECTRICITY SETTINGS */}
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
              <Gauge size={16} style={{ color: 'var(--accent-amber)' }} />
              <span>Want to estimate pump and electricity use? (Optional)</span>
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
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  Standard Indian tubewell flow rate: ~28,000 L/hr (5 HP)
                </div>
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
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  Used to estimate electricity bill savings
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PRIMARY CALCULATE BUTTON */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '14px 24px',
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Droplets size={20} className={loading ? 'spin' : ''} />
            {loading ? 'Calculating...' : 'Calculate My Water Need'}
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
      </div>

      {/* RESULTS SCREEN: YOUR FARM'S WATER PLAN */}
      {analysis && rec && (
        <div id="water-plan-results" className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div className="card" style={{
            padding: '28px',
            border: '2px solid var(--color-brand)',
            backgroundColor: '#ffffff'
          }}>
            {/* 1. Decision Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  YOUR WATER PLAN
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', textTransform: 'capitalize' }}>
                  {farm.crop} Field ({farm.area_acres} Acres in {farm.location})
                </h2>
              </div>

              <div style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: rec.recommended_irrigation_mm === 0 ? 'var(--accent-sky-muted)' : 'var(--color-brand-muted)',
                border: rec.recommended_irrigation_mm === 0 ? '1px solid #bae6fd' : '1px solid var(--color-brand-border)',
                color: rec.recommended_irrigation_mm === 0 ? 'var(--accent-sky)' : 'var(--color-brand-dark)',
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
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.96rem', marginBottom: '4px' }}>
                🗣️ In Simple Words:
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                {rec.explanation}
              </p>
            </div>

            {/* 3. Primary Metrics Grid */}
            <div className="grid-3" style={{ marginBottom: '20px' }}>
              {/* Recommended Water */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  💧 Recommended Water
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: '4px 0' }}>
                  {rec.recommended_irrigation_mm} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>mm</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  ≈ <strong style={{ color: 'var(--text-main)' }}>{waterVolLiters.toLocaleString()} Litres</strong> for your {farm.area_acres} acres
                </div>
              </div>

              {/* Water You Save */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  💧 Water You Could Save
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-sky)', margin: '4px 0' }}>
                  {waterAnalysis?.water_savings_liters ? `${waterAnalysis.water_savings_liters.toLocaleString()}` : '0'} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>L</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {waterAnalysis?.water_savings_percent
                    ? `${waterAnalysis.water_savings_percent}% reduction vs baseline flood watering`
                    : 'Precision application'}
                </div>
              </div>

              {/* Pumping Time & Electricity */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  ⚡ Pump & Electricity Impact
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '4px 0' }}>
                  {pumpRuntimeHours} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Estimated pump runtime ({selectedPumpObj.hp} HP) • <strong style={{ color: 'var(--accent-amber)' }}>{pumpHoursSaved} hrs saved</strong> (₹{moneySavedInr})
                </div>
              </div>
            </div>

            {/* 4. Verified Farm Input Context Checklist */}
            <div style={{
              padding: '14px 18px',
              background: 'var(--bg-surface-subtle)',
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
              <span><strong>Rain Offset:</strong> <span style={{ color: 'var(--accent-sky)' }}>{rec.expected_rain_offset_mm || 0} mm</span></span>
              <span><strong>Location:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.location}</span></span>
            </div>

            {/* 5. Environmental Benefit */}
            {envImpact && (
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: 'var(--color-brand-muted)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-brand-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf size={18} style={{ color: 'var(--color-brand)' }} />
                  <span><strong>Environmental Benefit:</strong> Prevents excess aquifer extraction and avoids <strong style={{ color: 'var(--color-brand-dark)' }}>{envImpact.co2e_avoided_kg} kg CO₂e</strong> emissions.</span>
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
                  background: 'var(--bg-surface-subtle)',
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
