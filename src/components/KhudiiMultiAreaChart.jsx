'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

/* ─── Multi-series wavy area chart for Khudii dashboard/activity ─── */

const PALETTE = ['#2563eb', '#0891b2', '#d97706', '#7c3aed', '#dc2626', '#059669'];

function MultiTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#02236E] px-3 py-2.5 text-xs text-white shadow-xl min-w-[140px]">
      <div className="mb-2 font-bold text-slate-300">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <strong>{Number(p.value || 0).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export default function KhudiiMultiAreaChart({
  records = [],
  series,
  days = 30,
  endDate,
  height = 240,
}) {
  const chart = useMemo(() => {
    const end = endDate ? new Date(`${endDate}T00:00:00.000Z`) : new Date(Date.now() - 86400000);
    end.setUTCHours(0, 0, 0, 0);
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(end);
      d.setUTCDate(d.getUTCDate() - days + 1 + i);
      return d.toISOString().slice(0, 10);
    });

    // Detect categories if no explicit series provided
    const cats = series
      ? series.map((s) => s.key)
      : [...new Set(records.map((r) => r.category))];

    const seriesDefs = cats.map((key, idx) => ({
      key,
      label: series?.find((s) => s.key === key)?.label ?? key,
      color: series?.find((s) => s.key === key)?.color ?? PALETTE[idx % PALETTE.length],
    }));

    const data = dates.map((date) => {
      const row = { date: date.slice(5) }; // MM-DD
      for (const s of seriesDefs) {
        row[s.key] = records
          .filter((r) => String(r.day).slice(0, 10) === date && r.category === s.key)
          .reduce((acc, r) => acc + Number(r.count), 0);
      }
      return row;
    });

    return { data, seriesDefs };
  }, [records, series, days, endDate]);

  if (!chart.seriesDefs.length) {
    return <div className="p-8 text-center text-sm text-slate-400">No data for this period.</div>;
  }

  const hasActivity = chart.data.some(row => chart.seriesDefs.some(def => Number(row[def.key]) > 0));
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      {!hasActivity && <p role="status" className="mb-2 text-xs text-slate-500">No recorded activity for this period. Zero is shown instead of estimated data.</p>}
      <div style={{ height, minWidth: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart.data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
            <defs>
              {chart.seriesDefs.map((s) => (
                <linearGradient key={s.key} id={`khudii-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              interval={Math.max(0, Math.floor(days / 7) - 1)}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={26} tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <Tooltip content={<MultiTooltip />} cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} formatter={(value) => chart.seriesDefs.find((s) => s.key === value)?.label ?? value} />
            {chart.seriesDefs.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.key}
                stroke={s.color}
                strokeWidth={2.2}
                fill={`url(#khudii-grad-${s.key})`}
                dot={false}
                activeDot={{ r: 4, fill: '#fff', stroke: s.color, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
