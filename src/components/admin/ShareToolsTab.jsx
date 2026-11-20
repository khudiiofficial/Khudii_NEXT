'use client';

import React, { useState } from 'react';
import {
  Share2, Save, Check, ExternalLink, Sliders, Smartphone,
  Layers, Copy, MessageCircle, Send, Mail, Link as LinkIcon
} from 'lucide-react';
import { alertNotice } from '@/lib/dialogs';

export default function ShareToolsTab({
  shareData = {},
  setShareData,
  onSave,
  saving = false,
  dirty = false,
}) {
  const networks = [
    { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'twitter', name: 'X (Twitter)', color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
    { id: 'telegram', name: 'Telegram', color: '#229ED9' },
    { id: 'email', name: 'Email', color: '#EA4335' },
    { id: 'copy', name: 'Copy Link', color: '#475569' },
  ];

  const currentNetworks = Array.isArray(shareData.activeNetworks)
    ? shareData.activeNetworks
    : ['whatsapp', 'facebook', 'twitter', 'linkedin', 'copy'];

  const toggleNetwork = (id) => {
    const next = currentNetworks.includes(id)
      ? currentNetworks.filter((n) => n !== id)
      : [...currentNetworks, id];
    setShareData((prev) => ({ ...prev, activeNetworks: next }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0">Share Tools</h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Configure the global floating share sidebar for your website.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-[#02236E] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#02236E]/90 transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Configuration */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* 1. Display Settings */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
              Display Settings
            </h3>
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Share Sidebar</div>
                <div className="text-[11px] text-slate-500">Turn the floating share tools on or off globally.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareData.enabled !== false}
                  onChange={(e) => setShareData((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02236E]"></div>
              </label>
            </div>
          </div>

          {/* 2. Appearance & Style */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
              Appearance &amp; Style
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Icon Style</label>
              <div className="flex gap-2.5 flex-wrap">
                {['Rounded Square', 'Circle', 'Flat', 'Minimal'].map((style) => {
                  const val = style.toLowerCase().replace(' ', '-');
                  const isSelected = (shareData.iconStyle || 'rounded-square') === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setShareData((prev) => ({ ...prev, iconStyle: val }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#02236E] text-white border-[#02236E] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Icon Size</span>
                <span>{shareData.iconSize || 40}px</span>
              </div>
              <input
                type="range"
                min="28"
                max="56"
                value={shareData.iconSize || 40}
                onChange={(e) => setShareData((prev) => ({ ...prev, iconSize: Number(e.target.value) }))}
                className="w-full accent-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Color Scheme</label>
              <div className="flex gap-2.5 flex-wrap">
                {[
                  { label: 'Brand Colors', val: 'brand-colors' },
                  { label: 'Monochrome', val: 'monochrome' },
                  { label: 'Custom', val: 'custom' },
                ].map((item) => {
                  const isSelected = (shareData.colorScheme || 'brand-colors') === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setShareData((prev) => ({ ...prev, colorScheme: item.val }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#02236E] text-white border-[#02236E] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {shareData.colorScheme === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={shareData.customBgColor || '#02236E'}
                        onChange={(e) => setShareData((prev) => ({ ...prev, customBgColor: e.target.value }))}
                        className="w-8 h-8 rounded border-none cursor-pointer"
                      />
                      <input
                        type="text"
                        value={shareData.customBgColor || '#02236E'}
                        onChange={(e) => setShareData((prev) => ({ ...prev, customBgColor: e.target.value }))}
                        className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Text / Icon Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={shareData.customTextColor || '#ffffff'}
                        onChange={(e) => setShareData((prev) => ({ ...prev, customTextColor: e.target.value }))}
                        className="w-8 h-8 rounded border-none cursor-pointer"
                      />
                      <input
                        type="text"
                        value={shareData.customTextColor || '#ffffff'}
                        onChange={(e) => setShareData((prev) => ({ ...prev, customTextColor: e.target.value }))}
                        className="w-full p-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Gap from Edge (px)</label>
                <input
                  type="number"
                  value={shareData.gapFromEdge ?? 20}
                  onChange={(e) => setShareData((prev) => ({ ...prev, gapFromEdge: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Vertical Position</label>
                <select
                  value={shareData.verticalPosition || 'center'}
                  onChange={(e) => setShareData((prev) => ({ ...prev, verticalPosition: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Sidebar Edge</label>
                <select
                  value={shareData.sidebarEdge || 'right'}
                  onChange={(e) => setShareData((prev) => ({ ...prev, sidebarEdge: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Active Share Networks */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
              Active Share Networks
            </h3>
            <p className="text-xs text-slate-500 m-0">
              Select which social buttons appear in the floating toolbar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {networks.map((net) => {
                const active = currentNetworks.includes(net.id);
                return (
                  <label
                    key={net.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      active
                        ? 'border-[#02236E] bg-blue-50/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleNetwork(net.id)}
                      className="rounded text-[#02236E] focus:ring-[#02236E] w-4 h-4 cursor-pointer"
                    />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: net.color }} />
                    <span className="text-xs font-bold text-slate-800">{net.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview Mockup */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col gap-4 shadow-md sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Desktop Mockup
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          <div className="relative h-96 w-full rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
            {/* Mock website content */}
            <div className="space-y-2 w-3/4 opacity-30 select-none">
              <div className="h-4 bg-slate-700 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded-md w-full"></div>
              <div className="h-3 bg-slate-800 rounded-md w-5/6"></div>
              <div className="h-20 bg-slate-800/50 rounded-xl w-full mt-4"></div>
            </div>

            {/* Floating Share Toolbar Mockup */}
            {shareData.enabled !== false && (
              <div
                className={`absolute flex flex-col gap-1.5 shadow-2xl transition-all ${
                  (shareData.sidebarEdge || 'right') === 'left' ? 'left-3' : 'right-3'
                } ${
                  (shareData.verticalPosition || 'center') === 'top'
                    ? 'top-8'
                    : (shareData.verticalPosition || 'center') === 'bottom'
                    ? 'bottom-8'
                    : 'top-1/2 -translate-y-1/2'
                }`}
              >
                {currentNetworks.map((id) => {
                  const net = networks.find((n) => n.id === id);
                  if (!net) return null;
                  const isCircle = shareData.iconStyle === 'circle';
                  const isMinimal = shareData.iconStyle === 'minimal';
                  const bg =
                    shareData.colorScheme === 'custom'
                      ? shareData.customBgColor || '#02236E'
                      : shareData.colorScheme === 'monochrome'
                      ? '#1e293b'
                      : net.color;
                  const color =
                    shareData.colorScheme === 'custom'
                      ? shareData.customTextColor || '#ffffff'
                      : '#ffffff';

                  return (
                    <div
                      key={id}
                      style={{
                        backgroundColor: isMinimal ? 'transparent' : bg,
                        color: isMinimal ? net.color : color,
                        width: `${Math.min(Math.max(shareData.iconSize || 40, 28), 44)}px`,
                        height: `${Math.min(Math.max(shareData.iconSize || 40, 28), 44)}px`,
                      }}
                      className={`flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer ${
                        isCircle ? 'rounded-full' : 'rounded-lg'
                      } ${isMinimal ? 'border border-slate-700' : ''}`}
                      title={net.name}
                    >
                      <Share2 className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 m-0 text-center">
            Floating sidebar renders dynamically on all public frontend pages.
          </p>
        </div>
      </div>
    </div>
  );
}
