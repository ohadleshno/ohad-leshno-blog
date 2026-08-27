import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, 'content');
const stampPath = path.join(__dirname, 'src/lib/content-stamp.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Markdown is read via fs (not imported). Touch a small stamp module on
    // content changes so Fast Refresh re-runs loaders without a full rebuild
    // that can corrupt vendor chunks (e.g. highlight.js).
    if (dev) {
      config.plugins.push({
        apply(compiler) {
          let watching = false;
          let debounce;

          compiler.hooks.afterEnvironment.tap('WatchMarkdownContent', () => {
            if (watching) return;
            watching = true;

            try {
              fs.watch(contentDir, { recursive: true }, (_event, filename) => {
                if (!filename || !/\.md$/i.test(filename)) return;
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                  fs.writeFileSync(
                    stampPath,
                    `// Auto-updated in dev when content/*.md changes — forces content loaders to re-run.\nexport const contentStamp = ${Date.now()};\n`
                  );
                }, 50);
              });
            } catch {
              // Recursive fs.watch is unsupported on some platforms; fall back silently.
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
