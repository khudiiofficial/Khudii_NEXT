'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Bell, ChevronRight, Command, ExternalLink, Globe2, Menu, Search, X } from 'lucide-react';
import Sidebar, { ADMIN_PAGES } from '@/legacy/admin/components/navbar/Navbar';
import KhudiiAnalyticsTracker from './KhudiiAnalyticsTracker';
import AdminPresencePing from '@/components/admin/AdminPresencePing';
import AdminClickAudit from '@/components/admin/AdminClickAudit';
import { useAdminAuth } from '@/lib/admin-auth';
import { alertNotice, confirmDiscard } from '@/lib/dialogs';
import { SaveButton, DiscardButton } from '@/components/ui/AppButton';

const HOME = '/admin-app/dashboard';
export default function AdminDashboardShell({ children }) {
  const pathname = usePathname() || HOME;
  const router = useRouter();
  const { user } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const searchRef = useRef(null);
  const userInitial = String(user?.name || user?.email || 'K').trim().charAt(0).toUpperCase() || 'K';
  const current = ADMIN_PAGES.find((page) => { const route = page.href.split('?')[0]; return pathname === route || (route !== HOME && pathname.startsWith(`${route}/`)); }) || ADMIN_PAGES[0];
  const results = useMemo(() => ADMIN_PAGES.filter((page) => `${page.label} ${page.group}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 10), [query]);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setDirty(false); }, [pathname]);
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
      <header className="kh-topbar sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-[#e6ebf3] bg-white/95 px-4 backdrop-blur-md md:px-8">
        <div className="flex min-w-0 items-center gap-3 md:gap-4"><button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2.5 lg:hidden" aria-label="Open navigation"><Menu size={19} /></button><div className="min-w-0"><div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex"><Link href={HOME} className="hover:text-[#02236E]">Workspace</Link><ChevronRight size={13} /><span>{current.group}</span></div><div className="truncate text-base font-extrabold text-[#0b1936] sm:text-xl">{current.label}</div></div></div>
        <div className="flex items-center gap-2 md:gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Open public Khudii site" title="Open public site" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 lg:inline-flex"><Globe2 size={15} /> Live Site <ExternalLink size={13} /></a>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8faff] px-3 py-2.5 text-sm text-slate-500 hover:border-[#02236E]/30 hover:text-[#02236E] sm:min-w-[190px]"><Search size={17} /><span className="hidden sm:inline">Search pages</span><kbd className="ml-auto hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] md:block">Ctrl K</kbd></button>
          <Link href={`${HOME}/form-enquiries`} aria-label="View form enquiries" title="Form enquiries" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:text-[#02236E]"><Bell size={17} /></Link>
          <Link
            href={`${HOME}/Profile`}
            className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold shadow-xs"
            style={{
              backgroundColor: user?.badge_bg || '#02236E',
              color: user?.badge_text_color || '#ffffff',
            }}
            title={user?.name ? `${user.name} (${user.email || ''})` : 'My profile'}
          >
            {userInitial}
          </Link>
        </div>
      </header>
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
