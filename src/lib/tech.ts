import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';

export interface TechProjectMetaData {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  coverImage: string;
  projectUrl: string;
  techStack: string[];
  language: string;
  draft: boolean;
  series?: string;
  seriesTitle?: string;
  seriesOrder?: number;
}

export interface TechProjectDetail extends TechProjectMetaData {
  contentHtml: string;
}

const techDirectory = path.join(process.cwd(), 'content/tech-blog');

function processCodeBlocks(htmlContent: string): string {
  return htmlContent.replace(/<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
    const trimmedCode = code.trim();
    
    // Preserve Mermaid diagram blocks for client-side rendering
    if (
      lang === 'mermaid' ||
      trimmedCode.startsWith('flowchart') ||
      trimmedCode.startsWith('sequenceDiagram') ||
      trimmedCode.startsWith('graph ') ||
      trimmedCode.startsWith('gantt') ||
      trimmedCode.startsWith('erDiagram') ||
      trimmedCode.startsWith('classDiagram')
    ) {
      return `<pre><code class="language-mermaid">${code}</code></pre>`;
    }

    const rawCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');

    const language = (lang && hljs.getLanguage(lang)) ? lang : 'plaintext';
    const highlightedHtml = hljs.highlight(rawCode, { language }).value;

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

export function getAllTechSlugs(lang: 'he' | 'en' = 'he'): string[] {
  const dirPath = path.join(techDirectory, lang);
  if (!fs.existsSync(dirPath)) return [];
  const fileNames = fs.readdirSync(dirPath);
  return fileNames.filter((fn) => fn.endsWith('.md')).map((fn) => fn.replace(/\.md$/, ''));
}

export function getAllTechProjects(lang: 'he' | 'en' = 'he'): TechProjectMetaData[] {
  const slugs = getAllTechSlugs(lang);
  const projects = slugs
    .map((slug) => getTechProjectData(slug, lang))
    .filter((proj): proj is TechProjectDetail => proj !== null)
    .filter((proj) => !proj.draft)
    .map(({ contentHtml, ...metadata }) => metadata);

  return projects.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export function getTechSeriesProjects(
  seriesId: string,
  lang: 'he' | 'en' = 'he',
  includeDrafts: boolean = true
): TechProjectMetaData[] {
  const slugs = getAllTechSlugs(lang);
  const projects = slugs
    .map((slug) => getTechProjectData(slug, lang))
    .filter((proj): proj is TechProjectDetail => proj !== null)
    .filter((proj) => proj.series === seriesId)
    .filter((proj) => includeDrafts || !proj.draft)
    .map(({ contentHtml, ...metadata }) => metadata);

  return projects.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getTechProjectData(slug: string, lang: 'he' | 'en' = 'he'): TechProjectDetail | null {
  const decodedSlug = decodeURIComponent(slug);
  let fullPath = path.join(techDirectory, lang, `${decodedSlug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(techDirectory, lang, `${slug}.md`);
  }
  if (!fs.existsSync(fullPath)) {
    const fallbackPath = path.join(techDirectory, 'he', `${decodedSlug}.md`);
    if (!fs.existsSync(fallbackPath)) return null;
    return getTechProjectData(decodedSlug, 'he');
  }

  const fileContents = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(fileContents);

  const processedContent = remark().use(remarkGfm).use(html, { sanitize: false }).processSync(content);
  const rawHtml = processedContent.toString();
  const contentHtml = processCodeBlocks(rawHtml);

  return {
    title: data.title || slug,
    slug: data.slug || slug,
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString(),
    coverImage: data.coverImage ? data.coverImage.replace(/^\/public/, '') : '/hero-cover.webp',
    projectUrl: data.projectUrl || 'https://github.com/ohadleshno',
    techStack: data.techStack || ['AI', 'TypeScript'],
    language: data.language || lang,
    draft: data.draft === true,
    series: data.series,
    seriesTitle: data.seriesTitle,
    seriesOrder: data.seriesOrder,
    contentHtml,
  };
}
