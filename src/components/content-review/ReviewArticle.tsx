'use client';

import { useEffect, useRef } from 'react';
import { changedHeadingTitles } from '@/lib/content-review/highlight';
import { useReview } from './ReviewContext';

export function ReviewArticle({ children }: { children: React.ReactNode }) {
  const {
    state: { payload },
  } = useReview();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const titles = new Set(
      payload ? changedHeadingTitles(payload.session.workingMarkdown, payload.diff.changedNewLines) : [],
    );

    headings.forEach((heading) => {
      const text = heading.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      heading.classList.toggle('review-changed-heading', titles.has(text));
    });
  }, [payload]);

  return <div ref={rootRef}>{children}</div>;
}
