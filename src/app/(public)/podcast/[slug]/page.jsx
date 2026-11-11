import { notFound } from 'next/navigation';
import { publicPageSeo } from '@/server/seo-intelligence';
import { getPublicSeoDefaults } from '@/server/public-seo-defaults';
import { getPublishedPodcastBySlug } from '@/server/podcast-controller';
import PodcastEpisodeCards from '@/components/podcast/PodcastEpisodeCards';
import CmsPageLayout from '@/components/CmsPageLayout';
import PageHeader from '@/legacy/public/componets/PageHeader/PageHeader';

export const dynamic='force-dynamic';
async function getEpisode(params){
  const {slug}=await params;
  if(!/^[a-z0-9-]{1,180}$/.test(slug||''))return null;
  try{return await getPublishedPodcastBySlug(slug);}catch(e){console.error('[podcast detail]',e.message);return null;}
}
export async function generateMetadata({params}){
  const episode=await getEpisode(params);
  if(!episode)return {title:'Podcast episode not found',robots:{index:false,follow:false}};
  const path=`/podcast/${episode.slug}`;
  const [override,settings]=await Promise.all([publicPageSeo(path),getPublicSeoDefaults()]);
  const site=String(settings.canonical_domain||process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
  const title=override?.meta_title||episode.seo_title||episode.title;
  const description=override?.meta_description||episode.seo_description||episode.description||'Khudii podcast episode';
  const image=override?.og_image||episode.seo_image||`https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`;
  const index=settings.allow_indexing!==false&&!override?.noindex;
  return {title,description,robots:{index,follow:index},keywords:(override?.meta_keywords||episode.seo_keywords||'').split(',').map(v=>v.trim()).filter(Boolean),alternates:{canonical:site+path},openGraph:{type:'video.other',title:override?.og_title||title,description:override?.og_description||description,images:[image],url:site+path},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export default async function PodcastEpisodePage({params}){
  const episode=await getEpisode(params);if(!episode)notFound();
  const jsonLd={'@context':'https://schema.org','@type':'VideoObject',name:episode.title,description:episode.description||episode.seo_description||episode.title,thumbnailUrl:episode.seo_image||`https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`,embedUrl:`https://www.youtube-nocookie.com/embed/${episode.youtube_id}`,url:`https://www.youtube.com/watch?v=${episode.youtube_id}`};
  return <CmsPageLayout slug="/podcast/[slug]"><PageHeader title={episode.title} breadcrumbs={[{label:'Home',link:'/'},{label:'Podcast',link:'/podcast'},{label:episode.title}]}/><section className="mx-auto max-w-4xl px-5 py-12"><PodcastEpisodeCards episodes={[episode]} single/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/></section></CmsPageLayout>;
}
