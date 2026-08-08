import React from 'react';
import Link from 'next/link';
import { getTechSeriesProjects } from '@/lib/tech';
import { BookOpen, CheckCircle2, Lock } from 'lucide-react';

interface SeriesPlaylistProps {
  seriesId: string;
  seriesTitle?: string;
  currentSlug: string;
  lang: 'he' | 'en';
}

export function SeriesPlaylist({
  seriesId,
  seriesTitle,
  currentSlug,
  lang,
}: SeriesPlaylistProps) {
  const isHe = lang === 'he';
  const posts = getTechSeriesProjects(seriesId, lang, true);

  if (!posts || posts.length === 0) return null;

  const currentOrder = posts.findIndex((p) => p.slug === currentSlug) + 1;
  const title = seriesTitle || posts[0]?.seriesTitle || (isHe ? 'סדרת מאמרים' : 'Article Series');

  return (
    <div className="my-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/90 shadow-sm overflow-hidden p-5 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                {isHe ? 'תוכן העניינים' : 'Series Outline'}
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">•</span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                {isHe ? `${posts.length} חלקים` : `${posts.length} Parts`}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          </div>
        </div>

        {currentOrder > 0 && (
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <span>{isHe ? `חלק ${currentOrder} מתוך ${posts.length}` : `Part ${currentOrder} of ${posts.length}`}</span>
          </div>
        )}
      </div>

      {/* Playlist Grid / List */}
      <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {posts.map((post, index) => {
          const isCurrent = post.slug === currentSlug;
          const epNum = post.seriesOrder ?? (index + 1);

          return (
            <Link
              key={post.slug}
              href={`/${lang}/tech/${post.slug}`}
              className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-sm'
                  : 'bg-white dark:bg-neutral-800/60 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/60 dark:hover:bg-neutral-800'
              }`}
            >
              {/* Part Badge / Icon */}
              <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200/50 dark:border-neutral-700/50">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-rose-950/40'
                      : 'bg-neutral-950/30 group-hover:bg-neutral-950/20'
                  } transition-colors`}
                >
                  {isCurrent ? (
                    <div className="size-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md animate-pulse">
                      <BookOpen className="size-3.5" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-white uppercase bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      #{epNum}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {isHe ? `חלק ${epNum}` : `Part ${epNum}`} • {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
                  </span>

                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white">
                      <CheckCircle2 className="size-3" />
                      {isHe ? 'קורא כעת' : 'Currently Reading'}
                    </span>
                  )}

                  {post.draft && !isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                      <Lock className="size-2.5" />
                      {isHe ? 'טיוטה' : 'Draft'}
                    </span>
                  )}
                </div>

                <h4
                  className={`text-sm sm:text-base font-semibold truncate ${
                    isCurrent
                      ? 'text-rose-950 dark:text-rose-100 font-bold'
                      : 'text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                  } transition-colors`}
                >
                  {post.title}
                </h4>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
