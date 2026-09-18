import React from 'react';
import {
  Sprout,
  CloudRain,
  Droplets,
  Bot,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Leaf
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import Badge from '../components/Badge';

export default function OverviewPage({ setActivePage }) {
  const { farm, latestAnalysis, activities } = useFarm();

  const recommendedMm = latestAnalysis
    ? latestAnalysis.irrigation_recommendation.recommended_irrigation_mm
    : 20.7;

  const isPostponed = recommendedMm === 0.0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Status Cards Grid */}
      <div className="grid-4">
        {/* Farm Status Card */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <span className="card-subtitle">FARM PROFILE</span>
            <Badge variant="success" icon={CheckCircle2}>Active</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, textTransform: 'capitalize' }}>
              {farm.crop}
            </span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>({farm.area_acres} Acres)</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {farm.location} • <span style={{ textTransform: 'capitalize' }}>{farm.soil_type} Soil</span>
          </div>
        </div>

        {/* Weather Snapshot Card */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <span className="card-subtitle">WEATHER SNAPSHOT</span>
            <Badge variant={farm.rainfall_probability > 50 ? 'warning' : 'info'}>
              {farm.rainfall_probability}% Rain Chance
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800 }}>
              {farm.forecast_rainfall_mm || 6.4} mm
            </span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Forecast Rain</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Soil Moisture: {farm.soil_moisture_percent}% (Monitored)
          </div>
        </div>

        {/* Irrigation Status Card */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <span className="card-subtitle">IRRIGATION STATUS</span>
            <Badge variant={isPostponed ? 'info' : 'success'}>
              {isPostponed ? 'Postponed' : 'Optimized'}
            </Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-400)' }}>
              {recommendedMm} mm
            </span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Recommended</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isPostponed ? 'Rain satisfies water deficit' : 'Groundwater deficit addressed'}
          </div>
        </div>

        {/* AI Advisor Status Card */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <span className="card-subtitle">AI ADVISOR STATUS</span>
            <Badge variant="purple" icon={ShieldCheck}>Grounded</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#c084fc' }}>
              Deterministic
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Zero LLM hallucination in calculations
          </div>
        </div>
      </div>

      {/* Main Content Split: Quick Actions & Recent Activity */}
      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        {/* Quick Actions Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Zap size={18} style={{ color: 'var(--accent-gold)' }} />
                Quick Actions
              </h3>
              <p className="card-subtitle">Select a task to jump directly into action</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div
              onClick={() => setActivePage('analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                  <Sprout size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Analyze Farm</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Compute exact irrigation depth, water saved & carbon reduction</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-subtle)' }} />
            </div>

            <div
              onClick={() => setActivePage('advisor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-purple)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Ask AI Advisor</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Natural language farming queries with grounded reasoning traces</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-subtle)' }} />
            </div>

            <div
              onClick={() => setActivePage('weather')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                  <CloudRain size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Check Weather</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Inspect precipitation forecasts and agricultural action guidance</div>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-subtle)' }} />
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={18} style={{ color: 'var(--primary-400)' }} />
                Recent Activity
              </h3>
              <p className="card-subtitle">Latest farm analyses and security events</p>
            </div>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setActivePage('activity')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.slice(0, 3).map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: act.status === 'blocked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.status === 'blocked' ? 'var(--status-danger)' : 'var(--primary-400)',
                  }}>
                    {act.type === 'SECURITY' ? <ShieldCheck size={16} /> : <Droplets size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>{act.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{act.requestId} • {act.timestamp}</div>
                  </div>
                </div>

                <Badge variant={act.status === 'blocked' ? 'danger' : (act.status === 'postponed' ? 'info' : 'success')}>
                  {act.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FarmGuard Intelligence Section */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.35), rgba(15, 23, 42, 0.85))',
        borderColor: 'rgba(16, 185, 129, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0,
          }}>
            <Leaf size={24} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              How FarmGuard Intelligence Protects Agriculture & Nature
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '900px' }}>
              Unlike generic chatbot applications that approximate agricultural math, FarmGuard decouples weather probability signals from precipitation depth. All water requirements are evaluated using standard <strong style={{ color: 'var(--primary-300)' }}>FAO-56 Penman-Monteith crop coefficients ($K_c \times ET_0$)</strong> through a pure Python calculation layer before passing outputs through multi-tier AI security guardrails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
