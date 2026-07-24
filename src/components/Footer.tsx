import Link from 'next/link';

interface FooterProps {
  lang: 'he' | 'en';
}

export function Footer({ lang }: FooterProps) {
  const isHe = lang === 'he';

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-8 px-4 mt-16 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div>
          <p>© {new Date().getFullYear()} Ohad Leshno. {isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
        </div>
        <div className="flex items-center gap-6">
          <Link href={`/${lang}/music`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {isHe ? 'בלוג מוזיקה' : 'Music Blog'}
          </Link>
          <Link href={`/${lang}/tech`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {isHe ? 'פרויקטי AI' : 'AI Projects'}
          </Link>
          <Link href={`/${lang}/about`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {isHe ? 'אודות' : 'About'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
