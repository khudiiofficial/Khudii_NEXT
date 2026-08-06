// src/hooks/useGoogleAnalytics.js
import { useEffect } from 'react';
import { useLocation } from '@/lib/router-compat';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_TRACKING_ID) {
      console.warn('GA Tracking ID not found');
      return;
    }

    // Avoid re-initializing
    if (window.gtag) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function to push to dataLayer
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    // Load GA script with a delay to improve TBT & Page Load metrics
    const loadGA = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script);

      // Initial config
      window.gtag('js', new Date());
      window.gtag('config', GA_TRACKING_ID, {
        page_path: location.pathname + location.search,
      });
    };

    // Delay execution until main thread is idle or after 4s
    if (window.requestIdleCallback) {
      window.requestIdleCallback(loadGA, { timeout: 4000 });
    } else {
      setTimeout(loadGA, 4000);
    }
  }, []); // Only run once on mount

  // Track page views on route change
  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return;

    // Use explicit page_view event (recommended for SPAs)
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.origin + location.pathname + location.search,
      page_path: location.pathname + location.search,
    });
  }, [location]);
};

// Event tracking function
export const trackEvent = (action, category, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};