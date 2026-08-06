let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}
import { readFile } from 'node:fs/promises';

const schema = await readFile('database/schema.sql', 'utf8');
const tableColumns = new Map();
for (const match of schema.matchAll(/CREATE TABLE\s+`([^`]+)`\s*\(([\s\S]*?)\n\)\s*(?:ENGINE|;)/gi)) {
  const columns = new Set([...match[2].matchAll(/^\s*`([^`]+)`\s+/gm)].map((entry) => entry[1].toLowerCase()));
  tableColumns.set(match[1].toLowerCase(), columns);
}
const tables = new Set(tableColumns.keys());
const files = [
  'src/server/public-backend/controller/index.js',
  'src/server/admin-backend/controllers/mainController.js',
  'scripts/seed-admin.mjs',
];

function declarationBefore(declarations, name, position) {
  const entries = declarations.get(name) || [];
  let selected;
  for (const entry of entries) {
    if (entry.position <= position && (!selected || entry.position > selected.position)) selected = entry;
  }
  return selected?.initializer;
}

function valueOf(node, sourceFile, declarations, position, seen = new Set()) {
  if (!node) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map((span) => ` dynamic ${span.literal.text}`).join('');
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return valueOf(node.left, sourceFile, declarations, position, seen) + valueOf(node.right, sourceFile, declarations, position, seen);
  }
  if (ts.isIdentifier(node) && !seen.has(node.text)) {
    const initializer = declarationBefore(declarations, node.text, position);
    if (initializer) return valueOf(initializer, sourceFile, declarations, position, new Set([...seen, node.text]));
  }
  return '';
}

const referenced = new Set();
const columnErrors = [];
let queryCount = 0;

function checkColumn(table, column, context) {
  const columns = tableColumns.get(table.toLowerCase());
  if (columns && !columns.has(column.toLowerCase())) columnErrors.push(`${context}: ${table}.${column}`);
}

function inspectSql(text, context) {
  if (!text.trim()) return;
  queryCount += 1;
  for (const match of text.matchAll(/\b(?:FROM|JOIN|INTO|(?<!KEY )UPDATE|DELETE\s+FROM)\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/gi)) {
    referenced.add(match[1].toLowerCase());
  }

  for (const match of text.matchAll(/INSERT\s+INTO\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*\(([^)]+)\)/gi)) {
    const table = match[1].toLowerCase();
    for (const raw of match[2].split(',')) {
      const column = raw.trim().replace(/^`|`$/g, '');
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) checkColumn(table, column, context);
    }
  }

  for (const match of text.matchAll(/(?<!KEY )UPDATE\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s+SET\s+([\s\S]*?)(?:\bWHERE\b|$)/gi)) {
    const table = match[1].toLowerCase();
    for (const assignment of match[2].split(',')) {
      const column = assignment.match(/^\s*`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*=/)?.[1];
      if (column) checkColumn(table, column, context);
    }
  }
}

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  const declarations = new Map();

  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const list = declarations.get(node.name.text) || [];
      list.push({ position: node.getStart(sourceFile), initializer: node.initializer });
      declarations.set(node.name.text, list);
    }
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      /^(?:query|execute)$/.test(node.expression.name.text) &&
      node.arguments[0]
    ) {
      const position = node.getStart(sourceFile);
      const text = valueOf(node.arguments[0], sourceFile, declarations, position);
      const line = sourceFile.getLineAndCharacterOfPosition(position).line + 1;
      inspectSql(text, `${file}:${line}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

const ignored = new Set(['json_table', 'dynamic']);
const missing = [...referenced].filter((table) => !tables.has(table) && !ignored.has(table)).sort();
if (missing.length) throw new Error(`Database schema is missing referenced table(s): ${missing.join(', ')}`);
if (columnErrors.length) throw new Error(`Database schema column mismatch(es):\n${columnErrors.join('\n')}`);

const required = ['users', 'items', 'document', 'organization_submissions', 'owners', 'footercontents', 'website_seo', 'bankdata'];
const absentRequired = required.filter((table) => !tables.has(table));
if (absentRequired.length) throw new Error(`Database schema is missing core table(s): ${absentRequired.join(', ')}`);

console.log(`Database contract passed (${tables.size} schema tables; ${referenced.size} referenced tables; ${queryCount} query calls checked).`);
