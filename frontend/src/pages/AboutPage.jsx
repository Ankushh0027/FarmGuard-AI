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
  Database,
  BookOpen,
  CheckCircle2,
  Droplets,
  Wind
} from 'lucide-react';
import Badge from '../components/Badge';

export default function AboutPage() {
  const principles = [
    {
      icon: Database,
      title: '1. Deterministic Truth',
      color: 'var(--color-brand)',
      desc: 'Never let a language model guess crop water requirement numbers. Pure agronomic formulas compute all physical depths, pumping volumes, and hours.'
    },
    {
      icon: ShieldCheck,
      title: '2. Responsible AI Security',
      color: 'var(--accent-amber)',
      desc: 'Multi-tier input bounds, prompt injection defense heuristics, secret scan filters, and numerical grounding validation guard every consultation.'
    },
    {
      icon: Layers,
      title: '3. Actionable Clarity',
      color: 'var(--accent-blue)',
      desc: 'Translate confusing meteorological signals into clear, actionable advice (e.g. postpone vs apply 20.7 mm) tailored to specific field acreage.'
    }
  ];

  const citations = [
    {
      title: 'FAO Irrigation and Drainage Paper No. 56',
      authors: 'Allen, R.G., Pereira, L.S., Raes, D., & Smith, M. (1998)',
      detail: 'Standardized single-crop coefficient (Kc) and dual-coefficient soil water depletion calculation methodology.'
    },
    {
      title: 'Dynamic Ground Water Resources of India',
      authors: 'Central Ground Water Board (CGWB), Ministry of Jal Shakti (2022)',
      detail: 'Critical assessment of critical and over-exploited blocks across Punjab, Haryana, and Rajasthan.'
    },
    {
      title: 'Crop Residue Management Guidelines & In-Situ Machinery',
      authors: 'ICAR - Indian Agricultural Research Institute (IARI)',
      detail: 'Empirical emissions avoidance coefficients for in-situ Happy Seeder and Smart Seeder mulching practices.'
    },
    {
      title: 'Agricultural Marketing & Price Policy Benchmarks',
      authors: 'Commission for Agricultural Costs and Prices (CACP) & Agmarknet',
      detail: 'CCEA Minimum Support Price (MSP) floor rate formulations and historical modal mandi price distributions.'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1080px' }}>
      
      {/* 1. Hero Mission Card */}
      <div className="card" style={{
        padding: '32px 28px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderLeft: '4px solid var(--color-brand)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-brand-muted)',
            border: '1px solid var(--color-brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand)',
            flexShrink: 0
          }}>
            <Sprout size={28} />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              background: 'rgba(27, 99, 52, 0.08)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-dark)',
              fontSize: '0.74rem',
              fontWeight: 700,
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              WarriorHacks 2.0 Ideathon
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              FarmGuard AI — Agricultural Intelligence & Sustainable Water Advisory
            </h1>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.65, marginBottom: '20px' }}>
          FarmGuard AI was engineered to address critical agricultural resource challenges in the Indo-Gangetic plains: unsustainable groundwater depletion and seasonal crop stubble burning. By pairing rigorous FAO-56 scientific calculations with enterprise defense-in-depth AI safety, FarmGuard provides smallholder farmers with verifiable, trustworthy decisions.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="success">Precision Irrigation Advisory</Badge>
          <Badge variant="warning">Stubble Air Quality Protection</Badge>
          <Badge variant="info">FAO-56 Scientific Standard</Badge>
          <Badge variant="purple">Deterministic Math Engine</Badge>
        </div>
      </div>

      {/* 2. Three Core Architectural Principles */}
      <div className="grid-3">
        {principles.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '24px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card-subtle)',
                  color: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem', margin: 0 }}>
                  {p.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* 3. Scientific Foundation & Official Benchmarks */}
      <div className="card" style={{
        padding: '26px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={18} style={{ color: 'var(--color-brand)' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Scientific Literature & Benchmark Sources
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {citations.map((c, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                {c.title}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-brand)', fontWeight: 600, marginBottom: '6px' }}>
                {c.authors}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {c.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Prototype Disclaimer & Hackathon Note */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '18px 22px',
        backgroundColor: 'rgba(27, 99, 52, 0.04)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-brand-border)',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        <Info size={18} style={{ color: 'var(--color-brand)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
            WarriorHacks 2.0 Ideathon Disclosure:
          </strong>
          FarmGuard AI is a functional decision-support prototype. While agronomic computations strictly follow established FAO-56 crop coefficients and empirical residue multipliers, local soil percolation, water table depth, and weather conditions vary. FarmGuard clearly demarcates simulated prototype scenarios, offline fallbacks, and live integrations to ensure total transparency.
        </div>
      </div>

    </div>
  );
}
