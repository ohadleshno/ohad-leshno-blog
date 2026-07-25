---
name: deploy-to-cloudflare
description: Deploy Next.js static site (ohadleshno.com) to Cloudflare Pages via Wrangler CLI and Cloudflare REST API with custom domain configuration and Supabase integration.
---

# Deploying to Cloudflare Pages (ohadleshno.com)

This document details the complete production architecture, build scripts, deployment commands, and DNS routing setup used to deploy this blog to Cloudflare Pages.

---

## 1. Architecture Overview

- **Frontend & Static Site Generation**: Next.js 14 App Router configured with `output: 'export'` in [next.config.mjs](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/next.config.mjs). Static HTML/CSS/JS assets are compiled into the `./out` directory.
- **Hosting & CDN**: Cloudflare Pages (`ohad-leshno-blog.pages.dev`), backed by Cloudflare edge nodes.
- **Custom Domain**: Registered at Namecheap (`ohadleshno.com`), managed via Cloudflare DNS.
- **Database & Dynamic Features**: Supabase REST client for dynamic visitor comments and mailing list subscriptions with graceful `localStorage` fallbacks.

---

## 2. Build Pipeline & Script Execution

Before deploying to Cloudflare Pages, run the full migration and build pipeline:

```bash
npx tsx scripts/parse-wix-posts.ts && npx tsx scripts/generate-syndication.ts && npx next build
```

### Key Gotchas & Solutions Handled
- **Slug Length & OS Limits (`ENAMETOOLONG`)**: When Next.js pre-renders static routes for Hebrew post titles, long Hebrew strings URL-encode to `%D7%...` (6 characters per Hebrew letter). In [parse-wix-posts.ts](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/scripts/parse-wix-posts.ts), post slugs are truncated to a maximum of 20 characters (`slug = slug.substring(0, 20).replace(/-+$/, '')`) to prevent filesystem path errors.
- **Clean Builds**: [parse-wix-posts.ts](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/scripts/parse-wix-posts.ts) removes stale markdown directories before re-generation (`fs.rmSync(musicHeDir, { recursive: true, force: true })`).
- **Asset Paths**: All images in [src/app](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/src/app) must use root-relative paths like `/ohad_leshno.avif` (NOT `/public/ohad_leshno.avif`), as static export serves `public/` at root.

---

## 3. Wrangler Configuration ([wrangler.toml](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/wrangler.toml))

Ensure [wrangler.toml](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/wrangler.toml) is clean and specifies only Pages options:

```toml
name = "ohad-leshno-blog"
pages_build_output_dir = "out"
compatibility_date = "2026-07-24"
```

*Note: Do NOT include legacy Workers Site tables like `[site] bucket = "./out"`, as Wrangler Pages validation rejects them.*

---

## 4. Cloudflare Pages Deployment Commands

### Step 4.1: Login to Cloudflare CLI
```bash
npx wrangler login
```
Verify authentication:
```bash
npx wrangler whoami
```

### Step 4.2: Create Project (One-time setup)
```bash
npx wrangler pages project create ohad-leshno-blog --production-branch main
```

### Step 4.3: Deploy Output Directory
```bash
npx wrangler pages deploy out --project-name=ohad-leshno-blog
```

---

## 5. Custom Domain Setup (`ohadleshno.com`)

### Step 5.1: Attach Domain to Pages Project via Cloudflare API
Cloudflare Pages custom domain binding via REST API:

```bash
# Attach root domain
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/ohad-leshno-blog/domains" \
  -H "Authorization: Bearer {oauth_token}" \
  -H "Content-Type: application/json" \
  --data '{"name":"ohadleshno.com"}'

# Attach www subdomain
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/ohad-leshno-blog/domains" \
  -H "Authorization: Bearer {oauth_token}" \
  -H "Content-Type: application/json" \
  --data '{"name":"www.ohadleshno.com"}'
```

### Step 5.2: Configure DNS Records in Cloudflare
In Cloudflare Dashboard -> **DNS** -> **Records** for `ohadleshno.com`:

1. **Root Domain Record**:
   - Type: `CNAME`
   - Name: `@` (or `ohadleshno.com`)
   - Target: `ohad-leshno-blog.pages.dev`
   - Proxy Status: `Proxied` (Orange cloud)

2. **WWW Subdomain Record**:
   - Type: `CNAME`
   - Name: `www`
   - Target: `ohad-leshno-blog.pages.dev`
   - Proxy Status: `Proxied` (Orange cloud)

---

## 6. Environment Variables & Supabase Setup

Set the following variables locally in [.env.local](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/.env.local) and in Cloudflare Dashboard under **Workers & Pages** -> **`ohad-leshno-blog`** -> **Settings** -> **Environment variables**:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://zvxtqlwsrvfisnhfupmo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project `anon` public key

Database table definitions are maintained in [supabase/schema.sql](file:///Users/ohadleshno/projects/Ohad%20leshno%20blog/supabase/schema.sql).
