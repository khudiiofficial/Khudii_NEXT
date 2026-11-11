'use client';
/** Accessible control shared by CMS section visibility and published content. */
export default function AdminPublishSwitch({checked,onChange,disabled=false,label='Published'}) {
  return <label className={`inline-flex items-center gap-2.5 text-sm font-semibold ${disabled?'cursor-not-allowed opacity-50':'cursor-pointer'} text-slate-700`}>
    <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
      <input type="checkbox" role="switch" aria-label={label} aria-checked={Boolean(checked)} checked={Boolean(checked)} disabled={disabled} onChange={event=>onChange(event.target.checked)} className="peer sr-only"/>
      <span className={`h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-500 ${checked?'bg-[#2563eb]':'bg-slate-300'}`}/>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked?'translate-x-5':'translate-x-0'}`}/>
    </span>
    <span>{label}</span>
  </label>;
}
