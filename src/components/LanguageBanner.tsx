import Link from 'next/link';
import { Languages } from 'lucide-react';

interface LanguageBannerProps {
  category: 'tech' | 'music';
  slug: string;
  lang: 'he' | 'en';
}

export function LanguageBanner({ category, slug, lang }: LanguageBannerProps) {
  const isHe = lang === 'he';
  const targetLang = isHe ? 'en' : 'he';
  const targetUrl = `/${targetLang}/${category}/${slug}`;

  return (
    <div
      className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-rose-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-rose-950/30 border border-indigo-200/80 dark:border-indigo-800/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
      dir={isHe ? 'rtl' : 'ltr'}
    >
      <div className="p-2.5 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
        <Languages className="size-5" />
      </div>

      <div className="flex-1 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
        {isHe ? (
          <>
            רוצה לקרוא את זה באנגלית?{' '}
            <Link
              href={targetUrl}
              className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              לחץ כאן, יש לנו גם את הגרסה הזו
            </Link>{' '}
            <span className="text-neutral-500 dark:text-neutral-400 text-xs italic">
              (אל תדאג, זה לא נוצר על ידי AI, טוב שיקרתי לך אבל זה לא AI slop)
            </span>
          </>
        ) : (
          <>
            Do you want to read it in Hebrew?{' '}
            <Link
              href={targetUrl}
              className="font-semibold text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Press here, we also have this version
            </Link>{' '}
            <span className="text-neutral-500 dark:text-neutral-400 text-xs italic">
              (don't worry this is not AI generated, okay I lied to you but this is not AI slop)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
