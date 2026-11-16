'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isWarning = toast.type === 'warning';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {isWarning && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-[#ed0026] shrink-0" />}
      {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-[#02236E] shrink-0" />}

      <p className="text-sm font-semibold text-[#02236E] m-0 max-w-sm">{toast.message}</p>

      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

