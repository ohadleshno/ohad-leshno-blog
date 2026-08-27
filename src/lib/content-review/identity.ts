import { REVIEW_LANGS, type ReviewLang } from './types';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isReviewLang(value: string): value is ReviewLang {
  return (REVIEW_LANGS as readonly string[]).includes(value);
}

export function assertReviewIdentity(lang: string, slug: string): { lang: ReviewLang; slug: string } {
  if (!isReviewLang(lang)) {
    throw new Error('Invalid review language');
  }
  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    throw new Error('Invalid review slug');
  }
  return { lang, slug };
}

export function techBlogRelativePath(lang: string, slug: string): string {
  const identity = assertReviewIdentity(lang, slug);
  return `content/tech-blog/${identity.lang}/${identity.slug}.md`;
}
