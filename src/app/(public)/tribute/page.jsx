import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata(){return generateKhudiiPageMetadata('/tribute','Tribute');}
export default async function Page(){const r=await resolveRedirect('/tribute');if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <ClientPage/>;}
