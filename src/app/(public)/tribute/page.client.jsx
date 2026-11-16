'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/Tribute/Tribute'), { ssr: true });
export default function Page() { return <PublicPage component={Component} seoPath="/tribute" passSeo={true} />; }
