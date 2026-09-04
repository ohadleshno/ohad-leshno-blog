'use client';

import { extractRange } from '@/lib/content-review/text';
import { useReview } from './ReviewContext';

export function ReviewDiscussion() {
  const {
    state: { payload, ui, error },
    actions,
    meta: { labels },
  } = useReview();

  if (!payload) return null;

  const comments = ui.includeResolved
    ? payload.session.comments
    : payload.session.comments.filter((comment) => comment.status !== 'resolved');
  const selectedContext =
    ui.selectedRange != null
      ? (() => {
          try {
            return extractRange(payload.session.workingMarkdown, ui.selectedRange);
          } catch {
            return '';
          }
        })()
      : '';

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        <input
          type="checkbox"
          checked={ui.includeResolved}
          onChange={() => actions.toggleIncludeResolved()}
        />
        {labels.includeResolved}
      </label>

      {ui.selectedRange ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {labels.selectedLines} {ui.selectedRange.startLine}-{ui.selectedRange.endLine}
          </p>
          {selectedContext ? (
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-100">{selectedContext}</pre>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span>{labels.comment}</span>
              <textarea
                value={ui.commentDraft}
                onChange={(event) => actions.setCommentDraft(event.target.value)}
                className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={() => void actions.addComment()}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {labels.addComment}
              </button>
            </label>
            <label className="block space-y-2 text-sm">
              <span>{labels.proposeEdit}</span>
              <textarea
                value={ui.replacementDraft}
                onChange={(event) => actions.setReplacementDraft(event.target.value)}
                aria-label={labels.replacement}
                className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white p-3 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={() => void actions.addProposedEdit()}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-neutral-700"
              >
                {labels.addEdit}
              </button>
            </label>
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{labels.selectedLines}: 0</p>
      )}

      {error ? <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}

      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {comment.status === 'open'
                  ? labels.open
                  : comment.status === 'resolved'
                    ? labels.resolved
                    : labels.outdated}{' '}
                · {labels.revision} {comment.revisionId} · {comment.range.startLine}-{comment.range.endLine}
              </p>
              {comment.status === 'open' ? (
                <button
                  type="button"
                  onClick={() => void actions.resolveComment(comment.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  {labels.resolve}
                </button>
              ) : null}
            </div>
            <pre className="mb-3 overflow-x-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-100">{comment.context}</pre>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">{comment.text}</p>
          </li>
        ))}
        {payload.session.proposedEdits.map((edit) => (
          <li key={edit.id} className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {labels.proposeEdit} · {edit.status === 'active' ? labels.open : labels.outdated} · {edit.range.startLine}-
              {edit.range.endLine}
            </p>
            <pre className="mb-2 overflow-x-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-100">{edit.original}</pre>
            <pre className="overflow-x-auto rounded-xl bg-emerald-950 p-3 text-xs text-emerald-50">{edit.replacement}</pre>
          </li>
        ))}
      </ul>
    </section>
  );
}
