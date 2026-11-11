import db from '../Database/oldDB.js';
import { analyticsSummary, ensureAnalyticsStorage, categoryForPath } from './analytics.js';
import { completedRange, validReportDays, validateExportRange } from '@/lib/reporting-periods';
import { createActivityPdf } from './activityPdf.js';
const sql=db.promise();
const publicDay="DATE(CONVERT_TZ(occurred_at,'+00:00','+05:00'))";
const adminDay="DATE(CONVERT_TZ(created_at,'+00:00','+05:00'))";

async function readAdminLogs(from,to,limit=100) {
  const [events]=await sql.query(`SELECT id,actor_id,action,route,http_status,created_at FROM admin_activity_logs WHERE ${adminDay} BETWEEN ? AND ? ORDER BY id DESC LIMIT ?`,[from,to,limit]);
  const [timeline]=await sql.query(`SELECT ${adminDay} AS day,action AS category,COUNT(*) AS count FROM admin_activity_logs WHERE ${adminDay} BETWEEN ? AND ? GROUP BY day,action ORDER BY day`,[from,to]);
  const [[{total}]]=await sql.query(`SELECT COUNT(*) AS total FROM admin_activity_logs WHERE ${adminDay} BETWEEN ? AND ?`,[from,to]);
  return {events,timeline,total:Number(total)};
}
export async function getActivityLogs(req,res) {
  const days=validReportDays(req.query.days);
  const {from,to}=completedRange(days);
  let error='';
  let admin={events:[],timeline:[],total:0};
  let analytics=null;
  try {admin=await readAdminLogs(from,to);}catch(e){error='Admin write logs are unavailable. Apply the original activity-log migration.';console.warn('[admin activity]',e.code);}
  try {analytics=await analyticsSummary(days);}catch(e){error += ' Website analytics storage is unavailable.';console.warn('[activity analytics]',e.code);}
  res.set('Cache-Control','no-store');
  return res.json({...admin,analytics,from,to,days,warning:error});
}

function csvSafe(value) {
  let v = String(value ?? '').replace(/\r|\n/g,' ');
  if (/^[=+@-]/.test(v)) v = `'${v}`; // defend spreadsheet formula injection
  return `"${v.replace(/"/g,'""')}"`;
}
function formatCsv(rows) {
  const keys=['time','surface','category','action','path','status','actor'];
  const lines=[keys.map(csvSafe).join(',')];
  for(const row of rows) lines.push(keys.map(k=>csvSafe(row[k])).join(','));
  return '\uFEFF'+lines.join('\r\n')+'\r\n';
}
export async function downloadActivityLogs(req,res) {
  const from=String(req.query.from||''),to=String(req.query.to||''),format=String(req.query.format||'').toLowerCase();
  const invalid=validateExportRange(from,to);
  if(invalid) return res.status(422).json({message:invalid});
  if(!['csv','pdf'].includes(format)) return res.status(422).json({message:'Select CSV or PDF.'});
  try {
    await ensureAnalyticsStorage();
    const [a]=await sql.query(`SELECT occurred_at AS time,surface,category,action,path, '' AS status,'' AS actor FROM khudii_analytics_events WHERE ${publicDay} BETWEEN ? AND ? ORDER BY occurred_at ASC LIMIT 20001`,[from,to]);
    let admin=[];
    try {
      const [rows]=await sql.query(`SELECT created_at AS time,actor_id AS actor,action,route AS path,http_status AS status FROM admin_activity_logs WHERE ${adminDay} BETWEEN ? AND ? ORDER BY created_at ASC LIMIT 20001`,[from,to]);
      admin=rows.map(row=>({...row,surface:'backend',category:categoryForPath(row.path)}));
    } catch(e) {if(e.code!=='ER_NO_SUCH_TABLE')throw e;}
    if(a.length>20000||admin.length>20000||a.length+admin.length>20000) return res.status(413).json({message:'More than 20,000 activity records. Choose a shorter date range.'});
    const data=[...a,...admin].map(row=>({time:new Date(row.time).toISOString(),surface:row.surface,category:row.category,action:row.action,path:row.path,status:row.status,actor:row.actor})).sort((l,r)=>l.time.localeCompare(r.time));
    const file=`khudii-activity-${from}-to-${to}.${format}`;
    res.set('Content-Disposition',`attachment; filename="${file}"`);
    res.set('Cache-Control','private, no-store');
    res.set('X-Content-Type-Options','nosniff');
    if(format==='csv') {res.set('Content-Type','text/csv; charset=utf-8');return res.send(formatCsv(data));}
    res.set('Content-Type','application/pdf');return res.send(createActivityPdf(data,{from,to}));
  } catch(e) {console.error('[activity download]',e);return res.status(500).json({message:'Unable to generate report. Verify activity storage.'});}
}
export async function writeActivityLog({actor,method,path,status,ip}) {
  try {await sql.execute('INSERT INTO admin_activity_logs(actor_id,action,route,http_status,ip_address) VALUES (?,?,?,?,?)',[String(actor||'').slice(0,100)||null,method,path.slice(0,500),status,ip?.slice(0,45)||null]);}
  catch(e){console.error('Failed to persist admin activity:',e.message);}
}
