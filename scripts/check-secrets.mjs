import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', '.next', 'node_modules']);
const findings = [];
const textExtensions = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.sql', '.css', '.html', '.txt', '.yml', '.yaml', '.toml', '.xml',
]);

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    const relative = path.relative(root, full);
    if (entry.name.startsWith('.env') && entry.name !== '.env.example') {
      findings.push(`${relative}: non-example environment file`);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name)) && entry.name !== '.env.example') continue;

    const text = await readFile(full, 'utf8');
    const checks = [
      [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material'],
      [/(?:mysql|mariadb|postgres(?:ql)?):\/\/[^\s:@/]+:[^\s@/]+@/i, 'credential-bearing database URL'],
      [/(?:DB_PASS|DATABASE_PASSWORD|FTP_PASS|FTP_PASSWORD|JWT_SECRET|SMTP_PASSWORD)\s*[:=]\s*['"](?!process\.env)[^'"\r\n]{6,}['"]/i, 'hard-coded server secret'],
      [/AIza[0-9A-Za-z_-]{30,}/, 'Google API key-shaped value'],
      [/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'JWT-shaped literal'],
    ];
    for (const [pattern, label] of checks) {
      if (pattern.test(text)) findings.push(`${relative}: ${label}`);
    }
  }
}

await walk(root);
if (findings.length) throw new Error(`Potential credential material found:\n${findings.join('\n')}`);
console.log('Credential hygiene check passed (no private keys, credential URLs, JWT literals, or non-example env files).');
