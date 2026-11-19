import { notFound } from 'next/navigation';
import { publicPageSeo } from '@/server/seo-intelligence';
import { getPublicSeoDefaults } from '@/server/public-seo-defaults';
import { getPublishedPodcastBySlug } from '@/server/podcast-controller';
import PodcastEpisodeCards from '@/components/podcast/PodcastEpisodeCards';
import CmsPageLayout from '@/components/CmsPageLayout';
import PageHeader from '@/legacy/public/componets/PageHeader/PageHeader';
import { formatSeoTitle, formatSeoDescription, plainText } from '@/lib/seo';

export const dynamic='force-dynamic';
async function getEpisode(params){
  const {slug}=await params;
  if(!/^[a-zA-Z0-9_-]{1,180}$/.test(slug||''))return null;
  try{return await getPublishedPodcastBySlug(slug);}catch(e){console.error('[podcast detail]',e.message);return null;}
}
export async function generateMetadata({params}){
  const episode=await getEpisode(params);
  if(!episode)return {title:'Podcast episode not found',robots:{index:false,follow:false}};
  const path=`/podcast/${episode.slug}`;
  const [override,settings]=await Promise.all([publicPageSeo(path),getPublicSeoDefaults()]);
  const site=String(settings.canonical_domain||process.env.NEXT_PUBLIC_SITE_URL||'https://www.khudii.com').replace(/\/+$/,'');
  const title=formatSeoTitle(override?.meta_title||episode.seo_title||episode.title);
  const description=formatSeoDescription(override?.meta_description||episode.seo_description||episode.description, episode.title);
  const image=override?.og_image||episode.seo_image||`https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`;
  const index=settings.allow_indexing!==false&&!override?.noindex;
  return {
    title,
    description,
    robots:{index,follow:index},
    keywords:(override?.meta_keywords||episode.seo_keywords||'').split(',').map(v=>v.trim()).filter(Boolean),
    alternates:{canonical:site+path},
    openGraph:{
      type:'video.other',
      title,
      description,
      images:[image],
      url:site+path
    },
    twitter:{
      card:'summary_large_image',
      title,
      description,
      images:[image]
    }
  };
}
export default async function PodcastEpisodePage({params}){
  const episode=await getEpisode(params);if(!episode)notFound();
  const desc = plainText(episode.description || episode.seo_description || episode.title);
  const jsonLd={
    '@context':'https://schema.org',
    '@type':'VideoObject',
    name:episode.title,
    description:formatSeoDescription(desc, episode.title),
    thumbnailUrl:episode.seo_image||`https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`,
    embedUrl:`https://www.youtube-nocookie.com/embed/${episode.youtube_id}`,
    url:`https://www.youtube.com/watch?v=${episode.youtube_id}`
  };
  return (
    <CmsPageLayout slug="/podcast/[slug]">
      <PageHeader title={episode.title} breadcrumbs={[{label:'Home',link:'/'},{label:'Podcast',link:'/podcast'},{label:episode.title}]}/>
      <section className="mx-auto max-w-4xl px-5 py-12">
        <h2 className="sr-only">Episode Overview & Video Player</h2>
        <PodcastEpisodeCards episodes={[episode]} single/>
        <div className="sr-only">
          <p>{desc}</p>
          <p>
            The Khudii Podcast features in-depth conversations with prominent humanitarians, medical directors, and community builders across Pakistan, fostering transparent welfare awareness and inspiring national solidarity.
          </p>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
      </section>
    </CmsPageLayout>
  );
}
