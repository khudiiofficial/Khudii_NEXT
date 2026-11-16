import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import db from '../admin-backend/Database/oldDB.js';
import {validSessionVersion} from '../admin-backend/utils/sessionVersion.js';

const pool=db.promise();
export function routePermission(path,method){
  const write=!['GET','HEAD','OPTIONS'].includes(method);
  if(path==='/auth/change-password'||path==='/api/profile')return null;
  if(path.includes('/seo/')||path.includes('/seo-center'))return write?'seo.manage':'seo.read';
  if(path.includes('/redirect'))return 'redirects.manage';
  if(path.includes('/backend-logs')||path.includes('/activity')||path.includes('/report'))return 'logs.read';
  if(path.includes('/media'))return 'media.manage';
  if(path.includes('/settings')||path.includes('/owner'))return 'settings.manage';
  if(path.includes('/forms/')||path.includes('/inquir')||path.includes('/donation')||path.includes('/submissions')||path.includes('/contact-messages')||path.includes('/volunteer')||path.includes('/job-applications'))return write?'forms.manage':'forms.read';
  if(path.includes('/reorder'))return 'pages.write';
  return write?'pages.write':'pages.read';
}
export async function hasPermission(userId,permission){
  const [rows]=await pool.query('SELECT 1 AS ok FROM khudii_admin_user_roles ur JOIN khudii_admin_role_permissions rp ON rp.role_id=ur.role_id JOIN khudii_admin_permissions p ON p.id=rp.permission_id WHERE ur.user_id=? AND p.permission_key=? LIMIT 1',[userId,permission]);
  return !!rows.length;
}
export async function requireLegacyRole(req,res,next){
  if(!req.user?.id)return res.status(401).json({success:false,error:{code:'unauthorized',message:'Login required'}});
  if(['POST','PUT','PATCH','DELETE'].includes(req.method)){
    const origin=req.get('origin'),host=String(req.get('x-forwarded-host')||req.get('host')||'').split(',')[0];
    if(origin){let originHost;try{originHost=new URL(origin).host;}catch{return res.status(403).json({success:false,error:{code:'invalid_origin',message:'Invalid request origin'}});}
      if(originHost!==host && origin!==process.env.ADMIN_SITE_URL)return res.status(403).json({success:false,error:{code:'origin_mismatch',message:'Cross-site request rejected'}});
    }
  }
  const permission=routePermission(req.path,req.method);
  if(!permission)return next();
  try {if(!(await hasPermission(req.user.id,permission)))return res.status(403).json({success:false,error:{code:'forbidden',message:`Role permission required: ${permission}`}});return next();}
  catch(error){console.error('[Admin role lookup]',error?.code||error?.message);return res.status(503).json({success:false,error:{code:'auth_unavailable',message:'Authorization service unavailable'}})}
}
export async function requireAdminPage(){
  const secret=process.env.JWT_SECRET;if(!secret)throw Error('Authentication is not configured');
  const cookieStore=await cookies();const token=cookieStore.get('token')?.value;if(!token)redirect('/letskhudii');
  let claims;try{claims=jwt.verify(token,secret)}catch{redirect('/letskhudii')}
  if(!claims?.id||!claims?.sessionVersion)redirect('/letskhudii');
  const [rows]=await pool.query('SELECT id,email,password,status,deleted_at FROM users WHERE id=? LIMIT 1',[claims.id]);
  const user=rows[0];
  if(!user || !user.status || user.deleted_at || user.email!==claims.email||!validSessionVersion(claims.sessionVersion,user.password))redirect('/letskhudii');
  const [roles]=await pool.query('SELECT 1 AS ok FROM khudii_admin_user_roles WHERE user_id=? LIMIT 1',[user.id]);
  if(!roles.length)redirect('/admin-app/access-denied');
  return {id:user.id,email:user.email};
}
