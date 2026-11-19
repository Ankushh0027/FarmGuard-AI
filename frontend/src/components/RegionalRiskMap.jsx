import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, MapPin, AlertTriangle, Layers, Info } from 'lucide-react';

// Regional coordinates for Punjab & Haryana agricultural belt
const REGIONAL_CENTER = [30.25, 75.85];

export default function RegionalRiskMap({ hotspots = [], selectedHotspotId, onSelectHotspot }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: REGIONAL_CENTER,
        zoom: 8,
        scrollWheelZoom: false,
        attributionControl: false
      });

      // OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Regional map init fallback:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when hotspots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Map each hotspot to coordinates
    // Assign synthetic coordinates across regional cluster
    const clusterCoords = {
      'hs-1': [30.2458, 75.8421], // Sangrur
      'hs-2': [29.6857, 76.9905], // Karnal
      'hs-3': [30.2110, 74.9455], // Bathinda
      'hs-4': [28.9845, 77.7064], // Meerut
      'hs-5': [30.9010, 75.8573], // Ludhiana
    };

    hotspots.forEach(hs => {
      const coords = clusterCoords[hs.id] || [
        REGIONAL_CENTER[0] + (Math.random() - 0.5) * 1.5,
        REGIONAL_CENTER[1] + (Math.random() - 0.5) * 1.5
      ];

      const isCritical = hs.severity === 'critical';
      const isHigh = hs.severity === 'high';
      const color = isCritical ? '#dc2626' : (isHigh ? '#ea580c' : '#d97706');
      const radiusMeters = isCritical ? 24000 : (isHigh ? 18000 : 12000);

      // Warning perimeter circle
      const circle = L.circle(coords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 1.5,
        radius: radiusMeters
      }).addTo(map);

      // Custom pulse HTML pin icon
      const pinIcon = L.divIcon({
        className: 'regional-risk-pin',
        html: `<div style="
          background: ${color};
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px ${color};
          border: 2px solid #fff;
          cursor: pointer;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(coords, { icon: pinIcon }).addTo(map);

      marker.bindTooltip(`
        <strong>${hs.threat}</strong><br/>
        ${hs.region} • ${hs.crop}<br/>
        Severity: <span style="text-transform: capitalize; color: ${color}; font-weight: bold;">${hs.severity}</span>
      `, { direction: 'top', className: 'regional-map-tooltip' });

      marker.on('click', () => {
        onSelectHotspot?.(hs);
      });

      markersRef.current.push(circle, marker);
    });
  }, [hotspots, onSelectHotspot]);

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-default)',
      backgroundColor: '#f7faf7',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Map Header */}
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
          <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
            Regional Crop-Risk Radar & Threat Outbreak Map
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(217, 119, 6, 0.12)',
            color: 'var(--accent-amber)',
            fontWeight: 700
          }}>
            Live Peer Mesh
          </span>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Click any radar node to inspect verified reports & KVK dispatch status
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div
        ref={mapContainerRef}
        style={{
          height: '420px',
          width: '100%',
          backgroundColor: '#e6ede6',
          zIndex: 1
        }}
      />

      {/* Severity Legend Box */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: '0.74rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Threat Severity Levels</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
          <span><strong>Critical:</strong> Immediate KVK SLA & quarantine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea580c' }} />
          <span><strong>High:</strong> Multi-village vector spread</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          <span><strong>Moderate:</strong> Emerging local observation</span>
        </div>
      </div>
    </div>
  );
}
