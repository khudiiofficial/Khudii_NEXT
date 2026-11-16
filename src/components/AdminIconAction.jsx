'use client';
import Link from 'next/link';
import { Pencil, Copy, Eye, EyeOff, Trash2, ExternalLink, PanelsTopLeft, Check, Save } from 'lucide-react';

const icons = {
  edit: Pencil,
  duplicate: Copy,
  show: Eye,
  hide: EyeOff,
  delete: Trash2,
  view: ExternalLink,
  build: PanelsTopLeft,
  save: Save,
  approve: Check,
};

const actionStyles = {
  edit: 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-[#02236E] hover:border-blue-200',
  duplicate: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#02236E] hover:border-slate-300',
  show: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#02236E]',
  hide: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  delete: 'border-red-200 bg-white text-[#ed0026] hover:bg-red-50 hover:border-red-300',
  view: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
  build: 'border-blue-200 bg-blue-50/50 text-[#02236E] hover:bg-blue-100 hover:border-blue-300',
  save: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  approve: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
};

export default function AdminIconAction({
  action = 'edit',
  label,
  href,
  onClick,
  disabled = false,
  className = '',
  confirming = false,
}) {
  const Icon = icons[action] || Pencil;
  const text =
    label ||
    ({
      edit: 'Edit',
      duplicate: 'Duplicate',
      show: 'Show',
      hide: 'Hide',
      delete: 'Delete',
      view: 'View',
      build: 'Build page',
      save: 'Save',
      approve: 'Approve',
    }[action] || 'Action');

  const actionStyle = actionStyles[action] || 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100';
  const style = `kh-icon-action kh-icon-${action} inline-flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-2xl border transition-all duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40 shadow-2xs ${actionStyle} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label={text} title={text} className={style}>
        <Icon size={16} strokeWidth={2} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={text}
      title={text}
      className={style}
      data-confirming={confirming ? 'true' : undefined}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}
