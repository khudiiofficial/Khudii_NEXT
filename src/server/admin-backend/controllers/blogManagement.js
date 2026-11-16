import db from '../Database/oldDB.js';
const pool = db.promise();
const validId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
const respondError = (res, error, message = 'Blog operation failed') => {
  console.error('[admin blogs]', error?.code || error?.message);
  return res.status(error?.code === 'ER_BAD_FIELD_ERROR' ? 503 : 500).json({success:false,message:error?.code === 'ER_BAD_FIELD_ERROR' ? 'Run the Khudii admin upgrade SQL migration before deploying this code.' : message});
};

export async function listManageableBlogs(req, res) {
  try {
    const [rows] = await pool.query(`SELECT id,Name,intro,image_path,slug,meta_title,meta_description,meta_keywords,
       status,sort_order,created_at,updated_at FROM document
       WHERE COALESCE(deletestatus,0)=0 AND deleted_at IS NULL
       ORDER BY sort_order ASC,id DESC LIMIT 1000`);
    res.set('Cache-Control','no-store');
    return res.json({success:true,items:rows});
  } catch(e) {return respondError(res,e,'Unable to list blogs');}
}

export async function publishBlog(req, res) {
  const id=validId(req.params.id),status=req.body?.published;
  if(!id||typeof status!=='boolean')return res.status(422).json({success:false,message:'Supply a valid blog ID and published boolean'});
  try {
    const [result]=await pool.query('UPDATE document SET status=? WHERE id=? AND COALESCE(deletestatus,0)=0 AND deleted_at IS NULL',[status?1:0,id]);
    if(!result.affectedRows)return res.status(404).json({success:false,message:'Blog not found'});
    return res.json({success:true,id,published:status});
  }catch(e){return respondError(res,e,'Unable to change blog status');}
}

export async function reorderBlogs(req, res) {
  const ids=req.body?.ids;
  if(!Array.isArray(ids)||!ids.length||ids.length>1000||ids.some(x=>!validId(x))||new Set(ids.map(Number)).size!==ids.length)
    return res.status(422).json({success:false,message:'Provide a unique non-empty list of blog IDs'});
  let conn;
  try {
    conn=await pool.getConnection();await conn.beginTransaction();
    const [rows]=await conn.query('SELECT id FROM document WHERE COALESCE(deletestatus,0)=0 AND deleted_at IS NULL FOR UPDATE');
    const allowed=new Set(rows.map(x=>Number(x.id)));
    if(ids.length!==allowed.size||ids.some(id=>!allowed.has(Number(id)))){
      await conn.rollback();return res.status(409).json({success:false,message:'Blog list changed. Refresh before reordering.'});
    }
    for(let i=0;i<ids.length;i++)await conn.query('UPDATE document SET sort_order=? WHERE id=?',[i+1,Number(ids[i])]);
    await conn.commit();return res.json({success:true,ids});
  }catch(e){if(conn)await conn.rollback().catch(()=>{});return respondError(res,e,'Unable to reorder blogs');}
  finally{conn?.release();}
}

export async function duplicateBlog(req,res) {
  const id=validId(req.params.id);
  if(!id)return res.status(422).json({success:false,message:'Invalid blog ID'});
  let conn;
  try {
    conn=await pool.getConnection();await conn.beginTransaction();
    const [[original]]=await conn.query('SELECT * FROM document WHERE id=? AND COALESCE(deletestatus,0)=0 AND deleted_at IS NULL FOR UPDATE',[id]);
    if(!original){await conn.rollback();return res.status(404).json({success:false,message:'Original blog was not found'});}
    // The original image is intentionally referenced, never deleted or re-uploaded.
    const safeSlug=String(original.slug||'blog').replace(/[^a-z0-9-]/gi,'').slice(0,100)||'blog';
    const nextSlug=`${safeSlug}-copy-${Date.now().toString(36)}`;
    const [doc]=await conn.query(`INSERT INTO document
      (Name,intro,conclusion,image_path,slug,meta_title,meta_description,meta_keywords,deletestatus,status,sort_order)
      VALUES (?,?,?,?,?,?,?,?,0,0,0)`,
      [`${String(original.Name||'Blog').slice(0,200)} (Copy)`,original.intro,original.conclusion,original.image_path,nextSlug,
       original.meta_title,original.meta_description,original.meta_keywords]);
    const newId=doc.insertId;
    const [sections]=await conn.query('SELECT * FROM documentarr WHERE document_id=? AND deleted_at IS NULL ORDER BY id',[id]);
    for(const section of sections){
      const [copy]=await conn.query('INSERT INTO documentarr(document_id,heading,start,bullet_header,end,status) VALUES (?,?,?,?,?,?)',
        [newId,section.heading,section.start,section.bullet_header,section.end,section.status]);
      const [bullets]=await conn.query('SELECT bullet,status FROM documentarrbullets WHERE arr_id=? AND deleted_at IS NULL ORDER BY id',[section.id]);
      for(const bullet of bullets)await conn.query('INSERT INTO documentarrbullets(arr_id,bullet,status) VALUES (?,?,?)',[copy.insertId,bullet.bullet,bullet.status]);
    }
    const [ngos]=await conn.query('SELECT id,intro,status FROM ngos WHERE document_id=? AND deleted_at IS NULL',[id]);
    for(const ngo of ngos){
      const [newNgo]=await conn.query('INSERT INTO ngos(document_id,intro,status) VALUES (?,?,?)',[newId,ngo.intro,ngo.status]);
      const [categories]=await conn.query('SELECT id,h1,status FROM ngosarr WHERE ngos_id=? AND deleted_at IS NULL ORDER BY id',[ngo.id]);
      for(const category of categories){
        const [copy]=await conn.query('INSERT INTO ngosarr(ngos_id,h1,status) VALUES (?,?,?)',[newNgo.insertId,category.h1,category.status]);
        const [values]=await conn.query('SELECT value,status FROM ngosarrof WHERE ngos_arr_id=? AND deleted_at IS NULL ORDER BY id',[category.id]);
        for(const row of values)await conn.query('INSERT INTO ngosarrof(ngos_arr_id,value,status) VALUES (?,?,?)',[copy.insertId,row.value,row.status]);
      }
    }
    await conn.commit();return res.status(201).json({success:true,id:newId,slug:nextSlug,message:'Blog duplicated as an unpublished draft'});
  }catch(e){if(conn)await conn.rollback().catch(()=>{});return respondError(res,e,'Unable to duplicate blog');}
  finally{conn?.release();}
}
