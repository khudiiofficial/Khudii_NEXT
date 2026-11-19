'use client';

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
const SENSITIVE_ID = /password|token|email|phone|secret|key/i;

export default function AdminClickAudit() {
  useEffect(() => {
    let queue = [];
    let flushTimer = null;

    const flush = (keepalive = false) => {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (!queue.length) return;
      const batch = queue.splice(0, 20);
      fetch(`${API}/admin/activity/click`, {
        method: 'POST',
        credentials: 'include',
        keepalive,
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        body: JSON.stringify({ events: batch }),
      }).catch(() => {
        if (queue.length < 180) {
          queue = [...batch, ...queue].slice(0, 200);
        }
      });
    };

    const onClick = (event) => {
      const path = window.location.pathname || '';
      if (!path.startsWith('/admin-app')) return;
      const rawTarget = event.target instanceof Element ? event.target : null;
      if (!rawTarget) return;

      const interactive = rawTarget.closest(
        "button,a,[role='button'],input[type='button'],input[type='submit'],summary,[data-audit-component]",
      );
      const el = interactive || rawTarget;
      const elementTag = (el.tagName || 'div').toLowerCase();
      const componentType =
        el.getAttribute?.('data-audit-component') ||
        (interactive ? elementTag : 'page-area');

      let target = el.getAttribute?.('data-audit-target') || '';
      if (!target) {
        const elId = el.getAttribute?.('id') || '';
        if (elId && !SENSITIVE_ID.test(elId)) target = `#${elId}`;
      }
      if (!target && elementTag === 'a') {
        const href = el.getAttribute?.('href') || '';
        if (href.startsWith('/')) target = href.split('?')[0].split('#')[0];
      }
      if (!target) {
        target = el.getAttribute?.('title') || componentType;
      }

      const segments = path.split('/').filter(Boolean);
      const moduleName = segments[2] || 'dashboard';

      queue.push({
        path,
        module: moduleName,
        componentType: String(componentType).slice(0, 80),
        target: String(target).slice(0, 160),
        elementTag: elementTag.slice(0, 30),
      });

      if (queue.length >= 20) {
        flush(false);
      } else if (!flushTimer) {
        flushTimer = setTimeout(() => flush(false), 1200);
      }
    };

    const onVisChange = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('visibilitychange', onVisChange);
      flush(true);
    };
  }, []);

  return null;
}
