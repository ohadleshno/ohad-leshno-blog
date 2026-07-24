# 07 — Complete SEO Suite & Cloudflare Pages Deployment Config

**What to build:**
Complete SEO and syndication suite (dynamic OpenGraph preview cards, JSON-LD rich snippet schema, canonical URLs, `/sitemap.xml`, and `/rss.xml`) plus Cloudflare Pages static export configuration (`wrangler.toml`, `.env.example`, deployment instructions).

**Blocked by:** 06 — Technical AI Blog, Project Showcase & About Me Pages

**Status:** ready-for-agent

- [ ] `src/lib/seo.ts` constructs dynamic OpenGraph images/tags, Twitter summary cards, and canonical URLs for every route.
- [ ] Article pages inject JSON-LD `BlogPosting` structured data for search engine rich results.
- [ ] Build script generates dynamic `/sitemap.xml` and `/rss.xml` containing all Hebrew and English posts.
- [ ] `wrangler.toml` and `.env.example` created for zero-cost Cloudflare Pages deployment.
- [ ] `npm run build` executes cleanly with zero static export errors, producing static output folder `out/`.
