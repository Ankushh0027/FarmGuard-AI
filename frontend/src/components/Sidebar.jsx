import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Bot,
  CloudRain,
  Activity,
  Award,
  ShieldCheck,
  Cpu,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
  const { systemHealth } = useFarm();

  const navSections = [
    {
      label: 'MAIN',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analysis', label: 'Farm Analysis', icon: Sprout },
        { id: 'advisor', label: 'AI Advisor', icon: Bot },
        { id: 'weather', label: 'Weather', icon: CloudRain },
      ]
    },
    {
      label: 'INSIGHTS',
      items: [
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'evaluation', label: 'Evaluation', icon: Award },
      ]
    },
    {
      label: 'SECURITY',
      items: [
        { id: 'security', label: 'Security Center', icon: ShieldCheck },
      ]
    },
    {
      label: 'INFO',
      items: [
        { id: 'architecture', label: 'Architecture', icon: Cpu },
        { id: 'about', label: 'About', icon: Info },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  const isOnline = systemHealth.status === 'ok' || systemHealth.status === 'healthy';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sprout size={20} />
        </div>
        <div className="brand-text">
          <h1>FarmGuard</h1>
          <span>AI Agricultural Intelligence</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-group">
            <div className="nav-group-label">{sec.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <IconComponent size={18} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="sidebar-footer">
        <div className="system-status-pill">
          <span className={`status-dot ${isOnline ? '' : 'warning'}`}></span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.76rem' }}>
              Backend {isOnline ? 'Online' : 'Offline Mode'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
              Deterministic Engine v0.1.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
