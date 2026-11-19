import ClientPage from './page.client';
import {findPublishedPage} from '@/server/cms-v2/controller';
import {cmsV2Metadata} from '@/server/cms-v2/metadata';
import CmsV2Sections from '@/components/CmsV2Sections';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {slug}=await params;
  const path='/'+slug;
  const cmsMeta=await cmsV2Metadata(path).catch(()=>null);
  if(cmsMeta && cmsMeta.title)return cmsMeta;
  const fallbackTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return generateKhudiiPageMetadata(path, fallbackTitle);
}
export default async function Page({params}){
  const {slug}=await params;
  const path='/'+slug;
  const r=await resolveRedirect(path);
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  const page=await findPublishedPage(path).catch(()=>null);
  if(page)return <CmsV2Sections page={page}/>;
  return <ClientPage/>;
}
