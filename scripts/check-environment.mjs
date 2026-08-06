let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const extensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const sourceRoots = ['src', 'scripts'];
const referenced = new Map();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function record(name, file, sourceFile, node) {
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const places = referenced.get(name) || [];
  places.push(`${path.relative(root, file)}:${line}`);
  referenced.set(name, places);
}

for (const sourceRoot of sourceRoots) {
  for (const file of await walk(path.join(root, sourceRoot))) {
    const source = await readFile(file, 'utf8');
    const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.ts') ? ts.ScriptKind.TS : file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, kind);
    function visit(node) {
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'process' &&
        node.expression.name.text === 'env'
      ) {
        record(node.name.text, file, sourceFile, node);
      }
      if (
        ts.isElementAccessExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'process' &&
        node.expression.name.text === 'env' &&
        node.argumentExpression &&
        ts.isStringLiteral(node.argumentExpression)
      ) {
        record(node.argumentExpression.text, file, sourceFile, node);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
}

const envExample = await readFile(path.join(root, '.env.example'), 'utf8');
const documented = new Set(
  [...envExample.matchAll(/^\s*#?\s*([A-Z][A-Z0-9_]*)\s*=/gm)].map((match) => match[1]),
);
const implicit = new Set(['NODE_ENV', 'VERCEL', 'VERCEL_ENV', 'VERCEL_URL']);
const missing = [...referenced.keys()].filter((name) => !documented.has(name) && !implicit.has(name)).sort();
if (missing.length) {
  const details = missing.map((name) => `${name}: ${(referenced.get(name) || []).join(', ')}`).join('\n');
  throw new Error(`Environment variable(s) are used but not documented in .env.example:\n${details}`);
}

for (const publicName of referenced.keys()) {
  if (publicName.includes('SECRET') && publicName.startsWith('NEXT_PUBLIC_')) {
    throw new Error(`Sensitive-looking variable is exposed to the browser: ${publicName}`);
  }
}

console.log(`Environment contract passed (${referenced.size} referenced variables; all documented or platform-provided).`);
