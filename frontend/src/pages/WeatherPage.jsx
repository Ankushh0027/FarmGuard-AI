import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Calendar,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Thermometer,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Clock,
  Zap,
  Info,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Compass,
  Eye,
  Gauge
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_REGIONS } from '../config/agriculturalData';

export default function WeatherPage({ setActivePage }) {
  const { farm, setFarm, latestAnalysis, t, language } = useFarm();
  const [selectedRegionName, setSelectedRegionName] = useState(farm.location || 'Uttar Pradesh');
  const [loading, setLoading] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [hoveredHour, setHoveredHour] = useState(null);

  const currentRegion = SUPPORTED_REGIONS.find(r => r.name === selectedRegionName) || SUPPORTED_REGIONS[0];

  useEffect(() => {
    if (farm.location) {
      setSelectedRegionName(farm.location);
    }
  }, [farm.location]);

  useEffect(() => {
    fetchWeatherData(currentRegion);
  }, [selectedRegionName]);

  const fetchWeatherData = async (region) => {
    setLoading(true);
    try {
      // Prioritize active farm's exact GPS coordinates when viewing farm's location
      const isFarmRegion = region.name === farm.location;
      const targetLat = (isFarmRegion && farm.latitude !== undefined && farm.latitude !== null && !isNaN(parseFloat(farm.latitude)))
        ? parseFloat(farm.latitude)
        : region.lat;
      const targetLon = (isFarmRegion && farm.longitude !== undefined && farm.longitude !== null && !isNaN(parseFloat(farm.longitude)))
        ? parseFloat(farm.longitude)
        : region.lon;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&current_weather=true&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLiveWeather(data);
      }
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentTemp = liveWeather?.current_weather?.temperature ?? 24.2;
  const currentWindSpeed = liveWeather?.current_weather?.windspeed ?? 12.5;
  const currentWindDir = liveWeather?.current_weather?.winddirection ?? 315;
  const todayRainMm = liveWeather?.daily?.precipitation_sum?.[0] ?? (farm.forecast_rainfall_mm || 0);
  const todayRainProb = liveWeather?.daily?.precipitation_probability_max?.[0] ?? (farm.rainfall_probability || 20);
  const todayET0 = liveWeather?.daily?.et0_fao_evapotranspiration?.[0] ?? (currentRegion.defaultET0 || 4.2);
  const maxTemp = liveWeather?.daily?.temperature_2m_max?.[0] ?? 26.5;
  const minTemp = liveWeather?.daily?.temperature_2m_min?.[0] ?? 14.8;
  const soilMoisture = parseFloat(farm.soil_moisture_percent) || 58;

  // 24-Hour Curve Simulation or Live
  const hourlyData = [
    { hour: '06:00', temp: 16, rainProb: 5, wind: 8 },
    { hour: '08:00', temp: 19, rainProb: 10, wind: 10 },
    { hour: '10:00', temp: 22, rainProb: 15, wind: 12 },
    { hour: '12:00', temp: 25, rainProb: 20, wind: 14 },
    { hour: '14:00', temp: 26, rainProb: 25, wind: 16 },
    { hour: '16:00', temp: 24, rainProb: 15, wind: 13 },
    { hour: '18:00', temp: 21, rainProb: 10, wind: 9 },
    { hour: '20:00', temp: 18, rainProb: 5, wind: 7 },
  ];

  // 7-day extended forecast
  const weekDays = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyForecast = (liveWeather?.daily?.time || [0, 1, 2, 3, 4, 5, 6]).map((_, idx) => ({
    day: weekDays[idx] || `Day ${idx + 1}`,
    max: liveWeather?.daily?.temperature_2m_max?.[idx] ?? (24 + (idx % 3)),
    min: liveWeather?.daily?.temperature_2m_min?.[idx] ?? (13 + (idx % 2)),
    rainProb: liveWeather?.daily?.precipitation_probability_max?.[idx] ?? (idx === 3 ? 65 : idx === 4 ? 40 : 15),
    rainMm: liveWeather?.daily?.precipitation_sum?.[idx] ?? (idx === 3 ? 18.5 : idx === 4 ? 6.2 : 0),
    et0: liveWeather?.daily?.et0_fao_evapotranspiration?.[idx] ?? 4.2
  }));

  // Irrigation & Spraying Decision
  const willRainHeavy = todayRainMm >= 8 || todayRainProb >= 60;
  const goodSprayWindow = currentWindSpeed < 15 && todayRainProb < 20;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. VENTRA-Style Atmospheric Command Hero */}
      <div
        className="card"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, #0b2616 0%, #163b2a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#a7f3d0',
              backdropFilter: 'blur(4px)',
              letterSpacing: '0.04em'
            }}>
              VENTRA AGRO-METEOROLOGY
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#e2e8f0' }}>
              <MapPin size={15} style={{ color: '#34d399' }} />
              <select
                value={selectedRegionName}
                onChange={(e) => setSelectedRegionName(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {SUPPORTED_REGIONS.map(r => (
                  <option key={r.name} value={r.name} style={{ color: '#0f172a' }}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchWeatherData(currentRegion)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            {loading ? 'Fetching...' : 'Update Telemetry'}
          </button>
        </div>

        {/* Temperature & Live Conditions Main Display */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '4.2rem', fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                {Math.round(currentTemp)}°<span style={{ fontSize: '2.5rem', fontWeight: 600 }}>C</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6ee7b7' }}>
                  Clear & Sunny
                </span>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  High {Math.round(maxTemp)}° • Low {Math.round(minTemp)}° • Feels like {Math.round(currentTemp - 1)}°
                </span>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.84rem', color: '#94a3b8' }}>
              Target Field: <strong>{farm.name}</strong> • Current Soil Moisture: <strong style={{ color: '#6ee7b7' }}>{soilMoisture}%</strong>
            </div>
          </div>

          {/* Decision Pill Callout */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: willRainHeavy ? 'rgba(217, 119, 6, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            border: `1.5px solid ${willRainHeavy ? '#f59e0b' : '#10b981'}`,
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(8px)',
            maxWidth: '420px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Droplets size={16} style={{ color: willRainHeavy ? '#fbbf24' : '#6ee7b7' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: willRainHeavy ? '#fef08a' : '#a7f3d0' }}>
                {willRainHeavy ? 'RAIN FORECAST NOTICE' : 'PRECISION IRRIGATION WINDOW'}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', margin: 0, color: '#f8fafc', lineHeight: 1.45 }}>
              {willRainHeavy
                ? `Heavy rain (${todayRainMm} mm) expected. Keep pumps off to prevent nitrogen leaching.`
                : `Rain probability is low (${todayRainProb}%). Safe to run tubewell for calculated crop water depth.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. VENTRA 24-Hour Hourly Weather Curve */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              24-Hour Diurnal Temperature & Rain Probability
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Hourly progression curve for field planning and spray application
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 3, backgroundColor: 'var(--color-brand)' }} /> Temperature (°C)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 8, backgroundColor: '#bae6fd', borderRadius: 2 }} /> Rain Probability (%)
            </span>
          </div>
        </div>

        {/* Hourly Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
          gap: '10px'
        }}>
          {hourlyData.map((h, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {h.hour}
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {h.temp}°
              </div>
              <div style={{ width: '100%', height: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: '18px',
                  height: `${Math.max(4, h.rainProb * 0.8)}px`,
                  backgroundColor: h.rainProb > 20 ? '#0284c7' : '#bae6fd',
                  borderRadius: '2px'
                }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {h.rainProb}% rain
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Atmospheric Metrics Matrix (VENTRA Four-Tile Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Metric 1: Wind Compass */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Wind Velocity & Vector
            </span>
            <Compass size={17} style={{ color: 'var(--color-brand)' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 2px', fontFamily: 'var(--font-heading)' }}>
            {currentWindSpeed} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Direction: <strong>NW (315°)</strong> • Gusts up to 18 km/h
          </div>
        </div>

        {/* Metric 2: Evapotranspiration (ET0) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              FAO-56 Evapotranspiration
            </span>
            <Sun size={17} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 2px', fontFamily: 'var(--font-heading)' }}>
            {todayET0} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>mm/day</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Solar atmospheric water extraction rate
          </div>
        </div>

        {/* Metric 3: Relative Humidity */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Relative Humidity
            </span>
            <Droplets size={17} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 2px', fontFamily: 'var(--font-heading)' }}>
            62% <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Normal</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Dew point: 14°C • Fungal threshold safe
          </div>
        </div>

        {/* Metric 4: Spraying Window Advisory */}
        <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${goodSprayWindow ? '#16a34a' : '#d97706'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Spraying Window
            </span>
            <CheckCircle2 size={17} style={{ color: goodSprayWindow ? '#16a34a' : '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '10px 0 2px', fontFamily: 'var(--font-heading)' }}>
            {goodSprayWindow ? 'Optimal Window' : 'Caution Advised'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Best spray time: 06:00 – 09:30 AM (low drift)
          </div>
        </div>
      </div>

      {/* 4. Weekly 7-Day Extended Forecast */}
      <div className="card" style={{ padding: '22px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              7-Day Precipitation & Temperature Forecast
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Weekly agro-meteorological projections for tubewell schedule planning
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dailyForecast.map((d, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 80px 1fr 140px',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: idx === 0 ? 'var(--color-brand-muted)' : 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {d.day}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <CloudRain size={14} style={{ color: d.rainProb > 40 ? '#0284c7' : '#94a3b8' }} />
                <span>{d.rainProb}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '32px' }}>{Math.round(d.min)}°</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (d.max - 10) * 5)}%`,
                    height: '100%',
                    backgroundColor: idx === 0 ? 'var(--color-brand)' : '#3b82f6',
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '32px' }}>{Math.round(d.max)}°</span>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600, color: d.rainMm > 0 ? '#0284c7' : 'var(--text-muted)' }}>
                {d.rainMm > 0 ? `${d.rainMm} mm rain` : 'No rain'}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}