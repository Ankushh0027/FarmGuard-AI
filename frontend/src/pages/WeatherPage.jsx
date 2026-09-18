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
  Clock
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_REGIONS } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function WeatherPage({ setActivePage }) {
  const { farm, setFarm, latestAnalysis } = useFarm();
  const [selectedRegionName, setSelectedRegionName] = useState(farm.location || 'Uttar Pradesh');
  const [loading, setLoading] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);

  const currentRegion = SUPPORTED_REGIONS.find(r => r.name === selectedRegionName) || SUPPORTED_REGIONS[0];

  useEffect(() => {
    fetchWeatherData(currentRegion);
  }, [selectedRegionName]);

  const fetchWeatherData = async (region) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
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

  const todayRainMm = liveWeather?.daily?.precipitation_sum?.[0] ?? (farm.forecast_rainfall_mm || 0);
  const todayRainProb = liveWeather?.daily?.precipitation_probability_max?.[0] ?? (farm.rainfall_probability || 20);
  const soilMoisture = parseFloat(farm.soil_moisture_percent) || 40;

  // Derive simple plain-English decision: YES / WAIT / NO
  let decision = 'YES';
  let decisionBadge = 'success';
  let decisionText = 'Irrigate as calculated';
  let decisionReason = 'Soil moisture is depleted and no heavy rain is forecast today.';

  if (todayRainMm >= 10 || todayRainProb >= 70) {
    decision = 'WAIT';
    decisionBadge = 'warning';
    decisionText = 'Wait — Rain Expected Soon';
    decisionReason = `A rain forecast of ${todayRainMm} mm (${todayRainProb}% chance) is expected. Waiting avoids over-saturating your field and saves tubewell electricity.`;
  } else if (soilMoisture >= 70) {
    decision = 'NO';
    decisionBadge = 'info';
    decisionText = 'No Irrigation Needed Today';
    decisionReason = `Your soil moisture is currently around ${soilMoisture}%, which is sufficient for root zone moisture.`;
  } else if (todayRainMm > 0 && todayRainMm < 10) {
    decision = 'REDUCED';
    decisionBadge = 'warning';
    decisionText = 'Apply Reduced Irrigation';
    decisionReason = `Light rain (${todayRainMm} mm) is expected. Subtract this rain amount from your normal pump depth.`;
  }

  // 7-day outlook list
  const dailyList = liveWeather?.daily ? liveWeather.daily.time.slice(0, 7).map((dateStr, idx) => {
    const rainMm = liveWeather.daily.precipitation_sum?.[idx] ?? 0;
    const prob = liveWeather.daily.precipitation_probability_max?.[idx] ?? 0;
    const tMax = liveWeather.daily.temperature_2m_max?.[idx] ?? 30;
    const tMin = liveWeather.daily.temperature_2m_min?.[idx] ?? 20;

    let action = 'Normal soil moisture monitoring';
    let statusBadge = 'info';

    if (rainMm >= 12 || prob >= 75) {
      action = '🌧️ Hold pump — Rain will satisfy water demand';
      statusBadge = 'warning';
    } else if (rainMm >= 4) {
      action = '🌦️ Reduce pump depth by forecast rain depth';
      statusBadge = 'warning';
    } else if (prob >= 50) {
      action = '☁️ Check cloud cover before activating tubewell';
      statusBadge = 'info';
    } else {
      action = '☀️ Irrigate according to calculated soil deficit';
      statusBadge = 'success';
    }

    const dayName = idx === 0 ? 'Today' : (idx === 1 ? 'Tomorrow' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

    return {
      day: dayName,
      temp: `${Math.round(tMax)}°C / ${Math.round(tMin)}°C`,
      prob,
      rainMm: Number(rainMm.toFixed(1)),
      action,
      statusBadge
    };
  }) : [
    { day: 'Today', temp: '29°C / 18°C', prob: farm.rainfall_probability || 20, rainMm: farm.forecast_rainfall_mm || 0, action: 'Irrigate as calculated from soil deficit', statusBadge: 'success' },
    { day: 'Tomorrow', temp: '30°C / 19°C', prob: 30, rainMm: 1.5, action: 'Normal soil moisture check', statusBadge: 'info' },
    { day: 'Day 3', temp: '28°C / 17°C', prob: 45, rainMm: 4.2, action: 'Adjust planned irrigation volume if showers occur', statusBadge: 'warning' },
    { day: 'Day 4', temp: '27°C / 16°C', prob: 25, rainMm: 0.0, action: 'Standard field operations', statusBadge: 'info' },
    { day: 'Day 5', temp: '29°C / 18°C', prob: 10, rainMm: 0.0, action: 'Dry canopy conditions', statusBadge: 'info' },
    { day: 'Day 6', temp: '31°C / 20°C', prob: 10, rainMm: 0.0, action: 'Normal crop monitoring', statusBadge: 'info' },
    { day: 'Day 7', temp: '32°C / 21°C', prob: 15, rainMm: 0.0, action: 'Check root zone moisture', statusBadge: 'info' },
  ];

  const currentTemp = liveWeather?.current_weather?.temperature ? `${liveWeather.current_weather.temperature}°C` : '28.5°C';
  const currentWind = liveWeather?.current_weather?.windspeed ? `${liveWeather.current_weather.windspeed} km/h` : '12 km/h';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Location Selector Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Should I Water Today?</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {currentRegion.name} • {currentRegion.climate}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Change Region:</span>
            <select
              className="form-select"
              style={{ width: '200px', padding: '7px 10px', fontSize: '0.85rem' }}
              value={selectedRegionName}
              onChange={(e) => {
                const newLoc = e.target.value;
                setSelectedRegionName(newLoc);
                setFarm(prev => ({ ...prev, location: newLoc }));
              }}
            >
              {SUPPORTED_REGIONS.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>

            <button
              className="btn btn-secondary"
              onClick={() => fetchWeatherData(currentRegion)}
              disabled={loading}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Primary Decision Banner: YES / WAIT / NO */}
      <div className="card" style={{
        padding: '28px',
        background: decision === 'WAIT'
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.95))'
          : (decision === 'NO'
            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(15, 23, 42, 0.95))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.95))'),
        borderColor: decision === 'WAIT' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              TODAY'S IRRIGATION DECISION
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {decisionText}
            </h2>
          </div>

          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            background: decision === 'WAIT' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: decision === 'WAIT' ? 'var(--accent-gold)' : 'var(--primary-300)',
            border: decision === 'WAIT' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)'
          }}>
            {decision}
          </div>
        </div>

        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          lineHeight: 1.6,
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.96rem', marginBottom: '4px' }}>
            Why this decision?
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            {decisionReason}
          </p>
        </div>

        <div className="grid-3">
          <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Forecast Rain Depth</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '2px 0' }}>
              {todayRainMm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mm</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Next 24-48 hours</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Rain Probability</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '2px 0' }}>
              {todayRainProb}%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Chance of precipitation</div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Current Temperature</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {currentTemp}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Wind: {currentWind}</div>
          </div>
        </div>
      </div>

      {/* 7-Day Action-Oriented Forecast */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: 'var(--primary-400)' }} />
              7-Day Field Watering Outlook
            </h3>
            <p className="card-subtitle">Daily precipitation projections mapped to farming actions</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dailyList.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 140px 100px 90px 1fr',
                alignItems: 'center',
                padding: '12px 16px',
                background: idx === 0 ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                gap: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: idx === 0 ? 'var(--primary-300)' : 'var(--text-main)' }}>
                {item.day}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {item.temp}
              </div>
              <div>
                <Badge variant={item.prob >= 60 ? 'warning' : 'info'}>
                  {item.prob}% Rain
                </Badge>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.rainMm > 0 ? 'var(--accent-blue)' : 'var(--text-subtle)' }}>
                {item.rainMm} mm
              </div>
              <div style={{ color: item.prob >= 60 ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Action Tips */}
      <div className="grid-2">
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            🌧️ Why Waiting Before Rain Saves Money
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Running a 5 HP tubewell for 4 hours costs electricity or ~7.2 Litres of diesel. If 15 mm of rain is due tomorrow, nature provides the water for free without nutrient leaching.
          </p>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            💧 Calculate Exact Water Depth
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Want an exact calculation tailored to your soil type and current field moisture?
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setActivePage?.('analysis')}
            style={{ marginTop: '10px', padding: '7px 14px', fontSize: '0.82rem' }}
          >
            Go to Check Water Need <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
