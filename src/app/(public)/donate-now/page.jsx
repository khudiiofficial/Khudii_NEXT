'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/DonateNow/Donate'), { ssr: true });
export default function Page() { return <PublicPage component={Component} seoPath="/donate-now" passSeo={true} />; }
