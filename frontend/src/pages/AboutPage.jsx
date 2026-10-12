import React from 'react';
import {
  Info,
  Sprout,
  Heart,
  Globe,
  Award,
  ShieldCheck,
  Leaf,
  Layers,
  Database
} from 'lucide-react';
import Badge from '../components/Badge';

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Hero Mission Card — Clean Agricultural SaaS Identity */}
      <div className="card" style={{
        padding: '28px 32px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderLeft: '4px solid var(--color-brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-brand-muted)',
            border: '1px solid var(--color-brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand)',
          }}>
            <Sprout size={26} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              FarmGuard AI — Agricultural Decision Support
            </h2>
            <p style={{ color: 'var(--color-brand)', fontSize: '0.86rem', fontWeight: 600 }}>
              WarriorHacks 2.0 Ideathon
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '18px' }}>
          FarmGuard AI was engineered to address critical agricultural resource challenges: unsustainable groundwater depletion and seasonal crop stubble burning. By combining rigorous, deterministic agricultural modeling with modern defense-in-depth AI guardrails, FarmGuard delivers verifiable recommendations that farmers can trust.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Badge variant="success">Precision Irrigation</Badge>
          <Badge variant="warning">Stubble Air Quality</Badge>
          <Badge variant="info">FAO-56 Methodology</Badge>
          <Badge variant="purple">Deterministic Math Engine</Badge>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid-3">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={18} style={{ color: 'var(--color-brand)' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.96rem' }}>
              1. Deterministic Truth
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Never let a language model guess crop water requirement numbers. Pure agronomic formulas compute all physical depths, volumes, and pumping times.
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-gold)' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.96rem' }}>
              2. Responsible AI Security
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Multi-tier input bounds, prompt injection defense heuristics, secret scan filters, and numerical grounding validation.
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Layers size={18} style={{ color: 'var(--accent-blue)' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.96rem' }}>
              3. Actionable Clarity
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Translate confusing meteorological signals into clear, actionable advice (e.g. postpone vs apply 20.7 mm) tailored to field acreage.
          </div>
        </div>
      </div>

      {/* Prototype Status & Disclaimer */}
      <div className="card" style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)' }}>
        <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: 'var(--text-subtle)' }} />
          Prototype Model Note
        </h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          FarmGuard AI is a decision-support prototype prepared for WarriorHacks 2.0 Ideathon. While agronomic calculations reflect standard FAO-56 crop coefficients ($K_c$) and empirical stubble emissions factors, local soil conditions and micro-climates vary. FarmGuard clearly labels simulation assumptions and offline fallbacks to distinguish them from field-certified decisions.
        </p>
      </div>
    </div>
  );
}
