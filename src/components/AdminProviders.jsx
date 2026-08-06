'use client';

import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';
import { installLargePayloadUploadInterceptor } from '@/lib/large-payload-upload';

function SessionGuard({ children }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { auth, hydrated, setUser, resetUser } = useAdminAuth();

  useEffect(() => {
    if (!hydrated) return undefined;
    let active = true;

    const check = async () => {
      try {
        await axios.post('/authlogin', {}, { withCredentials: true });
        if (!active) return;
        if (!auth) setUser({ auth: true });
        if (pathname.toLowerCase() === '/login') router.replace('/dashboard');
      } catch (error) {
        if (!active || error?.response?.status !== 401) return;
        resetUser();
        if (pathname.toLowerCase() !== '/login') router.replace('/Login');
      }
    };

    check();
    const timer = window.setInterval(check, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [auth, hydrated, pathname, resetUser, router, setUser]);

  if (!hydrated) return null;
  return children;
}

export default function AdminProviders({ children }) {
  useEffect(() => installLargePayloadUploadInterceptor(), []);

  return (
    <AdminAuthProvider>
      <SessionGuard>{children}</SessionGuard>
    </AdminAuthProvider>
  );
}
