import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { databaseConfig } from './database-sync.js';
import { adminRequestIp, recordAdminActivity } from './admin-observability.js';

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

const ROLE_MAP = {
  super_admin: 1,
  admin: 2,
  editor: 3,
  seo_manager: 4,
  viewer: 5,
  enquiry_manager: 3,
};

function sanitizeUser(u) {
  let perms = u.permissions;
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch {
      perms = [];
    }
  }
  let displayName = u.name;
  if (!displayName || displayName === 'null' || !String(displayName).trim()) {
    if (u.email?.toLowerCase().includes('khudii')) displayName = 'Khudii Admin';
    else if (u.email?.toLowerCase().includes('dks')) displayName = 'DKS';
    else displayName = u.email ? u.email.split('@')[0] : 'Admin User';
  }
  return {
    id: Number(u.id),
    name: displayName,
    email: u.email,
    role: u.role || 'admin',
    status: Number(u.status ?? 1),
    active: Boolean(u.status ?? u.active ?? true),
    badge_bg: u.badge_bg || '#0F766E',
    badge_text_color: u.badge_text_color || '#FFFFFF',
    permissions: Array.isArray(perms) ? perms : [],
    last_seen_at: u.last_seen_at ? new Date(u.last_seen_at).toISOString() : null,
    created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
  };
}

export async function listUsersHandler(req, res) {
  try {
    const db = getPool();
    try {
      await db.query(`
        INSERT INTO khudii_admin_user_roles (user_id, role_id)
        SELECT u.id, CASE
          WHEN u.role = 'super_admin' THEN 1
          WHEN u.role = 'admin' THEN 2
          WHEN u.role = 'editor' OR u.role = 'enquiry_manager' THEN 3
          WHEN u.role = 'seo_manager' THEN 4
          WHEN u.role = 'viewer' THEN 5
          ELSE 2
        END
        FROM users u
        LEFT JOIN khudii_admin_user_roles ur ON ur.user_id = u.id
        WHERE u.deleted_at IS NULL AND ur.user_id IS NULL
      `);
    } catch { /* optional sync */ }

    let rows;
    try {
      [rows] = await db.query(
        'SELECT id, name, email, role, status, badge_bg, badge_text_color, permissions, last_seen_at, created_at FROM users WHERE deleted_at IS NULL ORDER BY id ASC',
      );
    } catch (colErr) {
      if (colErr?.code === 'ER_BAD_FIELD_ERROR') {
        [rows] = await db.query(
          'SELECT id, name, email, role, status, badge_bg, badge_text_color, permissions, created_at FROM users WHERE deleted_at IS NULL ORDER BY id ASC',
        );
      } else {
        throw colErr;
      }
    }
    return res.json({ success: true, users: (rows || []).map(sanitizeUser) });
  } catch (err) {
    console.error('[users list]', err.message);
    return res.status(503).json({ success: false, error: 'Unable to load admin users from database.' });
  }
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
  const plainPassword = String(body.password || '').trim();

  if (!name || name.length < 2) {
    return res.status(422).json({ success: false, error: 'Full name must be at least 2 characters.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, error: 'A valid email address is required.' });
  }
  if (plainPassword.length < 8) {
    return res.status(422).json({ success: false, error: 'A password of at least 8 characters is required when creating a user.' });
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const db = getPool();
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [email],
    );
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const permsJson = JSON.stringify(permissions);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, status, badge_bg, badge_text_color, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson],
    );
    const roleId = ROLE_MAP[role] || 2;
    try {
      await db.query(
        'INSERT INTO khudii_admin_user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)',
        [result.insertId, roleId],
      );
    } catch { /* ignore */ }

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

    await recordAdminActivity({
      module: 'users',
      action: 'CREATE',
      target: email,
      message: `Created admin user ${name} (${email}) with role ${role}`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/users',
      entityId: String(result.insertId),
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('[users create]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create user in database: ' + err.message });
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

  if (!name || name.length < 2) {
    return res.status(422).json({ success: false, error: 'Full name must be at least 2 characters.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, error: 'A valid email address is required.' });
  }

  let passwordHash = null;
  if (body.password && String(body.password).trim().length > 0) {
    if (String(body.password).trim().length < 8) {
      return res.status(422).json({ success: false, error: 'New password must be at least 8 characters.' });
    }
    passwordHash = await bcrypt.hash(String(body.password).trim(), 10);
  }

  try {
    const db = getPool();
    const permsJson = JSON.stringify(permissions);
    if (passwordHash) {
      await db.query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, status = ?, badge_bg = ?, badge_text_color = ?, permissions = ? WHERE id = ?',
        [name, email, passwordHash, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson, id],
      );
    } else {
      await db.query(
        'UPDATE users SET name = ?, email = ?, role = ?, status = ?, badge_bg = ?, badge_text_color = ?, permissions = ? WHERE id = ?',
        [name, email, role, active ? 1 : 0, badge_bg, badge_text_color, permsJson, id],
      );
    }
    const roleId = ROLE_MAP[role] || 2;
    try {
      await db.query(
        'INSERT INTO khudii_admin_user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)',
        [id, roleId],
      );
    } catch { /* ignore */ }

    await recordAdminActivity({
      module: 'users',
      action: 'UPDATE',
      target: email,
      message: `Updated admin user ${name} (${email})`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: `/admin/users/${id}`,
      entityId: String(id),
    });

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
  } catch (err) {
    console.error('[users update]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update user in database: ' + err.message });
  }
}

export async function deleteUserHandler(req, res) {
  const id = Number(req.params?.id);
  if (!id) return res.status(422).json({ success: false, error: 'Invalid user id.' });

  try {
    const db = getPool();
    const [superAdmins] = await db.query(
      "SELECT id FROM users WHERE role = 'super_admin' AND deleted_at IS NULL",
    );
    if (superAdmins.length <= 1 && superAdmins.some((u) => Number(u.id) === id)) {
      return res.status(409).json({ success: false, error: 'Cannot delete the only Super Admin user.' });
    }
    await db.query('UPDATE users SET deleted_at = NOW(), status = 0 WHERE id = ?', [id]);
    try {
      await db.query('DELETE FROM khudii_admin_user_roles WHERE user_id = ?', [id]);
    } catch { /* ignore */ }

    await recordAdminActivity({
      module: 'users',
      action: 'DELETE',
      target: `user #${id}`,
      message: `Deactivated and removed admin user #${id}`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: `/admin/users/${id}`,
      entityId: String(id),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('[users delete]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete user: ' + err.message });
  }
}
