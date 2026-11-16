'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AdminIconAction from '@/components/AdminIconAction';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import {
  BookOpen,
  Copy,
  GripVertical,
  ImageOff,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Pencil,
  ExternalLink,
  Check,
  Sliders
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

async function send(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'x-khudii-surface': 'admin',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || body.error?.message || `Request failed (HTTP ${response.status})`);
  }
  return body;
}

const button =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs disabled:opacity-40';
const date = (value) =>
  value ? new Date(value).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [confirmConfig, setConfirmConfig] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedSeoBlog, setSelectedSeoBlog] = useState(null);

  const drag = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await send('/admin/blogs');
      setBlogs(data.items || []);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const visible = useMemo(
    () =>
      blogs.filter(
        (b) =>
          (filter === 'all' || (filter === 'published' ? !!b.status : !b.status)) &&
          `${b.Name || ''} ${b.slug || ''} ${b.meta_title || ''}`.toLowerCase().includes(search.toLowerCase())
      ),
    [blogs, filter, search]
  );

  const toggle = async (blog) => {
    setSaving(true);
    try {
      await send(`/admin/blogs/${blog.id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !blog.status }),
      });
      showToast(blog.status ? 'Blog moved to draft' : 'Blog published');
      await reload();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = (blog) => {
    setConfirmConfig({
      icon: <Copy className="w-8 h-8 text-[#02236E]" />,
      title: 'Duplicate Blog',
      message: `Copy the complete article, sections and images for "${blog.Name}" into a new draft?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setSaving(true);
        try {
          const result = await send(`/admin/blogs/${blog.id}/duplicate`, {
            method: 'POST',
            body: '{}',
          });
          showToast(`Draft created as #${result.id}`);
          await reload();
        } catch (e) {
          showToast(e.message, 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleRemove = (blog) => {
    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Archive Blog Post',
      message: `Archive "${blog.Name}"? It will disappear from public listings. Existing media files will be retained.`,
      confirmText: 'Archive post',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setSaving(true);
        try {
          await send(`/api/documents/${blog.id}`, { method: 'DELETE' });
          showToast('Blog archived');
          await reload();
        } catch (e) {
          showToast(e.message, 'error');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleCopyUrl = (blog) => {
    const fullUrl = `${window.location.origin}/Blog/${blog.slug || blog.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(blog.id);
    showToast('Copied blog URL');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const move = async (id, targetId) => {
    if (saving || filter !== 'all' || search.trim() || id === targetId) return;
    const ordered = [...blogs];
    const from = ordered.findIndex((b) => b.id === id);
    const to = ordered.findIndex((b) => b.id === targetId);
    if (from < 0 || to < 0) return;
    ordered.splice(to, 0, ordered.splice(from, 1)[0]);
    setBlogs(ordered);

    setSaving(true);
    try {
      await send('/admin/blogs/order', {
        method: 'PUT',
        body: JSON.stringify({ ids: ordered.map((b) => b.id) }),
      });
      showToast('Blog order saved; first published blog is featured');
    } catch (e) {
      setBlogs(blogs);
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    blogs.forEach((b) => {
      if (b.status) published++;
      else draft++;
    });
    return { total: blogs.length, published, draft };
  }, [blogs]);

  const firstPublished = blogs.find((b) => !!b.status)?.id;

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#02236E]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#02236E] m-0">Blog Posts</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-0">
            Manage articles, publishing, SEO and featured display order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={reload} disabled={loading || saving} className={button}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link
            href="/admin-app/dashboard/create-document"
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/20 hover:bg-blue-900 transition active:scale-95"
          >
            <Plus size={16} /> Create New Blog
          </Link>
        </div>
      </header>

      {/* Quick Stats Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Articles</div>
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

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug or SEO title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            aria-label="Filter publication status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#02236E]"
          >
            <option value="all">All articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[790px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4 w-12 text-center">Order</th>
              <th className="p-4">Post &amp; Slug</th>
              <th className="p-4">Publication</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                  Loading blogs…
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((blog, index) => (
                <tr
                  key={blog.id}
                  draggable={!saving && filter === 'all' && !search}
                  onDragStart={(e) => {
                    drag.current = blog.id;
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    move(drag.current, blog.id);
                    drag.current = null;
                  }}
                  onDragEnd={() => {
                    drag.current = null;
                  }}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-slate-400 cursor-grab">
                      <GripVertical size={16} />
                      <span className="text-xs font-bold text-slate-500">
                        {filter === 'all' && !search ? index + 1 : blog.sort_order || index + 1}
                      </span>
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                        {blog.image_path ? (
                          <img loading="lazy" src={blog.image_path} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-[#02236E] text-sm">
                          <span>{blog.Name || 'Untitled blog'}</span>
                          {blog.id === firstPublished && (
                            <Star size={14} fill="currentColor" className="text-amber-500 shrink-0" title="Featured Post" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-mono">
                            /Blog/{blog.slug || 'no-slug'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(blog)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#02236E]"
                          >
                            {copiedId === blog.id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AdminIconAction
                        action={blog.status ? 'hide' : 'show'}
                        disabled={saving}
                        onClick={() => toggle(blog)}
                        label={`${blog.status ? 'Unpublish' : 'Publish'} ${blog.Name}`}
                      />
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          blog.status ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {blog.status ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap p-4 text-xs text-slate-500">
                    {date(blog.updated_at || blog.created_at)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview on live site */}
                      <a
                        href={`/Blog/${blog.slug || blog.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                        title="View live post"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* SEO Center */}
                      <button
                        type="button"
                        onClick={() => setSelectedSeoBlog({ id: blog.id, slug: blog.slug, title: blog.Name, entityType: 'blog' })}
                        title={`Open SEO Center for ${blog.Name}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Sliders size={13} />
                        SEO Center
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(blog)}
                        disabled={saving}
                        title={`Duplicate ${blog.Name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 disabled:opacity-40"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Edit */}
                      <Link
                        href={`/admin-app/dashboard/edit-Blog/${blog.id}`}
                        title={`Edit ${blog.Name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemove(blog)}
                        disabled={saving}
                        title={`Delete ${blog.Name}`}
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
                  No matching blogs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedSeoBlog && (
        <SeoCenterModal
          isOpen={Boolean(selectedSeoBlog)}
          onClose={() => setSelectedSeoBlog(null)}
          pageData={selectedSeoBlog}
          onSaveSuccess={() => {
            showToast('SEO Center data saved!');
            reload();
          }}
        />
      )}
    </div>
  );
}
