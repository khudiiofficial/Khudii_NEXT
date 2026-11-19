'use client';

import { ShieldAlert, Mail } from 'lucide-react';

export default function MaintenanceView({ message, logoUrl, siteName = 'Khudii' }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#02194f] via-[#02236E] to-[#0b3a9c] px-5 py-16 text-center text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="max-h-full max-w-full object-contain" />
          ) : (
            <ShieldAlert size={36} className="text-[#02236E]" />
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-amber-200">
          Scheduled Maintenance
        </span>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          We&apos;ll Be Back Shortly
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-blue-100 sm:text-base">
          {message || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-white/15 pt-6 text-xs text-blue-200">
          <a
            href="mailto:info@khudii.com"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-[#02236E] shadow transition hover:bg-blue-50"
          >
            <Mail size={15} /> Contact Support
          </a>
        </div>
      </div>
      <p className="mt-6 text-xs text-blue-200/70">© {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
    </main>
  );
}
