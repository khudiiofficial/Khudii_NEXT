'use client';

import { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'khudii_cookie_consent_v2';

export function readCookieConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      tracking: Boolean(parsed.tracking),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return null;
  }
}

function applyGtagConsent(prefs) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('consent', 'update', {
    analytics_storage: prefs.tracking ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
  });
}

export default function ConsentManager() {
  const [open, setOpen] = useState(false);
  const [hasSaved, setHasSaved] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    if (existing) {
      setTracking(existing.tracking);
      setMarketing(existing.marketing);
      setHasSaved(true);
      applyGtagConsent(existing);
    } else {
      setHasSaved(false);
    }

    const onOpen = () => setOpen(true);
    window.addEventListener('khudii:open-cookie-preferences', onOpen);
    return () => window.removeEventListener('khudii:open-cookie-preferences', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const persist = (nextTracking, nextMarketing) => {
    const prefs = {
      tracking: Boolean(nextTracking),
      marketing: Boolean(nextMarketing),
      updatedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
    setTracking(prefs.tracking);
    setMarketing(prefs.marketing);
    setHasSaved(true);
    setOpen(false);
    applyGtagConsent(prefs);
    window.dispatchEvent(new CustomEvent('khudii:cookie-consent-changed', { detail: prefs }));
  };

  return (
    <>
      {/* Subtle floating bottom-left trigger (avoids Ask Khudii bottom-right launcher) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cookie preferences"
        title="Cookie options"
        className="fixed bottom-5 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-[#02236E] shadow-md backdrop-blur-xs transition hover:border-[#02236E] hover:bg-blue-50 cursor-pointer"
      >
        <Cookie size={15} />
        <span className="hidden sm:inline">Cookie options</span>
        {!hasSaved && <span className="h-2 w-2 rounded-full bg-amber-500" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie preferences"
          className="fixed bottom-16 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#02236E]" />
              <h3 className="text-sm font-bold text-[#02236E]">Privacy &amp; Cookie Preferences</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close cookie preferences"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Manage how Khudii uses optional analytics and marketing cookies. Required cookies stay active so core features work properly.
          </p>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <div>
                <p className="font-bold text-slate-800">Required to Function</p>
                <p className="text-[11px] text-slate-500">Essential site security &amp; session state</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Always On</span>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">Analytics &amp; Tracking</p>
                <p className="text-[11px] text-slate-500">Helps improve Khudii pages (GA4 Consent Mode v2)</p>
              </div>
              <input
                type="checkbox"
                checked={tracking}
                onChange={(e) => setTracking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#02236E]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">Marketing</p>
                <p className="text-[11px] text-slate-500">Campaign attribution &amp; outreach insights</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#02236E]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => persist(false, false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => persist(tracking, marketing)}
              className="flex-1 rounded-xl border border-[#02236E]/30 bg-blue-50 px-3 py-2 text-xs font-bold text-[#02236E] hover:bg-blue-100 cursor-pointer"
            >
              Save Choices
            </button>
            <button
              type="button"
              onClick={() => persist(true, true)}
              className="w-full rounded-xl bg-[#02236E] px-3 py-2 text-xs font-bold text-white hover:bg-[#001850] cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      )}
    </>
  );
}
