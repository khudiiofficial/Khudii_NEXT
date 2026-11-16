import { dispatch } from '@/server/adapter';
import { routes as publicRoutes } from '@/server/public-routes';
import { routes as adminRoutes } from '@/server/admin-routes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function handler(request, context) {
  const params = await context.params;
  const parts = params?.path || [];
  const originalPath = `/${parts.join('/')}`;
  const surface = request.headers.get('x-khudii-surface');
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .toLowerCase();
  const isAdmin = surface === 'admin' || host === 'admin.khudii.com' || host.startsWith('admin.');
  const response = await dispatch(request, isAdmin ? adminRoutes : publicRoutes, originalPath);

  // Public read endpoints are requested repeatedly by the shell and page sections.
  // Cache them briefly so navigation does not hit MySQL again for unchanged content.
  if (!isAdmin && request.method === 'GET' && !originalPath.startsWith('/cms/v2/') && response?.headers && response.status >= 200 && response.status < 300) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  if (!isAdmin && request.method === 'GET' && response?.headers && response.status >= 400) {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
