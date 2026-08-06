'use client';

import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';

const ErrorPage = dynamic(
  () => import('@/legacy/public/pages/Error/Error'),
  { ssr: false },
);

export default function NotFound() {
  return <PublicPage component={ErrorPage} seoPath="" passSeo />;
}
