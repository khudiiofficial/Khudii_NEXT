'use client';

import * as React from 'react';
import KhudiiCategorySplineChart from '@/components/KhudiiCategorySplineChart';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export function ProjectHorizontalBarChart({
  title,
  subtitle,
  totalCount,
  totalLabel = 'All Records',
  data = [],
  badgeText,
  badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200',
  linkHref,
  linkLabel,
  trendingText,
  footerText,
  compact = false,
  layout = 'horizontal',
  showZeroValues = false,
  headerExtra,
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);

  const validData = React.useMemo(() => {
    if (showZeroValues) return data;
    return data.filter((d) => (d.value || 0) > 0 || data.length <= 1);
  }, [data, showZeroValues]);

  const displayData = validData.length > 0 ? validData : data;

  const total = React.useMemo(() => {
    const sum = displayData.reduce((acc, d) => acc + (d.value || 0), 0);
    return Math.max(totalCount > 0 ? totalCount : sum, sum, 1);
  }, [displayData, totalCount]);

  const chartData = React.useMemo(() => {
    return displayData.map((item, idx) => {
      const pct =
        item.pct !== undefined
          ? item.pct
          : Math.round(((item.value || 0) / total) * 1000) / 10;
      return {
        ...item,
        idx,
        pct,
        fill: item.fill || item.color || '#10B981',
      };
    });
  }, [displayData, total]);

  const chartHeight = Math.max(180, Math.min(300, chartData.length * 36 + 40));

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#02236E] shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0 tracking-tight leading-snug">
            {title}
          </h3>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 font-normal m-0 pl-8 leading-relaxed">
            {subtitle}
          </p>
        )}

        {(badgeText || (linkHref && linkLabel)) && (
          <div className="flex items-center gap-1.5 pl-8 flex-wrap pt-0.5">
            {badgeText && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeBg}`}>
                {badgeText}
              </span>
            )}
            {linkHref && linkLabel && (
              <a
                href={linkHref}
                className="text-[11px] font-bold text-[#02236E] hover:underline flex items-center gap-0.5 ml-1"
              >
                <span>{linkLabel}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          No records to visualize yet.
        </div>
      ) : (
        <div
          className={
            layout === 'horizontal'
              ? `grid grid-cols-1 ${compact ? 'gap-4' : 'lg:grid-cols-12 gap-6'} items-center`
              : 'flex flex-col gap-4'
          }
        >
          {/* Spline Chart Canvas */}
          <div
            className={
              layout === 'horizontal'
                ? `${compact ? 'w-full' : 'lg:col-span-7'} w-full`
                : 'w-full'
            }
          >
            <p className="mb-2 text-[11px] text-slate-500 font-medium">
              Volume by category · Exact count and share on hover
            </p>
            <KhudiiCategorySplineChart
              data={chartData.map((item) => ({
                name: item.name,
                value: item.value,
                pct: item.pct,
                color: item.fill,
                subtext: item.subtext,
              }))}
              height={Math.max(200, Math.min(280, chartHeight))}
              compact={compact}
            />
          </div>

          {headerExtra && <div className="w-full pt-2">{headerExtra}</div>}

          {/* Category Breakdown List */}
          <div
            className={
              layout === 'horizontal'
                ? `${compact ? 'w-full' : 'lg:col-span-5'} flex flex-col gap-2`
                : 'flex flex-col gap-2'
            }
          >
            {chartData.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={`${item.name}-${idx}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-xs translate-x-1'
                      : 'bg-slate-50/60 border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      style={{ backgroundColor: item.fill }}
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {item.subtext || `${item.pct}% relative share`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      style={{ color: item.fill }}
                      className="text-[11px] font-bold font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs"
                    >
                      {item.pct}%
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono w-7 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/60 rounded-xl px-4 py-2.5 flex items-center justify-between border border-emerald-100/80">
        <span className="text-xs font-bold text-slate-800">{totalLabel || 'All Records'}</span>
        <span className="text-xs font-black text-[#02236E] font-mono">
          {totalCount.toLocaleString()} units • 100% Total
        </span>
      </div>

      {/* Footer */}
      {(trendingText || footerText) && (
        <div className="flex flex-col gap-0.5 pt-0.5">
          {trendingText && (
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1 hover:text-[#02236E] transition-colors cursor-pointer">
              {trendingText} <span className="text-xs font-bold leading-none">↗</span>
            </div>
          )}
          {footerText && (
            <div className="text-[11px] text-slate-500 font-normal leading-relaxed">{footerText}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectHorizontalBarChart;
export {
  ProjectHorizontalBarChart as ProjectLineChart,
  ProjectHorizontalBarChart as ProjectRadialBarChart,
};
