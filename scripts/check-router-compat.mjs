import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const routerCompatPath = path.join(root, 'src', 'lib', 'router-compat.jsx');
const editOrganizationPath = path.join(
  root,
  'src',
  'legacy',
  'admin',
  'Pages',
  'EditOrganizationPage',
  'EditOrganizationPage.jsx',
);

const routerCompat = fs.readFileSync(routerCompatPath, 'utf8');
const editOrganization = fs.readFileSync(editOrganizationPath, 'utf8');
const failures = [];

if (!routerCompat.includes('useCallback')) {
  failures.push('router-compat useNavigate must be memoized with useCallback');
}

if (!/return\s+useCallback\s*\(/.test(routerCompat)) {
  failures.push('useNavigate still returns an unstable function');
}

if (/^\s*console\.log\(form\)\s*;?\s*$/m.test(editOrganization)) {
  failures.push('EditOrganizationPage still logs the full form on every render');
}

if (!/\},\s*\[id,\s*navigate\]\s*\);/.test(editOrganization)) {
  failures.push('EditOrganizationPage data-loading effect contract changed unexpectedly');
}

if (failures.length) {
  console.error('Router compatibility check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Router compatibility check passed.');
