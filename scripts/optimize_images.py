import os
import re
import glob
import urllib.request
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
WIX_IMG_DIR = os.path.join(PUBLIC_DIR, "images", "wix")

os.makedirs(WIX_IMG_DIR, exist_ok=True)

def optimize_image(input_path, output_path, max_dim=1000, fmt="avif"):
    """
    Uses macOS sips tool to resample and convert image.
    If fmt is 'avif', converts to AVIF.
    If fmt is 'jpeg', converts to JPEG with quality 80.
    """
    try:
        # First resample max dimension
        cmd = ["sips", "-Z", str(max_dim), input_path, "--out", output_path]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Then convert format if needed
        if fmt == "avif":
            cmd = ["sips", "-s", "format", "avif", output_path, "--out", output_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif fmt == "jpeg":
            cmd = ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "80", output_path, "--out", output_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif fmt == "png":
            cmd = ["sips", "-s", "format", "png", output_path, "--out", output_path]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        old_size = os.path.getsize(input_path)
        new_size = os.path.getsize(output_path)
        print(f"[OPTIMIZED] {os.path.basename(input_path)}: {old_size//1024}KB -> {os.path.basename(output_path)}: {new_size//1024}KB")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to optimize {input_path}: {e}")
        return False

def download_and_optimize_wix_images():
    md_files = glob.glob(os.path.join(PROJECT_ROOT, "content", "**", "*.md"), recursive=True)
    wix_url_pattern = re.compile(r'https://static\.wixstatic\.com/media/([a-zA-Z0-9_\-~]+\.(?:png|jpg|jpeg|avif|webp))')

    download_map = {}

    for md_path in md_files:
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        matches = wix_url_pattern.findall(content)
        if not matches:
            continue

        modified = False
        for filename in matches:
            full_wix_url = f"https://static.wixstatic.com/media/{filename}"
            clean_name = re.sub(r'~mv2', '', filename)
            base, ext = os.path.splitext(clean_name)
            
            # Target local path
            target_avif_name = f"{base}.avif"
            target_avif_path = os.path.join(WIX_IMG_DIR, target_avif_name)
            local_url_path = f"/images/wix/{target_avif_name}"

            if full_wix_url not in download_map:
                temp_download_path = os.path.join(WIX_IMG_DIR, f"temp_{filename}")
                print(f"[DOWNLOADING] {full_wix_url} ...")
                try:
                    urllib.request.urlretrieve(full_wix_url, temp_download_path)
                    # Optimize to max 1000px width AVIF
                    optimize_image(temp_download_path, target_avif_path, max_dim=1000, fmt="avif")
                    if os.path.exists(temp_download_path):
                        os.remove(temp_download_path)
                    download_map[full_wix_url] = local_url_path
                except Exception as e:
                    print(f"[FAILED DOWNLOAD] {full_wix_url}: {e}")
                    continue
            else:
                local_url_path = download_map[full_wix_url]

            # Replace in content
            content = content.replace(full_wix_url, local_url_path)
            modified = True

        if modified:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[UPDATED MD] {os.path.basename(md_path)}")

def optimize_public_assets():
    # 1. nehorai-hero.png
    nehorai_png = os.path.join(PUBLIC_DIR, "nehorai-hero.png")
    nehorai_avif = os.path.join(PUBLIC_DIR, "nehorai-hero.avif")
    if os.path.exists(nehorai_png):
        optimize_image(nehorai_png, nehorai_avif, max_dim=1000, fmt="avif")

    # 2. hero-cover.jpeg
    hero_jpeg = os.path.join(PUBLIC_DIR, "hero-cover.jpeg")
    hero_avif = os.path.join(PUBLIC_DIR, "hero-cover.avif")
    if os.path.exists(hero_jpeg):
        optimize_image(hero_jpeg, hero_avif, max_dim=1200, fmt="avif")

    # 3. ohad_leshno.avif (resample down to max 500px)
    ohad_avif = os.path.join(PUBLIC_DIR, "ohad_leshno.avif")
    if os.path.exists(ohad_avif):
        temp_path = os.path.join(PUBLIC_DIR, "ohad_leshno_temp.avif")
        optimize_image(ohad_avif, temp_path, max_dim=500, fmt="avif")
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            os.replace(temp_path, ohad_avif)

    # 4. logo.png (resample to max 128px)
    logo_png = os.path.join(PUBLIC_DIR, "logo.png")
    if os.path.exists(logo_png):
        temp_logo = os.path.join(PUBLIC_DIR, "logo_temp.png")
        optimize_image(logo_png, temp_logo, max_dim=128, fmt="png")
        if os.path.exists(temp_logo) and os.path.getsize(temp_logo) > 0:
            os.replace(temp_logo, logo_png)

if __name__ == "__main__":
    print("=== STARTING IMAGE OPTIMIZATION ===")
    download_and_optimize_wix_images()
    optimize_public_assets()
    print("=== FINISHED IMAGE OPTIMIZATION ===")
