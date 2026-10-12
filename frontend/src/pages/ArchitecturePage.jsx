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
  Server
} from 'lucide-react';
import Badge from '../components/Badge';

export default function ArchitecturePage() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Architecture Overview Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Cpu size={18} style={{ color: 'var(--color-brand)' }} />
              End-to-End System Pipeline
            </h3>
            <p className="card-subtitle">Zero-trust defense-in-depth decoupled from pure Python deterministic agronomic math</p>
          </div>
          <Badge variant="success">Production Grade</Badge>
        </div>

        {/* Visual Pipeline Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '820px', margin: '14px auto' }}>
          <div style={{ padding: '12px 18px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--text-main)' }}>
            1. Farmer / Client Request (Natural Language or Structured Farm JSON)
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '12px 18px', background: 'var(--accent-sky-muted)', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-blue)' }}>
            2. Production Security Middleware (X-Request-ID Tracing, Security Headers, Sliding Rate Limiter, 413 Size Limiter)
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '12px 18px', background: 'var(--accent-amber-muted)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-amber)' }}>
            3. Input Guardrails & Prompt Injection Defense (Pydantic Bounds, DAN / Obfuscation Filter, Secret Scans)
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '12px 18px', background: 'var(--accent-purple-muted)', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-purple)' }}>
            4. FarmGuard Agent Coordinator (Tool Intent Matching & Causal Sequence Enforcement)
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '14px 18px', background: 'var(--color-brand-muted)', border: '1px solid var(--color-brand-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, color: 'var(--color-brand-dark)', fontSize: '1.02rem', marginBottom: '4px' }}>
              5. Deterministic Farm Calculation Layer (Zero LLM Hallucination)
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Open-Meteo Weather • FAO-56 Crop Water ($K_c \times ET_0$) • Irrigation Deficit • Stubble Residue • Carbon Footprint
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '12px 18px', background: 'var(--accent-purple-muted)', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-purple)' }}>
            6. LLM Synthesis Layer (Gemini API with Client-Side Deterministic Fallback Engine)
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-brand)' }}><ArrowDown size={18} style={{ margin: '0 auto' }} /></div>

          <div style={{ padding: '12px 18px', background: 'var(--color-brand-muted)', border: '1px solid var(--color-brand-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
            7. Output Guardrails & Numerical Grounding (Verification of Claims vs Tool Output Numbers)
          </div>
        </div>
      </div>

      {/* Agronomic Formulas Reference */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Droplets size={18} style={{ color: 'var(--accent-sky)' }} />
              Irrigation & Water Deficit Math
            </h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Crop Evapotranspiration:</strong> <code>ET_c = K_c × ET_0</code></div>
            <div><strong>Soil Moisture Deficit:</strong> <code>Deficit = ET_c - Available Soil Moisture</code></div>
            <div><strong>Effective Rain Credit:</strong> Subtracted directly from depth requirement.</div>
            <div><strong>Volumetric Conversion:</strong> 1 acre-mm = 4,046.86 Liters of water.</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Zap size={18} style={{ color: 'var(--accent-gold)' }} />
              Environmental Impact Factors
            </h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div><strong>Stubble Generation:</strong> ~1.5 to 1.9x grain yield.</div>
            <div><strong>CO₂e Avoidance Factor:</strong> ~1,460 kg CO₂e / tonne residue mulched vs burned.</div>
            <div><strong>PM2.5 Avoidance Factor:</strong> ~7.5 kg PM2.5 / tonne residue incorporated.</div>
            <div><strong>Tubewell Pumping:</strong> ~28,000 Liters/hr (5 HP pump standard).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
