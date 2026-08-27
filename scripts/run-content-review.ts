import { spawn, type ChildProcess } from 'node:child_process';
import net from 'node:net';

const REVIEW_HOST = process.env.CONTENT_REVIEW_HOST ?? '127.0.0.1';
const REVIEW_PORT = Number(process.env.CONTENT_REVIEW_PORT ?? 4317);
const NEXT_HOST = '127.0.0.1';
const NEXT_PORT = Number(process.env.PORT ?? 3000);

const children: ChildProcess[] = [];
let shuttingDown = false;

function canConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(host: string, port: number, label: string, timeoutMs = 30000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await canConnect(host, port)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`${label} did not start on ${host}:${port}`);
}

function start(command: string, args: string[], name: string): ChildProcess {
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  });
  children.push(child);
  child.on('exit', (code, signal) => {
    if (shuttingDown || signal) return;
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });
  return child;
}

function shutdown(code = 0): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed && child.pid) {
      child.kill('SIGTERM');
    }
  }
  process.exit(code);
}

async function main() {
  const reviewAlreadyRunning = await canConnect(REVIEW_HOST, REVIEW_PORT);
  const nextAlreadyRunning = await canConnect(NEXT_HOST, NEXT_PORT);

  if (!reviewAlreadyRunning) {
    console.log(`Starting content review server on http://${REVIEW_HOST}:${REVIEW_PORT}`);
    start('npx', ['tsx', 'scripts/content-review-server.ts'], 'review server');
    await waitForPort(REVIEW_HOST, REVIEW_PORT, 'Content review server');
  } else {
    console.log(`Using the content review server already running on http://${REVIEW_HOST}:${REVIEW_PORT}`);
  }

  if (!nextAlreadyRunning) {
    console.log(`Starting Next.js on http://localhost:${NEXT_PORT}`);
    start('npx', ['next', 'dev', '-p', String(NEXT_PORT)], 'Next.js');
    await waitForPort(NEXT_HOST, NEXT_PORT, 'Next.js');
  } else {
    console.log(`Using the Next.js app already running on http://localhost:${NEXT_PORT}`);
  }

  console.log('');
  console.log('Review mode is ready. Open an article with ?review=true:');
  console.log(`  http://localhost:${NEXT_PORT}/en/tech/building-an-effective-context-layer-part-4?review=true`);
  console.log(`  http://localhost:${NEXT_PORT}/he/tech/building-an-effective-context-layer-part-5?review=true`);
  console.log('');
  console.log('Press Ctrl+C to stop the processes this script started.');

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

void main().catch((error) => {
  console.error(error);
  shutdown(1);
});
