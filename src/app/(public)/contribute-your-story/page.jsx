import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import {SEO_PAGE_CONTENT} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata(){
  return generateKhudiiPageMetadata('/contribute-your-story','Contribute Your Story - Share Community Impact on Khudii');
}
export default async function Page(){
  const r=await resolveRedirect('/contribute-your-story');
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  const seo = SEO_PAGE_CONTENT['contribute-your-story'];
  return (
    <>
      {seo && (
        <section className="sr-only" aria-label="Contribute Community Story">
          <h1>{seo.h1}</h1>
          <h2>{seo.h2}</h2>
          {seo.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </section>
      )}
      <ClientPage/>
    </>
  );
}
