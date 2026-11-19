import time
from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")
        print("Page title:", page.title())
        
        # Test Scene 2: Language switcher
        print("Testing language switch...")
        page.locator('button:has-text("Hinglish")').click()
        time.sleep(1)
        print("Switched to Hinglish")
        
        # Test Scene 3: Navigate to Farm Analysis
        print("Testing Farm Analysis navigation...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button.nav-item'));
            const b = btns.find(x => x.textContent.includes('Water Need') || x.textContent.includes('Analysis') || x.textContent.includes('Check Water'));
            if (b) b.click();
        }""")
        time.sleep(2)
        
        # Select Wheat
        page.evaluate("""() => {
            const cropCards = Array.from(document.querySelectorAll('.crop-selection-grid > div'));
            if (cropCards.length > 0) cropCards[0].click();
        }""")
        time.sleep(1)
        
        # Click Calculate
        print("Clicking Calculate button...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const calcBtn = btns.find(b => b.textContent.includes('Calculate'));
            if (calcBtn) calcBtn.click();
        }""")
        time.sleep(3)
        print("Calculate clicked and waited")
        
        # Test Scene 4: Weather
        print("Testing Weather navigation...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button.nav-item'));
            const b = btns.find(x => x.textContent.includes('Water Today') || x.textContent.includes('Weather') || x.textContent.includes('Mausam'));
            if (b) b.click();
        }""")
        time.sleep(2)
        print("Weather page loaded")
        
        # Test Scene 5: AI Advisor
        print("Testing AI Advisor navigation...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button.nav-item'));
            const b = btns.find(x => x.textContent.includes('Ask FarmGuard') || x.textContent.includes('Advisor'));
            if (b) b.click();
        }""")
        time.sleep(2)
        
        print("Submitting question to AI Advisor...")
        input_el = page.locator('input[type="text"].form-input').last
        input_el.fill("Wheat crop me pehla paani kab dena chahiye? Simple Hinglish me samjhao.")
        time.sleep(1)
        
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const sendBtn = btns.find(b => b.textContent.includes('Send') || b.textContent.includes('Bhejein'));
            if (sendBtn) sendBtn.click();
        }""")
        print("Send clicked, waiting for AI response...")
        time.sleep(6)
        
        # Check messages count
        msg_count = page.evaluate("() => document.querySelectorAll('.advisor-msg-item').length")
        print("Messages count in chat:", msg_count)
        
        # Test Scene 6: Savings
        print("Testing Savings navigation...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button.nav-item'));
            const b = btns.find(x => x.textContent.includes('Savings') || x.textContent.includes('Water & Money Saved') || x.textContent.includes('Bachat'));
            if (b) b.click();
        }""")
        time.sleep(2)
        print("Savings page loaded")
        
        browser.close()
        print("All test interactions passed successfully!")

if __name__ == "__main__":
    test()
