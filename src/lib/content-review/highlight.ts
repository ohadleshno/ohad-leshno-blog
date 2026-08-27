import { headingSections } from './text';

export function changedHeadingTitles(markdown: string, changedLines: number[]): string[] {
  const changed = new Set(changedLines);
  return headingSections(markdown)
    .filter((section) => {
      for (let line = section.startLine; line <= section.endLine; line += 1) {
        if (changed.has(line)) return true;
      }
      return false;
    })
    .map((section) => section.heading);
}

function headingText(innerHtml: string): string {
  return innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export function highlightChangedHeadings(html: string, titles: string[]): string {
  const wanted = new Set(titles);
  return html.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag: string, attrs: string, inner: string) => {
    if (!wanted.has(headingText(inner))) return match;
    if (/\breview-changed-heading\b/.test(attrs)) return match;
    if (/class="/i.test(attrs)) {
      return `<${tag}${attrs.replace(/class="/i, 'class="review-changed-heading ')}>${inner}</${tag}>`;
    }
    return `<${tag} class="review-changed-heading"${attrs}>${inner}</${tag}>`;
  });
}
