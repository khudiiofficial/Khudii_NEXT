'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Reset failed');
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
            <h1 className="text-xl font-bold text-[#02236E]">Reset Password</h1>
            <p className="text-xs text-slate-500">Choose a new administrator password</p>
          </div>
        </div>

        {!token ? (
          <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-bold text-red-800">Missing Reset Token</p>
            <p className="text-xs text-red-700">Please request a new password reset link.</p>
            <Link href="/letskhudii/forgot-password" className="inline-block rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white">
              Request Reset Link
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <p className="text-sm font-bold text-emerald-900">Password Updated</p>
            <p className="text-xs text-emerald-700">Your administrator password has been reset successfully.</p>
            <Link href="/letskhudii" className="inline-flex items-center gap-1.5 rounded-xl bg-[#02236E] px-5 py-2.5 text-xs font-bold text-white">
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rp-pw" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                New Password
              </label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="rp-pw"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] py-3 pl-10 pr-11 text-sm outline-none focus:border-[#02236E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="rp-pw2" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Confirm New Password
              </label>
              <input
                id="rp-pw2"
                type={showPw ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] px-4 py-3 text-sm outline-none focus:border-[#02236E]"
              />
            </div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#02236E] py-3 text-sm font-bold text-white hover:bg-[#001850] disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Updating...' : 'Update Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#02236E] text-white">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
