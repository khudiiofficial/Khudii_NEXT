'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import { CMS_PAGES, defaultSections } from '@/lib/cms-registry';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

const SECTION_CATALOG = [
  {
    category: 'Connected Database Modules',
    icon: '⚡',
    items: [
      {
        kind: 'organizations',
        title: 'Organizations Grid',
        description: 'Calls registered welfare organizations directly from the Organizations database with count & item selection.',
        defaultData: {
          eyebrow: 'VERIFIED WELFARE NETWORK',
          heading: 'Explore Registered Organizations',
          body: 'Browse all certified NGOs and social welfare foundations active across Pakistan.',
          showTitle: true,
          showButton: true,
          buttonText: 'Explore More Organizations >',
          buttonUrl: '/organizations',
          source: 'all',
          limit: 'all',
          selectedIds: [],
        },
      },
      {
        kind: 'blogs',
        title: 'Blogs Showcase',
        description: 'Calls published editorial articles directly from the Blogs database with count & item selection.',
        defaultData: {
          eyebrow: 'EDITORIAL & INSIGHTS',
          heading: 'Latest Articles & Updates',
          body: 'Read stories of resilience, social impact, and community development across Pakistan.',
          showTitle: true,
          showButton: true,
          buttonText: 'Explore More Blogs >',
          buttonUrl: '/blogs',
          source: 'all',
          limit: 'all',
          selectedIds: [],
        },
      },
      {
        kind: 'stories',
        title: 'Success Stories Carousel',
        description: 'Calls verified impact and transformation stories directly from the Success Stories database.',
        defaultData: {
          eyebrow: 'LIVES TRANSFORMED',
          heading: 'Success Stories',
          body: 'See how your donations and community support change lives across Pakistan.',
          showTitle: true,
          showButton: true,
          buttonText: 'Explore More Stories >',
          buttonUrl: '/success-stories',
          source: 'all',
          limit: 'all',
          selectedIds: [],
        },
      },
      {
        kind: 'podcast-grid',
        title: 'Podcasts Grid',
        description: 'Calls video podcast episodes directly from the Podcasts database with count & episode selection.',
        defaultData: {
          eyebrow: 'KHUDII PODCAST',
          heading: 'Voices of Change',
          body: 'In-depth conversations with social reformers, philanthropists, and NGO leaders.',
          showTitle: true,
          showButton: true,
          buttonText: 'Explore More Podcasts >',
          buttonUrl: '/podcast',
          source: 'all',
          limit: 'all',
          selectedIds: [],
        },
      },
      {
        kind: 'faq',
        title: 'FAQs Accordion',
        description: 'Calls categorized questions and answers directly from the FAQs database with count & item selection.',
        defaultData: {
          eyebrow: 'HAVE QUESTIONS?',
          heading: 'Frequently Asked Questions',
          body: 'Everything you need to know about donations, volunteer opportunities, and NGO verification.',
          showTitle: true,
          showButton: false,
          buttonText: '',
          buttonUrl: '',
          source: 'all',
          limit: 'all',
          selectedIds: [],
        },
      },
    ],
  },
  {
    category: 'Homepage',
    icon: '🏠',
    items: [
      { kind: 'hero', title: 'Hero Carousel', description: 'Displays active hero banner slides with live query, drag-and-drop ordering and CTA buttons.' },
      { kind: 'cards', title: 'Sector Cards', description: 'Interactive cards grid highlighting key welfare sectors (Health, Education, Relief, etc).' },
      { kind: 'image-text', title: 'Welcome & Introduction', description: 'Split 2-column introductory story with trust badge and mission preview.' },
      { kind: 'article', title: 'Vision & Mission', description: 'Organizational philosophy, core values, and community commitment manifesto.' },
      { kind: 'cards', title: 'Success Stories', description: 'Impact stories carousel showcasing verified beneficiaries and transformation milestones.' },
      { kind: 'logos', title: 'Featured Organizations', description: 'Verified partner NGOs and welfare foundation cards.' },
      { kind: 'cards', title: 'News & Events', description: 'Upcoming welfare drives, community events, and social sector news.' },
      { kind: 'logos', title: 'Partners & Certifications', description: 'Accreditation seals, verified partners, and governance certifications.' },
      { kind: 'cards', title: 'Latest Blogs', description: 'Editorial thought leadership articles with reading time and author tag.' },
      { kind: 'article', title: 'Facebook Feed', description: 'Social community updates and interactive public notices.' },
    ],
  },
  {
    category: 'Organizations & Welfare',
    icon: '🤝',
    items: [
      { kind: 'cards', title: 'Verified NGO Directory', description: 'Directory grid of verified welfare organizations with cause tags and locations.' },
      { kind: 'cta', title: 'Organization Registration CTA', description: 'Action banner inviting registered NGOs to join the verified network.' },
      { kind: 'cards', title: 'Cause Filter Grid', description: 'Visual cause tiles allowing users to explore healthcare, education, orphan care, etc.' },
    ],
  },
  {
    category: 'Blog & Stories',
    icon: '📝',
    items: [
      { kind: 'cards', title: 'Latest Blogs Grid', description: 'Curated blog cards with thumbnails, excerpts, and category badges.' },
      { kind: 'image-text', title: 'Featured Story Spotlight', description: 'In-depth transformation story highlighting beneficiary impact.' },
      { kind: 'article', title: 'Rich Article', description: 'Long-form rich article with headings, paragraphs, and quote blocks.' },
    ],
  },
  {
    category: 'Media & Galleries',
    icon: '🎥',
    items: [
      { kind: 'video-grid', title: 'Video Collection', description: 'Curated video gallery with responsive video player.' },
      { kind: 'gallery', title: 'Photo Gallery', description: 'Responsive photography grid with captions and lightbox view.' },
    ],
  },
  {
    category: 'Trust & Impact',
    icon: '💬',
    items: [
      { kind: 'cta', title: 'Call To Action (Donations)', description: 'High-impact donation or volunteer appeal with direct action buttons.' },
      { kind: 'faq', title: 'FAQ Accordion', description: 'Expandable questions and answers knowledge base for donors and NGOs.' },
      { kind: 'stats', title: 'Impact Statistics', description: 'High-impact metric counters (e.g. 50K+ Helped, 100% Free, Zero Cut).' },
      { kind: 'people', title: 'Team / Leaders', description: 'Leadership and advisory board profiles with photos and bios.' },
      { kind: 'steps', title: 'Process Steps', description: 'Numbered step-by-step guide explaining how donations and verification work.' },
    ],
  },
  {
    category: 'Content & Layout',
    icon: '📄',
    items: [
      { kind: 'image-text', title: 'Image + Text', description: 'Split 2-column layout with photo and storytelling text.' },
      { kind: 'cards', title: 'Cards Grid', description: 'Versatile multi-column card grid with titles, descriptions, and links.' },
      { kind: 'timeline', title: 'Milestone Timeline', description: 'Chronological timeline of achievements and community milestones.' },
      { kind: 'downloads', title: 'Document Downloads', description: 'Downloadable PDF reports, registration forms, and financial audits.' },
      { kind: 'divider', title: 'Visual Divider', description: 'Clean horizontal separator with subtle spacing.' },
    ],
  },
];

const newSectionId = () => `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const newSectionData = () => ({
  heading: '',
  subheading: '',
  body: '',
  image: '',
  imageAlt: '',
  buttonText: '',
  buttonUrl: '',
  items: [],
});

const getAcronym = (title) => {
  if (!title) return 'SE';
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.slice(0, 2).toUpperCase();
};

const getBadgeColor = (acronym) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
  ];
  let hash = 0;
  for (let i = 0; i < acronym.length; i++) hash += acronym.charCodeAt(i);
  return colors[hash % colors.length];
};

const CONNECTED_CONFIG = {
  organizations: {
    title: 'Organizations Database Module',
    icon: '🏢',
    managerUrl: '/admin-app/dashboard/OrganizationPage',
    managerName: 'Organizations Manager',
    dataKey: 'organizations',
    idKey: 'id',
    titleKey: (item) => item.name || 'Untitled Organization',
    subtitleKey: (item) => item.category || 'Welfare Organization',
    imageKey: (item) => item.introductory_image_path || item.logo || '',
  },
  blogs: {
    title: 'Blogs Database Module',
    icon: '📰',
    managerUrl: '/admin-app/dashboard/BlogPage',
    managerName: 'Blogs Manager',
    dataKey: 'blogs',
    idKey: 'id',
    titleKey: (item) => item.Name || item.name || 'Untitled Blog',
    subtitleKey: (item) => item.category || (item.slug ? `/${item.slug}` : ''),
    imageKey: (item) => item.image_path || item.image || item.Image || '',
  },
  stories: {
    title: 'Success Stories Database Module',
    icon: '🌟',
    managerUrl: '/admin-app/dashboard/SuccessStories',
    managerName: 'Success Stories Manager',
    dataKey: 'stories',
    idKey: 'id',
    titleKey: (item) => item.name || item.title || 'Untitled Story',
    subtitleKey: (item) => item.subtitle || (typeof item.description === 'string' ? item.description.replace(/<[^>]*>/g, '').slice(0, 80) : ''),
    imageKey: (item) => item.image || '',
  },
  'podcast-grid': {
    title: 'Podcasts Database Module',
    icon: '🎙️',
    managerUrl: '/admin-app/dashboard/Podcast',
    managerName: 'Podcasts Manager',
    dataKey: 'podcasts',
    idKey: 'id',
    titleKey: (item) => item.title || 'Untitled Podcast',
    subtitleKey: (item) => item.guest_name ? `Guest: ${item.guest_name}` : (item.slug ? `/podcast/${item.slug}` : ''),
    imageKey: (item) => item.youtube_id ? `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` : (item.image || ''),
  },
  faq: {
    title: 'FAQs Database Module',
    icon: '❓',
    managerUrl: '/admin-app/dashboard/faqs',
    managerName: 'FAQs Manager',
    dataKey: 'faqs',
    idKey: 'id',
    titleKey: (item) => item.question || item.title || 'Untitled Question',
    subtitleKey: (item) => item.category || 'General FAQ',
    imageKey: () => '',
  },
};

function ConnectedModuleEditor({ section, connectedData, updateSectionData }) {
  const [filter, setFilter] = useState('');
  const cfg = CONNECTED_CONFIG[section.kind];
  if (!cfg) return null;

  const rawItems = connectedData[cfg.dataKey] || [];
  const sourceMode = section.data?.source || 'all'; // 'all' | 'selected'
  const limit = section.data?.limit ?? 'all';
  const selectedIds = Array.isArray(section.data?.selectedIds) ? section.data.selectedIds : [];

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return rawItems;
    const q = filter.toLowerCase();
    return rawItems.filter((it) => {
      const t = cfg.titleKey(it).toLowerCase();
      const s = cfg.subtitleKey(it).toLowerCase();
      return t.includes(q) || s.includes(q);
    });
  }, [rawItems, filter, cfg]);

  const handleToggleId = (id) => {
    const idStr = String(id);
    const existing = new Set(selectedIds.map(String));
    let next;
    if (existing.has(idStr)) {
      next = selectedIds.filter((x) => String(x) !== idStr);
    } else {
      next = [...selectedIds, id];
    }
    updateSectionData(section.id, 'selectedIds', next);
  };

  const handleSelectAll = () => {
    const all = rawItems.map((it) => it[cfg.idKey]);
    updateSectionData(section.id, 'selectedIds', all);
  };

  const handleClearAll = () => {
    updateSectionData(section.id, 'selectedIds', []);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-2xs space-y-4">
      {/* Top Banner with Direct Module Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{cfg.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-[#02236E] m-0">{cfg.title}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Database ({rawItems.length} items)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 m-0 mt-0.5">
              Items are managed centralized in the admin sidebar and rendered dynamically.
            </p>
          </div>
        </div>

        <a
          href={cfg.managerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-white text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors shadow-2xs no-underline shrink-0"
        >
          <ExternalLink size={12} />
          {cfg.managerName} ↗
        </a>
      </div>

      {/* Grid: Display Count & Selection Source Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Count / Limit */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            DISPLAY COUNT (HOW MANY TO DISPLAY)
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', '3', '4', '6', '8'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateSectionData(section.id, 'limit', opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  String(limit) === opt
                    ? 'bg-[#02236E] text-white border-[#02236E] shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt === 'all' ? 'All (No limit)' : opt}
              </button>
            ))}
            <div className="flex items-center gap-1 pl-1">
              <span className="text-[11px] text-slate-400 font-bold">Custom:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={limit !== 'all' ? limit : ''}
                placeholder="e.g. 5"
                onChange={(e) => updateSectionData(section.id, 'limit', e.target.value ? Number(e.target.value) : 'all')}
                className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-center outline-none focus:border-[#02236E]"
              />
            </div>
          </div>
        </div>

        {/* Source Mode: All vs Selected */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            ITEM SELECTION MODE
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSectionData(section.id, 'source', 'all')}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                sourceMode === 'all'
                  ? 'bg-[#02236E] text-white border-[#02236E] shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ◉ All / Latest from DB
            </button>
            <button
              type="button"
              onClick={() => updateSectionData(section.id, 'source', 'selected')}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                sourceMode === 'selected'
                  ? 'bg-[#02236E] text-white border-[#02236E] shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ○ Hand-pick Items ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Optional Title & Action Button Controls */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Title / Heading */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                SECTION TITLE / HEADING
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={section.data?.showTitle !== false}
                  onChange={(e) => updateSectionData(section.id, 'showTitle', e.target.checked)}
                  className="rounded border-slate-300 text-[#02236E] focus:ring-[#02236E] h-3.5 w-3.5"
                />
                <span>Display Title</span>
              </label>
            </div>
            <input
              type="text"
              disabled={section.data?.showTitle === false}
              value={section.data?.heading ?? ''}
              onChange={(e) => updateSectionData(section.id, 'heading', e.target.value)}
              placeholder="e.g. Success Stories"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E] disabled:bg-slate-100 disabled:opacity-50"
            />
            <span className="text-[10px] text-slate-400 block font-medium">
              Optional: Uncheck &quot;Display Title&quot; or leave empty if you don&apos;t want to show a title on this page.
            </span>
          </div>

          {/* Optional Action Button */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                OPTIONAL ACTION BUTTON
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={section.data?.showButton !== false && Boolean(section.data?.buttonText)}
                  onChange={(e) => updateSectionData(section.id, 'showButton', e.target.checked)}
                  className="rounded border-slate-300 text-[#02236E] focus:ring-[#02236E] h-3.5 w-3.5"
                />
                <span>Display Button</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  disabled={section.data?.showButton === false}
                  value={section.data?.buttonText ?? ''}
                  onChange={(e) => {
                    updateSectionData(section.id, 'buttonText', e.target.value);
                    if (e.target.value) updateSectionData(section.id, 'showButton', true);
                  }}
                  placeholder="e.g. Explore More Stories >"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E] disabled:bg-slate-100 disabled:opacity-50"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">Button Label</span>
              </div>
              <div>
                <input
                  type="text"
                  disabled={section.data?.showButton === false}
                  value={section.data?.buttonUrl ?? ''}
                  onChange={(e) => updateSectionData(section.id, 'buttonUrl', e.target.value)}
                  placeholder="e.g. /success-stories"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E] disabled:bg-slate-100 disabled:opacity-50"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">Target URL</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Optional: If disabled or empty, no button is shown on the live page (e.g. for inner pages).
            </span>
          </div>
        </div>
      </div>

      {/* Hand-pick Checklist Panel */}
      {sourceMode === 'selected' && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Select which items to display on this page:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#02236E] text-[10px] font-black">
                {selectedIds.length} of {rawItems.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-[#02236E] hover:underline bg-transparent border-none cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-red-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`🔍 Search available items in ${cfg.managerName}...`}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-[#02236E]"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {rawItems.length === 0
                  ? `No items found in database yet. Add them in ${cfg.managerName} first.`
                  : 'No items match your search filter.'}
              </div>
            ) : (
              filteredItems.map((it) => {
                const id = it[cfg.idKey];
                const isChecked = selectedIds.some((x) => String(x) === String(id));
                const title = cfg.titleKey(it);
                const subtitle = cfg.subtitleKey(it);
                const img = cfg.imageKey(it);

                return (
                  <label
                    key={id}
                    className={`flex items-center gap-3 p-2.5 px-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      isChecked ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleId(id)}
                      className="rounded border-slate-300 text-[#02236E] focus:ring-[#02236E] h-4 w-4 cursor-pointer"
                    />

                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-base shrink-0">
                        {cfg.icon}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{title}</div>
                      {subtitle && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</div>
                      )}
                    </div>

                    {isChecked && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        ✓ Selected
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idParam = searchParams.get('id');
  const slugParam = searchParams.get('slug');
  const isNewPage = !idParam && !slugParam;

  // Active sub-tab inside section area
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'richtext' | 'seo'

  // Page Basic Info
  const [pageInfo, setPageInfo] = useState({
    title: '',
    slug: '',
    path: '/',
    page_key: '',
    category_id: null,
    parent_page_id: null,
    page_kind: 'standard',
    status: 'published',
    show_in_menu: true,
    sort_order: 0,
    revision: 1,
  });

  // Homepage Hero Banner Data
  const [heroData, setHeroData] = useState({
    bgImage: '',
    position: 'center center',
    size: 'cover',
    eyebrow: 'Empowering Communities, Transforming Lives',
    title: 'Pakistan\'s Premier Digital <span>Welfare Network</span>',
    description: 'Uniting donors, volunteers, and certified NGOs across healthcare, education, orphan care, and emergency relief with 100% transparency.',
    primaryBtnLabel: 'Donate Now →',
    primaryBtnLink: '/donate-now',
    secondaryBtnLabel: 'Explore Organizations',
    secondaryBtnLink: '/organizations',
    badge1Top: '10k+',
    badge1Sub: 'Lives Impacted',
    badge2Top: '100% Free',
    badge2Sub: 'Direct Donations, Zero Cut',
  });

  // Dynamic Sections
  const [sections, setSections] = useState([]);
  const [deletedSectionDbIds, setDeletedSectionDbIds] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const dropdownRef = useRef(null);
  const dragIdxRef = useRef(null);

  // Connected Database Data
  const [connectedData, setConnectedData] = useState({
    organizations: [],
    blogs: [],
    stories: [],
    podcasts: [],
    faqs: [],
    loading: true,
  });

  // Fetch Connected Database Records
  useEffect(() => {
    let alive = true;
    const fetchAllConnected = async () => {
      try {
        const [orgsRes, blogsRes, storiesRes, podcastsRes, faqsRes] = await Promise.allSettled([
          fetch(`${API}/admin/organizations`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin' } }).then(r => r.json()),
          fetch(`${API}/admin/blogs`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin' } }).then(r => r.json()),
          fetch(`${API}/api/success-stories`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API}/api/podcasts`, { credentials: 'include' }).then(r => r.json()),
          fetch(`${API}/api/faqs`, { credentials: 'include' }).then(r => r.json()),
        ]);

        if (!alive) return;

        const orgs = orgsRes.status === 'fulfilled' && orgsRes.value?.items ? orgsRes.value.items : [];
        const blogs = blogsRes.status === 'fulfilled' && blogsRes.value?.items ? blogsRes.value.items : [];
        const stories = storiesRes.status === 'fulfilled' ? (Array.isArray(storiesRes.value) ? storiesRes.value : storiesRes.value?.data || []) : [];
        const podcasts = podcastsRes.status === 'fulfilled' && podcastsRes.value?.items ? podcastsRes.value.items : [];
        const faqs = faqsRes.status === 'fulfilled' ? (Array.isArray(faqsRes.value?.data) ? faqsRes.value.data : Array.isArray(faqsRes.value) ? faqsRes.value : []) : [];

        setConnectedData({
          organizations: orgs,
          blogs,
          stories,
          podcasts,
          faqs,
          loading: false,
        });
      } catch {
        if (alive) setConnectedData((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchAllConnected();
    return () => { alive = false; };
  }, []);

  // SEO Settings
  const [seo, setSeo] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card: 'summary_large_image',
    robots_noindex: false,
    robots_nofollow: false,
    include_in_sitemap: true,
    sitemap_priority: 0.8,
    sitemap_changefreq: 'weekly',
  });

  // UI state
  const [loading, setLoading] = useState(!isNewPage);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [seoCenterOpen, setSeoCenterOpen] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Close catalog dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCatalogOpen(false);
      }
    }
    if (catalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [catalogOpen]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Leave anyway?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // Load Page Data
  useEffect(() => {
    if (isNewPage) {
      setPageInfo({
        title: 'New Page',
        slug: 'new-page',
        path: '/new-page',
        page_key: `page-${Date.now().toString(36)}`,
        category_id: null,
        parent_page_id: null,
        page_kind: 'standard',
        status: 'published',
        show_in_menu: true,
        sort_order: 0,
        revision: 1,
      });
      setSections([
        {
          id: newSectionId(),
          kind: 'hero',
          title: 'Hero Carousel',
          visible: true,
          data: {
            heading: 'Empowering Communities, Transforming Lives',
            subheading: 'Welcome to Khudii',
            body: 'Pakistan\'s premier platform uniting donors, volunteers and welfare organizations.',
            image: '/Khudii.webp',
            buttonText: 'Donate Now',
            buttonUrl: '/donate-now',
            items: [],
          },
        },
      ]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        if (idParam) {
          const res = await fetch(`${API}/admin/v2/pages/${idParam}`, {
            headers: { 'x-khudii-surface': 'admin' },
            credentials: 'include',
            cache: 'no-store',
          });
          const pageJson = await res.json();
          if (!pageJson.success) throw new Error(pageJson.error?.message || 'Page not found');
          const p = pageJson.data;

          setPageInfo({
            id: p.id,
            title: p.title || '',
            slug: p.slug || '',
            path: p.path || '/',
            page_key: p.page_key || '',
            category_id: p.category_id || null,
            parent_page_id: p.parent_page_id || null,
            page_kind: p.page_kind || 'standard',
            status: p.status || 'published',
            show_in_menu: Boolean(p.show_in_menu),
            sort_order: p.sort_order || 0,
            revision: Number(p.revision || 1),
          });

          // Fetch Sections
          const secRes = await fetch(`${API}/admin/v2/sections?page_id=${idParam}`, {
            headers: { 'x-khudii-surface': 'admin' },
            credentials: 'include',
            cache: 'no-store',
          });
          const secJson = await secRes.json();
          if (secJson.success && Array.isArray(secJson.data) && secJson.data.length > 0) {
            const mapped = secJson.data.map((s) => ({
              id: String(s.id),
              dbId: s.id,
              revision: Number(s.revision || 1),
              kind: s.section_type || 'article',
              title: s.title || 'Section',
              visible: Boolean(s.is_published),
              data: s.payload?.data || (typeof s.payload === 'object' ? s.payload : newSectionData()),
            }));
            setSections(mapped);
            setDeletedSectionDbIds([]);

            // Sync hero data if hero section exists
            const heroSec = mapped.find((s) => s.kind === 'hero' || s.title?.toLowerCase().includes('hero'));
            if (heroSec?.data) {
              setHeroData((prev) => ({
                ...prev,
                bgImage: heroSec.data.image || prev.bgImage,
                title: heroSec.data.heading || prev.title,
                eyebrow: heroSec.data.subheading || prev.eyebrow,
                description: heroSec.data.body || prev.description,
                primaryBtnLabel: heroSec.data.buttonText || prev.primaryBtnLabel,
                primaryBtnLink: heroSec.data.buttonUrl || prev.primaryBtnLink,
                badge1Top: heroSec.data.badge1Top || prev.badge1Top,
                badge1Sub: heroSec.data.badge1Sub || prev.badge1Sub,
                badge2Top: heroSec.data.badge2Top || prev.badge2Top,
                badge2Sub: heroSec.data.badge2Sub || prev.badge2Sub,
              }));
            }
          } else {
            const tpl = CMS_PAGES.find((t) => t.slug === p.path || t.slug === `/${p.slug}`);
            if (tpl) {
              setSections(defaultSections(tpl.slug));
            }
          }

          // Fetch SEO
          try {
            const seoRes = await fetch(`${API}/admin/v2/seo?path=${encodeURIComponent(p.path || `/${p.slug}`)}`, {
              headers: { 'x-khudii-surface': 'admin' },
              credentials: 'include',
            });
            const seoJson = await seoRes.json();
            if (seoJson.success && seoJson.data?.[0]) {
              const s = seoJson.data[0];
              setSeo({
                id: s.id,
                meta_title: s.meta_title || '',
                meta_description: s.meta_description || '',
                meta_keywords: s.meta_keywords || '',
                canonical_url: s.canonical_url || '',
                og_title: s.og_title || '',
                og_description: s.og_description || '',
                og_image: s.og_image || '',
                twitter_card: s.twitter_card || 'summary_large_image',
                robots_noindex: Boolean(s.robots_noindex),
                robots_nofollow: Boolean(s.robots_nofollow),
                include_in_sitemap: Boolean(s.include_in_sitemap),
                sitemap_priority: s.sitemap_priority ?? 0.8,
                sitemap_changefreq: s.sitemap_changefreq || 'weekly',
              });
            }
          } catch {}
        } else if (slugParam) {
          const def = CMS_PAGES.find((p) => p.slug === slugParam);
          if (def) {
            setPageInfo({
              title: def.title,
              slug: def.slug.replace(/^\/+/, '') || 'home',
              path: def.slug,
              page_key: `tpl-${def.slug.replace(/[^a-z0-9]/gi, '-')}`,
              page_kind: def.slug.includes('[') ? 'template' : 'standard',
              status: 'published',
              show_in_menu: true,
              sort_order: 0,
              revision: 1,
            });

            const res = await fetch(`${API}/admin/cms/page?slug=${encodeURIComponent(slugParam)}`, {
              headers: { 'x-khudii-surface': 'admin' },
              credentials: 'include',
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.data?.sections)) {
              setSections(json.data.sections);
            }
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idParam, slugParam, isNewPage]);

  // Section Ordering
  const handleMoveSection = (index, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    setDirty(true);
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleToggleSection = (secId, checked) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, visible: checked } : s))
    );
  };

  const handleDeleteSection = (secId) => {
    const sec = sections.find((s) => s.id === secId);
    setConfirmConfig({
      title: 'Delete Section?',
      message: `Are you sure you want to remove "${sec?.title || 'this section'}"?`,
      confirmLabel: 'Delete Section',
      onConfirm: () => {
        setDirty(true);
        if (sec?.dbId) {
          setDeletedSectionDbIds((prev) => [...prev, sec.dbId]);
        }
        setSections((prev) => prev.filter((s) => s.id !== secId));
        if (editingSectionId === secId) setEditingSectionId(null);
        showToast('Section removed');
      },
    });
  };

  const handleAddSectionFromCatalog = (catItem) => {
    setDirty(true);
    const newSec = {
      id: newSectionId(),
      kind: catItem.kind,
      title: catItem.title,
      visible: true,
      data: {
        heading: catItem.defaultData?.heading ?? catItem.title,
        showTitle: catItem.defaultData?.showTitle !== false,
        subheading: catItem.defaultData?.subheading || '',
        body: catItem.defaultData?.body || catItem.description,
        image: catItem.defaultData?.image || '',
        imageAlt: catItem.defaultData?.imageAlt || '',
        showButton: catItem.defaultData?.showButton !== false && Boolean(catItem.defaultData?.buttonText),
        buttonText: catItem.defaultData?.buttonText || '',
        buttonUrl: catItem.defaultData?.buttonUrl || '',
        items: catItem.defaultData?.items || [],
        source: catItem.defaultData?.source || 'all',
        limit: catItem.defaultData?.limit || 'all',
        selectedIds: catItem.defaultData?.selectedIds || [],
      },
    };
    setSections((prev) => [...prev, newSec]);
    setEditingSectionId(newSec.id);
    setCatalogOpen(false);
    showToast(`Added ${catItem.title}`);
  };

  const updateSectionData = (secId, key, value) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, data: { ...s.data, [key]: value } } : s))
    );
  };

  const handleAddItemToSection = (secId) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        const currentItems = Array.isArray(s.data?.items) ? s.data.items : [];
        return {
          ...s,
          data: {
            ...s.data,
            items: [
              ...currentItems,
              {
                title: '',
                description: '',
                url: '',
                image: '',
                imageAlt: '',
              },
            ],
          },
        };
      })
    );
  };

  const handleUpdateItem = (secId, itemIdx, field, val) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        const items = [...(s.data?.items || [])];
        items[itemIdx] = { ...items[itemIdx], [field]: val };
        return { ...s, data: { ...s.data, items } };
      })
    );
  };

  const handleRemoveItem = (secId, itemIdx) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        const items = (s.data?.items || []).filter((_, i) => i !== itemIdx);
        return { ...s, data: { ...s.data, items } };
      })
    );
  };

  const handleTitleChange = (val) => {
    setDirty(true);
    setPageInfo((prev) => {
      const isAutoSlug = !prev.id || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const genSlug = isAutoSlug
        ? val
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : prev.slug;
      return {
        ...prev,
        title: val,
        slug: genSlug,
        path: isAutoSlug ? (genSlug ? `/${genSlug}` : '/') : prev.path,
      };
    });
  };

  // Save Complete Page (Published or Draft)
  const handleSave = async (isDraft = false) => {
    if (!pageInfo.title.trim()) {
      showToast('Page title is required.', 'error');
      return;
    }

    setSaving(true);
    const saveStatus = isDraft ? 'draft' : 'published';
    try {
      if (slugParam) {
        // Save Frontend Template Layout
        const res = await fetch(`${API}/admin/cms/page?slug=${encodeURIComponent(slugParam)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-khudii-surface': 'admin',
          },
          credentials: 'include',
          body: JSON.stringify({
            sections,
            revision: pageInfo.revision,
          }),
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Save failed');
        setDirty(false);
        showToast('Page layout changes saved successfully');
      } else {
        // Save Database Page
        const pagePayload = {
          title: pageInfo.title.trim(),
          slug: pageInfo.slug.trim(),
          path: pageInfo.path.trim() || `/${pageInfo.slug.trim()}`,
          page_key: pageInfo.page_key || `page-${pageInfo.slug}`,
          category_id: pageInfo.category_id ? Number(pageInfo.category_id) : null,
          parent_page_id: pageInfo.parent_page_id ? Number(pageInfo.parent_page_id) : null,
          page_kind: pageInfo.page_kind,
          status: saveStatus,
          show_in_menu: Boolean(pageInfo.show_in_menu),
          sort_order: Number(pageInfo.sort_order || 0),
        };

        let savedPageId = pageInfo.id;

        if (pageInfo.id) {
          pagePayload.revision = pageInfo.revision;
          let res = await fetch(`${API}/admin/v2/pages/${pageInfo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
            credentials: 'include',
            body: JSON.stringify(pagePayload),
          });
          let json = await res.json();
          // If stale revision detected, seamlessly force-save to prevent blocking the admin
          if (!res.ok || !json.success) {
            if (res.status === 409 || json.error?.code === 'stale_revision') {
              res = await fetch(`${API}/admin/v2/pages/${pageInfo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
                credentials: 'include',
                body: JSON.stringify({ ...pagePayload, force: true }),
              });
              json = await res.json();
            }
          }
          if (!res.ok || !json.success) throw new Error(json.error?.message || json.message || 'Page save failed');
          if (json.data?.revision) {
            setPageInfo((p) => ({ ...p, revision: json.data.revision, status: saveStatus }));
          }
        } else {
          const res = await fetch(`${API}/admin/v2/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
            credentials: 'include',
            body: JSON.stringify(pagePayload),
          });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error?.message || json.message || 'Page creation failed');
          savedPageId = json.data?.id;
          setPageInfo((p) => ({ ...p, id: savedPageId, revision: json.data?.revision || 1, status: saveStatus }));
        }

        // Delete any sections that were removed from the UI
        if (deletedSectionDbIds.length > 0) {
          for (const delId of deletedSectionDbIds) {
            try {
              await fetch(`${API}/admin/v2/sections/${delId}`, {
                method: 'DELETE',
                headers: { 'x-khudii-surface': 'admin' },
                credentials: 'include',
              });
            } catch (e) {
              console.warn('Failed to delete section', delId, e);
            }
          }
          setDeletedSectionDbIds([]);
        }

        // Save Sections
        if (savedPageId) {
          for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            const secPayload = {
              page_id: Number(savedPageId),
              section_key: `${sec.kind}-${i + 1}-${savedPageId}`,
              section_type: sec.kind,
              title: sec.title || `Section ${i + 1}`,
              payload: { data: sec.data },
              is_published: Boolean(sec.visible !== false),
              sort_order: i + 1,
            };
            if (sec.revision) secPayload.revision = sec.revision;

            if (sec.dbId) {
              const secRes = await fetch(`${API}/admin/v2/sections/${sec.dbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
                credentials: 'include',
                body: JSON.stringify({ ...secPayload, force: true }),
              });
              const secJson = await secRes.json();
              if (secJson.success && secJson.data?.revision) {
                sec.revision = secJson.data.revision;
              }
            } else {
              const res = await fetch(`${API}/admin/v2/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
                credentials: 'include',
                body: JSON.stringify(secPayload),
              });
              const json = await res.json();
              if (json.success && json.data?.id) {
                sec.dbId = json.data.id;
                sec.revision = json.data.revision || 1;
              }
            }
          }

          // Save SEO
          const seoPayload = {
            entity_type: 'page',
            entity_key: `page-${savedPageId}`,
            page_id: Number(savedPageId),
            path: pageInfo.path || `/${pageInfo.slug}`,
            meta_title: seo.meta_title || pageInfo.title,
            meta_description: seo.meta_description || '',
            meta_keywords: seo.meta_keywords || '',
            canonical_url: seo.canonical_url || '',
            og_title: seo.og_title || seo.meta_title || pageInfo.title,
            og_description: seo.og_description || seo.meta_description || '',
            og_image: seo.og_image || '',
            twitter_card: seo.twitter_card,
            robots_noindex: Boolean(seo.robots_noindex),
            robots_nofollow: Boolean(seo.robots_nofollow),
            include_in_sitemap: Boolean(seo.include_in_sitemap),
            sitemap_priority: Number(seo.sitemap_priority || 0.8),
            sitemap_changefreq: seo.sitemap_changefreq,
          };

          if (seo.id) {
            await fetch(`${API}/admin/v2/seo/${seo.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
              credentials: 'include',
              body: JSON.stringify({ ...seoPayload, force: true }),
            });
          } else {
            const res = await fetch(`${API}/admin/v2/seo`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
              credentials: 'include',
              body: JSON.stringify(seoPayload),
            });
            const json = await res.json();
            if (json.success && json.data?.id) {
              setSeo((prev) => ({ ...prev, id: json.data.id }));
            }
          }
        }

        setDirty(false);
        showToast(isDraft ? 'Draft saved successfully' : 'Page updated successfully');
        if (isNewPage && savedPageId) {
          router.replace(`/admin-app/dashboard/pages/edit?id=${savedPageId}`);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const isHomepage = pageInfo.path === '/' || pageInfo.slug === '/' || pageInfo.slug === 'home' || pageInfo.title?.toLowerCase() === 'home' || idParam === '1';

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return SECTION_CATALOG;
    const q = catalogSearch.toLowerCase();
    return SECTION_CATALOG.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (it) => it.title.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [catalogSearch]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#02236E]" />
        <span className="ml-3 text-sm font-bold text-slate-600">Loading Page...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-800 pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* SEO Center Modal */}
      {seoCenterOpen && (
        <SeoCenterModal
          isOpen={seoCenterOpen}
          onClose={() => setSeoCenterOpen(false)}
          pageData={{
            ...pageInfo,
            id: pageInfo.id,
            title: pageInfo.title,
            slug: pageInfo.slug,
            path: pageInfo.path,
            meta_title: seo.meta_title,
            meta_description: seo.meta_description,
            meta_keywords: seo.meta_keywords,
            og_image: seo.og_image,
            entityType: 'page',
          }}
          onSaveSuccess={() => {
            showToast('SEO Settings saved successfully');
          }}
        />
      )}

      {/* ── Top Bar Breadcrumb & Header (Cloned from KingTravel) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 lg:px-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin-app/dashboard/pages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/90 text-slate-700 hover:border-[#02236E] hover:bg-[#02236E] hover:text-white text-xs font-bold transition-all shadow-2xs no-underline"
          >
            <ArrowLeft size={13} /> Back to Pages
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-bold text-[#02236E] m-0 tracking-tight">
            {pageInfo.title || 'Page Editor'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* SEO Center Button */}
          <button
            type="button"
            onClick={() => setSeoCenterOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-[#02236E] border border-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Page SEO</span>
          </button>

          {/* View Live Page */}
          <a
            href={pageInfo.path || `/${pageInfo.slug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all shadow-2xs no-underline"
          >
            <ExternalLink size={13} /> View Page
          </a>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            📄 Save Draft
          </button>

          {/* Update / Publish Button */}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#02236E] hover:bg-blue-900 text-white text-xs font-bold transition-all cursor-pointer shadow-md border-none disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            <span>{saving ? 'Saving...' : '✓ Update'}</span>
          </button>
        </div>
      </div>

      {/* ── HOMEPAGE HERO BANNER CARD (1920px x 640px) ── */}
      {isHomepage && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#02236E] tracking-wider uppercase m-0 flex items-center gap-1.5">
                👑 HOMEPAGE HERO BANNER BACKGROUND IMAGE & CONTENT (1920PX X 640PX)
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Recommended 1920px x 640px (min-height: 640px)</span>
            </div>
            {heroData.bgImage && (
              <button
                type="button"
                onClick={() => setHeroData((prev) => ({ ...prev, bgImage: '' }))}
                className="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              >
                ⊗ Remove Image
              </button>
            )}
          </div>

          {/* Split Desktop Grid: Image Upload & Dropzone (Left) + Live 640px Hero Preview Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 5-Col Upload & Main Banner Settings */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">Homepage Hero Background Image</label>
                <ImageUploadWidget
                  value={heroData.bgImage || ''}
                  onChange={(url) => {
                    setHeroData((prev) => ({ ...prev, bgImage: url }));
                    setDirty(true);
                  }}
                  subfolder="banners"
                  label="Hero Banner Image"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
                  Recommended: 1920px x 640px (aspect ratio ~ 3:1, min-height 640px)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    POSITION
                  </label>
                  <select
                    value={heroData.position}
                    onChange={(e) => {
                      setHeroData((prev) => ({ ...prev, position: e.target.value }));
                      setDirty(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-[#02236E]"
                  >
                    <option value="center center">Center Center</option>
                    <option value="top center">Top Center</option>
                    <option value="bottom center">Bottom Center</option>
                    <option value="left center">Left Center</option>
                    <option value="right center">Right Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    SIZE
                  </label>
                  <select
                    value={heroData.size}
                    onChange={(e) => {
                      setHeroData((prev) => ({ ...prev, size: e.target.value }));
                      setDirty(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold outline-none focus:border-[#02236E]"
                  >
                    <option value="cover">Cover (Default)</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto / Original</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right 7-Col Real-Time Live 640px Hero Preview Box */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-xl border border-slate-900/20 p-6 md:p-8 flex flex-col justify-between text-white min-h-[320px] bg-slate-900">
              <div
                className="absolute inset-0 z-0 transition-all duration-300"
                style={{
                  backgroundImage: `linear-gradient(100deg, rgba(2, 35, 110, .92) 0%, rgba(2, 35, 110, .75) 45%, rgba(2, 35, 110, .3) 80%), url("${heroData.bgImage || '/Khudii.webp'}")`,
                  backgroundPosition: heroData.position || 'center center',
                  backgroundSize: heroData.size || 'cover',
                  backgroundRepeat: 'no-repeat',
                }}
              />

              {/* Floating Top Right Badge 1 Card */}
              <div className="absolute right-5 top-5 z-10 bg-white/95 text-slate-900 rounded-2xl p-2.5 px-3.5 shadow-lg border border-white flex items-center gap-2.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-[#02236E] text-xs font-bold">
                  ★
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-none">{heroData.badge1Top}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{heroData.badge1Sub}</div>
                </div>
              </div>

              {/* Floating Bottom Right Badge 2 Card */}
              <div className="absolute right-5 bottom-5 z-10 bg-white/95 text-slate-900 rounded-2xl p-2.5 px-3.5 shadow-lg border border-white flex items-center gap-2.5 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-none">{heroData.badge2Top}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{heroData.badge2Sub}</div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="relative z-10 max-w-md space-y-3 my-auto">
                <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  {heroData.eyebrow}
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-white m-0 tracking-tight leading-tight [&>span]:text-amber-300"
                  dangerouslySetInnerHTML={{ __html: heroData.title || 'Pakistan\'s Premier Digital <span>Welfare Network</span>' }}
                />
                <p className="text-xs text-white/90 leading-relaxed font-light">
                  {heroData.description}
                </p>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer">
                    {heroData.primaryBtnLabel}
                  </span>
                  <span className="bg-white/20 text-white hover:bg-white/30 font-bold text-xs px-5 py-2.5 rounded-full backdrop-blur-xs transition-all cursor-pointer border border-white/40">
                    {heroData.secondaryBtnLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Grid for Banner Content Editing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                EYEBROW TAGLINE
              </label>
              <input
                type="text"
                value={heroData.eyebrow}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, eyebrow: e.target.value }));
                  setDirty(true);
                }}
                placeholder="e.g. Empowering Communities"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  TITLE (H1)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const full = heroData.title || '';
                    if (!full.includes('<span>')) {
                      setHeroData((prev) => ({ ...prev, title: full.replace(/([A-Z][a-z0-9\s&]+)$/i, '<span>$1</span>') }));
                    } else {
                      setHeroData((prev) => ({ ...prev, title: full.replace(/<\/?span>/g, '') }));
                    }
                    setDirty(true);
                  }}
                  className="text-[10px] font-bold text-[#02236E] hover:bg-blue-100 bg-blue-50 px-2 py-0.5 rounded cursor-pointer border border-amber-300 transition-colors"
                  title="Highlight words in Blue"
                >
                  ✨ Blue Words
                </button>
              </div>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, title: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Headline Title..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                SUBTEXT / DESCRIPTION
              </label>
              <input
                type="text"
                value={heroData.description}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, description: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Description paragraph..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PRIMARY CTA BUTTON LABEL
              </label>
              <input
                type="text"
                value={heroData.primaryBtnLabel}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, primaryBtnLabel: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Donate Now →"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PRIMARY CTA LINK
              </label>
              <input
                type="text"
                value={heroData.primaryBtnLink}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, primaryBtnLink: e.target.value }));
                  setDirty(true);
                }}
                placeholder="/donate-now"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                SECONDARY CTA BUTTON LABEL
              </label>
              <input
                type="text"
                value={heroData.secondaryBtnLabel}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, secondaryBtnLabel: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Explore Organizations"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                SECONDARY CTA LINK
              </label>
              <input
                type="text"
                value={heroData.secondaryBtnLink}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, secondaryBtnLink: e.target.value }));
                  setDirty(true);
                }}
                placeholder="/organizations"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 1 TOP TEXT
              </label>
              <input
                type="text"
                value={heroData.badge1Top}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, badge1Top: e.target.value }));
                  setDirty(true);
                }}
                placeholder="10k+"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 1 SUBTEXT
              </label>
              <input
                type="text"
                value={heroData.badge1Sub}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, badge1Sub: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Lives Impacted"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 2 TOP TEXT
              </label>
              <input
                type="text"
                value={heroData.badge2Top}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, badge2Top: e.target.value }));
                  setDirty(true);
                }}
                placeholder="100% Free"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                BADGE 2 SUBTEXT
              </label>
              <input
                type="text"
                value={heroData.badge2Sub}
                onChange={(e) => {
                  setHeroData((prev) => ({ ...prev, badge2Sub: e.target.value }));
                  setDirty(true);
                }}
                placeholder="Direct Donations, Zero Cut"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#02236E]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILS ROW (TITLE/SLUG & PAGE STATUS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Left Card: Title & Slug */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                TITLE *
              </label>
              <input
                type="text"
                value={pageInfo.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Page Title..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 outline-none focus:border-[#02236E] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                SLUG *
              </label>
              <input
                type="text"
                value={pageInfo.slug || ''}
                onChange={(e) => {
                  setPageInfo((p) => ({ ...p, slug: e.target.value, path: `/${e.target.value}` }));
                  setDirty(true);
                }}
                placeholder="page-slug"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 outline-none focus:border-[#02236E] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right Card: Page Status & Navigation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                PAGE STATUS
              </label>
              <select
                value={pageInfo.status || 'published'}
                onChange={(e) => {
                  setPageInfo((p) => ({ ...p, status: e.target.value }));
                  setDirty(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 outline-none focus:border-[#02236E]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Show in menu</span>
                <span className="text-[11px] text-slate-400">Include link in site header navigation</span>
              </div>
              <AdminPublishSwitch
                checked={pageInfo.show_in_menu}
                onChange={(val) => {
                  setPageInfo((p) => ({ ...p, show_in_menu: val }));
                  setDirty(true);
                }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Auto-saves draft state dynamically</span>
          </div>
        </div>
      </div>

      {/* ── PAGE BUILDER WORKSPACE (DYNAMIC SECTIONS) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-visible">
        {/* Dynamic Builder Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 rounded-t-3xl">
          {[
            { key: 'sections', label: `🧱 Page Sections (${sections.length})` },
            { key: 'richtext', label: '📝 Rich Text' },
            { key: 'seo', label: '🔍 SEO Center' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                if (t.key === 'seo') {
                  setSeoCenterOpen(true);
                } else {
                  setActiveTab(t.key);
                }
              }}
              className={`px-5 py-3.5 text-xs font-sans font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === t.key && t.key !== 'seo'
                  ? 'border-b-[#02236E] text-[#02236E]'
                  : 'border-b-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="p-6 min-h-[460px]">
          {activeTab === 'sections' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between relative z-30">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Page Sections</h3>
                  <p className="text-xs text-slate-400 mt-0.5 m-0">Build page layout with reorderable sections</p>
                </div>

                {/* Add Section Dropdown Button (Cloned from KingTravel) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogOpen(!catalogOpen);
                      setCatalogSearch('');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#02236E] hover:bg-blue-900 text-white text-xs font-bold transition-all cursor-pointer shadow-sm border-none"
                  >
                    <span>+ Add Section</span>
                    <span className="text-[10px]">{catalogOpen ? '▲' : '▼'}</span>
                  </button>

                  {catalogOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search sections..."
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#02236E]"
                          />
                        </div>
                      </div>

                      {/* Grouped Category Items */}
                      <div className="overflow-y-auto max-h-[380px] p-2 space-y-3">
                        {filteredCatalog.map((catGroup) => (
                          <div key={catGroup.category} className="space-y-1">
                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <span>{catGroup.icon}</span>
                              <span>{catGroup.category}</span>
                            </div>
                            <div className="space-y-1">
                              {catGroup.items.map((item) => (
                                <button
                                  key={item.title}
                                  type="button"
                                  onClick={() => handleAddSectionFromCatalog(item)}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-colors group cursor-pointer"
                                >
                                  <div className="text-xs font-bold text-[#02236E] group-hover:text-blue-900">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {item.description}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Stack (Full Width, Cloned from KingTravel) */}
              <div className="space-y-3">
                {sections.length > 0 ? (
                  sections.map((sec, index) => {
                    const acronym = getAcronym(sec.title);
                    const badgeClass = getBadgeColor(acronym);
                    const isExpanded = editingSectionId === sec.id;

                    return (
                      <div
                        key={sec.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIdx = dragIdxRef.current;
                          if (fromIdx !== null && fromIdx !== undefined && fromIdx !== index) {
                            handleMoveSection(fromIdx, index);
                          }
                          dragIdxRef.current = null;
                        }}
                        className={`rounded-2xl border bg-white shadow-xs transition-all overflow-hidden ${
                          isExpanded
                            ? 'border-[#02236E] ring-2 ring-[#02236E]/10'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${sec.visible === false ? 'opacity-65 bg-slate-50/80' : ''}`}
                      >
                        {/* Section Header Row */}
                        <div className="p-3.5 px-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Standard Reorder Handle & Order Position Badge */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', String(index));
                                  dragIdxRef.current = index;
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-colors"
                                title="Drag to reorder section"
                              >
                                <GripVertical size={16} />
                              </div>

                              <div className="relative" title="Section position (click to change order)">
                                <select
                                  value={index + 1}
                                  onChange={(e) => {
                                    const targetPos = parseInt(e.target.value, 10) - 1;
                                    if (!isNaN(targetPos) && targetPos !== index) {
                                      handleMoveSection(index, targetPos);
                                    }
                                  }}
                                  className="appearance-none pl-2 pr-4 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-700 hover:border-slate-300 hover:bg-white cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-[#02236E]"
                                >
                                  {sections.map((_, pIdx) => (
                                    <option key={pIdx + 1} value={pIdx + 1}>
                                      #{pIdx + 1}
                                    </option>
                                  ))}
                                </select>
                                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-slate-400">
                                  ▼
                                </span>
                              </div>
                            </div>

                            {/* Acronym Badge */}
                            <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 ${badgeClass}`}
                            >
                              {acronym}
                            </div>

                            {/* Section Title & Description */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 m-0 truncate">
                                  {sec.title}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                                  {sec.kind}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 m-0 truncate mt-0.5">
                                {sec.data?.heading || sec.data?.body || 'No heading set'}
                              </p>
                            </div>
                          </div>

                          {/* Section Action Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <AdminPublishSwitch
                              checked={sec.visible !== false}
                              onChange={(checked) => handleToggleSection(sec.id, checked)}
                              label={sec.visible !== false ? 'Visible' : 'Hidden'}
                            />

                            {/* Edit Section Button */}
                            <button
                              type="button"
                              onClick={() => setEditingSectionId(isExpanded ? null : sec.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                                isExpanded
                                  ? 'bg-[#02236E] text-white border-[#02236E]'
                                  : 'bg-blue-50 text-[#02236E] border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              {isExpanded ? 'Close' : '✎'}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Section Editor Panel (Expands when clicked) */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 animate-in fade-in-50 duration-150">
                            {/* Connected Database Module Picker (Organizations, Blogs, Success Stories, Podcasts, FAQs) */}
                            {['organizations', 'blogs', 'stories', 'podcast-grid', 'faq'].includes(sec.kind) && (
                              <ConnectedModuleEditor
                                section={sec}
                                connectedData={connectedData}
                                updateSectionData={updateSectionData}
                              />
                            )}

                            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
                              <span className="text-[11px] font-bold text-[#02236E] uppercase tracking-wider flex items-center gap-1.5">
                                ✏️ SECTION HEADING & CONTENT
                              </span>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    SECTION HEADING
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.heading || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'heading', e.target.value)}
                                    placeholder="e.g. Empowering Communities"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    SECTION SUBHEADING / EYEBROW
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.subheading || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'subheading', e.target.value)}
                                    placeholder="e.g. Our Mission"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  DESCRIPTION / BODY TEXT
                                </label>
                                <textarea
                                  rows={3}
                                  value={sec.data?.body || ''}
                                  onChange={(e) => updateSectionData(sec.id, 'body', e.target.value)}
                                  placeholder="Section details or body content..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#02236E]"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    IMAGE URL
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.image || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'image', e.target.value)}
                                    placeholder="https://... or /image.png"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    IMAGE ALT TEXT
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.imageAlt || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'imageAlt', e.target.value)}
                                    placeholder="Image description for accessibility"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    BUTTON LABEL
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.buttonText || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'buttonText', e.target.value)}
                                    placeholder="e.g. Learn More"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    BUTTON URL
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.data?.buttonUrl || ''}
                                    onChange={(e) => updateSectionData(sec.id, 'buttonUrl', e.target.value)}
                                    placeholder="/contact-us"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:border-[#02236E]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Repeatable Items (Cards, FAQ, Logos, Stats, Steps) */}
                            {['cards', 'gallery', 'logos', 'people', 'stats', 'steps', 'timeline', 'downloads'].includes(sec.kind) || (sec.kind === 'faq' && sec.data?.source === 'manual') ? (
                              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#02236E] uppercase tracking-wider">
                                    REPEATABLE ITEMS ({Array.isArray(sec.data?.items) ? sec.data.items.length : 0})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddItemToSection(sec.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition cursor-pointer"
                                  >
                                    <Plus size={13} /> Add Item
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {(Array.isArray(sec.data?.items) ? sec.data.items : []).map((item, itIdx) => (
                                    <div
                                      key={itIdx}
                                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 relative group"
                                    >
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                          {sec.kind === 'faq' ? 'Question' : 'Title'}
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title || ''}
                                          onChange={(e) => handleUpdateItem(sec.id, itIdx, 'title', e.target.value)}
                                          placeholder="Title..."
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                          {sec.kind === 'faq' ? 'Answer' : 'Description'}
                                        </label>
                                        <input
                                          type="text"
                                          value={item.description || ''}
                                          onChange={(e) => handleUpdateItem(sec.id, itIdx, 'description', e.target.value)}
                                          placeholder="Description..."
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                                        />
                                      </div>

                                      {sec.kind !== 'faq' && (
                                        <>
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                              Image URL
                                            </label>
                                            <input
                                              type="text"
                                              value={item.image || ''}
                                              onChange={(e) => handleUpdateItem(sec.id, itIdx, 'image', e.target.value)}
                                              placeholder="Image link..."
                                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                              Link URL
                                            </label>
                                            <input
                                              type="text"
                                              value={item.url || ''}
                                              onChange={(e) => handleUpdateItem(sec.id, itIdx, 'url', e.target.value)}
                                              placeholder="/page-link"
                                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                                            />
                                          </div>
                                        </>
                                      )}

                                      <div className="sm:col-span-2 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveItem(sec.id, itIdx)}
                                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 transition cursor-pointer"
                                        >
                                          <Trash2 size={12} /> Remove
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-slate-400">
                    <p className="text-sm font-semibold m-0">No sections added yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "+ Add Section" above to add hero, cards, stories, or FAQ blocks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'richtext' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Page Article Body (Markdown / HTML Supported)
              </label>
              <textarea
                rows={14}
                value={sections[0]?.data?.body || ''}
                onChange={(e) => {
                  if (sections.length > 0) {
                    updateSectionData(sections[0].id, 'body', e.target.value);
                  }
                }}
                placeholder="Enter rich text article content..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-mono leading-relaxed outline-none focus:border-[#02236E]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PageBuilderWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#02236E]" />
          <span className="ml-3 text-sm font-bold text-slate-600">Loading Page...</span>
        </div>
      }
    >
      <PageEditorContent />
    </Suspense>
  );
}
