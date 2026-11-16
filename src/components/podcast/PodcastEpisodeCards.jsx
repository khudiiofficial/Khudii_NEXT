'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { trackKhudiiEvent } from '@/lib/analytics-client';
import { youtubeVideoId } from '@/server/shared/youtube.js';

/** A click-to-play poster makes playback interactions measurable without guessing iframe activity. */
export default function PodcastEpisodeCards({ episodes = [], single = false }) {
  const [playing, setPlaying] = useState({});
  return (
    <div className={single ? 'grid gap-4' : 'grid gap-5 md:grid-cols-3'}>
      {episodes.map(episode => {
        const cleanId = youtubeVideoId(episode.youtube_id) || episode.youtube_id;
        return (
          <article key={episode.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-video w-full bg-[#02236E]">
              {playing[episode.id] ? (
                <iframe
                  title={`Watch ${episode.title}`}
                  src={`https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  aria-label={`Play ${episode.title}`}
                  className="relative flex h-full w-full items-center justify-center cursor-pointer group"
                  onClick={() => {
                    trackKhudiiEvent('podcast_play', 'podcasts', String(episode.id));
                    setPlaying(v => ({ ...v, [episode.id]: true }));
                  }}
                >
                  <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src={`https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to maxresdefault or placeholder if hqdefault fails
                      e.currentTarget.src = `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
                    }}
                  />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#02236E] hover:bg-[#ed0026] text-white shadow-xl group-hover:scale-110 transition-transform">
                    <Play size={28} fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
            <div className="px-4 py-4 hover:bg-blue-50 transition-colors">
              <h3 className="text-xl font-bold text-[#02236E] line-clamp-2">
                <Link href={`/podcast/${episode.slug || cleanId}`} className="hover:text-blue-900 transition-colors">
                  {episode.title}
                </Link>
              </h3>
              {episode.description && (
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {episode.description}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
