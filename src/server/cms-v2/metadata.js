import {findPublishedPage} from './controller.js';
const SITE=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
export async function cmsV2Metadata(path){
  const page=await findPublishedPage(path);
  if(!page)return null;
  const seo=page.seo||{},title=seo.meta_title||page.title;
  const desc=seo.meta_description||undefined;
  const canonical=seo.canonical_url||`${SITE}${page.path}`;
  const robots={index:!seo.robots_noindex,follow:!seo.robots_nofollow};
  return {title,description:desc,alternates:{canonical},robots,keywords:seo.meta_keywords||undefined,openGraph:{title:seo.og_title||title,description:seo.og_description||desc,url:canonical,type:['article','website','profile'].includes(seo.og_type)?seo.og_type:'website',images:seo.og_image?[seo.og_image]:[]},twitter:{card:seo.twitter_card||'summary_large_image',title:seo.og_title||title,description:seo.og_description||desc,images:seo.og_image?[seo.og_image]:[]}};
}
export async function cmsV2Sitemap(){
  const db=(await import('../admin-backend/Database/oldDB.js')).default;
  const [rows]=await db.promise().query("SELECT p.path,p.updated_at,s.sitemap_priority,s.sitemap_changefreq FROM khudii_site_pages p LEFT JOIN khudii_page_seo s ON s.entity_type='page' AND s.path=p.path AND s.deleted_at IS NULL WHERE p.status='published' AND p.deleted_at IS NULL AND COALESCE(s.robots_noindex,0)=0 AND COALESCE(s.include_in_sitemap,1)=1");
  return rows.map(row=>({url:`${SITE}${row.path}`,lastModified:row.updated_at,changeFrequency:row.sitemap_changefreq||'monthly',priority:Number(row.sitemap_priority??0.6)}));
}
