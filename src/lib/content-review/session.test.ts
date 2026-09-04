import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashContent } from './hash';
import { compileReviewPrompt } from './prompt';
import {
  ConflictError,
  addComment,
  addProposedEdit,
  applyDirectSave,
  assertDiskHash,
  createRevision,
  createSession,
  markOutdatedAnnotations,
  resolveComment,
  setApproval,
  setChangeApproval,
  snapshotBeforeSave,
  syncWorkingMarkdown,
} from './session';

function sessionFixture(markdown = '## Hello\nKeep this.\nChange me.\n') {
  return createSession({
    lang: 'en',
    slug: 'building-an-effective-context-layer-part-4',
    relativePath: 'content/tech-blog/en/building-an-effective-context-layer-part-4.md',
    baselineCommit: 'abc1234',
    baselineMarkdown: markdown,
    workingMarkdown: markdown,
    now: '2026-08-27T10:00:00.000Z',
  });
}

describe('review session behavior', () => {
  it('creates numbered revisions from the working file', () => {
    const created = createRevision(sessionFixture(), 'comments', '2026-08-27T10:01:00.000Z');
    assert.equal(created.revisions.length, 1);
    assert.equal(created.revisions[0].id, 1);
    assert.equal(created.nextRevisionId, 2);
    assert.equal(created.revisions[0].contentHash, created.workingHash);
    assert.equal(created.revisions[0].reason, 'comments');
  });

  it('stores comments with copied source context', () => {
    const commented = addComment(sessionFixture(), {
      id: 'c1',
      range: { startLine: 3, endLine: 3 },
      text: 'Tighten this sentence.',
      now: '2026-08-27T10:02:00.000Z',
    });
    assert.equal(commented.comments[0].context, 'Change me.\n');
    assert.equal(commented.comments[0].status, 'open');
    assert.equal(commented.comments[0].revisionId, 0);
  });

  it('marks comments and proposed edits outdated when source context no longer matches', () => {
    let session = addComment(sessionFixture(), {
      id: 'c1',
      range: { startLine: 3, endLine: 3 },
      text: 'Need a clearer claim.',
      now: '2026-08-27T10:02:00.000Z',
    });
    session = addProposedEdit(session, {
      id: 'e1',
      range: { startLine: 3, endLine: 3 },
      replacement: 'Say this instead.\n',
      now: '2026-08-27T10:03:00.000Z',
    });

    const updated = syncWorkingMarkdown(session, '## Hello\nKeep this.\nChanged already.\n');
    assert.equal(updated.comments[0].status, 'outdated');
    assert.equal(updated.proposedEdits[0].status, 'outdated');
  });

  it('keeps matching comments open after unrelated edits', () => {
    const session = addComment(sessionFixture(), {
      id: 'c1',
      range: { startLine: 2, endLine: 2 },
      text: 'This line is still true.',
      now: '2026-08-27T10:02:00.000Z',
    });
    const updated = markOutdatedAnnotations(
      syncWorkingMarkdown(session, '## Hello\nKeep this.\nA different third line.\n'),
    );
    assert.equal(updated.comments[0].status, 'open');
  });

  it('resolves comments without changing outdated ones', () => {
    let session = addComment(sessionFixture(), {
      id: 'c1',
      range: { startLine: 3, endLine: 3 },
      text: 'Fix later.',
      now: '2026-08-27T10:02:00.000Z',
    });
    session = resolveComment(session, 'c1');
    assert.equal(session.comments[0].status, 'resolved');
  });

  it('allows approval transitions', () => {
    const pending = sessionFixture();
    assert.equal(setApproval(pending, 'approved').approval, 'approved');
    assert.equal(setApproval(pending, 'changes_requested').approval, 'changes_requested');
    assert.equal(setApproval(setApproval(pending, 'approved'), 'pending').approval, 'pending');
  });

  it('persists approval decisions for individual diff hunks', () => {
    const approved = setChangeApproval(sessionFixture(), 'hunk-12345678', true);
    assert.deepEqual(approved.approvedChangeIds, ['hunk-12345678']);
    const removed = setChangeApproval(approved, 'hunk-12345678', false);
    assert.deepEqual(removed.approvedChangeIds, []);
  });

  it('rejects optimistic saves when the disk hash does not match', () => {
    const disk = '## Hello\nKeep this.\nDisk changed.\n';
    assert.throws(
      () => assertDiskHash(disk, hashContent('## Hello\nKeep this.\nChange me.\n')),
      (error: unknown) => {
        assert.ok(error instanceof ConflictError);
        assert.equal(error.diskHash, hashContent(disk));
        assert.equal(error.diskMarkdown, disk);
        return true;
      },
    );
  });

  it('snapshots the previous Markdown before applying a direct save', () => {
    const original = sessionFixture();
    const snapped = snapshotBeforeSave(original, '2026-08-27T10:04:00.000Z');
    const saved = applyDirectSave(snapped, '## Hello\nKeep this.\nSaved version.\n');
    assert.equal(snapped.revisions[0].markdown, original.workingMarkdown);
    assert.equal(saved.workingMarkdown, '## Hello\nKeep this.\nSaved version.\n');
    assert.equal(saved.workingHash, hashContent(saved.workingMarkdown));
    assert.notEqual(saved.workingHash, snapped.revisions[0].contentHash);
  });

  it('compiles unresolved comments and active edits into one prompt', () => {
    let session = addComment(sessionFixture(), {
      id: 'c1',
      range: { startLine: 3, endLine: 3 },
      text: 'Replace with a sharper line.',
      now: '2026-08-27T10:02:00.000Z',
    });
    session = addComment(session, {
      id: 'c2',
      range: { startLine: 1, endLine: 1 },
      text: 'Heading is fine.',
      now: '2026-08-27T10:02:30.000Z',
    });
    session = resolveComment(session, 'c2');
    session = addProposedEdit(session, {
      id: 'e1',
      range: { startLine: 3, endLine: 3 },
      replacement: 'A sharper line.\n',
      now: '2026-08-27T10:03:00.000Z',
    });

    const prompt = compileReviewPrompt(session);
    assert.match(prompt, /File: content\/tech-blog\/en\/building-an-effective-context-layer-part-4.md/);
    assert.match(prompt, /Baseline commit: abc1234/);
    assert.match(prompt, /Replace with a sharper line/);
    assert.match(prompt, /A sharper line/);
    assert.doesNotMatch(prompt, /Heading is fine/);

    const withResolved = compileReviewPrompt(session, { includeResolved: true });
    assert.match(withResolved, /Heading is fine/);
  });
});
