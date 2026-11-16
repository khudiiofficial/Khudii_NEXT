'use client';

import React, { useState } from 'react';
import {
  Save, Plus, Trash2, ArrowUp, ArrowDown, Check, AlertCircle,
  HelpCircle, Sparkles, MessageCircle, Phone, Globe, Shield, Mic
} from 'lucide-react';
import ImageUploadWidget from './ImageUploadWidget';
import { alertNotice } from '@/lib/dialogs';

export default function SiteIdentityTab({
  identityData,
  setIdentityData,
  onSave,
  saving = false,
  dirty = false,
}) {
  const [tawkScriptInput, setTawkScriptInput] = useState('');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPromptForm, setNewPromptForm] = useState({
    question: '',
    category: 'General',
    answer: '',
    showChip: true,
    actionLabel: '',
    actionUrl: '',
  });

  const handleAutoExtractTawk = () => {
    const trimmed = (tawkScriptInput || '').trim();
    if (!trimmed) return;
    const match =
      trimmed.match(/embed\.tawk\.to\/([a-f0-9]+)\/([a-zA-Z0-9]+)/i) ||
      trimmed.match(/tawk\.to\/chat\/([a-f0-9]+)\/([a-zA-Z0-9]+)/i);

    if (match) {
      const propertyId = match[1];
      const widgetId = match[2];
      setIdentityData((prev) => ({
        ...prev,
        tawkPropertyId: propertyId,
        tawkWidgetId: widgetId,
        tawkDirectChatUrl: `https://tawk.to/chat/${propertyId}/${widgetId}`,
        tawkEnabled: true,
      }));
      setTawkScriptInput('');
      alertNotice({
        title: 'Tawk.to Script Parsed',
        text: `Extracted Property ID: ${propertyId} and Widget ID: ${widgetId}`,
        status: 'success',
      });
    } else {
      alertNotice({
        title: 'Invalid Format',
        text: 'Could not detect Property ID and Widget ID from input. Please check the URL/script or enter manually below.',
        status: 'warning',
      });
    }
  };

  const handleAddPrompt = () => {
    if (!newPromptForm.question.trim() || !newPromptForm.answer.trim()) {
      alertNotice({
        title: 'Missing Fields',
        text: 'Please enter both a Question and an Answer.',
        status: 'warning',
      });
      return;
    }
    const newId = `prompt-${Date.now()}`;
    const currentList = Array.isArray(identityData.tawkQuickPrompts) ? identityData.tawkQuickPrompts : [];
    const updatedList = [...currentList, { ...newPromptForm, id: newId }];
    setIdentityData((prev) => ({ ...prev, tawkQuickPrompts: updatedList }));
    setNewPromptForm({
      question: '',
      category: 'General',
      answer: '',
      showChip: true,
      actionLabel: '',
      actionUrl: '',
    });
    setIsAddingPrompt(false);
  };

  const handleUpdatePrompt = (id, updates) => {
    const currentList = Array.isArray(identityData.tawkQuickPrompts) ? identityData.tawkQuickPrompts : [];
    const updatedList = currentList.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setIdentityData((prev) => ({ ...prev, tawkQuickPrompts: updatedList }));
  };

  const handleDeletePrompt = (id) => {
    const currentList = Array.isArray(identityData.tawkQuickPrompts) ? identityData.tawkQuickPrompts : [];
    const updatedList = currentList.filter((p) => p.id !== id);
    setIdentityData((prev) => ({ ...prev, tawkQuickPrompts: updatedList }));
  };

  const handleMovePrompt = (idx, direction) => {
    const currentList = Array.isArray(identityData.tawkQuickPrompts) ? [...identityData.tawkQuickPrompts] : [];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;
    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    setIdentityData((prev) => ({ ...prev, tawkQuickPrompts: currentList }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 m-0">Site Identity</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Manage your website&apos;s core branding, WhatsApp, and Tawk.to Live Chat.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="#tawk-section"
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00A859] border border-emerald-300 text-xs font-bold transition-all no-underline flex items-center gap-1.5 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse"></span>
            Tawk.to Live Chat ↓
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="bg-[#02236E] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#02236E]/90 transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Basic Info (Left) & Branding Assets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: Basic Information */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 m-0">Basic Information</h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Site Name</label>
            <input
              type="text"
              value={identityData.siteName ?? ''}
              onChange={(e) => setIdentityData((prev) => ({ ...prev, siteName: e.target.value }))}
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E]"
              placeholder="e.g. Khudii"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Tagline / Description</label>
            <textarea
              rows={3}
              value={identityData.tagline ?? ''}
              onChange={(e) => setIdentityData((prev) => ({ ...prev, tagline: e.target.value }))}
              className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-[#02236E]"
              placeholder="Describe your site for search engines and headers..."
            />
          </div>

          {/* ── WhatsApp: Header Button ── */}
          <div className="pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-[#25D366] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.126 1.526 5.865L0 24l6.335-1.499A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.653-.49-5.187-1.348l-.372-.22-3.762.89.944-3.658-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Header WhatsApp Button
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Subtext / Label Above Number
                </label>
                <input
                  type="text"
                  value={identityData.whatsappHeaderLabel ?? ''}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, whatsappHeaderLabel: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
                  placeholder="e.g. Need Assistance?"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Display Number / Text
                </label>
                <input
                  type="text"
                  value={identityData.whatsappHeaderText ?? ''}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, whatsappHeaderText: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  WhatsApp URL (wa.me/...)
                </label>
                <input
                  type="text"
                  value={identityData.whatsappHeaderUrl ?? ''}
                  onChange={(e) =>
                    setIdentityData((prev) => ({
                      ...prev,
                      whatsappHeaderUrl: e.target.value,
                      whatsappFloatUrl: prev.whatsappFloatUrl || e.target.value,
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-[#02236E]"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
          </div>

          {/* ── WhatsApp: Floating Bottom Button ── */}
          <div className="pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-[#25D366] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.126 1.526 5.865L0 24l6.335-1.499A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.653-.49-5.187-1.348l-.372-.22-3.762.89.944-3.658-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Floating Bottom-Right WhatsApp Button
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  WhatsApp URL (wa.me/...)
                </label>
                <input
                  type="text"
                  value={identityData.whatsappFloatUrl ?? ''}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, whatsappFloatUrl: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-[#02236E]"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Tooltip / Aria Label
                </label>
                <input
                  type="text"
                  value={identityData.whatsappFloatLabel ?? ''}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, whatsappFloatLabel: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#02236E]"
                  placeholder="e.g. Chat on WhatsApp"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Branding Assets */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 m-0">Branding Assets</h3>

          {/* Site Logo Uploader & Preview */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold text-slate-800">Site Logo</label>
            <ImageUploadWidget
              value={identityData.siteLogo || identityData.logo || ''}
              onChange={(url) => {
                setIdentityData((prev) => ({ ...prev, siteLogo: url, logo: url }));
              }}
              subfolder="branding"
              label="Site Logo"
            />
          </div>

          {/* Site Favicon Uploader & Preview */}
          <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/60">
            <label className="block text-xs font-bold text-slate-800">Site Favicon</label>
            <div className="w-[140px] h-[140px]">
              <ImageUploadWidget
                value={identityData.siteFavicon || identityData.favicon || ''}
                aspectRatio="square"
                onChange={(url) => {
                  setIdentityData((prev) => ({ ...prev, siteFavicon: url, favicon: url }));
                }}
                subfolder="branding"
                label="Site Favicon"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-bold mt-1">Recommended: .ico, .png, .svg</span>
          </div>
        </div>
      </div>

      {/* ================= DEDICATED FULL-WIDTH SECTION: TAWK.TO LIVE CHAT ================= */}
      <div
        id="tawk-section"
        className="p-6 rounded-2xl bg-white border-2 border-emerald-300 shadow-md flex flex-col gap-5 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00A859] flex items-center justify-center shrink-0 shadow-sm text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                Tawk.to Live Chat Configuration
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-[#00A859]">
                  New Feature
                </span>
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Control Tawk.to live chat widget, credentials, and the floating launcher button beside WhatsApp on frontend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Switch */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Feature Status:</span>
              <span
                className={`text-xs font-extrabold ${
                  identityData.tawkEnabled !== false ? 'text-[#00A859]' : 'text-slate-400'
                }`}
              >
                {identityData.tawkEnabled !== false ? 'Active' : 'Disabled'}
              </span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={identityData.tawkEnabled !== false}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, tawkEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A859]"></div>
              </div>
            </label>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-[#00A859] hover:bg-[#008f4c] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Tawk Settings'}</span>
            </button>
          </div>
        </div>

        {/* Quick Auto-Import Script */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-emerald-900 uppercase">
              Quick Auto-Import: Paste Tawk.to Script or Embed URL
            </label>
            <span className="text-[11px] text-emerald-700 font-medium">
              Automatically populates Property ID &amp; Widget ID
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={tawkScriptInput}
              onChange={(e) => setTawkScriptInput(e.target.value)}
              placeholder="e.g. https://embed.tawk.to/65b3e5448d261e1b5f58510b/1hl3bf5qv or paste whole <script> tag"
              className="flex-1 p-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-mono outline-none focus:border-[#00A859]"
            />
            <button
              type="button"
              onClick={handleAutoExtractTawk}
              className="px-4 py-2.5 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold rounded-xl transition-colors border-none cursor-pointer shrink-0"
            >
              Auto-Extract
            </button>
          </div>
        </div>

        {/* Main Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Widget ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identityData.tawkWidgetId ?? ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                setIdentityData((prev) => ({
                  ...prev,
                  tawkWidgetId: val,
                  tawkDirectChatUrl:
                    prev.tawkPropertyId && val
                      ? `https://tawk.to/chat/${prev.tawkPropertyId}/${val}`
                      : prev.tawkDirectChatUrl,
                }));
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-[#00A859]"
              placeholder="e.g. 1hl3bf5qv"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Found after property ID in embed URL</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Property ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identityData.tawkPropertyId ?? ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                setIdentityData((prev) => ({
                  ...prev,
                  tawkPropertyId: val,
                  tawkDirectChatUrl:
                    val && prev.tawkWidgetId
                      ? `https://tawk.to/chat/${val}/${prev.tawkWidgetId}`
                      : prev.tawkDirectChatUrl,
                }));
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-[#00A859]"
              placeholder="e.g. 65b3e5448d261e1b5f58510b"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Found before widget ID in embed URL</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Button Tooltip / Aria Label
            </label>
            <input
              type="text"
              value={identityData.tawkButtonLabel ?? ''}
              onChange={(e) =>
                setIdentityData((prev) => ({ ...prev, tawkButtonLabel: e.target.value }))
              }
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-[#00A859]"
              placeholder="e.g. Live Chat Support"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Hover label displayed on frontend button</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Direct Chat Link (Fallback)
            </label>
            <input
              type="text"
              value={identityData.tawkDirectChatUrl ?? ''}
              onChange={(e) =>
                setIdentityData((prev) => ({ ...prev, tawkDirectChatUrl: e.target.value }))
              }
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-[#00A859]"
              placeholder="https://tawk.to/chat/..."
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Opened if script is blocked by ad-blocker</span>
          </div>
        </div>

        {/* Floating Launcher Icon Image Uploader */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center justify-between">
            <span>Floating Launcher Icon (Frontend)</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">Optional custom launcher icon</span>
          </label>
          <div className="w-full">
            <ImageUploadWidget
              value={identityData.tawkFloatingIcon ?? ''}
              onChange={(url) => setIdentityData((prev) => ({ ...prev, tawkFloatingIcon: url }))}
              subfolder="branding"
              label="Floating Tawk Icon"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Upload or select custom icon for the floating Tawk live chat button rendered at the bottom-right of the frontend.
          </span>
        </div>

        {/* Frontend Controls & Behavioral Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200 cursor-pointer">
            <input
              type="checkbox"
              checked={identityData.tawkShowFloatingButton !== false}
              onChange={(e) =>
                setIdentityData((prev) => ({ ...prev, tawkShowFloatingButton: e.target.checked }))
              }
              className="mt-0.5 rounded text-[#00A859] focus:ring-[#00A859] w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="block text-xs font-extrabold text-slate-900">
                Show / Hide Floating Button on Frontend
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                When enabled, renders the circular Tawk.to launcher button directly beside the WhatsApp button.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={identityData.tawkHideDefaultLauncher !== false}
              onChange={(e) =>
                setIdentityData((prev) => ({ ...prev, tawkHideDefaultLauncher: e.target.checked }))
              }
              className="mt-0.5 rounded text-[#00A859] focus:ring-[#00A859] w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="block text-xs font-extrabold text-slate-900">
                Hide Default Tawk Launcher (Recommended)
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Hides Tawk&apos;s default widget bubble so our custom matching button beside WhatsApp triggers the chat cleanly without clashing.
              </span>
            </div>
          </label>
        </div>

        {/* Live Visual Placement Preview */}
        <div className="p-4 rounded-xl bg-[#00382B] text-white border border-[#004d3b]">
          <div className="flex items-center justify-between text-xs mb-2 font-medium opacity-80 border-b border-emerald-900/60 pb-2">
            <span>Frontend Preview: Floating Buttons Bar (Bottom-Right of Screen)</span>
            <span className="text-[11px] text-emerald-300">Live Visual Simulation</span>
          </div>
          <div className="flex items-center justify-end gap-4 py-2">
            {identityData.tawkShowFloatingButton !== false && (
              <div
                className="flex items-center gap-2 group cursor-pointer"
                title={identityData.tawkButtonLabel || 'Live Chat'}
              >
                <div className="w-12 h-12 rounded-full shadow-lg relative bg-[#00A859] p-2 border-2 border-white/50 flex items-center justify-center hover:scale-110 transition-transform">
                  {identityData.tawkFloatingIcon ? (
                    <img
                      src={identityData.tawkFloatingIcon}
                      alt="Tawk Live Chat"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#00382B] rounded-full animate-pulse"></span>
                </div>
                <span className="text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  {identityData.tawkButtonLabel || 'Live Chat'}
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-2 cursor-pointer"
              title={identityData.whatsappFloatLabel || 'WhatsApp'}
            >
              <div className="w-12 h-12 rounded-full shadow-lg relative bg-[#25D366] p-2 border-2 border-white/50 flex items-center justify-center hover:scale-110 transition-transform text-white">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
                {identityData.whatsappFloatLabel || 'WhatsApp'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Voice / Speak Feature Settings ── */}
        <div className="pt-5 border-t border-slate-200/60 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Voice &amp; Speak Assistant Feature
                </span>
                <span className="text-[11px] text-slate-500">
                  Allow visitors to speak queries via microphone and hear responses read aloud.
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                className={`text-[11px] font-bold ${
                  identityData.tawkVoiceEnabled !== false ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {identityData.tawkVoiceEnabled !== false ? 'Voice Active' : 'Voice Disabled'}
              </span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={identityData.tawkVoiceEnabled !== false}
                  onChange={(e) =>
                    setIdentityData((prev) => ({ ...prev, tawkVoiceEnabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={identityData.tawkAutoSpeak === true}
                onChange={(e) =>
                  setIdentityData((prev) => ({ ...prev, tawkAutoSpeak: e.target.checked }))
                }
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">Auto-Read Answers Aloud</span>
                <span className="block text-[11px] text-slate-500">
                  Automatically vocalizes answers through browser speech synthesis when a query is asked.
                </span>
              </div>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Voice Accent / Language</label>
              <select
                value={identityData.tawkVoiceLanguage || 'en-US'}
                onChange={(e) =>
                  setIdentityData((prev) => ({ ...prev, tawkVoiceLanguage: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-emerald-600"
              >
                <option value="en-US">English (United States) - en-US</option>
                <option value="en-GB">English (United Kingdom) - en-GB</option>
                <option value="en-CA">English (Canada) - en-CA</option>
                <option value="ur-PK">Urdu (Pakistan) - ur-PK</option>
                <option value="ar-SA">Arabic (Saudi Arabia) - ar-SA</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Automated Responses & Q&A Prompts Manager ── */}
        <div className="pt-5 border-t border-slate-200/60 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Automated Q&amp;A Prompts &amp; Response Answers
                </span>
                <span className="text-[11px] text-slate-500">
                  Create instant questions &amp; answers that visitors can speak or tap on the frontend before escalating to live chat.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingPrompt(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Q&amp;A Prompt
            </button>
          </div>

          {/* Add New Prompt Inline Card */}
          {isAddingPrompt && (
            <div className="p-4 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 flex flex-col gap-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 uppercase">
                  Create New Prompt / Automated Response
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingPrompt(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold border-none bg-transparent cursor-pointer"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Question / Prompt Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPromptForm.question}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, question: e.target.value })}
                    placeholder="e.g. How can I volunteer or donate to Khudii?"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Category Badge</label>
                  <select
                    value={newPromptForm.category}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-emerald-600"
                  >
                    <option value="General">General</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Donations">Donations</option>
                    <option value="Organizations">Organizations</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Automated Response / Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newPromptForm.answer}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, answer: e.target.value })}
                  placeholder="Enter verified answer to be displayed and spoken aloud..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Action Button Text (Optional)</label>
                  <input
                    type="text"
                    value={newPromptForm.actionLabel}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, actionLabel: e.target.value })}
                    placeholder="e.g. Donate Now"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Action Button URL (Optional)</label>
                  <input
                    type="text"
                    value={newPromptForm.actionUrl}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, actionUrl: e.target.value })}
                    placeholder="e.g. /donate-now or /volunteer"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newPromptForm.showChip}
                      onChange={(e) => setNewPromptForm({ ...newPromptForm, showChip: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Display as Quick Chip on Frontend</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => setIsAddingPrompt(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg border-none cursor-pointer shadow-sm"
                >
                  Save &amp; Add Prompt
                </button>
              </div>
            </div>
          )}

          {/* List of Configured Prompts */}
          <div className="flex flex-col gap-3">
            {Array.isArray(identityData.tawkQuickPrompts) && identityData.tawkQuickPrompts.length > 0 ? (
              identityData.tawkQuickPrompts.map((prompt, idx) => (
                <div
                  key={prompt.id || idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        {prompt.category || 'General'}
                      </span>
                      {prompt.showChip && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                          ✓ Quick Chip Visible
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePrompt(idx, 'up')}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-30 border border-slate-200 text-slate-700 text-xs cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === identityData.tawkQuickPrompts.length - 1}
                        onClick={() => handleMovePrompt(idx, 'down')}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-200 disabled:opacity-30 border border-slate-200 text-slate-700 text-xs cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs cursor-pointer font-bold ml-1"
                        title="Delete Prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Question</label>
                      <input
                        type="text"
                        value={prompt.question || ''}
                        onChange={(e) => handleUpdatePrompt(prompt.id, { question: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                      <select
                        value={prompt.category || 'General'}
                        onChange={(e) => handleUpdatePrompt(prompt.id, { category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none focus:border-emerald-600"
                      >
                        <option value="General">General</option>
                        <option value="Volunteer">Volunteer</option>
                        <option value="Donations">Donations</option>
                        <option value="Organizations">Organizations</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Answer / Response</label>
                    <textarea
                      rows={2}
                      value={prompt.answer || ''}
                      onChange={(e) => handleUpdatePrompt(prompt.id, { answer: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Action Button Text</label>
                      <input
                        type="text"
                        value={prompt.actionLabel || ''}
                        onChange={(e) => handleUpdatePrompt(prompt.id, { actionLabel: e.target.value })}
                        placeholder="Button text (optional)"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Action Button URL</label>
                      <input
                        type="text"
                        value={prompt.actionUrl || ''}
                        onChange={(e) => handleUpdatePrompt(prompt.id, { actionUrl: e.target.value })}
                        placeholder="/path or https://"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-mono outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={prompt.showChip !== false}
                          onChange={(e) => handleUpdatePrompt(prompt.id, { showChip: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">Quick Chip on Frontend</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No automated Q&amp;A prompts configured. Click &quot;Add New Q&amp;A Prompt&quot; above to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
