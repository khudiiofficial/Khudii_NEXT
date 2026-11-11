import db from './admin-backend/Database/oldDB.js';
import { KHUDII_FORM_KEYS } from '../lib/khudii-form-catalog.js';
const sql=db.promise();
const INBOX_QUERIES={
  contact:'SELECT id,name,email,subject AS topic,message,created_at FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
  inquiry:'SELECT id,name,email,org_id AS topic,message,created_at FROM contact_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
  donate:"SELECT id,CONCAT(firstName,' ',lastName) AS name,email,CONCAT(donationType,' ',donationAmount) AS topic,message,created_at FROM donations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100",
  volunteer:'SELECT id,name,email,city AS topic,message,created_at FROM volunteers WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
  jobs:'SELECT id,name,email,interestedPost AS topic,message,created_at FROM job_applications WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
  story:'SELECT id,name,email,entityType AS topic,story AS message,created_at FROM contribute_stories WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
  organization:'SELECT id,organization_name AS name,email_address AS email,contact_person_name AS topic,CONCAT("Phone: ",contact_person_mobile) AS message,created_at FROM organization_submissions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
};
function errorResponse(res,e){console.error('[Khudii Forms]',e);return res.status(500).json({success:false,message:'Unable to load form records from the database.'});}
export async function listFormsInbox(req,res){
  const filter=String(req.query.form||'all');
  if(filter!=='all'&&!KHUDII_FORM_KEYS.includes(filter))return res.status(422).json({message:'Invalid form filter'});
  const keys=filter==='all'?KHUDII_FORM_KEYS:[filter];
  try{
    const result=await Promise.allSettled(keys.map(async key=>{
      const [rows]=await sql.query(INBOX_QUERIES[key]);
      return rows.map(row=>({...row,id:Number(row.id),form_key:key,name:String(row.name||'').slice(0,180),email:String(row.email||'').slice(0,255),topic:String(row.topic||'').slice(0,250),message:String(row.message||'').slice(0,4000)}));
    }));
    const warnings=[];
    const data=result.flatMap((r,index)=>{if(r.status==='fulfilled')return r.value;warnings.push(`Unable to read ${keys[index]} submissions`);console.error('[Forms inbox query]',keys[index],r.reason);return [];});
    if(result.every(r=>r.status==='rejected'))return res.status(503).json({success:false,message:'The submission database is temporarily unavailable',warnings});
    data.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
    const items=data.slice(0,200);
    try{
      const [states]=await sql.query('SELECT form_key,submission_id,is_read FROM khudii_form_inbox_state WHERE form_key IN (?)',[keys]);
      const state=new Map(states.map(s=>[`${s.form_key}:${s.submission_id}`,Boolean(s.is_read)]));
      for(const item of items)item.is_read=state.get(`${item.form_key}:${item.id}`)||false;
    }catch(e){warnings.push('Inbox read states unavailable. Apply the forms migration.');}
    return res.json({success:true,items,total:items.length,warnings});
  }catch(e){return errorResponse(res,e);}
}
export async function updateFormInboxState(req,res){
  const key=String(req.body?.form_key||'');
  const id=Number(req.body?.id);
  if(!KHUDII_FORM_KEYS.includes(key)||!Number.isSafeInteger(id)||id<1||typeof req.body?.is_read!=='boolean')return res.status(422).json({message:'Invalid form, record, or read state'});
  try{
    const [existing]=await sql.query(`SELECT id FROM (${INBOX_QUERIES[key].replace(' ORDER BY created_at DESC LIMIT 100','')}) AS submissions WHERE id=? LIMIT 1`,[id]);
    if(!existing.length)return res.status(404).json({message:'Submission not found'});
    await sql.query('INSERT INTO khudii_form_inbox_state(form_key,submission_id,is_read) VALUES (?,?,?) ON DUPLICATE KEY UPDATE is_read=VALUES(is_read)',[key,id,req.body.is_read?1:0]);
    return res.json({success:true});
  }catch(e){return errorResponse(res,e);}
}
export async function listFormEmailLogs(req,res){
  const key=String(req.query.form||'all');
  if(key!=='all'&&!KHUDII_FORM_KEYS.includes(key))return res.status(422).json({message:'Invalid form filter'});
  try{
    const [items]=key==='all'?await sql.query('SELECT * FROM khudii_email_delivery_logs ORDER BY id DESC LIMIT 200'):await sql.query('SELECT * FROM khudii_email_delivery_logs WHERE form_key=? ORDER BY id DESC LIMIT 200',[key]);
    res.json({success:true,items});
  }catch(e){return errorResponse(res,e);}
}
