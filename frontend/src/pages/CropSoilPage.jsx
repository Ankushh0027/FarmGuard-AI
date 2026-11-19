import React, { useState } from 'react';
import {
  Sprout,
  Layers,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  Info,
  Timer,
  Leaf,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_CROPS, SUPPORTED_SOILS, PUMP_CAPACITIES } from '../config/agriculturalData';
import { getSoilMoistureGuide, getPumpFlowGuide } from '../utils/i18n';
import Badge from '../components/Badge';

export default function CropSoilPage({ setActivePage }) {
  const { farm, t, language } = useFarm();
  const [selectedCropId, setSelectedCropId] = useState(farm.crop || 'wheat');
  const [selectedSoilId, setSelectedSoilId] = useState(farm.soil_type || 'alluvial');

  // Pump drum test helper state
  const [drumLitres, setDrumLitres] = useState(200);
  const [drumSeconds, setDrumSeconds] = useState(26);

  const calculatedLpm = drumSeconds > 0 ? Math.round((drumLitres / drumSeconds) * 60) : 460;
  const activeCrop = SUPPORTED_CROPS.find(c => c.id === selectedCropId) || SUPPORTED_CROPS[0];
  const activeSoil = SUPPORTED_SOILS.find(s => s.id === selectedSoilId) || SUPPORTED_SOILS[0];

  const moistureGuide = getSoilMoistureGuide(language);
  const pumpGuide = getPumpFlowGuide(language);

  const CROP_STAGES = {
    wheat: [
      { name: language === 'hindi' ? 'क्राउन रूट (CRI चरण)' : 'Crown Root Initiation (CRI)', days: '20–25 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'पहली और सबसे महत्वपूर्ण सिंचाई। इस समय पानी न मिलने से कल्ले कम निकलते हैं।' : 'Most vital irrigation. Delaying reduces tillering and root development.' },
      { name: language === 'hindi' ? 'कल्ले फूटना (टिलरिंग)' : 'Tillering Stage', days: '40–45 days', waterNeed: 'High', desc: language === 'hindi' ? 'पौधे में नई शाखाएं और पत्तियां बनती हैं।' : 'Active vegetative growth; requires moderate soil moisture.' },
      { name: language === 'hindi' ? 'गाभा / गांठ बनना (जॉइंटिंग)' : 'Late Jointing Stage', days: '60–65 days', waterNeed: 'Medium', desc: language === 'hindi' ? 'तने में गांठें बनती हैं और बालियां बनने की तैयारी होती है।' : 'Stem elongation and ear head formation inside sheath.' },
      { name: language === 'hindi' ? 'फूल व बाली निकलना' : 'Flowering & Heading', days: '80–85 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'फूल आते समय सूखा पड़ने से दाने नहीं बनते।' : 'Pollen fertilization; water stress causes sterile spikelets.' },
      { name: language === 'hindi' ? 'दूधिया अवस्था (मिल्किंग)' : 'Milk / Dough Stage', days: '100–105 days', waterNeed: 'Medium', desc: language === 'hindi' ? 'दानों में दूध भरता है। हल्की सिंचाई लाभदायक।' : 'Grain filling. Light irrigation prevents shriveled grain.' },
    ],
    rice: [
      { name: language === 'hindi' ? 'रोपाई व जड़ पकड़ना' : 'Transplanting & Recovery', days: '0–10 days', waterNeed: 'High', desc: language === 'hindi' ? 'खेत में 2-3 सेमी उथला पानी बनाए रखें ताकि नए पौधे सूखें नहीं।' : 'Maintain shallow water layer for seedling establishment.' },
      { name: language === 'hindi' ? 'कल्ले फूटना (सक्रिय टिलरिंग)' : 'Active Tillering', days: '20–40 days', waterNeed: 'High', desc: language === 'hindi' ? 'अधिक कल्ले निकलने के लिए खेत में लगातार नमी जरूरी है।' : 'Critical period for productive tiller count.' },
      { name: language === 'hindi' ? 'बाली निकलना (पेनिकल)' : 'Panicle Initiation & Booting', days: '55–70 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'इस समय पानी की कमी से बालियां आधी खाली रह जाती हैं।' : 'Peak water consumption stage; never allow soil cracking.' },
      { name: language === 'hindi' ? 'फूल आना (एंथेसिस)' : 'Flowering & Grain Filling', days: '75–90 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'दूधिया दाने बनने तक हल्की नमी बनाए रखें।' : 'Pollination and milky stage.' },
    ],
    maize: [
      { name: language === 'hindi' ? 'अंकुरण व शुरुआती बढ़वार' : 'Seedling & Early Vegetative', days: '15–20 days', waterNeed: 'Medium', desc: language === 'hindi' ? 'हल्की सिंचाई। मक्का में जलभराव नहीं होना चाहिए।' : 'Sensitive to excess waterlogging; maintain well-drained rootzone.' },
      { name: language === 'hindi' ? 'नरमंजरी निकलना (टैसेलिंग)' : 'Tasseling (Male Flower)', days: '45–50 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'परागकण बनते हैं। इस समय नमी की कमी से पैदावार घट जाती है।' : 'Tassel emergence and pollen shed. Highest water sensitivity.' },
      { name: language === 'hindi' ? 'सिल्किंग (बाल निकलना)' : 'Silking (Female Flower)', days: '55–60 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'भुट्टे में बाल निकलते हैं। नियमित नमी अत्यंत आवश्यक।' : 'Silk reception of pollen; moisture stress leads to unfilled cobs.' },
      { name: language === 'hindi' ? 'दाना भरना (मिल्क व डो)' : 'Grain Filling Stage', days: '70–80 days', waterNeed: 'Medium', desc: language === 'hindi' ? 'दाने का आकार बढ़ता है।' : 'Starch accumulation in kernels.' },
    ],
    sugarcane: [
      { name: language === 'hindi' ? 'अंकुरण चरण' : 'Germination Stage', days: '0–35 days', waterNeed: 'Medium', desc: language === 'hindi' ? 'आंखों से जमाव के लिए हल्की नमी की जरूरत होती है।' : 'Bud sprouting; requires light, frequent water.' },
      { name: language === 'hindi' ? 'कल्ले फूटना (टिलरिंग)' : 'Tillering / Formative Stage', days: '40–100 days', waterNeed: 'High', desc: language === 'hindi' ? 'गन्ने की मोटाई और गन्नों की संख्या तय होती है।' : 'Maximum leaf area index and tiller development.' },
      { name: language === 'hindi' ? 'तीव्र बढ़वार (ग्रैंड ग्रोथ)' : 'Grand Growth Period', days: '100–250 days', waterNeed: 'Critical', desc: language === 'hindi' ? 'गन्ने की लंबाई और वजन बढ़ता है। भारी पानी की जरूरत।' : 'Longest phase with highest water transpiration.' },
      { name: language === 'hindi' ? 'पकाव अवस्था (परिपक्वता)' : 'Ripening & Maturation', days: '250–360 days', waterNeed: 'Low', desc: language === 'hindi' ? 'कटाई से 15 दिन पहले पानी बंद करें ताकि शर्करा की मात्रा बढ़े।' : 'Withhold water to concentrate sucrose content.' },
    ],
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-brand">{language === 'hindi' ? 'कृषि विज्ञान' : 'AGRONOMIC INTELLIGENCE'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FAO-56 & ICAR Benchmarks</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t.cropSoilTitle || 'Crop & Soil Agronomic Guide'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '720px' }}>
              {t.cropSoilSubtitle || 'Detailed growth stages, water requirements, and soil characteristics for Indian agriculture.'}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActivePage('analysis')}
            style={{ fontSize: '0.9rem', padding: '9px 18px' }}
          >
            <Droplets size={16} style={{ marginRight: '6px' }} />
            {t.navWaterNeed || 'Check Water Need'}
          </button>
        </div>
      </div>

      {/* 2. Interactive Crop Selector Tabs */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
          {language === 'hindi' ? '1. प्रमुख भारतीय फसलें व क्रांतिक अवस्थाएं' : language === 'hinglish' ? '1. Pramukh Fasal Aur Paani Ki Stages' : '1. Major Indian Crops & Critical Watering Stages'}
        </h2>

        {/* Crop Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {SUPPORTED_CROPS.map((c) => {
            const isSelected = selectedCropId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCropId(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                    {c.name.split(' ')[0]}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.season}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Crop Detail Pane */}
        <div style={{
          backgroundColor: 'var(--bg-app)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {activeCrop.icon} {activeCrop.name}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px' }}>
                {activeCrop.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>TARGET MOISTURE</span>
                <strong style={{ color: 'var(--color-brand)', fontSize: '1rem' }}>{activeCrop.targetMoisture}%</strong>
              </div>
              <div style={{ padding: '6px 12px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CRITICAL STRESS</span>
                <strong style={{ color: '#b91c1c', fontSize: '1rem' }}>{activeCrop.criticalMoisture}%</strong>
              </div>
              <div style={{ padding: '6px 12px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>BASE DEPTH</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{activeCrop.baseDepthMm} mm</strong>
              </div>
            </div>
          </div>

          {/* Growth Stages Timeline */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            {language === 'hindi' ? 'सिंचाई के क्रांतिक चरण (Growth Stages)' : 'Critical Irrigation Stages'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(CROP_STAGES[selectedCropId] || CROP_STAGES.wheat).map((stage, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  backgroundColor: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: stage.waterNeed === 'Critical' ? '#fef2f2' : 'var(--color-brand-muted)',
                    color: stage.waterNeed === 'Critical' ? '#b91c1c' : 'var(--color-brand-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{stage.name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{stage.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {stage.days}
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: stage.waterNeed === 'Critical' ? '#fef2f2' : 'var(--bg-surface-subtle)',
                    color: stage.waterNeed === 'Critical' ? '#b91c1c' : 'var(--text-secondary)',
                    border: stage.waterNeed === 'Critical' ? '1px solid #fecaca' : '1px solid var(--border-default)'
                  }}>
                    {stage.waterNeed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Soil Types Grid & Moisture Retention */}
      <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
          {language === 'hindi' ? '2. भारतीय मिट्टी के प्रकार व जल-धारण क्षमता' : language === 'hinglish' ? '2. Mitti Ke Prakaar Aur Paani Rokne Ki Shamta' : '2. Soil Types & Water Retention Factors'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {SUPPORTED_SOILS.map((s) => {
            const isSelected = selectedSoilId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSoilId(s.id)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Practical Diagnostic Helpers: Hand-Ball Test & Drum Flow Rate */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Hand-Ball Moisture Guide */}
        <div className="card" style={{ padding: '22px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-dark)' }}>
                <Layers size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {moistureGuide.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {language === 'hindi' ? 'यदि आपके पास इलेक्ट्रॉनिक सेंसर नहीं है, तो भारतीय कृषि वैज्ञानिकों द्वारा अनुशंसित 6-इंच मिट्टी का गोला टेस्ट अपनाएं:' : 'If you do not have digital moisture sensors, use the ICAR-recommended hand-feel soil test:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {moistureGuide.steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-brand)', minWidth: '18px' }}>{i + 1}.</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Rule of Thumb:</strong> 55% to 65% is optimal for wheat and maize. Above 80% causes root asphyxiation.
          </div>
        </div>

        {/* 200L Drum Pump Flow Helper */}
        <div className="card" style={{ padding: '22px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Timer size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {pumpGuide.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {pumpGuide.explanation}
            </p>

            {/* Interactive Calculator Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {language === 'hindi' ? 'ड्रम का आकार (लीटर)' : 'Drum Size (Liters)'}
                </label>
                <input
                  type="number"
                  value={drumLitres}
                  onChange={(e) => setDrumLitres(Number(e.target.value))}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {language === 'hindi' ? 'भरने में सेकंड' : 'Seconds to Fill'}
                </label>
                <input
                  type="number"
                  value={drumSeconds}
                  onChange={(e) => setDrumSeconds(Number(e.target.value))}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Result Pill */}
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {language === 'hindi' ? 'अनुमानित ट्यूबवेल बहाव' : 'Calculated Tubewell Discharge'}
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>
                {calculatedLpm} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>L/min</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#0369a1' }}>
                ~{Math.round(calculatedLpm * 60).toLocaleString('en-IN')} Litres per Hour
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '14px', margin: '14px 0 0' }}>
            {pumpGuide.example}
          </p>
        </div>
      </div>
    </div>
  );
}
