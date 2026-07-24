# Project Context & Glossary: Ohad Leshno Blog

## Domain Glossary

- **Music Post**: A blog post migrated from Wix centered around music analysis, culture, or personal reflections (written originally in Hebrew, translated to English).
- **Technical AI Post / Project**: A project showcase card and accompanying deep-dive design document detailing an AI system or software project created by Ohad, including project links, architecture write-ups, and code insights.
- **Locale / Language**: The language context for page rendering (`he` for Hebrew with RTL layout, `en` for English with LTR layout).
- **Theme Mode**: Visual presentation theme (`dark` vs `light`), synced across client state and persisted via `next-themes`.
- **Comment**: A visitor-submitted message attached to a post slug and locale, stored in the Supabase `comments` table.
- **Subscriber**: A visitor's email address collected for mailing list notifications, stored in the Supabase `subscribers` table.

## Architectural Decisions

1. **Framework & Hosting Target**: Next.js 14 App Router configured for Static Site Generation (`output: 'export'`), specifically targeted for deployment on **Cloudflare Pages** (unlimited free bandwidth, ultra-fast Israel edge nodes).
2. **Content Storage**: Markdown (`.md` / `.mdx`) files with YAML frontmatter located in `content/music-blog/{he,en}/`, `content/tech-blog/{he,en}/`, and `content/about/{he,en}/`.
3. **Database Seam**: Supabase REST client used exclusively for dynamic client-side interactions (Comments submission & retrieval, Mailing List email capture).
4. **Internationalization (i18n)**: Locale-prefixed route structure `/[lang]/...` enforcing `dir="rtl"` for Hebrew (`he`) and `dir="ltr"` for English (`en`).
