'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { renderMarkdownPreview } from '@/lib/content-review/api';
import { diffLines } from '@/lib/content-review/diff';
import type { DiffLine } from '@/lib/content-review/types';
import { wordDiff, type WordDiffPart } from '@/lib/content-review/word-diff';
import { useReview } from './ReviewContext';

type LineChange = {
  id: string;
  oldLine: number | null;
  newLine: number | null;
  oldText: string;
  newText: string;
  newIndex: number;
  newCount: 0 | 1;
};

function stableId(source: string): string {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `line-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function buildLineChanges(lines: DiffLine[], newLineCount: number): LineChange[] {
  const changes: LineChange[] = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].type === 'equal') {
      index += 1;
      continue;
    }

    const run: DiffLine[] = [];
    while (index < lines.length && lines[index].type !== 'equal') {
      run.push(lines[index]);
      index += 1;
    }
    const deleted = run.filter((line) => line.type === 'del');
    const added = run.filter((line) => line.type === 'add');
    const nextNewLine = lines[index]?.newLine ?? newLineCount + 1;

    for (let pairIndex = 0; pairIndex < Math.max(deleted.length, added.length); pairIndex += 1) {
      const oldLine = deleted[pairIndex] ?? null;
      const newLine = added[pairIndex] ?? null;
      const newIndex = newLine?.newLine != null ? newLine.newLine - 1 : Math.max(0, nextNewLine - 1);
      const source = `${oldLine?.oldLine ?? ''}|${newLine?.newLine ?? ''}|${oldLine?.text ?? ''}|${newLine?.text ?? ''}`;
      changes.push({
        id: stableId(source),
        oldLine: oldLine?.oldLine ?? null,
        newLine: newLine?.newLine ?? null,
        oldText: oldLine?.text ?? '',
        newText: newLine?.text ?? '',
        newIndex,
        newCount: newLine ? 1 : 0,
      });
    }
  }

  return changes;
}

function applyLineChange(markdown: string, change: LineChange, replacement: string): string {
  const trailingNewline = markdown.endsWith('\n');
  const lines = markdown.split('\n');
  if (trailingNewline) lines.pop();
  const replacementLines = replacement === '' ? [] : replacement.split('\n');
  lines.splice(change.newIndex, change.newCount, ...replacementLines);
  const next = lines.join('\n');
  return trailingNewline ? `${next}\n` : next;
}

function IntralineText({
  parts,
  side,
}: {
  parts: WordDiffPart[];
  side: 'old' | 'new';
}) {
  return (
    <>
      {parts.map((part, index) =>
        part.changed ? (
          <mark
            key={index}
            className={
              side === 'old'
                ? 'rounded-sm bg-rose-300/80 text-inherit dark:bg-rose-700/70'
                : 'rounded-sm bg-emerald-300/80 text-inherit dark:bg-emerald-700/70'
            }
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

function ChangeRow({
  change,
  index,
  approved,
  unsaved,
  selected,
  onSelect,
  onApprove,
  onApply,
  onRevert,
}: {
  change: LineChange;
  index: number;
  approved: boolean;
  unsaved: boolean;
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onApply: (replacement: string) => void;
  onRevert: () => void;
}) {
  const { meta: { labels } } = useReview();
  const [replacement, setReplacement] = useState(change.newText);
  const { oldParts, newParts } = useMemo(
    () => wordDiff(change.oldText, change.newText),
    [change.newText, change.oldText],
  );

  return (
    <section
      className={`overflow-hidden rounded-xl border ${
        selected
          ? 'border-rose-500 ring-1 ring-rose-500'
          : approved
            ? 'border-emerald-400 dark:border-emerald-700'
            : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 dark:bg-neutral-900">
        <button type="button" onClick={onSelect} className="text-start text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          {labels.editChange} {index + 1} · {change.newLine ?? change.oldLine}
          {unsaved ? (
            <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              {labels.unsavedChange}
            </span>
          ) : null}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              approved
                ? 'bg-emerald-600 text-white'
                : 'border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
            }`}
          >
            {approved ? labels.changeApproved : labels.approveChange}
          </button>
          <button
            type="button"
            onClick={onRevert}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-neutral-900 dark:text-rose-300"
          >
            {labels.revertChange}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 bg-white font-mono text-xs dark:bg-neutral-900">
        <div className="min-w-0 border-e border-neutral-200 dark:border-neutral-800">
          <p className="bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
            {labels.headColumn}
          </p>
          <div className={`min-h-12 whitespace-pre-wrap break-words p-3 ${change.oldLine ? 'bg-rose-50 text-rose-950 dark:bg-rose-950/30 dark:text-rose-100' : ''}`}>
            <span className="me-2 text-neutral-400">{change.oldLine ?? ''}</span>
            <IntralineText parts={oldParts} side="old" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
            {labels.draftColumn}
          </p>
          {selected ? (
            <>
              <textarea
                autoFocus
                spellCheck={false}
                aria-label={`${labels.editChange} ${index + 1}`}
                value={replacement}
                onChange={(event) => setReplacement(event.target.value)}
                className="min-h-24 flex-1 resize-y bg-emerald-50 p-3 font-mono text-xs leading-relaxed text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 dark:bg-emerald-950/30 dark:text-emerald-100"
              />
              <button
                type="button"
                onClick={() => onApply(replacement)}
                className="m-2 self-end rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                {labels.applyEdit}
              </button>
            </>
          ) : (
            <div className={`min-h-12 whitespace-pre-wrap break-words p-3 ${change.newLine ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100' : ''}`}>
              <span className="me-2 text-neutral-400">{change.newLine ?? ''}</span>
              <IntralineText parts={newParts} side="new" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function sourceElement(node: Node | null, root: HTMLElement): HTMLElement | null {
  const element = node instanceof HTMLElement ? node : node?.parentElement;
  const source = element?.closest<HTMLElement>('[data-source-start]');
  return source && root.contains(source) ? source : null;
}

export function ReviewWorkspace() {
  const {
    state: { payload, ui, dirty },
    actions,
    meta: { labels, isHe },
  } = useReview();
  const [renderedHtml, setRenderedHtml] = useState('');
  const [annotatedHtml, setAnnotatedHtml] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState('');
  const [commentPosition, setCommentPosition] = useState<{ top: number; left: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const deferredDraft = useDeferredValue(ui.editorDraft);
  const reviewPane = ui.view === 'diff' ? 'changes' : ui.view === 'editor' ? 'markdown' : 'preview';

  const lineDiff = useMemo(
    () => payload ? diffLines(payload.session.baselineMarkdown, deferredDraft) : [],
    [deferredDraft, payload],
  );
  const lineChanges = useMemo(
    () => buildLineChanges(lineDiff, deferredDraft.split('\n').length),
    [deferredDraft, lineDiff],
  );
  const unsavedDiff = useMemo(
    () => payload ? diffLines(payload.session.workingMarkdown, deferredDraft) : [],
    [deferredDraft, payload],
  );
  const unsavedNewLines = useMemo(
    () => new Set(unsavedDiff.flatMap((line) => line.type === 'add' && line.newLine ? [line.newLine] : [])),
    [unsavedDiff],
  );
  const unsavedOldLines = useMemo(
    () => new Set(unsavedDiff.flatMap((line) => line.type === 'del' && line.oldLine ? [line.oldLine] : [])),
    [unsavedDiff],
  );
  const isUnsavedChange = (change: LineChange) =>
    (change.newLine !== null && unsavedNewLines.has(change.newLine)) ||
    (change.oldLine !== null && unsavedOldLines.has(change.oldLine));
  const approvedChangeIds = payload?.session.approvedChangeIds;
  const visibleChanges = useMemo(
    () =>
      lineChanges.filter((change) => {
        const unsaved =
          (change.newLine !== null && unsavedNewLines.has(change.newLine)) ||
          (change.oldLine !== null && unsavedOldLines.has(change.oldLine));
        if (ui.changeFilter === 'unsaved') return unsaved;
        const approved = approvedChangeIds?.includes(change.id) ?? false;
        return !approved || unsaved;
      }),
    [approvedChangeIds, lineChanges, ui.changeFilter, unsavedNewLines, unsavedOldLines],
  );
  const unsavedChangeCount = lineChanges.filter(isUnsavedChange).length;
  const added = lineDiff.filter((line) => line.type === 'add').length;
  const removed = lineDiff.filter((line) => line.type === 'del').length;

  useEffect(() => {
    let active = true;
    setPreviewLoading(true);
    void renderMarkdownPreview(deferredDraft)
      .then((html) => {
        if (!active) return;
        setRenderedHtml(html);
        setPreviewError(null);
      })
      .catch(() => {
        if (active) setPreviewError(labels.previewError);
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [deferredDraft, labels.previewError]);

  useEffect(() => {
    if (typeof DOMParser === 'undefined') return;
    const documentNode = new DOMParser().parseFromString(`<div id="review-preview-root">${renderedHtml}</div>`, 'text/html');
    const root = documentNode.querySelector<HTMLElement>('#review-preview-root');
    if (!root) return;
    const sourceElements = [...root.querySelectorAll<HTMLElement>('[data-source-start]')];
    const reviewHosts = new Map<HTMLElement, HTMLElement>();

    for (const change of visibleChanges) {
      const line = change.newLine;
      if (line === null) continue;
      const target = sourceElements
        .filter((element) => {
          const start = Number(element.dataset.sourceStart);
          const end = Number(element.dataset.sourceEnd);
          return start <= line && end >= line;
        })
        .sort((first, second) => {
          const firstSpan = Number(first.dataset.sourceEnd) - Number(first.dataset.sourceStart);
          const secondSpan = Number(second.dataset.sourceEnd) - Number(second.dataset.sourceStart);
          return firstSpan - secondSpan;
        })[0];
      if (!target) continue;

      target.classList.add('review-inline-change');
      const review = documentNode.createElement('span');
      review.className = 'review-inline-review';
      review.setAttribute('data-review-change-id', change.id);

      const oldText = documentNode.createElement('span');
      oldText.className = 'review-inline-old';
      oldText.textContent = `− ${change.oldText || '(empty)'}`;
      const newText = documentNode.createElement('span');
      newText.className = 'review-inline-new';
      newText.textContent = `+ ${change.newText || '(deleted)'}`;

      const actionsNode = documentNode.createElement('span');
      actionsNode.className = 'review-inline-review-actions';
      const approve = documentNode.createElement('button');
      approve.type = 'button';
      approve.dataset.reviewAction = 'approve';
      approve.dataset.changeId = change.id;
      approve.textContent = labels.approveChange;
      const revert = documentNode.createElement('button');
      revert.type = 'button';
      revert.dataset.reviewAction = 'revert';
      revert.dataset.changeId = change.id;
      revert.textContent = labels.revertChange;
      actionsNode.append(approve, revert);
      review.append(oldText, newText, actionsNode);
      let host = reviewHosts.get(target);
      if (!host) {
        host = documentNode.createElement('span');
        host.className = 'review-inline-review-list';
        target.after(host);
        reviewHosts.set(target, host);
      }
      host.append(review);
    }

    setAnnotatedHtml(root.innerHTML);
  }, [labels.approveChange, labels.revertChange, renderedHtml, visibleChanges]);

  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    root.querySelectorAll('.review-commented-block').forEach((element) => {
      element.classList.remove('review-commented-block');
    });
    payload?.session.comments
      .filter((comment) => comment.status === 'open')
      .forEach((comment) => {
        root.querySelectorAll<HTMLElement>('[data-source-start]').forEach((element) => {
          const start = Number(element.dataset.sourceStart);
          const end = Number(element.dataset.sourceEnd);
          if (start <= comment.range.endLine && end >= comment.range.startLine) {
            element.classList.add('review-commented-block');
          }
        });
      });
  }, [annotatedHtml, payload]);

  const captureSelection = () => {
    const root = previewRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.isCollapsed) return;
    const anchor = sourceElement(selection.anchorNode, root);
    const focus = sourceElement(selection.focusNode, root);
    if (!anchor || !focus) return;
    const startLine = Math.min(Number(anchor.dataset.sourceStart), Number(focus.dataset.sourceStart));
    const endLine = Math.max(Number(anchor.dataset.sourceEnd), Number(focus.dataset.sourceEnd));
    if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) return;
    const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
    const popoverWidth = Math.min(440, window.innerWidth - 24);
    setCommentPosition({
      top: Math.max(12, Math.min(window.innerHeight - 170, selectionRect.bottom + 10)),
      left: Math.max(12, Math.min(selectionRect.left, window.innerWidth - popoverWidth - 12)),
    });
    actions.selectLine(startLine, false);
    if (endLine !== startLine) actions.selectLine(endLine, true);
    setSelectedQuote(selection.toString().trim());
  };

  return (
    <section className="review-workspace">
      <div className={reviewPane === 'changes' ? 'hidden' : 'flex min-h-0 flex-col'}>
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
          <div className="flex gap-1">
            <button
              type="button"
              aria-pressed={reviewPane === 'preview'}
              onClick={() => actions.setView('article')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${reviewPane === 'preview' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
            >
              {labels.previewView}
            </button>
            <button
              type="button"
              aria-pressed={reviewPane === 'markdown'}
              onClick={() => actions.setView('editor')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${reviewPane === 'markdown' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''}`}
            >
              {labels.markdownView}
            </button>
            <button
              type="button"
              aria-pressed={false}
              onClick={() => actions.setView('diff')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              {labels.changesView}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {previewLoading && reviewPane === 'preview' ? <span className="text-xs text-neutral-500">{labels.renderingPreview}</span> : null}
            {dirty ? <button type="button" onClick={() => actions.clearDraft()} className="rounded-lg px-2 py-1 text-xs font-medium">{labels.clearDraft}</button> : null}
            <button
              type="button"
              onClick={() => void actions.confirmSave()}
              disabled={!dirty || ui.savePhase === 'saving'}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {ui.savePhase === 'saving' ? labels.saving : ui.savePhase === 'saved' ? labels.saved : labels.saveFile}
            </button>
          </div>
        </div>
        {ui.saveError ? <p className="px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{ui.saveError}</p> : null}
        {reviewPane === 'markdown' ? (
          <textarea
            dir={isHe ? 'rtl' : 'ltr'}
            spellCheck={false}
            aria-label={labels.editorLabel}
            value={ui.editorDraft}
            onChange={(event) => actions.setEditorDraft(event.target.value)}
            className="min-h-[32rem] flex-1 resize-none bg-white p-4 font-mono text-sm leading-relaxed text-neutral-900 focus-visible:outline-none dark:bg-neutral-950 dark:text-neutral-100"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto bg-neutral-50 p-4 dark:bg-neutral-950">
            {ui.selectedRange && commentPosition ? (
              <div
                role="dialog"
                aria-label={labels.comment}
                className="fixed z-50 w-[min(440px,calc(100vw-24px))] space-y-2 rounded-xl border border-rose-300 bg-white p-3 shadow-xl dark:border-rose-800 dark:bg-neutral-900"
                style={{ top: commentPosition.top, left: commentPosition.left }}
              >
                <p className="text-xs font-semibold text-neutral-500">
                  {labels.selectedLines} {ui.selectedRange.startLine}-{ui.selectedRange.endLine}
                </p>
                {selectedQuote ? <p className="line-clamp-2 text-sm italic text-neutral-600 dark:text-neutral-300">“{selectedQuote}”</p> : null}
                <div className="flex gap-2">
                  <input
                    value={ui.commentDraft}
                    onChange={(event) => actions.setCommentDraft(event.target.value)}
                    placeholder={labels.comment}
                    className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <button
                    type="button"
                    disabled={!ui.commentDraft.trim()}
                    onClick={() => {
                      void actions.addComment().then(() => {
                        setSelectedQuote('');
                        setCommentPosition(null);
                        actions.clearRange();
                      });
                    }}
                    className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    {labels.addComment}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCommentPosition(null);
                      actions.clearRange();
                    }}
                    className="rounded-lg px-2 text-xs"
                  >
                    {labels.cancel}
                  </button>
                </div>
              </div>
            ) : null}
            {previewError ? <p className="text-sm text-rose-700 dark:text-rose-300">{previewError}</p> : null}
            <article
              ref={previewRef}
              onMouseUp={captureSelection}
              onClick={(event) => {
                const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-review-action]');
                const changeId = button?.dataset.changeId;
                const change = visibleChanges.find((item) => item.id === changeId);
                if (!button || !change) return;
                if (button.dataset.reviewAction === 'approve') {
                  void actions.setChangeApproval(change.id, true);
                } else {
                  actions.setEditorDraft(applyLineChange(ui.editorDraft, change, change.oldText));
                }
              }}
              dir={isHe ? 'rtl' : 'ltr'}
              className="relative mx-auto max-w-3xl select-text rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-10"
            >
              <div
                className="prose max-w-none text-neutral-800 dark:prose-invert dark:text-neutral-200"
                dangerouslySetInnerHTML={{ __html: annotatedHtml || renderedHtml }}
              />
              <MermaidRenderer />
            </article>
          </div>
        )}
      </div>

      <div dir="ltr" className={reviewPane === 'changes' ? 'flex min-h-0 flex-col' : 'hidden'}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => actions.setView('article')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              {labels.previewView}
            </button>
            <button
              type="button"
              onClick={() => actions.setView('editor')}
              className="rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              {labels.markdownView}
            </button>
            <button
              type="button"
              aria-pressed="true"
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
            >
              {labels.changesView}
            </button>
            <button
              type="button"
              aria-pressed={ui.changeFilter === 'all'}
              onClick={() => actions.setChangeFilter('all')}
              className={`rounded-lg px-2 py-1 text-xs ${
                ui.changeFilter === 'all' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : ''
              }`}
            >
              {labels.allChanges}
            </button>
            <button
              type="button"
              aria-pressed={ui.changeFilter === 'unsaved'}
              onClick={() => actions.setChangeFilter('unsaved')}
              className={`rounded-lg px-2 py-1 text-xs ${
                ui.changeFilter === 'unsaved' ? 'bg-amber-200 text-amber-950 dark:bg-amber-800 dark:text-amber-50' : ''
              }`}
            >
              {labels.unsavedChanges} ({unsavedChangeCount})
            </button>
          </div>
          <p className="text-xs text-neutral-500">+{added} / -{removed}</p>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-neutral-50 p-4 dark:bg-neutral-950">
          {visibleChanges.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {ui.changeFilter === 'unsaved'
                ? labels.noUnsavedChanges
                : lineChanges.length === 0
                  ? labels.noChanges
                  : labels.allReviewed}
            </p>
          ) : (
            visibleChanges.map((change, index) => (
              <ChangeRow
                key={change.id}
                change={change}
                index={index}
                approved={payload?.session.approvedChangeIds.includes(change.id) ?? false}
                unsaved={isUnsavedChange(change)}
                selected={selectedChange === change.id}
                onSelect={() => setSelectedChange((current) => current === change.id ? null : change.id)}
                onApprove={() =>
                  void actions.setChangeApproval(
                    change.id,
                    !(payload?.session.approvedChangeIds.includes(change.id) ?? false),
                  )
                }
                onApply={(replacement) => {
                  actions.setEditorDraft(applyLineChange(ui.editorDraft, change, replacement));
                  setSelectedChange(null);
                }}
                onRevert={() => {
                  actions.setEditorDraft(applyLineChange(ui.editorDraft, change, change.oldText));
                  setSelectedChange(null);
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
