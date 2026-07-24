-- Supabase Database Schema for Ohad Leshno Blog

-- 1. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug TEXT NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'he',
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by post and locale
CREATE INDEX IF NOT EXISTS idx_comments_post_locale ON public.comments (post_slug, locale);

-- Enable Row Level Security (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to comments
CREATE POLICY "Allow public read access to comments" 
ON public.comments FOR SELECT 
USING (true);

-- Allow public insert access to comments
CREATE POLICY "Allow public insert access to comments" 
ON public.comments FOR INSERT 
WITH CHECK (true);

-- 2. Subscribers Table (Mailing List)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for subscriber email lookup
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers (email);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public insert access for email subscriptions
CREATE POLICY "Allow public insert access to subscribers" 
ON public.subscribers FOR INSERT 
WITH CHECK (true);

-- Sample Data (Optional Seed)
INSERT INTO public.comments (post_slug, locale, author_name, content) 
VALUES ('billy-joel-the-stranger', 'he', 'יוסי', 'כתיבה נפלאה וניתוח מרתק של האלבום!')
ON CONFLICT DO NOTHING;
