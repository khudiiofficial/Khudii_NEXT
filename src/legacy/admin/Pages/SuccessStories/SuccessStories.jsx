'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { HandHeart, Plus, RefreshCw, Trash2, Copy } from 'lucide-react';
import SuccessStoryForm from './SuccessStoryForm';
import SuccessStoryList from './SuccessStoryList';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';

const APIPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedSeoStory, setSelectedSeoStory] = useState(null);
  const dragId = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Fetch all success stories
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${APIPath}/api/success-stories`, {
        withCredentials: true,
      });
      setStories(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          `Failed to load success stories (HTTP ${err.response?.status || 'network error'})`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const saveOrder = async (next) => {
    const previous = stories;
    setStories(next);
    setOrdering(true);
    try {
      await axios.put(
        `${APIPath}/admin/reorder/successstories`,
        { ids: next.map((s) => Number(s.id)) },
        { headers: { 'x-khudii-surface': 'admin' }, withCredentials: true }
      );
      showToast('Stories order updated');
    } catch (e) {
      setStories(previous);
      showToast(e.response?.data?.message || 'Failed to save story order', 'error');
    } finally {
      setOrdering(false);
    }
  };

  const move = (from, to) => {
    if (ordering || from < 0 || to < 0 || from >= stories.length || to >= stories.length || from === to) return;
    const next = [...stories];
    next.splice(to, 0, next.splice(from, 1)[0]);
    saveOrder(next);
  };

  const toggleStory = async (item, checked) => {
    try {
      await axios.put(
        `${APIPath}/api/success-stories/${item.id}`,
        { ...item, is_published: checked },
        { headers: { 'x-khudii-surface': 'admin' }, withCredentials: true }
      );
      setStories((v) =>
        v.map((r) => (r.id === item.id ? { ...r, is_published: checked ? 1 : 0 } : r))
      );
      showToast(`Story set to ${checked ? 'Published' : 'Draft'}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not update publishing state', 'error');
    }
  };

  const handleDuplicate = (story) => {
    setConfirmConfig({
      icon: <Copy className="w-8 h-8 text-[#02236E]" />,
      title: 'Duplicate Story',
      message: `Create a draft copy of "${story.title}"?`,
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        try {
          const slug = `${String(story.slug || 'story').replace(/[^a-z0-9-]/gi, '').slice(0, 155)}-copy-${Date.now().toString(36)}`;
          await axios.post(
            `${APIPath}/api/success-stories`,
            { ...story, title: `${story.title} (Copy)`, slug, is_published: false },
            { headers: { 'x-khudii-surface': 'admin' }, withCredentials: true }
          );
          showToast('Success story duplicated as draft');
          await fetchStories();
        } catch (error) {
          showToast(error.response?.data?.message || 'Failed to duplicate story', 'error');
        }
      },
    });
  };

  const handleCreate = () => {
    setEditingStory(null);
    setShowForm(true);
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = (idOrStory) => {
    const storyId = typeof idOrStory === 'object' ? idOrStory.id : idOrStory;
    const storyObj = stories.find((s) => s.id === storyId) || idOrStory;
    const title = storyObj?.title || 'this story';

    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Delete Success Story',
      message: `Are you sure you want to permanently delete "${title}"? This cannot be undone.`,
      confirmText: 'Delete permanently',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${APIPath}/api/success-stories/${storyId}`, {
            withCredentials: true,
          });
          setStories((prev) => prev.filter((story) => story.id !== storyId));
          showToast('Success story deleted successfully');
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete success story', 'error');
        }
      },
    });
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingStory(null);
    showToast('Success story saved');
    fetchStories();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStory(null);
    window.dispatchEvent(
      new CustomEvent('khudii:dirty', { detail: { source: 'success-stories', dirty: false } })
    );
  };

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    stories.forEach((s) => {
      if (s.is_published) published++;
      else draft++;
    });
    return { total: stories.length, published, draft };
  }, [stories]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02236E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-[#02236E]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#02236E] m-0">
              Success Stories Management
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-0">
            Inspiring real stories of hope, community support, and positive change.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchStories}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/20 hover:bg-blue-900 transition active:scale-95"
          >
            <Plus size={16} /> Add New Story
          </button>
        </div>
      </div>

      {/* Quick Stats Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Stories</div>
          <div className="text-2xl font-bold text-[#02236E] mt-1">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Published / Live</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.published}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Drafts / In Review</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{stats.draft}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Content */}
      {showForm ? (
        <SuccessStoryForm
          story={editingStory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <SuccessStoryList
          stories={stories}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onMove={move}
          onToggle={toggleStory}
          onSeo={(story) =>
            setSelectedSeoStory({
              id: story.id,
              slug: story.slug || `story-${story.id}`,
              title: story.title,
              entityType: 'stories',
            })
          }
          onDropRow={(id, target) => {
            const from = stories.findIndex((v) => v.id === id);
            move(from, target);
          }}
          dragId={dragId}
          ordering={ordering}
        />
      )}

      {selectedSeoStory && (
        <SeoCenterModal
          isOpen={Boolean(selectedSeoStory)}
          onClose={() => setSelectedSeoStory(null)}
          pageData={selectedSeoStory}
          onSaveSuccess={() => {
            showToast('SEO Center data updated!');
            fetchStories();
          }}
        />
      )}
    </div>
  );
};

export default SuccessStories;
