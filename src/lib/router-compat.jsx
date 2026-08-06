'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import { useCallback, useMemo } from 'react';

function normalizeHref(value) {
  if (value == null) return '/';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const pathname = value.pathname || '/';
    const search = value.search || '';
    const hash = value.hash || '';
    return `${pathname}${search}${hash}`;
  }
  return '/';
}

export function Link({ to, href, replace = false, children, ...props }) {
  return (
    <NextLink href={normalizeHref(href ?? to)} replace={replace} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else if (to === 0) router.refresh();
      else router.forward();
      return;
    }

    const href = normalizeHref(to);
    const navigationOptions = { scroll: options.scroll };

    if (options.replace) router.replace(href, navigationOptions);
    else router.push(href, navigationOptions);
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString();
  return useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: pathname,
    }),
    [pathname, search],
  );
}

export function useParams() {
  return useNextParams() || {};
}

export function useSearchParams() {
  const params = useNextSearchParams();
  return [params, () => {}];
}
