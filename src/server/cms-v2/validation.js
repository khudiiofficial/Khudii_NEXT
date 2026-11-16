export class CmsError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'CmsError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
export const fail = (status, code, message, fields) => { throw new CmsError(status, code, message, fields); };
const limits = { category_key: 100, name: 180, slug: 180, page_key: 140, tab_key: 140, section_key: 140, item_key: 140, entity_key: 180, title: 255, label: 180, description: 500, path: 700, url: 1000, meta_title: 255, meta_description: 500, meta_keywords: 5000, canonical_url: 1000, og_title: 255, og_description: 500, og_image: 1000, icon_name: 100, css_class: 100, source_key: 140, section_type: 72, og_type: 40, sitemap_changefreq: 20, twitter_card: 30, link_type: 20, display_mode: 20, page_kind: 20, entity_type: 30, status: 20 };
const booleans = new Set(['is_visible','is_published','show_in_menu','open_new_tab','robots_noindex','robots_nofollow','include_in_sitemap']);
const integers = new Set(['parent_id','category_id','parent_page_id','page_id','tab_id','parent_tab_id','sort_order','revision']);
const jsonFields = new Set(['payload','banner_settings','layout_settings','structured_data','seo_settings']);
const enumValues = { status:['draft','published','archived'], page_kind:['standard','landing','template'], display_mode:['tabs','accordion','pills','hidden'], location:['header','footer','topbar'], link_type:['page','internal','external','anchor','group'], entity_type:['page','organization','blog','podcast','story','category'], og_type:['website','article','profile','video.other'], twitter_card:['summary','summary_large_image'], sitemap_changefreq:['always','hourly','daily','weekly','monthly','yearly','never'] };
export const RESOURCE_DEFS = {
  categories: { table:'khudii_content_categories', write:'pages.write', read:'pages.read', required:['category_key','name','slug'], fields:['category_key','name','slug','description','parent_id','sort_order','is_published'] },
  pages: { table:'khudii_site_pages', write:'pages.write', read:'pages.read', required:['page_key','title','slug','path'], fields:['page_key','category_id','parent_page_id','title','slug','path','page_kind','status','show_in_menu','sort_order','banner_settings','layout_settings'] },
  tabs: { table:'khudii_page_tabs', write:'pages.write', read:'pages.read', required:['page_id','tab_key','label','slug'], fields:['page_id','parent_tab_id','tab_key','label','slug','sort_order','is_published','display_mode'] },
  sections: { table:'khudii_page_sections', write:'sections.manage',read:'pages.read', required:['page_id','section_key','section_type','title','payload'], fields:['page_id','tab_id','section_key','source_key','section_type','title','payload','sort_order','is_published'] },
  navigation: { table:'khudii_navigation_items',write:'navigation.manage',read:'pages.read', required:['item_key','location','label','link_type'], fields:['item_key','location','parent_id','page_id','label','link_type','url','sort_order','is_visible','open_new_tab','icon_name','css_class'] },
  seo: { table:'khudii_page_seo',write:'seo.manage',read:'seo.read', required:['entity_type','entity_key','path'], fields:['page_id','entity_type','entity_key','path','meta_title','meta_description','meta_keywords','canonical_url','og_title','og_description','og_image','og_type','twitter_card','robots_noindex','robots_nofollow','include_in_sitemap','sitemap_priority','sitemap_changefreq','structured_data','seo_settings'] }
};
export function idValue(value, optional = true) {
  if ((value === null || value === '' || value === undefined) && optional) return null;
  const id = Number(value);
  if (typeof value === 'boolean' || !Number.isSafeInteger(id) || id < 1) fail(422,'invalid_id','A positive integer ID is required');
  return id;
}
export function pathValue(raw) {
  if(typeof raw !== 'string') fail(422,'invalid_path','Path must be a string');
  let value=raw.trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('?') || value.includes('#') || value.includes('\\') || /[\x00-\x1f]/.test(value) || /\/{2,}/.test(value) || /\/(?:\.|\.\.)\//.test(value)) fail(422,'invalid_path','Use a normalized local path');
  if(value.length > 1) value = value.replace(/\/+$/,'');
  if(value.length>700) fail(422,'invalid_path','Path exceeds 700 characters');
  const reserved=['/admin-app','/api-app','/media-app','/letskhudii','/_next','/favicon.ico','/robots.txt','/sitemap.xml'];
  if(reserved.some(prefix=>value===prefix || value.startsWith(prefix+'/')))fail(422,'reserved_path','This route is reserved');
  if(!/^\/(?:[a-z0-9][a-z0-9-_]*\/)*[a-z0-9][a-z0-9-_]*\/?$/.test(value) && value!=='/')fail(422,'invalid_path','Use lowercase URL-safe path segments');
  return value;
}
function safeExternal(url){
  try { const value=new URL(url); return (value.protocol==='https:' || value.protocol==='http:') && !value.username && !value.password; } catch { return false; }
}
function safeUrl(raw, type) {
  if (raw === null || raw === '') return null;
  if(typeof raw !== 'string' || raw.length>1000) fail(422,'invalid_url','URL is invalid');
  if(type==='external'){if(!safeExternal(raw))fail(422,'invalid_url','External links must use HTTP(S)');return raw;}
  if(type==='anchor'){if(!/^#[a-zA-Z][a-zA-Z0-9_-]{0,99}$/.test(raw))fail(422,'invalid_url','Invalid anchor');return raw;}
  return pathValue(raw);
}
export function validatePayload(resource, payload, mode='create') {
  const def=RESOURCE_DEFS[resource];
  if(!def)fail(404,'resource_not_found','Unknown CMS resource');
  if(!payload || typeof payload!=='object' || Array.isArray(payload))fail(422,'invalid_body','A JSON object is required');
  const out={};
  for(const [key,value] of Object.entries(payload)) {
    if(key==='revision' && mode!=='create') { out.revision=idValue(value,false); continue; }
    if(key==='force') continue;
    if(!def.fields.includes(key))fail(422,'invalid_field',`Unsupported field: ${key}`,{[key]:'Unsupported field'});
    if(value===null){out[key]=null;continue;}
    if(booleans.has(key)){if(typeof value !== 'boolean')fail(422,'invalid_boolean',`${key} must be true or false`);out[key]=value?1:0;continue;}
    if(integers.has(key)){if(key==='sort_order'){const n=Number(value);if(!Number.isSafeInteger(n)||n<0||n>1000000)fail(422,'invalid_order','Sort order out of range');out[key]=n;}else{out[key]=idValue(value,key!=='page_id');}continue;}
    if(key==='sitemap_priority'){const n=Number(value);if(!Number.isFinite(n)||n<0||n>1)fail(422,'invalid_priority','Sitemap priority must be 0–1');out[key]=n;continue;}
    if(jsonFields.has(key)){if(typeof value!=='object'||Array.isArray(value))fail(422,'invalid_json',`${key} must be a JSON object`);const encoded=JSON.stringify(value);if(encoded.length>100000)fail(422,'payload_too_large',`${key} exceeds 100 KB`);out[key]=encoded;continue;}
    if(typeof value!=='string')fail(422,'invalid_string',`${key} must be text`);
    const normalized=value.trim();
    if(normalized.length>(limits[key]||1000))fail(422,'too_long',`${key} is too long`);
    if(enumValues[key]&&!enumValues[key].includes(normalized))fail(422,'invalid_choice',`Invalid ${key}`);
    if(key==='path')out[key]=pathValue(normalized);
    else if(['slug','category_key','page_key','tab_key','section_key','item_key'].includes(key)) {
      if(!/^[a-z0-9][a-z0-9_-]{0,179}$/.test(normalized))fail(422,'invalid_slug',`Invalid ${key}`);
      out[key]=normalized;
    } else out[key]=normalized;
  }
  if(mode==='create') for(const required of def.required)if(out[required]===undefined||out[required]===null||out[required]==='')fail(422,'required_field',`${required} is required`,{[required]:'Required'});
  if(resource==='navigation') {
    const kind=out.link_type??payload.link_type;
    if(kind==='group'&&(out.url||out.page_id))fail(422,'invalid_link','Group links may not have targets');
    if(kind==='page' && !out.page_id && mode==='create')fail(422,'invalid_link','Page ID required for page link');
    if(['internal','external','anchor'].includes(kind)){if(!out.url && mode==='create')fail(422,'invalid_link','URL required');if(out.url)out.url=safeUrl(out.url,kind);}
  }
  if(resource==='sections' && out.payload){
    const data=payload.payload?.data||payload.payload;
    if(data && typeof data==='object'){
      for(const key of ['image','buttonUrl'])if(data[key]){
        const raw=data[key];if(typeof raw!=='string'||!(raw.startsWith('/')&&!raw.startsWith('//')||safeExternal(raw)))fail(422,'invalid_section_link',`Invalid section ${key}`);
      }
      if(data.items!==undefined){if(!Array.isArray(data.items)||data.items.length>100)fail(422,'invalid_items','Section items must be an array with at most 100 entries');
        for(const item of data.items){if(!item||typeof item!=='object')fail(422,'invalid_item','Section item must be an object');for(const key of ['url','image'])if(item[key]&&(typeof item[key]!=='string'||!(item[key].startsWith('/')&&!item[key].startsWith('//')||safeExternal(item[key]))))fail(422,'invalid_item_url',`Invalid item ${key}`);}
      }
    }
  }
  if(resource==='seo'){
    if(out.canonical_url && !safeExternal(out.canonical_url))fail(422,'invalid_canonical','Canonical must use HTTP(S)');
    if(out.og_image && !(safeExternal(out.og_image)||out.og_image.startsWith('/')))fail(422,'invalid_image','OG image URL invalid');
  }
  return out;
}
const CANONICAL_PATH_BY_LABEL = {
  home: '/',
  about: '/about-khudii',
  'about us': '/about-khudii',
  organizations: '/organizations',
  'golden people': '/golden-people',
  contact: '/contact',
  'contact us': '/contact',
  blogs: '/blog',
  blog: '/blog',
  faqs: '/faqs',
  faq: '/faqs',
  testimonials: '/testimonials',
  podcast: '/podcast',
  podcasts: '/podcast',
  videos: '/videos',
  'success stories': '/success-stories',
  'social media': '/social-media',
  tribute: '/tribute',
  volunteer: '/volunteer',
  jobs: '/jobs',
  health: '/categories/health',
  autism: '/categories/autism',
  orphanage: '/categories/orphanage',
  thalassemia: '/categories/thalassemia',
  'visually impaired': '/categories/visually-impaired',
  education: '/categories/education',
  'differently abled': '/categories/differently-abled',
  'water and food': '/categories/water-and-food',
};

function resolveTreeHref(row) {
  if (row.link_type === 'group') return null;
  if (row.page_path) return row.page_path;
  if (row.url) return row.url.startsWith('/') ? row.url : (row.link_type === 'external' ? row.url : `/${row.url}`);
  const key = String(row.label || '').trim().toLowerCase();
  return CANONICAL_PATH_BY_LABEL[key] || null;
}

export function publicNavigationTree(rows) {
  const map=new Map(rows.map(row=>[row.id,{id:row.id,key:row.item_key,label:row.label,location:row.location,href:resolveTreeHref(row),link_type:row.link_type,open_new_tab:!!row.open_new_tab,icon_name:row.icon_name,children:[]} ]));
  const roots=[];
  for(const row of rows){const item=map.get(row.id), parent=map.get(row.parent_id);if(parent&&row.location===parent.location)parent.children.push(item);else roots.push(item);}
  return roots;
}
