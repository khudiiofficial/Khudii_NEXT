'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Download, BarChart3 } from 'lucide-react';
import KhudiiMultiAreaChart from '@/components/KhudiiMultiAreaChart';
import KhudiiCategorySplineChart from '@/components/KhudiiCategorySplineChart';
import ReportingRangeSelect from '@/components/ReportingRangeSelect';
import { yesterdayPK, validateExportRange } from '@/lib/reporting-periods';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/reports/activity`;
const METHODS = [
  { key: 'POST', label: 'Create / POST', color: '#2563eb' },
  { key: 'PUT', label: 'Update / PUT', color: '#d97706' },
  { key: 'PATCH', label: 'Patch', color: '#7c3aed' },
  { key: 'DELETE', label: 'Delete', color: '#dc2626' },
];
const SURFACES = [
  { key: 'frontend', label: 'Frontend interactions', color: '#2563eb' },
  { key: 'backend', label: 'Backend page views', color: '#7c3aed' },
  { key: 'admin-writes', label: 'Backend changes', color: '#e86a21' },
];
export default function ActivityLogsPage() {
  const [days, setDays] = useState(30), [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [format, setFormat] = useState(''), [downloading, setDownloading] = useState(false), [downloadError, setDownloadError] = useState('');
  const [showComparison, setShowComparison] = useState(true), [showMethods, setShowMethods] = useState(true), [showCategory, setShowCategory] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const r = await fetch(`${BASE}?days=${days}`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin' }, cache: 'no-store' }); const json = await r.json(); if (!r.ok) throw Error(json.message || 'Failed to retrieve activity'); setData(json); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [days]);
  useEffect(() => { load(); }, [load]);
  const maxDate = yesterdayPK();
  const validation = from && to ? validateExportRange(from, to) : 'Select both From and To dates.';
  const canDownload = !validation && ['csv', 'pdf'].includes(format) && !downloading;
  async function download() {
    if (!canDownload) return;
    setDownloading(true); setDownloadError('');
    try {
      const q = new URLSearchParams({ from, to, format });
      const r = await fetch(`${BASE}/download?${q}`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin' }, cache: 'no-store' });
      if (!r.ok) { const json = await r.json().catch(() => ({})); throw Error(json.message || 'Report generation failed'); }
      const blob = await r.blob(), url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `khudii-activity-${from}-to-${to}.${format}`; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setDownloadError(e.message); } finally { setDownloading(false); }
  }
  const comparison = [...(data?.analytics?.timeline || []), ...(data?.timeline || []).map(r => ({ ...r, category: 'admin-writes' }))];
  // Keep HTTP method breakdown independent of the frontend event stream.
  const methods = METHODS.map(m => ({ name: m.label, color: m.color, value: (data?.timeline || []).filter(v => v.category === m.key).reduce((n, v) => n + Number(v.count || 0), 0) }));
  const categories = (data?.analytics?.categories || []).map(v => ({ name: `${v.category} (${v.surface})`, value: Number(v.count) })).slice(0, 12);
  const surfaceTotals = SURFACES.map(s => ({ ...s, total: comparison.filter(r => r.category === s.key).reduce((n, r) => n + Number(r.count || 0), 0) }));
  return <div className="space-y-7">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#02236E]">Audit trail</p><h1 className="mt-1 text-3xl font-extrabold text-[#02236E]">Activity Logs</h1><p className="mt-2 text-sm text-slate-500">Frontend and backend interactions for completed days only. Period: {data?.from || '…'} to {data?.to || '…'}.</p></div>
      <div className="flex flex-wrap items-center gap-3"><ReportingRangeSelect value={days} onChange={setDays} /><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button></div></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {data?.warning && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{data.warning}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7" aria-label="Export activity logs"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#02236E]">Download Activity Logs</h2><p className="mt-1 text-sm text-slate-500">Choose both dates and a file format. Today is unavailable; records are complete through yesterday ({maxDate}).</p></div><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">CSV or PDF</span></div>
      <div className="mt-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"><label className="text-sm font-semibold text-slate-700">From date *<input required type="date" aria-label="Export from date" value={from} max={maxDate} onChange={e => setFrom(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5" /></label>
        <label className="text-sm font-semibold text-slate-700">To date *<input required type="date" aria-label="Export to date" value={to} max={maxDate} min={from || undefined} onChange={e => setTo(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5" /></label>
        <label className="text-sm font-semibold text-slate-700">File format *<select aria-label="Export file format" value={format} onChange={e => setFormat(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5"><option value="">Select CSV or PDF</option><option value="csv">CSV</option><option value="pdf">PDF</option></select></label>
        <button type="button" onClick={download} disabled={!canDownload} className="inline-flex justify-center gap-2 rounded-xl bg-[#02236E] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Download size={16} />{downloading ? 'Preparing…' : 'Download Activity Logs'}</button></div>
      {downloadError && <p role="alert" className="mt-3 text-sm text-red-700">{downloadError}</p>}
      {from && to && validation && <p role="status" className="mt-3 text-sm text-amber-700">{validation}</p>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-4 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold">Activity Logs</h2><p className="mt-1 text-sm text-slate-500">Recorded browser interactions, admin visits and admin write requests.</p></div><button type="button" onClick={() => setShowComparison(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"><BarChart3 size={14} />{showComparison ? 'Hide graph' : 'Show graph'}</button></div><div className="mb-4 flex flex-wrap gap-4">{surfaceTotals.map(s => <p key={s.key} className="text-sm text-slate-600"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />{s.label}: <strong>{s.total.toLocaleString()}</strong></p>)}</div>{showComparison && <KhudiiMultiAreaChart records={comparison} series={SURFACES} days={days} endDate={data?.to} height={250} />}</section>
    <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Admin changes by method</h2><button onClick={() => setShowMethods(v => !v)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">{showMethods ? 'Hide' : 'Show'}</button></div>{showMethods && <KhudiiCategorySplineChart data={methods} color="#2563eb" height={210} valueLabel="Actions" />}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Usage by component</h2><button onClick={() => setShowCategory(v => !v)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">{showCategory ? 'Hide' : 'Show'}</button></div>{showCategory && (categories.length ? <KhudiiCategorySplineChart data={categories} color="#2563eb" height={220} compact valueLabel="Events" /> : <p className="p-6 text-sm text-slate-500">No component events recorded.</p>)}</section></div>
    <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white" aria-label="Recent administrative write requests"><div className="border-b border-slate-200 p-5"><h2 className="text-lg font-bold">Recent admin write requests</h2><p className="text-sm text-slate-500">Latest 100 records in the period. Download by date to export more. Total: {data?.total ?? '—'}.</p></div><table className="w-full min-w-[720px] text-left text-sm" id="activity-logs-table"><thead><tr>{['Time', 'Action', 'Component / route', 'HTTP', 'Actor'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{(data?.events || []).map(e => <tr key={e.id} className="border-t border-slate-100"><td className="p-3 text-slate-600">{new Date(e.created_at).toLocaleString()}</td><td className="p-3 font-semibold">{e.action}</td><td className="p-3 font-mono text-xs">{e.route}</td><td className="p-3">{e.http_status}</td><td className="p-3 text-slate-600">{e.actor_id || 'Unknown'}</td></tr>)}</tbody></table>{data && !data.events?.length && <p className="p-6 text-center text-sm text-slate-500">No admin write requests in this period.</p>}</section>
    <p className="text-xs text-slate-500">Analytics begins when deployed. Counts do not represent historical traffic before tracking was enabled.</p>
  </div>;
}
