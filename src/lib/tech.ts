import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface TechProjectMetaData {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  coverImage: string;
  projectUrl: string;
  techStack: string[];
  language: string;
}

export interface TechProjectDetail extends TechProjectMetaData {
  contentHtml: string;
}

const techDirectory = path.join(process.cwd(), 'content/tech-blog');

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
    .map(({ contentHtml, ...metadata }) => metadata);

  return projects.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
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

  const processedContent = remark().use(html, { sanitize: false }).processSync(content);
  const contentHtml = processedContent.toString();

  return {
    title: data.title || slug,
    slug: data.slug || slug,
    excerpt: data.excerpt || '',
    date: data.date || new Date().toISOString(),
    coverImage: data.coverImage ? data.coverImage.replace(/^\/public/, '') : '/hero-cover.webp',
    projectUrl: data.projectUrl || 'https://github.com/ohadleshno',
    techStack: data.techStack || ['AI', 'TypeScript'],
    language: data.language || lang,
    contentHtml,
  };
}
