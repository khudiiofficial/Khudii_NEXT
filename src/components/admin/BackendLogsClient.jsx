'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Terminal,
  X,
  ShieldCheck,
  Activity,
} from 'lucide-react';

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/backend-logs`;
const options = ['All', 'error', 'warning', 'info', 'success', 'debug'];
const categories = ['All', 'diagnostic', 'deployment', 'database', 'application', 'network', 'ftp', 'email', 'security', 'other'];

function formatLogDate(iso, utc) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso || '—';
  const opts = {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...(utc ? { timeZone: 'UTC' } : {}),
  };
  const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date);
  const field = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${field('month')} ${field('day')}, ${field('year')} · ${field('hour')}:${field('minute')}:${field('second')} ${field('dayPeriod')}`;
}

export default function BackendLogsClient() {
  const [level, setLevel] = useState('All');
  const [category, setCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [utc, setUtc] = useState(false);
  const [localZone, setLocalZone] = useState('Local');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    async (nextPage = 1, silent = false) => {
      if (!silent) setBusy(true);
      setError('');
      try {
        const queryParams = new URLSearchParams({
          page: String(nextPage),
          pageSize: '25',
          level: level === 'All' ? '' : level,
          category: category === 'All' ? '' : category,
          source: sourceFilter === 'all' ? '' : sourceFilter,
          search: search.trim(),
        });
        const r = await fetch(`${BASE}?${queryParams}`, {
          credentials: 'include',
          headers: { 'x-khudii-surface': 'admin' },
          cache: 'no-store',
        });
        const data = await r.json();
        if (!r.ok || !data.success) {
          setError(data.message || 'Unable to load backend logs.');
          setResult(null);
        } else {
          setResult(data);
          setPage(nextPage);
          setLastUpdated(new Date().toISOString());
        }
      } catch (err) {
        setError('Unable to retrieve logs. Check your session and try again: ' + err.message);
      } finally {
        if (!silent) setBusy(false);
      }
    },
    [level, category, sourceFilter, search]
  );

  const handleResetFilters = () => {
    setLevel('All');
    setCategory('All');
    setSourceFilter('all');
    setSearch('');
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 30 * 86400_000);
      const fmt = (d) => d.toISOString().slice(0, 10);
      const r = await fetch(`${BASE}/export?from=${fmt(from)}&to=${fmt(to)}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.message || 'CSV export failed');
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `khudii-backend-logs-${fmt(from)}-to-${fmt(to)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Exported last 30 days of backend logs as CSV.');
    } catch (err) {
      setError('CSV export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    try {
      setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local');
    } catch {
      setLocalZone('Local');
    }
    void load(1);
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(page, true);
    }, 60000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load, page]);

  const handleTestLogger = async () => {
    setTesting(true);
    setNotice('');
    setError('');
    try {
      const r = await fetch(`${BASE}/test`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ action: 'test' }),
      });
      const data = await r.json();
      if (data.success) {
        setNotice(data.message || 'Test log entry successfully written.');
        void load(1);
      } else {
        setError(data.message || 'Failed to record test log entry.');
      }
    } catch (err) {
      setError('Error triggering test logger: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const badgeColor = (type) => {
    const t = String(type || '').toLowerCase();
    if (t === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (t === 'error') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (t === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const labelClass = 'block mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600';
  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#02236E]';

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-[#02236E]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">&gt;_ Backend Logs</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Live database-backed server diagnostics, HTTP 404/5xx tracking, and API fault logs.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={exporting}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            disabled={testing}
            onClick={handleTestLogger}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {testing ? 'Testing...' : 'Test logger'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void load(1)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#033094] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top 4 Real KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#02236E] border border-blue-100">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Logs</div>
            <div className="font-bold text-lg text-slate-900">{Number(result?.summary?.total || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Server Errors (5xx)</div>
            <div className="font-bold text-lg text-rose-700">{Number(result?.summary?.errors || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Not Found (404)</div>
            <div className="font-bold text-lg text-amber-700">{Number(result?.summary?.not_found || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matching Filter</div>
            <div className="font-bold text-lg text-slate-900">{Number(result?.total || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {result?.notice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <span className="leading-relaxed">{result.notice}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-600 hover:text-emerald-900 text-sm font-bold">×</button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900 text-sm font-bold">×</button>
        </div>
      )}

      {/* Timestamps Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-xs">
        <div>
          <span className="font-semibold text-slate-800">Timestamps:</span> {utc ? 'UTC' : `Your browser (${localZone})`} · Stored in UTC
          {lastUpdated && ` · Refreshed ${formatLogDate(lastUpdated, utc)}`}
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none font-medium">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300 text-[#02236E] focus:ring-[#02236E]"
            />
            Auto-refresh every 60s (optional)
          </label>
          <button
            type="button"
            className="font-bold text-[#02236E] hover:underline"
            onClick={() => setUtc((value) => !value)}
          >
            Show {utc ? 'local time' : 'UTC'}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(1);
        }}
        className="rounded-2xl bg-white border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-[1fr_140px_140px_140px_auto_auto] gap-3 items-end shadow-sm"
      >
        <div>
          <label htmlFor="backend-search" className={labelClass}>
            Search log text
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="backend-search"
              className={`${inputClass} pl-9`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
              placeholder="Error, route, file, TypeScript code..."
            />
          </div>
        </div>
        <div>
          <label htmlFor="backend-level" className={labelClass}>
            Severity
          </label>
          <select
            id="backend-level"
            className={inputClass}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {options.map((value) => (
              <option key={value} value={value}>
                {value === 'All' ? 'All severities' : value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="backend-category" className={labelClass}>
            Category
          </label>
          <select
            id="backend-category"
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {value === 'All' ? 'All categories' : value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="backend-source" className={labelClass}>
            Source
          </label>
          <select
            id="backend-source"
            className={inputClass}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All sources</option>
            {(result?.sources || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          disabled={busy}
          type="submit"
          className="h-[42px] rounded-xl bg-[#02236E] hover:bg-[#033094] px-5 text-sm font-bold text-white transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleResetFilters}
          className="h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </form>

      {/* Data Table */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-4">Date & Time ({utc ? 'UTC' : 'Local'})</th>
                <th className="p-4">Level</th>
                <th className="p-4">Category</th>
                <th className="p-4">Instance</th>
                <th className="p-4">Source file</th>
                <th className="p-4">Message</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result?.rows?.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 whitespace-nowrap text-xs text-slate-600 font-semibold" title={row.timestamp}>
                    {formatLogDate(row.timestamp, utc)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${badgeColor(row.level)}`}>
                      {row.level}
                    </span>
                  </td>
                  <td className="p-4 capitalize text-xs font-medium text-slate-700">{row.category}</td>
                  <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{row.environment || 'unknown'}</td>
                  <td className="p-4 text-xs text-slate-500 break-all max-w-[190px]">
                    {row.targetFile ? (
                      <span className="font-mono text-slate-700">{row.targetFile}{row.targetLine ? `:${row.targetLine}` : ''}</span>
                    ) : row.source === 'server-console' ? (
                      <span title="The log does not identify a source file" className="text-slate-400 italic">Framework / unknown</span>
                    ) : (
                      <span className="font-mono text-slate-600">{row.source}</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-700 max-w-[480px] break-words">
                    <div className="font-semibold text-slate-900 leading-snug">{row.message}</div>
                    {row.explanation && (
                      <div className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{row.explanation}</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="py-1 px-3 rounded-lg text-xs font-bold text-[#02236E] border border-[#02236E]/30 bg-blue-50/50 hover:bg-[#02236E] hover:text-white transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!result?.rows || result?.rows?.length === 0) && !busy && (
          <div className="py-14 text-center text-sm text-slate-500">
            No matching backend logs found in this environment.
          </div>
        )}

        {busy && (
          <div className="py-14 flex items-center justify-center gap-2 text-sm text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-[#02236E]" />
            Loading backend logs...
          </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} · {result?.total || 0} matching entries
          </span>
          <div className="flex gap-2">
            <button
              disabled={busy || page <= 1}
              onClick={() => void load(page - 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={busy || page * (result?.pageSize || 25) >= (result?.total || 0)}
              onClick={() => void load(page + 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Runtime errors are captured from Node.js. Build errors appear only after you enable the supplied Hostinger build wrapper, and only if its build environment can access the same private log directory. Older Hostinger logs are not imported automatically.
      </p>

      {/* Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-xs p-4 flex items-center justify-center animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Backend log details"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-3xl max-h-[88vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="mb-4 flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-[#02236E]" />
                Log Entry Details
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm font-semibold break-words text-slate-900 mb-2 leading-snug">{selected.message}</p>
            <p className="text-xs text-slate-500 mb-4">
              {formatLogDate(selected.timestamp, utc)} · {selected.environment} · {selected.category} ·{' '}
              <span className="font-mono text-slate-600">{selected.code || 'APPLICATION_LOG'}</span>
            </p>

            {selected.targetFile && (
              <div className="mb-3 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-mono text-slate-800 break-all border border-slate-200">
                Source: {selected.targetFile}
                {selected.targetLine ? `:${selected.targetLine}` : ''}
                {selected.targetColumn ? `:${selected.targetColumn}` : ''}
              </div>
            )}

            {selected.explanation && (
              <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-sm text-slate-800">
                <strong className="text-[#02236E] font-semibold">What happened:</strong> {selected.explanation}
              </div>
            )}

            {selected.suggestedAction && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-sm text-slate-800">
                <strong className="text-amber-800 font-semibold">Recommended action:</strong> {selected.suggestedAction}
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Original log and stack trace</div>
            <pre className="rounded-xl bg-slate-950 p-4 text-xs font-mono leading-relaxed text-slate-100 whitespace-pre-wrap break-words overflow-auto max-h-[260px] border border-slate-800">
              {selected.details || 'No stack trace was recorded.'}
            </pre>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(`${selected.timestamp} ${selected.message}\n${selected.details || ''}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-2 text-sm font-bold border border-[#02236E] text-[#02236E] bg-blue-50 hover:bg-[#02236E] hover:text-white rounded-xl py-2 px-4 transition-colors shadow-xs"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
