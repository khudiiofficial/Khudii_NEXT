import db from './admin-backend/Database/oldDB.js';
import { validateExportRange,completedRange,validReportDays } from '@/lib/reporting-periods';

const sql = db.promise();
let initialized;
const safePath = value => {
  const path = String(value || '/').split('?')[0].split('#')[0];
  return path.startsWith('/') && !path.startsWith('//') ? path.slice(0, 500) : '/';
};
const allowedRedirect = value => {
  const v=String(value||'');
  if(v.length>500||v==='/'||!v.startsWith('/')||v.startsWith('//')||/[?#\\\s%]/.test(v))return false;
  if(!/^\/[a-z0-9/_.-]*$/i.test(v)||v.includes('//')||v.split('/').some(p=>p==='.'||p==='..'))return false;
  return !/^\/(?:api-app|admin-app|_next|letskhudii)(?:\/|$)/i.test(v);
};
export function ensureDiagnosticTables() {
  if (!initialized) initialized = Promise.all([
    sql.query(`CREATE TABLE IF NOT EXISTS khudii_backend_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      level VARCHAR(12) NOT NULL,
      method VARCHAR(8) NOT NULL,
      path VARCHAR(500) NOT NULL,
      status SMALLINT UNSIGNED NOT NULL,
      source VARCHAR(24) NOT NULL,
      message VARCHAR(300) NOT NULL DEFAULT '',
      INDEX idx_backend_time (created_at),
      INDEX idx_backend_status (status, created_at),
      INDEX idx_backend_path (path(120), created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),
    sql.query(`CREATE TABLE IF NOT EXISTS khudii_redirect_rules (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      source_path VARCHAR(500) NOT NULL,
      target_path VARCHAR(500) NOT NULL,
      redirect_type SMALLINT UNSIGNED NOT NULL DEFAULT 308,
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      hits BIGINT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_redirect_source (source_path(191))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),
  ]).catch(e => { initialized = null; throw e; });
  return initialized;
}
export async function recordBackendLog({ method = 'GET', path = '/', status = 500, source = 'api', message = '' }) {
  try {
    await ensureDiagnosticTables();
    const code = Number(status);
    if (!Number.isInteger(code) || code < 400 || code > 599) return;
    const pathSafe = safePath(path);
    const msg = String(message || '').slice(0, 300).replace(/[\r\n]/g, ' ');
    const level = code >= 500 ? 'error' : 'warning';
    await sql.execute('INSERT INTO khudii_backend_logs (level,method,path,status,source,message) VALUES (?,?,?,?,?,?)',
      [level, String(method).slice(0, 8), pathSafe, code, String(source).slice(0, 24), msg]);
  } catch(e) { console.error('[diagnostics persistence]', e.code || e.message); }
}
export async function getBackendLogs(req,res) {
  try {
    await ensureDiagnosticTables();
    const days=validReportDays(req.query.days);
    const {from,to}=completedRange(days);
    const status = Number(req.query.status) || 0;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100,1),500);
    const filters = ["DATE(CONVERT_TZ(created_at,'+00:00','+05:00')) BETWEEN ? AND ?"];
    const params = [from,to];
    if (status>=400 && status<=599) { filters.push('status = ?'); params.push(status); }
    const term = String(req.query.q || '').trim().slice(0,100);
    if (term) { filters.push('path LIKE ?'); params.push('%'+term.replace(/[%_]/g, '')+'%'); }
    const where = filters.join(' AND ');
    const [[summary]] = await sql.query(`SELECT COUNT(*) AS total, SUM(status>=500) AS errors, SUM(status=404) AS not_found FROM khudii_backend_logs WHERE ${where}`, params);
    const [events] = await sql.query(`SELECT id,created_at,level,method,path,status,source,message FROM khudii_backend_logs WHERE ${where} ORDER BY created_at DESC,id DESC LIMIT ?`, [...params,limit]);
    const [timeline] = await sql.query(`SELECT DATE(created_at) AS day,IF(status>=500,'Errors','4xx') AS category,COUNT(*) AS count FROM khudii_backend_logs WHERE ${where} GROUP BY day,category ORDER BY day`,params);
    res.set('Cache-Control','no-store');return res.json({summary,events,timeline,days});
  } catch(e) { console.error('[backend logs]',e); return res.status(503).json({message:'Diagnostics storage is not available'}); }
}
function csvCell(value) {let s=String(value??'').replace(/[\r\n]/g,' ');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export async function exportBackendLogs(req,res) {
  const from=String(req.query.from||''),to=String(req.query.to||'');
  const validation=validateExportRange(from,to);if(validation)return res.status(422).json({message:validation});
  try {
    await ensureDiagnosticTables();
    const [rows] = await sql.query('SELECT created_at,level,method,path,status,source,message FROM khudii_backend_logs WHERE DATE(CONVERT_TZ(created_at,\'+00:00\',\'+05:00\')) BETWEEN ? AND ? ORDER BY created_at DESC LIMIT 20001',[from,to]);
    if(rows.length>20000)return res.status(413).json({message:'Select a shorter period (maximum 20,000 rows)'});
    const keys=['created_at','level','method','path','status','source','message'];
    const csv='\uFEFF'+[keys.map(csvCell).join(','),...rows.map(r=>keys.map(k=>csvCell(r[k] instanceof Date?r[k].toISOString():r[k])).join(','))].join('\r\n');
    res.set('Content-Type','text/csv; charset=utf-8');res.set('Cache-Control','private, no-store');res.set('Content-Disposition',`attachment; filename="khudii-backend-${from}-to-${to}.csv"`);
    return res.send(csv);
  } catch(e){console.error('[backend export]',e);return res.status(503).json({message:'Unable to export backend logs'});}
}
export async function listRedirects(req,res){
  try{
    await ensureDiagnosticTables();
    const [redirects]=await sql.query('SELECT * FROM khudii_redirect_rules ORDER BY id DESC LIMIT 1000');
    const [notFound]=await sql.query("SELECT path,COUNT(*) AS hits,MAX(created_at) AS last_seen FROM khudii_backend_logs WHERE status=404 AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90 DAY) GROUP BY path ORDER BY hits DESC LIMIT 100");
    res.set('Cache-Control','no-store');return res.json({redirects,notFound});
  }catch(e){console.error('[redirects]',e);return res.status(503).json({message:'Redirect storage unavailable'});}
}
function validRedirectBody(body){
  const source_path = String(body?.source_path||'').trim();
  const target_path = String(body?.target_path||'').trim();
  const redirect_type = Number(body?.redirect_type)===307 ? 307 : 308;
  if (!allowedRedirect(source_path) || !allowedRedirect(target_path) || source_path===target_path) return null;
  return {source_path,target_path,redirect_type,enabled:body?.enabled!==false && body?.enabled!==0 ? 1 : 0};
}
async function redirectWouldLoop(source,target){
  const visited=new Set([source]);
  let next=target;
  for(let i=0;i<15;i++){
    if(visited.has(next))return true;
    visited.add(next);
    const [[r]]=await sql.execute('SELECT target_path FROM khudii_redirect_rules WHERE source_path=? AND enabled=1 LIMIT 1',[next]);
    if(!r)return false;
    next=r.target_path;
  }
  return true;
}
export async function createRedirect(req,res){
  const input=validRedirectBody(req.body);if(!input)return res.status(422).json({message:'Enter two different internal paths beginning with /. Admin/API paths and external URLs are not permitted.'});
  try{await ensureDiagnosticTables();if(input.enabled && await redirectWouldLoop(input.source_path,input.target_path))return res.status(422).json({message:'This redirect would create a loop'});const [r]=await sql.execute('INSERT INTO khudii_redirect_rules (source_path,target_path,redirect_type,enabled) VALUES (?,?,?,?)',Object.values(input));return res.status(201).json({id:r.insertId,...input});}
  catch(e){return res.status(e.code==='ER_DUP_ENTRY'?409:503).json({message:e.code==='ER_DUP_ENTRY'?'A redirect for this source already exists.':'Unable to save redirect'});}
}
export async function updateRedirect(req,res){
  const id=Number(req.params.id),input=validRedirectBody(req.body);if(!Number.isSafeInteger(id)||id<1||!input)return res.status(422).json({message:'Invalid redirect ID or paths'});
  try{await ensureDiagnosticTables();if(input.enabled && await redirectWouldLoop(input.source_path,input.target_path))return res.status(422).json({message:'This redirect would create a loop'});const [r]=await sql.execute('UPDATE khudii_redirect_rules SET source_path=?,target_path=?,redirect_type=?,enabled=? WHERE id=?',[...Object.values(input),id]);return res.status(r.affectedRows?200:404).json({success:!!r.affectedRows});}
  catch(e){return res.status(e.code==='ER_DUP_ENTRY'?409:503).json({message:e.code==='ER_DUP_ENTRY'?'A redirect for this source already exists.':'Unable to update redirect'});}
}
export async function deleteRedirect(req,res){
  const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(422).json({message:'Invalid redirect ID'});
  try{await ensureDiagnosticTables();const [r]=await sql.execute('DELETE FROM khudii_redirect_rules WHERE id=?',[id]);return res.status(r.affectedRows?200:404).json({success:!!r.affectedRows});}
  catch(e){return res.status(503).json({message:'Unable to delete redirect'});}
}
export async function resolveRedirect(path){
  const clean=safePath(path);if(!allowedRedirect(clean))return null;
  try{
    await ensureDiagnosticTables();const [[row]]=await sql.execute('SELECT target_path,redirect_type FROM khudii_redirect_rules WHERE source_path=? AND enabled=1 LIMIT 1',[clean]);
    if(!row||!allowedRedirect(row.target_path)||row.target_path===clean)return null;
    await sql.query('UPDATE khudii_redirect_rules SET hits=hits+1 WHERE source_path=?',[clean]).catch(()=>{});
    return {target:row.target_path,status:row.redirect_type===307?307:308};
  }catch(e){console.error('[redirect lookup]',e.code||e.message);return null;}
}
export async function publicResolveRedirect(req,res){
  const matched=await resolveRedirect(req.query.path);res.set('Cache-Control','no-store');return res.json(matched||{target:null});
}
const recent404 = new Map();
export async function recordPublic404(req,res){
  const path=safePath(req.body?.path);
  if(!allowedRedirect(path))return res.status(422).json({message:'Invalid path'});
  const current=Date.now(), prior=recent404.get(path)||0;
  if(current-prior>30000){recent404.set(path,current);if(recent404.size>500)recent404.delete(recent404.keys().next().value);await recordBackendLog({method:'GET',path,status:404,source:'public-page',message:'Page not found'});}
  return res.status(202).json({success:true});
}
