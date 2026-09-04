import type { DiffLine, ReviewDiff, UnifiedHunk } from './types';
import { splitLines } from './text';

const CONTEXT_RADIUS = 3;

export function diffHunkId(hunk: UnifiedHunk): string {
  const source = [
    hunk.oldStart,
    hunk.oldCount,
    hunk.newStart,
    hunk.newCount,
    ...hunk.lines.map((line) => `${line.type}:${line.text}`),
  ].join('|');
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `hunk-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function buildLcsTable(a: string[], b: string[]): number[][] {
  const rows = a.length;
  const cols = b.length;
  const table: number[][] = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  return table;
}

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  const table = buildLcsTable(oldLines, newLines);
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      lines.push({ type: 'equal', text: oldLines[i], oldLine: i + 1, newLine: j + 1 });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({ type: 'del', text: oldLines[i], oldLine: i + 1, newLine: null });
      i += 1;
    } else {
      lines.push({ type: 'add', text: newLines[j], oldLine: null, newLine: j + 1 });
      j += 1;
    }
  }

  while (i < oldLines.length) {
    lines.push({ type: 'del', text: oldLines[i], oldLine: i + 1, newLine: null });
    i += 1;
  }

  while (j < newLines.length) {
    lines.push({ type: 'add', text: newLines[j], oldLine: null, newLine: j + 1 });
    j += 1;
  }

  return lines;
}

function collectHunks(lines: DiffLine[]): UnifiedHunk[] {
  const changeIndexes = lines
    .map((line, index) => (line.type === 'equal' ? -1 : index))
    .filter((index) => index >= 0);

  if (changeIndexes.length === 0) return [];

  const hunks: UnifiedHunk[] = [];
  let hunkStart = Math.max(0, changeIndexes[0] - CONTEXT_RADIUS);
  let lastChange = changeIndexes[0];

  const flush = (endExclusive: number) => {
    const slice = lines.slice(hunkStart, endExclusive);
    const oldLines = slice.filter((line) => line.type !== 'add');
    const newLines = slice.filter((line) => line.type !== 'del');
    const oldStart = oldLines.find((line) => line.oldLine !== null)?.oldLine ?? 0;
    const newStart = newLines.find((line) => line.newLine !== null)?.newLine ?? 0;
    hunks.push({
      oldStart,
      oldCount: oldLines.length,
      newStart,
      newCount: newLines.length,
      lines: slice,
    });
  };

  for (let index = 1; index < changeIndexes.length; index += 1) {
    const changeIndex = changeIndexes[index];
    if (changeIndex > lastChange + CONTEXT_RADIUS * 2 + 1) {
      flush(Math.min(lines.length, lastChange + CONTEXT_RADIUS + 1));
      hunkStart = Math.max(0, changeIndex - CONTEXT_RADIUS);
    }
    lastChange = changeIndex;
  }

  flush(Math.min(lines.length, lastChange + CONTEXT_RADIUS + 1));
  return hunks;
}

function formatHunk(hunk: UnifiedHunk): string {
  const header = `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`;
  const body = hunk.lines.map((line) => {
    if (line.type === 'add') return `+${line.text}`;
    if (line.type === 'del') return `-${line.text}`;
    return ` ${line.text}`;
  });
  return [header, ...body].join('\n');
}

export function createReviewDiff(input: {
  relativePath: string;
  fromLabel: string;
  toLabel: string;
  fromText: string;
  toText: string;
}): ReviewDiff {
  const lines = diffLines(input.fromText, input.toText);
  const hunks = collectHunks(lines);
  const unified =
    hunks.length === 0
      ? ''
      : [
          `--- a/${input.relativePath} (${input.fromLabel})`,
          `+++ b/${input.relativePath} (${input.toLabel})`,
          ...hunks.map(formatHunk),
        ].join('\n') + '\n';

  return {
    fromLabel: input.fromLabel,
    toLabel: input.toLabel,
    relativePath: input.relativePath,
    hunks,
    unified,
    changedNewLines: lines.flatMap((line) => (line.type === 'add' && line.newLine ? [line.newLine] : [])),
    changedOldLines: lines.flatMap((line) => (line.type === 'del' && line.oldLine ? [line.oldLine] : [])),
  };
}
