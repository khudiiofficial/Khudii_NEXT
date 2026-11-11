import db from './admin-backend/Database/oldDB.js';
export async function getPublicSeoDefaults(){
  try{
    const [rows]=await db.promise().query("SELECT content FROM khudii_admin_settings WHERE bucket='seo' LIMIT 1");
    if(rows[0]?.content){const parsed=JSON.parse(rows[0].content);return parsed && typeof parsed==='object' && !Array.isArray(parsed)?parsed:{};}
  }catch(e){console.error('[public SEO defaults]',e.code||e.message);}
  return {};
}
