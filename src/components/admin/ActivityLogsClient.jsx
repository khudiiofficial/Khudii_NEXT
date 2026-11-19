'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ActivitySplineAreaChart, { MODULE_LINE_DEFS } from './ActivitySplineAreaChart';
import {
  Search,
  Filter,
  RefreshCw,
  Layers,
  Users,
  Sliders,
  FileText,
  Mail,
  Activity,
  Trash2,
  Download,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  PlusCircle,
  Edit3,
  LogIn,
  LogOut,
  Building2,
  Video,
  BookOpen,
  Image as ImageIcon,
  Globe,
  Copy,
  Check,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { alertNotice, confirmDialog, showSuccess, showError } from '@/lib/dialogs';

const MODULE_CONFIG = {
  organizations: { label: 'Organizations', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', icon: Building2 },
  podcasts: { label: 'Podcasts', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', icon: Video },
  pages: { label: 'Pages', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', icon: Layers },
  blogs: { label: 'Blogs', bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF', icon: BookOpen },
  users: { label: 'Users', bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', icon: Users },
  enquiries: { label: 'Enquiries', bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: Mail },
  settings: { label: 'Settings', bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', icon: Sliders },
  media: { label: 'Media', bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC', icon: ImageIcon },
  auth: { label: 'Auth', bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE', icon: Shield },
  menus: { label: 'Menus', bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4', icon: Layers },
};

function getActionBadge(action) {
  const act = String(action || 'UPDATE').toUpperCase();
  if (act.includes('CREATE') || act === 'POST') {
    return { label: 'CREATE', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: PlusCircle };
  }
  if (act.includes('DELETE') || act === 'REMOVE') {
    return { label: 'DELETE', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Trash2 };
  }
  if (act.includes('LOGIN')) {
    return { label: 'LOGIN', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: LogIn };
  }
  if (act.includes('LOGOUT')) {
    return { label: 'LOGOUT', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: LogOut };
  }
  return { label: 'UPDATE', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: Edit3 };
}

function getOperatorColor(name) {
  const colors = [
    { bg: 'bg-blue-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-purple-600', text: 'text-white' },
    { bg: 'bg-rose-600', text: 'text-white' },
    { bg: 'bg-amber-600', text: 'text-white' },
    { bg: 'bg-teal-600', text: 'text-white' },
  ];
  let sum = 0;
  for (let i = 0; i < (name || '').length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export default function ActivityLogsClient() {
  const router = useRouter();

  // Data states
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, totalCount: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, today: 0, creates: 0, updates: 0, deletes: 0, users: [] });
  const [visualStats, setVisualStats] = useState({ timeline: [], totalVolume: 0, activeModules: 0, topModule: { label: 'Users', count: 0 } });

  // Visual chart toggle & chart controls
  const [showChart, setShowChart] = useState(true);
  const [selectedChartModule, setSelectedChartModule] = useState('all');
  const [chartTimeRange, setChartTimeRange] = useState('14D');

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // UI feedback states
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Export CSV popup states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModule, setExportModule] = useState('all');
  const [exportDateRange, setExportDateRange] = useState('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Clear logs modal state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState('older_than_30_days');
  const [isClearing, setIsClearing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setSelectedAction('all');
    setSelectedEntity('all');
    setSelectedUser('all');
    setSelectedDateRange('all');
    fetchData({ page: 1, search: '', action: 'all', entityType: 'all', userEmail: 'all', dateRange: 'all' });
  };

  const fetchData = useCallback(
    async (overrideParams = {}) => {
      setIsRefreshing(true);
      setFetchError('');
      try {
        const queryParams = new URLSearchParams({
          page: String(overrideParams.page ?? pagination.page),
          pageSize: String(overrideParams.pageSize ?? pagination.pageSize),
          search: overrideParams.search !== undefined ? overrideParams.search : search,
          action: overrideParams.action ?? selectedAction,
          entityType: overrideParams.entityType ?? selectedEntity,
          userEmail: overrideParams.userEmail ?? selectedUser,
          dateRange: overrideParams.dateRange ?? selectedDateRange,
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/activity-logs?${queryParams}`, {
          credentials: 'include',
          headers: { 'x-khudii-surface': 'admin' },
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch activity logs');
        }

        setLogs(json.logs || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
        if (json.visualStats) setVisualStats(json.visualStats);
      } catch (err) {
        console.error('fetchData error:', err);
        setFetchError(err.message || 'Unable to load activity logs.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [pagination.page, pagination.pageSize, search, selectedAction, selectedEntity, selectedUser, selectedDateRange]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData({ page: 1, search });
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const q = new URLSearchParams({
        format: 'csv',
        module: exportModule,
        ...(exportDateRange !== 'all' && exportStartDate && exportEndDate
          ? { from: exportStartDate, to: exportEndDate }
          : {}),
      });
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/reports/activity/download?${q}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.message || 'Export failed');
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `khudii-activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setIsExportModalOpen(false);
      showSuccess('Export Complete', 'Activity logs CSV downloaded successfully.');
    } catch (err) {
      showError('Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Clear Logs
  const handleConfirmClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/activity-logs/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-khudii-surface': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ mode: clearMode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to clear activity logs');
      }
      setIsClearModalOpen(false);
      showSuccess('Logs Cleared', json.message || 'Activity logs have been successfully cleared.');
      fetchData({ page: 1 });
    } catch (err) {
      showError('Action Failed', err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#02236E]" />
              Activity Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              {stats.total.toLocaleString()} Total Records
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Centralized chronological database audit record of all operator actions, entity mutations, and CRM transactions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowChart((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <Activity size={14} className="text-[#02236E]" />
            {showChart ? 'Hide Visual Graph' : 'Show Visual Graph'}
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
          >
            <Download size={14} className="text-slate-600" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#02236E]' : 'text-slate-600'} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer shadow-xs"
          >
            <Trash2 size={14} className="text-rose-600" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* ─── Top 5 KPI Summary Cards (Matching Image 1) ─── */}
      {fetchError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 flex items-center justify-between gap-2">
          <span>{fetchError}</span>
          <button type="button" onClick={() => fetchData()} className="underline font-bold cursor-pointer">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. All Activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>All Activities</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#02236E] flex items-center justify-center">
              <Activity size={13} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.total.toLocaleString()}
          </div>
        </div>

        {/* 2. Today's Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Today&apos;s Actions</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={13} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.today.toLocaleString()}
          </div>
        </div>

        {/* 3. Creates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Creates</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <PlusCircle size={13} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.creates.toLocaleString()}
          </div>
        </div>

        {/* 4. Updates & Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Updates &amp; Status</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit3 size={13} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.updates.toLocaleString()}
          </div>
        </div>

        {/* 5. Deletions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Deletions</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 size={13} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.deletes.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ─── Real-Time Activity Trends by Module (Spline Area Chart) ─── */}
      {showChart && (
        <ActivitySplineAreaChart
          timeline={visualStats.timeline}
          totalActivities={stats.total}
          todayCount={stats.today}
          selectedModule={selectedChartModule}
          onSelectModule={(mod) => setSelectedChartModule(mod)}
          timeRange={chartTimeRange}
          onChangeTimeRange={(range) => {
            setChartTimeRange(range);
            fetchData({ dateRange: range === '7D' ? '7d' : range === '30D' ? '30d' : '14d' });
          }}
        />
      )}

      {/* ─── Interactive Filters Bar ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search input */}
          <div className="relative lg:col-span-2">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, item title, operator, ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E] focus:bg-white transition"
            />
          </div>

          {/* Action dropdown */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                fetchData({ action: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E] cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Creates (POST)</option>
              <option value="UPDATE">Updates (PUT/PATCH)</option>
              <option value="DELETE">Deletions (DELETE)</option>
              <option value="LOGIN">User Logins</option>
              <option value="LOGOUT">User Logouts</option>
            </select>
          </div>

          {/* User dropdown */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                fetchData({ userEmail: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E] cursor-pointer"
            >
              <option value="all">All Users</option>
              {stats.users.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Date range dropdown */}
          <div>
            <select
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value);
                fetchData({ dateRange: e.target.value, page: 1 });
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E] cursor-pointer"
            >
              <option value="all">Date: All Time</option>
              <option value="today">Date: Today</option>
              <option value="7d">Date: Last 7 Days</option>
              <option value="14d">Date: Last 14 Days</option>
              <option value="30d">Date: Last 30 Days</option>
            </select>
          </div>
        </form>

        {/* Filter by Module Horizontal Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter size={11} />
            Filter by Module:
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedEntity('all');
              fetchData({ entityType: 'all', page: 1 });
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
              selectedEntity === 'all'
                ? 'bg-[#02236E] text-white border-[#02236E] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>

          {MODULE_LINE_DEFS.map((m) => {
            const isSelected = selectedEntity === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  const next = isSelected ? 'all' : m.key;
                  setSelectedEntity(next);
                  fetchData({ entityType: next, page: 1 });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  isSelected
                    ? 'text-white border-transparent shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                style={isSelected ? { backgroundColor: m.color } : {}}
              >
                {m.label}
              </button>
            );
          })}
          {(search || selectedAction !== 'all' || selectedEntity !== 'all' || selectedUser !== 'all' || selectedDateRange !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto px-3 py-1 rounded-lg text-xs font-bold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Activity Logs Table (Matching Image 1) ─── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Operator</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">Event / Target Item</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-slate-500">
                    No activity logs match the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((item) => {
                  const actBadge = getActionBadge(item.action);
                  const ActIcon = actBadge.icon;
                  const modConf = MODULE_CONFIG[item.entityType] || MODULE_CONFIG.settings;
                  const ModIcon = modConf.icon;
                  const avatarColor = getOperatorColor(item.user);

                  const dateObj = new Date(item.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* Timestamp */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-xs text-slate-900">{item.timeAgo}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formattedDate}</div>
                      </td>

                      {/* Operator */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor.bg} ${avatarColor.text}`}
                          >
                            {(item.user || 'D').charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{item.user}</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                {item.role || 'ADMIN'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {item.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
                          <Globe size={11} className="text-slate-400" />
                          <span>{item.ipAddress ? item.ipAddress.replace(/^::ffff:/, '') : '127.0.0.1'}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${actBadge.bg}`}
                        >
                          <ActIcon size={10} />
                          {actBadge.label}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                          style={{
                            backgroundColor: modConf.bg,
                            color: modConf.text,
                            borderColor: modConf.border,
                          }}
                        >
                          <ModIcon size={10} />
                          {modConf.label}
                        </span>
                      </td>

                      {/* Event / Target Item */}
                      <td className="p-4 max-w-[340px]">
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      </td>

                      {/* Details Button */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveModalItem(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(pagination.totalCount, pagination.page * pagination.pageSize)}</strong> of{' '}
            <strong className="text-slate-800">{pagination.totalCount.toLocaleString()}</strong> activities
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchData({ page: pagination.page - 1 })}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchData({ page: pagination.page + 1 })}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Activity Log Item Details Modal ─── */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModalItem(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Activity Log Details"
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#02236E] flex items-center justify-center">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Activity Log Details</h3>
                  <p className="text-[11px] text-slate-500">Record ID: #{activeModalItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Operator</span>
                  <div className="font-bold text-slate-900">{activeModalItem.user} ({activeModalItem.role})</div>
                  <div className="text-[11px] text-slate-500">{activeModalItem.userEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Timestamp &amp; IP</span>
                  <div className="font-bold text-slate-900">{new Date(activeModalItem.timestamp).toLocaleString()}</div>
                  <div className="text-[11px] font-mono text-slate-500">{activeModalItem.ipAddress || 'Not recorded'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Action</span><span className="font-bold text-slate-800">{activeModalItem.action}</span></div>
                <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Module</span><span className="font-bold capitalize text-slate-800">{activeModalItem.entityType}</span></div>
                <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Admin Path</span><span className="font-mono text-slate-700 break-all">{activeModalItem.requestPath || '—'}</span></div>
                {activeModalItem.componentType && <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Component</span><span className="font-mono text-slate-700">{activeModalItem.componentType}</span></div>}
                {activeModalItem.elementTag && <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Element Tag</span><span className="font-mono text-slate-700">&lt;{activeModalItem.elementTag}&gt;</span></div>}
                {activeModalItem.pageId && <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Page ID</span><span className="font-mono text-slate-700">{activeModalItem.pageId}</span></div>}
                {activeModalItem.sectionId && <div><span className="text-[10px] font-bold uppercase text-slate-400 block">Section ID</span><span className="font-mono text-slate-700">{activeModalItem.sectionId}</span></div>}
                {activeModalItem.changedFields && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Changed Fields</span>
                    <span className="font-mono text-emerald-700">{activeModalItem.changedFields}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Event Action &amp; Target</span>
                <div className="font-bold text-sm text-[#02236E]">{activeModalItem.title}</div>
                <div className="text-slate-600 mt-0.5">{activeModalItem.description}</div>
              </div>

              {activeModalItem.details && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Payload / Details</span>
                  <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {typeof activeModalItem.details === 'string'
                      ? activeModalItem.details
                      : JSON.stringify(activeModalItem.details, null, 2)}
                  </pre>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                Only events captured after audit instrumentation contain IP, component, and changed-field metadata; historical records cannot be reconstructed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeModalItem, null, 2));
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copiedId ? 'Copied to Clipboard' : 'Copy JSON'}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-blue-950 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Export CSV Modal ─── */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Download size={16} className="text-[#02236E]" />
                Export Activity Logs to CSV
              </h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Module</label>
                <select
                  value={exportModule}
                  onChange={(e) => setExportModule(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold"
                >
                  <option value="all">All Modules</option>
                  {MODULE_LINE_DEFS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date Range</label>
                <select
                  value={exportDateRange}
                  onChange={(e) => setExportDateRange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold"
                >
                  <option value="all">All Available Records</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {exportDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">From Date</label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">To Date</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-blue-950 disabled:opacity-50 cursor-pointer"
              >
                <Download size={13} />
                {isExporting ? 'Exporting...' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Clear Logs Confirmation Modal ─── */}
      {isClearModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsClearModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                Clear Activity Logs
              </h3>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Choose the cleanup method for activity audit records. This action will be recorded in the system audit trail.
              </p>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition">
                  <input
                    type="radio"
                    name="clearMode"
                    value="older_than_30_days"
                    checked={clearMode === 'older_than_30_days'}
                    onChange={(e) => setClearMode(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Clear Records Older than 30 Days (Recommended)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Maintains recent audit records while pruning older transactions.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:border-rose-300 cursor-pointer transition">
                  <input
                    type="radio"
                    name="clearMode"
                    value="all"
                    checked={clearMode === 'all'}
                    onChange={(e) => setClearMode(e.target.value)}
                    className="mt-0.5 text-rose-600"
                  />
                  <div>
                    <div className="font-bold text-rose-800">Clear All Activity History</div>
                    <div className="text-[11px] text-rose-600 mt-0.5">
                      Completely empties the activity audit table. Use with caution.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearLogs}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Trash2 size={13} />
                {isClearing ? 'Clearing...' : 'Confirm Clear Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
