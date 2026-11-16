import CategoryDetailRoute from '@/components/CategoryDetailRoute';
import {generateKhudiiContentMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;return generateKhudiiContentMetadata('categories',slug);}
export default async function Page({params}){
  const {slug}=await params;
  const found=await resolveRedirect('/Categories/'+slug);
  if(found){if(found.status===308)permanentRedirect(found.target);redirect(found.target);}
  return <CategoryDetailRoute/>;
}
