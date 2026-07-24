import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface PostMetaData {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  coverImage: string;
  minutesToRead: number;
  language: string;
  tags?: string[];
}

export interface PostDetail extends PostMetaData {
  contentHtml: string;
}

const contentDirectory = path.join(process.cwd(), 'content/music-blog');

export function getAllPostSlugs(lang: 'he' | 'en' = 'he'): string[] {
  const dirPath = path.join(contentDirectory, lang);
  if (!fs.existsSync(dirPath)) return [];
  const fileNames = fs.readdirSync(dirPath);
  return fileNames.filter((fn) => fn.endsWith('.md')).map((fn) => fn.replace(/\.md$/, ''));
}

export function getAllPosts(lang: 'he' | 'en' = 'he'): PostMetaData[] {
  const slugs = getAllPostSlugs(lang);
  const posts = slugs
    .map((slug) => getPostData(slug, lang))
    .filter((post): post is PostDetail => post !== null)
    .map(({ contentHtml, ...metadata }) => metadata);

  // Sort posts by date descending
  return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export function getPostData(slug: string, lang: 'he' | 'en' = 'he'): PostDetail | null {
  const fullPath = path.join(contentDirectory, lang, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    // Fallback to Hebrew if English doesn't exist yet
    const fallbackPath = path.join(contentDirectory, 'he', `${slug}.md`);
    if (!fs.existsSync(fallbackPath)) return null;
    return getPostData(slug, 'he');
  }

  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  // Process markdown into HTML string
  const processedContent = remark()
    .use(html, { sanitize: false })
    .processSync(content);
  const contentHtml = processedContent.toString();

  return {
    title: data.title || slug,
    slug: data.slug || slug,
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString(),
    coverImage: data.coverImage || '/public/hero-cover.jpeg',
    minutesToRead: data.minutesToRead || 5,
    language: data.language || lang,
    tags: data.tags || [],
    contentHtml,
  };
}
