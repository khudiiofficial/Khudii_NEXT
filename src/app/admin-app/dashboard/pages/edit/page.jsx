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
  ImagePlus,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  Share2,
  CheckCircle2
} from 'lucide-react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import { CMS_PAGES, CMS_SECTION_TYPES, defaultSections } from '@/lib/cms-registry';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

const SECTION_CATALOG = [
  { kind: 'hero', title: 'Hero Banner', group: 'Banner', description: 'Headline, lead text, background image and action CTA' },
  { kind: 'article', title: 'Rich Article', group: 'Content', description: 'Heading, subheadings, and formatted body content' },
  { kind: 'image-text', title: 'Image + Text', group: 'Content', description: 'Split 2-column layout with photo and storytelling text' },
  { kind: 'cards', title: 'Cards Grid', group: 'Cards & Grids', description: 'Repeatable cards with title, description, image and link' },
  { kind: 'cta', title: 'Call To Action', group: 'Interactive', description: 'High-impact donation, volunteer or registration banner' },
  { kind: 'faq', title: 'FAQ Accordion', group: 'Interactive', description: 'Questions and answers accordion knowledge base' },
  { kind: 'gallery', title: 'Photo Gallery', group: 'Media', description: 'Responsive image showcase with captions' },
  { kind: 'logos', title: 'Partner Logos', group: 'Trust & Proof', description: 'Supporting organizations, partners, and accredited sponsors' },
  { kind: 'people', title: 'Team / Leaders', group: 'Trust & Proof', description: 'Profiles with photo, name, title and bio description' },
  { kind: 'stats', title: 'Impact Statistics', group: 'Trust & Proof', description: 'High-impact metric counters (e.g. 50K+ Helped, 100% Free)' },
  { kind: 'steps', title: 'Process Steps', group: 'Interactive', description: 'Numbered sequence of steps or workflow instructions' },
  { kind: 'video-grid', title: 'Video Collection', group: 'Media', description: 'Embedded YouTube video cards with titles and descriptions' },
  { kind: 'timeline', title: 'Milestone Timeline', group: 'Content', description: 'Chronological timeline of achievements and history' },
  { kind: 'downloads', title: 'Document Downloads', group: 'Content', description: 'Downloadable PDF reports, audit forms and documents' },
  { kind: 'divider', title: 'Visual Divider', group: 'Layout', description: 'Clean horizontal separator with optional subtle spacing' },
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

function PageEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idParam = searchParams.get('id');
  const slugParam = searchParams.get('slug');
  const isNewPage = !idParam && !slugParam;

  // Active Tab
  const [activeTab, setActiveTab] = useState('sections'); // 'settings' | 'sections' | 'seo'

  // Page Basic Info
  const [pageInfo, setPageInfo] = useState({
    title: '',
    slug: '',
    path: '/',
    page_key: '',
    category_id: null,
    parent_page_id: null,
    page_kind: 'standard',
    status: 'draft',
    show_in_menu: false,
    sort_order: 0,
    revision: 1,
  });

  // Dynamic Sections
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogGroup, setCatalogGroup] = useState('All');

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

  // Categories & Pages for parent dropdowns
  const [categories, setCategories] = useState([]);
  const [allPages, setAllPages] = useState([]);

  // UI state
  const [loading, setLoading] = useState(!isNewPage);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [seoCenterOpen, setSeoCenterOpen] = useState(false);

  const dragItem = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Unsaved changes listener
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

  // Load Parent References
  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/v2/categories?limit=500`, { headers: { 'x-khudii-surface': 'admin' }, credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/admin/v2/pages?limit=500`, { headers: { 'x-khudii-surface': 'admin' }, credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([cats, pgs]) => {
      if (cats?.success) setCategories(cats.data || []);
      if (pgs?.success) setAllPages(pgs.data || []);
    }).catch(() => {});
  }, []);

  // Load Page Data
  useEffect(() => {
    if (isNewPage) {
      setPageInfo({
        title: '',
        slug: '',
        path: '/',
        page_key: `page-${Date.now().toString(36)}`,
        category_id: null,
        parent_page_id: null,
        page_kind: 'standard',
        status: 'draft',
        show_in_menu: false,
        sort_order: 0,
        revision: 1,
      });
      setSections([
        {
          id: newSectionId(),
          kind: 'hero',
          title: 'Hero Banner',
          visible: true,
          data: {
            heading: 'Empowering Communities, Transforming Lives',
            subheading: 'Welcome to Khudii',
            body: 'Pakistan\'s premier platform uniting donors, volunteers and welfare organizations.',
            image: '/Khudii.webp',
            imageAlt: 'Khudii Hero',
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
          // Load Database Page by ID
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
            status: p.status || 'draft',
            show_in_menu: Boolean(p.show_in_menu),
            sort_order: p.sort_order || 0,
            revision: Number(p.revision || 1),
          });

          // Fetch Sections for this page
          const secRes = await fetch(`${API}/admin/v2/sections?page_id=${idParam}`, {
            headers: { 'x-khudii-surface': 'admin' },
            credentials: 'include',
            cache: 'no-store',
          });
          const secJson = await secRes.json();
          if (secJson.success && Array.isArray(secJson.data) && secJson.data.length > 0) {
            setSections(
              secJson.data.map((s) => ({
                id: s.id,
                dbId: s.id,
                kind: s.section_type || 'article',
                title: s.title || 'Section',
                visible: Boolean(s.is_published),
                data: s.payload?.data || (typeof s.payload === 'object' ? s.payload : newData()),
              }))
            );
          } else {
            // Also check if template layout exists for this path
            const tpl = CMS_PAGES.find((t) => t.slug === p.path || t.slug === `/${p.slug}`);
            if (tpl) {
              setSections(defaultSections(tpl.slug));
            } else {
              setSections([]);
            }
          }

          // Fetch SEO for this page path
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
          // Load Template Layout by Slug
          const def = CMS_PAGES.find((p) => p.slug === slugParam);
          if (def) {
            setPageInfo({
              title: def.title,
              slug: def.slug.replace(/^\/+/, '') || 'home',
              path: def.slug,
              page_key: `tpl-${def.slug.replace(/[^a-z0-9]/gi, '-')}`,
              page_kind: def.slug.includes('[') ? 'template' : 'standard',
              status: 'published',
              show_in_menu: false,
              sort_order: 0,
              revision: 1,
            });

            const res = await fetch(`${API}/admin/cms/page?slug=${encodeURIComponent(slugParam)}`, {
              headers: { 'x-khudii-surface': 'admin' },
              credentials: 'include',
              cache: 'no-store',
            });
            const json = await res.json();
            if (json.sections) {
              setSections(json.sections);
            } else {
              setSections(defaultSections(slugParam));
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

  // Section Operations
  const handleMoveSection = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sections.length) return;
    setDirty(true);
    setSections((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const handleToggleSection = (secId, nextVisible) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, visible: nextVisible } : s))
    );
  };

  const handleDuplicateSection = (section) => {
    setDirty(true);
    const copy = JSON.parse(JSON.stringify(section));
    copy.id = newSectionId();
    delete copy.dbId;
    copy.title = `${section.title} (Copy)`;
    const idx = sections.findIndex((s) => s.id === section.id);
    const updated = [...sections];
    updated.splice(idx + 1, 0, copy);
    setSections(updated);
    setActiveSectionId(copy.id);
    showToast('Section duplicated');
  };

  const handleDeleteSection = (section) => {
    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Remove Section',
      message: `Remove "${section.title}" from this page? Changes take effect when you save.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setDirty(true);
        setSections((prev) => prev.filter((s) => s.id !== section.id));
        if (activeSectionId === section.id) setActiveSectionId('');
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
      data: newSectionData(),
    };
    setSections((prev) => [...prev, newSec]);
    setActiveSectionId(newSec.id);
    setCatalogOpen(false);
    showToast(`Added ${catItem.title}`);
  };

  const updateSectionField = (secId, field, value) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, [field]: value } : s))
    );
  };

  const updateSectionData = (secId, key, value) => {
    setDirty(true);
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, data: { ...s.data, [key]: value } } : s))
    );
  };

  // Section Items Repeater Operations
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

  // Slug generator
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

  // Save Complete Page
  const handleSave = async () => {
    if (!pageInfo.title.trim()) {
      showToast('Page title is required.', 'error');
      setActiveTab('settings');
      return;
    }

    setSaving(true);
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
          status: pageInfo.status,
          show_in_menu: Boolean(pageInfo.show_in_menu),
          sort_order: Number(pageInfo.sort_order || 0),
        };

        let savedPageId = pageInfo.id;

        if (pageInfo.id) {
          // Update Page
          pagePayload.revision = pageInfo.revision;
          const res = await fetch(`${API}/admin/v2/pages/${pageInfo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
            credentials: 'include',
            body: JSON.stringify(pagePayload),
          });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error?.message || json.message || 'Page save failed');
        } else {
          // Create New Page
          const res = await fetch(`${API}/admin/v2/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
            credentials: 'include',
            body: JSON.stringify(pagePayload),
          });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error?.message || json.message || 'Page creation failed');
          savedPageId = json.data?.id;
          setPageInfo((p) => ({ ...p, id: savedPageId }));
        }

        // Save Sections for this database page
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

            if (sec.dbId) {
              await fetch(`${API}/admin/v2/sections/${sec.dbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
                credentials: 'include',
                body: JSON.stringify(secPayload),
              });
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
              body: JSON.stringify(seoPayload),
            });
          } else {
            await fetch(`${API}/admin/v2/seo`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
              credentials: 'include',
              body: JSON.stringify(seoPayload),
            });
          }
        }

        setDirty(false);
        showToast('Page and sections saved successfully');
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

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const filteredCatalog = useMemo(() => {
    return SECTION_CATALOG.filter(
      (item) =>
        (catalogGroup === 'All' || item.group === catalogGroup) &&
        (item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          item.description.toLowerCase().includes(catalogSearch.toLowerCase()))
    );
  }, [catalogSearch, catalogGroup]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#02236E]" />
        <span className="ml-3 text-sm font-bold text-slate-600">Loading page editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin-app/dashboard/pages"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E] transition"
            title="Back to Pages"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#02236E] m-0">
                {pageInfo.title || 'Untitled Page'}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  pageInfo.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pageInfo.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 mb-0">
              Path: <span className="font-mono">{pageInfo.path || `/${pageInfo.slug}`}</span> · {sections.length} sections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* SEO Center */}
          <button
            type="button"
            onClick={() => setSeoCenterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs transition active:scale-95"
            title="Open Advanced SEO Center"
          >
            <Sliders size={14} />
            SEO Center
          </button>

          {/* View Live Page */}
          <a
            href={pageInfo.path || `/${pageInfo.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink size={14} />
            View Live
          </a>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/20 hover:bg-blue-900 disabled:opacity-50 active:scale-95 transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs (Settings, Visual Sections, SEO) */}
      <div className="flex border-b border-slate-200 gap-8 text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'sections'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-[#02236E]'
          }`}
        >
          <Layers size={17} />
          Visual Section Builder ({sections.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-[#02236E]'
          }`}
        >
          <Sliders size={17} />
          Page Settings &amp; Hierarchy
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'seo'
              ? 'border-[#02236E] text-[#02236E]'
              : 'border-transparent text-slate-500 hover:text-[#02236E]'
          }`}
        >
          <Share2 size={17} />
          SEO &amp; Social Meta
        </button>
      </div>

      {/* ================= TAB 1: VISUAL SECTION BUILDER ================= */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sections List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#02236E] m-0">Page Sections</h3>
                <p className="text-xs text-slate-500 mt-0.5">Drag to reorder or edit contents in the panel.</p>
              </div>
              <button
                type="button"
                onClick={() => setCatalogOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition"
              >
                <Plus size={15} /> Add Section
              </button>
            </div>

            {/* Section Catalog Dropdown Modal */}
            {catalogOpen && (
              <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-bold text-[#02236E] text-sm">Choose Section From Catalog</div>
                  <button type="button" onClick={() => setCatalogOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex gap-2 my-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search section types..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none"
                    />
                  </div>
                  <select
                    value={catalogGroup}
                    onChange={(e) => setCatalogGroup(e.target.value)}
                    className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Banner">Banner</option>
                    <option value="Content">Content</option>
                    <option value="Cards & Grids">Cards & Grids</option>
                    <option value="Interactive">Interactive</option>
                    <option value="Media">Media</option>
                    <option value="Trust & Proof">Trust & Proof</option>
                  </select>
                </div>

                <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {filteredCatalog.map((item) => (
                    <button
                      type="button"
                      key={item.kind}
                      onClick={() => handleAddSectionFromCatalog(item)}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-[#02236E] hover:bg-blue-50/50 transition-all"
                    >
                      <div className="text-xs font-bold text-[#02236E]">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List of active sections */}
            <div className="space-y-3">
              {sections.length > 0 ? (
                sections.map((sec, index) => (
                  <div
                    key={sec.id}
                    className={`rounded-2xl border bg-white p-4 shadow-xs transition-all ${
                      activeSectionId === sec.id
                        ? 'border-[#02236E] ring-2 ring-[#02236E]/10'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${sec.visible === false ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-slate-400 cursor-grab" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                            <span className="text-sm font-bold text-[#02236E]">{sec.title}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {sec.kind}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {sec.data?.heading || sec.data?.body || 'No content heading set'}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, index - 1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === sections.length - 1}
                          onClick={() => handleMoveSection(index, index + 1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>

                        {/* Visibility Switch */}
                        <AdminPublishSwitch
                          checked={sec.visible !== false}
                          onChange={(checked) => handleToggleSection(sec.id, checked)}
                          label={sec.visible !== false ? 'Visible' : 'Hidden'}
                        />

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateSection(sec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#02236E]"
                          title="Duplicate Section"
                        >
                          <Copy size={14} />
                        </button>

                        {/* Edit Section Content */}
                        <button
                          type="button"
                          onClick={() => setActiveSectionId(activeSectionId === sec.id ? '' : sec.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            activeSectionId === sec.id
                              ? 'bg-[#02236E] text-white'
                              : 'text-slate-400 hover:bg-blue-50 hover:text-[#02236E]'
                          }`}
                          title="Edit Section Content"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete Section */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-[#ed0026]"
                          title="Delete Section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
                  <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                  <div className="font-bold text-slate-700 text-sm">No sections on this page yet</div>
                  <p className="text-xs text-slate-500 mt-1">Click "+ Add Section" to add content blocks from the catalog.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: In-Place Section Content Editor */}
          <div className="lg:col-span-5 sticky top-24">
            {activeSection ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#02236E] m-0">Edit Section Content</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">{activeSection.kind}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSectionId('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Connected Content Database Feed Banner (KingTravel Architecture) */}
                {(['organizations', 'orgs', 'organization'].includes(activeSection.kind) || activeSection.source === 'organizations' || activeSection.source === 'directory') && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                            🏢 Organizations Database Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                          This section automatically queries active verified NGOs and charity organizations from the database table. When organizations are added, updated, or toggled (show/hide) in the Organizations module, they appear in this section automatically.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/OrganizationPage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage Organizations in Sidebar ↗
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Max Display Limit</label>
                        <select
                          value={activeSection.data?.limit || '8'}
                          onChange={(e) => updateSectionData(activeSection.id, 'limit', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white"
                        >
                          <option value="4">4 Organizations</option>
                          <option value="6">6 Organizations</option>
                          <option value="8">8 Organizations</option>
                          <option value="12">12 Organizations</option>
                          <option value="all">All Verified</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Layout Presentation</label>
                        <select
                          value={activeSection.data?.layout || 'grid'}
                          onChange={(e) => updateSectionData(activeSection.id, 'layout', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white"
                        >
                          <option value="grid">Responsive Grid Cards</option>
                          <option value="carousel">Horizontal Carousel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {(['blogs', 'blog', 'blog-grid'].includes(activeSection.kind) || activeSection.source === 'blogs' || activeSection.source === 'listing') && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-blue-800 uppercase tracking-wider">
                            📰 Blogs Database Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                          This section automatically queries published blogs from the database. When a blog is published, updated, or toggled in the Blogs module, it appears in this section automatically.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/BlogPage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage Blogs in Sidebar ↗
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200/80">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 mb-1">Max Display Limit</label>
                        <select
                          value={activeSection.data?.limit || '6'}
                          onChange={(e) => updateSectionData(activeSection.id, 'limit', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-300 bg-white"
                        >
                          <option value="3">3 Recent Posts</option>
                          <option value="6">6 Recent Posts</option>
                          <option value="9">9 Recent Posts</option>
                          <option value="12">12 Recent Posts</option>
                          <option value="all">All Published</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 mb-1">Layout Presentation</label>
                        <select
                          value={activeSection.data?.layout || 'grid'}
                          onChange={(e) => updateSectionData(activeSection.id, 'layout', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-300 bg-white"
                        >
                          <option value="grid">Responsive Grid Cards</option>
                          <option value="carousel">Horizontal Carousel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {(['stories', 'story', 'stories-grid'].includes(activeSection.kind) || activeSection.source === 'stories') && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                            🌟 Success Stories Database Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                          This section automatically queries published community success stories from the database. When an impact story is published or updated in the Success Stories module, it displays automatically here.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/SuccessStories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage Stories in Sidebar ↗
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-amber-200/80">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">Max Display Limit</label>
                        <select
                          value={activeSection.data?.limit || '4'}
                          onChange={(e) => updateSectionData(activeSection.id, 'limit', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white"
                        >
                          <option value="2">2 Stories</option>
                          <option value="3">3 Stories</option>
                          <option value="4">4 Stories</option>
                          <option value="6">6 Stories</option>
                          <option value="all">All Stories</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">Layout Presentation</label>
                        <select
                          value={activeSection.data?.layout || 'grid'}
                          onChange={(e) => updateSectionData(activeSection.id, 'layout', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white"
                        >
                          <option value="grid">Responsive Grid Cards</option>
                          <option value="featured">Featured Lead Card + Grid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {(['podcast-grid', 'podcasts', 'podcast'].includes(activeSection.kind) || activeSection.source === 'episodes' || activeSection.source === 'podcast') && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-purple-800 uppercase tracking-wider">
                            🎙️ Podcast Episodes Database Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                          This section automatically displays published YouTube podcast episodes from the database with click-to-play video modals and SEO detail routes.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/Podcast"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage Podcasts in Sidebar ↗
                      </Link>
                    </div>
                  </div>
                )}

                {(['faq', 'faqs'].includes(activeSection.kind) || activeSection.source === 'faq-list' || activeSection.source === 'faqs') && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-teal-800 uppercase tracking-wider">
                            ❓ FAQs Accordion Database Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-teal-900 mt-1 leading-relaxed">
                          This section queries active FAQs from the database table. When questions and answers are added, edited, or reordered in the FAQs module, they reflect here automatically.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/faqs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage FAQs in Sidebar ↗
                      </Link>
                    </div>
                  </div>
                )}

                {(['carousel', 'sliders', 'slider'].includes(activeSection.kind) || activeSection.source === 'carousel') && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-sky-800 uppercase tracking-wider">
                            🖼️ Homepage Sliders / Hero Carousel Feed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                            Live DB Query
                          </span>
                        </div>
                        <p className="text-xs text-sky-900 mt-1 leading-relaxed">
                          This section displays active hero banner slides from the database. Manage image banners, drag-and-drop ordering, fixed vs slider styles, and links centrally in Homepage Sliders.
                        </p>
                      </div>
                      <Link
                        href="/admin-app/dashboard/crousel-images"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        <ExternalLink size={12} /> Manage Sliders in Sidebar ↗
                      </Link>
                    </div>
                  </div>
                )}

                {/* Section Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Admin Label</label>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => updateSectionField(activeSection.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>

                {/* Heading */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. Empowering Local Communities"
                    value={activeSection.data?.heading || ''}
                    onChange={(e) => updateSectionData(activeSection.id, 'heading', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>

                {/* Subheading / Eyebrow */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subheading / Eyebrow</label>
                  <input
                    type="text"
                    placeholder="e.g. Who We Are"
                    value={activeSection.data?.subheading || ''}
                    onChange={(e) => updateSectionData(activeSection.id, 'subheading', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>

                {/* Body / Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Body Text / Description</label>
                  <textarea
                    rows={4}
                    placeholder="Enter descriptive content..."
                    value={activeSection.data?.body || ''}
                    onChange={(e) => updateSectionData(activeSection.id, 'body', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                  />
                </div>

                {/* Image URL & Alt Text */}
                {activeSection.kind !== 'divider' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Image URL</label>
                        <Link
                          href="/admin-app/dashboard/media"
                          target="_blank"
                          className="text-[11px] font-bold text-[#02236E] hover:underline flex items-center gap-1"
                        >
                          <ImagePlus size={12} /> Media Library
                        </Link>
                      </div>
                      <input
                        type="text"
                        placeholder="/Khudii.webp or media image URL"
                        value={activeSection.data?.image || ''}
                        onChange={(e) => updateSectionData(activeSection.id, 'image', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Image Alt Text</label>
                      <input
                        type="text"
                        placeholder="Accessible description of the image"
                        value={activeSection.data?.imageAlt || ''}
                        onChange={(e) => updateSectionData(activeSection.id, 'imageAlt', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                      />
                    </div>
                  </div>
                )}

                {/* Primary Button */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Learn More"
                      value={activeSection.data?.buttonText || ''}
                      onChange={(e) => updateSectionData(activeSection.id, 'buttonText', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Button Link URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /about-khudii"
                      value={activeSection.data?.buttonUrl || ''}
                      onChange={(e) => updateSectionData(activeSection.id, 'buttonUrl', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Repeatable Items List (Cards, FAQs, Stats, Logos, Videos) */}
                {['cards', 'faq', 'video-grid', 'gallery', 'logos', 'testimonials', 'people', 'stats', 'steps', 'timeline', 'downloads'].includes(
                  activeSection.kind
                ) && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#02236E]">
                        Section Items ({activeSection.data?.items?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItemToSection(activeSection.id)}
                        className="text-xs font-bold text-[#02236E] hover:underline"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {(activeSection.data?.items || []).map((item, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(activeSection.id, i)}
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-[#ed0026]"
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>

                          <input
                            type="text"
                            placeholder={activeSection.kind === 'faq' ? 'Question' : 'Item Title / Metric'}
                            value={item.title || ''}
                            onChange={(e) => handleUpdateItem(activeSection.id, i, 'title', e.target.value)}
                            className="w-full pr-6 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                          <textarea
                            rows={2}
                            placeholder={activeSection.kind === 'faq' ? 'Answer' : 'Item Description'}
                            value={item.description || ''}
                            onChange={(e) => handleUpdateItem(activeSection.id, i, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                          {activeSection.kind !== 'faq' && (
                            <input
                              type="text"
                              placeholder="Link URL or YouTube Video URL"
                              value={item.url || ''}
                              onChange={(e) => handleUpdateItem(activeSection.id, i, 'url', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                <Pencil size={24} className="mx-auto mb-2 text-slate-300" />
                <div className="font-bold text-slate-700 text-xs">No Section Selected</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click the pencil icon on any section to configure its titles, description, images and repeaters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PAGE SETTINGS & HIERARCHY ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-[#02236E] border-b border-slate-100 pb-3 m-0">
            Page Configuration &amp; URL Routing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Page Title <span className="text-[#ed0026]">*</span>
              </label>
              <input
                type="text"
                value={pageInfo.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. About Khudii"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Slug <span className="text-[#ed0026]">*</span>
              </label>
              <input
                type="text"
                value={pageInfo.slug}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({
                    ...p,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-'),
                  }));
                }}
                placeholder="e.g. about-khudii"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Public Path */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Public URL Path <span className="text-[#ed0026]">*</span>
              </label>
              <input
                type="text"
                value={pageInfo.path}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({ ...p, path: e.target.value }));
                }}
                placeholder="e.g. /about-khudii"
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Content Category</label>
              <select
                value={pageInfo.category_id || ''}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({
                    ...p,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-[#02236E]"
              >
                <option value="">None / Top Level Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Page Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Page (Hierarchy)</label>
              <select
                value={pageInfo.parent_page_id || ''}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({
                    ...p,
                    parent_page_id: e.target.value ? Number(e.target.value) : null,
                  }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-[#02236E]"
              >
                <option value="">None / Top Level Page</option>
                {allPages
                  .filter((p) => p.id !== pageInfo.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.path || p.slug})
                    </option>
                  ))}
              </select>
            </div>

            {/* Page Kind */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Page Kind</label>
              <select
                value={pageInfo.page_kind}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({ ...p, page_kind: e.target.value }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-[#02236E]"
              >
                <option value="standard">Standard Content Page</option>
                <option value="landing">Marketing Landing Page</option>
                <option value="template">Dynamic Layout Template</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Sort Order</label>
              <input
                type="number"
                value={pageInfo.sort_order}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({ ...p, sort_order: Number(e.target.value) }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Show in menu toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="show_in_menu"
                checked={pageInfo.show_in_menu}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({ ...p, show_in_menu: e.target.checked }));
                }}
                className="h-4 w-4 accent-[#02236E] rounded"
              />
              <label htmlFor="show_in_menu" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Include in Main Header / Footer Menus
              </label>
            </div>

            {/* Publishing Status Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="status_published"
                checked={pageInfo.status === 'published'}
                onChange={(e) => {
                  setDirty(true);
                  setPageInfo((p) => ({ ...p, status: e.target.checked ? 'published' : 'draft' }));
                }}
                className="h-4 w-4 accent-[#02236E] rounded"
              />
              <label htmlFor="status_published" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Publish Page on Live Website
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SEO & SOCIAL METADATA ================= */}
      {activeTab === 'seo' && (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#02236E] m-0">
                Search Engine Optimization (SEO) &amp; Social Previews
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                Standard metadata and Next-Gen AI engine optimization.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSeoCenterOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-800 transition active:scale-95"
            >
              <Sliders size={14} />
              Open Full SEO Center
            </button>
          </div>

          {/* Google Search Snippet Simulation */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Google Search Snippet Preview
            </div>
            <div className="text-xs text-emerald-800 font-mono truncate">
              https://www.khudii.com{pageInfo.path || `/${pageInfo.slug}`}
            </div>
            <div className="text-base font-bold text-blue-800 hover:underline cursor-pointer truncate">
              {seo.meta_title || pageInfo.title || 'Page Title'} | Khudii
            </div>
            <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {seo.meta_description || 'Pakistan\'s first digital welfare and charity discovery network.'}
            </div>
          </div>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Title</label>
                <span className="text-[11px] text-slate-400">
                  {seo.meta_title.length}/60 chars recommended
                </span>
              </div>
              <input
                type="text"
                placeholder={pageInfo.title || 'Enter SEO title'}
                value={seo.meta_title}
                onChange={(e) => {
                  setDirty(true);
                  setSeo((s) => ({ ...s, meta_title: e.target.value }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Description</label>
                <span className="text-[11px] text-slate-400">
                  {seo.meta_description.length}/160 chars recommended
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Enter rich meta description for search engines..."
                value={seo.meta_description}
                onChange={(e) => {
                  setDirty(true);
                  setSeo((s) => ({ ...s, meta_description: e.target.value }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                placeholder="charity, pakistan, welfare, donate, volunteer"
                value={seo.meta_keywords}
                onChange={(e) => {
                  setDirty(true);
                  setSeo((s) => ({ ...s, meta_keywords: e.target.value }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* OpenGraph Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Social Sharing Image (OG Image)</label>
              <input
                type="text"
                placeholder="/Khudii.webp or external image URL"
                value={seo.og_image}
                onChange={(e) => {
                  setDirty(true);
                  setSeo((s) => ({ ...s, og_image: e.target.value }));
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
              />
            </div>

            {/* Robots Indexing Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.robots_noindex}
                  onChange={(e) => {
                    setDirty(true);
                    setSeo((s) => ({ ...s, robots_noindex: e.target.checked }));
                  }}
                  className="h-4 w-4 accent-[#ed0026] rounded"
                />
                <span className="text-xs font-semibold text-slate-700">No Index (Hide from search)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seo.include_in_sitemap}
                  onChange={(e) => {
                    setDirty(true);
                    setSeo((s) => ({ ...s, include_in_sitemap: e.target.checked }));
                  }}
                  className="h-4 w-4 accent-[#02236E] rounded"
                />
                <span className="text-xs font-semibold text-slate-700">Include in XML Sitemap</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {seoCenterOpen && (
        <SeoCenterModal
          isOpen={seoCenterOpen}
          onClose={() => setSeoCenterOpen(false)}
          pageData={{
            id: pageInfo.id || slugParam || pageInfo.slug,
            slug: pageInfo.slug,
            path: pageInfo.path,
            title: pageInfo.title,
            meta_title: seo.meta_title,
            meta_description: seo.meta_description,
            meta_keywords: seo.meta_keywords,
            canonical_url: seo.canonical_url,
            entityType: 'page',
          }}
          onSaveSuccess={(updated) => {
            if (updated) {
              setSeo((prev) => ({
                ...prev,
                meta_title: updated.meta_title || prev.meta_title,
                meta_description: updated.meta_description || prev.meta_description,
                meta_keywords: updated.meta_keywords || prev.meta_keywords,
                canonical_url: updated.canonical_url || prev.canonical_url,
              }));
            }
            showToast('SEO Center data synchronized!');
          }}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#02236E]" />
        </div>
      }
    >
      <PageEditor />
    </Suspense>
  );
}
