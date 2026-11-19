import db from './admin-backend/Database/oldDB.js';

export async function getPublicSeoDefaults() {
  try {
    const [rows] = await db.promise().query(
      "SELECT bucket, content FROM khudii_admin_settings WHERE bucket IN ('seo', 'site_identity', 'appearance')",
    );
    const cfg = {};
    for (const r of rows) {
      try {
        cfg[r.bucket] = JSON.parse(r.content || '{}');
      } catch {
        cfg[r.bucket] = {};
      }
    }
    const seo = cfg.seo && typeof cfg.seo === 'object' && !Array.isArray(cfg.seo) ? cfg.seo : {};
    const favicon =
      cfg.site_identity?.siteFavicon ||
      cfg.site_identity?.favicon ||
      cfg.appearance?.favicon_url ||
      '';
    return {
      ...seo,
      favicon: typeof favicon === 'string' && /^(https?:\/\/|\/)/.test(favicon) ? favicon : '',
    };
  } catch (e) {
    console.error('[public SEO defaults]', e.code || e.message);
  }
  return {};
}
