'use client';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Loader2, RefreshCw, WandSparkles } from 'lucide-react';
import { adminConfirm } from '@/lib/admin-dialogs';
import { youtubeVideoId, slugifyContent } from '@/server/shared/youtube.js';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';

const API = `${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/api/podcasts`;
const adminRequest = { withCredentials: true, headers: { 'x-khudii-surface': 'admin' } };
const empty = { title: '', slug: '', youtube_url: '', description: '', sort_order: 0, is_published: true, seo_title: '', seo_description: '', seo_keywords: '', seo_image: '' };
const field = 'mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
function payloadOf(episode, overrides = {}) {
  return { title: episode.title, slug: episode.slug, youtube_url: episode.youtube_id, description: episode.description || '', sort_order: episode.sort_order, is_published: Boolean(episode.is_published), seo_title: episode.seo_title || '', seo_description: episode.seo_description || '', seo_keywords: episode.seo_keywords || '', seo_image: episode.seo_image || '', ...overrides };
}
export default function PodcastAdminPage() {
  const [episodes, setEpisodes] = useState([]), [form, setForm] = useState(empty), [editing, setEditing] = useState(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [reordering, setReordering] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [youtubeState, setYoutubeState] = useState(''), [youtubeMeta, setYoutubeMeta] = useState(null);
  const [touched, setTouched] = useState({}), [seoOpen, setSeoOpen] = useState(true);
  const dragId = useRef(null), currentVideo = useRef('');
  const load = useCallback(async () => {
    try { setError(''); const { data } = await axios.get(API, adminRequest); if (!Array.isArray(data.items)) throw Error('Unexpected server response'); setEpisodes(data.items); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Could not load podcasts'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  function update(field, value, manual = true) {
    if (manual) setTouched(p => ({ ...p, [field]: true }));
    setForm(p => ({ ...p, [field]: value, ...(field === 'title' && !touched.slug ? { slug: slugifyContent(value) } : {}) }));
  }
  function startEdit(episode) {
    setEditing(episode.id); setForm(payloadOf(episode)); setTouched({ title: true, description: true, slug: true, seo_title: true, seo_description: true, seo_image: true }); setYoutubeMeta(null); setYoutubeState(''); setError(''); setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() { setEditing(null); setForm(empty); setTouched({}); setYoutubeMeta(null); setYoutubeState(''); setError(''); }
  const videoId = youtubeVideoId(form.youtube_url);
  useEffect(() => {
    if (!videoId) { setYoutubeState(''); setYoutubeMeta(null); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      currentVideo.current = videoId;
      setYoutubeState('Reading video information from YouTube…');
      try {
        const { data } = await axios.get(`${API}/youtube-metadata`, { ...adminRequest, params: { url: form.youtube_url }, signal: ctrl.signal });
        if (currentVideo.current !== videoId) return;
        setYoutubeMeta(data);
        setForm(prev => {
          const next = { ...prev };
          if (!touched.title && data.title) next.title = data.title;
          if (!touched.slug && data.title) next.slug = slugifyContent(data.title);
          if (!touched.description && data.description) next.description = data.description;
          if (!touched.seo_title && data.title) next.seo_title = data.title.slice(0, 120);
          if (!touched.seo_description && data.description) next.seo_description = data.description.slice(0, 320);
          if (!touched.seo_image && data.thumbnailUrl) next.seo_image = data.thumbnailUrl;
          return next;
        });
        setYoutubeState(data.descriptionAvailable ? 'Title, description and thumbnail retrieved. Review before saving.' : 'Title and thumbnail retrieved. YouTube does not expose a full description without an API key; enter it manually.');
      } catch (e) { if (!ctrl.signal.aborted) setYoutubeState(e.response?.data?.message || 'Unable to fetch video metadata. Enter details manually.'); }
    }, 450);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [videoId, form.youtube_url, touched.title, touched.slug, touched.description, touched.seo_title, touched.seo_description, touched.seo_image]);
  async function save(event) {
    event.preventDefault(); setError(''); setMessage('');
    if (!form.title.trim() || form.title.trim().length > 255) return setError('Title must contain 1 to 255 characters');
    if (!videoId) return setError('Enter a valid YouTube URL or video ID');
    setSaving(true);
    try {
      const payload = { ...form, title: form.title.trim(), sort_order: editing ? form.sort_order : episodes.length + 1 };
      if (editing) await axios.put(`${API}/${editing}`, payload, adminRequest); else await axios.post(API, payload, adminRequest);
      reset(); setMessage(editing ? 'Podcast updated.' : 'Podcast added.'); await load();
    } catch (e) { setError(e.response?.data?.message || e.message || 'Save failed'); } finally { setSaving(false); }
  }
  async function remove(episode) {
    if (!await adminConfirm(`Delete podcast: ${episode.title}?`)) return;
    setError(''); setMessage('');
    try { await axios.delete(`${API}/${episode.id}`, adminRequest); if (editing === episode.id) reset(); setMessage('Podcast deleted.'); await load(); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Delete failed'); }
  }
  async function reorder(next) {
    if (reordering || next.every((e, i) => e.id === episodes[i]?.id)) return;
    const old = episodes; setEpisodes(next); setReordering(true); setError('');
    try { await axios.put(`${API}/order`, { ids: next.map(e => e.id) }, adminRequest); setMessage('Podcast order saved. Frontend order updated.'); await load(); }
    catch (e) { setEpisodes(old); setError(e.response?.data?.message || e.message || 'Could not reorder podcasts'); }
    finally { setReordering(false); }
  }
  function move(from, to) { if (from < 0 || to < 0 || from >= episodes.length || to >= episodes.length) return; const next = [...episodes]; next.splice(to, 0, next.splice(from, 1)[0]); reorder(next); }
  async function togglePublished(episode, checked) {
    setError(''); setEpisodes(prev => prev.map(e => e.id === episode.id ? { ...e, is_published: checked } : e));
    try { await axios.put(`${API}/${episode.id}`, payloadOf(episode, { is_published: checked }), adminRequest); setMessage(`${episode.title} set to ${checked ? 'Published' : 'Draft'}.`); await load(); }
    catch (e) { setEpisodes(prev => prev.map(item => item.id === episode.id ? episode : item)); setError(e.response?.data?.message || e.message || 'Status update failed'); }
  }
  return <div className="mx-auto max-w-7xl space-y-7 py-5">
    <header><h1 className="text-3xl font-extrabold text-[#2563eb]">Podcast management</h1><p className="mt-2 text-sm text-slate-600">Paste a YouTube link to load video metadata, edit episode SEO, drag to reorder and toggle publishing. Saved changes appear on /podcast.</p><a className="mt-2 inline-block text-sm font-semibold text-[#2563eb] underline" href="/podcast" target="_blank" rel="noopener noreferrer">View public Podcast page</a></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
    <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">{editing ? 'Edit episode' : 'New episode'}</h2>
      <label className="block text-sm font-semibold">YouTube URL or video ID *<input required maxLength={2048} value={form.youtube_url} onChange={e => update('youtube_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={field} /><span className="mt-1 block text-xs font-normal text-slate-500">Watch, Shorts, live, embed and youtu.be links supported.</span></label>
      {videoId && <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">{youtubeMeta?.thumbnailUrl && <img src={youtubeMeta.thumbnailUrl} alt="YouTube video thumbnail" className="h-16 w-28 rounded-lg object-cover" />}<div><p className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb]"><WandSparkles size={14} /> YouTube auto-fill</p><p role="status" className="mt-1 text-xs text-slate-600">{youtubeState || 'Retrieving metadata…'}</p>{youtubeMeta?.channelTitle && <p className="mt-1 text-xs text-slate-500">Channel: {youtubeMeta.channelTitle}</p>}</div></div>}
      <div className="grid gap-5 lg:grid-cols-2"><label className="block text-sm font-semibold">Episode title *<input required maxLength={255} value={form.title} onChange={e => update('title', e.target.value)} placeholder="Episode title" className={field} /></label>
        <label className="block text-sm font-semibold">Slug (generated automatically)<input maxLength={180} value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="episode-title" className={field} /></label></div>
      <label className="block text-sm font-semibold">Episode description<textarea maxLength={5000} rows={5} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Description of the discussion" className={field} /></label>
      <section className="rounded-xl border border-slate-200"><button type="button" onClick={() => setSeoOpen(v => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left font-bold">Podcast SEO metadata <span className="text-xs font-normal text-slate-500">{seoOpen ? 'Hide' : 'Expand'}</span></button>{seoOpen && <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">SEO title <span className="text-xs text-slate-400">({form.seo_title.length}/120)</span><input maxLength={120} value={form.seo_title} onChange={e => update('seo_title', e.target.value)} placeholder="Leave blank to use episode title" className={field} /></label>
        <label className="block text-sm font-semibold">SEO keywords<input maxLength={500} value={form.seo_keywords} onChange={e => update('seo_keywords', e.target.value)} placeholder="khudii, podcast, community" className={field} /></label>
        <label className="block text-sm font-semibold sm:col-span-2">Meta description <span className="text-xs text-slate-400">({form.seo_description.length}/320)</span><textarea maxLength={320} value={form.seo_description} onChange={e => update('seo_description', e.target.value)} rows={3} placeholder="Search and social preview summary" className={field} /></label>
        <label className="block text-sm font-semibold sm:col-span-2">Social preview image URL<input maxLength={1000} value={form.seo_image} onChange={e => update('seo_image', e.target.value)} placeholder="Automatically uses YouTube thumbnail" className={field} /></label>
        <div className="sm:col-span-2 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Search preview</p><p className="mt-2 text-base font-semibold text-blue-700">{form.seo_title || form.title || 'Podcast episode title'} | Khudii</p><p className="mt-1 break-all text-xs text-green-800">khudii.com/podcast/{form.slug || 'episode-slug'}</p><p className="mt-2 line-clamp-3 text-sm text-slate-600">{form.seo_description || form.description || 'Episode summary will appear here.'}</p></div>
      </div>}</section>
      <div className="flex flex-wrap items-center gap-5"><AdminPublishSwitch checked={form.is_published} onChange={checked => update('is_published', checked)} label={form.is_published ? 'Published' : 'Draft'} /><span className="text-xs text-slate-500">Episode ordering is managed by dragging the saved episodes below.</span></div>
      <div className="flex flex-wrap gap-3"><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving && <Loader2 size={15} className="animate-spin" />}{saving ? 'Saving…' : editing ? 'Save changes' : 'Add podcast'}</button>{editing && <button type="button" onClick={reset} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">Cancel edit</button>}</div>
    </form>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Podcast episodes"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h2 className="text-xl font-bold">Episodes ({episodes.length})</h2><p className="mt-1 text-xs text-slate-500">Drag episodes to change public display order. Changes save immediately.</p></div><button type="button" onClick={load} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb]"><RefreshCw size={15} /> Refresh</button></header>
      {loading ? <p className="p-5">Loading…</p> : !episodes.length ? <p className="p-5 text-sm text-slate-500">No episodes yet.</p> : <div className="divide-y divide-slate-200">{episodes.map((episode, index) => <div key={episode.id} draggable={!reordering} onDragStart={e => { dragId.current = episode.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(episode.id)); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} onDrop={e => { e.preventDefault(); const from = episodes.findIndex(item => item.id === dragId.current); move(from, index); dragId.current = null; }} onDragEnd={() => { dragId.current = null; }} className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-50 sm:gap-4"><GripVertical size={20} aria-label="Drag to reorder" className="cursor-grab text-slate-500" /><img src={`https://i.ytimg.com/vi/${episode.youtube_id}/mqdefault.jpg`} alt="" className="h-16 w-28 shrink-0 rounded-lg bg-slate-100 object-cover" loading="lazy" /><div className="min-w-[160px] flex-1"><h3 className="font-bold text-slate-800">{episode.title}</h3><p className="text-xs text-slate-500">Position {index + 1} · /podcast/{episode.slug}</p></div>
        <AdminPublishSwitch disabled={reordering} checked={Boolean(episode.is_published)} onChange={checked => togglePublished(episode, checked)} label={episode.is_published ? 'Published' : 'Draft'} />
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => move(index, index - 1)} disabled={!index || reordering} aria-label={`Move ${episode.title} up`} className="rounded-lg border border-slate-300 p-2 disabled:opacity-30"><ChevronUp size={15} /></button><button type="button" onClick={() => move(index, index + 1)} disabled={index === episodes.length - 1 || reordering} aria-label={`Move ${episode.title} down`} className="rounded-lg border border-slate-300 p-2 disabled:opacity-30"><ChevronDown size={15} /></button><button type="button" onClick={() => startEdit(episode)} className="rounded-lg border border-blue-400 px-3 py-2 text-xs font-semibold text-[#2563eb]">Edit</button><button type="button" onClick={() => remove(episode)} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700">Delete</button></div></div>)}</div>}
      {reordering && <p className="border-t border-slate-100 p-3 text-xs text-slate-500">Saving new episode order…</p>}
    </section>
  </div>;
}
