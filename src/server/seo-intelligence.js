import db from './admin-backend/Database/oldDB.js';
import { CMS_PAGES } from '@/lib/cms-registry';
import {getPublicSeoDefaults} from './public-seo-defaults.js';
import { formatSeoTitle, formatSeoDescription } from '@/lib/seo.js';

const sql=db.promise();
let initPromise;
let extensionPromise;
function initSeoExtensions(){
  if(!extensionPromise)extensionPromise=sql.query(`CREATE TABLE IF NOT EXISTS khudii_seo_extensions (
    page_path VARCHAR(190) NOT NULL PRIMARY KEY,
    canonical_url VARCHAR(1000) NOT NULL DEFAULT '',
    geo_summary TEXT,
    geo_entities TEXT,
    aeo_faqs LONGTEXT,
    alt_texts LONGTEXT,
    json_ld LONGTEXT,
    robots_nofollow TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(e=>{extensionPromise=null;throw e});
  return extensionPromise;
}
function decodeJson(value,fallback){try{const obj=typeof value==='string'?JSON.parse(value):value;return obj??fallback}catch{return fallback}}
function normalizeExtension(body){
  const canonical_url=trim(body.canonical_url || body.canonicalUrl,1000);
  if(canonical_url&&!/^https?:\/\/[^\s]+$/i.test(canonical_url))throw new Error('Canonical URL must use HTTP or HTTPS');
  const json_ld_raw = body.json_ld || body.jsonLdPayload || body.jsonLdSchema;
  let json_ld = '';
  if (json_ld_raw) {
    const jsonStr = typeof json_ld_raw === 'object' ? JSON.stringify(json_ld_raw, null, 2) : String(json_ld_raw).trim();
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !parsed['@context']) {
          throw new Error('JSON-LD must be a valid schema.org object');
        }
        json_ld = jsonStr.slice(0, 50000);
      } catch (err) {
        throw new Error('Invalid JSON-LD syntax: ' + err.message);
      }
    }
  }
  const rawFaqs = body.aeo_faqs || body.faqs || [];
  let aeo_faqs = [];
  if (Array.isArray(rawFaqs)) {
    aeo_faqs = rawFaqs.slice(0, 30).map(x => ({ question: trim(x.question, 500), answer: trim(x.answer, 4000) })).filter(x => x.question && x.answer);
  } else if (typeof rawFaqs === 'string') {
    const regex = /(?:^|\n)\s*(?:Q|Question):\s*(.+?)\s*(?:\n|\r\n)\s*(?:A|Answer):\s*([\s\S]+?)(?=(?:\n\s*(?:Q|Question):|$))/gi;
    let m;
    while ((m = regex.exec(rawFaqs)) !== null) {
      if (m[1]?.trim() && m[2]?.trim()) aeo_faqs.push({ question: trim(m[1], 500), answer: trim(m[2], 4000) });
    }
  }
  const rawAlts = body.alt_texts || body.imageAlts || [];
  let alt_texts = [];
  if (Array.isArray(rawAlts)) {
    alt_texts = rawAlts.slice(0, 60).map(x => ({ url: trim(x.url || x.key, 1000), alt: trim(x.alt, 500), label: trim(x.label, 120), key: trim(x.key, 80) })).filter(x => x.url || x.alt);
  } else if (typeof rawAlts === 'object' && rawAlts !== null) {
    alt_texts = Object.entries(rawAlts).map(([key, alt]) => ({ url: key, key, alt: trim(alt, 500), label: key }));
  }
  return {canonical_url,geo_summary:trim(body.geo_summary || body.geoSummary,7000),geo_entities:trim(body.geo_entities || body.geoClusters,4000),aeo_faqs,alt_texts,json_ld,robots_nofollow:Boolean(body.robots_nofollow ?? body.noFollow)};
}

const site=()=>String(process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
const pathFor=(type,slug)=> type==='organizations'?'/organization/'+slug:type==='blogs'?'/blog/'+slug:type==='stories'?'/success-stories/'+slug:type==='podcasts'?'/podcast/'+slug:type==='categories'?'/categories/'+slug:slug;
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
  let extensions=new Map();
  try{await initSeoExtensions();const [ext]=await sql.query('SELECT * FROM khudii_seo_extensions');extensions=new Map(ext.map(r=>[r.page_path,r]));}catch(e){console.error('[SEO extensions]',e?.code||e?.message)}
  try{const [v2]=await sql.query('SELECT * FROM khudii_page_seo WHERE deleted_at IS NULL');for(const row of v2)map.set(row.path,{...row,noindex:!!row.robots_noindex});}catch(error){if(error?.code!=='ER_NO_SUCH_TABLE')console.error('[SEO v2 audit]',error?.code||error?.message);}
  const result=CMS_PAGES.filter(p=>p.slug!=='@global'&&!p.slug.includes('[')).map(p=>record('pages',{
    id:p.slug,slug:p.slug,title:p.title,meta_title:map.get(p.slug)?.meta_title||'',meta_description:map.get(p.slug)?.meta_description||'',meta_keywords:map.get(p.slug)?.meta_keywords||'',og_title:map.get(p.slug)?.og_title||'',og_description:map.get(p.slug)?.og_description||'',og_image:map.get(p.slug)?.og_image||'',noindex:map.get(p.slug)?.noindex||false
  }));
  try{const [dynamicPages]=await sql.query("SELECT p.id,p.title,p.page_key,p.path,p.slug,s.meta_title,s.meta_description,s.meta_keywords,s.og_title,s.og_description,s.og_image,s.robots_noindex FROM khudii_site_pages p LEFT JOIN khudii_page_seo s ON s.path=p.path AND s.entity_type='page' AND s.deleted_at IS NULL WHERE p.deleted_at IS NULL AND p.status='published'");for(const p of dynamicPages){if(!result.some(existing=>existing.path===p.path))result.push(record('pages',{id:p.path,slug:p.path,title:p.title,meta_title:p.meta_title,meta_description:p.meta_description,meta_keywords:p.meta_keywords,og_title:p.og_title,og_description:p.og_description,og_image:p.og_image,noindex:p.robots_noindex}));}}catch(e){console.error('[dynamic SEO audit]',e?.code||e?.message)}
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
  for(const row of result){
    const ext=extensions.get(row.path)||{};
    Object.assign(row,{canonical_url:ext.canonical_url||'',geo_summary:ext.geo_summary||'',geo_entities:ext.geo_entities||'',aeo_faqs:decodeJson(ext.aeo_faqs,[]),alt_texts:decodeJson(ext.alt_texts,[]),json_ld:ext.json_ld||'',robots_nofollow:!!ext.robots_nofollow});
  }
  for(const row of result){row.issues=[...new Set(row.issues)];row.score=Math.max(0,100-(row.issues.includes('Missing SEO title')?32:0)-(row.issues.some(x=>x.startsWith('SEO title length'))?10:0)-(row.issues.includes('Missing meta description')?32:0)-(row.issues.some(x=>x.startsWith('Meta description length'))?10:0)-(row.issues.includes('Missing slug')?10:0)-(row.issues.includes('Missing social image')?6:0)-(row.issues.filter(x=>x.startsWith('Duplicate')).length*10));}
  return {entities:result,warnings};
}
export async function listSeoIntelligence(req,res){
  try{const {entities,warnings}=await collectSeoEntities();res.set('Cache-Control','no-store');return res.json({entities,warnings,summary:{total:entities.length,missingTitle:entities.filter(x=>!x.meta_title).length,missingDescription:entities.filter(x=>!x.meta_description).length,duplicates:entities.filter(x=>x.issues.some(v=>v.startsWith('Duplicate'))).length,averageScore:entities.length?Math.round(entities.reduce((n,r)=>n+r.score,0)/entities.length):0}});}
  catch(e){console.error('[SEO report]',e);return res.status(503).json({message:'SEO data is unavailable. Check schema migrations.'});}
}
function normalizeType(t) {
  const s = String(t || '').toLowerCase();
  if (s === 'blog' || s === 'blogs') return 'blogs';
  if (s === 'organization' || s === 'organizations' || s === 'items') return 'organizations';
  if (s === 'story' || s === 'stories' || s === 'success-stories' || s === 'successstories') return 'stories';
  if (s === 'faq' || s === 'faqs') return 'faqs';
  if (s === 'podcast' || s === 'podcasts') return 'podcasts';
  return 'pages';
}

export async function updateSeoEntity(req,res){
  let savedPath=null;
  const type=normalizeType(req.body?.type||req.body?.entityType);
  const rawId=String(req.body?.id??req.body?.page_id??'');
  const id=rawId;
  const meta_title=trim(req.body?.meta_title??req.body?.metaTitle,255);
  const meta_description=trim(req.body?.meta_description??req.body?.metaDescription,1000);
  const rawKws=req.body?.meta_keywords??req.body?.metaKeywords;
  const meta_keywords=trim(Array.isArray(rawKws)?rawKws.join(', '):rawKws,1000);
  const og_title=trim(req.body?.og_title??req.body?.ogTitle??meta_title,255);
  const og_description=trim(req.body?.og_description??req.body?.ogDescription??meta_description,1000);
  const og_image=trim(req.body?.og_image??req.body?.ogImageUrl,1000);
  const noindex=Boolean(req.body?.noindex??req.body?.noIndex);

  if(og_image&&!(/^https?:\/\//i.test(og_image)||og_image.startsWith('/')&&!og_image.startsWith('//')))return res.status(422).json({message:'Social image must be a valid image URL or site-relative path'});
  try{
    await initSeoStorage();
    const extension=normalizeExtension(req.body||{});
    if(type==='pages'){
      if(/^\d+$/.test(id)){
        try{
          const [prows]=await sql.query('SELECT path, slug FROM khudii_site_pages WHERE id=? LIMIT 1',[id]);
          if(prows.length && prows[0].path) savedPath = prows[0].path;
          else if(prows.length && prows[0].slug) savedPath = prows[0].slug.startsWith('/') ? prows[0].slug : `/${prows[0].slug}`;
        }catch{}
      }
      if(!savedPath){
        savedPath=id.startsWith('/')?id:`/${id}`;
      }
      if(savedPath.length>190)return res.status(422).json({message:'Invalid public page path'});
      const known=CMS_PAGES.some(p=>p.slug===savedPath&&!p.slug.includes('[')&&p.slug!=='@global');
      if(!known){const [dynamic]=await sql.execute('SELECT id FROM khudii_site_pages WHERE path=? AND deleted_at IS NULL LIMIT 1',[savedPath]);if(!dynamic.length&&!savedPath.startsWith('/'))return res.status(404).json({message:'Unknown CMS page'});}
      await sql.execute('INSERT INTO khudii_seo_entities (page_path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),og_title=VALUES(og_title),og_description=VALUES(og_description),og_image=VALUES(og_image),noindex=VALUES(noindex)',[savedPath,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0]);
    } else if(type==='faqs'){
      savedPath='/faqs';
      if(/^\d+$/.test(id)){
        try{await sql.execute('UPDATE faqs SET meta_title=?,meta_description=?,meta_keywords=? WHERE id=?',[meta_title,meta_description,meta_keywords,id]);}catch{}
      }
      await sql.execute('INSERT INTO khudii_seo_entities (page_path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),og_title=VALUES(og_title),og_description=VALUES(og_description),og_image=VALUES(og_image),noindex=VALUES(noindex)',[savedPath,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0]);
    } else {
      const tables={categories:'sectors',organizations:'items',blogs:'document',stories:'successstories',podcasts:'podcast'};
      if(!tables[type])return res.status(422).json({message:'Unknown content type or ID'});
      const table=tables[type];
      const [rows]=await sql.execute(`SELECT id, slug FROM ${table} WHERE (id=? OR slug=?) ${type==='podcasts'?'':'AND deletestatus=0'} LIMIT 1`,[id, id]);
      if(!rows.length||!rows[0].slug)return res.status(404).json({message:'Content with a public slug not found'});
      const actualDbId = rows[0].id;
      const path=pathFor(type,rows[0].slug);savedPath=path;
      if(path.length>190)return res.status(422).json({message:'Content URL exceeds SEO storage limit'});
      if(type==='podcasts'){
        await sql.execute('INSERT INTO podcast_episode_seo (episode_id,seo_title,seo_description,seo_keywords,seo_image) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),seo_keywords=VALUES(seo_keywords),seo_image=VALUES(seo_image)',[actualDbId,meta_title,meta_description,meta_keywords,og_image]);
      }else if(type!=='categories'){
        await sql.execute(`UPDATE ${table} SET meta_title=?,meta_description=?,meta_keywords=? WHERE id=?`,[meta_title,meta_description,meta_keywords,actualDbId]);
      }
      await sql.execute('INSERT INTO khudii_seo_entities (page_path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),og_title=VALUES(og_title),og_description=VALUES(og_description),og_image=VALUES(og_image),noindex=VALUES(noindex)',[path,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0]);
    }
    if(savedPath){await initSeoExtensions();await sql.execute('INSERT INTO khudii_seo_extensions (page_path,canonical_url,geo_summary,geo_entities,aeo_faqs,alt_texts,json_ld,robots_nofollow) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE canonical_url=VALUES(canonical_url),geo_summary=VALUES(geo_summary),geo_entities=VALUES(geo_entities),aeo_faqs=VALUES(aeo_faqs),alt_texts=VALUES(alt_texts),json_ld=VALUES(json_ld),robots_nofollow=VALUES(robots_nofollow)',[savedPath,extension.canonical_url,extension.geo_summary,extension.geo_entities,JSON.stringify(extension.aeo_faqs),JSON.stringify(extension.alt_texts),extension.json_ld,extension.robots_nofollow?1:0]);try{await sql.execute('UPDATE khudii_page_seo SET meta_title=?,meta_description=?,meta_keywords=?,og_title=?,og_description=?,og_image=?,robots_noindex=?,revision=revision+1 WHERE path=? AND deleted_at IS NULL',[meta_title,meta_description,meta_keywords,og_title,og_description,og_image,noindex?1:0,savedPath]);const {revalidatePath}=await import('next/cache');revalidatePath(savedPath);revalidatePath('/sitemap.xml');}catch(error){console.error('[SEO sync]',error?.code||error?.message);}}
    res.set('Cache-Control','no-store');return res.json({success:true,message:'SEO saved successfully in database'});
  }catch(e){console.error('[SEO save]',e);return res.status(503).json({message:'Unable to save SEO fields: '+(e?.message||'unknown error')});}
}

export const saveEntitySeo = updateSeoEntity;

export async function getEntitySeo(req,res){
  const type=normalizeType(req.query?.type||req.query?.entityType);
  const rawId=String(req.query?.id||req.query?.page_id||'');
  if(!rawId)return res.status(422).json({success:false,message:'Missing entity identifier'});
  try{
    let slug='';
    let title='';
    let description='';
    let path='';
    let images=[];
    let meta_title='';
    let meta_description='';
    let meta_keywords='';
    let raw={};

    if(type==='pages'){
      let pageRow = null;
      if(/^\d+$/.test(rawId)){
        try{
          const [rows]=await sql.query('SELECT * FROM khudii_site_pages WHERE id=? AND deleted_at IS NULL LIMIT 1',[rawId]);
          if(rows.length) pageRow = rows[0];
        }catch{}
      }
      if(!pageRow){
        const checkPath = rawId.startsWith('/')?rawId:`/${rawId}`;
        try{
          const [rows]=await sql.query('SELECT * FROM khudii_site_pages WHERE (path=? OR slug=?) AND deleted_at IS NULL LIMIT 1',[checkPath, rawId]);
          if(rows.length) pageRow = rows[0];
        }catch{}
      }
      if(pageRow){
        raw = pageRow;
        path = pageRow.path || `/${pageRow.slug}`;
        slug = pageRow.slug || pageRow.path;
        title = pageRow.title || title;
      } else {
        path = rawId.startsWith('/')?rawId:`/${rawId}`;
        slug = path;
        const known = CMS_PAGES.find(p=>p.slug===path);
        title = known?.title || path.slice(1).replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
      }
    } else if(type==='blogs'){
      const [rows]=await sql.query('SELECT * FROM document WHERE (id=? OR slug=?) AND deletestatus=0 LIMIT 1',[rawId, rawId]);
      if(rows.length){
        raw=rows[0];
        slug=rows[0].slug||'';
        title=rows[0].Name||'';
        description=rows[0].intro||'';
        meta_title=rows[0].meta_title||'';
        meta_description=rows[0].meta_description||'';
        meta_keywords=rows[0].meta_keywords||'';
        path=`/Blog/${slug}`;
        if(rows[0].image_path)images.push({url:rows[0].image_path,label:'Blog Featured Image',key:'hero',alt:`Featured illustration for ${title}`});
      }
    } else if(type==='organizations'){
      const [rows]=await sql.query('SELECT * FROM items WHERE (id=? OR slug=?) AND deletestatus=0 LIMIT 1',[rawId, rawId]);
      if(rows.length){
        raw=rows[0];
        slug=rows[0].slug||'';
        title=rows[0].name||'';
        description=rows[0].description||'';
        meta_title=rows[0].meta_title||'';
        meta_description=rows[0].meta_description||'';
        meta_keywords=rows[0].meta_keywords||'';
        path=`/organization/${slug}`;
        if(rows[0].partner_image)images.push({url:rows[0].partner_image,label:'Partner Logo',key:'logo',alt:`${title} partner emblem`});
        if(rows[0].introductory_image_path)images.push({url:rows[0].introductory_image_path,label:'Introductory Image',key:'intro',alt:`${title} introductory presentation`});
      }
    } else if(type==='stories'){
      const [rows]=await sql.query('SELECT * FROM successstories WHERE (id=? OR slug=?) AND deletestatus=0 LIMIT 1',[rawId, rawId]);
      if(rows.length){
        raw=rows[0];
        slug=rows[0].slug||'';
        title=rows[0].title||'';
        description=rows[0].description||'';
        meta_title=rows[0].meta_title||'';
        meta_description=rows[0].meta_description||'';
        meta_keywords=rows[0].meta_keywords||'';
        path=`/success-stories/${slug}`;
        if(rows[0].youtube_id)images.push({url:`https://img.youtube.com/vi/${rows[0].youtube_id}/hqdefault.jpg`,label:'Story Video Thumbnail',key:'youtube',alt:`Video thumbnail for ${title}`});
      }
    } else if(type==='faqs'){
      path='/faqs';
      slug='faqs';
      title='Frequently Asked Questions';
      meta_title='Frequently Asked Questions | Khudii';
      meta_description='Find answers to common questions about Khudii, charities in Pakistan, donations, and volunteering.';
      if(/^\d+$/.test(rawId)){
        const [rows]=await sql.query('SELECT * FROM faqs WHERE id=? LIMIT 1',[rawId]);
        if(rows.length){raw=rows[0];title=rows[0].question||title;}
      }
    }

    await initSeoStorage();
    await initSeoExtensions();
    const [[override]]=await sql.query('SELECT * FROM khudii_seo_entities WHERE page_path=? LIMIT 1',[path]);
    const [[ext]]=await sql.query('SELECT * FROM khudii_seo_extensions WHERE page_path=? LIMIT 1',[path]);

    const result={
      id:rawId,
      entityType:type,
      title:title||'Page',
      slug,
      path,
      raw,
      images,
      metaTitle:override?.meta_title||meta_title||'',
      metaDescription:override?.meta_description||meta_description||'',
      metaKeywords:override?.meta_keywords||meta_keywords||'',
      heroAlt:(ext?.alt_texts?decodeJson(ext.alt_texts,[])[0]?.alt:'')||'',
      ogCardAlt:'',
      imageAlts:(ext?.alt_texts?decodeJson(ext.alt_texts,[]):[]),
      geoSummary:ext?.geo_summary||'',
      geoClusters:ext?.geo_entities||'',
      aeoFaqs:ext?.aeo_faqs?(typeof ext.aeo_faqs==='string'?ext.aeo_faqs:JSON.stringify(ext.aeo_faqs)):'',
      faqs:ext?.aeo_faqs?decodeJson(ext.aeo_faqs,[]):[],
      schemaType:type==='organizations'?'NGO':type==='blogs'||type==='stories'?'Article':type==='faqs'?'FAQPage':'WebPage',
      jsonLdPayload:ext?.json_ld||'',
      canonicalUrl:ext?.canonical_url||`https://www.khudii.com${path}`,
      noIndex:Boolean(override?.noindex),
      ogImageUrl:override?.og_image||images[0]?.url||'https://www.khudii.com/khudiilogo.png',
    };
    res.set('Cache-Control','no-store');return res.json({success:true,data:result});
  }catch(err){console.error('[getEntitySeo]',err);return res.status(500).json({success:false,message:'Failed to retrieve entity SEO: '+(err?.message||'unknown error')});}
}

export async function generateEntitySeo(req,res){
  const section=String(req.body?.section||'all');
  const ctx=req.body?.context||{};
  const entityType=normalizeType(ctx.entityType);
  const pageTitle=String(ctx.pageTitle||'Khudii').trim();
  const pageSlug=String(ctx.pageSlug||'').trim();
  const domain=String(ctx.siteContext?.domain||'https://www.khudii.com').replace(/\/+$/,'');

  const fitText=(t,max)=>{
    const c=String(t||'').replace(/\s+/g,' ').trim();
    if(c.length<=max)return c;
    const sub=c.slice(0,max-3);
    const lastSpace=sub.lastIndexOf(' ');
    return lastSpace>20?`${sub.slice(0,lastSpace)}...`:`${sub}...`;
  };

  const cleanTitle=(raw)=>{
    const brand=' | Khudii';
    const t=fitText(raw||pageTitle,60-brand.length);
    return `${t}${brand}`;
  };

  const results={};

  if(section==='traditional'||section==='all'){
    let desc='';
    let kws=[];
    if(entityType==='organizations'){
      desc=`Discover verified welfare programs, donations, active humanitarian campaigns, and inspiring community work for ${pageTitle} on Khudii Pakistan.`;
      kws=[pageTitle,`${pageTitle} Pakistan`,'Charity Pakistan','Welfare Organizations','Donate Online','Verified NGOs','Khudii Directory'];
    }else if(entityType==='blogs'){
      desc=`Read insightful perspectives on social impact, community welfare, and charitable empowerment in Pakistan with ${pageTitle} on Khudii.`;
      kws=[pageTitle,'Khudii Blog','Pakistan Social Welfare','Community Support','Philanthropy Insights','Inspiring Articles'];
    }else if(entityType==='stories'){
      desc=`Read the inspiring real-life success story of ${pageTitle} on Khudii. Discover how community champions create positive change across Pakistan.`;
      kws=[pageTitle,'Khudii Success Stories','Inspiring Heroes','Pakistan Welfare Stories','Real Impact','Community Change'];
    }else if(entityType==='faqs'||pageSlug==='/faqs'){
      desc=`Find official answers to frequently asked questions about Khudii, discovering verified charities in Pakistan, donating safely, and volunteering.`;
      kws=['Khudii FAQs','Frequently Asked Questions','How to Donate Pakistan','Charity Verification','Volunteer Khudii'];
    }else{
      desc=`Explore ${pageTitle} on Khudii - Pakistan's digital welfare network connecting donors, volunteers, and verified humanitarian organizations.`;
      kws=[pageTitle,'Khudii Pakistan','Verified Charities','Donate in Pakistan','Volunteer Opportunities','Digital Welfare Network'];
    }
    results.metaTitle=cleanTitle(pageTitle);
    results.metaDescription=fitText(desc,160);
    results.metaKeywords=kws;
  }

  if(section==='alt'||section==='all'){
    results.heroAlt=`Official visual illustration and hero presentation for ${pageTitle} on Khudii`;
    results.ogCardAlt=`Official social preview card for ${pageTitle} on Khudii platform`;
  }

  if(section==='geo'||section==='all'){
    results.geoSummary=`Comprehensive official overview of ${pageTitle} published on Khudii, Pakistan's dedicated social welfare discovery and philanthropic verification network.`;
    results.geoClusters=`${pageTitle}, Khudii Pakistan, Verified Welfare, Charity Directory, Humanitarian Assistance, Community Impact`;
  }

  if(section==='aeo'||section==='all'){
    let faqs=[];
    if(entityType==='organizations'){
      faqs=[
        {question:`What is the mission of ${pageTitle}?`,answer:`${pageTitle} provides essential charitable and humanitarian welfare services in Pakistan, verified for transparency on Khudii.`},
        {question:`How can donors contribute to ${pageTitle}?`,answer:`Donors can connect directly through Khudii to review verified credentials, active appeals, and official donation channels for ${pageTitle}.`},
        {question:`Is ${pageTitle} officially listed on Khudii?`,answer:`Yes, ${pageTitle} is verified and indexed in Khudii's curated national registry of charitable organizations.`}
      ];
    }else if(entityType==='blogs'){
      faqs=[
        {question:`What is the key takeaway of "${pageTitle}"?`,answer:`This article examines critical humanitarian needs and community-driven solutions in Pakistan, highlighting grassroots impact.`},
        {question:`Where can I read related welfare articles?`,answer:`You can browse Khudii's complete editorial publication covering charity profiles, volunteer guides, and social sector news.`}
      ];
    }else if(entityType==='stories'){
      faqs=[
        {question:`Who is highlighted in ${pageTitle}?`,answer:`${pageTitle} recounts an uplifting true story of perseverance and transformative social contribution in Pakistan.`},
        {question:`How does Khudii discover success stories?`,answer:`Khudii partners with registered NGOs and community leaders to document authentic stories of hope and measurable impact.`}
      ];
    }else{
      faqs=[
        {question:`What can I find on the ${pageTitle} page?`,answer:`The ${pageTitle} page provides official information, verified data, and direct actions within the Khudii welfare ecosystem.`},
        {question:`How does Khudii ensure welfare transparency?`,answer:`Khudii verifies organization registrations, track records, and operational legitimacy before listing charities on the platform.`}
      ];
    }
    results.faqs=faqs;
    results.formattedFaqs=faqs.map(f=>`Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
  }

  if(section==='schema'||section==='all'){
    let schemaType='WebPage';
    let schema={};
    const canonical=`${domain}${pageSlug.startsWith('/')?pageSlug:'/'+pageSlug}`;
    if(entityType==='organizations'){
      schemaType='NGO';
      schema={
        '@context':'https://schema.org',
        '@type':'NGO',
        name:pageTitle,
        url:canonical,
        description:results.metaDescription||`Verified humanitarian non-profit profile for ${pageTitle} on Khudii.`,
        address:{'@type':'PostalAddress',addressCountry:'PK'}
      };
    }else if(entityType==='blogs'||entityType==='stories'){
      schemaType='Article';
      schema={
        '@context':'https://schema.org',
        '@type':'Article',
        headline:pageTitle,
        url:canonical,
        description:results.metaDescription||`Official article on ${pageTitle} by Khudii.`,
        publisher:{'@type':'Organization',name:'Khudii',url:domain,logo:`${domain}/khudiilogo.png`}
      };
    }else if(entityType==='faqs'||pageSlug==='/faqs'){
      schemaType='FAQPage';
      schema={
        '@context':'https://schema.org',
        '@type':'FAQPage',
        name:`${pageTitle} | Khudii`,
        url:canonical,
        mainEntity:(results.faqs||[]).map(f=>({
          '@type':'Question',
          name:f.question,
          acceptedAnswer:{'@type':'Answer',text:f.answer}
        }))
      };
    }else{
      schemaType='WebPage';
      schema={
        '@context':'https://schema.org',
        '@type':'WebPage',
        name:`${pageTitle} | Khudii`,
        url:canonical,
        publisher:{'@type':'Organization',name:'Khudii',url:domain,logo:`${domain}/khudiilogo.png`}
      };
    }
    results.schemaType=schemaType;
    results.jsonLdPayload=JSON.stringify(schema,null,2);
  }

  if(section==='technical'||section==='all'){
    results.canonicalUrl=`${domain}${pageSlug.startsWith('/')?pageSlug:'/'+pageSlug}`;
    results.noIndex=false;
  }

  return res.json({success:true,data:results});
}
export async function publicPageSeo(path){
  if(typeof path!=='string'||!path.startsWith('/'))return null;
  let row=null;
  try{const [[v2]]=await sql.query('SELECT * FROM khudii_page_seo WHERE path=? AND deleted_at IS NULL LIMIT 1',[path]);if(v2)row={...v2,noindex:!!v2.robots_noindex};}catch(error){if(error?.code!=='ER_NO_SUCH_TABLE')console.error('[SEO v2 lookup]',error?.code||error?.message)}
  if(!row){try{await initSeoStorage();const [[original]]=await sql.query('SELECT * FROM khudii_seo_entities WHERE page_path=? LIMIT 1',[path]);row=original||null}catch{}}
  try{await initSeoExtensions();const [[ext]]=await sql.query('SELECT * FROM khudii_seo_extensions WHERE page_path=? LIMIT 1',[path]);if(ext)row={...(row||{}),...ext,noindex:!!row?.noindex};}catch{}
  return row;
}
export function pageSeoMetadata(row, fallbackTitle, path, settings={}){
  const origin=String(settings.canonical_domain||site()).replace(/\/+$/,'');
  const image=row?.og_image||settings.og_image||'/Khudii.webp';
  const index=settings.allow_indexing!==false && !row?.noindex && path!=='/auth-callback';
  const title=formatSeoTitle(row?.meta_title||fallbackTitle);
  const description=formatSeoDescription(row?.meta_description||row?.description, fallbackTitle);
  const canonical=row?.canonical_url||`${origin}${path}`;
  return {
    title,
    description,
    keywords:row?.meta_keywords||undefined,
    alternates:{canonical},
    robots:{index,follow:index&&!row?.robots_nofollow},
    openGraph:{
      title:formatSeoTitle(row?.og_title||row?.meta_title||fallbackTitle),
      description:formatSeoDescription(row?.og_description||row?.meta_description||description, fallbackTitle),
      url:canonical,
      siteName:'Khudii',
      images:[image]
    },
    twitter:{
      card:row?.twitter_card||'summary_large_image',
      title:formatSeoTitle(row?.og_title||row?.meta_title||fallbackTitle),
      description:formatSeoDescription(row?.og_description||row?.meta_description||description, fallbackTitle),
      images:[image]
    }
  };
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
  const [overrides]=await sql.query('SELECT page_path,noindex FROM khudii_seo_entities').catch(()=>[[]]);const excluded=new Set(overrides.filter(v=>v.noindex).map(v=>v.page_path));try{const [v2Excluded]=await sql.query('SELECT path FROM khudii_page_seo WHERE deleted_at IS NULL AND (robots_noindex=1 OR include_in_sitemap=0)');for(const row of v2Excluded)excluded.add(row.path)}catch{}
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

export async function getPublicOrganizationBySlug(slug) {
  if (!slug) return null;
  try {
    const [rows] = await sql.query('SELECT * FROM items WHERE (slug=? OR id=?) AND deletestatus=0 LIMIT 1', [slug, slug]);
    return rows[0] || null;
  } catch (e) {
    console.error('[getPublicOrganizationBySlug]', e.message);
    return null;
  }
}

export async function getPublicBlogBySlug(slug) {
  if (!slug) return null;
  try {
    const [rows] = await sql.query('SELECT * FROM document WHERE (slug=? OR id=?) AND deletestatus=0 LIMIT 1', [slug, slug]);
    return rows[0] || null;
  } catch (e) {
    console.error('[getPublicBlogBySlug]', e.message);
    return null;
  }
}

export async function getPublicStoryBySlug(slug) {
  if (!slug) return null;
  try {
    const [rows] = await sql.query('SELECT * FROM successstories WHERE (slug=? OR id=?) AND deletestatus=0 AND is_published=1 LIMIT 1', [slug, slug]);
    return rows[0] || null;
  } catch (e) {
    console.error('[getPublicStoryBySlug]', e.message);
    return null;
  }
}

export async function getPublicCategoryBySlug(slug) {
  if (!slug) return null;
  try {
    const [rows] = await sql.query('SELECT * FROM sectors WHERE (slug=? OR id=?) AND deletestatus=0 LIMIT 1', [slug, slug]);
    return rows[0] || null;
  } catch (e) {
    console.error('[getPublicCategoryBySlug]', e.message);
    return null;
  }
}
