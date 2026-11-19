from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("pageerror", lambda err: print("PAGE ERROR:", err))
    page.on("console", lambda msg: print("CONSOLE:", msg.type, msg.text))
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    
    # Click savings
    page.locator('button[data-page="savings"]').first.click(force=True)
    page.wait_for_timeout(2000)
    page.screenshot(path="artifacts/debug_savings.png")
    browser.close()
