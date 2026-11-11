import { createHash } from 'node:crypto';
import db from '../Database/oldDB.js';
import { completedRange, validReportDays } from '@/lib/reporting-periods';

const sql = db.promise();
const ACTIONS = new Set(['page_view','section_view','link_click','form_attempt','submit_success','podcast_play','video_play','search','filter','content_open']);
const SURFACES = new Set(['frontend','backend']);
const CATEGORIES = new Set(['pages','sections','forms','organizations','blogs','podcasts','videos','donations','stories','jobs','volunteers','registrations','navigation','search','media','admin','other']);
let initPromise;
export function ensureAnalyticsStorage() {
  if (!initPromise) initPromise = sql.query(`CREATE TABLE IF NOT EXISTS khudii_analytics_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    surface VARCHAR(12) NOT NULL,
    category VARCHAR(32) NOT NULL,
    action VARCHAR(32) NOT NULL,
    path VARCHAR(255) NOT NULL,
    item_id VARCHAR(100) DEFAULT NULL,
    visitor_hash CHAR(64) DEFAULT NULL,
    referrer_host VARCHAR(150) DEFAULT NULL,
    device_category VARCHAR(12) DEFAULT NULL,
    INDEX ix_analytics_date (occurred_at,surface,category),
    INDEX ix_analytics_action (action,occurred_at),
    INDEX ix_analytics_path (path,occurred_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(e => { initPromise = null; throw e; });
  return initPromise;
}
function pathOnly(value) {
  let s = typeof value === 'string' ? value : '';
  if (!s.startsWith('/') || s.startsWith('//')) return '/';
  // Do not store query strings, contact details, tokens, or user-supplied text.
  s = s.split('?')[0].split('#')[0].replace(/\/\d{6,}(?=\/|$)/g, '/:id');
  return s.slice(0, 255);
}
function hostOnly(value) {
  try { const v = new URL(value); return ['https:','http:'].includes(v.protocol) ? v.hostname.toLowerCase().slice(0,150) : null; } catch { return null; }
}
export function categoryForPath(path) {
  if (/podcast/i.test(path)) return 'podcasts';
  if (/blog/i.test(path)) return 'blogs';
  if (/organization|sector|categor/i.test(path)) return 'organizations';
  if (/donat|bank/i.test(path)) return 'donations';
  if (/video/i.test(path)) return 'videos';
  if (/stor/i.test(path)) return 'stories';
  if (/job/i.test(path)) return 'jobs';
  if (/volunteer/i.test(path)) return 'volunteers';
  if (/registration/i.test(path)) return 'registrations';
  if (/contact|inquiri|form/i.test(path)) return 'forms';
  if (/seo/i.test(path)) return 'admin';
  if (/media|image|carousel/i.test(path)) return 'media';
  return 'pages';
}
export async function recordAnalyticsEvent({surface,category,action,path,itemId,visitor,referrer,device}) {
  if (!SURFACES.has(surface) || !ACTIONS.has(action)) return false;
  const safePath = pathOnly(path);
  const safeCategory = CATEGORIES.has(category) ? category : categoryForPath(safePath);
  // Random, anonymous browser session IDs only, not IP addresses, email or form contents.
  const visitor_hash = /^[a-f0-9-]{16,64}$/i.test(visitor || '') ? createHash('sha256').update(String(visitor) + (process.env.ANALYTICS_HASH_SALT || '')).digest('hex') : null;
  const safeItem = /^[A-Za-z0-9_:-]{1,100}$/.test(String(itemId || '')) ? String(itemId) : null;
  await ensureAnalyticsStorage();
  await sql.execute('INSERT INTO khudii_analytics_events (surface,category,action,path,item_id,visitor_hash,referrer_host,device_category) VALUES (?,?,?,?,?,?,?,?)', [surface,safeCategory,action,safePath,safeItem,visitor_hash,hostOnly(referrer),['mobile','tablet','desktop'].includes(device) ? device : null]);
  return true;
}
export async function receivePublicAnalytics(req,res) {
  const b = req.body || {};
  const action = String(b.action || '');
  if (!ACTIONS.has(action) || action === 'submit_success' || !['frontend'].includes(b.surface)) return res.status(422).json({message:'Unsupported analytics event'});
  if (JSON.stringify(b).length > 1800) return res.status(413).json({message:'Event too large'});
  try { await recordAnalyticsEvent({...b,itemId:b.itemId}); return res.status(202).json({success:true}); }
  catch(e){console.error('[public analytics]',e.message);return res.status(503).json({message:'Analytics storage unavailable'});}
}
export async function receiveAdminAnalytics(req,res) {
  const b=req.body || {};
  if (b.action !== 'page_view' || JSON.stringify(b).length > 1800) return res.status(422).json({message:'Invalid admin analytics event'});
  try {await recordAnalyticsEvent({...b,surface:'backend',category:'admin'});return res.status(202).json({success:true});}
  catch(e){console.error('[admin analytics]',e.message);return res.status(503).json({message:'Analytics storage unavailable'});}
}
export async function analyticsSummary(days) {
  const period = validReportDays(days);
  const {from,to} = completedRange(period);
  await ensureAnalyticsStorage();
  // Explicit Asia/Karachi day boundaries. Records are stored as MySQL TIMESTAMP.
  const daySql = "DATE(CONVERT_TZ(occurred_at,'+00:00','+05:00'))";
  const [timeline] = await sql.query(`SELECT ${daySql} AS day,surface AS category,COUNT(*) AS count FROM khudii_analytics_events WHERE ${daySql} BETWEEN ? AND ? GROUP BY day,surface ORDER BY day`,[from,to]);
  const [categories] = await sql.query(`SELECT category,surface,COUNT(*) AS count FROM khudii_analytics_events WHERE ${daySql} BETWEEN ? AND ? GROUP BY category,surface ORDER BY count DESC`,[from,to]);
  const [topPages] = await sql.query(`SELECT path,COUNT(*) AS count FROM khudii_analytics_events WHERE action='page_view' AND surface='frontend' AND ${daySql} BETWEEN ? AND ? GROUP BY path ORDER BY count DESC LIMIT 12`,[from,to]);
  const [topActions] = await sql.query(`SELECT action,surface,COUNT(*) AS count FROM khudii_analytics_events WHERE ${daySql} BETWEEN ? AND ? GROUP BY action,surface ORDER BY count DESC LIMIT 20`,[from,to]);
  const [sessions] = await sql.query(`SELECT COUNT(DISTINCT visitor_hash) AS sessions FROM khudii_analytics_events WHERE surface='frontend' AND visitor_hash IS NOT NULL AND ${daySql} BETWEEN ? AND ?`,[from,to]);
  return {days:period,from,to,timeline,categories,topPages,topActions,sessions:Number(sessions[0]?.sessions||0)};
}
