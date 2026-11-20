'use client';

import * as React from 'react';
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
  Layers,
  Building2,
  Video,
  BookOpen,
  Users,
  Mail,
  Sliders,
  Image,
  Shield,
  Activity,
  TrendingUp,
} from 'lucide-react';

export const MODULE_LINE_DEFS = [
  { key: 'organizations', label: 'Organizations', color: '#10B981', gradientId: 'splineGradOrgs', strokeWidth: 3, icon: Building2 },
  { key: 'podcasts', label: 'Podcasts', color: '#F59E0B', gradientId: 'splineGradPodcasts', strokeWidth: 3, icon: Video },
  { key: 'pages', label: 'Pages', color: '#2563EB', gradientId: 'splineGradPages', strokeWidth: 3, icon: Layers },
  { key: 'blogs', label: 'Blogs', color: '#8B5CF6', gradientId: 'splineGradBlogs', strokeWidth: 2.5, icon: BookOpen },
  { key: 'users', label: 'Users', color: '#0EA5E9', gradientId: 'splineGradUsers', strokeWidth: 3, icon: Users },
  { key: 'enquiries', label: 'Enquiries', color: '#F43F5E', gradientId: 'splineGradEnquiries', strokeWidth: 2.5, icon: Mail },
  { key: 'settings', label: 'Settings', color: '#64748B', gradientId: 'splineGradSettings', strokeWidth: 2.5, icon: Sliders },
  { key: 'media', label: 'Media', color: '#06B6D4', gradientId: 'splineGradMedia', strokeWidth: 2, icon: Image },
  { key: 'auth', label: 'Auth', color: '#4F46E5', gradientId: 'splineGradAuth', strokeWidth: 2, icon: Shield },
  { key: 'menus', label: 'Menus', color: '#14B8A6', gradientId: 'splineGradMenus', strokeWidth: 2, icon: Layers },
];

const CustomActiveDot = (props) => {
  const { cx, cy, stroke } = props;
  if (cx === undefined || cy === undefined) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#FFFFFF"
        stroke={stroke || '#2563EB'}
        strokeWidth={3}
        className="filter drop-shadow-md transition-all duration-150"
      />
    </g>
  );
};

function CustomModuleTooltip({ active, payload, label, selectedModule }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const dayBreakdown = [];
  for (const m of MODULE_LINE_DEFS) {
    const cnt = Number(point[m.key] ?? 0);
    if (cnt > 0) {
      dayBreakdown.push({ key: m.key, label: m.label, count: cnt, color: m.color });
    }
  }

  dayBreakdown.sort((a, b) => b.count - a.count);

  const activeModuleItem =
    selectedModule && selectedModule !== 'all'
      ? dayBreakdown.find((d) => d.key === selectedModule) ||
        MODULE_LINE_DEFS.find((m) => m.key === selectedModule)
      : null;

  const topModule = activeModuleItem
    ? {
        label: activeModuleItem.label,
        count: Number(point[activeModuleItem.key] ?? 0),
        color: activeModuleItem.color,
      }
    : dayBreakdown[0];

  const total = point.total || 0;

  return (
    <div className="relative pointer-events-none z-50">
      <div className="bg-[#0f172a] text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs min-w-[170px] animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-700/60">
          <span className="font-bold text-white text-[11px] tracking-wide uppercase">
            {point.label || label}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
            {total} actions
          </span>
        </div>

        {topModule ? (
          <div className="flex items-center justify-between gap-3 py-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topModule.color }} />
              <span>{topModule.label}:</span>
            </span>
            <span className="font-bold font-mono text-white text-xs">{topModule.count}</span>
          </div>
        ) : null}

        {dayBreakdown.length > 1 && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-1">
            {dayBreakdown
              .filter((d) => !topModule || d.key !== topModule.key)
              .slice(0, 4)
              .map((d) => (
                <div key={d.key} className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.label}</span>
                  </span>
                  <span className="font-mono text-slate-200">{d.count}</span>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0f172a] mx-auto mt-[-1px]" />
    </div>
  );
}

export default function ActivitySplineAreaChart({
  timeline = [],
  totalActivities = 0,
  todayCount = 0,
  selectedModule = 'all',
  onSelectModule = () => {},
  timeRange = '14D',
  onChangeTimeRange = () => {},
}) {
  const chartId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const moduleCounts = React.useMemo(() => {
    const counts = {};
    for (const m of MODULE_LINE_DEFS) counts[m.key] = 0;
    for (const point of timeline) {
      for (const m of MODULE_LINE_DEFS) {
        counts[m.key] += Number(point[m.key] ?? 0);
      }
    }
    return counts;
  }, [timeline]);

  const totalVolume = React.useMemo(() => {
    return Object.values(moduleCounts).reduce((acc, v) => acc + v, 0);
  }, [moduleCounts]);

  const activeModulesCount = React.useMemo(() => {
    return Object.values(moduleCounts).filter((c) => c > 0).length;
  }, [moduleCounts]);

  const topModule = React.useMemo(() => {
    let best = { key: 'users', label: 'Users', count: moduleCounts.users || 0 };
    for (const m of MODULE_LINE_DEFS) {
      if ((moduleCounts[m.key] || 0) > best.count) {
        best = { key: m.key, label: m.label, count: moduleCounts[m.key] || 0 };
      }
    }
    return best;
  }, [moduleCounts]);

  const visibleModules = selectedModule === 'all'
    ? MODULE_LINE_DEFS
    : MODULE_LINE_DEFS.filter((m) => m.key === selectedModule);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#02236E] flex items-center justify-center border border-blue-100 shadow-xs">
              <TrendingUp size={16} />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Real-Time Activity Trends by Module
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 pl-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time
            </span>
            <span>Multi-spline telemetry tracking activity volume by system module</span>
          </div>
        </div>

        {/* Time range selector: 7D, 14D, 30D */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto border border-slate-200">
          {['7D', '14D', '30D'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onChangeTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-[#02236E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Module Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => onSelectModule('all')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
            selectedModule === 'all'
              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Modules</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            selectedModule === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {totalVolume}
          </span>
        </button>

        {MODULE_LINE_DEFS.map((m) => {
          const isSelected = selectedModule === m.key;
          const count = moduleCounts[m.key] || 0;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelectModule(isSelected ? 'all' : m.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                isSelected
                  ? 'text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              style={isSelected ? { backgroundColor: m.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? '#ffffff' : m.color }}
              />
              <span>{m.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-Spline Chart Canvas */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
            <defs>
              {MODULE_LINE_DEFS.map((m) => (
                <linearGradient key={m.gradientId} id={m.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={m.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              width={35}
            />
            <Tooltip
              content={<CustomModuleTooltip selectedModule={selectedModule} />}
              cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }}
            />
            {visibleModules.map((m) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={selectedModule === m.key ? 3.5 : m.strokeWidth}
                fill={`url(#${m.gradientId})`}
                dot={false}
                activeDot={<CustomActiveDot stroke={m.color} />}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Total Volume: <strong className="text-slate-800 font-mono">{totalVolume}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Active Module Lines: <strong className="text-slate-800 font-mono">{activeModulesCount}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Top Module: <strong className="text-emerald-700">{topModule.label} ({topModule.count})</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          Click any module pill above to isolate or toggle its spline trajectory.
        </span>
      </div>
    </div>
  );
}
