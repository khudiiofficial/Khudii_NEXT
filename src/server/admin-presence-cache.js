import fs from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import db from './admin-backend/Database/oldDB.js';
import { adminRequestIp, recordAdminActivity } from './admin-observability.js';

const pool = db.promise();
const lastPresenceUpdate = new Map();

export async function updateUserPresenceHandler(req, res) {
  if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const userId = Number(req.user.id);
  const now = Date.now();
  const prev = lastPresenceUpdate.get(userId) || 0;

  res.set('Cache-Control', 'private, no-store');

  if (now - prev < 110_000) {
    return res.json({ success: true, ok: true, throttled: true });
  }

  try {
    await pool.query('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    lastPresenceUpdate.set(userId, now);
    return res.json({ success: true, ok: true });
  } catch (err) {
    if (err?.code === 'ER_BAD_FIELD_ERROR') {
      // Gracefully succeed until column migration is applied
      return res.json({ success: true, ok: true, pendingMigration: true });
    }
    return res.status(503).json({ success: false, message: 'Presence update failed' });
  }
}

const cleanClickStr = (v, max = 180) =>
  String(v ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .trim()
    .slice(0, max);

export async function recordAdminClickAuditHandler(req, res) {
  if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const events = Array.isArray(req.body?.events) ? req.body.events : null;
  if (!events || events.length < 1 || events.length > 20) {
    return res.status(422).json({ success: false, message: 'Events must be an array of 1 to 20 items' });
  }

  const ip = adminRequestIp(req.headers);
  let recorded = 0;

  for (const ev of events) {
    const reqPath = cleanClickStr(ev?.path || '', 255);
    if (!reqPath.startsWith('/admin-app') || reqPath.includes('//') || reqPath.includes('?') || reqPath.includes('#')) {
      continue;
    }
    const moduleName = cleanClickStr(ev?.module || reqPath.split('/')[3] || 'admin', 70);
    const target = cleanClickStr(ev?.target || 'page-area', 200);
    const componentType = cleanClickStr(ev?.componentType || 'ui-control', 100);
    const elementTag = cleanClickStr(ev?.elementTag || '', 30).toLowerCase();

    await recordAdminActivity({
      module: moduleName,
      action: 'click',
      target,
      message: `Clicked ${componentType} (${target}) on ${reqPath}`,
      userId: req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      role: req.user.role,
      ipAddress: ip,
      requestPath: reqPath,
      componentType,
      elementTag,
      httpStatus: 200,
    });
    recorded++;
  }

  res.set('Cache-Control', 'private, no-store');
  return res.json({ success: true, recorded });
}

async function computeDirSize(dirPath, depth = 0) {
  if (depth > 8) return 0;
  let total = 0;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += await computeDirSize(full, depth + 1);
      } else if (entry.isFile()) {
        try {
          const stat = await fs.stat(full);
          total += stat.size;
        } catch {
          // ignore transient file
        }
      }
    }
  } catch {
    return 0;
  }
  return total;
}

export async function getCacheSizeHandler(req, res) {
  if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  const bytes = await computeDirSize(cacheDir);
  res.set('Cache-Control', 'private, no-store');
  return res.json({
    success: true,
    bytes,
    checkedAt: new Date().toISOString(),
  });
}

export async function flushAllCacheHandler(req, res) {
  if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
    revalidatePath('/admin-app/dashboard');

    await recordAdminActivity({
      module: 'settings',
      action: 'cache-flush',
      target: 'site-cache',
      message: 'Flushed Next.js layout, sitemap, robots, and dashboard cache',
      userId: req.user.id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      role: req.user.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/cache/flush',
    });

    res.set('Cache-Control', 'private, no-store');
    return res.json({
      success: true,
      message: 'Site cache revalidated successfully.',
      revalidatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Cache revalidation failed' });
  }
}
