import React, { useState } from 'react';
import {
  Droplets,
  Zap,
  IndianRupee,
  Leaf,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { PUMP_CAPACITIES } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function SavingsPage({ setActivePage }) {
  const { farm, setFarm, latestAnalysis } = useFarm();
  const [selectedHp, setSelectedHp] = useState(farm.pump_hp || 5);
  const [customTariff, setCustomTariff] = useState(farm.electricity_tariff || 6);

  const selectedPump = PUMP_CAPACITIES.find(p => p.hp === Number(selectedHp)) || PUMP_CAPACITIES[1];

  const analysis = latestAnalysis?.data || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;

  // Real or dynamically computed values based on latest analysis or representative baseline
  const waterSavedLiters = waterAnalysis?.water_savings_liters ?? 0;
  const pumpHoursSaved = waterSavedLiters > 0
    ? Number((waterSavedLiters / selectedPump.dischargeLph).toFixed(1))
    : (waterAnalysis?.pump_hours_saved ?? 0);
  const electricitySavedKwh = Number((pumpHoursSaved * selectedPump.kwDraw).toFixed(1));
  const moneySavedInr = Math.round(electricitySavedKwh * customTariff);
  const co2AvoidedKg = envImpact?.co2e_avoided_kg ?? Number((electricitySavedKwh * 0.82).toFixed(1));

  // Seasonal estimation (assuming 4 irrigations per crop season)
  const seasonalWaterSaved = waterSavedLiters * 4;
  const seasonalMoneySaved = moneySavedInr * 4;
  const seasonalHoursSaved = (pumpHoursSaved * 4).toFixed(1);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--primary-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Water & Energy Saved
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              See how matching irrigation to crop moisture needs reduces groundwater extraction and electricity bills.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setActivePage?.('analysis')}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Check Water Need <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Savings Metrics */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Water Saved</span>
            <Droplets size={14} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
            {waterSavedLiters > 0 ? `${waterSavedLiters.toLocaleString()} L` : '0 L'}
          </div>
          <div className="kpi-subtext">
            {waterSavedLiters > 0 ? `Saved in current watering` : 'Run calculation to see savings'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Tubewell Pump Time Saved</span>
            <Clock size={14} style={{ color: 'var(--primary-400)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-400)' }}>
            {pumpHoursSaved > 0 ? `${pumpHoursSaved} hrs` : '0 hrs'}
          </div>
          <div className="kpi-subtext">
            Based on {selectedPump.hp} HP tubewell ({selectedPump.dischargeLph.toLocaleString()} L/hr)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Electricity Saved</span>
            <Zap size={14} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>
            {electricitySavedKwh > 0 ? `${electricitySavedKwh} kWh` : '0 kWh'}
          </div>
          <div className="kpi-subtext">
            ≈ ₹{moneySavedInr} electricity bill reduction
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>CO₂ Emissions Avoided</span>
            <Leaf size={14} style={{ color: '#a7f3d0' }} />
          </div>
          <div className="kpi-value" style={{ color: '#a7f3d0' }}>
            {co2AvoidedKg > 0 ? `${co2AvoidedKg} kg` : '0 kg'}
          </div>
          <div className="kpi-subtext">
            From reduced grid pumping & residue care
          </div>
        </div>
      </div>

      {/* Interactive Tubewell & Electricity Calculator */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Gauge size={18} style={{ color: 'var(--primary-400)' }} />
              Customize Your Pump & Electricity Settings
            </h3>
            <p className="card-subtitle">
              Adjust your tubewell motor capacity and local tariff to see customized operational savings.
            </p>
          </div>
          <Badge variant="success">Interactive</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '16px 0' }}>
          <div>
            <label className="form-label">Tubewell Pump Motor (HP)</label>
            <select
              className="form-select"
              value={selectedHp}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedHp(val);
                setFarm(prev => ({ ...prev, pump_hp: val }));
              }}
            >
              {PUMP_CAPACITIES.map(p => (
                <option key={p.hp} value={p.hp}>{p.label}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              Discharge: {selectedPump.dischargeLph.toLocaleString()} Litres/hour • Power Draw: ~{selectedPump.kwDraw} kW
            </div>
          </div>

          <div>
            <label className="form-label">Electricity Tariff (₹ per unit / kWh)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                className="form-input"
                value={customTariff}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomTariff(val);
                  setFarm(prev => ({ ...prev, electricity_tariff: val }));
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>₹ / kWh</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              Typical agricultural subsidized rate in India: ₹4 – ₹7 / kWh
            </div>
          </div>
        </div>

        {/* Seasonal Impact Projections */}
        {waterSavedLiters > 0 && (
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.8))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginTop: '12px'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-300)', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} />
              Full Crop Season Projection (4 Irrigations)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Total Water Saved: </span>
                <strong style={{ color: 'var(--accent-blue)' }}>{seasonalWaterSaved.toLocaleString()} L</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Total Pump Time Saved: </span>
                <strong style={{ color: 'var(--primary-300)' }}>{seasonalHoursSaved} hours</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Total Money Saved: </span>
                <strong style={{ color: 'var(--accent-gold)' }}>₹{seasonalMoneySaved.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Why This Matters for the Farmer and the Planet */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} style={{ color: 'var(--primary-400)' }} />
              Why Saving Pumping Hours Matters
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p>
              • <strong>Prevent Waterlogging:</strong> Over-watering suffocates crop roots, promotes fungal rot, and leaches valuable fertilizers past the root zone.
            </p>
            <p>
              • <strong>Extend Pump Life:</strong> Running your tubewell only when needed reduces motor heat, bearing wear, and transformer overload trips during peak summer.
            </p>
            <p>
              • <strong>Save Labor & Diesel:</strong> Farmers relying on diesel generator sets save ~1.8 Litres of diesel for every pump hour avoided.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Leaf size={18} style={{ color: '#a7f3d0' }} />
              Environmental & Groundwater Health
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p>
              • <strong>Aquifer Conservation:</strong> Groundwater tables across Punjab, Haryana, and UP are declining by up to 0.5–1.0 meters annually. Precision scheduling stabilizes aquifers.
            </p>
            <p>
              • <strong>Reduced Grid Burden:</strong> Agricultural pumping accounts for ~18% of India’s electrical consumption. Less idle pumping cuts thermal power station emissions.
            </p>
            <p>
              • <strong>Soil Organic Carbon:</strong> Balanced moisture combined with residue mulching retains soil biology and increases natural water holding capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
