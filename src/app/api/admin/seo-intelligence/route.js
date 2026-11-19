import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import db from '@/server/admin-backend/Database/oldDB';
import { CMS_PAGES } from '@/lib/cms-registry';

const pool = db.promise();
const VALID_FREQS = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

function clean(val, max) {
  return String(val ?? '').trim().slice(0, max);
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
    // fallback
  }
  return Array.from(map.values());
}

export async function GET() {
  try {
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

    return NextResponse.json({
      settings: {
        siteOrigin,
        sitemapEnabled,
        defaultFrequency,
        defaultPriority,
      },
      pages: entries,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unable to load SEO Intelligence' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const settings = body?.settings || {};
    const pages = Array.isArray(body?.pages) ? body.pages : [];

    const siteOrigin = clean(settings.siteOrigin || 'https://www.khudii.com', 500).replace(/\/+$/, '');
    const sitemapEnabled = Boolean(settings.sitemapEnabled);
    const defaultFrequency = VALID_FREQS.has(String(settings.defaultFrequency || '').toLowerCase())
      ? String(settings.defaultFrequency).toLowerCase()
      : 'weekly';
    const defaultPriority = Number(settings.defaultPriority ?? 0.8).toFixed(1);

    // Save into khudii_admin_settings bucket 'seo'
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

    // Save per-page matrix
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

    return NextResponse.json({
      success: true,
      message: 'SEO settings saved. Metadata and sitemap will update on the next request.',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to save SEO settings' }, { status: 500 });
  }
}
