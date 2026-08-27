'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { usePublicSeo } from './PublicShell';

import Categories from '@/legacy/public/pages/Categories/Categories';

export default function CategoryDetailRoute() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const { baseUrl } = usePublicSeo();
  const [category, setCategory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return undefined;
    const controller = new AbortController();

    axios
      .get(`/CBN/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => {
        setCategory(response.data?.data || null);
        setError('');
      })
      .catch((requestError) => {
        if (requestError?.code !== 'ERR_CANCELED') {
          console.error('Error fetching category:', requestError);
          setError('Failed to load this category.');
        }
      });

    return () => controller.abort();
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-[45vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-2xl font-semibold">Category not available</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <img src="/siteicon.png" alt="Loading" width="150" height="150" />
      </div>
    );
  }

  return <Categories cat={category} url={`${baseUrl}/Categories`} />;
}
