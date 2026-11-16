'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Link as LinkIcon,
  Image as ImageIcon,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check
} from 'lucide-react';
import ImageUploadWidget from './ImageUploadWidget';
import { alertNotice, confirmDialog } from '@/lib/dialogs';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function HomeSlidersManagement() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Banner Style ("slider" | "fixed")
  const [bannerStyle, setBannerStyle] = useState('slider');
  const [fixedBanner, setFixedBanner] = useState({
    imageUrl: '',
    title: '',
    linkUrl: '',
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
  });

  const dragId = useRef(null);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/sliders`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setSliders(json.data || []);
      }
    } catch (e) {
      alertNotice({ title: 'Error', text: 'Failed to load sliders', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/admin/settings`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const app = json.appearance || {};
        if (app.hero_banner_style) setBannerStyle(app.hero_banner_style);
        setFixedBanner({
          imageUrl: app.hero_fixed_image || '',
          title: app.hero_fixed_title || '',
          linkUrl: app.hero_fixed_link || '',
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchSliders();
    fetchSettings();
  }, []);

  const handleUpdateBannerStyle = async (style) => {
    setBannerStyle(style);
    try {
      await fetch(`${API}/admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({
          appearance: { hero_banner_style: style },
        }),
      });
      alertNotice({ title: 'Updated', text: `Banner style set to ${style === 'fixed' ? 'Fixed Image' : 'Slider'}`, status: 'success' });
    } catch {
      alertNotice({ title: 'Error', text: 'Failed to update banner style', status: 'error' });
    }
  };

  const handleSaveFixedBanner = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({
          appearance: {
            hero_fixed_image: fixedBanner.imageUrl,
            hero_fixed_title: fixedBanner.title,
            hero_fixed_link: fixedBanner.linkUrl,
          },
        }),
      });
      alertNotice({ title: 'Saved', text: 'Fixed banner settings saved successfully', status: 'success' });
    } catch {
      alertNotice({ title: 'Error', text: 'Failed to save fixed banner', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSlider(null);
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl || '',
      linkUrl: slider.linkUrl || '',
      isActive: Boolean(slider.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSaveSlider = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      alertNotice({ title: 'Validation error', text: 'Title and image URL are required', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingSlider) {
        // Update
        const res = await fetch(`${API}/admin/sliders/${editingSlider.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Update failed');
        alertNotice({ title: 'Success', text: 'Slider updated successfully', status: 'success' });
      } else {
        // Create
        const res = await fetch(`${API}/admin/sliders`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Create failed');
        alertNotice({ title: 'Success', text: 'Slider banner added successfully', status: 'success' });
      }
      setIsModalOpen(false);
      fetchSliders();
    } catch (err) {
      alertNotice({ title: 'Error', text: err.message || 'Operation failed', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (slider) => {
    const nextStatus = !slider.isActive;
    try {
      await fetch(`${API}/admin/sliders/${slider.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      setSliders((prev) =>
        prev.map((s) => (s.id === slider.id ? { ...s, isActive: nextStatus } : s))
      );
      alertNotice({ title: 'Updated', text: nextStatus ? 'Slider is now visible' : 'Slider hidden', status: 'success' });
    } catch {
      alertNotice({ title: 'Error', text: 'Failed to toggle visibility', status: 'error' });
    }
  };

  const handleDeleteSlider = async (slider) => {
    const confirmed = await confirmDialog({
      title: 'Delete Slider?',
      text: `Are you sure you want to remove the slider "${slider.title}"?`,
      status: 'warning',
    });
    if (!confirmed) return;

    try {
      await fetch(`${API}/admin/sliders/${slider.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
      });
      setSliders((prev) => prev.filter((s) => s.id !== slider.id));
      alertNotice({ title: 'Deleted', text: 'Slider deleted successfully', status: 'success' });
    } catch {
      alertNotice({ title: 'Error', text: 'Failed to delete slider', status: 'error' });
    }
  };

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sliders.length || fromIdx === toIdx) return;
    const reordered = [...sliders];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setSliders(reordered);

    try {
      await fetch(`${API}/admin/sliders/order`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
      });
    } catch {
      fetchSliders();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-[#02236E] flex items-center gap-2 m-0">
            <SlidersHorizontal size={20} className="text-[#02236E]" />
            Homepage Banners &amp; Sliders
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Manage rotating hero slider images and banner style strictly for the Homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSliders}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#02236E] transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-full bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 shadow-sm transition cursor-pointer"
          >
            <Plus size={15} /> + Add New Slider
          </button>
        </div>
      </div>

      {/* Banner Style Switcher Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#02236E] m-0">Hero Banner Presentation Mode</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-0">
            Choose whether to show an interactive rotating carousel or a single fixed high-impact banner.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => handleUpdateBannerStyle('slider')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              bannerStyle === 'slider'
                ? 'bg-[#02236E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎠 Animated Slider Carousel
          </button>
          <button
            type="button"
            onClick={() => handleUpdateBannerStyle('fixed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              bannerStyle === 'fixed'
                ? 'bg-[#02236E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🖼 Single Fixed Banner
          </button>
        </div>
      </div>

      {/* Fixed Banner Settings (Shown if Fixed mode selected) */}
      {bannerStyle === 'fixed' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#02236E] m-0">Single Fixed Banner Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploadWidget
                value={fixedBanner.imageUrl}
                onChange={(url) => setFixedBanner((prev) => ({ ...prev, imageUrl: url }))}
                label="Fixed Banner Image"
                subfolder="banners"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banner Title / Alt</label>
                <input
                  type="text"
                  value={fixedBanner.title}
                  onChange={(e) => setFixedBanner((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Flood Relief Mission 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#02236E]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Click Link URL</label>
                <input
                  type="text"
                  value={fixedBanner.linkUrl}
                  onChange={(e) => setFixedBanner((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="/donate-now"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#02236E]"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveFixedBanner}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition shadow-xs cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Fixed Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sliders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 w-14 text-center">Order</th>
              <th className="p-4 w-44">Preview Image</th>
              <th className="p-4">Title &amp; Destination</th>
              <th className="p-4 w-32">Status</th>
              <th className="p-4 w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                  Loading sliders...
                </td>
              </tr>
            ) : sliders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No homepage sliders found. Click &quot;+ Add New Slider&quot; to create one.
                </td>
              </tr>
            ) : (
              sliders.map((slider, index) => (
                <tr
                  key={slider.id}
                  draggable
                  onDragStart={() => {
                    dragId.current = index;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId.current !== null) {
                      handleMove(dragId.current, index);
                      dragId.current = null;
                    }
                  }}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  {/* Order & Reorder Controls */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, index - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <span className="text-xs font-bold text-slate-500 w-4">
                        {slider.order || index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={index === sliders.length - 1}
                        onClick={() => handleMove(index, index + 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail Image */}
                  <td className="p-4">
                    <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      {slider.imageUrl ? (
                        <img
                          src={slider.imageUrl}
                          alt={slider.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={22} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Link */}
                  <td className="p-4">
                    <div className="font-bold text-[#02236E] text-sm">{slider.title}</div>
                    {slider.linkUrl ? (
                      <div className="flex items-center gap-1 text-xs text-sky-600 mt-1 font-mono">
                        <LinkIcon size={12} />
                        <a href={slider.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {slider.linkUrl}
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No link assigned</span>
                    )}
                  </td>

                  {/* Status & Show/Hide Button */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(slider)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          slider.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title={slider.isActive ? 'Hide Slider' : 'Show Slider'}
                      >
                        {slider.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          slider.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {slider.isActive ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(slider)}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#02236E] hover:bg-slate-50 transition"
                        title="Edit slider"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlider(slider)}
                        className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Delete slider"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Slider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#02236E] m-0">
                {editingSlider ? 'Edit Homepage Slider' : 'Add New Homepage Slider'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveSlider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slider Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Transforming Communities Across Pakistan"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div>
                <ImageUploadWidget
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((p) => ({ ...p, imageUrl: url }))}
                  label="Slider Banner Image *"
                  subfolder="banners"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, linkUrl: e.target.value }))}
                  placeholder="e.g. /donate-now or /organization/edhi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="sliderActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#02236E]"
                />
                <label htmlFor="sliderActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Visible immediately on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSlider ? 'Update Slider' : 'Add Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
