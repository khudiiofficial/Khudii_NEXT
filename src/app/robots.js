import {getPublicSeoDefaults} from '@/server/public-seo-defaults';
export const dynamic='force-dynamic';
export default async function robots(){
  const seo=await getPublicSeoDefaults();
  const site=(seo.canonical_domain||process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
  const indexing=seo.allow_indexing!==false;
  const extras=Array.isArray(seo.additional_disallow_paths)?seo.additional_disallow_paths.filter(p=>typeof p==='string'&&/^\/(?!\/)[a-zA-Z0-9_./*~-]{1,150}$/.test(p)).slice(0,30):[];
  const rules=[{userAgent:'*',...(indexing?{allow:'/',disallow:['/admin-app/','/api-app/','/letskhudii/',...extras]}:{disallow:'/'})}];
  if(indexing && seo.ai_search_crawlers===false)rules.push({userAgent:['OAI-SearchBot','PerplexityBot','Claude-SearchBot'],disallow:'/'});
  if(indexing && seo.ai_training_crawlers!==true)rules.push({userAgent:['GPTBot','ClaudeBot','CCBot','Bytespider'],disallow:'/'});
  if(indexing && seo.cohere_crawler_access===false)rules.push({userAgent:'cohere-ai',disallow:'/'});
  return {rules,sitemap:site+'/sitemap.xml',host:site};
}
