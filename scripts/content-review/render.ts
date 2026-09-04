import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';
import type { Plugin } from 'unified';

type SourceNode = {
  children?: SourceNode[];
  data?: { hProperties?: Record<string, number> };
  position?: { start?: { line?: number }; end?: { line?: number } };
};

const sourcePositionPlugin = ((sourceOffset = 0) => {
  return (tree: SourceNode) => {
    const visit = (node: SourceNode) => {
      const startLine = node.position?.start?.line;
      const endLine = node.position?.end?.line;
      if (startLine && endLine) {
        node.data ??= {};
        node.data.hProperties = {
          ...node.data.hProperties,
          'data-source-start': startLine + sourceOffset,
          'data-source-end': endLine + sourceOffset,
        };
      }
      node.children?.forEach(visit);
    };
    tree.children?.forEach(visit);
  };
}) as unknown as Plugin<[number]>;

export function renderMarkdown(markdown: string): string {
  const { content } = matter(markdown);
  const contentIndex = markdown.indexOf(content);
  const sourceOffset =
    contentIndex <= 0 ? 0 : markdown.slice(0, contentIndex).split('\n').length - 1;
  return remark()
    .use(remarkGfm)
    .use(sourcePositionPlugin, sourceOffset)
    .use(html, { sanitize: false })
    .processSync(content)
    .toString();
}
