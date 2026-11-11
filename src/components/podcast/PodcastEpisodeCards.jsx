'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { trackKhudiiEvent } from '@/lib/analytics-client';

/** A click-to-play poster makes playback interactions measurable without guessing iframe activity. */
export default function PodcastEpisodeCards({ episodes = [], single = false }) {
  const [playing, setPlaying] = useState({});
  return <div className={single ? 'grid gap-4' : 'grid gap-5 md:grid-cols-3'}>{episodes.map(episode => <article key={episode.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="aspect-video w-full bg-slate-900">{playing[episode.id] ? <iframe
      title={`Watch ${episode.title}`}
      src={`https://www.youtube-nocookie.com/embed/${episode.youtube_id}?autoplay=1`}
      className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
    /> : <button type="button" aria-label={`Play ${episode.title}`} className="relative flex h-full w-full items-center justify-center" onClick={() => { trackKhudiiEvent('podcast_play', 'podcasts', String(episode.id)); setPlaying(v => ({ ...v, [episode.id]: true })); }}><img className="absolute inset-0 h-full w-full object-cover" src={`https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`} alt="" loading="lazy" /><span className="relative flex h-16 w-16 items-center cursor-pointer justify-center rounded-full bg-[#2563eb] text-white shadow-xl"><Play size={28} fill="currentColor" /></span></button>}</div>
    <div className="px-2 py-3"><h3 className="text-xl font-semibold text-[#02236e]"><Link href={`/podcast/${episode.slug}`} className="hover:underline-none">{episode.title}</Link></h3>{episode.description && <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{episode.description}</p>}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {/* <Link href={`/podcast/${episode.slug}`} className="font-semibold text-[#2563eb] underline">Episode details</Link> */}
        {/* <a href={`https://www.youtube.com/watch?v=${episode.youtube_id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#02236e] underline">Watch on YouTube</a> */}
      </div></div>
  </article>)}</div>;
}
