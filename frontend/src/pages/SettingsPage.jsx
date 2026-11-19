import React, { useState } from 'react';
import {
  Settings,
  Languages,
  Zap,
  RotateCcw,
  Download,
  ShieldCheck,
  Award,
  Cpu,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Trash2,
  MapPin,
  Check
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { PUMP_CAPACITIES } from '../config/agriculturalData';
import Badge from '../components/Badge';

export default function SettingsPage({ setActivePage }) {
  const {
    farm,
    farms,
    activeFarmId,
    selectFarm,
    updateFarm,
    resetToDefaultFarms,
    language,
    setLanguage,
    t
  } = useFarm();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedHp, setSelectedHp] = useState(farm.pump_hp || 5);
  const [tariff, setTariff] = useState(farm.electricity_tariff || 6);

  const languageOptions = [
    { id: 'hindi', label: 'हिंदी (Hindi)', desc: 'देवनागरी लिपि में पूर्ण भारतीय कृषि शब्दावली' },
    { id: 'hinglish', label: 'Hinglish (Roman Hindi)', desc: 'Kisan-friendly Roman Hindi for daily mobile chat' },
    { id: 'english', label: 'English (Indian English)', desc: 'Standard Indian agronomic & meteorological terms' },
    { id: 'auto', label: 'Auto (System Locale)', desc: 'Automatically match your device language' },
  ];

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    updateFarm(activeFarmId, {
      pump_hp: Number(selectedHp),
      electricity_tariff: Number(tariff)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      activeFarmId,
      farms,
      language
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `farmguard_profile_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm(language === 'hindi' ? 'क्या आप सभी खेत और सेटिंग्स को प्रारंभिक डेमो स्थिति में रीसेट करना चाहते हैं?' : 'Reset all farms and settings to benchmark demo state?')) {
      resetToDefaultFarms();
      alert(language === 'hindi' ? 'खेत रीसेट हो गए हैं।' : 'Fields have been reset to benchmark defaults.');
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-brand">{t.navSystem || 'SYSTEM & DETAILS'}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Local Preferences</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {t.settingsTitle || 'Settings & System Preferences'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '720px' }}>
          {t.settingsSubtitle || 'Customize language, tubewell pump defaults, electricity rates, and access diagnostics.'}
        </p>
      </div>

      {/* 2. Language Selection Card */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-brand-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brand-dark)'
          }}>
            <Languages size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {language === 'hindi' ? 'भाषा का चुनाव (Language Preference)' : 'Language Selection'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {language === 'hindi' ? 'FarmGuard में अपनी पसंदीदा भाषा चुनें। यह तुरंत सभी पेजों पर लागू होगी।' : 'Choose your preferred language across the entire application.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {languageOptions.map((opt) => {
            const isSelected = language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                    {opt.label}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {opt.desc}
                  </span>
                </div>
                {isSelected && (
                  <Check size={16} color="var(--color-brand)" style={{ minWidth: '16px', marginTop: '2px' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Farm Default Operational Settings */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {language === 'hindi' ? 'ट्यूबवेल पंप व बिजली दर डिफ़ॉल्ट' : 'Tubewell & Electricity Defaults'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {language === 'hindi' ? `सक्रिय खेत: ${farm.name}` : `Currently active field: ${farm.name}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveDefaults} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              {language === 'hindi' ? 'डिफ़ॉल्ट पंप क्षमता (HP)' : 'Tubewell Pump Horsepower'}
            </label>
            <select
              value={selectedHp}
              onChange={(e) => setSelectedHp(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
            >
              {PUMP_CAPACITIES.map((p) => (
                <option key={p.hp} value={p.hp}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              {language === 'hindi' ? 'बिजली दर (₹ प्रति यूनिट/kWh)' : 'Agricultural Electricity Tariff (₹/kWh)'}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <Check size={16} style={{ marginRight: '6px' }} />
              {language === 'hindi' ? 'सेव करें' : 'Save Defaults'}
            </button>
            {savedSuccess && (
              <span style={{ fontSize: '0.82rem', color: 'var(--color-brand)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} />
                {language === 'hindi' ? 'सेटिंग्स सुरक्षित हो गई!' : 'Settings updated successfully!'}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 4. Local Data & Storage Management */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {language === 'hindi' ? 'डेटा बैकअप व स्थानीय स्टोरेज' : 'Data & Local Storage Management'}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {language === 'hindi' ? 'आपके सभी खेत और सेटिंग्स आपके ब्राउज़र में सुरक्षित हैं। आप बैकअप डाउनलोड कर सकते हैं या प्रारंभिक स्थिति में रीसेट कर सकते हैं।' : 'FarmGuard stores your field profiles safely in browser local storage. You can export a JSON backup or reset to defaults.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportData}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Download size={15} style={{ marginRight: '6px' }} />
            {language === 'hindi' ? 'बैकअप डाउनलोड करें (JSON)' : 'Export Farm Data (JSON)'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetData}
            style={{ fontSize: '0.85rem', padding: '8px 14px', color: '#b91c1c', borderColor: '#fecaca' }}
          >
            <RotateCcw size={15} style={{ marginRight: '6px' }} />
            {language === 'hindi' ? 'सभी खेत रीसेट करें' : 'Reset All Fields to Benchmark'}
          </button>
        </div>
      </div>

      {/* 5. System Verification & Developer Lab Suite */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-info">{t.navSystem || 'SYSTEM & DETAILS'}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verification & Technical Specs</span>
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {language === 'hindi' ? 'प्रणाली सत्यापन व तकनीकी हब' : 'System Verification & Technical Lab'}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
          {language === 'hindi' ? 'हैकाथॉन मूल्यांककों और शोधकर्ताओं के लिए सुरक्षा गार्डरेल्स, लेटेंसी परीक्षण और वास्तुकला विवरण:' : 'Dedicated verification modules for hackathon evaluators, agronomists, and system auditors:'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setActivePage('security')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--color-brand)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navSecurity || 'Field Safety Rules'}</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActivePage('evaluation')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#b45309" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navEvaluation || 'Accuracy & Testing'}</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActivePage('architecture')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#0284c7" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navArchitecture || 'How It Works'}</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActivePage('about')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="var(--text-secondary)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navAbout || 'About FarmGuard'}</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActivePage('market')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--color-brand)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navMarket || 'Mandi Prices & MSP'}</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActivePage('activity')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--text-secondary)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.navReports || 'My Field Reports'}</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
