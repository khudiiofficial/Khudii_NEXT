'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const asData = value => value && typeof value === 'object' ? (value.data && typeof value.data === 'object' ? value.data : value) : {};
function SafeLink({ href, children, className }) { if (!href || !(typeof href === 'string' && (href.startsWith('/') && !href.startsWith('//') || /^https?:\/\//i.test(href)))) return null; return <Link href={href} className={className}>{children}</Link> }
function Section({ section }) {
  const type = section.section_type, d = asData(section.payload), items = Array.isArray(d.items) ? d.items : [];
  const heading = d.heading || section.title;
  const isHero = ['hero', 'hero-banner', 'hero_banner'].includes(type), isFaq = ['faq', 'faqs'].includes(type);
  const isGrid = ['cards', 'feature-cards', 'features', 'gallery', 'logos', 'people', 'testimonials', 'stats', 'steps', 'timeline', 'video-grid', 'downloads', 'social-links'].includes(type);
  const showImage = typeof d.image === 'string' && (/^(https?:\/\/|\/[^/])/.test(d.image));
  if (type === 'divider') return <hr className="mx-auto my-6 max-w-7xl border-slate-200" />;
  return <section id={`section-${section.section_key}`} className={`scroll-mt-28 py-12 md:py-16 ${isHero ? 'bg-[#02236E] text-white' : 'bg-white text-[#02236E]'}`}>
    <div className="mx-auto max-w-7xl px-5">
      <div className={['image-text', 'image_text'].includes(type) ? 'grid items-center gap-8 md:grid-cols-2' : ''}>
        {showImage && <img loading="lazy" src={d.image} alt={d.imageAlt || heading} className="mb-7 max-h-[520px] w-full rounded-2xl object-cover" />}
        <div>{d.subheading && <p className="text-sm font-semibold uppercase tracking-wider opacity-70">{d.subheading}</p>}<h2 className="text-3xl font-bold leading-tight md:text-4xl">{heading}</h2>{d.body && <p className="mt-5 max-w-4xl whitespace-pre-wrap leading-8">{d.body}</p>}{d.buttonText && d.buttonUrl && <SafeLink href={d.buttonUrl} className={`mt-6 inline-block rounded-xl px-6 py-3 font-semibold ${isHero ? 'bg-white text-[#02236E]' : 'bg-[#02236E] text-white'}`}>{d.buttonText}</SafeLink>}</div>
      </div>
      {isFaq && <div className="mt-8 space-y-3">{items.map((it, i) => <details key={i} className="rounded-xl border border-slate-200 p-5"><summary className="cursor-pointer font-semibold">{it.title}</summary><p className="mt-3 whitespace-pre-wrap leading-7">{it.description}</p></details>)}</div>}
      {isGrid && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((it, i) => <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 text-[#02236E] shadow-sm">{it.image && /^(https?:\/\/|\/[^/])/.test(it.image) && <img loading="lazy" src={it.image} alt={it.imageAlt || it.title || ''} className="mb-4 h-44 w-full rounded-xl object-cover" />}<h3 className="text-xl font-bold">{it.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{it.description}</p><SafeLink href={it.url} className="mt-3 inline-block font-semibold text-[#02236E] underline">Learn more</SafeLink></article>)}</div>}
    </div>
  </section>;
}
function TabBranch({ tab, tabs, sections, depth = 0 }) {
  const kids = tabs.filter(t => Number(t.parent_tab_id) === Number(tab.id));
  return <div className="space-y-4"><h3 className="text-xl font-bold">{tab.label}</h3>{sections.filter(s => Number(s.tab_id) === Number(tab.id)).map(s => <Section key={s.id} section={s} />)}{kids.length > 0 && <PageTabsV2 tabs={kids} sections={sections} allTabs={tabs} depth={depth + 1} />}</div>
}
export function PageTabsV2({ tabs = [], sections = [], allTabs = tabs, depth = 0 }) {
  const [current, setCurrent] = useState(null);
  const active = tabs.find(t => t.id === current) || tabs[0];
  if (!active || depth > 8) return null;
  return <section aria-label="Page tabs" className="mx-auto my-8 max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8"><div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4" role="tablist">{tabs.map(t => <button type="button" key={t.id} role="tab" id={`cms-tab-${t.id}`} aria-selected={active.id === t.id} aria-controls={`cms-tabpanel-${t.id}`} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${active.id === t.id ? 'bg-[#02236E] text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'}`} onClick={() => setCurrent(t.id)}>{t.label}</button>)}</div><div role="tabpanel" id={`cms-tabpanel-${active.id}`} aria-labelledby={`cms-tab-${active.id}`} className="pt-6"><TabBranch tab={active} tabs={allTabs} sections={sections} depth={depth} /></div></section>;
}
export default function CmsV2Sections({ page }) {
  const tabs = page.tabs || [], sections = page.sections || [];
  const topLevel = sections.filter(s => !s.tab_id), rootTabs = tabs.filter(t => !t.parent_tab_id);
  return <main id="cms-v2-page" className="min-h-[40vh]">{topLevel.length === 0 && <div className="mx-auto max-w-7xl px-5 py-12"><h1 className="text-4xl font-bold">{page.title}</h1></div>}{topLevel.map(s => <Section key={s.id} section={s} />)}{rootTabs.length > 0 && <PageTabsV2 tabs={rootTabs} allTabs={tabs} sections={sections} />}</main>;
}
