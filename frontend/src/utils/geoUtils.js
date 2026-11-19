/**
 * FarmGuard AI — Geolocation & Spatial Agricultural Utilities
 * Handles browser GPS positioning, timeout/retry recovery, Leaflet coordinate transformations,
 * and high-precision geodesic polygon area calculations (acres/hectares) for farm plots.
 */

// Earth ellipsoidal parameters (WGS84)
const WGS84_A = 6378137.0; // semi-major axis in meters
const SQ_METERS_PER_ACRE = 4046.8564224;
const SQ_METERS_PER_HECTARE = 10000.0;

/**
 * Capture browser GPS coordinates with high accuracy and automatic retry.
 *
 * @param {Object} options
 * @param {boolean} options.highAccuracy - Request GPS hardware rather than WiFi/cell triangulation
 * @param {number} options.timeoutMs - Timeout limit in milliseconds
 * @param {number} options.maxRetries - Number of retry attempts on timeout or transient failure
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: string, source: string}>}
 */
export async function getBrowserLocation({
  highAccuracy = true,
  timeoutMs = 12000,
  maxRetries = 1
} = {}) {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    const err = new Error('Geolocation is not supported by your current browser.');
    err.code = 'UNSUPPORTED';
    throw err;
  }

  let attempt = 0;

  const tryGetPosition = (enableHighAccuracy, timeout) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
          const timestamp = new Date(pos.timestamp || Date.now()).toISOString();

          resolve({
            latitude: lat,
            longitude: lng,
            accuracy,
            timestamp,
            source: 'gps'
          });
        },
        (error) => {
          let userMessage = 'Unable to retrieve your location.';
          let errorCode = 'UNKNOWN';

          switch (error.code) {
            case 1:
            case error?.PERMISSION_DENIED:
              userMessage = 'Location permission was denied. Please allow GPS access in your browser or phone settings to detect your field.';
              errorCode = 'PERMISSION_DENIED';
              break;
            case 2:
            case error?.POSITION_UNAVAILABLE:
              userMessage = 'GPS signal is currently unavailable. You can click on the interactive map to place your field pin manually.';
              errorCode = 'POSITION_UNAVAILABLE';
              break;
            case 3:
            case error?.TIMEOUT:
              userMessage = 'GPS detection timed out while searching for satellites. Retrying or use manual pin placement.';
              errorCode = 'TIMEOUT';
              break;
            default:
              userMessage = error.message || 'GPS location error.';
              break;
          }

          const wrappedError = new Error(userMessage);
          wrappedError.code = errorCode;
          wrappedError.originalError = error;
          reject(wrappedError);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge: 0 // Force fresh satellite/sensor read
        }
      );
    });
  };

  while (attempt <= maxRetries) {
    try {
      // First attempt with high accuracy
      const result = await tryGetPosition(highAccuracy, timeoutMs);
      return result;
    } catch (err) {
      if (err.code === 'PERMISSION_DENIED' || attempt >= maxRetries) {
        throw err;
      }
      attempt++;
      // Retry once with slightly relaxed accuracy/timeout to allow cell tower fallback
      console.warn(`GPS attempt ${attempt} failed (${err.code}). Retrying with adaptive accuracy...`);
      timeoutMs = 15000;
    }
  }
}

/**
 * Calculate field boundary area in square meters, acres, and hectares
 * using geodesic projection and the Shoelace formula.
 *
 * @param {Array<Array<number>>|Array<{lat: number, lng: number}>} coordinates
 * @returns {{sqMeters: number, acres: number, hectares: number, pointCount: number, isValid: boolean}}
 */
export function calculatePolygonArea(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return {
      sqMeters: 0,
      acres: 0,
      hectares: 0,
      pointCount: Array.isArray(coordinates) ? coordinates.length : 0,
      isValid: false
    };
  }

  // Normalize points to [lat, lng]
  const pts = coordinates.map(p => {
    if (Array.isArray(p)) return [Number(p[0]), Number(p[1])];
    if (p && typeof p === 'object') return [Number(p.lat), Number(p.lng)];
    return [0, 0];
  });

  // Calculate center latitude for metric projection scaling
  const centerLat = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
  const latRad = (centerLat * Math.PI) / 180.0;

  // WGS84 meters per degree at this latitude
  const metersPerLat = 111132.954 - 559.822 * Math.cos(2 * latRad) + 1.175 * Math.cos(4 * latRad);
  const metersPerLng = (Math.PI / 180.0) * WGS84_A * Math.cos(latRad);

  const refLat = pts[0][0];
  const refLng = pts[0][1];

  // Convert to local Cartesian coordinates (meters)
  const cartesian = pts.map(p => [
    (p[1] - refLng) * metersPerLng, // x (easting)
    (p[0] - refLat) * metersPerLat  // y (northing)
  ]);

  // Shoelace algorithm
  let areaSum = 0;
  const n = cartesian.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += cartesian[i][0] * cartesian[j][1];
    areaSum -= cartesian[j][0] * cartesian[i][1];
  }

  const sqMeters = Math.abs(areaSum) * 0.5;
  const acres = Number((sqMeters / SQ_METERS_PER_ACRE).toFixed(2));
  const hectares = Number((sqMeters / SQ_METERS_PER_HECTARE).toFixed(2));

  return {
    sqMeters: Math.round(sqMeters),
    acres,
    hectares,
    pointCount: n,
    isValid: true
  };
}

/**
 * Format latitude and longitude coordinates for clean UI display.
 * Example: "26.85240° N, 80.94120° E"
 */
export function formatCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'Not specified';
  }
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return 'Invalid coordinates';

  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';

  return `${Math.abs(latNum).toFixed(5)}° ${latDir}, ${Math.abs(lngNum).toFixed(5)}° ${lngDir}`;
}

/**
 * Get visual quality rating of GPS accuracy in meters.
 */
export function getAccuracyQuality(accuracyMeters) {
  if (accuracyMeters === null || accuracyMeters === undefined) {
    return { label: 'Manual Pin', color: '#64748b', bg: '#f1f5f9' };
  }
  if (accuracyMeters <= 8) {
    return { label: `High Precision (±${accuracyMeters}m)`, color: '#16a34a', bg: '#dcfce7' };
  }
  if (accuracyMeters <= 20) {
    return { label: `Good GPS (±${accuracyMeters}m)`, color: '#0284c7', bg: '#e0f2fe' };
  }
  return { label: `Approximate (±${accuracyMeters}m)`, color: '#d97706', bg: '#fef3c7' };
}
