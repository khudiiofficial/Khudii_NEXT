'use client';

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function AdminPresencePing() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      fetch(`${API}/admin/user-presence`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
      }).catch(() => {});
    };

    ping();
    const timer = setInterval(ping, 120_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
