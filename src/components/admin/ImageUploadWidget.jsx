'use client';

import React, { useState } from 'react';
import {
  ImageIcon, Copy, Check, Trash2, Edit3, HardDrive
} from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

export default function ImageUploadWidget({
  value,
  onChange,
  subfolder = 'branding',
  compact = false,
  aspectRatio,
  hideManualUrl = false,
  hideDeleteButton = false,
  label = 'Asset',
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleCopyUrl = async (e) => {
    if (e) e.stopPropagation();
    if (!value) return;

    try {
      const fullUrl = value.startsWith('http')
        ? value
        : `${window.location.origin}${value}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard?.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExtension = (urlStr) => {
    if (!urlStr) return 'IMG';
    const clean = urlStr.split('?')[0];
    const ext = clean.split('.').pop();
    if (!ext || ext.length > 5 || ext.includes('/')) return 'IMG';
    return ext.toUpperCase();
  };

  const getExtensionBadgeColor = (ext) => {
    switch (ext) {
      case 'JPG':
      case 'JPEG':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PNG':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'WEBP':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'SVG':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'ICO':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const ext = getExtension(value);

  // Square / Favicon Compact mode
  if (aspectRatio === 'square' || compact) {
    return (
      <div className="flex flex-col gap-2 w-full min-w-0">
        {value ? (
          <div className="flex flex-col gap-2.5">
            <div className="relative group w-36 h-36 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-xs">
              <img
                src={value}
                alt={label || 'Asset Preview'}
                className="w-full h-full object-contain p-1"
              />
              <span
                className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold border shadow-xs ${getExtensionBadgeColor(
                  ext
                )}`}
              >
                {ext}
              </span>
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Copy URL"
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  title="Change Image"
                  className="p-1.5 rounded-lg bg-[#02236E] text-white hover:bg-[#02236E]/90 transition cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                {!hideDeleteButton && (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    title="Remove Image"
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 w-36">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-[#02236E]" />
                <span>Change</span>
              </button>
              {!hideDeleteButton && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2.5 py-1.5 text-xs font-bold bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsPickerOpen(true)}
            className="w-36 h-36 border-2 border-dashed border-[#02236E]/40 hover:border-[#02236E] rounded-2xl bg-blue-50/20 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer p-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-[#02236E] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#02236E]">Select {label}</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Upload or Choose</span>
          </div>
        )}

        {!hideManualUrl && (
          <div className="flex flex-col gap-1.5 mt-0.5">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-[11px] font-semibold text-[#02236E] hover:underline flex items-center gap-1 cursor-pointer self-start"
            >
              <Edit3 className="w-3 h-3" />
              <span>{showManualInput ? 'Hide manual URL' : 'Or enter custom / external URL'}</span>
            </button>
            {showManualInput && (
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste media URL or path..."
                className="w-full max-w-sm px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 outline-none focus:border-[#02236E] bg-white"
              />
            )}
          </div>
        )}

        <MediaPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(url) => onChange(url)}
          subfolder={subfolder}
          title={`Select ${label}`}
        />
      </div>
    );
  }

  // Standard Horizontal View (Matches KingTravel & User Image 1)
  return (
    <div className="flex flex-col gap-2.5 w-full min-w-0">
      {value ? (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3.5 w-full min-w-0 overflow-hidden">
          {/* Thumbnail Preview Box */}
          <div className="relative w-28 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs group">
            <img
              src={value}
              alt={label || 'Uploaded Asset'}
              className="w-full h-full object-contain p-1.5"
            />
            {/* Quick Extension Badge */}
            <span
              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold border shadow-xs ${getExtensionBadgeColor(
                ext
              )}`}
            >
              {ext}
            </span>
          </div>

          {/* Media Info & Copy Bar */}
          <div className="flex-1 min-w-0 w-full space-y-1.5">
            {/* URL with Copy Button */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span
                className="font-mono text-[11px] text-slate-700 truncate flex-1 select-all"
                title={value}
              >
                {value}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Copy link to clipboard"
                className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-semibold ${
                  copied
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Badges Bar: Extension & Tag */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getExtensionBadgeColor(
                  ext
                )}`}
              >
                {ext}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold text-[10px]">
                {label || 'Asset'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#02236E] text-slate-700 hover:text-[#02236E] text-xs font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#02236E]" />
              <span>Change</span>
            </button>
            {!hideDeleteButton && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition border border-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsPickerOpen(true)}
          className="w-full h-24 border-2 border-dashed border-[#02236E]/40 hover:border-[#02236E] rounded-2xl bg-blue-50/20 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer p-4 group shadow-2xs"
        >
          <div className="flex items-center gap-2 text-[#02236E]">
            <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Choose or Upload {label}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Select from Media Library or Upload New File
          </span>
        </div>
      )}

      {/* Manual URL Input / Toggle Fallback */}
      {!hideManualUrl && (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] font-semibold text-[#02236E] hover:underline flex items-center gap-1 cursor-pointer self-start"
          >
            <Edit3 className="w-3 h-3" />
            <span>{showManualInput ? 'Hide manual URL' : 'Or enter custom / external URL'}</span>
          </button>
          {showManualInput && (
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste media URL (e.g. /img/logo.png or https://...)"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 outline-none focus:border-[#02236E] bg-white"
            />
          )}
        </div>
      )}

      {/* Central Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        subfolder={subfolder}
        title={`Select ${label}`}
      />
    </div>
  );
}
