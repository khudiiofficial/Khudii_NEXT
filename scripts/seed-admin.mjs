import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function loadLocalEnvironment() {
  const file = path.resolve('.env.local');
  try {
    const text = await readFile(file, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

await loadLocalEnvironment();

const host = process.env.DB_HOST || process.env.DATABASE_HOST;
const port = Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306);
const user = process.env.DB_USER || process.env.DATABASE_USER;
const password = process.env.DB_PASS || process.env.DATABASE_PASSWORD;
const database = process.env.DB_NAME || process.env.DATABASE_NAME;
const email = process.env.ADMIN_SEED_EMAIL;
const adminPassword = process.env.ADMIN_SEED_PASSWORD;

if (!host || !user || !database) {
  throw new Error('Database environment variables are incomplete.');
}
if (!email || !adminPassword) {
  throw new Error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required.');
}
if (adminPassword.length < 10) {
  throw new Error('ADMIN_SEED_PASSWORD must contain at least 10 characters.');
}

const ssl = process.env.DB_SSL === 'false'
  ? undefined
  : { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' };
const connection = await mysql.createConnection({ host, port, user, password, database, ssl });

try {
  const hash = await bcrypt.hash(adminPassword, 12);
  const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hash, existing[0].id]);
    console.log(`Updated admin account: ${email}`);
  } else {
    await connection.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
    console.log(`Created admin account: ${email}`);
  }
} finally {
  await connection.end();
}
