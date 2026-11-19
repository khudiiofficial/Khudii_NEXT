'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import KhudiiMenuTreeEditor from '@/components/KhudiiMenuTreeEditor';
import { confirmDialog, alertNotice } from '@/lib/dialogs';
import { AppButton, SaveButton } from '@/components/ui/AppButton';
import { EditButton, DeleteButton } from '@/components/ui/CrudActions';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
const CLASS = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#02236E] focus:border-[#02236E] focus:outline-none';
const MAX_FILE = 8 * 1024 * 1024;

async function api(path, method = 'GET', body) {
  const headers = {
    'x-khudii-surface': 'admin',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  };
  const response = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store'
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) throw new Error(json.message || json.error || `Request failed (${response.status})`);
  return json;
}

function confirm(title, text, status = 'success', confirmText) {
  return confirmDialog({ title, text, status, ...(confirmText ? { confirmText } : {}) });
}

function notify(title, status = 'success', text) {
  return alertNotice({ title, text, status });
}
function Input({ label, value, onChange, type = 'text', required = false, maxLength = 500 }) { return <label className="block text-sm font-semibold text-slate-700">{label}<input type={type} required={required} maxLength={maxLength} value={value ?? ''} onChange={e => onChange(e.target.value)} className={`${CLASS} mt-1.5`} /></label>; }
function Section({ title, description, children }) { return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-base font-bold text-[#02236E]">{title}</h3><p className="mt-1 text-xs text-slate-500">{description}</p></div>{children}</section>; }

const AVAILABLE_SEARCH_AREAS = [
  { id: 'organizations', label: 'Organizations', description: 'Welfare organizations and NGOs' },
  { id: 'blogs', label: 'Blogs & Articles', description: 'News, blog posts, and articles' },
  { id: 'categories', label: 'Categories / Sectors', description: 'Welfare causes (Health, Education, Autism, etc.)' },
  { id: 'stories', label: 'Success Stories', description: 'Beneficiary and community impact stories' },
  { id: 'podcasts', label: 'Podcasts & Media', description: 'Video and audio podcast episodes' },
  { id: 'events', label: 'Events', description: 'Community drives, conferences, and seminars' },
];

function HeaderEditor({ onDirty }) {
  const [items, setItems] = useState([]), [telephone, setTelephone] = useState({ phone_number: '', icon_name: '' });
  const [headerActions, setHeaderActions] = useState({ show_search: true, search_placeholder: 'Search Organization', search_areas: ['organizations', 'blogs', 'categories', 'stories'], show_donate_button: true, donate_button_text: 'Donate Now', donate_button_url: '/donate-now' });
  const [draft, setDraft] = useState(''), [editing, setEditing] = useState(null), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([api('/api/topbar'), api('/api/telephone'), api('/api/header').catch(() => ({ data: null }))]);
      setItems(a.data || []);
      setTelephone(b.data || { phone_number: '', icon_name: '' });
      if (c?.data) setHeaderActions(prev => ({ ...prev, ...c.data }));
    } catch (e) {
      await notify('Could not load header settings', 'error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  async function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return notify('Header message is required', 'error');
    if (!await confirm(editing === null ? 'Create header message?' : 'Update header message?', 'Changes appear on the live frontend after saving.', 'success', 'Save Message')) return;
    setBusy(true);
    try {
      await api(editing === null ? '/api/topbar' : `/api/topbar/${editing}`, editing === null ? 'POST' : 'PUT', { text: draft.trim() });
      setEditing(null);
      setDraft('');
      onDirty('message', false);
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await load();
      await notify('Header message saved');
    }
    catch (e) { await notify('Could not save header message', 'error', e.message); } finally { setBusy(false); }
  }
  async function remove(item) {
    if (!await confirm('Delete header message?', 'This permanently removes the selected message.', 'error', 'Delete')) return;
    setBusy(true);
    try {
      await api(`/api/topbar/${item.id}`, 'DELETE');
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await load();
      await notify('Header message deleted');
    }
    catch (e) { await notify('Delete failed', 'error', e.message); } finally { setBusy(false); }
  }
  async function saveTelephone(e) {
    e.preventDefault();
    if (!telephone.phone_number?.trim() || !telephone.icon_name?.trim()) return notify('Both telephone fields are required', 'error');
    if (!await confirm('Save header phone details?', 'The telephone number and icon will update on the public site.', 'success', 'Save Phone')) return;
    setBusy(true);
    try {
      await api('/api/telephone', 'PUT', { phone_number: telephone.phone_number.trim(), icon_name: telephone.icon_name.trim() });
      onDirty('telephone', false);
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await notify('Header phone details updated');
    }
    catch (e) { await notify('Could not save phone details', 'error', e.message); } finally { setBusy(false); }
  }
  async function saveHeaderActions(e) {
    e.preventDefault();
    if (!await confirm('Save header search & donate settings?', 'Changes to the search bar and donate button will immediately update on the public site.', 'success', 'Save Settings')) return;
    setBusy(true);
    try {
      await api('/api/header', 'PUT', headerActions);
      onDirty('headerActions', false);
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await notify('Header actions updated');
    } catch (e) {
      await notify('Could not save header actions', 'error', e.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="flex items-center gap-2 text-slate-600"><Loader2 className="animate-spin" size={18} /> Loading header settings...</p>;
  return <div className="space-y-5">
    <Section title="Header Search & Donate Button" description="Control the search bar and donate button displayed in the primary header.">
      <form onSubmit={saveHeaderActions} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={headerActions.show_search}
                onChange={e => {
                  setHeaderActions(d => ({ ...d, show_search: e.target.checked }));
                  onDirty('headerActions', true);
                }}
                className="h-5 w-5 accent-[#02236E]"
              />
              <span className="text-sm font-bold text-[#02236E]">Show Search Bar</span>
            </label>
            <Input
              label="Search placeholder"
              maxLength={100}
              value={headerActions.search_placeholder}
              onChange={v => {
                setHeaderActions(d => ({ ...d, search_placeholder: v }));
                onDirty('headerActions', true);
              }}
            />

            {/* Custom Search Scope Filter (Multiple Selection) */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Searchable Content Areas
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderActions(d => ({
                        ...d,
                        search_areas: AVAILABLE_SEARCH_AREAS.map(a => a.id),
                      }));
                      onDirty('headerActions', true);
                    }}
                    className="font-bold text-[#02236E] hover:underline"
                  >
                    All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderActions(d => ({
                        ...d,
                        search_areas: ['organizations'],
                      }));
                      onDirty('headerActions', true);
                    }}
                    className="font-bold text-slate-500 hover:underline"
                  >
                    Orgs only
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Choose which content areas are queried and displayed in the frontend search bar.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SEARCH_AREAS.map(area => {
                  const currentAreas = Array.isArray(headerActions.search_areas) && headerActions.search_areas.length > 0
                    ? headerActions.search_areas
                    : ['organizations', 'blogs', 'categories', 'stories'];
                  const isChecked = currentAreas.includes(area.id);
                  return (
                    <label
                      key={area.id}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition ${isChecked
                          ? 'border-blue-300 bg-blue-50/70 text-[#02236E]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          const set = new Set(currentAreas);
                          if (e.target.checked) set.add(area.id);
                          else set.delete(area.id);
                          if (set.size === 0) set.add('organizations');
                          setHeaderActions(d => ({ ...d, search_areas: Array.from(set) }));
                          onDirty('headerActions', true);
                        }}
                        className="h-4 w-4 accent-[#02236E] rounded"
                      />
                      <span className="truncate">{area.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={headerActions.show_donate_button}
                onChange={e => {
                  setHeaderActions(d => ({ ...d, show_donate_button: e.target.checked }));
                  onDirty('headerActions', true);
                }}
                className="h-5 w-5 accent-[#02236E]"
              />
              <span className="text-sm font-bold text-[#02236E]">Show Donate Button</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Button text"
                maxLength={60}
                value={headerActions.donate_button_text}
                onChange={v => {
                  setHeaderActions(d => ({ ...d, donate_button_text: v }));
                  onDirty('headerActions', true);
                }}
              />
              <Input
                label="Button link URL"
                maxLength={500}
                value={headerActions.donate_button_url}
                onChange={v => {
                  setHeaderActions(d => ({ ...d, donate_button_url: v }));
                  onDirty('headerActions', true);
                }}
              />
            </div>
          </div>
        </div>

        <SaveButton loading={busy}>
          Save header search & donate settings
        </SaveButton>
      </form>
    </Section>

    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Top-bar messages" description="Create, edit and remove announcement text from the existing header.">
        <form onSubmit={submit} className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            Message
            <textarea className={CLASS + ' mt-1.5'} maxLength={2000} required rows={3} value={draft} onChange={e => { setDraft(e.target.value); onDirty('message', true); }} />
          </label>
          <div className="flex gap-2">
            <AppButton action={editing === null ? 'add' : 'save'} type="submit" loading={busy}>
              {editing === null ? 'Add message' : 'Save message'}
            </AppButton>
            {editing !== null && (
              <AppButton action="cancel" onClick={() => { setEditing(null); setDraft(''); onDirty('message', false); }} />
            )}
          </div>
        </form>
        <div className="space-y-2">
          {items.length ? items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <span className="min-w-0 flex-1 text-sm break-words">{item.text}</span>
              <div className="flex items-center gap-1.5">
                <EditButton
                  disabled={busy}
                  label="announcement"
                  onClick={async () => {
                    if (draft.trim() && !await confirm('Discard current message draft?', 'Any unsaved message text will be lost.', 'warning')) return;
                    setEditing(item.id);
                    setDraft(item.text || '');
                    onDirty('message', false);
                  }}
                />
                <DeleteButton
                  disabled={busy}
                  label="announcement"
                  onClick={() => remove(item)}
                />
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No header announcements yet.</p>}
        </div>
      </Section>
      <Section title="Header telephone" description="Manage the telephone details used by the existing header.">
        <form className="space-y-4" onSubmit={saveTelephone}>
          <Input label="Telephone number" required maxLength={40} value={telephone.phone_number} onChange={v => { setTelephone(d => ({ ...d, phone_number: v })); onDirty('telephone', true); }} />
          <Input label="Icon class" required maxLength={100} value={telephone.icon_name} onChange={v => { setTelephone(d => ({ ...d, icon_name: v })); onDirty('telephone', true); }} />
          <SaveButton loading={busy}>Save telephone</SaveButton>
        </form>
      </Section>
    </div>
  </div>;
}
function FooterEditor({ onDirty }) {
  const [data, setData] = useState({ footertext: '', email: '', location: '', locationinfo: '', logoimage: '', pageimage: '' });
  const [files, setFiles] = useState({}), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const json = await api('/api/footer'); setData(d => ({ ...d, ...json.data })); } catch (e) { await notify('Could not load footer settings', 'error', e.message); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const change = (key, value) => { setData(p => ({ ...p, [key]: value })); onDirty('footer', true); };
  function choose(key, file) { if (!file) return; if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(file.type) || file.size > MAX_FILE) { notify('Invalid image', 'error', 'Select a PNG, JPG, WebP, GIF, or AVIF file smaller than 8 MB.'); return; } setFiles(p => ({ ...p, [key]: file })); onDirty('footer', true); }
  async function asDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Unable to read image')); reader.readAsDataURL(file); }); }
  async function save(e) {
    e.preventDefault(); if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return notify('Please enter a valid email address', 'error'); if (!await confirm('Save footer changes?', 'The public site will display the updated footer.', 'success')) return;
    setBusy(true);
    try {
      const payload = Object.fromEntries(['footertext', 'email', 'location', 'locationinfo'].map(k => [k, data[k] || '']));
      for (const key of ['logoimage', 'pageimage']) if (files[key]) payload[`${key}_base64`] = await asDataUrl(files[key]);
      await api('/api/footer', 'PUT', payload);
      setFiles({});
      onDirty('footer', false);
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await load();
      await notify('Footer updated');
    }
    catch (e) { await notify('Could not update footer', 'error', e.message); } finally { setBusy(false); }
  }
  async function removeImage(key) {
    if (!await confirm('Remove footer image?', 'The image will no longer appear in the footer.', 'error')) return;
    setBusy(true);
    try {
      await api(`/api/footer/image/${key==='logoimage'?'logo':'page'}`, 'DELETE');
      setFiles(p => ({ ...p, [key]: undefined }));
      window.dispatchEvent(new CustomEvent('khudii:dirty', { detail: { dirty: false } }));
      await load();
      await notify('Footer image removed');
    } catch (e) {
      await notify('Could not remove image', 'error', e.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="flex items-center gap-2 text-slate-600"><Loader2 className="animate-spin" size={18} /> Loading footer settings...</p>;
  return <Section title="Footer content" description="Manage the logo, contact details, description, and media used by the Khudii public footer."><form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
    <label className="md:col-span-2 text-sm font-semibold text-slate-700">Footer description<textarea rows={4} maxLength={15000} value={data.footertext || ''} onChange={e => change('footertext', e.target.value)} className={`${CLASS} mt-1.5`} /></label>
    <Input label="Footer email" type="email" maxLength={255} value={data.email} onChange={v => change('email', v)} /><Input label="Location display" maxLength={1000} value={data.locationinfo} onChange={v => change('locationinfo', v)} />
    <div className="md:col-span-2"><Input label="Map URL" value={data.location} maxLength={2000} onChange={v => change('location', v)} /></div>
    {['logoimage', 'pageimage'].map((key) => <div key={key} className="space-y-2 rounded-xl border border-slate-200 p-4"><div className="text-sm font-semibold">{key === 'logoimage' ? 'Footer logo' : 'Footer image'}</div>{data[key] && <img src={data[key]} alt="Current footer asset" className="h-28 max-w-full object-contain" />}<label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"><ImagePlus size={16} /> Select image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="sr-only" onChange={e => choose(key, e.target.files?.[0])} /></label>{files[key] && <span className="block truncate text-xs text-slate-500">{files[key].name}</span>}{data[key] && <button type="button" disabled={busy} className="flex items-center gap-1 text-xs text-red-700" onClick={() => removeImage(key)}><Trash2 size={15} /> Remove image</button>}</div>)}
    <div className="md:col-span-2"><SaveButton loading={busy}>Save footer changes</SaveButton></div>
  </form></Section>;
}
export default function SettingsSiteChrome({ onDirty = () => { }, mode, profile = {}, setProfile, onSaveProfile, savingProfile = false }) {
  const [sub, setSub] = useState(() => (mode === 'footer' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sub') === 'footer') ? 'footer' : 'header'));
  useEffect(() => { if (mode) setSub(mode === 'footer' ? 'footer' : 'header'); }, [mode]);
  const [dirty, setDirty] = useState(false);
  const dirtySources = useRef(new Map());
  const markDirty = (source, value) => { dirtySources.current.set(source, Boolean(value)); const next = [...dirtySources.current.values()].some(Boolean); setDirty(next); onDirty(next); };
  const pick = value => { if (dirty) { notify('Unsaved changes', 'error', 'Save or discard your edits before switching sections.'); return; } setSub(value); const u = new URL(window.location.href); u.searchParams.set('sub', value); window.history.replaceState(window.history.state, '', u.pathname + u.search); };
  const socialFields = [
    ['facebook', 'Facebook URL'],
    ['instagram', 'Instagram URL'],
    ['youtube', 'YouTube URL'],
    ['linkedin', 'LinkedIn URL'],
    ['twitter', 'Twitter / X URL'],
    ['tiktok', 'TikTok URL'],
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {[
          { id: 'header', label: 'Header Navigation & Topbar' },
          { id: 'footer', label: 'Footer Settings & Links' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${sub === t.id ? 'bg-[#02236E]/10 text-[#02236E]' : 'text-slate-500 hover:text-[#02236E] hover:bg-slate-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === 'header' ? (
        <>
          <HeaderEditor onDirty={markDirty} />
          <div className="pt-2">
            <KhudiiMenuTreeEditor location="header" />
          </div>
        </>
      ) : (
        <>
          <FooterEditor onDirty={markDirty} />
          {setProfile && (
            <Section
              title="Footer Social Media Links"
              description="Configure the official social media URLs displayed in the public Khudii footer."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {socialFields.map(([key, label]) => (
                  <Input
                    key={key}
                    label={label}
                    type="url"
                    value={profile[key] || ''}
                    onChange={(v) => setProfile((prev) => ({ ...prev, [key]: v }))}
                  />
                ))}
              </div>
              {onSaveProfile && (
                <div>
                  <SaveButton loading={savingProfile} onClick={onSaveProfile}>
                    Save Social Links
                  </SaveButton>
                </div>
              )}
            </Section>
          )}
          <div className="pt-2">
            <KhudiiMenuTreeEditor location="footer" />
          </div>
        </>
      )}
    </div>
  );
}
