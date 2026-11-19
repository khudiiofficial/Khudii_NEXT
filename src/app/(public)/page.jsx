import ClientPage from './page.client';
import {generateKhudiiPageMetadata} from '@/server/seo-intelligence';
import {SEO_PAGE_CONTENT} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata(){
  return generateKhudiiPageMetadata('/', "Khudii - Pakistan's Digital Welfare Platform");
}
export default function Page(){
  const seo = SEO_PAGE_CONTENT.home;
  return (
    <>
      <section className="sr-only" aria-label="About Khudii Welfare Platform">
        <h1>{seo.h1}</h1>
        <h2>{seo.h2}</h2>
        {seo.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </section>
      <ClientPage />
    </>
  );
}
