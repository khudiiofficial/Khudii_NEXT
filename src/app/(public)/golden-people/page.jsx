'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/GoldenPeople/Golden_people'), { ssr: false });
export default function Page() { return <PublicPage component={Component} seoPath="/golden-people" passSeo={true} />; }
