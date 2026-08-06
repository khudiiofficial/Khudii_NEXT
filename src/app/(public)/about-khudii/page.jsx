'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/About/About'), { ssr: false });
export default function Page() { return <PublicPage component={Component} seoPath="/about-khudii" passSeo={true} />; }
