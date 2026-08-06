let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const roots = ['src', 'scripts'];
const files = [];

async function walk(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:js|jsx|mjs|cjs)$/.test(file)) files.push(file);
  }
}

for (const root of roots) await walk(root);

const errors = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      checkJs: false,
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  });

  for (const diagnostic of result.diagnostics || []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    let location = '';
    if (diagnostic.file && diagnostic.start != null) {
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      location = `:${position.line + 1}:${position.character + 1}`;
    }
    errors.push(
      `${file}${location} TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
    );
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`JavaScript/JSX syntax check passed (${files.length} files).`);
