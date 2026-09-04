export const REVIEW_LANGS = ['en', 'he'] as const;
export type ReviewLang = (typeof REVIEW_LANGS)[number];

export const APPROVAL_STATUSES = ['pending', 'approved', 'changes_requested'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const COMMENT_STATUSES = ['open', 'resolved', 'outdated'] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export const PROPOSED_EDIT_STATUSES = ['active', 'outdated'] as const;
export type ProposedEditStatus = (typeof PROPOSED_EDIT_STATUSES)[number];

export const REVISION_REASONS = ['comments', 'proposed_edits', 'direct_save'] as const;
export type RevisionReason = (typeof REVISION_REASONS)[number];

export type LineRange = {
  startLine: number;
  endLine: number;
};

export type ReviewComment = {
  id: string;
  range: LineRange;
  context: string;
  text: string;
  status: CommentStatus;
  createdAt: string;
  revisionId: number;
};

export type ProposedEdit = {
  id: string;
  range: LineRange;
  original: string;
  replacement: string;
  status: ProposedEditStatus;
  createdAt: string;
  revisionId: number;
};

export type ReviewRevision = {
  id: number;
  createdAt: string;
  reason: RevisionReason;
  markdown: string;
  contentHash: string;
};

export type ReviewSession = {
  lang: ReviewLang;
  slug: string;
  relativePath: string;
  baselineCommit: string;
  baselineMarkdown: string;
  workingMarkdown: string;
  workingHash: string;
  nextRevisionId: number;
  revisions: ReviewRevision[];
  comments: ReviewComment[];
  proposedEdits: ProposedEdit[];
  approval: ApprovalStatus;
  approvedChangeIds: string[];
};

export type DiffOp = 'equal' | 'add' | 'del';

export type DiffLine = {
  type: DiffOp;
  text: string;
  oldLine: number | null;
  newLine: number | null;
};

export type UnifiedHunk = {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
};

export type ReviewDiff = {
  fromLabel: string;
  toLabel: string;
  relativePath: string;
  hunks: UnifiedHunk[];
  unified: string;
  changedNewLines: number[];
  changedOldLines: number[];
};

export type ReviewPayload = {
  session: ReviewSession;
  diff: ReviewDiff;
  unresolvedCommentCount: number;
  activeEditCount: number;
  prompt: string;
};

export type SaveConflict = {
  kind: 'conflict';
  message: string;
  diskHash: string;
  diskMarkdown: string;
};

export type SaveSuccess = {
  kind: 'saved';
  payload: ReviewPayload;
};

export type SaveResult = SaveConflict | SaveSuccess;
