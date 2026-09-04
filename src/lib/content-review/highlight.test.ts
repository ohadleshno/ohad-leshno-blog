import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { changedHeadingTitles, highlightChangedHeadings } from './highlight';

describe('changed section highlighting', () => {
  it('maps changed lines to heading titles', () => {
    const markdown = '# Title\nIntro.\n## Layer 2\nKeep.\n## Layer 3\nChange this.\n';
    assert.deepEqual(changedHeadingTitles(markdown, [6]), ['Layer 3']);
  });

  it('adds a class to matching HTML headings', () => {
    const html = '<h2>Layer 2</h2><p>Keep.</p><h2>Layer 3</h2><p>Change this.</p>';
    const next = highlightChangedHeadings(html, ['Layer 3']);
    assert.match(next, /<h2 class="review-changed-heading">Layer 3<\/h2>/);
    assert.doesNotMatch(next, /<h2 class="review-changed-heading">Layer 2/);
  });
});
