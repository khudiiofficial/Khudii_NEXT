import { getSitemapContentUrls } from '@/server/seo-intelligence';
import { cmsV2Sitemap } from '@/server/cms-v2/metadata';
import db from '@/server/admin-backend/Database/oldDB';

export const revalidate = 86400; // 24-hour auto-refresh cycle

export default async function sitemap() {
  try {
    const [legacy, dynamicPages, matrixRows] = await Promise.all([
      getSitemapContentUrls(),
      cmsV2Sitemap().catch(() => []),
      db
        .promise()
        .query('SELECT page_path, sitemap_include, sitemap_priority, sitemap_frequency FROM khudii_seo_page_matrix')
        .then(([r]) => r)
        .catch(() => []),
    ]);

    const matrixByPath = new Map(matrixRows.map((r) => [r.page_path, r]));
    const combined = [...new Map([...legacy, ...dynamicPages].map((item) => [item.url, item])).values()];

    return combined
      .filter((item) => {
        try {
          const pathname = new URL(item.url).pathname || '/';
          const rule = matrixByPath.get(pathname);
          if (rule && Number(rule.sitemap_include) === 0) return false;
        } catch { /* keep */ }
        return true;
      })
      .map((item) => {
        try {
          const pathname = new URL(item.url).pathname || '/';
          const rule = matrixByPath.get(pathname);
          if (rule) {
            return {
              ...item,
              priority: Number(rule.sitemap_priority ?? item.priority ?? 0.8),
              changeFrequency: rule.sitemap_frequency || item.changeFrequency || 'weekly',
            };
          }
        } catch { /* keep */ }
        return item;
      });
  } catch (e) {
    console.error('[sitemap generation]', e.code || e.message);
    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com').replace(/\/+$/, '');
    return [{ url: base + '/', changeFrequency: 'weekly', priority: 1 }];
  }
}
