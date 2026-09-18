import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  CloudRain,
  MapPin,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wind,
  ShieldCheck,
  RefreshCw,
  Info,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { analyzeFarm } from '../services/api';
import {
  SUPPORTED_CROPS,
  SUPPORTED_SOILS,
  SUPPORTED_REGIONS,
  DEMO_SCENARIOS
} from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function FarmAnalysisPage() {
  const {
    farm,
    setFarm,
    latestAnalysis,
    setLatestAnalysis,
    addActivity,
    loadExampleScenario,
    clearFarmData,
  } = useFarm();

  const [formData, setFormData] = useState({
    crop: farm.crop || 'wheat',
    area_acres: farm.area_acres || '',
    soil_type: farm.soil_type || 'alluvial',
    current_irrigation_mm: farm.current_irrigation_mm || '',
    location: farm.location || 'Uttar Pradesh',
    rainfall_probability: farm.rainfall_probability || 0,
    forecast_rainfall_mm: farm.forecast_rainfall_mm || 0,
    soil_moisture_percent: farm.soil_moisture_percent || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [error, setError] = useState(null);

  const selectedCropMeta = SUPPORTED_CROPS.find(c => c.id === formData.crop) || SUPPORTED_CROPS[0];

  const handleCropSelect = (cropId) => {
    setFormData(prev => {
      const newCrop = SUPPORTED_CROPS.find(c => c.id === cropId);
      return {
        ...prev,
        crop: cropId,
        // Set smart agronomic baseline defaults if empty
        current_irrigation_mm: prev.current_irrigation_mm || (newCrop ? newCrop.baseDepthMm : 50),
      };
    });
    // Invalidate stale previous analysis when changing crop
    if (latestAnalysis) {
      setLatestAnalysis(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('area') || name.includes('mm') || name.includes('percent') || name.includes('probability')
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  const handleFetchLiveWeather = async () => {
    setIsFetchingWeather(true);
    try {
      // Lookup coordinates for selected state
      const coordsMap = {
        'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
        'Punjab': { lat: 30.9010, lon: 75.8573 },
        'Haryana': { lat: 29.6857, lon: 76.9905 },
        'Bihar': { lat: 25.5941, lon: 85.1376 },
        'Madhya Pradesh': { lat: 23.2599, lon: 77.4126 },
        'Rajasthan': { lat: 26.9124, lon: 75.7873 },
        'Gujarat': { lat: 23.0225, lon: 72.5714 },
        'Maharashtra': { lat: 18.5204, lon: 73.8567 },
      };
      const loc = coordsMap[formData.location] || coordsMap['Uttar Pradesh'];
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`);
      if (res.ok) {
        const data = await res.json();
        const rainProb = data.daily?.precipitation_probability_max?.[0] || 20;
        const rainSum = data.daily?.precipitation_sum?.[0] || 0.0;
        setFormData(prev => ({
          ...prev,
          rainfall_probability: rainProb,
          forecast_rainfall_mm: rainSum,
        }));
      }
    } catch (err) {
      // Graceful non-blocking fallback
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleLoadDemo = (scenarioKey) => {
    loadExampleScenario(scenarioKey);
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (scenario) {
      setFormData({
        crop: scenario.crop,
        area_acres: scenario.area_acres,
        soil_type: scenario.soil_type,
        current_irrigation_mm: scenario.current_irrigation_mm,
        location: scenario.location,
        rainfall_probability: scenario.rainfall_probability,
        forecast_rainfall_mm: scenario.forecast_rainfall_mm,
        soil_moisture_percent: scenario.soil_moisture_percent,
      });
    }
    setError(null);
  };

  const handleReset = () => {
    clearFarmData();
    setFormData({
      crop: 'wheat',
      area_acres: '',
      soil_type: 'alluvial',
      current_irrigation_mm: '',
      location: 'Uttar Pradesh',
      rainfall_probability: 0,
      forecast_rainfall_mm: 0,
      soil_moisture_percent: '',
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.area_acres || Number(formData.area_acres) <= 0) {
      setError('Please enter a valid farm area in acres (> 0).');
      return;
    }
    if (formData.soil_moisture_percent === '' || Number(formData.soil_moisture_percent) < 0 || Number(formData.soil_moisture_percent) > 100) {
      setError('Please enter a valid soil moisture level between 0% and 100%.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        crop: formData.crop,
        area_acres: Number(formData.area_acres),
        soil_type: formData.soil_type,
        current_irrigation_mm: Number(formData.current_irrigation_mm || 50),
        location: formData.location,
        rainfall_probability: Number(formData.rainfall_probability || 0),
        forecast_rainfall_mm: formData.forecast_rainfall_mm !== '' ? Number(formData.forecast_rainfall_mm) : null,
        soil_moisture_percent: Number(formData.soil_moisture_percent),
      };

      const result = await analyzeFarm(payload);
      setLatestAnalysis(result);
      setFarm(payload);

      addActivity({
        type: 'ANALYSIS',
        title: `${selectedCropMeta.name} Optimization (${payload.area_acres} Acres in ${payload.location})`,
        location: payload.location,
        recommended_mm: result.irrigation_recommendation.recommended_irrigation_mm,
        water_saved_l: result.water_analysis?.water_saved_liters || 0,
        status: result.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'postponed' : 'success',
        requestId: `fg-${Date.now().toString(16).slice(-8)}`,
      });
    } catch (err) {
      setError(err.message || 'An error occurred connecting to the calculation engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Demo Scenario Helper Bar */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={16} style={{ color: 'var(--color-brand-light)' }} />
            <span><strong>Hackathon Evaluator:</strong> Test with your own farm data or load an example scenario:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.78rem', width: 'auto' }}
              onChange={(e) => e.target.value && handleLoadDemo(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Load Example Scenario...</option>
              <option value="wheat_up">Scenario 1: Wheat in Uttar Pradesh (Dry soil)</option>
              <option value="rice_punjab">Scenario 2: Rice in Punjab (Rain forecast)</option>
              <option value="maize_bihar">Scenario 3: Maize in Bihar (Low moisture)</option>
              <option value="sugarcane_maharashtra">Scenario 4: Sugarcane in Maharashtra</option>
            </select>

            <button className="btn btn-secondary" onClick={handleReset} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Input Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sprout size={18} style={{ color: 'var(--color-brand)' }} />
                Field & Crop Conditions
              </h3>
              <p className="card-subtitle">Input your farm parameters for deterministic water deficit calculation</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Step 1: Crop Selection */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px' }}>
                <span>1. Select Crop</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Backend Supported Crops</span>
              </label>
              <div className="crop-grid">
                {SUPPORTED_CROPS.map(c => (
                  <div
                    key={c.id}
                    className={`crop-card ${formData.crop === c.id ? 'selected' : ''}`}
                    onClick={() => handleCropSelect(c.id)}
                  >
                    <div className="crop-card-title">{c.name}</div>
                    <div className="crop-card-sub">{c.season}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {selectedCropMeta.description} (Target moisture: <strong>{selectedCropMeta.targetMoisture}%</strong>, Critical threshold: <strong>{selectedCropMeta.criticalMoisture}%</strong>)
              </div>
            </div>

            {/* Step 2: Field Details */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px' }}>
                <span>2. Field Dimensions & Location</span>
              </label>
              <div className="grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Field Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50000"
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
                    {SUPPORTED_REGIONS.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Soil & Moisture */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px' }}>
                <span>3. Soil Type & Current Moisture</span>
              </label>
              <div className="grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Soil Classification</label>
                  <select
                    name="soil_type"
                    className="form-select"
                    value={formData.soil_type}
                    onChange={handleChange}
                  >
                    {SUPPORTED_SOILS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Current Soil Moisture (%)</label>
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

              <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                <label className="form-label">Planned / Standard Irrigation Depth (mm)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="500"
                  name="current_irrigation_mm"
                  className="form-input"
                  value={formData.current_irrigation_mm}
                  onChange={handleChange}
                  placeholder={`e.g. ${selectedCropMeta.baseDepthMm}`}
                />
                <span className="form-helper">Baseline depth typically applied without optimization</span>
              </div>
            </div>

            {/* Step 4: Weather Signals */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  <span>4. Weather Forecast</span>
                </label>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleFetchLiveWeather}
                  disabled={isFetchingWeather}
                  style={{ padding: '2px 8px', fontSize: '0.74rem', color: 'var(--color-brand-light)' }}
                >
                  <CloudRain size={13} />
                  {isFetchingWeather ? 'Fetching Open-Meteo...' : 'Fetch Live Weather for Region'}
                </button>
              </div>

              <div className="grid-2">
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
                    max="500"
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
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--accent-rose-muted)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.84rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.94rem' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Calculating Deterministic Agronomic Math...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Calculate {selectedCropMeta.name} Irrigation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Output Presentation or Clean Empty State */}
        <div>
          {latestAnalysis ? (
            /* Result State */
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="card-header" style={{ margin: 0 }}>
                <div>
                  <h3 className="card-title">
                    <CheckCircle2 size={18} style={{ color: 'var(--color-brand)' }} />
                    {selectedCropMeta.name} Irrigation Result
                  </h3>
                  <p className="card-subtitle">
                    {formData.area_acres} acres in {formData.location} • {formData.soil_type}
                  </p>
                </div>
                <Badge variant={latestAnalysis.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'info' : 'success'}>
                  {latestAnalysis.irrigation_recommendation.status}
                </Badge>
              </div>

              {/* Primary Recommended Depth Hero */}
              <div style={{
                padding: '20px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', fontWeight: 700 }}>
                  Recommended Irrigation Depth
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  color: latestAnalysis.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'var(--accent-sky)' : 'var(--color-brand-light)',
                  lineHeight: 1.1,
                  margin: '6px 0'
                }}>
                  {latestAnalysis.irrigation_recommendation.recommended_irrigation_mm} <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>mm</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.4 }}>
                  {latestAnalysis.irrigation_recommendation.action}
                </div>
              </div>

              {/* Supporting Calculated Metrics Grid */}
              <div className="grid-2" style={{ gap: '10px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Groundwater Saved</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-brand-light)' }}>
                    {latestAnalysis.water_analysis?.water_saved_liters?.toLocaleString() || 0} L
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ≈ {latestAnalysis.water_analysis?.pump_hours_saved || 0} hrs pump time avoided
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Crop Residue</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    {latestAnalysis.residue_estimate?.estimated_residue_tonnes || 0} Tonnes
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {latestAnalysis.residue_estimate?.recommended_management || 'In-situ retention'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>CO₂e Avoided</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-sky)' }}>
                    {latestAnalysis.environmental_impact?.co2e_avoided_kg?.toLocaleString() || 0} kg
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    vs. Open Burning
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>PM2.5 Pollution Avoided</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                    {latestAnalysis.environmental_impact?.pm25_avoided_kg?.toLocaleString() || 0} kg
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Toxic Smog Prevented
                  </div>
                </div>
              </div>

              {/* Why This Recommendation */}
              <div style={{ padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.84rem' }}>
                  <Info size={15} style={{ color: 'var(--color-brand)' }} />
                  Why FarmGuard recommends this
                </div>
                <p style={{ fontSize: '0.80rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {latestAnalysis.irrigation_recommendation.reason}
                </p>
              </div>

              {/* Verified Farm Inputs Table */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '8px' }}>
                  Verified Analysis Inputs
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                  <div>Crop: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{formData.crop}</strong></div>
                  <div>Area: <strong style={{ color: 'var(--text-primary)' }}>{formData.area_acres} ac</strong></div>
                  <div>Moisture: <strong style={{ color: 'var(--text-primary)' }}>{formData.soil_moisture_percent}%</strong></div>
                  <div>Location: <strong style={{ color: 'var(--text-primary)' }}>{formData.location}</strong></div>
                  <div>Rain Prob: <strong style={{ color: 'var(--text-primary)' }}>{formData.rainfall_probability}%</strong></div>
                  <div>Rain Depth: <strong style={{ color: 'var(--text-primary)' }}>{formData.forecast_rainfall_mm || 0} mm</strong></div>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setLatestAnalysis(null)}
                style={{ width: '100%', padding: '10px' }}
              >
                Run Another Field Analysis
              </button>
            </div>
          ) : (
            /* Clean Empty State */
            <div className="empty-state">
              <div className="empty-state-icon">
                <Sprout size={24} />
              </div>
              <h3>Ready to analyze your field</h3>
              <p>
                Select your crop, enter your acreage and soil moisture, and FarmGuard will calculate the exact irrigation requirement using pure deterministic FAO-56 mathematics.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleLoadDemo('wheat_up')}
                >
                  <Sparkles size={14} />
                  Try Example Scenario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
