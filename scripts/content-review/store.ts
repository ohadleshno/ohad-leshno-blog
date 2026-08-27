import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  addComment,
  addProposedEdit,
  applyDirectSave,
  assertDiskHash,
  buildReviewPayload,
  compileReviewPrompt,
  createRevision,
  createSession,
  resolveComment,
  resolveSafeMarkdownPath,
  setChangeApproval,
  setApproval,
  snapshotBeforeSave,
  syncWorkingMarkdown,
  type ApprovalStatus,
  type LineRange,
  type ReviewPayload,
  type ReviewSession,
  type RevisionReason,
} from '../../src/lib/content-review';
import { atomicWriteFile } from './atomic';
import { readHeadCommit, readHeadFile } from './git';

export type ReviewStoreOptions = {
  repoRoot: string;
  reviewsDir?: string;
  now?: () => string;
  createId?: () => string;
  readHeadCommit?: (repoRoot: string) => string;
  readHeadFile?: (repoRoot: string, relativePath: string) => string;
};

type SessionFile = {
  version: 1;
  session: ReviewSession;
};

function isRevisionReason(value: string): value is RevisionReason {
  return value === 'comments' || value === 'proposed_edits' || value === 'direct_save';
}

export class ReviewStore {
  private readonly repoRoot: string;
  private readonly reviewsDir: string;
  private readonly now: () => string;
  private readonly createId: () => string;
  private readonly readHeadCommit: (repoRoot: string) => string;
  private readonly readHeadFile: (repoRoot: string, relativePath: string) => string;

  constructor(options: ReviewStoreOptions) {
    this.repoRoot = options.repoRoot;
    this.reviewsDir = options.reviewsDir ?? path.join(options.repoRoot, '.scratch', 'content-reviews');
    this.now = options.now ?? (() => new Date().toISOString());
    this.createId = options.createId ?? (() => randomUUID());
    this.readHeadCommit = options.readHeadCommit ?? readHeadCommit;
    this.readHeadFile = options.readHeadFile ?? readHeadFile;
  }

  sessionPath(lang: string, slug: string): string {
    return path.join(this.reviewsDir, `${lang}__${slug}.json`);
  }

  async load(lang: string, slug: string, compareTo: number | 'working' = 'working'): Promise<ReviewPayload> {
    const session = await this.loadSession(lang, slug);
    return buildReviewPayload(session, compareTo);
  }

  async addComment(
    lang: string,
    slug: string,
    range: LineRange,
    text: string,
    sourceMarkdown?: string,
  ): Promise<ReviewPayload> {
    const session = addComment(await this.loadSession(lang, slug), {
      id: this.createId(),
      range,
      text,
      now: this.now(),
      sourceMarkdown,
    });
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async resolveComment(lang: string, slug: string, commentId: string): Promise<ReviewPayload> {
    const session = resolveComment(await this.loadSession(lang, slug), commentId);
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async addProposedEdit(lang: string, slug: string, range: LineRange, replacement: string): Promise<ReviewPayload> {
    const session = addProposedEdit(await this.loadSession(lang, slug), {
      id: this.createId(),
      range,
      replacement,
      now: this.now(),
    });
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async createRevision(lang: string, slug: string, reason: string): Promise<ReviewPayload> {
    if (!isRevisionReason(reason) || reason === 'direct_save') {
      throw new Error('Invalid revision reason');
    }
    const session = createRevision(await this.loadSession(lang, slug), reason, this.now());
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async setApproval(lang: string, slug: string, approval: ApprovalStatus): Promise<ReviewPayload> {
    const session = setApproval(await this.loadSession(lang, slug), approval);
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async setChangeApproval(
    lang: string,
    slug: string,
    changeId: string,
    approved: boolean,
  ): Promise<ReviewPayload> {
    const session = setChangeApproval(await this.loadSession(lang, slug), changeId, approved);
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  async saveMarkdown(lang: string, slug: string, markdown: string, expectedHash: string): Promise<ReviewPayload> {
    const resolved = resolveSafeMarkdownPath(this.repoRoot, lang, slug);
    const diskMarkdown = await readFile(resolved.absolutePath, 'utf8');
    assertDiskHash(diskMarkdown, expectedHash);

    let session = await this.loadSession(lang, slug);
    session = snapshotBeforeSave(session, this.now());
    await this.writeSession(session);
    await atomicWriteFile(resolved.absolutePath, markdown);
    session = applyDirectSave(session, markdown);
    await this.writeSession(session);
    return buildReviewPayload(session);
  }

  prompt(session: ReviewSession, includeResolved = false): string {
    return compileReviewPrompt(session, { includeResolved });
  }

  private async loadSession(lang: string, slug: string): Promise<ReviewSession> {
    const resolved = resolveSafeMarkdownPath(this.repoRoot, lang, slug);
    const workingMarkdown = await readFile(resolved.absolutePath, 'utf8');
    const stored = await this.readStoredSession(lang, slug);

    if (!stored) {
      return createSession({
        lang: resolved.lang,
        slug: resolved.slug,
        relativePath: resolved.relativePath,
        baselineCommit: this.readHeadCommit(this.repoRoot),
        baselineMarkdown: this.readHeadFile(this.repoRoot, resolved.relativePath),
        workingMarkdown,
        now: this.now(),
      });
    }

    return syncWorkingMarkdown(stored, workingMarkdown);
  }

  private async readStoredSession(lang: string, slug: string): Promise<ReviewSession | null> {
    try {
      const raw = await readFile(this.sessionPath(lang, slug), 'utf8');
      const parsed = JSON.parse(raw) as SessionFile;
      if (parsed.version !== 1 || !parsed.session) return null;
      return {
        ...parsed.session,
        approvedChangeIds: parsed.session.approvedChangeIds ?? [],
      };
    } catch {
      return null;
    }
  }

  private async writeSession(session: ReviewSession): Promise<void> {
    const file: SessionFile = { version: 1, session };
    await atomicWriteFile(this.sessionPath(session.lang, session.slug), `${JSON.stringify(file, null, 2)}\n`);
  }
}
