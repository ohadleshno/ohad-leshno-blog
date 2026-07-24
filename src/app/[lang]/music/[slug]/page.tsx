import { getAllPostSlugs, getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { MailingList } from '@/components/MailingList';
import { Clock, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <article className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back button */}
      <Link
        href={`/${lang}/music`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {isHe ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {isHe ? 'חזרה לכל המאמרים' : 'Back to All Articles'}
      </Link>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
          </span>
        </div>
      </header>

      {/* Hero Cover Image (rendered only if not already in contentHtml) */}
      {post.coverImage && !post.contentHtml.includes(post.coverImage) && (
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
      <SocialShare title={post.title} url={currentUrl} isHe={isHe} />

      {/* Mailing List Section */}
      <MailingList lang={lang} />

      {/* Comments Section */}
      <Comments postSlug={post.slug} lang={lang} />
    </article>
  );
}
