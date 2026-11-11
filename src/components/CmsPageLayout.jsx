'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { CMS_PAGES, defaultSections } from '@/lib/cms-registry';
import { youtubeVideoId } from '@/server/shared/youtube.js';
import { trackKhudiiEvent } from '@/lib/analytics-client';
import PodcastCollection from '@/components/podcast/PodcastCollection';

const base = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
function CmsVideo({ url, title, sectionId }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeVideoId(url);
  if (!id) return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{title || 'Open linked video'}</a> : null;
  return <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900">{playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title || 'Khudii video'} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <button type="button" onClick={() => { trackKhudiiEvent('video_play', 'videos', sectionId); setPlaying(true); }} className="relative flex h-full w-full items-center justify-center"><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" alt="" /><span className="relative rounded-full bg-[#2563eb] px-6 py-4 text-sm font-bold text-white shadow-lg">Play video</span></button>}</div>;
}
function CmsAddedSection({ item }) {
  const d = item.data || {}, items = Array.isArray(d.items) ? d.items : [];
  if (item.kind === 'divider') return <div data-khudii-section={item.id} aria-hidden="true" className="mx-auto my-10 max-w-7xl border-t border-slate-200" />;
  if (item.kind === 'podcast-grid') return <div data-khudii-section={item.id}><PodcastCollection heading={d.heading || 'Podcast episodes'} description={d.body || ''} /></div>;
  const hero = item.kind === 'hero', cta = ['cta', 'form-link', 'notice'].includes(item.kind);
  const gridTypes = ['cards', 'gallery', 'logos', 'testimonials', 'people', 'stats', 'steps', 'timeline', 'social-links', 'downloads', 'video-grid', 'faq'];
  const background = hero ? 'bg-[#2563eb] text-white' : cta ? 'bg-blue-50 text-slate-900' : 'bg-white text-slate-800';
  const isImageText = item.kind === 'image-text';
  const button = d.buttonText && d.buttonUrl && item.kind !== 'embed' ? <a href={d.buttonUrl} className={`mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold ${hero ? 'bg-white text-[#2563eb]' : 'bg-[#2563eb] text-white'}`}>{d.buttonText}</a> : null;
  return <section data-khudii-section={item.id} aria-label={d.heading || item.title} className={`${background} py-12 md:py-16`}>
    <div className="mx-auto max-w-7xl px-5">
      <div className={isImageText ? 'grid items-center gap-8 md:grid-cols-2' : ''}>
        {d.image && <img loading="lazy" src={d.image} alt={d.imageAlt || d.heading || ''} className={`max-h-[480px] w-full rounded-2xl object-cover ${isImageText ? 'md:order-1' : 'mb-7'}`} />}
        <div>{d.subheading && <p className="mb-2 text-sm font-semibold uppercase tracking-wider">{d.subheading}</p>}{d.heading && <h2 className="mb-5 text-3xl font-bold md:text-4xl">{d.heading}</h2>}{d.body && <div className="max-w-4xl whitespace-pre-wrap text-base leading-8">{d.body}</div>}{button}</div>
      </div>
      {item.kind === 'embed' && d.buttonUrl && <div className="mt-7 max-w-4xl"><CmsVideo url={d.buttonUrl} title={d.heading} sectionId={item.id} /></div>}
      {gridTypes.includes(item.kind) && items.length > 0 && <div className={`mt-8 grid gap-5 ${item.kind === 'faq' || item.kind === 'steps' || item.kind === 'timeline' ? 'md:grid-cols-1' : item.kind === 'logos' ? 'sm:grid-cols-3 lg:grid-cols-5' : item.kind === 'video-grid' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((entry, i) => {
          const link = entry.url && <a href={entry.url} className="mt-3 inline-block text-sm font-semibold text-[#2563eb] underline">{item.kind === 'downloads' ? 'Open resource' : item.kind === 'social-links' ? 'Visit channel' : 'Learn more'}</a>;
          if (item.kind === 'faq') return <details key={i} className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900"><summary className="cursor-pointer font-semibold">{entry.title}</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{entry.description}</p></details>;
          if (item.kind === 'video-grid') return <div key={i} className="space-y-3"><CmsVideo url={entry.url} title={entry.title} sectionId={item.id} />{entry.title && <h3 className="text-lg font-semibold">{entry.title}</h3>}{entry.description && <p className="text-sm text-slate-600">{entry.description}</p>}</div>;
          return <article key={i} className={`rounded-2xl border border-slate-200 p-5 text-slate-900 ${item.kind === 'logos' ? 'bg-white text-center' : item.kind === 'stats' ? 'bg-blue-50 text-center' : 'bg-white'}`}>
            {['steps', 'timeline'].includes(item.kind) && <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{i + 1}</span>}
            {entry.image && <img src={entry.image} alt={entry.imageAlt || entry.title || ''} loading="lazy" className={`mb-4 w-full object-contain ${item.kind === 'logos' ? 'h-24' : item.kind === 'people' ? 'h-48 object-cover' : 'h-40'}`} />}
            {entry.title && <h3 className={`${item.kind === 'stats' ? 'text-3xl' : 'text-xl'} font-bold`}>{entry.title}</h3>}
            {entry.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{entry.description}</p>}
            {link}
          </article>;
        })}
      </div>}
    </div>
  </section>;
}
/** Preserve existing frontend JSX; saved CMS order controls the native slots and new blocks. */
export default function CmsPageLayout({ slug, children }) {
  const originals = React.Children.toArray(children).filter(React.isValidElement);
  const definition = CMS_PAGES.find(p => p.slug === slug);
  const defaults = useMemo(() => defaultSections(slug), [slug]);
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    let alive = true; setSaved(null);
    fetch(`${base}/cms/page?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then(async r => { if (!r.ok) throw Error('unavailable'); return r.json(); })
      .then(j => { if (alive && Array.isArray(j.sections)) setSaved(j.sections); })
      .catch(() => { });
    return () => { alive = false; };
  }, [slug]);
  if (!definition) return <>{children}</>;
  let sections = saved || defaults;
  if (slug === '@global' && !sections.some(s => s.source === 'body')) {
    const index = sections.findIndex(s => s.source === 'footer'), body = defaults.find(s => s.source === 'body');
    sections = [...sections]; sections.splice(index >= 0 ? index : sections.length, 0, body);
  }
  const matched = new Set();
  const output = sections.filter(s => s.source === 'body' || s.visible !== false).map(s => {
    const idx = definition.sections.findIndex(d => d.key === s.source);
    if (idx >= 0 && originals[idx]) { matched.add(idx); return <React.Fragment key={s.id}>{originals[idx]}</React.Fragment>; }
    if (idx >= 0) return null;
    return <CmsAddedSection key={s.id} item={s} />;
  });
  originals.forEach((node, idx) => { if (idx >= definition.sections.length && !matched.has(idx)) output.push(<React.Fragment key={`unmapped-${idx}`}>{node}</React.Fragment>); });
  return <>{output}</>;
}
