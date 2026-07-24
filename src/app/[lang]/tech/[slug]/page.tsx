import { getAllTechSlugs, getTechProjectData } from '@/lib/tech';
import { notFound } from 'next/navigation';
import { SocialShare } from '@/components/SocialShare';
import { Comments } from '@/components/Comments';
import { ExternalLink, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export function generateStaticParams() {
  const heSlugs = getAllTechSlugs('he').map((slug) => ({ lang: 'he', slug }));
  const enSlugs = getAllTechSlugs('en').map((slug) => ({ lang: 'en', slug }));
  return [...heSlugs, ...enSlugs];
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
    <article className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back button */}
      <Link
        href={`/${lang}/tech`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
      >
        {isHe ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {isHe ? 'חזרה לכל פרויקטי ה-AI' : 'Back to All AI Projects'}
      </Link>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
            >
              {tech}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          {project.title}
        </h1>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(project.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
          </span>

          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {isHe ? 'מעבר לפרויקט' : 'View Live Project'}
            </a>
          )}
        </div>
      </header>

      {/* Markdown Content */}
      <div
        className="prose dark:prose-invert max-w-none prose-lg text-slate-800 dark:text-slate-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: project.contentHtml }}
      />

      {/* Share */}
      <SocialShare title={project.title} url={currentUrl} isHe={isHe} />

      {/* Comments */}
      <Comments postSlug={project.slug} lang={lang} />
    </article>
  );
}
