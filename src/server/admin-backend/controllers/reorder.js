import db from '../Database/oldDB.js';
const ALLOWED = {certifications:{table:'certifications',column:'display_order'},successstories:{table:'successstories',column:'display_order',where:'deletestatus=0'}};
export async function reorderAdminCollection(req,res) {
  const config=ALLOWED[req.params.collection],ids=req.body?.ids;
  if(!config)return res.status(404).json({message:'Unknown reorderable collection'});
  if(!Array.isArray(ids)||ids.length>2000||ids.some(v=>!Number.isSafeInteger(v)||v<1)||new Set(ids).size!==ids.length)return res.status(422).json({message:'Provide a unique ordered list of record IDs'});
  const pool=db.promise();let conn;
  try {
    conn=await pool.getConnection();await conn.beginTransaction();
    const [rows]=await conn.query(`SELECT id FROM \`${config.table}\` ${config.where?'WHERE '+config.where:''} FOR UPDATE`);
    if(rows.length!==ids.length||rows.some(r=>!ids.includes(Number(r.id)))){await conn.rollback();return res.status(409).json({message:'The record list changed. Refresh and try again.'});}
    for(let i=0;i<ids.length;i++)await conn.query(`UPDATE \`${config.table}\` SET \`${config.column}\`=? WHERE id=?`,[i+1,ids[i]]);
    await conn.commit();return res.json({success:true});
  }catch(e){if(conn)await conn.rollback();console.error('[admin reorder]',e);return res.status(500).json({message:'Could not update display order'});}
  finally{conn?.release();}
}
