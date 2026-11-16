'use client';

import axios from 'axios';
import { adminNotify } from '@/lib/admin-dialogs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';
import { installLargePayloadUploadInterceptor } from '@/lib/large-payload-upload';

// All admin API calls must include this header so the catch-all route
// dispatches to adminRoutes instead of publicRoutes.
axios.defaults.headers.common['x-khudii-surface'] = 'admin';
axios.defaults.withCredentials = true;

const ADMIN_LOGIN_PATH = '/letskhudii';
const ADMIN_DASHBOARD_PATH = '/admin-app/dashboard';

function SessionGuard({ children }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { auth, hydrated, setUser, resetUser } = useAdminAuth();

  useEffect(() => {
    if (!hydrated) return undefined;
    let active = true;

    const check = async () => {
      try {
        const { data } = await axios.post('/api-app/authlogin', {}, { withCredentials: true });
        if (!active) return;
        // Update user state with fresh data from server
        if (data?.user) {
          setUser({ ...data.user, auth: true });
        } else if (!auth) {
          setUser({ auth: true });
        }
        // Redirect away from login page once authenticated
        if (pathname === ADMIN_LOGIN_PATH) {
          router.replace(ADMIN_DASHBOARD_PATH);
        }
      } catch (error) {
        if (!active || error?.response?.status !== 401) return;
        resetUser();
        // Redirect to admin login when session expires / invalid
        if (pathname !== ADMIN_LOGIN_PATH) {
          router.replace(ADMIN_LOGIN_PATH);
        }
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [auth, hydrated, pathname, resetUser, router, setUser]);

  if (!hydrated) return null;
  return children;
}

export default function AdminProviders({ children }) {
  useEffect(() => installLargePayloadUploadInterceptor(), []);
  // Compatibility bridge for old admin screens that still call native alert().
  // Delete confirmations are converted to asynchronous SweetAlert dialogs in-place.
  useEffect(() => {const original=window.alert;window.alert=(message)=>{adminNotify(message,/(error|failed|invalid|fix|unable|❌)/i.test(String(message))?'error':'success');};return()=>{window.alert=original;};}, []);

  return (
    <AdminAuthProvider>
      <SessionGuard>{children}</SessionGuard>
    </AdminAuthProvider>
  );
}
