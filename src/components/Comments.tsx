'use client';

import { useState, useEffect } from 'react';
import { CommentItem, getLocalComments, saveLocalComment } from '@/lib/supabase';
import { MessageSquare, Send, User, Trash2 } from 'lucide-react';

interface CommentsProps {
  postSlug: string;
  lang: 'he' | 'en';
}

export function Comments({ postSlug, lang }: CommentsProps) {
  const isHe = lang === 'he';
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin secret key exists in URL or localStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' || localStorage.getItem('blog_admin') === 'true') {
        setIsAdmin(true);
      }
    }

    // Load initial comments (from local storage fallback / Supabase)
    const initialComments = getLocalComments(postSlug, lang);
    setComments(initialComments);
  }, [postSlug, lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const newComment = saveLocalComment({
      post_slug: postSlug,
      locale: lang,
      author_name: authorName.trim(),
      content: content.trim(),
    });

    setComments((prev) => [newComment, ...prev]);
    setContent('');
    setIsSubmitting(false);
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
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
          <Send className="w-4 h-4" />
          {isHe ? 'פרסום תגובה' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {isHe ? 'אין תגובות עדיין. היו הראשונים להגיב!' : 'No comments yet. Be the first to comment!'}
          </p>
        ) : (
          comments.map((comment) => (
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
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed ps-9">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
