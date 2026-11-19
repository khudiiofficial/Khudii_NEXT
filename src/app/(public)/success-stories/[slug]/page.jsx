import {generateKhudiiContentMetadata, getPublicStoryBySlug} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import ClientPage from './page.client';
import {getPageJsonLd, plainText} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {slug}=await params;
  return generateKhudiiContentMetadata('stories',slug);
}
export default async function Page({params}){
  const {slug}=await params;
  const r=await resolveRedirect('/success-stories/'+slug);
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  
  const story = await getPublicStoryBySlug(slug);
  const jsonLd = story ? getPageJsonLd(`/success-stories/${slug}`, {
    type: 'VideoObject',
    title: story.title,
    description: story.meta_description || story.description,
    youtube_id: story.youtube_id,
    created_at: story.created_at
  }) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {story && (
        <section className="sr-only" aria-label="Success Story Summary">
          <h1>{story.title}</h1>
          <h2>Success Story Impact Overview</h2>
          <p>{plainText(story.description)}</p>
          <p>
            This inspiring success story highlights the transformative impact of verified welfare initiatives across Pakistan, supported by donors, humanitarian workers, and community volunteers on the Khudii platform.
          </p>
        </section>
      )}
      <ClientPage />
    </>
  );
}
