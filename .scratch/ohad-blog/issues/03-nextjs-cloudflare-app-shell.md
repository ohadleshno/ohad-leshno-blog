# 03 — Next.js Cloudflare App Shell, i18n & Theme Provider

**What to build:**
The core Next.js 14 application shell with Cloudflare Pages static export configuration (`output: 'export'`, `images: { unoptimized: true }`), dynamic `[lang]` locale routing (`he` & `en`), RTL (`dir="rtl"`) for Hebrew and LTR (`dir="ltr"`) for English, Dark/Light mode theme switching (`next-themes`), CSS variables design system, and glassmorphism header navigation.

**Blocked by:** 02 — Supabase SQL Database Schema & Client Module

**Status:** ready-for-agent

- [ ] Next.js 14 initialized with `next.config.mjs` set to `output: 'export'` and `images: { unoptimized: true }` for Cloudflare Pages.
- [ ] Root layout handles locale parameter `[lang]`, setting `dir="rtl"` for Hebrew (`he`) and `dir="ltr"` for English (`en`).
- [ ] Loads Hebrew fonts (`Rubik` / `Assistant`) and sans-serif typography seamlessly.
- [ ] Theme switcher toggles between Dark and Light modes using `next-themes` and CSS root variables.
- [ ] Glassmorphism Header component renders navigation links (Music Blog, Technical AI, About Me), Language Switcher (`HE` / `EN`), and Theme Toggle.
- [ ] Footer component with copyright, branding, and inline newsletter subscription form.
