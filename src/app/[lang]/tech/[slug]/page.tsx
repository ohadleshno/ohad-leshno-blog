import { getAllTechSlugs, getTechProjectData } from '@/lib/tech';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { ExternalLink, ArrowLeft, ArrowRight, Calendar, Cpu } from 'lucide-react';
import Link from 'next/link';
import { MermaidRenderer } from '@/components/MermaidRenderer';

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

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-10">
      <article className="glass-card rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-4 sm:p-10 space-y-5 sm:space-y-8">
        {/* Back button */}
        <Link
          href={`/${lang}/tech`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
        >
          {isHe ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {isHe ? 'חזרה לכל פרויקטי ה-AI' : 'Back to All AI Projects'}
        </Link>

        {/* Header */}
        <header className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 text-xs font-semibold">
            <Cpu className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span>{isHe ? 'פרויקט AI וארכיטקטורה' : 'AI & Systems Project'}</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {project.title}
          </h1>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="size-4 text-sky-500" />
              {new Date(project.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
            </span>

            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="size-3.5" />
                {isHe ? 'מעבר לפרויקט' : 'View Live Project'}
              </a>
            )}
          </div>
        </header>

        {/* Markdown Content */}
        <div
          className="prose dark:prose-invert max-w-none prose-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
        />

        <MermaidRenderer />

        {/* Share */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <SocialShare title={project.title} url={currentUrl} isHe={isHe} />
        </div>

        {/* Comments */}
        <Comments postSlug={project.slug} lang={lang} />
      </article>
    </div>
  );
}
