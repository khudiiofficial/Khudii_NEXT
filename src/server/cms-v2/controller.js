import { randomUUID } from 'node:crypto';
import db from '../admin-backend/Database/oldDB.js';
import { CmsError, fail, idValue, pathValue, publicNavigationTree, RESOURCE_DEFS, validatePayload } from './validation.js';

const pool = db.promise();
const collection = name => {const def=RESOURCE_DEFS[name]; if(!def)fail(404,'resource_not_found','Unknown CMS resource');return def;};
const clean = value => {if(value === undefined || value === null)return null;return typeof value==='string'?JSON.parse(value):value;};
const dbError = (error) => {
  if(error instanceof CmsError)return error;
  if(['ER_DUP_ENTRY','ER_ROW_IS_REFERENCED_2','ER_NO_REFERENCED_ROW_2'].includes(error?.code))return new CmsError(409,'database_constraint','A duplicate, referenced or missing related record prevents this operation');
  if(['ER_NO_SUCH_TABLE','ER_BAD_FIELD_ERROR'].includes(error?.code))return new CmsError(503,'migration_required','CMS schema migration is missing or incomplete');
  console.error('[CMS v2]', error?.code || error?.message);
  return new CmsError(503,'storage_unavailable','CMS storage is temporarily unavailable');
};
export const safeHandler = action => async (req,res) => {
  try {return await action(req,res);}catch(error){const e=dbError(error);return res.status(e.status).json({success:false,error:{code:e.code,message:e.message,fields:e.fields||{},request_id:randomUUID()}});}
};
const query = async (connection, statement, values=[]) => connection.query(statement, values);
const permitted = async (req, permission) => {
  if(!req.user?.id)fail(401,'unauthorized','A valid admin session is required');
  const [rows]=await pool.query(`SELECT 1 AS ok FROM khudii_admin_user_roles ur JOIN khudii_admin_roles r ON r.id=ur.role_id JOIN khudii_admin_role_permissions rp ON rp.role_id=r.id JOIN khudii_admin_permissions p ON p.id=rp.permission_id WHERE ur.user_id=? AND p.permission_key=? LIMIT 1`,[req.user.id,permission]);
  if(!rows.length)fail(403,'forbidden','Your admin role lacks this permission');
};
const originCheck = req => {
  const origin=req.get('origin');
  if(!origin)return;
  let host;
  try{host=new URL(origin).host.toLowerCase();}catch{fail(403,'invalid_origin','Invalid request origin');}
  const expected=String(req.get('x-forwarded-host')||req.get('host')||'').split(',')[0].toLowerCase();
  const adminOrigin=process.env.ADMIN_SITE_URL;
  if(host!==expected && (!adminOrigin||origin!==adminOrigin))fail(403,'origin_mismatch','Cross-site write request blocked');
};
async function audit(conn,req,resource,id,action,before,after){
  await query(conn,'INSERT INTO khudii_cms_change_history (actor_id,entity_type,entity_id,action,old_value,new_value,request_id) VALUES (?,?,?,?,?,?,?)',[req.user.id,resource,String(id),action,before?JSON.stringify(before):null,after?JSON.stringify(after):null,randomUUID()]);
}
async function recordById(conn,def,id,lock=false){
  const [rows]=await query(conn,`SELECT * FROM ${def.table} WHERE id=? AND deleted_at IS NULL LIMIT 1${lock?' FOR UPDATE':''}`,[id]);
  return rows[0]||null;
}
async function assertAcyclic(conn,def,id,parentId){
  if(!parentId)return;
  if(parentId===id)fail(422,'cycle','A record cannot be its own parent');
  const column=def.table==='khudii_content_categories'?'parent_id':def.table==='khudii_site_pages'?'parent_page_id':def.table==='khudii_page_tabs'?'parent_tab_id':'parent_id';
  const visited=new Set([id]);let cursor=parentId;
  for(let depth=0;cursor&&depth<80;depth++){
    if(visited.has(cursor))fail(422,'cycle','The selected parent creates a cycle');visited.add(cursor);
    const row=await recordById(conn,def,cursor);
    if(!row)fail(422,'parent_missing','Parent record does not exist');
    cursor=row[column];
  }
  if(cursor)fail(422,'nesting_limit','Maximum nesting depth exceeded');
}
const updated=(fields,original,key)=>Object.hasOwn(fields,key)?fields[key]:original?.[key];
async function relationships(conn,resource,fields,original,id){
  const parentKeys={categories:'parent_id',pages:'parent_page_id',tabs:'parent_tab_id',navigation:'parent_id'};
  const def=collection(resource),parentKey=parentKeys[resource];
  if(parentKey && Object.hasOwn(fields,parentKey))await assertAcyclic(conn,def,id,fields[parentKey]);
  if(resource==='pages'){
    const parent=updated(fields,original,'parent_page_id'),nextPath=updated(fields,original,'path');
    if(parent){const p=await recordById(conn,def,parent);if(!p)fail(422,'parent_missing','Parent page not found');if(nextPath&&!nextPath.startsWith(p.path==='/'?'/':p.path+'/'))fail(422,'invalid_hierarchy','A sub-page path must be nested below the parent path');}
    const category=updated(fields,original,'category_id');
    if(category && !(await recordById(conn,collection('categories'),category)))fail(422,'category_missing','The selected category does not exist');
  }
  if(resource==='tabs' || resource==='sections'){
    const pageId=updated(fields,original,'page_id');
    if(!pageId||!(await recordById(conn,collection('pages'),pageId)))fail(422,'page_missing','The selected page does not exist');
    if(resource==='tabs'){
      const parent=updated(fields,original,'parent_tab_id');
      if(parent){const row=await recordById(conn,def,parent);if(!row||row.page_id!==pageId)fail(422,'parent_mismatch','Parent tab must belong to the same page');}
    } else {
      const tab=updated(fields,original,'tab_id');
      if(tab){const row=await recordById(conn,collection('tabs'),tab);if(!row||row.page_id!==pageId)fail(422,'tab_mismatch','Section tab must belong to the same page');}
    }
  }
  if(resource==='navigation'){
    const parent=updated(fields,original,'parent_id');
    if(parent){const row=await recordById(conn,def,parent);if(!row||row.location!==updated(fields,original,'location'))fail(422,'navigation_parent','Menu parent must use the same location');}
    const kind=updated(fields,original,'link_type'),page=updated(fields,original,'page_id'),url=updated(fields,original,'url');
    if(kind==='page' && !page && (Object.hasOwn(fields, 'link_type') || Object.hasOwn(fields, 'page_id') || !original))fail(422,'navigation_target','A page link requires a page');
    if(kind==='group' && (page||url))fail(422,'navigation_target','A group cannot link to a page or URL');
    if(['internal','external','anchor'].includes(kind) && !url && (Object.hasOwn(fields, 'link_type') || Object.hasOwn(fields, 'url') || !original))fail(422,'navigation_target','A URL is required');
    if(page && (Object.hasOwn(fields, 'page_id') || Object.hasOwn(fields, 'link_type') || !original) && !(await recordById(conn,collection('pages'),page)))fail(422,'navigation_page','Target page does not exist');
  }
  if(resource==='seo'){
    const page=updated(fields,original,'page_id');
    if(page){const linked=await recordById(conn,collection('pages'),page);if(!linked)fail(422,'seo_page','SEO page reference does not exist');if(linked.path!==updated(fields,original,'path'))fail(422,'seo_path_mismatch','SEO path must match its linked page');}
  }
}
const revalidate = async (resource,before,after) => {
  try{
    const { revalidatePath }=await import('next/cache');
    for(const p of new Set([before?.path,after?.path,'/']))if(p && p.startsWith('/'))revalidatePath(p);
    if(resource==='navigation')revalidatePath('/', 'layout');
    if(resource==='seo')revalidatePath('/sitemap.xml');
  }catch(error){console.error('[CMS revalidation]',error?.message);}
};
export const listV2 = safeHandler(async(req,res)=>{
  const resource=req.params.resource,def=collection(resource);await permitted(req,def.read);
  const limit=Number(req.query.limit||200);if(!Number.isInteger(limit)||limit<1||limit>500)fail(422,'invalid_limit','Limit must be between 1 and 500');
  const where=['deleted_at IS NULL'],values=[];
  if(['tabs','sections'].includes(resource)&&req.query.page_id){where.push('page_id=?');values.push(idValue(req.query.page_id,false));}
  if(resource==='navigation'&&req.query.location){if(!['header','footer','topbar'].includes(req.query.location))fail(422,'invalid_location','Unknown menu location');where.push('location=?');values.push(req.query.location);}
  const orderBy=resource==='seo'?'id ASC':'sort_order ASC,id ASC';
  const [rows]=await pool.query(`SELECT * FROM ${def.table} WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT ?`,[...values,limit]);
  res.set('Cache-Control','no-store');return res.json({success:true,data:rows});
});
export const getV2 = safeHandler(async(req,res)=>{
  const def=collection(req.params.resource);await permitted(req,def.read);
  const row=await recordById(pool,def,idValue(req.params.id,false));if(!row)fail(404,'not_found','Record not found');
  res.set('Cache-Control','no-store');return res.json({success:true,data:row});
});
export const createV2 = safeHandler(async(req,res)=>{
  const resource=req.params.resource,def=collection(resource);await permitted(req,def.write);originCheck(req);
  const fields=validatePayload(resource,req.body);if(resource==='pages' && fields.status==='published')await permitted(req,'pages.publish');const conn=await pool.getConnection();let saved;
  try{await conn.beginTransaction();await relationships(conn,resource,fields,null,0);
    const columns=Object.keys(fields),params=Object.values(fields);
    if(resource==='pages'){columns.push('created_by','updated_by');params.push(req.user.id,req.user.id);}
    const [result]=await query(conn,`INSERT INTO ${def.table} (${columns.map(k=>'`'+k+'`').join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,params);
    saved=await recordById(conn,def,result.insertId);await audit(conn,req,resource,result.insertId,'create',null,saved);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  await revalidate(resource,null,saved);return res.status(201).json({success:true,data:saved});
});
export const updateV2 = safeHandler(async(req,res)=>{
  const resource=req.params.resource,def=collection(resource);await permitted(req,def.write);originCheck(req);
  const id=idValue(req.params.id,false),fields=validatePayload(resource,req.body,'update');if(resource==='pages' && fields.status==='published')await permitted(req,'pages.publish');
  const version=fields.revision;delete fields.revision;
  const force=Boolean(req.body?.force);
  if(!Object.keys(fields).length)fail(422,'no_changes','No editable values supplied');
  const conn=await pool.getConnection();let before,saved;
  try{await conn.beginTransaction();before=await recordById(conn,def,id,true);if(!before)fail(404,'not_found','Record not found');
    if(!force && version!=null && !['categories','navigation'].includes(resource) && before.revision!=null && Number(before.revision)!==version){
      fail(409,'stale_revision','Record changed since you opened it');
    }
    await relationships(conn,resource,fields,before,id);
    const updates=Object.keys(fields).map(k=>'`'+k+'`=?');const params=Object.values(fields);
    if(resource==='pages'){updates.push('updated_by=?');params.push(req.user.id);}
    if(!['categories','navigation'].includes(resource) && before.revision!=null)updates.push('revision=revision+1');
    await query(conn,`UPDATE ${def.table} SET ${updates.join(',')} WHERE id=?`,[...params,id]);
    saved=await recordById(conn,def,id);await audit(conn,req,resource,id,'update',before,saved);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  await revalidate(resource,before,saved);return res.json({success:true,data:saved});
});
export const deleteV2 = safeHandler(async(req,res)=>{
  const resource=req.params.resource,def=collection(resource);await permitted(req,def.write);originCheck(req);
  const id=idValue(req.params.id,false),conn=await pool.getConnection();let before;
  try{await conn.beginTransaction();before=await recordById(conn,def,id,true);if(!before)fail(404,'not_found','Record not found');
    if(resource==='navigation') {
      await query(conn, `UPDATE ${def.table} SET parent_id=? WHERE parent_id=? AND deleted_at IS NULL`, [before.parent_id || null, id]);
    }
    await query(conn,`UPDATE ${def.table} SET deleted_at=CURRENT_TIMESTAMP WHERE id=?`,[id]);
    await audit(conn,req,resource,id,'delete',before,null);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  await revalidate(resource,before,null);return res.status(200).json({success:true,deleted:id});
});
export const reorderV2 = safeHandler(async(req,res)=>{
  const resource=req.params.resource,def=collection(resource);await permitted(req,def.write);originCheck(req);
  if(resource==='seo')fail(422,'unsupported_order','SEO records do not have a sort order');
  const ids=req.body?.ids;if(!Array.isArray(ids)||!ids.length||ids.length>500)fail(422,'invalid_order','Provide 1–500 ordered IDs');
  const sorted=ids.map(v=>idValue(v,false));if(new Set(sorted).size!==sorted.length)fail(422,'duplicate_order','Duplicate IDs');
  const conn=await pool.getConnection();
  try{await conn.beginTransaction();
    const [items]=await query(conn,`SELECT * FROM ${def.table} WHERE id IN (${ids.map(()=>'?').join(',')}) AND deleted_at IS NULL FOR UPDATE`,sorted);
    if(items.length!==ids.length)fail(404,'missing_items','One or more records not found');
    const loc=(item)=>resource==='navigation'?`${item.location}:${item.parent_id||0}`:resource==='tabs'?`${item.page_id}:${item.parent_tab_id||0}`:resource==='sections'?`${item.page_id}:${item.tab_id||0}`:resource==='pages'?`${item.parent_page_id||0}:${item.category_id||0}`:resource==='categories'?String(item.parent_id||0):resource==='seo'?'seo':'other';
    if(new Set(items.map(loc)).size!==1)fail(422,'mixed_collection','Reorder only items from the same parent/location');
    for(let i=0;i<sorted.length;i++)await query(conn,`UPDATE ${def.table} SET sort_order=? WHERE id=?`,[i,sorted[i]]);
    await audit(conn,req,resource,'batch','reorder',null,{ids:sorted});await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  await revalidate(resource,null,null);return res.json({success:true,ids:sorted});
});
export const publicV2Navigation = safeHandler(async(req,res)=>{
  const location=req.query.location||'header';if(!['header','footer','topbar'].includes(location))fail(422,'invalid_location','Unknown menu location');
  const [rows]=await pool.query(`SELECT n.id,n.item_key,n.parent_id,n.location,n.label,n.link_type,n.url,n.open_new_tab,n.icon_name,p.path AS page_path FROM khudii_navigation_items n LEFT JOIN khudii_site_pages p ON p.id=n.page_id AND p.status='published' AND p.deleted_at IS NULL WHERE n.location=? AND n.is_visible=1 AND n.deleted_at IS NULL AND (n.page_id IS NULL OR p.id IS NOT NULL) ORDER BY n.sort_order,n.id`,[location]);
  res.set('Cache-Control','no-store');return res.json({success:true,data:publicNavigationTree(rows)});
});
export async function findPublishedPage(path){
  const cleanPath=pathValue(path);
  const [[page]]=await pool.query("SELECT * FROM khudii_site_pages WHERE path=? AND status='published' AND deleted_at IS NULL LIMIT 1",[cleanPath]);
  if(!page)return null;
  const [tabs]=await pool.query('SELECT * FROM khudii_page_tabs WHERE page_id=? AND is_published=1 AND deleted_at IS NULL ORDER BY sort_order,id',[page.id]);
  const [sections]=await pool.query('SELECT * FROM khudii_page_sections WHERE page_id=? AND is_published=1 AND deleted_at IS NULL ORDER BY sort_order,id',[page.id]);
  const [[seo]]=await pool.query("SELECT * FROM khudii_page_seo WHERE entity_type='page' AND path=? AND deleted_at IS NULL LIMIT 1",[cleanPath]);
  return {...page,tabs,sections:sections.map(row=>({...row,payload:clean(row.payload)||{}})),seo:seo||null};
}
export const publicV2Page = safeHandler(async(req,res)=>{
  const page=await findPublishedPage(req.query.path||'/');
  if(!page)fail(404,'page_not_found','This page is not published');
  res.set('Cache-Control','no-store');return res.json({success:true,data:page});
});
export const listV2Permissions=safeHandler(async(req,res)=>{
  await permitted(req,'users.manage');
  const [rows]=await pool.query('SELECT id,permission_key,label FROM khudii_admin_permissions ORDER BY permission_key');
  return res.json({success:true,data:rows});
});
export const grantV2Role=safeHandler(async(req,res)=>{
  await permitted(req,'users.manage');originCheck(req);
  const userId=idValue(req.body?.user_id,false),role=String(req.body?.role_key||'');
  if(!/^[a-z_]{2,80}$/.test(role))fail(422,'invalid_role','Invalid role name');
  const [result]=await pool.query('INSERT INTO khudii_admin_user_roles (user_id,role_id,assigned_by) SELECT ?,r.id,? FROM khudii_admin_roles r WHERE r.role_key=? ON DUPLICATE KEY UPDATE assigned_by=VALUES(assigned_by)',[userId,req.user.id,role]);
  if(!result.affectedRows)fail(404,'role_not_found','Role not found');
  return res.json({success:true});
});
export const listV2UserRoles=safeHandler(async(req,res)=>{
  await permitted(req,'users.manage');
  const [roles]=await pool.query('SELECT role_key,label FROM khudii_admin_roles ORDER BY id');
  const [users]=await pool.query("SELECT u.id,u.email,u.status,GROUP_CONCAT(r.role_key ORDER BY r.role_key) AS roles FROM users u LEFT JOIN khudii_admin_user_roles ur ON ur.user_id=u.id LEFT JOIN khudii_admin_roles r ON r.id=ur.role_id WHERE u.deleted_at IS NULL GROUP BY u.id,u.email,u.status ORDER BY u.id LIMIT 300");
  res.set('Cache-Control','no-store');return res.json({success:true,roles,users:users.map(row=>({...row,roles:row.roles?row.roles.split(','):[]}))});
});
export const revokeV2Role=safeHandler(async(req,res)=>{
  await permitted(req,'users.manage');originCheck(req);
  const userId=idValue(req.body?.user_id,false),role=String(req.body?.role_key||'');
  if(!/^[a-z_]{2,80}$/.test(role))fail(422,'invalid_role','Invalid role name');
  const conn=await pool.getConnection();
  try{await conn.beginTransaction();
    const [roles]=await query(conn,'SELECT id FROM khudii_admin_roles WHERE role_key=? LIMIT 1',[role]);
    if(!roles.length)fail(404,'role_not_found','Role not found');
    if(role==='super_admin'){
      const [admins]=await query(conn,"SELECT ur.user_id FROM khudii_admin_user_roles ur JOIN khudii_admin_roles r ON ur.role_id=r.id WHERE r.role_key='super_admin' FOR UPDATE");
      if(admins.length<=1)fail(409,'last_admin','Cannot revoke the only super administrator');
      if(userId===req.user.id)fail(409,'self_revoke','A super administrator cannot revoke their own super administrator role');
    }
    const [result]=await query(conn,'DELETE FROM khudii_admin_user_roles WHERE user_id=? AND role_id=?',[userId,roles[0].id]);
    if(!result.affectedRows)fail(404,'assignment_not_found','Role assignment not found');
    await audit(conn,req,'role_assignment',userId,'delete',{role},null);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  return res.json({success:true});
});

export const duplicateV2Page=safeHandler(async(req,res)=>{
  const def=collection('pages');await permitted(req,def.write);originCheck(req);
  const id=idValue(req.params.id,false),conn=await pool.getConnection();let saved;
  try{
    await conn.beginTransaction();
    const original=await recordById(conn,def,id,true);
    if(!original)fail(404,'not_found','Page not found');
    const suffix=randomUUID().slice(0,8),base=String(original.slug||'page').slice(0,145),slug=`${base}-copy-${suffix}`;
    const path=`/${String(original.path||'/page').replace(/^\/+|\/+$/g,'').slice(0,640)}-copy-${suffix}`;
    const [page]=await query(conn,`INSERT INTO khudii_site_pages
      (page_key,category_id,parent_page_id,title,slug,path,page_kind,status,show_in_menu,sort_order,banner_settings,layout_settings,created_by,updated_by)
      VALUES (?,?,?,?,?,?,?,'draft',0,?,?,?,?,?)`,[
      `${String(original.page_key||'page').slice(0,115)}-copy-${suffix}`,original.category_id,original.parent_page_id,
      `${String(original.title||'Page').slice(0,230)} (Copy)`,slug,path,original.page_kind,original.sort_order,
      original.banner_settings,original.layout_settings,req.user.id,req.user.id]);
    const newId=page.insertId;
    const [tabs]=await query(conn,'SELECT * FROM khudii_page_tabs WHERE page_id=? AND deleted_at IS NULL ORDER BY id',[id]);
    const tabIds=new Map();let pending=[...tabs],iterations=0;
    while(pending.length){
      if(++iterations>tabs.length+1)fail(422,'invalid_tabs','Unable to copy circular tab hierarchy');
      const next=[];
      for(const tab of pending){
        if(tab.parent_tab_id!=null&&!tabIds.has(Number(tab.parent_tab_id))){next.push(tab);continue;}
        const [inserted]=await query(conn,`INSERT INTO khudii_page_tabs
          (page_id,parent_tab_id,tab_key,label,slug,sort_order,is_published,display_mode)
          VALUES (?,?,?,?,?,?,?,?)`,[newId,tab.parent_tab_id==null?null:tabIds.get(Number(tab.parent_tab_id)),tab.tab_key,tab.label,tab.slug,tab.sort_order,tab.is_published,tab.display_mode]);
        tabIds.set(Number(tab.id),inserted.insertId);
      }
      if(next.length===pending.length)fail(422,'invalid_tabs','A parent tab is missing');
      pending=next;
    }
    const [sections]=await query(conn,'SELECT * FROM khudii_page_sections WHERE page_id=? AND deleted_at IS NULL ORDER BY sort_order,id',[id]);
    for(const section of sections){
      const newTabId=section.tab_id==null?null:tabIds.get(Number(section.tab_id));
      if(section.tab_id!=null&&!newTabId)fail(422,'invalid_sections','Section references an unavailable tab');
      await query(conn,`INSERT INTO khudii_page_sections
        (page_id,tab_id,section_key,source_key,section_type,title,payload,sort_order,is_published)
        VALUES (?,?,?,?,?,?,?,?,?)`,[newId,newTabId,section.section_key,section.source_key,section.section_type,section.title,section.payload,section.sort_order,section.is_published]);
    }
    saved=await recordById(conn,def,newId);
    await audit(conn,req,'pages',newId,'create',null,saved);
    await conn.commit();
  }catch(error){await conn.rollback().catch(()=>{});throw error;}finally{conn.release();}
  await revalidate('pages',null,saved);
  res.set('Cache-Control','no-store');return res.status(201).json({success:true,data:saved,message:'Page, tabs and sections duplicated as an unpublished draft'});
});
