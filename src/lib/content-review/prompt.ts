import { activeProposedEdits, unresolvedComments } from './selectors';
import type { ReviewSession } from './types';

function fence(text: string): string {
  return ['```markdown', text.replace(/\n$/, ''), '```'].join('\n');
}

export function compileReviewPrompt(session: ReviewSession, options?: { includeResolved?: boolean }): string {
  const includeResolved = options?.includeResolved === true;
  const comments = includeResolved
    ? session.comments.filter((comment) => comment.status !== 'outdated')
    : unresolvedComments(session);
  const edits = activeProposedEdits(session);
  const sections: string[] = [
    '# Content review handoff',
    '',
    `File: ${session.relativePath}`,
    `Baseline commit: ${session.baselineCommit}`,
    `Working hash: ${session.workingHash}`,
    `Approval: ${session.approval}`,
    `Approved changes: ${(session.approvedChangeIds ?? []).join(', ') || 'none'}`,
    `Revisions: ${session.revisions.length}`,
    '',
  ];

  if (comments.length === 0 && edits.length === 0) {
    sections.push('No unresolved comments or active proposed edits.');
    return sections.join('\n');
  }

  if (comments.length > 0) {
    sections.push(includeResolved ? '## Comments' : '## Unresolved comments', '');
    comments.forEach((comment, index) => {
      sections.push(
        `### Comment ${index + 1} (${comment.status}, lines ${comment.range.startLine}-${comment.range.endLine}, revision ${comment.revisionId})`,
        '',
        'Source context:',
        fence(comment.context),
        '',
        'Request:',
        comment.text,
        '',
      );
    });
  }

  if (edits.length > 0) {
    sections.push('## Proposed replacements', '');
    edits.forEach((edit, index) => {
      sections.push(
        `### Edit ${index + 1} (lines ${edit.range.startLine}-${edit.range.endLine}, revision ${edit.revisionId})`,
        '',
        'Original:',
        fence(edit.original),
        '',
        'Replacement:',
        fence(edit.replacement),
        '',
      );
    });
  }

  return sections.join('\n').trim() + '\n';
}
