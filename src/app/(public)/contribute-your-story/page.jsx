'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/ContributeStory/Contribute'), { ssr: true });
export default function Page() { return <PublicPage component={Component} seoPath="/contribute-your-story" passSeo={true} />; }
