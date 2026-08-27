import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { ConflictError, type ApprovalStatus, type LineRange } from '../../src/lib/content-review';
import { isLocalOrigin } from './origin';
import { renderMarkdown } from './render';
import { ReviewStore } from './store';

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const APPROVALS = new Set<ApprovalStatus>(['pending', 'approved', 'changes_requested']);

type JsonBody = Record<string, unknown>;

function sendJson(response: ServerResponse, status: number, body: unknown, origin: string | null): void {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Vary'] = 'Origin';
  }
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

function readBody(request: IncomingMessage): Promise<JsonBody> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) as JsonBody;
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function asString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function asText(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${name} is required`);
  }
  return value;
}

function asRange(value: unknown): LineRange {
  if (!value || typeof value !== 'object') {
    throw new Error('range is required');
  }
  const range = value as { startLine?: unknown; endLine?: unknown };
  if (typeof range.startLine !== 'number' || typeof range.endLine !== 'number') {
    throw new Error('range must include startLine and endLine');
  }
  return { startLine: range.startLine, endLine: range.endLine };
}

function compareTo(value: string | null): number | 'working' {
  if (!value || value === 'working') return 'working';
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('Invalid revision');
  }
  return parsed;
}

export function createReviewServer(store: ReviewStore, host = '127.0.0.1', port = 4317): Server {
  const server = createServer(async (request, response) => {
    const origin = request.headers.origin ?? null;

    if (!isLocalOrigin(origin)) {
      sendJson(response, 403, { error: 'Origin is not allowed' }, null);
      return;
    }

    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {}, origin);
      return;
    }

    try {
      const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);

      if (request.method === 'GET' && url.pathname === '/health') {
        sendJson(response, 200, { ok: true }, origin);
        return;
      }

      if (request.method === 'GET' && url.pathname === '/review') {
        const payload = await store.load(
          asString(url.searchParams.get('lang'), 'lang'),
          asString(url.searchParams.get('slug'), 'slug'),
          compareTo(url.searchParams.get('revision')),
        );
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'GET' && url.pathname === '/review/prompt') {
        const payload = await store.load(
          asString(url.searchParams.get('lang'), 'lang'),
          asString(url.searchParams.get('slug'), 'slug'),
        );
        const includeResolved = url.searchParams.get('includeResolved') === 'true';
        sendJson(response, 200, { prompt: store.prompt(payload.session, includeResolved) }, origin);
        return;
      }

      const body = request.method === 'POST' ? await readBody(request) : {};

      if (request.method === 'POST' && url.pathname === '/review/render') {
        const renderedHtml = renderMarkdown(asText(body.markdown, 'markdown'));
        sendJson(response, 200, { html: renderedHtml }, origin);
        return;
      }

      const lang = asString(body.lang ?? url.searchParams.get('lang'), 'lang');
      const slug = asString(body.slug ?? url.searchParams.get('slug'), 'slug');

      if (request.method === 'POST' && url.pathname === '/review/comments') {
        const payload = await store.addComment(
          lang,
          slug,
          asRange(body.range),
          asString(body.text, 'text'),
          body.markdown === undefined ? undefined : asText(body.markdown, 'markdown'),
        );
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/comments/resolve') {
        const payload = await store.resolveComment(lang, slug, asString(body.commentId, 'commentId'));
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/edits') {
        const payload = await store.addProposedEdit(
          lang,
          slug,
          asRange(body.range),
          asString(body.replacement, 'replacement'),
        );
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/revisions') {
        const payload = await store.createRevision(lang, slug, asString(body.reason, 'reason'));
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/approval') {
        const approval = asString(body.approval, 'approval');
        if (!APPROVALS.has(approval as ApprovalStatus)) {
          throw new Error('Invalid approval status');
        }
        const payload = await store.setApproval(lang, slug, approval as ApprovalStatus);
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/changes/approval') {
        if (typeof body.approved !== 'boolean') {
          throw new Error('approved is required');
        }
        const payload = await store.setChangeApproval(
          lang,
          slug,
          asString(body.changeId, 'changeId'),
          body.approved,
        );
        sendJson(response, 200, payload, origin);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/review/save') {
        const payload = await store.saveMarkdown(
          lang,
          slug,
          asString(body.markdown, 'markdown'),
          asString(body.expectedHash, 'expectedHash'),
        );
        sendJson(response, 200, payload, origin);
        return;
      }

      sendJson(response, 404, { error: 'Not found' }, origin);
    } catch (error) {
      if (error instanceof ConflictError) {
        sendJson(
          response,
          409,
          {
            kind: 'conflict',
            error: error.message,
            diskHash: error.diskHash,
            diskMarkdown: error.diskMarkdown,
          },
          origin,
        );
        return;
      }

      const message = error instanceof Error ? error.message : 'Review server error';
      const status = /required|Invalid|not found|outside|empty file/i.test(message) ? 400 : 500;
      sendJson(response, status, { error: message }, origin);
    }
  });

  return server;
}

export function listenReviewServer(store: ReviewStore, port = 4317, host = '127.0.0.1'): Promise<Server> {
  const server = createReviewServer(store, host, port);
  return new Promise((resolve, reject) => {
    server.listen(port, host, () => resolve(server));
    server.on('error', reject);
  });
}
