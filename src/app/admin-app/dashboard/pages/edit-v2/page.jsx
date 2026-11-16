'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CmsV2Workspace } from '@/components/CmsV2Workspace';
const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
function PageBuilder() {
    const params = useSearchParams(), id = params.get('id'), [page, setPage] = useState(null), [error, setError] = useState(''), [active, setActive] = useState('sections'), [loading, setLoading] = useState(true);
    const load = useCallback(async () => { if (!id) return; setLoading(true); try { const r = await fetch(`${API}/admin/v2/pages/${encodeURIComponent(id)}`, { headers: { 'x-khudii-surface': 'admin' }, credentials: 'include', cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw Error(j.error?.message || 'Unable to load page'); setPage(j.data) } catch (e) { setError(e.message) } finally { setLoading(false) } }, [id]);
    useEffect(() => { load() }, [load]);
    if (!id) return <div className="rounded-xl bg-white p-10">Select a page from <Link href="/admin-app/dashboard/pages" className="text-[#02236E] underline">Pages</Link>.</div>;
    return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin-app/dashboard/pages" className="text-sm font-semibold text-[#02236E]">← All pages</Link><h1 className="mt-2 text-3xl font-bold">{page?.title || 'Page builder'}</h1><p className="text-sm text-slate-500">{page?.path} · Build sections, tabs and nested subtabs</p></div>{page?.path && <a href={page.path} target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Preview public page</a>}</div>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading ? <p>Loading...</p> : <><div role="tablist" className="flex gap-2">{[['sections', 'Edit sections'], ['tabs', 'Tabs & subtabs']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setActive(id)} className={`rounded-xl border px-5 py-3 text-sm font-semibold ${active === id ? 'border-[#02236E] bg-[#02236E] text-white' : 'border-slate-200 bg-white'}`}>{label}</button>)}</div><CmsV2Workspace key={`${active}-${page?.id}`} initialResource={active} allowedResources={[active]} pageId={Number(id)} /></>}</div>
}
export default function Page() { return <Suspense fallback={<p className="p-10">Loading page builder...</p>}><PageBuilder /></Suspense> }
