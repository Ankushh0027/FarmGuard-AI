import React, { useState } from 'react';
import { Menu, MapPin, ShieldCheck, Zap, Droplets, CheckCircle2, Languages, Sprout, Bell, ChevronDown } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Header({ activePage, toggleSidebar, setActivePage }) {
  const { farm, farms, selectFarm, hasFarmProfile, systemHealth, isLiveBackend, language, setLanguage, t } = useFarm();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const titles = {
    overview: {
      title: t.overviewTitle || 'Farm Overview & Intelligence Dashboard',
      subtitle: t.overviewSubtitle || "Precision crop monitoring, soil moisture status, and deterministic irrigation guidance."
    },
    farms: {
      title: t.farmsTitle || 'My Farms & Field Management',
      subtitle: t.farmsSubtitle || 'Manage your different plots of land, crops, and pump settings in one place.'
    },
    crophealth: {
      title: t.cropHealthTitle || 'Crop Health & Disease Intelligence',
      subtitle: t.cropHealthSubtitle || 'NDVI canopy health, disease risk forecasting, and FAO-56 stage progression.'
    },
    weather: {
      title: t.weatherTitle || 'Rain Forecast & Weather Analytics',
      subtitle: t.weatherSubtitle || 'High-resolution 7-day precipitation, temperature curves, and spray-window forecasting.'
    },
    irrigation: {
      title: t.analysisTitle || 'Field Water Need & Irrigation Management',
      subtitle: t.analysisSubtitle || 'Deterministic crop water requirement, optimal pumping schedule, and conservation metrics.'
    },
    analysis: {
      title: t.analysisTitle || 'Field Water Need & Irrigation Management',
      subtitle: t.analysisSubtitle || 'Deterministic crop water requirement, optimal pumping schedule, and conservation metrics.'
    },
    advisor: {
      title: t.advisorTitle || 'FarmGuard AI Farm Advisor',
      subtitle: t.advisorSubtitle || 'Context-aware conversational intelligence for crop protection, soil management, and water timing.'
    },
    market: {
      title: t.marketTitle || 'Market Insights & Mandi Prices',
      subtitle: t.marketSubtitle || 'Live agricultural mandi rates, government MSP comparison, and harvest arrival trends.'
    },
    alerts: {
      title: t.alertsTitle || 'Alerts & Real-Time Farm Notifications',
      subtitle: t.alertsSubtitle || 'Actionable weather warnings, disease transmission alerts, and pump advisories.'
    },
    cropsoil: {
      title: t.cropSoilTitle || 'Crop & Soil Agronomic Guide',
      subtitle: t.cropSoilSubtitle || 'Detailed growth stages, water requirements, and soil characteristics for Indian agriculture.'
    },
    savings: {
      title: t.savingsTitle || 'Water, Electricity & Money Saved',
      subtitle: t.savingsSubtitle || 'See how much groundwater, tubewell running time, and electricity bill you save with smart irrigation.'
    },
    community: {
      title: t.communityTitle || 'Community Crop & Pest Alerts',
      subtitle: t.communitySubtitle || 'Nearby crop disease reports, weather alerts, and Krishi Vigyan Kendra (KVK) advisories.'
    },
    activity: {
      title: t.activityTitle || 'My Field Activity Records',
      subtitle: t.activitySubtitle || 'Past calculations, water checks, and advisor conversations saved for your reference.'
    },
    settings: {
      title: t.settingsTitle || 'Settings & System Preferences',
      subtitle: t.settingsSubtitle || 'Customize language, tubewell pump defaults, electricity rates, and access diagnostics.'
    },
    security: {
      title: t.securityTitle || 'Safety Guardrails & Field Protection',
      subtitle: t.securitySubtitle || 'How FarmGuard protects farmers by verifying all advice against agricultural guidelines.'
    },
    evaluation: {
      title: t.evaluationTitle || 'Accuracy & Performance Benchmarks',
      subtitle: t.evaluationSubtitle || 'Tested against real Indian farm conditions and ICAR agricultural standards.'
    },
    architecture: {
      title: t.architectureTitle || 'How FarmGuard Calculates Water Need',
      subtitle: t.architectureSubtitle || 'Step-by-step scientific calculations explained in simple words.'
    },
    about: {
      title: t.aboutTitle || 'About FarmGuard AI',
      subtitle: t.aboutSubtitle || 'Our mission to save groundwater and increase farmer income across India.'
    },
  };

  const current = titles[activePage] || {
    title: t.overviewTitle || 'FarmGuard AI',
    subtitle: t.overviewSubtitle || 'Precision Agricultural Intelligence'
  };

  const languageOptions = [
    { id: 'hindi', label: 'हिंदी' },
    { id: 'hinglish', label: 'Hinglish' },
    { id: 'english', label: 'English' },
  ];

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="page-title">
          <h2>{current.title}</h2>
          {current.subtitle && <p className="page-subtitle">{current.subtitle}</p>}
        </div>
      </div>

      <div className="header-right" style={{ position: 'relative' }}>
        {/* Active Farm Switcher Pill & Dropdown */}
        {farm && farm.name && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="header-farm-pill"
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'var(--color-brand-muted)',
                border: '1px solid var(--color-brand-border)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-brand-dark)',
                transition: 'all 0.15s ease'
              }}
              title="Click to switch active field"
            >
              <Sprout size={15} color="var(--color-brand)" />
              <span style={{ maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {farm.name}
              </span>
              <span style={{
                fontSize: '0.68rem',
                padding: '1px 5px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-brand-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-brand-dark)',
                fontWeight: 800
              }}>
                {farm.crop ? farm.crop.toUpperCase() : 'WHEAT'}
              </span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {/* Farm Selector Dropdown Menu */}
            {farmDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '260px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                  padding: '6px'
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  {language === 'hindi' ? 'खेत चुनें' : 'Select Active Field'}
                </div>
                {farms.map((f) => {
                  const isSelected = f.id === farm.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        selectFarm(f.id);
                        setFarmDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? 'var(--color-brand-muted)' : 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        color: isSelected ? 'var(--color-brand-dark)' : 'var(--text-main)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.82rem',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <div>
                        <div>{f.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {f.crop?.toUpperCase()} • {f.area_acres} ac
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={16} color="var(--color-brand)" />}
                    </button>
                  );
                })}
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFarmDropdownOpen(false);
                      setActivePage('farms');
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--color-brand-primary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    + {t.addField || 'Manage All Fields'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts Notification Bell */}
        <button
          type="button"
          onClick={() => setActivePage('alerts')}
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-default)',
            backgroundColor: activePage === 'alerts' ? 'var(--color-brand-muted)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: activePage === 'alerts' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
          title="View Farm Alerts"
          aria-label="View Farm Alerts"
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              boxShadow: '0 0 0 2px #ffffff'
            }}
          />
        </button>

        {/* Trilingual Language Selector Pill Group */}
        <div
          className="lang-switcher-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-full)',
            padding: '2px',
            gap: '2px'
          }}
          role="group"
          aria-label="Select language"
        >
          {languageOptions.map((opt) => {
            const isSelected = language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage(opt.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? 'var(--color-brand)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}