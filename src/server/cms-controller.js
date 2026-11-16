import db from './admin-backend/Database/oldDB.js';
import { validateFormSettings } from './form-settings-validation.js';
import { CMS_PAGES, defaultSections, allowedPage, CMS_SECTION_TYPES } from '@/lib/cms-registry';
import ftp from 'basic-ftp';
import { Readable } from 'node:stream';
import fs from 'node:fs/promises';
import path from 'node:path';

const sql = db.promise();
let initPromise;
function init() {
  if (!initPromise) initPromise = (async () => {
    await sql.query('CREATE TABLE IF NOT EXISTS khudii_cms_pages (slug VARCHAR(180) PRIMARY KEY, sections LONGTEXT NOT NULL, revision INT NOT NULL DEFAULT 1, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
    await sql.query('CREATE TABLE IF NOT EXISTS khudii_admin_settings (bucket VARCHAR(50) PRIMARY KEY, content LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
    await sql.query('CREATE TABLE IF NOT EXISTS khudii_media_metadata (url VARCHAR(768) PRIMARY KEY, title VARCHAR(255) DEFAULT NULL, alt_text VARCHAR(500) DEFAULT NULL, caption TEXT, trashed TINYINT(1) DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
  })().catch(e => { initPromise = undefined; throw e; });
  return initPromise;
}
const err = (res, e) => { console.error('[Khudii CMS]',e); return res.status(500).json({success:false,message:'Unable to access CMS storage. Check database configuration and table permissions.'}); };
const parse = (value, backup) => { try { return JSON.parse(typeof value === 'string' ? value : JSON.stringify(value)) ?? backup; } catch { return backup; } };
const slugFrom = req => String(req.query.slug || '/');
export async function cmsGetPublicPage(req,res){
  try{
    const slug=slugFrom(req);
    if(!allowedPage(slug))return res.status(404).json({message:'Unknown public page'});
    await init();
    const [rows]=await sql.query('SELECT sections,revision FROM khudii_cms_pages WHERE slug=?',[slug]);
    const sections=rows.length?parse(rows[0].sections,defaultSections(slug)):defaultSections(slug);
    return res.json({slug,sections:Array.isArray(sections)?sections.filter(s=>s.visible!==false):[],revision:rows[0]?.revision||0});
  }catch(e){return err(res,e);}
}
export async function cmsGetPage(req,res) {
  try {
    const slug = slugFrom(req);
    if(!allowedPage(slug)) return res.status(404).json({message:'Unknown public page'});
    await init();
    const [rows] = await sql.query('SELECT sections,revision FROM khudii_cms_pages WHERE slug=?',[slug]);
    return res.json({slug,sections:rows.length ? parse(rows[0].sections,defaultSections(slug)) : defaultSections(slug),revision:rows[0]?.revision || 0});
  } catch(e){return err(res,e);}
}
const cleanString = (s,n=10000) => String(s ?? '').slice(0,n);
const cleanUrl = u => { const v=cleanString(u,2000).trim(); return !v || v.startsWith('/') && !v.startsWith('//') || /^https?:\/\//i.test(v) ? v : ''; };
function validateSections(slug,sections){
  if(!Array.isArray(sections) || sections.length>150) throw new Error('Section list must contain no more than 150 items');
  const definitions = CMS_PAGES.find(p=>p.slug===slug)?.sections || [];
  const types = new Set(CMS_SECTION_TYPES.map(s=>s.kind));
  const ids = new Set();
  return sections.map((s,i)=>{
    if(!s || typeof s!=='object') throw new Error(`Invalid section at position ${i+1}`);
    const id=cleanString(s.id,100);
    if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id)||ids.has(id)) throw new Error('Section IDs must be unique and valid');
    ids.add(id);
    const source=cleanString(s.source || '',100);
    const original = definitions.find(d=>d.key===source);
    const kind=original ? original.kind : cleanString(s.kind,35);
    if(!original && !types.has(kind)) throw new Error('Unknown section type');
    const d=s.data && typeof s.data==='object' && !Array.isArray(s.data) ? s.data : {};
    return {id,source:original?source:'',kind,title:cleanString(s.title || original?.title || kind,180),visible:s.visible!==false,data:{heading:cleanString(d.heading,250),subheading:cleanString(d.subheading,500),body:cleanString(d.body,25000),image:cleanUrl(d.image),imageAlt:cleanString(d.imageAlt,250),buttonText:cleanString(d.buttonText,100),buttonUrl:cleanUrl(d.buttonUrl),items:Array.isArray(d.items)?d.items.slice(0,40).map(item=>({title:cleanString(item?.title,250),description:cleanString(item?.description,1500),url:cleanUrl(item?.url),image:cleanUrl(item?.image),imageAlt:cleanString(item?.imageAlt,250)})):[]}};
  });
}
export async function cmsSavePage(req,res) {
  try{
    const slug=slugFrom(req);
    if(!allowedPage(slug)) return res.status(404).json({message:'Unknown public page'});
    let sections;
    try{ sections=validateSections(slug,req.body?.sections); }catch(e){return res.status(422).json({message:e.message});}
    const version=Number(req.body?.revision);
    if(!Number.isInteger(version)||version<0) return res.status(422).json({message:'Revision number is required'});
    await init();
    // Optimistic concurrency: stale edit sessions cannot overwrite another admin's work.
    if(version===0){
      const [r]=await sql.query('INSERT IGNORE INTO khudii_cms_pages (slug,sections,revision) VALUES (?,?,1)',[slug,JSON.stringify(sections)]);
      if(r.affectedRows) return res.json({success:true,revision:1});
    }else{
      const [r]=await sql.query('UPDATE khudii_cms_pages SET sections=?,revision=revision+1 WHERE slug=? AND revision=?',[JSON.stringify(sections),slug,version]);
      if(r.affectedRows) return res.json({success:true,revision:version+1});
    }
    return res.status(409).json({message:'This page was updated in another session. Reload before editing it again.'});
  }catch(e){return err(res,e);}
}
const SETTINGS = ['profile','smtp','appearance','seo','email_templates','forms','popup','css','header','login_auth'];
export async function cmsGetSettings(req,res){
  try{await init();const [rows]=await sql.query('SELECT bucket,content FROM khudii_admin_settings'); const data=Object.fromEntries(rows.map(r=>[r.bucket,parse(r.content,{})]));
    // Owner data is the actual source of SMTP and admin contact used by Khudii email service.
    const [owners]=await sql.query('SELECT * FROM owners ORDER BY id ASC LIMIT 1');const owner=owners[0]||{};
    const smtp={smtp_host:owner.smtp_host||(owner.sender_email&&owner.sender_app_password?'smtp.gmail.com':''),smtp_port:owner.smtp_port||465,smtp_secure:String(owner.smtp_secure ?? 1),smtp_username:owner.smtp_username||owner.sender_email||'',smtp_from:owner.smtp_from||owner.sender_email||'',smtp_enabled:true,...(data.smtp||{})};
    delete smtp.smtp_password;
    res.json({profile:{name:'Khudii',email:owner.email||'',...data.profile},smtp,appearance:data.appearance||{},seo:data.seo||{},email_templates:data.email_templates||{},forms:data.forms||{},popup:data.popup||{},css:data.css||{},header:data.header||{show_search:true,search_placeholder:'Search Organization',show_donate_button:true,donate_button_text:'Donate Now',donate_button_url:'/donate-now'},login_auth:data.login_auth||{backgroundImage:'',backgroundAlt:'',footerText:'© 2026 Khudii. All Rights Reserved. Powered by DKS.',mediaStorageMode:'ftp',maintenanceMode:false,maintenanceScope:'all',maintenancePaths:[]}});
  }catch(e){return err(res,e);}
}
export async function cmsGetHeaderSettings(req,res){
  try{
    await init();
    const [rows]=await sql.query("SELECT content FROM khudii_admin_settings WHERE bucket = 'header'");
    const defaults = { show_search: true, search_placeholder: 'Search Organization', search_areas: ['organizations', 'blogs', 'categories', 'stories'], show_donate_button: true, donate_button_text: 'Donate Now', donate_button_url: '/donate-now' };
    const data = rows.length ? { ...defaults, ...parse(rows[0].content, {}) } : defaults;
    return res.json({ success: true, data });
  }catch(e){return err(res,e);}
}
export async function cmsSaveHeaderSettings(req,res){
  try{
    await init();
    const body=req.body||{};
    const defaults = { show_search: true, search_placeholder: 'Search Organization', search_areas: ['organizations', 'blogs', 'categories', 'stories'], show_donate_button: true, donate_button_text: 'Donate Now', donate_button_url: '/donate-now' };
    const validAreas = ['organizations', 'blogs', 'categories', 'stories', 'podcasts', 'events'];
    const search_areas = Array.isArray(body.search_areas)
      ? body.search_areas.filter(a => validAreas.includes(a))
      : defaults.search_areas;
    const merged = {
      show_search: body.show_search !== undefined ? Boolean(body.show_search) : defaults.show_search,
      search_placeholder: cleanString(body.search_placeholder || defaults.search_placeholder, 100),
      search_areas: search_areas.length > 0 ? search_areas : defaults.search_areas,
      show_donate_button: body.show_donate_button !== undefined ? Boolean(body.show_donate_button) : defaults.show_donate_button,
      donate_button_text: cleanString(body.donate_button_text || defaults.donate_button_text, 100),
      donate_button_url: cleanString(body.donate_button_url || defaults.donate_button_url, 500)
    };
    const encoded = JSON.stringify(merged);
    await sql.query("INSERT INTO khudii_admin_settings (bucket,content) VALUES ('header',?) ON DUPLICATE KEY UPDATE content=VALUES(content)",[encoded]);
    return res.json({ success: true, message: 'Header settings updated', data: merged });
  }catch(e){return err(res,e);}
}
export async function cmsGetPublicSettings(req,res){
  try {await init();const [rows]=await sql.query("SELECT bucket,content FROM khudii_admin_settings WHERE bucket IN ('appearance','profile','seo','forms','popup','css','header')");
    const cfg=Object.fromEntries(rows.map(r=>[r.bucket,parse(r.content,{})]));
    const publicForms=Object.fromEntries(Object.entries(cfg.forms||{}).filter(([key])=>['contact','inquiry','donate','volunteer','jobs','story','organization'].includes(key)).map(([key,value])=>[key,{fields:value?.fields||{}}]));
    const socials=Object.fromEntries(['facebook_url','instagram_url','youtube_url','twitter_url','linkedin_url','tiktok_url','whatsapp_url'].map(key => [key, /^https:\/\//i.test(String(cfg.profile?.[key]||'')) ? String(cfg.profile[key]).slice(0,1000) : '']));
    const headerDefaults = { show_search: true, search_placeholder: 'Search Organization', search_areas: ['organizations', 'blogs', 'categories', 'stories'], show_donate_button: true, donate_button_text: 'Donate Now', donate_button_url: '/donate-now' };
    const header = cfg.header ? { ...headerDefaults, ...cfg.header } : headerDefaults;
    return res.json({forms:publicForms,social:socials,navigation:Array.isArray(cfg.appearance?.navigation)?cfg.appearance.navigation:[],logo:cleanUrl(cfg.appearance?.logo_url),favicon:cleanUrl(cfg.appearance?.favicon_url),primaryColor:/^#[0-9a-f]{6}$/i.test(cfg.appearance?.primary_color)?cfg.appearance.primary_color:'#2563eb',popup:cfg.popup||{},css:cfg.css||{},header});
  } catch(e){return err(res,e);}
}
export async function cmsSaveSettings(req,res){
  try{
    await init();
    const input=req.body||{};
    if(!input||typeof input!=='object'||Array.isArray(input))return res.status(422).json({message:'Settings must be a JSON object'});
    const prepared=[];
    for(const bucket of SETTINGS){
      if(input[bucket]===undefined)continue;
      if(!input[bucket]||typeof input[bucket]!=='object'||Array.isArray(input[bucket]))return res.status(422).json({message:`Invalid ${bucket} settings`});
      let doc={...input[bucket]};
      if(bucket==='forms'){
        try{doc=validateFormSettings(doc)}catch(e){return res.status(422).json({message:e.message});}
      }
      if(bucket==='profile' && doc.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doc.email))return res.status(422).json({message:'Invalid primary email address'});
      if(bucket==='profile') for(const field of ['facebook_url','instagram_url','youtube_url','twitter_url','linkedin_url','tiktok_url','whatsapp_url']) if(doc[field] && (!/^https:\/\/[^\s]+$/i.test(doc[field]) || String(doc[field]).length>1000))return res.status(422).json({message:`${field} must be an HTTPS URL`});
      if(bucket==='smtp'){
        const port=Number(doc.smtp_port||465);
        if(!Number.isInteger(port)||port<1||port>65535)return res.status(422).json({message:'Invalid SMTP port'});
        for(const key of ['smtp_username','smtp_from']){
          const value=String(doc[key]||'').trim();
          if(value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return res.status(422).json({message:`Invalid ${key} address`});
        }
        if(doc.smtp_host && (!/^[a-zA-Z0-9.-]{1,255}$/.test(String(doc.smtp_host))||String(doc.smtp_host).includes('..')))return res.status(422).json({message:'Invalid SMTP hostname'});
      }
      if(bucket==='seo'){
        if(String(doc.meta_title||'').length>120||String(doc.meta_description||'').length>320)return res.status(422).json({message:'SEO metadata exceeds allowed length'});
        if(doc.canonical_domain && !/^https:\/\/[a-z0-9.-]+(?::443)?\/?$/i.test(doc.canonical_domain))return res.status(422).json({message:'Canonical site must be an HTTPS domain'});
        if(doc.ga_id && !/^G-[A-Z0-9]{5,20}$/.test(doc.ga_id))return res.status(422).json({message:'Invalid GA4 measurement ID'});
        if(doc.google_site_verification && !/^[a-zA-Z0-9_-]{6,150}$/.test(doc.google_site_verification))return res.status(422).json({message:'Use the Google verification token only'});
        if(doc.bing_site_verification && !/^[a-zA-Z0-9_-]{6,150}$/.test(doc.bing_site_verification))return res.status(422).json({message:'Use the Bing verification token only'});
        for(const flag of ['ai_search_crawlers','ai_training_crawlers','cohere_crawler_access']) if(doc[flag]!==undefined && typeof doc[flag]!=='boolean')return res.status(422).json({message:`Invalid ${flag} crawler flag`});
        if(doc.additional_disallow_paths!==undefined){
          if(!Array.isArray(doc.additional_disallow_paths)||doc.additional_disallow_paths.length>30||doc.additional_disallow_paths.some(p=>typeof p!=='string'||!/^\/(?!\/)[a-zA-Z0-9_./*~-]{1,150}$/.test(p)))return res.status(422).json({message:'Invalid robots.txt disallow path; use up to 30 internal paths'});
          doc.additional_disallow_paths=[...new Set(doc.additional_disallow_paths)];
        }
      }
      if(bucket==='popup'){
        doc.enabled=doc.enabled===true;
        doc.title=cleanString(doc.title,150);
        doc.message=cleanString(doc.message,5000);
        doc.button_text=cleanString(doc.button_text,80);
      }
      if(bucket==='css'){
        const stylesheet=String(doc.stylesheet||'');
        if(stylesheet.length>12000||/@import|@charset|url\s*\(|expression\s*\(|behavior\s*:/i.test(stylesheet))return res.status(422).json({message:'Custom CSS includes blocked external resources or unsafe expressions'});
        doc.stylesheet=stylesheet;
      }
      if(bucket==='login_auth'){
        doc.backgroundImage=cleanString(doc.backgroundImage||'',500);
        doc.backgroundAlt=cleanString(doc.backgroundAlt||'',255);
        doc.footerText=cleanString(doc.footerText||'© 2026 Khudii. All Rights Reserved. Powered by DKS.',255);
        doc.mediaStorageMode=doc.mediaStorageMode==='public'?'public':'ftp';
        doc.maintenanceMode=Boolean(doc.maintenanceMode);
        doc.maintenanceScope=doc.maintenanceScope==='selected'?'selected':'all';
        doc.maintenancePaths=Array.isArray(doc.maintenancePaths)?doc.maintenancePaths.slice(0,50).map(p=>cleanString(p,150)):[];
      }
      if(bucket==='smtp')delete doc.smtp_password;
      const encoded=JSON.stringify(doc);
      if(encoded.length>100000)return res.status(413).json({message:`${bucket} settings exceed maximum size`});
      prepared.push([bucket,doc,encoded]);
    }
    if(!prepared.length)return res.status(422).json({message:'No settings provided'});
    const connection=await sql.getConnection();
    try{
      await connection.beginTransaction();
      const [owners]=await connection.query('SELECT id FROM owners ORDER BY id ASC LIMIT 1');
      const ownerId=owners[0]?.id;
      for(const [bucket,doc,encoded] of prepared){
        if(bucket==='profile' && doc.email && ownerId)await connection.query('UPDATE owners SET email=? WHERE id=?',[cleanString(doc.email,255),ownerId]);
        if(bucket==='smtp' && ownerId){
          const original=input.smtp||{};
          const updates={smtp_host:cleanString(original.smtp_host,255),smtp_port:Number(original.smtp_port||465),smtp_secure:String(original.smtp_secure)==='1'?1:0,smtp_username:cleanString(original.smtp_username,255),smtp_from:cleanString(original.smtp_from,255)};
          if(original.smtp_password)updates.smtp_password=cleanString(original.smtp_password,512);
          await connection.query(`UPDATE owners SET ${Object.keys(updates).map(key=>`${key}=?`).join(',')} WHERE id=?`,[...Object.values(updates),ownerId]);
        }
        await connection.query('INSERT INTO khudii_admin_settings (bucket,content) VALUES (?,?) ON DUPLICATE KEY UPDATE content=VALUES(content)',[bucket,encoded]);
      }
      await connection.commit();
    }catch(e){await connection.rollback();throw e;}finally{connection.release();}
    return res.json({success:true,message:'Settings saved'});
  }catch(e){return err(res,e);}
}

const EXTENSIONS=/\.(png|jpe?g|gif|webp|svg|avif|mp4|mov)$/i;
const localPath=path.join(process.cwd(),'public');
async function localMedia(){
  const found=[];
  async function scan(dir,prefix='',depth=0){if(depth>3)return;
    const files=await fs.readdir(dir,{withFileTypes:true});
    for(const f of files){if(f.isDirectory() && !f.name.startsWith('.'))await scan(path.join(dir,f.name),prefix+encodeURIComponent(f.name)+'/',depth+1);
      else if(f.isFile()&&EXTENSIONS.test(f.name))found.push({url:'/'+prefix+encodeURIComponent(f.name),name:f.name,source:'site',size:null});
    }
  }
  try{await scan(localPath);}catch(e){console.error('[media local]',e.message);}return found;
}
async function withFtp(callback){
  if(!process.env.FTP_HOST || !process.env.FTP_USER || !(process.env.FTP_PASS || process.env.FTP_PASSWORD))return [];
  const c=new ftp.Client(Number(process.env.FTP_TIMEOUT_MS||20000));
  try{await c.access({host:process.env.FTP_HOST,port:Number(process.env.FTP_PORT||21),user:process.env.FTP_USER,password:process.env.FTP_PASS||process.env.FTP_PASSWORD,secure:process.env.FTP_SECURE==='true'});
    await c.ensureDir(process.env.FTP_UPLOAD_DIR||'/media');return await callback(c);
  }finally{c.close();}
}
export async function cmsGetMedia(req,res){
  try{await init();const [rows]=await sql.query('SELECT * FROM khudii_media_metadata');
    const meta=new Map(rows.map(r=>[r.url,r]));
    const existing=await localMedia();
    try{const remote=await withFtp(c=>c.list());const base=(process.env.FTP_BASE_URL||'https://media.khudii.com').replace(/\/$/,'');
      for(const f of remote){if(EXTENSIONS.test(f.name)&&!f.isDirectory) existing.push({url:base+'/'+encodeURIComponent(f.name),name:f.name,source:'uploads',size:f.size});}
    }catch(e){console.error('[media FTP listing]',e.message);}
    const all=new Map();for(const m of existing)all.set(m.url,{...m,...meta.get(m.url)});
    for(const m of rows){if(!all.has(m.url))all.set(m.url,{url:m.url,name:decodeURIComponent(m.url.split('/').pop()||''),source:'referenced',size:null,...m});}
    const search=String(req.query.search||'').trim().toLowerCase(),folder=String(req.query.folder||'main');
    const assets=[...all.values()].filter(a=>Boolean(a.trashed)===(folder==='trash')&&(!search||`${a.name} ${a.title||''} ${a.alt_text||''} ${a.tags||''}`.toLowerCase().includes(search))).sort((a,b)=>a.name.localeCompare(b.name));
    res.json({items:assets,total:assets.length});
  }catch(e){return err(res,e);}
}
function validMediaUrl(value){const s=String(value||'');if(s.length>768||!(s.startsWith('/')&&!s.startsWith('//')||s.startsWith((process.env.FTP_BASE_URL||'https://media.khudii.com').replace(/\/$/,'')+'/')))throw new Error('Invalid media URL');return s;}
export async function cmsUpdateMedia(req,res){
  try{
    await init();const url=validMediaUrl(req.body?.url);
    const title=cleanString(req.body.title,255),alt=cleanString(req.body.alt_text,500),caption=cleanString(req.body.caption,2000),tags=cleanString(req.body.tags,500),trashed=req.body.trashed?1:0;
    await sql.query('INSERT INTO khudii_media_metadata (url,title,alt_text,caption,tags,trashed) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),alt_text=VALUES(alt_text),caption=VALUES(caption),tags=VALUES(tags),trashed=VALUES(trashed)',[url,title,alt,caption,tags,trashed]);
    return res.json({success:true});
  }catch(e){console.error('[media update]',e?.code||e?.message);return res.status(e?.code==='ER_BAD_FIELD_ERROR'?503:422).json({success:false,message:e?.code==='ER_BAD_FIELD_ERROR'?'Apply the media database migration first.':e.message||'Unable to save media details'});}
}
// Check actual image signatures to prevent uploading executable scripts under image extensions.
function supportedImage(buffer,type){
  if(type==='png')return buffer.length>8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(type==='jpg'||type==='jpeg')return buffer.length>3&&buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
  if(type==='gif')return buffer.length>6&&['GIF87a','GIF89a'].includes(buffer.subarray(0,6).toString('ascii'));
  if(type==='webp')return buffer.length>12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP';
  if(type==='avif')return buffer.length>16&&buffer.toString('ascii',4,8)==='ftyp'&&['avif','avis'].includes(buffer.toString('ascii',8,12));
  return false;
}
export async function cmsUploadMedia(req,res){
  try{
    if(!process.env.FTP_HOST||!process.env.FTP_USER||!(process.env.FTP_PASS||process.env.FTP_PASSWORD))
      return res.status(503).json({success:false,message:'FTP storage is not configured'});
    await init();
    const {name,base64}=req.body||{};
    if(typeof name!=='string'||name.length>180||typeof base64!=='string'||base64.length>16_100_000)
      return res.status(413).json({success:false,message:'Invalid filename or image larger than 12 MB'});
    const type=String(name).split('.').pop().toLowerCase();
    if(!['png','jpg','jpeg','webp','gif','avif'].includes(type))
      return res.status(422).json({success:false,message:'Supported formats: PNG, JPEG, WebP, GIF and AVIF. SVG uploads are blocked for security.'});
    const match=base64.match(/^data:image\/(png|jpeg|webp|gif|avif);base64,([A-Za-z0-9+/=]+)$/);
    if(!match||((type==='jpg'||type==='jpeg')?match[1]!=='jpeg':match[1]!==type))
      return res.status(422).json({success:false,message:'File contents do not match the selected image format'});
    const buf=Buffer.from(match[2],'base64');
    if(!buf.length||buf.length>12_000_000||!supportedImage(buf,type))
      return res.status(422).json({success:false,message:'Invalid image data'});
    const filename=`khudii-${Date.now()}-${Math.random().toString(36).slice(2,10)}.${type==='jpeg'?'jpg':type}`;
    const result=await withFtp(c=>c.uploadFrom(Readable.from(buf),filename));
    if(!result)return res.status(503).json({success:false,message:'Unable to confirm FTP upload'});
    const url=(process.env.FTP_BASE_URL||'https://media.khudii.com').replace(/\/$/,'')+'/'+filename;
    // Index uploaded assets immediately so a temporary FTP listing failure does not hide them.
    await sql.query('INSERT INTO khudii_media_metadata(url,title,alt_text,caption,tags,trashed) VALUES (?,?,?,?,?,0) ON DUPLICATE KEY UPDATE title=VALUES(title)',[url,cleanString(name,255),'','','']);
    return res.status(201).json({success:true,url});
  }catch(e){console.error('[media upload]',e?.code||e?.message);return res.status(503).json({success:false,message:'Upload failed. Verify FTP storage and database access.'});}
}
