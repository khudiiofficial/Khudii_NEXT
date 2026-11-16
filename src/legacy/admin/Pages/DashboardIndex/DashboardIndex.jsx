'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, RefreshCw, ArrowUpRight } from 'lucide-react';
import KhudiiMultiAreaChart from '@/components/KhudiiMultiAreaChart';
import KhudiiCategorySplineChart from '@/components/KhudiiCategorySplineChart';
import ReportingRangeSelect from '@/components/ReportingRangeSelect';

const API = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/reports/overview`;
const SUBMISSIONS = [
  ['Contact messages', '#2563eb'], ['Organization inquiries', '#0ea5e9'], ['Donations', '#d97706'],
  ['Volunteers', '#16a34a'], ['Job applications', '#9333ea'], ['Contributed stories', '#dc2626'], ['Registrations', '#64748b'],
];
const SURFACES = [
  { key: 'frontend', label: 'Frontend interactions', color: '#2563eb' },
  { key: 'backend', label: 'Admin page views', color: '#7c3aed' },
  { key: 'admin-writes', label: 'Admin changes', color: '#ea580c' },
];
export default function DashboardIndex() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUsage, setShowUsage] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(true);
  const [activeSeries, setActiveSeries] = useState('usage');
  const router = useRouter();
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}?days=${days}`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin' }, cache: 'no-store' });
      const j = await r.json(); if (!r.ok) throw Error(j.message || `HTTP ${r.status}`); setData(j);
    } catch (e) { setError('Dashboard data unavailable: ' + e.message); } finally { setLoading(false); }
  }, [days]);
  useEffect(() => { load(); const iv = setInterval(load, 60000); return () => clearInterval(iv); }, [load]);
  const usage = [...(data?.analytics?.timeline || []), ...(data?.adminWrites || []).map(r => ({ ...r, category: 'admin-writes' }))];
  const overview = SURFACES.map(s => ({ ...s, value: usage.filter(r => r.category === s.key).reduce((total, r) => total + Number(r.count || 0), 0) }));
  const counts = data?.counts || {};
  const cards = data?.cards || [];
  const categoryData = SUBMISSIONS.map(([name, color]) => ({ name, color, value: (data?.timeline || []).filter(r => r.category === name).reduce((n, r) => n + Number(r.count || 0), 0) }));
  const range = data?.from && data?.to ? `${data.from} to ${data.to}` : 'completed calendar days';
  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="mt-1 text-3xl font-extrabold text-[#02236E]">Dashboard</h1><p className="mt-2 text-sm text-slate-500">Live content totals and recorded frontend/backend activity. Today is excluded.</p></div>
      <div className="flex flex-wrap items-center gap-3"><ReportingRangeSelect value={days} onChange={setDays} /><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {data?.analyticsError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{data.analyticsError}</p>}
    <section aria-label="Content and submissions totals">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{cards.map(({ key, label, route }) => <button key={key} type="button" onClick={() => router.push(`/admin-app/dashboard/${route}`)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-600">{label}</span><ArrowUpRight size={17} className="text-[#02236E]" /></div><p className="mt-3 text-2xl font-extrabold tabular-nums">{counts[key] == null ? 'Not available' : counts[key].toLocaleString()}</p></button>)}</div>
    </section>
    <section aria-label="Frontend and backend activity" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Frontend vs backend</h2><p className="mt-1 text-sm text-slate-500">Recorded interactions, admin page views and administrative changes, {range}.</p></div><button type="button" onClick={() => setShowUsage(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"><BarChart3 size={14} />{showUsage ? 'Hide graph' : 'Show graph'}</button></div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{overview.map(v => <div key={v.key} className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">{v.label}</span><p className="mt-1 text-2xl font-bold tabular-nums">{v.value.toLocaleString()}</p></div>)}<div className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Anonymous public sessions</span><p className="mt-1 text-2xl font-bold tabular-nums">{data?.analytics?.sessions?.toLocaleString() ?? '—'}</p></div></div>
      {showUsage && <KhudiiMultiAreaChart records={usage} series={SURFACES} days={days} endDate={data?.to} height={245} />}
      <p className="mt-4 text-xs text-slate-500">Counts measure different event types, not unique people. Analytics begins collecting after deployment and cannot backfill old traffic.</p>
    </section>
    <section aria-label="Submission trends" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">All form submissions</h2><p className="mt-1 text-sm text-slate-500">Contact, inquiry, donation, volunteer, jobs, stories and registration records, {range}.</p></div><button type="button" onClick={() => setShowSubmissions(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"><BarChart3 size={14} />{showSubmissions ? 'Hide graph' : 'Show graph'}</button></div>
      {showSubmissions && <KhudiiMultiAreaChart records={data?.timeline || []} series={SUBMISSIONS.map(([key, color]) => ({ key, label: key, color }))} days={days} endDate={data?.to} height={245} />}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{categoryData.map(v => <span key={v.name} className="text-xs text-slate-600"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: v.color }} />{v.name}: <strong>{v.value}</strong></span>)}</div>
    </section>
    <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-2 text-lg font-bold">Most visited pages</h2><p className="mb-3 text-xs text-slate-500">Tracked public page views in the selected period</p>{data?.analytics?.topPages?.length ? <div className="space-y-2">{data.analytics.topPages.map(v => <div key={v.path} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm"><span className="min-w-0 truncate font-medium" title={v.path}>{v.path}</span><strong className="tabular-nums">{v.count}</strong></div>)}</div> : <p className="py-5 text-sm text-slate-500">No recorded visits in this period.</p>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Interaction categories</h2><p className="mb-3 text-xs text-slate-500">Combined recorded browser interactions by component</p>{data?.analytics?.categories?.length ? <div className="space-y-2">{data.analytics.categories.slice(0, 12).map(v => <div key={`${v.surface}-${v.category}`} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm"><span className="capitalize">{v.category} <span className="text-xs text-slate-400">({v.surface})</span></span><strong className="tabular-nums">{v.count}</strong></div>)}</div> : <p className="py-5 text-sm text-slate-500">No usage events recorded.</p>}</section></div>
    <p className="text-xs text-slate-500">{data?.generatedAt ? `Last refreshed: ${new Date(data.generatedAt).toLocaleString()}` : 'Awaiting server data'}. Graphs show completed days only, ending yesterday.</p>
  </div>;
}
