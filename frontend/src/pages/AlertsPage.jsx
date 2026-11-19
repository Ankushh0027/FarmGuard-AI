import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CloudRain,
  Sprout,
  Droplets,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Info,
  Calendar,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function AlertsPage({ setActivePage }) {
  const { farm, language, t } = useFarm();
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WEATHER' | 'DISEASE' | 'IRRIGATION'
  const [resolvedIds, setResolvedIds] = useState(new Set());

  const initialAlerts = [
    {
      id: 'alt-1',
      type: 'WEATHER',
      severity: 'critical',
      title: language === 'hindi' ? 'भारी बारिश व जलभराव चेतावनी' : 'Heavy Rainfall Alert (24–36 Hours)',
      date: 'Today, 06:30 AM',
      field: farm.name || 'North Tubewell Plot',
      crop: farm.crop?.toUpperCase() || 'WHEAT',
      message: 'Meteorological department predicts 35–45 mm rain within 36 hours. Immediate action: keep tubewell pumps OFF and clear field drainage furrows to avoid root hypoxia.',
      actionText: 'Keep Tubewell Pumps Off & Clear Furrows',
      actionRoute: 'weather',
      resolved: false
    },
    {
      id: 'alt-2',
      type: 'DISEASE',
      severity: 'moderate',
      title: language === 'hindi' ? 'पीला रतुआ (Yellow Rust) अनुकूल मौसम' : 'Favorable Weather for Yellow Rust Spore Germination',
      date: 'Yesterday, 04:15 PM',
      field: 'Canal Side Plot',
      crop: 'WHEAT',
      message: 'Relative humidity exceeded 80% with night temperatures around 14°C. Inspect lower canopy along northern boundary for yellow powdery pustules.',
      actionText: 'Inspect Lower Leaves & Plan Propiconazole Spray',
      actionRoute: 'crophealth',
      resolved: false
    },
    {
      id: 'alt-3',
      type: 'IRRIGATION',
      severity: 'info',
      title: language === 'hindi' ? 'सिंचाई समय सारिणी — सुबह 05:00 से 08:30' : 'Optimal Pumping Window: Early Morning 05:00 – 08:30',
      date: 'Today, 05:00 AM',
      field: farm.name || 'North Tubewell Plot',
      crop: farm.crop?.toUpperCase() || 'WHEAT',
      message: 'High daytime wind (> 18 km/h) forecasted for the afternoon. Pumping between 05:00 and 08:30 AM minimizes evaporative drift by 22%.',
      actionText: 'View Pump Running Time',
      actionRoute: 'irrigation',
      resolved: false
    },
    {
      id: 'alt-4',
      type: 'DISEASE',
      severity: 'critical',
      title: language === 'hindi' ? 'माहू / चेपा कीट का क्षेत्रीय फैलाव' : 'Regional Aphid (Chepa) Infestation Reported Nearby',
      date: 'Nov 17, 11:00 AM',
      field: 'All Fields',
      crop: 'MUSTARD / WHEAT',
      message: 'Neighboring cluster in Karnal district reports early aphid colonies on floral twigs. Check sticky traps and spray Thiamethoxam if count exceeds 10 per twig.',
      actionText: 'Check Sticky Traps & Thresholds',
      actionRoute: 'crophealth',
      resolved: true
    },
    {
      id: 'alt-5',
      type: 'IRRIGATION',
      severity: 'moderate',
      title: language === 'hindi' ? 'मिट्टी में नमी 38% — सिंचाई की आवश्यकता' : 'Soil Moisture Dropped to 38% in South Borewell Plot',
      date: 'Nov 16, 03:45 PM',
      field: 'South Borewell Plot',
      crop: 'MAIZE',
      message: 'Root zone moisture reached critical threshold (40%). Apply 30 mm light irrigation to avoid vegetative stunting.',
      actionText: 'Calculate Exact Water Need',
      actionRoute: 'irrigation',
      resolved: true
    }
  ];

  const [alerts, setAlerts] = useState(initialAlerts);

  const toggleResolved = (id) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, resolved: !a.resolved };
      }
      return a;
    }));
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'CRITICAL') return a.severity === 'critical';
    if (activeFilter === 'WEATHER') return a.type === 'WEATHER';
    if (activeFilter === 'DISEASE') return a.type === 'DISEASE';
    if (activeFilter === 'IRRIGATION') return a.type === 'IRRIGATION';
    return true;
  });

  const activeCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Header Banner & Filter Pills */}
      <div className="card" style={{ padding: '22px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} style={{ color: '#dc2626' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {language === 'hindi' ? 'खेत अलर्ट व आपातकालीन सूचना केंद्र' : 'Farm Alerts & Real-Time Notifications'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {activeCount} active alerts requiring farmer attention • {criticalCount} high priority
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'CRITICAL', label: 'Critical Only' },
              { id: 'WEATHER', label: 'Weather' },
              { id: 'DISEASE', label: 'Crop Disease' },
              { id: 'IRRIGATION', label: 'Irrigation' },
            ].map(f => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 800 : 600,
                    backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--bg-app)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid ' + (isSelected ? 'var(--color-brand)' : 'var(--border-default)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Alert Cards Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} style={{ color: '#16a34a', marginBottom: '8px' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                No alerts found in this category
              </div>
              <p style={{ fontSize: '0.82rem' }}>All farm parameters are currently within normal thresholds.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCritical = alert.severity === 'critical';
              const isModerate = alert.severity === 'moderate';
              const isResolved = alert.resolved;

              return (
                <div
                  key={alert.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `5px solid ${isResolved ? '#94a3b8' : isCritical ? '#dc2626' : isModerate ? '#d97706' : '#0284c7'}`,
                    borderTop: '1px solid var(--border-default)',
                    borderRight: '1px solid var(--border-default)',
                    borderBottom: '1px solid var(--border-default)',
                    backgroundColor: isResolved ? '#fafafa' : '#ffffff',
                    opacity: isResolved ? 0.75 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isResolved ? '#f1f5f9' : isCritical ? '#fef2f2' : isModerate ? '#fffbeb' : '#f0f9ff',
                        color: isResolved ? '#64748b' : isCritical ? '#991b1b' : isModerate ? '#92400e' : '#075985',
                        border: `1px solid ${isResolved ? '#e2e8f0' : isCritical ? '#fecaca' : isModerate ? '#fde68a' : '#bae6fd'}`
                      }}>
                        {isResolved ? 'RESOLVED' : alert.severity.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {alert.type} • {alert.date}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-dark)', backgroundColor: 'var(--color-brand-muted)', padding: '1px 6px', borderRadius: '4px' }}>
                        {alert.field} ({alert.crop})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleResolved(alert.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isResolved ? 'var(--color-brand)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isResolved ? (
                        <>
                          <RotateCcw size={13} /> Re-open Alert
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} /> Mark as Resolved
                        </>
                      )}
                    </button>
                  </div>

                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    margin: 0,
                    color: isResolved ? 'var(--text-secondary)' : 'var(--text-main)',
                    textDecoration: isResolved ? 'line-through' : 'none'
                  }}>
                    {alert.title}
                  </h4>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {alert.message}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      <strong style={{ color: 'var(--color-brand)' }}>Action:</strong> {alert.actionText}
                    </div>

                    {alert.actionRoute && (
                      <button
                        type="button"
                        onClick={() => setActivePage(alert.actionRoute)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-brand-muted)',
                          border: '1px solid var(--color-brand-border)',
                          color: 'var(--color-brand-dark)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Execute Action <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}