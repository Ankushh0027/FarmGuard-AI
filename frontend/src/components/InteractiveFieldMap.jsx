import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Crosshair,
  Layers,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Maximize2,
  AlertCircle,
  Sparkles,
  Compass,
  Check,
  Undo2
} from 'lucide-react';
import {
  getBrowserLocation,
  calculatePolygonArea,
  formatCoordinates,
  getAccuracyQuality
} from '../utils/geoUtils';

// ============================================================================
// CUSTOM CRISP LEAFLET SVG ICONS (NO BROKEN ASSET URLS)
// ============================================================================
const createPinIcon = (color = '#1b532e', label = '') => {
  return L.divIcon({
    className: 'custom-farm-pin',
    html: `
      <div style="position: relative; width: 34px; height: 42px; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 28.5 17 42 17 42C17 42 34 28.5 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="17" cy="17" r="6.5" fill="#ffffff"/>
        </svg>
        ${label ? `<span style="position: absolute; top: 44px; white-space: nowrap; background: rgba(0,0,0,0.8); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.02em;">${label}</span>` : ''}
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40]
  });
};

const vertexIcon = L.divIcon({
  className: 'custom-vertex-pin',
  html: `<div style="width: 14px; height: 14px; background: #ffffff; border: 3px solid #16a34a; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: pointer;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Default fallback coordinates: Central Indo-Gangetic Plains (Lucknow / UP model cluster)
const DEFAULT_CENTER = [26.8524, 80.9412];

// ============================================================================
// MAP CONTROLLER HOOKS (RECENTER & CLICK HANDLER)
// ============================================================================
function MapRecenterController({ center, zoom = 16, shouldFly = false }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      if (shouldFly) {
        map.flyTo(center, zoom, { duration: 1.2 });
      } else {
        map.setView(center, zoom);
      }
    }
  }, [center, zoom, map, shouldFly]);
  return null;
}

function MapClickHandler({ onMapClick, activeMode }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
}

// ============================================================================
// MAIN INTERACTIVE FIELD MAP COMPONENT
// ============================================================================
export default function InteractiveFieldMap({
  latitude = null,
  longitude = null,
  accuracy = null,
  locationSource = 'default',
  boundaryCoordinates = [],
  onLocationChange = null,
  onBoundaryChange = null,
  allFarms = [],
  activeFarmId = null,
  height = '380px',
  readOnly = false,
  showBoundaryTool = true
}) {
  // Current active pin position
  const currentLat = latitude !== null && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : DEFAULT_CENTER[0];
  const currentLng = longitude !== null && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : DEFAULT_CENTER[1];
  const markerPos = useMemo(() => [currentLat, currentLng], [currentLat, currentLng]);

  // Map state
  const [mapCenter, setMapCenter] = useState(markerPos);
  const [shouldFly, setShouldFly] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState(null);

  // Boundary editing mode: 'pin' | 'boundary'
  const [interactionMode, setInteractionMode] = useState('pin');

  // Local boundary coordinates state
  const [boundaryPoints, setBoundaryPoints] = useState(
    Array.isArray(boundaryCoordinates) ? boundaryCoordinates : []
  );

  // Synchronize when external boundaryCoordinates prop changes
  useEffect(() => {
    if (Array.isArray(boundaryCoordinates)) {
      setBoundaryPoints(boundaryCoordinates);
    }
  }, [boundaryCoordinates]);

  // Keep mapCenter in sync when coordinates change externally
  useEffect(() => {
    setMapCenter([currentLat, currentLng]);
  }, [currentLat, currentLng]);

  // Calculated boundary area metrics
  const areaMetrics = useMemo(() => {
    return calculatePolygonArea(boundaryPoints);
  }, [boundaryPoints]);

  // Accuracy badge details
  const accuracyBadge = useMemo(() => {
    return getAccuracyQuality(locationSource === 'gps' ? accuracy : null);
  }, [accuracy, locationSource]);

  // ==========================================================================
  // GPS BROWSER GEOLOCATION HANDLER
  // ==========================================================================
  const handleDetectGPS = async () => {
    setLocating(true);
    setGpsError(null);
    setGpsSuccessMsg(null);

    try {
      const pos = await getBrowserLocation({
        highAccuracy: true,
        timeoutMs: 12000,
        maxRetries: 1
      });

      setMapCenter([pos.latitude, pos.longitude]);
      setShouldFly(true);
      setGpsSuccessMsg(`GPS Acquired: ${formatCoordinates(pos.latitude, pos.longitude)} (±${pos.accuracy || 5}m accuracy)`);

      if (onLocationChange) {
        onLocationChange({
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
          source: 'gps',
          timestamp: pos.timestamp
        });
      }

      setTimeout(() => setGpsSuccessMsg(null), 5000);
    } catch (err) {
      console.warn('GPS detection failed:', err);
      setGpsError(err.message || 'GPS location could not be determined. You can click on the map to place your pin manually.');
    } finally {
      setLocating(false);
    }
  };

  // ==========================================================================
  // MAP CLICK & DRAG EVENT HANDLERS
  // ==========================================================================
  const handleMapClick = (clickedCoords) => {
    if (readOnly) return;

    if (interactionMode === 'pin') {
      // Move location pin
      setGpsError(null);
      setGpsSuccessMsg(null);
      setMapCenter(clickedCoords);
      setShouldFly(false);

      if (onLocationChange) {
        onLocationChange({
          latitude: Number(clickedCoords[0].toFixed(6)),
          longitude: Number(clickedCoords[1].toFixed(6)),
          accuracy: null,
          source: 'manual',
          timestamp: new Date().toISOString()
        });
      }
    } else if (interactionMode === 'boundary') {
      // Add point to boundary polygon
      const newPoints = [...boundaryPoints, [Number(clickedCoords[0].toFixed(6)), Number(clickedCoords[1].toFixed(6))]];
      setBoundaryPoints(newPoints);

      const metrics = calculatePolygonArea(newPoints);
      if (onBoundaryChange) {
        onBoundaryChange({
          boundaryCoordinates: newPoints,
          calculatedAreaAcres: metrics.acres,
          calculatedAreaHectares: metrics.hectares
        });
      }
    }
  };

  const handleMarkerDragEnd = (e) => {
    if (readOnly) return;
    const marker = e.target;
    const position = marker.getLatLng();
    const newCoords = [Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6))];

    setGpsError(null);
    setGpsSuccessMsg(null);
    setMapCenter(newCoords);
    setShouldFly(false);

    if (onLocationChange) {
      onLocationChange({
        latitude: newCoords[0],
        longitude: newCoords[1],
        accuracy: null,
        source: 'manual',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Boundary editing actions
  const handleUndoPoint = () => {
    if (boundaryPoints.length === 0) return;
    const newPoints = boundaryPoints.slice(0, -1);
    setBoundaryPoints(newPoints);
    const metrics = calculatePolygonArea(newPoints);
    if (onBoundaryChange) {
      onBoundaryChange({
        boundaryCoordinates: newPoints,
        calculatedAreaAcres: metrics.acres,
        calculatedAreaHectares: metrics.hectares
      });
    }
  };

  const handleClearBoundary = () => {
    setBoundaryPoints([]);
    if (onBoundaryChange) {
      onBoundaryChange({
        boundaryCoordinates: [],
        calculatedAreaAcres: 0,
        calculatedAreaHectares: 0
      });
    }
  };

  const handleRemoveSpecificPoint = (index) => {
    const newPoints = boundaryPoints.filter((_, i) => i !== index);
    setBoundaryPoints(newPoints);
    const metrics = calculatePolygonArea(newPoints);
    if (onBoundaryChange) {
      onBoundaryChange({
        boundaryCoordinates: newPoints,
        calculatedAreaAcres: metrics.acres,
        calculatedAreaHectares: metrics.hectares
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 'var(--radius-lg, 12px)',
      overflow: 'hidden',
      border: '1px solid var(--border-default, #e2e8f0)',
      backgroundColor: '#ffffff',
      boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))'
    }}>
      {/* Top Map Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#f8faf9',
        borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Left: Coordinate Telemetry Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
            <MapPin size={15} style={{ color: 'var(--color-brand, #1b532e)' }} />
            <span>{formatCoordinates(currentLat, currentLng)}</span>
          </div>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: accuracyBadge.bg,
            color: accuracyBadge.color,
            border: `1px solid ${accuracyBadge.color}30`
          }}>
            {locationSource === 'gps' ? '🛰️ ' : '📍 '}{accuracyBadge.label}
          </span>
        </div>

        {/* Right: Interactive Mode & GPS Action Buttons */}
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* GPS Detection Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={locating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--color-brand, #1b532e)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: locating ? 'wait' : 'pointer',
                boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))'
              }}
              title="Detect real device GPS using browser Geolocation API"
            >
              <Crosshair size={14} className={locating ? 'spin' : ''} />
              {locating ? 'Searching GPS...' : 'Detect My GPS'}
            </button>

            {/* Mode Switcher: Pin vs Boundary Drawing */}
            {showBoundaryTool && (
              <div style={{
                display: 'inline-flex',
                backgroundColor: '#e2e8f0',
                padding: '2px',
                borderRadius: 'var(--radius-sm, 6px)'
              }}>
                <button
                  type="button"
                  onClick={() => setInteractionMode('pin')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: interactionMode === 'pin' ? 800 : 600,
                    backgroundColor: interactionMode === 'pin' ? '#ffffff' : 'transparent',
                    color: interactionMode === 'pin' ? 'var(--color-brand, #1b532e)' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  📍 Pin Point
                </button>

                <button
                  type="button"
                  onClick={() => setInteractionMode('boundary')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: interactionMode === 'boundary' ? 800 : 600,
                    backgroundColor: interactionMode === 'boundary' ? '#ffffff' : 'transparent',
                    color: interactionMode === 'boundary' ? '#16a34a' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  📐 Draw Boundary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GPS Status Notifications */}
      {gpsSuccessMsg && (
        <div style={{
          padding: '6px 14px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          fontSize: '0.76rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid #bbf7d0'
        }}>
          <CheckCircle2 size={14} />
          {gpsSuccessMsg}
        </div>
      )}

      {gpsError && (
        <div style={{
          padding: '6px 14px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontSize: '0.76rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #fecaca'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Boundary Drawing Context Bar */}
      {interactionMode === 'boundary' && !readOnly && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#166534' }}>
              Boundary Drawing Active:
            </span>
            <span style={{ color: '#15803d' }}>
              Click corners on the map to outline your field ({boundaryPoints.length} points marked)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {areaMetrics.isValid ? (
              <span style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                Area: {areaMetrics.acres} Acres ({areaMetrics.hectares} ha)
              </span>
            ) : (
              <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.72rem' }}>
                Mark at least 3 points to form field polygon
              </span>
            )}

            {boundaryPoints.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleUndoPoint}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Undo2 size={12} /> Undo Point
                </button>

                <button
                  type="button"
                  onClick={handleClearBoundary}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Real Leaflet Map */}
      <div style={{ height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={markerPos}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Recenter sub-component */}
          <MapRecenterController center={mapCenter} zoom={16} shouldFly={shouldFly} />

          {/* Click listener */}
          <MapClickHandler onMapClick={handleMapClick} activeMode={interactionMode} />

          {/* OpenStreetMap Standard Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* GPS Accuracy Uncertainty Circle */}
          {locationSource === 'gps' && accuracy && accuracy > 0 && (
            <Circle
              center={markerPos}
              radius={accuracy}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.15,
                weight: 1,
                dashArray: '4, 4'
              }}
            />
          )}

          {/* Primary Farm Location Marker */}
          <Marker
            position={markerPos}
            icon={createPinIcon('var(--color-brand, #1b532e)', 'Field Location')}
            draggable={!readOnly && interactionMode === 'pin'}
            eventHandlers={{
              dragend: handleMarkerDragEnd
            }}
          >
            <Popup>
              <div style={{ fontSize: '12px', minWidth: '160px' }}>
                <strong style={{ color: 'var(--color-brand, #1b532e)' }}>Active Field Pin</strong>
                <div style={{ marginTop: '4px', color: '#475569' }}>
                  {formatCoordinates(currentLat, currentLng)}
                </div>
                {locationSource === 'gps' && accuracy && (
                  <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>
                    GPS Accuracy: ±{accuracy} meters
                  </div>
                )}
                {!readOnly && (
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                    Tip: Drag this pin or click on the map to adjust exact plot location.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Field Boundary Polygon */}
          {boundaryPoints.length >= 3 ? (
            <Polygon
              positions={boundaryPoints}
              pathOptions={{
                color: '#16a34a',
                fillColor: '#22c55e',
                fillOpacity: 0.25,
                weight: 2.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong>Field Boundary</strong>
                  <div>Calculated Area: {areaMetrics.acres} Acres ({areaMetrics.hectares} ha)</div>
                  <div style={{ color: '#64748b', fontSize: '10px' }}>{boundaryPoints.length} perimeter corners</div>
                </div>
              </Popup>
            </Polygon>
          ) : boundaryPoints.length === 2 ? (
            <Polyline
              positions={boundaryPoints}
              pathOptions={{ color: '#16a34a', weight: 2, dashArray: '6, 6' }}
            />
          ) : null}

          {/* Boundary Vertex Nodes (Clickable for removal in boundary mode) */}
          {interactionMode === 'boundary' && !readOnly && boundaryPoints.map((pt, idx) => (
            <Marker
              key={`vertex-${idx}-${pt[0]}-${pt[1]}`}
              position={pt}
              icon={vertexIcon}
              eventHandlers={{
                click: () => handleRemoveSpecificPoint(idx)
              }}
            >
              <Popup>
                <div style={{ fontSize: '11px' }}>
                  Corner #{idx + 1}<br/>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecificPoint(idx)}
                    style={{
                      marginTop: '4px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 700
                    }}
                  >
                    Delete Point
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Additional Other Plots Overlay (Multi-Plot visualization) */}
          {allFarms && allFarms.map((otherFarm) => {
            if (!otherFarm.latitude || !otherFarm.longitude) return null;
            if (otherFarm.id === activeFarmId) return null; // already rendered as main marker

            const otherCoords = [parseFloat(otherFarm.latitude), parseFloat(otherFarm.longitude)];
            if (isNaN(otherCoords[0]) || isNaN(otherCoords[1])) return null;

            return (
              <React.Fragment key={otherFarm.id}>
                <Marker
                  position={otherCoords}
                  icon={createPinIcon('#475569', otherFarm.name)}
                >
                  <Popup>
                    <div style={{ fontSize: '12px' }}>
                      <strong>{otherFarm.name}</strong>
                      <div>{otherFarm.crop?.toUpperCase()} • {otherFarm.area_acres} ac</div>
                      <div style={{ color: '#64748b' }}>{formatCoordinates(otherCoords[0], otherCoords[1])}</div>
                    </div>
                  </Popup>
                </Marker>

                {Array.isArray(otherFarm.boundary_coordinates) && otherFarm.boundary_coordinates.length >= 3 && (
                  <Polygon
                    positions={otherFarm.boundary_coordinates}
                    pathOptions={{
                      color: '#64748b',
                      fillColor: '#94a3b8',
                      fillOpacity: 0.15,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Information Footer Bar */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle, #f1f5f9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-muted, #64748b)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div>
          {!readOnly && (
            <span>
              {interactionMode === 'pin'
                ? '💡 Tip: Click anywhere on map or drag pin to position field.'
                : '💡 Tip: Click corners to outline field perimeter. Click vertex to delete.'}
            </span>
          )}
        </div>

        {boundaryPoints.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534' }}>
            <Sparkles size={13} />
            <span>Boundary: {boundaryPoints.length} points • {areaMetrics.acres} Acres</span>
          </div>
        )}
      </div>
    </div>
  );
}
