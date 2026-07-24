import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import { Music, Cpu, MapPin, Code2, Disc } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
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

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      {/* Outer Premium Container */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Cover Hero Banner Image */}
        <div className="relative w-full h-48 sm:h-60 overflow-hidden bg-slate-900">
          <img
            src="/grateful_dead.avif"
            alt="Grateful Dead Live"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Profile Info Section - Under Cover Image */}
        <div className="relative px-6 sm:px-10 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-start -mt-16 sm:-mt-20">
            {/* Circular Avatar overlapping the bottom edge of cover photo */}
            <div className="size-32 sm:size-40 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 z-10">
              <img
                src={data.avatar ? data.avatar.replace(/^\/public/, '') : '/ohad_leshno.avif'}
                alt="Ohad Leshno"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Title & Badges on Clean White Background */}
            <div className="space-y-3 pt-2 md:pt-0 pb-1 flex-1 z-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                {data.title || (isHe ? 'אודות אוהד לשנו' : 'About Ohad Leshno')}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-semibold">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <Disc className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  {isHe ? 'מוזיקאי' : 'Musician'}
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-sky-600 dark:text-sky-400" />
                  {isHe ? 'מהנדס AI' : 'AI Engineer'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {isHe ? 'ארכיטקט תוכנה' : 'Software Architect'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-rose-500" />
                  {isHe ? 'תל אביב' : 'Tel Aviv'}
                </span>
              </div>
            </div>
          </div>

          {/* Body Article Content */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div
              className="about-prose prose dark:prose-invert max-w-none prose-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
