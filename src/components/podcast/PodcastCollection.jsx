'use client';
import { useEffect, useState } from 'react';
import PodcastEpisodeCards from './PodcastEpisodeCards';
export default function PodcastCollection({ heading = 'Khudii Podcast', description = 'Conversations and stories from the people behind Khudii.' }) {
  const [episodes, setEpisodes] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/podcasts', { signal: ctrl.signal, cache: 'no-store' })
      .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw Error(j.message || `HTTP ${r.status}`); if (!Array.isArray(j.items)) throw Error('Unexpected response'); setEpisodes(j.items); })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message || 'Unable to load podcasts'); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, []);
  return <section className="mx-auto w-full max-w-7xl px-5 py-12 md:py-16" aria-label="Khudii podcast episodes">
    {/* <div className="mb-8"><h2 className="text-2xl font-bold text-[#02236e] md:text-3xl">{heading}</h2>{description && <p className="mt-2 text-slate-600">{description}</p>}</div> */}
    {loading && <p role="status" className="text-slate-600">Loading Podcasts…</p>}
    {!loading && error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Could not load podcasts. {error}</p>}
    {!loading && !error && episodes.length === 0 && <p className="rounded-xl border border-slate-200 bg-slate-50 p-7 text-slate-600">No podcasts are published yet.</p>}
    {!loading && !error && episodes.length > 0 && <PodcastEpisodeCards episodes={episodes} />}
  </section>;
}
