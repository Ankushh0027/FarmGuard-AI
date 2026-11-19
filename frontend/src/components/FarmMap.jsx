import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Droplets, AlertTriangle, ShieldCheck, Maximize2 } from 'lucide-react';

// Fix Leaflet default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Demo coordinates for Indo-Gangetic Plains model farm (near Karnal / Sangrur cluster)
const DEMO_CENTER = [29.6857, 76.9905];

// Synthetic 2.5-acre field boundary polygon coordinates
const FIELD_POLYGON = [
  [29.6872, 76.9885],
  [29.6876, 76.9928],
  [29.6845, 76.9932],
  [29.6841, 76.9889]
];

// Zone sub-divisions
const ZONES = [
  {
    id: 'zone-a',
    name: 'Zone A — Main Field',
    crop: 'Rice (Paddy)',
    moisture: '28%',
    status: 'Needs Irrigation',
    color: '#d97706',
    polygon: [
      [29.6872, 76.9885],
      [29.6874, 76.9907],
      [29.6843, 76.9910],
      [29.6841, 76.9889]
    ]
  },
  {
    id: 'zone-b',
    name: 'Zone B — North Nursery',
    crop: 'Wheat (Winter R&D)',
    moisture: '54%',
    status: 'Optimal Moisture',
    color: '#1b532e',
    polygon: [
      [29.6874, 76.9907],
      [29.6876, 76.9928],
      [29.6859, 76.9930],
      [29.6857, 76.9909]
    ]
  },
  {
    id: 'zone-c',
    name: 'Zone C — Tubewell Head',
    crop: 'Fallow / Buffer',
    moisture: '42%',
    status: 'Monitoring',
    color: '#0284c7',
    polygon: [
      [29.6857, 76.9909],
      [29.6859, 76.9930],
      [29.6845, 76.9932],
      [29.6843, 76.9910]
    ]
  }
];

export default function FarmMap({ activeCrop = 'Rice', activeZone = null, onSelectZone }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [mapLayer, setMapLayer] = useState('satellite'); // 'satellite' | 'streets'
  const [isTilesLoaded, setIsTilesLoaded] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    try {
      const map = L.map(mapContainerRef.current, {
        center: DEMO_CENTER,
        zoom: 16,
        scrollWheelZoom: false,
        attributionControl: false
      });

      // OpenStreetMap standard tiles
      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });
      tileLayer.addTo(map);

      // Add field boundary outline
      const boundaryLayer = L.polygon(FIELD_POLYGON, {
        color: '#1b532e',
        weight: 3,
        dashArray: '6, 6',
        fillOpacity: 0.05,
      }).addTo(map);

      // Add zone polygons
      ZONES.forEach(zone => {
        const poly = L.polygon(zone.polygon, {
          color: zone.color,
          weight: 2,
          fillColor: zone.color,
          fillOpacity: 0.35,
        }).addTo(map);

        poly.on('click', () => {
          setSelectedZone(zone);
          onSelectZone?.(zone);
        });

        // Custom HTML tooltip
        poly.bindTooltip(`<strong>${zone.name}</strong><br/>${zone.crop} • Moisture: ${zone.moisture}`, {
          direction: 'top',
          className: 'farm-map-tooltip'
        });
      });

      // Tubewell location marker pin
      const tubewellIcon = L.divIcon({
        className: 'custom-tubewell-pin',
        html: `<div style="background: #1b532e; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid #fff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([29.6858, 76.9910], { icon: tubewellIcon })
        .addTo(map)
        .bindPopup('<strong>Tubewell Head #1</strong><br/>5 HP Centrifugal Pump<br/>Discharge: ~28,000 L/hr');

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet tile initialization fallback:', err);
      setIsTilesLoaded(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-default)',
      backgroundColor: '#f7faf7',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Map Control Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} style={{ color: 'var(--color-brand)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Demo Field Boundary & Root-Zone Irrigation Telemetry
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-brand-muted)',
            color: 'var(--color-brand-dark)',
            fontWeight: 700
          }}>
            Karnal Cluster #104
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            2.5 Total Acres • 3 Active Monitoring Zones
          </div>
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          height: '340px',
          width: '100%',
          backgroundColor: '#e6ede6',
          zIndex: 1
        }}
      />

      {/* Floating Zone Telemetry Card Overlay */}
      {selectedZone && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          maxWidth: '300px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-main)' }}>
              {selectedZone.name}
            </span>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: selectedZone.color
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
            <span>Crop & Stage:</span>
            <strong>{selectedZone.crop}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
            <span>Root Moisture:</span>
            <strong style={{ color: selectedZone.color }}>{selectedZone.moisture}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>Recommendation:</span>
            <strong>{selectedZone.status}</strong>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '16px',
        zIndex: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: '0.72rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>Soil Moisture Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#d97706' }} />
          <span>&lt; 35% (Depleted - Irrigate)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#1b532e' }} />
          <span>50 - 70% (Optimal)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#0284c7' }} />
          <span>Buffer / Tubewell Head</span>
        </div>
      </div>
    </div>
  );
}
