import {generateKhudiiContentMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import OrganizationDetailRoute from '@/components/OrganizationDetailRoute';
function ClientPage() { return <OrganizationDetailRoute />; }

export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;return generateKhudiiContentMetadata('organizations',slug);}
export default async function Page({params}){const {slug}=await params;const r=await resolveRedirect('/organization/'+slug);if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <ClientPage/>;}
