import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';
import db from './admin-backend/Database/oldDB.js';
import { adminRequestIp, recordAdminActivity, recordBackendError } from './admin-observability.js';
import { CMS_PAGES } from '@/lib/cms-registry';

const pool = db.promise();

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);

async function ensureParityTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS khudii_maintenance_page_targets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    page_path VARCHAR(255) NOT NULL,
    page_id INT NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_maint_page_path (page_path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await pool.query(`CREATE TABLE IF NOT EXISTS khudii_seo_page_matrix (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    page_path VARCHAR(255) NOT NULL,
    canonical_url VARCHAR(1000) NOT NULL DEFAULT '',
    sitemap_include TINYINT(1) NOT NULL DEFAULT 1,
    sitemap_priority VARCHAR(10) NOT NULL DEFAULT '0.8',
    sitemap_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_seo_matrix_path (page_path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

async function getAvailablePagesList() {
  const map = new Map();
  for (const p of CMS_PAGES) {
    if (!p?.slug || p.slug === '@global' || p.slug.includes('[')) continue;
    map.set(p.slug, { slug: p.slug, title: p.title || p.slug, status: 'published', pageId: null });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, title, slug, path, status FROM khudii_site_pages WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC LIMIT 250',
    );
    for (const r of rows) {
      const p = r.path || (r.slug === 'home' ? '/' : `/${r.slug}`);
      map.set(p, { slug: p, title: r.title || p, status: r.status || 'published', pageId: r.id });
    }
  } catch {
    // fallback to registry only
  }
  return Array.from(map.values());
}

// ─── 1. Maintenance Mode (GET / PUT /admin/maintenance) ───────────────────
export async function getMaintenanceHandler(req, res) {
  try {
    await ensureParityTables();
    const [settingsRows] = await pool.query(
      "SELECT bucket, content FROM khudii_admin_settings WHERE bucket IN ('maintenance', 'login_auth')",
    );
    let config = {
      enabled: false,
      scope: 'all',
      message: 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.',
      selectedPaths: [],
    };
    const byBucket = {};
    for (const r of settingsRows) {
      try { byBucket[r.bucket] = JSON.parse(r.content || '{}'); } catch { byBucket[r.bucket] = {}; }
    }
    if (byBucket.maintenance) {
      config = {
        enabled: Boolean(byBucket.maintenance.enabled),
        scope: byBucket.maintenance.scope === 'selected' ? 'selected' : 'all',
        message: clean(byBucket.maintenance.message || config.message, 2000),
        selectedPaths: Array.isArray(byBucket.maintenance.selectedPaths) ? byBucket.maintenance.selectedPaths : [],
      };
    } else if (byBucket.login_auth) {
      config.enabled = Boolean(byBucket.login_auth.maintenanceMode);
      config.scope = byBucket.login_auth.maintenanceScope === 'selected' ? 'selected' : 'all';
      config.selectedPaths = Array.isArray(byBucket.login_auth.maintenancePaths) ? byBucket.login_auth.maintenancePaths : [];
    }

    const [targetRows] = await pool.query('SELECT page_path FROM khudii_maintenance_page_targets ORDER BY page_path ASC');
    if (targetRows.length > 0) {
      config.selectedPaths = targetRows.map((r) => r.page_path);
    }

    const pages = await getAvailablePagesList();
    res.set('Cache-Control', 'no-store');
    return res.json({ success: true, maintenance: config, pages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Unable to load maintenance settings' });
  }
}

export async function saveMaintenanceHandler(req, res) {
  const body = req.body || {};
  const enabled = Boolean(body.enabled);
  const scope = body.scope === 'selected' ? 'selected' : 'all';
  const message = clean(
    body.message || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.',
    2000,
  );
  const selectedPaths = Array.isArray(body.selectedPaths)
    ? [...new Set(body.selectedPaths.map((p) => clean(p, 255)).filter((p) => p.startsWith('/')))]
    : [];

  if (enabled && scope === 'selected' && selectedPaths.length === 0) {
    return res.status(422).json({
      success: false,
      message: 'Please select at least one page when Maintenance Scope is set to Selected Pages.',
    });
  }

  const conn = await pool.getConnection();
  try {
    await ensureParityTables();
    await conn.beginTransaction();

    const doc = { enabled, scope, message, selectedPaths };
    await conn.query(
      "INSERT INTO khudii_admin_settings (bucket, content) VALUES ('maintenance', ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
      [JSON.stringify(doc)],
    );

    await conn.query('DELETE FROM khudii_maintenance_page_targets');
    for (const p of selectedPaths) {
      await conn.query(
        'INSERT INTO khudii_maintenance_page_targets (page_path) VALUES (?)',
        [p],
      );
    }

    // Keep legacy login_auth fields synchronized
    const [laRows] = await conn.query("SELECT content FROM khudii_admin_settings WHERE bucket = 'login_auth' LIMIT 1");
    if (laRows[0]?.content) {
      try {
        const la = JSON.parse(laRows[0].content);
        la.maintenanceMode = enabled;
        la.maintenanceScope = scope;
        la.maintenancePaths = selectedPaths;
        await conn.query(
          "UPDATE khudii_admin_settings SET content = ? WHERE bucket = 'login_auth'",
          [JSON.stringify(la)],
        );
      } catch { /* ignore */ }
    }

    await conn.commit();

    try { revalidatePath('/', 'layout'); } catch { /* ignore */ }

    await recordAdminActivity({
      module: 'settings',
      action: 'UPDATE',
      target: 'Maintenance Mode',
      message: `${enabled ? 'Enabled' : 'Disabled'} maintenance mode (scope: ${scope}${scope === 'selected' ? `, ${selectedPaths.length} pages` : ''})`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/maintenance',
      changedFields: 'maintenance.enabled, maintenance.scope, maintenance.message, maintenance.selectedPaths',
    });

    return res.json({ success: true, maintenance: doc, message: 'Maintenance settings updated.' });
  } catch (err) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ success: false, message: err.message || 'Unable to save maintenance settings' });
  } finally {
    conn.release();
  }
}

// ─── 2. Per-Page SEO Intelligence Matrix (GET / PUT /admin/seo-intelligence-matrix) ───
export async function getSeoMatrixHandler(req, res) {
  try {
    await ensureParityTables();
    const pages = await getAvailablePagesList();
    const [rows] = await pool.query('SELECT * FROM khudii_seo_page_matrix');
    const byPath = new Map(rows.map((r) => [r.page_path, r]));

    const matrix = pages.map((pg) => {
      const saved = byPath.get(pg.slug);
      return {
        page_path: pg.slug,
        title: pg.title,
        status: pg.status,
        canonical_url: saved?.canonical_url || '',
        sitemap_include: saved ? Boolean(saved.sitemap_include) : true,
        sitemap_priority: saved?.sitemap_priority || (pg.slug === '/' ? '1.0' : '0.8'),
        sitemap_frequency: saved?.sitemap_frequency || 'weekly',
      };
    });

    res.set('Cache-Control', 'no-store');
    return res.json({ success: true, pages: matrix });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to load SEO page matrix' });
  }
}

const VALID_FREQS = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

export async function saveSeoMatrixHandler(req, res) {
  const entries = Array.isArray(req.body?.pages) ? req.body.pages : [];
  if (!entries.length) {
    return res.status(422).json({ success: false, message: 'No page entries provided' });
  }
  const conn = await pool.getConnection();
  try {
    await ensureParityTables();
    await conn.beginTransaction();

    for (const entry of entries.slice(0, 300)) {
      const pagePath = clean(entry.page_path, 255);
      if (!pagePath.startsWith('/')) continue;
      const canonical = clean(entry.canonical_url, 1000);
      if (canonical && !/^https?:\/\//i.test(canonical)) {
        await conn.rollback();
        return res.status(422).json({ success: false, message: `Invalid canonical URL for ${pagePath} (must start with https://)` });
      }
      const include = entry.sitemap_include === false || entry.sitemap_include === 0 ? 0 : 1;
      const prioNum = Number(entry.sitemap_priority ?? 0.8);
      const priority = Number.isFinite(prioNum) && prioNum >= 0 && prioNum <= 1 ? prioNum.toFixed(1) : '0.8';
      const freq = VALID_FREQS.has(String(entry.sitemap_frequency || '').toLowerCase())
        ? String(entry.sitemap_frequency).toLowerCase()
        : 'weekly';

      await conn.query(
        `INSERT INTO khudii_seo_page_matrix (page_path, canonical_url, sitemap_include, sitemap_priority, sitemap_frequency)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE canonical_url=VALUES(canonical_url), sitemap_include=VALUES(sitemap_include), sitemap_priority=VALUES(sitemap_priority), sitemap_frequency=VALUES(sitemap_frequency)`,
        [pagePath, canonical, include, priority, freq],
      );
    }

    await conn.commit();
    try { revalidatePath('/sitemap.xml'); } catch { /* ignore */ }

    await recordAdminActivity({
      module: 'seo',
      action: 'UPDATE',
      target: 'SEO Sitemap & Canonical Matrix',
      message: `Updated sitemap/canonical configuration for ${entries.length} pages`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/seo-intelligence-matrix',
    });

    return res.json({ success: true, message: `Updated SEO configuration for ${entries.length} pages.` });
  } catch (err) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ success: false, message: err.message || 'Failed to save SEO page matrix' });
  } finally {
    conn.release();
  }
}

export async function getSeoIntelligenceHandler(req, res) {
  try {
    await ensureParityTables();
    const [settingsRows] = await pool.query(
      "SELECT bucket, content FROM khudii_admin_settings WHERE bucket = 'seo' LIMIT 1",
    );
    let seo = {};
    if (settingsRows.length && settingsRows[0].content) {
      try {
        seo = JSON.parse(settingsRows[0].content);
      } catch {}
    }
    const siteOrigin = (seo.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com').replace(/\/+$/, '');
    const sitemapEnabled = seo.allow_indexing !== false && seo.auto_sitemap !== false;
    const defaultFrequency = seo.default_sitemap_frequency || 'weekly';
    const defaultPriority = String(seo.default_sitemap_priority ?? '0.8');

    const pages = await getAvailablePagesList();
    const [matrixRows] = await pool.query('SELECT * FROM khudii_seo_page_matrix').catch(() => [[]]);
    const byPath = new Map((matrixRows || []).map((r) => [r.page_path, r]));

    const [entities] = await pool.query('SELECT page_path, noindex FROM khudii_seo_entities').catch(() => [[]]);
    const noIndexSet = new Set((entities || []).filter((e) => e.noindex).map((e) => e.page_path));

    const entries = pages.map((pg, index) => {
      const saved = byPath.get(pg.slug);
      const slugClean = pg.slug === '/' ? 'home' : pg.slug.replace(/^\//, '');
      return {
        id: String(pg.pageId || index + 1),
        slug: slugClean,
        path: pg.slug,
        title: pg.title || slugClean,
        isPublished: pg.status !== 'draft',
        noIndex: noIndexSet.has(pg.slug),
        canonicalUrl: saved?.canonical_url || '',
        sitemapInclude: saved ? Boolean(saved.sitemap_include) : true,
        sitemapPriority: saved?.sitemap_priority || (pg.slug === '/' ? '1.0' : defaultPriority),
        sitemapFrequency: saved?.sitemap_frequency || defaultFrequency,
      };
    });

    res.set('Cache-Control', 'no-store');
    return res.json({
      settings: {
        siteOrigin,
        sitemapEnabled,
        defaultFrequency,
        defaultPriority,
      },
      pages: entries,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to load SEO Intelligence' });
  }
}

export async function saveSeoIntelligenceHandler(req, res) {
  try {
    await ensureParityTables();
    const body = req.body || {};
    const settings = body.settings || {};
    const pages = Array.isArray(body.pages) ? body.pages : [];

    const siteOrigin = clean(settings.siteOrigin || 'https://www.khudii.com', 500).replace(/\/+$/, '');
    const sitemapEnabled = Boolean(settings.sitemapEnabled);
    const defaultFrequency = VALID_FREQS.has(String(settings.defaultFrequency || '').toLowerCase())
      ? String(settings.defaultFrequency).toLowerCase()
      : 'weekly';
    const defaultPriority = Number(settings.defaultPriority ?? 0.8).toFixed(1);

    const [currRows] = await pool.query(
      "SELECT bucket, content FROM khudii_admin_settings WHERE bucket = 'seo' LIMIT 1",
    );
    let seo = {};
    if (currRows.length && currRows[0].content) {
      try {
        seo = JSON.parse(currRows[0].content);
      } catch {}
    }
    seo.canonical_domain = siteOrigin;
    seo.auto_sitemap = sitemapEnabled;
    seo.default_sitemap_frequency = defaultFrequency;
    seo.default_sitemap_priority = defaultPriority;

    await pool.query(
      `INSERT INTO khudii_admin_settings (bucket, content)
       VALUES ('seo', ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content)`,
      [JSON.stringify(seo)],
    );

    if (pages.length > 0) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        for (const entry of pages.slice(0, 300)) {
          let pagePath = entry.path || entry.page_path;
          if (!pagePath) {
            pagePath = entry.slug === 'home' || entry.slug === '/' ? '/' : `/${entry.slug.replace(/^\//, '')}`;
          }
          const canonical = clean(entry.canonicalUrl || entry.canonical_url || '', 1000);
          const include =
            entry.sitemapInclude === false ||
            entry.sitemap_include === false ||
            entry.sitemapInclude === 0 ||
            entry.sitemap_include === 0
              ? 0
              : 1;
          const prioNum = Number(entry.sitemapPriority ?? entry.sitemap_priority ?? defaultPriority);
          const priority = Number.isFinite(prioNum) && prioNum >= 0 && prioNum <= 1 ? prioNum.toFixed(1) : defaultPriority;
          const freq = VALID_FREQS.has(String(entry.sitemapFrequency || entry.sitemap_frequency || '').toLowerCase())
            ? String(entry.sitemapFrequency || entry.sitemap_frequency).toLowerCase()
            : defaultFrequency;

          await conn.query(
            `INSERT INTO khudii_seo_page_matrix (page_path, canonical_url, sitemap_include, sitemap_priority, sitemap_frequency)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE canonical_url=VALUES(canonical_url), sitemap_include=VALUES(sitemap_include), sitemap_priority=VALUES(sitemap_priority), sitemap_frequency=VALUES(sitemap_frequency)`,
            [pagePath, canonical, include, priority, freq],
          );
        }
        await conn.commit();
      } catch (e) {
        await conn.rollback().catch(() => {});
        throw e;
      } finally {
        conn.release();
      }
    }

    try {
      revalidatePath('/sitemap.xml');
    } catch {}
    try {
      revalidatePath('/robots.txt');
    } catch {}
    try {
      revalidatePath('/llms.txt');
    } catch {}

    await recordAdminActivity({
      module: 'seo',
      action: 'UPDATE',
      target: 'SEO Intelligence',
      message: `Updated global SEO origin (${siteOrigin}) and canonical matrix for ${pages.length} pages`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/seo-intelligence',
    });

    return res.json({
      success: true,
      message: 'SEO settings saved. Metadata and sitemap will update on the next request.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to save SEO settings' });
  }
}

// ─── 3. Send Test Email (POST /admin/smtp/test) ───────────────────────────
export async function sendTestEmailHandler(req, res) {
  const recipient = clean(req.body?.to || req.user?.email || '', 255);
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return res.status(422).json({ success: false, message: 'Enter a valid recipient email address.' });
  }

  try {
    const [owners] = await pool.query('SELECT smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, smtp_from FROM owners ORDER BY id ASC LIMIT 1');
    const owner = owners[0] || {};
    const host = owner.smtp_host || process.env.SMTP_HOST;
    const port = Number(owner.smtp_port || process.env.SMTP_PORT || 465);
    const secure = owner.smtp_secure !== undefined ? Boolean(Number(owner.smtp_secure)) : (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1' || port === 465);
    const user = owner.smtp_username || process.env.SMTP_USER;
    const pass = owner.smtp_password || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const from = owner.smtp_from || process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      return res.status(422).json({
        success: false,
        message: 'SMTP credentials are incomplete. Save SMTP Host, Username, and Password first.',
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10_000,
    });

    const subject = 'Khudii Admin — SMTP Test Email';
    await transporter.sendMail({
      from: `Khudii Platform <${from}>`,
      to: recipient,
      subject,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">
        <h2 style="color:#02236E;margin-top:0">SMTP Connection Verified</h2>
        <p style="color:#334155">This diagnostic test email confirms that your Khudii SMTP mail server (<strong>${host}:${port}</strong>) is configured and delivering messages properly.</p>
        <p style="color:#64748b;font-size:12px">Sent at ${new Date().toISOString()} by ${req.user?.email || 'Admin'}</p>
      </div>`,
    });

    // Log delivery
    try {
      await pool.query(
        'INSERT INTO khudii_email_delivery_logs (form_key, recipient, subject, status, error_message) VALUES (?, ?, ?, ?, ?)',
        ['smtp_test', recipient, subject, 'sent', ''],
      );
    } catch { /* optional table */ }

    await recordAdminActivity({
      module: 'settings',
      action: 'TEST',
      target: 'SMTP Test Email',
      message: `Sent SMTP test email to ${recipient}`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/smtp/test',
    });

    return res.json({ success: true, message: `Test email sent successfully to ${recipient}.` });
  } catch (err) {
    try {
      await pool.query(
        'INSERT INTO khudii_email_delivery_logs (form_key, recipient, subject, status, error_message) VALUES (?, ?, ?, ?, ?)',
        ['smtp_test', recipient, 'Khudii Admin — SMTP Test Email', 'failed', String(err.message || '').slice(0, 450)],
      );
    } catch { /* ignore */ }
    await recordBackendError('email', 'smtp-test', `SMTP test failed: ${err.message}`);
    return res.status(502).json({ success: false, message: `SMTP test failed: ${err.message}` });
  }
}

// ─── 4. Index CMS Media References (POST /admin/media/sync) ───────────────
export async function syncCmsMediaHandler(req, res) {
  try {
    const urls = new Set();
    const collect = (raw) => {
      if (!raw || typeof raw !== 'string') return;
      const text = raw.replace(/\\\//g, '/');
      const matches = text.match(/https?:\/\/[^\s"'<>\\]+\.(?:webp|png|jpe?g|gif|svg|avif|ico)|\/[^\s"'<>\\]+\.(?:webp|png|jpe?g|gif|svg|avif|ico)/gi) || [];
      for (const m of matches) {
        const u = m.replace(/[),;]+$/, '');
        if (u.length <= 512) urls.add(u);
      }
    };

    const queries = [
      'SELECT content FROM khudii_cms_pages',
      'SELECT payload FROM khudii_page_sections WHERE deleted_at IS NULL',
      'SELECT content FROM khudii_admin_settings',
      'SELECT image, intro FROM document WHERE deletestatus = 0',
      'SELECT partner_image, introductory_image_path FROM items WHERE deletestatus = 0',
      'SELECT image_path FROM item_images',
      'SELECT image FROM successstories WHERE deletestatus = 0',
      'SELECT thumbnail_url FROM podcast',
      'SELECT image FROM certifications',
      'SELECT image FROM testimonials',
      'SELECT image_url FROM crousel_images',
      'SELECT image_url, mobile_image_url FROM home_sliders',
    ];

    for (const q of queries) {
      try {
        const [rows] = await pool.query(q);
        for (const r of rows) {
          for (const val of Object.values(r)) collect(typeof val === 'string' ? val : JSON.stringify(val));
        }
      } catch {
        // skip unavailable optional table
      }
    }

    const [existingRows] = await pool.query('SELECT url FROM khudii_media_metadata');
    const known = new Set(existingRows.map((r) => r.url));
    let added = 0;

    for (const u of urls) {
      if (known.has(u)) continue;
      const name = decodeURIComponent(u.split('/').pop() || 'image').slice(0, 200);
      try {
        await pool.query(
          'INSERT IGNORE INTO khudii_media_metadata (url, title, alt_text, caption, trashed) VALUES (?, ?, ?, ?, 0)',
          [u, name, name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), ''],
        );
        added++;
      } catch { /* ignore */ }
    }

    await recordAdminActivity({
      module: 'media',
      action: 'sync',
      target: 'CMS media index',
      message: `Indexed ${added} new referenced media files (${urls.size} total references scanned)`,
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/media/sync',
    });

    return res.json({ success: true, added, found: urls.size });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Unable to index CMS media references' });
  }
}

// ─── 5. Forgot Password & Reset Password (Open Auth Routes) ───────────────
export async function forgotPasswordHandler(req, res) {
  const email = clean(req.body?.email, 191).toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const genericOk = {
    success: true,
    message: 'If an administrator account exists for that email, a password reset link has been sent.',
  };

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, status FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [email],
    );
    const user = users[0];
    if (!user || !user.status) {
      return res.json(genericOk);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expires, user.id],
      );
    } catch (colErr) {
      if (colErr?.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(503).json({ success: false, message: 'Password reset columns not yet migrated.' });
      }
      throw colErr;
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://khudii.com').replace(/\/$/, '');
    const resetLink = `${siteUrl}/letskhudii/reset-password?token=${encodeURIComponent(token)}`;

    try {
      const [owners] = await pool.query('SELECT smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, smtp_from FROM owners ORDER BY id ASC LIMIT 1');
      const owner = owners[0] || {};
      const host = owner.smtp_host || process.env.SMTP_HOST;
      const port = Number(owner.smtp_port || process.env.SMTP_PORT || 465);
      const secure = owner.smtp_secure !== undefined ? Boolean(Number(owner.smtp_secure)) : port === 465;
      const smtpUser = owner.smtp_username || process.env.SMTP_USER;
      const smtpPass = owner.smtp_password || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
      const from = owner.smtp_from || process.env.SMTP_FROM || smtpUser;

      if (host && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({ host, port, secure, auth: { user: smtpUser, pass: smtpPass } });
        await transporter.sendMail({
          from: `Khudii Security <${from}>`,
          to: user.email,
          subject: 'Khudii Admin — Password Reset Request',
          html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">
            <h2 style="color:#02236E;margin-top:0">Reset Your Password</h2>
            <p>Hello ${user.name || 'Administrator'},</p>
            <p>We received a request to reset your Khudii Admin password. Click the button below to choose a new password (link expires in 1 hour):</p>
            <p style="margin:24px 0"><a href="${resetLink}" style="background:#02236E;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Reset Password</a></p>
            <p style="font-size:12px;color:#64748b">If you did not request this, you can safely ignore this email.</p>
          </div>`,
        });
      }
    } catch (mailErr) {
      await recordBackendError('email', 'forgot-password', `Reset email failed: ${mailErr.message}`);
    }

    return res.json(genericOk);
  } catch (err) {
    await recordBackendError('security', 'forgot-password', err.message);
    return res.status(500).json({ success: false, message: 'Unable to process password reset request.' });
  }
}

export async function resetPasswordHandler(req, res) {
  const token = clean(req.body?.token, 128);
  const newPassword = String(req.body?.password || '').trim();

  if (!token || token.length < 32) {
    return res.status(422).json({ success: false, message: 'Invalid or missing password reset token.' });
  }
  if (newPassword.length < 8) {
    return res.status(422).json({ success: false, message: 'New password must be at least 8 characters long.' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, reset_token_expires FROM users WHERE reset_token = ? AND deleted_at IS NULL LIMIT 1',
      [token],
    );
    const user = users[0];
    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or has expired.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hash, user.id],
    );

    await recordAdminActivity({
      module: 'auth',
      action: 'UPDATE',
      target: 'Password Reset',
      message: `Password reset completed for ${user.email}`,
      userId: user.id,
      actorName: user.name,
      actorEmail: user.email,
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/auth/reset-password',
    });

    return res.json({ success: true, message: 'Your password has been updated. You can now sign in.' });
  } catch (err) {
    await recordBackendError('security', 'reset-password', err.message);
    return res.status(500).json({ success: false, message: 'Unable to reset password.' });
  }
}
