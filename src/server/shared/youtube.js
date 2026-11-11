/** Parse a YouTube video ID or a supported YouTube URL; never accept iframe HTML. */
export function youtubeVideoId(input) {
  const text = typeof input === 'string' ? input.trim() : '';
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
  if (!text || text.length > 2048) return null;
  let url;
  try { url = new URL(text); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  let candidate = null;
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    candidate = url.pathname.split('/').filter(Boolean)[0];
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'watch') candidate = url.searchParams.get('v');
    else if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) candidate = parts[1];
  }
  return /^[A-Za-z0-9_-]{11}$/.test(candidate || '') ? candidate : null;
}

export function slugifyContent(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
