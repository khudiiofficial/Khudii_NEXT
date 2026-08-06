import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const roots = ['src/app', 'src/components', 'src/lib', 'src/legacy'];
const files = [];
const extensions = ['.js', '.jsx', '.mjs', '.json'];

async function walk(root) {
  const info = await stat(root);
  if (info.isFile()) {
    if (/\.(?:js|jsx|mjs)$/.test(root)) files.push(root);
    return;
  }
  for (const entry of await readdir(root, { withFileTypes: true })) {
    await walk(path.join(root, entry.name));
  }
}
for (const root of roots) await walk(root);

async function exists(candidate) {
  try { await stat(candidate); return true; } catch { return false; }
}

async function resolveImport(from, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join('src', specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(from), specifier);
  else return true;
  if (await exists(base)) return true;
  for (const ext of extensions) if (await exists(base + ext)) return true;
  for (const ext of extensions) if (await exists(path.join(base, `index${ext}`))) return true;
  return false;
}

const missing = [];
const pattern = /(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"]([^'\"]+)['\"]|import\(['\"]([^'\"]+)['\"]\)/g;
for (const file of files) {
  const raw = await readFile(file, 'utf8');
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const match of text.matchAll(pattern)) {
    const specifier = match[1] || match[2];
    if (!(await resolveImport(file, specifier))) missing.push(`${file}: ${specifier}`);
  }
}
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log(`Local import check passed (${files.length} files).`);
