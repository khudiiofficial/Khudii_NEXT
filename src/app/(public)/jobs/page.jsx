'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/Jobs/Jobs'), { ssr: false });
export default function Page() { return <PublicPage component={Component} seoPath="/jobs" passSeo={true} />; }
