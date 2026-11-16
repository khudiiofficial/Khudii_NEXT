import ClientPage from './page.client';
import {findPublishedPage} from '@/server/cms-v2/controller';
import {cmsV2Metadata} from '@/server/cms-v2/metadata';
import CmsV2Sections from '@/components/CmsV2Sections';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;return await cmsV2Metadata('/'+slug).catch(()=>null)||{};}
export default async function Page({params}){const {slug}=await params;const path='/'+slug;const r=await resolveRedirect(path);if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}const page=await findPublishedPage(path).catch(()=>null);if(page)return <CmsV2Sections page={page}/>;return <ClientPage/>;}
