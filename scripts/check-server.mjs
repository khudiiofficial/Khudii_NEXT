import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const roots = ['src/server', 'src/app/api-app', 'src/app/media-app', 'src/proxy.js', 'next.config.mjs'];
const files = [];

async function walk(entry) {
  const stat = await import('node:fs/promises').then(({ stat }) => stat(entry));
  if (stat.isFile()) {
    if (/\.(?:js|mjs)$/.test(entry)) files.push(entry);
    return;
  }
  for (const item of await readdir(entry, { withFileTypes: true })) {
    await walk(path.join(entry, item.name));
  }
}

for (const root of roots) await walk(root);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}
console.log(`Server syntax check passed (${files.length} files).`);
