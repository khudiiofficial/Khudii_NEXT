'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { confirmDialog, showSuccess, showError } from '@/lib/dialogs';
import { SignInButton } from '@/components/ui/AppButton';

const APIPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function AdminLogin() {
  const router = useRouter();
  const { setUser } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const [loginBranding, setLoginBranding] = useState({ backgroundImage: '', backgroundAlt: '', footerText: '' });

  useEffect(() => {
    try {
      const cached = localStorage.getItem('khudii_site_logo');
      if (cached) setSiteLogo(cached);
    } catch { }

    axios.get(`${APIPath}/cms/public-settings`).then((res) => {
      const logo = res.data?.logo || res.data?.site_identity?.siteLogo;
      if (logo) {
        setSiteLogo(logo);
        try { localStorage.setItem('khudii_site_logo', logo); } catch { }
      }
      if (res.data?.login_auth) {
        setLoginBranding({
          backgroundImage: res.data.login_auth.backgroundImage || '',
          backgroundAlt: res.data.login_auth.backgroundAlt || '',
          footerText: res.data.login_auth.footerText || '',
        });
      }
    }).catch(() => { });
  }, []);

  async function login(e) {
    e.preventDefault();
    if (loading) return;
    const confirmed = await confirmDialog({
      title: 'Sign in to Khudii?',
      text: 'Continue to the Administrator Dashboard?',
      confirmText: 'Sign in',
      cancelText: 'Cancel',
      status: 'info',
    });
    if (!confirmed) return;
    setLoading(true); setError('');
    try {
      const response = await axios.post(`${APIPath}/auth/login`, { email: email.trim(), password }, {
        withCredentials: true, headers: { 'x-khudii-surface': 'admin' },
      });
      if (!response?.data?.user) throw new Error('No user information returned.');
      setUser(response.data.user);
      await showSuccess('Signed in successfully', 'Redirecting to your dashboard...', { timer: 1000, showConfirmButton: false });
      router.replace('/admin-app/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to sign in. Check your credentials and try again.';
      setError(msg);
      await showError('Login failed', msg);
    } finally { setLoading(false); }
  }

  return <main className="kh-login min-h-screen bg-[#f4f7fc] px-3 py-3 text-[#152344] sm:px-6 sm:py-10">
    <div className="mx-auto flex min-h-0 w-full max-w-[1000px] items-center justify-center sm:min-h-[calc(100vh-5rem)]">
      <div className="grid w-full overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_24px_85px_rgba(10,34,80,.14)] sm:rounded-[28px] lg:grid-cols-[.92fr_1fr]">
        <div
          className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#061840] via-[#072b74] to-[#16479a] p-8 text-white lg:flex"
          style={loginBranding.backgroundImage ? { backgroundImage: `linear-gradient(135deg, rgba(6,24,64,0.82), rgba(22,71,154,0.75)), url(${loginBranding.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="relative z-10">
            <Link href="/" className="inline-block">
              <img
                src={siteLogo || "/Khudii.webp"}
                alt="Khudii Logo"
                className="h-12 w-auto max-w-[220px] rounded-2xl bg-white px-3.5 py-2 object-contain shadow-sm"
              />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-24 top-28 h-72 w-72 rounded-full border-[50px] border-blue-400/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-12 h-80 w-80 rounded-full border-[50px] border-white/5" />
          <div className="relative z-10"><div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10"><ShieldCheck size={29} /></div><h1 className="max-w-[330px] text-[33px] font-extrabold leading-tight tracking-tight">Your workspace for doing more good.</h1><p className="mt-5 max-w-[310px] text-sm leading-7 text-blue-100/80">Secure access to Khudii's organizations, content, enquiries and operations.</p></div>
          <p className="relative z-10 text-xs text-blue-100/70">Khudii Welfare Organization</p>
        </div>
        <div className="flex min-h-0 items-center p-6 sm:min-h-[520px] sm:p-8"><div className="w-full">
          <div className="mb-6 sm:mb-10"><span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef3ff] px-3 py-1.5 text-xs font-bold text-[#02236E]"><LockKeyhole size={13} /> Authorized access</span><h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0a1f4b] sm:mt-4 sm:text-[32px]">Welcome back</h2><p className="mt-1.5 text-sm text-slate-500 sm:mt-2">Sign in to manage your Khudii workspace.</p></div>
          <form onSubmit={login} className="space-y-5">
            <div><label htmlFor="admin-email" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input id="admin-email" type="email" autoComplete="username" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="name@khudii.com" className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#3561bf] focus:ring-4 focus:ring-blue-100" /></div></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wide text-slate-600">Password</label><Link href="/letskhudii/forgot-password" className="text-xs font-bold text-[#02236E] hover:underline">Forgot password?</Link></div><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input id="admin-password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password ?? ''} onChange={(e) => setPassword(e.target.value)} required disabled={loading} placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-[#3561bf] focus:ring-4 focus:ring-blue-100" /><button type="button" onClick={() => setVisible(v => !v)} title={visible ? 'Hide password' : 'Show password'} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-blue-50">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            <SignInButton type="submit" loading={loading} fullWidth size="lg" className="shadow-[0_8px_20px_rgba(2,35,110,.20)] py-3.5" />
          </form>
          {/* Copyright */}
          <div className="mt-6 text-center text-xs text-slate-600 sm:mt-9">
            {loginBranding.footerText ? (
              <p>{loginBranding.footerText}</p>
            ) : (
              <p>
                ©2026 Copyright <Link href="/"><span className="text-red-600"><b>Khudii</b></span></Link>. All Rights Reserved.
                Powered By <a className="text-red-600" href="https://www.dks.com.pk/" target="_blank" rel="noopener noreferrer"><b>DKS</b></a>
              </p>
            )}
          </div>
        </div></div>
      </div>
    </div>
  </main>;
}
