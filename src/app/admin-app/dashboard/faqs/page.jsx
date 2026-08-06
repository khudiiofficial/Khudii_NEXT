'use client';
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('@/legacy/admin/Pages/faqs/Faqs'), { ssr: false });
export default function Page() { return <Component />; }
