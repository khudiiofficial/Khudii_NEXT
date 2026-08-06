import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const roots = ['src'];
const sourceFiles = [];
const publicRoot = path.resolve('public');
const literalAsset = /["'(](\/[^\s"'()?#]+\.(?:png|jpe?g|webp|gif|svg|mp4|webm|ico|html))/gi;

async function walk(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:js|jsx|css)$/.test(file)) sourceFiles.push(file);
  }
}

for (const root of roots) await walk(root);

const missing = [];
for (const file of sourceFiles) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(literalAsset)) {
    const assetPath = decodeURIComponent(match[1]);
    if (assetPath.startsWith('/_next/')) continue;
    try {
      await stat(path.join(publicRoot, assetPath.slice(1)));
    } catch {
      missing.push(`${file}: ${assetPath}`);
    }
  }
}

if (missing.length) {
  console.error(`Missing literal public assets:\n${[...new Set(missing)].join('\n')}`);
  process.exit(1);
}

console.log(`Literal public asset check passed (${sourceFiles.length} source files).`);
