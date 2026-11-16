'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { confirmDialog, showSuccess, showError } from '@/lib/dialogs';
import { CMS_PAGES } from '@/lib/cms-registry';
import { useAdminAuth } from '@/lib/admin-auth';
import {
  Activity, BarChart3, BellRing, BookOpen, Building2, ChevronDown, ChevronsLeft,
  ChevronsRight, CircleHelp, ClipboardList, Contact, FileText, HeartHandshake,
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
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('');
  const [closedGroups, setClosedGroups] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('khudii_sidebar_collapsed');
      if (stored !== null) setCollapsed(stored === 'true');
    } catch { }
  }, []);

  const toggleCollapsed = (nextVal) => {
    setCollapsed((prev) => {
      const next = typeof nextVal === 'boolean' ? nextVal : !prev;
      try {
        localStorage.setItem('khudii_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

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
      className={`kh-side flex h-full flex-col text-[#02236E] transition-[width] duration-200 ${collapsed ? 'w-[72px] kh-side-collapsed' : 'w-[240px]'
        } max-lg:w-[240px]`}
    >
      <div
        className={`kh-side-brand flex h-[76px] shrink-0 items-center border-b border-white/10 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'
          }`}
      >
        <Link
          href={BASE}
          onClick={onClose}
          title="Khudii Dashboard"
          className="kh-brand-mark grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xl font-black text-[#02236E] shadow-md transition-transform hover:scale-105"
        >
          K
        </Link>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold tracking-[.08em]">KHUDII</div><div className="text-[9px] uppercase tracking-[.15em] text-slate-400">Admin portal</div>
          </div>
        )}
        <button
          type="button"
          className="cursor-pointer ml-auto rounded-lg p-2 text-[#02236E] hover:bg-blue/20 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        {!collapsed && (
          <button
            type="button"
            className="cursor-pointer ml-auto hidden rounded-lg p-2 text-[#02236E] hover:bg-blue/20 lg:block"
            onClick={() => toggleCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft size={18} />
          </button>
        )}
      </div>

      {!collapsed && (
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
      )}

      <nav
        className={`kh-side-nav min-h-0 flex-1 overflow-y-auto ${collapsed ? 'px-2 py-3' : 'px-3 py-5'
          }`}
        aria-label="Admin navigation"
      >
        {collapsed && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={() => toggleCollapsed(false)}
              className="hidden lg:grid h-9 w-9 place-items-center rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        )}

        {groups.map((group, groupIdx) => (
          <div key={group.name} className={collapsed ? 'flex flex-col items-center' : 'mb-5'}>
            {collapsed && groupIdx > 0 && (
              <div className="my-2 h-px w-8 bg-white/10" aria-hidden="true" />
            )}
            {!collapsed && (
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
            )}
            {(!closedGroups[group.name] || collapsed) && (
              <div className={collapsed ? 'flex flex-col items-center gap-1.5 w-full' : 'space-y-1'}>
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
                      title={collapsed ? label : undefined}
                      onClick={onClose}
                      key={href}
                      aria-current={active ? 'page' : undefined}
                      className={`kh-side-link group flex items-center transition-all ${collapsed
                        ? 'h-11 w-11 justify-center rounded-2xl'
                        : 'gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold'
                        } ${active
                          ? 'kh-side-active'
                          : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <Icon
                        size={collapsed ? 19 : 17}
                        className="shrink-0"
                        strokeWidth={active ? 2.4 : 1.9}
                      />
                      {(!collapsed || mobileOpen) && <span className="truncate">{label}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div
        className={`border-t border-white/10 ${collapsed ? 'py-3 px-2 flex flex-col items-center gap-2' : 'p-3'
          }`}
      >
        <Link
          href={`${BASE}/Profile`}
          onClick={onClose}
          title={collapsed ? (user?.email || 'My profile') : undefined}
          className={`flex items-center rounded-xl transition hover:bg-white/10 ${collapsed ? 'h-11 w-11 justify-center' : 'gap-3 px-3 py-3'
            }`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
            <UserRound size={17} />
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{user?.email || 'Administrator'}</span>
              <span className="block text-[10px] text-blue-100/70">My profile</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={`cursor-pointer flex items-center rounded-xl text-white transition bg-[#e7001e] hover:bg-[#e7001e]/70 ${collapsed ? 'h-11 w-11 justify-center' : 'mt-2 w-full gap-3 px-3 py-2.5 text-left text-xs font-semibold'
            }`}
        >
          <LogOut size={17} />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
