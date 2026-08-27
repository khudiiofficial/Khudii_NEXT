'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/componets/SuccessStoriesPageComponent/Success'), { ssr: true });
export default function Page() { return <PublicPage component={Component} seoPath="/success-stories" passSeo={true} />; }
