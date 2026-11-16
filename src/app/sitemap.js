import {getSitemapContentUrls} from '@/server/seo-intelligence';
import {cmsV2Sitemap} from '@/server/cms-v2/metadata';
export const dynamic='force-dynamic';
export default async function sitemap(){
  try{const [legacy,dynamicPages]=await Promise.all([getSitemapContentUrls(),cmsV2Sitemap().catch(()=>[])]);return [...new Map([...legacy,...dynamicPages].map(item=>[item.url,item])).values()];}
  catch(e){console.error('[sitemap generation]',e.code||e.message);const base=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');return [{url:base+'/',changeFrequency:'weekly',priority:1}];}
}
