'use client';

import { useState, useEffect } from 'react';
import {
  CommentItem,
  fetchComments,
  saveComment,
  deleteComment,
  fetchCommentLikes,
  toggleCommentLike,
} from '@/lib/supabase';
import { MessageSquare, Send, User, Trash2, Loader2, Heart } from 'lucide-react';

interface CommentsProps {
  postSlug: string;
  lang: 'he' | 'en';
}

export function Comments({ postSlug, lang }: CommentsProps) {
  const isHe = lang === 'he';
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; userLiked: boolean }>>({});
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin secret key exists in URL or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' || localStorage.getItem('blog_admin') === 'true') {
        setIsAdmin(true);
      }
    }

    let isMounted = true;
    setIsLoading(true);
    fetchComments(postSlug, lang).then(async (data) => {
      if (!isMounted) return;
      setComments(data);
      setIsLoading(false);

      if (data.length > 0) {
        const likes = await fetchCommentLikes(data.map((c) => c.id));
        if (isMounted) {
          setCommentLikes(likes);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [postSlug, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const newComment = await saveComment({
      post_slug: postSlug,
      locale: lang,
      author_name: authorName.trim(),
      content: content.trim(),
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentLikes((prev) => ({
      ...prev,
      [newComment.id]: { count: 0, userLiked: false },
    }));
    setContent('');
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const handleCommentLike = async (commentId: string) => {
    const current = commentLikes[commentId] || { count: 0, userLiked: false };
    const nextUserLiked = !current.userLiked;
    const nextCount = nextUserLiked ? current.count + 1 : Math.max(0, current.count - 1);

    // Optimistic UI update
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: { count: nextCount, userLiked: nextUserLiked },
    }));

    try {
      const res = await toggleCommentLike(commentId);
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: res,
      }));
    } catch (err) {
      console.error('Failed to toggle comment like', err);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isHe ? 'תגובות' : 'Comments'} ({comments.length})
        </h3>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 space-y-4">
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          {isHe ? 'הוספת תגובה' : 'Leave a Comment'}
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {isHe ? 'שם מלא' : 'Your Name'} *
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={isHe ? 'לדוגמה: ישראל ישראלי' : 'e.g. Jane Doe'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {isHe ? 'תוכן התגובה' : 'Your Comment'} *
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isHe ? 'מה דעתך על המאמר?' : 'What are your thoughts on this post?'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isHe ? 'פרסום תגובה' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isHe ? 'טוען תגובות...' : 'Loading comments...'}</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {isHe ? 'אין תגובות עדיין. היו הראשונים להגיב!' : 'No comments yet. Be the first to comment!'}
          </p>
        ) : (
          comments.map((comment) => {
            const likeData = commentLikes[comment.id] || { count: 0, userLiked: false };
            return (
              <div
                key={comment.id}
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        likeData.userLiked
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/5'
                      }`}
                      title={isHe ? (likeData.userLiked ? 'ביטול לייק' : 'לייק לתגובה') : (likeData.userLiked ? 'Unlike comment' : 'Like comment')}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likeData.userLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
                        }`}
                      />
                      <span>{likeData.count > 0 ? likeData.count : ''}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed ps-9">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
