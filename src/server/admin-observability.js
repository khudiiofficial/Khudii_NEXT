import db from './admin-backend/Database/oldDB.js';

const pool = db.promise();

export function adminRequestIp(headers) {
  if (!headers) return null;
  const get = (k) => (typeof headers.get === 'function' ? headers.get(k) : headers[k] || headers[k.toLowerCase()]);
  const raw = String(get('cf-connecting-ip') || get('x-forwarded-for') || get('x-real-ip') || '')
    .split(',')[0]
    .trim();
  return /^[0-9a-fA-F:.]{2,45}$/.test(raw) ? raw : null;
}

const cleanStr = (val, max = 255) =>
  String(val ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .trim()
    .slice(0, max);

let cachedActivityColumns = null;
async function getActivityColumns() {
  if (cachedActivityColumns) return cachedActivityColumns;
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM admin_activity_logs');
    cachedActivityColumns = new Set(rows.map((r) => String(r.Field).toLowerCase()));
  } catch {
    cachedActivityColumns = new Set(['actor_id', 'action', 'route', 'http_status', 'ip_address']);
  }
  return cachedActivityColumns;
}

export function resetActivityColumnCache() {
  cachedActivityColumns = null;
}

export async function recordAdminActivity({
  module = 'general',
  action = 'update',
  target = '',
  message = '',
  userId = null,
  actorName = null,
  actorEmail = null,
  role = 'admin',
  ipAddress = null,
  requestPath = '',
  pageId = null,
  sectionId = null,
  componentType = null,
  changedFields = null,
  elementTag = null,
  httpStatus = 200,
  entityType = null,
  entityId = null,
  details = null,
} = {}) {
  try {
    let resolvedName = actorName;
    let resolvedEmail = actorEmail;
    let resolvedRole = role;

    if (userId && (!resolvedName || !resolvedEmail)) {
      try {
        const [uRows] = await pool.query('SELECT name, email, role FROM users WHERE id = ? LIMIT 1', [userId]);
        if (uRows[0]) {
          resolvedName = resolvedName || uRows[0].name || uRows[0].email?.split('@')[0] || null;
          resolvedEmail = resolvedEmail || uRows[0].email || null;
          resolvedRole = resolvedRole || uRows[0].role || 'admin';
        }
      } catch {
        // Fallback if columns unavailable
      }
    }

    const cols = await getActivityColumns();
    const record = {};

    const setIf = (col, val) => {
      if (cols.has(col) && val !== undefined) record[col] = val;
    };

    const routeStr = cleanStr(requestPath || `/${module}`, 255);
    const modStr = cleanStr(module, 70);
    const actStr = cleanStr(action, 50);
    const msgStr = cleanStr(message || `${actStr} ${target || modStr}`, 500);

    setIf('actor_id', userId != null ? String(userId).slice(0, 120) : null);
    setIf('user_id', Number.isFinite(Number(userId)) ? Number(userId) : null);
    setIf('action', actStr);
    setIf('route', routeStr);
    setIf('http_status', Number(httpStatus) || 200);
    setIf('ip_address', ipAddress && /^[0-9a-fA-F:.]{2,45}$/.test(ipAddress) ? ipAddress : null);
    setIf('module', modStr);
    setIf('target', cleanStr(target, 255) || null);
    setIf('message', msgStr);
    setIf('actor_name', resolvedName ? cleanStr(resolvedName, 150) : null);
    setIf('actor_email', resolvedEmail ? cleanStr(resolvedEmail, 191) : null);
    setIf('user_name', resolvedName ? cleanStr(resolvedName, 150) : null);
    setIf('user_email', resolvedEmail ? cleanStr(resolvedEmail, 191) : null);
    setIf('role', resolvedRole ? cleanStr(resolvedRole, 50) : null);
    setIf('entity_type', cleanStr(entityType || modStr, 70));
    setIf('entity_id', entityId != null ? cleanStr(entityId, 120) : null);
    setIf('title', cleanStr(target || `${actStr} ${modStr}`, 255));
    setIf('description', msgStr);
    setIf('details', details ? (typeof details === 'string' ? details.slice(0, 4000) : JSON.stringify(details).slice(0, 4000)) : null);
    setIf('request_path', routeStr);
    setIf('page_id', pageId != null ? cleanStr(pageId, 120) : null);
    setIf('section_id', sectionId != null ? cleanStr(sectionId, 120) : null);
    setIf('component_type', componentType ? cleanStr(componentType, 100) : null);
    setIf('changed_fields', changedFields ? cleanStr(changedFields, 1000) : null);
    setIf('element_tag', elementTag ? cleanStr(elementTag, 40) : null);

    const keys = Object.keys(record);
    if (!keys.length) return;
    await pool.query(
      `INSERT INTO admin_activity_logs (${keys.map((k) => `\`${k}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      Object.values(record),
    );
  } catch (err) {
    if (err?.code === 'ER_BAD_FIELD_ERROR') cachedActivityColumns = null;
    console.error('[admin-observability] recordAdminActivity failed:', err?.message);
  }
}

export async function recordBackendError(category = 'system', source = 'admin-panel', publicMessage = 'Internal error', level = 'error') {
  try {
    const cleanCat = cleanStr(category, 70) || 'system';
    const cleanSrc = cleanStr(source, 120) || 'admin-panel';
    const cleanMsg = cleanStr(publicMessage, 500) || 'Error recorded';
    const cleanLevel = ['info', 'warn', 'error'].includes(level) ? level : 'error';
    const status = cleanLevel === 'info' ? 200 : cleanLevel === 'warn' ? 400 : 500;
    try {
      await pool.query(
        'INSERT INTO khudii_backend_logs (level, category, method, path, status, source, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cleanLevel, cleanCat, 'SYS', `/${cleanCat}`, status, cleanSrc, cleanMsg],
      );
    } catch (colErr) {
      if (colErr?.code === 'ER_BAD_FIELD_ERROR') {
        await pool.query(
          'INSERT INTO khudii_backend_logs (level, method, path, status, source, message) VALUES (?, ?, ?, ?, ?, ?)',
          [cleanLevel, 'SYS', `/${cleanCat}`, status, cleanSrc, cleanMsg],
        );
      }
    }
  } catch (err) {
    console.error('[admin-observability] recordBackendError failed:', err?.message);
  }
}
