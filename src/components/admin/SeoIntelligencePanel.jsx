'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, RefreshCw, Save, ExternalLink, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const FREQUENCIES = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

export default function SeoIntelligencePanel() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadSettings = async () => {
    setError('');
    try {
      let res = await fetch('/api/admin/seo-intelligence', { cache: 'no-store' });
      if (!res.ok) {
        res = await fetch('/api-app/admin/seo-intelligence', {
          credentials: 'include',
          headers: { 'x-khudii-surface': 'admin' },
          cache: 'no-store',
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Unable to load SEO Intelligence');
      setSettings(
        json.settings || {
          siteOrigin: 'https://www.khudii.com',
          sitemapEnabled: true,
          defaultFrequency: 'weekly',
          defaultPriority: '0.8',
        },
      );
      setEntries(json.pages || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load SEO Intelligence');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = (id, field, value) => {
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.canonicalUrl && p.canonicalUrl.toLowerCase().includes(q)),
    );
  }, [entries, searchQuery]);

  async function save() {
    if (!settings || busy) return;

    const confirmed = await confirmDialog({
      title: 'Save SEO Intelligence Settings?',
      text: `Update canonical site origin (${settings.siteOrigin}), XML sitemap status, and per-page rules across ${entries.length} pages?`,
      status: 'success',
      confirmText: 'Save Settings',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    setError('');
    setMessage('');
    setBusy(true);

    try {
      let res = await fetch('/api/admin/seo-intelligence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, pages: entries }),
      });
      if (!res.ok) {
        res = await fetch('/api-app/admin/seo-intelligence', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
          body: JSON.stringify({ settings, pages: entries }),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Save failed');
      const msg = 'SEO settings saved. Metadata, sitemap, robots, and manifests will update on the next request.';
      setMessage(msg);
      alertNotice({ title: 'SEO Intelligence Saved', text: msg, status: 'success', timer: 3500, confirmText: 'OK' });
      router.refresh();
    } catch (e) {
      const errText = e instanceof Error ? e.message : 'Unable to save';
      setError(errText);
      alertNotice({ title: 'Save Failed', text: errText, status: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  if (!settings && !error) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#02236E]" />
        Loading SEO Intelligence...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
      {/* Header section matching Oriscare */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#02236E] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <h2 className="font-bodoni text-2xl font-bold text-slate-900 tracking-tight m-0">SEO Intelligence</h2>
        </div>
        <p className="text-xs text-slate-500 m-0 leading-relaxed">
          Control canonical URLs and XML sitemap inclusion. Only published, indexable, self-canonical pages appear in the sitemap.
        </p>
      </div>

      {/* Global Canonical & Sitemap Settings Grid */}
      <div className="grid md:grid-cols-2 gap-5 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
        <label className="text-xs font-bold text-slate-700 block">
          Canonical site origin
          <input
            value={settings?.siteOrigin || ''}
            onChange={(e) => setSettings({ ...settings, siteOrigin: e.target.value })}
            className="block w-full border border-slate-300 rounded-xl p-2.5 mt-1.5 text-xs font-mono font-medium bg-white text-slate-900 outline-none focus:border-[#02236E]"
            placeholder="https://www.khudii.com"
          />
          <span className="text-[11px] text-slate-400 font-normal mt-1 block">
            Used as the absolute origin for self-canonical tags, sitemaps, and robots.txt.
          </span>
        </label>

        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              checked={Boolean(settings?.sitemapEnabled)}
              onChange={(e) => setSettings({ ...settings, sitemapEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#02236E] focus:ring-0 cursor-pointer"
            />
            <span>Enable XML Sitemap generation (/sitemap.xml)</span>
          </label>
        </div>

        <label className="text-xs font-bold text-slate-700 block">
          Default crawl frequency
          <select
            className="block w-full border border-slate-300 rounded-xl p-2.5 mt-1.5 text-xs font-medium bg-white text-slate-900 outline-none focus:border-[#02236E]"
            value={settings?.defaultFrequency || 'weekly'}
            onChange={(e) => setSettings({ ...settings, defaultFrequency: e.target.value })}
          >
            {FREQUENCIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400 font-normal mt-1 block">
            Default search engine re-crawl interval for pages without specific overrides.
          </span>
        </label>

        <label className="text-xs font-bold text-slate-700 block">
          Default priority (0.0 to 1.0)
          <input
            className="block w-full border border-slate-300 rounded-xl p-2.5 mt-1.5 text-xs font-mono font-medium bg-white text-slate-900 outline-none focus:border-[#02236E]"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={settings?.defaultPriority || '0.8'}
            onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value })}
          />
          <span className="text-[11px] text-slate-400 font-normal mt-1 block">
            Default ranking priority relative to other internal URLs in sitemap.xml.
          </span>
        </label>
      </div>

      {/* Per-Page Matrix Search & Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Per-Page Sitemap &amp; Canonical Rules ({filteredEntries.length} of {entries.length} pages)
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#02236E]"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
              <tr>
                <th className="p-3">Page</th>
                <th className="p-3">Canonical override</th>
                <th className="p-3 text-center">Sitemap</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEntries.map((p) => (
                <tr key={p.id} className="border-b align-top hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{p.title || p.slug}</div>
                    <span className="text-[11px] font-mono text-slate-400">
                      /{p.slug === 'home' || p.slug === '/' ? '' : p.slug}
                    </span>
                    {(!p.isPublished || p.noIndex) && (
                      <div className="text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-[10px] inline-block font-bold mt-1">
                        {!p.isPublished ? 'Unpublished' : 'Noindex'}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`Canonical for ${p.slug}`}
                      className="border border-slate-200 rounded-lg p-2 w-full text-xs font-mono bg-white outline-none focus:border-[#02236E]"
                      value={p.canonicalUrl || ''}
                      placeholder="Blank = self-canonical"
                      onChange={(e) => update(p.id, 'canonicalUrl', e.target.value)}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      aria-label={`Include ${p.slug} in sitemap`}
                      type="checkbox"
                      checked={Boolean(p.sitemapInclude)}
                      onChange={(e) => update(p.id, 'sitemapInclude', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#02236E] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      aria-label={`Priority for ${p.slug}`}
                      className="border border-slate-200 rounded-lg p-2 w-20 text-xs font-mono bg-white outline-none focus:border-[#02236E]"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={p.sitemapPriority ?? ''}
                      placeholder="Default"
                      onChange={(e) => update(p.id, 'sitemapPriority', e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Frequency for ${p.slug}`}
                      className="border border-slate-200 rounded-lg p-2 text-xs bg-white outline-none focus:border-[#02236E]"
                      value={p.sitemapFrequency || ''}
                      onChange={(e) => update(p.id, 'sitemapFrequency', e.target.value)}
                    >
                      <option value="">Default</option>
                      {FREQUENCIES.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No pages match your filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Bottom Bar matching Oriscare with live endpoint links */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-t border-slate-100 pt-4">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <a
            className="text-[#02236E] font-bold hover:underline inline-flex items-center gap-1"
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
          >
            View generated sitemap.xml <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300">|</span>
          <a
            className="text-[#02236E] font-bold hover:underline inline-flex items-center gap-1"
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
          >
            View robots.txt <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300">|</span>
          <a
            className="text-[#02236E] font-bold hover:underline inline-flex items-center gap-1"
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
          >
            View llms.txt <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          type="button"
          className="bg-[#02236E] hover:bg-[#001850] text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          onClick={save}
          disabled={busy}
        >
          {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {busy ? 'Saving...' : 'Save SEO Intelligence'}
        </button>
      </div>
    </div>
  );
}
