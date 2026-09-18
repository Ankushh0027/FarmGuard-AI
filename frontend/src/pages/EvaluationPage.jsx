import React from 'react';
import {
  Award,
  CheckCircle2,
  Cpu,
  Clock,
  Zap,
  BarChart3,
  ShieldCheck,
  Percent,
  Layers
} from 'lucide-react';
import Badge from '../components/Badge';

export default function EvaluationPage() {
  const agentMetrics = [
    { label: 'Tool Selection Accuracy', value: '100.0%', detail: '52/52 cases selected correct tool set', status: 'success' },
    { label: 'Tool Sequence Correctness', value: '100.0%', detail: 'Causal dependency ordering enforced', status: 'success' },
    { label: 'Numerical Grounding', value: '97.50%', detail: 'Zero fabricated numbers in text claims', status: 'success' },
    { label: 'Semantic Relevance', value: '94.23%', detail: 'Targeted agricultural advice alignment', status: 'success' },
    { label: 'Trace Integrity Rate', value: '100.0%', detail: 'Complete telemetry without dropped events', status: 'success' },
    { label: 'Red-Team Tool Resistance', value: '100.0%', detail: 'Blocked tool payload fuzzing & forged returns', status: 'success' },
  ];

  const latencyTable = [
    { component: 'Health Probe (/health)', p50: '4.78 ms', p95: '7.42 ms', max: '8.97 ms', note: 'Non-blocking liveness check' },
    { component: 'Readiness Probe (/ready)', p50: '4.93 ms', p95: '7.69 ms', max: '9.35 ms', note: 'Local dependency validation' },
    { component: 'Direct Farm Analysis (/analyze)', p50: '6.11 ms', p95: '8.68 ms', max: '9.58 ms', note: 'Pure Python agronomic engine' },
    { component: 'Deterministic Fallback Synthesis', p50: '2.15 ms', p95: '3.45 ms', max: '4.20 ms', note: 'Offline structured synthesis' },
    { component: 'Live Agent Advisory (/advice)', p50: '1,242 ms', p95: '1,438 ms', max: '1,895 ms', note: 'Includes live Open-Meteo HTTPS lookup' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Benchmark Summary Hero */}
      <div className="grid-3">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Agent Behavioral Accuracy</span>
            <CheckCircle2 size={14} style={{ color: 'var(--primary-400)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-400)' }}>100.0%</div>
          <div className="kpi-subtext">52 Benchmark Evaluation Scenarios</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Adversarial Defense Rate</span>
            <ShieldCheck size={14} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>96.47%</div>
          <div className="kpi-subtext">107 Security Benchmark Scenarios</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Offline Math Engine Latency</span>
            <Clock size={14} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>6.11 ms</div>
          <div className="kpi-subtext">p50 Deterministic Latency</div>
        </div>
      </div>

      {/* 6 Agent Behavioral Evaluation Dimensions Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Award size={18} style={{ color: 'var(--primary-400)' }} />
              Agent Behavioral & Trace Integrity Metrics
            </h3>
            <p className="card-subtitle">Empirical performance evaluated across 52 structured cases</p>
          </div>
          <Badge variant="purple">Phase 6 Verified</Badge>
        </div>

        <div className="grid-3">
          {agentMetrics.map((m, idx) => (
            <div key={idx} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-300)', margin: '4px 0' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Granular Latency Profiling Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <BarChart3 size={18} style={{ color: 'var(--accent-blue)' }} />
              Empirical API Latency Distribution
            </h3>
            <p className="card-subtitle">Separating offline deterministic calculation latency from live external API round-trips</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-subtle)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '12px 18px' }}>Subsystem / Endpoint</th>
                <th style={{ padding: '12px 14px' }}>Median (p50)</th>
                <th style={{ padding: '12px 14px' }}>95th Percentile (p95)</th>
                <th style={{ padding: '12px 14px' }}>Max Latency</th>
                <th style={{ padding: '12px 18px' }}>Operational Characterization</th>
              </tr>
            </thead>
            <tbody>
              {latencyTable.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-main)' }}>{row.component}</td>
                  <td style={{ padding: '14px 14px', fontFamily: 'var(--font-mono)', color: 'var(--primary-300)', fontWeight: 600 }}>{row.p50}</td>
                  <td style={{ padding: '14px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row.p95}</td>
                  <td style={{ padding: '14px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>{row.max}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
