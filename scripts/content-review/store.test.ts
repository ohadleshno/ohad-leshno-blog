import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { hashContent } from '../../src/lib/content-review';
import { atomicWriteFile } from './atomic';
import { isLocalOrigin } from './origin';
import { ReviewStore } from './store';

const tempRoots: string[] = [];

async function makeRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'content-review-'));
  tempRoots.push(repoRoot);
  const articleDir = path.join(repoRoot, 'content', 'tech-blog', 'en');
  const articlePath = path.join(articleDir, 'building-an-effective-context-layer-part-4.md');
  const original = '## Hello\nKeep this.\nChange me.\n';
  await mkdir(articleDir, { recursive: true });
  await writeFile(articlePath, original, 'utf8');
  return {
    repoRoot,
    articlePath,
    original,
    store: new ReviewStore({
      repoRoot,
      reviewsDir: path.join(repoRoot, '.scratch', 'content-reviews'),
      now: () => '2026-08-27T12:00:00.000Z',
      createId: () => 'id-1',
      readHeadCommit: () => 'abc1234def',
      readHeadFile: () => '## Hello\nKeep this.\nOriginal line.\n',
    }),
  };
}

after(async () => {
  await Promise.all(tempRoots.map((root) => rm(root, { recursive: true, force: true })));
});

describe('review origin checks', () => {
  it('allows localhost and 127.0.0.1, and rejects remote origins', () => {
    assert.equal(isLocalOrigin('http://localhost:3000'), true);
    assert.equal(isLocalOrigin('http://127.0.0.1:3000'), true);
    assert.equal(isLocalOrigin(null), true);
    assert.equal(isLocalOrigin('https://example.com'), false);
    assert.equal(isLocalOrigin('not a url'), false);
  });
});

describe('atomic writes and review persistence', () => {
  it('writes files atomically', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'atomic-write-'));
    tempRoots.push(dir);
    const filePath = path.join(dir, 'note.md');
    await atomicWriteFile(filePath, 'first\n');
    await atomicWriteFile(filePath, 'second\n');
    assert.equal(await readFile(filePath, 'utf8'), 'second\n');
  });

  it('saves Markdown only when the expected hash matches disk', async () => {
    const { store, articlePath, original } = await makeRepo();
    const loaded = await store.load('en', 'building-an-effective-context-layer-part-4');
    assert.equal(loaded.session.baselineCommit, 'abc1234def');
    assert.equal(loaded.session.workingHash, hashContent(original));

    const next = '## Hello\nKeep this.\nSaved line.\n';
    const saved = await store.saveMarkdown(
      'en',
      'building-an-effective-context-layer-part-4',
      next,
      loaded.session.workingHash,
    );

    assert.equal(await readFile(articlePath, 'utf8'), next);
    assert.equal(saved.session.workingMarkdown, next);
    assert.equal(saved.session.revisions.length, 1);
    assert.equal(saved.session.revisions[0].reason, 'direct_save');
    assert.equal(saved.session.revisions[0].markdown, original);
  });

  it('rejects conflicting saves without overwriting disk', async () => {
    const { store, articlePath, original } = await makeRepo();
    await writeFile(articlePath, '## Hello\nKeep this.\nExternal change.\n', 'utf8');

    await assert.rejects(
      () =>
        store.saveMarkdown(
          'en',
          'building-an-effective-context-layer-part-4',
          '## Hello\nKeep this.\nBrowser draft.\n',
          hashContent(original),
        ),
      /Working file changed on disk/,
    );

    assert.equal(await readFile(articlePath, 'utf8'), '## Hello\nKeep this.\nExternal change.\n');
  });
});
