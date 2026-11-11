import db from './admin-backend/Database/oldDB.js';
import { CMS_PAGES } from '@/lib/cms-registry';
import {getPublicSeoDefaults} from './public-seo-defaults.js';

const sql=db.promise();
let initPromise;
const site=()=>String(process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
const pathFor=(type,slug)=> type==='organizations'?'/organization/'+slug:type==='blogs'?'/Blog/'+slug:type==='stories'?'/success-stories/'+slug:type==='podcasts'?'/podcast/'+slug:type==='categories'?'/Categories/'+slug:slug;
export function initSeoStorage(){
  if(!initPromise)initPromise=sql.query(`CREATE TABLE IF NOT EXISTS khudii_seo_entities (
    page_path VARCHAR(190) NOT NULL PRIMARY KEY,
    meta_title VARCHAR(120) NOT NULL DEFAULT '',
    meta_description VARCHAR(320) NOT NULL DEFAULT '',
    meta_keywords VARCHAR(500) NOT NULL DEFAULT '',
    og_title VARCHAR(120) NOT NULL DEFAULT '',
    og_description VARCHAR(320) NOT NULL DEFAULT '',
    og_image VARCHAR(1000) NOT NULL DEFAULT '',
    noindex TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(e=>{initPromise=null;throw e});
  return initPromise;
}
const trim=(v,max)=>String(v??'').trim().slice(0,max);
const cleanSlug=v=>/^[a-z0-9][a-z0-9-]{0,179}$/.test(String(v||''));
function issuesFor(item){
  const errors=[];
  const title=(item.meta_title||'').trim(),description=(item.meta_description||'').trim();
  if(!title)errors.push('Missing SEO title');
  else if(title.length<25||title.length>65)errors.push('SEO title length outside 25–65 characters');
  if(!description)errors.push('Missing meta description');
  else if(description.length<70||description.length>165)errors.push('Meta description length outside 70–165 characters');
  if(!item.slug)errors.push('Missing slug');
  if(!item.og_image)errors.push('Missing social image');
  if(item.noindex)errors.push('Noindex enabled');
  return errors;
}
function record(type,src,options={}){
  const id=String(src.id||src.slug||'');
  const slug=String(src.slug||'');
  return {type,id,slug,path:pathFor(type,slug),title:String(src.title||''),meta_title:String(src.meta_title||''),meta_description:String(src.meta_description||''),meta_keywords:String(src.meta_keywords||''),og_title:String(src.og_title||''),og_description:String(src.og_description||''),og_image:String(src.og_image||''),noindex:!!src.noindex,published:src.published!==false,...options};
}
export async function collectSeoEntities(){
  await initSeoStorage();
  const [overrides]=await sql.query('SELECT * FROM khudii_seo_entities');
  const map=new Map(overrides.map(r=>[r.page_path,r]));
  const result=CMS_PAGES.filter(p=>p.slug!=='@global'&&!p.slug.includes('[')).map(p=>record('pages',{
    id:p.slug,slug:p.slug,title:p.title,meta_title:map.get(p.slug)?.meta_title||'',meta_description:map.get(p.slug)?.meta_description||'',meta_keywords:map.get(p.slug)?.meta_keywords||'',og_title:map.get(p.slug)?.og_title||'',og_description:map.get(p.slug)?.og_description||'',og_image:map.get(p.slug)?.og_image||'',noindex:map.get(p.slug)?.noindex||false
  }));
  const tableQueries=[
    ['categories','SELECT id,name AS title,slug,src AS og_image,deletestatus FROM sectors WHERE deletestatus=0 ORDER BY id DESC LIMIT 1500'],
    ['organizations','SELECT id,name AS title,slug,meta_title,meta_description,meta_keywords,partner_image AS og_image,deletestatus FROM items WHERE deletestatus=0 ORDER BY id DESC LIMIT 1500'],
    ['blogs','SELECT id,Name AS title,slug,meta_title,meta_description,meta_keywords,image_path AS og_image,deletestatus FROM document WHERE deletestatus=0 ORDER BY id DESC LIMIT 1500'],
    ['stories','SELECT id,title,slug,meta_title,meta_description,meta_keywords,youtube_id,deletestatus,is_published FROM successstories WHERE deletestatus=0 ORDER BY id DESC LIMIT 1500'],
    ['podcasts',`SELECT p.id,p.title,p.slug,s.seo_title AS meta_title,s.seo_description AS meta_description,s.seo_keywords AS meta_keywords,s.seo_image AS og_image,p.youtube_id,p.is_published FROM podcast p LEFT JOIN podcast_episode_seo s ON s.episode_id=p.id ORDER BY p.id DESC LIMIT 1500`],
  ];
  const warnings=[];
  for(const [type,query] of tableQueries){
    try{
      const [rows]=await sql.query(query);
      for(const row of rows){
        const image=type==='stories'?`https://img.youtube.com/vi/${row.youtube_id}/hqdefault.jpg`:type==='podcasts'?row.og_image||`https://img.youtube.com/vi/${row.youtube_id}/hqdefault.jpg`:row.og_image;
        const override=map.get(pathFor(type,row.slug))||{};
        result.push(record(type,{...row,og_image:override.og_image||image,meta_title:override.meta_title||row.meta_title||'',meta_description:override.meta_description||row.meta_description||'',meta_keywords:override.meta_keywords||row.meta_keywords||'',og_title:override.og_title||'',og_description:override.og_description||'',noindex:!!override.noindex,published:row.deletestatus===undefined?row.is_published!==0:true}));
      }
    }catch(e){warnings.push(`${type}: ${e.code||'query failed'}`);}
  }
  const seenTitles=new Map(),seenDescriptions=new Map();
  for(const row of result){
    row.issues=issuesFor(row);
    for(const [value,seen,label] of [[row.meta_title,seenTitles,'Duplicate SEO title'],[row.meta_description,seenDescriptions,'Duplicate meta description']]){
      const key=value.trim().toLowerCase();if(!key)continue;
      const previous=seen.get(key);
      if(previous){row.issues.push(label);previous.issues.push(label);}else seen.set(key,row);
    }
  }
  for(const row of result){row.issues=[...new Set(row.issues)];row.score=Math.max(0,100-(row.issues.includes('Missing SEO title')?32:0)-(row.issues.some(x=>x.startsWith('SEO title length'))?10:0)-(row.issues.includes('Missing meta description')?32:0)-(row.issues.some(x=>x.startsWith('Meta description length'))?10:0)-(row.issues.includes('Missing slug')?10:0)-(row.issues.includes('Missing social image')?6:0)-(row.issues.filter(x=>x.startsWith('Duplicate')).length*10));}
  return {entities:result,warnings};
}
export async function listSeoIntelligence(req,res){
  try{const {entities,warnings}=await collectSeoEntities();res.set('Cache-Control','no-store');return res.json({entities,warnings,summary:{total:entities.length,missingTitle:entities.filter(x=>!x.meta_title).length,missingDescription:entities.filter(x=>!x.meta_description).length,duplicates:entities.filter(x=>x.issues.some(v=>v.startsWith('Duplicate'))).length,averageScore:entities.length?Math.round(entities.reduce((n,r)=>n+r.score,0)/entities.length):0}});}
  catch(e){console.error('[SEO report]',e);return res.status(503).json({message:'SEO data is unavailable. Check schema migrations.'});}
}
export async function updateSeoEntity(req,res){
  const type=String(req.body?.type||''),id=String(req.body?.id||'');
  const meta_title=trim(req.body?.meta_title,121),meta_description=trim(req.body?.meta_description,321),meta_keywords=trim(req.body?.meta_keywords,501),og_title=trim(req.body?.og_title,121),og_description=trim(req.body?.og_description,321),og_image=trim(req.body?.og_image,1001),noindex=Boolean(req.body?.noindex);
  if(meta_title.length>120||meta_description.length>320||meta_keywords.length>500||og_title.length>120||og_description.length>320||og_image.length>1000)return res.status(422).json({message:'A metadata field exceeds its maximum length'});
  if(og_image&&!(/^https?:\/\//i.test(og_image)||og_image.startsWith('/')&&!og_image.startsWith('//')))return res.status(422).json({message:'Social image must be a valid image URL or site-relative path'});
  try{
    await initSeoStorage();
    if(type==='pages'){
      if(!CMS_PAGES.some(p=>p.slug===id&&!p.slug.includes('[')&&p.slug!=='@global'))return res.status(404).json({message:'Unknown CMS page'});
      await sql.execute('INSERT INTO khudii_seo_entities (page_path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),og_title=VALUES(og_title),og_description=VALUES(og_description),og_image=VALUES(og_image),noindex=VALUES(noindex)',[id,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0]);
    } else {
      const tables={categories:'sectors',organizations:'items',blogs:'document',stories:'successstories',podcasts:'podcast'};
      if(!tables[type]||!/^\d+$/.test(id))return res.status(422).json({message:'Unknown content type or ID'});
      const table=tables[type];
      const [rows]=await sql.execute(`SELECT slug FROM ${table} WHERE id=? ${type==='podcasts'?'':'AND deletestatus=0'} LIMIT 1`,[id]);
      if(!rows.length||!rows[0].slug)return res.status(404).json({message:'Content with a public slug not found'});
      const path=pathFor(type,rows[0].slug);
      if(path.length>190)return res.status(422).json({message:'Content URL exceeds SEO storage limit'});
      if(type==='podcasts'){
        await sql.execute('INSERT INTO podcast_episode_seo (episode_id,seo_title,seo_description,seo_keywords,seo_image) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),seo_keywords=VALUES(seo_keywords),seo_image=VALUES(seo_image)',[id,meta_title,meta_description,meta_keywords,og_image]);
      }else if(type!=='categories'){
        await sql.execute(`UPDATE ${table} SET meta_title=?,meta_description=?,meta_keywords=? WHERE id=?`,[meta_title,meta_description,meta_keywords,id]);
      }
      await sql.execute('INSERT INTO khudii_seo_entities (page_path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),og_title=VALUES(og_title),og_description=VALUES(og_description),og_image=VALUES(og_image),noindex=VALUES(noindex)',[path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0]);
    }
    res.set('Cache-Control','no-store');return res.json({success:true});
  }catch(e){console.error('[SEO save]',e);return res.status(503).json({message:'Unable to save SEO fields'});}
}
export async function publicPageSeo(path){
  if(typeof path!=='string'||!path.startsWith('/'))return null;
  try{await initSeoStorage();const [[row]]=await sql.query('SELECT * FROM khudii_seo_entities WHERE page_path=? LIMIT 1',[path]);return row||null;}catch{return null;}
}
export function pageSeoMetadata(row, fallbackTitle, path, settings={}){
  const origin=String(settings.canonical_domain||site()).replace(/\/+$/,'');
  const image=row?.og_image||settings.og_image||'/Khudii.webp';
  const index=settings.allow_indexing!==false && !row?.noindex && path!=='/auth-callback';
  return {title:row?.meta_title||fallbackTitle,description:row?.meta_description||undefined,keywords:row?.meta_keywords||undefined,
    alternates:{canonical:origin+path},robots:{index,follow:index},
    openGraph:{title:row?.og_title||row?.meta_title||fallbackTitle,description:row?.og_description||row?.meta_description||undefined,url:origin+path,siteName:'Khudii',images:[image]}};
}
export async function generateKhudiiPageMetadata(path,title){
  const [record,settings]=await Promise.all([publicPageSeo(path),getPublicSeoDefaults()]);
  return pageSeoMetadata(record,title,path,settings);
}
export async function generateKhudiiContentMetadata(type,slug){
  if(!cleanSlug(slug))return {title:'Not found',robots:{index:false,follow:false}};
  const tables={categories:['sectors','name'],organizations:['items','name'],blogs:['document','Name'],stories:['successstories','title']};
  if(!tables[type])return null;
  try{
    const [table,col]=tables[type];
    const clause=type==='stories'?' AND is_published=1':'';
    const selectFields=type==='categories'?'':',meta_title,meta_description,meta_keywords';
    const [[row]]=await sql.query(`SELECT ${col} AS title,slug${selectFields} FROM ${table} WHERE slug=? AND deletestatus=0${clause} LIMIT 1`,[slug]);
    if(!row)return {title:'Not found',robots:{index:false,follow:false}};
    const path=pathFor(type,slug);
    const [override,settings]=await Promise.all([publicPageSeo(path),getPublicSeoDefaults()]);
    return pageSeoMetadata({...row,...(override||{}),meta_title:override?.meta_title||row.meta_title,meta_description:override?.meta_description||row.meta_description,meta_keywords:override?.meta_keywords||row.meta_keywords},row.title,path,settings);
  }catch(e){console.error('[content metadata]',e.code||e.message);return {title:'Khudii',robots:{index:false,follow:false}};}
}
export async function getSitemapContentUrls(){
  const settings=await getPublicSeoDefaults();
  const base=(settings.canonical_domain||site()).replace(/\/+$/,''),urls=[];
  if(settings.allow_indexing===false||settings.auto_sitemap===false)return [];
  const [overrides]=await sql.query('SELECT page_path,noindex FROM khudii_seo_entities').catch(()=>[[]]);const excluded=new Set(overrides.filter(v=>v.noindex).map(v=>v.page_path));
  for(const page of CMS_PAGES){if(page.slug!=='@global'&&!page.slug.includes('[')&&!excluded.has(page.slug))urls.push({url:base+page.slug,changeFrequency:'weekly',priority:page.slug==='/'?1:0.65});}
  for(const [table,type] of [['items','organizations'],['document','blogs'],['successstories','stories'],['podcast','podcasts'],['sectors','categories']]){
    try{
      const where=type==='podcasts'?'is_published=1':type==='stories'?'deletestatus=0 AND is_published=1':'deletestatus=0';
      const [rows]=await sql.query(`SELECT slug FROM ${table} WHERE ${where} AND slug IS NOT NULL`);
      for(const row of rows)if(cleanSlug(row.slug)&&!excluded.has(pathFor(type,row.slug)))urls.push({url:base+pathFor(type,row.slug),changeFrequency:'monthly',priority:0.55});
    }catch(e){console.error('[sitemap]',table,e.code||e.message);}
  }
  return urls;
}
export async function getSeoAuditHistory(req,res){
  try{
    const [items]=await sql.query('SELECT id,total_records,average_score,missing_titles,missing_descriptions,duplicate_metadata,noindex_count,created_at FROM khudii_seo_audit_snapshots ORDER BY created_at DESC,id DESC LIMIT 200');
    res.set('Cache-Control','no-store');
    return res.json({success:true,items:items.reverse()});
  }catch(e){console.error('[SEO audit history]',e);return res.status(503).json({message:'SEO snapshot history is unavailable. Apply the forms and SEO migration.'});}
}
export async function captureSeoAuditSnapshot(req,res){
  try{
    const {entities,warnings}=await collectSeoEntities();
    if(warnings.length)return res.status(503).json({message:'SEO scan could not read all content tables. No incomplete snapshot was recorded.',warnings});
    const stats={
      total_records:entities.length,
      average_score:entities.length?Number((entities.reduce((n,x)=>n+x.score,0)/entities.length).toFixed(2)):0,
      missing_titles:entities.filter(x=>!x.meta_title).length,
      missing_descriptions:entities.filter(x=>!x.meta_description).length,
      duplicate_metadata:entities.filter(x=>x.issues.some(v=>v.startsWith('Duplicate'))).length,
      noindex_count:entities.filter(x=>x.noindex).length,
    };
    await sql.query('INSERT INTO khudii_seo_audit_snapshots(total_records,average_score,missing_titles,missing_descriptions,duplicate_metadata,noindex_count) VALUES (?,?,?,?,?,?)',Object.values(stats));
    return res.status(201).json({success:true,summary:stats});
  }catch(e){console.error('[SEO snapshot]',e);return res.status(503).json({message:'SEO snapshot could not be saved. Check the database migration.'});}
}
