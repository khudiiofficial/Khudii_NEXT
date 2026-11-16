'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { navigationWritePayload } from '@/lib/navigation-write-payload';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { confirmDelete, showSuccess, showError, toastNotice } from '@/lib/dialogs';
import { CrudActions } from '@/components/ui/CrudActions';
import { AppButton, SaveButton, CancelButton, AddButton, ReloadButton } from '@/components/ui/AppButton';

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/v2`;
const BASE = `${API_BASE}/navigation`;
const headers = { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' };
const field = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#02236E] placeholder:text-slate-400 focus:border-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#02236E]/10 transition';

const LEVEL_COLORS = [
  {
    pill: 'bg-blue-100 text-[#02236E]',
    row: 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/60',
    dot: 'bg-[#02236E]',
  },
  {
    pill: 'bg-purple-100 text-purple-800',
    row: 'border-purple-200 bg-purple-50/30 hover:bg-purple-50/60',
    dot: 'bg-purple-600',
  },
  {
    pill: 'bg-amber-100 text-amber-800',
    row: 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/60',
    dot: 'bg-amber-600',
  },
];

async function api(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const requestHeaders = {
    'x-khudii-surface': 'admin',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: requestHeaders,
    ...(body !== undefined ? { body } : {}),
    cache: 'no-store',
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    throw new Error(json.message || json.error?.message || json.error || `Request failed (${response.status})`);
  }
  return json;
}

export default function KhudiiMenuTreeEditor({ location = 'header' }) {
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const drag = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('?limit=500');
      setRows(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load published pages for the Page target dropdown selector
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/pages?limit=500`, {
      headers,
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((res) => {
        if (active && res.success && Array.isArray(res.data)) {
          setPages(res.data);
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editing && !saving) {
        setEditing(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editing, saving]);

  const current = useMemo(() => rows.filter((x) => x.location === location), [rows, location]);

  const childMap = useMemo(() => {
    const map = new Map();
    for (const row of current) {
      const key = Number(row.parent_id) || 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return map;
  }, [current]);

  const edit = (row) => {
    setError('');
    setEditing(row?.id || 'new');
    if (row) {
      setDraft({
        ...row,
        parent_id: row.parent_id ? Number(row.parent_id) : '',
        page_id: row.page_id ? Number(row.page_id) : '',
        url: row.url || '',
      });
    } else {
      setDraft({
        item_key: `${location}-${Date.now().toString(36)}`,
        location,
        label: '',
        parent_id: '',
        link_type: 'internal',
        url: '',
        page_id: '',
        is_visible: true,
        open_new_tab: false,
        sort_order: current.length + 1,
        revision: 1,
      });
    }
  };

  const update = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleLinkTypeChange = (newType) => {
    setDraft((prev) => {
      const next = { ...prev, link_type: newType };
      if (newType === 'group') {
        next.url = '';
        next.page_id = '';
      } else if (newType === 'page') {
        next.url = '';
        if (!next.page_id && pages.length > 0) {
          next.page_id = pages[0].id;
        }
      } else {
        next.page_id = '';
      }
      return next;
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!draft.label?.trim()) {
      setError('Please provide a label for this navigation item.');
      return;
    }
    if (draft.link_type === 'page' && !draft.page_id) {
      setError('Please select a target CMS page for this link.');
      return;
    }
    if (['internal', 'external', 'anchor'].includes(draft.link_type) && !draft.url?.trim()) {
      setError('Please enter a target URL or path (e.g. /about-khudii).');
      return;
    }

    setSaving(true);
    try {
      const isNew = editing === 'new';
      const cleanKey = String(draft.item_key || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');

      let targetUrl = draft.url ? draft.url.trim() : null;
      if (draft.link_type === 'internal' && targetUrl) {
        if (!targetUrl.startsWith('/') && !targetUrl.startsWith('#')) {
          targetUrl = `/${targetUrl}`;
        }
        targetUrl = targetUrl.toLowerCase();
      }

      const payloadData = {
        ...draft,
        item_key: cleanKey || `${location}-${Date.now().toString(36)}`,
        location,
        parent_id: draft.parent_id ? Number(draft.parent_id) : null,
        page_id: draft.link_type === 'page' && draft.page_id ? Number(draft.page_id) : null,
        url: ['internal', 'external', 'anchor'].includes(draft.link_type) ? targetUrl : null,
      };

      if (payloadData.link_type === 'group') {
        payloadData.url = null;
        payloadData.page_id = null;
      } else if (payloadData.link_type === 'page') {
        payloadData.url = null;
      } else {
        payloadData.page_id = null;
      }

      const body = navigationWritePayload(payloadData);
      if (!isNew) {
        body.revision = Number(draft.revision || 1);
      }

      await api(isNew ? '' : `/${editing}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(body),
      });

      setEditing(null);
      await refresh();
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await showSuccess(
        isNew ? 'Menu link added' : 'Changes saved',
        `"${payloadData.label}" has been successfully saved.`
      );
    } catch (e) {
      setError(e.message);
      showError('Save failed', e.message || 'Could not save navigation link');
    } finally {
      setSaving(false);
    }
  };

  const act = async (row, operation) => {
    if (operation === 'delete') {
      const confirmed = await confirmDelete(
        row.label,
        'This will remove the link from the menu. Any child links will remain and should be re-assigned.'
      );
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      if (operation === 'toggle') {
        const payload = {
          is_visible: !Boolean(row.is_visible),
        };
        await api(`/${row.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      if (operation === 'delete') {
        await api(`/${row.id}`, { method: 'DELETE' });
      }

      if (operation === 'duplicate') {
        const cleanKey = `${String(row.item_key || 'link').toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-copy-${Date.now().toString(36)}`;
        const duplicatePayload = navigationWritePayload({
          ...row,
          item_key: cleanKey,
          label: `${row.label} (Copy)`,
          is_visible: false,
          sort_order: (Number(row.sort_order) || 0) + 1,
        });
        delete duplicatePayload.revision;
        delete duplicatePayload.id;
        if (duplicatePayload.link_type === 'group') {
          duplicatePayload.url = null;
          duplicatePayload.page_id = null;
        } else if (duplicatePayload.link_type === 'page') {
          duplicatePayload.url = null;
        } else {
          duplicatePayload.page_id = null;
        }

        await api('', {
          method: 'POST',
          body: JSON.stringify(duplicatePayload),
        });
      }

      await refresh();
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      toastNotice({
        title:
          operation === 'duplicate'
            ? `Duplicated "${row.label}"`
            : operation === 'delete'
              ? `Deleted "${row.label}"`
              : `Updated "${row.label}" visibility`,
        status: 'success',
      });
    } catch (e) {
      setError(e.message);
      showError('Operation failed', e.message || 'Action could not be completed');
    } finally {
      setSaving(false);
    }
  };

  async function drop(target) {
    const source = drag.current;
    drag.current = null;
    if (!source || source.id === target.id) return;
    const sameParent = Number(source.parent_id || 0) === Number(target.parent_id || 0);
    if (source.location !== target.location || !sameParent) {
      setError('Move between levels by editing the Parent menu selector. Drag ordering is available within each level.');
      return;
    }
    const siblings = (childMap.get(Number(target.parent_id) || 0) || []).map((x) => x.id);
    const a = siblings.indexOf(source.id);
    const b = siblings.indexOf(target.id);
    if (a < 0 || b < 0) return;
    siblings.splice(b, 0, siblings.splice(a, 1)[0]);
    try {
      setSaving(true);
      await api('/reorder', { method: 'PUT', body: JSON.stringify({ ids: siblings }) });
      await refresh();
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const seen = new Set();
  const render = (parent = 0, level = 0) => {
    if (level > 8) return null;
    return (childMap.get(parent) || [])
      .filter((x) => !seen.has(x.id))
      .map((row) => {
        seen.add(row.id);
        const childCount = (childMap.get(row.id) || []).length;
        const tint = LEVEL_COLORS[Math.min(level, 2)];
        const isMissingPage = row.link_type === 'page' && !row.page_id;

        return (
          <div key={row.id}>
            <div
              draggable={!saving}
              onDragStart={() => {
                drag.current = row;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                drop(row);
              }}
              className={`group mb-2 flex flex-wrap items-center gap-2 rounded-xl border px-3.5 py-3 shadow-xs transition-colors ${tint.row} ${!row.is_visible ? 'opacity-60 bg-slate-50' : ''}`}
              style={{ marginLeft: Math.min(level, 5) * 20 }}
            >
              <GripVertical size={18} className="shrink-0 cursor-grab text-slate-400 group-hover:text-slate-600" />
              <span aria-hidden="true" className={`h-6 w-1 shrink-0 rounded-full ${tint.dot}`} />
              <button
                type="button"
                aria-label="Expand submenu"
                onClick={() => setCollapsed((p) => ({ ...p, [row.id]: !p[row.id] }))}
                className="w-5 text-slate-500 hover:text-[#02236E]"
              >
                {childCount ? (
                  collapsed[row.id] ? (
                    <ChevronRight size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )
                ) : null}
              </button>
              <span className="min-w-[130px] flex-1 text-sm font-semibold text-[#02236E]">
                {row.label}
                <small className="mt-1 flex flex-wrap items-center gap-2 text-xs font-normal text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-bold ${tint.pill}`}>
                    Level {Math.min(level + 1, 3)}
                  </span>
                  <span>
                    {row.url || (row.link_type === 'group' ? 'Dropdown Group' : row.link_type === 'page' ? (row.page_id ? `CMS Page #${row.page_id}` : 'Page Link') : row.link_type)}
                    {childCount ? ` · ${childCount} children` : ''}
                  </span>
                  {isMissingPage && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      <AlertCircle size={11} /> Needs page target
                    </span>
                  )}
                  {!row.is_visible && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      Hidden
                    </span>
                  )}
                </small>
              </span>

              {/* Centralized CRUD Actions Group matching Image 2 */}
              <CrudActions
                row={row}
                label={row.label}
                isVisible={row.is_visible}
                disabled={saving}
                onEdit={() => edit(row)}
                onDuplicate={() => act(row, 'duplicate')}
                onToggle={() => act(row, 'toggle')}
                onDelete={() => act(row, 'delete')}
              />
            </div>
            {!collapsed[row.id] && render(row.id, level + 1)}
          </div>
        );
      });
  };

  return (
    <section className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <ReloadButton onClick={refresh} loading={loading} />

          {location === 'footer' && !current.some((r) => r.link_type === 'group' && r.label?.toLowerCase() === 'categories') && (
            <AppButton
              action="add"
              className="border border-blue-200 bg-white text-[#02236E] hover:bg-blue-50 shadow-xs"
              onClick={() =>
                edit({
                  item_key: 'footer-categories',
                  location: 'footer',
                  label: 'Categories',
                  link_type: 'group',
                  parent_id: '',
                  page_id: '',
                  url: '',
                  is_visible: true,
                  open_new_tab: false,
                  sort_order: current.length + 1,
                  revision: 1,
                })
              }
            >
              Add categories group
            </AppButton>
          )}

          <AddButton onClick={() => edit()} size="md">
            Add link
          </AddButton>
        </div>
      </div>

      {location === 'footer' && (
        <p className="text-xs text-slate-500">
          To customize footer Categories, add a Categories group and place links to your sector pages beneath it. Until then, the public footer uses the active sector directory automatically.
        </p>
      )}

      {/* Level indicators */}
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        {LEVEL_COLORS.map((t, i) => (
          <span key={i} className={`rounded-full px-3 py-1 font-bold ${t.pill}`}>
            Level {i + 1}
          </span>
        ))}
      </div>

      {error && !editing && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Navigation Tree */}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <ReloadButton loading={true} />
          Loading navigation links...
        </div>
      ) : (
        <div>
          {render()}
          {!current.length && (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-xs">
              No CMS navigation links are configured for this location. Existing frontend fallback links are unaffected.
            </p>
          )}
        </div>
      )}

      {/* Centered Popup Modal for Edit & Add (Kingtravel & Khudii Design Language) */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#02236E]/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nav-item-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setEditing(null);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 id="nav-item-modal-title" className="text-xl font-bold text-[#02236E]">
                  {editing === 'new' ? 'Add navigation link' : `Edit navigation link (${location})`}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Manage menu destination, labels, and hierarchy with live validation.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={save} className="mt-5 space-y-4">
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={draft.label || ''}
                    onChange={(e) => update('label', e.target.value)}
                    placeholder="e.g. Home, About Us, Media, Blogs"
                    className={field}
                  />
                </div>

                {/* Menu Key */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Menu key <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={draft.item_key || ''}
                    onChange={(e) => update('item_key', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                    placeholder="e.g. header-about"
                    className={field}
                  />
                </div>

                {/* Link Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Link type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={draft.link_type || 'internal'}
                    onChange={(e) => handleLinkTypeChange(e.target.value)}
                    className={field}
                  >
                    <option value="internal">Internal route (e.g. /blog, /faqs, /contact)</option>
                    <option value="page">CMS Site Page (by dropdown selection)</option>
                    <option value="group">Dropdown / Group (header menu with children)</option>
                    <option value="external">External link (https://...)</option>
                    <option value="anchor">Anchor (#section)</option>
                  </select>
                </div>

                {/* Page Selection (if type is page) */}
                {draft.link_type === 'page' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target CMS Page <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={draft.page_id || ''}
                      onChange={(e) => {
                        const selId = e.target.value ? Number(e.target.value) : '';
                        const selPage = pages.find((p) => p.id === selId);
                        setDraft((prev) => ({
                          ...prev,
                          page_id: selId,
                          url: selPage?.path || '',
                        }));
                      }}
                      className={field}
                    >
                      <option value="">-- Select a published page --</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.path})
                        </option>
                      ))}
                    </select>
                    {!draft.page_id && (
                      <p className="mt-1 text-xs text-amber-600 font-medium">
                        Select a page, or change Link type to "Internal route".
                      </p>
                    )}
                  </div>
                ) : (
                  /* Target URL (for internal, external, anchor) */
                  <div className={draft.link_type === 'group' ? 'opacity-50' : ''}>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target URL / Path {draft.link_type === 'group' ? '(Disabled for groups)' : ''}
                    </label>
                    <input
                      disabled={draft.link_type === 'group'}
                      value={draft.link_type === 'group' ? '' : (draft.url || '')}
                      onChange={(e) => update('url', e.target.value)}
                      placeholder={
                        draft.link_type === 'external'
                          ? 'https://example.com'
                          : draft.link_type === 'anchor'
                            ? '#section-name'
                            : '/blog'
                      }
                      className={`${field} disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                    />
                  </div>
                )}

                {/* Parent Menu */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Parent menu
                  </label>
                  <select
                    value={draft.parent_id || ''}
                    onChange={(e) => update('parent_id', e.target.value ? Number(e.target.value) : '')}
                    className={field}
                  >
                    <option value="">None / Top-level</option>
                    {current
                      .filter((x) => x.id !== editing)
                      .map((x) => (
                        <option value={x.id} key={x.id}>
                          {x.label} (#{x.id})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Open New Tab (Only for external/internal) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Behavior
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={!!draft.open_new_tab}
                      onChange={(e) => update('open_new_tab', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#02236E] focus:ring-[#02236E]"
                    />
                    Open in new browser tab
                  </label>
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!draft.is_visible}
                    onChange={(e) => update('is_visible', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#02236E] focus:ring-[#02236E]"
                  />
                  Visible in public navigation
                </label>
              </div>

              {/* Modal Footer Actions - Powered by Centralized AppButton */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <CancelButton onClick={() => setEditing(null)} disabled={saving} />
                <SaveButton loading={saving}>Save changes</SaveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
