'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import HomeSlidersManagement from '@/components/admin/HomeSlidersManagement';
import { SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

const LegacyCarousel = dynamic(
  () => import('@/legacy/admin/Pages/Crousel-images/CrouselImgaes'),
  { ssr: false }
);

export default function Page() {
  const [activeTab, setActiveTab] = useState('modern');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('modern')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'modern'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal size={14} />
          Homepage Banners &amp; Sliders
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legacy')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'legacy'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ImageIcon size={14} />
          Legacy Carousel
        </button>
      </div>

      {activeTab === 'modern' ? <HomeSlidersManagement /> : <LegacyCarousel />}
    </div>
  );
}
