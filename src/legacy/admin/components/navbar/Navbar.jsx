'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { confirmDialog, showSuccess, showError } from '@/lib/dialogs';
import { CMS_PAGES } from '@/lib/cms-registry';
import { useAdminAuth } from '@/lib/admin-auth';
import {
  Activity, BarChart3, BellRing, BookOpen, Building2, ChevronDown,
  CircleHelp, ClipboardList, Contact, FileText, HeartHandshake,
  Image, Inbox, LayoutDashboard, LogOut, MessageCircle, Newspaper, Plus,
  Search, Settings, ShieldCheck, UserRound, Users, Video, Wallet, X,
  Layers, BadgeCheck, Target, Images, HandHeart, Menu, Globe,
} from 'lucide-react';

const BASE = '/admin-app/dashboard';
const APIPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
export const ADMIN_GROUPS = [
  { name: 'Dashboard', links: [['Overview', '', LayoutDashboard]] },
  { name: 'Content Management', links: [['Pages', 'pages', Layers], ['Organizations', 'OrganizationPage', Building2], ['Blogs', 'BlogPage', BookOpen], ['Success Stories', 'SuccessStories', HandHeart], ['Podcasts', 'Podcast', Video], ['Media Library', 'media', Image], ['FAQs', 'faqs', CircleHelp]] },
  { name: 'Site Management', links: [['Form Enquiries', 'form-enquiries', Inbox], ['SEO Center', 'seo-center', BarChart3], ['Redirects & 404', 'redirects', ShieldCheck]] },
  { name: 'Administration', links: [['Activity Logs', 'activity-logs', Activity], ['Backend Logs', 'backend-logs', ClipboardList], ['Settings', 'settings', Settings]] },
];
export const ADMIN_PAGES = ADMIN_GROUPS.flatMap((group) => group.links.map(([label, slug, Icon]) => ({
  label, slug, Icon, href: slug ? `${BASE}/${slug}` : BASE, group: group.name,
})));

export default function Sidebar({ mobileOpen = false, onClose = () => { } }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { auth, user, resetUser } = useAdminAuth();
  const [filter, setFilter] = useState('');
  const [closedGroups, setClosedGroups] = useState({});
  const [siteLogo, setSiteLogo] = useState('');
  const [siteName, setSiteName] = useState('KHUDII');

  useEffect(() => {
    try {
      const cachedLogo = localStorage.getItem('khudii_site_logo');
      if (cachedLogo) setSiteLogo(cachedLogo);
      const cachedName = localStorage.getItem('khudii_site_name');
      if (cachedName) setSiteName(cachedName);
    } catch { }

    const fetchBranding = () => {
      axios.get(`${APIPath}/cms/public-settings`).then((res) => {
        const logo = res.data?.logo || res.data?.site_identity?.siteLogo;
        const name = res.data?.site_name || res.data?.site_identity?.siteName;
        if (logo) {
          setSiteLogo(logo);
          try { localStorage.setItem('khudii_site_logo', logo); } catch { }
        }
        if (name) {
          setSiteName(name);
          try { localStorage.setItem('khudii_site_name', name); } catch { }
        }
      }).catch(() => { });
    };

    fetchBranding();

    const handleBrandingUpdate = (e) => {
      if (e?.detail) {
        if (e.detail.logo) {
          setSiteLogo(e.detail.logo);
          try { localStorage.setItem('khudii_site_logo', e.detail.logo); } catch { }
        }
        if (e.detail.siteName) {
          setSiteName(e.detail.siteName);
          try { localStorage.setItem('khudii_site_name', e.detail.siteName); } catch { }
        }
      } else {
        fetchBranding();
      }
    };

    window.addEventListener('khudii:branding-updated', handleBrandingUpdate);
    return () => window.removeEventListener('khudii:branding-updated', handleBrandingUpdate);
  }, []);

  const groups = useMemo(() => ADMIN_GROUPS.map((group) => ({
    ...group,
    pages: ADMIN_PAGES.filter((p) => p.group === group.name && p.label.toLowerCase().includes(filter.toLowerCase().trim())),
  })).filter((g) => g.pages.length), [filter]);

  async function logout() {
    const confirmed = await confirmDialog({
      title: 'Sign out of Khudii?',
      text: 'End your administrator session?',
      status: 'warning',
      confirmText: 'Sign out',
    });
    if (!confirmed) return;
    try {
      await axios.post(`${APIPath}/auth/logout`, {}, { withCredentials: true });
      resetUser();
      await showSuccess('Signed out', 'You have been securely signed out.');
      router.replace('/letskhudii');
    } catch {
      await showError('Sign out failed', 'Please try again.');
    }
  }

  if (!auth) return null;
  return (
    <aside
      className="kh-side flex h-full w-[240px] flex-col text-[#02236E] max-lg:w-[240px]"
    >
      <div
        className="kh-side-brand flex h-[76px] shrink-0 items-center gap-3 px-5 border-b border-white/10"
      >
        <Link
          href={BASE}
          onClick={onClose}
          title={`${siteName} Dashboard`}
          className="kh-brand-mark grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xl font-bold text-[#02236E] shadow-md transition-transform hover:scale-105 overflow-hidden"
        >
          {siteLogo ? (
            <img
              src={siteLogo}
              alt="Site Logo"
              className="h-full w-full object-contain p-1 rounded-2xl"
            />
          ) : (
            (siteName?.[0] || 'K').toUpperCase()
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-extrabold tracking-[.08em]">{siteName}</div>
          <div className="text-[9px] uppercase tracking-[.15em] text-slate-400">Admin portal</div>
        </div>
        <button
          type="button"
          className="cursor-pointer ml-auto rounded-lg p-2 text-[#02236E] hover:bg-blue/20 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 pt-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200" />
          <input
            aria-label="Search admin pages"
            type="search"
            value={filter ?? ''}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search menu..."
            className="kh-menu-search w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-blue-100/70 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      <nav
        className="kh-side-nav min-h-0 flex-1 overflow-y-auto px-3 py-5"
        aria-label="Admin navigation"
      >
        {groups.map((group) => (
          <div key={group.name} className="mb-5">
            <button
              type="button"
              onClick={() => setClosedGroups((s) => ({ ...s, [group.name]: !s[group.name] }))}
              className="mb-2 flex w-full items-center justify-between px-3 text-left text-[10px] font-extrabold uppercase tracking-[.16em] text-blue-200/65"
            >
              {group.name}
              <ChevronDown
                size={13}
                className={`transition-transform ${closedGroups[group.name] ? '-rotate-90' : ''}`}
              />
            </button>
            {!closedGroups[group.name] && (
              <div className="space-y-1">
                {group.pages.map(({ href, label, Icon }) => {
                  const target = href.split('?')[0];
                  const active =
                    (pathname === target &&
                      (!href.includes('?') ||
                        (typeof window !== 'undefined' &&
                          window.location.search === '?' + href.split('?')[1]))) ||
                    (!href.includes('?') && target !== BASE && pathname.startsWith(`${target}/`));
                  return (
                    <Link
                      href={href}
                      onClick={onClose}
                      key={href}
                      aria-current={active ? 'page' : undefined}
                      className={`kh-side-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                        active
                          ? 'kh-side-active'
                          : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon
                        size={17}
                        className="shrink-0"
                        strokeWidth={active ? 2.4 : 1.9}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href={`${BASE}/Profile`}
          onClick={onClose}
          title={user?.email || 'My profile'}
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/10"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
            <UserRound size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold">{user?.email || 'Administrator'}</span>
            <span className="block text-[10px] text-blue-100/70">My profile</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer mt-2 flex w-full items-center gap-3 rounded-xl bg-[#e7001e] px-3 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-[#e7001e]/70"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
