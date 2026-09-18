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
  Compass,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_REGIONS } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function WeatherPage({ setActivePage }) {
  const { farm, setFarm } = useFarm();
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

  // Build daily forecast list
  const dailyList = liveWeather?.daily ? liveWeather.daily.time.slice(0, 7).map((dateStr, idx) => {
    const rainMm = liveWeather.daily.precipitation_sum?.[idx] ?? 0;
    const prob = liveWeather.daily.precipitation_probability_max?.[idx] ?? 0;
    const tMax = liveWeather.daily.temperature_2m_max?.[idx] ?? 30;
    const tMin = liveWeather.daily.temperature_2m_min?.[idx] ?? 20;

    let action = 'Normal soil moisture monitoring';
    if (rainMm >= 15) {
      action = 'Postpone irrigation — Rain will satisfy crop demand';
    } else if (rainMm >= 5) {
      action = 'Reduce pump depth by forecast rain amount';
    } else if (prob >= 60) {
      action = 'Monitor cloud cover before activating pump';
    } else {
      action = 'Irrigate as calculated from soil deficit';
    }

    const dayName = idx === 0 ? 'Today' : (idx === 1 ? 'Tomorrow' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

    return {
      day: dayName,
      temp: `${Math.round(tMax)}°C / ${Math.round(tMin)}°C`,
      prob,
      rainMm: Number(rainMm.toFixed(1)),
      action
    };
  }) : [
    { day: 'Today', temp: '29°C / 18°C', prob: farm.rainfall_probability || 20, rainMm: farm.forecast_rainfall_mm || 0, action: 'Monitor soil moisture and irrigate according to calculated deficit' },
    { day: 'Tomorrow', temp: '30°C / 19°C', prob: 30, rainMm: 1.5, action: 'Normal soil moisture check' },
    { day: 'Day 3', temp: '28°C / 17°C', prob: 45, rainMm: 4.2, action: 'Adjust planned irrigation volume if showers occur' },
    { day: 'Day 4', temp: '27°C / 16°C', prob: 25, rainMm: 0.0, action: 'Standard field operations' },
    { day: 'Day 5', temp: '29°C / 18°C', prob: 10, rainMm: 0.0, action: 'Dry canopy conditions' },
    { day: 'Day 6', temp: '31°C / 20°C', prob: 10, rainMm: 0.0, action: 'Normal crop monitoring' },
    { day: 'Day 7', temp: '32°C / 21°C', prob: 15, rainMm: 0.0, action: 'Check root zone moisture' },
  ];

  const currentTemp = liveWeather?.current_weather?.temperature ? `${liveWeather.current_weather.temperature}°C` : '28.5°C';
  const currentWind = liveWeather?.current_weather?.windspeed ? `${liveWeather.current_weather.windspeed} km/h` : '12 km/h';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Region Selector Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>Regional Agricultural Weather</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {currentRegion.climate} • {currentRegion.lat}°N, {currentRegion.lon}°E
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Region:</span>
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
              {INDIAN_REGIONS.map(r => (
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

      {/* Hero Weather & Decision Translation Card */}
      <div className="grid-2">
        {/* Current Weather Snapshot */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CloudRain size={18} style={{ color: 'var(--accent-blue)' }} />
                Precipitation & Field Environment
              </h3>
              <p className="card-subtitle">{selectedRegionName} Agricultural Zone</p>
            </div>
            <Badge variant="info">Live Weather</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {farm.forecast_rainfall_mm !== null ? farm.forecast_rainfall_mm : (dailyList[0]?.rainMm ?? 0)} <span style={{ fontSize: '1.2rem', color: 'var(--accent-blue)' }}>mm</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                Forecast Precipitation Depth (24-48 hrs)
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {farm.rainfall_probability !== null ? farm.rainfall_probability : (dailyList[0]?.prob ?? 0)}%
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Rain Probability</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Current Temp</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentTemp}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Wind Speed</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentWind}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Selected Crop</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-300)', textTransform: 'capitalize' }}>
                {farm.crop || 'Not configured'}
              </div>
            </div>
          </div>
        </div>

        {/* Agronomic Decision Translation Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckCircle2 size={18} style={{ color: 'var(--primary-400)' }} />
                Agricultural Action Translation
              </h3>
              <p className="card-subtitle">How atmospheric data translates into water decisions</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '3px' }}>
                🌧️ Probability vs. Depth Principle
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                FarmGuard calculates irrigation based on forecast precipitation depth (mm), rather than treating high percentage probabilities as instant heavy rain.
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '3px' }}>
                ⚡ Pumping Energy Conservation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Crediting impending rain prevents over-saturation, saves groundwater extraction costs, and reduces carbon footprint from electric and diesel tubewells.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast & Agronomic Timeline */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: 'var(--primary-400)' }} />
              7-Day Agricultural Forecast & Action Advisory
            </h3>
            <p className="card-subtitle">Daily precipitation projections mapped to farm management</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dailyList.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 140px 100px 100px 1fr',
                alignItems: 'center',
                padding: '10px 14px',
                background: idx === 0 ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                gap: '12px'
              }}
            >
              <div style={{ fontWeight: 600, color: idx === 0 ? 'var(--primary-400)' : 'var(--text-main)' }}>
                {item.day}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {item.temp}
              </div>
              <div>
                <Badge variant={item.prob >= 50 ? 'warning' : 'info'}>
                  {item.prob}% Rain
                </Badge>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.rainMm > 0 ? 'var(--accent-blue)' : 'var(--text-subtle)' }}>
                {item.rainMm} mm
              </div>
              <div style={{ color: item.prob >= 60 ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
