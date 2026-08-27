import type { LineRange } from './types';

export function splitLines(text: string): string[] {
  if (text === '') return [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

export function joinLines(lines: string[]): string {
  if (lines.length === 0) return '';
  return `${lines.join('\n')}\n`;
}

export function assertLineRange(range: LineRange, lineCount: number): LineRange {
  if (!Number.isInteger(range.startLine) || !Number.isInteger(range.endLine)) {
    throw new Error('Line range must use integers');
  }
  if (range.startLine < 1 || range.endLine < range.startLine) {
    throw new Error('Invalid line range');
  }
  if (lineCount === 0) {
    throw new Error('Cannot select lines in an empty file');
  }
  if (range.endLine > lineCount) {
    throw new Error('Line range is outside the file');
  }
  return range;
}

export function extractRange(markdown: string, range: LineRange): string {
  const lines = splitLines(markdown);
  assertLineRange(range, lines.length);
  return joinLines(lines.slice(range.startLine - 1, range.endLine));
}

export function replaceRange(markdown: string, range: LineRange, replacement: string): string {
  const lines = splitLines(markdown);
  assertLineRange(range, lines.length);
  const replacementLines = splitLines(replacement);
  return joinLines([
    ...lines.slice(0, range.startLine - 1),
    ...replacementLines,
    ...lines.slice(range.endLine),
  ]);
}

export function headingSections(markdown: string): Array<{ heading: string; startLine: number; endLine: number }> {
  const lines = splitLines(markdown);
  const headings: Array<{ heading: string; startLine: number; level: number }> = [];

  lines.forEach((line, index) => {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) return;
    headings.push({
      heading: match[2],
      startLine: index + 1,
      level: match[1].length,
    });
  });

  return headings.map((heading, index) => ({
    heading: heading.heading,
    startLine: heading.startLine,
    endLine: index + 1 < headings.length ? headings[index + 1].startLine - 1 : lines.length,
  }));
}
