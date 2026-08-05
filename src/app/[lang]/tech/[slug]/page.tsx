import type { Metadata } from 'next';
import { getAllTechSlugs, getTechProjectData } from '@/lib/tech';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { LikeButton } from '@/components/LikeButton';
import { ExternalLink, ArrowLeft, ArrowRight, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { RelatedPosts } from '@/components/RelatedPosts';
import { DraftGuard } from '@/components/DraftGuard';
import { SeriesBannerNav } from '@/components/SeriesBannerNav';

export function generateStaticParams() {
  const heSlugs = getAllTechSlugs('he').flatMap((slug) => [
    { lang: 'he', slug },
    { lang: 'he', slug: encodeURIComponent(slug) },
    { lang: 'he', slug: decodeURIComponent(slug) },
  ]);
  const enSlugs = getAllTechSlugs('en').flatMap((slug) => [
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
  const project = getTechProjectData(params.slug, lang);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  const coverImageUrl = project.coverImage
    ? (project.coverImage.startsWith('http') ? project.coverImage : `https://ohadleshno.com${project.coverImage.replace(/^\/public/, '')}`)
    : 'https://ohadleshno.com/nehorai-hero.webp';

  const canonicalUrl = `https://ohadleshno.com/${lang}/tech/${project.slug}`;

  const metadata: Metadata = {
    title: project.title,
    description: project.excerpt,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        he: `https://ohadleshno.com/he/tech/${project.slug}`,
        en: `https://ohadleshno.com/en/tech/${project.slug}`,
      },
    },
    openGraph: {
      title: `${project.title} | Ohad Leshno`,
      description: project.excerpt,
      url: canonicalUrl,
      siteName: 'Ohad Leshno Blog',
      locale: isHe ? 'he_IL' : 'en_US',
      type: 'article',
      publishedTime: project.date,
      authors: ['Ohad Leshno'],
      images: [
        {
          url: coverImageUrl,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Ohad Leshno`,
      description: project.excerpt,
      images: [coverImageUrl],
    },
  };

  if (project.draft) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

export default function TechProjectDetail({
  params,
}: {
  params: { lang: 'he' | 'en'; slug: string };
}) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const project = getTechProjectData(params.slug, lang);

  if (!project) {
    notFound();
  }

  const currentUrl = `https://ohadleshno.com/${lang}/tech/${project.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: project.title,
    description: project.excerpt,
    datePublished: project.date,
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

  const articleContent = (
    <div className="max-w-4xl mx-auto py-3 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-4 sm:p-10 space-y-5 sm:space-y-8">
        {/* Draft Banner */}
        {project.draft && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/40 px-5 py-3.5 flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-md bg-amber-400 dark:bg-amber-500 text-amber-950 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 leading-none">
              {isHe ? 'טיוטה' : 'Draft'}
            </span>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              {isHe
                ? 'מצב תצוגה מקדימה לטיוטה: מאמר זה נמצא כעת במצב טיוטה ונגיש דרך קישור תצוגה מקדימה מיוחד.'
                : 'Draft Preview Mode: This post is currently in draft mode and is accessed via special preview link.'}
            </p>
          </div>
        )}

        {/* Back button */}
        <Link
          href={`/${lang}/tech`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-wider"
        >
          {isHe ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
          {isHe ? 'חזרה לכל פרויקטי ה-AI' : 'Back to All AI Projects'}
        </Link>

        {/* Header */}
        <header className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
            {isHe ? 'פרויקט AI וארכיטקטורה' : 'AI & Systems Project'}
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 dark:text-neutral-50 leading-snug">
            {project.title}
          </h1>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {new Date(project.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
            </span>

            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="size-3.5" />
                {isHe ? 'מעבר לפרויקט' : 'View Live Project'}
              </a>
            )}
          </div>
        </header>

        {/* Markdown Content */}
        <div
          className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
        />

        <MermaidRenderer />

        {project.series && (
          <SeriesBannerNav
            seriesId={project.series}
            seriesTitle={project.seriesTitle}
            currentSlug={project.slug}
            lang={lang}
          />
        )}

        {/* Share & Like */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SocialShare title={project.title} url={currentUrl} isHe={isHe} />
          <LikeButton postSlug={project.slug} lang={lang} />
        </div>

        {/* Related Projects */}
        <RelatedPosts currentSlug={project.slug} lang={lang} category="tech" />

        {/* Comments */}
        <Comments postSlug={project.slug} lang={lang} />
      </article>
    </div>
  );

  if (!project.draft) {
    return articleContent;
  }

  const underPreparationScreen = (
    <div className="max-w-4xl mx-auto py-3 sm:py-10">
      <article className="rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-6 sm:p-12 space-y-6 sm:space-y-8 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-2">
          <Clock className="size-8" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold px-3 py-1 uppercase tracking-wider">
            {isHe ? 'בתהליך הכנה: מצב טיוטה' : 'Under Preparation: Draft Mode'}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-50 leading-snug">
            {project.title}
          </h1>
        </div>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          {isHe
            ? 'מאמר זה נמצא כעת בתהליך הכנה ובמצב טיוטה. הוא יפורסם בקרוב.'
            : 'This article is currently under preparation and in draft mode. It will be published soon.'}
        </p>

        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 max-w-xl mx-auto text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed space-y-2">
          <p>
            {isHe
              ? 'תודה על ההתעניינות. חלק 1 זמין לקריאה כעת, וחלק 2 עובר ליטוש אחרון לקראת פרסום פומבי.'
              : 'Thank you for your interest. Part 1 is available to read now, and Part 2 is being polished prior to public release.'}
          </p>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            {isHe
              ? 'אם קיבלת קישור מיוחד לתצוגה מקדימה, ודא שהקישור כולל את פרמטר התצוגה המקדימה (למשל, ?preview=true).'
              : 'If you were provided a special draft preview link, please ensure your URL includes the preview parameter (for example, ?preview=true).'}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${lang}/tech/building-an-effective-context-layer-part-1`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <BookOpen className="size-4" />
            {isHe ? 'לקריאת חלק 1: מה זה ולמה אתה חייב כזה' : 'Read Part 1: What Is It and Why You Need One'}
          </Link>
          <Link
            href={`/${lang}/tech`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2"
          >
            {isHe ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
            {isHe ? 'חזרה לכל פרויקטי ה-AI' : 'Back to All AI Projects'}
          </Link>
        </div>
      </article>
    </div>
  );

  return (
    <DraftGuard underPreparationScreen={underPreparationScreen}>
      {articleContent}
    </DraftGuard>
  );
}


