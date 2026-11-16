import db from './admin-backend/Database/oldDB.js';
import { KHUDII_FORM_KEYS } from '../lib/khudii-form-catalog.js';
const sql=db.promise();
const INBOX_QUERIES={
  contact:'SELECT id,name,email,phone,subject AS topic,message,created_at FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
  inquiry:'SELECT id,name,email,phone,org_id AS topic,message,created_at FROM contact_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
  donate:"SELECT id,CONCAT(firstName,' ',lastName) AS name,email,phone,CONCAT(donationType,' ',donationAmount) AS topic,message,created_at FROM donations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500",
  volunteer:'SELECT id,name,email,phone,city AS topic,message,created_at FROM volunteers WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
  jobs:'SELECT id,name,email,phone,interestedPost AS topic,message,created_at FROM job_applications WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
  story:'SELECT id,name,email,phone,entityType AS topic,story AS message,created_at FROM contribute_stories WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
  organization:'SELECT id,organization_name AS name,email_address AS email,contact_person_mobile AS phone,contact_person_name AS topic,CONCAT("Phone: ",contact_person_mobile) AS message,created_at FROM organization_submissions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 500',
};
function errorResponse(res,e){console.error('[Khudii Forms]',e);return res.status(500).json({success:false,message:'Unable to load form records from the database.'});}

export async function listFormsInbox(req,res){
  const filter=String(req.query.form||'all');
  if(filter!=='all'&&!KHUDII_FORM_KEYS.includes(filter))return res.status(422).json({message:'Invalid form filter'});
  const keys=filter==='all'?KHUDII_FORM_KEYS:[filter];
  try{
    const result=await Promise.allSettled(keys.map(async key=>{
      const [rows]=await sql.query(INBOX_QUERIES[key]);
      return rows.map(row=>({...row,id:Number(row.id),form_key:key,name:String(row.name||'').slice(0,180),email:String(row.email||'').slice(0,255),phone:String(row.phone||'').slice(0,50),topic:String(row.topic||'').slice(0,250),message:String(row.message||'').slice(0,4000)}));
    }));
    const warnings=[];
    const data=result.flatMap((r,index)=>{if(r.status==='fulfilled')return r.value;warnings.push(`Unable to read ${keys[index]} submissions`);console.error('[Forms inbox query]',keys[index],r.reason);return [];});
    if(result.every(r=>r.status==='rejected'))return res.status(503).json({success:false,message:'The submission database is temporarily unavailable',warnings});
    data.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
    const items=data.slice(0,500);
    try{
      const [states]=await sql.query('SELECT form_key,submission_id,is_read,status,remarks,remarks_type FROM khudii_form_inbox_state WHERE form_key IN (?)',[keys]);
      const state=new Map(states.map(s=>[`${s.form_key}:${s.submission_id}`,s]));
      for(const item of items){
        const s=state.get(`${item.form_key}:${item.id}`);
        item.is_read=Boolean(s?.is_read);
        item.status=s?.status||'new';
        item.remarks=s?.remarks||'';
        item.remarks_type=s?.remarks_type||'success';
      }
    }catch(e){warnings.push('Inbox read states unavailable. Apply the forms migration.');}
    return res.json({success:true,items,total:items.length,warnings});
  }catch(e){return errorResponse(res,e);}
}

export async function updateFormInboxState(req,res){
  const key=String(req.body?.form_key||'');
  const id=Number(req.body?.id);
  const hasRead=typeof req.body?.is_read==='boolean';
  const hasStatus=typeof req.body?.status==='string';
  const hasRemarks=typeof req.body?.remarks==='string';
  const hasRemarksType=typeof req.body?.remarks_type==='string';
  if(!KHUDII_FORM_KEYS.includes(key)||!Number.isSafeInteger(id)||id<1||(!hasRead&&!hasStatus&&!hasRemarks&&!hasRemarksType))return res.status(422).json({message:'Invalid form, record, or update payload'});
  try{
    const [existing]=await sql.query(`SELECT id FROM (${INBOX_QUERIES[key].replace(' ORDER BY created_at DESC LIMIT 500','')}) AS submissions WHERE id=? LIMIT 1`,[id]);
    if(!existing.length)return res.status(404).json({message:'Submission not found'});

    const is_read=hasRead?(req.body.is_read?1:0):0;
    const status=hasStatus?String(req.body.status).slice(0,40):'new';
    const remarks=hasRemarks?String(req.body.remarks).slice(0,2000):'';
    const remarks_type=['success','warning','error'].includes(req.body?.remarks_type)?req.body.remarks_type:'success';

    await sql.query(`INSERT INTO khudii_form_inbox_state (form_key, submission_id, is_read, status, remarks, remarks_type)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_read = IF(? IS NOT NULL, VALUES(is_read), is_read),
        status = IF(? != '', VALUES(status), status),
        remarks = VALUES(remarks),
        remarks_type = VALUES(remarks_type),
        updated_at = CURRENT_TIMESTAMP`,
      [key, id, is_read, status, remarks, remarks_type, hasRead ? 1 : null, hasStatus ? status : '']);
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

const INBOX_DETAIL_TABLES={contact:'contact_messages',inquiry:'contact_inquiries',donate:'donations',volunteer:'volunteers',jobs:'job_applications',story:'contribute_stories',organization:'organization_submissions'};
export async function getFormInboxDetail(req,res){
 const key=String(req.params.form||''),id=Number(req.params.id);
 if(!Object.hasOwn(INBOX_DETAIL_TABLES,key)||!Number.isSafeInteger(id)||id<1)return res.status(422).json({message:'Invalid submission identifier'});
 try{
  const [records]=await sql.query(`SELECT * FROM ${INBOX_DETAIL_TABLES[key]} WHERE id=? AND deleted_at IS NULL LIMIT 1`,[id]);
  if(!records.length)return res.status(404).json({message:'Submission not found'});
  const data=Object.entries(records[0]).filter(([k,v])=>!['deleted_at','updated_at','status'].includes(k)&&v!==null).map(([key,value])=>({key,label:key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase()),value:String(value).slice(0,8000)}));
  res.set('Cache-Control','no-store');return res.json({success:true,form:key,fields:data});
 }catch(e){return errorResponse(res,e)}
}

export async function deleteFormSubmission(req,res){
  const key=String(req.params.form||req.body?.form_key||''),id=Number(req.params.id||req.body?.id);
  if(!Object.hasOwn(INBOX_DETAIL_TABLES,key)||!Number.isSafeInteger(id)||id<1)return res.status(422).json({message:'Invalid submission identifier'});
  try{
    await sql.query(`UPDATE ${INBOX_DETAIL_TABLES[key]} SET deleted_at=CURRENT_TIMESTAMP WHERE id=?`,[id]);
    res.set('Cache-Control','no-store');return res.json({success:true,message:'Submission deleted'});
  }catch(e){return errorResponse(res,e)}
}

export async function getFormsTimeline(req,res){
  const days=[7,14,30,90,180,365].includes(Number(req.query.days))?Number(req.query.days):30;
  try{
    const dates=[];
    const dateMap=new Map();
    const now=new Date();
    for(let i=days-1;i>=0;i--){
      const d=new Date(now.getTime()-i*86400000);
      const ds=d.toISOString().slice(0,10);
      const parts=ds.split('-');
      const label=`${parts[1]}-${parts[2]}`;
      const entry={date:ds,label,contact:0,inquiry:0,donate:0,volunteer:0,jobs:0,story:0,organization:0};
      dates.push(entry);
      dateMap.set(ds,entry);
    }
    const fromDate=dates[0]?.date||'';
    const toDate=dates[dates.length-1]?.date||'';
    const tables={contact:'contact_messages',inquiry:'contact_inquiries',donate:'donations',volunteer:'volunteers',jobs:'job_applications',story:'contribute_stories',organization:'organization_submissions'};
    const totals={contact:0,inquiry:0,donate:0,volunteer:0,jobs:0,story:0,organization:0};
    await Promise.all(Object.entries(tables).map(async([key,table])=>{
      try{
        const [rows]=await sql.query(`SELECT DATE(created_at) AS day, COUNT(*) AS count FROM ${table} WHERE deleted_at IS NULL AND DATE(created_at) >= ? GROUP BY DATE(created_at)`,[fromDate]);
        for(const row of rows){
          const dayStr=row.day instanceof Date?row.day.toISOString().slice(0,10):String(row.day).slice(0,10);
          const count=Number(row.count)||0;
          totals[key]+=count;
          if(dateMap.has(dayStr)){
            dateMap.get(dayStr)[key]=count;
          }
        }
      }catch(err){console.warn(`[Forms timeline ${key}]`,err?.message);}
    }));
    res.set('Cache-Control','no-store');
    return res.json({success:true,days,from:fromDate,to:toDate,totals,timeline:dates});
  }catch(e){return errorResponse(res,e);}
}
