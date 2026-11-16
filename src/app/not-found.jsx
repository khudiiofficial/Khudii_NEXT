'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';
export default function NotFound() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin-app/')) return;
    const path = window.location.pathname;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/api/traffic/404`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }), keepalive: true }).catch(() => { });
  }, []);
  return <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#f4f7fc] px-6 py-16 text-center"><div className="mb-6 rounded-3xl bg-blue-50 p-5 text-[#02236E]"><SearchX size={44} /></div><p className="text-sm font-bold uppercase tracking-[.2em] text-[#02236E]">404 · Page not found</p><h1 className="mt-3 text-3xl font-bold text-[#02236E] md:text-5xl">This page is unavailable</h1><p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">The address may have changed or the content may have been removed. Use the homepage to find the information you need.</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-3 text-sm font-bold text-white"><Home size={17} />Back to home</Link></main>;
}
