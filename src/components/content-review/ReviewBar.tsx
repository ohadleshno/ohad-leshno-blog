'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReview } from './ReviewContext';

const buttonClass =
  'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:opacity-50';
const primaryClass = `${buttonClass} bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200`;
const secondaryClass = `${buttonClass} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800`;

export function ReviewBar() {
  const pathname = usePathname();
  const {
    state: { payload, ui, dirty, unreachable },
    actions,
    meta: { labels },
  } = useReview();

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{labels.barTitle}</p>
          {payload ? (
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              {labels.headColumn} {payload.session.baselineCommit.slice(0, 7)}
              {' · '}
              {dirty ? labels.unsaved : labels.workingFile}
              {payload.diff.hunks.length > 0 || dirty
                ? ` · +${payload.diff.changedNewLines.length} / -${payload.diff.changedOldLines.length}`
                : ''}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">{unreachable ? labels.serverDown : '...'}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`${pathname}?review=false`} className={secondaryClass}>
            {labels.viewFullArticle}
          </Link>
          {dirty ? (
            <button
              type="button"
              onClick={() => {
                actions.setChangeFilter('unsaved');
                actions.setView('diff');
              }}
              className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-950/70 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              {labels.unsaved}
            </button>
          ) : null}
          <button
            type="button"
            className={secondaryClass}
            onClick={() => void actions.confirmSave()}
            disabled={!dirty || !payload || ui.savePhase === 'saving'}
          >
            {ui.savePhase === 'saving' ? labels.saving : labels.saveFile}
          </button>
          <button type="button" className={primaryClass} onClick={() => void actions.copyPrompt()} disabled={!payload}>
            {ui.copyPhase === 'copied' ? labels.copied : ui.copyPhase === 'failed' ? labels.copyFailed : labels.copyPrompt}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {ui.copyPhase === 'copied' ? labels.copied : ui.copyPhase === 'failed' ? labels.copyFailed : ''}
        {ui.savePhase === 'saved' ? labels.saved : ''}
      </p>
    </div>
  );
}
