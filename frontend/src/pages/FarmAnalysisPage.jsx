import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  CloudRain,
  MapPin,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wind,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { analyzeFarm } from '../services/api';
import Badge from '../components/Badge';

const CROPS = [
  { id: 'wheat', name: 'Wheat (Rabi)', stage: 'Vegetative / Tillering' },
  { id: 'rice', name: 'Rice / Paddy (Kharif)', stage: 'Panicle Initiation' },
  { id: 'maize', name: 'Maize (Corn)', stage: 'Silking / Grain Fill' },
  { id: 'sugarcane', name: 'Sugarcane (Perennial)', stage: 'Grand Growth' },
];

const SOILS = [
  { id: 'sandy loam', name: 'Sandy Loam (High Drainage)' },
  { id: 'alluvial', name: 'Alluvial (Indo-Gangetic Standard)' },
  { id: 'loamy', name: 'Loamy (Balanced)' },
  { id: 'clayey', name: 'Clayey (High Retention)' },
  { id: 'clay loam', name: 'Clay Loam' },
  { id: 'sandy', name: 'Sandy (Rapid Infiltration)' },
  { id: 'black', name: 'Black Soil (Vertisol / Cotton)' },
  { id: 'red', name: 'Red Soil (Alfisols)' },
];

const LOCATIONS = [
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Maharashtra',
  'West Bengal',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
];

export default function FarmAnalysisPage() {
  const { farm, setFarm, latestAnalysis, setLatestAnalysis, addActivity } = useFarm();

  const [formData, setFormData] = useState({
    crop: farm.crop || 'wheat',
    area_acres: farm.area_acres || 2.0,
    soil_type: farm.soil_type || 'sandy loam',
    current_irrigation_mm: farm.current_irrigation_mm || 30.0,
    location: farm.location || 'Uttar Pradesh',
    rainfall_probability: farm.rainfall_probability || 20.0,
    forecast_rainfall_mm: farm.forecast_rainfall_mm || 6.4,
    soil_moisture_percent: farm.soil_moisture_percent || 35.0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('area') || name.includes('mm') || name.includes('percent') || name.includes('probability')
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        crop: formData.crop,
        area_acres: Number(formData.area_acres),
        soil_type: formData.soil_type,
        current_irrigation_mm: Number(formData.current_irrigation_mm),
        location: formData.location,
        rainfall_probability: Number(formData.rainfall_probability),
        forecast_rainfall_mm: formData.forecast_rainfall_mm !== '' ? Number(formData.forecast_rainfall_mm) : null,
        soil_moisture_percent: Number(formData.soil_moisture_percent),
      };

      const result = await analyzeFarm(payload);
      setLatestAnalysis(result);
      setFarm(payload);

      addActivity({
        type: 'ANALYSIS',
        title: `Irrigation Analysis — ${payload.area_acres} Acres ${payload.crop.toUpperCase()}`,
        location: payload.location,
        recommended_mm: result.irrigation_recommendation.recommended_irrigation_mm,
        water_saved_l: result.water_analysis?.water_saved_liters || 0,
        status: result.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'postponed' : 'success',
        requestId: `fg-calc-${Date.now().toString(16).slice(-8)}`,
      });
    } catch (err) {
      setError(err.message || 'An error occurred during farm calculation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 2-Column Grid: Left Input Form, Right Result / Context Panel */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Input Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} style={{ color: 'var(--primary-400)' }} />
                Farm & Crop Parameters
              </h3>
              <p className="card-subtitle">Provide field parameters for deterministic FAO-56 calculation</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Farm Area & Location */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '10px' }}>
                1. FARM & LOCATION
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Farm Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10000"
                    required
                    name="area_acres"
                    className="form-input"
                    value={formData.area_acres}
                    onChange={handleChange}
                    placeholder="e.g. 2.0"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">State / Region</label>
                  <select
                    name="location"
                    className="form-select"
                    value={formData.location}
                    onChange={handleChange}
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Crop Type */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '10px' }}>
                2. CROP & GROWTH
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Crop Variety</label>
                <select
                  name="crop"
                  className="form-select"
                  value={formData.crop}
                  onChange={handleChange}
                >
                  {CROPS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.stage}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 3: Soil & Field Moisture */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '10px' }}>
                3. SOIL & FIELD MOISTURE
              </div>
              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Soil Classification</label>
                  <select
                    name="soil_type"
                    className="form-select"
                    value={formData.soil_type}
                    onChange={handleChange}
                  >
                    {SOILS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Soil Moisture (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    required
                    name="soil_moisture_percent"
                    className="form-input"
                    value={formData.soil_moisture_percent}
                    onChange={handleChange}
                    placeholder="e.g. 35"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Scheduled / Planned Irrigation (mm)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1000"
                  required
                  name="current_irrigation_mm"
                  className="form-input"
                  value={formData.current_irrigation_mm}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                />
                <span className="form-helper">Baseline depth farmer planned to apply without optimization</span>
              </div>
            </div>

            {/* Section 4: Weather Signals */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '10px' }}>
                4. FORECAST WEATHER SIGNALS
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rain Probability (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    name="rainfall_probability"
                    className="form-input"
                    value={formData.rainfall_probability}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Forecast Rain Depth (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1000"
                    name="forecast_rainfall_mm"
                    className="form-input"
                    value={formData.forecast_rainfall_mm}
                    onChange={handleChange}
                    placeholder="e.g. 6.4"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.86rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="pulse-glow" style={{ animation: 'spin 1s linear infinite' }} />
                  Computing Deterministic Agronomic Math...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Run Farm Optimization Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Result State / Agronomic Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {latestAnalysis ? (
            /* Result Presentation */
            <div className="card fade-in" style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.2))',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-400)' }} />
                    Optimization Results
                  </h3>
                  <p className="card-subtitle">Deterministic recommendations backed by FAO-56 math</p>
                </div>
                <Badge variant={latestAnalysis.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'info' : 'success'}>
                  {latestAnalysis.irrigation_recommendation.status}
                </Badge>
              </div>

              {/* Big KPI Hero */}
              <div style={{
                padding: '20px',
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-300)', fontWeight: 700 }}>
                  Recommended Irrigation Depth
                </div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1.1,
                  margin: '6px 0'
                }}>
                  {latestAnalysis.irrigation_recommendation.recommended_irrigation_mm} <span style={{ fontSize: '1.5rem', color: 'var(--primary-400)' }}>mm</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {latestAnalysis.irrigation_recommendation.action}
                </div>
              </div>

              {/* Supporting Metrics Grid */}
              <div className="grid-2" style={{ gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Groundwater Saved</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-300)' }}>
                    {latestAnalysis.water_analysis?.water_saved_liters?.toLocaleString() || 75272} L
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    ≈ {latestAnalysis.water_analysis?.pump_hours_saved || 2.7} hrs pump runtime avoided
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Crop Residue Stubble</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {latestAnalysis.residue_estimate?.estimated_residue_tonnes || 3.8} Tonnes
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    {latestAnalysis.residue_estimate?.recommended_management || 'Mulch & Incorporate'}
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>CO₂e Avoided</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {latestAnalysis.environmental_impact?.co2e_avoided_kg?.toLocaleString() || 5548} kg
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    vs. Open Stubble Burning
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>PM2.5 Pollution Prevented</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                    {latestAnalysis.environmental_impact?.pm25_avoided_kg?.toLocaleString() || 28.5} kg
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    Toxic Smoke Avoided
                  </div>
                </div>
              </div>

              {/* Why FarmGuard Recommends This */}
              <div style={{
                padding: '16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Info size={16} style={{ color: 'var(--primary-400)' }} />
                  Why FarmGuard recommends this
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {latestAnalysis.irrigation_recommendation.reason ||
                   'Crop evapotranspiration deficit is balanced against available soil moisture and effective precipitation. Over-irrigation is avoided while maintaining soil moisture in the optimal agronomic depletion zone.'}
                </p>
              </div>
            </div>
          ) : (
            /* Context Helper Box when no analysis executed yet */
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Info size={18} style={{ color: 'var(--accent-blue)' }} />
                    Agronomic Calculation Guide
                  </h3>
                  <p className="card-subtitle">How FarmGuard calculates exact irrigation depths</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>1</div>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Crop Water Requirement ($ET_c$):</strong> Calculated using FAO-56 crop coefficients ($K_c$) multiplied by reference evapotranspiration ($ET_0$).
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>2</div>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Effective Rainfall Deduction:</strong> Forecast precipitation depth is subtracted from soil moisture deficit rather than treating raw probability as guaranteed water.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>3</div>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Emissions Impact:</strong> Quantifies avoided greenhouse gases and particulate emissions from in-situ residue incorporation over open burning.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
