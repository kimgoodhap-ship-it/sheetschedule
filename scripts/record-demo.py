"""
SheetSchedule Demo Video Recorder v3
- Text overlays rendered via browser DOM (no ffmpeg drawtext needed)
- Includes Google Sheets view
- Natural timing
"""

from playwright.sync_api import sync_playwright
import time
import os

# Config
DEMO_URL = "https://sheetschedule-demo.netlify.app/"
SHEET_URL = "https://docs.google.com/spreadsheets/d/1Hw96Ma4DLGbPdKJQG9x81WT-XqwTr93EjG8jJpPhW88/edit"
OUTPUT_DIR = os.path.expanduser("~/claude-projects/Gumroad_project/upload/files")
VIDEO_DIR = os.path.join(OUTPUT_DIR, "video-tmp")

os.makedirs(VIDEO_DIR, exist_ok=True)

# Clean previous recordings
for f in os.listdir(VIDEO_DIR):
    if f.endswith('.webm'):
        os.remove(os.path.join(VIDEO_DIR, f))


def show_overlay(page, text, duration=0):
    """Show text overlay at bottom of page"""
    page.evaluate(f"""() => {{
        let overlay = document.getElementById('demo-overlay');
        if (!overlay) {{
            overlay = document.createElement('div');
            overlay.id = 'demo-overlay';
            overlay.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(0,0,0,0.75);color:white;text-align:center;padding:18px 30px;font-family:-apple-system,sans-serif;font-size:28px;font-weight:500;letter-spacing:0.5px;transition:opacity 0.3s;';
            document.body.appendChild(overlay);
        }}
        overlay.textContent = '{text}';
        overlay.style.opacity = '1';
    }}""")
    if duration > 0:
        time.sleep(duration)


def hide_overlay(page):
    """Hide text overlay"""
    page.evaluate("""() => {
        const overlay = document.getElementById('demo-overlay');
        if (overlay) overlay.style.opacity = '0';
    }""")


print("=== SheetSchedule Demo Recording v3 ===")

# Warm up API
import urllib.request
try:
    urllib.request.urlopen("https://sheetschedule-api-920976615761.asia-northeast3.run.app/api/health", timeout=15)
    print("API warmed up")
except:
    print("API warmup skipped")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=VIDEO_DIR,
        record_video_size={"width": 1920, "height": 1080},
    )
    page = context.new_page()

    # === Scene 2: Gantt Chart Overview (10s) ===
    print("[Scene 2] Loading demo site...")
    page.goto(DEMO_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    show_overlay(page, "Your project timeline, powered by Google Sheets")
    time.sleep(2)

    # Slow scroll down
    for i in range(6):
        page.mouse.wheel(0, 100)
        time.sleep(0.5)
    time.sleep(2)

    # Scroll back up
    page.mouse.wheel(0, -600)
    time.sleep(1)
    hide_overlay(page)

    # === Scene 3: Project Filter (8s) ===
    print("[Scene 3] Project filtering...")
    show_overlay(page, "Filter by project — see only what matters")
    time.sleep(1)
    page.select_option("select.project-filter", "Mobile App Launch")
    time.sleep(3)
    page.select_option("select.project-filter", "")
    time.sleep(2)
    hide_overlay(page)

    # === Scene 4: Time Scale (10s) ===
    print("[Scene 4] Time scale switching...")
    show_overlay(page, "Switch between Monthly, Weekly, and Daily views")
    time.sleep(1)
    # Monthly
    page.click('button[title="Zoom out"]')
    time.sleep(2)
    # Weekly
    page.click('button[title="Zoom in"]')
    time.sleep(1.5)
    # Daily
    page.click('button[title="Zoom in"]')
    time.sleep(2)
    # Back to Weekly
    page.click('button[title="Zoom out"]')
    time.sleep(1.5)
    hide_overlay(page)

    # === Scene 5: Open Google Sheet (5s) ===
    print("[Scene 5] Open Google Sheet...")
    show_overlay(page, "Your data lives in Google Sheets")
    time.sleep(1)
    page.evaluate("() => { const a = document.querySelector('a.btn-open-sheet'); if(a) { a.removeAttribute('target'); a.click(); } }")
    time.sleep(5)
    hide_overlay(page)

    # === Scene 6: Show Google Sheet data (12s) ===
    print("[Scene 6] Google Sheet data view...")
    show_overlay(page, "Add a new task — just type in a row")
    time.sleep(4)

    # Scroll to show data
    for i in range(3):
        page.mouse.wheel(0, 120)
        time.sleep(0.5)
    time.sleep(3)

    # Scroll back
    for i in range(3):
        page.mouse.wheel(0, -120)
        time.sleep(0.3)
    time.sleep(2)
    hide_overlay(page)

    # === Scene 7: Back to demo site + Refresh (10s) ===
    print("[Scene 7] Back to demo site + Refresh...")
    page.goto(DEMO_URL, wait_until="networkidle", timeout=30000)
    time.sleep(2)
    show_overlay(page, "Click Refresh — see it instantly on your Gantt chart")
    time.sleep(1)

    page.click('button:has-text("Refresh")')
    time.sleep(4)

    for i in range(3):
        page.mouse.wheel(0, 100)
        time.sleep(0.3)
    time.sleep(3)
    hide_overlay(page)

    # === Scene 8: Additional features (8s) ===
    print("[Scene 8] Additional features...")
    page.mouse.wheel(0, -400)
    time.sleep(1)
    show_overlay(page, "Drag & drop, export to PNG, and more")
    time.sleep(1)

    page.click('button:has-text("Save PNG")')
    time.sleep(3)

    page.click('button:has-text("JSON")')
    time.sleep(3)
    hide_overlay(page)
    time.sleep(1)

    print("[Done] Closing browser and saving video...")
    video_path = page.video.path()
    context.close()
    browser.close()

    print(f"\nVideo saved to: {video_path}")

    final_path = os.path.join(OUTPUT_DIR, "demo-raw.webm")
    if os.path.exists(video_path):
        import shutil
        shutil.copy2(video_path, final_path)
        size_mb = os.path.getsize(final_path) / (1024 * 1024)
        print(f"Copied to: {final_path} ({size_mb:.1f} MB)")
    else:
        print(f"WARNING: Video file not found at {video_path}")
