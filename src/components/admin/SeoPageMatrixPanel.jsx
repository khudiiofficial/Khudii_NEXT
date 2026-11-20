'use client';

import { useCallback, useEffect, useState } from 'react';
import { Globe, Loader2, Save } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
const FREQUENCIES = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

export default function SeoPageMatrixPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/seo-intelligence-matrix`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load SEO page matrix');
      setEntries(Array.isArray(data.pages) ? data.pages : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (pagePath, field, value) => {
    setEntries((prev) => prev.map((p) => (p.page_path === pagePath ? { ...p, [field]: value } : p)));
  };

  const handleSave = async () => {
    const ok = await confirmDialog({
      title: 'Save Per-Page Sitemap & Canonical Matrix?',
      text: `Apply canonical URLs, sitemap inclusion, priority, and crawl frequency for ${entries.length} pages?`,
      status: 'success',
      confirmText: 'Save Matrix',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/seo-intelligence-matrix`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ pages: entries }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      alertNotice({ title: 'SEO Matrix Saved', text: data.message || 'SEO page matrix saved successfully.', status: 'success' });
    } catch (err) {
      setError(err.message);
      alertNotice({ title: 'Save Failed', text: err.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col gap-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#02236E] flex items-center justify-center">
            <Globe size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Per-Page Sitemap &amp; Canonical Matrix</h3>
            <p className="text-[11px] text-slate-500 m-0">
              Control canonical overrides, XML sitemap inclusion, crawl priority, and update frequency per page.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#02236E] underline"
          >
            View /sitemap.xml
          </a>
          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-4 py-2 text-xs font-bold text-white hover:bg-[#001850] disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving...' : 'Save Page Matrix'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-2">
          <Loader2 size={16} className="animate-spin text-[#02236E]" /> Loading page matrix...
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[740px] text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="p-3">Page</th>
                <th className="p-3">Canonical URL Override</th>
                <th className="p-3 text-center">In Sitemap</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((p) => (
                <tr key={p.page_path} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{p.title}</div>
                    <div className="font-mono text-[11px] text-slate-400">{p.page_path}</div>
                    {p.status !== 'published' && (
                      <span className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`Canonical for ${p.page_path}`}
                      type="url"
                      value={p.canonical_url || ''}
                      onChange={(e) => update(p.page_path, 'canonical_url', e.target.value)}
                      placeholder="Blank = self-canonical"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#02236E]"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      aria-label={`Include ${p.page_path} in sitemap`}
                      type="checkbox"
                      checked={Boolean(p.sitemap_include)}
                      onChange={(e) => update(p.page_path, 'sitemap_include', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#02236E]"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`Priority for ${p.page_path}`}
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={p.sitemap_priority ?? '0.8'}
                      onChange={(e) => update(p.page_path, 'sitemap_priority', e.target.value)}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#02236E]"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Frequency for ${p.page_path}`}
                      value={p.sitemap_frequency || 'weekly'}
                      onChange={(e) => update(p.page_path, 'sitemap_frequency', e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#02236E]"
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
