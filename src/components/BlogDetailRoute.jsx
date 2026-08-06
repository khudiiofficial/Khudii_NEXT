'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { usePublicSeo } from './PublicShell';

const BlogDetails = dynamic(
  () => import('@/legacy/public/pages/SpecificBlog/SpecificBlog'),
  { ssr: false },
);

export default function BlogDetailRoute() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const { baseUrl } = usePublicSeo();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return undefined;
    const controller = new AbortController();

    axios
      .get(`/Blog/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => {
        setBlog(response.data);
        setError('');
      })
      .catch((requestError) => {
        if (requestError?.code !== 'ERR_CANCELED') {
          console.error('Error fetching blog:', requestError);
          setError('Failed to load this blog post.');
        }
      });

    return () => controller.abort();
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-[45vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-2xl font-semibold">Unable to load content</h1>
        <p className="mb-5 text-gray-600">{error}</p>
        <button type="button" className="rounded bg-[#0b6d3f] px-5 py-2 text-white" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <img src="/siteicon.png" alt="Loading" width="150" height="150" />
      </div>
    );
  }

  return <BlogDetails blog={blog} url={`${baseUrl}/Blog`} />;
}
