'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
import CmsPageLayout from '@/components/CmsPageLayout';
const Component = dynamic(() => import('@/legacy/public/componets/organizationform/orgForm'), { ssr: true });
export default function Page() { return <CmsPageLayout slug="/organization/registration"><PublicPage component={Component} seoPath="" passSeo={false} /></CmsPageLayout>; }
