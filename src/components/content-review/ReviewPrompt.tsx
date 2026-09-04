'use client';

import { useReview } from './ReviewContext';

export function ReviewPrompt() {
  const {
    state: { prompt, ui },
    actions,
    meta: { labels },
  } = useReview();

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input type="checkbox" checked={ui.includeResolved} onChange={() => actions.toggleIncludeResolved()} />
          {labels.includeResolved}
        </label>
        <button
          type="button"
          onClick={() => void actions.copyPrompt()}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {ui.copyPhase === 'copied' ? labels.copied : ui.copyPhase === 'failed' ? labels.copyFailed : labels.copyPrompt}
        </button>
      </div>
      <textarea
        readOnly
        aria-label={labels.promptLabel}
        value={prompt}
        className="min-h-[28rem] w-full rounded-2xl border border-neutral-200 bg-neutral-950 p-4 font-mono text-sm text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-neutral-800"
      />
    </section>
  );
}
