import {notFound,redirect,permanentRedirect} from 'next/navigation';
import {resolveRedirect} from '@/server/site-diagnostics';
import {findPublishedPage} from '@/server/cms-v2/controller';
import {cmsV2Metadata} from '@/server/cms-v2/metadata';
import CmsV2Sections from '@/components/CmsV2Sections';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const asPath=async(params)=>{const {path}=await params;return '/'+(Array.isArray(path)?path.join('/'):String(path||''));};
export async function generateMetadata({params}){const path=await asPath(params);try{return await cmsV2Metadata(path)||{title:'Page not found',robots:{index:false,follow:false}};}catch{return {title:'Page unavailable',robots:{index:false,follow:false}};}}
export default async function PublicCatchAll({params}){
  const path=await asPath(params);
  const matched=await resolveRedirect(path);
  if(matched){if(matched.status===308)permanentRedirect(matched.target);redirect(matched.target);}
  const page=await findPublishedPage(path).catch(error=>{console.error('[CMS page]',error?.code||error?.message);return null});
  if(!page)notFound();
  return <CmsV2Sections page={page}/>;
}
