import React from 'react';
import { Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function SoilMoistureGauge({
  moisturePercent = 38,
  criticalThreshold = 40,
  targetCapacity = 65,
  size = 180,
  label = 'Current Root Moisture'
}) {
  const { language } = useFarm();
  const percent = Math.min(100, Math.max(0, Number(moisturePercent) || 0));
  const isCritical = percent < criticalThreshold;
  const isOptimal = percent >= 50 && percent <= 70;
  const isSaturated = percent > 80;

  // Semicircular arc calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  
  // Angle from -180 deg to 0 deg
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const color = isCritical
    ? 'var(--status-danger)'
    : isSaturated
      ? 'var(--accent-sky)'
      : percent < 50
        ? 'var(--accent-amber)'
        : 'var(--color-brand)';

  // Status text in plain language
  let statusText = 'GOOD (सही नमी)';
  if (isCritical) {
    statusText = language === 'hindi' ? 'सूखा (पानी चाहिए)' : language === 'hinglish' ? 'SOOKHA (Dry)' : 'DRY (Water Needed)';
  } else if (isSaturated) {
    statusText = language === 'hindi' ? 'गीला / जलभराव' : language === 'hinglish' ? 'GEELA (Wet)' : 'WET / FULL';
  } else if (percent < 50) {
    statusText = language === 'hindi' ? 'नमी कम है' : language === 'hinglish' ? 'NAMI KAM HAI' : 'BELOW TARGET';
  } else if (isOptimal) {
    statusText = language === 'hindi' ? 'पर्याप्त नमी' : language === 'hinglish' ? 'SAHI NAMI (Good)' : 'OPTIMAL (Good)';
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Background Arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value Arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />

        {/* Center Percentage Display */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          fill="var(--text-main)"
          fontFamily="var(--font-heading)"
          fontSize={size * 0.22}
          fontWeight="800"
        >
          {percent}%
        </text>

        <text
          x={centerX}
          y={centerY + 8}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={size * 0.075}
          fontWeight="700"
          letterSpacing="0.03em"
        >
          {statusText}
        </text>
      </svg>

      <div style={{
        marginTop: '-4px',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        {label}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '6px',
        fontSize: '0.7rem',
        color: 'var(--text-subtle)'
      }}>
        <span>&lt;40%: {language === 'hindi' ? 'सूखा' : 'Dry'}</span>
        <span>•</span>
        <span>55–65%: {language === 'hindi' ? 'सही नमी' : 'Good'}</span>
        <span>•</span>
        <span>&gt;80%: {language === 'hindi' ? 'गीला' : 'Wet'}</span>
      </div>
    </div>
  );
}
