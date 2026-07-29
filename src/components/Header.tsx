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
    },
    {
      href: `/${lang}/tech`,
      mobileLabel: 'AI',
      desktopLabel: isHe ? 'בלוג AI' : 'AI & Tech',
    },
    {
      href: `/${lang}/about`,
      mobileLabel: isHe ? 'אודות' : 'About',
      desktopLabel: isHe ? 'אודות' : 'About Me',
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-1 sm:gap-2">
        {/* Brand Logo */}
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity flex-shrink-0 whitespace-nowrap"
        >
          <img
            src="/logo-icon.webp"
            alt="Ohad Leshno Logo"
            width={28}
            height={28}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-contain flex-shrink-0"
            aria-hidden="true"
          />
          <span className="font-display font-semibold text-sm sm:text-lg tracking-tight truncate">{isHe ? 'אוהד לשנו' : 'Ohad Leshno'}</span>
        </Link>

        {/* Navigation links & Utilities */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <nav className="flex items-center gap-1 sm:gap-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center relative ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 font-semibold underline underline-offset-8 decoration-2'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <span className="sm:hidden">{link.mobileLabel}</span>
                  <span className="hidden sm:inline">{link.desktopLabel}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 border-s border-neutral-200 dark:border-neutral-800 ps-1.5 sm:ps-3 flex-shrink-0">
            {/* Language Selector */}
            <Link
              href={switchLangPath}
              className="px-2 py-0.5 rounded text-xs font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors whitespace-nowrap"
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
