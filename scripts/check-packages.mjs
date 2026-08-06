let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}

import { builtinModules } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const declared = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  ...Object.keys(packageJson.optionalDependencies || {}),
]);
const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);
const extensions = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const sourceRoots = ['src', 'scripts'];
const missing = new Map();
let checkedFiles = 0;
let checkedImports = 0;

function packageName(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

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

function addSpecifier(specifier, file) {
  if (
    !specifier ||
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('@/') ||
    specifier.includes('://') ||
    builtins.has(specifier)
  ) return;

  checkedImports += 1;
  const name = packageName(specifier);
  if (declared.has(name) || builtins.has(name)) return;
  const files = missing.get(name) || new Set();
  files.add(path.relative(root, file));
  missing.set(name, files);
}

for (const sourceRoot of sourceRoots) {
  const files = await walk(path.join(root, sourceRoot));
  for (const file of files) {
    checkedFiles += 1;
    const source = await readFile(file, 'utf8');
    const kind = /\.tsx?$/.test(file)
      ? (file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
      : (file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.JS);
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, kind);

    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        addSpecifier(node.moduleSpecifier.text, file);
      }
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        addSpecifier(node.arguments[0].text, file);
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
}

if (missing.size) {
  const details = [...missing.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, files]) => `${name}: ${[...files].sort().join(', ')}`)
    .join('\n');
  throw new Error(`Undeclared package import(s):\n${details}`);
}

console.log(`Package import contract passed (${checkedImports} imports across ${checkedFiles} files).`);
