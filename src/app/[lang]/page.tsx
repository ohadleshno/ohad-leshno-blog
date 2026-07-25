import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { getAllTechProjects } from '@/lib/tech';
import { MailingList } from '@/components/MailingList';
import { ArrowLeft, ArrowRight, Music, Cpu, ExternalLink, Calendar, Clock } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function HomePage({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const musicPosts = getAllPosts(lang).slice(0, 3);
  const techProjects = getAllTechProjects(lang).slice(0, 2);

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Banner Section */}
      <section className="glass-card p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl text-center md:text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-500/20">
            <span>{isHe ? 'מוזיקה • תרבות • הנדסת AI' : 'Music • Culture • AI Engineering'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {isHe ? 'הבלוג של אוהד לשנו' : 'Ohad Leshno’s Blog'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHe
              ? 'חוקר מוזיקה, כותב ומפתח AI. מקום שבו ניתוח מוזיקלי ותרבותי פוגש מחקר טכנולוגי והנדסת מערכות בינה מלאכותית.'
              : 'Musician, writer, and AI engineer. Where deep musical and cultural analysis meets software engineering and AI systems.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <Link
              href={`/${lang}/music`}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              {isHe ? 'למאמרי המוזיקה' : 'Explore Music Blog'}
            </Link>

            <Link
              href={`/${lang}/tech`}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-sky-500" />
              {isHe ? 'פרויקטי AI' : 'AI Projects'}
            </Link>
          </div>
        </div>

        {/* Profile Avatar / Cover Image */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl flex-shrink-0 bg-indigo-50 dark:bg-indigo-950">
          <img
            src="/ohad_leshno.avif"
            alt="Ohad Leshno"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Featured Music Blog Posts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHe ? 'מאמרים אחרונים במוזיקה' : 'Latest Music Essays'}
            </h2>
          </div>
          <Link
            href={`/${lang}/music`}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {isHe ? 'לכל המאמרים' : 'View All'}
            {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {musicPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/${lang}/music/${post.slug}`}
              className="group glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 flex flex-col justify-between p-5 hover:border-indigo-500/50 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-full h-44 sm:h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={(post.coverImage || '/hero-cover.jpeg').replace(/^\/public/, '')}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.minutesToRead} min
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Technical AI Projects Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHe ? 'פרויקטי AI ומחקר טכנולוגי' : 'AI Projects & Research'}
            </h2>
          </div>
          <Link
            href={`/${lang}/tech`}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            {isHe ? 'לכל הפרויקטים' : 'View All Projects'}
            {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techProjects.map((project) => (
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
                <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={project.coverImage || '/nehorai-hero.png'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-center justify-between pointer-events-auto">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors z-20 relative pointer-events-auto"
                      title="Project Link"
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
                  {isHe ? 'לקריאת מסמך הארכיטקטורה המלא' : 'Read Architecture Design Doc'}
                  {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Subscription Block */}
      <MailingList lang={lang} />
    </div>
  );
}
