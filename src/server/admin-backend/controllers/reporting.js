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
    if (available.has('admin_activity_logs')) {
      try { const [rows] = await database.query(`SELECT ${pakistanDay('created_at')} AS day, COUNT(*) AS count FROM admin_activity_logs WHERE ${pakistanDay('created_at')} BETWEEN ? AND ? GROUP BY day`, [from, to]); adminWrites = rows; }
      catch (e) { console.warn('[overview admin actions]', e.code); }
    }
    res.set('Cache-Control', 'no-store');
    return res.json({ counts: Object.fromEntries(entries), cards: DASHBOARD_CARDS, timeline, analytics, analyticsError, adminWrites, days, from, to, generatedAt: new Date().toISOString() });
  } catch (error) { console.error('Admin reporting error:', error); return res.status(500).json({ message: 'Unable to retrieve live reporting data' }); }
}
