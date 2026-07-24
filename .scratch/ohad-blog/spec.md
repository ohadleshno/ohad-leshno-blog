# Specification: Ohad Leshno Blog (Multi-Language Static Blog)

## Problem Statement
Ohad needs a modern, highly performant static blog deployed on Cloudflare Pages to publish music analysis articles (migrated from Wix) and technical write-ups on AI projects. The site requires multi-language support (Hebrew RTL & English LTR), dark/light theme switching, full SEO optimization, open guest comments, and email newsletter subscriptions.

## Solution
Build a Next.js 14 App Router static export web application configured for Cloudflare Pages deployment (`output: 'export'`). The system includes:
1. **Migration & Scraping Engine**: TypeScript parser converting `wix-blog-posts-detailed.json` and Wix About page into structured Markdown files for Hebrew (`he`) and English (`en`).
2. **Database Backend**: Supabase SQL schema (`supabase/schema.sql`) for `comments` and `subscribers` tables with RLS policies, paired with client-side interactive modules.
3. **Core App Shell & Home Page**:
   - Next.js App Router with dynamic locale routing `/[lang]`, `dir="rtl"` for Hebrew and `dir="ltr"` for English.
   - `next-themes` Dark/Light switcher and glassmorphic navigation header.
   - **Home Landing Page (`/[lang]`)**: Hero banner with bio/headline, featured Music Blog posts grid, top Technical AI Project showcase cards, and inline newsletter subscription form.
4. **Content Modules**:
   - Music Blog (`/[lang]/music` & `/[lang]/music/[slug]`) articles with YouTube video embeds and images.
   - Technical AI Blog (`/[lang]/tech` & `/[lang]/tech/[slug]`) project cards with live project links and deep-dive architecture design documents.
   - About Me page (`/[lang]/about`).
5. **Interactive Modules**:
   - Guest commenting (Name + Comment) with immediate visibility and admin delete capability.
   - Newsletter mailing list subscription.
6. **SEO & Deployment Suite**:
   - OpenGraph cards, JSON-LD rich snippets, dynamic `/sitemap.xml`, and dynamic `/rss.xml`.
   - Cloudflare Pages static export verification and deployment config (`wrangler.toml` / `.env.example`).

## Home Page Architecture (`/[lang]`)

The Home Page serves as the central hub of the blog:
- **Hero Section**: Personal introduction, avatar photo, mission statement ("Music, Culture & AI Engineering"), and primary call-to-action buttons.
- **Featured Music Blog Section**: Responsive card grid of the latest migrated Wix posts showing cover image, Hebrew/English title, excerpt, date, and reading time.
- **Featured Technical AI Projects Section**: Showcase cards highlighting top AI engineering projects with live demo links, tech stack badges, and deep-dive design docs.
- **Newsletter Subscription Block**: Embedded inline form saving subscriber emails to Supabase.

## User Stories

1. As a reader in Israel, I want the blog home page to load natively in Hebrew with right-to-left (RTL) formatting and clear Hebrew typography (`Rubik`/`Assistant`).
2. As an international reader, I want to toggle the site to English (LTR), updating the home page hero, music posts, and tech project cards into English.
3. As a visitor reading at night, I want to switch between Dark and Light mode with persistent state.
4. As a new visitor landing on the home page, I want to immediately see Ohad's latest music posts and AI projects side-by-side with clear navigation links.
5. As a blog reader, I want to submit a comment (Name + Comment) without needing GitHub or OAuth.
6. As an admin, I want an admin delete key/action to moderate or delete inappropriate comments.
7. As a reader interested in updates, I want to submit my email address in a subscription form on the home page or post pages.
8. As a technical reader, I want to view AI project cards with live project links and read detailed architecture design docs with syntax-highlighted code.
9. As a search engine crawler, I want properly formatted OpenGraph meta tags, JSON-LD schemas, sitemap, and RSS feed for SEO indexing.
10. As a site owner, I want a zero-cost, automated static deployment to Cloudflare Pages.

## Implementation Decisions

- **Framework**: Next.js 14 App Router configured with `output: 'export'` and `images: { unoptimized: true }` for Cloudflare Pages static hosting.
- **Deployment Config**: `wrangler.toml` and `.env.example` defining build settings for Cloudflare Pages.
- **Database Schema**: `supabase/schema.sql` defining `comments` and `subscribers` with public RLS policies.
- **Directory Structure**:
  - `content/music-blog/{he,en}/*.md`
  - `content/tech-blog/{he,en}/*.md`
  - `content/about/{he,en}.md`
  - `supabase/schema.sql`

## Testing Decisions

- **Home Page Verification**: Ensure home page renders hero banner, latest music posts, tech project cards, and newsletter signup seamlessly in both RTL (Hebrew) and LTR (English).
- **Wix Parser Test**: Verify all Draft.js blocks, YouTube embeds, links, and frontmatter attributes are transformed into Markdown.
- **Build Verification**: Run `npm run build` to confirm zero static export errors (`out/` output folder).
