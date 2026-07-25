import Link from 'next/link';
import { getAllTechProjects } from '@/lib/tech';
import { Cpu, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function TechBlogIndex({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const projects = getAllTechProjects(lang);

  return (
    <div className="space-y-8 py-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-6 h-6 text-sky-500" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {isHe ? 'בלוג AI ופרויקטים טכנולוגיים' : 'AI Engineering & Projects'}
          </h1>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400">
          {isHe
            ? 'מסמכי ארכיטקטורה, פרויקטים פתוחים ומחקר במערכות בינה מלאכותית'
            : 'Architecture design documents, open projects, and AI systems research.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="group glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-6 space-y-4 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-lg transition-all relative"
          >
            {/* Full Card Overlay Link */}
            <Link
              href={`/${lang}/tech/${project.slug}`}
              className="absolute inset-0 z-10"
              aria-label={project.title}
            />

            <div className="space-y-3 pointer-events-none">
              <div className="flex items-center justify-between pointer-events-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {project.title}
                </h2>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors z-20 relative pointer-events-auto"
                    title="Live Project Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {project.excerpt}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                {isHe ? 'לקריאת מסמך הארכיטקטורה' : 'Read Architecture Design Doc'}
                {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
