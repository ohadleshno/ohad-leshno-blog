import os
import glob

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")

replacements = {
    "ohad_leshno.avif": "ohad_leshno.webp",
    "hero-cover.avif": "hero-cover.webp",
    "hero-cover.jpeg": "hero-cover.webp",
    "nehorai-hero.avif": "nehorai-hero.webp",
    "nehorai-hero.png": "nehorai-hero.webp",
    "logo-icon.avif": "logo-icon.webp",
    "logo-icon.png": "logo-icon.webp",
    "logo.png": "logo.webp",
}

for root, _, files in os.walk(SRC_DIR):
    for fname in files:
        if fname.endswith((".tsx", ".ts", ".js", ".jsx")):
            fpath = os.path.join(root, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            for old_str, new_str in replacements.items():
                new_content = new_content.replace(old_str, new_str)

            if new_content != content:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"[UPDATED CODE] {fname}")
