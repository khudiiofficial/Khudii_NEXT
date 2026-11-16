'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Sliders, SearchCheck, Sparkles } from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';

export default function AdminSeoShortcut({
  type = 'pages',
  id = null,
  label = 'Open SEO Center',
  pageData = null,
  onSaveSuccess = null,
}) {
  const route = useParams();
  const params = useSearchParams();
  const actual = id || route?.id || params?.get('slug') || '';
  const [isOpen, setIsOpen] = useState(false);

  const entityPayload = {
    id: actual,
    slug: actual,
    entityType: type,
    ...(pageData || {}),
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-blue-50/50 to-indigo-50/60 p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Sliders size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-black text-[#02236E]">SEO Center Intelligence</strong>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Next-Gen Multi-Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 m-0">
              Manage Traditional SEO, Alt Texts, GEO, AEO Voice FAQs, JSON-LD Schema &amp; live Google Preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-950/20 hover:bg-blue-900 transition-all active:scale-95"
          >
            <Sparkles size={15} className="text-amber-300" />
            {label}
          </button>
          <Link
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            href={`/admin-app/dashboard/seo-center?tab=editor&type=${encodeURIComponent(type)}${actual ? `&id=${encodeURIComponent(actual)}` : ''}`}
            title="Open Fullscreen SEO Hub"
          >
            <SearchCheck size={14} className="text-slate-500" />
            Hub
          </Link>
        </div>
      </div>

      {isOpen && (
        <SeoCenterModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          pageData={entityPayload}
          onSaveSuccess={(updated) => {
            if (onSaveSuccess) onSaveSuccess(updated);
          }}
        />
      )}
    </>
  );
}
