'use client';

import { useState, useEffect } from 'react';
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

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header when at or near top
      if (currentScrollY <= 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        // Hide when scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        // Reveal when scrolling up
        setIsVisible(true);
      }

      lastScrollY = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const otherLang = isHe ? 'en' : 'he';
  const otherLangLabel = isHe ? 'EN' : 'עברית';

  // Toggle path between /he/... and /en/...
  const currentPathWithoutLang = pathname.replace(/^\/(he|en)/, '');
  const switchLangPath = `/${otherLang}${currentPathWithoutLang || ''}`;

  const navLinks = [
    {
      href: `/${lang}/music`,
      mobileLabel: isHe ? 'מוזיקה' : 'Music',
      desktopLabel: isHe ? 'בלוג מוזיקה' : 'Music Blog',
      icon: <Music className="w-3.5 h-3.5 inline me-1 flex-shrink-0" />,
    },
    {
      href: `/${lang}/tech`,
      mobileLabel: 'AI',
      desktopLabel: isHe ? 'בלוג AI' : 'AI & Tech',
      icon: <Cpu className="w-3.5 h-3.5 inline me-1 flex-shrink-0" />,
    },
    {
      href: `/${lang}/about`,
      mobileLabel: isHe ? 'אודות' : 'About',
      desktopLabel: isHe ? 'אודות' : 'About Me',
      icon: <User className="w-3.5 h-3.5 inline me-1 flex-shrink-0" />,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full glass-nav border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-1 sm:gap-2">
        {/* Brand Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-1.5 font-bold text-xs sm:text-base text-slate-900 dark:text-white hover:opacity-90 transition-opacity flex-shrink-0 whitespace-nowrap"
        >
          <img
            src="/logo.png"
            alt="Ohad Leshno"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg object-cover shadow-sm flex-shrink-0"
          />
          <span className="truncate">{isHe ? 'אוהד לשנו' : 'Ohad Leshno'}</span>
        </Link>

        {/* Navigation links & Utilities */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <nav className="flex items-center gap-0.5 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.icon}
                  <span className="sm:hidden">{link.mobileLabel}</span>
                  <span className="hidden sm:inline">{link.desktopLabel}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 border-s border-slate-200 dark:border-slate-800 ps-1 sm:ps-3 flex-shrink-0">
            {/* Language Selector */}
            <Link
              href={switchLangPath}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              {otherLangLabel}
            </Link>

            {/* Dark/Light Theme Toggle */}
            <div className="flex-shrink-0 scale-90 sm:scale-100">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
