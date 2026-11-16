import {generateKhudiiContentMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import BlogDetailRoute from '@/components/BlogDetailRoute';

function ClientPage() {
  return <BlogDetailRoute />;
}

export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;return generateKhudiiContentMetadata('blogs',slug);}
export default async function Page({params}){const {slug}=await params;const r=await resolveRedirect('/Blog/'+slug);if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}return <ClientPage/>;}
