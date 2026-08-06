'use client';

import axios from 'axios';

const DATA_URL_PATTERN = /^data:([^;,]+);base64,(.+)$/s;
const MIN_PREUPLOAD_BYTES = 1;
const CHUNK_BYTES = 2 * 1024 * 1024;
let interceptorId;
let originalFetch;
let fetchInstallCount = 0;

function extensionForMime(mime) {
  const known = {
    'image/jpeg': 'jpg',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'video/quicktime': 'mov',
  };
  return known[mime] || mime.split('/')[1]?.split('+')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
}

function approximateBytes(base64) {
  return Math.floor((base64.length * 3) / 4);
}

async function uploadDataUrl(dataUrl) {
  const match = dataUrl.match(DATA_URL_PATTERN);
  if (!match) return dataUrl;
  const [, mime, base64] = match;
  if (approximateBytes(base64) < MIN_PREUPLOAD_BYTES) return dataUrl;

  const rawFetch = originalFetch || globalThis.fetch.bind(globalThis);
  const blob = await rawFetch(dataUrl).then((response) => response.blob());
  const uploadId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fileName = `preupload-${uploadId}.${extensionForMime(mime)}`;
  const total = Math.ceil(blob.size / CHUNK_BYTES);
  let finalUrl = '';

  for (let index = 0; index < total; index += 1) {
    const offset = index * CHUNK_BYTES;
    const chunk = blob.slice(offset, Math.min(offset + CHUNK_BYTES, blob.size));
    const response = await rawFetch('/media-app/chunk', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/octet-stream',
        'x-khudii-upload-name': fileName,
        'x-khudii-upload-mime': mime,
        'x-khudii-upload-index': String(index),
        'x-khudii-upload-total': String(total),
        'x-khudii-upload-offset': String(offset),
        'x-khudii-upload-size': String(blob.size),
      },
      body: chunk,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Upload failed with status ${response.status}`);
    }
    if (result.completed) finalUrl = result.url;
  }

  if (!finalUrl) throw new Error('Upload did not return a media URL');
  return finalUrl;
}

async function transform(value, seen = new WeakSet()) {
  if (typeof value === 'string') return uploadDataUrl(value);
  if (!value || typeof value !== 'object') return value;
  if (typeof FormData !== 'undefined' && value instanceof FormData) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) return value;
  if (value instanceof Date) return value;
  if (seen.has(value)) return value;
  seen.add(value);

  if (Array.isArray(value)) return Promise.all(value.map((entry) => transform(entry, seen)));
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return value;

  const output = {};
  for (const [key, entry] of Object.entries(value)) output[key] = await transform(entry, seen);
  return output;
}

function installFetchInterceptor() {
  fetchInstallCount += 1;
  if (originalFetch) return;

  originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init = {}) => {
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const inputUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url || '';

    if (method === 'GET' || method === 'HEAD' || inputUrl.includes('/media-app/chunk')) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    const contentType = headers.get('content-type') || '';
    let body = init.body;

    if (typeof body === 'string' && contentType.toLowerCase().includes('application/json')) {
      try {
        body = JSON.stringify(await transform(JSON.parse(body)));
      } catch (error) {
        if (error instanceof SyntaxError) return originalFetch(input, init);
        throw error;
      }
      return originalFetch(input, { ...init, headers, body });
    }

    return originalFetch(input, init);
  };
}

function uninstallFetchInterceptor() {
  fetchInstallCount = Math.max(0, fetchInstallCount - 1);
  if (fetchInstallCount === 0 && originalFetch) {
    globalThis.fetch = originalFetch;
    originalFetch = undefined;
  }
}

export function installLargePayloadUploadInterceptor() {
  installFetchInterceptor();

  if (interceptorId === undefined) {
    interceptorId = axios.interceptors.request.use(async (config) => {
      if (!config.data || config.__khudiiSkipPreupload) return config;
      const method = String(config.method || 'get').toLowerCase();
      if (method === 'get' || method === 'head') return config;

      let source = config.data;
      let stringify = false;
      if (typeof source === 'string') {
        try {
          source = JSON.parse(source);
          stringify = true;
        } catch {
          return config;
        }
      }
      const transformed = await transform(source);
      config.data = stringify ? JSON.stringify(transformed) : transformed;
      return config;
    });
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    uninstallFetchInterceptor();
    if (fetchInstallCount === 0 && interceptorId !== undefined) {
      axios.interceptors.request.eject(interceptorId);
      interceptorId = undefined;
    }
  };
}
