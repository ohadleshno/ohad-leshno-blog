'use client';

import type { ReactNode } from 'react';
import { ReviewBar } from './ReviewBar';
import { ReviewProvider, useReview } from './ReviewContext';
import { ReviewWorkspace } from './ReviewWorkspace';
import './review.css';

function ReviewFrame({ children }: { children: ReactNode }) {
  const {
    state: { unreachable, loading },
    meta: { labels },
  } = useReview();

  if (unreachable) {
    return (
      <div className="review-shell">
        <ReviewBar />
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-8">
          <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">{labels.serverDown}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{labels.serverDownHelp}</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="review-shell">
      <ReviewBar />
      {loading ? <p className="px-4 py-3 text-sm text-neutral-500">...</p> : null}
      <ReviewWorkspace />
    </div>
  );
}

export function ReviewShell({
  lang,
  slug,
  children,
}: {
  lang: 'en' | 'he';
  slug: string;
  children: ReactNode;
}) {
  return (
    <ReviewProvider lang={lang} slug={slug}>
      <ReviewFrame>{children}</ReviewFrame>
    </ReviewProvider>
  );
}

export const ContentReview = {
  Provider: ReviewProvider,
  Shell: ReviewShell,
  Bar: ReviewBar,
};
