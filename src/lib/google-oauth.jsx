'use client';

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

const GoogleOAuthContext = createContext('');
let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google OAuth is browser-only'));
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-khudii-google-oauth="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google OAuth script failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.khudiiGoogleOauth = 'true';
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google OAuth script failed to load'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleOAuthProvider({ clientId, children }) {
  useEffect(() => {
    if (clientId) loadGoogleIdentityScript().catch(() => {});
  }, [clientId]);
  return <GoogleOAuthContext.Provider value={clientId || ''}>{children}</GoogleOAuthContext.Provider>;
}

export function useGoogleLogin(options = {}) {
  const contextClientId = useContext(GoogleOAuthContext);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  return useCallback(async () => {
    try {
      const clientId = optionsRef.current.clientId || contextClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
      const google = await loadGoogleIdentityScript();
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: optionsRef.current.scope || 'openid email profile',
        prompt: optionsRef.current.prompt || '',
        callback: (response) => {
          if (response?.error) optionsRef.current.onError?.(response);
          else optionsRef.current.onSuccess?.(response);
        },
        error_callback: (error) => optionsRef.current.onError?.(error),
      });
      client.requestAccessToken();
    } catch (error) {
      optionsRef.current.onError?.(error);
    }
  }, [contextClientId]);
}
