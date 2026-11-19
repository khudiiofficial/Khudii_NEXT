import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import {SEO_PAGE_CONTENT} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata(){
  return generateKhudiiPageMetadata('/certifications','Khudii Certifications & Legal Non-Profit Compliance');
}
export default async function Page(){
  const r=await resolveRedirect('/certifications');
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  const seo = SEO_PAGE_CONTENT.certifications;
  return (
    <>
      {seo && (
        <section className="sr-only" aria-label="Certifications and Compliance">
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
