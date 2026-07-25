import Link from 'next/link';
import { getAllTechProjects } from '@/lib/tech';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
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
                  src={project.coverImage || '/nehorai-hero.png'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
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
