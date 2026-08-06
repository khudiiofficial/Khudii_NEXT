'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'khudiiAdminUser';
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUserState] = useState({ id: '', email: '', auth: false });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUserState({ id: '', email: '', auth: false, ...JSON.parse(stored) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setUser = useCallback((nextUser) => {
    const normalized = {
      id: nextUser?.id ?? nextUser?._id ?? '',
      email: nextUser?.email ?? '',
      ...nextUser,
      auth: nextUser?.auth !== false,
    };
    setUserState(normalized);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const resetUser = useCallback(() => {
    const empty = { id: '', email: '', auth: false };
    setUserState(empty);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, auth: Boolean(user.auth), hydrated, setUser, resetUser }),
    [user, hydrated, setUser, resetUser],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return value;
}
