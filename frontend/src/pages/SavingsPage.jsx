import React, { useState } from 'react';
import {
  Droplets,
  Zap,
  Leaf,
  Clock,
  ArrowRight,
  Sparkles,
  Gauge,
  CheckCircle2,
  Timer,
  Calculator,
  IndianRupee,
  ShieldCheck,
  TrendingDown,
  BarChart3,
  TrendingUp,
  Layers,
  Info,
  Calendar
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { PUMP_CAPACITIES } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function SavingsPage({ setActivePage }) {
  const { farm, setFarm, latestAnalysis, t, language } = useFarm();
  const [selectedHp, setSelectedHp] = useState(farm.pump_hp || 5);
  const [customTariff, setCustomTariff] = useState(farm.electricity_tariff || 6);

  React.useEffect(() => {
    if (farm.pump_hp) setSelectedHp(farm.pump_hp);
    if (farm.electricity_tariff) setCustomTariff(farm.electricity_tariff);
  }, [farm.pump_hp, farm.electricity_tariff]);

  const selectedPump = PUMP_CAPACITIES.find(p => p.hp === Number(selectedHp)) || PUMP_CAPACITIES[1];

  const analysis = latestAnalysis?.data || null;
  const rec = analysis?.irrigation_recommendation || analysis?.recommendation || null;
  const waterAnalysis = analysis?.water_analysis || null;
  const envImpact = analysis?.environmental_impact || null;

  // Real or dynamically computed values based on latest analysis or calibrated representative baseline
  const areaAcres = parseFloat(farm.area_acres) || 2.0;
  const waterSavedLiters = waterAnalysis?.water_savings_liters ?? Math.round(35 * areaAcres * 4046.8564 * 0.38); // 38% conservative savings over baseline
  const flowLpm = parseFloat(farm.pump_flow_lpm) || (selectedPump.dischargeLph / 60);

  const pumpMinutesSaved = waterSavedLiters > 0 && flowLpm > 0 ? (waterSavedLiters / flowLpm) : 0;
  const pumpHoursSaved = Number((pumpMinutesSaved / 60).toFixed(1));

  const electricitySavedKwh = Number((pumpHoursSaved * selectedPump.kwDraw).toFixed(1));
  const moneySavedInr = Math.round(electricitySavedKwh * customTariff);
  const co2AvoidedKg = envImpact?.co2e_avoided_kg ?? Number((electricitySavedKwh * 0.82).toFixed(1));

  // Baseline comparison volumes
  const baselineWaterLiters = Math.round(waterSavedLiters / 0.38);
  const precisionWaterLiters = baselineWaterLiters - waterSavedLiters;
  const baselineElectricityKwh = Number((baselineWaterLiters / (flowLpm * 60) * selectedPump.kwDraw).toFixed(1));
  const precisionElectricityKwh = Number((precisionWaterLiters / (flowLpm * 60) * selectedPump.kwDraw).toFixed(1));
  const baselineCostInr = Math.round(baselineElectricityKwh * customTariff);
  const precisionCostInr = Math.round(precisionElectricityKwh * customTariff);

  // Seasonal estimation across 4 standard irrigation cycles
  const seasonalWaterSaved = waterSavedLiters * 4;
  const seasonalMoneySaved = moneySavedInr * 4;
  const seasonalHoursSaved = (pumpHoursSaved * 4).toFixed(1);
  const seasonalCo2Avoided = Number((co2AvoidedKg * 4).toFixed(1));

  const seasonalStages = [
    {
      name: language === 'hindi' ? 'चरण 1: बुवाई व पहली सिंचाई' : language === 'hinglish' ? 'Stage 1: Buwai Aur Pehli Sinchai' : 'Stage 1: Sowing & Early Rooting',
      baselineL: Math.round(baselineWaterLiters * 1.1),
      precisionL: Math.round(precisionWaterLiters * 1.1),
      savedL: Math.round(waterSavedLiters * 1.1)
    },
    {
      name: language === 'hindi' ? 'चरण 2: कल्ले फूटना व बढ़वार' : language === 'hinglish' ? 'Stage 2: Kalle Phootna Aur Badhwar' : 'Stage 2: Tillering / Vegetative',
      baselineL: Math.round(baselineWaterLiters * 1.0),
      precisionL: Math.round(precisionWaterLiters * 1.0),
      savedL: Math.round(waterSavedLiters * 1.0)
    },
    {
      name: language === 'hindi' ? 'चरण 3: फूल व बाली निकलना' : language === 'hinglish' ? 'Stage 3: Phool Aur Baali Nikalna' : 'Stage 3: Flowering & Heading',
      baselineL: Math.round(baselineWaterLiters * 1.2),
      precisionL: Math.round(precisionWaterLiters * 1.2),
      savedL: Math.round(waterSavedLiters * 1.2)
    },
    {
      name: language === 'hindi' ? 'चरण 4: दाना भरना व पकना' : language === 'hinglish' ? 'Stage 4: Daana Bharna Aur Pakna' : 'Stage 4: Grain Filling & Maturity',
      baselineL: Math.round(baselineWaterLiters * 0.7),
      precisionL: Math.round(precisionWaterLiters * 0.7),
      savedL: Math.round(waterSavedLiters * 0.7)
    },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-brand)', letterSpacing: '0.04em', marginBottom: '4px' }}>
              <Zap size={13} />
              {t.savingsTitle || 'Water, Electricity & Money Saved'}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 4px', letterSpacing: '-0.02em' }}>
              {language === 'hindi'
                ? 'पानी, बिजली और खर्चे की बचत का हिसाब'
                : language === 'hinglish'
                  ? 'Paani, Bijli Aur Kharcha Bachat Ka Hisaab'
                  : 'Water, Energy & Money Savings Ledger'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0, maxWidth: '680px' }}>
              {t.savingsSubtitle || 'See how much groundwater, tubewell running time, and electricity bill you save with smart irrigation.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActivePage?.('analysis')}
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <span>{t.navWaterNeed || 'Recalculate Field Plan'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Savings Metrics */}
      <div className="savings-metrics-grid">
        {/* Metric 1: Water Volume */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-sky)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{language === 'hindi' ? 'भूजल की बचत' : language === 'hinglish' ? 'Ground Water Bachat' : 'Groundwater Saved'}</span>
            <Droplets size={15} style={{ color: 'var(--accent-sky)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-sky-dark)', margin: '4px 0 2px' }}>
            {waterSavedLiters.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>L</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {language === 'hindi' ? `प्रति सिंचाई (${areaAcres} एकड़)` : `Per irrigation across ${areaAcres} acres`}
          </div>
        </div>

        {/* Metric 2: Pump Running Time */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{language === 'hindi' ? 'पंप का बचा समय' : language === 'hinglish' ? 'Pump Ka Bacha Time' : 'Pumping Hours Saved'}</span>
            <Clock size={15} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-amber-dark)', margin: '4px 0 2px' }}>
            {pumpHoursSaved} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.hours || 'hrs'}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {language === 'hindi' ? 'कम समय तक पंप चलाना पड़ेगा' : `Based on ~${flowLpm.toFixed(0)} L/min flow`}
          </div>
        </div>

        {/* Metric 3: Power Saved */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--color-brand)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{language === 'hindi' ? 'बिजली व बिल की बचत' : language === 'hinglish' ? 'Bijli Aur Bill Ki Bachat' : 'Electricity & Bill Saved'}</span>
            <Zap size={15} style={{ color: 'var(--color-brand)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: '4px 0 2px' }}>
            {electricitySavedKwh} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            ≈ ₹{moneySavedInr.toLocaleString()} {language === 'hindi' ? 'बिल में बचत प्रति सिंचाई' : 'bill reduction per cycle'}
          </div>
        </div>

        {/* Metric 4: CO2 Avoided */}
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{language === 'hindi' ? 'पर्यावरण लाभ' : 'Emissions Avoided'}</span>
            <Leaf size={15} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: '#15803d', margin: '4px 0 2px' }}>
            {co2AvoidedKg} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {language === 'hindi' ? 'कम डीजल/बिजली जलने से स्वच्छ हवा' : 'Avoided pump emissions'}
          </div>
        </div>
      </div>

      {/* COMPARATIVE IMPACT BAR CHARTS: Conventional vs Precision */}
      <div className="card" style={{ padding: '26px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={19} style={{ color: 'var(--color-brand)' }} />
              {language === 'hindi'
                ? 'पारंपरिक खुला बहाव बनाम FarmGuard सटीक सिंचाई'
                : language === 'hinglish'
                  ? 'Traditional Khula Bahaav vs FarmGuard Sahi Paani'
                  : 'Conventional Practice vs FarmGuard Precision Mode'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {language === 'hindi'
                ? `${areaAcres} एकड़ खेत के लिए बिना नाप के पानी बहाने और सटीक सिंचाई की तुलना।`
                : `Comparison across ${areaAcres} acres between conventional flood and calibrated root watering.`}
            </p>
          </div>
          <span className="badge badge-success">~38% {language === 'hindi' ? 'पानी की बचत' : 'Resource Savings'}</span>
        </div>

        <div className="comparison-charts-grid">
          {/* Chart 1: Water Volume */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
              {language === 'hindi' ? 'खेत में लगा पानी (लीटर)' : 'Water Applied per Irrigation (Litres)'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  <span>{language === 'hindi' ? 'पारंपरिक खुला बहाव' : 'Traditional Flood Irrigation'}</span>
                  <strong>{baselineWaterLiters.toLocaleString()} L</strong>
                </div>
                <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--color-brand-dark)', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700 }}>{language === 'hindi' ? 'FarmGuard सटीक पानी' : 'FarmGuard Precision Water'}</span>
                  <strong>{precisionWaterLiters.toLocaleString()} L</strong>
                </div>
                <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((precisionWaterLiters / baselineWaterLiters) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #1b532e 0%, #34d399 100%)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Pumping Power & Cost */}
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
              {language === 'hindi' ? 'पंप का बिजली खर्च प्रति सिंचाई (₹)' : 'Electricity Cost per Cycle (₹)'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  <span>{language === 'hindi' ? 'पारंपरिक खर्च' : 'Conventional Cost'}</span>
                  <strong>₹{baselineCostInr.toLocaleString()}</strong>
                </div>
                <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--accent-amber-dark)', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700 }}>{language === 'hindi' ? 'FarmGuard के साथ खर्च' : 'FarmGuard Precision Cost'}</span>
                  <strong>₹{precisionCostInr.toLocaleString()}</strong>
                </div>
                <div style={{ height: '14px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((precisionCostInr / Math.max(1, baselineCostInr)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tubewell & Electricity Settings */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Gauge size={19} style={{ color: 'var(--color-brand)' }} />
              {language === 'hindi' ? 'अपने पंप की पावर व बिजली दर सेट करें' : 'Pump Horsepower & Electricity Rate'}
            </h3>
            <p className="card-subtitle">
              {language === 'hindi' ? 'अपने ट्यूबवेल की क्षमता और बिजली दर चुनकर बचत का सटीक हिसाब देखें।' : 'Set your pump horsepower and regional tariff to customize savings.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', margin: '16px 0' }}>
          <div>
            <label className="form-label">{language === 'hindi' ? 'पंप का पानी बहाव (लीटर / मिनट)' : 'Pump Flow Rate (Litres / min)'}</label>
            <input
              type="number"
              min="50"
              max="10000"
              step="50"
              className="form-input"
              placeholder="e.g. 460 L/min"
              value={farm.pump_flow_lpm || ''}
              onChange={(e) => setFarm(prev => ({ ...prev, pump_flow_lpm: e.target.value }))}
            />
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              {language === 'hindi' ? 'खाली छोड़ने पर 5 HP (~460 ली/मिनट) माना जाएगा' : 'Default is ~460 L/min for 5 HP pump'}
            </div>
          </div>

          <div>
            <label className="form-label">{language === 'hindi' ? 'पंप की मोटर (Horsepower - HP)' : 'Motor Rating (Horsepower)'}</label>
            <select
              className="form-select"
              value={selectedHp}
              onChange={(e) => {
                const hp = Number(e.target.value);
                setSelectedHp(hp);
                setFarm(prev => ({ ...prev, pump_hp: hp }));
              }}
            >
              {PUMP_CAPACITIES.map(p => (
                <option key={p.hp} value={p.hp}>{p.hp} HP ({p.kwDraw} kW) — ~{Math.round(p.dischargeLph / 60)} L/min</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">{language === 'hindi' ? 'बिजली दर (रुपये प्रति यूनिट / kWh)' : 'Electricity Tariff (₹ / kWh)'}</label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.5"
              className="form-input"
              value={customTariff}
              onChange={(e) => {
                const tf = parseFloat(e.target.value) || 6;
                setCustomTariff(tf);
                setFarm(prev => ({ ...prev, electricity_tariff: tf }));
              }}
            />
            <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              {language === 'hindi' ? 'कृषि बिजली का बिल दर (लगभग ₹4–₹7/यूनिट)' : 'Regional agricultural tariff rate'}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Stage Table */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={19} style={{ color: 'var(--color-brand)' }} />
              {language === 'hindi' ? 'पूरी फसल के 4 चरणों में संभावित बचत' : 'Seasonal Savings Across 4 Growth Stages'}
            </h3>
            <p className="card-subtitle">
              {language === 'hindi' ? 'फसल के हर मुख्य चरण में पानी और पैसे की बचत का अनुमान' : 'Estimated savings across the complete crop growth cycle'}
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left', minWidth: '560px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px' }}>{language === 'hindi' ? 'फसल चरण' : 'Crop Stage'}</th>
                <th style={{ padding: '10px 14px' }}>{language === 'hindi' ? 'पारंपरिक पानी' : 'Traditional Flood'}</th>
                <th style={{ padding: '10px 14px' }}>{language === 'hindi' ? 'FarmGuard पानी' : 'FarmGuard Water'}</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-brand-dark)' }}>{language === 'hindi' ? 'पानी की बचत' : 'Water Saved'}</th>
              </tr>
            </thead>
            <tbody>
              {seasonalStages.map((stg, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{stg.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{stg.baselineL.toLocaleString()} L</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-brand-dark)', fontWeight: 600 }}>{stg.precisionL.toLocaleString()} L</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-brand)', fontWeight: 800 }}>+{stg.savedL.toLocaleString()} L</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--color-brand-muted)', fontWeight: 800 }}>
                <td style={{ padding: '12px 14px', color: 'var(--color-brand-dark)' }}>{language === 'hindi' ? 'कुल सीज़नल बचत' : 'Total Seasonal Savings'}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{(seasonalWaterSaved / 0.38).toLocaleString(undefined, { maximumFractionDigits: 0 })} L</td>
                <td style={{ padding: '12px 14px', color: 'var(--color-brand-dark)' }}>{((seasonalWaterSaved / 0.38) - seasonalWaterSaved).toLocaleString(undefined, { maximumFractionDigits: 0 })} L</td>
                <td style={{ padding: '12px 14px', color: 'var(--color-brand-dark)' }}>+{seasonalWaterSaved.toLocaleString()} L (~₹{seasonalMoneySaved.toLocaleString()} Saved)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
