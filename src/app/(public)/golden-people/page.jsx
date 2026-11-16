import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata(){return generateKhudiiPageMetadata('/golden-people','Golden People');}
export default async function Page(){const r=await resolveRedirect('/golden-people');if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <ClientPage/>;}
