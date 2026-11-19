import {generateKhudiiContentMetadata, getPublicOrganizationBySlug} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import OrganizationDetailRoute from '@/components/OrganizationDetailRoute';
import {getPageJsonLd, plainText} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {slug}=await params;
  return generateKhudiiContentMetadata('organizations',slug);
}
export default async function Page({params}){
  const {slug}=await params;
  const r=await resolveRedirect('/organization/'+slug);
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  
  const org = await getPublicOrganizationBySlug(slug);
  const jsonLd = org ? getPageJsonLd(`/organization/${slug}`, {
    type: 'Organization',
    name: org.name,
    description: org.description,
    image: org.partner_image || org.introductory_image_path,
    address: org.address,
    city: org.city,
    phone: org.phone,
    email: org.email,
    website: org.website
  }) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {org && (
        <section className="sr-only" aria-label="Organization Details">
          <h1>{org.name} - Welfare Organization in Pakistan</h1>
          <h2>About {org.name}</h2>
          <p>{plainText(org.description)}</p>
          {org.city && <p>Location: {org.city}, Pakistan</p>}
          {org.category && <p>Welfare Focus: {org.category}</p>}
          <p>
            Khudii provides independent verification and visibility for {org.name} to help Pakistani donors and volunteers connect directly with authentic community causes.
          </p>
        </section>
      )}
      <OrganizationDetailRoute initialData={org} />
    </>
  );
}
