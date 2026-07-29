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

function extractYouTubeId(url: string): string {
  if (!url) return '';
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')[1];
    return parts ? parts.split('?')[0] : '';
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : '';
    } catch (e) {
      return '';
    }
  }
  return '';
}

function formatImageUrl(url?: string): string {
  if (!url) return '/hero-cover.webp';
  if (url.includes('wixstatic.com/media/')) {
    const rawName = url.split('wixstatic.com/media/')[1].split('~')[0];
    const base = rawName.replace(/\.(png|jpg|jpeg|avif)$/i, '');
    return `/images/wix/${base}.webp`;
  }
  return url.replace(/\.(png|jpg|jpeg|avif)$/i, '.webp');
}

function extractFirstImage(contentStr: string, coverMediaUrl?: string): string {
  if (coverMediaUrl) return formatImageUrl(coverMediaUrl);
  try {
    const json: WixPostContent = JSON.parse(contentStr);
    for (const key in json.entityMap || {}) {
      const entity = json.entityMap[key];
      if (entity?.type === 'wix-draft-plugin-image') {
        const src = entity.data?.src?.url || (entity.data?.src?.id ? `https://static.wixstatic.com/media/${entity.data.src.id}` : '');
        if (src) return formatImageUrl(src);
      }
    }
  } catch (e) {}
  return '/hero-cover.webp';
}

function formatBlockText(block: WixBlock, entityMap: Record<string, WixEntity>): string {
  let { text, entityRanges = [] } = block;
  if (!text) return '';

  const sortedRanges = [...entityRanges].sort((a, b) => b.offset - a.offset);

  for (const range of sortedRanges) {
    const entity = entityMap[String(range.key)];
    if (entity && entity.type === 'LINK' && entity.data?.url) {
      const url = entity.data.url;
      const start = range.offset;
      const end = range.offset + range.length;
      const anchorText = text.slice(start, end);
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500 font-medium break-all">${anchorText}</a>`;
      text = text.slice(0, start) + linkHtml + text.slice(end);
    }
  }

  // Auto-link plain http/https URLs not inside HTML tags/attributes
  const urlRegex = /(?<!href=["']|src=["'])(https?:\/\/[^\s<"']+)/g;
  text = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500 font-medium break-all">${url}</a>`;
  });

  return text.trim();
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
  let currentList: string[] = [];
  let currentListType: 'unordered' | 'ordered' | null = null;

  function flushList() {
    if (currentList.length > 0) {
      lines.push(currentList.join('\n'));
      currentList = [];
      currentListType = null;
    }
  }

  for (const block of blocks) {
    const { type, text, entityRanges } = block;

    if (type === 'unordered-list-item' || type === 'ordered-list-item') {
      const listKind = type === 'unordered-list-item' ? 'unordered' : 'ordered';
      if (currentListType && currentListType !== listKind) {
        flushList();
      }
      currentListType = listKind;
      const prefix = listKind === 'unordered' ? '- ' : '1. ';
      const formattedItem = formatBlockText(block, entityMap);
      currentList.push(`${prefix}${formattedItem}`);
      continue;
    } else {
      flushList();
    }

    if (type === 'atomic' && entityRanges && entityRanges.length > 0) {
      const entityKey = entityRanges[0].key;
      const entity = entityMap[String(entityKey)];
      if (entity) {
        if (entity.type === 'wix-draft-plugin-image') {
          const src = entity.data?.src?.url || (entity.data?.src?.id ? `https://static.wixstatic.com/media/${entity.data.src.id}` : '');
          const caption = entity.data?.metadata?.caption || '';
          if (src) {
            lines.push(`<figure class="my-8"><img src="${src}" alt="${caption.replace(/"/g, '&quot;')}" class="w-full h-auto rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover max-h-[550px]" />${caption ? `<figcaption class="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">${caption}</figcaption>` : ''}</figure>`);
          }
        } else if (entity.type === 'wix-draft-plugin-video') {
          const videoSrc = entity.data?.src || '';
          const title = entity.data?.metadata?.title || 'Video Embed';
          const videoId = extractYouTubeId(videoSrc);
          if (videoId) {
            lines.push(`<div class="my-8 overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 bg-black"><div class="relative w-full pb-[56.25%]"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="${title.replace(/"/g, '&quot;')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="absolute top-0 left-0 w-full h-full border-0"></iframe></div></div>`);
          } else if (videoSrc) {
            lines.push(`[Watch Video: ${title}](${videoSrc})`);
          }
        } else if (entity.type === 'wix-draft-plugin-html') {
          const htmlContent = entity.data?.src || entity.data?.html || '';
          if (htmlContent) {
            lines.push(`<div class="my-8 overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex justify-center">${htmlContent}</div>`);
          }
        }
      }
      continue;
    }

    if (!text.trim()) {
      continue;
    }

    const formattedBlockText = formatBlockText(block, entityMap);

    if (type === 'header-one') {
      lines.push(`# ${formattedBlockText}`);
    } else if (type === 'header-two') {
      lines.push(`## ${formattedBlockText}`);
    } else if (type === 'header-three') {
      lines.push(`### ${formattedBlockText}`);
    } else if (type === 'header-four') {
      lines.push(`#### ${formattedBlockText}`);
    } else if (type === 'header-five') {
      lines.push(`##### ${formattedBlockText}`);
    } else if (type === 'header-six') {
      lines.push(`###### ${formattedBlockText}`);
    } else if (type === 'blockquote') {
      lines.push(`<blockquote dir="auto">\n${formattedBlockText}\n</blockquote>`);
    } else {
      const paragraphs = formattedBlockText.split('\n').map((p) => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        lines.push(p);
      }
    }
  }

  flushList();
  return lines.join('\n\n').trim();
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

  fs.rmSync(musicHeDir, { recursive: true, force: true });
  fs.rmSync(musicEnDir, { recursive: true, force: true });
  fs.mkdirSync(musicHeDir, { recursive: true });
  fs.mkdirSync(musicEnDir, { recursive: true });
  fs.mkdirSync(aboutDir, { recursive: true });

  console.log(`Processing ${posts.length} Wix blog posts...`);

  for (const post of posts) {
    let slug = post.slug || post.id;
    if (slug.length > 20) {
      slug = slug.substring(0, 20).replace(/-+$/, '');
    }
    const coverImage = extractFirstImage(post.content, post.coverMedia?.image?.url);
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

  const aboutHe = `---
title: "אודות - אוהד לשנו"
language: "he"
avatar: "/ohad_leshno.webp"
---

# אודות אוהד לשנו

שלום, קוראים לי אוהד לשנו, אני בן 29, נולדתי וגדלתי בתל אביב. ביום-יום אני מפתח תוכנה ומהנדס AI, אבל הלב והמחשבה שלי חצויים בין שני עולמות מרתקים: **מוזיקה וטכנולוגיה**.

### התשוקה למוזיקה
מגיל צעיר גיליתי את הכוח העצום של המוזיקה לגעת בנשמה ולהעביר מסרים עמוקים שאינם עוברים בשום פלטפורמה אחרת. מוזיקת רוק ופולק היא חלק בלתי נפרד מהמסע שלי עם האנרגיה המחשמלת והרוח החופשית שלה. אמנים כמו בוב דילן והגרייטפול דד השפיעו עמוקות על טעמי המוזיקלי, עם טקסטים מחאתיים, מלודיות על-זמניות וסיפורים שנשארים בלב.

### ארכיטקטורה, פיתוח ו-AI
כמהנדס, התשוקה שלי לא נגמרת בכתיבת קוד בלבד. אני אוהב **לתכנן ולבנות מערכות מקצה לקצה, לפצח בעיות ארכיטקטוניות מורכבות ולחקור עולמות של Generative AI והנדסת תוכנה מתקדמת**. בבלוג הזה תוכלו למצוא לצד הניתוחים המוזיקליים גם סקירות טכניות מעמיקות, תיעוד ארכיטקטוני (Design Docs), וניתוחים מעשיים של פרויקטים שבניתי.

### מה תמצאו בבלוג?
הבלוג הזה הוא המרחב שלי לחבר בין שני העולמות:
- **ניתוחי אלבומים וסיפורים מוזיקליים**: צלילה לעומק היצירות והאמנים ששינו את פני המוזיקה.
- **פרויקטי AI וארכיטקטורת תוכנה**: ניתוחי עומק טכניים, תכנון ארכיטקטוני ותובנות מפיתוח מערכות מתקדמות.

הצטרפו אליי למסע שבין צלילים לקוד. תודה על הביקור, מקווה שתמצאו כאן עניין והשראה.
`;

  const aboutEn = `---
title: "About - Ohad Leshno"
language: "en"
avatar: "/ohad_leshno.webp"
---

# About Ohad Leshno

Hello, my name is Ohad Leshno, I am 29 years old, born and raised in Tel Aviv. By day, I am a software developer and AI engineer, but my mind and heart are shared between two fascinating worlds: **Music and Technology**.

### Passion for Music
From a young age, I discovered the immense power of music to touch the soul and convey deep messages that no other medium can express. Rock and folk music have been constant companions on my journey with their electrifying energy and free spirit. Artists like Bob Dylan and the Grateful Dead deeply influenced my musical taste with their passionate lyrics, powerful melodies, and timeless storytelling.

### Systems, Architecture & AI
As an engineer, my passion goes beyond writing lines of code. I love **designing end-to-end systems, solving complex architectural challenges, and researching Generative AI and advanced software design**. Alongside musical analyses, this blog features deep-dive technical write-ups, system architecture design docs, and hands-on lessons learned from building real-world software projects.

### What You Will Find Here
This blog is my platform to bridge both worlds:
- **Musical Deep Dives**: Cultural and musical breakdowns of iconic albums and artists that shaped history.
- **AI Projects & System Architecture**: Technical design documents, architectural decisions, and hands-on software engineering insights.

Join me on this journey between sound and code. Thank you for stopping by, and I hope you find inspiration here.
`;

  fs.writeFileSync(path.join(aboutDir, 'he.md'), aboutHe, 'utf-8');
  fs.writeFileSync(path.join(aboutDir, 'en.md'), aboutEn, 'utf-8');

  console.log(`Successfully migrated ${posts.length} posts and created About pages!`);
}

parseWixPosts();
