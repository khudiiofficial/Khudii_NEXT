'use client';

import { GoogleOAuthProvider } from '@/lib/google-oauth';
import axios from 'axios';
import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DynamicHeader, DynamicFooter } from './KhudiiDynamicChrome';
import PublicFormPreferences from './PublicFormPreferences';
import KhudiiAnalyticsTracker from './KhudiiAnalyticsTracker';
import CmsPageLayout from './CmsPageLayout';
import Topbar from '@/legacy/public/componets/Topbar/Topbar';
import AskKhudiiChat from './AskKhudiiChat';

import { useGoogleAnalytics } from '@/legacy/public/Hooks/GoogleAnalytics';
import { installLargePayloadUploadInterceptor } from '@/lib/large-payload-upload';

const VapiAssistant = lazy(() => import('@/legacy/public/componets/VAPI.AI/Vapi'));
const BackToTopButton = lazy(() => import('@/legacy/public/componets/backToTopButton/BackToTopButton.jsx'));
const SocialShare = lazy(() => import('@/legacy/public/componets/SocialShare/SocialShare.jsx'));

const PublicSeoContext = createContext({ pages: [], baseUrl: '', getPage: () => undefined });

export function usePublicSeo() {
  return useContext(PublicSeoContext);
}

function LoadingFallback() {
  return (
    <div className="flex w-full h-80 items-center justify-center" aria-label="Loading page">
      <div className="w-10 h-10 border-4 border-[#e7001e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// useGoogleAnalytics() reads the current location via useSearchParams() under the hood.
// Next.js requires any component that calls useSearchParams() to sit under its own
// <Suspense> boundary, or static prerendering of the page fails at build time. Isolating
// it in its own leaf component (rendered below inside <Suspense>) keeps the exact same
// tracking behavior without forcing the whole shell out of static rendering.
function AnalyticsTracker() {
  useGoogleAnalytics();
  return null;
}

export default function PublicShell({ children }) {
  useEffect(() => installLargePayloadUploadInterceptor(), []);
  const pathname = usePathname();
  const [isInteracted, setIsInteracted] = useState(false);
  const [pages, setPages] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [publicSettings, setPublicSettings] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setIsInteracted(true);
      ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach((event) =>
        window.removeEventListener(event, handleInteraction),
      );
    };

    ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach((event) =>
      window.addEventListener(event, handleInteraction, { passive: true, once: true }),
    );
    const timeout = window.setTimeout(() => setIsInteracted(true), 15000);

    return () => {
      ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'].forEach((event) =>
        window.removeEventListener(event, handleInteraction),
      );
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get('/api/seo', { signal: controller.signal })
      .then((response) => {
        if (response.data?.success) {
          setPages(response.data.data?.pages || []);
          setBaseUrl(response.data.data?.url || '');
        }
      })
      .catch((error) => {
        if (error?.code !== 'ERR_CANCELED') console.error('Error fetching SEO data:', error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    // Public branding is configured in Admin > Settings > Appearance > Branding.
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/cms/public-settings`, { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(settings => {
      if (!settings) return;
      setPublicSettings(settings);
      if (settings.popup?.enabled) { try { setShowDisclaimer(sessionStorage.getItem('khudii_disclaimer_ack_v1') !== '1'); } catch { setShowDisclaimer(true); } }
      if (!settings?.favicon) return;
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
      icon.href = settings.favicon;
    }).catch(() => { });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const seoValue = useMemo(
    () => ({ pages, baseUrl, getPage: (path) => pages.find((entry) => entry.page_url === path) }),
    [pages, baseUrl],
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <PublicSeoContext.Provider value={seoValue}>
        <main id="main-content">
          <Suspense fallback={null}>
            <AnalyticsTracker />
            <KhudiiAnalyticsTracker surface="frontend" />
          </Suspense>
          <CmsPageLayout slug="@global">
            <Topbar />
            <DynamicHeader />
            <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            <DynamicFooter />
            <PublicFormPreferences />
          </CmsPageLayout>
          {publicSettings.css?.stylesheet ? <style>{publicSettings.css.stylesheet}</style> : null}
          {showDisclaimer && publicSettings.popup?.enabled && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="khudii-disclaimer-title"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8"><h2 id="khudii-disclaimer-title" className="text-2xl font-bold text-[#02236E]">{publicSettings.popup.title || 'Important notice'}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{publicSettings.popup.message || ''}</p><button type="button" autoFocus onClick={() => { try { sessionStorage.setItem('khudii_disclaimer_ack_v1', '1') } catch { } setShowDisclaimer(false) }} className="mt-6 rounded-xl bg-[#02236E] px-5 py-3 text-sm font-bold text-white">{publicSettings.popup.button_text || 'Continue'}</button></section></div>}
          {isInteracted ? (
            <Suspense fallback={null}>
              <VapiAssistant />
              <BackToTopButton />
              <SocialShare />
            </Suspense>
          ) : null}
          <AskKhudiiChat />
        </main>
      </PublicSeoContext.Provider>
    </GoogleOAuthProvider>
  );
}
