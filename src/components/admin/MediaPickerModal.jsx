'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Search, UploadCloud, ImageIcon, Check, Loader2, Copy,
  HardDrive, Link as LinkIcon, RefreshCw, Trash2
} from 'lucide-react';
import { alertNotice } from '@/lib/dialogs';

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  subfolder = 'uploads',
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api-app/admin/media', {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items.filter((x) => !x.trashed));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedItem(null);
      setDirectUrl('');
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const filteredItems = items.filter((x) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return `${x.name || ''} ${x.title || ''} ${x.url || ''}`.toLowerCase().includes(q);
  });

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/svg+xml': 'svg',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
    }[file.type] || (file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'png');

    const mime = file.type || (
      ext === 'ico' ? 'image/x-icon' :
      ext === 'svg' ? 'image/svg+xml' :
      ext === 'webp' ? 'image/webp' :
      ext === 'gif' ? 'image/gif' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      'image/png'
    );

    const uid = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `khudii-${subfolder}-${uid}.${ext}`;
    const chunkSize = 2 * 1024 * 1024;
    const total = Math.ceil(file.size / chunkSize);

    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      let finalUrl = '';
      for (let index = 0; index < total; index++) {
        const offset = index * chunkSize;
        const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));
        const res = await fetch('/media-app/chunk', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/octet-stream',
            'x-khudii-upload-name': filename,
            'x-khudii-upload-mime': mime,
            'x-khudii-surface': 'admin',
            'x-khudii-upload-index': String(index),
            'x-khudii-upload-total': String(total),
            'x-khudii-upload-offset': String(offset),
            'x-khudii-upload-size': String(file.size),
          },
          body: chunk,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
        if (json.completed) finalUrl = json.url;
      }

      if (!finalUrl) throw new Error('No URL returned from upload');

      // Record in admin media catalog
      await fetch('/api-app/admin/media', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ url: finalUrl, title: file.name, alt_text: '', caption: '', tags: 'branding', trashed: false }),
      }).catch(() => {});

      alertNotice({ title: 'Media uploaded successfully', status: 'success' });
      onSelect(finalUrl, { url: finalUrl, name: file.name, size: file.size });
      onClose();
    } catch (err) {
      alertNotice({ title: 'Upload failed', text: err.message, status: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect(selectedItem.url, selectedItem);
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#02236E]/10 text-[#02236E] flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#02236E] m-0">{title}</h3>
              <p className="text-[11px] text-slate-500 m-0">Select an existing asset, upload a new file, or enter an external URL.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'library'
                ? 'border-[#02236E] text-[#02236E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Media Library ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#02236E] text-[#02236E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload New File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#02236E] text-[#02236E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct / Custom URL
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[350px]">
          {activeTab === 'library' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search media files by name..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#02236E]"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadMedia}
                  disabled={loading}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Reload Media Library"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#02236E]" />
                  <span className="text-xs">Loading media assets...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700 m-0">No media assets found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {search ? 'No items match your search term.' : 'Upload an image using the "Upload New File" tab.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-[#02236E]/90 transition cursor-pointer"
                  >
                    Go to Upload Tab
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {filteredItems.map((item, idx) => {
                    const isSelected = selectedItem?.url === item.url;
                    const ext = (item.url?.split('.').pop() || 'IMG').toUpperCase();
                    return (
                      <div
                        key={item.url || idx}
                        onClick={() => setSelectedItem(item)}
                        onDoubleClick={() => {
                          onSelect(item.url, item);
                          onClose();
                        }}
                        className={`group relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#02236E] ring-2 ring-[#02236E]/20 bg-blue-50/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-2 overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.title || item.name || 'Media'}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/90 text-slate-700 border border-slate-200 shadow-2xs">
                            {ext}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#02236E] text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="p-2 bg-white border-t border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-800 truncate m-0" title={item.title || item.name}>
                            {item.title || item.name || 'Unnamed Asset'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate m-0 font-mono mt-0.5">
                            {item.url}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                onChange={handleUploadFile}
                className="hidden"
                id="media-picker-file-input"
              />
              <label
                htmlFor="media-picker-file-input"
                className="w-full max-w-lg border-2 border-dashed border-[#02236E]/40 hover:border-[#02236E] rounded-2xl bg-blue-50/20 hover:bg-blue-50/40 p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#02236E]/10 text-[#02236E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-extrabold text-[#02236E] m-0">Click to Browse or Drag Image Here</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supported formats: PNG, JPG, WEBP, SVG, ICO. Fast chunked storage directly onto your Khudii server.
                </p>
                <span className="mt-4 px-4 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold shadow-sm">
                  Browse Device
                </span>
              </label>

              {uploading && (
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#02236E]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col gap-4 max-w-xl mx-auto py-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct Image URL or Relative Path</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="e.g. /img/logo.png or https://example.com/logo.png"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:border-[#02236E]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can specify external CDNs, existing site files under /public, or custom asset paths.
                </p>
              </div>

              {directUrl && (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img src={directUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-700 truncate">Image Preview</span>
                    <span className="block text-[11px] font-mono text-slate-500 truncate">{directUrl}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!directUrl.trim()}
                onClick={() => {
                  if (directUrl.trim()) {
                    onSelect(directUrl.trim());
                    onClose();
                  }
                }}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-[#02236E]/90 disabled:opacity-50 transition cursor-pointer"
              >
                Use This Image URL
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-500 truncate max-w-sm">
            {selectedItem ? (
              <span className="font-semibold text-slate-700">Selected: {selectedItem.title || selectedItem.name}</span>
            ) : (
              <span>No image selected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirmSelection}
              className="px-5 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-[#02236E]/90 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Select Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
