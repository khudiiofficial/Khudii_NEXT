'use client';
import dynamic from 'next/dynamic';
const Login = dynamic(() => import('@/legacy/admin/Pages/Login/Login'), { ssr: false });
export default function Page() { return <Login />; }
