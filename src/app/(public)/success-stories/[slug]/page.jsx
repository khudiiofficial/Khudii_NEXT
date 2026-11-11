import {generateKhudiiContentMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import ClientPage from './page.client';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;return generateKhudiiContentMetadata('stories',slug);}
export default async function Page({params}){const {slug}=await params;const r=await resolveRedirect('/success-stories/'+slug);if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <ClientPage/>;}
