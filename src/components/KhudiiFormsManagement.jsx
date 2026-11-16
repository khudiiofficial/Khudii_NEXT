'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ClipboardList, Settings2, Paintbrush, Inbox, BarChart3, Plus, Trash2, RefreshCw, Save, Search, Mail, CheckCircle2, AlertCircle, Eye, EyeOff, ChevronDown, Code2, RotateCcw, Copy, Check } from 'lucide-react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';
import { KHUDII_FORMS, DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE } from '@/lib/khudii-form-catalog';
import KhudiiCategorySplineChart from '@/components/KhudiiCategorySplineChart';
import { X } from 'lucide-react';
export { DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE };

const DonationsInbox = dynamic(() => import('@/app/admin-app/dashboard/Donation/page'), { ssr: false });
const OrganizationInquiries = dynamic(() => import('@/app/admin-app/dashboard/Inquiries/page'), { ssr: false });
const RegistrationsInbox = dynamic(() => import('@/app/admin-app/dashboard/OrgRegistration/page'), { ssr: false });
const JobsInbox = dynamic(() => import('@/app/admin-app/dashboard/JobApplication/page'), { ssr: false });
const VolunteersInbox = dynamic(() => import('@/app/admin-app/dashboard/Voulenteer/page'), { ssr: false });
const ContactsInbox = dynamic(() => import('@/app/admin-app/dashboard/Contacts/page'), { ssr: false });
const StoriesInbox = dynamic(() => import('@/app/admin-app/dashboard/Stories/page'), { ssr: false });
const base = () => process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
const headers = { 'x-khudii-surface': 'admin' };
const NAV = [['all', 'All Forms', ClipboardList], ['emailConfigs', 'Email Configs', Settings2], ['emailTemplate', 'Email Template', Paintbrush], ['inbox', 'Inbox', Inbox], ['emailLogs', 'Email Logs', BarChart3], ['donations', 'Donations', Inbox], ['inquiries', 'Organization Inquiries', Inbox], ['registrations', 'Registrations', Inbox], ['jobs', 'Jobs', Inbox], ['volunteers', 'Volunteers', Inbox], ['contacts', 'Contact Messages', Inbox], ['stories', 'Story Submissions', Inbox]];
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#02236E] font-semibold outline-none transition focus:border-[#02236E] focus:ring-2 focus:ring-blue-100';
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6';
const getSub = () => typeof window === 'undefined' ? 'all' : new URLSearchParams(window.location.search).get('sub') || 'all';
const toDate = value => value ? new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '';
function Switch({ checked, onChange, label }) { return <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input className="sr-only peer" type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[#02236E]' : 'bg-slate-200'}`}><span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} /></span>{label}</label> }
function Toolbar({ title, description, onSave, saving, dirty }) { return <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#02236E]">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{onSave && <button type="button" onClick={onSave} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40"><Save size={15} />{saving ? 'Saving...' : 'Save Changes'}</button>}</div> }
function ReadPanel({ title, children }) { return <section className={panel}><h3 className="mb-4 text-sm font-extrabold text-[#02236E]">{title}</h3>{children}</section> }
function TextField({ label, value, onChange, placeholder, rows = 0, hint }) { return <label className="block text-xs font-bold text-slate-600">{label}{rows ? <textarea className={`${inputClass} mt-1.5 min-h-[96px] resize-y`} rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input className={`${inputClass} mt-1.5`} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />} {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}</label> }
export default function KhudiiFormsManagement({ forms, setForms, onSave, saving, dirty }) {
  const [tab, setTab] = useState(() => NAV.some(([id]) => id === getSub()) ? getSub() : 'all');
  const [selected, setSelected] = useState('contact');
  const [inbox, setInbox] = useState([]), [logs, setLogs] = useState([]), [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [filter, setFilter] = useState('all'), [search, setSearch] = useState(''), [selectedItem, setSelectedItem] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null), [detailBusy, setDetailBusy] = useState(false);
  const updateForms = (key, value) => setForms(previous => ({ ...previous, [key]: value }));
  const updateField = (form, key, patch) => setForms(previous => ({ ...previous, [form]: { ...previous[form], fields: { ...previous[form]?.fields, [key]: { ...previous[form]?.fields?.[key], ...patch } } } }));
  const updateEmailConfig = (patch) => setForms(previous => ({ ...previous, emailConfigs: { ...previous.emailConfigs, ...patch } }));
  const updateTemplate = (patch) => setForms(previous => ({ ...previous, emailTemplate: { ...previous.emailTemplate, ...patch } }));
  const changeTab = async (next) => {
    if (next === tab) return;
    if (dirty) {
      const ok = await confirmDialog({
        title: 'Unsaved Changes',
        text: 'You have unsaved settings. Switch tabs without saving?',
        status: 'warning',
        confirmText: 'Discard & Switch',
        cancelText: 'Stay Here',
      });
      if (!ok) return;
    }
    setTab(next);
    setSelectedItem(null);
    const url = new URL(window.location.href);
    url.searchParams.set('sub', next);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  };
  const reload = useCallback(async (which) => {
    setLoading(true); setError('');
    try {
      const endpoint = which === 'inbox' ? '/admin/forms/inbox' : '/admin/forms/email-logs';
      const response = await fetch(`${base()}${endpoint}?form=${encodeURIComponent(filter)}`, { credentials: 'include', headers, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw Error(result.message || 'Unable to load records');
      if (which === 'inbox') { setInbox(result.items || []); setWarnings(result.warnings || []); } else setLogs(result.items || []);
    } catch (e) { setError(e.message || 'Unable to load records'); } finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { if (tab === 'inbox' || tab === 'emailLogs') reload(tab) }, [tab, reload]);
  const rules = Array.isArray(forms.emailConfigs?.formRoutingRules) ? forms.emailConfigs.formRoutingRules : [];
  const allAssigned = rules.flatMap(r => r.forms || []);
  const updateRule = (id, patch) => updateEmailConfig({ formRoutingRules: rules.map(rule => rule.id === id ? { ...rule, ...patch } : rule) });
  const addRule = () => {
    const available = KHUDII_FORMS.find(f => !allAssigned.includes(f.key));
    if (!available) { setError('Every form already belongs to a routing rule.'); return; }
    setError(''); updateEmailConfig({ formRoutingRules: [...rules, { id: `rule_${Date.now()}`, forms: [available.key], sendTo: '', cc: '', bcc: '' }] });
  };
  const changeInboxRead = async (item, value) => {
    setError(''); try { const response = await fetch(`${base()}/admin/forms/inbox/state`, { method: 'PATCH', credentials: 'include', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ form_key: item.form_key, id: item.id, is_read: value }) }); const result = await response.json(); if (!response.ok) throw Error(result.message || 'Could not update inbox'); setInbox(items => items.map(x => x.id === item.id && x.form_key === item.form_key ? { ...x, is_read: value } : x)); setSelectedItem(prev => prev?.id === item.id && prev?.form_key === item.form_key ? { ...prev, is_read: value } : prev); } catch (e) { setError(e.message); }
  };
  async function viewDetail(item) { setSelectedItem(item); setDetail(null); setDetailBusy(true); try { const r = await fetch(`${base()}/admin/forms/inbox/detail/${encodeURIComponent(item.form_key)}/${item.id}`, { credentials: 'include', headers, cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw Error(j.message || 'Could not fetch full submission'); setDetail(j); if (!item.is_read) await changeInboxRead(item, true) } catch (e) { setError(e.message) } finally { setDetailBusy(false) } }
  const logChart = useMemo(() => { const map = new Map(); for (const item of logs) { const day = String(item.created_at || '').slice(0, 10); if (!day) continue; const key = day + ' / ' + String(item.delivery_status || 'unknown'); map.set(key, (map.get(key) || 0) + 1) } return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value })).slice(-35) }, [logs]);
  const counts = useMemo(() => Object.fromEntries(KHUDII_FORMS.map(f => [f.key, inbox.filter(i => i.form_key === f.key).length])), [inbox]);
  const activeForm = KHUDII_FORMS.find(f => f.key === selected) || KHUDII_FORMS[0];
  const filteredInbox = inbox.filter(x => { const q = search.toLowerCase(); return !q || `${x.name} ${x.email} ${x.topic} ${x.message}`.toLowerCase().includes(q) });
  const filteredLogs = logs.filter(x => { const q = search.toLowerCase(); return !q || `${x.form_key} ${x.subject} ${x.recipient_to} ${x.delivery_status}`.toLowerCase().includes(q) });

  const previewHtml = useMemo(() => {
    const raw = forms.emailTemplate?.html || DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE;
    const sampleTable = `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b; font-size: 13px; width: 36%; background-color: #f8fafc; vertical-align: top;">Full Name</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 13px;">John Doe</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b; font-size: 13px; background-color: #f8fafc; vertical-align: top;">Email Address</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 13px;">john.doe@example.com</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b; font-size: 13px; background-color: #f8fafc; vertical-align: top;">Phone Number</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 13px;">+92 3198 548344</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #1e293b; font-size: 13px; background-color: #f8fafc; vertical-align: top;">Subject</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 13px;">General Inquiry</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 700; color: #1e293b; font-size: 13px; background-color: #f8fafc; vertical-align: top;">Message</td>
        <td style="padding: 12px 16px; color: #334155; font-size: 13px; line-height: 1.5;">Looking for details regarding Khudii welfare programs, volunteer onboarding, and donation distribution.</td>
      </tr>
    `;

    let out = String(raw)
      .replace(/\{form_name\}/gi, 'Sample Form Submission')
      .replace(/\{date\}/gi, 'Monday, August 3, 2026')
      .replace(/\{submission_date\}/gi, 'Monday, August 3, 2026')
      .replace(/\{details_table\}/gi, sampleTable)
      .replace(/\{name\}/gi, 'John Doe')
      .replace(/\{email\}/gi, 'john.doe@example.com')
      .replace(/\{subject\}/gi, 'General Inquiry')
      .replace(/\{message\}/gi, 'Looking for details regarding Khudii welfare programs, volunteer onboarding, and donation distribution.')
      .replace(/\{footer\}/gi, forms.emailTemplate?.footer || 'Khudii Welfare Organization');

    return out
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
  }, [forms.emailTemplate?.html, forms.emailTemplate?.footer]);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#02236E]">Forms Management</h2><p className="mt-1 text-sm text-slate-500">Field settings, email routing, notification templates, submissions and delivery history.</p></div><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#02236E]">{KHUDII_FORMS.length} website forms</span></div>
    <div role="tablist" aria-label="Forms Management" className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-100/80 p-2">{NAV.map(([key, title, Icon]) => <button type="button" role="tab" aria-selected={tab === key} key={key} onClick={() => changeTab(key)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${tab === key ? 'bg-[#02236E] text-white shadow-sm' : 'bg-white text-slate-600 hover:text-[#02236E]'}`}><Icon size={15} />{title}</button>)}</div>
    {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
    {tab === 'all' && <div className="space-y-5"><Toolbar title="All Forms" description="All seven public form categories. Select a form to edit labels, placeholders, required flags and visibility." onSave={onSave} dirty={dirty} saving={saving} /><div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]"><section className={panel}><h3 className="mb-3 text-sm font-bold text-[#02236E]">Website forms</h3><div className="space-y-2">{KHUDII_FORMS.map(f => <button key={f.key} type="button" onClick={() => setSelected(f.key)} className={`w-full rounded-xl border p-3 text-left ${selected === f.key ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}><span className="block text-sm font-bold text-[#02236E]">{forms[f.key]?.title || f.name}</span><span className="mt-1 block text-xs text-slate-500">{f.path} · {f.fields.length} fields</span></button>)}</div></section><section className={panel}><h3 className="text-lg font-bold text-[#02236E]">{activeForm.name}</h3><p className="mt-1 text-xs text-slate-500">Updates to field attributes apply to the public form when an existing field can be matched. Server-side requirements remain authoritative.</p><div className="mt-5 space-y-3"><TextField label="Form display title" value={forms[selected]?.title ?? activeForm.name} onChange={v => updateForms(selected, { ...forms[selected], title: v })} /><TextField label="Internal notes" rows={2} value={forms[selected]?.admin_note} onChange={v => updateForms(selected, { ...forms[selected], admin_note: v })} />{activeForm.fields.map(key => { const cfg = forms[selected]?.fields?.[key] || {}; const isExpanded = expanded === key; return <div className="overflow-hidden rounded-xl border border-slate-200" key={key}><button className="flex w-full items-center justify-between gap-2 p-3 text-left" type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : key)}><span className="font-mono text-sm font-semibold text-[#02236E]">{cfg.label || key}</span><ChevronDown size={16} className={isExpanded ? 'rotate-180' : ''} /></button>{isExpanded && <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2"><TextField label="Label" value={cfg.label || ''} onChange={v => updateField(selected, key, { label: v })} placeholder={key} /><TextField label="Placeholder" value={cfg.placeholder || ''} onChange={v => updateField(selected, key, { placeholder: v })} /><Switch label="Show field" checked={cfg.visible !== false} onChange={v => updateField(selected, key, { visible: v })} /><Switch label="Browser required" checked={cfg.required === true} onChange={v => updateField(selected, key, { required: v })} /></div>}</div> })}</div></section></div></div>}
    {tab === 'emailConfigs' && <div className="space-y-4"><Toolbar title="Notification & Email Routing Settings" description="Assign one or more forms to each email rule. CC and BCC support comma- or semicolon-separated addresses." onSave={onSave} dirty={dirty} saving={saving} /><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-700">Per-form Send To email routing <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-[#02236E]">CC & BCC supported</span></p><button type="button" onClick={addRule} className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2 text-sm font-bold text-white"><Plus size={15} />Add Routing Rule</button></div>{rules.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-7 text-center text-sm text-slate-500">No routing rules yet. Email defaults to the configured Khudii owner address.</p>}{rules.map(rule => <section className={panel} key={rule.id}><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[#02236E]">Send to email address <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{(rule.forms || []).length} selected</span></h3><button aria-label="Remove routing rule" title="Remove routing rule" type="button" onClick={async () => { const ok = await confirmDialog({ title: 'Remove Routing Rule', text: 'Remove this routing rule? Unassigned forms will default to the primary organization address.', status: 'warning', confirmText: 'Remove', cancelText: 'Cancel' }); if (ok) updateEmailConfig({ formRoutingRules: rules.filter(r => r.id !== rule.id) }); }} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div><div className="mt-4 flex flex-wrap gap-2">{(rule.forms || []).map(key => <button type="button" key={key} onClick={() => updateRule(rule.id, { forms: rule.forms.filter(x => x !== key) })} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-[#02236E]" title="Unassign form">{KHUDII_FORMS.find(f => f.key === key)?.name || key} <Trash2 className='w-3 h-3 text-red-600'></Trash2> </button>)}<select aria-label="Add form to routing rule" value="" onChange={e => { if (e.target.value) updateRule(rule.id, { forms: [...(rule.forms || []), e.target.value] }) }} className="rounded-lg border border-dashed border-emerald-700 bg-emerald-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800"><option value="">+ Add Forms</option>{KHUDII_FORMS.filter(f => !allAssigned.includes(f.key)).map(f => <option key={f.key} value={f.key}>{f.name}</option>)}</select></div><div className="mt-5 grid gap-3 lg:grid-cols-3">{[['sendTo', 'TO EMAILS', 'Required primary recipients', 'bg-emerald-50/70 border-emerald-100'], ['cc', 'CC EMAILS', 'Optional visible copies', 'bg-violet-50/70 border-violet-100'], ['bcc', 'BCC EMAILS', 'Optional blind copies', 'bg-sky-50/70 border-sky-100']].map(([key, title, hint, color]) => <div key={key} className={`rounded-xl border p-3 ${color}`}><TextField label={title} value={rule[key] || ''} onChange={v => updateRule(rule.id, { [key]: v })} placeholder="name@example.com, other@example.com" hint={hint} /></div>)}</div></section>)}<p className="text-xs text-slate-500">Forms not assigned to a rule continue to email the configured owner address. Save changes before testing email delivery.</p></div>}
    {tab === 'emailTemplate' && <div className="space-y-6">
      <Toolbar title="Notification Email Template" description="Design a responsive HTML notification email matching King Travel architecture. Live preview renders styles, tables, and variables in real time." onSave={onSave} dirty={dirty} saving={saving} />
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left: </> HTML EDITOR */}
        <section className="flex flex-col rounded-2xl border border-[#02236E] bg-[#0c1322] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#02236E] bg-[#080e1a] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>
              <h3 className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-extrabold tracking-wide text-white">
                <span className="text-sky-400">&lt;/&gt;</span> HTML EDITOR
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateTemplate({ html: DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#02236E]/80 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                title="Reset to King Travel default template"
              >
                <RotateCcw size={12} />
                <span>Reset Default</span>
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Code Mode
              </span>
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              aria-label="HTML email template code"
              spellCheck="false"
              className="w-full min-h-[560px] resize-y border-none bg-[#070b14] p-4 font-mono text-xs leading-relaxed text-sky-200 outline-none selection:bg-blue-600 selection:text-white focus:ring-0"
              value={forms.emailTemplate?.html ?? DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE}
              onChange={(e) => updateTemplate({ html: e.target.value })}
              rows={24}
            />
          </div>
          <div className="border-t border-[#02236E] bg-[#080e1a] p-3 text-xs text-slate-400">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Available Variables</span>
              <span className="text-slate-500">Click to insert</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['{form_name}', '{date}', '{details_table}', '{name}', '{email}', '{subject}', '{message}', '{footer}'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const cur = forms.emailTemplate?.html ?? DEFAULT_KINGTRAVEL_EMAIL_TEMPLATE;
                    updateTemplate({ html: cur + '\n' + tag });
                  }}
                  className="rounded-md border border-slate-700/80 bg-[#02236E]/60 px-2 py-0.5 font-mono text-[11px] text-sky-300 transition-colors hover:border-sky-500 hover:bg-[#02236E] hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: REAL-TIME EMAIL TEMPLATE PREVIEW */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#02236E]">
                REAL-TIME EMAIL TEMPLATE PREVIEW
              </h3>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              DYNAMIC PREVIEW
            </span>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200/90 bg-slate-100/70 p-3 sm:p-5 shadow-inner">
            <iframe
              title="Real-time Email Template Preview"
              sandbox="allow-same-origin"
              className="h-[600px] w-full rounded-xl border border-slate-200 bg-white shadow-sm"
              srcDoc={previewHtml}
            />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <TextField
              label="Footer message"
              rows={2}
              value={forms.emailTemplate?.footer || ''}
              onChange={(v) => updateTemplate({ footer: v })}
              placeholder="Khudii Welfare Organization · All Rights Reserved"
              hint="Injected into the {footer} variable in the email body."
            />
          </div>
        </section>
      </div>

      <ReadPanel title="Per-form subject and introduction">
        <div className="grid gap-4 lg:grid-cols-2">
          {KHUDII_FORMS.map((f) => {
            const cfg = forms.emailTemplate?.perForm?.[f.key] || {};
            const update = (key, value) => updateTemplate({ perForm: { ...forms.emailTemplate?.perForm, [f.key]: { ...cfg, [key]: value } } });
            return (
              <div key={f.key} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-[#02236E]">{f.name}</h4>
                <TextField label="Subject template" value={cfg.subject || ''} onChange={(v) => update('subject', v)} placeholder="New submission from {name}" />
                <TextField label="Intro message" rows={2} value={cfg.intro || ''} onChange={(v) => update('intro', v)} />
              </div>
            );
          })}
        </div>
      </ReadPanel>
    </div>}
    {tab === 'donations' && <DonationsInbox />}
    {tab === 'inquiries' && <OrganizationInquiries />}
    {tab === 'registrations' && <RegistrationsInbox />}
    {tab === 'jobs' && <JobsInbox />}
    {tab === 'volunteers' && <VolunteersInbox />}
    {tab === 'contacts' && <ContactsInbox />}
    {tab === 'stories' && <StoriesInbox />}
    {(tab === 'inbox' || tab === 'emailLogs') && <div className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">{tab === 'inbox' ? 'Submission Inbox' : 'Email Delivery Logs'}</h2><p className="mt-1 text-sm text-slate-500">{tab === 'inbox' ? 'Recent records from the actual public submission tables.' : 'Recent SMTP delivery outcomes. Logged after each notification attempt.'}</p></div><button type="button" onClick={() => reload(tab)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button></div>{tab === 'emailLogs' && <section className={panel}><h3 className="font-bold">Email delivery trends (latest 200 log records)</h3><p className="mt-1 text-xs text-slate-500">Actual send, failure, and skip events. Counts are grouped by recorded day and status.</p><KhudiiCategorySplineChart data={logChart} height={220} compact valueLabel="Emails" /></section>}{warnings.length > 0 && tab === 'inbox' && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{warnings.join(' · ')}</p>}<section className={panel}><div className="mb-4 flex flex-wrap gap-3"><select className={inputClass} style={{ maxWidth: 260 }} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All Forms</option>{KHUDII_FORMS.map(f => <option value={f.key} key={f.key}>{f.name}</option>)}</select><label className="relative flex min-w-[220px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className={`${inputClass} pl-10`} placeholder="Search records" value={search} onChange={e => setSearch(e.target.value)} /></label></div>{loading && <p className="py-3 text-sm text-slate-500">Loading...</p>}<div className="overflow-x-auto"><table className="min-w-[750px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500"><tr>{(tab === 'inbox' ? ['Status', 'Form', 'Submitted by', 'Subject', 'Received', 'Action'] : ['Result', 'Form', 'To recipient', 'Subject', 'Date']).map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{tab === 'inbox' ? filteredInbox.map(item => <tr key={`${item.form_key}:${item.id}`} className="border-t border-slate-100"><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-[#02236E]'}`}>{item.is_read ? 'Read' : 'New'}</span></td><td className="p-3 text-xs font-semibold capitalize">{item.form_key}</td><td className="p-3"><span className="font-bold">{item.name}</span><span className="mt-1 block text-xs text-slate-500">{item.email}</span></td><td className="max-w-[220px] truncate p-3">{item.topic || 'Submission'}</td><td className="whitespace-nowrap p-3 text-xs">{toDate(item.created_at)}</td><td className="p-3"><button type="button" className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#02236E]" onClick={() => viewDetail(item)}><Eye size={15} /><span className="sr-only">View submission</span></button></td></tr>) : filteredLogs.map(item => <tr key={item.id} className="border-t border-slate-100"><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.delivery_status === 'sent' ? 'bg-emerald-50 text-emerald-700' : item.delivery_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{item.delivery_status}</span></td><td className="p-3 capitalize">{item.form_key}</td><td className="max-w-[260px] break-all p-3 text-xs">{item.recipient_to || 'None'}</td><td className="max-w-[260px] break-words p-3">{item.subject}</td><td className="whitespace-nowrap p-3 text-xs">{toDate(item.created_at)}</td></tr>)}</tbody></table>{!loading && !(tab === 'inbox' ? filteredInbox : filteredLogs).length && <p className="py-8 text-center text-sm text-slate-500">No matching records. Logs require the forms SQL migration and a new email attempt.</p>}</div></section>{tab === 'inbox' && selectedItem && <section className={panel}><div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-extrabold">Submission detail: {KHUDII_FORMS.find(f => f.key === selectedItem.form_key)?.name || selectedItem.form_key}</h3><p className="mt-1 text-xs text-slate-500">{toDate(selectedItem.created_at)} · Record #{selectedItem.id}</p></div><button type="button" title="Close details" aria-label="Close details" className="rounded-lg border p-2" onClick={() => { setSelectedItem(null); setDetail(null) }}><X size={16} /></button></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><header className="bg-[#02236E] p-5 text-center text-lg font-bold text-white">Khudii · {KHUDII_FORMS.find(f => f.key === selectedItem.form_key)?.name || 'Submission'}</header><div className="p-5">{detailBusy ? <p className="text-sm">Loading full form details...</p> : detail?.fields?.length ? <dl className="divide-y divide-slate-100">{detail.fields.map(f => <div className="grid gap-2 py-3 text-sm sm:grid-cols-[200px_1fr]" key={f.key}><dt className="font-bold text-slate-700">{f.label}</dt><dd className="whitespace-pre-wrap break-words text-[#02236E]">{f.value}</dd></div>)}</dl> : <p className="text-sm text-slate-500">Full submission details are unavailable.</p>}</div><footer className="bg-slate-50 p-3 text-xs text-slate-500">All submission values are shown as text, not interpreted as HTML.</footer></div><button onClick={() => changeInboxRead(selectedItem, !selectedItem.is_read)} className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold">{selectedItem.is_read ? <EyeOff size={16} /> : <Eye size={16} />}Mark {selectedItem.is_read ? 'unread' : 'read'}</button></section>}</div>}
  </div>;
}
