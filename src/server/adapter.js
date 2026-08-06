import { NextResponse } from 'next/server';

function compilePath(pattern) {
  const keys = [];
  const source = pattern
    .split('/')
    .map((part) => {
      if (!part) return '';
      if (part.startsWith(':')) {
        keys.push(part.slice(1));
        return '([^/]+)';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp(`^${source}/?$`), keys };
}

function cookieObject(request) {
  return Object.fromEntries(request.cookies.getAll().map((cookie) => [cookie.name, cookie.value]));
}

function queryObject(searchParams) {
  const result = {};
  for (const [key, value] of searchParams.entries()) {
    if (key in result) result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
    else result[key] = value;
  }
  return result;
}

async function bodyFor(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();
  if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const result = {};
    for (const [key, value] of formData.entries()) {
      if (key in result) result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
      else result[key] = value;
    }
    return result;
  }
  const text = await request.text();
  return text ? { raw: text } : {};
}

function serializeCookie(name, value, options = {}) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge != null) cookie += `; Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`;
  if (options.expires) cookie += `; Expires=${new Date(options.expires).toUTCString()}`;
  cookie += `; Path=${options.path || '/'}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure || process.env.NODE_ENV === 'production') cookie += '; Secure';
  if (options.sameSite) {
    const sameSite = String(options.sameSite);
    cookie += `; SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1).toLowerCase()}`;
  }
  return cookie;
}

export async function dispatch(request, routes, originalPath) {
  const url = new URL(request.url);
  let matched;

  for (const candidate of routes) {
    if (candidate.method !== request.method) continue;
    const compiled = compilePath(candidate.path);
    const match = originalPath.match(compiled.regex);
    if (match) {
      matched = { route: candidate, compiled, match };
      break;
    }
  }

  if (!matched) {
    return NextResponse.json(
      { success: false, message: 'Route not found', path: originalPath, method: request.method },
      { status: 404 },
    );
  }

  const params = {};
  matched.compiled.keys.forEach((key, index) => {
    params[key] = decodeURIComponent(matched.match[index + 1]);
  });

  let body = {};
  try {
    body = await bodyFor(request);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  const req = {
    method: request.method,
    url: originalPath,
    originalUrl: originalPath,
    path: originalPath,
    params,
    query: queryObject(url.searchParams),
    headers: Object.fromEntries(request.headers.entries()),
    cookies: cookieObject(request),
    body,
    user: undefined,
    get(name) {
      return request.headers.get(name);
    },
  };

  let status = 200;
  let payload;
  let ended = false;
  const responseHeaders = new Headers();
  let resolveCompletion;
  let rejectCompletion;
  const completion = new Promise((resolve, reject) => {
    resolveCompletion = resolve;
    rejectCompletion = reject;
  });

  const finish = (value) => {
    if (!ended) {
      ended = true;
      payload = value;
      resolveCompletion();
    }
    return res;
  };

  const res = {
    status(code) {
      status = code;
      return res;
    },
    json(value) {
      return finish(value);
    },
    send(value) {
      return finish(value);
    },
    end(value) {
      return finish(value);
    },
    set(name, value) {
      responseHeaders.set(name, value);
      return res;
    },
    setHeader(name, value) {
      responseHeaders.set(name, value);
      return res;
    },
    cookie(name, value, options = {}) {
      responseHeaders.append('Set-Cookie', serializeCookie(name, value, options));
      return res;
    },
    clearCookie(name, options = {}) {
      responseHeaders.append('Set-Cookie', serializeCookie(name, '', { ...options, maxAge: 0 }));
      return res;
    },
  };

  let index = 0;
  const next = async (error) => {
    if (error) throw error;
    const handler = matched.route.handlers[index++];
    if (!handler) return;
    return handler(req, res, next);
  };

  try {
    const returned = next();
    if (returned && typeof returned.then === 'function') {
      returned.catch(rejectCompletion);
    }

    if (!ended) {
      const timeoutMs = Number(process.env.API_HANDLER_TIMEOUT_MS || 280000);
      let timer;
      try {
        await Promise.race([
          completion,
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error(`API handler timed out after ${timeoutMs}ms`)),
              timeoutMs,
            );
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
  } catch (error) {
    console.error(`[${request.method} ${originalPath}]`, error);
    status = 500;
    payload = {
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {}),
    };
  }

  if (payload instanceof Response) return payload;
  if (payload === undefined) payload = { success: status < 400 };

  if (typeof payload === 'string' || payload instanceof Uint8Array || Buffer.isBuffer(payload)) {
    return new NextResponse(payload, { status, headers: responseHeaders });
  }
  return NextResponse.json(payload, { status, headers: responseHeaders });
}
