import type { Metadata } from 'next';
import { getAllPostSlugs, getPostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { LikeButton } from '@/components/LikeButton';
import { MailingList } from '@/components/MailingList';
import { RelatedPosts } from '@/components/RelatedPosts';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

export function generateMetadata({
  params,
}: {
  params: { lang: 'he' | 'en'; slug: string };
}): Metadata {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const post = getPostData(params.slug, lang);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const coverImageUrl = post.coverImage
    ? (post.coverImage.startsWith('http') ? post.coverImage : `https://ohadleshno.com${post.coverImage.replace(/^\/public/, '')}`)
    : 'https://ohadleshno.com/hero-cover.webp';

  const canonicalUrl = `https://ohadleshno.com/${lang}/music/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        he: `https://ohadleshno.com/he/music/${post.slug}`,
        en: `https://ohadleshno.com/en/music/${post.slug}`,
      },
    },
    openGraph: {
      title: `${post.title} | Ohad Leshno`,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'Ohad Leshno Blog',
      locale: isHe ? 'he_IL' : 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: ['Ohad Leshno'],
      images: [
        {
          url: coverImageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Ohad Leshno`,
      description: post.excerpt,
      images: [coverImageUrl],
    },
  };
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Ohad Leshno',
      url: 'https://ohadleshno.com',
    },
    url: currentUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-6 sm:p-12 space-y-8">
        {/* Back button */}
        <Link
          href={`/${lang}/music`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-wider"
        >
          {isHe ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
          {isHe ? 'חזרה לכל המאמרים' : 'Back to All Essays'}
        </Link>

        {/* Header */}
        <header className="space-y-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
            {isHe ? 'בלוג מוזיקה ותרבות' : 'Music & Culture Blog'}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 dark:text-neutral-50 leading-[1.2]">
            {post.title}
          </h1>

          <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium pt-1">
            {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            • {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
          </div>
        </header>

        {/* Hero Cover Image (rendered only if not already in contentHtml) */}
        {post.coverImage && !post.contentHtml.includes('<img') && !post.contentHtml.includes(post.coverImage) && (
          <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative bg-neutral-100 dark:bg-neutral-900">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article HTML Content */}
        <div
          className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Social Share & Like Buttons */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SocialShare title={post.title} url={currentUrl} isHe={isHe} />
          <LikeButton postSlug={post.slug} lang={lang} />
        </div>

        {/* Mailing List Section */}
        <MailingList lang={lang} />

        {/* Related Posts */}
        <RelatedPosts currentSlug={post.slug} lang={lang} category="music" />

        {/* Comments Section */}
        <Comments postSlug={post.slug} lang={lang} />
      </article>
    </div>
  );
}
