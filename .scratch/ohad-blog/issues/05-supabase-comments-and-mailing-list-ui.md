# 05 — Supabase Guest Comments UI & Mailing List Subscription

**What to build:**
Interactive client components for guest commenting (`Comments.tsx`) and email subscription capture (`MailingList.tsx`) powered by the Supabase REST client. Allows visitors to post comments (Name + Message) without requiring a GitHub/OAuth account, and submit email addresses for newsletter updates. Includes optional admin delete key toggle for comment deletion.

**Blocked by:** 04 — Markdown Article Rendering Engine & Wix Media Embeds

**Status:** ready-for-agent

- [ ] `Comments.tsx` component fetches comments for current `post_slug` and `locale`, displays formatted comment list, and provides submission form (Name + Comment) with instant optimistic update and error handling.
- [ ] Includes optional admin moderation delete trigger (via URL secret key or localStorage admin token).
- [ ] `MailingList.tsx` component renders newsletter subscription box with email input validation and instant subscriber save.
- [ ] Full RTL (Hebrew) and LTR (English) localization for all input placeholders, submit buttons, and status alerts.
