import React from 'react';
import { Menu, MapPin, Layers, Droplets, ShieldCheck, Sparkles } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Header({ activePage, toggleSidebar }) {
  const { farm, systemHealth } = useFarm();

  const titles = {
    overview: { title: 'Farm Overview', subtitle: 'Real-time agronomic snapshot and AI advisor highlights' },
    analysis: { title: 'Farm Analysis', subtitle: 'Calculate irrigation requirements using farm, crop, soil, and weather conditions' },
    advisor: { title: 'FarmGuard AI Advisor', subtitle: 'Natural language agricultural assistant with grounded tool orchestration' },
    weather: { title: 'Weather Intelligence', subtitle: 'Precipitation forecasting and agronomic action translation' },
    activity: { title: 'Activity & Audit Log', subtitle: 'Chronological telemetry and calculation trace records' },
    evaluation: { title: 'Evaluation & Benchmarks', subtitle: 'Empirical model accuracy, behavioral evaluation, and trace integrity metrics' },
    security: { title: 'Security Center', subtitle: 'Defense-in-depth AI guardrails and real-time prompt injection defenses' },
    architecture: { title: 'System Architecture', subtitle: 'Pure Python deterministic calculations + multi-tier guardrails pipeline' },
    about: { title: 'About FarmGuard AI', subtitle: 'NextStep Hacks 2026 (Earth Forward) mission, methodology, and team' },
  };

  const current = titles[activePage] || { title: 'FarmGuard AI', subtitle: 'Sustainable Agriculture Assistant' };

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
        <div className="farm-badge">
          <MapPin size={13} />
          <span>{farm.location}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ textTransform: 'capitalize' }}>{farm.crop} ({farm.area_acres} ac)</span>
        </div>

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
          <span>Guardrails Active</span>
        </div>
      </div>
    </header>
  );
}
