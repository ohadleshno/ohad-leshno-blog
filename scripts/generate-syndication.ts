import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SITE_URL = 'https://ohadleshno.com';

function generateSyndication() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Load posts for RSS & Sitemap
  const musicDir = path.join(process.cwd(), 'content/music-blog/he');
  const files = fs.existsSync(musicDir) ? fs.readdirSync(musicDir).filter((f) => f.endsWith('.md')) : [];

  const items = files.map((file) => {
    const filePath = path.join(musicDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    const slug = data.slug || file.replace(/\.md$/, '');
    return {
      title: data.title || slug,
      slug,
      excerpt: data.excerpt || '',
      date: data.date || new Date().toISOString(),
    };
  });

  // 1. Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/he</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/en</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/he/music</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/he/tech</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/he/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  ${items
    .map(
      (item) => `
  <url>
    <loc>${SITE_URL}/he/music/${item.slug}</loc>
    <lastmod>${new Date(item.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // 2. Generate rss.xml
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Ohad Leshno Blog</title>
  <link>${SITE_URL}</link>
  <description>Music analysis, culture, and AI engineering write-ups</description>
  <language>he-IL</language>
  ${items
    .map(
      (item) => `
  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${SITE_URL}/he/music/${item.slug}</link>
    <description><![CDATA[${item.excerpt}]]></description>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <guid>${SITE_URL}/he/music/${item.slug}</guid>
  </item>`
    )
    .join('')}
</channel>
</rss>`;

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssXml, 'utf-8');
  console.log('Successfully generated sitemap.xml and rss.xml in public directory!');
}

generateSyndication();
