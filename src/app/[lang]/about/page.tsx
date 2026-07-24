import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import { Music, Cpu, Sparkles, MapPin, Code2, Disc } from 'lucide-react';

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
      {/* Outer Premium Glass Container */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Cover Hero Banner */}
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img
            src="/grateful_dead.avif"
            alt="Grateful Dead Live"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          
          {/* Top Badge Overlay */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{isHe ? 'מוזיקה • AI • ארכיטקטורה' : 'Music • AI • Architecture'}</span>
          </div>
        </div>

        {/* Profile Card Header (Overlapping Hero Banner) */}
        <div className="relative px-6 sm:px-10 pb-8 -mt-24 sm:-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-start">
            {/* Avatar with Glow Ring */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 via-indigo-500 to-sky-500 opacity-75 blur group-hover:opacity-100 transition duration-500" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={data.avatar ? data.avatar.replace(/^\/public/, '') : '/ohad_leshno.avif'}
                  alt="Ohad Leshno"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 pb-2 flex-1">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {data.title || (isHe ? 'אודות אוהד לשנו' : 'About Ohad Leshno')}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-semibold">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-rose-500" />
                  {isHe ? 'מוזיקאי' : 'Musician'}
                </span>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-500" />
                  {isHe ? 'מהנדס AI' : 'AI Engineer'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                  {isHe ? 'ארכיטקט תוכנה' : 'Software Architect'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {isHe ? 'תל אביב' : 'Tel Aviv'}
                </span>
              </div>
            </div>
          </div>

          {/* Article Prose Content */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
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
