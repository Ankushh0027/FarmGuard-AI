import React from 'react';
import {
  Cpu,
  Layers,
  ArrowDown,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Zap,
  Sparkles,
  Calculator,
  Server,
  Info,
  Network,
  Lock,
  Bot,
  Database
} from 'lucide-react';
import Badge from '../components/Badge';

export default function ArchitecturePage() {
  const pipelineSteps = [
    {
      num: 1,
      title: 'Farmer / Client Request',
      subtitle: 'Natural language chat query or structured farm payload via REST API / Web UI.',
      badge: 'Client Layer',
      badgeVar: 'secondary',
      icon: Database,
      bgColor: 'var(--bg-card-subtle)',
      borderColor: 'var(--border-default)'
    },
    {
      num: 2,
      title: 'Production Security Middleware',
      subtitle: 'X-Request-ID audit tracing, HTTP security headers, sliding rate limiter, and 413 body size cap.',
      badge: 'Zero Trust Gate',
      badgeVar: 'info',
      icon: Lock,
      bgColor: 'rgba(2, 132, 199, 0.05)',
      borderColor: 'rgba(2, 132, 199, 0.25)'
    },
    {
      num: 3,
      title: 'Input Guardrails & Prompt Defense',
      subtitle: 'Pydantic physical bounds validation, DAN / jailbreak obfuscation filter, and regex secret redaction.',
      badge: 'Defense-in-Depth',
      badgeVar: 'warning',
      icon: ShieldCheck,
      bgColor: 'rgba(217, 119, 6, 0.05)',
      borderColor: 'rgba(217, 119, 6, 0.25)'
    },
    {
      num: 4,
      title: 'FarmGuard Agent Coordinator',
      subtitle: 'Deterministic intent matching, tool parameter validation, and causal execution ordering.',
      badge: 'Orchestrator',
      badgeVar: 'purple',
      icon: Bot,
      bgColor: 'rgba(126, 34, 206, 0.05)',
      borderColor: 'rgba(126, 34, 206, 0.25)'
    },
    {
      num: 5,
      title: 'Deterministic Agronomic Calculation Engine',
      subtitle: 'Pure Python agronomic equations: Open-Meteo weather fetch, FAO-56 ETc, irrigation deficit, stubble mass, and carbon savings. Zero LLM hallucinations.',
      badge: 'Mathematical Truth',
      badgeVar: 'success',
      icon: Calculator,
      bgColor: 'var(--color-brand-muted)',
      borderColor: 'var(--color-brand-border)',
      highlight: true
    },
    {
      num: 6,
      title: 'LLM Synthesis & Fallback Layer',
      subtitle: 'Gemini API natural language summarization with seamless client-side deterministic fallback during network dropouts.',
      badge: 'Dual-Engine Resilient',
      badgeVar: 'purple',
      icon: Cpu,
      bgColor: 'rgba(126, 34, 206, 0.05)',
      borderColor: 'rgba(126, 34, 206, 0.25)'
    },
    {
      num: 7,
      title: 'Output Guardrails & Numerical Grounding',
      subtitle: 'Cross-verifies generated text numbers against deterministic calculation outputs before delivery to user.',
      badge: 'Verification Gate',
      badgeVar: 'success',
      icon: CheckCircle2,
      bgColor: 'var(--color-brand-muted)',
      borderColor: 'var(--color-brand-border)'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Hero Header Card */}
      <div className="card" style={{
        padding: '28px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(27, 99, 52, 0.08)',
              border: '1px solid var(--color-brand-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-dark)',
              fontSize: '0.76rem',
              fontWeight: 700,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Network size={13} />
              System Architecture & Data Flow
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.9rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              Decoupled Agronomic & Defense Pipeline
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '12px'
            }}>
              FarmGuard strictly separates mathematical truth from generative language modeling. Agricultural water and stubble computations run in deterministic code with verified formulas, while AI handles natural language synthesis within strict guardrail boundaries.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <Info size={13} color="var(--color-brand)" />
              <span><strong>Design Principle:</strong> Language models synthesize explanations; they never calculate physical water depths or financial savings.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Pipeline Stack Card */}
      <div className="card" style={{
        padding: '28px 24px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--color-brand)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                End-to-End Execution Sequence
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Step-by-step traversal from farmer input to verified agronomic recommendation
            </p>
          </div>
          <Badge variant="success">Zero-Trust Architecture</Badge>
        </div>

        {/* Pipeline Steps with Connectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '840px', margin: '0 auto' }}>
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: step.bgColor,
                  border: `1px solid ${step.borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: step.highlight ? '0 2px 8px rgba(27, 99, 52, 0.12)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: step.highlight ? 'var(--color-brand)' : '#ffffff',
                      color: step.highlight ? '#ffffff' : 'var(--text-main)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      flexShrink: 0
                    }}>
                      {step.num}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: step.highlight ? 'var(--color-brand-dark)' : 'var(--text-main)', fontSize: '0.96rem' }}>
                          {step.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45, marginBottom: 0 }}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <Badge variant={step.badgeVar}>
                    {step.badge}
                  </Badge>
                </div>

                {idx < pipelineSteps.length - 1 && (
                  <div style={{ textAlign: 'center', color: 'var(--color-brand)', padding: '2px 0' }}>
                    <ArrowDown size={16} style={{ margin: '0 auto', opacity: 0.7 }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Agronomic & Environmental Formulas Reference */}
      <div className="grid-2">
        {/* Irrigation Formulation Card */}
        <div className="card" style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--color-brand)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Droplets size={18} style={{ color: 'var(--color-brand)' }} />
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              FAO-56 Irrigation & Soil Balance Math
            </h4>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong>Crop Evapotranspiration:</strong>{' '}
              <code style={{ background: 'var(--bg-card-subtle)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>ET_c = K_c × ET_0</code>
            </div>
            <div>
              <strong>Soil Moisture Deficit:</strong>{' '}
              <code style={{ background: 'var(--bg-card-subtle)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>Deficit = ET_c - Available Soil Moisture</code>
            </div>
            <div>
              <strong>Effective Rain Credit:</strong> Subtracted directly from raw depth requirements.
            </div>
            <div>
              <strong>Volumetric Conversion:</strong> 1 acre-mm = 4,046.86 Liters of water.
            </div>
          </div>
        </div>

        {/* Environmental Impact Card */}
        <div className="card" style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--accent-amber)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Zap size={18} style={{ color: 'var(--accent-amber)' }} />
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Stubble Emission & Pumping Parameters
            </h4>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong>Stubble Mass Generation:</strong> ~1.5 to 1.9x grain yield.
            </div>
            <div>
              <strong>CO₂e Avoidance Factor:</strong> ~1,460 kg CO₂e / tonne residue mulched vs burned.
            </div>
            <div>
              <strong>PM2.5 Avoidance Factor:</strong> ~7.5 kg PM2.5 / tonne residue incorporated.
            </div>
            <div>
              <strong>Tubewell Pumping Discharge:</strong> ~28,000 Liters/hr (standard 5 HP centrifugal pump).
            </div>
          </div>
        </div>
      </div>

      {/* 4. Offline Resilience Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: 'rgba(27, 99, 52, 0.04)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-brand-border)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <Server size={16} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
        <span>
          <strong>Offline Edge Resilience:</strong> If internet connectivity drops during field operations, the client-side deterministic fallback engine evaluates irrigation deficits locally without requiring an active LLM connection.
        </span>
      </div>

    </div>
  );
}
