'use client';
import { useEffect, useState } from 'react';
import PodcastEpisodeCards from './PodcastEpisodeCards';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function PodcastCollection({
  heading = 'Khudii Podcast',
  description = 'Conversations and stories from the people behind Khudii.',
}) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${API}/api/podcasts`, { signal: ctrl.signal, cache: 'no-store' })
      .then(async (r) => {
        const text = await r.text();
        let j = {};
        try {
          j = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response (${r.status})`);
        }
        if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
        if (!Array.isArray(j.items)) throw new Error('Unexpected response format');
        setEpisodes(j.items);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'Unable to load podcasts');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 py-12 md:py-16" aria-label="Khudii podcast episodes">
      {loading && (
        <div className="flex items-center justify-center py-16">
          <p role="status" className="text-slate-600 font-semibold animate-pulse">Loading Podcasts…</p>
        </div>
      )}
      {!loading && error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-xs">
          <h4 className="font-bold text-base mb-1">Could not load podcasts</h4>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {!loading && !error && episodes.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-600 shadow-xs">
          <p className="text-base font-medium">No podcasts are published yet. Check back soon!</p>
        </div>
      )}
      {!loading && !error && episodes.length > 0 && <PodcastEpisodeCards episodes={episodes} />}
    </section>
  );
}
