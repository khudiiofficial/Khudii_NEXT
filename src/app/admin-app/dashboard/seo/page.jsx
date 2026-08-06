'use client';
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('@/legacy/admin/Pages/SEO/Seo'), { ssr: false });
export default function Page() { return <Component />; }
