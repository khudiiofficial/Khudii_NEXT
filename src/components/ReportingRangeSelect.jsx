'use client';
import { REPORT_PERIODS } from '@/lib/reporting-periods';
export default function ReportingRangeSelect({value,onChange}) {
  return <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">Reporting period
    <select aria-label="Reporting period" value={value} onChange={e=>onChange(Number(e.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
      {REPORT_PERIODS.map(p=><option key={p.days} value={p.days}>{p.label}</option>)}
    </select>
  </label>;
}
