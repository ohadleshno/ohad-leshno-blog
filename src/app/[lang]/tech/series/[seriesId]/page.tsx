import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTechSeriesProjects } from '@/lib/tech';
import { ArrowLeft, ArrowRight, BookOpen, ListVideo, Play, Lock } from 'lucide-react';

export function generateStaticParams() {
  const seriesIds = ['context-layer'];
  const langs: ('he' | 'en')[] = ['he', 'en'];

  return langs.flatMap((lang) =>
    seriesIds.map((seriesId) => ({
      lang,
      seriesId,
    }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { lang: 'he' | 'en'; seriesId: string };
}): Metadata {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const posts = getTechSeriesProjects(params.seriesId, lang, true);

  if (!posts || posts.length === 0) {
    return { title: 'Series Not Found' };
  }

  const title = posts[0]?.seriesTitle || (isHe ? 'סדרת מאמרים' : 'Article Series');
  const description = isHe
    ? `סדרת מאמרים בנושא ${title} מאת אוהד לשנו`
    : `Technical article series on ${title} by Ohad Leshno`;

  return {
    title: `${title} | Ohad Leshno`,
    description,
    openGraph: {
      title: `${title} | Ohad Leshno`,
      description,
      images: [posts[0]?.coverImage || '/hero-cover.webp'],
    },
  };
}

export default function SeriesPlaylistPage({
  params,
}: {
  params: { lang: 'he' | 'en'; seriesId: string };
}) {
  const lang = params.lang || 'he';
  const seriesId = params.seriesId;
  const isHe = lang === 'he';
  const posts = getTechSeriesProjects(seriesId, lang, true);

  if (!posts || posts.length === 0) {
    notFound();
  }

  const seriesTitle = posts[0]?.seriesTitle || (isHe ? 'סדרת מאמרים' : 'Article Series');
  const firstSlug = posts[0]?.slug;

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href={`/${lang}/tech`}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          {isHe ? (
            <>
              <ArrowRight className="size-4" />
              <span>בחזרה לכל המאמרים</span>
            </>
          ) : (
            <>
              <ArrowLeft className="size-4" />
              <span>Back to Tech Articles</span>
            </>
          )}
        </Link>
      </div>

      {/* Playlist Hero Section */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Stacked Hero Cover */}
        <div className="w-full md:w-80 shrink-0 space-y-3">
          <div className="relative pt-3 px-2">
            <div className="absolute top-0 left-6 right-6 h-4 rounded-t-xl bg-neutral-300 dark:bg-neutral-800 opacity-60" />
            <div className="absolute top-1.5 left-4 right-4 h-4 rounded-t-xl bg-neutral-400 dark:bg-neutral-700 opacity-80" />
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-900 shadow-md border border-neutral-200/80 dark:border-neutral-800">
              <img
                src={posts[0]?.coverImage || '/hero-cover.webp'}
                alt={seriesTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/85 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/10" dir="ltr">
                <BookOpen className="size-3.5" />
                <span>{posts.length} {isHe ? 'מאמרים' : posts.length === 1 ? 'post' : 'posts'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Series Overview */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="size-3.5" />
            <span>{isHe ? `סדרה בת ${posts.length} חלקים` : `${posts.length}-Part Series`}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
            {seriesTitle}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
            {isHe
              ? 'סדרת מאמרים טכנית מקיפה הבוחנת את הארכיטקטורה, המדידה, השכבות וההנדסה של Context Layers עבור AI Agents.'
              : 'A comprehensive technical series exploring the architecture, evaluation, 4 functional layers, and data engineering of Context Layers for AI Agents.'}
          </p>

          {firstSlug && (
            <div className="pt-2">
              <Link
                href={`/${lang}/tech/${firstSlug}`}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors inline-flex items-center gap-2 shadow-md shadow-rose-600/20"
              >
                <BookOpen className="size-4" />
                {isHe ? 'התחל קריאה (חלק 1)' : 'Start Reading (Part 1)'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {isHe ? `כל המאמרים בסדרה (${posts.length})` : `All Posts (${posts.length})`}
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            {isHe ? 'מסודר לפי סדר הפרקים' : 'Ordered by Part'}
          </span>
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => {
            const epNum = post.seriesOrder ?? (index + 1);

            return (
              <div
                key={post.slug}
                className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-sm"
              >
                {/* Image Thumbnail */}
                <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white backdrop-blur-sm text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    #{epNum}
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      {isHe ? `חלק ${epNum}` : `Part ${epNum}`}
                    </span>

                    {post.draft && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                        <Lock className="size-2.5" />
                        {isHe ? 'טיוטה' : 'Draft'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Action Link */}
                <Link
                  href={`/${lang}/tech/${post.slug}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:hover:bg-rose-600 dark:hover:border-rose-600 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <BookOpen className="size-3.5" />
                  <span>{isHe ? 'לקריאה' : 'Read Post'}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
