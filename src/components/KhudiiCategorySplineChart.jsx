'use client';

import * as React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

/* ─── Shared wavy spline area chart for Khudii admin panels ─── */

function SplineTooltip({ active, payload, valueLabel }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-[#02236E] px-3 py-2.5 text-xs text-white shadow-xl min-w-[130px]">
      <div className="mb-1 font-bold text-white">{item.name}</div>
      <div>{valueLabel}: <strong>{Number(item.value || 0).toLocaleString()}</strong></div>
      {item.pct !== undefined && <div>Share: <strong>{item.pct}%</strong></div>}
      {item.subtext && <div className="mt-1 max-w-[200px] text-[10px] text-slate-300">{item.subtext}</div>}
    </div>
  );
}

export default function KhudiiCategorySplineChart({
  data,
  height = 230,
  color = '#2563eb',
  compact = false,
  valueLabel = 'Count',
}) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const small = compact || data.length > 7;
  const dot = (props) => {
    const { cx, cy, payload } = props;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return <g />;
    return <circle key={`dot-${payload.name}`} cx={cx} cy={cy} r={3.5} fill={payload.color || color} stroke="#fff" strokeWidth={1.5} />;
  };
  return (
    <div className="w-full min-w-0 overflow-x-auto" aria-label={`${valueLabel} by category`}>
      <div style={{ height, minWidth: compact ? 280 : Math.max(280, data.length * 68) }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 16, bottom: small ? 42 : 22, left: -12 }}>
            <defs>
              <linearGradient id={`khudii-fill-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              height={small ? 58 : 40}
              angle={small ? -32 : 0}
              textAnchor={small ? 'end' : 'middle'}
              tickLine={false}
              tick={{ fontSize: small ? 9 : 10, fill: '#64748B' }}
              tickFormatter={(l) => l.length > (small ? 11 : 18) ? `${l.slice(0, small ? 10 : 17)}…` : l}
            />
            <YAxis allowDecimals={false} domain={[0, 'auto']} tickLine={false} axisLine={false} width={28} tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <Tooltip cursor={{ stroke: '#94A3B8', strokeDasharray: '3 3' }} content={<SplineTooltip valueLabel={valueLabel} />} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#khudii-fill-${id})`} dot={dot} activeDot={{ r: 5, fill: '#fff', stroke: color, strokeWidth: 2.5 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
