import urllib.request
import json

def test_endpoints():
    base = "http://127.0.0.1:8000"
    
    # 1. Health
    req = urllib.request.Request(f"{base}/health")
    with urllib.request.urlopen(req) as resp:
        health_data = json.loads(resp.read().decode())
        print("Health probe:", health_data)
        assert health_data["status"] == "ok"
        
    # 2. Ready
    req = urllib.request.Request(f"{base}/ready")
    with urllib.request.urlopen(req) as resp:
        ready_data = json.loads(resp.read().decode())
        print("Readiness probe:", ready_data)
        assert ready_data["status"] == "ready"
        
    # 3. Analyze Farm
    payload = json.dumps({
        "crop": "wheat",
        "area_acres": 2.0,
        "soil_type": "alluvial",
        "current_irrigation_mm": 35.0,
        "location": "Uttar Pradesh",
        "soil_moisture_percent": 35.0,
        "rainfall_probability": 0.15
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/api/v1/farm/analyze",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        analyze_data = json.loads(resp.read().decode())
        print("Farm Analyze result:", analyze_data["irrigation_recommendation"]["status"])
        assert analyze_data["irrigation_recommendation"]["recommended_irrigation_mm"] > 0
        
    print("ALL BACKEND CHECKS PASSED!")

if __name__ == "__main__":
    test_endpoints()
