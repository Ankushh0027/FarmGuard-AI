import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  CheckCircle2,
  MapPin,
  Layers,
  Droplets,
  Zap,
  Edit2,
  Trash2,
  Calendar,
  ArrowRight,
  Info,
  RotateCcw,
  Sliders,
  Check,
  X,
  ShieldCheck,
  Eye,
  Map as MapIcon,
  Crosshair,
  Compass
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SUPPORTED_CROPS, SUPPORTED_SOILS, SUPPORTED_REGIONS, PUMP_CAPACITIES } from '../config/agriculturalData';
import Badge from '../components/Badge';
import InteractiveFieldMap from '../components/InteractiveFieldMap';
import { formatCoordinates, getAccuracyQuality } from '../utils/geoUtils';

export default function FarmsPage({ setActivePage }) {
  const {
    farms,
    activeFarmId,
    selectFarm,
    addFarm,
    updateFarm,
    deleteFarm,
    resetToDefaultFarms,
    t,
    language
  } = useFarm();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFarmForDetail, setSelectedFarmForDetail] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [formData, setFormData] = useState({
    name: '',
    crop: 'wheat',
    area_acres: 2.0,
    area_hectares: 0.81,
    soil_type: 'alluvial',
    location: 'Uttar Pradesh',
    soil_moisture_percent: 55,
    current_irrigation_mm: 35.0,
    pump_hp: 5,
    notes: '',
    latitude: 26.8524,
    longitude: 80.9412,
    gps_accuracy: null,
    location_captured_at: null,
    location_source: 'manual',
    boundary_coordinates: []
  });

  const openAddModal = () => {
    setEditingFarm(null);
    setFormData({
      name: `Khet ${farms.length + 1}`,
      crop: 'wheat',
      area_acres: 2.0,
      area_hectares: 0.81,
      soil_type: 'alluvial',
      location: 'Uttar Pradesh',
      soil_moisture_percent: 55,
      current_irrigation_mm: 35.0,
      pump_hp: 5,
      notes: '',
      latitude: 26.8524,
      longitude: 80.9412,
      gps_accuracy: null,
      location_captured_at: new Date().toISOString(),
      location_source: 'manual',
      boundary_coordinates: []
    });
    setModalOpen(true);
  };

  const openEditModal = (farmToEdit, e) => {
    if (e) e.stopPropagation();
    setEditingFarm(farmToEdit);
    setFormData({
      name: farmToEdit.name || '',
      crop: farmToEdit.crop || 'wheat',
      area_acres: farmToEdit.area_acres || 2.0,
      area_hectares: farmToEdit.area_hectares || Number(((farmToEdit.area_acres || 2.0) * 0.404686).toFixed(2)),
      soil_type: farmToEdit.soil_type || 'alluvial',
      location: farmToEdit.location || 'Uttar Pradesh',
      soil_moisture_percent: farmToEdit.soil_moisture_percent || 55,
      current_irrigation_mm: farmToEdit.current_irrigation_mm || 35.0,
      pump_hp: farmToEdit.pump_hp || 5,
      notes: farmToEdit.notes || '',
      latitude: farmToEdit.latitude !== undefined && farmToEdit.latitude !== null ? parseFloat(farmToEdit.latitude) : 26.8524,
      longitude: farmToEdit.longitude !== undefined && farmToEdit.longitude !== null ? parseFloat(farmToEdit.longitude) : 80.9412,
      gps_accuracy: farmToEdit.gps_accuracy !== undefined ? farmToEdit.gps_accuracy : null,
      location_captured_at: farmToEdit.location_captured_at || null,
      location_source: farmToEdit.location_source || 'manual',
      boundary_coordinates: Array.isArray(farmToEdit.boundary_coordinates) ? farmToEdit.boundary_coordinates : []
    });
    setModalOpen(true);
  };

  const openDetailView = (farmObj) => {
    setSelectedFarmForDetail(farmObj);
    setDetailModalOpen(true);
  };

  const handleSaveFarm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      area_acres: parseFloat(formData.area_acres) || 1.0,
      area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : Number(((parseFloat(formData.area_acres) || 1.0) * 0.404686).toFixed(2)),
      soil_moisture_percent: parseFloat(formData.soil_moisture_percent) || 50,
      latitude: parseFloat(formData.latitude) || 26.8524,
      longitude: parseFloat(formData.longitude) || 80.9412,
      gps_accuracy: formData.gps_accuracy ? parseFloat(formData.gps_accuracy) : null,
      location_source: formData.location_source || 'manual',
      boundary_coordinates: Array.isArray(formData.boundary_coordinates) ? formData.boundary_coordinates : []
    };

    if (editingFarm) {
      updateFarm(editingFarm.id, payload);
    } else {
      addFarm(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`${t.confirmDelete || 'Are you sure you want to delete this field?'} (${name})`)) {
      deleteFarm(id);
    }
  };

  const getMoistureStatus = (percent) => {
    const p = parseFloat(percent) || 50;
    if (p < 45) return { label: t.drySoil || 'Dry Soil', variant: 'danger', bg: '#fef2f2', color: '#b91c1c' };
    if (p > 75) return { label: t.wetSoil || 'Wet / Saturated', variant: 'info', bg: '#f0f9ff', color: '#0284c7' };
    return { label: t.goodMoisture || 'Optimal Moisture', variant: 'success', bg: '#e8f5e9', color: '#1b5e20' };
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Banner & Action Bar */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sprout size={22} style={{ color: 'var(--color-brand)' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {t.farmsTitle || 'My Farms & Field Management'}
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              {farms.length} {language === 'hindi' ? 'खेत पंजीकृत हैं' : 'registered agricultural plots'} • {t.farmsSubtitle || 'Manage your different plots of land, crops, and pump settings in one place.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{
              display: 'inline-flex',
              padding: '2px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'grid' ? 800 : 600,
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none'
                }}
              >
                Grid Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'map' ? 800 : 600,
                  backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
                  color: viewMode === 'map' ? 'var(--color-brand-dark)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'map' ? 'var(--shadow-xs)' : 'none'
                }}
              >
                Interactive Map
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={resetToDefaultFarms}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              title="Reset fields to demo benchmark plots"
            >
              <RotateCcw size={14} />
              Reset Demo Fields
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddModal}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Plus size={16} />
              {t.addField || 'Add New Field'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map View (if active) */}
      {viewMode === 'map' && (
        <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapIcon size={18} style={{ color: 'var(--color-brand)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {language === 'hindi' ? 'भू-स्थानिक खेत व सीमा दृश्य' : 'Geospatial Field & Boundary Map'}
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {farms.length} registered plots with GPS pins & boundary polygons
            </span>
          </div>

          <InteractiveFieldMap
            latitude={farms.find(f => f.id === activeFarmId)?.latitude || 26.8524}
            longitude={farms.find(f => f.id === activeFarmId)?.longitude || 80.9412}
            accuracy={farms.find(f => f.id === activeFarmId)?.gps_accuracy}
            locationSource={farms.find(f => f.id === activeFarmId)?.location_source || 'gps'}
            boundaryCoordinates={farms.find(f => f.id === activeFarmId)?.boundary_coordinates || []}
            allFarms={farms}
            activeFarmId={activeFarmId}
            height="420px"
            readOnly={false}
            showBoundaryTool={false}
          />
        </div>
      )}

      {/* 3. Field Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {farms.map((f) => {
          const isActive = f.id === activeFarmId;
          const status = getMoistureStatus(f.soil_moisture_percent);

          return (
            <div
              key={f.id}
              className="card"
              onClick={() => selectFarm(f.id)}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: isActive ? '2px solid var(--color-brand)' : '1px solid var(--border-default)',
                backgroundColor: isActive ? 'var(--color-brand-muted)' : '#ffffff',
                boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.18s ease'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {f.name}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', flexWrap: 'wrap' }}>
                    <MapPin size={13} />
                    <span>{f.location || 'Uttar Pradesh'}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      • {formatCoordinates(f.latitude, f.longitude)}
                    </span>
                    {f.boundary_coordinates?.length >= 3 && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        📐 {f.boundary_coordinates.length} pts
                      </span>
                    )}
                  </div>
                </div>

                {isActive ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-brand)',
                    color: '#ffffff'
                  }}>
                    <CheckCircle2 size={12} />
                    ACTIVE
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectFarm(f.id);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Set Active
                  </button>
                )}
              </div>

              {/* Crop & Acreage Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: isActive ? '#ffffff' : 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crop</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-brand-dark)' }}>
                    {f.crop ? f.crop.toUpperCase() : 'WHEAT'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Area</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {f.area_acres || 2.0} ac
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Soil</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {f.soil_type || 'alluvial'}
                  </div>
                </div>
              </div>

              {/* Soil Moisture & Pump Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Moisture: <strong>{f.soil_moisture_percent || 55}%</strong>
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: status.bg,
                  color: status.color
                }}>
                  {status.label}
                </span>
              </div>

              {/* Notes if available */}
              {f.notes && (
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  "{f.notes}"
                </p>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: 'auto'
              }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailView(f);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-brand)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> View Details
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => openEditModal(f, e)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  {farms.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(f.id, f.name, e)}
                      style={{
                        background: 'none',
                        border: '1px solid #fee2e2',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#b91c1c',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Individual Farm Detail Modal */}
      {detailModalOpen && selectedFarmForDetail && (
        <div className="modal-backdrop active" onClick={() => setDetailModalOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', padding: '26px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Field Profile Details
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
                  {selectedFarmForDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cultivated Crop</div>
                  <div style={{ fontWeight: 800, color: 'var(--color-brand)' }}>
                    {selectedFarmForDetail.crop?.toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Land Area</div>
                  <div style={{ fontWeight: 800 }}>{selectedFarmForDetail.area_acres} Acres</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Soil Texture</div>
                  <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{selectedFarmForDetail.soil_type}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pump Capacity</div>
                  <div style={{ fontWeight: 800 }}>{selectedFarmForDetail.pump_hp || 5} HP Tubewell</div>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: '2px' }}>Agronomic Recommendation</div>
                <div style={{ color: '#14532d', fontSize: '0.8rem' }}>
                  Root zone moisture is currently at {selectedFarmForDetail.soil_moisture_percent || 55}%. FAO-56 benchmark indicates this crop is in good vegetative condition.
                </div>
              </div>

              {/* Geolocation & Map Snapshot */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>GPS Location: <strong>{formatCoordinates(selectedFarmForDetail.latitude, selectedFarmForDetail.longitude)}</strong></span>
                  {selectedFarmForDetail.boundary_coordinates?.length >= 3 && (
                    <span style={{ color: '#166534', fontWeight: 700 }}>
                      Boundary: {selectedFarmForDetail.boundary_coordinates.length} points
                    </span>
                  )}
                </div>
                <InteractiveFieldMap
                  latitude={selectedFarmForDetail.latitude}
                  longitude={selectedFarmForDetail.longitude}
                  accuracy={selectedFarmForDetail.gps_accuracy}
                  locationSource={selectedFarmForDetail.location_source}
                  boundaryCoordinates={selectedFarmForDetail.boundary_coordinates}
                  height="200px"
                  readOnly={true}
                  showBoundaryTool={false}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    selectFarm(selectedFarmForDetail.id);
                    setDetailModalOpen(false);
                    setActivePage('irrigation');
                  }}
                >
                  Calculate Irrigation for this Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Farm Modal */}
      {modalOpen && (
        <div className="modal-backdrop active" onClick={() => setModalOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', padding: '26px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingFarm ? (t.editField || 'Edit Field Profile') : (t.addField || 'Add New Field')}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFarm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  {t.fieldName || 'Field Name / Plot Nickname'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., North Tubewell Plot (उत्तर खेत)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Crop Selection Chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Crop Type
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SUPPORTED_CROPS.map((c) => {
                    const isSelected = formData.crop === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, crop: c.id })}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 800 : 600,
                          backgroundColor: isSelected ? 'var(--color-brand)' : 'var(--bg-app)',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                          border: `1px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-default)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Area & Soil Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Area ({t.acres || 'Acres'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    className="input-field"
                    value={formData.area_acres}
                    onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Soil Type
                  </label>
                  <select
                    className="input-field"
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  >
                    {SUPPORTED_SOILS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Pump HP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Location / Region
                  </label>
                  <select
                    className="input-field"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  >
                    {SUPPORTED_REGIONS.map((r) => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    Tubewell Pump HP
                  </label>
                  <select
                    className="input-field"
                    value={formData.pump_hp}
                    onChange={(e) => setFormData({ ...formData, pump_hp: e.target.value })}
                  >
                    {PUMP_CAPACITIES.map((p) => (
                      <option key={p.hp} value={p.hp}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field Geolocation & Interactive Map Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} style={{ color: 'var(--color-brand)' }} />
                    Field GPS Location & Boundary Mapping
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Satellite positioning & boundary area
                  </span>
                </div>

                <InteractiveFieldMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  accuracy={formData.gps_accuracy}
                  locationSource={formData.location_source}
                  boundaryCoordinates={formData.boundary_coordinates}
                  onLocationChange={({ latitude, longitude, accuracy, source, timestamp }) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude,
                      longitude,
                      gps_accuracy: accuracy,
                      location_source: source,
                      location_captured_at: timestamp
                    }));
                  }}
                  onBoundaryChange={({ boundaryCoordinates, calculatedAreaAcres, calculatedAreaHectares }) => {
                    setFormData(prev => ({
                      ...prev,
                      boundary_coordinates: boundaryCoordinates,
                      ...(calculatedAreaAcres > 0 ? {
                        area_acres: calculatedAreaAcres,
                        area_hectares: calculatedAreaHectares
                      } : {})
                    }));
                  }}
                  height="260px"
                  showBoundaryTool={true}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Coordinates: <strong>{formatCoordinates(formData.latitude, formData.longitude)}</strong></span>
                  {formData.boundary_coordinates?.length >= 3 && (
                    <span style={{ color: '#166534', fontWeight: 700 }}>
                      ✓ Boundary: {formData.boundary_coordinates.length} points ({formData.area_acres} Acres)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {t.saveField || 'Save Field Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}