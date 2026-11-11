'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
import CmsPageLayout from '@/components/CmsPageLayout';
const Component = dynamic(() => import('@/legacy/public/pages/Success-Stories-detail/SuccessStoryDetail'), { ssr: true });
export default function Page() { return <CmsPageLayout slug="/success-stories/[slug]"><PublicPage component={Component} seoPath="" passSeo={true} /></CmsPageLayout>; }
