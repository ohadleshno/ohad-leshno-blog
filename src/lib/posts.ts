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
  youtubeId?: string;
}

export interface PostDetail extends PostMetaData {
  contentHtml: string;
}

const contentDirectory = path.join(process.cwd(), 'content/music-blog');

function extractFirstYouTubeId(content: string, frontmatterUrl?: string): string | undefined {
  if (frontmatterUrl) {
    const match = frontmatterUrl.match(/(?:embed\/|v=|youtu\.be\/)([^"&?\/\s]+)/);
    if (match) return match[1];
  }
  const match = content.match(/youtube-nocookie\.com\/embed\/([^"&?\/\s]+)/) ||
                content.match(/youtube\.com\/watch\?v=([^"&?\/\s]+)/) ||
                content.match(/youtu\.be\/([^"&?\/\s]+)/);
  return match ? match[1] : undefined;
}

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
  const decodedSlug = decodeURIComponent(slug);
  let fullPath = path.join(contentDirectory, lang, `${decodedSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(contentDirectory, lang, `${slug}.md`);
  }
  if (!fs.existsSync(fullPath)) {
    // Fallback to Hebrew if English doesn't exist yet
    const fallbackPath = path.join(contentDirectory, 'he', `${decodedSlug}.md`);
    if (!fs.existsSync(fallbackPath)) return null;
    return getPostData(decodedSlug, 'he');
  }

  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  // Process markdown into HTML string
  const processedContent = remark()
    .use(html, { sanitize: false })
    .processSync(content);
  const contentHtml = processedContent.toString();

  const coverImage = data.coverImage ? data.coverImage.replace(/^\/public/, '') : '/hero-cover.webp';
  const youtubeId = extractFirstYouTubeId(content, data.youtubeUrl || data.youtubeId);

  return {
    title: data.title || slug,
    slug: data.slug || slug,
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString(),
    coverImage,
    minutesToRead: data.minutesToRead || 5,
    language: data.language || lang,
    tags: data.tags || [],
    youtubeId,
    contentHtml,
  };
}
