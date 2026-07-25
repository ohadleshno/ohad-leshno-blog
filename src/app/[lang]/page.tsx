import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { getAllTechProjects } from '@/lib/tech';
import { MailingList } from '@/components/MailingList';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function HomePage({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';

  const musicPosts = getAllPosts(lang).slice(0, 3);
  const featuredMusic = musicPosts[0];
  const sideMusicPosts = musicPosts.slice(1);
  const techProjects = getAllTechProjects(lang).slice(0, 2);

  return (
    <div className="space-y-20 py-6 sm:py-12">
      {/* Hero Banner Section */}
      <section className="py-6 sm:py-12 border-b border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-6">
          <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
            {isHe ? 'מוזיקה • תרבות • הנדסת AI' : 'Music • Culture • AI Engineering'}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-neutral-900 dark:text-neutral-50 leading-[1.1] tracking-tight">
            {isHe ? 'הבלוג של אוהד לשנו' : 'Ohad Leshno’s Blog'}
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl font-light">
            {isHe
              ? 'חוקר מוזיקה, כותב ומפתח AI. מקום שבו ניתוח מוזיקלי ותרבותי פוגש מחקר טכנולוגי והנדסת מערכות בינה מלאכותית.'
              : 'Musician, writer, and AI engineer. Where deep musical and cultural analysis meets software engineering and AI systems.'}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Link
              href={`/${lang}/music`}
              className="px-6 py-3 rounded-lg font-medium text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
            >
              {isHe ? 'למאמרי המוזיקה' : 'Explore Music Essays'}
            </Link>

            <Link
              href={`/${lang}/tech`}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-4 transition-colors"
            >
              {isHe ? 'פרויקטי AI ומחקר' : 'AI Projects & Research'}
            </Link>
          </div>
        </div>

        {/* Profile Image (Editorial Rectangle Crop) */}
        <div className="md:col-span-4 flex justify-center md:justify-end">
          <div className="w-48 h-56 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md bg-neutral-100 dark:bg-neutral-900 relative">
            <img
              src="/ohad_leshno.avif"
              alt="Ohad Leshno"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Music Blog Posts Section - Asymmetric Editorial Grid */}
      <section className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {isHe ? 'מאמרים אחרונים במוזיקה' : 'Latest Music Essays'}
          </h2>
          <Link
            href={`/${lang}/music`}
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            {isHe ? 'לכל המאמרים' : 'View All'}
            {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Featured Post (Spans 7 columns on desktop) */}
          {featuredMusic && (
            <Link
              href={`/${lang}/music/${featuredMusic.slug}`}
              className="group md:col-span-7 flex flex-col justify-between space-y-4"
            >
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                <img
                  src={(featuredMusic.coverImage || '/hero-cover.jpeg').replace(/^\/public/, '')}
                  alt={featuredMusic.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {new Date(featuredMusic.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')} • {featuredMusic.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {featuredMusic.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {featuredMusic.excerpt}
                </p>
              </div>
            </Link>
          )}

          {/* Secondary Posts (Spans 5 columns on desktop, stacked vertically) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {sideMusicPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${lang}/music/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 transition-all shadow-sm"
              >
                <div className="w-full sm:w-32 h-32 sm:h-28 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  <img
                    src={(post.coverImage || '/hero-cover.jpeg').replace(/^\/public/, '')}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col justify-between space-y-1">
                  <div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                      {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
                    </span>
                    <h4 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Technical AI Projects Showcase */}
      <section className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {isHe ? 'פרויקטי AI ומחקר טכנולוגי' : 'AI Projects & Research'}
          </h2>
          <Link
            href={`/${lang}/tech`}
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            {isHe ? 'לכל הפרויקטים' : 'View All Projects'}
            {isHe ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techProjects.map((project) => (
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
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors z-20 relative pointer-events-auto"
                      title="Project Link"
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
      </section>

      {/* Newsletter Subscription Block */}
      <MailingList lang={lang} />
    </div>
  );
}
