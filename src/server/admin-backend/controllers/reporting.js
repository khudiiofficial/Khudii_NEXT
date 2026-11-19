import db from '../Database/oldDB.js';
import { analyticsSummary } from './analytics.js';
import { completedRange, validReportDays } from '@/lib/reporting-periods';

const sources = {
  organizations: { table: 'items', route: 'OrganizationPage', label: 'Organizations', archived: true },
  blogs: { table: 'document', route: 'BlogPage', label: 'Blogs', archived: true },
  contacts: { table: 'contact_messages', route: 'Contacts', label: 'Contact messages' },
  inquiries: { table: 'contact_inquiries', route: 'Inquiries', label: 'Organization inquiries' },
  donations: { table: 'donations', route: 'Donation', label: 'Donations' },
  volunteers: { table: 'volunteers', route: 'Voulenteer', label: 'Volunteers' },
  jobs: { table: 'job_applications', route: 'JobApplication', label: 'Job applications' },
  stories: { table: 'contribute_stories', route: 'Stories', label: 'Contributed stories' },
  registrations: { table: 'organization_submissions', route: 'OrgRegistration', label: 'Registrations' },
  podcasts: { table: 'podcasts', route: 'Podcast', label: 'Podcast episodes' },
  videos: { table: 'videos', route: 'Vedios', label: 'Videos', archived: true },
  successStories: { table: 'successstories', route: 'SuccessStories', label: 'Success stories', archived: true },
  testimonials: { table: 'testimonials', route: 'Testimonials', label: 'Testimonials' },
  certifications: { table: 'certifications', route: 'Certifications', label: 'Certifications' },
  events: { table: 'events', route: 'NewsEvents', label: 'News & events' },
  faqs: { table: 'faqs', route: 'faqs', label: 'FAQs' },
};
export const DASHBOARD_CARDS = Object.entries(sources).map(([key, v]) => ({ key, label: v.label, route: v.route }));
const database = db.promise();
const pakistanDay = field => `DATE(CONVERT_TZ(${field},'+00:00','+05:00'))`;
export async function getAdminOverview(req, res) {
  const days = validReportDays(req.query.days);
  const { from, to } = completedRange(days);
  try {
    const [tables] = await database.query('SHOW TABLES');
    const available = new Set(tables.map(v => Object.values(v)[0]));
    const entries = await Promise.all(Object.entries(sources).map(async ([key, src]) => {
      if (!available.has(src.table)) return [key, null];
      const where = src.archived ? ' WHERE deletestatus=0' : '';
      try {
        const [rows] = await database.query(`SELECT COUNT(*) AS total FROM \`${src.table}\`${where}`);
        return [key, Number(rows[0].total)];
      } catch (e) { console.warn('[overview count]', src.table, e.code); return [key, null]; }
    }));
    const [columns] = await database.query('SELECT TABLE_NAME,COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME IN (\'created_at\',\'deletestatus\')');
    const dated = new Set(columns.filter(c => c.COLUMN_NAME === 'created_at').map(c => c.TABLE_NAME));
    const hasDelete = new Set(columns.filter(c => c.COLUMN_NAME === 'deletestatus').map(c => c.TABLE_NAME));
    const timeline = [];
    for (const [key, src] of Object.entries(sources)) {
      if (!available.has(src.table) || !dated.has(src.table)) continue;
      try {
        const where = src.archived && hasDelete.has(src.table) ? ' AND deletestatus=0' : '';
        const [rows] = await database.query(`SELECT ${pakistanDay('created_at')} AS day,COUNT(*) AS count FROM \`${src.table}\` WHERE ${pakistanDay('created_at')} BETWEEN ? AND ?${where} GROUP BY day ORDER BY day`, [from, to]);
        timeline.push(...rows.map(row => ({ ...row, category: src.label })));
      } catch (e) { console.warn('[overview timeline]', src.table, e.code); }
    }
    let analytics = null, analyticsError = '';
    try { analytics = await analyticsSummary(days); } catch (e) { analyticsError = 'Website usage data is unavailable until analytics storage is enabled.'; console.warn('[overview analytics]', e.code || e.message); }
    let adminWrites = [];
    let adminActivitiesTotal = 0;
    if (available.has('admin_activity_logs')) {
      try {
        const [rows] = await database.query(`SELECT ${pakistanDay('created_at')} AS day, COUNT(*) AS count FROM admin_activity_logs WHERE ${pakistanDay('created_at')} BETWEEN ? AND ? GROUP BY day`, [from, to]);
        adminWrites = rows;
        const [tot] = await database.query('SELECT COUNT(*) AS total FROM admin_activity_logs WHERE deleted_at IS NULL');
        adminActivitiesTotal = Number(tot[0]?.total || 0);
      } catch (e) { console.warn('[overview admin actions]', e.code); }
    }

    // Oriscare-parity live control-room metrics (incl. today)
    let cmsPagesTotal = 0, cmsPagesPublished = 0, quickPages = [];
    if (available.has('khudii_site_pages')) {
      try {
        const [pgRows] = await database.query(
          'SELECT id, title, slug, path, status FROM khudii_site_pages WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC LIMIT 250',
        );
        cmsPagesTotal = pgRows.length;
        cmsPagesPublished = pgRows.filter((p) => p.status === 'published').length;
        quickPages = pgRows.slice(0, 10).map((p) => ({
          id: p.id,
          title: p.title || p.slug || 'Untitled',
          path: p.path || (p.slug === 'home' ? '/' : `/${p.slug}`),
          status: p.status || 'published',
        }));
      } catch { /* optional table */ }
    }

    let seoReadyCount = 0, seoTotalCount = cmsPagesTotal;
    if (available.has('khudii_page_seo')) {
      try {
        const [sRows] = await database.query(
          "SELECT COUNT(*) AS total, SUM(CASE WHEN COALESCE(TRIM(meta_title),'') <> '' AND COALESCE(TRIM(meta_description),'') <> '' THEN 1 ELSE 0 END) AS ready FROM khudii_page_seo WHERE deleted_at IS NULL",
        );
        if (Number(sRows[0]?.total || 0) > 0) {
          seoTotalCount = Number(sRows[0].total);
          seoReadyCount = Number(sRows[0].ready || 0);
        }
      } catch { /* optional */ }
    } else if (available.has('khudii_seo_entities')) {
      try {
        const [sRows] = await database.query(
          "SELECT COUNT(*) AS total, SUM(CASE WHEN COALESCE(TRIM(meta_title),'') <> '' AND COALESCE(TRIM(meta_description),'') <> '' THEN 1 ELSE 0 END) AS ready FROM khudii_seo_entities",
        );
        seoTotalCount = Number(sRows[0]?.total || 0);
        seoReadyCount = Number(sRows[0]?.ready || 0);
      } catch { /* optional */ }
    }

    let unreadEnquiries = 0;
    const totalFormSubmissions = ['contacts', 'inquiries', 'donations', 'volunteers', 'jobs', 'stories', 'registrations']
      .reduce((acc, k) => acc + Number(Object.fromEntries(entries)[k] || 0), 0);
    if (available.has('khudii_form_inbox_state')) {
      try {
        const [r] = await database.query("SELECT COUNT(*) AS resolved FROM khudii_form_inbox_state WHERE status IN ('resolved','archived','contacted')");
        unreadEnquiries = Math.max(0, totalFormSubmissions - Number(r[0]?.resolved || 0));
      } catch {
        unreadEnquiries = totalFormSubmissions;
      }
    } else {
      unreadEnquiries = totalFormSubmissions;
    }

    let tracked404s = 0;
    if (available.has('khudii_backend_logs')) {
      try {
        const [r404] = await database.query('SELECT COUNT(*) AS total FROM khudii_backend_logs WHERE status = 404');
        tracked404s = Number(r404[0]?.total || 0);
      } catch { /* optional */ }
    }

    const integrations = {
      ga4Configured: Boolean(process.env.NEXT_PUBLIC_GA_TRACKING_ID),
      ga4Enabled: Boolean(process.env.NEXT_PUBLIC_GA_TRACKING_ID),
      gscConfigured: false,
      maintenanceEnabled: false,
      aiChatEnabled: true,
    };
    if (available.has('khudii_admin_settings')) {
      try {
        const [sRows] = await database.query("SELECT bucket, content FROM khudii_admin_settings WHERE bucket IN ('seo','login_auth','maintenance','ai_chat')");
        for (const row of sRows) {
          let parsed = {};
          try { parsed = JSON.parse(row.content || '{}'); } catch { parsed = {}; }
          if (row.bucket === 'seo') {
            if (parsed.ga_id) integrations.ga4Configured = true;
            if (parsed.google_analytics_enabled !== undefined) integrations.ga4Enabled = Boolean(parsed.google_analytics_enabled);
            if (parsed.google_site_verification) integrations.gscConfigured = true;
          }
          if (row.bucket === 'maintenance' && parsed.enabled !== undefined) {
            integrations.maintenanceEnabled = Boolean(parsed.enabled);
          } else if (row.bucket === 'login_auth' && parsed.maintenanceMode !== undefined && !integrations.maintenanceEnabled) {
            integrations.maintenanceEnabled = Boolean(parsed.maintenanceMode);
          }
          if (row.bucket === 'ai_chat' && parsed.enabled !== undefined) {
            integrations.aiChatEnabled = Boolean(parsed.enabled);
          }
        }
      } catch { /* optional */ }
    }

    const liveMetrics = {
      cmsPagesTotal,
      cmsPagesPublished,
      seoReadyCount,
      seoTotalCount,
      totalFormSubmissions,
      unreadEnquiries,
      tracked404s,
      adminActivitiesTotal,
      todayViews: analytics?.todayViews || 0,
      deviceSplit: analytics?.deviceSplit || { desktop: 0, mobile: 0, tablet: 0, total: 0 },
      quickPages,
      integrations,
    };

    res.set('Cache-Control', 'no-store');
    return res.json({ counts: Object.fromEntries(entries), cards: DASHBOARD_CARDS, timeline, analytics, analyticsError, adminWrites, liveMetrics, days, from, to, generatedAt: new Date().toISOString() });
  } catch (error) { console.error('Admin reporting error:', error); return res.status(500).json({ message: 'Unable to retrieve live reporting data' }); }
}
