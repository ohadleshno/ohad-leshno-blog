# 01 — Wix JSON & About Page Migration Parser Script

**What to build:**
A Node/TypeScript migration script (`scripts/parse-wix-posts.ts`) that reads `wix-blog-posts-detailed.json` (Draft.js blocks, images, YouTube embeds, links, audio), parses the rich content, and outputs structured Markdown (`.md`) files into `content/music-blog/he/` and prepared files in `content/music-blog/en/`. Also fetches/scrapes the Wix About page (`https://ohadleshno.wixsite.com/ohad-leshno-music-bl/%D7%90%D7%95%D7%93%D7%95%D7%AA`) into `content/about/he.md` and `content/about/en.md`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `scripts/parse-wix-posts.ts` correctly parses Draft.js blocks (headers, paragraphs, blockquotes, bold/italic/underline styles).
- [ ] Correctly converts entityMap image URLs and YouTube embeds (`https://youtu.be/...`) into responsive Markdown media embeds.
- [ ] Generates YAML frontmatter containing `title`, `slug`, `date`, `excerpt`, `coverImage`, `minutesToRead`, and `language`.
- [ ] Outputs parsed `.md` files under `content/music-blog/he/` and corresponding prepared English `.md` files under `content/music-blog/en/`.
- [ ] Scrapes/extracts text from Wix About page into `content/about/he.md` and `content/about/en.md`.
