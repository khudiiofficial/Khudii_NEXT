'use client';

import SeoIntelligencePanel from '@/components/admin/SeoIntelligencePanel';

export default function SeoIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-2">
        <h1 className="text-3xl font-bodoni text-slate-900 tracking-tight mb-1 font-bold">SEO Intelligence</h1>
        <p className="text-sm text-slate-500">
          Configure search engine optimization, canonical URLs, XML sitemap inclusion, and crawler directives.
        </p>
      </div>

      <SeoIntelligencePanel />
    </div>
  );
}
