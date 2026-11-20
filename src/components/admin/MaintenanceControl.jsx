'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe, Loader2, Save, ShieldAlert, Sliders, X } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function MaintenanceControl() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [scope, setScope] = useState('all');
  const [message, setMessage] = useState(
    'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.',
  );
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [pages, setPages] = useState([]);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/maintenance`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load maintenance settings');
      const m = data.maintenance || {};
      setEnabled(Boolean(m.enabled));
      setScope(m.scope === 'selected' ? 'selected' : 'all');
      setMessage(m.message || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.');
      setSelectedPaths(Array.isArray(m.selectedPaths) ? m.selectedPaths : []);
      setPages(Array.isArray(data.pages) ? data.pages : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const togglePath = (slug) => {
    setSelectedPaths((prev) => (prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]));
  };

  const handleSave = async (overrideEnabled) => {
    const targetEnabled = overrideEnabled !== undefined ? overrideEnabled : enabled;
    if (targetEnabled && scope === 'selected' && selectedPaths.length === 0) {
      setError('Please select at least one page when Maintenance Scope is set to Selected Pages.');
      setCoverageOpen(true);
      return;
    }

    const ok = await confirmDialog({
      title: targetEnabled ? 'Activate Maintenance Mode?' : 'Save Maintenance Settings?',
      text: targetEnabled
        ? scope === 'all'
          ? 'Public visitors will immediately see the Khudii Maintenance page across the ENTIRE website. Admin routes remain accessible.'
          : `Public visitors will see the Maintenance page on ${selectedPaths.length} selected route(s).`
        : 'Public website will remain live and accessible to all visitors.',
      status: targetEnabled ? 'error' : 'success',
      confirmText: targetEnabled ? 'Enable Maintenance' : 'Save Settings',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/maintenance`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({
          enabled: targetEnabled,
          scope,
          message,
          selectedPaths,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Save failed');
      setEnabled(targetEnabled);
      setCoverageOpen(false);
      alertNotice({
        title: targetEnabled ? 'Maintenance Mode ACTIVE' : 'Settings Saved (Site Live)',
        text: targetEnabled ? 'Public website routes will display the maintenance screen.' : 'Public website is live and operational.',
        status: targetEnabled ? 'warning' : 'success',
      });
    } catch (err) {
      setError(err.message);
      alertNotice({ title: 'Update Failed', text: err.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#02236E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#02236E]">
            <ShieldAlert size={22} className={enabled ? 'text-[#ed0026]' : 'text-emerald-600'} />
            Website Maintenance Mode
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Temporarily place the entire Khudii website or specific public pages under maintenance while keeping the Admin Panel fully operational.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              enabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${enabled ? 'animate-pulse bg-red-600' : 'bg-emerald-600'}`} />
            {enabled ? 'Maintenance Active' : 'Public Site Live'}
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* SEO Crawler Warning Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="font-bold">Search Engine &amp; Visitor Advisory</p>
          <p className="mt-0.5 leading-relaxed">
            Keep maintenance windows brief so search crawlers do not de-index public pages. Administrators signed into <code>/admin-app</code> and <code>/letskhudii</code> are never blocked.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Maintenance Status</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {enabled
                ? scope === 'all'
                  ? 'All public routes currently display the maintenance screen.'
                  : `${selectedPaths.length} selected route(s) currently display the maintenance screen.`
                : 'Website is live and serving normal content to all visitors.'}
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="sr-only"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <div className={`h-7 w-12 rounded-full transition-colors ${enabled ? 'bg-[#ed0026]' : 'bg-slate-300'}`} />
            <div
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : ''
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {enabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        {/* Coverage Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Maintenance Coverage
            </label>
            <button
              type="button"
              onClick={() => setCoverageOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#02236E] hover:bg-blue-50 cursor-pointer"
            >
              <Sliders size={13} />
              Configure Coverage ({scope === 'all' ? 'Entire Website' : `${selectedPaths.length} Pages`})
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                scope === 'all'
                  ? 'border-[#02236E] bg-blue-50/70 ring-2 ring-[#02236E]/15'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#02236E]">
                <Globe size={16} /> Entire Website
              </div>
              <p className="mt-1 text-xs text-slate-500">Show maintenance view across all public routes.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setScope('selected');
                setCoverageOpen(true);
              }}
              className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                scope === 'selected'
                  ? 'border-[#02236E] bg-blue-50/70 ring-2 ring-[#02236E]/15'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#02236E]">
                <CheckCircle2 size={16} /> Selected Pages Only ({selectedPaths.length})
              </div>
              <p className="mt-1 text-xs text-slate-500">Restrict maintenance notice to chosen pages only.</p>
            </button>
          </div>
        </div>

        {/* Custom Maintenance Message */}
        <div>
          <label htmlFor="maintenance-msg" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Visitor Maintenance Message
          </label>
          <textarea
            id="maintenance-msg"
            rows={4}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a clear message explaining when the site will return..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-[#02236E]/15"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{message.length} / 2000 characters</p>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 cursor-pointer ${
              enabled ? 'bg-[#ed0026] hover:bg-[#c8001f]' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Applying...' : enabled ? 'Apply Maintenance Mode' : 'Save Maintenance Settings'}
          </button>
        </div>
      </div>

      {/* Coverage Selection Modal */}
      {coverageOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCoverageOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select Maintenance Pages"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[#02236E]">Select Pages for Maintenance</h3>
                <p className="text-xs text-slate-500">Choose which public pages should show the maintenance screen.</p>
              </div>
              <button
                type="button"
                onClick={() => setCoverageOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto p-6">
              {pages.map((pg) => {
                const checked = selectedPaths.includes(pg.slug);
                return (
                  <label
                    key={pg.slug}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      checked ? 'border-[#02236E] bg-blue-50/70' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePath(pg.slug)}
                        className="h-4 w-4 rounded border-slate-300 text-[#02236E]"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{pg.title}</p>
                        <p className="font-mono text-xs text-slate-500">{pg.slug}</p>
                      </div>
                    </div>
                    {pg.status !== 'published' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Draft
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <span className="text-xs font-bold text-slate-600">{selectedPaths.length} page(s) selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaths([])}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setCoverageOpen(false)}
                  className="rounded-xl bg-[#02236E] px-5 py-2 text-xs font-bold text-white hover:bg-[#001850] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
