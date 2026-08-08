import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTechProjects } from '@/lib/tech';
import { ExternalLink, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { PlaylistCard } from '@/components/PlaylistCard';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export function generateMetadata({ params }: { params: { lang: 'he' | 'en' } }): Metadata {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const title = isHe ? 'בלוג AI ופרויקטים טכנולוגיים' : 'AI Engineering & Projects';
  const description = isHe
    ? 'מסמכי ארכיטקטורה, פרויקטים פתוחים ומחקר במערכות בינה מלאכותית (AI) מאת אוהד לשנו.'
    : 'Architecture design documents, open source projects, and AI systems research by Ohad Leshno.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://ohadleshno.com/${lang}/tech`,
      languages: {
        he: 'https://ohadleshno.com/he/tech',
        en: 'https://ohadleshno.com/en/tech',
      },
    },
    openGraph: {
      title: `${title} | Ohad Leshno`,
      description,
      url: `https://ohadleshno.com/${lang}/tech`,
      siteName: 'Ohad Leshno Blog',
      locale: isHe ? 'he_IL' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://ohadleshno.com/nehorai-hero.webp',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ohad Leshno`,
      description,
      images: ['https://ohadleshno.com/nehorai-hero.webp'],
    },
  };
}


export default function TechBlogIndex({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const projects = getAllTechProjects(lang);

  return (
    <div className="space-y-10 py-6">
      <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
          {isHe ? 'פרויקטי AI • מחקר • ארכיטקטורה' : 'AI Engineering • Research • Architecture'}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {isHe ? 'בלוג AI ופרויקטים טכנולוגיים' : 'AI Engineering & Projects'}
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl">
          {isHe
            ? 'מסמכי ארכיטקטורה, פרויקטים פתוחים ומחקר במערכות בינה מלאכותית'
            : 'Architecture design documents, open projects, and AI systems research.'}
        </p>
      </div>

      {/* Series Subjects Section */}
      <section className="space-y-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">
          <BookOpen className="size-4" />
          <span>{isHe ? 'נושאים נבחרים' : 'Featured Subjects'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <PlaylistCard seriesId="context-layer" lang={lang} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-5 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all relative shadow-sm"
          >
            {/* Full Card Overlay Link */}
            <Link
              href={`/${lang}/tech/${project.slug}`}
              className="absolute inset-0 z-10"
              aria-label={project.title}
            />

            <div className="space-y-4 pointer-events-none">
              <div className="w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <img
                  src={project.coverImage || '/nehorai-hero.webp'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {new Date(project.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')} • {project.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
              </div>

              <div className="flex items-center justify-between pointer-events-auto">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {project.title}
                </h2>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors z-20 relative pointer-events-auto"
                    title="Live Project Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {project.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {isHe ? 'לקריאת מסמך הארכיטקטורה המלא' : 'Read Architecture Design Doc'}
                {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
