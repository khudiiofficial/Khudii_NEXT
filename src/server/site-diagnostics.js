import db from './admin-backend/Database/oldDB.js';
import { validateExportRange } from '@/lib/reporting-periods';
import { adminRequestIp, recordAdminActivity } from './admin-observability.js';

const sql = db.promise();
let initialized;
let cachedBackendCols = null;

function deriveBackendCategory(pathStr, status, explicitCategory) {
  if (explicitCategory && explicitCategory !== 'all') return String(explicitCategory).toLowerCase();
  const p = String(pathStr || '').toLowerCase();
  if (p.includes('test')) return 'diagnostic';
  if (p.includes('ftp') || p.includes('image') || p.includes('media') || p.includes('upload')) return 'ftp';
  if (p.includes('db') || p.includes('mysql') || p.includes('sql') || p.includes('table')) return 'database';
  if (p.includes('network') || p.includes('timeout') || p.includes('connect')) return 'network';
  if (p.includes('email') || p.includes('smtp') || p.includes('mail')) return 'email';
  if (p.includes('auth') || p.includes('login') || p.includes('security') || status === 401 || status === 403) return 'security';
  if (p.includes('deploy') || p.includes('build')) return 'deployment';
  return 'application';
}

async function getBackendLogColumns() {
  if (cachedBackendCols) return cachedBackendCols;
  try {
    const [cols] = await sql.query('SHOW COLUMNS FROM khudii_backend_logs');
    cachedBackendCols = new Set(cols.map((c) => String(c.Field).toLowerCase()));
  } catch {
    cachedBackendCols = new Set(['id', 'created_at', 'level', 'method', 'path', 'status', 'source', 'message']);
  }
  return cachedBackendCols;
}

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
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      level VARCHAR(12) NOT NULL,
      category VARCHAR(70) NULL DEFAULT 'application',
      method VARCHAR(8) NOT NULL,
      path VARCHAR(500) NOT NULL,
      status SMALLINT UNSIGNED NOT NULL,
      source VARCHAR(64) NOT NULL,
      message VARCHAR(500) NOT NULL DEFAULT '',
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
export async function recordBackendLog({ method = 'GET', path = '/', status = 500, source = 'api', message = '', category = null }) {
  try {
    await ensureDiagnosticTables();
    const code = Number(status);
    if (!Number.isInteger(code) || code < 400 || code > 599) return;
    const pathSafe = safePath(path);
    const msg = String(message || '').slice(0, 500).replace(/[\r\n]/g, ' ');
    const level = code >= 500 ? 'error' : 'warning';
    const cat = deriveBackendCategory(pathSafe, code, category);
    const cols = await getBackendLogColumns();
    if (cols.has('category')) {
      await sql.execute(
        'INSERT INTO khudii_backend_logs (level,category,method,path,status,source,message) VALUES (?,?,?,?,?,?,?)',
        [level, cat, String(method).slice(0, 8), pathSafe, code, String(source).slice(0, 64), msg],
      );
    } else {
      await sql.execute(
        'INSERT INTO khudii_backend_logs (level,method,path,status,source,message) VALUES (?,?,?,?,?,?)',
        [level, String(method).slice(0, 8), pathSafe, code, String(source).slice(0, 24), msg],
      );
    }
  } catch(e) { console.error('[diagnostics persistence]', e.code || e.message); }
}
export async function writeBackendTestLog(req, res) {
  try {
    if (req.body?.action && req.body.action !== 'test') {
      return res.status(422).json({ success: false, message: 'Invalid diagnostic action' });
    }
    await ensureDiagnosticTables();
    const cols = await getBackendLogColumns();
    if (cols.has('category')) {
      await sql.execute(
        'INSERT INTO khudii_backend_logs (level, category, method, path, status, source, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['info', 'diagnostic', 'POST', '/admin/backend-logs/test', 200, 'admin-panel', 'Test logger succeeded from Admin Console'],
      );
    } else {
      await sql.execute(
        'INSERT INTO khudii_backend_logs (level, method, path, status, source, message) VALUES (?, ?, ?, ?, ?, ?)',
        ['info', 'POST', '/admin/backend-logs/test', 200, 'admin-panel', 'Test logger succeeded from Admin Console'],
      );
    }
    await recordAdminActivity({
      module: 'diagnostic',
      action: 'test',
      target: 'backend logs',
      message: 'Ran backend logger diagnostic test',
      userId: req.user?.id,
      actorName: req.user?.name,
      actorEmail: req.user?.email,
      role: req.user?.role || 'admin',
      ipAddress: adminRequestIp(req.headers),
      requestPath: '/admin/backend-logs/test',
    });
    res.set('Cache-Control', 'no-store');
    return res.json({ success: true, message: 'Test log entry successfully written and audited.' });
  } catch (err) {
    console.error('[writeBackendTestLog error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to write test log: ' + err.message });
  }
}

export async function getBackendLogs(req, res) {
  try {
    await ensureDiagnosticTables();
    const cols = await getBackendLogColumns();
    const hasDeleted = cols.has('deleted_at');
    const hasCategory = cols.has('category');

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize) || 25));
    const offset = (page - 1) * pageSize;

    const level = String(req.query.level || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim().toLowerCase();
    const sourceFilter = String(req.query.source || '').trim();
    const search = String(req.query.search || req.query.q || '').trim();

    const filters = hasDeleted ? ['deleted_at IS NULL'] : ['1=1'];
    const params = [];

    if (level && level !== 'all') {
      filters.push('LOWER(level) = ?');
      params.push(level);
    }
    if (sourceFilter && sourceFilter !== 'all') {
      filters.push('source = ?');
      params.push(sourceFilter);
    }
    if (search) {
      filters.push('(path LIKE ? OR message LIKE ? OR source LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category && category !== 'all') {
      const sqlDerivedCat = `COALESCE(${hasCategory ? 'NULLIF(LOWER(category), \'\')' : 'NULL'}, CASE
        WHEN LOWER(path) LIKE '%test%' THEN 'diagnostic'
        WHEN LOWER(path) LIKE '%ftp%' OR LOWER(path) LIKE '%image%' OR LOWER(path) LIKE '%media%' OR LOWER(path) LIKE '%upload%' THEN 'ftp'
        WHEN LOWER(path) LIKE '%db%' OR LOWER(path) LIKE '%mysql%' OR LOWER(path) LIKE '%sql%' THEN 'database'
        WHEN LOWER(path) LIKE '%network%' OR LOWER(path) LIKE '%timeout%' THEN 'network'
        WHEN LOWER(path) LIKE '%email%' OR LOWER(path) LIKE '%smtp%' OR LOWER(path) LIKE '%mail%' THEN 'email'
        WHEN LOWER(path) LIKE '%auth%' OR LOWER(path) LIKE '%login%' OR status IN (401,403) THEN 'security'
        WHEN LOWER(path) LIKE '%deploy%' OR LOWER(path) LIKE '%build%' THEN 'deployment'
        ELSE 'application'
      END)`;
      filters.push(`${sqlDerivedCat} = ?`);
      params.push(category);
    }

    const where = filters.join(' AND ');

    const [[{ totalCount }]] = await sql.query(`SELECT COUNT(*) as totalCount FROM khudii_backend_logs WHERE ${where}`, params);
    const [rawRows] = await sql.query(
      `SELECT * FROM khudii_backend_logs WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );

    const formattedRows = rawRows.map((row) => {
      const derivedCat = deriveBackendCategory(row.path, row.status, row.category);
      let explanation = '';
      let suggestedAction = '';
      if (row.status === 404) {
        explanation = `The requested route or API endpoint '${row.path}' was not found on the server.`;
        suggestedAction = 'Add a redirect rule in Redirects & 404 or verify the target route.';
      } else if (row.status === 401 || row.status === 403) {
        explanation = 'Authentication failure or insufficient role permission while accessing a protected endpoint.';
        suggestedAction = 'Confirm user role permissions in Users & Access or sign in again.';
      } else if (row.status >= 500) {
        explanation = `Server error ${row.status} occurred during request processing.`;
        suggestedAction = 'Inspect database connectivity, external FTP/SMTP configuration, and server logs.';
      } else if (row.message && row.message.includes('Test log')) {
        explanation = 'Manual diagnostic check executed by administrator.';
        suggestedAction = 'No action required. Diagnostics storage is operational.';
      }

      return {
        id: String(row.id),
        timestamp: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        level: row.level || (row.status >= 500 ? 'error' : row.status >= 400 ? 'warning' : 'info'),
        category: derivedCat,
        environment: process.env.NODE_ENV || 'production',
        source: row.source || 'admin-api',
        method: row.method || 'GET',
        httpStatus: row.status ? Number(row.status) : null,
        targetFile: row.path,
        code: row.status ? `HTTP_${row.status}` : 'APPLICATION_LOG',
        message: row.message || `HTTP ${row.status} response for ${row.path}`,
        explanation,
        suggestedAction,
        details: `Timestamp (UTC): ${row.created_at ? new Date(row.created_at).toISOString() : 'N/A'}\nMethod: ${row.method}\nPath: ${row.path}\nHTTP Status: ${row.status}\nCategory: ${derivedCat}\nSource: ${row.source}\nMessage: ${row.message}`,
      };
    });

    const delSql = hasDeleted ? 'WHERE deleted_at IS NULL' : '';
    const [[summary]] = await sql.query(
      `SELECT COUNT(*) AS total, SUM(status >= 500) AS errors, SUM(status = 404) AS not_found, SUM(status >= 400 AND status < 500) AS warnings FROM khudii_backend_logs ${delSql}`,
    );
    const [sourceRows] = await sql.query(
      `SELECT DISTINCT source FROM khudii_backend_logs ${delSql} ORDER BY source ASC LIMIT 30`,
    );

    res.set('Cache-Control', 'no-store');
    return res.json({
      success: true,
      rows: formattedRows,
      events: rawRows,
      total: Number(totalCount),
      page,
      pageSize,
      sources: sourceRows.map((r) => r.source).filter(Boolean),
      source: 'MySQL Diagnostics',
      environment: process.env.NODE_ENV || 'production',
      summary: {
        total: Number(summary?.total || 0),
        errors: Number(summary?.errors || 0),
        not_found: Number(summary?.not_found || 0),
        warnings: Number(summary?.warnings || 0),
      },
    });
  } catch (e) {
    if (e?.code === 'ER_BAD_FIELD_ERROR') cachedBackendCols = null;
    console.error('[backend logs]', e);
    return res.status(503).json({ success: false, message: 'Diagnostics storage is not available' });
  }
}
function csvCell(value) {let s=String(value??'').replace(/[\r\n]/g,' ');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
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
