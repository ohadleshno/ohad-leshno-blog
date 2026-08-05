import React from 'react';
import Link from 'next/link';
import { getTechSeriesProjects } from '@/lib/tech';
import { BookOpen, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface SeriesBannerNavProps {
  seriesId: string;
  seriesTitle?: string;
  currentSlug: string;
  lang: 'he' | 'en';
}

export function SeriesBannerNav({
  seriesId,
  seriesTitle,
  currentSlug,
  lang,
}: SeriesBannerNavProps) {
  const isHe = lang === 'he';
  const posts = getTechSeriesProjects(seriesId, lang, true);

  if (!posts || posts.length === 0) return null;

  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) return null;

  const currentOrder = (posts[currentIndex]?.seriesOrder) ?? (currentIndex + 1);
  const title = seriesTitle || posts[0]?.seriesTitle || (isHe ? 'סדרת מאמרים' : 'Article Series');
  const playlistUrl = `/${lang}/tech/series/${seriesId}`;

  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="my-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 p-5 sm:p-7 space-y-5 shadow-sm">
      {/* Series Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              {isHe ? 'סדרת נושא' : 'Subject Series'}
            </span>
            <h3 className="text-lg font-bold font-display text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            {isHe ? `חלק ${currentOrder} מתוך ${posts.length}` : `Part ${currentOrder} of ${posts.length}`}
          </span>
          <Link
            href={playlistUrl}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            <BookOpen className="size-3.5" />
            {isHe ? 'לכל הנושא' : 'View Subject'}
          </Link>
        </div>
      </div>

      {/* Prev / Next Part Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prevPost ? (
          <Link
            href={`/${lang}/tech/${prevPost.slug}`}
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-left"
            dir="ltr"
          >
            <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ChevronLeft className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-neutral-400">
                {isHe ? 'החלק הקודם' : 'Previous Part'}
              </div>
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {prevPost.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextPost ? (
          <Link
            href={`/${lang}/tech/${nextPost.slug}`}
            className="group flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 hover:border-rose-400 dark:hover:border-rose-600 transition-all text-right justify-end"
            dir="ltr"
          >
            <div className="min-w-0 flex-1 text-right">
              <div className="text-[10px] uppercase font-bold text-neutral-400">
                {isHe ? 'החלק הבא' : 'Next Part'}
              </div>
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {nextPost.title}
              </div>
            </div>
            <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ChevronRight className="size-4" />
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </div>
  );
}
