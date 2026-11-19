'use client';

import { useCallback, useEffect, useState } from 'react';
import { HardDrive, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** idx).toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

export default function CacheDisplay({ compact = false }) {
  const [bytes, setBytes] = useState(null);
  const [checkedAt, setCheckedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [flushing, setFlushing] = useState(false);

  const loadSize = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/cache/size`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBytes(json.bytes ?? 0);
        setCheckedAt(json.checkedAt || new Date().toISOString());
      }
    } catch {
      // ignore transient error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSize();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') loadSize();
    }, 30_000);
    return () => clearInterval(timer);
  }, [loadSize]);

  const handleFlush = async () => {
    const ok = await confirmDialog({
      title: 'Flush & Revalidate Site Cache?',
      text: 'This safely revalidates Next.js layout, sitemap, robots.txt, and dashboard caches so visitors immediately see your latest changes.',
      status: 'info',
      confirmText: 'Flush Cache',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setFlushing(true);
    try {
      const res = await fetch(`${API}/admin/cache/flush`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Cache revalidation failed');
      alertNotice({ title: 'Cache Revalidated', text: 'Site cache revalidated successfully.', status: 'success' });
      await loadSize();
    } catch (err) {
      alertNotice({ title: 'Flush Failed', text: err.message || 'Cache flush failed', status: 'error' });
    } finally {
      setFlushing(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#02236E]">
            <HardDrive size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#02236E]">System Cache &amp; Revalidation</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Monitor
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Build disk cache: <strong className="text-slate-800">{loading && bytes === null ? 'Measuring...' : formatBytes(bytes)}</strong>
              <span className="mx-1.5 text-slate-300">·</span>
              Not deleted by revalidation
              {checkedAt ? ` · Checked ${new Date(checkedAt).toLocaleTimeString()}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSize}
            disabled={loading}
            title="Refresh cache size"
            aria-label="Refresh cache size"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleFlush}
            disabled={flushing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#001850] disabled:opacity-60 cursor-pointer"
          >
            {flushing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {flushing ? 'Flushing...' : 'Flush Cache'}
          </button>
        </div>
      </div>
    </div>
  );
}
