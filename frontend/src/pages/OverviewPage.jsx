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
  RotateCcw,
  CloudRain,
  Sprout
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
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Core First Screen Hero */}
      <div className="card" style={{
        padding: '36px 32px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'var(--color-brand-muted)',
            border: '1px solid var(--color-brand-border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-brand-dark)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            🌾 Agricultural Decision Support Tool
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '14px'
          }}>
            How much water does my crop need?
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '24px',
            maxWidth: '680px'
          }}>
            FarmGuard uses your crop, field conditions and weather information to estimate an irrigation requirement — helping you avoid unnecessary pumping, save water, and reduce electricity costs.
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
              How It Works
            </button>
          </div>
        </div>
      </div>

      {/* 2. What FarmGuard Helps You Understand (3 Benefit Blocks) */}
      <div>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            What FarmGuard Helps You Understand
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Simple, actionable insights to guide your daily field watering decisions.
          </p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--accent-sky)' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-sky-muted)',
              color: 'var(--accent-sky)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Droplets size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              💧 Water Needed
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              How much water your field actually needs based on soil moisture and upcoming rain.
            </p>
          </div>

          <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-amber-muted)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              ⚡ Pumping & Electricity
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Understand your tubewell pumping hours and potential electricity cost savings.
            </p>
          </div>

          <div className="card" style={{ padding: '22px', borderLeft: '4px solid var(--color-brand)' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-brand-muted)',
              color: 'var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <Leaf size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              🌱 Environmental Impact
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              See the positive impact of groundwater conservation and avoided pumping carbon emissions.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Numbered 5-Step Visual Farmer Guide */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
            How FarmGuard Works (Step-by-Step)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Follow 5 simple steps to calculate a precision water plan for your field.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Step 1
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Your Crop
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              What are you growing? (Wheat, Rice, Maize, Sugarcane)
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Step 2
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Your Field
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              How big is your field? (e.g. 0.5, 1.25, 2.5 acres)
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Step 3
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Field Conditions
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              How wet is the soil? (Dry, Moderate, Wet)
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Step 4
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Weather
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Is rain expected? (Auto-checked from live forecast)
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--color-brand-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-border)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-brand-dark)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Step 5
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-brand-dark)', marginBottom: '4px' }}>
              Your Result
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              FarmGuard calculates water depth (mm) & pumping time.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Field Water Plan or Demo Scenarios */}
      {latestAnalysis && rec ? (
        <div className="card" style={{
          padding: '24px',
          border: '2px solid var(--color-brand)',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>
                Latest Water Plan for Your Field
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                {farm.crop} • {farm.area_acres} Acres in {farm.location}
              </h3>
            </div>
            <Badge variant="success">
              {rec.status}
            </Badge>
          </div>

          <div className="grid-3" style={{ margin: '14px 0' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>RECOMMENDED WATER</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand-dark)' }}>
                {rec.recommended_irrigation_mm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>mm</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ≈ {waterAnalysis?.recommended_irrigation_liters ? `${waterAnalysis.recommended_irrigation_liters.toLocaleString()} L` : '—'}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>WATER YOU SAVE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-sky)' }}>
                {waterAnalysis?.water_savings_liters ? `${waterAnalysis.water_savings_liters.toLocaleString()} L` : '0 L'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {waterAnalysis?.water_savings_percent ? `${waterAnalysis.water_savings_percent}% reduction` : 'Precision depth'}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>PUMP TIME SAVED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {waterAnalysis?.pump_hours_saved ? `${waterAnalysis.pump_hours_saved} hrs` : '0 hrs'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ≈ {waterAnalysis?.electricity_saved_kwh ? `${waterAnalysis.electricity_saved_kwh} kWh electricity` : 'Standard tubewell'}
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
                Enter your field size and crop in Check Water Need, or try an example field below:
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setActivePage?.('analysis')} style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
              Start with My Field <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Demo Scenarios for Judges */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
              Try an Example Field:
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
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand)';
                    e.currentTarget.style.backgroundColor = 'var(--color-brand-muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {item.crop} in {item.location}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
