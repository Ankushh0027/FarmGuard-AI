import React from 'react';
import {
  Droplets,
  Zap,
  Leaf,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  CloudRain
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { DEMO_SCENARIOS } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function OverviewPage({ setActivePage }) {
  const {
    farm,
    hasFarmProfile,
    latestAnalysis,
    loadExampleScenario,
    clearFarmData
  } = useFarm();

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Core Farmer-First Hero Section */}
      <div className="card" style={{
        padding: '36px 32px',
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary-300)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            🌱 Farmer-First Agricultural Decision Tool
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '14px'
          }}>
            Use only the water your crop needs.
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '24px',
            maxWidth: '660px'
          }}>
            Tell us about your crop and field. FarmGuard calculates your exact irrigation need and shows how much water, tubewell pump time, and electricity you can save.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => setActivePage?.('analysis')}
              style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
            >
              <Droplets size={18} />
              Check My Water Need
              <ArrowRight size={16} />
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setActivePage?.('architecture')}
              style={{ padding: '12px 20px', fontSize: '0.95rem' }}
            >
              See How It Works
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Immediate Benefit Blocks */}
      <div className="grid-3">
        <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(56, 189, 248, 0.12)',
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Droplets size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            💧 Save Water
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Know how much water your crop actually needs. Avoid excess flooding that damages roots and wastes groundwater.
          </p>
        </div>

        <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            ⚡ Save Electricity
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Less unnecessary pumping means shorter tubewell runtime, lower electricity bills, and less diesel motor fuel.
          </p>
        </div>

        <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--primary-400)' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--primary-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Leaf size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            🌱 Help the Environment
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Using less water and power stabilizes local aquifers and prevents unnecessary carbon emissions.
          </p>
        </div>
      </div>

      {/* 3. Three Core Questions Answered */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            How FarmGuard Works For You
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Simple answers to common questions about your field water management.
          </p>
        </div>

        <div className="grid-3">
          <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
              1. What does it do?
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              FarmGuard tells you how much water your crop may need.
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              It checks your crop type, soil moisture, and local weather forecast to give a clear watering recommendation.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
              2. Why use it?
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              To avoid giving more water than necessary.
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Over-watering wastes electricity, washes away expensive fertilizer, and harms crop root health.
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px' }}>
              3. What do I get?
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Water plan + water saved + pump impact.
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              You receive exact water depth (mm), volume (Litres), estimated pump hours, and electricity savings.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Field Status or Initial Invitation */}
      {latestAnalysis && rec ? (
        <div className="card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.9))',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                Latest Water Plan for Your Field
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                {farm.crop} • {farm.area_acres} Acres in {farm.location}
              </h3>
            </div>
            <Badge variant={rec.status.toLowerCase().includes('hold') || rec.status.toLowerCase().includes('reduced') ? 'info' : 'success'}>
              {rec.status}
            </Badge>
          </div>

          <div className="grid-3" style={{ margin: '14px 0' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>RECOMMENDED WATER</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-300)' }}>
                {rec.recommended_irrigation_mm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mm</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ≈ {waterAnalysis?.recommended_irrigation_liters ? `${waterAnalysis.recommended_irrigation_liters.toLocaleString()} L` : '—'}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>WATER YOU SAVE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                {waterAnalysis?.water_savings_liters ? `${waterAnalysis.water_savings_liters.toLocaleString()} L` : '0 L'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {waterAnalysis?.water_savings_percent ? `${waterAnalysis.water_savings_percent}% reduction` : 'Optimized application'}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>PUMP TIME SAVED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {waterAnalysis?.pump_hours_saved ? `${waterAnalysis.pump_hours_saved} hrs` : '0 hrs'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ≈ {waterAnalysis?.electricity_saved_kwh ? `${waterAnalysis.electricity_saved_kwh} kWh saved` : 'Standard tubewell'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => setActivePage?.('analysis')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              View Full Water Plan <ArrowRight size={14} />
            </button>
            <button className="btn btn-secondary" onClick={() => setActivePage?.('savings')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              View Electricity & Savings
            </button>
          </div>
        </div>
      ) : (
        /* Empty State with Quick Example Scenario Buttons for Judges / Farmers */
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                🌾 Ready to Calculate for Your Field?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Choose your crop and soil to get an immediate water plan, or load a sample regional field below:
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setActivePage?.('analysis')} style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
              Start with My Field <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Demo Scenarios for Judges */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
              Try an Example Field (For Judges & Demo):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {Object.entries(DEMO_SCENARIOS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    loadExampleScenario(key);
                    setActivePage?.('analysis');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-400)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {item.crop} in {item.location}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.area_acres} Acres • {item.soil_type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
