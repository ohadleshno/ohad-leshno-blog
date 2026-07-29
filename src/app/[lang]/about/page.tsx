import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export function generateMetadata({ params }: { params: { lang: 'he' | 'en' } }): Metadata {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const fullPath = path.join(process.cwd(), 'content/about', `${lang}.md`);
  let excerpt = isHe
    ? 'אודות אוהד לשנו - מוזיקאי, חוקר תרבות ומהנדס בינה מלאכותית (AI).'
    : 'About Ohad Leshno - Musician, culture researcher, and AI engineer.';

  if (fs.existsSync(fullPath)) {
    const fileContents = fs.readFileSync(fullPath, 'utf-8');
    const { data } = matter(fileContents);
    if (data.excerpt) excerpt = data.excerpt;
  }

  const title = isHe ? 'אודות אוהד לשנו' : 'About Ohad Leshno';

  return {
    title,
    description: excerpt,
    alternates: {
      canonical: `https://ohadleshno.com/${lang}/about`,
      languages: {
        he: 'https://ohadleshno.com/he/about',
        en: 'https://ohadleshno.com/en/about',
      },
    },
    openGraph: {
      title: `${title} | Ohad Leshno`,
      description: excerpt,
      url: `https://ohadleshno.com/${lang}/about`,
      siteName: 'Ohad Leshno Blog',
      locale: isHe ? 'he_IL' : 'en_US',
      type: 'profile',
      images: [
        {
          url: 'https://ohadleshno.com/ohad_leshno.webp',
          width: 800,
          height: 800,
          alt: 'Ohad Leshno',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ohad Leshno`,
      description: excerpt,
      images: ['https://ohadleshno.com/ohad_leshno.webp'],
    },
  };
}


export default function AboutPage({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const fullPath = path.join(process.cwd(), 'content/about', `${lang}.md`);
  if (!fs.existsSync(fullPath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  const processedContent = remark().use(html, { sanitize: false }).processSync(content);
  const contentHtml = processedContent.toString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2026-01-01',
    mainEntity: {
      '@type': 'Person',
      name: 'Ohad Leshno',
      alternateName: 'אוהד לשנו',
      jobTitle: isHe ? 'מהנדס AI וחוקר תרבות' : 'AI Engineer & Culture Researcher',
      image: 'https://ohadleshno.com/ohad_leshno.webp',
      url: `https://ohadleshno.com/${lang}/about`,
      sameAs: [
        'https://github.com/ohadleshno',
      ],
    },
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Editorial Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        
        {/* Cover Banner */}
        <div className="w-full h-48 sm:h-64 overflow-hidden bg-neutral-950 relative">
          <img
            src="/grateful_dead.avif"
            alt="Grateful Dead Live"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
        </div>

        {/* Profile Content Block */}
        <div className="px-6 sm:px-12 pb-10">
          
          {/* Centered Profile Avatar Overlapping Cover Banner */}
          <div className="flex flex-col items-center text-center -mt-16 sm:-mt-20">
            <div className="size-32 sm:size-36 rounded-2xl overflow-hidden border-4 border-white dark:border-neutral-900 shadow-lg bg-neutral-100 dark:bg-neutral-800 z-10 flex-shrink-0">
              <img
                src={data.avatar ? data.avatar.replace(/^\/public/, '') : '/ohad_leshno.webp'}
                alt="Ohad Leshno"
                loading="eager"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="mt-4 space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {data.title || (isHe ? 'אודות אוהד לשנו' : 'About Ohad Leshno')}
              </h1>
              
              <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-400">
                {isHe ? 'מוזיקאי • חוקר תרבות • מהנדס AI' : 'Musician • Culture Researcher • AI Engineer'}
              </p>

              {/* Minimal Editorial Location Tag */}
              <div className="pt-1 text-xs text-neutral-500 font-medium">
                {isHe ? 'תל אביב, ישראל' : 'Tel Aviv, Israel'}
              </div>
            </div>
          </div>

          {/* Article Prose Body Content */}
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div
              className="about-prose prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
