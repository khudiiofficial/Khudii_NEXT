import { builtinModules } from 'node:module';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const requiredFiles = [
  'src/app/(public)/page.jsx',
  'src/app/(public)/organization/[slug]/page.jsx',
  'src/app/(public)/success-stories/[slug]/page.jsx',
  'src/app/(public)/Blog/[slug]/page.jsx',
  'src/app/(public)/Categories/[slug]/page.jsx',
  'src/app/(public)/[slug]/page.jsx',
  'src/app/(public)/not-found.jsx',
  'src/app/admin-app/Login/page.jsx',
  'src/app/admin-app/dashboard/page.jsx',
  'src/app/admin-app/dashboard/edit-Blog/[id]/page.jsx',
  'src/app/admin-app/dashboard/edit-organization/[id]/page.jsx',
  'src/app/admin-app/dashboard/change-password/page.jsx',
  'scripts/seed-admin.mjs',
  'scripts/check-route-parity.mjs',
  'src/app/api-app/[[...path]]/route.js',
  'src/app/media-app/chunk/route.js',
  'src/proxy.js',
  'src/server/adapter.js',
  'src/lib/router-compat.jsx',
  'src/lib/large-payload-upload.js',
  'database/schema.sql',
  'public/khudiilogo.png',
  'public/siteicon.png',
  'public/favicon.ico',
  'public/placeholder-org.webp',
  'public/fallback-org.png',
  'public/fallback-partner.png',
  'public/placeholder-thumbnail.jpg',
];

async function exists(file) {
  try { await stat(file); return true; } catch { return false; }
}
for (const file of requiredFiles) {
  if (!(await exists(file))) throw new Error(`Required migration file is missing: ${file}`);
}

if (await exists('src/middleware.js')) {
  throw new Error('Next.js 16 uses src/proxy.js; remove the obsolete duplicate src/middleware.js file.');
}

for (const [publicFile, appFile] of [
  ['public/robots.txt', 'src/app/robots.js'],
  ['public/sitemap.xml', 'src/app/sitemap.js'],
]) {
  if ((await exists(publicFile)) && (await exists(appFile))) {
    throw new Error(`Conflicting public and App Router metadata routes: ${publicFile} and ${appFile}`);
  }
}

const sourceFiles = [];
async function walk(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:js|jsx|mjs)$/.test(file)) sourceFiles.push(file);
  }
}
await walk('src');

const forbidden = [
  'import.meta.env',
  "from 'react-router-dom'",
  'from "react-router-dom"',
  "from 'react-redux'",
  'from "react-redux"',
  "from '@reduxjs/toolkit'",
  'from "@reduxjs/toolkit"',
  "from 'redux-persist'",
  'from "redux-persist"',
];
const bareImports = new Set();
const importPattern = /(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"]([^'\"]+)['\"]|import\(['\"]([^'\"]+)['\"]\)/g;
for (const file of sourceFiles) {
  const raw = await readFile(file, 'utf8');
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const marker of forbidden) {
    if (text.includes(marker)) throw new Error(`Legacy runtime dependency remains in ${file}: ${marker}`);
  }
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1] || match[2];
    if (!specifier.startsWith('.') && !specifier.startsWith('@/') && !specifier.startsWith('node:')) {
      bareImports.add(specifier);
    }
  }
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const declared = new Set([...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})]);
const builtins = new Set([...builtinModules, ...builtinModules.map((item) => `node:${item}`)]);
const missingPackages = [...bareImports].filter((specifier) => {
  if (builtins.has(specifier)) return false;
  const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
  return !declared.has(packageName);
});
if (missingPackages.length) throw new Error(`Undeclared packages: ${missingPackages.join(', ')}`);

async function exportedNames(file) {
  const text = await readFile(file, 'utf8');
  const names = new Set([...text.matchAll(/export\s+(?:async\s+)?(?:const|function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
  for (const match of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const entry of match[1].split(',')) {
      const name = entry.trim().split(/\s+as\s+/)[0];
      if (name) names.add(name);
    }
  }
  return names;
}
async function importedNames(file, sourceSuffix) {
  const text = await readFile(file, 'utf8');
  const pattern = new RegExp(`import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['\"]${sourceSuffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`);
  const match = text.match(pattern);
  if (!match) return [];
  return match[1].split(',').map((name) => name.trim().split(/\s+as\s+/)[0]).filter(Boolean);
}
const publicExports = await exportedNames('src/server/public-backend/controller/index.js');
const adminExports = await exportedNames('src/server/admin-backend/controllers/mainController.js');
for (const name of await importedNames('src/server/public-routes.js', './public-backend/controller/index.js')) {
  if (!publicExports.has(name)) throw new Error(`Public route handler is not exported: ${name}`);
}
for (const name of await importedNames('src/server/admin-routes.js', './admin-backend/controllers/mainController.js')) {
  if (!adminExports.has(name)) throw new Error(`Admin route handler is not exported: ${name}`);
}

const publicRouteCount = (await readFile('src/server/public-routes.js', 'utf8')).match(/route\('/g)?.length || 0;
const adminRouteCount = (await readFile('src/server/admin-routes.js', 'utf8')).match(/(?:protectedRoute|openRoute)\('/g)?.length || 0;
if (publicRouteCount < 36) throw new Error(`Expected at least 36 public API routes, found ${publicRouteCount}`);
if (adminRouteCount < 121) throw new Error(`Expected at least 121 admin API routes, found ${adminRouteCount}`);

const accidentalEnvFiles = [];
async function findEnv(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.next'].includes(entry.name)) continue;
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) await findEnv(file);
    else if (entry.name.startsWith('.env') && entry.name !== '.env.example') accidentalEnvFiles.push(file);
  }
}
await findEnv('.');
if (accidentalEnvFiles.length) throw new Error(`Credential-bearing environment files found: ${accidentalEnvFiles.join(', ')}`);

console.log(`Migration integrity check passed (${sourceFiles.length} source files, ${publicRouteCount} public routes, ${adminRouteCount} admin routes).`);
