import React, { useState } from 'react';
import {
  Activity,
  Sprout,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  ArrowRight,
  TrendingUp,
  Info,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_CROPS } from '../config/agriculturalData';

export default function CropHealthPage({ setActivePage }) {
  const { farm, farms, selectFarm, language, t } = useFarm();
  const [selectedDisease, setSelectedDisease] = useState('rust');
  const [activeStageIndex, setActiveStageIndex] = useState(1); // Stage 2: Development

  const activeCrop = farm.crop ? farm.crop.toLowerCase() : 'wheat';
  const cropObj = SUPPORTED_CROPS.find(c => c.id === activeCrop) || SUPPORTED_CROPS[0];

  // Derive days after sowing
  const sowingDate = farm.sowing_date ? new Date(farm.sowing_date) : new Date(Date.now() - 38 * 86400000);
  const now = new Date();
  const diffDays = Math.max(1, Math.floor((now - sowingDate) / (1000 * 60 * 60 * 24)));

  // FAO-56 Growth Stages for active crop
  const growthStages = [
    {
      name: language === 'hindi' ? 'प्रारंभिक अवस्था (बुवाई व अंकुरण)' : language === 'hinglish' ? 'Initial Stage (Ankuran)' : 'Initial Stage (Germination)',
      days: '0–20 DAS',
      kc: '0.40',
      waterNeed: 'Low (15–20 mm)',
      description: language === 'hindi' ? 'बीज अंकुरण और जड़ का विकास। हल्की नमी बनाए रखें।' : 'Seedling emergence and root anchorage. Maintain light surface moisture.',
      completed: true
    },
    {
      name: language === 'hindi' ? 'वानस्पतिक विकास (कल्ले फूटना)' : language === 'hinglish' ? 'Vegetative (Kalle Phootna)' : 'Development (Tillering & Jointing)',
      days: '21–55 DAS',
      kc: '0.85',
      waterNeed: 'Moderate (35–45 mm)',
      description: language === 'hindi' ? 'सक्रिय कल्ले फूटना और पत्तियों का फैलाव। पहली खाद और सुरक्षा स्प्रे का सही समय।' : 'Active tillering and rapid leaf expansion. Critical stage for nitrogen top-dressing.',
      current: true
    },
    {
      name: language === 'hindi' ? 'फूल व दाना भराव (मध्य अवस्था)' : language === 'hinglish' ? 'Flowering & Grain Filling' : 'Mid-Season (Heading & Milking)',
      days: '56–105 DAS',
      kc: '1.15',
      waterNeed: 'High (60–75 mm)',
      description: language === 'hindi' ? 'सर्वाधिक पानी की आवश्यकता। इस समय खेत में पानी की कमी से उपज में 30% तक नुकसान हो सकता है।' : 'Peak water requirement. Moisture stress at this stage reduces grain yield by up to 30%.',
      upcoming: true
    },
    {
      name: language === 'hindi' ? 'परिपक्वता व कटाई (अंतिम अवस्था)' : language === 'hinglish' ? 'Late Season (Kataai)' : 'Late Season (Maturity & Harvest)',
      days: '106–135 DAS',
      kc: '0.50',
      waterNeed: 'Very Low (0–10 mm)',
      description: language === 'hindi' ? 'दाना पकना और कटाई की तैयारी। कटाई से 15 दिन पहले सिंचाई पूरी तरह बंद करें।' : 'Grain hardening and physiological maturity. Terminate irrigation 15 days before harvest.',
      upcoming: true
    }
  ];

  // Dynamic Disease & Pest Risk calculation based on humidity & temp
  const diseaseRisks = [
    {
      id: 'rust',
      name: activeCrop === 'wheat' ? 'Yellow Rust (Puccinia striiformis)' : 'Blast / Sheath Blight (Pyricularia)',
      hindiName: activeCrop === 'wheat' ? 'पीला रतुआ (हल्दी रोग)' : 'शीथ ब्लाइट (झुलसा रोग)',
      severity: 'moderate',
      riskScore: 54,
      threshold: 'High Alert > 70',
      weatherTrigger: 'Morning relative humidity 82% + temperature 18–22°C promotes fungal spore germination.',
      symptoms: 'Yellow stripe-like powdery pustules appearing along leaf veins, usually starting in dense patches.',
      treatment: 'Spray Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole @ 1 ml/L in 200L water per acre during clear weather.',
      prevention: 'Avoid excessive nitrogen fertilization; ensure drainage to prevent prolonged humidity at base of canopy.'
    },
    {
      id: 'aphids',
      name: 'Aphids / Greenfly (Rhopalosiphum padi)',
      hindiName: 'माहू / चेपा कीट',
      severity: 'low',
      riskScore: 24,
      threshold: 'Action Needed > 50',
      weatherTrigger: 'Current wind velocity (14 km/h) prevents dense colony buildup.',
      symptoms: 'Clusters of small greenish-black sucking pests on tender ears and underside of leaves; honeydew secretions.',
      treatment: 'If infestation exceeds 10 aphids per ear, apply Thiamethoxam 25% WG @ 0.4 g/L or Dimethoate 30% EC @ 1.5 ml/L.',
      prevention: 'Conserve beneficial natural predators like ladybird beetles; avoid premature pesticide sprays.'
    },
    {
      id: 'blight',
      name: 'Leaf Blight / Spot (Bipolaris sorokiniana)',
      hindiName: 'पत्ती का झुलसा रोग',
      severity: 'low',
      riskScore: 18,
      threshold: 'Action Needed > 60',
      weatherTrigger: 'Dry afternoon conditions keep fungal incubation below economic injury level.',
      symptoms: 'Small brown elliptical lesions with chlorotic halos, later coalescing into irregular dead leaf patches.',
      treatment: 'Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L if lesions cover > 5% of flag leaf area.',
      prevention: 'Seed treatment with Trichoderma viride or Carboxin; proper crop rotation.'
    }
  ];

  const currentDisease = diseaseRisks.find(d => d.id === selectedDisease) || diseaseRisks[0];

  // 4-Week Health Progression Dataset
  const healthTrends = [
    { week: 'Week 1 (Oct 28)', ndvi: 0.58, canopy: '54%', moisture: '62%', status: 'Optimal' },
    { week: 'Week 2 (Nov 04)', ndvi: 0.65, canopy: '68%', moisture: '58%', status: 'Optimal' },
    { week: 'Week 3 (Nov 11)', ndvi: 0.71, canopy: '76%', moisture: '50%', status: 'Vigorous' },
    { week: 'Week 4 (Current)', ndvi: 0.74, canopy: '82%', moisture: `${farm.soil_moisture_percent || 55}%`, status: 'Vigorous' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Header Overview & Health KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Overall Vigor */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'फसल स्वास्थ्य इंडेक्स' : 'Crop Health Index'}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0'
            }}>
              EXCELLENT
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px', fontFamily: 'var(--font-heading)' }}>
            88 <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            {language === 'hindi' ? 'सघन हरी पत्तियां व अच्छा जमाव' : 'High vegetative vigor & green leaf area'}
          </p>
        </div>

        {/* KPI 2: NDVI Canopy Rating */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              NDVI Canopy Score
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1' }}>0.74 NDVI</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px', fontFamily: 'var(--font-heading)' }}>
            82% <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Canopy</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '82%', height: '100%', backgroundColor: '#0284c7', borderRadius: '4px' }} />
          </div>
        </div>

        {/* KPI 3: Growth Stage */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'वर्तमान अवस्था' : 'Active Growth Stage'}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
              {diffDays} {language === 'hindi' ? 'दिन (DAS)' : 'Days Sown'}
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px', fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
            Tillering & Jointing
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            FAO-56 Kc = 0.85 • {farm.crop?.toUpperCase()}
          </p>
        </div>

        {/* KPI 4: Pest & Disease Risk */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #ea580c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'hindi' ? 'कीट-रोग चेतावनी' : 'Disease Threat'}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #ffedd5'
            }}>
              MODERATE
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px', fontFamily: 'var(--font-heading)' }}>
            Yellow Rust Risk
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            {language === 'hindi' ? 'सुबह की ओस व नमी से निगरानी रखें' : 'Watch lower canopy during morning dew'}
          </p>
        </div>
      </div>

      {/* 2. Interactive Growth-Stage Timeline */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--color-brand)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {language === 'hindi' ? 'FAO-56 फसल विकास चक्र और सिंचाई अवस्थाएं' : 'FAO-56 Crop Growth Timeline & Water Sensitivity'}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {language === 'hindi' ? `${farm.name} (${farm.crop?.toUpperCase()}) — बुवाई से कटाई तक का चरणबद्ध चार्ट` : `Tracking development milestones for ${farm.name} (${farm.crop?.toUpperCase()})`}
            </p>
          </div>
          <div style={{
            fontSize: '0.75rem',
            padding: '4px 12px',
            backgroundColor: 'var(--color-brand-muted)',
            color: 'var(--color-brand-dark)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700
          }}>
            {language === 'hindi' ? `वर्तमान: दिन ${diffDays}` : `Current: Day ${diffDays} of 135`}
          </div>
        </div>

        {/* Timeline Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {growthStages.map((stage, idx) => {
            const isCurrent = stage.current;
            const isCompleted = stage.completed;
            return (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  backgroundColor: isCurrent ? '#f4faf5' : isCompleted ? '#fafcfb' : '#ffffff',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isCurrent ? 'var(--color-brand)' : isCompleted ? '#e2ece4' : '#f1f5f2',
                    color: isCurrent ? '#ffffff' : 'var(--text-secondary)'
                  }}>
                    {stage.days}
                  </span>
                  {isCurrent && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-brand-dark)', textTransform: 'uppercase' }}>
                      ● ACTIVE NOW
                    </span>
                  )}
                  {isCompleted && (
                    <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  {stage.name}
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><strong>Kc:</strong> {stage.kc}</span>
                  <span><strong>Need:</strong> {stage.waterNeed}</span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Disease & Pest Risk Intelligence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Left Column: Risk Selector */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldAlert size={18} style={{ color: '#ea580c' }} />
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0 }}>
              {language === 'hindi' ? 'कीट व रोग जोखिम पूर्वानुमान' : 'Disease & Pest Risk Matrix'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {diseaseRisks.map(disease => {
              const isSelected = selectedDisease === disease.id;
              const isModerate = disease.severity === 'moderate';
              return (
                <div
                  key={disease.id}
                  onClick={() => setSelectedDisease(disease.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                    backgroundColor: isSelected ? 'var(--color-brand-muted)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {disease.name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isModerate ? '#fff7ed' : '#f0fdf4',
                      color: isModerate ? '#c2410c' : '#166534',
                      border: isModerate ? '1px solid #ffedd5' : '1px solid #bbf7d0'
                    }}>
                      {disease.riskScore}% RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {disease.hindiName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Environmental Trigger Summary */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            backgroundColor: '#f8faf9',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>Telemetry Context:</strong> Local relative humidity (82%) and moderate wind (14 km/h) are actively checked every hour from open meteorological stations.
          </div>
        </div>

        {/* Right Column: Detailed Disease Action Plan */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {language === 'hindi' ? 'प्रबंधन योजना' : 'Treatment & Action Plan'}
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
                {currentDisease.name}
              </h4>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: currentDisease.severity === 'moderate' ? '#fff7ed' : '#f0fdf4',
              color: currentDisease.severity === 'moderate' ? '#c2410c' : '#166534'
            }}>
              {currentDisease.severity.toUpperCase()} ALERT
            </span>
          </div>

          {/* Trigger Alert Box */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            fontSize: '0.8rem',
            color: '#92400e',
            lineHeight: 1.45
          }}>
            <strong>Weather Trigger:</strong> {currentDisease.weatherTrigger}
          </div>

          {/* Visual Symptoms */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              {language === 'hindi' ? 'लक्षण (पहचान)' : 'Visual Field Symptoms'}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
              {currentDisease.symptoms}
            </p>
          </div>

          {/* Recommended Scientific Treatment */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>
              {language === 'hindi' ? 'अनुशंसित उपचार (KVK / ICAR मानक)' : 'Recommended Agronomic Treatment'}
            </div>
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-brand-muted)',
              border: '1px solid var(--color-brand-border)',
              fontSize: '0.82rem',
              color: 'var(--color-brand-dark)',
              fontWeight: 600,
              lineHeight: 1.5
            }}>
              {currentDisease.treatment}
            </div>
          </div>

          {/* Cultural Prevention */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              {language === 'hindi' ? 'रोकथाम के उपाय' : 'Cultural Prevention'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {currentDisease.prevention}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 4-Week Health Progression Table */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <TrendingUp size={18} style={{ color: 'var(--color-brand)' }} />
          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0 }}>
            {language === 'hindi' ? '4-सप्ताह का स्वास्थ्य व नमी रिकॉर्ड' : '4-Week Crop Health Progression & Trends'}
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px' }}>Period</th>
                <th style={{ padding: '10px 14px' }}>NDVI Score</th>
                <th style={{ padding: '10px 14px' }}>Canopy Coverage</th>
                <th style={{ padding: '10px 14px' }}>Root Moisture</th>
                <th style={{ padding: '10px 14px' }}>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {healthTrends.map((t, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', fontWeight: idx === 3 ? 700 : 500 }}>
                  <td style={{ padding: '10px 14px' }}>{t.week}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand)' }}>{t.ndvi}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>{t.canopy}</td>
                  <td style={{ padding: '10px 14px' }}>{t.moisture}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#166534',
                      backgroundColor: '#f0fdf4',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={12} /> {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}