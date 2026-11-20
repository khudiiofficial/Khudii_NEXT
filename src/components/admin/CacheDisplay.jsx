'use client';

import { useCallback, useEffect, useState } from 'react';
import { HardDrive, RefreshCw, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '0.00 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** idx).toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

export default function CacheDisplay({ compact = false }) {
  const [bytes, setBytes] = useState(0);
  const [checkedAt, setCheckedAt] = useState('');
  const [lastFlushedAt, setLastFlushedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [justFlushed, setJustFlushed] = useState(false);

  const loadSize = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
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
        if (json.lastFlushedAt) {
          setLastFlushedAt(json.lastFlushedAt);
        }
      }
    } catch {
      // ignore transient error
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSize();
    // Real-time auto-monitor: poll every 15 seconds when active
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') loadSize(true);
    }, 15_000);
    return () => clearInterval(timer);
  }, [loadSize]);

  const handleFlush = async () => {
    const ok = await confirmDialog({
      title: 'Flush & Revalidate Site Cache?',
      text: 'This will purge dynamic runtime cache and revalidate all public routes, sitemap, and dashboard in real time so visitors immediately see the latest updates.',
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
      if (!res.ok || !json.success) throw new Error(json.message || 'Cache flush failed');

      setBytes(0);
      setJustFlushed(true);
      const now = new Date().toISOString();
      setCheckedAt(now);
      setLastFlushedAt(Date.now());
      setTimeout(() => setJustFlushed(false), 8000);

      alertNotice({
        title: 'Cache Purged & Revalidated',
        text: 'Dynamic cache has been purged and all routes revalidated live across the site.',
        status: 'success',
      });
      await loadSize(true);
    } catch (err) {
      alertNotice({ title: 'Flush Failed', text: err.message || 'Cache flush failed', status: 'error' });
    } finally {
      setFlushing(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-sm transition-all ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Icon & Details */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#02236E]">
            <HardDrive size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#02236E]">System Cache &amp; Revalidation</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                justFlushed
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {justFlushed ? 'Cache Purged & Synced' : 'Live Monitor'}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span>Dynamic runtime cache:</span>
              <strong className="text-slate-800 font-bold">{loading && bytes === null ? 'Measuring...' : formatBytes(bytes)}</strong>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 size={12} className="text-emerald-600" /> Real-time active &amp; synced
              </span>
              {checkedAt && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">Checked {new Date(checkedAt).toLocaleTimeString()}</span>
                </>
              )}
              {lastFlushedAt && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 font-medium">Last flushed {new Date(lastFlushedAt).toLocaleTimeString()}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSize(false)}
            disabled={loading || flushing}
            title="Refresh cache status"
            aria-label="Refresh cache status"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-[#02236E] disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleFlush}
            disabled={flushing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0b338c] disabled:opacity-60 cursor-pointer"
          >
            {flushing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {flushing ? 'Flushing cache...' : 'Flush Cache'}
          </button>
        </div>
      </div>
    </div>
  );
}
