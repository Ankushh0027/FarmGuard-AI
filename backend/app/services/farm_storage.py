"""Persistent farm storage for FarmGuard AI.

Provides persistent file-backed JSON storage for farms, their GPS geolocations,
and boundary polygons. Ensures data persists across server restarts and page reloads.
"""

import os
import json
import uuid
import logging
from typing import List, Optional, Dict, Any
from threading import Lock
from app.models.farm import FarmModel, FarmCreateRequest, FarmUpdateRequest

logger = logging.getLogger(__name__)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
FARMS_FILE = os.path.join(DATA_DIR, "farms.json")

_storage_lock = Lock()

# Realistic initial default farms with GPS coordinates and boundary polygons across India
INITIAL_DEFAULT_FARMS: List[Dict[str, Any]] = [
    {
        "id": "farm-1",
        "name": "North Tubewell Plot (उत्तर खेत)",
        "crop": "wheat",
        "area_acres": 2.0,
        "area_hectares": 0.81,
        "soil_type": "alluvial",
        "current_irrigation_mm": 35.0,
        "location": "Uttar Pradesh",
        "rainfall_probability": 15.0,
        "forecast_rainfall_mm": 0.0,
        "soil_moisture_percent": 58.0,
        "pump_flow_lpm": 460.0,
        "pump_hp": 5.0,
        "electricity_tariff": 6.0,
        "sowing_date": "2026-10-25",
        "notes": "Near tube-well #1. Sown on Oct 25. Regular alluvial loam.",
        "latitude": 26.8524,
        "longitude": 80.9412,
        "gps_accuracy": 5.2,
        "location_captured_at": "2026-10-25T08:30:00Z",
        "location_source": "gps",
        "boundary_coordinates": [
            [26.8530, 80.9405],
            [26.8532, 80.9422],
            [26.8518, 80.9420],
            [26.8516, 80.9403]
        ]
    },
    {
        "id": "farm-2",
        "name": "Canal Side Plot (नहर वाला खेत)",
        "crop": "rice",
        "area_acres": 1.5,
        "area_hectares": 0.61,
        "soil_type": "clayey",
        "current_irrigation_mm": 65.0,
        "location": "Punjab",
        "rainfall_probability": 20.0,
        "forecast_rainfall_mm": 0.0,
        "soil_moisture_percent": 74.0,
        "pump_flow_lpm": 700.0,
        "pump_hp": 7.5,
        "electricity_tariff": 6.0,
        "sowing_date": "2026-07-10",
        "notes": "Heavy clay soil, canal sub-distributary access. High water retention.",
        "latitude": 30.9085,
        "longitude": 75.8532,
        "gps_accuracy": 4.8,
        "location_captured_at": "2026-07-10T09:15:00Z",
        "location_source": "gps",
        "boundary_coordinates": [
            [30.9092, 75.8525],
            [30.9093, 75.8540],
            [30.9078, 75.8539],
            [30.9077, 75.8524]
        ]
    },
    {
        "id": "farm-3",
        "name": "South Borewell Plot (दक्षिण बोरवेल)",
        "crop": "maize",
        "area_acres": 3.0,
        "area_hectares": 1.21,
        "soil_type": "sandy loam",
        "current_irrigation_mm": 40.0,
        "location": "Haryana",
        "rainfall_probability": 10.0,
        "forecast_rainfall_mm": 0.0,
        "soil_moisture_percent": 38.0,
        "pump_flow_lpm": 460.0,
        "pump_hp": 5.0,
        "electricity_tariff": 6.0,
        "sowing_date": "2026-09-01",
        "notes": "Permeable sandy loam. Root zone drying faster, requires monitoring.",
        "latitude": 29.6912,
        "longitude": 76.9854,
        "gps_accuracy": 6.0,
        "location_captured_at": "2026-09-01T10:00:00Z",
        "location_source": "manual",
        "boundary_coordinates": [
            [29.6922, 76.9842],
            [29.6924, 76.9868],
            [29.6902, 76.9866],
            [29.6900, 76.9840]
        ]
    }
]


def _ensure_storage_initialized():
    """Ensure data directory and farms.json file exist."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FARMS_FILE):
        with open(FARMS_FILE, "w", encoding="utf-8") as f:
            json.dump(INITIAL_DEFAULT_FARMS, f, indent=2, ensure_ascii=False)
        logger.info(f"Initialized persistent farm storage with {len(INITIAL_DEFAULT_FARMS)} default farms.")


def get_all_farms() -> List[FarmModel]:
    """Retrieve all persisted farms."""
    with _storage_lock:
        _ensure_storage_initialized()
        try:
            with open(FARMS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return [FarmModel(**item) for item in data]
        except Exception as e:
            logger.error(f"Error loading farms from storage: {e}")
            return [FarmModel(**item) for item in INITIAL_DEFAULT_FARMS]


def get_farm_by_id(farm_id: str) -> Optional[FarmModel]:
    """Retrieve a single farm by its ID."""
    farms = get_all_farms()
    for f in farms:
        if f.id == farm_id:
            return f
    return None


def create_farm(req: FarmCreateRequest) -> FarmModel:
    """Create and persist a new farm."""
    with _storage_lock:
        _ensure_storage_initialized()
        try:
            with open(FARMS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = []

        new_id = f"farm-{uuid.uuid4().hex[:8]}"
        farm_dict = req.model_dump()
        farm_dict["id"] = new_id

        # Calculate area_hectares if not provided
        if not farm_dict.get("area_hectares") and farm_dict.get("area_acres"):
            farm_dict["area_hectares"] = round(farm_dict["area_acres"] * 0.404686, 2)

        data.append(farm_dict)

        # Atomic write
        temp_file = f"{FARMS_FILE}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, FARMS_FILE)

        logger.info(f"Persisted new farm: {new_id} ({farm_dict.get('name')})")
        return FarmModel(**farm_dict)


def update_farm(farm_id: str, req: FarmUpdateRequest) -> Optional[FarmModel]:
    """Update an existing farm's details or geolocation."""
    with _storage_lock:
        _ensure_storage_initialized()
        try:
            with open(FARMS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return None

        found = False
        updated_dict = None
        for i, item in enumerate(data):
            if item.get("id") == farm_id:
                update_data = req.model_dump(exclude_unset=True)
                item.update(update_data)

                # Re-calculate area_hectares if area_acres updated
                if "area_acres" in update_data and update_data["area_acres"]:
                    item["area_hectares"] = round(update_data["area_acres"] * 0.404686, 2)

                data[i] = item
                updated_dict = item
                found = True
                break

        if not found:
            return None

        temp_file = f"{FARMS_FILE}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, FARMS_FILE)

        logger.info(f"Updated farm: {farm_id}")
        return FarmModel(**updated_dict)


def delete_farm(farm_id: str) -> bool:
    """Delete a farm by ID."""
    with _storage_lock:
        _ensure_storage_initialized()
        try:
            with open(FARMS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return False

        orig_len = len(data)
        data = [item for item in data if item.get("id") != farm_id]

        if len(data) == orig_len:
            return False

        temp_file = f"{FARMS_FILE}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, FARMS_FILE)

        logger.info(f"Deleted farm: {farm_id}")
        return True


def reset_farms_to_default() -> List[FarmModel]:
    """Reset persistent storage to initial demo farms."""
    with _storage_lock:
        _ensure_storage_initialized()
        with open(FARMS_FILE, "w", encoding="utf-8") as f:
            json.dump(INITIAL_DEFAULT_FARMS, f, indent=2, ensure_ascii=False)
        logger.info("Reset farms to default dataset.")
        return [FarmModel(**item) for item in INITIAL_DEFAULT_FARMS]
