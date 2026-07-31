import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const VISITOR_ID_KEY = 'ohad_blog_visitor_id';

export const getVisitorId = (): string => {
  if (typeof window === 'undefined') return 'server_visitor';
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
};

// Local storage fallback helper
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

// --- Direct Frontend Supabase Client Calls ---

export const fetchComments = async (postSlug: string, locale: string): Promise<CommentItem[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_slug', postSlug)
        .eq('locale', locale)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as CommentItem[];
      }
      if (error) {
        console.error('Error fetching comments from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Failed to query Supabase comments:', err);
    }
  }
  return getLocalComments(postSlug, locale);
};

export const saveComment = async (comment: Omit<CommentItem, 'id' | 'created_at'>): Promise<CommentItem> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_slug: comment.post_slug,
            locale: comment.locale,
            author_name: comment.author_name,
            content: comment.content,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data as CommentItem;
      }
      if (error) {
        console.error('Error saving comment to Supabase:', error.message);
      }
    } catch (err) {
      console.error('Failed to insert comment into Supabase:', err);
    }
  }
  return saveLocalComment(comment);
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  if (supabase && !commentId.startsWith('local-')) {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        console.error('Error deleting comment from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to delete comment from Supabase:', err);
      return false;
    }
  }
  return true;
};

export const saveSubscriber = async (email: string): Promise<boolean> => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        console.error('Error saving subscriber to Supabase:', error.message);
      } else {
        return true;
      }
    } catch (err) {
      console.error('Failed to insert subscriber into Supabase:', err);
    }
  }
  return saveLocalSubscriber(email);
};

// --- Post & Comment Likes (Strict 1-like per anonymous visitor) ---

export const fetchPostLikes = async (
  postSlug: string,
  locale: string
): Promise<{ count: number; userLiked: boolean }> => {
  const visitorId = getVisitorId();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('visitor_id')
        .eq('post_slug', postSlug)
        .eq('locale', locale);

      if (!error && data) {
        const count = data.length;
        const userLiked = data.some((row) => row.visitor_id === visitorId);
        return { count, userLiked };
      }
    } catch (err) {
      console.error('Error fetching post likes:', err);
    }
  }

  let localLikes: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      localLikes = JSON.parse(localStorage.getItem(`likes_post_${postSlug}_${locale}`) || '[]');
    } catch (e) {}
  }
  return {
    count: localLikes.length,
    userLiked: localLikes.includes(visitorId),
  };
};

export const togglePostLike = async (
  postSlug: string,
  locale: string
): Promise<{ count: number; userLiked: boolean }> => {
  const visitorId = getVisitorId();
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_slug', postSlug)
        .eq('locale', locale)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (existing) {
        await supabase.from('post_likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('post_likes').insert([
          { post_slug: postSlug, locale, visitor_id: visitorId },
        ]);
      }

      return fetchPostLikes(postSlug, locale);
    } catch (err) {
      console.error('Error toggling post like:', err);
    }
  }

  let localLikes: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const key = `likes_post_${postSlug}_${locale}`;
      localLikes = JSON.parse(localStorage.getItem(key) || '[]');
      if (localLikes.includes(visitorId)) {
        localLikes = localLikes.filter((id) => id !== visitorId);
      } else {
        localLikes.push(visitorId);
      }
      localStorage.setItem(key, JSON.stringify(localLikes));
    } catch (e) {}
  }

  return {
    count: localLikes.length,
    userLiked: localLikes.includes(visitorId),
  };
};

export const fetchCommentLikes = async (
  commentIds: string[]
): Promise<Record<string, { count: number; userLiked: boolean }>> => {
  const visitorId = getVisitorId();
  const result: Record<string, { count: number; userLiked: boolean }> = {};

  if (commentIds.length === 0) return result;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id, visitor_id')
        .in('comment_id', commentIds);

      if (!error && data) {
        commentIds.forEach((cId) => {
          const likes = data.filter((row) => row.comment_id === cId);
          result[cId] = {
            count: likes.length,
            userLiked: likes.some((row) => row.visitor_id === visitorId),
          };
        });
        return result;
      }
    } catch (err) {
      console.error('Error fetching comment likes:', err);
    }
  }

  commentIds.forEach((cId) => {
    let localLikes: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const key = `likes_comment_${cId}`;
        localLikes = JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) {}
    }
    result[cId] = {
      count: localLikes.length,
      userLiked: localLikes.includes(visitorId),
    };
  });
  return result;
};

export const toggleCommentLike = async (
  commentId: string
): Promise<{ count: number; userLiked: boolean }> => {
  const visitorId = getVisitorId();
  if (supabase && !commentId.startsWith('local-')) {
    try {
      const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (existing) {
        await supabase.from('comment_likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('comment_likes').insert([
          { comment_id: commentId, visitor_id: visitorId },
        ]);
      }

      const { data } = await supabase
        .from('comment_likes')
        .select('visitor_id')
        .eq('comment_id', commentId);

      const count = data ? data.length : 0;
      const userLiked = data ? data.some((row) => row.visitor_id === visitorId) : false;
      return { count, userLiked };
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  }

  let localLikes: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const key = `likes_comment_${commentId}`;
      localLikes = JSON.parse(localStorage.getItem(key) || '[]');
      if (localLikes.includes(visitorId)) {
        localLikes = localLikes.filter((id) => id !== visitorId);
      } else {
        localLikes.push(visitorId);
      }
      localStorage.setItem(key, JSON.stringify(localLikes));
    } catch (e) {}
  }

  return {
    count: localLikes.length,
    userLiked: localLikes.includes(visitorId),
  };
};


