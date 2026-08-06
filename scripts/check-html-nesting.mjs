let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:js|jsx|ts|tsx)$/.test(file)) files.push(file);
  }
}

await walk('src');
const findings = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    /\.tsx?$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.JSX,
  );

  function tagName(node) {
    return node.getText(sourceFile).toLowerCase();
  }

  function visit(node, openInteractive = []) {
    if (ts.isJsxElement(node)) {
      const name = tagName(node.openingElement.tagName);
      const isCheckedTag = name === 'a' || name === 'button';
      if (isCheckedTag && openInteractive.includes(name)) {
        const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        findings.push(`${file}:${location.line + 1}:${location.character + 1}: nested <${name}> element`);
      }
      const next = isCheckedTag ? [...openInteractive, name] : openInteractive;
      for (const child of node.children) visit(child, next);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, openInteractive));
  }

  visit(sourceFile);
}

if (findings.length) {
  throw new Error(`Invalid interactive HTML nesting found:\n${findings.join('\n')}`);
}

console.log(`HTML nesting check passed (${files.length} source files; no nested anchors or buttons).`);
