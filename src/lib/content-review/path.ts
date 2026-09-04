import path from 'node:path';
import { techBlogRelativePath } from './identity';

export type ResolvedMarkdownPath = {
  lang: 'en' | 'he';
  slug: string;
  relativePath: string;
  absolutePath: string;
};

function isInsideDirectory(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
}

export function resolveSafeMarkdownPath(repoRoot: string, lang: string, slug: string): ResolvedMarkdownPath {
  const relativePath = techBlogRelativePath(lang, slug);
  const resolvedRoot = path.resolve(repoRoot);
  const contentRoot = path.resolve(resolvedRoot, 'content', 'tech-blog');
  const absolutePath = path.resolve(resolvedRoot, relativePath);

  if (!isInsideDirectory(contentRoot, absolutePath)) {
    throw new Error('Path escapes the tech blog directory');
  }

  if (path.extname(absolutePath) !== '.md') {
    throw new Error('Review files must be Markdown');
  }

  const parsed = path.parse(absolutePath);
  if (parsed.dir !== path.resolve(contentRoot, lang)) {
    throw new Error('Markdown must live in a language directory');
  }

  return {
    lang: lang as 'en' | 'he',
    slug,
    relativePath: relativePath.replaceAll('\\', '/'),
    absolutePath,
  };
}
