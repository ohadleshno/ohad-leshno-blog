import path from 'node:path';
import { ReviewStore } from './content-review/store';
import { listenReviewServer } from './content-review/server';

const repoRoot = process.cwd();
const port = Number(process.env.CONTENT_REVIEW_PORT ?? 4317);
const host = process.env.CONTENT_REVIEW_HOST ?? '127.0.0.1';

async function main() {
  const store = new ReviewStore({
    repoRoot,
    reviewsDir: path.join(repoRoot, '.scratch', 'content-reviews'),
  });
  await listenReviewServer(store, port, host);
  console.log(`Content review server listening on http://${host}:${port}`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
