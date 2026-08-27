'use client';
import dynamic from 'next/dynamic';
import PublicPage from '@/components/PublicPage';
const Component = dynamic(() => import('@/legacy/public/pages/Success-Stories-detail/SuccessStoryDetail'), { ssr: true });
export default function Page() { return <PublicPage component={Component} seoPath="" passSeo={true} />; }
