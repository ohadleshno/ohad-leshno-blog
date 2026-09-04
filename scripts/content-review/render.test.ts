import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderMarkdown } from './render';

describe('review Markdown rendering', () => {
  it('renders article content with source line metadata', () => {
    const markdown = ['---', 'title: Test', '---', '', '## Heading', '', 'Paragraph text.', ''].join('\n');
    const rendered = renderMarkdown(markdown);
    assert.match(rendered, /<h2 data-source-start="5" data-source-end="5">Heading<\/h2>/);
    assert.match(rendered, /<p data-source-start="7" data-source-end="7">Paragraph text\.<\/p>/);
    assert.doesNotMatch(rendered, /title: Test/);
  });
});
