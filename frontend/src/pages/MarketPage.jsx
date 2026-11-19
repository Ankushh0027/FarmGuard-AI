import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calendar,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  Sprout,
  Filter,
  Calculator,
  RefreshCw,
  Award,
  BarChart3,
  Check
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_MARKET_CROPS } from '../config/marketData';

const CROP_IMAGES = {
  wheat: '/images/crop_wheat.jpg',
  rice: '/images/crop_rice.jpg',
  maize: '/images/crop_maize.jpg',
  sugarcane: '/images/crop_sugarcane.jpg',
};

export default function MarketPage({ setActivePage }) {
  const { farm, t, language } = useFarm();

  // Match active farm crop if possible, otherwise default to wheat
  const defaultCropId = farm?.crop && SUPPORTED_MARKET_CROPS.some(c => c.id === farm.crop)
    ? farm.crop
    : 'wheat';

  const [selectedCropId, setSelectedCropId] = useState(defaultCropId);
  const [timeRange, setTimeRange] = useState('days30'); // 'days30' | 'days90' | 'months6'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [calculatorQuintals, setCalculatorQuintals] = useState(25);

  const selectedCrop = SUPPORTED_MARKET_CROPS.find(c => c.id === selectedCropId) || SUPPORTED_MARKET_CROPS[0];
  const chartData = selectedCrop.timeSeries[timeRange] || selectedCrop.timeSeries.days30;

  // Chart coordinate calculations
  const values = chartData.map(d => d.modal);
  const minVal = Math.min(...values, selectedCrop.msp) * 0.96;
  const maxVal = Math.max(...values, selectedCrop.msp) * 1.04;

  const chartWidth = 720;
  const chartHeight = 250;
  const paddingX = 50;
  const paddingY = 30;

  const getX = (idx) => {
    if (chartData.length <= 1) return paddingX;
    return paddingX + (idx / (chartData.length - 1)) * (chartWidth - 2 * paddingX);
  };

  const getY = (val) => {
    if (maxVal === minVal) return chartHeight / 2;
    return chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 2 * paddingY);
  };

  // Generate path
  const linePoints = chartData.map((d, i) => `${getX(i)},${getY(d.modal)}`).join(' ');
  const areaPoints = `${getX(0)},${chartHeight - paddingY} ${linePoints} ${getX(chartData.length - 1)},${chartHeight - paddingY}`;

  const mspY = getY(selectedCrop.msp);

  // Valuation helper
  const estimatedGrossModal = (calculatorQuintals * selectedCrop.modalAveragePrice).toLocaleString('en-IN');
  const estimatedGrossMsp = (calculatorQuintals * selectedCrop.msp).toLocaleString('en-IN');
  const grossDiff = (calculatorQuintals * (selectedCrop.modalAveragePrice - selectedCrop.msp)).toLocaleString('en-IN');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Feature Hero & Data Provenance Notice */}
      <div className="card" style={{
        padding: '24px 28px',
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
              background: 'var(--color-brand-muted)',
              border: '1px solid var(--color-brand-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-brand-dark)',
              fontSize: '0.74rem',
              fontWeight: 850,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <TrendingUp size={13} />
              {t.marketTitle || 'Mandi Prices & Government MSP'}
            </div>

            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}>
              {language === 'hindi'
                ? 'मंडी के ताजा भाव और सरकारी न्यूनतम समर्थन मूल्य (MSP)'
                : language === 'hinglish'
                  ? 'Mandi Ke Taaza Bhaav Aur Sarkari MSP'
                  : 'Mandi Price Trends & Minimum Support Price (MSP)'}
            </h1>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: '12px'
            }}>
              {t.marketSubtitle || 'Current market mandi prices and official government Minimum Support Price (MSP) benchmarks.'}
            </p>

            {/* Provenance Notice */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <Info size={14} style={{ color: 'var(--accent-sky)', flexShrink: 0 }} />
              <span>
                <strong>Data Provenance:</strong> Benchmark rates modeled after Agmarknet historical distributions and official CCEA MSP resolutions. Not a live trading broker. No speculative profit guarantees are made.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Photographic Crop Selector Cards */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px' }}>
          Select Crop Benchmark:
        </div>

        <div className="market-crop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {SUPPORTED_MARKET_CROPS.map((crop) => {
            const isSelected = crop.id === selectedCropId;
            const cropImg = CROP_IMAGES[crop.id];

            return (
              <div
                key={crop.id}
                onClick={() => {
                  setSelectedCropId(crop.id);
                  setHoveredPoint(null);
                }}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(27, 83, 46, 0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '12px',
                  background: '#111827'
                }}
              >
                {cropImg && (
                  <img
                    src={cropImg}
                    alt={crop.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isSelected ? 0.75 : 0.45,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1.0)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(13, 40, 24, 0.95) 0%, rgba(13, 40, 24, 0.3) 65%, transparent 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'var(--color-brand)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2
                    }}
                  >
                    <Check size={11} />
                    Active
                  </div>
                )}

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>
                    {crop.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#d1fae5', marginTop: '2px', fontWeight: 600 }}>
                    ₹{crop.modalAveragePrice.toLocaleString('en-IN')}/qtl • MSP: ₹{crop.msp.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. KPI Status Strip for Selected Crop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-brand)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>MODAL MANDI AVERAGE</span>
            <Building2 size={14} style={{ color: 'var(--color-brand)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-brand)', margin: '4px 0 2px' }}>
            ₹{selectedCrop.modalAveragePrice.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            per quintal (₹{(selectedCrop.modalAveragePrice / 100).toFixed(2)} / kg)
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>OFFICIAL CCEA MSP FLOOR</span>
            <Scale size={14} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--accent-amber-dark)', margin: '4px 0 2px' }}>
            ₹{selectedCrop.msp.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedCrop.mspSeason}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--accent-sky)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>SPREAD OVER MSP FLOOR</span>
            <ArrowUpRight size={14} style={{ color: 'var(--accent-sky)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--accent-sky-dark)', margin: '4px 0 2px' }}>
            {selectedCrop.priceDiffMspPercent}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            +₹{(selectedCrop.modalAveragePrice - selectedCrop.msp)} / quintal premium
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #7e22ce' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>MARKET CYCLE PHASE</span>
            <Calendar size={14} style={{ color: '#7e22ce' }} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7e22ce', margin: '8px 0 2px' }}>
            {selectedCrop.currentSeasonStatus}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Standard Unit: 1 Quintal = 100 kg
          </div>
        </div>
      </div>

      {/* 4. Interactive Pure SVG Price Trend Chart */}
      <div className="card" style={{ padding: '24px 28px', backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {selectedCrop.name} — Modal Price Movement vs Official MSP
              </h3>
              <span className="badge badge-success">₹/quintal</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Dashed amber line represents the official CCEA Minimum Support Price (MSP) baseline.
            </p>
          </div>

          {/* Time range toggle buttons */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'days30', label: 'Last 30 Days' },
              { id: 'days90', label: 'Last 90 Days' },
              { id: 'months6', label: 'Season (6 Months)' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setTimeRange(tab.id); setHoveredPoint(null); }}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: timeRange === tab.id ? '#ffffff' : 'transparent',
                  color: timeRange === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: timeRange === tab.id ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Container */}
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: '550px', display: 'block' }}
          >
            <defs>
              <linearGradient id="cropPriceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & labels */}
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const val = Math.round(minVal + pct * (maxVal - minVal));
              const y = getY(val);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray="3,3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--text-subtle)"
                    fontFamily="var(--font-mono)"
                  >
                    ₹{val}
                  </text>
                </g>
              );
            })}

            {/* Official MSP Reference Line */}
            <line
              x1={paddingX}
              y1={mspY}
              x2={chartWidth - paddingX}
              y2={mspY}
              stroke="var(--accent-amber)"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
            <text
              x={chartWidth - paddingX}
              y={mspY - 6}
              textAnchor="end"
              fontSize="10"
              fontWeight="700"
              fill="var(--accent-amber-dark)"
            >
              CCEA MSP Floor: ₹{selectedCrop.msp}/qtl
            </text>

            {/* Gradient Area Fill */}
            <polygon
              points={areaPoints}
              fill="url(#cropPriceGradient)"
            />

            {/* Price Line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Dots & X-axis Labels */}
            {chartData.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.modal);
              const isHovered = hoveredPoint && hoveredPoint.idx === i;

              return (
                <g key={i}>
                  <text
                    x={cx}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-subtle)"
                    fontFamily="var(--font-mono)"
                  >
                    {d.date}
                  </text>

                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? 'var(--color-brand-dark)' : 'var(--color-brand)'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint({ ...d, idx: i, cx, cy })}
                    onClick={() => setHoveredPoint({ ...d, idx: i, cx, cy })}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: `${Math.min(Math.max(hoveredPoint.cx - 90, 10), chartWidth - 200)}px`,
              background: '#ffffff',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              fontSize: '0.8rem',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '170px'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '3px', marginBottom: '4px' }}>
                📅 {hoveredPoint.date} (Modal Rate)
              </div>
              <div style={{ color: 'var(--color-brand)', fontWeight: 800, fontSize: '0.95rem' }}>
                ₹{hoveredPoint.modal} / quintal
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>
                Mandi Range: ₹{hoveredPoint.min} – ₹{hoveredPoint.max}
              </div>
              <div style={{ color: hoveredPoint.modal >= selectedCrop.msp ? 'var(--color-brand-dark)' : 'var(--status-danger)', fontSize: '0.74rem', fontWeight: 600, marginTop: '2px' }}>
                {hoveredPoint.modal >= selectedCrop.msp
                  ? `+₹${hoveredPoint.modal - selectedCrop.msp} over MSP`
                  : `-₹${selectedCrop.msp - hoveredPoint.modal} below MSP`}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <span>Hover or tap individual data points along the curve to inspect daily modal pricing.</span>
          <span>Source: Modeled Agmarknet seasonal distributions & CCEA Price Resolution</span>
        </div>
      </div>

      {/* 5. Regional Mandi Comparison Table & Visual Bar */}
      <div className="card" style={{ padding: '24px 28px', backgroundColor: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Regional APMC Mandi Comparison
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
              Comparison across major regional consuming & procurement mandis for {selectedCrop.name}. (All figures in ₹/quintal).
            </p>
          </div>
          <span className="badge badge-secondary">
            Simulated Sample Benchmarks
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>APMC Mandi</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>State</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Quality Grade</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Modal Rate</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Min – Max Range</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>vs Official MSP</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Est. Daily Arrival</th>
              </tr>
            </thead>
            <tbody>
              {selectedCrop.regionalMandis.map((mandi, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {mandi.name}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    {mandi.state}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {mandi.grade}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--color-brand)' }}>
                    ₹{mandi.modalPrice.toLocaleString('en-IN')} / qtl
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-subtle)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    ₹{mandi.minPrice} – ₹{mandi.maxPrice}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-success">
                      {mandi.diffMsp}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {mandi.arrivalsQuintals.toLocaleString('en-IN')} Quintals
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Harvest Valuation Calculator */}
      <div className="card" style={{ padding: '24px 28px', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Calculator size={18} style={{ color: 'var(--color-brand)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Harvest Valuation Estimator
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', margin: 0 }}>
          Estimate total gross produce value based on your expected yield in Quintals (1 Quintal = 100 kg):
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Produce Yield:
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={calculatorQuintals}
              onChange={(e) => setCalculatorQuintals(Math.max(1, Number(e.target.value) || 1))}
              className="form-input"
              style={{ width: '110px', fontWeight: 700, padding: '7px 10px' }}
            />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quintals</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 700, display: 'block' }}>AT MODAL RATE (₹{selectedCrop.modalAveragePrice}/qtl)</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-brand)' }}>₹{estimatedGrossModal}</strong>
            </div>

            <div style={{ padding: '10px 16px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 700, display: 'block' }}>AT MINIMUM SUPPORT PRICE (₹{selectedCrop.msp}/qtl)</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--accent-amber-dark)' }}>₹{estimatedGrossMsp}</strong>
            </div>

            <div style={{ padding: '10px 16px', background: 'rgba(2, 132, 199, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-sky-dark)', fontWeight: 700, display: 'block' }}>ESTIMATED SPREAD DIFFERENCE</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--accent-sky-dark)' }}>+₹{grossDiff}</strong>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '12px' }}>
          * For reference planning only. Transport logistics, grading moisture deductions, and mandi cess vary by location.
        </div>
      </div>

    </div>
  );
}
