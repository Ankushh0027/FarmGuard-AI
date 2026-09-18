import React from 'react';
import {
  Info,
  Sprout,
  Heart,
  Globe,
  Award,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import Badge from '../components/Badge';

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      {/* Hero Mission Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(15, 23, 42, 0.95))',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sprout size={26} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              FarmGuard AI — Earth Forward
            </h2>
            <p style={{ color: 'var(--primary-300)', fontSize: '0.86rem', fontWeight: 600 }}>
              NextStep Hacks 2026 Submission
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '16px' }}>
          FarmGuard AI was engineered to solve one of India's most urgent environmental challenges: unsustainable groundwater depletion and seasonal crop stubble burning. By combining rigorous, deterministic agricultural modeling with modern defense-in-depth AI guardrails, FarmGuard delivers verifiable recommendations that farmers can trust.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Badge variant="success">Precision Irrigation</Badge>
          <Badge variant="warning">Stubble Air Quality</Badge>
          <Badge variant="info">FAO-56 Methodology</Badge>
          <Badge variant="purple">Zero LLM Hallucinations</Badge>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontWeight: 700, color: 'var(--primary-400)', fontSize: '1rem', marginBottom: '8px' }}>
            1. Deterministic Truth
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Never let a language model guess crop water requirement numbers. Pure Python math computes all physical values.
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1rem', marginBottom: '8px' }}>
            2. Responsible AI Security
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Multi-tier input bounds, prompt injection defense, secret redaction, and strict numerical grounding.
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '1rem', marginBottom: '8px' }}>
            3. Actionable Clarity
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Translate confusing meteorological signals into clear, actionable advice (e.g. postpone vs apply 20.7 mm).
          </div>
        </div>
      </div>

      {/* Prototype Status & Disclaimer */}
      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} style={{ color: 'var(--text-subtle)' }} />
          Prototype Model Note
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
          FarmGuard AI is a hackathon prototype developed for NextStep Hacks 2026. While agronomic calculations reflect standard FAO-56 crop coefficients ($K_c$) and empirical stubble emissions factors, local soil conditions and micro-climates vary. FarmGuard distinguishes prototype assumptions from field-certified decisions.
        </p>
      </div>
    </div>
  );
}
