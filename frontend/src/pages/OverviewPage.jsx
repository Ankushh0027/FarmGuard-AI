import React, { useState } from 'react';
import {
  Droplets,
  Zap,
  Leaf,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  CloudRain,
  Sprout,
  AlertTriangle,
  Users,
  TrendingUp,
  MessageSquare,
  Gauge,
  FileText,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Compass,
  Layers,
  Thermometer,
  Wind,
  Info,
  Timer,
  Check,
  Activity,
  Bell,
  Sun,
  RotateCw,
  Calculator
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { DEMO_SCENARIOS, SUPPORTED_CROPS } from '../config/agriculturalData';
import { analyzeFarm } from '../services/api';
import Badge from '../components/Badge';
import WaterDemandChart from '../components/WaterDemandChart';
import SoilMoistureGauge from '../components/SoilMoistureGauge';

export default function OverviewPage({ setActivePage }) {
  const {
    farm,
    farms,
    activeFarmId,
    selectFarm,
    hasFarmProfile,
    latestAnalysis,
    setLatestAnalysis,
    activities,
    addActivity,
    t,
    language
  } = useFarm();

  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;

  // Handle instant 1-click water calculation directly from dashboard
  const handleQuickCalculate = async () => {
    setCalcLoading(true);
    setCalcError(null);
    try {
      const area = parseFloat(farm.area_acres) || 2.0;
      const moisture = farm.soil_moisture_percent !== '' ? parseFloat(farm.soil_moisture_percent) : 58.0;
      const payload = {
        crop: farm.crop || 'wheat',
        area_acres: area,
        soil_type: farm.soil_type || 'alluvial',
        soil_moisture_percent: moisture,
        current_irrigation_mm: farm.current_irrigation_mm ? parseFloat(farm.current_irrigation_mm) : 35.0,
        forecast_rainfall_mm: farm.forecast_rainfall_mm !== '' && farm.forecast_rainfall_mm !== null ? parseFloat(farm.forecast_rainfall_mm) : 0,
        rainfall_probability: farm.rainfall_probability ? parseFloat(farm.rainfall_probability) : 15,
        location: farm.location || 'Uttar Pradesh',
        pump_flow_lpm: farm.pump_flow_lpm ? parseFloat(farm.pump_flow_lpm) : 460,
      };

      const result = await analyzeFarm(payload);

      setLatestAnalysis({
        timestamp: new Date().toISOString(),
        data: result,
      });

      if (addActivity) {
        addActivity({
          title: `Water Need Check: ${(farm.crop || 'WHEAT').toUpperCase()}`,
          description: `${area} ac in ${farm.location || 'India'} (${farm.soil_type || 'alluvial'}) — Recommended: ${result.irrigation_recommendation?.recommended_irrigation_mm ?? 0} mm`,
          category: 'calculation',
          meta: {
            recommended_mm: result.irrigation_recommendation?.recommended_irrigation_mm,
            savings_liters: result.water_analysis?.water_savings_liters,
          }
        });
      }
    } catch (err) {
      console.error('Quick calculate failed:', err);
      setCalcError(language === 'hindi' ? 'गणना में समस्या हुई, कृपया पुनः प्रयास करें' : 'Calculation service busy. You can open the full workspace.');
    } finally {
      setCalcLoading(false);
    }
  };

  const calculatePumpTime = () => {
    if (!rec) return null;
    const mm = rec.recommended_irrigation_mm || 0;
    if (mm === 0) {
      return language === 'hindi' ? '0 घंटे (पंप बंद रखें)' : '0h (Hold)';
    }
    const area = parseFloat(farm.area_acres) || 2.0;
    const vol = waterAnalysis?.recommended_water_liters ?? Math.round(mm * area * 4046.8564);
    const flow = parseFloat(farm.pump_flow_lpm) || 460;
    const totalMinutes = Math.round(vol / flow);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  // Time-based greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12
    ? (language === 'hindi' ? 'सुप्रभात (नमस्ते)' : language === 'hinglish' ? 'Good Morning (Namaste)' : 'Good Morning')
    : hour < 17
      ? (language === 'hindi' ? 'शुभ दोपहर (नमस्ते)' : language === 'hinglish' ? 'Good Afternoon' : 'Good Afternoon')
      : (language === 'hindi' ? 'शुभ संध्या (नमस्ते)' : language === 'hinglish' ? 'Good Evening' : 'Good Evening');

  const todayFormatted = new Date().toLocaleDateString(language === 'hindi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const totalAcreage = farms.reduce((acc, f) => acc + (parseFloat(f.area_acres) || 0), 0).toFixed(1);
  const activeCropName = farm.crop ? farm.crop.toUpperCase() : 'WHEAT';
  const activeMoisture = farm.soil_moisture_percent !== '' ? Number(farm.soil_moisture_percent) : 58;

  // Traffic Light Recommendation state
  const getBannerConfig = () => {
    if (!rec) {
      return {
        type: 'prompt',
        bg: 'linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%)',
        border: 'var(--color-brand-border)',
        badgeBg: 'var(--color-brand-muted)',
        badgeColor: 'var(--color-brand-dark)',
        title: language === 'hindi' ? `${farm.name || 'खेत'} के लिए आज का सिंचाई चेक` : language === 'hinglish' ? `${farm.name || 'Khet'} ke liye aaj ka paani check` : `Check Today's Water Requirement for ${farm.name || 'Active Field'}`,
        actionText: language === 'hindi' ? 'अभी पानी की आवश्यकता निकालें' : language === 'hinglish' ? 'Abhi Paani Ki Zaroorat Check Karein' : 'Calculate Water Need Now',
        statusText: language === 'hindi' ? 'गणना के लिए तैयार' : 'READY TO ANALYZE'
      };
    }

    const s = (rec.status || '').toLowerCase();
    const mm = rec.recommended_irrigation_mm || 0;

    if (s.includes('optimal') || (mm === 0 && !s.includes('postpone') && !s.includes('rain'))) {
      return {
        type: 'optimal',
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
        border: '#a5d6a7',
        badgeBg: '#c8e6c9',
        badgeColor: '#1b5e20',
        title: language === 'hindi' ? 'मिट्टी में पर्याप्त नमी है — आज पानी न लगाएं' : language === 'hinglish' ? 'Mitti me paryapt nami hai — Aaj paani na lagayein' : 'Optimal Soil Moisture — Hold Irrigation',
        actionText: language === 'hindi' ? 'पंप बंद रखें और बिजली/डीजल बचाएं' : language === 'hinglish' ? 'Pump band rakhein, bijli aur diesel bachega' : 'Hold irrigation. Root-zone moisture is sufficient.',
        statusText: language === 'hindi' ? 'इष्टतम नमी (Optimal)' : 'OPTIMAL MOISTURE'
      };
    }

    if (s.includes('postpone') || s.includes('rain') || s.includes('delay')) {
      return {
        type: 'postpone',
        bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '#fde68a',
        badgeBg: '#fef3c7',
        badgeColor: '#b45309',
        title: language === 'hindi' ? 'बारिश आने वाली है — पंप बंद रखें!' : language === 'hinglish' ? 'Baarish aane wali hai — Pump band rakhein!' : 'Postpone Irrigation — Rain Forecast Sufficient',
        actionText: rec.action || (language === 'hindi' ? 'प्राकृतिक बारिश का इंतजार करें, अतिरिक्त पानी से खाद बह सकती है।' : 'Wait for forecasted rainfall to recharge soil.'),
        statusText: language === 'hindi' ? 'बारिश से बचत (Postpone)' : 'POSTPONE FOR RAIN'
      };
    }

    return {
      type: 'irrigate',
      bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: '#fecaca',
      badgeBg: '#fee2e2',
      badgeColor: '#b91c1c',
      title: language === 'hindi' ? `सिंचाई की आवश्यकता है: ${mm} मिमी पानी लगाएं` : language === 'hinglish' ? `Sinchai ki zaroorat: ${mm} mm paani dein` : `Irrigation Recommended: Apply ${mm} mm Depth`,
      actionText: rec.action || (language === 'hindi' ? `ट्यूबवेल चलाकर खेत में ${mm} मिमी पानी दें।` : `Run your tubewell to satisfy ${mm} mm deficit.`),
      statusText: language === 'hindi' ? 'सिंचाई आवश्यक (Irrigate Now)' : 'IRRIGATE NOW'
    };
  };

  const banner = getBannerConfig();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Executive Farmer Greeting & Agro-Context Strip */}
      <div className="card" style={{
        padding: '18px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {timeGreeting}, Ramesh Patel 👋
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-muted)',
              color: 'var(--color-brand-dark)',
              border: '1px solid var(--color-brand-border)'
            }}>
              RABI SEASON 2026
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {todayFormatted} • Managing {farms.length} fields ({totalAcreage} acres total) in {farm.location || 'Uttar Pradesh'}
          </p>
        </div>

        {/* Quick Weather Telemetry Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '8px 16px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sun size={18} style={{ color: '#d97706' }} />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>24°C</span>
          </div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CloudRain size={16} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>15% Rain</span>
          </div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wind size={15} style={{ color: '#475569' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>12 km/h</span>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Total Land & Crop Distribution */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--color-brand)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'कुल सिंचित भूमि' : 'Total Cultivated Land'}
            </span>
            <Sprout size={16} style={{ color: 'var(--color-brand)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px', fontFamily: 'var(--font-heading)' }}>
            {totalAcreage} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Acres</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {farms.length} Active Plots • Wheat, Rice, Maize
          </div>
        </div>

        {/* KPI 2: Crop Health Index */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'फसल स्वास्थ्य' : 'Crop Health Index'}
            </span>
            <Activity size={16} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px', fontFamily: 'var(--font-heading)' }}>
            88% <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>Vigorous</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            NDVI 0.74 • Canopy cover 82%
          </div>
        </div>

        {/* KPI 3: Root-Zone Soil Moisture */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'सक्रिय खेत में नमी' : 'Active Soil Moisture'}
            </span>
            <Droplets size={16} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px', fontFamily: 'var(--font-heading)' }}>
            {activeMoisture}% <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Adequate</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Target: 65% • Critical: 40%
          </div>
        </div>

        {/* KPI 4: Water & Cost Conserved */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'अनुमानित जल बचत' : 'Water & Cost Saved'}
            </span>
            <Zap size={16} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 2px', fontFamily: 'var(--font-heading)' }}>
            320K <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Litres</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            ~₹4,800 electricity & diesel saved
          </div>
        </div>
      </div>

      {/* 3. Traffic Light Hero Decision & Calculate Water Need Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: banner.bg,
          border: `1.5px solid ${banner.border}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: banner.badgeBg,
              color: banner.badgeColor,
              fontWeight: 800,
              fontSize: '0.74rem',
              letterSpacing: '0.04em'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: banner.badgeColor }} />
              {banner.statusText}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {farm.name} • {activeCropName} ({farm.area_acres || 2.0} ac)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleQuickCalculate}
              disabled={calcLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-brand)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: calcLoading ? 'wait' : 'pointer',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <Droplets size={16} className={calcLoading ? 'spin' : ''} />
              {calcLoading
                ? (language === 'hindi' ? 'गणना हो रही है...' : 'Calculating...')
                : rec
                  ? (language === 'hindi' ? 'पुनः गणना करें' : 'Recalculate Water')
                  : (language === 'hindi' ? 'अभी पानी की आवश्यकता निकालें' : 'Calculate Water Need Now')}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('irrigation')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                color: 'var(--color-brand-dark)',
                border: '1px solid var(--border-default)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {language === 'hindi' ? 'विस्तृत स्टूडियो' : 'Full Calculator'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)', lineHeight: 1.3 }}>
            {banner.title}
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '820px' }}>
            {rec
              ? (banner.actionText)
              : (language === 'hindi'
                  ? `वर्तमान में जड़ क्षेत्र में नमी ${activeMoisture}% है (${(farm.soil_type || 'alluvial').toUpperCase()} मिट्टी)। आज ${farm.forecast_rainfall_mm || 0} मिमी बारिश का अनुमान है। सटीक पानी और ट्यूबवेल के घंटे जानने के लिए ऊपर 'Calculate Water Need Now' पर क्लिक करें।`
                  : `Root-zone soil moisture is ${activeMoisture}% in ${(farm.soil_type || 'alluvial').toUpperCase()} soil with ${farm.forecast_rainfall_mm || 0} mm rain forecast. Click 'Calculate Water Need Now' to evaluate precise depth (mm) and pump duration.`)}
          </p>
        </div>

        {/* Error notification if quick calculation had issue */}
        {calcError && (
          <div style={{
            padding: '8px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: '#b91c1c'
          }}>
            {calcError}
          </div>
        )}

        {/* Dynamic Telemetry / Results Bar */}
        {rec ? (
          /* Post-Calculation Result Metrics Strip */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'सिंचाई गहराई' : 'Recommended Depth'}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-brand)', marginTop: '2px' }}>
                {rec.recommended_irrigation_mm || 0} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>mm</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {rec.recommended_irrigation_mm === 0 ? 'Sufficient moisture' : 'Field deficit satisfied'}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'आवश्यक पानी' : 'Total Water Volume'}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {Math.round(waterAnalysis?.recommended_water_liters ?? (rec.recommended_irrigation_mm * (farm.area_acres || 2) * 4046.8564)).toLocaleString()}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>L</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Across {farm.area_acres || 2} acres
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'ट्यूबवेल समय' : 'Pump Runtime'}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {calculatePumpTime()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                @{farm.pump_flow_lpm || 460} L/min discharge
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'बचाया गया पानी' : 'Water Conserved'}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                {Math.round(waterAnalysis?.water_savings_liters || 0).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>L</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {waterAnalysis?.water_savings_percent || 0}% vs flood irrigation
              </div>
            </div>
          </div>
        ) : (
          /* Pre-Calculation Telemetry Overview Strip (Never empty!) */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'जड़ क्षेत्र नमी' : 'Root Moisture'}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: activeMoisture < 40 ? '#dc2626' : 'var(--color-brand)', marginTop: '2px' }}>
                {activeMoisture}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Target: 65% • Critical: 40%
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? '24 घंटे बारिश' : '24h Rainfall Forecast'}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {farm.forecast_rainfall_mm || 0} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>mm</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {farm.rainfall_probability || 15}% precipitation chance
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'ट्यूबवेल क्षमता' : 'Tubewell Pump'}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {farm.pump_flow_lpm || 460} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>L/min</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Standard {farm.pump_hp || 5} HP electric motor
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'मिट्टी का प्रकार' : 'Soil Profile'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', textTransform: 'capitalize' }}>
                {farm.soil_type || 'Alluvial'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Retention factor: 1.00x
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Telemetry Split: Performance Chart & Soil Moisture Gauge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {/* Left: 7-Day Precision Water Demand vs Rain Chart */}
        <WaterDemandChart currentNeedMm={rec?.recommended_irrigation_mm || 22.0} />

        {/* Right: Active Field Status & Soil Moisture Gauge */}
        <div className="card" style={{
          padding: '22px 24px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={18} style={{ color: 'var(--color-brand)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {language === 'hindi' ? 'सक्रिय खेत की जड़ क्षेत्र नमी' : 'Root-Zone Moisture Gauge'}
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {farm.soil_type?.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Continuous root profile monitoring for {farm.name}
            </p>
          </div>

          <SoilMoistureGauge
            moisturePercent={activeMoisture}
            criticalThreshold={40}
            targetCapacity={65}
            size={190}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem'
          }}>
            <span><strong>Soil Drainage:</strong> Moderate-Slow</span>
            <span><strong>Holding Factor:</strong> 1.00x</span>
          </div>
        </div>
      </div>

      {/* 5. Active Farm Plots Grid */}
      <div className="card" style={{ padding: '22px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              {language === 'hindi' ? 'आपके पंजीकृत खेत व फसलें' : 'Registered Farm Plots'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Click any field to switch active dashboard context
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('farms')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Manage All Plots <ChevronRight size={15} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {farms.map((f) => {
            const isSelected = f.id === farm.id;
            return (
              <div
                key={f.id}
                onClick={() => selectFarm(f.id)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {f.name}
                  </span>
                  {isSelected && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-brand)',
                      color: '#ffffff'
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>{f.crop?.toUpperCase()} • {f.area_acres} Acres</span>
                  <span>{f.soil_type}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Moisture: <strong>{f.soil_moisture_percent || 55}%</strong></span>
                  <span>{f.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Real-Time Risk Alerts & Important AI Recommendations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Left: Active Farm Alerts */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0 }}>
                {language === 'hindi' ? 'सक्रिय खेत अलर्ट' : 'Real-Time Farm Alerts'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #dc2626',
              backgroundColor: '#fef2f2',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '2px' }}>
                Heavy Rain Forecasted (35–45 mm)
              </div>
              <div style={{ color: '#7f1d1d' }}>
                Postpone all tubewell pumping for next 36 hours. Clear field drainage furrows.
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid #d97706',
              backgroundColor: '#fffbeb',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '2px' }}>
                Yellow Rust Vulnerability Window
              </div>
              <div style={{ color: '#78350f' }}>
                Morning humidity above 80% creates favorable fungal conditions for wheat.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Important AI Recommendations */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-brand)' }} />
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0 }}>
                {language === 'hindi' ? 'AI कृषि सलाहकार की सिफारिशें' : 'AI Farm Intelligence'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('advisor')}
              style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Ask Advisor
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#f8faf9',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                🌾 Crown Root Initiation Stage (CRI)
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Wheat sown on Oct 25 is currently in active tillering. Maintain 50–60% root moisture to support nodal root development.
              </p>
              <button
                type="button"
                onClick={() => setActivePage('advisor')}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Ask how to manage CRI stage →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Recent Activity Audit Trail */}
      {activities && activities.length > 0 && (
        <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {language === 'hindi' ? 'हाल की गतिविधियां' : 'Recent Farm Activity'}
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activities.slice(0, 3).map((act) => (
              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span>{act.title}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}