'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackKhudiiEvent } from '@/lib/analytics-client';

export { trackKhudiiEvent };

export default function KhudiiAnalyticsTracker({ surface = 'frontend' }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return;
    let visitor = '';
    try {
      visitor = sessionStorage.getItem('khudii_anon_session') || '';
      if (!visitor) { visitor = crypto.randomUUID(); sessionStorage.setItem('khudii_anon_session', visitor); }
    } catch { /* browsing without storage remains supported */ }
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
    const endpoint = `${apiBase}${surface === 'backend' ? '/admin/analytics/event' : '/api/analytics/event'}`;
    const emit = (action, category, itemId = '') => {
      const path = window.location.pathname; // intentionally exclude query strings and hashes
      const referrer = surface === 'frontend' ? document.referrer : '';
      const device = matchMedia('(max-width: 640px)').matches ? 'mobile' : matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop';
      fetch(endpoint, {
        method: 'POST', credentials: 'same-origin', keepalive: true,
        headers: { 'Content-Type': 'application/json', ...(surface === 'backend' ? { 'x-khudii-surface': 'admin' } : {}) },
        body: JSON.stringify({ surface, action, category, path, itemId, visitor, referrer, device }),
      }).catch(() => {});
    };
    function categoryFromPath(p) {
      if (/podcast/i.test(p)) return 'podcasts';
      if (/blog/i.test(p)) return 'blogs';
      if (/organiz|categor|sector/i.test(p)) return 'organizations';
      if (/donat/i.test(p)) return 'donations';
      if (/video/i.test(p)) return 'videos';
      if (/stor/i.test(p)) return 'stories';
      if (/job/i.test(p)) return 'jobs';
      if (/volunt/i.test(p)) return 'volunteers';
      if (/registration/i.test(p)) return 'registrations';
      return 'pages';
    }
    emit('page_view', surface === 'backend' ? 'admin' : categoryFromPath(pathname));
    if (surface === 'backend') return;
    const onCustom = event => {
      const {action,category,itemId} = event.detail || {};
      if (typeof action === 'string' && typeof category === 'string') emit(action,category,itemId);
    };
    const onClick = event => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('javascript:')) return;
      let category = 'navigation';
      if (/donat/i.test(href)) category = 'donations';
      else if (/organiz/i.test(href)) category = 'organizations';
      else if (/podcast/i.test(href)) category = 'podcasts';
      else if (/blog/i.test(href)) category = 'blogs';
      emit('link_click', category);
    };
    const onSubmit = event => {
      if (event.target instanceof HTMLFormElement) emit('form_attempt', 'forms');
    };
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const item = entry.target;
        emit('section_view','sections', item.dataset.khudiiSection || '');
        observer.unobserve(item);
      }
    }, { threshold: .25 }) : null;
    observer && document.querySelectorAll('[data-khudii-section]').forEach(node => observer.observe(node));
    window.addEventListener('khudii:analytics', onCustom);
    document.addEventListener('click', onClick, { passive: true });
    document.addEventListener('submit', onSubmit, true);
    return () => {
      window.removeEventListener('khudii:analytics', onCustom);
      document.removeEventListener('click', onClick);
      document.removeEventListener('submit', onSubmit, true);
      observer?.disconnect();
    };
  }, [pathname,surface]);
  return null;
}
