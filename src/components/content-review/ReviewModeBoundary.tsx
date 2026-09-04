'use client';

import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { shouldEnableReview } from '@/lib/content-review/flags';
import { ReviewShell } from './ReviewShell';

function ReviewModeGate({
  lang,
  slug,
  children,
}: {
  lang: 'en' | 'he';
  slug: string;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  if (!shouldEnableReview(process.env.NODE_ENV, searchParams.get('review'))) {
    return (
      <>
        {children}
        <Link
          href={`${pathname}?review=true`}
          className="fixed bottom-5 end-5 z-40 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {lang === 'he' ? 'מצב סקירה' : 'Review changes'}
        </Link>
      </>
    );
  }
  return (
    <ReviewShell lang={lang} slug={slug}>
      {children}
    </ReviewShell>
  );
}

export function ReviewModeBoundary({
  enabled,
  lang,
  slug,
  children,
}: {
  enabled: boolean;
  lang: 'en' | 'he';
  slug: string;
  children: ReactNode;
}) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={children}>
      <ReviewModeGate lang={lang} slug={slug}>
        {children}
      </ReviewModeGate>
    </Suspense>
  );
}
