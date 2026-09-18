import React from 'react';
import { Menu, MapPin, Droplets, ShieldCheck, Zap } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Header({ activePage, toggleSidebar }) {
  const { farm, hasFarmProfile, systemHealth } = useFarm();

  const titles = {
    overview: { title: 'Home', subtitle: 'Simple water decisions for your crop and field' },
    analysis: { title: 'Check Water Need', subtitle: 'Calculate how much water your crop needs and how much you can save' },
    advisor: { title: 'Ask FarmGuard', subtitle: 'Ask questions about your crops, irrigation timing, and weather' },
    weather: { title: 'Should I Water Today?', subtitle: 'Rain forecast and daily watering advice for your field' },
    savings: { title: 'Water & Energy Saved', subtitle: 'Groundwater, pumping time, electricity, and cost reductions' },
    activity: { title: 'My Reports', subtitle: 'History of calculations and farm water plans' },
    evaluation: { title: 'AI Evaluation & Benchmarks', subtitle: 'Empirical model accuracy, behavioral evaluation, and trace integrity metrics' },
    security: { title: 'Security Guardrails', subtitle: 'Defense-in-depth AI guardrails and real-time prompt injection defenses' },
    architecture: { title: 'How It Works (Architecture)', subtitle: 'Pure Python deterministic calculations + multi-tier guardrails pipeline' },
    about: { title: 'About FarmGuard', subtitle: 'Mission, methodology, and sustainable agriculture impact' },
  };

  const current = titles[activePage] || { title: 'FarmGuard', subtitle: 'Agricultural Water Decision Tool' };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="page-title">
          <h2>{current.title}</h2>
        </div>
      </div>

      <div className="header-right">
        {/* Active Farm Context Pill */}
        {hasFarmProfile && farm.crop ? (
          <div className="farm-badge">
            <MapPin size={13} />
            <span>{farm.location}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ textTransform: 'capitalize' }}>{farm.crop} ({farm.area_acres || 1} ac)</span>
          </div>
        ) : (
          <div className="farm-badge" style={{ opacity: 0.75 }}>
            <MapPin size={13} />
            <span>{farm.location || 'India'}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>No field selected yet</span>
          </div>
        )}

        {/* Security Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          color: 'var(--accent-blue)',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} />
          <span>Verified Safe AI</span>
        </div>
      </div>
    </header>
  );
}
