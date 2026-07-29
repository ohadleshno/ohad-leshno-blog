'use client';

import { useState, useEffect } from 'react';
import { fetchPostLikes, togglePostLike } from '@/lib/supabase';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  postSlug: string;
  lang: 'he' | 'en';
}

export function LikeButton({ postSlug, lang }: LikeButtonProps) {
  const isHe = lang === 'he';
  const [likeCount, setLikeCount] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchPostLikes(postSlug, lang).then(({ count, userLiked }) => {
      if (isMounted) {
        setLikeCount(count);
        setUserLiked(userLiked);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [postSlug, lang]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const nextLiked = !userLiked;
    setUserLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await togglePostLike(postSlug, lang);
      setLikeCount(res.count);
      setUserLiked(res.userLiked);
    } catch (err) {
      console.error('Failed to toggle like', err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiking}
      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border ${
        userLiked
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm shadow-rose-500/10'
          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-500'
      }`}
      title={isHe ? (userLiked ? 'ביטול לייק' : 'לייק למאמר') : (userLiked ? 'Unlike post' : 'Like post')}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-200 ${
          userLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 group-hover:text-rose-500'
        }`}
      />
      <span>
        {isHe ? (userLiked ? 'אהבתי' : 'לייק') : (userLiked ? 'Liked' : 'Like')}
      </span>
      {likeCount > 0 && (
        <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/60 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200">
          {likeCount}
        </span>
      )}
    </button>
  );
}
