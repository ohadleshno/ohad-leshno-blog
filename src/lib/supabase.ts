// Supabase client initialization & local storage fallback

export interface CommentItem {
  id: string;
  post_slug: string;
  locale: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface SubscriberItem {
  id: string;
  email: string;
  created_at: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Fallback in-memory / localStorage helper for local development without Supabase keys
const LOCAL_COMMENTS_KEY = 'ohad_blog_local_comments';
const LOCAL_SUBSCRIBERS_KEY = 'ohad_blog_local_subscribers';

export const getLocalComments = (postSlug: string, locale: string): CommentItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
    const comments: CommentItem[] = raw ? JSON.parse(raw) : [];
    return comments.filter((c) => c.post_slug === postSlug && c.locale === locale);
  } catch (e) {
    return [];
  }
};

export const saveLocalComment = (comment: Omit<CommentItem, 'id' | 'created_at'>): CommentItem => {
  const newItem: CommentItem = {
    ...comment,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_COMMENTS_KEY);
      const comments: CommentItem[] = raw ? JSON.parse(raw) : [];
      comments.unshift(newItem);
      localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
    } catch (e) {
      console.error('Error saving local comment', e);
    }
  }
  return newItem;
};

export const saveLocalSubscriber = (email: string): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_SUBSCRIBERS_KEY);
      const subs: string[] = raw ? JSON.parse(raw) : [];
      if (!subs.includes(email)) {
        subs.push(email);
        localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(subs));
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
};
