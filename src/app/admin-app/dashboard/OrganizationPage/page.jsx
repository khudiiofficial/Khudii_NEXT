'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AdminIconAction from '@/components/AdminIconAction';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import {
  Building2,
  GripVertical,
  ImageOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Pencil,
  ExternalLink,
  Check,
  Sliders
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'x-khudii-surface': 'admin',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

const button =
  'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs disabled:opacity-50';

export default function OrganizationManagement() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedSeoOrg, setSelectedSeoOrg] = useState(null);
  const drag = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request('/admin/organizations');
      setRecords(result.items || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(
    () =>
      records.filter((row) =>
        `${row.name || ''} ${row.slug || ''} ${row.category || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [records, query]
  );

  const remove = (row) => {
    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Archive Organization',
      message: `Remove "${row.name}" from the public directory? Images and details will be retained.`,
      confirmText: 'Archive',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setSaving(true);
        try {
          await request(`/api/delete/${row.id}`, { method: 'POST', body: '{}' });
          setRecords((list) => list.filter((record) => record.id !== row.id));
          showToast('Organization archived');
          await refresh();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const changeVisibility = async (org) => {
    const next = !Boolean(org.status);
    setSaving(true);
    try {
      await request(`/admin/organizations/${org.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visible: next }),
      });
      setRecords((rows) =>
        rows.map((row) => (row.id === org.id ? { ...row, status: next ? 1 : 0 } : row))
      );
      showToast(next ? 'Organization is now public' : 'Organization hidden from directory');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const duplicate = (org) => {
    setConfirmConfig({
      icon: <Copy className="w-8 h-8 text-[#02236E]" />,
      title: 'Duplicate Organization',
      message: `Create a hidden copy of "${org.name}", including images, contact details and icons?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setSaving(true);
        try {
          const result = await request(`/admin/organizations/${org.id}/duplicate`, {
            method: 'POST',
            body: '{}',
          });
          showToast(`Organization copy created #${result.id}`);
          await refresh();
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleCopyUrl = (org) => {
    const fullUrl = `${window.location.origin}/${org.slug || org.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(org.id);
    showToast('Copied organization URL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reorder = async (fromId, toId) => {
    if (saving || query.trim() || fromId === toId) return;
    const previous = records;
    const reordered = [...records];
    const from = reordered.findIndex((row) => row.id === fromId);
    const to = reordered.findIndex((row) => row.id === toId);
    if (from < 0 || to < 0) return;
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    setRecords(reordered);

    setSaving(true);
    try {
      await request('/admin/organizations/order', {
        method: 'PUT',
        body: JSON.stringify({ ids: reordered.map((row) => row.id) }),
      });
      showToast('Organization order saved');
    } catch (err) {
      showToast(err.message, 'error');
      setRecords(previous);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    records.forEach((r) => {
      if (r.status) published++;
      else draft++;
    });
    return { total: records.length, published, draft };
  }, [records]);

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#02236E]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#02236E] m-0">Organizations</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-0">
            Manage NGO profiles and drag rows to arrange the public welfare directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={refresh} disabled={loading || saving} className={button}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link
            href="/admin-app/dashboard/createorg"
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/20 hover:bg-blue-900 transition active:scale-95"
          >
            <Plus size={16} /> Create Organization
          </Link>
        </div>
      </header>

      {/* Quick Stats Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total NGOs</div>
          <div className="text-2xl font-bold text-[#02236E] mt-1">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Published / Active</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.published}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Drafts / In Review</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{stats.draft}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations by name, slug or category..."
          />
        </div>
        <div className="text-xs text-slate-400">
          {filtered.length} of {records.length} organizations
          {query ? ' · Clear search to enable drag ordering' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-bold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="p-4 w-12 text-center">Order</th>
              <th className="p-4">Organization &amp; Details</th>
              <th className="p-4">Public URL</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="p-12 text-center text-slate-400" colSpan={5}>
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                  Loading organizations...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((org, index) => (
                <tr
                  key={org.id}
                  className="hover:bg-blue-50/30 transition-colors"
                  draggable={!query && !saving}
                  onDragStart={(e) => {
                    drag.current = org.id;
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    if (!query) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag.current != null) reorder(drag.current, org.id);
                    drag.current = null;
                  }}
                  onDragEnd={() => {
                    drag.current = null;
                  }}
                >
                  <td className="p-4 text-center">
                    <span
                      title="Drag to reorder"
                      className="inline-flex cursor-grab items-center gap-1.5 text-slate-400"
                    >
                      <GripVertical size={16} />
                      <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {org.introductory_image_path ? (
                        <img
                          src={org.introductory_image_path}
                          alt=""
                          loading="lazy"
                          className="h-14 w-16 shrink-0 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <span className="grid h-14 w-16 shrink-0 place-items-center rounded-xl bg-slate-100 border border-slate-200">
                          <ImageOff size={18} className="text-slate-400" />
                        </span>
                      )}
                      <div>
                        <p className="font-bold text-[#02236E] text-sm">{org.name}</p>
                        <p className="max-w-[340px] truncate text-xs text-slate-500 mt-0.5">
                          {String(org.description || '')
                            .replace(/<[^>]*>/g, '')
                            .slice(0, 160)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-600">/{org.slug || ''}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(org)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#02236E]"
                      >
                        {copiedId === org.id ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AdminIconAction
                        action={org.status ? 'hide' : 'show'}
                        disabled={saving}
                        label={`${org.status ? 'Hide' : 'Show'} ${org.name}`}
                        onClick={() => changeVisibility(org)}
                      />
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          org.status ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {org.status ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview on live site */}
                      <a
                        href={`/${org.slug || org.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                        title="View live organization"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* SEO Center */}
                      <button
                        type="button"
                        onClick={() => setSelectedSeoOrg({ id: org.id, slug: org.slug, title: org.name, entityType: 'organization' })}
                        title={`Open SEO Center for ${org.name}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Sliders size={13} />
                        SEO Center
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => duplicate(org)}
                        disabled={saving}
                        title={`Duplicate ${org.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 disabled:opacity-40"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/admin-app/dashboard/edit-organization/${org.id}`}
                        title={`Edit ${org.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => remove(org)}
                        disabled={saving}
                        title={`Delete ${org.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedSeoOrg && (
        <SeoCenterModal
          isOpen={Boolean(selectedSeoOrg)}
          onClose={() => setSelectedSeoOrg(null)}
          pageData={selectedSeoOrg}
          onSaveSuccess={() => {
            showToast('SEO Center data saved!');
            refresh();
          }}
        />
      )}
    </div>
  );
}
