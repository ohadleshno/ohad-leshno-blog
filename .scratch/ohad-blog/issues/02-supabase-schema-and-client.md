# 02 — Supabase SQL Database Schema & Client Module

**What to build:**
The SQL database schema definition (`supabase/schema.sql`) for creating the `comments` table (`id`, `post_slug`, `locale`, `author_name`, `content`, `created_at`) and `subscribers` table (`id`, `email`, `created_at`) with Row Level Security (RLS) policies allowing public inserts & reads. The TypeScript Supabase client module (`src/lib/supabase.ts`) providing local fallback state when credentials are not configured yet.

**Blocked by:** 01 — Wix JSON & About Page Migration Parser Script

**Status:** ready-for-agent

- [ ] `supabase/schema.sql` defines `comments` and `subscribers` tables with indexes on `post_slug` and `locale`.
- [ ] Includes Row Level Security (RLS) policies for anonymous public reads and inserts on both tables.
- [ ] `src/lib/supabase.ts` exports a configured Supabase client using `@supabase/supabase-js`.
- [ ] Provides fallback local storage/in-memory helper when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set.
- [ ] Includes sample SQL seed script for testing locally.
