'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { confirmDialog, alertNotice } from '@/lib/dialogs';
import { ReloadButton, SaveButton } from '@/components/ui/AppButton';
import { ArrowLeft, ArrowRight, Check, Copy, DatabaseBackup, ScanSearch, WandSparkles, Eye, FileImage, FolderOpen, Grid2X2, ImagePlus, LayoutList, Loader2, Pencil, RotateCcw, Search, Trash2, UploadCloud, X } from 'lucide-react';
const api = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
const formatBytes = (n) => !Number.isFinite(Number(n)) || Number(n) <= 0 ? 'Size unknown' : n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)} GB` : n >= 1024 ** 2 ? `${(n / 1024 ** 2).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`;
const cls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02236E]';
const confirmByStatus = (title, status = 'info', confirmText) => confirmDialog({ title, status, ...(confirmText ? { confirmText } : {}) });
const notify = (title, status = 'success') =>
  alertNotice({
    title,
    status: status === 'error' ? 'error' : status === 'warning' ? 'warning' : status === 'info' ? 'info' : 'success',
  });
const request = async (url, options = {}) => { const r = await fetch(`${api}${url}`, { credentials: 'include', headers: { 'x-khudii-surface': 'admin', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, ...options }); const j = await r.json().catch(() => ({})); if (!r.ok || j.success === false) throw Error(j.message || j.error?.message || `Request failed (HTTP ${r.status})`); return j; };
// Upload each file in 2 MiB chunks so Vercel never receives an oversized JSON body.
async function uploadImageInChunks(file) {
  const ext = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
  }[file.type] || (file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'png');

  const mime = file.type || (
    ext === 'ico' ? 'image/x-icon' :
    ext === 'svg' ? 'image/svg+xml' :
    ext === 'webp' ? 'image/webp' :
    ext === 'gif' ? 'image/gif' :
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
    'image/png'
  );

  const uid = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filename = `khudii-${uid}.${ext}`;
  const chunkSize = 2 * 1024 * 1024, total = Math.ceil(file.size / chunkSize);
  let url = '';
  for (let index = 0; index < total; index++) {
    const offset = index * chunkSize;
    const response = await fetch('/media-app/chunk', {
      method: 'POST', credentials: 'include', headers: {
        'content-type': 'application/octet-stream',
        'x-khudii-upload-name': filename,
        'x-khudii-upload-mime': mime,
        'x-khudii-surface': 'admin',
        'x-khudii-upload-index': String(index),
        'x-khudii-upload-total': String(total),
        'x-khudii-upload-offset': String(offset),
        'x-khudii-upload-size': String(file.size),
      }, body: file.slice(offset, Math.min(offset + chunkSize, file.size))
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw Error(result.message || `Upload failed (HTTP ${response.status})`);
    if (result.completed) url = result.url;
  }
  if (!url) throw Error('Upload completed without a URL');
  await request('/admin/media', { method: 'PUT', body: JSON.stringify({ url, title: file.name, alt_text: '', caption: '', tags: '', trashed: false }) });
  return url;
}
export default function MediaLibrary() {
  const [dimensions, setDimensions] = useState({}), [processing, setProcessing] = useState(false), [processProgress, setProcessProgress] = useState(''), [processReport, setProcessReport] = useState(null), [items, setItems] = useState([]), [busy, setBusy] = useState(true), [error, setError] = useState(''), [search, setSearch] = useState(''), [folder, setFolder] = useState('main'), [layout, setLayout] = useState('grid'), [filter, setFilter] = useState('all'), [sort, setSort] = useState('name'), [selected, setSelected] = useState(null), [editing, setEditing] = useState({}), [saving, setSaving] = useState(false), [page, setPage] = useState(0);
  const fileRef = useRef(null); const [uploading, setUploading] = useState(false), [uploadProgress, setUploadProgress] = useState(''), [copied, setCopied] = useState('');
  const reload = async () => { setBusy(true); setError(''); try { const j = await request(`/admin/media?folder=${encodeURIComponent(folder)}`); setItems(j.items || []); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  useEffect(() => { reload(); setPage(0); }, [folder]);
  const visible = useMemo(() => items.filter(x => (filter === 'all' || (filter === 'images' && !/\.(mov|mp4)$/i.test(x.url)) || (filter === 'videos' && /\.(mov|mp4)$/i.test(x.url))) && `${x.name} ${x.title || ''} ${x.alt_text || ''} ${x.tags || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'size' ? (b.size || 0) - (a.size || 0) : b.url.localeCompare(a.url)), [items, filter, search, sort]);
  const paged = visible.slice(page * 60, (page + 1) * 60);
  const open = (item) => { setSelected(item); setEditing({ title: item.title || '', alt_text: item.alt_text || '', caption: item.caption || '', tags: item.tags || '' }); };
  const save = async (trashed) => { if (!selected) return; const isTrash = trashed === true; const isRestore = trashed === false; const message = isTrash ? 'Move this media reference to Trash?' : isRestore ? 'Restore this media reference?' : 'Save media details?'; const status = isTrash ? 'error' : 'success'; const btnText = isTrash ? 'Move to Trash' : isRestore ? 'Restore' : 'Save details'; if (!await confirmByStatus(message, status, btnText)) return; setSaving(true); try { await request('/admin/media', { method: 'PUT', body: JSON.stringify({ url: selected.url, title: editing.title, alt_text: editing.alt_text, caption: editing.caption, tags: editing.tags, trashed: trashed === undefined ? Boolean(selected.trashed) : trashed }) }); notify(isTrash ? 'Moved to Trash' : isRestore ? 'Media restored' : 'Details updated'); setSelected(null); reload(); } catch (e) { notify(e.message, 'error'); } finally { setSaving(false); } };
  const syncCmsMedia = async () => { if (!await confirmByStatus('Index all CMS, Blog & Organization media references into library metadata?', 'info', 'Index Media')) return; setProcessing(true); setProcessProgress('Scanning CMS pages, blogs, and organizations for media references...'); try { const r = await request('/admin/media/sync', { method: 'POST' }); notify(`Indexed ${r.added || 0} new references (${r.found || 0} total found)`, 'success'); await reload(); } catch (e) { notify(e.message, 'error'); } finally { setProcessProgress(''); setProcessing(false); } };
  const upload = async (e) => {
    const files = Array.from(e.target.files || []); e.target.value = ''; if (!files.length) return;
    if (files.length>20) { notify('Select no more than 20 images at once', 'error'); return; }
    const invalid = files.find(file => file.size > 12_000_000 || !/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type));
    if (invalid) { notify(`Unsupported format or image larger than 12 MB: ${invalid.name}`, 'error'); return; }
    if (!await confirmByStatus(`Upload ${files.length} image${files.length === 1 ? '' : 's'} to Khudii media storage?`, 'info', 'Upload')) return;
    setUploading(true); let completed = 0; const failures = []; let lastUrl = '';
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress(`${index + 1} / ${files.length}: ${file.name}`);
        try {
          lastUrl = await uploadImageInChunks(file);
          completed++;
        } catch (error) { failures.push(`${file.name}: ${error.message}`); }
      }
      if (completed === 1 && files.length === 1 && lastUrl) await navigator.clipboard?.writeText(lastUrl).catch(() => { });
      await reload();
      if (failures.length) notify(`${completed} uploaded; ${failures.length} failed. ${failures.slice(0, 2).join('; ')}`, 'warning');
      else notify(`${completed} image${completed === 1 ? '' : 's'} uploaded successfully`);
    } finally { setUploading(false); setUploadProgress(''); }
  };
  const rememberDimensions = (url, image) => { if (image?.naturalWidth) setDimensions(prev => prev[url]?.width === image.naturalWidth ? prev : { ...prev, [url]: { width: image.naturalWidth, height: image.naturalHeight } }) };
  async function scanFrontendImages() {
    const response = await fetch('/sitemap.xml', { cache: 'no-store' }); if (!response.ok) throw Error('Sitemap not available');
    const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
    const candidates = [...xml.querySelectorAll('loc')].map(node => node.textContent).filter(url => { try { return new URL(url).origin === location.origin } catch { return false } }).slice(0, 30);
    if (!candidates.includes(location.origin + '/')) candidates.unshift(location.origin + '/');
    const measurements = new Map();
    for (const [index, url] of candidates.entries()) {
      setProcessProgress(`Scanning public page ${index + 1}/${candidates.length}: ${new URL(url).pathname}`);
      const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1440px;height:900px;visibility:hidden;pointer-events:none'; iframe.setAttribute('aria-hidden', 'true'); document.body.appendChild(iframe);
      try {
        await new Promise((resolve, reject) => { let done = false; const finish = (err) => { if (done) return; done = true; clearTimeout(timeout); err ? reject(err) : resolve() }; const timeout = setTimeout(() => finish(new Error('Page timed out')), 12000); iframe.onload = () => finish(); iframe.onerror = () => finish(new Error('Page loading failed')); iframe.src = url });
        const doc = iframe.contentDocument; if (!doc) continue;
        for (const img of doc.querySelectorAll('img')) {
          const src = img.currentSrc || img.src; const w = Math.round(img.getBoundingClientRect().width), h = Math.round(img.getBoundingClientRect().height);
          if (!src || !w || !h || !img.naturalWidth || !img.naturalHeight) continue;
          const existing = measurements.get(src);
          if (!existing || w > existing.width) measurements.set(src, { width: w, height: h, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
        }
      } catch { } finally { iframe.remove() }
    }
    return measurements;
  }
  async function processBatch(operation) {
    if (processing) return;
    const eligible = items.filter(x => !x.trashed && x.size > 100 * 1024 && /\.(png|jpe?g|webp|avif)$/i.test(x.name) && x.source === 'uploads');
    if (operation === 'optimize' && !eligible.length) return notify('No eligible FTP images larger than 100 KB', 'info');
    const confirmed = await confirmDialog({
      title: operation === 'optimize' ? 'Optimize eligible images?' : 'Measure frontend rendering and resize?',
      text: operation === 'optimize'
        ? `${eligible.length} FTP images above 100 KB will be processed sequentially. Original copies are retained on FTP.`
        : 'Scan up to 30 public sitemap routes; only images with actual measured display dimensions will be considered. A backup is retained for each modified image.',
      status: 'warning',
      confirmText: 'Start batch',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    setProcessing(true); const reports = [];
    try {
      const measurements = operation === 'render' ? await scanFrontendImages() : null;
      const targets = operation === 'render' ? items.filter(x => measurements?.has(x.url) && /\.(png|jpe?g|webp|avif)$/i.test(x.name) && x.source === 'uploads') : eligible;
      for (const [index, item] of targets.entries()) {
        setProcessProgress(`${operation === 'render' ? 'Resizing' : 'Optimizing'} ${index + 1}/${targets.length}: ${item.name}`);
        try {
          const measurement = measurements?.get(item.url);
          if (operation === 'render' && (!measurement || measurement.naturalWidth <= measurement.width && measurement.naturalHeight <= measurement.height)) { reports.push({ name: item.name, status: 'skipped' }); continue }
          const result = await request('/admin/media/process', { method: 'POST', body: JSON.stringify({ url: item.url, operation, ...(measurement ? { width: measurement.width, height: measurement.height } : {}) }) });
          reports.push({ name: item.name, status: result.skipped ? 'skipped' : 'changed', before: result.before, after: result.after });
        } catch (e) { reports.push({ name: item.name, status: 'failed', message: e.message }) }
      }
      setProcessReport({ operation, reports, scanned: measurements?.size || 0 }); await reload();
      notify(`${reports.filter(x => x.status === 'changed').length} processed · ${reports.filter(x => x.status === 'failed').length} failed · ${reports.filter(x => x.status === 'skipped').length} skipped`);
    } catch (e) { notify(e.message, 'error') } finally { setProcessProgress(''); setProcessing(false) }
  }
  const copy = async (item) => { try { await navigator.clipboard.writeText(item.url); setCopied(item.url); notify('Media URL copied to clipboard', 'info'); setTimeout(() => setCopied(''), 1700); } catch { notify('Unable to copy media URL', 'error'); } };
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#02236E]">Khudii assets</p><h1 className="mt-2 text-3xl font-extrabold text-[#02236E]">Media Library</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Search existing site assets and uploaded images in one library. Updates to metadata and Trash do not delete files or break existing content references.</p></div><div className="flex flex-wrap gap-2"><button disabled={processing || busy || folder !== 'main'} onClick={syncCmsMedia} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold disabled:opacity-40 cursor-pointer"><DatabaseBackup size={16} />Index CMS Media</button><button disabled={processing || busy || folder !== 'main'} onClick={() => processBatch('optimize')} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold disabled:opacity-40 cursor-pointer"><WandSparkles size={16} />Image Optimization</button><button disabled={processing || busy || folder !== 'main'} onClick={() => processBatch('render')} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold disabled:opacity-40 cursor-pointer"><ScanSearch size={16} />Rendering</button><ReloadButton onClick={reload} title="Refresh library" /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple ref={fileRef} className="hidden" onChange={upload} /><button disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#02236E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer">{uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} Upload images</button></div></div>
    {processProgress && <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{processProgress}</p>}{processReport && <details className="rounded-xl border border-slate-200 bg-white p-3 text-xs"><summary className="cursor-pointer font-bold">Last {processReport.operation} batch: {processReport.reports.filter(x => x.status === 'changed').length} changed, {processReport.reports.filter(x => x.status === 'failed').length} failed; {processReport.scanned} frontend images measured</summary><div className="mt-2 max-h-48 overflow-y-auto">{processReport.reports.map((x, i) => <p key={i} className="py-1">{x.status}: {x.name}{x.message ? ` — ${x.message}` : ''}</p>)}</div></details>}{uploading && uploadProgress && <p role="status" className="text-sm font-semibold text-[#02236E]">Uploading {uploadProgress}</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}. Check MySQL and FTP storage configuration.</div>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex gap-2">{[['main', 'Library', FolderOpen], ['trash', 'Trash', Trash2]].map(([id, title, Icon]) => <button key={id} onClick={() => setFolder(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${folder === id ? 'bg-[#02236E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={16} />{title}</button>)}</div><div className="flex flex-1 flex-wrap justify-end gap-2"><div className="relative min-w-[200px] flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search media..." className={`${cls} pl-9`} /></div><select aria-label="Media type" value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }} className="rounded-xl border border-slate-200 bg-white px-2 text-sm"><option value="all">All types</option><option value="images">Images</option><option value="videos">Videos</option></select><select aria-label="Sort media" value={sort} onChange={e => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-2 text-sm"><option value="name">Name</option><option value="size">Largest</option><option value="recent">Recent URL</option></select><button title="Grid view" aria-label="Grid view" onClick={() => setLayout('grid')} className={`rounded-lg p-2 ${layout === 'grid' ? 'bg-blue-100 text-[#02236E]' : ''}`}><Grid2X2 size={19} /></button><button title="List view" aria-label="List view" onClick={() => setLayout('list')} className={`rounded-lg p-2 ${layout === 'list' ? 'bg-blue-100 text-[#02236E]' : ''}`}><LayoutList size={19} /></button></div></div>
    <div className="flex items-center justify-between text-sm text-slate-500"><span>{visible.length} files · {folder === 'trash' ? 'Trash references' : 'Public assets and FTP uploads'}</span>{visible.length > 60 && <span>Page {page + 1} of {Math.ceil(visible.length / 60)}</span>}</div>
    {busy ? <div className="grid min-h-60 place-items-center"><Loader2 className="animate-spin text-[#02236E]" size={28} /></div> : <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'space-y-2'}>{paged.map(item => <article key={item.url} className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${layout === 'list' ? 'flex items-center gap-4 p-2' : ''}`}><button className={layout === 'grid' ? 'block aspect-[4/3] w-full bg-slate-100' : 'h-16 w-20 shrink-0 bg-slate-100'} onClick={() => open(item)} title="View media details">{/\.(mov|mp4)$/i.test(item.url) ? <div className="grid h-full place-items-center"><FileImage size={30} /></div> : <img loading="lazy" src={item.url} alt={item.alt_text || item.name} onLoad={e => rememberDimensions(item.url, e.currentTarget)} className="h-full w-full object-contain" onError={e => { e.currentTarget.style.opacity = '.25' }} />}</button><div className="flex min-w-0 flex-1 items-center justify-between gap-1 p-2"><div className="min-w-0"><p className="truncate text-xs font-bold text-[#02236E]" title={item.name}>{item.title || item.name}</p><p className={`truncate text-[11px] ${item.size > 102400 ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{item.source} · {formatBytes(item.size)}</p><p className="text-[11px] text-slate-500">{dimensions[item.url] ? `${dimensions[item.url].width} × ${dimensions[item.url].height} px` : 'Dimensions pending'}</p></div><div className="flex shrink-0 gap-1"><button title="Copy URL" aria-label="Copy media URL" onClick={() => copy(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50">{copied === item.url ? <Check size={17} /> : <Copy size={17} />}</button><button title="Edit metadata" aria-label="Edit media" onClick={() => open(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50"><Pencil size={17} /></button></div></div></article>)}</div>}
    {!busy && !visible.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500"><ImagePlus className="mx-auto mb-3" size={32} />No matching media. Upload an image or change the filters.</div>}
    {visible.length > 60 && <div className="flex justify-center gap-4"><button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"><ArrowLeft size={18} /></button><span className="self-center text-sm">{page + 1} / {Math.ceil(visible.length / 60)}</span><button disabled={(page + 1) * 60 >= visible.length} onClick={() => setPage(p => p + 1)} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"><ArrowRight size={18} /></button></div>}
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}><div role="dialog" aria-modal="true" aria-label="Media details" className="grid max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white md:grid-cols-2"><div className="grid min-h-60 place-items-center bg-slate-100 p-6"><img src={selected.url} alt={editing.alt_text} className="max-h-[65vh] w-full object-contain" /></div><div className="space-y-4 p-6"><div className="flex justify-between"><h2 className="text-xl font-bold">Media details</h2><button onClick={() => setSelected(null)} aria-label="Close media details"><X size={21} /></button></div><p className="break-all text-xs text-slate-500">{selected.url}</p><p className={`text-sm ${selected.size > 102400 ? 'font-bold text-red-600' : 'text-slate-500'}`}>File size: {formatBytes(selected.size)} · {dimensions[selected.url] ? `${dimensions[selected.url].width} × ${dimensions[selected.url].height} px` : 'Dimensions unavailable'}</p>{[['Title', 'title'], ['Alternative text', 'alt_text']].map(([label, key]) => <label key={key} className="block text-sm font-semibold">{label}<input value={editing[key]} onChange={e => setEditing(v => ({ ...v, [key]: e.target.value }))} className={`${cls} mt-1`} /></label>)}<label className="block text-sm font-semibold">Search tags (comma-separated)<input value={editing.tags || ''} onChange={e => setEditing(v => ({ ...v, tags: e.target.value }))} className={`${cls} mt-1`} /></label><label className="block text-sm font-semibold">Caption<textarea value={editing.caption} onChange={e => setEditing(v => ({ ...v, caption: e.target.value }))} className={`${cls} mt-1`} rows={3} /></label><p className="text-xs text-slate-500">Trash hides the item from the library only. It does not delete the original file or modify existing pages.</p><div className="flex flex-wrap gap-2"><SaveButton disabled={saving} loading={saving} onClick={() => save()}>Save details</SaveButton><button onClick={() => copy(selected)} title="Copy URL" className="rounded-xl border border-slate-200 p-2.5"><Copy size={18} /></button><a href={selected.url} target="_blank" rel="noopener noreferrer" title="Open media" className="rounded-xl border border-slate-200 p-2.5"><Eye size={18} /></a><button disabled={saving} title={folder === 'trash' ? 'Restore' : 'Move to trash'} onClick={() => save(folder === 'main')} className="rounded-xl border border-slate-200 p-2.5 text-red-600">{folder === 'trash' ? <RotateCcw size={18} /> : <Trash2 size={18} />}</button></div></div></div></div>}
  </div>;
}
