import React from 'react';
import {
  Activity,
  Droplets,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import Badge from '../components/Badge';

export default function ActivityPage({ setActivePage }) {
  const { activities } = useFarm();

  const handleDownloadLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `farmguard_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Action Bar */}
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
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>My Reports & Session History</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Chronological record of your field water plans, AI consultations, and telemetry</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadLog}
              disabled={activities.length === 0}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            >
              <Download size={14} />
              Export JSON Log
            </button>
          </div>
        </div>
      </div>

      {/* Activity Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activities.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Activity size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>No session activity yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              Farm analysis calculations and AI advisor interactions conducted during this session will be logged here with cryptographic correlation IDs.
            </p>
            <button
              onClick={() => setActivePage?.('analysis')}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Run Farm Analysis <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '12px 18px' }}>Event & Summary</th>
                  <th style={{ padding: '12px 14px' }}>Location</th>
                  <th style={{ padding: '12px 14px' }}>Recommended Depth</th>
                  <th style={{ padding: '12px 14px' }}>Water Saved</th>
                  <th style={{ padding: '12px 14px' }}>Trace ID</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr
                    key={act.id || idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          background: act.status === 'blocked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: act.status === 'blocked' ? 'var(--status-danger)' : 'var(--primary-400)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {act.type === 'SECURITY' ? <ShieldAlert size={14} /> : (act.type === 'ADVISOR' ? <Bot size={14} /> : <Droplets size={14} />)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>{act.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{act.timestamp}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px', color: 'var(--text-muted)' }}>
                      {act.location || '—'}
                    </td>
                    <td style={{ padding: '14px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: act.recommended_mm !== null ? 'var(--primary-300)' : 'var(--text-subtle)' }}>
                      {act.recommended_mm !== null ? `${act.recommended_mm} mm` : '—'}
                    </td>
                    <td style={{ padding: '14px 14px', color: 'var(--text-muted)' }}>
                      {act.water_saved_l ? `${act.water_saved_l.toLocaleString()} L` : '—'}
                    </td>
                    <td style={{ padding: '14px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      {act.requestId || 'fg-trace'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Badge variant={act.status === 'blocked' ? 'danger' : (act.status === 'postponed' ? 'info' : 'success')}>
                        {act.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
