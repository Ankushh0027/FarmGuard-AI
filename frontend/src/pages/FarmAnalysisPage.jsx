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
  ArrowRight,
  Calculator,
  Timer
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import {
  SUPPORTED_CROPS,
  SUPPORTED_SOILS,
  SUPPORTED_REGIONS,
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
  const [showFlowHelper, setShowFlowHelper] = useState(false);

  // Flow helper container state
  const [containerLitres, setContainerLitres] = useState(200);
  const [fillSeconds, setFillSeconds] = useState(12);

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
      setError('Please select what you are growing (e.g. Wheat, Rice, Maize, Sugarcane).');
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
      setError('Please provide an approximate soil moisture percentage between 0% and 100%.');
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

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const residue = analysis?.residue_estimate || analysis?.residue_management || null;
  const envImpact = analysis?.environmental_impact || null;
  const assumptions = analysis?.assumptions || [];

  // Exact Deterministic Conversions
  const areaValue = parseFloat(farm.area_acres) || 1.0;
  const recommendedMm = rec?.recommended_irrigation_mm ?? 0;

  // 1 mm over 1 acre = 4,046.86 Litres
  const waterVolLiters = waterAnalysis?.recommended_irrigation_liters ?? (
    Math.round(recommendedMm * areaValue * 4046.86)
  );

  // Pump Running Time (Minutes & Hours derived strictly from pump water flow in L/min)
  const pumpFlowLpm = parseFloat(farm.pump_flow_lpm);
  let pumpTimeText = null;
  let pumpTimeDetail = null;

  if (pumpFlowLpm && pumpFlowLpm > 0 && waterVolLiters > 0) {
    const totalMinutes = waterVolLiters / pumpFlowLpm;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours > 0 && minutes > 0) {
      pumpTimeText = `≈ ${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      pumpTimeText = `≈ ${hours} hours`;
    } else {
      pumpTimeText = `≈ ${minutes} minutes`;
    }
    pumpTimeDetail = `At ${pumpFlowLpm.toLocaleString()} L/min pump discharge`;
  }

  // Calculate container flow test estimation
  const estimatedHelperFlow = (containerLitres > 0 && fillSeconds > 0)
    ? Math.round((parseFloat(containerLitres) / parseFloat(fillSeconds)) * 60)
    : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
              Check My Water Need
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Enter your field details to find how much water your crop needs and how long to run your pump.
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
          <span><strong>Please check:</strong> {error}</span>
        </div>
      )}

      {/* 5-Step Field Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* STEP 1: CROP SELECTION */}
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
            <span>Currently supporting major food and cash crops (Wheat, Rice, Maize, Sugarcane).</span>
          </div>
        </div>

        {/* STEP 2: FULLY DYNAMIC FIELD SIZE */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} style={{ color: 'var(--accent-sky)' }} />
                2. How big is your field?
              </h3>
              <p className="card-subtitle">Enter any field size (e.g. 0.5, 1.25, 2.5, 5 acres)</p>
            </div>
          </div>

          <div style={{ maxWidth: '420px' }}>
            <label className="form-label">Field Size</label>
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

            {/* Quick Suggestions underneath */}
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

        {/* STEP 3: LOCATION */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} style={{ color: 'var(--color-brand)' }} />
                3. Where is your farm?
              </h3>
              <p className="card-subtitle">Select your state or agricultural zone</p>
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

        {/* STEP 4: SOIL MOISTURE */}
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
                  <span>0% (Dry)</span>
                  <span>50% (Normal moisture)</span>
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

        {/* STEP 5: WEATHER & RAIN */}
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

        {/* OPTIONAL: PUMP WATER FLOW ("How long to run my pump?") */}
        <div className="card" style={{ padding: '18px 20px' }}>
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
              fontWeight: 700,
              fontSize: '0.94rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Timer size={18} style={{ color: 'var(--accent-amber)' }} />
              <span>Want to know how long to run your pump? (Optional)</span>
            </div>
            {showPumpOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPumpOptions && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ maxWidth: '420px' }}>
                <label className="form-label">
                  Pump Water Flow (How much water your pump gives)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    className="form-input"
                    style={{ fontSize: '1rem', fontWeight: 600 }}
                    placeholder="e.g. 1000"
                    value={farm.pump_flow_lpm || ''}
                    onChange={(e) => setFarm(prev => ({ ...prev, pump_flow_lpm: e.target.value }))}
                  />
                  <div style={{
                    padding: '9px 12px',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}>
                    Litres / min
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Check your pump manual or ask your operator. If you don't know it, you can skip this.
                </div>
              </div>

              {/* Simple Flow Helper: Container Fill Method */}
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowFlowHelper(!showFlowHelper)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-brand-dark)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0
                  }}
                >
                  <Calculator size={14} />
                  <span>Don't know your pump flow? Measure with a drum/container</span>
                  {showFlowHelper ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showFlowHelper && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      Fill a known-size container (e.g. 200 L drum) and measure how many seconds it takes to fill:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Container Size (Litres)</label>
                        <input
                          type="number"
                          min="10"
                          max="2000"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          value={containerLitres}
                          onChange={(e) => setContainerLitres(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Fill Time (Seconds)</label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          value={fillSeconds}
                          onChange={(e) => setFillSeconds(e.target.value)}
                        />
                      </div>
                    </div>

                    {estimatedHelperFlow > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                          Estimated flow: <strong>{estimatedHelperFlow.toLocaleString()} L/min</strong>
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setFarm(prev => ({ ...prev, pump_flow_lpm: estimatedHelperFlow }))}
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                        >
                          Use this flow rate
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
            {/* 1. Decision Header (Should I Water?) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  YOUR FIELD'S WATER PLAN
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

            {/* 3. Practical 4-Card Result Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* Card 1: Water Needed (mm) */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  💧 Water Needed
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: '4px 0' }}>
                  {recommendedMm} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>mm</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {recommendedMm > 0
                    ? `${recommendedMm} mm means this amount of water spread evenly across your field.`
                    : 'No additional water needed today due to soil moisture or upcoming rain.'}
                </div>
              </div>

              {/* Card 2: For Your Field (Litres) */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  💧 For Your Field (Total Litres)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-sky)', margin: '4px 0' }}>
                  ≈ {waterVolLiters.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Litres</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  1 mm over 1 acre = 4,047 Litres. Calculated dynamically for your {farm.area_acres} acres.
                </div>
              </div>

              {/* Card 3: Pump Running Time ("Mera pump kitne ghante chalega?") */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  ⏱️ Estimated Pump Time
                </div>
                {pumpTimeText ? (
                  <>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '4px 0' }}>
                      {pumpTimeText}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {pumpTimeDetail}.
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', margin: '10px 0 6px' }}>
                      Not specified
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                      Add your pump water flow in L/min above to estimate exact pumping hours.
                    </div>
                  </>
                )}
              </div>

              {/* Card 4: Water You Save */}
              <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                  💧 Water You Save
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-brand)', margin: '4px 0' }}>
                  {waterAnalysis?.water_savings_liters ? `${waterAnalysis.water_savings_liters.toLocaleString()}` : '0'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>L</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {waterAnalysis?.water_savings_percent
                    ? `${waterAnalysis.water_savings_percent}% reduction compared to unoptimized flood watering.`
                    : 'Precision application matches crop evapotranspiration.'}
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
              <span><strong>Field Size:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.area_acres} Acres</span></span>
              <span><strong>Soil Moisture:</strong> <span style={{ color: 'var(--text-main)' }}>{farm.soil_moisture_percent}%</span></span>
              <span><strong>Soil Type:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{farm.soil_type}</span></span>
              <span><strong>Rain Offset:</strong> <span style={{ color: 'var(--accent-sky)' }}>{rec.expected_rain_offset_mm || 0} mm</span></span>
              {farm.pump_flow_lpm && (
                <span><strong>Pump Flow:</strong> <span style={{ color: 'var(--accent-amber)' }}>{farm.pump_flow_lpm} L/min</span></span>
              )}
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
                  <span><strong>Environmental Benefit:</strong> Prevents groundwater depletion and avoids <strong style={{ color: 'var(--color-brand-dark)' }}>{envImpact.co2e_avoided_kg} kg CO₂e</strong> emissions.</span>
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
                <span>{showTechnicalDetails ? 'Hide calculation details' : 'How was this calculated? (Calculation details & equations)'}</span>
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
                  <div><strong>Crop Water Deficit:</strong> {rec.soil_depletion_percent}% below target root-zone capacity</div>
                  <div><strong>Volumetric Formula:</strong> Volume (L) = Irrigation (mm) × Area (acres) × 4,046.86</div>
                  {pumpFlowLpm && (
                    <div><strong>Pump Runtime Formula:</strong> Runtime = Volume (L) ÷ Pump Flow ({pumpFlowLpm} L/min)</div>
                  )}
                  <div><strong>Rainfall Balance:</strong> {rec.rain_forecast_status}</div>
                  <div><strong>Agronomic Assumptions Applied:</strong></div>
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
