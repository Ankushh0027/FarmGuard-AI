"""Weather service client for FarmGuard AI.

Integrates with the free Open-Meteo Weather API to fetch real precipitation forecasts
for Indian agricultural regions without requiring API keys. Gracefully handles
timeouts, network failures, and unknown locations.
"""

from typing import Dict, Any, Optional, Tuple
import httpx

# Predefined coordinates for major Indian agricultural states/regions (fast, offline-resilient lookup)
KNOWN_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "uttar pradesh": (26.8467, 80.9462),   # Lucknow / Central UP
    "up": (26.8467, 80.9462),
    "punjab": (30.9010, 75.8573),          # Ludhiana / Central Punjab
    "haryana": (29.6857, 76.9905),         # Karnal / Central Haryana
    "bihar": (25.5941, 85.1376),           # Patna
    "madhya pradesh": (23.2599, 77.4126),  # Bhopal
    "mp": (23.2599, 77.4126),
    "rajasthan": (26.9124, 75.7873),       # Jaipur
    "maharashtra": (18.5204, 73.8567),     # Pune
    "gujarat": (23.0225, 72.5714),         # Ahmedabad
    "west bengal": (22.5726, 88.3639),     # Kolkata
    "karnataka": (12.9716, 77.5946),       # Bengaluru
    "tamil nadu": (13.0827, 80.2707),      # Chennai
    "andhra pradesh": (16.5062, 80.6480),  # Vijayawada
    "telangana": (17.3850, 78.4867),       # Hyderabad
}

TIMEOUT_SECONDS = 3.5


def resolve_coordinates(location: str) -> Optional[Tuple[float, float]]:
    """Resolve location name to (latitude, longitude) using static map or dynamic geocoding."""
    norm = location.strip().lower()
    if norm in KNOWN_LOCATIONS:
        return KNOWN_LOCATIONS[norm]

    for key, coords in KNOWN_LOCATIONS.items():
        if key in norm or norm in key:
            return coords

    # Fallback to Open-Meteo Geocoding API if not in static table
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
        with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results")
                if results and len(results) > 0:
                    return float(results[0]["latitude"]), float(results[0]["longitude"])
    except Exception:
        pass

    return None


def fetch_weather_forecast(location: str) -> Dict[str, Any]:
    """Fetch 24-48h forecast precipitation amount (mm) and rain probability from Open-Meteo API.

    Args:
        location: Indian state, city, or district name.

    Returns:
        Structured weather dictionary with status 'available' or 'unavailable'.
    """
    coords = resolve_coordinates(location)
    if not coords:
        return {
            "location": location,
            "latitude": None,
            "longitude": None,
            "forecast_rainfall_mm": None,
            "rainfall_probability": None,
            "source": "Open-Meteo",
            "status": "unavailable",
            "message": f"Could not geocode location '{location}'."
        }

    lat, lon = coords
    endpoint = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata"
    )

    try:
        with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
            response = client.get(endpoint)
            if response.status_code != 200:
                return {
                    "location": location,
                    "latitude": lat,
                    "longitude": lon,
                    "forecast_rainfall_mm": None,
                    "rainfall_probability": None,
                    "source": "Open-Meteo",
                    "status": "unavailable",
                    "message": f"Open-Meteo API returned HTTP status {response.status_code}."
                }

            data = response.json()
            daily = data.get("daily", {})
            precip_sums = daily.get("precipitation_sum", [])
            precip_probs = daily.get("precipitation_probability_max", [])

            # Use first day forecast (next 24h)
            forecast_mm = float(precip_sums[0]) if precip_sums and precip_sums[0] is not None else 0.0
            prob_percent = float(precip_probs[0]) if precip_probs and precip_probs[0] is not None else 0.0
            prob_normalized = round(prob_percent / 100.0, 2)

            return {
                "location": location,
                "latitude": lat,
                "longitude": lon,
                "forecast_rainfall_mm": forecast_mm,
                "rainfall_probability": prob_normalized,
                "source": "Open-Meteo",
                "status": "available",
                "message": "Forecast retrieved successfully."
            }
    except httpx.TimeoutException:
        return {
            "location": location,
            "latitude": lat,
            "longitude": lon,
            "forecast_rainfall_mm": None,
            "rainfall_probability": None,
            "source": "Open-Meteo",
            "status": "unavailable",
            "message": "Weather service request timed out."
        }
    except Exception as err:
        return {
            "location": location,
            "latitude": lat,
            "longitude": lon,
            "forecast_rainfall_mm": None,
            "rainfall_probability": None,
            "source": "Open-Meteo",
            "status": "unavailable",
            "message": f"Weather lookup failed: {str(err)}"
        }
