import os
import re
import urllib.request
import urllib.parse
import json

def translate_text(text):
    if not text or not text.strip():
        return text
    # Check if text contains Hebrew characters
    if not re.search(r'[\u0590-\u05FF]', text):
        return text

    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=he&tl=en&dt=t&q=' + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        translated = ''.join([item[0] for item in data[0] if item[0]])
        return translated
    except Exception as e:
        print(f"Error translating text: {e}")
        return text

def translate_markdown_file(file_path):
    print(f"Translating {os.path.basename(file_path)}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split frontmatter and body
    fm_match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not fm_match:
        return

    frontmatter = fm_match.group(1)
    body = fm_match.group(2)

    # Translate frontmatter title and excerpt
    new_fm_lines = []
    for line in frontmatter.split('\n'):
        if line.startswith('title:'):
            m = re.match(r'^title:\s*"(.*)"$', line)
            if m:
                t_title = translate_text(m.group(1))
                t_title = t_title.replace('"', '\\"')
                new_fm_lines.append(f'title: "{t_title}"')
            else:
                new_fm_lines.append(line)
        elif line.startswith('excerpt:'):
            m = re.match(r'^excerpt:\s*"(.*)"$', line)
            if m:
                t_exc = translate_text(m.group(1))
                t_exc = t_exc.replace('"', '\\"')
                new_fm_lines.append(f'excerpt: "{t_exc}"')
            else:
                new_fm_lines.append(line)
        elif line.startswith('language:'):
            new_fm_lines.append('language: "en"')
        else:
            new_fm_lines.append(line)

    new_frontmatter = '\n'.join(new_fm_lines)

    # Process body lines
    body_lines = body.split('\n')
    new_body_lines = []

    for line in body_lines:
        trimmed = line.strip()
        if not trimmed:
            new_body_lines.append(line)
            continue

        # HTML iframe / div / figure container lines
        if trimmed.startswith('<div class="my-8') or trimmed.startswith('<iframe') or trimmed.startswith('<figure'):
            # Translate caption if inside figure
            if '<figcaption' in trimmed:
                def repl_caption(match):
                    cap = match.group(1)
                    return f'<figcaption class="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{translate_text(cap)}</figcaption>'
                line = re.sub(r'<figcaption[^>]*>(.*?)</figcaption>', repl_caption, line)
            new_body_lines.append(line)
            continue

        # HTML blockquote
        if trimmed.startswith('<blockquote'):
            new_body_lines.append('<blockquote dir="auto">')
            continue
        if trimmed.startswith('</blockquote>'):
            new_body_lines.append('</blockquote>')
            continue

        # Headings
        if line.startswith('#'):
            h_match = re.match(r'^(#+\s*)(.*)$', line)
            if h_match:
                prefix = h_match.group(1)
                h_text = h_match.group(2)
                new_body_lines.append(f"{prefix}{translate_text(h_text)}")
                continue

        # Standard paragraph text
        new_body_lines.append(translate_text(line))

    final_content = f"---\n{new_frontmatter}\n---\n" + '\n'.join(new_body_lines)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)

def main():
    en_dir = os.path.join(os.getcwd(), 'content/music-blog/en')
    files = [os.path.join(en_dir, f) for f in os.listdir(en_dir) if f.endswith('.md')]
    print(f"Found {len(files)} files to translate in {en_dir}")
    for file_path in files:
        translate_markdown_file(file_path)
    print("All files translated successfully!")

if __name__ == '__main__':
    main()
