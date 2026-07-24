import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';

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
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-indigo-500/30 flex-shrink-0 bg-slate-100 dark:bg-slate-800 shadow-md">
          <img
            src={data.avatar ? data.avatar.replace(/^\/public/, '') : '/ohad_leshno.avif'}
            alt="Ohad Leshno"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3 text-center md:text-start">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {data.title || (isHe ? 'אודות אוהד לשנו' : 'About Ohad Leshno')}
          </h1>
          <p className="text-sm sm:text-base text-indigo-600 dark:text-indigo-400 font-semibold">
            {isHe ? 'מוזיקאי • חוקר תרבות • מהנדס AI' : 'Musician • Culture Researcher • AI Engineer'}
          </p>
        </div>
      </div>

      <div
        className="prose dark:prose-invert max-w-none prose-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
