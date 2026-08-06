export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://khudii.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin-app/', '/api-app/'] },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
