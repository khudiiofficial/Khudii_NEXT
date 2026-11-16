'use client';
import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Download, RefreshCw, Search, ServerCrash, ShieldCheck } from 'lucide-react';
import KhudiiMultiAreaChart from '@/components/KhudiiMultiAreaChart';
import ReportingRangeSelect from '@/components/ReportingRangeSelect';
import { yesterdayPK, validateExportRange } from '@/lib/reporting-periods';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/backend-logs`;
const headers = { 'x-khudii-surface': 'admin' };
export default function BackendLogsPage() {
  const [days, setDays] = useState(30), [status, setStatus] = useState(''), [query, setQuery] = useState('');
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [downloading, setDownloading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(''); try {
      const params = new URLSearchParams({ days: String(days), status, q: query });
      const response = await fetch(`${BASE}?${params}`, { credentials: 'include', headers, cache: 'no-store' });
      const result = await response.json(); if (!response.ok) throw Error(result.message || `HTTP ${response.status}`);
      setData(result);
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [days, status, query]);
  useEffect(() => { load() }, [load]);
  const maxDate = yesterdayPK();
  async function download() {
    const validation = validateExportRange(from, to); if (validation) { setError(validation); return; }
    setDownloading(true); setError(''); try {
      const response = await fetch(`${BASE}/export?${new URLSearchParams({ from, to })}`, { credentials: 'include', headers, cache: 'no-store' });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw Error(body.message || 'Export failed'); }
      const url = URL.createObjectURL(await response.blob()), a = document.createElement('a'); a.href = url; a.download = `khudii-backend-${from}-to-${to}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (e) { setError(e.message) } finally { setDownloading(false) }
  }
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#02236E]">Diagnostics</p><h1 className="mt-1 text-3xl font-bold text-[#02236E]">Backend Logs</h1><p className="mt-2 text-sm text-slate-500">Recorded API 4xx/5xx requests, without request bodies or visitor contact details. Historical Vercel logs cannot be reconstructed.</p></div><div className="flex flex-wrap gap-2"><ReportingRangeSelect value={days} onChange={setDays} /><button onClick={load} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button></div></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-3 md:grid-cols-3">{[["All requests with errors", data?.summary?.total, ServerCrash], ["Server errors (5xx)", data?.summary?.errors, AlertTriangle], ["Not found (404)", data?.summary?.not_found, ShieldCheck]].map(([label, count, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm font-semibold text-slate-500">{label}<Icon size={19} className="text-[#02236E]" /></div><strong className="mt-3 block text-3xl text-[#02236E]">{Number(count || 0).toLocaleString()}</strong></div>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Error activity</h2><p className="mb-4 text-xs text-slate-500">Daily recorded request failures, excluding today.</p><KhudiiMultiAreaChart records={data?.timeline || []} series={[{ key: '4xx', label: 'Client errors', color: '#2563eb' }, { key: 'Errors', label: 'Server errors', color: '#e11d48' }]} days={days} height={220} /></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-3 text-lg font-bold">Filter & export</h2><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"><label className="text-xs font-bold text-slate-600">Search route<input value={query} onChange={e => setQuery(e.target.value)} placeholder="/api/..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-slate-600">HTTP status<select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">All</option>{[400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504].map(s => <option key={s} value={s}>{s}</option>)}</select></label><label className="text-xs font-bold text-slate-600">From *<input type="date" max={maxDate} value={from} onChange={e => setFrom(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-slate-600">To *<input type="date" max={maxDate} value={to} onChange={e => setTo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label><button onClick={download} disabled={!!validateExportRange(from, to) || downloading} className="self-end inline-flex items-center justify-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"><Download size={16} />Export CSV</button></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 className="text-lg font-bold">Recent requests</h2><span className="text-xs text-slate-500">Newest {data?.events?.length || 0} records</span></div><div className="overflow-x-auto"><table className="min-w-[800px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Timestamp', 'HTTP', 'Method', 'Route', 'Source', 'Details'].map(t => <th className="px-4 py-3" key={t}>{t}</th>)}</tr></thead><tbody>{(data?.events || []).map(row => <tr key={row.id} className="border-t border-slate-100"><td className="whitespace-nowrap p-4 text-slate-500">{new Date(row.created_at).toLocaleString()}</td><td className="p-4 font-bold text-red-600">{row.status}</td><td className="p-4">{row.method}</td><td className="max-w-xs break-all p-4 font-mono text-xs">{row.path}</td><td className="p-4 text-slate-500">{row.source}</td><td className="p-4 text-slate-500">{row.message}</td></tr>)}</tbody></table>{!data?.events?.length && <p className="p-8 text-center text-sm text-slate-500">No matching errors recorded in this period.</p>}</div></section>
  </div>;
}
