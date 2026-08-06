'use client';
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('@/legacy/admin/Pages/Event_description/Event_description'), { ssr: false });
export default function Page() { return <Component />; }
