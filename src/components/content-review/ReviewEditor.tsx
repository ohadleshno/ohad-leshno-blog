'use client';

import { useEffect } from 'react';
import { useReview } from './ReviewContext';

export function ReviewEditor() {
  const {
    state: { ui, dirty },
    actions,
    meta: { labels, isHe },
  } = useReview();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (ui.savePhase === 'confirming' || ui.savePhase === 'conflict')) {
        actions.cancelSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions, ui.savePhase]);

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{labels.editorLabel}</p>
        <div className="flex flex-wrap gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={() => actions.clearDraft()}
              className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {labels.clearDraft}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => actions.requestSave()}
            disabled={!dirty || ui.savePhase === 'saving'}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {ui.savePhase === 'saving' ? labels.saving : ui.savePhase === 'saved' ? labels.saved : labels.saveFile}
          </button>
        </div>
      </div>

      {ui.saveError ? <p className="text-sm text-rose-700 dark:text-rose-300">{ui.saveError}</p> : null}

      <textarea
        dir={isHe ? 'rtl' : 'ltr'}
        aria-label={labels.editorLabel}
        value={ui.editorDraft}
        onChange={(event) => actions.setEditorDraft(event.target.value)}
        className="min-h-[32rem] w-full rounded-2xl border border-neutral-200 bg-white p-4 font-mono text-sm leading-relaxed text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
      />

      {ui.savePhase === 'confirming' ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-save-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 id="review-save-title" className="font-display text-lg font-semibold">
              {labels.confirmSaveTitle}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{labels.confirmSaveBody}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => actions.cancelSave()}
                className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => void actions.confirmSave()}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {labels.confirmSave}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {ui.savePhase === 'conflict' ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-conflict-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
        >
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 id="review-conflict-title" className="font-display text-lg font-semibold">
              {labels.conflictTitle}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{labels.conflictBody}</p>
            {ui.conflictDiskMarkdown ? (
              <pre className="max-h-40 overflow-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-100">
                {ui.conflictDiskMarkdown.slice(0, 1200)}
              </pre>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void actions.loadDiskVersion()}
                className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {labels.loadDisk}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => actions.keepDraft()}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {labels.keepDraft}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
