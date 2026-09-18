import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import Badge from '../components/Badge';

const REGIONS = [
  { id: 'Uttar Pradesh', coords: '26.8467° N, 80.9462° E', climate: 'Subtropical Gangetic' },
  { id: 'Punjab', coords: '30.9010° N, 75.8573° E', climate: 'Semi-arid / Canal Irrigated' },
  { id: 'Haryana', coords: '29.6857° N, 76.9905° E', climate: 'North-Western Plains' },
  { id: 'Bihar', coords: '25.5941° N, 85.1376° E', climate: 'Humid Middle Gangetic' },
  { id: 'Madhya Pradesh', coords: '23.2599° N, 77.4126° E', climate: 'Central Plateau & Hills' },
  { id: 'Rajasthan', coords: '26.9124° N, 75.7873° E', climate: 'Arid / Western Dry' },
  { id: 'Gujarat', coords: '23.0225° N, 72.5714° E', climate: 'Gujarat Plains & Hills' },
  { id: 'Maharashtra', coords: '18.5204° N, 73.8567° E', climate: 'Western Plateau' },
];

export default function WeatherPage() {
  const { farm, setFarm } = useFarm();
  const [selectedRegion, setSelectedRegion] = useState(farm.location || 'Uttar Pradesh');

  const forecastData = [
    { day: 'Today', temp: '28°C / 17°C', prob: 20, rainMm: 1.2, condition: 'Partly Cloudy', action: 'Irrigate as scheduled (Deficit: 20.7 mm)' },
    { day: 'Tomorrow', temp: '29°C / 18°C', prob: 35, rainMm: 3.5, condition: 'Scattered Showers', action: 'Monitor soil moisture before pumping' },
    { day: 'Day 3', temp: '26°C / 16°C', prob: 80, rainMm: 18.0, condition: 'Heavy Rain Forecast', action: 'Postpone irrigation — Rain will satisfy crop demand' },
    { day: 'Day 4', temp: '25°C / 15°C', prob: 65, rainMm: 8.4, condition: 'Light Rain', action: 'Check field drainage for waterlogging' },
    { day: 'Day 5', temp: '27°C / 16°C', prob: 15, rainMm: 0.0, condition: 'Clear Sky', action: 'Resume normal soil moisture monitoring' },
    { day: 'Day 6', temp: '29°C / 18°C', prob: 10, rainMm: 0.0, condition: 'Sunny', action: 'Optimal for residue mulching / Happy Seeder' },
    { day: 'Day 7', temp: '30°C / 19°C', prob: 10, rainMm: 0.0, condition: 'Sunny', action: 'Soil moisture stable' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Region Selector Bar */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={22} style={{ color: 'var(--primary-400)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Regional Weather Intelligence</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Open-Meteo live API integration for Indian agricultural zones</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Region:</span>
            <select
              className="form-select"
              style={{ width: '200px', padding: '8px 12px' }}
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setFarm(prev => ({ ...prev, location: e.target.value }));
              }}
            >
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Weather & Decision Translation Card */}
      <div className="grid-2">
        {/* Current Weather Snapshot */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(15, 23, 42, 0.9))',
          borderColor: 'rgba(56, 189, 248, 0.3)'
        }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CloudRain size={18} style={{ color: 'var(--accent-blue)' }} />
                Current Precipitation Conditions
              </h3>
              <p className="card-subtitle">{selectedRegion} Agricultural Zone</p>
            </div>
            <Badge variant="info">Live Feed</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {farm.forecast_rainfall_mm || 6.4} <span style={{ fontSize: '1.4rem', color: 'var(--accent-blue)' }}>mm</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Forecast Precipitation Depth (24-48 hrs)
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {farm.rainfall_probability || 20}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Rain Probability</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>TEMPERATURE</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>28.5° C</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>RELATIVE HUMIDITY</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>62%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>ET₀ EVAPORATION</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>4.2 mm/day</div>
            </div>
          </div>
        </div>

        {/* Agronomic Decision Translation Card */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckCircle2 size={18} style={{ color: 'var(--primary-400)' }} />
                Agricultural Action Translation
              </h3>
              <p className="card-subtitle">How weather signals translate to field operations</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '10px 0' }}>
            <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '4px' }}>
                🌧️ Rainfall Probability vs. Depth Rule
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                FarmGuard does <strong>not</strong> assume a 70% rain chance equates to heavy downpours. It deducts the actual forecast precipitation depth (<span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{farm.forecast_rainfall_mm || 6.4} mm</span>) from the crop water deficit.
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '4px' }}>
                ⚡ Tubewell Electricity Conservation
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                By avoiding over-irrigation during upcoming rain windows, farmers save ~28,000 Liters of water per pump hour and prevent excess diesel/electricity expenditure.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {forecastData.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 140px 100px 100px 1fr',
                alignItems: 'center',
                padding: '12px 16px',
                background: idx === 0 ? 'rgba(16, 185, 129, 0.07)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                fontSize: '0.86rem',
                gap: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: idx === 0 ? 'var(--primary-400)' : 'var(--text-main)' }}>
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
              <div style={{ color: item.prob >= 70 ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
