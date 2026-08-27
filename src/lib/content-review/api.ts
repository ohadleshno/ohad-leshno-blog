import type { ApprovalStatus, LineRange, ReviewPayload, RevisionReason } from './types';

export const REVIEW_SERVER_URL = 'http://127.0.0.1:4317';

export class ReviewApiError extends Error {
  readonly status: number;
  readonly conflict?: { diskHash: string; diskMarkdown: string };

  constructor(message: string, status: number, conflict?: { diskHash: string; diskMarkdown: string }) {
    super(message);
    this.name = 'ReviewApiError';
    this.status = status;
    this.conflict = conflict;
  }
}

async function reviewRequest(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${REVIEW_SERVER_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ReviewApiError('Review server is not running', 0);
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    kind?: string;
    diskHash?: string;
    diskMarkdown?: string;
  };

  if (!response.ok) {
    throw new ReviewApiError(
      data.error ?? 'Review request failed',
      response.status,
      data.diskHash && data.diskMarkdown
        ? { diskHash: data.diskHash, diskMarkdown: data.diskMarkdown }
        : undefined,
    );
  }

  return data;
}

export async function fetchReview(lang: string, slug: string, revision?: number | 'working'): Promise<ReviewPayload> {
  const params = new URLSearchParams({ lang, slug });
  if (revision && revision !== 'working') params.set('revision', String(revision));
  return (await reviewRequest(`/review?${params.toString()}`)) as ReviewPayload;
}

export async function renderMarkdownPreview(markdown: string): Promise<string> {
  const result = (await reviewRequest('/review/render', {
    method: 'POST',
    body: JSON.stringify({ markdown }),
  })) as { html: string };
  return result.html;
}

export async function postComment(
  lang: string,
  slug: string,
  range: LineRange,
  text: string,
  markdown?: string,
): Promise<ReviewPayload> {
  return (await reviewRequest('/review/comments', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, range, text, markdown }),
  })) as ReviewPayload;
}

export async function postResolveComment(lang: string, slug: string, commentId: string): Promise<ReviewPayload> {
  return (await reviewRequest('/review/comments/resolve', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, commentId }),
  })) as ReviewPayload;
}

export async function postProposedEdit(
  lang: string,
  slug: string,
  range: LineRange,
  replacement: string,
): Promise<ReviewPayload> {
  return (await reviewRequest('/review/edits', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, range, replacement }),
  })) as ReviewPayload;
}

export async function postRevision(lang: string, slug: string, reason: RevisionReason): Promise<ReviewPayload> {
  return (await reviewRequest('/review/revisions', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, reason }),
  })) as ReviewPayload;
}

export async function postApproval(lang: string, slug: string, approval: ApprovalStatus): Promise<ReviewPayload> {
  return (await reviewRequest('/review/approval', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, approval }),
  })) as ReviewPayload;
}

export async function postChangeApproval(
  lang: string,
  slug: string,
  changeId: string,
  approved: boolean,
): Promise<ReviewPayload> {
  return (await reviewRequest('/review/changes/approval', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, changeId, approved }),
  })) as ReviewPayload;
}

export async function postSaveMarkdown(
  lang: string,
  slug: string,
  markdown: string,
  expectedHash: string,
): Promise<ReviewPayload> {
  return (await reviewRequest('/review/save', {
    method: 'POST',
    body: JSON.stringify({ lang, slug, markdown, expectedHash }),
  })) as ReviewPayload;
}
