'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const SubmissionPopupContext = createContext(null);

const STYLES = {
  success: {
    ring: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    title: 'text-emerald-900',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: CheckCircle2,
  },
  warning: {
    ring: 'bg-amber-50 border-amber-200 text-amber-600',
    title: 'text-amber-900',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: AlertTriangle,
  },
  error: {
    ring: 'bg-red-50 border-red-200 text-[#ed0026]',
    title: 'text-red-900',
    btn: 'bg-[#ed0026] hover:bg-[#c8001f] text-white',
    icon: AlertCircle,
  },
  info: {
    ring: 'bg-blue-50 border-blue-200 text-[#02236E]',
    title: 'text-[#02236E]',
    btn: 'bg-[#02236E] hover:bg-[#001850] text-white',
    icon: Info,
  },
};

export function SubmissionPopupProvider({ children }) {
  const [popup, setPopup] = useState(null);

  const closePopup = useCallback(() => setPopup(null), []);

  const showPopup = useCallback((message, type = 'success', detail = '', duration = 4500) => {
    const normalized = ['success', 'warning', 'error', 'info'].includes(type) ? type : 'success';
    setPopup({ message: String(message || ''), detail: String(detail || ''), type: normalized, duration });
  }, []);

  useEffect(() => {
    if (!popup || !popup.duration) return undefined;
    const timer = setTimeout(() => setPopup(null), popup.duration);
    return () => clearTimeout(timer);
  }, [popup]);

  useEffect(() => {
    if (!popup) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popup]);

  const style = STYLES[popup?.type || 'success'] || STYLES.success;
  const Icon = style.icon;

  return (
    <SubmissionPopupContext.Provider value={{ showPopup, closePopup }}>
      {children}
      {popup && (
        <div
          className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}
        >
          <div
            role="status"
            aria-live="assertive"
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={closePopup}
              aria-label="Close message"
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 ${style.ring}`}>
              <Icon size={32} />
            </div>
            <h3 className={`text-lg font-extrabold ${style.title}`}>{popup.message}</h3>
            {popup.detail && <p className="mt-2 text-sm text-slate-600">{popup.detail}</p>}
            <button
              type="button"
              onClick={closePopup}
              className={`mt-5 w-full rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition cursor-pointer ${style.btn}`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </SubmissionPopupContext.Provider>
  );
}

export function useSubmissionPopup() {
  const ctx = useContext(SubmissionPopupContext);
  if (!ctx) {
    return {
      showPopup: (message, type = 'success', detail = '') => {
        import('@/lib/dialogs').then(({ alertNotice }) => alertNotice({ title: message, text: detail, status: type, timer: 4000 })).catch(() => {});
      },
      closePopup: () => {},
    };
  }
  return ctx;
}
