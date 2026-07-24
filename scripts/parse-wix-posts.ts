import fs from 'fs';
import path from 'path';

interface WixBlock {
  key: string;
  type: string;
  text: string;
  depth: number;
  inlineStyleRanges: any[];
  entityRanges: { key: number; offset: number; length: number }[];
  data?: any;
}

interface WixEntity {
  type: string;
  mutability: string;
  data: any;
}

interface WixPostContent {
  blocks: WixBlock[];
  entityMap: Record<string, WixEntity>;
}

interface WixPost {
  id: string;
  title: string;
  excerpt: string;
  firstPublishedDate: string;
  lastPublishedDate: string;
  slug: string;
  coverMedia?: {
    enabled: boolean;
    image?: {
      url: string;
      height: number;
      width: number;
      filename: string;
    };
  };
  minutesToRead: number;
  language: string;
  content: string;
}

function convertBlocksToMarkdown(contentStr: string): string {
  if (!contentStr) return '';
  let contentJson: WixPostContent;
  try {
    contentJson = JSON.parse(contentStr);
  } catch (e) {
    return contentStr;
  }

  const { blocks = [], entityMap = {} } = contentJson;
  const lines: string[] = [];

  for (const block of blocks) {
    const { type, text, entityRanges } = block;

    if (type === 'atomic' && entityRanges && entityRanges.length > 0) {
      const entityKey = entityRanges[0].key;
      const entity = entityMap[String(entityKey)];
      if (entity) {
        if (entity.type === 'wix-draft-plugin-image') {
          const src = entity.data?.src?.url || (entity.data?.src?.id ? `https://static.wixstatic.com/media/${entity.data.src.id}` : '');
          const caption = entity.data?.metadata?.caption || '';
          if (src) {
            lines.push(`\n![${caption}](${src})\n`);
          }
        } else if (entity.type === 'wix-draft-plugin-video') {
          const videoSrc = entity.data?.src || '';
          const title = entity.data?.metadata?.title || 'Embedded Video';
          if (videoSrc) {
            lines.push(`\n<YouTubeEmbed url="${videoSrc}" title="${title.replace(/"/g, '&quot;')}" />\n`);
          }
        }
      }
      continue;
    }

    if (!text.trim()) {
      continue;
    }

    let formattedText = text;

    if (type === 'header-one') {
      lines.push(`\n# ${formattedText}\n`);
    } else if (type === 'header-two') {
      lines.push(`\n## ${formattedText}\n`);
    } else if (type === 'header-three') {
      lines.push(`\n### ${formattedText}\n`);
    } else if (type === 'header-four') {
      lines.push(`\n#### ${formattedText}\n`);
    } else if (type === 'header-five') {
      lines.push(`\n##### ${formattedText}\n`);
    } else if (type === 'header-six') {
      lines.push(`\n###### ${formattedText}\n`);
    } else if (type === 'blockquote') {
      lines.push(`\n> ${formattedText}\n`);
    } else {
      lines.push(`\n${formattedText}\n`);
    }
  }

  return lines.join('\n').trim();
}

function parseWixPosts() {
  const jsonPath = path.join(process.cwd(), 'wix-blog-posts-detailed.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File wix-blog-posts-detailed.json not found!');
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const posts: WixPost[] = JSON.parse(rawData);

  const musicHeDir = path.join(process.cwd(), 'content/music-blog/he');
  const musicEnDir = path.join(process.cwd(), 'content/music-blog/en');
  const aboutDir = path.join(process.cwd(), 'content/about');

  fs.mkdirSync(musicHeDir, { recursive: true });
  fs.mkdirSync(musicEnDir, { recursive: true });
  fs.mkdirSync(aboutDir, { recursive: true });

  console.log(`Processing ${posts.length} Wix blog posts...`);

  for (const post of posts) {
    const slug = post.slug || post.id;
    const coverImage = post.coverMedia?.image?.url || '/public/hero-cover.jpeg';
    const markdownContent = convertBlocksToMarkdown(post.content);

    const heFrontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${slug}"
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
date: "${post.firstPublishedDate}"
coverImage: "${coverImage}"
minutesToRead: ${post.minutesToRead || 5}
language: "he"
---

${markdownContent}
`;

    fs.writeFileSync(path.join(musicHeDir, `${slug}.md`), heFrontmatter, 'utf-8');

    const enFrontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${slug}"
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
date: "${post.firstPublishedDate}"
coverImage: "${coverImage}"
minutesToRead: ${post.minutesToRead || 5}
language: "en"
---

${markdownContent}
`;

    fs.writeFileSync(path.join(musicEnDir, `${slug}.md`), enFrontmatter, 'utf-8');
  }

  // Create initial About files
  const aboutHe = `---
title: "אודות - אוהד לשנו"
language: "he"
avatar: "/public/ohad_leshno.avif"
---

# אודות אוהד לשנו

ברוכים הבאים לבלוג שלי! 
אני אוהד לשנו - מוזיקאי, חוקר מוזיקה ואיש טכנולוגיה / AI.

בבלוג זה אני משלב בין שתי האהבות הגדולות שלי: ניתוח מוזיקלי ותרבותי של יצירות ישראליות ועולמיות, לצד כתיבה טכנית ומחקר בתחומי ה-AI והפיתוח.
`;

  const aboutEn = `---
title: "About - Ohad Leshno"
language: "en"
avatar: "/public/ohad_leshno.avif"
---

# About Ohad Leshno

Welcome to my blog!
I'm Ohad Leshno — musician, music researcher, and AI & software engineer.

In this blog, I combine my two passions: in-depth musical and cultural analysis of iconic songs alongside technical write-ups and research on AI engineering projects.
`;

  fs.writeFileSync(path.join(aboutDir, 'he.md'), aboutHe, 'utf-8');
  fs.writeFileSync(path.join(aboutDir, 'en.md'), aboutEn, 'utf-8');

  console.log(`Successfully migrated ${posts.length} posts and created About pages!`);
}

parseWixPosts();
