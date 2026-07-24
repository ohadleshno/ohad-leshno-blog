import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { Clock, Calendar } from 'lucide-react';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function MusicBlogIndex({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const posts = getAllPosts(lang);

  return (
    <div className="space-y-8 py-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {isHe ? 'בלוג מוזיקה ותרבות' : 'Music & Culture Blog'}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {isHe
            ? 'מאמרים, ניתוחי אלבומים ומחשבות על מוזיקה ישראלית ועולמית'
            : 'Essays, album breakdowns, and musical insights.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${lang}/music/${post.slug}`}
            className="group glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 flex flex-col justify-between p-5 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-md"
          >
            <div className="space-y-3">
              {post.coverImage && (
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
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
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.minutesToRead} {isHe ? 'דק׳ קריאה' : 'min read'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
