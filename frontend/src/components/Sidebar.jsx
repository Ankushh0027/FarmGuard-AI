import React from 'react';
import {
  Home,
  Droplets,
  MessageSquare,
  CloudRain,
  Zap,
  FileText,
  ShieldCheck,
  Award,
  Cpu,
  Info,
  ChevronRight,
  Sprout
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
  const { systemHealth } = useFarm();

  const navSections = [
    {
      label: 'FARMER DECISIONS',
      items: [
        { id: 'overview', label: 'Home', icon: Home },
        { id: 'analysis', label: 'Check Water Need', icon: Droplets },
        { id: 'advisor', label: 'Ask FarmGuard', icon: MessageSquare },
        { id: 'weather', label: 'Should I Water Today?', icon: CloudRain },
        { id: 'savings', label: 'Water & Energy Saved', icon: Zap },
        { id: 'activity', label: 'My Reports', icon: FileText },
      ]
    },
    {
      label: 'SYSTEM & FOR JUDGES',
      items: [
        { id: 'security', label: 'Security Guardrails', icon: ShieldCheck },
        { id: 'evaluation', label: 'AI Evaluation', icon: Award },
        { id: 'architecture', label: 'How It Works', icon: Cpu },
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
          <span>Agricultural Water Decision Tool</span>
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
        <div className="system-status-indicator">
          <div className={`status-dot ${isOnline ? 'online' : 'checking'}`} />
          <div className="status-text">
            <span className="status-label">{isOnline ? 'System Ready' : 'Connecting...'}</span>
            <span className="status-version">NextStep 2026 • Earth Forward</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
