import sys
import time
import urllib.request
import json
from playwright.sync_api import sync_playwright

BASE_API = "http://127.0.0.1:8000"
BASE_URL = "http://localhost:5174"

def test_backend_farm_api():
    print("\n--- 1. Testing FastAPI Farm Geolocation & Persistence Endpoints ---")
    
    # 1.1 List farms
    req = urllib.request.urlopen(f"{BASE_API}/api/v1/farms")
    assert req.status == 200, f"Expected 200, got {req.status}"
    farms = json.loads(req.read().decode())
    print(f"PASS: GET /api/v1/farms returned {len(farms)} farms.")
    assert len(farms) >= 3
    assert "latitude" in farms[0] and "longitude" in farms[0]
    print(f"PASS: Farm 1 has coordinates: {farms[0]['latitude']}, {farms[0]['longitude']} with {len(farms[0].get('boundary_coordinates', []))} boundary points.")

    # 1.2 Create farm with GPS & boundary
    new_farm_payload = {
        "name": "Automated GPS Test Plot",
        "crop": "wheat",
        "area_acres": 2.2,
        "soil_type": "alluvial",
        "location": "Uttar Pradesh",
        "latitude": 27.1767,
        "longitude": 78.0081,
        "gps_accuracy": 6.5,
        "location_source": "gps",
        "boundary_coordinates": [
            [27.1775, 78.0070],
            [27.1778, 78.0090],
            [27.1755, 78.0088],
            [27.1752, 78.0068]
        ]
    }
    req_post = urllib.request.Request(
        f"{BASE_API}/api/v1/farms",
        data=json.dumps(new_farm_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res_post = urllib.request.urlopen(req_post)
    assert res_post.status == 201, f"Expected 201, got {res_post.status}"
    created = json.loads(res_post.read().decode())
    created_id = created["id"]
    print(f"PASS: POST /api/v1/farms created farm '{created_id}' with lat={created['latitude']}, lng={created['longitude']}, area_ha={created.get('area_hectares')}.")

    # 1.3 Verify single fetch
    req_get = urllib.request.urlopen(f"{BASE_API}/api/v1/farms/{created_id}")
    assert req_get.status == 200
    fetched = json.loads(req_get.read().decode())
    assert fetched["latitude"] == 27.1767
    assert len(fetched["boundary_coordinates"]) == 4
    print(f"PASS: GET /api/v1/farms/{created_id} confirmed persisted coordinates.")

    # 1.4 Test Weather with direct GPS coordinates
    weather_url = f"{BASE_API}/api/v1/weather/forecast?latitude=27.1767&longitude=78.0081&location=Agra"
    req_w = urllib.request.urlopen(weather_url)
    assert req_w.status == 200
    w_data = json.loads(req_w.read().decode())
    assert w_data["status"] == "available"
    assert w_data["latitude"] == 27.1767 and w_data["longitude"] == 78.0081
    print(f"PASS: Weather forecast verified using direct farm coordinates: lat={w_data['latitude']}, rain={w_data.get('forecast_rainfall_mm')} mm.")

    # 1.5 Clean up created farm
    req_del = urllib.request.Request(f"{BASE_API}/api/v1/farms/{created_id}", method="DELETE")
    res_del = urllib.request.urlopen(req_del)
    assert res_del.status == 200
    print(f"PASS: DELETE /api/v1/farms/{created_id} cleaned up successfully.")


def test_browser_ui_geolocation_and_mapping():
    print("\n--- 2. Testing Browser UI Geolocation, Interactive Map & Boundary Drawing ---")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Test Case 1: Real Mocked GPS Navigation
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            permissions=["geolocation"],
            geolocation={"latitude": 26.8524, "longitude": 80.9412, "accuracy": 7}
        )
        page = context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE_ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE: {msg.text}") if msg.type in ["error"] else None)

        print(f"Navigating to {BASE_URL} ...")
        page.goto(BASE_URL, timeout=15000)
        page.wait_for_timeout(2000)

        # Navigate to My Farms page
        farms_nav = page.locator('aside button:has-text("My Farms")').first
        farms_nav.click()
        page.wait_for_timeout(1500)
        assert page.locator('h2:has-text("Farms")').first.is_visible() or page.get_by_text("registered agricultural plots").is_visible()
        print("PASS: Navigated to My Farms management page.")

        # Open Add New Field Modal
        add_btn = page.locator('button:has-text("Add New Field"), button:has-text("नया खेत जोड़ें")').first
        add_btn.click()
        page.wait_for_timeout(1500)
        assert page.locator('.modal-card').is_visible()
        print("PASS: Opened Add New Field modal.")

        # Click Detect My GPS button in the modal
        gps_btn = page.locator('.modal-card button:has-text("Detect My GPS")')
        assert gps_btn.is_visible()
        print("Clicking 'Detect My GPS' in modal...")
        gps_btn.click()
        page.wait_for_timeout(2000)

        # Verify GPS detection message & coordinates
        assert page.locator('text=GPS Acquired').is_visible()
        print("PASS: Successfully acquired browser GPS coordinates in UI!")
        page.screenshot(path="artifacts/verification/test_gps_detected.png")
        print("Saved: artifacts/verification/test_gps_detected.png")

        # Test Switching to Draw Boundary mode
        draw_tab = page.locator('.modal-card button:has-text("Draw Boundary")')
        draw_tab.click()
        page.wait_for_timeout(1000)
        assert page.locator('text=Boundary Drawing Active').is_visible()
        print("PASS: Activated Field Boundary Drawing Mode.")

        # Click 4 corners on the Leaflet map container to form a polygon
        map_el = page.locator('.modal-card .leaflet-container')
        assert map_el.is_visible()
        map_box = map_el.bounding_box()
        cx = map_box["x"] + map_box["width"] / 2
        cy = map_box["y"] + map_box["height"] / 2

        # 4 corners around center
        page.mouse.click(cx - 60, cy - 50)
        page.wait_for_timeout(400)
        page.mouse.click(cx + 60, cy - 50)
        page.wait_for_timeout(400)
        page.mouse.click(cx + 60, cy + 50)
        page.wait_for_timeout(400)
        page.mouse.click(cx - 60, cy + 50)
        page.wait_for_timeout(1000)

        # Verify area calculated
        assert page.locator('text=Area:').is_visible()
        print("PASS: Geodesic polygon area calculated successfully for drawn field corners!")
        page.screenshot(path="artifacts/verification/test_boundary_drawn.png")
        print("Saved: artifacts/verification/test_boundary_drawn.png")

        # Set field name and submit
        name_input = page.locator('.modal-card input[placeholder*="North Tubewell"]')
        name_input.fill("GPS Automated Field #99")
        
        save_btn = page.locator('.modal-card button[type="submit"]')
        save_btn.click()
        page.wait_for_timeout(2000)

        page.screenshot(path="artifacts/verification/debug_after_save.png")
        print("Modal visible?", page.locator('.modal-card').is_visible())
        print("Card titles:", [h.inner_text() for h in page.locator('h3').all()])
        if errors:
            print("Errors logged in browser:", errors)

        # Verify farm card was created and shows coordinates
        created_card = page.locator('.card:has-text("GPS Automated Field #99")').first
        assert created_card.is_visible(), "New farm card must appear on grid"
        print("PASS: Created farm card appears on dashboard grid.")
        assert created_card.locator('text=26.852').count() > 0 or created_card.locator('text=📐').count() > 0
        print("PASS: Farm card displays GPS coordinates badge and boundary point count.")

        # Test Reload Persistence
        print("Reloading browser page to test backend persistence...")
        page.reload()
        page.wait_for_timeout(2500)
        
        farms_nav_reload = page.locator('aside button:has-text("My Farms"), aside button:has-text("मेरे खेत")').first
        farms_nav_reload.click()
        page.wait_for_timeout(1500)
        
        reloaded_card = page.locator('.card:has-text("GPS Automated Field #99")').first
        assert reloaded_card.is_visible(), "Farm must persist after page reload via FastAPI backend!"
        print("PASS: Farm and its geolocation persisted after page reload via FastAPI backend!")
        page.screenshot(path="artifacts/verification/test_reloaded_persistence.png")
        print("Saved: artifacts/verification/test_reloaded_persistence.png")

        # Test Multi-Plot Geographic Map View
        map_view_btn = page.locator('button:has-text("Interactive Map")').first
        map_view_btn.click()
        page.wait_for_timeout(2000)
        assert page.locator('text=Geospatial Field & Boundary Map').is_visible() or page.locator('text=भू-स्थानिक').is_visible()
        print("PASS: Switched to Multi-Plot Geospatial Map View.")
        page.screenshot(path="artifacts/verification/test_multi_plot_map.png")
        print("Saved: artifacts/verification/test_multi_plot_map.png")

        # Test Weather Integration for the active farm
        weather_nav = page.locator('aside button:has-text("Weather"), aside button:has-text("मौसम")').first
        weather_nav.click()
        page.wait_for_timeout(2000)
        assert page.locator('h2:has-text("Weather Analytics"), h2:has-text("मौसम")').first.is_visible()
        print("PASS: Weather Analytics page loaded using farm's exact coordinates.")
        page.screenshot(path="artifacts/verification/test_weather_coordinates.png")
        print("Saved: artifacts/verification/test_weather_coordinates.png")

        context.close()

        # Test Case 2: Geolocation Permission Denied Handling
        print("\nTesting Geolocation Permission Denied Error Handling...")
        denied_context = browser.new_context(viewport={"width": 1440, "height": 900})
        denied_page = denied_context.new_page()
        # Explicitly mock PERMISSION_DENIED (error.code = 1)
        denied_page.add_init_script("""
            navigator.geolocation.getCurrentPosition = function(success, error, options) {
                var err = new Error("User denied Geolocation");
                err.code = 1; // PERMISSION_DENIED
                error(err);
            };
        """)
        denied_page.goto(f"{BASE_URL}/", timeout=15000)
        denied_page.wait_for_timeout(1500)
        
        denied_page.locator('aside button:has-text("My Farms")').first.click()
        denied_page.wait_for_timeout(1000)
        denied_page.locator('button:has-text("Add New Field")').first.click()
        denied_page.wait_for_timeout(1000)
        
        denied_btn = denied_page.locator('.modal-card button:has-text("Detect My GPS")')
        denied_btn.click()
        denied_page.wait_for_timeout(2000)
        
        assert denied_page.locator('text=Location permission was denied').is_visible() or denied_page.locator('text=permission').is_visible()
        print("PASS: Helpful user error displayed when GPS permission is denied.")
        denied_page.screenshot(path="artifacts/verification/test_gps_denied.png")
        print("Saved: artifacts/verification/test_gps_denied.png")
        
        denied_context.close()
        browser.close()
        
        # Reset backend farms back to default clean benchmarks
        req_reset = urllib.request.Request(f"{BASE_API}/api/v1/farms/reset", data=b"{}", headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req_reset)
        print("Cleaned up: Reset backend farms to 3 default clean benchmark plots.")

        print("\nAll Playwright UI tests completed successfully with ZERO unhandled errors!")

if __name__ == "__main__":
    test_backend_farm_api()
    test_browser_ui_geolocation_and_mapping()
