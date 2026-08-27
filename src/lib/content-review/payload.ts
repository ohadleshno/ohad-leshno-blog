import { createReviewDiff } from './diff';
import { compileReviewPrompt } from './prompt';
import { activeProposedEdits, selectedMarkdown, unresolvedComments } from './selectors';
import type { ReviewPayload, ReviewSession } from './types';

export function buildReviewPayload(
  session: ReviewSession,
  compareTo: number | 'working' = 'working',
  includeResolved = false,
): ReviewPayload {
  const toText = selectedMarkdown(session, compareTo);
  const toLabel = compareTo === 'working' ? 'working' : `revision ${compareTo}`;
  const shortCommit = session.baselineCommit.slice(0, 7) || 'unknown';

  return {
    session,
    diff: createReviewDiff({
      relativePath: session.relativePath,
      fromLabel: `HEAD ${shortCommit}`,
      toLabel,
      fromText: session.baselineMarkdown,
      toText,
    }),
    unresolvedCommentCount: unresolvedComments(session).length,
    activeEditCount: activeProposedEdits(session).length,
    prompt: compileReviewPrompt(session, { includeResolved }),
  };
}
