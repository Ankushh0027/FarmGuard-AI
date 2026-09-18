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
  Leaf,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_CROPS } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function OverviewPage({ setActivePage }) {
  const {
    farm,
    hasFarmProfile,
    latestAnalysis,
    activities,
    loadExampleScenario
  } = useFarm();

  const selectedCropMeta = SUPPORTED_CROPS.find(c => c.id === farm.crop);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Status Cards */}
      <div className="grid-4">
        {/* Farm Profile Card */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>FARM PROFILE</span>
            <Sprout size={14} style={{ color: hasFarmProfile ? 'var(--color-brand)' : 'var(--text-subtle)' }} />
          </div>
          {hasFarmProfile ? (
            <>
              <div className="kpi-value" style={{ textTransform: 'capitalize' }}>
                {farm.crop}
              </div>
              <div className="kpi-subtext">
                {farm.area_acres} Acres in {farm.location}
              </div>
            </>
          ) : (
            <>
              <div className="kpi-value" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                Not Configured
              </div>
              <div className="kpi-subtext">
                Ready for field analysis
              </div>
            </>
          )}
        </div>

        {/* Weather Snapshot Card */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>WEATHER SNAPSHOT</span>
            <CloudRain size={14} style={{ color: 'var(--accent-sky)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-sky)' }}>
            {farm.location || 'Uttar Pradesh'}
          </div>
          <div className="kpi-subtext">
            {farm.rainfall_probability ? `${farm.rainfall_probability}% rain chance (${farm.forecast_rainfall_mm || 0} mm)` : 'Open-Meteo Regional Weather'}
          </div>
        </div>

        {/* Latest Irrigation Status Card */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>IRRIGATION STATUS</span>
            <Droplets size={14} style={{ color: latestAnalysis ? 'var(--color-brand)' : 'var(--text-subtle)' }} />
          </div>
          {latestAnalysis ? (
            <>
              <div className="kpi-value" style={{ color: latestAnalysis.irrigation_recommendation.recommended_irrigation_mm === 0 ? 'var(--accent-sky)' : 'var(--color-brand-light)' }}>
                {latestAnalysis.irrigation_recommendation.recommended_irrigation_mm} mm
              </div>
              <div className="kpi-subtext">
                {latestAnalysis.irrigation_recommendation.status}
              </div>
            </>
          ) : (
            <>
              <div className="kpi-value" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                Pending Analysis
              </div>
              <div className="kpi-subtext">
                Run farm analysis to compute
              </div>
            </>
          )}
        </div>

        {/* AI Advisor Guardrails Card */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>AI REASONING</span>
            <ShieldCheck size={14} style={{ color: '#c084fc' }} />
          </div>
          <div className="kpi-value" style={{ color: '#c084fc' }}>
            Zero Hallucination
          </div>
          <div className="kpi-subtext">
            100% Grounded in deterministic tools
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Activity */}
      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        {/* Quick Actions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
                Quick Actions
              </h3>
              <p className="card-subtitle">Agricultural tools and decision workflows</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
            <div
              onClick={() => setActivePage('analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-brand)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-light)' }}>
                  <Sprout size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.90rem' }}>Run Farm Analysis</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Calculate exact irrigation requirements and water saved</div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-subtle)' }} />
            </div>

            <div
              onClick={() => setActivePage('advisor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--accent-purple-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.90rem' }}>Ask AI Advisor</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Natural language farming queries with tool traces</div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-subtle)' }} />
            </div>

            <div
              onClick={() => setActivePage('weather')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-sky)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--accent-sky-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sky)' }}>
                  <CloudRain size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.90rem' }}>Regional Weather</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Inspect precipitation depth and agricultural rules</div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-subtle)' }} />
            </div>
          </div>
        </div>

        {/* Recent Session Activity Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={16} style={{ color: 'var(--color-brand)' }} />
                Recent Activity
              </h3>
              <p className="card-subtitle">Session calculation events and audit traces</p>
            </div>
            {activities.length > 0 && (
              <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.76rem' }} onClick={() => setActivePage('activity')}>
                View All
              </button>
            )}
          </div>

          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activities.slice(0, 3).map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      background: act.status === 'blocked' ? 'var(--accent-rose-muted)' : 'var(--color-brand-muted)',
                      color: act.status === 'blocked' ? '#f87171' : 'var(--color-brand-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {act.type === 'SECURITY' ? <ShieldCheck size={14} /> : <Droplets size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{act.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{act.timestamp}</div>
                    </div>
                  </div>

                  <Badge variant={act.status === 'blocked' ? 'danger' : (act.status === 'postponed' ? 'info' : 'success')}>
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-subtle)', fontSize: '0.84rem' }}>
              <div>No activity in this session yet.</div>
              <div style={{ marginTop: '4px', fontSize: '0.76rem' }}>Calculations and advisor queries will appear here in real-time.</div>
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Architecture Callout */}
      <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-brand-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}>
            <Leaf size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              How FarmGuard Protects Groundwater and Air Quality
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              FarmGuard decouples probabilistic rain signals from physical precipitation depth. All crop water demands ($ET_c$) are evaluated using standard <strong style={{ color: 'var(--color-brand-light)' }}>FAO-56 Penman-Monteith crop coefficients ($K_c \times ET_0$)</strong> through a deterministic calculation layer before passing results to the AI advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
