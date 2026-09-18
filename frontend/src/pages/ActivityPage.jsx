import React from 'react';
import {
  Activity,
  Droplets,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  Filter
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import Badge from '../components/Badge';

export default function ActivityPage() {
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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Action Bar */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={22} style={{ color: 'var(--primary-400)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Audit Trail & Execution Telemetry</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Chronological record of calculations, agent queries, and security triggers</div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={handleDownloadLog} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <Download size={15} />
            Export JSON Audit Log
          </button>
        </div>
      </div>

      {/* Activity Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '14px 20px' }}>Event & Summary</th>
                <th style={{ padding: '14px 16px' }}>Location</th>
                <th style={{ padding: '14px 16px' }}>Recommended Depth</th>
                <th style={{ padding: '14px 16px' }}>Water Saved</th>
                <th style={{ padding: '14px 16px' }}>Correlation ID</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Status</th>
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
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: act.status === 'blocked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: act.status === 'blocked' ? 'var(--status-danger)' : 'var(--primary-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {act.type === 'SECURITY' ? <ShieldAlert size={16} /> : (act.type === 'ADVISOR' ? <Bot size={16} /> : <Droplets size={16} />)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{act.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{act.timestamp}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px', color: 'var(--text-muted)' }}>
                    {act.location}
                  </td>
                  <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: act.recommended_mm !== null ? 'var(--primary-300)' : 'var(--text-subtle)' }}>
                    {act.recommended_mm !== null ? `${act.recommended_mm} mm` : '—'}
                  </td>
                  <td style={{ padding: '16px 16px', color: 'var(--text-muted)' }}>
                    {act.water_saved_l ? `${act.water_saved_l.toLocaleString()} L` : '—'}
                  </td>
                  <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    {act.requestId || 'fg-trace'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <Badge variant={act.status === 'blocked' ? 'danger' : (act.status === 'postponed' ? 'info' : 'success')}>
                      {act.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
