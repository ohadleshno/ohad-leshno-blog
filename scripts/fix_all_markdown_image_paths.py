import os
import glob
import re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")

def fix_content(content):
    # 1. Replace static.wixstatic.com links
    def wix_replancer(match):
        full = match.group(1)
        raw_name = full.split('~')[0]
        base_name = re.sub(r'\.(png|jpg|jpeg|avif|webp)$', '', raw_name, flags=re.IGNORECASE)
        return f'/images/wix/{base_name}.webp'

    content = re.sub(r'https?://static\.wixstatic\.com/media/([^\s"\'\)]+)', wix_replancer, content)

    # 2. Replace static root extensions
    content = content.replace('/hero-cover.jpeg', '/hero-cover.webp')
    content = content.replace('/hero-cover.avif', '/hero-cover.webp')
    content = content.replace('/nehorai-hero.png', '/nehorai-hero.webp')
    content = content.replace('/nehorai-hero.avif', '/nehorai-hero.webp')
    content = content.replace('/ohad_leshno.avif', '/ohad_leshno.webp')
    content = content.replace('/logo-icon.png', '/logo-icon.webp')
    content = content.replace('/logo-icon.avif', '/logo-icon.webp')
    content = content.replace('/logo.png', '/logo.webp')

    return content

def main():
    md_files = glob.glob(os.path.join(CONTENT_DIR, "**", "*.md"), recursive=True)
    updated_count = 0
    for md_path in md_files:
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        fixed = fix_content(content)
        if fixed != content:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(fixed)
            updated_count += 1
            print(f"[FIXED MD] {os.path.basename(md_path)}")

    print(f"Updated {updated_count} markdown files to local WebP paths!")

if __name__ == "__main__":
    main()
