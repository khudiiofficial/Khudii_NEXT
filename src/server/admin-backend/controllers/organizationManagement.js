import db from '../Database/oldDB.js';
const pool=db.promise();

export async function listOrderedOrganizations(req,res){
  try{
    const [rows]=await pool.query(`SELECT i.id,i.name,i.description,i.category,i.slug,i.introductory_image_path,i.deletestatus,i.status,i.created_at,o.sort_order
      FROM items i LEFT JOIN khudii_content_order o ON o.entity_type='organizations' AND o.entity_id=i.id
      WHERE COALESCE(i.deletestatus,0)=0 AND i.deleted_at IS NULL
      ORDER BY CASE WHEN o.sort_order IS NULL THEN 1 ELSE 0 END,o.sort_order ASC,i.id DESC LIMIT 2000`);
    res.set('Cache-Control','no-store');return res.json({success:true,items:rows});
  }catch(error){console.error('[organizations list]',error?.code||error?.message);return res.status(503).json({success:false,message:'Could not load organizations. Import khudii_admin_upgrade.sql before using the new ordering feature.'});}
}
export async function reorderOrganizations(req,res){
  const ids=req.body?.ids;
  if(!Array.isArray(ids)||ids.length===0||ids.length>2000||ids.some(id=>!Number.isSafeInteger(id)||id<1)||new Set(ids).size!==ids.length)
    return res.status(422).json({success:false,message:'Provide unique numeric organization IDs'});
  let conn;
  try{
    conn=await pool.getConnection();await conn.beginTransaction();
    const [rows]=await conn.query('SELECT id FROM items WHERE COALESCE(deletestatus,0)=0 AND deleted_at IS NULL FOR UPDATE');
    const allowed=new Set(rows.map(row=>Number(row.id)));
    if(rows.length!==ids.length||ids.some(id=>!allowed.has(id))){await conn.rollback();return res.status(409).json({success:false,message:'Organization list changed. Refresh before reordering.'});}
    for(let i=0;i<ids.length;i++){
      await conn.query(`INSERT INTO khudii_content_order(entity_type,entity_id,sort_order) VALUES ('organizations',?,?) ON DUPLICATE KEY UPDATE sort_order=VALUES(sort_order)`,[ids[i],i+1]);
    }
    await conn.commit();return res.json({success:true,ids});
  }catch(error){await conn?.rollback().catch(()=>{});console.error('[organizations reorder]',error?.code||error?.message);return res.status(503).json({success:false,message:'Could not save ordering. Check that khudii_admin_upgrade.sql has been imported.'});}
  finally{conn?.release();}
}

const parseOrgId=value=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null;

export async function setOrganizationVisibility(req,res){
  const id=parseOrgId(req.params.id);
  if(!id||typeof req.body?.visible!=='boolean')return res.status(422).json({success:false,message:'Valid organization ID and visible boolean are required'});
  try{
    const [result]=await pool.query('UPDATE items SET status=? WHERE id=? AND COALESCE(deletestatus,0)=0 AND deleted_at IS NULL',[req.body.visible?1:0,id]);
    if(!result.affectedRows)return res.status(404).json({success:false,message:'Organization not found'});
    res.set('Cache-Control','no-store');return res.json({success:true,id,visible:req.body.visible});
  }catch(error){console.error('[organization visibility]',error?.code||error?.message);return res.status(500).json({success:false,message:'Unable to update organization visibility'});}
}

export async function duplicateOrganization(req,res){
  const id=parseOrgId(req.params.id);
  if(!id)return res.status(422).json({success:false,message:'Invalid organization ID'});
  let conn;
  try{
    conn=await pool.getConnection();await conn.beginTransaction();
    const [[original]]=await conn.query('SELECT * FROM items WHERE id=? AND COALESCE(deletestatus,0)=0 AND deleted_at IS NULL FOR UPDATE',[id]);
    if(!original){await conn.rollback();return res.status(404).json({success:false,message:'Organization not found'});}
    const newSlug=`${String(original.slug||'organization').replace(/[^a-z0-9-]/gi,'').slice(0,90)||'organization'}-copy-${Date.now().toString(36)}`;
    const [result]=await conn.query(`INSERT INTO items (name,description,youtube_video_url,introductory_image_path,category,deletestatus,slug,meta_title,meta_description,meta_keywords,search_tags,partner_image,status)
      SELECT CONCAT(LEFT(name,220),' (Copy)'),description,youtube_video_url,introductory_image_path,category,0,?,meta_title,meta_description,meta_keywords,search_tags,partner_image,0 FROM items WHERE id=?`,[newSlug,id]);
    const newId=result.insertId;
    await conn.query(`INSERT INTO item_images(item_id,image_path) SELECT ?,image_path FROM item_images WHERE item_id=? AND deleted_at IS NULL`,[newId,id]);
    await conn.query(`INSERT INTO item_urls(item_id,urls) SELECT ?,urls FROM item_urls WHERE item_id=? AND deleted_at IS NULL`,[newId,id]);
    await conn.query(`INSERT INTO icons(item_id,name,svg,qty) SELECT ?,name,svg,qty FROM icons WHERE item_id=? AND deleted_at IS NULL`,[newId,id]);
    await conn.query(`INSERT INTO socials(item_id,phone,facebook,twitter,instagram,location,googlemap,Mobile_number,website,youtubechannel,email,linkedin)
      SELECT ?,phone,facebook,twitter,instagram,location,googlemap,Mobile_number,website,youtubechannel,email,linkedin FROM socials WHERE item_id=? AND deleted_at IS NULL`,[newId,id]);
    await conn.commit();res.set('Cache-Control','no-store');return res.status(201).json({success:true,id:newId,slug:newSlug,message:'Organization duplicated as hidden draft'});
  }catch(error){await conn?.rollback().catch(()=>{});console.error('[organization duplicate]',error?.code||error?.message);return res.status(500).json({success:false,message:'Unable to duplicate organization'});}
  finally{conn?.release();}
}
