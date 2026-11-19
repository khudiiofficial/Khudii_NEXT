import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/router-compat';
import { readCookieConsent } from '@/components/consent/ConsentManager';

const ENV_GA_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || '';

export const useGoogleAnalytics = (dynamicGaId = '', enabled = true) => {
  const location = useLocation();
  const [trackingGranted, setTrackingGranted] = useState(false);

  const gaId = (dynamicGaId || ENV_GA_ID || '').trim();

  useEffect(() => {
    const existing = readCookieConsent();
    setTrackingGranted(Boolean(existing?.tracking));

    const onChange = (e) => {
      setTrackingGranted(Boolean(e?.detail?.tracking));
    };
    window.addEventListener('khudii:cookie-consent-changed', onChange);
    return () => window.removeEventListener('khudii:cookie-consent-changed', onChange);
  }, []);

  useEffect(() => {
    if (!enabled || !gaId || !trackingGranted) return;

    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }

    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('config', gaId, {
      page_path: location.pathname + location.search,
    });
  }, [enabled, gaId, trackingGranted]);

  useEffect(() => {
    if (!enabled || !gaId || !trackingGranted || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.origin + location.pathname + location.search,
      page_path: location.pathname + location.search,
    });
  }, [location, enabled, gaId, trackingGranted]);
};

export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};
