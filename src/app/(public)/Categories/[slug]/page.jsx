import CategoryDetailRoute from '@/components/CategoryDetailRoute';
import {generateKhudiiContentMetadata, getPublicCategoryBySlug} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import {getPageJsonLd, plainText} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {slug}=await params;
  return generateKhudiiContentMetadata('categories',slug);
}
export default async function Page({params}){
  const {slug}=await params;
  const found=await resolveRedirect('/Categories/'+slug);
  if(found){if(found.status===308)permanentRedirect(found.target);redirect(found.target);}
  
  const category = await getPublicCategoryBySlug(slug);
  const name = category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const jsonLd = getPageJsonLd(`/categories/${slug}`, {
    type: 'WebPage',
    title: `${name} Welfare Organizations in Pakistan | Khudii`,
    description: `Discover verified ${name} charities, non-profits, and welfare initiatives across Pakistan on Khudii.`
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="sr-only" aria-label="Category Overview">
        <h1>{name} Welfare Organizations in Pakistan</h1>
        <h2>Overview of {name} Charities & Initiatives</h2>
        <p>
          Explore verified welfare organizations, charity initiatives, and non-profit projects specializing in {name} across Pakistan. Khudii connects donors and volunteers with authenticated community programs operating in Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, and Gilgit-Baltistan.
        </p>
        <p>
          Each listed organization undergoes rigorous verification to confirm valid legal registration, authentic leadership, and transparent service delivery for Pakistani communities in need.
        </p>
      </section>
      <CategoryDetailRoute />
    </>
  );
}
