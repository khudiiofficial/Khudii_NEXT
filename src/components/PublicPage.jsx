'use client';

import { usePublicSeo } from './PublicShell';

export default function PublicPage({ component: Component, seoPath, passSeo = true }) {
  const { getPage, baseUrl } = usePublicSeo();
  if (!passSeo) return <Component />;
  return <Component con={getPage(seoPath)} url={baseUrl} />;
}
