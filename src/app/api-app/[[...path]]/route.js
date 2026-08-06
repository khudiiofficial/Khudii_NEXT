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
  return dispatch(request, isAdmin ? adminRoutes : publicRoutes, originalPath);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
