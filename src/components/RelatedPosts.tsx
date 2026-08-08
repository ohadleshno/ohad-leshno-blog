import Link from 'next/link';
import { getAllTechProjects } from '@/lib/tech';
import { getAllPosts } from '@/lib/posts';

interface RelatedPostsProps {
  currentSlug: string;
  lang: 'he' | 'en';
  category: 'tech' | 'music';
}

export function RelatedPosts({ currentSlug, lang, category }: RelatedPostsProps) {
  const isHe = lang === 'he';

  let related: Array<{
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    coverImage: string;
    minutesToRead: number;
  }> = [];

  if (category === 'tech') {
    const all = getAllTechProjects(lang);
    related = all
      .filter((p) => decodeURIComponent(p.slug) !== decodeURIComponent(currentSlug))
      .slice(0, 3);
  } else {
    const all = getAllPosts(lang);
    related = all
      .filter((p) => decodeURIComponent(p.slug) !== decodeURIComponent(currentSlug))
      .slice(0, 3);
  }

  if (related.length === 0) {
    return null;
  }

  const sectionTitle = category === 'tech'
    ? (isHe ? 'פרויקטים נוספים שאולי תאהבו' : 'More AI Projects & Insights')
    : (isHe ? 'מאמרים נוספים שאולי תאהבו' : 'More Essays & Reviews');

  return (
    <section className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-neutral-50 tracking-tight">
        {sectionTitle}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((post) => {
          const postUrl = `/${lang}/${category}/${post.slug}`;
          const formattedDate = new Date(post.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Link
              key={post.slug}
              href={postUrl}
              className="group flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {post.coverImage && (
                <div className="w-full h-40 overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  {formattedDate} • {post.minutesToRead} {isHe ? 'דקות קריאה' : 'min read'}
                </span>

                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed flex-1">
                  {post.excerpt}
                </p>

                <div className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:underline inline-flex items-center gap-1">
                  {isHe ? 'קריאת המאמר המלא' : 'Read Full Article'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
