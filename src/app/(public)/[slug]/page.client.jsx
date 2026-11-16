'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
import CmsPageLayout from '@/components/CmsPageLayout';
const Component = dynamic(() => import('@/legacy/public/pages/DetailforAll/Detailforall'), { ssr: true });
export default function Page() { return <CmsPageLayout slug="/[slug]"><PublicPage component={Component} seoPath="" passSeo={true} /></CmsPageLayout>; }
