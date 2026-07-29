import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SITE_URL = 'https://ohadleshno.com';

interface PostItem {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  lang: string;
  type: 'music' | 'tech';
}

function loadPostsFromDir(dirPath: string, lang: string, type: 'music' | 'tech'): PostItem[] {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    const slug = data.slug || file.replace(/\.md$/, '');
    return {
      title: data.title || slug,
      slug,
      excerpt: data.excerpt || '',
      date: data.date || new Date().toISOString(),
      lang,
      type,
    };
  });
}

function generateSyndication() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Load all posts & projects
  const heMusicPosts = loadPostsFromDir(path.join(process.cwd(), 'content/music-blog/he'), 'he', 'music');
  const enMusicPosts = loadPostsFromDir(path.join(process.cwd(), 'content/music-blog/en'), 'en', 'music');
  const heTechProjects = loadPostsFromDir(path.join(process.cwd(), 'content/tech-blog/he'), 'he', 'tech');
  const enTechProjects = loadPostsFromDir(path.join(process.cwd(), 'content/tech-blog/en'), 'en', 'tech');

  const allItems = [...heMusicPosts, ...enMusicPosts, ...heTechProjects, ...enTechProjects];

  // 1. Generate sitemap.xml
  const staticPages = [
    { loc: `${SITE_URL}/he`, altHe: `${SITE_URL}/he`, altEn: `${SITE_URL}/en`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/en`, altHe: `${SITE_URL}/he`, altEn: `${SITE_URL}/en`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/he/music`, altHe: `${SITE_URL}/he/music`, altEn: `${SITE_URL}/en/music`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/en/music`, altHe: `${SITE_URL}/he/music`, altEn: `${SITE_URL}/en/music`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_URL}/he/tech`, altHe: `${SITE_URL}/he/tech`, altEn: `${SITE_URL}/en/tech`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_URL}/en/tech`, altHe: `${SITE_URL}/he/tech`, altEn: `${SITE_URL}/en/tech`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_URL}/he/about`, altHe: `${SITE_URL}/he/about`, altEn: `${SITE_URL}/en/about`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_URL}/en/about`, altHe: `${SITE_URL}/he/about`, altEn: `${SITE_URL}/en/about`, changefreq: 'monthly', priority: '0.8' },
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="he" href="${page.altHe}" />
    <xhtml:link rel="alternate" hreflang="en" href="${page.altEn}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${page.altHe}" />
  </url>`
  )
  .join('\n')}
${allItems
  .map(
    (item) => `  <url>
    <loc>${SITE_URL}/${item.lang}/${item.type}/${item.slug}</loc>
    <lastmod>${new Date(item.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="he" href="${SITE_URL}/he/${item.type}/${item.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en/${item.type}/${item.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/he/${item.type}/${item.slug}" />
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // 2. Generate rss.xml
  const rssItems = [...heMusicPosts, ...heTechProjects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Ohad Leshno Blog</title>
  <link>${SITE_URL}</link>
  <description>Music analysis, culture, and AI engineering write-ups by Ohad Leshno</description>
  <language>he-IL</language>
  ${rssItems
    .map(
      (item) => `
  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${SITE_URL}/${item.lang}/${item.type}/${item.slug}</link>
    <description><![CDATA[${item.excerpt}]]></description>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <guid>${SITE_URL}/${item.lang}/${item.type}/${item.slug}</guid>
  </item>`
    )
    .join('')}
</channel>
</rss>`;

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssXml, 'utf-8');
  console.log('Successfully generated sitemap.xml and rss.xml in public directory!');
}

generateSyndication();

