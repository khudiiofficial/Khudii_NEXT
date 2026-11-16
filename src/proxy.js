import { NextResponse } from 'next/server';

const PUBLIC_API_PREFIXES = [
  '/items', '/item/', '/icons/', '/socials/', '/Blog/', '/getAllBlogs', '/getSimilarItem',
  '/api/', '/contact-inquiry', '/itemByCategory/', '/getsuccessstories', '/getAllVedios',
  '/certifications', '/testimonials', '/events', '/getAllSectors', '/CBN/',
  '/getCrouselimages', '/detail/', '/success-story/', '/cms/',
];

const LOGIN = '/letskhudii';
const LEGACY_LOGIN_PATHS = new Set(['/login', '/admin/login', '/admin-app/login']);
function isAsset(pathname) {
  return pathname.startsWith('/_next/') || pathname === '/favicon.ico' ||
    pathname === '/robots.txt' || pathname === '/sitemap.xml' || /\.[a-zA-Z0-9]{2,8}$/.test(pathname);
}
function isDocumentRequest(request) {
  return request.headers.get('sec-fetch-dest') === 'document' ||
    request.headers.get('rsc') === '1' || request.headers.has('next-router-prefetch') ||
    request.nextUrl.searchParams.has('_rsc') || (request.headers.get('accept') || '').includes('text/html');
}
function adminHost(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(':')[0].toLowerCase();
  return host === 'admin.khudii.com' || host.startsWith('admin.') || process.env.FORCE_ADMIN_HOST === '1';
}
function routeRedirect(request, pathname, permanent = false) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url, permanent ? 308 : 307);
}
function rewriteWithSurface(request, pathname, surface) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khudii-surface', surface);
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const lower = pathname.toLowerCase();
  const token = request.cookies.get('token')?.value;

  // Legacy WordPress blog category: canonical Next.js blog listing.
  if (lower === '/category/blog' || lower === '/category/blog/') {
    return routeRedirect(request, '/blogs', true);
  }

  // One canonical admin login page on either public or dedicated admin hostname.
  // Old login slugs have no forms and redirect to the canonical address.
  if (LEGACY_LOGIN_PATHS.has(lower)) return routeRedirect(request, LOGIN, true);
  // Let the server-validated session guard decide if a token is valid.
  // A stale HttpOnly token must NOT bounce between login and dashboard.
  if (lower === LOGIN) return NextResponse.next();
  if (lower.startsWith('/admin-app')) {
    if (!token) return routeRedirect(request, LOGIN);
    return NextResponse.next();
  }
  if (isAsset(pathname) || pathname.startsWith('/api-app') || pathname.startsWith('/media-app')) {
    return NextResponse.next();
  }

  if (adminHost(request)) {
    if (!token && (lower === '/' || lower === '/dashboard' || lower.startsWith('/dashboard/') || isDocumentRequest(request))) {
      return routeRedirect(request, LOGIN);
    }
    if (token && lower === '/') return routeRedirect(request, '/admin-app/dashboard');
    if (lower === '/dashboard' || lower.startsWith('/dashboard/')) {
      return rewriteWithSurface(request, `/admin-app${pathname}`, 'admin');
    }
    return rewriteWithSurface(request, `/api-app${pathname}`, 'admin');
  }

  // Admin screens may run on the public hostname (/admin-app/dashboard).
  // Axios/native fetch identify admin API calls explicitly. The previous proxy
  // unconditionally rewrote /api/* as public, overriding that header and 404ing CRUD.
  // Header selection is not authorization; every admin route still verifies JWT.
  if (request.headers.get('x-khudii-surface') === 'admin' && !isDocumentRequest(request)) {
    return rewriteWithSurface(request, `/api-app${pathname}`, 'admin');
  }

  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
    prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isPublicApi && !isDocumentRequest(request)) {
    return rewriteWithSurface(request, `/api-app${pathname}`, 'public');
  }
  return NextResponse.next();
}

export default proxy;
export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
