'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  X,
  ArrowUp,
  Loader2
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

const CANONICAL_HEADER_NAV = [
  { id: 'nav-home', label: 'Home', href: '/' },
  { id: 'nav-about', label: 'About', href: '/about-khudii' },
  { id: 'nav-orgs', label: 'Organizations', href: '/organizations' },
  { id: 'nav-golden', label: 'Golden People', href: '/golden-people' },
  {
    id: 'nav-media',
    label: 'Media',
    children: [
      { id: 'nav-media-success', label: 'Success Stories', href: '/success-stories' },
      { id: 'nav-media-social', label: 'Social Media', href: '/social-media' },
      { id: 'nav-media-videos', label: 'Videos', href: '/videos' },
      { id: 'nav-media-testimonials', label: 'Testimonials', href: '/testimonials' },
      { id: 'nav-media-tribute', label: 'Tribute', href: '/tribute' },
      { id: 'nav-media-certifications', label: 'Certifications', href: '/certifications' },
    ],
  },
  {
    id: 'nav-join',
    label: 'Join Us',
    children: [
      { id: 'nav-join-volunteer', label: 'Volunteer', href: '/volunteer' },
      { id: 'nav-join-jobs', label: 'Jobs', href: '/jobs' },
      { id: 'nav-join-registration', label: 'Organization Registration', href: '/organization/registration' },
    ],
  },
  { id: 'nav-contact', label: 'Contact', href: '/contact' },
];

const CANONICAL_FOOTER_LINKS = [
  { id: 'fl-blogs', label: 'Blogs', href: '/blogs' },
  { id: 'fl-faqs', label: 'FAQs', href: '/faqs' },
  { id: 'fl-orgs', label: 'Organizations', href: '/organizations' },
  { id: 'fl-testimonials', label: 'Testimonials', href: '/testimonials' },
  { id: 'fl-contact', label: 'Contact Us', href: '/contact' },
];

const CANONICAL_FOOTER_CATEGORIES = [
  { id: 'fc-health', name: 'Health', href: '/categories/health' },
  { id: 'fc-autism', name: 'Autism', href: '/categories/autism' },
  { id: 'fc-orphanage', name: 'Orphanage', href: '/categories/orphanage' },
  { id: 'fc-thalassemia', name: 'Thalassemia', href: '/categories/thalassemia' },
  { id: 'fc-visually-impaired', name: 'Visually Impaired', href: '/categories/visually-impaired' },
  { id: 'fc-education', name: 'Education', href: '/categories/education' },
  { id: 'fc-differently-abled', name: 'Differently Abled', href: '/categories/differently-abled' },
  { id: 'fc-water-and-food', name: 'Water And Food', href: '/categories/water-and-food' },
];

const CANONICAL_PATH_MAP = {
  home: '/',
  about: '/about-khudii',
  'about us': '/about-khudii',
  organizations: '/organizations',
  'golden people': '/golden-people',
  contact: '/contact',
  'contact us': '/contact',
  blogs: '/blog',
  blog: '/blog',
  faqs: '/faqs',
  faq: '/faqs',
  testimonials: '/testimonials',
  podcast: '/podcast',
  podcasts: '/podcast',
  videos: '/videos',
  'success stories': '/success-stories',
  'social media': '/social-media',
  tribute: '/tribute',
  volunteer: '/volunteer',
  jobs: '/jobs',
  health: '/categories/health',
  autism: '/categories/autism',
  orphanage: '/categories/orphanage',
  thalassemia: '/categories/thalassemia',
  'visually impaired': '/categories/visually-impaired',
  education: '/categories/education',
  'differently abled': '/categories/differently-abled',
  'water and food': '/categories/water-and-food',
};

function resolveLinkHref(item) {
  if (!item) return '#';
  const target = item.href || item.url || item.page_path || '';
  if (target && target !== '#') {
    if (/^(https?:|\/\/|mailto:|tel:|#)/i.test(target)) return target;
    return target.startsWith('/') ? target : `/${target}`;
  }
  const labelKey = String(item.label || item.name || '').trim().toLowerCase();
  if (CANONICAL_PATH_MAP[labelKey]) return CANONICAL_PATH_MAP[labelKey];
  if (labelKey) return `/${labelKey.replace(/[^a-z0-9]+/g, '-')}`;
  return '#';
}

function HeaderNavItem({ item, depth = 0, close = () => { } }) {
  const [open, setOpen] = useState(false);
  const children = Array.isArray(item.children) ? item.children : [];
  const href = item.link_type !== 'group' ? resolveLinkHref(item) : null;
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (children.length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (children.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, 150);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center">
        {href ? (
          <Link
            href={href}
            target={item.open_new_tab ? '_blank' : undefined}
            rel={item.open_new_tab ? 'noopener noreferrer' : undefined}
            onClick={close}
            className="flex items-center gap-1 px-3.5 py-2 text-[15px] font-semibold text-[#02236E] transition-colors hover:text-[#ed0026] focus-visible:ring-2 focus-visible:ring-[#02236E]"
          >
            {item.label}
            {children.length > 0 && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${open ? 'rotate-180 text-[#ed0026]' : 'text-slate-500'}`}
              />
            )}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-center gap-1 px-3.5 py-2 text-[15px] font-semibold text-[#02236E] transition-colors hover:text-[#ed0026]"
          >
            {item.label}
            {children.length > 0 && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${open ? 'rotate-180 text-[#ed0026]' : 'text-slate-500'}`}
              />
            )}
          </button>
        )}
      </div>

      {children.length > 0 && open && (
        <div
          className="absolute left-0 top-full z-50 pt-1"
          role="group"
          aria-label={`${item.label} submenu`}
        >
          <div className="min-w-[210px] rounded-xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150">
            {children.map((c) => (
              <Link
                key={c.id || c.href}
                href={resolveLinkHref(c)}
                target={c.open_new_tab ? '_blank' : undefined}
                rel={c.open_new_tab ? 'noopener noreferrer' : undefined}
                onClick={() => {
                  setOpen(false);
                  close();
                }}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#ed0026]"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const getJson = async (url) => {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw Error(`HTTP ${r.status}`);
  return r.json();
};

const safeSocial = (url) => {
  try {
    const u = new URL(url);
    return ['https:', 'http:'].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};

export function DynamicHeader() {
  const [items, setItems] = useState(CANONICAL_HEADER_NAV);
  const [logo, setLogo] = useState('/Khudii.webp');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeAreaFilter, setActiveAreaFilter] = useState('all');
  const [headerConfig, setHeaderConfig] = useState({
    show_search: true,
    search_placeholder: 'Search Organization',
    search_areas: ['organizations', 'blogs', 'categories', 'stories'],
    show_donate_button: true,
    donate_button_text: 'Donate Now',
    donate_button_url: '/donate-now'
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      getJson(`${API}/cms/v2/navigation?location=header`),
      getJson(`${API}/cms/public-settings`).catch(() => ({})),
      getJson(`${API}/api/header`).catch(() => ({})),
    ])
      .then(([navigation, settings, headerRes]) => {
        if (!active) return;
        if (navigation.success && Array.isArray(navigation.data) && navigation.data.length > 0) {
          setItems(navigation.data);
        }
        if (settings.logo) setLogo(settings.logo);
        if (headerRes?.data) {
          setHeaderConfig(prev => ({ ...prev, ...headerRes.data }));
        } else if (settings?.header) {
          setHeaderConfig(prev => ({ ...prev, ...settings.header }));
        }
      })
      .catch(() => {
        // Fallback to CANONICAL_HEADER_NAV remains active
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const areasParam = Array.isArray(headerConfig.search_areas) && headerConfig.search_areas.length > 0
          ? `&areas=${encodeURIComponent(headerConfig.search_areas.join(','))}`
          : '';
        const r = await fetch(`${API}/getSimilarItem?search=${encodeURIComponent(query)}${areasParam}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        const list = await r.json();
        setResults(Array.isArray(list) ? list : []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, headerConfig.search_areas]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-xs" role="banner">
      <div className="mx-auto flex h-[82px] max-w-[1460px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" aria-label="Khudii home" className="shrink-0">
          <img src={logo} alt="Khudii" className="h-12 w-auto max-w-[170px] object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
          {items.map((item) => (
            <HeaderNavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Right Action Area: Search Box + Donate Now — ALWAYS ON DESKTOP */}
        <div className="kh-header-desktop-actions hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          {/* Rounded Pill Search with Dynamic Custom Multi-Area Filter */}
          {headerConfig.show_search !== false && (
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = query.trim();
                if (trimmed) {
                  const target =
                    activeAreaFilter === 'blogs'
                      ? `/blogs?search=${encodeURIComponent(trimmed)}`
                      : activeAreaFilter === 'categories'
                        ? `/categories?search=${encodeURIComponent(trimmed)}`
                        : activeAreaFilter === 'podcasts'
                          ? `/podcast?search=${encodeURIComponent(trimmed)}`
                          : `/organizations?search=${encodeURIComponent(trimmed)}`;
                  window.location.href = target;
                }
              }}
              className="relative flex w-[170px] lg:w-[210px] xl:w-[250px] items-center gap-2 rounded-full bg-[#f0f2f5] px-3.5 py-2 transition-all focus-within:ring-2 focus-within:ring-[#02236E]/20"
            >
              <Search size={16} className="shrink-0 text-[#ed0026]" />
              <input
                type="search"
                aria-label="Search across Khudii"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={headerConfig.search_placeholder || 'Search Organization'}
                className="w-full bg-transparent text-sm text-[#02236E] placeholder:text-slate-500 outline-none"
              />
              {results.length > 0 && (
                <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 sm:w-96 overflow-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150">
                  {/* Multi-Area Filter Pills */}
                  {Array.from(new Set(results.map((r) => r.type))).length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-100 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setActiveAreaFilter('all')}
                        className={`rounded-full px-2.5 py-1 transition ${activeAreaFilter === 'all'
                          ? 'bg-[#02236E] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        All ({results.length})
                      </button>
                      {Array.from(new Set(results.map((r) => r.type))).map((t) => {
                        const count = results.filter((r) => r.type === t).length;
                        const label = results.find((r) => r.type === t)?.typeLabel || t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setActiveAreaFilter(t)}
                            className={`rounded-full px-2.5 py-1 transition whitespace-nowrap ${activeAreaFilter === t
                              ? 'bg-[#ed0026] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                            {label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Results ({activeAreaFilter === 'all' ? results.length : results.filter((r) => r.type === activeAreaFilter).length})
                  </div>

                  <div className="space-y-1">
                    {(activeAreaFilter === 'all' ? results : results.filter((r) => r.type === activeAreaFilter))
                      .slice(0, 10)
                      .map((item) => (
                        <Link
                          onClick={() => {
                            setQuery('');
                            setResults([]);
                          }}
                          key={item.id}
                          href={item.href || `/${item.slug || ''}`}
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-blue-50/80 group"
                        >
                          <div className="min-w-0 flex-1 truncate">
                            <div className="font-semibold text-[#02236E] group-hover:text-[#02236E] truncate">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-xs text-slate-500 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${item.type === 'organizations'
                              ? 'bg-blue-100 text-[#02236E]'
                              : item.type === 'blogs'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.type === 'categories'
                                  ? 'bg-purple-100 text-purple-800'
                                  : item.type === 'stories'
                                    ? 'bg-amber-100 text-amber-800'
                                    : item.type === 'podcasts'
                                      ? 'bg-red-100 text-[#ed0026]'
                                      : 'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {item.typeLabel || item.type}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Donate Now Button */}
          {headerConfig.show_donate_button !== false && (
            <Link
              href={headerConfig.donate_button_url || '/donate-now'}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#ed0026] px-4 lg:px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#c40019] hover:shadow-md active:scale-95"
            >
              {headerConfig.donate_button_text || 'Donate Now'}
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle — STRICTLY HIDDEN ON DESKTOP */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="kh-mobile-dynamic-nav"
          className="kh-header-mobile-toggle rounded-xl border border-slate-200 p-2.5 text-[#02236E] transition hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {open && (
        <nav
          id="kh-mobile-dynamic-nav"
          aria-label="Mobile navigation"
          className="max-h-[80vh] space-y-3 overflow-y-auto border-t border-slate-200 bg-white p-5 shadow-2xl md:hidden animate-in slide-in-from-top-4 duration-200"
        >
          {/* Mobile Search */}
          {headerConfig.show_search !== false && (
            <div className="flex items-center gap-2 rounded-full bg-[#f0f2f5] px-3.5 py-2.5">
              <Search size={16} className="shrink-0 text-[#ed0026]" />
              <input
                type="search"
                aria-label="Search organizations mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={headerConfig.search_placeholder || 'Search Organization'}
                className="w-full bg-transparent text-sm text-[#02236E] placeholder:text-slate-500 outline-none"
              />
            </div>
          )}
          {results.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {results.slice(0, 6).map((org) => (
                <Link
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setOpen(false);
                  }}
                  key={org.id}
                  href={`/${org.slug || org.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-[#02236E] hover:bg-blue-50"
                >
                  {org.name}
                </Link>
              ))}
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 pt-2">
            {items.map((item) => (
              <div key={item.id} className="border-b border-slate-100 py-1.5 last:border-none">
                {item.children?.length > 0 ? (
                  <div>
                    <span className="block px-2 py-1 text-sm font-bold text-[#02236E]">
                      {item.label}
                    </span>
                    <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-3 pt-1">
                      {item.children.map((c) => (
                        <Link
                          key={c.id || c.href}
                          href={resolveLinkHref(c)}
                          onClick={() => setOpen(false)}
                          className="block py-1 text-sm font-medium text-slate-700 hover:text-[#ed0026]"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={resolveLinkHref(item)}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-1 text-sm font-semibold text-[#02236E] hover:text-[#ed0026]"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {headerConfig.show_donate_button !== false && (
            <Link
              href={headerConfig.donate_button_url || '/donate-now'}
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#ed0026] px-5 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-[#c40019]"
            >
              {headerConfig.donate_button_text || 'Donate Now'}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function DynamicFooter() {
  const [footer, setFooter] = useState({});
  const [telephone, setTelephone] = useState({ phone_number: '(+92) 3198 - KHUDII (548344)' });
  const [links, setLinks] = useState(CANONICAL_FOOTER_LINKS);
  const [categories, setCategories] = useState(CANONICAL_FOOTER_CATEGORIES);
  const [social, setSocial] = useState({
    facebook_url: 'https://www.facebook.com/Khudiioficial/',
    instagram_url: 'https://www.instagram.com/khudiiofficial/',
    whatsapp_url: 'https://api.whatsapp.com/send/?phone=%2B923198548344',
    youtube_url: 'https://www.youtube.com/@khudiiofficial',
    tiktok_url: 'https://www.tiktok.com/@khudiiofficial',
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getJson(`${API}/api/footer`),
      getJson(`${API}/api/telephone`),
      getJson(`${API}/cms/v2/navigation?location=footer`),
      getJson(`${API}/getAllSectors`),
      getJson(`${API}/cms/public-settings`),
    ]).then((results) => {
      if (!active) return;
      const [f, t, n, c, s] = results.map((r) => (r.status === 'fulfilled' ? r.value : {}));
      if (f.success && f.data) setFooter(f.data);
      if (t.success && t.data?.phone_number) setTelephone(t.data);
      if (n.success && Array.isArray(n.data) && n.data.length > 0) {
        const catGroup = n.data.find(
          (i) => i.link_type === 'group' && i.label?.toLowerCase() === 'categories'
        );
        if (catGroup?.children?.length > 0) {
          setCategories(
            catGroup.children.map((c) => ({
              id: c.id,
              name: c.label,
              href: resolveLinkHref(c),
            }))
          );
        } else if (Array.isArray(c.data) && c.data.length > 0) {
          setCategories(
            c.data.slice(0, 8).map((cat) => ({
              id: cat.id || cat.slug,
              name: cat.name,
              href: `/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`,
            }))
          );
        }
        const filteredLinks = n.data
          .filter((i) => i.id !== catGroup?.id && i.parent_id !== catGroup?.id)
          .map((item) => ({
            ...item,
            href: resolveLinkHref(item),
          }));
        if (filteredLinks.length > 0) {
          setLinks(filteredLinks);
        }
      } else if (Array.isArray(c.data) && c.data.length > 0) {
        setCategories(
          c.data.slice(0, 8).map((cat) => ({
            id: cat.id || cat.slug,
            name: cat.name,
            href: `/${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`,
          }))
        );
      }
      if (s.social) {
        setSocial((prev) => ({ ...prev, ...s.social }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const defaultQuote =
    "It is a dream that encompasses entire humanity within its scope. A dream that doesn't discriminate between color, caste, creed, nationality, status or any other identity marker.";

  const rawFooterText = footer.footertext
    ? String(footer.footertext).replace(/<[^>]*>/g, '').trim()
    : defaultQuote;

  const phoneDisplay = telephone.phone_number || '(+92) 3198 - KHUDII (548344)';
  const phoneClean = String(phoneDisplay).replace(/[^+0-9]/g, '');

  const socials = [
    { label: 'Facebook', key: 'facebook_url', icon: 'fa-facebook-f' },
    { label: 'Instagram', key: 'instagram_url', icon: 'fa-instagram' },
    { label: 'WhatsApp', key: 'whatsapp_url', icon: 'fa-whatsapp' },
    { label: 'YouTube', key: 'youtube_url', icon: 'fa-youtube' },
    { label: 'TikTok', key: 'tiktok_url', icon: 'fa-tiktok' },
  ].filter(({ key }) => safeSocial(social[key]));

  return (
    <footer className="border-t border-slate-200 bg-white text-[#02236E]" role="contentinfo">
      {/* Top 3-Column Area */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 sm:gap-8 md:gap-12 px-4 py-5 sm:py-8 md:grid-cols-[1.6fr_0.8fr_1fr]">
        {/* Column 1: Brand & Contact Info */}
        <section className="space-y-3 sm:space-y-4">
          <Link href="/" aria-label="Khudii home">
            {footer.logoimage ? (
              <img
                src={footer.logoimage}
                alt="Khudii Welfare Organization"
                className="max-h-12 sm:max-h-16 w-auto max-w-[170px] sm:max-w-[200px] object-contain mb-2 sm:mb-4"
              />
            ) : (
              <img
                src="/Khudii.webp"
                alt="Khudii Welfare Organization"
                className="max-h-12 sm:max-h-16 w-auto max-w-[170px] sm:max-w-[200px] object-contain mb-2 sm:mb-4"
              />
            )}
          </Link>

          {/* Quote Card with red accent border on left */}
          <div className="rounded-lg border-l-4 border-[#ed0026] bg-[#eaedf2] p-3 sm:p-4 text-xs sm:text-sm md:text-base leading-relaxed text-[#02236E] shadow-xs mb-3 sm:mb-4">
            {rawFooterText}
          </div>

          {/* Contact Details with red icons */}
          <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-base md:text-lg font-semibold text-[#02236E]">
            <li>
              <a
                href={`tel:${phoneClean}`}
                className="inline-flex items-center gap-2.5 sm:gap-3 transition-colors hover:text-[#ed0026]"
              >
                <Phone size={15} className="shrink-0 text-[#ed0026] sm:h-4 sm:w-4" />
                <span>{phoneDisplay}</span>
              </a>
            </li>
            <li>
              {footer.location ? (
                <a
                  href={footer.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 sm:gap-3 transition-colors hover:text-[#ed0026]"
                >
                  <MapPin size={15} className="shrink-0 text-[#ed0026] sm:h-4 sm:w-4" />
                  <span>{footer.locationinfo || 'Lahore, Pakistan'}</span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-2.5 sm:gap-3">
                  <MapPin size={15} className="shrink-0 text-[#ed0026] sm:h-4 sm:w-4" />
                  <span>{footer.locationinfo || 'Lahore, Pakistan'}</span>
                </div>
              )}
            </li>
            <li>
              <a
                href={`mailto:${footer.email || 'info@khudii.com'}`}
                className="inline-flex items-center gap-2.5 sm:gap-3 transition-colors hover:text-[#ed0026]"
              >
                <Mail size={15} className="shrink-0 text-[#ed0026] sm:h-4 sm:w-4" />
                <span>{footer.email || 'info@khudii.com'}</span>
              </a>
            </li>
          </ul>
        </section>

        {/* Column 2 & 3: LINKS and CATEGORIES side-by-side on mobile <= 480px */}
        <div className="grid grid-cols-2 gap-4 max-[480px]:gap-3 md:contents">
          {/* Column 2: LINKS with red concentric circle target icons */}
          <nav aria-label="Footer quick links">
            <h3 className="flex text-base sm:text-lg font-semibold uppercase tracking-wider text-[#02236E]">LINKS</h3>
            <div className="mt-1.5 mb-3 sm:mb-6 h-1 w-8 rounded-full bg-[#02236E]" />
            <ul className="space-y-2 sm:space-y-3.5">
              {links.map((item) => (
                <li key={item.id} className="text-xs sm:text-sm font-semibold text-slate-700">
                  <Link
                    href={item.href || '#'}
                    target={item.open_new_tab ? '_blank' : undefined}
                    rel={item.open_new_tab ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center transition-colors hover:text-[#ed0026]"
                  >
                    {/* Concentric red target bullet */}
                    <span className="mr-2 sm:mr-3 inline-flex h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-[#ed0026]">
                      <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-[#ed0026] group-hover:scale-125 transition-transform" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: CATEGORIES with red concentric circle target icons */}
          <nav aria-label="Footer categories">
            <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wider text-[#02236E]">CATEGORIES</h3>
            <div className="mt-1.5 mb-3 sm:mb-6 h-1 w-8 rounded-full bg-[#02236E]" />
            <ul className="space-y-2 sm:space-y-3.5">
              {categories.map((cat) => (
                <li key={cat.id} className="text-xs sm:text-sm font-semibold text-slate-700">
                  <Link
                    href={cat.href || '#'}
                    className="group inline-flex items-center transition-colors hover:text-[#ed0026]"
                  >
                    {/* Concentric red target bullet */}
                    <span className="mr-2 sm:mr-3 inline-flex h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-[#ed0026]">
                      <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-[#ed0026] group-hover:scale-125 transition-transform" />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Floating Ask Khudii 24/7 Support Widget (as in Image 2) */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="/contact"
          className="flex items-center gap-2.5 rounded-2xl bg-[#009dc8] px-4 py-2.5 text-white shadow-2xl transition-all hover:bg-[#0089ae] hover:scale-105"
        >
          <div className="relative flex h-6 w-6 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-bold tracking-wide">Ask Khudii</div>
            <div className="text-[10px] font-medium text-white/90">24/7 Support</div>
          </div>
        </a>
      </div>

      {/* Bottom Bar: Copyright & Socials */}
      <div className="bg-[#02236E] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
          <p className="text-sm font-medium text-white/90 m-0">
            ©2025 Copyright <strong className="text-[#ed0026]">Khudii</strong>. All Rights Reserved. Powered By{' '}
            <a
              href="https://www.dks.com.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#ed0026] hover:underline"
            >
              DKS
            </a>
          </p>

          {/* Social Icons with circular badges */}
          <div className="flex items-center gap-2.5">
            {socials.map(({ label, key, icon }) => (
              <a
                key={key}
                href={safeSocial(social[key])}
                title={label}
                aria-label={`Visit Khudii on ${label}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm text-white transition-all hover:bg-white/20 hover:scale-110"
              >
                <i className={`fa-brands ${icon}`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
