import { hashContent } from './hash';
import { currentRevisionId } from './selectors';
import { extractRange, splitLines } from './text';
import type {
  ApprovalStatus,
  LineRange,
  ProposedEdit,
  ReviewComment,
  ReviewSession,
  RevisionReason,
} from './types';

export { activeProposedEdits, currentRevisionId, selectedMarkdown, unresolvedComments } from './selectors';

export type SessionClock = () => string;
export type SessionIdFactory = () => string;

export function createSession(input: {
  lang: ReviewSession['lang'];
  slug: string;
  relativePath: string;
  baselineCommit: string;
  baselineMarkdown: string;
  workingMarkdown: string;
  now: string;
}): ReviewSession {
  return {
    lang: input.lang,
    slug: input.slug,
    relativePath: input.relativePath,
    baselineCommit: input.baselineCommit,
    baselineMarkdown: input.baselineMarkdown,
    workingMarkdown: input.workingMarkdown,
    workingHash: hashContent(input.workingMarkdown),
    nextRevisionId: 1,
    revisions: [],
    comments: [],
    proposedEdits: [],
    approval: 'pending',
    approvedChangeIds: [],
  };
}

export function rangeStillMatches(markdown: string, range: LineRange, expected: string): boolean {
  try {
    return extractRange(markdown, range) === expected;
  } catch {
    return false;
  }
}

export function markOutdatedAnnotations(session: ReviewSession): ReviewSession {
  return {
    ...session,
    comments: session.comments.map((comment) => {
      if (comment.status !== 'open') return comment;
      return rangeStillMatches(session.workingMarkdown, comment.range, comment.context)
        ? comment
        : { ...comment, status: 'outdated' };
    }),
    proposedEdits: session.proposedEdits.map((edit) => {
      if (edit.status !== 'active') return edit;
      return rangeStillMatches(session.workingMarkdown, edit.range, edit.original)
        ? edit
        : { ...edit, status: 'outdated' };
    }),
  };
}

export function syncWorkingMarkdown(session: ReviewSession, workingMarkdown: string): ReviewSession {
  if (session.workingMarkdown === workingMarkdown && session.workingHash === hashContent(workingMarkdown)) {
    return markOutdatedAnnotations(session);
  }

  return markOutdatedAnnotations({
    ...session,
    workingMarkdown,
    workingHash: hashContent(workingMarkdown),
  });
}

export function addComment(
  session: ReviewSession,
  input: { range: LineRange; text: string; id: string; now: string; sourceMarkdown?: string },
): ReviewSession {
  const context = extractRange(input.sourceMarkdown ?? session.workingMarkdown, input.range);
  const comment: ReviewComment = {
    id: input.id,
    range: input.range,
    context,
    text: input.text.trim(),
    status: 'open',
    createdAt: input.now,
    revisionId: currentRevisionId(session),
  };

  if (!comment.text) {
    throw new Error('Comment text is required');
  }

  return {
    ...session,
    comments: [...session.comments, comment],
  };
}

export function resolveComment(session: ReviewSession, commentId: string): ReviewSession {
  const comments = session.comments.map((comment) => {
    if (comment.id !== commentId) return comment;
    if (comment.status === 'outdated') return comment;
    return { ...comment, status: 'resolved' as const };
  });

  if (!session.comments.some((comment) => comment.id === commentId)) {
    throw new Error('Comment not found');
  }

  return { ...session, comments };
}

export function addProposedEdit(
  session: ReviewSession,
  input: { range: LineRange; replacement: string; id: string; now: string },
): ReviewSession {
  const original = extractRange(session.workingMarkdown, input.range);
  const edit: ProposedEdit = {
    id: input.id,
    range: input.range,
    original,
    replacement: input.replacement,
    status: 'active',
    createdAt: input.now,
    revisionId: currentRevisionId(session),
  };

  return {
    ...session,
    proposedEdits: [...session.proposedEdits, edit],
  };
}

export function createRevision(session: ReviewSession, reason: RevisionReason, now: string): ReviewSession {
  const revision = {
    id: session.nextRevisionId,
    createdAt: now,
    reason,
    markdown: session.workingMarkdown,
    contentHash: session.workingHash,
  };

  return {
    ...session,
    nextRevisionId: session.nextRevisionId + 1,
    revisions: [...session.revisions, revision],
  };
}

export function setApproval(session: ReviewSession, approval: ApprovalStatus): ReviewSession {
  return { ...session, approval };
}

export function setChangeApproval(session: ReviewSession, changeId: string, approved: boolean): ReviewSession {
  const ids = new Set(session.approvedChangeIds ?? []);
  if (approved) ids.add(changeId);
  else ids.delete(changeId);
  return { ...session, approvedChangeIds: [...ids].sort() };
}

export function assertExpectedHash(session: ReviewSession, expectedHash: string): void {
  if (session.workingHash !== expectedHash) {
    throw new ConflictError('Working file changed since the last read', session.workingHash, session.workingMarkdown);
  }
}

export function assertDiskHash(diskMarkdown: string, expectedHash: string): void {
  const diskHash = hashContent(diskMarkdown);
  if (diskHash !== expectedHash) {
    throw new ConflictError('Working file changed on disk', diskHash, diskMarkdown);
  }
}

export function snapshotBeforeSave(session: ReviewSession, now: string): ReviewSession {
  return createRevision(session, 'direct_save', now);
}

export function applyDirectSave(session: ReviewSession, markdown: string): ReviewSession {
  return markOutdatedAnnotations({
    ...session,
    workingMarkdown: markdown,
    workingHash: hashContent(markdown),
  });
}

export function lineCount(markdown: string): number {
  return splitLines(markdown).length;
}

export class ConflictError extends Error {
  readonly diskHash: string;
  readonly diskMarkdown: string;

  constructor(message: string, diskHash: string, diskMarkdown: string) {
    super(message);
    this.name = 'ConflictError';
    this.diskHash = diskHash;
    this.diskMarkdown = diskMarkdown;
  }
}
