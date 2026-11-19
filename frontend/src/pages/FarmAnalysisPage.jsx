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
  Timer,
  Info,
  Layers,
  Sparkles,
  TrendingDown,
  BarChart3,
  Check,
  BookOpen
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
import SoilMoistureGauge from '../components/SoilMoistureGauge';
import { getSoilMoistureGuide, getPumpFlowGuide } from '../utils/i18n';

const CROP_IMAGES = {
  wheat: '/images/crop_wheat.jpg',
  rice: '/images/crop_rice.jpg',
  maize: '/images/crop_maize.jpg',
  sugarcane: '/images/crop_sugarcane.jpg',
};

export default function FarmAnalysisPage({ setActivePage }) {
  const {
    farm,
    setFarm,
    farms,
    selectFarm,
    latestAnalysis,
    setLatestAnalysis,
    addActivity,
    loadExampleScenario,
    clearFarmData,
    t,
    language
  } = useFarm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSuccess, setWeatherSuccess] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showPumpOptions, setShowPumpOptions] = useState(false);
  const [showFlowHelper, setShowFlowHelper] = useState(false);
  const [showMoistureGuide, setShowMoistureGuide] = useState(false);

  // Flow helper container state
  const [containerLitres, setContainerLitres] = useState(200);
  const [fillSeconds, setFillSeconds] = useState(26);

  // Soil moisture and pump guides
  const moistureGuide = getSoilMoistureGuide(language);
  const pumpGuide = getPumpFlowGuide(language);

  // Handle live weather fetch from Open-Meteo
  const handleFetchWeather = async () => {
    setWeatherLoading(true);
    setError(null);
    try {
      // Prioritize farm's saved GPS coordinates, fallback to regional centroid
      const regionData = SUPPORTED_REGIONS.find(r => r.name === farm.location) || SUPPORTED_REGIONS[0];
      const targetLat = (farm.latitude !== undefined && farm.latitude !== null && !isNaN(parseFloat(farm.latitude)))
        ? parseFloat(farm.latitude)
        : regionData.lat;
      const targetLon = (farm.longitude !== undefined && farm.longitude !== null && !isNaN(parseFloat(farm.longitude)))
        ? parseFloat(farm.longitude)
        : regionData.lon;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&daily=precipitation_sum,precipitation_probability_max&current_weather=true&timezone=auto`;
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
      setError(t.errSelectCrop || 'Please select a crop (Wheat, Rice, Maize, or Sugarcane).');
      return;
    }

    const area = parseFloat(farm.area_acres);
    if (!area || isNaN(area) || area <= 0) {
      setError(t.errValidArea || 'Please enter a valid field size greater than 0 (e.g., 1.5, 2.0 acres).');
      return;
    }

    const moisture = parseFloat(farm.soil_moisture_percent);
    if (isNaN(moisture) || moisture < 0 || moisture > 100) {
      setError(t.errValidMoisture || 'Please provide soil moisture between 0% and 100%.');
      return;
    }

    setLoading(true);

    const payload = {
      crop: farm.crop,
      area_acres: area,
      soil_type: farm.soil_type || 'alluvial',
      soil_moisture_percent: moisture,
      current_irrigation_mm: farm.current_irrigation_mm ? parseFloat(farm.current_irrigation_mm) : 35.0,
      forecast_rainfall_mm: farm.forecast_rainfall_mm !== '' && farm.forecast_rainfall_mm !== null ? parseFloat(farm.forecast_rainfall_mm) : null,
      rainfall_probability: farm.rainfall_probability ? parseFloat(farm.rainfall_probability) : 0,
      location: farm.location || 'Uttar Pradesh',
      pump_flow_lpm: farm.pump_flow_lpm ? parseFloat(farm.pump_flow_lpm) : null,
    };

    try {
      const result = await analyzeFarm(payload);

      setLatestAnalysis({
        timestamp: new Date().toISOString(),
        data: result,
      });

      // Add to activity audit log
      addActivity({
        title: `Field Water Plan: ${farm.crop.toUpperCase()}`,
        description: `${area} ac in ${farm.location || 'India'} (${farm.soil_type}) — Recommended: ${result.irrigation_recommendation?.recommended_irrigation_mm ?? 0} mm`,
        category: 'calculation',
        meta: {
          recommended_mm: result.irrigation_recommendation?.recommended_irrigation_mm,
          savings_liters: result.water_analysis?.water_savings_liters,
        }
      });
    } catch (err) {
      setError(t.errServerBusy || 'Calculation service is busy. Please verify field values and try again.');
    } finally {
      setLoading(false);
    }
  };

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;
  const assumptions = analysis?.assumptions || [];

  // Volumetric math
  const recommendedMm = rec?.recommended_irrigation_mm ?? 0;
  const areaAcres = parseFloat(farm.area_acres) || 1.0;
  const waterVolLiters = waterAnalysis?.recommended_water_liters ?? Math.round(recommendedMm * areaAcres * 4046.8564);

  // Baseline flood irrigation estimation for comparison
  const selectedCropObj = SUPPORTED_CROPS.find(c => c.id === farm.crop) || SUPPORTED_CROPS[0];
  const baselineFloodMm = selectedCropObj?.baseDepthMm || 60;
  const baselineFloodLiters = Math.round(baselineFloodMm * areaAcres * 4046.8564);
  const litersSaved = Math.max(0, baselineFloodLiters - waterVolLiters);
  const savingsPct = baselineFloodLiters > 0 ? Math.round((litersSaved / baselineFloodLiters) * 100) : 0;

  // Pump time calculation
  let pumpTimeText = null;
  let pumpTimeDetail = null;
  const pumpFlowLpm = parseFloat(farm.pump_flow_lpm);

  if (waterVolLiters === 0) {
    pumpTimeText = '0 ' + (language === 'hindi' ? 'घंटे (पंप बंद रखें)' : 'Hours (Keep Off)');
    pumpTimeDetail = language === 'hindi'
      ? 'मिट्टी में पर्याप्त नमी है, आज पंप चलाने की आवश्यकता नहीं'
      : language === 'hinglish'
        ? 'Mitti mein paryapt nami hai, aaj pump na chalayein'
        : 'Current soil moisture and rainfall fulfill root zone demand';
  } else if (pumpFlowLpm && pumpFlowLpm > 0) {
    const totalMinutes = Math.round(waterVolLiters / pumpFlowLpm);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    pumpTimeText = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
    pumpTimeDetail = `${pumpFlowLpm.toLocaleString()} L/min discharge`;
  } else if (waterAnalysis?.diesel_or_electricity_savings_hours) {
    const hours = Number(waterAnalysis.diesel_or_electricity_savings_hours);
    pumpTimeText = `~${hours} ` + (language === 'hindi' ? 'घंटे' : 'Hours');
    pumpTimeDetail = language === 'hindi' ? 'मानक 5 HP पंप (~460 ली/मिनट) पर आधारित' : 'Based on 5 HP tubewell (~460 L/min)';
  } else {
    // Standard 5HP estimate (460 L/min)
    const totalMins = Math.round(waterVolLiters / 460);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    pumpTimeText = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
    pumpTimeDetail = language === 'hindi' ? 'मानक 5 HP पंप (~460 ली/मिनट) पर आधारित' : 'Based on standard 5 HP pump (~460 L/min)';
  }

  // Container flow test helper
  const estimatedHelperFlow = (containerLitres > 0 && fillSeconds > 0)
    ? Math.round((parseFloat(containerLitres) / parseFloat(fillSeconds)) * 60)
    : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          padding: '22px 28px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-brand)', letterSpacing: '0.04em', marginBottom: '4px' }}>
              <Calculator size={13} />
              {t.analysisTitle || 'Field Water Need Calculator'}
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px', letterSpacing: '-0.02em' }}>
              {language === 'hindi'
                ? 'खेत के पानी और पंप के समय की गणना'
                : language === 'hinglish'
                  ? 'Khet Ke Paani Aur Pump Time Ka Hisaab'
                  : 'Calculate Water Need & Tubewell Runtime'}
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, maxWidth: '640px' }}>
              {t.analysisSubtitle || 'Enter your crop, land size, and soil to calculate the exact litres of water and pump hours needed.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Active Field Selector */}
            {farms && farms.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-brand)', fontWeight: 800 }}>
                  {language === 'hindi' ? 'सक्रिय खेत:' : 'Field:'}
                </span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem', fontWeight: 700, borderColor: 'var(--color-brand)' }}
                  value={farm.id || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      selectFarm(e.target.value);
                    }
                  }}
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop.toUpperCase()} - {f.area_acres} ac)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 700 }}>
                {language === 'hindi' ? 'डेमो उदाहरण:' : language === 'hinglish' ? 'Demo Udaharan:' : 'Demo Preset:'}
              </span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem', fontWeight: 600 }}
                onChange={(e) => {
                  if (e.target.value) {
                    loadExampleScenario(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>{language === 'hindi' ? 'उदाहरण चुनें...' : 'Load Demo Field...'}</option>
                {Object.entries(DEMO_SCENARIOS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert in Plain Language */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-danger)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} />
          <span><strong>{language === 'hindi' ? 'कृपया जांचें:' : language === 'hinglish' ? 'Kripya check karein:' : 'Please check:'}</strong> {error}</span>
        </div>
      )}

      {/* SPLIT-SCREEN WORKSPACE */}
      <div className="analysis-split-grid">
        {/* LEFT PANEL: FIELD PARAMETERS & CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: CROP SELECTION */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sprout size={18} style={{ color: 'var(--color-brand)' }} />
                  {t.cropSelection || '1. Choose Your Crop'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {t.cropSelectionDesc || 'Select the crop you are growing in your field.'}
                </p>
              </div>
              <Badge variant="neutral">ICAR Validated</Badge>
            </div>

            <div className="crop-selection-grid">
              {SUPPORTED_CROPS.map((c) => {
                const isSelected = farm.crop === c.id;
                const cropImg = CROP_IMAGES[c.id];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setFarm(prev => ({ ...prev, crop: c.id }));
                      if (latestAnalysis) setLatestAnalysis(null);
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(27, 83, 46, 0.15)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '140px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '12px',
                      background: '#111827'
                    }}
                  >
                    {/* Background Crop Image */}
                    {cropImg && (
                      <img
                        src={cropImg}
                        alt={c.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: isSelected ? 0.75 : 0.45,
                          transition: 'opacity 0.2s ease, transform 0.3s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1.0)'
                        }}
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(13, 40, 24, 0.95) 0%, rgba(13, 40, 24, 0.35) 60%, transparent 100%)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'var(--color-brand)',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          zIndex: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Check size={12} />
                        {language === 'hindi' ? 'चुनी गई' : 'Selected'}
                      </div>
                    )}

                    {/* Text Details */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {c.name.split(' ')[0]} <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>({c.season.split(' ')[0]})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#d1fae5', marginTop: '2px', fontWeight: 600 }}>
                        Base: {c.baseDepthMm} mm • Target: {c.targetMoisture}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: FIELD ACREAGE SLIDER & INPUT */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-sky)' }} />
                {t.fieldAreaLabel || 'Field Size in Acres'}
              </h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-brand-dark)', background: 'var(--color-brand-muted)', padding: '3px 10px', borderRadius: 'var(--radius-sm)' }}>
                {farm.area_acres || 0} {t.acres || 'Acres'}
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              {t.fieldAreaHelper || 'How many acres is this plot? (1 acre = ~40 guntha / 43,560 sq ft / ~4–5 bigha)'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.25"
                  value={farm.area_acres || 2.0}
                  onChange={(e) => setFarm(prev => ({ ...prev, area_acres: parseFloat(e.target.value) }))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--color-brand)',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '130px' }}>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="500"
                    className="form-input"
                    style={{ fontSize: '1rem', fontWeight: 700, padding: '7px 10px', textAlign: 'center' }}
                    value={farm.area_acres}
                    onChange={(e) => setFarm(prev => ({ ...prev, area_acres: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.acres || 'Acres'}</span>
                </div>
              </div>

              {/* Quick Select Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 700 }}>
                  {language === 'hindi' ? 'त्वरित चयन:' : 'Quick:'}
                </span>
                {[0.5, 1.0, 2.0, 2.5, 5.0, 10.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFarm(prev => ({ ...prev, area_acres: val }))}
                    style={{
                      padding: '3px 9px',
                      fontSize: '0.75rem',
                      background: Number(farm.area_acres) === val ? 'var(--color-brand-muted)' : 'var(--bg-surface-subtle)',
                      border: Number(farm.area_acres) === val ? '1px solid var(--color-brand-border)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: Number(farm.area_acres) === val ? 'var(--color-brand-dark)' : 'var(--text-muted)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {val} ac
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: SOIL TEXTURE */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: 'var(--color-brand)' }} />
                {t.soilTypeLabel || 'Soil Type (Mitti Ka Prakaar)'}
              </h3>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              {t.soilTypeHelper || 'Select the soil in your field to calibrate water holding capacity.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { id: 'alluvial', label: language === 'hindi' ? 'जलोढ़ / दोमट' : 'Alluvial', desc: 'Gangetic loam', tag: language === 'hindi' ? 'अच्छा पानी सोखती है' : 'Holds Good Water' },
                { id: 'loamy', label: language === 'hindi' ? 'दोमट' : 'Loamy', desc: 'Balanced soil', tag: language === 'hindi' ? 'संतुलित नमी' : 'Balanced Moisture' },
                { id: 'sandy loam', label: language === 'hindi' ? 'बलुई दोमट' : 'Sandy Loam', desc: 'Light soil', tag: language === 'hindi' ? 'जल्दी सूखती है' : 'Drains Quickly' },
                { id: 'clayey', label: language === 'hindi' ? 'चिकनी मिट्टी' : 'Clayey', desc: 'Heavy soil', tag: language === 'hindi' ? 'पानी देर तक रखती है' : 'Heavy Water Hold' },
                { id: 'black', label: language === 'hindi' ? 'काली मिट्टी' : 'Black Soil', desc: 'Regur', tag: language === 'hindi' ? 'लंबे समय तक नमी' : 'Holds Long' },
              ].map((s) => {
                const isSelected = farm.soil_type === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFarm(prev => ({ ...prev, soil_type: s.id }))}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                      background: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', color: isSelected ? 'var(--color-brand-dark)' : 'var(--text-main)' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {s.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: SOIL MOISTURE SLIDER & STATUS */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets size={18} style={{ color: 'var(--color-brand)' }} />
                {t.soilMoistureLabel || 'Current Soil Moisture (%)'}
              </h3>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: Number(farm.soil_moisture_percent) < 40 ? 'var(--status-danger)' : 'var(--color-brand-dark)',
                background: Number(farm.soil_moisture_percent) < 40 ? '#fef2f2' : 'var(--color-brand-muted)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {farm.soil_moisture_percent || 0}% {Number(farm.soil_moisture_percent) < 40 ? (language === 'hindi' ? 'सूखा' : 'Dry') : (language === 'hindi' ? 'नमी' : 'Moisture')}
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 14px' }}>
              {t.soilMoistureHelper || "Don't have a sensor? Use the 6-inch hand-feel ball test: crumbly = <40%, holds shape = 55–65%, muddy = >80%."}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="range"
                min="10"
                max="95"
                step="1"
                value={farm.soil_moisture_percent || 38}
                onChange={(e) => setFarm(prev => ({ ...prev, soil_moisture_percent: parseFloat(e.target.value) }))}
                style={{
                  width: '100%',
                  accentColor: Number(farm.soil_moisture_percent) < 40 ? '#dc2626' : 'var(--color-brand)',
                  cursor: 'pointer'
                }}
              />

              {/* Tactile Condition Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { pct: 25, title: language === 'hindi' ? 'सूखी मिट्टी' : language === 'hinglish' ? 'Sookhi Mitti' : 'Dry & Crumbly', desc: '<40% (Water needed)' },
                  { pct: 60, title: language === 'hindi' ? 'सही नमी' : language === 'hinglish' ? 'Sahi Nami' : 'Moist / Good', desc: '55–65% (Holds ball)' },
                  { pct: 85, title: language === 'hindi' ? 'गीली / कीचड़' : language === 'hinglish' ? 'Geeli Mitti' : 'Wet / Saturated', desc: '>80% (Keep pump off)' },
                ].map(preset => (
                  <button
                    key={preset.pct}
                    type="button"
                    onClick={() => setFarm(prev => ({ ...prev, soil_moisture_percent: preset.pct }))}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: Number(farm.soil_moisture_percent) === preset.pct ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                      background: Number(farm.soil_moisture_percent) === preset.pct ? 'var(--color-brand-muted)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>{preset.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>{preset.desc}</div>
                  </button>
                ))}
              </div>

              {/* 6-Inch Hand-Ball Test Interactive Helper */}
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowMoistureGuide(!showMoistureGuide)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-brand-dark)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} style={{ color: 'var(--color-brand)' }} />
                    <span>{moistureGuide.title}</span>
                  </div>
                  {showMoistureGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showMoistureGuide && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {moistureGuide.steps.map((st, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-brand)' }}>{i + 1}.</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: REGIONAL WEATHER & RAIN FORECAST */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloudRain size={18} style={{ color: 'var(--accent-sky)' }} />
                  {language === 'hindi' ? '5. मौसम और बारिश का अनुमान' : language === 'hinglish' ? '5. Mausam Aur Baarish Ka Anuman' : '5. Weather & Rain Forecast'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleFetchWeather}
                disabled={weatherLoading}
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CloudRain size={14} className={weatherLoading ? 'spin' : ''} />
                {weatherLoading ? (language === 'hindi' ? 'मौसम लोड हो रहा है...' : 'Syncing...') : (weatherSuccess ? '✓ Synced!' : (language === 'hindi' ? 'लाइव मौसम जोड़ें' : 'Sync Live Weather'))}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>
                  {language === 'hindi' ? 'राज्य / क्षेत्र' : 'State / Region'}
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.84rem' }}
                  value={farm.location}
                  onChange={(e) => setFarm(prev => ({ ...prev, location: e.target.value }))}
                >
                  {SUPPORTED_REGIONS.map(r => (
                    <option key={r.name} value={r.name}>{r.name} ({r.climate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>
                  {t.rainProbLabel || 'Rain Probability (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                  value={farm.rainfall_probability}
                  onChange={(e) => setFarm(prev => ({ ...prev, rainfall_probability: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.76rem' }}>
                  {t.rainForecastLabel || 'Expected Rainfall (mm)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.5"
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                  value={farm.forecast_rainfall_mm ?? ''}
                  placeholder="0.0"
                  onChange={(e) => setFarm(prev => ({ ...prev, forecast_rainfall_mm: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: PUMP FLOW RATE (OPTIONAL) */}
          <div className="card" style={{ padding: '16px 20px' }}>
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
                fontWeight: 750,
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Timer size={17} style={{ color: 'var(--accent-amber)' }} />
                <span>{t.pumpSection || '4. Tubewell Pump Flow (Optional)'}</span>
              </div>
              {showPumpOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showPumpOptions && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    className="form-input"
                    style={{ fontSize: '0.94rem', fontWeight: 700, width: '140px' }}
                    placeholder="460"
                    value={farm.pump_flow_lpm || ''}
                    onChange={(e) => setFarm(prev => ({ ...prev, pump_flow_lpm: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {language === 'hindi' ? 'लीटर प्रति मिनट (मानक 5 HP: ~460 ली/मिनट)' : 'Litres / Minute (Default: 460 L/min for 5 HP pump)'}
                  </span>
                </div>

                {/* Farmer Drum container fill test */}
                <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setShowFlowHelper(!showFlowHelper)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-brand-dark)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: 0
                    }}
                  >
                    <Calculator size={14} />
                    <span>{pumpGuide.title}</span>
                    {showFlowHelper ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {showFlowHelper && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {pumpGuide.explanation}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>Drum:</span>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px', padding: '5px 8px', fontSize: '0.82rem' }}
                            value={containerLitres}
                            onChange={(e) => setContainerLitres(e.target.value)}
                          />
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>L</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>Time:</span>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: '80px', padding: '5px 8px', fontSize: '0.82rem' }}
                            value={fillSeconds}
                            onChange={(e) => setFillSeconds(e.target.value)}
                          />
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>sec</span>
                        </div>
                        {estimatedHelperFlow > 0 && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setFarm(prev => ({ ...prev, pump_flow_lpm: estimatedHelperFlow }))}
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            Apply {estimatedHelperFlow} L/min
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        {pumpGuide.example}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY CALCULATE CTA */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              data-action="calculate-water"
              onClick={handleCalculate}
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '16px 28px',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(27, 83, 46, 0.35)'
              }}
            >
              <Droplets size={20} className={loading ? 'spin' : ''} />
              {loading ? (t.calculatingBtn || 'Calculating Water Requirement...') : (t.calculateBtn || 'Calculate Water Need')}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFarmData}
              style={{ padding: '16px 18px' }}
              title={t.reset || 'Reset fields'}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: REAL-TIME AGRONOMIC PRESCRIPTION & VISUALIZATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analysis && rec ? (
            /* RESULTS DISPLAY */
            <div className="card fade-in" style={{ padding: '28px', border: '2px solid var(--color-brand)', boxShadow: 'var(--shadow-md)' }}>
              {analysis.is_client_fallback && (
                <div className="offline-notice-banner" style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} />
                    <span><strong>{language === 'hindi' ? 'ऑफलाइन मॉडल:' : 'Offline Model:'}</strong> {language === 'hindi' ? 'प्रमाणित स्थानीय गणना मॉडल द्वारा मूल्यांकित।' : 'Evaluated using verified local agronomic rules.'}</span>
                  </div>
                  <span className="simulation-pill">{t.offlineBadge || 'Offline Engine'}</span>
                </div>
              )}

              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                    {language === 'hindi' ? 'आज की खेत सलाह' : language === 'hinglish' ? 'Aaj Ka Khet Faisla' : 'FIELD WATER PLAN'}
                  </div>
                  <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                    {farm.crop} {language === 'hindi' ? 'का खेत' : 'Field'} ({farm.area_acres} {t.acres || 'ac'})
                  </h2>
                </div>

                <div
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: rec.recommended_irrigation_mm === 0 ? 'var(--accent-sky-muted)' : 'var(--color-brand-muted)',
                    border: rec.recommended_irrigation_mm === 0 ? '1px solid var(--accent-sky-border)' : '1px solid var(--color-brand-border)',
                    color: rec.recommended_irrigation_mm === 0 ? 'var(--accent-sky-dark)' : 'var(--color-brand-dark)',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{rec.status}</span>
                </div>
              </div>

              {/* Plain Language Actionable Recommendation */}
              <div
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                  lineHeight: 1.55
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '4px' }}>
                  🌾 {language === 'hindi' ? 'किसान के लिए सलाह:' : language === 'hinglish' ? 'Kisan Ke Liye Salah:' : "Today's Recommendation:"}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                  {rec.explanation}
                </p>
              </div>

              {/* 3 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                {/* 1. Irrigation Depth */}
                <div style={{ padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800 }}>
                    {t.depthNeeded || 'Water Depth Needed'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: '4px 0' }}>
                    {recommendedMm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mm</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {language === 'hindi' ? 'जड़ों की सही गहराई तक पानी' : 'Restores root zone moisture'}
                  </div>
                </div>

                {/* 2. Total Litres */}
                <div style={{ padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800 }}>
                    {t.totalWaterNeeded || 'Total Water Needed'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-sky-dark)', margin: '4px 0' }}>
                    {waterVolLiters.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>L</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {language === 'hindi' ? `पूरे ${farm.area_acres} एकड़ के लिए` : `For ${farm.area_acres} acres`}
                  </div>
                </div>

                {/* 3. Pump Runtime */}
                <div style={{ padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 800 }}>
                    {t.pumpRuntime || 'Tubewell Pump Runtime'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber-dark)', margin: '4px 0' }}>
                    {pumpTimeText}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {pumpTimeDetail}
                  </div>
                </div>
              </div>

              {/* VISUAL WATER VOLUME COMPARISON */}
              <div style={{ padding: '18px 20px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart3 size={16} style={{ color: 'var(--color-brand)' }} />
                    {language === 'hindi'
                      ? 'पानी की तुलना: अंधाधुंध बहाव बनाम सटीक सिंचाई'
                      : language === 'hinglish'
                        ? 'Paani Ki Tulna: Khula Bahaav vs FarmGuard Sahi Paani'
                        : 'Water Comparison: Conventional Flood vs Precision'}
                  </div>
                  {savingsPct > 0 && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-brand-dark)', background: 'var(--color-brand-muted)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      ↓ {savingsPct}% {language === 'hindi' ? 'बचत' : 'Conserved'}
                    </span>
                  )}
                </div>

                {/* Dual Bar Comparison */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Traditional Flood Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span>{language === 'hindi' ? 'पारंपरिक खुला बहाव' : 'Conventional Flood Irrigation'} ({baselineFloodMm} mm)</span>
                      <strong>{baselineFloodLiters.toLocaleString()} L</strong>
                    </div>
                    <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: '#94a3b8' }} />
                    </div>
                  </div>

                  {/* Precision Plan Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                        {language === 'hindi' ? 'FarmGuard सटीक पानी' : 'FarmGuard Precision Water'} ({recommendedMm} mm)
                      </span>
                      <strong style={{ color: 'var(--color-brand-dark)' }}>{waterVolLiters.toLocaleString()} L</strong>
                    </div>
                    <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, (waterVolLiters / Math.max(1, baselineFloodLiters)) * 100))}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #1b532e 0%, #34d399 100%)',
                          borderRadius: 'var(--radius-full)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--color-brand-dark)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingDown size={14} />
                  <span>
                    {language === 'hindi'
                      ? `इस बार लगभग ${litersSaved.toLocaleString()} लीटर भूजल की बचत होगी।`
                      : language === 'hinglish'
                        ? `Is sinchai mein lagbhag ${litersSaved.toLocaleString()} Litres ground water bachega.`
                        : `Conserves ~${litersSaved.toLocaleString()} Litres of groundwater this cycle.`}
                  </span>
                </div>
              </div>

              {/* ROOT MOISTURE GAUGE & RAIN BALANCE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <SoilMoistureGauge
                    moisturePercent={farm.soil_moisture_percent || 38}
                    criticalThreshold={selectedCropObj?.criticalMoisture || 40}
                    targetCapacity={selectedCropObj?.targetMoisture || 65}
                    size={160}
                    label={language === 'hindi' ? 'जड़ क्षेत्र में नमी' : 'Root-Zone Moisture'}
                  />
                </div>

                <div style={{ padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {language === 'hindi' ? 'बारिश और पर्यावरण लाभ' : 'Rain & Environmental Savings'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <div>• {language === 'hindi' ? 'बारिश से बचा पानी:' : 'Rain Credit:'} <strong>{rec.expected_rain_offset_mm || 0} mm</strong></div>
                    <div>• {language === 'hindi' ? 'मौसम स्थिति:' : 'Forecast Status:'} <strong>{rec.rain_forecast_status || 'Dry'}</strong></div>
                  </div>
                  {envImpact && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-brand-dark)', background: 'var(--color-brand-muted)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                      🌿 {language === 'hindi'
                        ? `डीजल/बिजली से ${envImpact.co2e_avoided_kg} किग्रा कार्बन उत्सर्जन की रोकथाम।`
                        : `Avoids ~${envImpact.co2e_avoided_kg} kg CO₂e pump emissions.`}
                    </div>
                  )}
                </div>
              </div>

              {/* Expandable Scientific Calculation Details */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0
                  }}
                >
                  {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showTechnicalDetails ? (language === 'hindi' ? 'वैज्ञानिक विवरण छुपाएं' : 'Hide Technical Formula') : (language === 'hindi' ? 'वैज्ञानिक गणना सूत्र व आधार देखें (FAO-56)' : 'View Scientific Formula & Calculation Details')}</span>
                </button>

                {showTechnicalDetails && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '14px 16px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div><strong>Formula:</strong> $I_{net} = \max(0, ET_c - P_e - \Delta S)$</div>
                    <div><strong>Volume:</strong> $V = I_{net} \times \text{Acres} \times 4046.86\text{ L/mm-ac}$</div>
                    <div><strong>Request ID:</strong> {analysis.request_id || 'LOCAL-EXEC-CALC'}</div>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {assumptions.map((a, i) => (
                        <li key={i}>{a.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick Jump Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setActivePage?.('weather')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  <CloudRain size={14} />
                  {t.navWeather || 'Weather'}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage?.('savings')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  <Droplets size={14} />
                  {t.navSavings || 'Savings'}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage?.('advisor')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  <Sparkles size={14} />
                  {t.navAdvisor || 'Ask AI'}
                </button>
              </div>
            </div>
          ) : (
            /* EMPTY / READY-TO-CALCULATE PREVIEW STATE */
            <div
              className="card"
              style={{
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-surface-subtle) 100%)',
                border: '1px dashed var(--border-default)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-brand-muted)',
                  color: 'var(--color-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Droplets size={30} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                {language === 'hindi'
                  ? 'खेत के पानी का हिसाब लगाने के लिए तैयार'
                  : language === 'hinglish'
                    ? 'Khet Ke Paani Ka Hisaab Lagane Ke Liye Ready'
                    : 'Ready to Calculate Water Need'}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 0 20px', lineHeight: 1.5 }}>
                {language === 'hindi'
                  ? 'बाईं तरफ अपनी फसल, खेत का आकार और मिट्टी की नमी चुनें, फिर "पानी की जरूरत निकालें" पर क्लिक करें।'
                  : language === 'hinglish'
                    ? 'Left side apni fasal, khet ka size aur mitti ki nami bharein, fir "Calculate Water Need" button dabayein.'
                    : 'Choose your crop, field acreage, and soil moisture on the left, then click Calculate to see your exact water plan.'}
              </p>

              <div
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.84rem' }}>
                  {language === 'hindi' ? 'वर्तमान खेत का विवरण:' : 'Selected Field Details:'}
                </div>
                <div>• {language === 'hindi' ? 'फसल:' : 'Crop:'} <strong style={{ color: 'var(--color-brand-dark)', textTransform: 'capitalize' }}>{farm.crop || 'Wheat'}</strong> ({selectedCropObj?.baseDepthMm || 50} mm base depth)</div>
                <div>• {language === 'hindi' ? 'खेत का आकार:' : 'Field Area:'} <strong>{farm.area_acres || 2.0} {t.acres || 'Acres'}</strong></div>
                <div>• {language === 'hindi' ? 'मिट्टी का प्रकार:' : 'Soil Type:'} <strong style={{ textTransform: 'capitalize' }}>{farm.soil_type || 'alluvial'}</strong></div>
                <div>• {language === 'hindi' ? 'वर्तमान नमी:' : 'Current Moisture:'} <strong>{farm.soil_moisture_percent || 38}%</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
