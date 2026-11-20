'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#02194f] via-[#02236E] to-[#1241a3] p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#02236E]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#02236E]">Forgot Password</h1>
            <p className="text-xs text-slate-500">Khudii Administrator Recovery</p>
          </div>
        </div>

        {done ? (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <p className="text-sm font-bold text-emerald-900">Reset Instructions Sent</p>
            <p className="text-xs text-emerald-700">
              If an administrator account matches <strong>{email}</strong>, a secure password reset link has been sent.
            </p>
            <Link
              href="/letskhudii"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Enter your administrator email address and we will send you a time-limited link to reset your password.
            </p>
            <div>
              <label htmlFor="fp-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@khudii.com"
                  className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#02236E]"
                />
              </div>
            </div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#02236E] py-3 text-sm font-bold text-white hover:bg-[#001850] disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="pt-2 text-center">
              <Link href="/letskhudii" className="inline-flex items-center gap-1 text-xs font-bold text-[#02236E] hover:underline">
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
