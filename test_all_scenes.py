import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    
    # 1. Overview
    page.screenshot(path="artifacts/snap_01_overview.png")
    print("Snapshot 1: Overview captured")
    
    # 2. Hinglish
    page.locator('button:has-text("Hinglish")').click()
    time.sleep(1)
    page.screenshot(path="artifacts/snap_02_hinglish.png")
    print("Snapshot 2: Hinglish captured")
    
    # 3. Farm Analysis
    page.locator('button[data-page="analysis"]').first.click(force=True)
    time.sleep(2)
    # Select Wheat
    page.locator('.crop-selection-grid > div').first.click(force=True)
    time.sleep(1)
    # Click Calculate
    page.locator('button[data-action="calculate-water"]').first.click(force=True)
    time.sleep(3)
    page.screenshot(path="artifacts/snap_03_analysis.png")
    print("Snapshot 3: Farm Analysis captured")
    
    # 4. Weather
    page.locator('button[data-page="weather"]').first.click(force=True)
    time.sleep(3)
    page.screenshot(path="artifacts/snap_04_weather.png")
    print("Snapshot 4: Weather captured")
    
    # 5. AI Advisor
    page.locator('button[data-page="advisor"]').first.click(force=True)
    time.sleep(2)
    input_el = page.locator('input[type="text"].form-input').last
    input_el.fill("Wheat crop me pehla paani kab dena chahiye? Simple Hinglish me samjhao.")
    time.sleep(1)
    page.locator('button[data-action="send-advisor"]').first.click(force=True)
    time.sleep(6)
    page.screenshot(path="artifacts/snap_05_advisor.png")
    print("Snapshot 5: AI Advisor captured")
    
    # 6. Savings
    page.locator('button[data-page="savings"]').first.click(force=True)
    time.sleep(2)
    page.screenshot(path="artifacts/snap_06_savings.png")
    print("Snapshot 6: Savings captured")
    
    browser.close()
    print("ALL 6 SCENE SNAPSHOTS CAPTURED PERFECTLY!")
