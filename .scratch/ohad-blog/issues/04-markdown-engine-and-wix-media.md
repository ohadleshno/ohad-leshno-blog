# 04 — Markdown Article Rendering Engine & Wix Media Embeds

**What to build:**
The Markdown reading engine and full article pages (`/[lang]/music/[slug]`) rendering parsed Wix posts with custom components for responsive YouTube video embeds, cover image hero banners, audio players, blockquotes, code blocks, and social share links.

**Blocked by:** 03 — Next.js Cloudflare App Shell, i18n & Theme Provider

**Status:** ready-for-agent

- [ ] Markdown parser (`gray-matter` + `remark`/`rehype` or `next-mdx-remote`) renders articles cleanly with proper typography, blockquotes, and line height.
- [ ] Embedded YouTube videos render responsive 16:9 video player containers with thumbnails.
- [ ] Cover images and inline Wix media render responsive image containers.
- [ ] Reading time, publication date, and tag badges display prominently at the post header.
- [ ] Social share buttons (WhatsApp, Twitter/X, LinkedIn, Copy Link) work on mobile and desktop.
