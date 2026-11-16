'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Inbox,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Heart,
  Briefcase,
  Users,
  FileText,
  LineChart,
  X,
  Save,
  Check,
  Copy,
  ChevronDown,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

const TIMELINE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '3 months', value: 90 },
  { label: '6 months', value: 180 },
  { label: '1 year', value: 365 },
];

const FORM_SERIES = [
  { key: 'contact', label: 'Contact messages', color: '#2563eb', icon: MessageSquare },
  { key: 'story', label: 'Contributed stories', color: '#dc2626', icon: FileText },
  { key: 'donate', label: 'Donations', color: '#d97706', icon: Heart },
  { key: 'jobs', label: 'Job applications', color: '#9333ea', icon: Briefcase },
  { key: 'inquiry', label: 'Organization inquiries', color: '#0284c7', icon: Building2 },
  { key: 'organization', label: 'Registrations', color: '#475569', icon: Building2 },
  { key: 'volunteer', label: 'Volunteers', color: '#16a34a', icon: Users },
];

const FORM_META = {
  contact: { label: 'Contact Message', color: '#2563eb', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  inquiry: { label: 'Org. Inquiry', color: '#0284c7', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  donate: { label: 'Donation', color: '#d97706', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  volunteer: { label: 'Volunteer', color: '#16a34a', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  jobs: { label: 'Job Application', color: '#9333ea', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  story: { label: 'Contributed Story', color: '#dc2626', bg: 'bg-red-50 text-red-700 border-red-200' },
  organization: { label: 'Registration', color: '#475569', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-purple-100 text-purple-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-100 text-amber-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'archived', label: 'Archived', color: 'bg-slate-100 text-slate-700' },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#02236E]/95 p-3 text-xs text-white shadow-xl min-w-[170px] backdrop-blur-xs">
      <div className="mb-2 font-bold text-slate-300 border-b border-slate-700/60 pb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 my-0.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
          </div>
          <strong className="text-white font-mono">{Number(p.value || 0).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export default function FormEnquiriesPage() {
  const [days, setDays] = useState(30);
  const [showGraph, setShowGraph] = useState(true);
  const [timelineData, setTimelineData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [remarksFilter, setRemarksFilter] = useState('all');

  // Modals
  const [detailModal, setDetailModal] = useState(null);
  const [remarksModal, setRemarksModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Fetch timeline chart data
  const fetchTimeline = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await fetch(`${API}/admin/forms/timeline?days=${days}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setTimelineData(data);
      }
    } catch {
      showToast('Failed to load activity timeline', 'error');
    } finally {
      setChartLoading(false);
    }
  }, [days]);

  // Fetch all form enquiries
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/forms/inbox?form=all`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.items || []);
      }
    } catch {
      showToast('Failed to load form enquiries', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Quick update status
  const handleStatusChange = async (item, nextStatus) => {
    const prevStatus = item.status;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === item.id && s.form_key === item.form_key ? { ...s, status: nextStatus } : s))
    );
    try {
      const res = await fetch(`${API}/admin/forms/inbox/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({
          form_key: item.form_key,
          id: item.id,
          status: nextStatus,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      showToast(`Status updated to ${nextStatus}`);
    } catch {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === item.id && s.form_key === item.form_key ? { ...s, status: prevStatus } : s))
      );
      showToast('Failed to update status', 'error');
    }
  };

  // Save remarks
  const handleSaveRemarks = async (e) => {
    e.preventDefault();
    if (!remarksModal) return;
    setUpdatingId(remarksModal.id);
    try {
      const res = await fetch(`${API}/admin/forms/inbox/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({
          form_key: remarksModal.form_key,
          id: remarksModal.id,
          status: remarksModal.status,
          remarks: remarksModal.remarks,
          remarks_type: remarksModal.remarks_type,
        }),
      });
      if (!res.ok) throw new Error('Failed to save remarks');
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === remarksModal.id && s.form_key === remarksModal.form_key
            ? { ...s, status: remarksModal.status, remarks: remarksModal.remarks, remarks_type: remarksModal.remarks_type }
            : s
        )
      );
      showToast('Action remarks saved successfully');
      setRemarksModal(null);
    } catch {
      showToast('Could not save remarks', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Inspect detail
  const handleViewDetail = async (item) => {
    try {
      const res = await fetch(`${API}/admin/forms/inbox/detail/${item.form_key}/${item.id}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setDetailModal({
          ...item,
          fields: data.fields || [],
        });
      }
    } catch {
      showToast('Failed to fetch submission details', 'error');
    }
  };

  // Delete submission
  const handleDelete = (item) => {
    setConfirmConfig({
      icon: <Trash2 className="w-8 h-8 text-[#ed0026]" />,
      title: 'Delete Form Submission',
      message: `Delete submission #${item.id} from "${FORM_META[item.form_key]?.label || item.form_key}"? This record will be archived.`,
      confirmText: 'Delete Submission',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/admin/forms/inbox/${item.form_key}/${item.id}`, {
            method: 'DELETE',
            headers: { 'x-khudii-surface': 'admin' },
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Deletion failed');
          setSubmissions((prev) => prev.filter((s) => !(s.id === item.id && s.form_key === item.form_key)));
          showToast('Submission deleted');
          fetchTimeline();
        } catch {
          showToast('Failed to delete submission', 'error');
        }
      },
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (formFilter !== 'all' && item.form_key !== formFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (remarksFilter !== 'all' && item.remarks_type !== remarksFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const full = `${item.name || ''} ${item.email || ''} ${item.phone || ''} ${item.topic || ''} ${item.message || ''} ${item.remarks || ''}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [submissions, formFilter, statusFilter, remarksFilter, search]);

  const fromDate = timelineData?.from || '2026-10-17';
  const toDate = timelineData?.to || '2026-11-15';
  const totals = timelineData?.totals || {};

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {/* Main Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#02236E] text-white shadow-xs">
              <Inbox size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#02236E] m-0">
                All form submissions
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 m-0 font-medium">
                Contact, inquiry, donation, volunteer, jobs, stories and registration records, {fromDate} to {toDate}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeline Pills Selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  days === opt.value
                    ? 'bg-[#02236E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#02236E] hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Toggle Graph Button */}
          <button
            type="button"
            onClick={() => setShowGraph((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <LineChart size={14} className="text-slate-500" />
            {showGraph ? 'Hide graph' : 'Show graph'}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              fetchTimeline();
              fetchSubmissions();
            }}
            disabled={loading || chartLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            title="Refresh submissions and chart"
          >
            <RefreshCw size={14} className={loading || chartLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: ALL FORM SUBMISSIONS GRAPH (IMAGE 7) ================= */}
      {showGraph && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[#02236E] m-0">All form submissions</h2>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                Contact, inquiry, donation, volunteer, jobs, stories and registration records, {fromDate} to {toDate}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGraph(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#02236E] transition"
            >
              <LineChart size={13} />
              Hide graph
            </button>
          </div>

          {/* Chart Rendering */}
          <div className="h-64 w-full">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#02236E] mb-2" />
              </div>
            ) : timelineData?.timeline?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData.timeline}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    {FORM_SERIES.map((s) => (
                      <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                        <stop offset="90%" stopColor={s.color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={Math.max(0, Math.floor((timelineData.timeline.length || 30) / 7))}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />

                  {/* 7 Spline Curves matching Image 7 */}
                  {FORM_SERIES.map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#grad-${s.key})`}
                      dot={false}
                      activeDot={{ r: 4, stroke: s.color, strokeWidth: 2, fill: '#ffffff' }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity records found for this period.
              </div>
            )}
          </div>

          {/* Top Series Legend Pills matching Image 7 */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
            {FORM_SERIES.map((s) => (
              <div key={s.key} className="inline-flex items-center gap-1.5" style={{ color: s.color }}>
                <span className="inline-block w-2.5 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="inline-block w-2 h-2 rounded-full border border-white" style={{ backgroundColor: s.color }} />
                <span className="text-slate-700">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Category Count Summary Badges matching Image 7 */}
          <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 pt-2 text-xs font-bold text-slate-700">
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span>Contact messages: <strong className="text-[#02236E]">{totals.contact ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
              <span>Organization inquiries: <strong className="text-[#02236E]">{totals.inquiry ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span>Donations: <strong className="text-[#02236E]">{totals.donate ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
              <span>Volunteers: <strong className="text-[#02236E]">{totals.volunteer ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea]" />
              <span>Job applications: <strong className="text-[#02236E]">{totals.jobs ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
              <span>Contributed stories: <strong className="text-[#02236E]">{totals.story ?? 0}</strong></span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" />
              <span>Registrations: <strong className="text-[#02236E]">{totals.organization ?? 0}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: UNIFIED ALL FORM ENQUIRIES TABLE ================= */}
      <div className="space-y-4">
        {/* Table Filter Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by submitter, email, phone, topic, or message..."
              value={search ?? ''}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#02236E] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Form Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={formFilter ?? 'all'}
                onChange={(e) => setFormFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#02236E]"
              >
                <option value="all">All 7 Categories</option>
                <option value="contact">Contact Messages</option>
                <option value="inquiry">Organization Inquiries</option>
                <option value="donate">Donations</option>
                <option value="volunteer">Volunteers</option>
                <option value="jobs">Job Applications</option>
                <option value="story">Contributed Stories</option>
                <option value="organization">Registrations</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter ?? 'all'}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#02236E]"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Remarks Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Remarks:</span>
              <select
                value={remarksFilter ?? 'all'}
                onChange={(e) => setRemarksFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-[#02236E]"
              >
                <option value="all">All Remarks</option>
                <option value="success">Success Remarks</option>
                <option value="warning">Warning Remarks</option>
                <option value="error">Error Remarks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unified Submissions Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">#ID</th>
                <th className="p-4">Form Category</th>
                <th className="p-4">Submitter Details</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4">Topic / Message Summary</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action Remarks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-[#02236E]" />
                    Loading form enquiries...
                  </td>
                </tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((item) => {
                  const meta = FORM_META[item.form_key] || { label: item.form_key, color: '#64748b', bg: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={`${item.form_key}-${item.id}`} className="hover:bg-blue-50/20 transition-colors">
                      {/* ID */}
                      <td className="p-4 text-center text-xs font-mono font-bold text-slate-400">
                        #{item.id}
                      </td>

                      {/* Form Category Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.bg}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          {meta.label}
                        </span>
                      </td>

                      {/* Submitter Details */}
                      <td className="p-4">
                        <div className="font-bold text-[#02236E] text-sm">{item.name || 'Anonymous'}</div>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                          {item.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" />
                              <a href={`mailto:${item.email}`} className="hover:text-[#02236E]">{item.email}</a>
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              <a href={`tel:${item.phone}`} className="hover:text-[#02236E]">{item.phone}</a>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="font-semibold text-slate-700">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Topic & Message */}
                      <td className="p-4 max-w-xs">
                        {item.topic && (
                          <div className="font-bold text-xs text-[#02236E] line-clamp-1">{item.topic}</div>
                        )}
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 m-0 leading-relaxed">
                          {item.message || 'No additional message text.'}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="p-4">
                        <select
                          value={item.status ?? 'new'}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 outline-none cursor-pointer ${
                            item.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'in_review'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : item.status === 'contacted'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : item.status === 'archived'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in_review">In Review</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Action Remarks */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setRemarksModal({
                              ...item,
                              remarks: item.remarks || '',
                              remarks_type: item.remarks_type || 'success',
                            })
                          }
                          className={`group text-left px-2.5 py-1.5 rounded-xl border text-xs transition-all max-w-[200px] flex items-center gap-1.5 ${
                            item.remarks_type === 'error'
                              ? 'bg-red-50 text-red-800 border-red-200 hover:border-red-300'
                              : item.remarks_type === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-300'
                              : item.remarks
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
                              : 'bg-slate-50 text-slate-500 border-dashed border-slate-200 hover:border-slate-300 hover:text-[#02236E]'
                          }`}
                          title="Click to edit action remarks"
                        >
                          {item.remarks_type === 'error' ? (
                            <AlertCircle size={13} className="shrink-0 text-red-600" />
                          ) : item.remarks_type === 'warning' ? (
                            <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                          ) : (
                            <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                          )}
                          <span className="truncate block font-medium">
                            {item.remarks || '+ Add remarks'}
                          </span>
                        </button>
                      </td>

                      {/* Actions: View Details, Delete */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(item)}
                            title="Inspect full submission fields"
                            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-[#02236E] transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete submission"
                            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-[#ed0026] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No form enquiries match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: ACTION REMARKS MODAL ================= */}
      {remarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#02236E] m-0">Action Remarks &amp; Resolution</h3>
                <p className="text-xs text-slate-500 mt-0.5 m-0">
                  Submission #{remarksModal.id} &bull; {FORM_META[remarksModal.form_key]?.label || remarksModal.form_key}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarksModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRemarks} className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={remarksModal.status ?? 'new'}
                  onChange={(e) => setRemarksModal({ ...remarksModal, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                >
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Remarks Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks Category (Signal)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRemarksModal({ ...remarksModal, remarks_type: 'success' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      remarksModal.remarks_type === 'success'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemarksModal({ ...remarksModal, remarks_type: 'warning' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      remarksModal.remarks_type === 'warning'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle size={14} className="text-amber-600" />
                    Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemarksModal({ ...remarksModal, remarks_type: 'error' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      remarksModal.remarks_type === 'error'
                        ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle size={14} className="text-red-600" />
                    Error
                  </button>
                </div>
              </div>

              {/* Remarks Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action Remarks &amp; Notes</label>
                <textarea
                  rows={4}
                  placeholder="Record administrative actions, follow-up outcome, verification findings, or internal warnings..."
                  value={remarksModal.remarks ?? ''}
                  onChange={(e) => setRemarksModal({ ...remarksModal, remarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#02236E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRemarksModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(updatingId)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#02236E] text-xs font-bold text-white shadow-md hover:bg-blue-900 transition active:scale-95 disabled:opacity-60"
                >
                  <Save size={14} />
                  Save Remarks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FULL DETAILS INSPECTION MODAL ================= */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${FORM_META[detailModal.form_key]?.bg || 'bg-slate-100'}`}>
                    {FORM_META[detailModal.form_key]?.label || detailModal.form_key}
                  </span>
                  <h3 className="text-base font-bold text-[#02236E] m-0">Submission #{detailModal.id} Details</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 m-0">
                  Received on {detailModal.created_at ? new Date(detailModal.created_at).toLocaleString('en-PK') : '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Fields Inspection List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {detailModal.fields?.length ? (
                detailModal.fields.map((f) => (
                  <div key={f.key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {f.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(f.value)}
                        className="text-[11px] text-slate-400 hover:text-[#02236E] inline-flex items-center gap-1"
                        title="Copy field value"
                      >
                        {copiedText === f.value ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-[#02236E] font-medium break-words leading-relaxed whitespace-pre-wrap">
                      {f.value || <span className="text-slate-400 italic">None</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No additional raw fields returned for this record.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-5 py-2 rounded-xl bg-[#02236E] text-xs font-bold text-white hover:bg-blue-900 transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
