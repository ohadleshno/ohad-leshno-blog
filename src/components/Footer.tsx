import Link from 'next/link';

interface FooterProps {
  lang: 'he' | 'en';
}

export function Footer({ lang }: FooterProps) {
  const isHe = lang === 'he';

  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 py-10 px-4 mt-20 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <div>
          <span className="font-display font-semibold text-neutral-900 dark:text-white me-2">{isHe ? 'אוהד לשנו' : 'Ohad Leshno'}</span>
          <span>© {new Date().getFullYear()}. {isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</span>
        </div>
        <div className="flex items-center gap-6 text-neutral-500 dark:text-neutral-400">
          <Link href={`/${lang}/music`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {isHe ? 'בלוג מוזיקה' : 'Music Blog'}
          </Link>
          <Link href={`/${lang}/tech`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {isHe ? 'פרויקטי AI' : 'AI Projects'}
          </Link>
          <Link href={`/${lang}/about`} className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {isHe ? 'אודות' : 'About'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
