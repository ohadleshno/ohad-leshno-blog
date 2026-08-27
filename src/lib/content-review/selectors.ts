import type { ProposedEdit, ReviewComment, ReviewSession } from './types';

export function currentRevisionId(session: ReviewSession): number {
  return session.revisions.length === 0 ? 0 : session.revisions[session.revisions.length - 1].id;
}

export function unresolvedComments(session: ReviewSession): ReviewComment[] {
  return session.comments.filter((comment) => comment.status === 'open');
}

export function activeProposedEdits(session: ReviewSession): ProposedEdit[] {
  return session.proposedEdits.filter((edit) => edit.status === 'active');
}

export function selectedMarkdown(session: ReviewSession, revisionId: number | 'working' | 'baseline'): string {
  if (revisionId === 'working') return session.workingMarkdown;
  if (revisionId === 'baseline') return session.baselineMarkdown;
  const revision = session.revisions.find((item) => item.id === revisionId);
  if (!revision) {
    throw new Error('Revision not found');
  }
  return revision.markdown;
}
