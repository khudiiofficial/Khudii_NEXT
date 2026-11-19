import {generateKhudiiContentMetadata, getPublicBlogBySlug} from '@/server/seo-intelligence';
import {resolveRedirect} from '@/server/site-diagnostics';
import {redirect,permanentRedirect} from 'next/navigation';
import BlogDetailRoute from '@/components/BlogDetailRoute';
import {getPageJsonLd, plainText} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const {slug}=await params;
  return generateKhudiiContentMetadata('blogs',slug);
}
export default async function Page({params}){
  const {slug}=await params;
  const r=await resolveRedirect('/Blog/'+slug);
  if(r){if(r.status===308)permanentRedirect(r.target);redirect(r.target);}
  
  const blog = await getPublicBlogBySlug(slug);
  const jsonLd = blog ? getPageJsonLd(`/blog/${slug}`, {
    type: 'Article',
    title: blog.Name,
    description: blog.meta_description || blog.INTRO,
    image: blog.image_path,
    created_at: blog.created_at,
    updated_at: blog.updated_at
  }) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {blog && (
        <section className="sr-only" aria-label="Blog Article Summary">
          <h1>{blog.Name}</h1>
          <h2>{blog.subheading || 'Welfare Article Overview'}</h2>
          <p>{plainText(blog.INTRO || blog.description)}</p>
          <p>
            Published on Khudii - Pakistan's dedicated non-profit digital welfare platform. Discover in-depth articles on healthcare, education, community support, and social welfare initiatives across Pakistan.
          </p>
        </section>
      )}
      <BlogDetailRoute initialData={blog} />
    </>
  );
}
