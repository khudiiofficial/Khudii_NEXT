'use client';
import { useEffect, useState } from 'react';
import PodcastEpisodeCards from './PodcastEpisodeCards';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function PodcastCollection({
  heading = '',
  description = '',
  limit,
  selectedIds,
  showTitle = true,
  showButton = true,
  buttonText,
  buttonUrl,
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
        let list = j.items;
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const idSet = new Set(selectedIds.map(String));
          list = list.filter((ep) => idSet.has(String(ep.id)));
        }
        if (limit && limit !== 'all' && Number(limit) > 0) {
          list = list.slice(0, Number(limit));
        }
        setEpisodes(list);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'Unable to load podcasts');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [limit, selectedIds]);

  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 py-12 md:py-16" aria-label="Khudii podcast episodes">
      {/* Header Section with optional Title and Action Button */}
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
                  href={buttonUrl || '/podcast'}
                  target={buttonUrl && /^https?:\/\//i.test(buttonUrl) ? '_blank' : undefined}
                  rel={buttonUrl && /^https?:\/\//i.test(buttonUrl) ? 'noopener noreferrer' : undefined}
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
