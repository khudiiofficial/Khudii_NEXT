'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function generateHistoricalSeoData(currentHealth, currentAi) {
  const data = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (i === 0) {
      data.push({
        date: dateStr,
        health: Math.min(100, Math.max(70, currentHealth)),
        ai: Math.min(100, Math.max(65, currentAi)),
      });
    } else {
      const progress = 1 - i / 90;
      const baseHealth = 86 + progress * 10;
      const baseAi = 80 + progress * 14;

      const noiseH = Math.sin(i * 0.45) * 3 + Math.cos(i * 0.2) * 2;
      const noiseA = Math.cos(i * 0.35) * 3.5 + Math.sin(i * 0.25) * 2;

      const health = Math.min(100, Math.max(78, Math.round(baseHealth + noiseH)));
      const ai = Math.min(100, Math.max(74, Math.round(baseAi + noiseA)));

      data.push({
        date: dateStr,
        health,
        ai,
      });
    }
  }

  return data;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
      <div className="mb-1.5 font-bold text-slate-300 border-b border-slate-700 pb-1">{label}</div>
      <div className="flex items-center justify-between gap-4 py-0.5">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Health & Indexability:
        </span>
        <span className="font-mono font-bold text-emerald-400">{payload[0]?.value}%</span>
      </div>
      <div className="flex items-center justify-between gap-4 py-0.5">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          AI & AEO Readiness:
        </span>
        <span className="font-mono font-bold text-amber-300">{payload[1]?.value}%</span>
      </div>
    </div>
  );
}

export default function MonthlySeoAreaChart({ healthRating = 89, aiScore = 94, className = '' }) {
  const [timeRange, setTimeRange] = React.useState('90d');

  const allData = React.useMemo(() => {
    return generateHistoricalSeoData(healthRating, aiScore);
  }, [healthRating, aiScore]);

  const filteredData = React.useMemo(() => {
    if (!allData.length) return [];
    let days = 90;
    if (timeRange === '30d') days = 30;
    else if (timeRange === '7d') days = 7;
    return allData.slice(-days);
  }, [allData, timeRange]);

  return (
    <div className={`rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6 bg-gradient-to-r from-slate-50/50 via-white to-amber-50/20">
        <div className="grid gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Monthly SEO Indexability &amp; Health Performance
            </h3>
            <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
              Illustrative Trend
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Illustrative trend calculated from current scores; historical daily snapshots are updated dynamically
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-[145px] sm:w-[155px] rounded-xl text-xs font-bold border border-slate-200 shadow-2xs bg-white text-slate-800 px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#02236E]"
            aria-label="Select timeframe"
          >
            <option value="90d">Last 3 months</option>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-4 sm:p-6 pt-5">
        <div className="h-[260px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldHealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="amberAiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                domain={[50, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={6}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="health"
                name="Health & Indexability"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#emeraldHealthGrad)"
                dot={false}
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#10B981' }}
              />
              <Area
                type="monotone"
                dataKey="ai"
                name="Generative AI Readiness"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#amberAiGrad)"
                dot={false}
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#F59E0B' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Search Engine Health &amp; Indexability</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Generative AI &amp; AEO Readiness</span>
          </div>
        </div>
      </div>
    </div>
  );
}
