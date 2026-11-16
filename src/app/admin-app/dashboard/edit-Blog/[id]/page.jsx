'use client';
import dynamic from 'next/dynamic';
import AdminSeoShortcut from '@/components/AdminSeoShortcut';
const Component = dynamic(() => import('@/legacy/admin/Pages/EditBlogPage/EditBlogPage'), { ssr: false });
export default function Page() { return <><AdminSeoShortcut type="blogs" /><Component /></>; }
