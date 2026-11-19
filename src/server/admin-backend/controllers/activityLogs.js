import db from '../Database/oldDB.js';
import { analyticsSummary } from './analytics.js';
import { completedRange, validReportDays } from '@/lib/reporting-periods';
import { createActivityPdf } from './activityPdf.js';
import { recordAdminActivity } from '../../admin-observability.js';

const sql = db.promise();

let cachedLogCols = null;
async function getLogColumns() {
  if (cachedLogCols) return cachedLogCols;
  try {
    const [cols] = await sql.query('SHOW COLUMNS FROM admin_activity_logs');
    cachedLogCols = new Set(cols.map((c) => String(c.Field).toLowerCase()));
  } catch {
    cachedLogCols = new Set(['id', 'actor_id', 'action', 'route', 'http_status', 'ip_address', 'created_at', 'deleted_at']);
  }
  return cachedLogCols;
}

function formatRelativeTime(dateInput) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeAction(action, route) {
  const act = String(action || '').toUpperCase();
  const r = String(route || '').toLowerCase();
  if (act === 'CLICK') return 'CLICK';
  if (act === 'TEST') return 'TEST';
  if (act === 'CACHE-FLUSH') return 'CACHE-FLUSH';
  if (r.includes('login')) return 'LOGIN';
  if (r.includes('logout')) return 'LOGOUT';
  if (act === 'POST' || act === 'CREATE') return 'CREATE';
  if (act === 'PUT' || act === 'PATCH' || act === 'UPDATE') return 'UPDATE';
  if (act === 'DELETE' || act === 'REMOVE') return 'DELETE';
  return act || 'UPDATE';
}

function deriveModule(entityType, route) {
  if (entityType && entityType !== 'general') return String(entityType).toLowerCase();
  const r = String(route || '').toLowerCase();
  if (r.includes('item') || r.includes('organization') || r.includes('ngo')) return 'organizations';
  if (r.includes('podcast')) return 'podcasts';
  if (r.includes('page') || r.includes('cms')) return 'pages';
  if (r.includes('document') || r.includes('blog')) return 'blogs';
  if (r.includes('user')) return 'users';
  if (r.includes('message') || r.includes('enquir') || r.includes('contact') || r.includes('form')) return 'enquiries';
  if (r.includes('seo')) return 'seo';
  if (r.includes('setting') || r.includes('smtp') || r.includes('ai_chat') || r.includes('cache') || r.includes('maintenance')) return 'settings';
  if (r.includes('media') || r.includes('upload') || r.includes('image')) return 'media';
  if (r.includes('auth') || r.includes('login') || r.includes('logout')) return 'auth';
  if (r.includes('nav') || r.includes('menu')) return 'menus';
  return 'settings';
}

export async function getActivityLogs(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize) || 25));
  const offset = (page - 1) * pageSize;

  const search = String(req.query.search || req.query.q || '').trim();
  const actionFilter = String(req.query.action || 'all').toUpperCase();
  const entityTypeFilter = String(req.query.entityType || req.query.module || 'all').toLowerCase();
  const userEmailFilter = String(req.query.userEmail || 'all').trim();
  const dateRange = String(req.query.dateRange || 'all').toLowerCase();
  const reqDays = req.query.days ? validReportDays(req.query.days) : 30;

  try {
    const cols = await getLogColumns();
    const has = (c) => cols.has(c);

    const whereConditions = has('deleted_at') ? ['l.deleted_at IS NULL'] : ['1=1'];
    const queryParams = [];

    if (search) {
      const searchFields = ['l.route', 'l.ip_address', 'u.email', 'u.name'];
      for (const f of ['title', 'description', 'message', 'target', 'user_name', 'user_email', 'actor_name', 'actor_email', 'entity_id', 'module', 'component_type', 'changed_fields', 'request_path']) {
        if (has(f)) searchFields.push(`l.${f}`);
      }
      whereConditions.push(`(${searchFields.map((f) => `${f} LIKE ?`).join(' OR ')})`);
      const qTerm = `%${search}%`;
      for (let i = 0; i < searchFields.length; i++) queryParams.push(qTerm);
    }

    if (actionFilter !== 'ALL') {
      if (actionFilter === 'CREATE') {
        whereConditions.push("(l.action = 'CREATE' OR l.action = 'POST')");
      } else if (actionFilter === 'UPDATE') {
        whereConditions.push("(l.action = 'UPDATE' OR l.action = 'PUT' OR l.action = 'PATCH' OR l.action = 'STATUS_CHANGE')");
      } else if (actionFilter === 'DELETE') {
        whereConditions.push("(l.action = 'DELETE' OR l.action = 'REMOVE')");
      } else if (actionFilter === 'LOGIN') {
        whereConditions.push("(l.action = 'LOGIN' OR l.route LIKE '%login%')");
      } else if (actionFilter === 'LOGOUT') {
        whereConditions.push("(l.action = 'LOGOUT' OR l.route LIKE '%logout%')");
      } else {
        whereConditions.push('UPPER(l.action) = ?');
        queryParams.push(actionFilter);
      }
    }

    if (entityTypeFilter !== 'all') {
      if (has('module') && has('entity_type')) {
        whereConditions.push('(LOWER(l.module) = ? OR LOWER(l.entity_type) = ?)');
        queryParams.push(entityTypeFilter, entityTypeFilter);
      } else if (has('entity_type')) {
        whereConditions.push('LOWER(l.entity_type) = ?');
        queryParams.push(entityTypeFilter);
      } else if (has('module')) {
        whereConditions.push('LOWER(l.module) = ?');
        queryParams.push(entityTypeFilter);
      }
    }

    if (userEmailFilter !== 'all') {
      const emailExprs = ['u.email = ?'];
      queryParams.push(userEmailFilter);
      if (has('user_email')) { emailExprs.push('l.user_email = ?'); queryParams.push(userEmailFilter); }
      if (has('actor_email')) { emailExprs.push('l.actor_email = ?'); queryParams.push(userEmailFilter); }
      whereConditions.push(`(${emailExprs.join(' OR ')})`);
    }

    if (dateRange === 'today') {
      whereConditions.push("DATE(CONVERT_TZ(l.created_at, '+00:00', '+05:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:00'))");
    } else if (dateRange === '7d') {
      whereConditions.push('l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    } else if (dateRange === '14d') {
      whereConditions.push('l.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)');
    } else if (dateRange === '30d') {
      whereConditions.push('l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    const joinClause = 'LEFT JOIN users u ON CAST(u.id AS CHAR) = CAST(l.actor_id AS CHAR)';

    const [[{ totalCount }]] = await sql.query(
      `SELECT COUNT(*) as totalCount FROM admin_activity_logs l ${joinClause} ${whereClause}`,
      queryParams,
    );

    const [rows] = await sql.query(
      `SELECT l.*, u.name AS live_user_name, u.email AS live_user_email, u.role AS live_user_role
       FROM admin_activity_logs l ${joinClause} ${whereClause}
       ORDER BY l.created_at DESC, l.id DESC LIMIT ? OFFSET ?`,
      [...queryParams, pageSize, offset],
    );

    const formattedLogs = rows.map((r) => {
      const derivedMod = deriveModule(r.module || r.entity_type, r.request_path || r.route);
      const upperAct = normalizeAction(r.action, r.request_path || r.route);
      const resolvedEmail = r.live_user_email || r.actor_email || r.user_email || null;
      const resolvedName = r.live_user_name || r.actor_name || r.user_name || (resolvedEmail ? resolvedEmail.split('@')[0] : 'Deleted account');
      const resolvedRole = r.live_user_role || r.role || 'admin';

      return {
        id: r.id,
        userId: r.actor_id || null,
        type: derivedMod,
        action: upperAct,
        entityType: derivedMod,
        entityId: r.entity_id || null,
        target: r.target || r.title || `${upperAct} on ${derivedMod}`,
        title: r.title || r.target || `${upperAct} on ${derivedMod}`,
        description: r.message || r.description || `Executed ${r.action} on ${r.request_path || r.route} (${r.http_status || 200})`,
        user: resolvedName,
        userEmail: resolvedEmail || 'Not recorded',
        role: resolvedRole,
        ipAddress: r.ip_address || 'Not recorded',
        requestPath: r.request_path || r.route || '',
        pageId: r.page_id || null,
        sectionId: r.section_id || null,
        componentType: r.component_type || null,
        changedFields: r.changed_fields || null,
        elementTag: r.element_tag || null,
        httpStatus: r.http_status || null,
        details: r.details || null,
        timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        timeAgo: formatRelativeTime(r.created_at),
      };
    });

    const delCond = has('deleted_at') ? 'WHERE deleted_at IS NULL' : '';
    const [[kpiCounts]] = await sql.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN DATE(CONVERT_TZ(created_at, '+00:00', '+05:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:00')) THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN UPPER(action) IN ('CREATE', 'POST') THEN 1 ELSE 0 END) as creates,
        SUM(CASE WHEN UPPER(action) IN ('UPDATE', 'PUT', 'PATCH', 'STATUS_CHANGE') THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN UPPER(action) IN ('DELETE', 'REMOVE') THEN 1 ELSE 0 END) as deletes
      FROM admin_activity_logs
      ${delCond}
    `);

    const emailCol = has('actor_email') ? 'COALESCE(u.email, l.actor_email, l.user_email)' : has('user_email') ? 'COALESCE(u.email, l.user_email)' : 'u.email';
    const nameCol = has('actor_name') ? 'COALESCE(u.name, l.actor_name, l.user_name)' : has('user_name') ? 'COALESCE(u.name, l.user_name)' : 'u.name';
    const [userRows] = await sql.query(`
      SELECT DISTINCT
        ${emailCol} as email,
        COALESCE(${nameCol}, 'Deleted account') as name,
        COALESCE(u.role, 'admin') as role
      FROM admin_activity_logs l
      ${joinClause}
      WHERE ${has('deleted_at') ? 'l.deleted_at IS NULL AND ' : ''}${emailCol} IS NOT NULL
      LIMIT 50
    `);

    const timelineDays = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 14;
    const modCol = has('module') && has('entity_type') ? 'COALESCE(module, entity_type)' : has('entity_type') ? 'entity_type' : has('module') ? 'module' : 'route';
    const [timelineRows] = await sql.query(
      `
      SELECT
        DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+05:00'), '%Y-%m-%d') as day,
        DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+05:00'), '%b %e') as label,
        ${modCol} as mod_key,
        COUNT(*) as count
      FROM admin_activity_logs
      WHERE ${has('deleted_at') ? 'deleted_at IS NULL AND ' : ''}created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY day, label, mod_key
      ORDER BY day ASC
      `,
      [timelineDays],
    );

    const dayMap = new Map();
    for (let i = timelineDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDay = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(isoDay, {
        date: isoDay,
        label,
        total: 0,
        organizations: 0,
        podcasts: 0,
        pages: 0,
        blogs: 0,
        users: 0,
        enquiries: 0,
        settings: 0,
        media: 0,
        auth: 0,
        menus: 0,
        seo: 0,
      });
    }

    for (const r of timelineRows) {
      if (dayMap.has(r.day)) {
        const item = dayMap.get(r.day);
        const mod = deriveModule(r.mod_key, r.mod_key);
        const cnt = Number(r.count || 0);
        item[mod] = (item[mod] || 0) + cnt;
        item.total += cnt;
      }
    }

    const splineTimeline = Array.from(dayMap.values());
    const moduleCounts = {
      organizations: 0,
      podcasts: 0,
      pages: 0,
      blogs: 0,
      users: 0,
      enquiries: 0,
      settings: 0,
      media: 0,
      auth: 0,
      menus: 0,
      seo: 0,
    };
    let totalVolume = 0;
    for (const point of splineTimeline) {
      totalVolume += point.total;
      for (const k of Object.keys(moduleCounts)) {
        moduleCounts[k] += point[k] || 0;
      }
    }

    let topModule = { key: 'settings', label: 'Settings', count: 0 };
    for (const [k, count] of Object.entries(moduleCounts)) {
      if (count > topModule.count) {
        topModule = { key: k, label: k.charAt(0).toUpperCase() + k.slice(1), count };
      }
    }

    const visualStats = {
      timeline: splineTimeline,
      totalVolume,
      activeModules: Object.values(moduleCounts).filter((c) => c > 0).length,
      topModule,
      moduleCounts,
    };

    const { from, to } = completedRange(reqDays);
    let legacyAnalytics = null;
    try {
      legacyAnalytics = await analyticsSummary(reqDays);
    } catch {
      // Ignore
    }

    res.set('Cache-Control', 'private, no-store');
    return res.json({
      success: true,
      logs: formattedLogs,
      events: rows,
      pagination: {
        page,
        pageSize,
        totalCount: Number(totalCount),
        totalPages: Math.max(1, Math.ceil(Number(totalCount) / pageSize)),
      },
      stats: {
        total: Number(kpiCounts?.total || 0),
        today: Number(kpiCounts?.today || 0),
        creates: Number(kpiCounts?.creates || 0),
        updates: Number(kpiCounts?.updates || 0),
        deletes: Number(kpiCounts?.deletes || 0),
        users: userRows,
      },
      visualStats,
      timeline: splineTimeline,
      total: Number(totalCount),
      from,
      to,
      days: reqDays,
      analytics: legacyAnalytics,
      warning: '',
    });
  } catch (err) {
    if (err?.code === 'ER_BAD_FIELD_ERROR') cachedLogCols = null;
    console.error('[activityLogs error]:', err);
    res.set('Cache-Control', 'no-store');
    return res.status(503).json({
      success: false,
      message: err.message || 'Failed to fetch activity logs',
      logs: [],
      pagination: { page: 1, pageSize: 25, totalCount: 0, totalPages: 1 },
      stats: { total: 0, today: 0, creates: 0, updates: 0, deletes: 0, users: [] },
    });
  }
}

export async function clearActivityLogs(req, res) {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (!['super_admin', 'admin'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only administrators may archive activity logs.' });
    }
    const mode = req.body?.mode || 'older_than_30_days';
    let query = '';

    if (mode === 'older_than_30_days') {
      query = 'UPDATE admin_activity_logs SET deleted_at = NOW() WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL';
    } else {
      query = 'UPDATE admin_activity_logs SET deleted_at = NOW() WHERE deleted_at IS NULL';
    }

    const [result] = await sql.query(query);

    await recordAdminActivity({
      module: 'settings',
      action: 'DELETE',
      target: 'Activity Logs Archive',
      message: `Archived ${result.affectedRows} activity log records (Mode: ${mode})`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role || 'admin',
      ipAddress: req.ip || null,
      requestPath: '/admin/activity-logs/clear',
    });

    res.set('Cache-Control', 'no-store');
    return res.json({
      success: true,
      count: result.affectedRows,
      message: `Archived ${result.affectedRows} activity log records (${mode.replace(/_/g, ' ')}).`,
    });
  } catch (err) {
    console.error('[clearActivityLogs error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to archive activity logs: ' + err.message });
  }
}

function csvSafe(value) {
  let v = String(value ?? '').replace(/[\r\n]/g, ' ');
  if (/^[=+@\-\t\r]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

function formatCsv(rows) {
  const keys = ['timestamp', 'user', 'userEmail', 'role', 'ipAddress', 'action', 'entityType', 'title', 'description', 'changedFields', 'route'];
  const headers = ['Timestamp', 'Operator', 'Email', 'Role', 'IP Address', 'Action', 'Module', 'Title', 'Description', 'Changed Fields', 'Route'];
  const lines = [headers.map(csvSafe).join(',')];
  for (const row of rows) {
    lines.push(keys.map((k) => csvSafe(row[k])).join(','));
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export async function downloadActivityLogs(req, res) {
  const from = String(req.query.from || '');
  const to = String(req.query.to || '');
  const format = String(req.query.format || 'csv').toLowerCase();
  const moduleFilter = String(req.query.module || 'all').toLowerCase();

  try {
    const cols = await getLogColumns();
    const has = (c) => cols.has(c);

    let whereClause = has('deleted_at') ? 'l.deleted_at IS NULL' : '1=1';
    const params = [];

    if (from && to) {
      whereClause += " AND DATE(CONVERT_TZ(l.created_at, '+00:00', '+05:00')) BETWEEN ? AND ?";
      params.push(from, to);
    }
    if (moduleFilter !== 'all') {
      if (has('module') && has('entity_type')) {
        whereClause += ' AND (LOWER(l.module) = ? OR LOWER(l.entity_type) = ?)';
        params.push(moduleFilter, moduleFilter);
      } else if (has('entity_type')) {
        whereClause += ' AND LOWER(l.entity_type) = ?';
        params.push(moduleFilter);
      }
    }

    const [rows] = await sql.query(
      `SELECT l.*, u.name AS live_user_name, u.email AS live_user_email, u.role AS live_user_role
       FROM admin_activity_logs l
       LEFT JOIN users u ON CAST(u.id AS CHAR) = CAST(l.actor_id AS CHAR)
       WHERE ${whereClause} ORDER BY l.created_at DESC LIMIT 20000`,
      params,
    );

    const formatted = rows.map((r) => ({
      timestamp: r.created_at ? new Date(r.created_at).toISOString() : '',
      user: r.live_user_name || r.actor_name || r.user_name || 'Deleted account',
      userEmail: r.live_user_email || r.actor_email || r.user_email || 'Not recorded',
      role: r.live_user_role || r.role || 'admin',
      ipAddress: r.ip_address || 'Not recorded',
      action: normalizeAction(r.action, r.request_path || r.route),
      entityType: deriveModule(r.module || r.entity_type, r.request_path || r.route),
      title: r.title || r.target || '',
      description: r.message || r.description || '',
      changedFields: r.changed_fields || '',
      route: r.request_path || r.route || '',
    }));

    const file = `khudii-activity-export-${from || 'all'}-to-${to || 'latest'}.${format}`;
    res.set('Content-Disposition', `attachment; filename="${file}"`);
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');

    if (format === 'csv') {
      res.set('Content-Type', 'text/csv; charset=utf-8');
      return res.send(formatCsv(formatted));
    }

    res.set('Content-Type', 'application/pdf');
    return res.send(createActivityPdf(rows, { from: from || '2026-01-01', to: to || 'today' }));
  } catch (e) {
    console.error('[activity download]', e);
    return res.status(500).json({ message: 'Unable to generate activity export: ' + e.message });
  }
}

export async function writeActivityLog({
  actor,
  userName = null,
  userEmail = null,
  role = 'admin',
  action = 'UPDATE',
  entityType = 'general',
  entityId = null,
  title = null,
  description = null,
  details = null,
  method = 'POST',
  path = '/',
  status = 200,
  ip = null,
  changedFields = null,
}) {
  const act = (action || method || 'UPDATE').toUpperCase();
  const ent = deriveModule(entityType, path);
  await recordAdminActivity({
    module: ent,
    action: act,
    target: title || `${act} on ${ent}`,
    message: description || `Executed ${act} on ${path}`,
    userId: actor,
    actorName: userName,
    actorEmail: userEmail,
    role,
    ipAddress: ip,
    requestPath: path,
    httpStatus: status,
    entityType: ent,
    entityId,
    details,
    changedFields,
  });
}
