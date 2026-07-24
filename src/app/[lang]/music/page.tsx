import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { Clock, Calendar, Disc } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function MusicBlogIndex({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const posts = getAllPosts(lang);

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold">
          <Disc className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{isHe ? 'מוזיקה • תרבות • אלבומים' : 'Music • Culture • Albums'}</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl text-balance">
          {isHe ? 'בלוג מוזיקה ותרבות' : 'Music & Culture Blog'}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed text-pretty">
          {isHe
            ? 'מאמרים, ניתוחי אלבומים ומחשבות על מוזיקה ישראלית ועולמית'
            : 'Essays, album breakdowns, and musical insights.'}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${lang}/music/${post.slug}`}
            className="group glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col justify-between p-5 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-xl"
          >
            <div className="space-y-3">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={(post.coverImage || '/hero-cover.jpeg').replace(/^\/public/, '')}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {post.minutesToRead} {isHe ? 'דק׳ קריאה' : 'min read'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
