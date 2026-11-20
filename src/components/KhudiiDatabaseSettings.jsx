'use client';
import { useCallback, useEffect, useState } from 'react';
import { confirmDialog, showSuccess, showError, showValidationMessage } from '@/lib/dialogs';
import { ReloadButton } from '@/components/ui/AppButton';
import { AlertCircle, Database, Download, Loader2, ShieldCheck, LockKeyhole } from 'lucide-react';

const ENDPOINT = '/api-app/database';
export default function KhudiiDatabaseSettings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(ENDPOINT, { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw Error(data.message || `Database status failed (${response.status})`);
      setStatus(data.export);
    } catch (e) { setStatus(null); setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const exportDatabase = async () => {
    if (busy || !status?.available) return;
    const confirmed = await confirmDialog({
      title: 'Export live database?',
      text: 'This download may contain personal information. Keep it encrypted and restrict who can access it. Type EXPORT to continue.',
      status: 'warning',
      input: 'text',
      inputPlaceholder: 'EXPORT',
      confirmText: 'Export SQL',
      cancelText: 'Cancel',
      preConfirm(value) { if (value?.trim() !== 'EXPORT') { showValidationMessage('Type EXPORT to confirm'); return false; } return true; },
    });
    if (!confirmed) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', credentials: 'include', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'export', confirm: 'EXPORT' }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw Error(data.message || `Export failed (${response.status})`); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `khudii-live-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await showSuccess('Database export ready', 'Your SQL backup was downloaded.');
    } catch (e) { setError(e.message); await showError('Export failed', e.message); }
    finally { setBusy(false); }
  };
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="flex items-center gap-2 text-xl font-bold text-[#02236E]"><Database className="text-[#02236E]" size={22} />Database Management</h2><p className="mt-1 text-sm text-slate-500">Read-only live database backup. Database synchronization controls have been removed.</p></div>
      <ReloadButton onClick={refresh} loading={loading} disabled={busy}>Refresh status</ReloadButton>
    </div>
    {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={17} />{error}</p>}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-[#02236E]"><Download size={24} /></div>
        <h3 className="text-lg font-bold text-[#02236E]">Export Live Database</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Download a SQL backup containing live tables and records. The export never changes database content.</p>
        <p className="my-5 text-sm text-slate-500">{status?.available ? `${status.tables} database tables detected` : status?.error || 'Checking live database availability...'}</p>
        <button type="button" disabled={loading || busy || !status?.available} onClick={exportDatabase} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#02236E] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />} {busy ? 'Preparing backup...' : 'Export live database'}</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 font-bold text-[#02236E]"><LockKeyhole className="text-[#02236E]" size={18} />Backup security</div><p className="mt-3 text-sm leading-7 text-slate-600">Only Super Administrators with a valid authenticated session can export. The confirmation must be typed explicitly. Store the file securely and delete unneeded local copies.</p><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16} />No live-to-local or local-to-live synchronization is permitted from this panel or its endpoint.</p></div>
    </div>
  </section>;
}
