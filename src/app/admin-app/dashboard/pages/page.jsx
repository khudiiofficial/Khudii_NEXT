'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  GripVertical,
  Globe,
  FileText,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileCode2,
  ChevronRight
} from 'lucide-react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import { CMS_PAGES } from '@/lib/cms-registry';

const API = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/v2`;

export default function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'templates'
  const [draggedId, setDraggedId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [selectedSeoPage, setSelectedSeoPage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const [pagesRes, catRes] = await Promise.all([
        fetch(`${API}/pages?limit=500`, {
          headers: { 'x-khudii-surface': 'admin' },
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch(`${API}/categories?limit=500`, {
          headers: { 'x-khudii-surface': 'admin' },
          credentials: 'include',
          cache: 'no-store',
        }).catch(() => null),
      ]);

      const pagesJson = await pagesRes.json();
      if (pagesJson.success) {
        setPages(pagesJson.data || []);
      }
      if (catRes) {
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data || []);
      }
    } catch (err) {
      showToast('Failed to load pages from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCopyUrl = (id, pathOrSlug) => {
    const cleanPath = pathOrSlug.startsWith('/') ? pathOrSlug : `/${pathOrSlug}`;
    const fullUrl = `${window.location.origin}${cleanPath}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast(`Copied URL: ${cleanPath}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusToggle = async (page, nextPublished) => {
    const nextStatus = nextPublished ? 'published' : 'draft';
    const oldPages = [...pages];
    setPages((prev) =>
      prev.map((p) => (p.id === page.id ? { ...p, status: nextStatus } : p))
    );

    try {
      const res = await fetch(`${API}/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: nextStatus,
          revision: Number(page.revision || 1),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || 'Status update failed');
      }
      showToast(`Page is now ${nextStatus === 'published' ? 'Published' : 'Draft'}`);
    } catch (err) {
      setPages(oldPages);
      showToast(err.message, 'error');
    }
  };

  const handleDuplicate = async (page) => {
    setConfirmConfig({
      icon: <Copy className="w-8 h-8 text-[#02236E]" />,
      title: 'Duplicate Page',
      message: `Create a complete unpublished draft copy of "${page.title}" with its tabs and sections?`,
      confirmText: 'Duplicate page',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/pages/${page.id}/duplicate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-khudii-surface': 'admin',
            },
            credentials: 'include',
            body: '{}',
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error?.message || data.message || 'Duplication failed');
          }
          showToast(`Page duplicated as #${data.data?.id || 'new'}`);
          await fetchPages();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleDelete = (page) => {
    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Delete Page',
      message: `Permanently delete "${page.title}" and its associated sections? This action cannot be undone.`,
      confirmText: 'Delete permanently',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/pages/${page.id}`, {
            method: 'DELETE',
            headers: { 'x-khudii-surface': 'admin' },
            credentials: 'include',
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error?.message || data.message || 'Deletion failed');
          }
          setPages((prev) => prev.filter((p) => p.id !== page.id));
          showToast('Page removed successfully');
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || savingOrder) return;

    const fromIdx = pages.findIndex((p) => p.id === draggedId);
    const toIdx = pages.findIndex((p) => p.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const reordered = [...pages];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setPages(reordered);
    setDraggedId(null);
    setSavingOrder(true);

    try {
      const res = await fetch(`${API}/pages/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error();
      showToast('Page display order updated');
    } catch {
      showToast('Failed to save order in database.', 'error');
      await fetchPages();
    } finally {
      setSavingOrder(false);
    }
  };

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    pages.forEach((p) => {
      if (p.status === 'published') published++;
      else draft++;
    });
    return { total: pages.length, published, draft };
  }, [pages]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((p) => {
      const matchSearch =
        !q ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.path || '').toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' || (p.status || 'draft').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pages, search, statusFilter]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CMS_PAGES.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Top Header Controls (khudii Design Language) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#02236E]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#02236E] m-0">Pages Management</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-0">
            Manage live website pages, titles, slugs, visual section builder, SEO and drag reordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPages}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/admin-app/dashboard/pages/edit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-900 active:scale-95"
          >
            <Plus size={16} />
            Create New Page
          </Link>
        </div>
      </div>

      {/* Quick Stats Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pages</div>
          <div className="text-2xl font-black text-[#02236E] mt-1">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Published / Live</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{stats.published}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Drafts / In Review</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{stats.draft}</div>
        </div>
      </div>

      {/* Mode Tabs: Dynamic DB Pages vs Public Frontend Templates */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'database'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-[#02236E]'
            }`}
        >
          <Layers size={17} />
          Dynamic Database Pages ({pages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'templates'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-[#02236E]'
            }`}
        >
          <FileCode2 size={17} />
          Frontend Layout Templates ({CMS_PAGES.length})
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder={
              activeTab === 'database'
                ? 'Search pages by title, slug or path...'
                : 'Search layout templates...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {activeTab === 'database' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#02236E]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        )}
      </div>

      {/* Database Pages Table (khudii Architecture) */}
      {activeTab === 'database' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">Order</th>
                <th className="p-4">Page Title &amp; Slug</th>
                <th className="p-4">Public Path</th>
                <th className="p-4">Publishing Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                    Loading pages from database...
                  </td>
                </tr>
              ) : filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <tr
                    key={page.id}
                    draggable={!search}
                    onDragStart={(e) => handleDragStart(e, page.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, page.id)}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    {/* Drag Handle & Order */}
                    <td className="p-4 text-center">
                      <span
                        title="Drag to reorder"
                        className="inline-flex cursor-grab items-center gap-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <GripVertical size={16} />
                        <span className="text-xs font-bold text-slate-500">
                          {page.sort_order ?? index + 1}
                        </span>
                      </span>
                    </td>

                    {/* Title & Slug with 1-click URL copy */}
                    <td className="p-4">
                      <div className="font-bold text-[#02236E] text-sm">
                        {page.title || 'Untitled Page'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-mono">
                          /{page.slug || ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(page.id, page.path || page.slug)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#02236E] transition-colors"
                          title="Copy live URL"
                        >
                          {copiedId === page.id ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Public Path */}
                    <td className="p-4 text-xs font-mono text-slate-600">
                      {page.path || `/${page.slug || ''}`}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <AdminPublishSwitch
                          checked={page.status === 'published'}
                          onChange={(checked) => handleStatusToggle(page, checked)}
                          label={page.status === 'published' ? 'Published' : 'Draft'}
                        />
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${page.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {page.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </td>

                    {/* Actions: Edit (Dedicated Page), Duplicate, Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview on live site */}
                        <a
                          href={page.path || `/${page.slug || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View live page"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                        >
                          <ExternalLink size={15} />
                        </a>

                        {/* SEO Center */}
                        <button
                          type="button"
                          onClick={() => setSelectedSeoPage({ ...page, entityType: 'page' })}
                          title="Open SEO Center"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          <Sliders size={13} />
                          SEO Center
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(page)}
                          title="Duplicate page"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                        >
                          <Copy size={14} />
                        </button>

                        {/* Edit: Navigates to dedicated /pages/edit page */}
                        <Link
                          href={`/admin-app/dashboard/pages/edit?id=${page.id}`}
                          title="Edit page sections &amp; settings"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors"
                        >
                          <Pencil size={13} />
                        </Link>

                        {/* Delete with ConfirmModal */}
                        <button
                          type="button"
                          onClick={() => handleDelete(page)}
                          title="Delete page"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
                    No pages matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Frontend Layout Templates Table */}
      {activeTab === 'templates' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Template Layout</th>
                <th className="p-4">Route Path</th>
                <th className="p-4">Native Sections</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.map((tpl) => (
                <tr key={tpl.slug} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-bold text-[#02236E]">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#02236E]" />
                      <span>{tpl.title}</span>
                    </div>
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
                      {tpl.slug === '@global'
                        ? 'Shared header/footer & site chrome'
                        : tpl.slug.includes('[')
                          ? 'Dynamic route template'
                          : 'Public frontend page'}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-600">{tpl.slug}</td>
                  <td className="p-4">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {tpl.sections?.length || 0} sections
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!tpl.slug.includes('[') && tpl.slug !== '@global' && (
                        <a
                          href={tpl.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview public template"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                        >
                          <Globe size={15} />
                        </a>
                      )}
                      <Link
                        href={`/admin-app/dashboard/pages/edit?slug=${encodeURIComponent(tpl.slug)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedSeoPage({ id: tpl.slug, slug: tpl.slug, path: tpl.slug, title: tpl.title, entityType: 'page' })}
                        title="Open SEO Center"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Sliders size={13} />
                        SEO Center
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSeoPage && (
        <SeoCenterModal
          isOpen={Boolean(selectedSeoPage)}
          onClose={() => setSelectedSeoPage(null)}
          pageData={selectedSeoPage}
          onSaveSuccess={() => {
            showToast('SEO Center data synchronized!');
            fetchPages();
          }}
        />
      )}
    </div>
  );
}
