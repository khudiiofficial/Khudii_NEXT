'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  CircleHelp,
  Search,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ExternalLink,
  Copy,
  Pencil,
  Trash2
} from 'lucide-react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import AdminIconAction from '@/components/AdminIconAction';
import { confirmDialog, confirmDelete, showSuccess, showError, toastNotice } from '@/lib/dialogs';
import { EditButton, DuplicateButton, DeleteButton } from '@/components/ui/CrudActions';
import { AddButton, CancelButton, UpdateButton, CreateButton } from '@/components/ui/AppButton';
import SeoCenterModal from '@/components/admin/SeoCenterModal';

const APIPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [seoModalOpen, setSeoModalOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    display_order: 0,
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const [reordering, setReordering] = useState(false);
  const dragId = useRef(null);

  const showToast = (message, type = 'success') => {
    toastNotice(message, type === 'error' ? 'error' : 'success');
  };

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${APIPath}/api/faqs`, {
        withCredentials: true,
        headers: { 'x-khudii-surface': 'admin' },
      });
      if (response.data.success) {
        setFaqs(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (err) {
      showToast('Failed to load FAQs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      display_order: faqs.length + 1,
      is_active: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General',
      display_order: faq.display_order ?? 0,
      is_active: Boolean(faq.is_active),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleToggleStatus = async (faq, nextStatus) => {
    const oldFaqs = [...faqs];
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, is_active: nextStatus ? 1 : 0 } : f))
    );

    try {
      await axios.put(
        `${APIPath}/api/faqs/${faq.id}/toggle`,
        { is_active: nextStatus },
        { withCredentials: true, headers: { 'x-khudii-surface': 'admin' } }
      );
      showToast(`FAQ set to ${nextStatus ? 'Published' : 'Draft'}`);
    } catch {
      // Fallback to updateFAQ
      try {
        await axios.put(
          `${APIPath}/api/faqs/${faq.id}`,
          { ...faq, is_active: nextStatus ? 1 : 0 },
          { withCredentials: true, headers: { 'x-khudii-surface': 'admin' } }
        );
        showToast(`FAQ set to ${nextStatus ? 'Published' : 'Draft'}`);
      } catch (err) {
        setFaqs(oldFaqs);
        showToast('Failed to update FAQ status.', 'error');
      }
    }
  };

  const handleDuplicate = async (faq) => {
    const ok = await confirmDialog({
      title: 'Duplicate FAQ?',
      text: `Create an unpublished copy of "${faq.question}"?`,
      status: 'warning',
      confirmText: 'Duplicate',
    });
    if (!ok) return;
    try {
      const payload = {
        question: `${faq.question} (Copy)`,
        answer: faq.answer,
        category: faq.category || 'General',
        display_order: faqs.length + 1,
        is_active: false,
      };
      const res = await axios.post(`${APIPath}/api/faqs`, payload, {
        withCredentials: true,
        headers: { 'x-khudii-surface': 'admin' },
      });
      if (res.data.success) {
        showSuccess('FAQ duplicated as draft');
        await fetchFAQs();
      }
    } catch {
      showError('Failed to duplicate FAQ');
    }
  };

  const handleDelete = async (faq) => {
    if (!await confirmDelete(`FAQ "${faq.question}"`)) return;
    try {
      await axios.delete(`${APIPath}/api/faqs/${faq.id}`, {
        withCredentials: true,
        headers: { 'x-khudii-surface': 'admin' },
      });
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      showSuccess('FAQ deleted successfully');
    } catch {
      showError('Failed to delete FAQ');
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.question.trim()) errors.question = 'Question is required';
    if (!formData.answer.trim()) errors.answer = 'Answer is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category?.trim() || 'General',
        display_order: Number(formData.display_order || 0),
        is_active: Boolean(formData.is_active),
      };

      if (editingId) {
        await axios.put(`${APIPath}/api/faqs/${editingId}`, payload, {
          withCredentials: true,
          headers: { 'x-khudii-surface': 'admin' },
        });
        showToast('FAQ updated successfully');
      } else {
        await axios.post(`${APIPath}/api/faqs`, payload, {
          withCredentials: true,
          headers: { 'x-khudii-surface': 'admin' },
        });
        showToast('FAQ created successfully');
      }

      setModalOpen(false);
      await fetchFAQs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save FAQ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= faqs.length || reordering) return;
    const reordered = [...faqs];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Update display_order
    const updatedWithOrder = reordered.map((f, i) => ({
      ...f,
      display_order: i + 1,
    }));
    setFaqs(updatedWithOrder);
    setReordering(true);

    try {
      await axios.put(
        `${APIPath}/api/faqs/display-order/update`,
        {
          faq_orders: updatedWithOrder.map((f) => ({
            id: f.id,
            display_order: f.display_order,
          })),
        },
        { withCredentials: true, headers: { 'x-khudii-surface': 'admin' } }
      );
      showToast('FAQ order saved');
    } catch {
      showToast('Failed to save display order.', 'error');
      await fetchFAQs();
    } finally {
      setReordering(false);
    }
  };

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    faqs.forEach((f) => {
      if (f.is_active) published++;
      else draft++;
    });
    return { total: faqs.length, published, draft };
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchSearch =
        !q ||
        (f.question || '').toLowerCase().includes(q) ||
        (f.answer || '').toLowerCase().includes(q) ||
        (f.category || '').toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' ? Boolean(f.is_active) : !f.is_active);
      return matchSearch && matchStatus;
    });
  }, [faqs, search, statusFilter]);

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Top Header Controls (khudii Standard) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircleHelp className="w-6 h-6 text-[#02236E]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#02236E] m-0">FAQ Management</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-0">
            Create, edit, organize and publish frequently asked questions for public pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSeoModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs transition"
          >
            <Sliders size={14} />
            SEO Center
          </button>
          <ReloadButton onClick={fetchFAQs} loading={loading} size="sm">
            Refresh
          </ReloadButton>
          <AddButton onClick={openCreateModal} size="sm">
            Add New FAQ
          </AddButton>
        </div>
      </div>

      {/* Quick Stats Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total FAQs</div>
          <div className="text-2xl font-bold text-[#02236E] mt-1">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Published / Active</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.published}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Drafts / Inactive</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{stats.draft}</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search FAQs by question, answer or category..."
            value={search ?? ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter ?? 'all'}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#02236E]"
          >
            <option value="all">All FAQs</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* FAQs List Table (khudii Architecture) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 w-14 text-center">Order</th>
              <th className="p-4">Question &amp; Answer</th>
              <th className="p-4 w-32">Category</th>
              <th className="p-4 w-40">Status</th>
              <th className="p-4 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                  Loading FAQs...
                </td>
              </tr>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <tr key={faq.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Order & Move Buttons */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0 || reordering}
                        onClick={() => handleMove(index, index - 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <span className="text-xs font-bold text-slate-500 w-4">
                        {faq.display_order ?? index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={index === filteredFaqs.length - 1 || reordering}
                        onClick={() => handleMove(index, index + 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Question & Answer Preview */}
                  <td className="p-4">
                    <div className="font-bold text-[#02236E] text-sm">{faq.question}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {String(faq.answer || '').replace(/<[^>]*>/g, '')}
                    </div>
                  </td>

                  {/* Category Badge */}
                  <td className="p-4">
                    <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {faq.category || 'General'}
                    </span>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <AdminIconAction
                        action={faq.is_active ? 'hide' : 'show'}
                        label={`${faq.is_active ? 'Hide' : 'Show'} ${faq.question}`}
                        onClick={() => handleToggleStatus(faq, !faq.is_active)}
                      />
                      <AdminPublishSwitch
                        checked={Boolean(faq.is_active)}
                        onChange={(checked) => handleToggleStatus(faq, checked)}
                        label={faq.is_active ? 'Published' : 'Draft'}
                      />
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${faq.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {faq.is_active ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview on live site */}
                      <a
                        href="/faqs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                        title="View live FAQs"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* SEO Center */}
                      <button
                        type="button"
                        onClick={() => setSeoModalOpen(true)}
                        title="Open FAQs SEO Center"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Sliders size={13} />
                        SEO Center
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(faq)}
                        title={`Duplicate ${faq.question}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(faq)}
                        title={`Edit ${faq.question}`}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(faq)}
                        title={`Delete ${faq.question}`}
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
                  No FAQs found. Click &quot;Add New FAQ&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Clean Structured Create / Edit Modal (No raw alerts) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-50 duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-[#02236E] m-0">
                {editingId ? 'Edit FAQ' : 'Create New FAQ'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question <span className="text-[#ed0026]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. How can I contribute a story to Khudii?"
                  value={formData.question ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, question: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
                />
                {formErrors.question && (
                  <p className="text-xs text-[#ed0026] mt-1">{formErrors.question}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Answer <span className="text-[#ed0026]">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a clear, detailed answer..."
                  value={formData.answer ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, answer: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
                />
                {formErrors.answer && (
                  <p className="text-xs text-[#ed0026] mt-1">{formErrors.answer}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="General / Donors / Volunteers"
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order ?? 0}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, display_order: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="faq_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 accent-[#02236E] rounded"
                />
                <label htmlFor="faq_is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Publish FAQ immediately on website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <CancelButton onClick={() => setModalOpen(false)} size="sm" />
                {editingId ? (
                  <UpdateButton type="submit" loading={saving} disabled={saving} size="sm">
                    Update FAQ
                  </UpdateButton>
                ) : (
                  <CreateButton type="submit" loading={saving} disabled={saving} size="sm">
                    Create FAQ
                  </CreateButton>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {seoModalOpen && (
        <SeoCenterModal
          isOpen={seoModalOpen}
          onClose={() => setSeoModalOpen(false)}
          pageData={{
            id: '/faqs',
            slug: 'faqs',
            path: '/faqs',
            title: 'Frequently Asked Questions',
            entityType: 'faqs',
          }}
          onSaveSuccess={() => {
            showToast('FAQs SEO Center data updated!');
          }}
        />
      )}
    </div>
  );
}
