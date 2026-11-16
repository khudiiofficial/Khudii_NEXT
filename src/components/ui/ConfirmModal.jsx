'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export default function ConfirmModal({ config, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!config) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, isSubmitting, onClose]);

  if (!config) return null;

  const {
    title,
    message,
    icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    onConfirm,
  } = config;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirm) await onConfirm();
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const getTheme = () => {
    switch (variant) {
      case 'danger':
        return {
          border: 'border-red-500',
          cardShadow: 'shadow-[0_25px_60px_-15px_rgba(237,0,38,0.25),0_10px_25px_-10px_rgba(0,0,0,0.06)]',
          topGlow: 'bg-[#ed0026]/20',
          haloBg: 'bg-[#ed0026]/20',
          iconBadgeBg: 'bg-red-50 border-red-200 text-[#ed0026]',
          defaultIcon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
          buttonBg: 'bg-[#ed0026] hover:bg-red-700 text-white shadow-red-600/30',
          iconAnimation: 'errorShake 0.5s ease-in-out 0.35s',
        };
      case 'warning':
        return {
          border: 'border-amber-500',
          cardShadow: 'shadow-[0_25px_60px_-15px_rgba(245,158,11,0.22),0_10px_25px_-10px_rgba(0,0,0,0.06)]',
          topGlow: 'bg-amber-400/20',
          haloBg: 'bg-amber-500/20',
          iconBadgeBg: 'bg-amber-50 border-amber-200 text-amber-600',
          defaultIcon: <AlertCircle className="w-8 h-8 text-amber-500" />,
          buttonBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30',
          iconAnimation: 'warningWiggle 0.8s ease-in-out 0.35s',
        };
      case 'success':
        return {
          border: 'border-emerald-500',
          cardShadow: 'shadow-[0_25px_60px_-15px_rgba(16,185,129,0.25),0_10px_25px_-10px_rgba(0,0,0,0.06)]',
          topGlow: 'bg-emerald-400/20',
          haloBg: 'bg-emerald-500/20',
          iconBadgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          defaultIcon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30',
          iconAnimation: 'none',
        };
      case 'primary':
      default:
        return {
          border: 'border-[#02236E]',
          cardShadow: 'shadow-[0_25px_60px_-15px_rgba(2,35,110,0.22),0_10px_25px_-10px_rgba(0,0,0,0.06)]',
          topGlow: 'bg-[#02236E]/15',
          haloBg: 'bg-blue-500/20',
          iconBadgeBg: 'bg-blue-50 border-blue-200 text-[#02236E]',
          defaultIcon: <ShieldAlert className="w-8 h-8 text-[#02236E]" />,
          buttonBg: 'bg-[#02236E] hover:bg-blue-900 text-white shadow-[#02236E]/30',
          iconAnimation: 'none',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={!isSubmitting ? onClose : undefined}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <style>{`
        @keyframes notifPop {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(16px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes warningWiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          20%, 60% {
            transform: rotate(-7deg);
          }
          40%, 80% {
            transform: rotate(7deg);
          }
        }
        @keyframes errorShake {
          0%, 100% {
            transform: translateX(0);
          }
          20%, 60% {
            transform: translateX(-5px);
          }
          40%, 80% {
            transform: translateX(5px);
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md bg-white ${theme.border} border-2 ${theme.cardShadow} rounded-3xl p-8 text-[#02236E] flex flex-col items-center text-center overflow-hidden`}
        style={{
          animation: 'notifPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Subtle Decorative Ambient Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-36 ${theme.topGlow} rounded-full blur-3xl pointer-events-none`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-white bg-slate-400 hover:bg-slate-600 p-2 rounded-full transition-colors cursor-pointer border-none disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Icon Badge */}
        <div className="relative mb-5 flex items-center justify-center">
          <div
            className={`relative w-16 h-16 rounded-2xl ${theme.iconBadgeBg} border-2 flex items-center justify-center shadow-md transform`}
          >
            {icon || theme.defaultIcon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#02236E] mb-2 leading-snug tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 font-normal leading-relaxed mb-6 max-w-sm">
          {message}
        </p>

        {/* Action Buttons Row */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider ${theme.buttonBg} transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none disabled:opacity-75 disabled:scale-100 disabled:cursor-wait flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

