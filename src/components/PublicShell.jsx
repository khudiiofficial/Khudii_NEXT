'use client';

import { GoogleOAuthProvider } from '@/lib/google-oauth';
import axios from 'axios';
import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/legacy/public/componets/Navbar';
import Topbar from '@/legacy/public/componets/Topbar/Topbar';
import Footer from '@/legacy/public/componets/secondlast/Footer';
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
          </Suspense>
          <Topbar />
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
          <Footer />
          {isInteracted ? (
            <Suspense fallback={null}>
              <VapiAssistant />
              <BackToTopButton />
              <SocialShare />
            </Suspense>
          ) : null}
        </main>
      </PublicSeoContext.Provider>
    </GoogleOAuthProvider>
  );
}
