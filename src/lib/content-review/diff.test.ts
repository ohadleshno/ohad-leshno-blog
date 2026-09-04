import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createReviewDiff, diffLines } from './diff';

describe('review diffs', () => {
  it('produces a deterministic unified diff', () => {
    const from = 'alpha\nbeta\ngamma\n';
    const to = 'alpha\nbeta-edited\ngamma\ndelta\n';
    const first = createReviewDiff({
      relativePath: 'content/tech-blog/en/example.md',
      fromLabel: 'HEAD abcdef0',
      toLabel: 'working',
      fromText: from,
      toText: to,
    });
    const second = createReviewDiff({
      relativePath: 'content/tech-blog/en/example.md',
      fromLabel: 'HEAD abcdef0',
      toLabel: 'working',
      fromText: from,
      toText: to,
    });

    assert.equal(first.unified, second.unified);
    assert.match(first.unified, /--- a\/content\/tech-blog\/en\/example.md \(HEAD abcdef0\)/);
    assert.match(first.unified, /\+beta-edited/);
    assert.match(first.unified, /\+delta/);
    assert.deepEqual(first.changedNewLines, [2, 4]);
    assert.deepEqual(first.changedOldLines, [2]);
  });

  it('returns an empty unified diff when files match', () => {
    const diff = createReviewDiff({
      relativePath: 'content/tech-blog/en/example.md',
      fromLabel: 'HEAD',
      toLabel: 'working',
      fromText: 'same\n',
      toText: 'same\n',
    });
    assert.equal(diff.unified, '');
    assert.equal(diff.hunks.length, 0);
  });

  it('keeps line numbers aligned for side by side rendering', () => {
    const lines = diffLines('one\ntwo\nthree\n', 'one\nTWO\nthree\nfour\n');
    assert.deepEqual(
      lines.map((line) => [line.type, line.oldLine, line.newLine, line.text]),
      [
        ['equal', 1, 1, 'one'],
        ['del', 2, null, 'two'],
        ['add', null, 2, 'TWO'],
        ['equal', 3, 3, 'three'],
        ['add', null, 4, 'four'],
      ],
    );
  });
});
