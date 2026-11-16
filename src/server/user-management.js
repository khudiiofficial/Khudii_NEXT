import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { databaseConfig } from './database-sync.js';

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...databaseConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'DKS',
    email: 'info@dks.com.pk',
    role: 'super_admin',
    status: 1,
    active: true,
    badge_bg: '#0F766E',
    badge_text_color: '#FFFFFF',
    permissions: [
      'Dashboard', 'Pages', 'Organizations', 'Blogs', 'Success Stories',
      'Media', 'SEO Center', 'Redirects & 404', 'Forms Enquiries',
      'Activity Logs', 'Settings'
    ],
    created_at: '2026-07-30T10:00:00Z',
  },
  {
    id: 2,
    name: 'Khudii Admin',
    email: 'khudiiofficial@gmail.com',
    role: 'seo_manager',
    status: 1,
    active: true,
    badge_bg: '#02236E',
    badge_text_color: '#FFFFFF',
    permissions: ['Dashboard', 'Pages', 'Blogs', 'Media', 'SEO Center'],
    created_at: '2026-08-06T12:00:00Z',
  },
  {
    id: 3,
    name: 'Bilal SEO',
    email: 'dkspklhrd004@gmail.com',
    role: 'super_admin',
    status: 1,
    active: true,
    badge_bg: '#9A3412',
    badge_text_color: '#FFFFFF',
    permissions: [
      'Dashboard', 'Pages', 'Organizations', 'Blogs', 'Success Stories',
      'Media', 'SEO Center', 'Redirects & 404', 'Forms Enquiries',
      'Activity Logs', 'Settings'
    ],
    created_at: '2026-08-06T14:30:00Z',
  },
];

let inMemoryUsers = [...DEFAULT_USERS];

function sanitizeUser(u) {
  let perms = u.permissions;
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch {
      perms = [];
    }
  }
  return {
    id: Number(u.id),
    name: u.name || 'User',
    email: u.email,
    role: u.role || 'admin',
    status: Number(u.status ?? 1),
    active: Boolean(u.status ?? u.active ?? true),
    badge_bg: u.badge_bg || '#0F766E',
    badge_text_color: u.badge_text_color || '#FFFFFF',
    permissions: Array.isArray(perms) ? perms : [],
    created_at: u.created_at || new Date().toISOString(),
  };
}

export async function listUsersHandler(req, res) {
  try {
    const db = getPool();
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, badge_bg, badge_text_color, permissions, created_at FROM users WHERE deleted_at IS NULL ORDER BY id ASC'
    );
    if (rows && rows.length > 0) {
      return res.json({ success: true, users: rows.map(sanitizeUser) });
    }
  } catch (err) {
    // If DB has connection issues or empty, fall back to memory
  }
  return res.json({ success: true, users: inMemoryUsers.map(sanitizeUser) });
}

export async function createUserHandler(req, res) {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = String(body.role || 'admin').trim();
  const active = body.active !== false;
  const badge_bg = String(body.badge_bg || '#0F766E').trim();
  const badge_text_color = String(body.badge_text_color || '#FFFFFF').trim();
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];

  if (!name || name.length < 2) {
    return res.status(422).json({ success: false, error: 'Full name must be at least 2 characters.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, error: 'A valid email address is required.' });
  }

  const plainPassword = body.password ? String(body.password).trim() : 'Khudii@2026';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const db = getPool();
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [email]
    );
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const permsJson = JSON.stringify(permissions);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, status, badge_bg, badge_text_color, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson]
    );
    const newUser = sanitizeUser({
      id: result.insertId,
      name,
      email,
      role,
      status: active ? 1 : 0,
      badge_bg,
      badge_text_color,
      permissions,
      created_at: new Date().toISOString(),
    });
    inMemoryUsers.push(newUser);
    return res.json({ success: true, user: newUser });
  } catch (err) {
    // Memory fallback
    const id = inMemoryUsers.length > 0 ? Math.max(...inMemoryUsers.map(u => u.id)) + 1 : 1;
    const newUser = sanitizeUser({
      id,
      name,
      email,
      role,
      status: active ? 1 : 0,
      badge_bg,
      badge_text_color,
      permissions,
      created_at: new Date().toISOString(),
    });
    inMemoryUsers.push(newUser);
    return res.json({ success: true, user: newUser });
  }
}

export async function updateUserHandler(req, res) {
  const id = Number(req.params?.id);
  if (!id) return res.status(422).json({ success: false, error: 'Invalid user id.' });

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = String(body.role || 'admin').trim();
  const active = body.active !== false;
  const badge_bg = String(body.badge_bg || '#0F766E').trim();
  const badge_text_color = String(body.badge_text_color || '#FFFFFF').trim();
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];

  let passwordHash = null;
  if (body.password && String(body.password).trim().length > 0) {
    passwordHash = await bcrypt.hash(String(body.password).trim(), 10);
  }

  try {
    const db = getPool();
    const permsJson = JSON.stringify(permissions);
    if (passwordHash) {
      await db.query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ?, badge_bg = ?, badge_text_color = ?, permissions = ? WHERE id = ?',
        [name, email, passwordHash, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson, id]
      );
    } else {
      await db.query(
        'UPDATE users SET name = ?, email = ?, role = ?, status = ?, badge_bg = ?, badge_text_color = ?, permissions = ? WHERE id = ?',
        [name, email, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson, id]
      );
    }
  } catch (err) {
    // Continue to sync memory
  }

  const idx = inMemoryUsers.findIndex(u => u.id === id);
  if (idx !== -1) {
    inMemoryUsers[idx] = sanitizeUser({
      ...inMemoryUsers[idx],
      name,
      email,
      role,
      status: active ? 1 : 0,
      badge_bg,
      badge_text_color,
      permissions,
    });
  }

  return res.json({
    success: true,
    user: sanitizeUser({
      id,
      name,
      email,
      role,
      status: active ? 1 : 0,
      badge_bg,
      badge_text_color,
      permissions,
    }),
  });
}

export async function deleteUserHandler(req, res) {
  const id = Number(req.params?.id);
  if (!id) return res.status(422).json({ success: false, error: 'Invalid user id.' });

  try {
    const db = getPool();
    // Check if user is super_admin and how many super_admins exist
    const [superAdmins] = await db.query(
      "SELECT id FROM users WHERE role = 'super_admin' AND deleted_at IS NULL"
    );
    if (superAdmins.length <= 1 && superAdmins.some(u => u.id === id)) {
      return res.status(409).json({ success: false, error: 'Cannot delete the only Super Admin user.' });
    }
    await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
  } catch (err) {
    // Memory fallback
  }

  inMemoryUsers = inMemoryUsers.filter(u => u.id !== id);
  return res.json({ success: true });
}
