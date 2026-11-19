from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    for page_id in ['analysis', 'weather', 'advisor', 'savings', 'overview']:
        el = page.locator(f'button[data-page="{page_id}"]').first
        el.click()
        print(f"Navigated to {page_id} successfully!")
    browser.close()
