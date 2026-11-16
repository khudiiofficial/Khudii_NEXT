'use client';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { CMS_PAGES, defaultSections } from '@/lib/cms-registry';
import { youtubeVideoId } from '@/server/shared/youtube.js';
import { trackKhudiiEvent } from '@/lib/analytics-client';
import PodcastCollection from '@/components/podcast/PodcastCollection';

const Crousel = dynamic(() => import('@/legacy/public/componets/crousel/Crousel'), { ssr: false });
const DifferentOrganizations = dynamic(() => import('@/legacy/public/componets/DifferentOrganizations/DifferentOrganizations'), { ssr: false });
const Blogs = dynamic(() => import('@/legacy/public/componets/Blogs/Blogs'), { ssr: false });
const SuccessStories = dynamic(() => import('@/legacy/public/componets/SuccessStories/SuccessStories'), { ssr: false });

const base = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

function CmsFaqSection({
  heading,
  description,
  limit,
  selectedIds,
  manualItems,
  showTitle = true,
  showButton = true,
  buttonText,
  buttonUrl,
}) {
  const [faqs, setFaqs] = useState(manualItems && manualItems.length > 0 ? manualItems : []);
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    if (manualItems && manualItems.length > 0 && (!selectedIds || selectedIds.length === 0)) return;
    fetch(`${base}/api/faqs`, { cache: 'no-store' })
      .then(r => r.json())
      .then(res => {
        let list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const set = new Set(selectedIds.map(String));
          list = list.filter(f => set.has(String(f.id)));
        }
        if (limit && limit !== 'all' && Number(limit) > 0) {
          list = list.slice(0, Number(limit));
        }
        if (list.length > 0) setFaqs(list);
      })
      .catch(() => {});
  }, [limit, selectedIds, manualItems]);

  return (
    <section className="w-full py-12 md:py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-5">
        {(showTitle !== false && Boolean(heading)) || (showButton !== false && Boolean(buttonText)) ? (
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 invisible hidden sm:block w-36" aria-hidden="true">
                <span>spacer</span>
              </div>

              <div className="flex-1 text-center">
                {showTitle !== false && Boolean(heading) && (
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#02236E] text-center block m-0">
                    {heading}
                  </h2>
                )}
                {description && <p className="text-sm text-slate-600 mt-1 m-0">{description}</p>}
              </div>

              <div className="shrink-0">
                {showButton !== false && Boolean(buttonText) && (
                  <a
                    href={buttonUrl || '/faqs'}
                    className="inline-flex items-center font-medium group bg-[#02236E] px-4 py-2 rounded-xl text-white hover:bg-blue-900 transition-colors text-xs shrink-0 no-underline shadow-xs"
                    aria-label={buttonText}
                  >
                    <span>{buttonText}</span>&nbsp;
                    <svg
                      className="w-4 h-4 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : null}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const q = faq.question || faq.title;
            const a = faq.answer || faq.description;
            return (
              <div key={faq.id || idx} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-slate-900 hover:text-[#02236E] transition-colors"
                >
                  <span className="text-sm sm:text-base">{q}</span>
                  <span className={`text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap animate-in fade-in-50 duration-150">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CmsVideo({ url, title, sectionId }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeVideoId(url);
  if (!id) return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{title || 'Open linked video'}</a> : null;
  return <div className="aspect-video overflow-hidden rounded-2xl bg-[#02236E]">{playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title || 'Khudii video'} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <button type="button" onClick={() => { trackKhudiiEvent('video_play', 'videos', sectionId); setPlaying(true); }} className="relative flex h-full w-full items-center justify-center"><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" alt="" /><span className="relative rounded-full bg-[#02236E] px-6 py-4 text-sm font-bold text-white shadow-lg">Play video</span></button>}</div>;
}
function CmsAddedSection({ item }) {
  const d = item.data || {}, items = Array.isArray(d.items) ? d.items : [];
  if (item.kind === 'divider') return <div data-khudii-section={item.id} aria-hidden="true" className="mx-auto my-10 max-w-7xl border-t border-slate-200" />;
  if (item.kind === 'podcast-grid') return <div data-khudii-section={item.id}><PodcastCollection heading={d.heading || 'Podcast episodes'} description={d.body || d.description || ''} limit={d.limit} selectedIds={d.selectedIds} showTitle={d.showTitle !== false && Boolean(d.heading)} showButton={d.showButton !== false && Boolean(d.buttonText)} buttonText={d.buttonText} buttonUrl={d.buttonUrl} /></div>;
  if (item.kind === 'carousel') return <div data-khudii-section={item.id}><Crousel /></div>;
  if (item.kind === 'organizations') return <div data-khudii-section={item.id}><DifferentOrganizations heading={d.heading} description={d.body || d.description || ''} limit={d.limit} selectedIds={d.selectedIds} showTitle={d.showTitle !== false && Boolean(d.heading)} showButton={d.showButton !== false && Boolean(d.buttonText)} buttonText={d.buttonText} buttonUrl={d.buttonUrl} /></div>;
  if (item.kind === 'blogs') return <div data-khudii-section={item.id}><Blogs heading={d.heading} description={d.body || d.description || ''} limit={d.limit} selectedIds={d.selectedIds} showTitle={d.showTitle !== false && Boolean(d.heading)} showButton={d.showButton !== false && Boolean(d.buttonText)} buttonText={d.buttonText} buttonUrl={d.buttonUrl} /></div>;
  if (item.kind === 'stories') return <div data-khudii-section={item.id}><SuccessStories heading={d.heading} description={d.body || d.description || ''} limit={d.limit} selectedIds={d.selectedIds} showTitle={d.showTitle !== false && Boolean(d.heading)} showButton={d.showButton !== false && Boolean(d.buttonText)} buttonText={d.buttonText} buttonUrl={d.buttonUrl} /></div>;
  if (item.kind === 'faq') return <div data-khudii-section={item.id}><CmsFaqSection heading={d.heading || 'Frequently Asked Questions'} description={d.body || d.description || ''} limit={d.limit} selectedIds={d.selectedIds} manualItems={items} showTitle={d.showTitle !== false && Boolean(d.heading)} showButton={d.showButton !== false && Boolean(d.buttonText)} buttonText={d.buttonText} buttonUrl={d.buttonUrl} /></div>;
  const hero = item.kind === 'hero', cta = ['cta', 'form-link', 'notice'].includes(item.kind);
  const gridTypes = ['cards', 'gallery', 'logos', 'testimonials', 'people', 'stats', 'steps', 'timeline', 'social-links', 'downloads', 'video-grid', 'faq'];
  const background = hero ? 'bg-[#02236E] text-white' : cta ? 'bg-blue-50 text-[#02236E]' : 'bg-white text-[#02236E]';
  const isImageText = item.kind === 'image-text';
  const button = d.buttonText && d.buttonUrl && item.kind !== 'embed' ? <a href={d.buttonUrl} className={`mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold ${hero ? 'bg-white text-[#02236E]' : 'bg-[#02236E] text-white'}`}>{d.buttonText}</a> : null;
  return <section data-khudii-section={item.id} aria-label={d.heading || item.title} className={`${background} py-12 md:py-16`}>
    <div className="mx-auto max-w-7xl px-5">
      <div className={isImageText ? 'grid items-center gap-8 md:grid-cols-2' : ''}>
        {d.image && <img loading="lazy" src={d.image} alt={d.imageAlt || d.heading || ''} className={`max-h-[480px] w-full rounded-2xl object-cover ${isImageText ? 'md:order-1' : 'mb-7'}`} />}
        <div>{d.subheading && <p className="mb-2 text-sm font-semibold uppercase tracking-wider">{d.subheading}</p>}{d.heading && <h2 className="mb-5 text-3xl font-bold md:text-4xl">{d.heading}</h2>}{d.body && <div className="max-w-4xl whitespace-pre-wrap text-base leading-8">{d.body}</div>}{button}</div>
      </div>
      {item.kind === 'embed' && d.buttonUrl && <div className="mt-7 max-w-4xl"><CmsVideo url={d.buttonUrl} title={d.heading} sectionId={item.id} /></div>}
      {gridTypes.includes(item.kind) && items.length > 0 && <div className={`mt-8 grid gap-5 ${item.kind === 'faq' || item.kind === 'steps' || item.kind === 'timeline' ? 'md:grid-cols-1' : item.kind === 'logos' ? 'sm:grid-cols-3 lg:grid-cols-5' : item.kind === 'video-grid' ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {items.map((entry, i) => {
          const link = entry.url && <a href={entry.url} className="mt-3 inline-block text-sm font-semibold text-[#02236E] underline">{item.kind === 'downloads' ? 'Open resource' : item.kind === 'social-links' ? 'Visit channel' : 'Learn more'}</a>;
          if (item.kind === 'faq') return <details key={i} className="rounded-xl border border-slate-200 bg-white p-5 text-[#02236E]"><summary className="cursor-pointer font-semibold">{entry.title}</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{entry.description}</p></details>;
          if (item.kind === 'video-grid') return <div key={i} className="space-y-3"><CmsVideo url={entry.url} title={entry.title} sectionId={item.id} />{entry.title && <h3 className="text-lg font-semibold">{entry.title}</h3>}{entry.description && <p className="text-sm text-slate-600">{entry.description}</p>}</div>;
          return <article key={i} className={`rounded-2xl border border-slate-200 p-5 text-[#02236E] ${item.kind === 'logos' ? 'bg-white text-center' : item.kind === 'stats' ? 'bg-blue-50 text-center' : 'bg-white'}`}>
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
  const [dynamicSections, setDynamicSections] = useState(null);

  useEffect(() => {
    let alive = true;
    setSaved(null);
    setDynamicSections(null);

    fetch(`${base}/cms/page?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then(async r => { if (!r.ok) throw Error('unavailable'); return r.json(); })
      .then(j => { if (alive && Array.isArray(j.sections)) setSaved(j.sections); })
      .catch(() => { });

    if (slug !== '@global' && !slug.includes('[')) {
      fetch(`${base}/cms/v2/page?path=${encodeURIComponent(slug)}`, { cache: 'no-store' })
        .then(async r => r.ok ? r.json() : null)
        .then(result => {
          if (!alive || !result?.data?.sections?.length) return;
          setDynamicSections(result.data.sections.map((s, sIdx) => {
            let source = s.source_key || '';
            if (!source && definition) {
              const byTitle = definition.sections.find(d => d.title?.toLowerCase() === s.title?.toLowerCase());
              if (byTitle) source = byTitle.key;
              else if ((s.section_type === 'existing' || String(s.section_key).includes('existing')) && definition.sections[sIdx]) {
                source = definition.sections[sIdx].key;
              }
            }
            return {
              id: s.section_key,
              source,
              kind: s.section_type,
              title: s.title,
              visible: !!s.is_published,
              data: s.payload?.data || s.payload || {}
            };
          }));
        })
        .catch(() => { });
    }

    return () => { alive = false; };
  }, [slug, definition]);

  if (!definition) return <>{children}</>;

  let sections = dynamicSections || saved || defaults;
  if (slug === '@global' && !sections.some(s => s.source === 'body')) {
    const index = sections.findIndex(s => s.source === 'footer'), body = defaults.find(s => s.source === 'body');
    sections = [...sections];
    sections.splice(index >= 0 ? index : sections.length, 0, body);
  }

  const SLOT_KIND_MAP = {
    'podcast-grid': ['episodes'],
    'blogs': ['listing', 'blogs'],
    'organizations': ['directory', 'organizations'],
    'stories': ['stories'],
    'faq': ['faq-list', 'faq'],
    'carousel': ['carousel'],
    'video-grid': ['gallery'],
  };

  const matched = new Set();
  const output = sections.filter(s => s.source === 'body' || s.visible !== false).map((s, sIdx) => {
    // 1. Try matching by key
    let idx = definition.sections.findIndex(d => d.key === s.source);
    // 2. Try matching by title
    if (idx < 0 && s.title) {
      idx = definition.sections.findIndex(d => d.title?.toLowerCase() === s.title?.toLowerCase());
    }
    // 3. Try matching by existing slot pattern or slot index
    if (idx < 0 && (s.kind === 'existing' || String(s.id).includes('existing'))) {
      const match = String(s.id).match(/existing-(\d+)/);
      if (match) {
        const slotIdx = parseInt(match[1], 10) - 1;
        if (slotIdx >= 0 && slotIdx < definition.sections.length) idx = slotIdx;
      } else if (sIdx < definition.sections.length) {
        idx = sIdx;
      }
    }

    if (idx >= 0 && originals[idx]) {
      matched.add(idx);
      return <React.Fragment key={s.id || idx}>{originals[idx]}</React.Fragment>;
    }
    if (idx >= 0) return null;

    // If an added connected module replaces a native slot (e.g. podcast-grid on /podcast replaces episodes),
    // mark that native slot as matched so it does not duplicate as an unmapped original
    if (SLOT_KIND_MAP[s.kind]) {
      const nativeSlotIdx = definition.sections.findIndex(d => SLOT_KIND_MAP[s.kind].includes(d.key));
      if (nativeSlotIdx >= 0) {
        matched.add(nativeSlotIdx);
      }
    }

    return <CmsAddedSection key={s.id || sIdx} item={s} />;
  });

  // Guarantee that any unmatched original slot is preserved when dynamicSections is not active
  if (!dynamicSections) {
    originals.forEach((node, idx) => {
      if (!matched.has(idx)) {
        output.push(<React.Fragment key={`orig-unmatched-${idx}`}>{node}</React.Fragment>);
      }
    });
  }

  return <>{output}</>;
}
