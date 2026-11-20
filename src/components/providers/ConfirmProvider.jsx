'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react';

const ConfirmContext = createContext(null);

const TONE_MAP = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-50 border-red-200 text-red-600',
    btnBg: 'bg-[#ed0026] hover:bg-[#c8001f] text-white',
    ring: 'focus:ring-red-200',
    defaultConfirm: 'Delete',
  },
  error: {
    icon: Trash2,
    iconBg: 'bg-red-50 border-red-200 text-red-600',
    btnBg: 'bg-[#ed0026] hover:bg-[#c8001f] text-white',
    ring: 'focus:ring-red-200',
    defaultConfirm: 'Delete',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ring: 'focus:ring-emerald-200',
    defaultConfirm: 'Confirm & Save',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
    btnBg: 'bg-amber-500 hover:bg-amber-600 text-white',
    ring: 'focus:ring-amber-200',
    defaultConfirm: 'Continue',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-50 border-blue-200 text-[#02236E]',
    btnBg: 'bg-[#02236E] hover:bg-[#001850] text-white',
    ring: 'focus:ring-blue-200',
    defaultConfirm: 'Confirm',
  },
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const settle = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (resolve) resolve(Boolean(result));
  }, []);

  const confirm = useCallback((options = {}) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        title: opts.title || 'Are you sure?',
        message: opts.message || opts.text || 'Please confirm this action.',
        type: opts.type || opts.status || 'info',
        confirmText: opts.confirmText || opts.confirmLabel || '',
        cancelText: opts.cancelText || opts.cancelLabel || 'Cancel',
      });
    });
  }, []);

  useEffect(() => {
    if (!state) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') settle(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, settle]);

  const tone = TONE_MAP[String(state?.type || 'info').toLowerCase()] || TONE_MAP.info;
  const Icon = tone.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) settle(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="khudii-confirm-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => settle(false)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${tone.iconBg}`}>
                <Icon size={26} />
              </div>
              <h3 id="khudii-confirm-title" className="text-lg font-bold text-slate-900">
                {state.title}
              </h3>
              {state.message && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{state.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => settle(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
              >
                {state.cancelText}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4 cursor-pointer ${tone.btnBg} ${tone.ring}`}
              >
                {state.confirmText || tone.defaultConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return {
      confirm: async (opts) => {
        const { confirmDialog } = await import('@/lib/dialogs');
        const o = typeof opts === 'string' ? { title: opts } : opts || {};
        return confirmDialog({
          title: o.title,
          text: o.message || o.text,
          status: o.type || o.status || 'info',
          confirmText: o.confirmText || o.confirmLabel,
          cancelText: o.cancelText || o.cancelLabel,
        });
      },
    };
  }
  return ctx;
}
