import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { assertReviewIdentity, techBlogRelativePath } from './identity';
import { resolveSafeMarkdownPath } from './path';

describe('review identity and path validation', () => {
  it('accepts tech blog language and slug pairs', () => {
    assert.deepEqual(assertReviewIdentity('en', 'building-an-effective-context-layer-part-4'), {
      lang: 'en',
      slug: 'building-an-effective-context-layer-part-4',
    });
    assert.equal(
      techBlogRelativePath('he', 'building-an-effective-context-layer-part-5'),
      'content/tech-blog/he/building-an-effective-context-layer-part-5.md',
    );
  });

  it('rejects unknown languages and unsafe slugs', () => {
    assert.throws(() => assertReviewIdentity('fr', 'hello'), /Invalid review language/);
    assert.throws(() => assertReviewIdentity('en', '../secret'), /Invalid review slug/);
    assert.throws(() => assertReviewIdentity('en', 'Hello.md'), /Invalid review slug/);
    assert.throws(() => assertReviewIdentity('en', ''), /Invalid review slug/);
  });

  it('resolves Markdown only inside the tech blog directory', () => {
    const repoRoot = '/tmp/ohad-leshno-blog';
    const resolved = resolveSafeMarkdownPath(repoRoot, 'en', 'building-an-effective-context-layer-part-4');
    assert.equal(resolved.relativePath, 'content/tech-blog/en/building-an-effective-context-layer-part-4.md');
    assert.equal(
      resolved.absolutePath,
      path.resolve(repoRoot, 'content/tech-blog/en/building-an-effective-context-layer-part-4.md'),
    );
  });

  it('rejects traversal even if slug validation is bypassed at the filesystem layer', () => {
    const repoRoot = '/tmp/ohad-leshno-blog';
    assert.throws(
      () => resolveSafeMarkdownPath(repoRoot, 'en', 'building-an-effective-context-layer-part-4/../../secret'),
      /Invalid review slug/,
    );
  });
});
