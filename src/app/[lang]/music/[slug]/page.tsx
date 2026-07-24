import { getAllPostSlugs, getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { MailingList } from '@/components/MailingList';
import { Clock, Calendar, ArrowLeft, ArrowRight, Disc } from 'lucide-react';
import Link from 'next/link';

export function generateStaticParams() {
  const heSlugs = getAllPostSlugs('he').flatMap((slug) => [
    { lang: 'he', slug },
    { lang: 'he', slug: encodeURIComponent(slug) },
    { lang: 'he', slug: decodeURIComponent(slug) },
  ]);
  const enSlugs = getAllPostSlugs('en').flatMap((slug) => [
    { lang: 'en', slug },
    { lang: 'en', slug: encodeURIComponent(slug) },
    { lang: 'en', slug: decodeURIComponent(slug) },
  ]);

  const allParams = [...heSlugs, ...enSlugs];
  const uniqueMap = new Map();
  for (const p of allParams) {
    uniqueMap.set(`${p.lang}:${p.slug}`, p);
  }
  return Array.from(uniqueMap.values());
}

export default function MusicPostDetail({
  params,
}: {
  params: { lang: 'he' | 'en'; slug: string };
}) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const post = getPostData(params.slug, lang);

  if (!post) {
    notFound();
  }

  const currentUrl = `https://ohadleshno.com/${lang}/music/${post.slug}`;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      <article className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-6 sm:p-12 space-y-8">
        {/* Back button */}
        <Link
          href={`/${lang}/music`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {isHe ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {isHe ? 'חזרה לכל המאמרים' : 'Back to All Articles'}
        </Link>

        {/* Header */}
        <header className="space-y-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold">
            <Disc className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isHe ? 'בלוג מוזיקה ותרבות' : 'Music & Culture Blog'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 text-indigo-500" />
              {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-indigo-500" />
              {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
            </span>
          </div>
        </header>

        {/* Hero Cover Image (rendered only if not already in contentHtml) */}
        {post.coverImage && !post.contentHtml.includes('<img') && !post.contentHtml.includes(post.coverImage) && (
          <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article HTML Content */}
        <div
          className="prose dark:prose-invert max-w-none prose-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Social Share Buttons */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <SocialShare title={post.title} url={currentUrl} isHe={isHe} />
        </div>

        {/* Mailing List Section */}
        <MailingList lang={lang} />

        {/* Comments Section */}
        <Comments postSlug={post.slug} lang={lang} />
      </article>
    </div>
  );
}
