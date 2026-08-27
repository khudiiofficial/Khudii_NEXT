import axios from 'axios';

const responseCache = new Map();
const inflight = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export function cachedPublicGet(url, config = {}, ttl = DEFAULT_TTL) {
  // Only cache ordinary public GETs. AbortSignal-bound requests keep their own lifecycle.
  if (config?.signal) return axios.get(url, config);

  const now = Date.now();
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.response);
  }

  const pending = inflight.get(url);
  if (pending) return pending;

  const request = axios.get(url, config)
    .then((response) => {
      responseCache.set(url, { response, expiresAt: Date.now() + ttl });
      return response;
    })
    .finally(() => inflight.delete(url));

  inflight.set(url, request);
  return request;
}

export function clearPublicGetCache(url) {
  if (url) responseCache.delete(url);
  else responseCache.clear();
}
