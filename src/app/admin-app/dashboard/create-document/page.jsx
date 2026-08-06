'use client';
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('@/legacy/admin/Pages/createBlogs/CreateBlog'), { ssr: false });
export default function Page() { return <Component />; }
