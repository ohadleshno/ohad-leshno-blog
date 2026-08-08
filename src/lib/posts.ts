import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';

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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x26;/g, '&')
    .replace(/&#x3C;/gi, '<')
    .replace(/&#x3E;/gi, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function processCodeBlocks(htmlContent: string): string {
  return htmlContent.replace(/<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
    const decodedCode = decodeHtmlEntities(code);
    const trimmedCode = decodedCode.trim();

    // Preserve Mermaid diagram code blocks for client-side rendering
    if (
      lang === 'mermaid' ||
      trimmedCode.startsWith('flowchart') ||
      trimmedCode.startsWith('sequenceDiagram') ||
      trimmedCode.startsWith('graph ') ||
      trimmedCode.startsWith('gantt') ||
      trimmedCode.startsWith('erDiagram') ||
      trimmedCode.startsWith('classDiagram')
    ) {
      return `<pre><code class="language-mermaid">${decodedCode}</code></pre>`;
    }

    const language = (lang && hljs.getLanguage(lang)) ? lang : 'plaintext';
    const highlightedHtml = hljs.highlight(decodedCode, { language }).value;

    return `<div class="code-block-wrapper my-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800/60 bg-[#0d1117] shadow-sm dark:shadow-none text-left font-mono text-sm leading-relaxed" dir="ltr">
      <div class="code-block-header flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-neutral-700/40 text-xs font-mono text-neutral-400 uppercase tracking-widest select-none">
        <span class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-rose-500/80 inline-block"></span>
          <span class="size-2.5 rounded-full bg-amber-500/80 inline-block"></span>
          <span class="size-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          <span class="ml-2 font-semibold text-neutral-300">${language}</span>
        </span>
      </div>
      <pre class="hljs p-4 overflow-x-auto bg-[#0d1117] text-[#c9d1d9] font-mono leading-relaxed"><code>${highlightedHtml}</code></pre>
    </div>`;
  });
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

  return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export function calculateReadingTime(content: string, frontmatterMinutes?: number): number {
  if (typeof frontmatterMinutes === 'number' && frontmatterMinutes > 0) {
    return frontmatterMinutes;
  }
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/^#+\s+/gm, '')
    .trim();
  const words = cleanContent ? cleanContent.split(/\s+/).filter(Boolean).length : 0;
  // Tech article digital reading speed: ~260 words per minute
  const minutes = Math.ceil(words / 260);
  return Math.max(1, minutes);
}

export function getPostData(slug: string, lang: 'he' | 'en' = 'he'): PostDetail | null {
  const decodedSlug = decodeURIComponent(slug);
  let fullPath = path.join(contentDirectory, lang, `${decodedSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(contentDirectory, lang, `${slug}.md`);
  }
  if (!fs.existsSync(fullPath)) {
    const fallbackPath = path.join(contentDirectory, 'he', `${decodedSlug}.md`);
    if (!fs.existsSync(fallbackPath)) return null;
    return getPostData(decodedSlug, 'he');
  }

  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  const processedContent = remark().use(remarkGfm).use(html, { sanitize: false }).processSync(content);
  const rawHtml = processedContent.toString();
  const contentHtml = processCodeBlocks(rawHtml);

  const coverImage = data.coverImage ? data.coverImage.replace(/^\/public/, '') : '/hero-cover.webp';
  const youtubeId = extractFirstYouTubeId(content, data.youtubeUrl || data.youtubeId);

  return {
    title: data.title || slug,
    slug: data.slug || slug,
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString(),
    coverImage,
    minutesToRead: calculateReadingTime(content, data.minutesToRead),
    language: data.language || lang,
    tags: data.tags || [],
    youtubeId,
    contentHtml,
  };
}
