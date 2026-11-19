import React, { useState } from 'react';
import {
  Activity,
  Droplets,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  ArrowRight,
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import Badge from '../components/Badge';

export default function ActivityPage({ setActivePage }) {
  const { activities, t, language } = useFarm();
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleDownloadLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `farmguard_session_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyTraceId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'ANALYSIS' && act.type !== 'ADVISOR' && act.type !== 'SECURITY') ||
      (filterType === 'ADVISOR' && act.type === 'ADVISOR') ||
      (filterType === 'SECURITY' && act.type === 'SECURITY');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (act.title && act.title.toLowerCase().includes(q)) ||
      (act.location && act.location.toLowerCase().includes(q)) ||
      (act.requestId && act.requestId.toLowerCase().includes(q)) ||
      (act.status && act.status.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const totalCount = activities.length;
  const analysisCount = activities.filter(a => a.type !== 'ADVISOR' && a.type !== 'SECURITY').length;
  const advisorCount = activities.filter(a => a.type === 'ADVISOR').length;
  const securityCount = activities.filter(a => a.type === 'SECURITY' || a.status === 'blocked').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header & Hero Card */}
      <div className="card" style={{
        padding: '28px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(27, 99, 52, 0.08)',
              border: '1px solid var(--color-brand-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-dark)',
              fontSize: '0.76rem',
              fontWeight: 700,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Activity size={13} />
              {t.activityTitle || 'My Field Activity Records'}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.9rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              {language === 'hindi'
                ? 'खेत की पिछली गणनाएं व रिपोर्ट्स'
                : language === 'hinglish'
                  ? 'Khet Ki Puraani Reports Aur Records'
                  : 'Field Calculations & Advisory Records'}
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: 0
            }}>
              {t.activitySubtitle || 'Past calculations, water checks, and advisor conversations saved for your reference.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadLog}
              disabled={activities.length === 0}
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              <Download size={15} />
              Export JSON Log
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActivePage?.('analysis')}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              <Droplets size={15} />
              New Analysis
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Total Logged Events
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {totalCount}
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Irrigation Calculations
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-brand)', marginTop: '2px' }}>
              {analysisCount}
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              AI Consultations
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-brand-accent)', marginTop: '2px' }}>
              {advisorCount}
            </div>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Security Interventions
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: securityCount > 0 ? 'var(--status-danger)' : 'var(--text-muted)', marginTop: '2px' }}>
              {securityCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="card" style={{
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Events (${totalCount})` },
            { id: 'ANALYSIS', label: `Calculations (${analysisCount})` },
            { id: 'ADVISOR', label: `AI Advisor (${advisorCount})` },
            { id: 'SECURITY', label: `Security (${securityCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: filterType === tab.id ? '1px solid var(--color-brand)' : '1px solid var(--border-default)',
                backgroundColor: filterType === tab.id ? 'var(--color-brand)' : '#ffffff',
                color: filterType === tab.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '320px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by title, trace, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '34px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '0.82rem',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Activity Table / Empty State Card */}
      <div className="card" style={{
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {activities.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(27, 99, 52, 0.08)',
              color: 'var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              No session activities recorded yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.55 }}>
              Run a farm irrigation analysis or consult the AI Agronomic Advisor. Every calculation is assigned a cryptographic trace identifier and indexed here.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActivePage?.('analysis')}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <Droplets size={15} />
                Run Farm Analysis
              </button>
              <button
                type="button"
                onClick={() => setActivePage?.('advisor')}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <Bot size={15} />
                Open AI Advisor
              </button>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Filter size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>No matches found</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              No session activities match your filter criteria or search keyword "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => { setFilterType('ALL'); setSearchQuery(''); }}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderBottom: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 700
                }}>
                  <th style={{ padding: '14px 20px' }}>Event & Action</th>
                  <th style={{ padding: '14px 16px' }}>Plot & Location</th>
                  <th style={{ padding: '14px 16px' }}>Water Depth</th>
                  <th style={{ padding: '14px 16px' }}>Water Saved</th>
                  <th style={{ padding: '14px 16px' }}>Cryptographic Trace</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act, idx) => {
                  const isBlocked = act.status === 'blocked';
                  const isPostponed = act.status === 'postponed';
                  const isSuccess = act.status === 'completed' || act.status === 'saved' || act.status === 'ready' || (!isBlocked && !isPostponed);

                  return (
                    <tr
                      key={act.id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Event Column */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isBlocked
                              ? 'rgba(217, 83, 79, 0.1)'
                              : act.type === 'ADVISOR'
                                ? 'rgba(74, 137, 92, 0.1)'
                                : 'rgba(27, 99, 52, 0.1)',
                            color: isBlocked
                              ? 'var(--status-danger)'
                              : act.type === 'ADVISOR'
                                ? 'var(--color-brand-accent)'
                                : 'var(--color-brand)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {act.type === 'SECURITY' ? (
                              <ShieldAlert size={16} />
                            ) : act.type === 'ADVISOR' ? (
                              <Bot size={16} />
                            ) : (
                              <Droplets size={16} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.86rem' }}>
                              {act.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Clock size={11} />
                              {act.timestamp}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location Column */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        {act.location || 'Karnal, Haryana (Plot A)'}
                      </td>

                      {/* Water Depth Column */}
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: act.recommended_mm !== null && act.recommended_mm !== undefined ? 'var(--color-brand)' : 'var(--text-muted)' }}>
                        {act.recommended_mm !== null && act.recommended_mm !== undefined ? `${act.recommended_mm} mm` : '—'}
                      </td>

                      {/* Water Saved Column */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {act.water_saved_l ? `${Number(act.water_saved_l).toLocaleString()} L` : '—'}
                      </td>

                      {/* Cryptographic Trace Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          onClick={() => copyTraceId(act.requestId || 'fg-trace')}
                          title="Click to copy trace ID"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'var(--bg-card-subtle)',
                            border: '1px solid var(--border-subtle)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: copiedId === (act.requestId || 'fg-trace') ? 'var(--color-brand)' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          {copiedId === (act.requestId || 'fg-trace') ? <Check size={11} /> : <Copy size={11} />}
                          <span>{act.requestId || 'fg-trace-hash'}</span>
                        </button>
                      </td>

                      {/* Status Column */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <Badge variant={isBlocked ? 'danger' : isPostponed ? 'info' : 'success'}>
                          {act.status || 'verified'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Provenance & Privacy Guarantee Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: 'rgba(27, 99, 52, 0.04)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-brand-border)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <Info size={16} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
        <span>
          <strong>Local Session Storage:</strong> All telemetry and event hashes are recorded in-memory inside your browser context for privacy and low-latency offline edge verification. Closing or refreshing your browser resets active session logs.
        </span>
      </div>

    </div>
  );
}
