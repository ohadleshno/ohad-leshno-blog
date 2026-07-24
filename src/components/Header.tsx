'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Music, Cpu, User } from 'lucide-react';

interface HeaderProps {
  lang: 'he' | 'en';
}

export function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const isHe = lang === 'he';

  const otherLang = isHe ? 'en' : 'he';
  const otherLangLabel = isHe ? 'EN 🇺🇸' : 'עברית 🇮🇱';

  // Toggle path between /he/... and /en/...
  const currentPathWithoutLang = pathname.replace(/^\/(he|en)/, '');
  const switchLangPath = `/${otherLang}${currentPathWithoutLang || ''}`;

  const navLinks = [
    {
      href: `/${lang}/music`,
      label: isHe ? 'בלוג מוזיקה' : 'Music Blog',
      icon: <Music className="w-4 h-4 inline me-1.5" />,
    },
    {
      href: `/${lang}/tech`,
      label: isHe ? 'בלוג AI וטכנולוגיה' : 'AI & Tech',
      icon: <Cpu className="w-4 h-4 inline me-1.5" />,
    },
    {
      href: `/${lang}/about`,
      label: isHe ? 'אודות' : 'About Me',
      icon: <User className="w-4 h-4 inline me-1.5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-lg sm:text-xl text-slate-900 dark:text-white hover:opacity-90 transition-opacity">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-black text-base shadow-sm">
            OL
          </span>
          <span>{isHe ? 'אוהד לשנו' : 'Ohad Leshno'}</span>
        </Link>

        {/* Navigation links & Utilities */}
        <nav className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 me-2 sm:me-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-s border-slate-200 dark:border-slate-800 ps-2 sm:ps-4">
            {/* Language Selector */}
            <Link
              href={switchLangPath}
              className="px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {otherLangLabel}
            </Link>

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
