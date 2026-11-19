import os
import sys
import time
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

PROJECT_ROOT = Path(__file__).parent.resolve()
VIDEO_DIR = PROJECT_ROOT / "recorded_videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FFMPEG_PATH = r"C:\Users\Ankush\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
FRONTEND_URL = "http://localhost:5173"

SCENES = [
    {
        "id": 1,
        "title": "Scene 1 • Introduction & Overview",
        "caption": "Namaste! Farmers often face unpredictable weather, rising irrigation costs, and water shortages. FarmGuard AI helps farmers understand their fields and make better-informed irrigation decisions through a simple, farmer-friendly interface.",
        "duration": 22.0
    },
    {
        "id": 2,
        "title": "Scene 2 • Multilingual Dashboard & Usability",
        "caption": "FarmGuard AI presents important farm information in simple language, so farmers can understand what the numbers mean and what they should check next.",
        "duration": 20.0
    },
    {
        "id": 3,
        "title": "Scene 3 • Farm Analysis & Precision Irrigation",
        "caption": "Yahan farmer apni crop aur field ki details enter kar sakta hai. FarmGuard irrigation requirement aur pump runtime calculate karne mein help karta hai. Results entered information aur calculation assumptions par depend karte hain.",
        "duration": 35.0
    },
    {
        "id": 4,
        "title": "Scene 4 • Live Weather & Rain Decisions",
        "caption": "Weather information se farmer irrigation ka time plan kar sakta hai. Paani dene se pehle forecast, soil condition aur crop ki actual requirement ko saath mein dekhna important hai.",
        "duration": 20.0
    },
    {
        "id": 5,
        "title": "Scene 5 • Grounded AI Advisory Assistant",
        "caption": "FarmGuard ka AI Advisor farmer ke sawalon ka simple language mein jawab dene ke liye bana hai. Farmer crop stage aur field conditions ke baare mein guidance pooch sakta hai. Practical advice dete waqt local conditions aur uncertainty ko dhyan mein rakhna zaroori hai.",
        "duration": 38.0
    },
    {
        "id": 6,
        "title": "Scene 6 • Water & Energy Conservation Impact",
        "caption": "FarmGuard AI ka goal hai farmers ko water management, irrigation planning aur crop decisions mein support dena. Simple language aur practical calculations ke through technology ko farmers ke liye zyada accessible banana hi iska focus hai.",
        "duration": 23.0
    }
]

def set_caption(page, scene_title, text):
    page.evaluate("""({ title, text }) => {
        let el = document.getElementById('fg-demo-caption-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'fg-demo-caption-overlay';
            el.style.position = 'fixed';
            el.style.bottom = '24px';
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';
            el.style.background = 'rgba(15, 23, 42, 0.94)';
            el.style.backdropFilter = 'blur(12px)';
            el.style.border = '1px solid rgba(255, 255, 255, 0.18)';
            el.style.borderRadius = '14px';
            el.style.padding = '12px 26px';
            el.style.color = '#ffffff';
            el.style.maxWidth = '920px';
            el.style.width = 'max-content';
            el.style.textAlign = 'center';
            el.style.zIndex = '999999';
            el.style.boxShadow = '0 12px 36px -4px rgba(0, 0, 0, 0.55)';
            el.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            el.style.pointerEvents = 'none';
            el.style.transition = 'all 0.3s ease';
            document.body.appendChild(el);
        }
        el.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4ade80;"></span>
                <span style="font-size: 11px; font-weight: 800; color: #4ade80; letter-spacing: 0.08em; text-transform: uppercase;">${title}</span>
            </div>
            <div style="font-size: 15.5px; font-weight: 500; line-height: 1.45; color: #f8fafc; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">${text}</div>
        `;
    }""", {"title": scene_title, "text": text})

def record_browser_session():
    # Remove older temp webm files in VIDEO_DIR
    for old_file in VIDEO_DIR.glob("*.webm"):
        try:
            old_file.unlink()
        except Exception:
            pass

    print("[1/5] Launching Playwright browser in 1920x1080 resolution...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--start-maximized",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(VIDEO_DIR),
            record_video_size={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        
        # SCENE 1: Introduction (0:00 - 0:22) [22s]
        print("[Scene 1] Overview & Introduction (22s)...")
        page.goto(FRONTEND_URL, wait_until="networkidle")
        time.sleep(1.0)
        set_caption(page, SCENES[0]["title"], SCENES[0]["caption"])
        
        # Hover over top overview cards
        page.mouse.move(500, 260)
        time.sleep(3.0)
        page.mouse.move(960, 260)
        time.sleep(3.0)
        page.mouse.move(1400, 260)
        time.sleep(3.0)
        
        # Scroll down gently to showcase telemetry & soil moisture
        for y in range(0, 420, 35):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.12)
        time.sleep(4.0)
        
        for y in range(420, 0, -35):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.10)
        time.sleep(4.5)

        # SCENE 2: Overview & Languages (0:22 - 0:42) [20s]
        print("[Scene 2] Multilingual Usability & Hinglish switch (20s)...")
        set_caption(page, SCENES[1]["title"], SCENES[1]["caption"])
        time.sleep(1.0)
        
        page.mouse.move(1550, 40)
        time.sleep(1.5)
        page.locator('button:has-text("Hinglish")').click()
        print("  -> Switched to Hinglish")
        time.sleep(3.0)
        
        page.mouse.move(120, 200)
        time.sleep(2.5)
        page.mouse.move(500, 300)
        time.sleep(3.0)
        page.mouse.move(1000, 300)
        time.sleep(4.0)
        time.sleep(5.0)

        # SCENE 3: Farm Analysis (0:42 - 1:17) [35s]
        print("[Scene 3] Farm Analysis & Precision Irrigation (35s)...")
        set_caption(page, SCENES[2]["title"], SCENES[2]["caption"])
        
        # Navigate to Farm Analysis using robust data-page attribute
        page.locator('button[data-page="analysis"]').first.click(force=True)
        time.sleep(2.5)
        
        # Select Wheat crop
        page.locator('.crop-selection-grid > div').first.click(force=True)
        print("  -> Selected Wheat crop")
        time.sleep(2.0)
        
        # Scroll down slightly
        page.evaluate("window.scrollTo(0, 380)")
        time.sleep(2.0)
        
        # Expand pump flow options
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const pumpBtn = btns.find(b => b.textContent.includes('Pump') || b.textContent.includes('Tubewell'));
            if (pumpBtn) pumpBtn.click();
        }""")
        time.sleep(2.0)
        
        # Click Calculate Water Need using data-action
        page.locator('button[data-action="calculate-water"]').first.click(force=True)
        print("  -> Triggered Calculate Water Need calculation")
        time.sleep(4.0)
        
        # Scroll to show calculation results and volumetric comparison
        for y in range(380, 850, 40):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.12)
        time.sleep(11.0)
        page.evaluate("window.scrollTo(0, 500)")
        time.sleep(6.5)

        # SCENE 4: Weather (1:17 - 1:37) [20s]
        print("[Scene 4] Live Weather & Rain Forecast (20s)...")
        set_caption(page, SCENES[3]["title"], SCENES[3]["caption"])
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1.0)
        
        # Navigate to Weather using data-page
        page.locator('button[data-page="weather"]').first.click(force=True)
        time.sleep(3.0)
        
        page.mouse.move(500, 280)
        time.sleep(3.0)
        
        # Scroll down to 7-day forecast cards
        for y in range(0, 360, 35):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.12)
        time.sleep(4.0)
        page.mouse.move(800, 380)
        time.sleep(3.5)
        page.mouse.move(1100, 380)
        time.sleep(3.5)

        # SCENE 5: AI Advisor (1:37 - 2:15) [38s]
        print("[Scene 5] AI Advisor with Live Real Response (38s)...")
        set_caption(page, SCENES[4]["title"], SCENES[4]["caption"])
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1.0)
        
        # Navigate to AI Advisor using data-page
        page.locator('button[data-page="advisor"]').first.click(force=True)
        time.sleep(2.5)
        
        query_text = "Wheat crop me pehla paani kab dena chahiye? Simple Hinglish me samjhao."
        print(f"  -> Submitting prompt: {query_text}")
        input_el = page.locator('input[type="text"].form-input').last
        input_el.click()
        input_el.fill(query_text)
        time.sleep(1.5)
        
        # Click Send using data-action
        page.locator('button[data-action="send-advisor"]').first.click(force=True)
        time.sleep(6.0)
        
        # Scroll chat view down smoothly to read the real answer
        for y in range(0, 500, 25):
            page.evaluate(f"""() => {{
                const chatStream = document.querySelector('.advisor-chat-card > div:first-child');
                if (chatStream) chatStream.scrollTop = {y};
                window.scrollBy(0, 20);
            }}""")
            time.sleep(0.12)
        
        # Hold on real AI response
        time.sleep(20.0)

        # SCENE 6: Savings and Closing (2:15 - 2:38) [23s]
        print("[Scene 6] Savings & Ecological Closing (23s)...")
        set_caption(page, SCENES[5]["title"], SCENES[5]["caption"])
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1.0)
        
        # Navigate to Savings using data-page
        page.locator('button[data-page="savings"]').first.click(force=True)
        time.sleep(3.0)
        
        # Hover over water saved and electricity savings
        page.mouse.move(450, 320)
        time.sleep(3.0)
        page.mouse.move(950, 320)
        time.sleep(3.0)
        page.mouse.move(1450, 320)
        time.sleep(3.0)
        
        # Scroll down slightly to showcase conventional vs precision comparison
        for y in range(0, 320, 30):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.12)
        time.sleep(6.0)

        print("Recording completed! Closing page and context...")
        page.close()
        context.close()
        browser.close()

    webm_files = list(VIDEO_DIR.glob("*.webm"))
    if not webm_files:
        raise RuntimeError("No WebM file found in recorded_videos folder!")
    latest_webm = max(webm_files, key=os.path.getmtime)
    print(f"Captured WebM video: {latest_webm} (Size: {latest_webm.stat().st_size} bytes)")
    return latest_webm

def export_final_mp4(webm_path):
    output_mp4 = ARTIFACTS_DIR / "farmguard-demo.mp4"
    audio_path = ARTIFACTS_DIR / "audio" / "master_narration.aac"
    
    print("[2/5] Merging video with synchronized AAC narration into MP4...")
    cmd = [
        FFMPEG_PATH, "-y",
        "-i", str(webm_path),
        "-i", str(audio_path),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        str(output_mp4)
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        raise RuntimeError(f"FFmpeg failed with return code {res.returncode}")
        
    print(f"[SUCCESS] Exported MP4 file to {output_mp4}")
    print(f"File size: {output_mp4.stat().st_size / (1024*1024):.2f} MB")
    return output_mp4

def verify_and_extract_frames(mp4_path):
    print("[3/5] Verifying MP4 media streams and duration...")
    info_cmd = [FFMPEG_PATH, "-i", str(mp4_path)]
    res = subprocess.run(info_cmd, capture_output=True, text=True)
    print("FFmpeg Inspection:")
    for line in res.stderr.splitlines():
        if "Duration:" in line or "Stream #" in line:
            print("  ", line.strip())
            
    print("[4/5] Extracting verification frames (beginning, middle, end)...")
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:00:10", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_01_intro.png")], capture_output=True)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:00:30", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_02_hinglish.png")], capture_output=True)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:01:05", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_03_analysis.png")], capture_output=True)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:01:30", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_04_weather.png")], capture_output=True)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:02:00", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_05_advisor.png")], capture_output=True)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", "00:02:25", "-i", str(mp4_path), "-vframes", "1", str(ARTIFACTS_DIR / "verify_06_savings.png")], capture_output=True)
    print("[5/5] All verification frames extracted successfully!")

if __name__ == "__main__":
    webm_file = record_browser_session()
    mp4_file = export_final_mp4(webm_file)
    verify_and_extract_frames(mp4_file)
    print("\nDEMO PRODUCTION WORKFLOW FULLY COMPLETE!")
