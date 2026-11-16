import jwt from 'jsonwebtoken';
import {cookies,headers} from 'next/headers';
import db from '@/server/admin-backend/Database/oldDB.js';
import {validSessionVersion} from '@/server/admin-backend/utils/sessionVersion.js';
import {getDatabaseStatus,exportLiveDatabase} from '@/server/database-sync.js';
import {writeActivityLog} from '@/server/admin-backend/controllers/activityLogs.js';

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=300;
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function permitted(method){
  const h=await headers(),secret=process.env.JWT_SECRET;
  if(!secret)return false;
  if(method==='POST'){
    const origin=h.get('origin'),host=h.get('x-forwarded-host')||h.get('host');
    if(!origin||!host)return false;
    try { if(new URL(origin).host!==host.split(',')[0].trim()&&origin!==process.env.ADMIN_SITE_URL)return false; }
    catch{return false;}
  }
  const token=(await cookies()).get('token')?.value;
  if(!token)return false;
  let claims;try{claims=jwt.verify(token,secret);}catch{return false;}
  if(!claims?.id||!claims?.sessionVersion)return false;
  const [users]=await db.promise().query('SELECT id,email,password,status,deleted_at FROM users WHERE id=? LIMIT 1',[claims.id]);
  const user=users[0];
  if(!user||!user.status||user.deleted_at||claims.email!==user.email||!validSessionVersion(claims.sessionVersion,user.password))return false;
  const [roles]=await db.promise().query("SELECT 1 FROM khudii_admin_user_roles ur JOIN khudii_admin_roles r ON ur.role_id=r.id WHERE ur.user_id=? AND r.role_key='super_admin' LIMIT 1",[user.id]);
  return roles.length>0 ? user.id : false;
}
export async function GET(){
  try {if(!await permitted('GET'))return json({message:'Super Admin access required'},403);return json(await getDatabaseStatus());}
  catch(error){console.error('[DB status]',error?.code||error?.message);return json({message:'Database status unavailable'},503);}
}
export async function POST(request){
  try {
    const actor=await permitted('POST');
    if(!actor)return json({message:'Super Admin access and same-origin request required'},403);
    const body=await request.json().catch(()=>({}));
    const action=body.action;
    if(action!=='export')return json({message:'Only database export is permitted'},422);
    if(body.confirm!=='EXPORT')return json({message:'Explicit confirmation required'},422);
    if(action==='export'){
      const stream=await exportLiveDatabase();
      await writeActivityLog({actor,method:'POST',path:'/api-app/database/export',status:200});
      const date=new Date().toISOString().slice(0,10);
      return new Response(stream,{headers:{'Content-Type':'application/sql; charset=utf-8','Content-Disposition':`attachment; filename="khudii-live-${date}.sql"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
    }
    return json({message:'Only database export is permitted'},422);
  } catch(error) {
    console.error('[DB operation]',error?.code||error?.message);
    return json({message:error?.message||'Database operation failed'},503);
  }
}
