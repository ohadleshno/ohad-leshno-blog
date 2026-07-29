-- Supabase Database Schema & RLS Policies for Ohad Leshno Blog

-- 1. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug TEXT NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'he',
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_post_locale ON public.comments (post_slug, locale);

-- Enable RLS & Set Public Access Policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public insert access to comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public delete access to comments" ON public.comments;

CREATE POLICY "Allow public read access to comments" ON public.comments FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to comments" ON public.comments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete access to comments" ON public.comments FOR DELETE TO public USING (true);

-- 2. Subscribers Table (Mailing List)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert access to subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert access to subscribers" ON public.subscribers FOR INSERT TO public WITH CHECK (true);

-- 3. Post Likes Table (Strictly 1-like per anonymous visitor_id)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug TEXT NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'he',
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_post_visitor_like UNIQUE (post_slug, locale, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes ON public.post_likes (post_slug, locale);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to post_likes" ON public.post_likes;
DROP POLICY IF EXISTS "Allow public insert access to post_likes" ON public.post_likes;
DROP POLICY IF EXISTS "Allow public delete access to post_likes" ON public.post_likes;

CREATE POLICY "Allow public read access to post_likes" ON public.post_likes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to post_likes" ON public.post_likes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete access to post_likes" ON public.post_likes FOR DELETE TO public USING (true);

-- 4. Comment Likes Table (Strictly 1-like per anonymous visitor_id)
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_comment_visitor_like UNIQUE (comment_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes ON public.comment_likes (comment_id);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to comment_likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Allow public insert access to comment_likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Allow public delete access to comment_likes" ON public.comment_likes;

CREATE POLICY "Allow public read access to comment_likes" ON public.comment_likes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to comment_likes" ON public.comment_likes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete access to comment_likes" ON public.comment_likes FOR DELETE TO public USING (true);
