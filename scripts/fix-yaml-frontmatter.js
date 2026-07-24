const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function cleanYamlString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  // Strip all backslashes and double quotes, replacing with clean single quotes
  cleaned = cleaned.replace(/\\+/g, '').replace(/"/g, "'");
  return cleaned;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      if (!fileContent.startsWith('---')) continue;

      const parts = fileContent.split('---');
      if (parts.length < 3) continue;

      const fmLines = parts[1].split('\n');
      const newFmLines = [];

      for (let line of fmLines) {
        if (line.startsWith('title:')) {
          const val = line.replace(/^title:\s*/, '');
          const cleanVal = cleanYamlString(val);
          newFmLines.push(`title: "${cleanVal}"`);
        } else if (line.startsWith('excerpt:')) {
          const val = line.replace(/^excerpt:\s*/, '');
          const cleanVal = cleanYamlString(val);
          newFmLines.push(`excerpt: "${cleanVal}"`);
        } else {
          newFmLines.push(line);
        }
      }

      parts[1] = newFmLines.join('\n');
      const newContent = parts.join('---');

      try {
        matter(newContent);
        fs.writeFileSync(fullPath, newContent, 'utf-8');
      } catch (err) {
        console.error('Failed fixing file:', fullPath, err.message);
      }
    }
  }
}

console.log('Sanitizing all YAML frontmatters...');
processDirectory(path.join(process.cwd(), 'content'));
console.log('Frontmatter sanitization complete!');
