'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-900',
    icon: AlertCircle,
    iconColor: 'text-[#ed0026]',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  info: {
    wrap: 'border-blue-200 bg-blue-50 text-[#02236E]',
    icon: Info,
    iconColor: 'text-[#02236E]',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const normalized = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    setToasts((prev) => [...prev.slice(-4), { id, message: String(message || ''), type: normalized }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[130] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const style = STYLES[toast.type] || STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all ${style.wrap}`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
              <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-0.5 opacity-60 transition hover:opacity-100 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (message, type = 'success') => {
        import('@/lib/dialogs').then(({ toastNotice }) => toastNotice({ title: message, status: type })).catch(() => {});
      },
      removeToast: () => {},
    };
  }
  return ctx;
}
