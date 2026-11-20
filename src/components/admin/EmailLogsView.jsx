'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, RefreshCw, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function EmailLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/forms/email-logs`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to load email logs');
      setLogs(data.logs || data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (['sent', 'success', 'delivered'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 size={12} /> Sent
        </span>
      );
    }
    if (['warning', 'skipped', 'queued'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          <AlertTriangle size={12} /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
        <AlertCircle size={12} /> Failed
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-[#02236E]">
            <Mail size={18} /> Email Delivery Logs
          </h3>
          <p className="text-xs text-slate-500">Recent SMTP outgoing notifications, form alerts, and diagnostic test emails.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5">Form / Trigger</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Sent To</th>
                <th className="p-3.5">Subject / Error Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Loading delivery logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No email delivery logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap p-3.5 text-slate-600">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="p-3.5 font-bold capitalize text-slate-800">{row.form_key || 'system'}</td>
                    <td className="p-3.5">{statusBadge(row.status)}</td>
                    <td className="p-3.5 font-mono text-slate-700">{row.recipient || row.sent_to || '—'}</td>
                    <td className="max-w-[320px] p-3.5 text-slate-600">
                      <div className="font-semibold text-slate-800 truncate">{row.subject || '—'}</div>
                      {row.error_message && (
                        <div className="mt-0.5 text-[11px] text-red-600 break-words">{row.error_message}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
