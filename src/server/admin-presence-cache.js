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
      lastPresenceUpdate.set(userId, now);
      // Gracefully succeed until column migration is applied
      return res.json({ success: true, ok: true, pendingMigration: true });
    }
    return res.status(503).json({ success: false, message: 'Presence update failed' });
  }
}

export async function getUsersPresenceHandler(req, res) {
  if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized', users: [] });

  const now = Date.now();
  const currentUserId = Number(req.user.id);
  const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

  // Record presence for current user
  lastPresenceUpdate.set(currentUserId, now);

  try {
    let rows = [];
    try {
      [rows] = await pool.query(
        'SELECT id, name, email, role, status, badge_bg, badge_text_color, last_seen_at FROM users WHERE deleted_at IS NULL ORDER BY id ASC'
      );
    } catch (colErr) {
      if (colErr?.code === 'ER_BAD_FIELD_ERROR') {
        [rows] = await pool.query(
          'SELECT id, name, email, role, status, badge_bg, badge_text_color FROM users WHERE deleted_at IS NULL ORDER BY id ASC'
        );
      } else {
        throw colErr;
      }
    }

    const users = (rows || []).map((u) => {
      const uId = Number(u.id);
      let displayName = u.name;
      if (!displayName || displayName === 'null' || !String(displayName).trim()) {
        if (u.email?.toLowerCase().includes('khudii')) displayName = 'Khudii Admin';
        else if (u.email?.toLowerCase().includes('dks')) displayName = 'DKS';
        else displayName = u.email ? u.email.split('@')[0] : 'Admin User';
      }

      const memLastSeen = lastPresenceUpdate.get(uId);
      const dbLastSeen = u.last_seen_at ? new Date(u.last_seen_at).getTime() : 0;
      const lastSeen = Math.max(memLastSeen || 0, dbLastSeen || 0);

      const isCurrent = uId === currentUserId;
      const isOnline = isCurrent || (lastSeen > 0 && now - lastSeen <= ONLINE_THRESHOLD_MS);

      let lastSeenAgo = 'Offline';
      if (isOnline) {
        lastSeenAgo = 'Active now';
      } else if (lastSeen > 0) {
        const diffMs = now - lastSeen;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 60) {
          lastSeenAgo = `${diffMin}m ago`;
        } else {
          const diffHours = Math.floor(diffMin / 60);
          if (diffHours < 24) {
            lastSeenAgo = `${diffHours}h ago`;
          } else {
            const date = new Date(lastSeen);
            lastSeenAgo = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
      }

      return {
        id: uId,
        name: displayName,
        email: u.email,
        role: u.role || 'super_admin',
        active: Boolean(u.status ?? true),
        badgeBg: u.badge_bg || '#02236E',
        badgeTextColor: u.badge_text_color || '#FFFFFF',
        isOnline,
        lastSeen: lastSeen || undefined,
        lastSeenAgo,
      };
    });

    res.set('Cache-Control', 'private, no-store');
    return res.json({ success: true, users });
  } catch (err) {
    console.error('getUsersPresenceHandler error:', err);
    return res.status(500).json({ success: false, message: 'Presence fetch failed', users: [] });
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

let lastCacheFlushedAt = 0;

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

  const now = Date.now();
  let runtimeBytes = 0;

  try {
    const cacheDir = path.join(process.cwd(), '.next', 'cache');
    const runtimeSubdirs = ['fetch-cache', 'images', 'data'];
    for (const sub of runtimeSubdirs) {
      runtimeBytes += await computeDirSize(path.join(cacheDir, sub));
    }
    const loose = await fs.readdir(cacheDir, { withFileTypes: true }).catch(() => []);
    for (const entry of loose) {
      if (entry.isFile() && !entry.name.startsWith('.tsbuildinfo')) {
        const stat = await fs.stat(path.join(cacheDir, entry.name)).catch(() => null);
        if (stat) runtimeBytes += stat.size;
      }
    }
  } catch {
    runtimeBytes = 0;
  }

  // If purged recently (within 45s), report 0
  if (lastCacheFlushedAt > 0 && now - lastCacheFlushedAt < 45_000) {
    runtimeBytes = 0;
  }

  res.set('Cache-Control', 'private, no-store');
  return res.json({
    success: true,
    bytes: runtimeBytes,
    status: 'active',
    lastFlushedAt: lastCacheFlushedAt || null,
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

    // Purge runtime dynamic cache directories if present
    const runtimeDirs = [
      path.join(process.cwd(), '.next', 'cache', 'fetch-cache'),
      path.join(process.cwd(), '.next', 'cache', 'images'),
    ];
    for (const dir of runtimeDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {}
    }

    lastCacheFlushedAt = Date.now();

    await recordAdminActivity({
      module: 'settings',
      action: 'cache-flush',
      target: 'site-cache',
      message: 'Flushed Next.js layout, sitemap, robots, and dynamic runtime cache',
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
      bytes: 0,
      lastFlushedAt: lastCacheFlushedAt,
      message: 'Site cache purged & revalidated successfully.',
      revalidatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Cache revalidation failed' });
  }
}
