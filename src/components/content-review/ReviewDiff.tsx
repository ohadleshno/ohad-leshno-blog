'use client';

import type { DiffLine } from '@/lib/content-review/types';
import { useReview } from './ReviewContext';

function lineTone(type: DiffLine['type']): string {
  if (type === 'add') return 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100';
  if (type === 'del') return 'bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100';
  return 'bg-transparent text-neutral-700 dark:text-neutral-300';
}

function isSelected(start: number, end: number, line: number | null): boolean {
  return line !== null && line >= start && line <= end;
}

export function ReviewDiff() {
  const {
    state: { payload, ui },
    actions,
    meta: { labels },
  } = useReview();

  if (!payload) return null;

  const selected = ui.selectedRange;
  const hunkLines = payload.diff.hunks.flatMap((hunk) => hunk.lines);

  return (
    <section dir="ltr" className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500" htmlFor="review-compare">
            {labels.compare}
          </label>
          <select
            id="review-compare"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            value={ui.compareTo === 'working' ? 'working' : String(ui.compareTo)}
            onChange={(event) => {
              const value = event.target.value;
              actions.setCompareTo(value === 'working' ? 'working' : Number(value));
            }}
          >
            <option value="working">{labels.workingFile}</option>
            {payload.session.revisions.map((revision) => (
              <option key={revision.id} value={revision.id}>
                {labels.revision} {revision.id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-pressed={ui.diffLayout === 'unified'}
            onClick={() => actions.setDiffLayout('unified')}
          >
            {labels.unified}
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-pressed={ui.diffLayout === 'split'}
            onClick={() => actions.setDiffLayout('split')}
          >
            {labels.split}
          </button>
        </div>
      </div>

      {hunkLines.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{labels.noChanges}</p>
      ) : ui.diffLayout === 'split' ? (
        <div className="review-diff-split rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div>
            {hunkLines
              .filter((line) => line.type !== 'add')
              .map((line, index) => (
                <DiffRow key={`old-${index}`} line={line} />
              ))}
          </div>
          <div>
            {hunkLines
              .filter((line) => line.type !== 'del')
              .map((line, index) => (
                <DiffRow
                  key={`new-${index}`}
                  line={line}
                  selected={Boolean(selected && isSelected(selected.startLine, selected.endLine, line.newLine))}
                  onSelect={(event) => line.newLine && actions.selectLine(line.newLine, event.shiftKey)}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {payload.diff.unified.split('\n').map((text, index) => (
            <pre key={index} className="bg-neutral-950 px-4 py-0.5 text-xs text-neutral-100">
              {text}
            </pre>
          ))}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            {hunkLines.map((line, index) => (
                <DiffRow
                  key={`uni-${index}`}
                  line={line}
                  selected={Boolean(
                    selected && line.newLine !== null && isSelected(selected.startLine, selected.endLine, line.newLine),
                  )}
                  onSelect={(event) => line.newLine && actions.selectLine(line.newLine, event.shiftKey)}
                />
              ))}
          </div>
        </div>
      )}

      {selected ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {labels.selectedLines} {selected.startLine}-{selected.endLine}
        </p>
      ) : null}
    </section>
  );
}

function DiffRow({
  line,
  selected = false,
  onSelect,
}: {
  line: DiffLine;
  selected?: boolean;
  onSelect?: (event: { shiftKey: boolean }) => void;
}) {
  const marker = line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ';
  const className = `review-diff-line w-full text-start ${lineTone(line.type)} ${
    selected ? 'ring-2 ring-inset ring-rose-500' : ''
  }`;
  const content = (
    <>
      <span className="px-2 text-neutral-400">{line.newLine ?? line.oldLine ?? ''}</span>
      <span>{marker}</span>
      <span>{line.text}</span>
    </>
  );

  if (!onSelect) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={(event) => onSelect(event)}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500`}
    >
      {content}
    </button>
  );
}
