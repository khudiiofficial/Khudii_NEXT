'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Inbox,
  Layers,
  RefreshCw,
  SearchCheck,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import KhudiiMultiAreaChart from '@/components/KhudiiMultiAreaChart';
import ReportingRangeSelect from '@/components/ReportingRangeSelect';
import CacheDisplay from '@/components/admin/CacheDisplay';

const API = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/reports/overview`;
const SUBMISSIONS = [
  ['Contact messages', '#2563eb'],
  ['Organization inquiries', '#0ea5e9'],
  ['Donations', '#d97706'],
  ['Volunteers', '#16a34a'],
  ['Job applications', '#9333ea'],
  ['Contributed stories', '#dc2626'],
  ['Registrations', '#64748b'],
];
const SURFACES = [
  { key: 'frontend', label: 'Frontend interactions', color: '#2563eb' },
  { key: 'backend', label: 'Admin page views', color: '#7c3aed' },
  { key: 'admin-writes', label: 'Admin changes', color: '#ea580c' },
];

export default function DashboardIndex() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUsage, setShowUsage] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API}?days=${days}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.message || `HTTP ${r.status}`);
      setData(j);
    } catch (e) {
      setError('Dashboard data unavailable: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Oriscare-parity 30s visibility-aware auto-refresh
  useEffect(() => {
    load();
    const iv = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 30_000);
    return () => clearInterval(iv);
  }, [load]);

  const usage = [
    ...(data?.analytics?.timeline || []),
    ...(data?.adminWrites || []).map((r) => ({ ...r, category: 'admin-writes' })),
  ];
  const overview = SURFACES.map((s) => ({
    ...s,
    value: usage
      .filter((r) => r.category === s.key)
      .reduce((total, r) => total + Number(r.count || 0), 0),
  }));
  const counts = data?.counts || {};
  const cards = data?.cards || [];
  const live = data?.liveMetrics || {};
  const deviceSplit = live.deviceSplit || { desktop: 0, mobile: 0, tablet: 0, total: 0 };
  const integrations = live.integrations || {};
  const categoryData = SUBMISSIONS.map(([name, color]) => ({
    name,
    color,
    value: (data?.timeline || [])
      .filter((r) => r.category === name)
      .reduce((n, r) => n + Number(r.count || 0), 0),
  }));
  const range = data?.from && data?.to ? `${data.from} to ${data.to}` : 'completed calendar days';

  const controlRoomKpis = [
    {
      label: 'CMS Pages',
      value: live.cmsPagesTotal ?? 0,
      sub: `${live.cmsPagesPublished ?? 0} published live`,
      href: '/admin-app/dashboard/pages',
      icon: Layers,
      accent: 'text-[#02236E] bg-blue-50',
    },
    {
      label: 'SEO Content Ready',
      value: `${live.seoReadyCount ?? 0} / ${live.seoTotalCount ?? 0}`,
      sub: 'Pages with Title & Meta Desc',
      href: '/admin-app/dashboard/seo-center',
      icon: SearchCheck,
      accent: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Form Enquiries',
      value: live.totalFormSubmissions ?? 0,
      sub: `${live.unreadEnquiries ?? 0} open / pending review`,
      href: '/admin-app/dashboard/form-enquiries',
      icon: Inbox,
      accent: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'Tracked Views (14D)',
      value: deviceSplit.total ?? 0,
      sub: `Desktop ${deviceSplit.desktop ?? 0} · Mobile ${deviceSplit.mobile ?? 0} · Today ${live.todayViews ?? 0}`,
      href: '/admin-app/dashboard/activity-logs',
      icon: Eye,
      accent: 'text-indigo-700 bg-indigo-50',
    },
    {
      label: 'Admin Activity',
      value: live.adminActivitiesTotal ?? 0,
      sub: 'Captured operator audit actions',
      href: '/admin-app/dashboard/activity-logs',
      icon: Activity,
      accent: 'text-purple-700 bg-purple-50',
    },
    {
      label: 'Tracked 404s',
      value: live.tracked404s ?? 0,
      sub: 'Missing routes & redirect candidates',
      href: '/admin-app/dashboard/backend-logs',
      icon: AlertTriangle,
      accent: live.tracked404s > 0 ? 'text-red-700 bg-red-50' : 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Control Room Hero Banner (Oriscare Parity) */}
      <section className="rounded-3xl bg-gradient-to-r from-[#02236E] via-[#0b338c] to-[#1a49ad] p-6 text-white shadow-lg md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200">
              Khudii Control Room
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Workspace Overview
            </h1>
            <p className="mt-1.5 text-xs text-blue-100/90 sm:text-sm">
              {data?.generatedAt
                ? `Updated ${new Date(data.generatedAt).toLocaleTimeString()} · Auto-refresh every 30 seconds`
                : 'Loading live telemetry from Khudii database...'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-xl bg-white/10 p-1 backdrop-blur-xs">
              <ReportingRangeSelect value={days} onChange={setDays} />
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#02236E] shadow-sm transition hover:bg-blue-50 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Refresh live data
            </button>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {data?.analyticsError && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {data.analyticsError}
        </p>
      )}

      {/* 6 Oriscare Operational KPI Cards */}
      <section aria-label="Operational control metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {controlRoomKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#02236E]/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${kpi.accent}`}>
                  <Icon size={17} />
                </span>
                <ArrowUpRight size={15} className="text-slate-300 transition group-hover:text-[#02236E]" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0b1936]">
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">{kpi.sub}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Cache Display & Revalidation Monitor */}
      <CacheDisplay />

      {/* Quick Page Access + Integrations Status (Oriscare Parity) */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#02236E]">Quick Page Access</h2>
              <p className="text-xs text-slate-500">Jump directly into Khudii CMS page editors</p>
            </div>
            <Link
              href="/admin-app/dashboard/pages"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#02236E] hover:bg-blue-50"
            >
              All pages <ArrowUpRight size={13} />
            </Link>
          </div>
          {live.quickPages?.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {live.quickPages.map((pg) => (
                <Link
                  key={pg.id}
                  href={`/admin-app/dashboard/pages/edit-v2?id=${pg.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{pg.title}</p>
                    <p className="truncate text-xs text-slate-500">{pg.path}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      pg.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pg.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Home Page', '/', '/admin-app/dashboard/pages/edit?slug=%2F'],
                ['About Khudii', '/about-khudii', '/admin-app/dashboard/contentAdmin'],
                ['Organizations', '/organizations', '/admin-app/dashboard/OrganizationPage'],
                ['Blogs', '/blogs', '/admin-app/dashboard/BlogPage'],
                ['Podcasts', '/podcast', '/admin-app/dashboard/Podcast'],
                ['FAQs', '/faqs', '/admin-app/dashboard/faqs'],
              ].map(([title, path, href]) => (
                <Link
                  key={path}
                  href={href}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{title}</p>
                    <p className="truncate text-xs text-slate-500">{path}</p>
                  </div>
                  <FileText size={15} className="shrink-0 text-[#02236E]" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-[#02236E]">Integrations &amp; Health</h2>
                <p className="text-xs text-slate-500">Live CMS configuration status</p>
              </div>
              <Link
                href="/admin-app/dashboard/settings"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#02236E] hover:bg-blue-50"
              >
                <Settings size={13} /> Settings
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <Globe size={15} className="text-blue-600" /> Google Analytics 4
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                    integrations.ga4Configured && integrations.ga4Enabled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2 size={12} />
                  {integrations.ga4Configured
                    ? integrations.ga4Enabled
                      ? 'Active'
                      : 'Paused'
                    : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <SearchCheck size={15} className="text-emerald-600" /> Search Console
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold ${
                    integrations.gscConfigured
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {integrations.gscConfigured ? 'HTML token saved' : 'No HTML token'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <ShieldAlert size={15} className={integrations.maintenanceEnabled ? 'text-red-600' : 'text-emerald-600'} /> Maintenance Mode
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold ${
                    integrations.maintenanceEnabled
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {integrations.maintenanceEnabled ? 'Maintenance ON' : 'Public Live'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <Bot size={15} className="text-[#02236E]" /> Ask Khudii AI
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold ${
                    integrations.aiChatEnabled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {integrations.aiChatEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Status reflects saved CMS configuration values, not external Google account verification.
          </p>
        </section>
      </div>

      {/* Existing Khudii Content & Submission Totals */}
      <section aria-label="Content and submissions totals">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Khudii Content &amp; Submissions Directory
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {cards.map(({ key, label, route }) => (
            <button
              key={key}
              type="button"
              onClick={() => router.push(`/admin-app/dashboard/${route}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#02236E]/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">{label}</span>
                <ArrowUpRight size={17} className="text-[#02236E]" />
              </div>
              <p className="mt-3 text-2xl font-extrabold tabular-nums">
                {counts[key] == null ? 'Not available' : counts[key].toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Frontend vs Backend Activity */}
      <section
        aria-label="Frontend and backend activity"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Frontend vs backend</h2>
            <p className="mt-1 text-sm text-slate-500">
              Recorded interactions, admin page views and administrative changes, {range}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUsage((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
          >
            <BarChart3 size={14} />
            {showUsage ? 'Hide graph' : 'Show graph'}
          </button>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overview.map((v) => (
            <div key={v.key} className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500">{v.label}</span>
              <p className="mt-1 text-2xl font-bold tabular-nums">{v.value.toLocaleString()}</p>
            </div>
          ))}
          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-xs font-semibold text-slate-500">Anonymous public sessions</span>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {data?.analytics?.sessions?.toLocaleString() ?? '—'}
            </p>
          </div>
        </div>
        {showUsage && (
          <KhudiiMultiAreaChart records={usage} series={SURFACES} days={days} endDate={data?.to} height={245} />
        )}
        <p className="mt-4 text-xs text-slate-500">
          Counts measure different event types, not unique people. Analytics begins collecting after deployment and cannot backfill old traffic.
        </p>
      </section>

      {/* Submission Trends */}
      <section
        aria-label="Submission trends"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">All form submissions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Contact, inquiry, donation, volunteer, jobs, stories and registration records, {range}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSubmissions((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
          >
            <BarChart3 size={14} />
            {showSubmissions ? 'Hide graph' : 'Show graph'}
          </button>
        </div>
        {showSubmissions && (
          <KhudiiMultiAreaChart
            records={data?.timeline || []}
            series={SUBMISSIONS.map(([key, color]) => ({ key, label: key, color }))}
            days={days}
            endDate={data?.to}
            height={245}
          />
        )}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {categoryData.map((v) => (
            <span key={v.name} className="text-xs text-slate-600">
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ background: v.color }}
              />
              {v.name}: <strong>{v.value}</strong>
            </span>
          ))}
        </div>
      </section>

      {/* Top Pages & Interaction Categories */}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">Most visited pages</h2>
          <p className="mb-3 text-xs text-slate-500">Tracked public page views in the selected period</p>
          {data?.analytics?.topPages?.length ? (
            <div className="space-y-2">
              {data.analytics.topPages.map((v) => (
                <div
                  key={v.path}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm"
                >
                  <span className="min-w-0 truncate font-medium" title={v.path}>
                    {v.path}
                  </span>
                  <strong className="tabular-nums">{v.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-5 text-sm text-slate-500">No recorded visits in this period.</p>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">Interaction categories</h2>
          <p className="mb-3 text-xs text-slate-500">Combined recorded browser interactions by component</p>
          {data?.analytics?.categories?.length ? (
            <div className="space-y-2">
              {data.analytics.categories.slice(0, 12).map((v) => (
                <div
                  key={`${v.surface}-${v.category}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm"
                >
                  <span className="capitalize">
                    {v.category} <span className="text-xs text-slate-400">({v.surface})</span>
                  </span>
                  <strong className="tabular-nums">{v.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-5 text-sm text-slate-500">No usage events recorded.</p>
          )}
        </section>
      </div>
    </div>
  );
}
