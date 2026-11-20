'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  Bell,
  ChevronRight,
  ChevronDown,
  Command,
  ExternalLink,
  Globe2,
  Menu,
  Search,
  X,
  CheckCircle2,
  Settings,
  Activity,
  Layers,
  LogOut,
  Clock,
  Users,
} from 'lucide-react';
import Sidebar, { ADMIN_PAGES } from '@/legacy/admin/components/navbar/Navbar';
import KhudiiAnalyticsTracker from './KhudiiAnalyticsTracker';
import AdminPresencePing from '@/components/admin/AdminPresencePing';
import AdminClickAudit from '@/components/admin/AdminClickAudit';
import SessionTimer from '@/components/admin/SessionTimer';
import UserPresenceWidget from '@/components/admin/UserPresenceWidget';
import { useAdminAuth } from '@/lib/admin-auth';
import { alertNotice, confirmDiscard } from '@/lib/dialogs';
import { SaveButton, DiscardButton } from '@/components/ui/AppButton';

const HOME = '/admin-app/dashboard';
export default function AdminDashboardShell({ children }) {
  const pathname = usePathname() || HOME;
  const router = useRouter();
  const { user, resetUser } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const rawName = user?.name && user.name !== 'null' ? String(user.name).trim() : '';
  const userName = rawName || (user?.email?.toLowerCase().includes('dks') ? 'DKS' : (user?.email?.toLowerCase().includes('khudii') ? 'Khudii Admin' : (user?.email ? user.email.split('@')[0] : 'DKS')));
  const userRole = (user?.role || 'Super Admin').replace(/_/g, ' ');
  const userInitial = String(userName || user?.email || 'K').trim().charAt(0).toUpperCase() || 'K';
  const userBadgeBg = user?.badge_bg || '#02236E';
  const userBadgeTextColor = user?.badge_text_color || '#ffffff';
  const userEmail = user?.email || 'admin@khudii.com';

  const current = ADMIN_PAGES.find((page) => { const route = page.href.split('?')[0]; return pathname === route || (route !== HOME && pathname.startsWith(`${route}/`)); }) || ADMIN_PAGES[0];
  const results = useMemo(() => ADMIN_PAGES.filter((page) => `${page.label} ${page.group}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 10), [query]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
    setDirty(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_login_time');
      }
      await axios.post('/api-app/auth/logout', {}, { withCredentials: true });
    } catch {
      // ignore
    } finally {
      if (resetUser) resetUser();
      window.location.assign('/letskhudii');
    }
  };
  useEffect(() => {
    const onDirty = e => setDirty(Boolean(e.detail?.dirty));
    window.addEventListener('khudii:dirty', onDirty);
    const interceptor = axios.interceptors.response.use(response => {
      const method = (response.config?.method || 'get').toLowerCase();
      if (['put', 'patch', 'post', 'delete'].includes(method) && !/authlogin|admin\/analytics\/event|api\/analytics\/event|admin\/user-presence|admin\/activity\/click|traffic\/404/.test(String(response.config?.url || ''))) setDirty(false);
      return response;
    }, error => Promise.reject(error));
    return () => { window.removeEventListener('khudii:dirty', onDirty); axios.interceptors.response.eject(interceptor); };
  }, []);
  useEffect(() => { const handler = e => { if (dirty) { e.preventDefault(); e.returnValue = 'Save your changes first.'; } }; window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler) }, [dirty]);
  const savePending = (event) => {
    if (event?.defaultPrevented) return;
    const saveEvent = new CustomEvent('khudii:save-request', { cancelable: true });
    window.dispatchEvent(saveEvent);
    if (saveEvent.defaultPrevented) return;

    // 1. Check for open modal form first
    const modalForm = document.querySelector('[role="dialog"] form, .kh-v2-editor form, #khudii-user-modal-form');
    if (modalForm) {
      const submitBtn = modalForm.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
        return;
      }
      modalForm.requestSubmit();
      return;
    }

    // 2. Check visible form in main-content
    const forms = [...document.querySelectorAll('#main-content form')].filter(
      (f) => f.getClientRects().length && !f.closest('[aria-hidden="true"]')
    );
    const form = forms.find((f) => f.querySelector('button[type="submit"], input[type="submit"]'));
    if (form) {
      form.requestSubmit();
      return;
    }

    // 3. Match save/update/apply/submit buttons with flexible text matching
    const controls = [...document.querySelectorAll('#main-content button, [role="dialog"] button')];
    const saveButton = controls.find((button) => {
      if (!button.getClientRects().length || button.disabled) return false;
      const rawText = button.textContent || '';
      const text = rawText
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .trim()
        .toLowerCase();
      return (
        /^(save|update|apply|submit)(\s+(changes|page|section|settings|order|user|blog|organization|story|faq|data|profile|metadata))?$/i.test(text) ||
        text === 'save' ||
        text === 'update' ||
        text === 'save changes' ||
        text === 'update page' ||
        text === 'save user' ||
        text === 'create user'
      );
    });
    if (saveButton) {
      saveButton.click();
      return;
    }

    alertNotice({
      title: 'No save action available',
      text: 'This editor does not expose a Save action. Use its dedicated Create or Update button, or discard the changes.',
      status: 'warning',
    });
  };

  const discardPending = async () => {
    if (await confirmDiscard()) {
      window.dispatchEvent(new CustomEvent('khudii:discard-request'));
      setDirty(false);
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      window.location.reload();
    }
  };
  const blockNavigation = () => alertNotice({ title: 'Unsaved changes', text: 'Apply your changes before opening another admin page, or discard the edits from the current page.', status: 'error' });
  const guardedNavigate = href => { if (dirty) { blockNavigation(); return; } router.push(href); };
  const captureNavigation = e => {
    if (!dirty) return; const a = e.target.closest?.('a[href]'); if (!a) return;
    const target = new URL(a.href, window.location.href); if (target.origin === window.location.origin && target.pathname.startsWith('/admin-app/dashboard') && target.pathname + target.search !== window.location.pathname + window.location.search) { e.preventDefault(); e.stopPropagation(); blockNavigation(); }
  };
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  return <div onClickCapture={captureNavigation} className="kh-admin flex min-h-screen bg-[#f4f7fc] text-[#02236E]">
    {mobileOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#071333]/65 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /></div>
    <div className="min-w-0 flex-1">
      <header className="kh-topbar sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-[#e6ebf3] bg-white/95 px-4 backdrop-blur-md md:px-7">
        {/* Left Side: Mobile Menu + Page Context & System Online Active Badge */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2.5 lg:hidden cursor-pointer hover:bg-slate-50"
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="truncate text-base font-bold text-[#0b1936] sm:text-xl m-0">
              {current.label}
            </h1>
            <span className="text-slate-400 text-xs hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </span>
          </div>
        </div>

        {/* Center: 8-Hour Session Countdown Timer & Team Presence */}
        <div className="hidden md:flex items-center justify-center gap-1.5 lg:gap-3">
          <SessionTimer loginTime={user?.loginTime} />
          <UserPresenceWidget currentUser={user} />
        </div>

        {/* Right Side: Actions & Profile Menu */}
        <div className="flex items-center gap-2 md:gap-2.5 ml-auto shrink-0">
          {/* Quick Search Pages Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8faff] px-3 py-1.5 text-xs text-slate-500 hover:border-[#02236E]/30 hover:text-[#02236E] transition cursor-pointer"
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px]">Ctrl K</kbd>
          </button>

          {/* Home Page / Live Site Button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open public Khudii site"
            title="Open public live site"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02236E] bg-white border border-slate-300 hover:border-[#02236E] hover:bg-[#02236E] hover:text-white rounded-full px-3.5 py-1.5 transition-all shadow-xs group"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Site</span>
            <span className="text-[10px] opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </a>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <span className="text-xs font-bold text-[#02236E] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#02236E]" /> Notifications
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    All Clear
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Database &amp; Local Storage Active</div>
                      <div className="text-[10px] text-slate-500">Live storage operational</div>
                    </div>
                  </div>
                  <Link
                    href={`${HOME}/form-enquiries`}
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-2 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-50 text-xs font-semibold text-[#02236E] text-center"
                  >
                    View Form Enquiries &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer border border-slate-200 bg-white shadow-xs"
              title="Admin user profile menu"
            >
              <div className="relative shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs border border-white/30"
                  style={{ backgroundColor: userBadgeBg, color: userBadgeTextColor }}
                >
                  {userInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-[#02236E] leading-tight max-w-[100px] truncate">{userName}</div>
                <div className="text-[9px] font-semibold text-slate-500 capitalize max-w-[100px] truncate">{userRole}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Admin Profile Dropdown Flyout Card */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Banner */}
                <div
                  className="p-4 text-white border-b border-white/10"
                  style={{ background: `linear-gradient(135deg, ${userBadgeBg}, #071840)` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base shrink-0 shadow-inner border border-white/30"
                      style={{ backgroundColor: userBadgeBg, color: userBadgeTextColor }}
                    >
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate text-white">{userName}</div>
                      <div className="text-[10px] text-white/80 font-medium truncate">{userEmail}</div>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-md">
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Action Buttons / Links as requested: "User dropdown card manage all 3 buttons" */}
                <div className="p-2 space-y-1">
                  <Link
                    href="/admin-app/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#02236E] hover:bg-blue-50 transition-colors no-underline"
                  >
                    <Settings className="w-4 h-4 text-[#02236E]" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/admin-app/dashboard/activity-logs"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#02236E] hover:bg-blue-50 transition-colors no-underline"
                  >
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Activity Audit Logs</span>
                  </Link>

                  <Link
                    href="/admin-app/dashboard/pages"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#02236E] hover:bg-blue-50 transition-colors no-underline"
                  >
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Page Builder</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Red Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer border border-red-500/30 shadow-xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-white" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>
      {/* Mobile Session & Presence bar */}
      <div className="flex md:hidden items-center justify-between gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <SessionTimer loginTime={user?.loginTime} />
        <UserPresenceWidget currentUser={user} />
      </div>
      <KhudiiAnalyticsTracker surface="backend" />
      <AdminPresencePing />
      <AdminClickAudit />
      <main onInputCapture={e => { const el = e.target; if (el.closest?.('form') && !['search', 'file', 'hidden'].includes(el.type)) setDirty(true); }} onChangeCapture={e => { const el = e.target; if (el.closest?.('form') && (el instanceof HTMLSelectElement || el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type))) setDirty(true); }} className="kh-main mx-auto w-full max-w-[1760px] p-4 pb-12 md:p-7 lg:p-9" id="main-content">
        {dirty && (
          <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm animate-in fade-in duration-150">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes. Save before switching pages.
            </span>
            <div className="flex items-center gap-2">
              <SaveButton onClick={savePending}>Save changes</SaveButton>
              <DiscardButton onClick={discardPending}>Discard</DiscardButton>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
    {searchOpen && <div className="fixed inset-0 z-[90] flex items-start justify-center bg-[#071333]/60 px-3 pt-[12vh]" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}><div role="dialog" aria-modal="true" aria-label="Search admin pages" className="w-full max-w-[580px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><Search size={19} className="text-[#02236E]" /><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) guardedNavigate(results[0].href); }} placeholder="Find a page or setting..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={18} /></button></div><div className="max-h-[50vh] overflow-y-auto p-2">{results.length ? results.map(({ href, label, group, Icon }) => <button key={href} type="button" onClick={() => { setSearchOpen(false); guardedNavigate(href); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-blue-50"><Icon size={18} className="text-[#02236E]" /><span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">{label}</span><span className="hidden text-xs text-slate-400 sm:inline">{group}</span><ExternalLink size={14} className="text-slate-300" /></button>) : <div className="p-8 text-center text-sm text-slate-500">No matching admin pages.</div>}</div><div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Press Enter to open the first result</div></div></div>}
  </div>;
}
