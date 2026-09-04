import { execFileSync } from 'node:child_process';

export function readHeadCommit(repoRoot: string): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

export function readHeadFile(repoRoot: string, relativePath: string): string {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
  } catch {
    return '';
  }
}
