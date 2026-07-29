import os
import glob
import re
from PIL import Image

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
WIX_IMG_DIR = os.path.join(PUBLIC_DIR, "images", "wix")

def optimize_file(filepath, max_dim=800, quality=82):
    base, ext = os.path.splitext(filepath)
    if ext.lower() == '.webp':
        return filepath

    webp_path = f"{base}.webp"
    try:
        with Image.open(filepath) as img:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            img.save(webp_path, "WEBP", quality=quality, method=6)

        old_sz = os.path.getsize(filepath) // 1024
        new_sz = os.path.getsize(webp_path) // 1024
        print(f"[CONVERTED] {os.path.basename(filepath)} ({old_sz}KB) -> {os.path.basename(webp_path)} ({new_sz}KB)")
        return webp_path
    except Exception as e:
        print(f"[ERROR] Failed {filepath}: {e}")
        return filepath

def process_all_images():
    # 1. Process public root images
    optimize_file(os.path.join(PUBLIC_DIR, "nehorai-hero.png"), max_dim=800)
    if os.path.exists(os.path.join(PUBLIC_DIR, "nehorai-hero.avif")):
        optimize_file(os.path.join(PUBLIC_DIR, "nehorai-hero.avif"), max_dim=800)

    optimize_file(os.path.join(PUBLIC_DIR, "hero-cover.jpeg"), max_dim=800)
    if os.path.exists(os.path.join(PUBLIC_DIR, "hero-cover.avif")):
        optimize_file(os.path.join(PUBLIC_DIR, "hero-cover.avif"), max_dim=800)

    optimize_file(os.path.join(PUBLIC_DIR, "ohad_leshno.avif"), max_dim=360)
    optimize_file(os.path.join(PUBLIC_DIR, "logo-icon.png"), max_dim=64)
    optimize_file(os.path.join(PUBLIC_DIR, "logo.png"), max_dim=128)

    # 2. Process Wix images
    wix_files = glob.glob(os.path.join(WIX_IMG_DIR, "*"))
    for wfile in wix_files:
        if not wfile.endswith(".webp"):
            optimize_file(wfile, max_dim=800)

def update_markdown_references():
    md_files = glob.glob(os.path.join(PROJECT_ROOT, "content", "**", "*.md"), recursive=True)
    for md_path in md_files:
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace .avif / .jpg / .png links in wix folder with .webp
        new_content = re.sub(r'/images/wix/([a-zA-Z0-9_\-]+)\.(?:avif|jpg|jpeg|png)', r'/images/wix/\1.webp', content)

        if new_content != content:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"[UPDATED MD] {os.path.basename(md_path)}")

if __name__ == "__main__":
    print("=== STARTING WEBP CONVERSION ===")
    process_all_images()
    update_markdown_references()
    print("=== FINISHED WEBP CONVERSION ===")
