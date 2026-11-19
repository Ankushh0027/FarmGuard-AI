import React, { useState } from 'react';
import { Droplets, CloudRain, Calendar, Info } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function WaterDemandChart({ forecastDays = [], currentNeedMm = 20.7 }) {
  const { language } = useFarm();
  const [hoveredDay, setHoveredDay] = useState(null);

  // 7-day projection dataset (calibrated representative sequence)
  const days = forecastDays.length > 0 ? forecastDays : [
    { day: language === 'hindi' ? 'सोम (आज)' : language === 'hinglish' ? 'Som (Aaj)' : 'Mon (Today)', date: 'Oct 12', demandMm: currentNeedMm, rainOffsetMm: 0.0, netNeedMm: currentNeedMm, rainProb: 10 },
    { day: language === 'hindi' ? 'मंगल' : 'Tue', date: 'Oct 13', demandMm: 4.8, rainOffsetMm: 0.0, netNeedMm: 4.8, rainProb: 15 },
    { day: language === 'hindi' ? 'बुध' : 'Wed', date: 'Oct 14', demandMm: 5.1, rainOffsetMm: 0.0, netNeedMm: 5.1, rainProb: 20 },
    { day: language === 'hindi' ? 'गुरु' : 'Thu', date: 'Oct 15', demandMm: 5.0, rainOffsetMm: 2.5, netNeedMm: 2.5, rainProb: 45 },
    { day: language === 'hindi' ? 'शुक्र' : 'Fri', date: 'Oct 16', demandMm: 4.7, rainOffsetMm: 8.0, netNeedMm: 0.0, netStatus: 'Postpone', rainProb: 75 },
    { day: language === 'hindi' ? 'शनि' : 'Sat', date: 'Oct 17', demandMm: 4.5, rainOffsetMm: 1.2, netNeedMm: 3.3, rainProb: 30 },
    { day: language === 'hindi' ? 'रवि' : 'Sun', date: 'Oct 18', demandMm: 4.9, rainOffsetMm: 0.0, netNeedMm: 4.9, rainProb: 10 },
  ];

  const maxVal = Math.max(...days.map(d => Math.max(d.demandMm, d.rainOffsetMm || 0, 10))) * 1.25;

  const title = language === 'hindi'
    ? 'अगले 7 दिनों का पानी और बारिश का अनुमान'
    : language === 'hinglish'
      ? 'Agle 7 Dino Ka Paani Aur Baarish'
      : '7-Day Water Need vs Expected Rain';

  const subtitle = language === 'hindi'
    ? 'हरी पट्टी = फसल को कितना पानी चाहिए। नीली पट्टी = बारिश जो पंप का पानी बचाएगी।'
    : language === 'hinglish'
      ? 'Hara bar = Fasal ko kitna paani chahiye. Neela bar = Baarish jo pump ka paani bachayegi.'
      : 'Green bar = Crop water need (mm). Blue bar = Expected rain that saves tubewell pumping.';

  const needLabel = language === 'hindi' ? 'फसल की जरूरत (मिमी)' : language === 'hinglish' ? 'Paani Ki Zaroorat (mm)' : 'Crop Water Need (mm)';
  const rainLabel = language === 'hindi' ? 'अनुमानित बारिश (मिमी)' : language === 'hinglish' ? 'Aane Wali Baarish (mm)' : 'Expected Rain (mm)';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-default)',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={17} style={{ color: 'var(--color-brand)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {title}
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            {subtitle}
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-brand)' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{needLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--accent-sky)' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{rainLabel}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '12px',
        height: '190px',
        alignItems: 'end',
        padding: '16px 8px 10px',
        background: 'var(--bg-card-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        {days.map((item, idx) => {
          const demandHeight = Math.min(100, (item.demandMm / maxVal) * 100);
          const rainHeight = Math.min(100, ((item.rainOffsetMm || 0) / maxVal) * 100);
          const isToday = idx === 0;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {/* Stacked Bars Container */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '4px',
                height: '120px',
                width: '100%',
                justifyContent: 'center'
              }}>
                {/* Demand Bar */}
                <div style={{
                  width: '16px',
                  height: `${demandHeight}%`,
                  minHeight: demandHeight > 0 ? '4px' : '0px',
                  backgroundColor: isToday ? 'var(--color-brand)' : 'var(--color-brand-light)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease, transform 0.15s ease',
                  transform: hoveredDay?.day === item.day ? 'scaleY(1.05)' : 'scaleY(1)',
                }} />

                {/* Rain Offset Bar */}
                <div style={{
                  width: '16px',
                  height: `${rainHeight}%`,
                  minHeight: rainHeight > 0 ? '4px' : '0px',
                  backgroundColor: 'var(--accent-sky)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease, transform 0.15s ease',
                  opacity: rainHeight > 0 ? 0.9 : 0.2
                }} />
              </div>

              {/* Day Label */}
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--color-brand-dark)' : 'var(--text-secondary)' }}>
                  {item.day.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                  {item.netNeedMm > 0 ? `${item.netNeedMm}mm` : '0mm'}
                </div>
              </div>

              {/* Hover Tooltip */}
              {hoveredDay?.day === item.day && (
                <div style={{
                  position: 'absolute',
                  bottom: '140px',
                  zIndex: 20,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-default)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '3px' }}>
                    {item.day} ({item.date})
                  </div>
                  <div style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                    {language === 'hindi' ? 'पानी की जरूरत:' : 'Water Need:'} {item.demandMm} mm
                  </div>
                  <div style={{ color: 'var(--accent-sky)', fontWeight: 600 }}>
                    {language === 'hindi' ? 'अनुमानित बारिश:' : 'Rain:'} {item.rainOffsetMm} mm ({item.rainProb}%)
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanatory summary footnote */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        <span>
          {language === 'hindi'
            ? '💡 सुझाव: यदि बारिश 5 मिमी से अधिक हो, तो पंप न चलाएं ताकि बिजली और भूजल की बचत हो।'
            : language === 'hinglish'
              ? '💡 Tip: Agar baarish 5mm se zyada aane wali ho, toh pump band rakhein taaki paani aur bijli bache.'
              : '💡 Farmer Tip: If forecast rain is >5mm, hold off on pumping to save electricity and ground water.'}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
          1 mm rain = ~4,000 litres per acre
        </span>
      </div>
    </div>
  );
}
