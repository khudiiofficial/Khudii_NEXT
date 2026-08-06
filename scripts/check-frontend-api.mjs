let ts;
try {
  ts = (await import('typescript')).default;
} catch {
  ts = (await import('file:///opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js')).default;
}
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const roots = [
  { dir: 'src/legacy/public', surface: 'public' },
  { dir: 'src/legacy/admin', surface: 'admin' },
];

async function walk(dir, output = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file, output);
    else if (/\.(?:js|jsx)$/.test(file)) output.push(file);
  }
  return output;
}

function parseRoutes(source) {
  const routes = [];
  const pattern = /(?:route|protectedRoute|openRoute)\(\s*['"](GET|POST|PUT|PATCH|DELETE)['"]\s*,\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) routes.push({ method: match[1], path: match[2] });
  return routes;
}

function routeMatches(pattern, actual) {
  const source = pattern
    .split('/')
    .map((part) => (part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${source}/?$`).test(actual);
}

function expressionTexts(node, sourceFile, declarations, seen = new Set()) {
  if (!node) return [];
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;
    for (const span of node.templateSpans) {
      const expr = span.expression.getText(sourceFile);
      if (!/^(?:APIPath|API_URL|API_BASE_URL|process\.env\.[A-Z0-9_]+)$/.test(expr)) value += ':param';
      value += span.literal.text;
    }
    return [value];
  }
  if (ts.isConditionalExpression(node)) {
    return [...expressionTexts(node.whenTrue, sourceFile, declarations, seen), ...expressionTexts(node.whenFalse, sourceFile, declarations, seen)];
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = expressionTexts(node.left, sourceFile, declarations, seen);
    const right = expressionTexts(node.right, sourceFile, declarations, seen);
    const values = [];
    for (const a of left) for (const b of right) values.push(a + b);
    return values;
  }
  if (ts.isIdentifier(node)) {
    if (/^(?:APIPath|API_URL|API_BASE_URL)$/.test(node.text)) return [''];
    if (seen.has(node.text)) return [];
    const initializer = declarations.get(node.text);
    if (!initializer) return [];
    return expressionTexts(initializer, sourceFile, declarations, new Set([...seen, node.text]));
  }
  return [];
}


function methodsFromFetch(node, sourceFile, declarations) {
  const init = node.arguments[1];
  if (!init || !ts.isObjectLiteralExpression(init)) return ['GET'];
  for (const property of init.properties) {
    if (ts.isShorthandPropertyAssignment(property) && property.name.text === 'method') {
      const values = expressionTexts(property.name, sourceFile, declarations);
      if (values.length) return values.map((value) => value.toUpperCase());
      continue;
    }
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replace(/["']/g, '');
    if (name !== 'method') continue;
    if (ts.isStringLiteral(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer)) {
      return [property.initializer.text.toUpperCase()];
    }
    const values = expressionTexts(property.initializer, sourceFile, declarations);
    if (values.length) return values.map((value) => value.toUpperCase());
  }
  return ['GET'];
}

function normalizeUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return null;
  let value = raw.replace(/^\$?\{?(?:APIPath|API_URL|API_BASE_URL)\}?/, '');
  if (!value.startsWith('/')) return null;
  value = value.split('?')[0].replace(/\/+/g, '/');
  value = value.replace(/:param(?=\/|$)/g, 'dynamic');
  return value || '/';
}

const registries = {
  public: parseRoutes(await readFile('src/server/public-routes.js', 'utf8')),
  admin: parseRoutes(await readFile('src/server/admin-routes.js', 'utf8')),
};

const calls = [];
const unresolved = [];

for (const root of roots) {
  for (const file of await walk(root.dir)) {
    const source = await readFile(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JSX);
    const declarations = new Map();
    function collectDeclarations(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        declarations.set(node.name.text, node.initializer);
      }
      ts.forEachChild(node, collectDeclarations);
    }
    collectDeclarations(sourceFile);

    function visit(node) {
      if (ts.isCallExpression(node)) {
        let method;
        let urlNode;

        if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'axios' &&
          /^(get|post|put|patch|delete)$/i.test(node.expression.name.text)
        ) {
          method = [node.expression.name.text.toUpperCase()];
          urlNode = node.arguments[0];
        } else if (ts.isIdentifier(node.expression) && node.expression.text === 'fetch') {
          method = methodsFromFetch(node, sourceFile, declarations);
          urlNode = node.arguments[0];
        }

        if (method && urlNode) {
          const raws = expressionTexts(urlNode, sourceFile, declarations);
          const methods = Array.isArray(method) ? method : [method];
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
          if (!raws.length) {
            unresolved.push(`${file}:${line} ${methods.join('|')} ${urlNode.getText(sourceFile)}`);
          } else {
            if (raws.length === methods.length && raws.length > 1) {
              raws.forEach((raw, index) => {
                const url = normalizeUrl(raw);
                if (url) calls.push({ surface: root.surface, method: methods[index], url, file, line });
              });
            } else {
              for (const raw of raws) {
                const url = normalizeUrl(raw);
                if (!url) continue;
                for (const requestMethod of methods) calls.push({ surface: root.surface, method: requestMethod, url, file, line });
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
}

const missing = [];
for (const call of calls) {
  const matched = registries[call.surface].some(
    (route) => route.method === call.method && routeMatches(route.path, call.url),
  );
  if (!matched) missing.push(call);
}

if (missing.length) {
  for (const call of missing) {
    console.error(`${call.file}:${call.line} ${call.surface} ${call.method} ${call.url}`);
  }
  throw new Error(`${missing.length} active frontend API call(s) do not match the ${missing[0].surface} route registry.`);
}

console.log(
  `Frontend API contract passed (${calls.length} statically resolved calls; ${unresolved.length} dynamic/external calls reviewed separately).`,
);
if (unresolved.length) {
  console.log('Unresolved request expressions:');
  for (const item of unresolved) console.log(`- ${item}`);
}
