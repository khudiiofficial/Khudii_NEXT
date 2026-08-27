'use client';

import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePublicSeo } from './PublicShell';

import OrganizationDetail from '@/legacy/public/pages/OrganizationDetail/Organization_Detail';

export default function OrganizationDetailRoute() {
  const { slug } = useParams();
  const { baseUrl } = usePublicSeo();
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    axios
      .get(`/item/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((response) => setOrganization(response.data))
      .catch((requestError) => {
        if (requestError?.code !== 'ERR_CANCELED') {
          setError(requestError?.response?.data?.message || 'Unable to load organization');
        }
      });
    return () => controller.abort();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Organization not found</h1>
        <p>{error}</p>
      </div>
    );
  }
  if (!organization) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7001e] border-t-transparent" />
      </div>
    );
  }
  return <OrganizationDetail org={organization} url={`${baseUrl}/organization`} />;
}
