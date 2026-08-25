import { NextResponse } from 'next/server';

const PUBLIC_API_PREFIXES = [
  '/items',
  '/item/',
  '/icons/',
  '/socials/',
  '/Blog/',
  '/getAllBlogs',
  '/getSimilarItem',
  '/api/',
  '/contact-inquiry',
  '/itemByCategory/',
  '/getsuccessstories',
  '/getAllVedios',
  '/certifications',
  '/testimonials',
  '/events',
  '/getAllSectors',
  '/CBN/',
  '/getCrouselimages',
  '/detail/',
  '/success-story/',
];

function isAsset(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[a-zA-Z0-9]{2,8}$/.test(pathname)
  );
}

function isDocumentRequest(request) {
  return (
    request.headers.get('sec-fetch-dest') === 'document' ||
    request.headers.get('rsc') === '1' ||
    request.headers.has('next-router-prefetch') ||
    request.nextUrl.searchParams.has('_rsc') ||
    (request.headers.get('accept') || '').includes('text/html')
  );
}


function adminHost(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .toLowerCase();
  return host === 'admin.khudii.com' || host.startsWith('admin.') || process.env.FORCE_ADMIN_HOST === '1';
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
  if (isAsset(pathname) || pathname.startsWith('/api-app') || pathname.startsWith('/admin-app') || pathname.startsWith('/media-app')) {
    return NextResponse.next();
  }

  if (adminHost(request)) {
    const lower = pathname.toLowerCase();
    const token = request.cookies.get('token')?.value;
    const isAdminPage = lower === '/' || lower === '/login' || lower === '/dashboard' || lower.startsWith('/dashboard/');

    if (isAdminPage || isDocumentRequest(request)) {
      if (!token && lower !== '/login') {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/Login';
        return NextResponse.redirect(loginUrl);
      }
      if (token && (lower === '/' || lower === '/login')) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/admin-app/dashboard';
        return NextResponse.redirect(dashboardUrl);
      }
      const adminPath = lower === '/login' ? '/Login' : pathname;
      return rewriteWithSurface(request, `/admin-app${adminPath === '/' ? '' : adminPath}`, 'admin');
    }

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

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
