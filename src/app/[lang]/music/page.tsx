import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export function generateStaticParams() {
  return [{ lang: 'he' }, { lang: 'en' }];
}

export default function MusicBlogIndex({ params }: { params: { lang: 'he' | 'en' } }) {
  const lang = params.lang || 'he';
  const isHe = lang === 'he';
  const posts = getAllPosts(lang);

  return (
    <div className="space-y-10 py-6">
      {/* Header Banner */}
      <div className="py-8 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
          {isHe ? 'מוזיקה • תרבות • אלבומים' : 'Music • Culture • Albums'}
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {isHe ? 'בלוג מוזיקה ותרבות' : 'Music & Culture Blog'}
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl">
          {isHe
            ? 'מאמרים, ניתוחי אלבומים ומחשבות על מוזיקה ישראלית ועולמית'
            : 'Essays, album breakdowns, and musical insights.'}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${lang}/music/${post.slug}`}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-sm space-y-4"
          >
            <div className="space-y-3">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <img
                  src={(post.coverImage || '/hero-cover.jpeg').replace(/^\/public/, '')}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')} • {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
              </div>
              <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {isHe ? 'קריאת המאמר המלא ←' : 'Read Full Essay →'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
