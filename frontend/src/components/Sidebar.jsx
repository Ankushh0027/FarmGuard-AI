import React from 'react';
import {
  Home,
  Sprout,
  Activity,
  Droplets,
  MessageSquare,
  CloudRain,
  TrendingUp,
  Bell,
  Settings,
  Layers,
  Zap,
  ShieldCheck,
  Award,
  Cpu,
  Info,
  ChevronRight,
  X,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
  const { farm, farms, activeFarmId, hasFarmProfile, systemHealth, isLiveBackend, t, language } = useFarm();

  const primaryNavItems = [
    { id: 'overview', label: t.navHome || 'Home Dashboard', icon: Home },
    { id: 'farms', label: t.navFarms || 'My Farms & Fields', icon: Sprout },
    { id: 'crophealth', label: t.navCropHealth || 'Crop Health', icon: Activity },
    { id: 'weather', label: t.navWeather || 'Should I Water Today?', icon: CloudRain },
    { id: 'irrigation', label: t.navWaterNeed || 'Check Water Need', icon: Droplets },
    { id: 'advisor', label: t.navAdvisor || 'Ask FarmGuard (Advisor)', icon: MessageSquare },
    { id: 'market', label: t.navMarket || 'Market Insights', icon: TrendingUp },
    { id: 'alerts', label: t.navAlerts || 'Alerts & Notifications', icon: Bell },
    { id: 'settings', label: t.navSettings || 'Settings & Preferences', icon: Settings },
  ];

  const secondaryNavItems = [
    { id: 'cropsoil', label: t.navCropSoil || 'Crop & Soil Guide', icon: Layers },
    { id: 'savings', label: t.navSavings || 'Water & Money Saved', icon: Zap },
    { id: 'security', label: t.navSecurity || 'Safety Rules', icon: ShieldCheck },
    { id: 'architecture', label: t.navArchitecture || 'How It Works', icon: Cpu },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  const isOnline = systemHealth.status === 'ok' || systemHealth.status === 'healthy';

  const isItemActive = (itemId) => {
    if (activePage === itemId) return true;
    if (itemId === 'irrigation' && activePage === 'analysis') return true;
    if (itemId === 'crophealth' && activePage === 'cropsoil') return false;
    if (itemId === 'alerts' && (activePage === 'activity' || activePage === 'community')) return true;
    return false;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sprout size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1>FarmGuard</h1>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '1px 5px',
              backgroundColor: 'var(--color-brand-muted)',
              color: 'var(--color-brand-dark)',
              border: '1px solid var(--color-brand-border)',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.04em'
            }}>
              AI
            </span>
          </div>
          <span>{t.appTagline || 'Precision Water & Farm SaaS'}</span>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {/* Primary Navigation */}
        <div className="nav-group">
          <div className="nav-group-label">
            {language === 'hindi' ? 'मुख्य प्रबंधन' : language === 'hinglish' ? 'MAIN MANAGEMENT' : 'FARM MANAGEMENT'}
          </div>
          <div className="nav-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const active = isItemActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reference & Science Section */}
        <div className="nav-group" style={{ marginTop: '14px' }}>
          <div className="nav-group-label">
            {language === 'hindi' ? 'संदर्भ व विज्ञान' : language === 'hinglish' ? 'REFERENCE & GUIDES' : 'REFERENCE & GUIDES'}
          </div>
          <div className="nav-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={17} className="nav-icon" />
                  <span className="nav-text" style={{ fontSize: '0.84rem' }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Persistent Active Farm Context Card in Sidebar */}
      <div className="sidebar-farm-card" style={{
        padding: '12px 14px',
        margin: '10px 12px',
        backgroundColor: 'var(--bg-app)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language === 'hindi' ? 'सक्रिय खेत' : language === 'hinglish' ? 'Active Khet' : 'Active Field'}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--color-brand-dark)',
            backgroundColor: 'var(--color-brand-muted)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)' }} />
            {farm.crop ? farm.crop.toUpperCase() : 'WHEAT'}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {farm.name || 'North Tubewell Plot'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>{farm.area_acres || 2.0} {t.acres || 'Acres'}</span>
          <span>{farm.location || 'Uttar Pradesh'}</span>
        </div>
      </div>

      {/* Sidebar Footer with Live Connectivity Status */}
      <div className="sidebar-footer" style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isOnline ? '#16a34a' : '#d97706'
          }} />
          <span style={{ fontWeight: 600 }}>
            {isOnline ? 'FastAPI 8000 Online' : 'Offline Engine'}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>v0.2.0</span>
      </div>
    </aside>
  );
}