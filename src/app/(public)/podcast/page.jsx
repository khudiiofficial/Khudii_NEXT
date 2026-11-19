import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import PodcastGallery from '@/components/podcast/PodcastGallery';
import {SEO_PAGE_CONTENT} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata(){
  return generateKhudiiPageMetadata('/podcast','Khudii Podcast - Voices of Pakistan Welfare Leaders');
}

export default async function PodcastPage() {
  const r=await resolveRedirect('/podcast');
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  const seo = SEO_PAGE_CONTENT.podcast;
  return (
    <>
      {seo && (
        <section className="sr-only" aria-label="Khudii Podcast Overview">
          <h1>{seo.h1}</h1>
          <h2>{seo.h2}</h2>
          {seo.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </section>
      )}
      <PodcastGallery />
    </>
  );
}
