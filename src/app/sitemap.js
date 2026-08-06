const routes = [
  '',
  '/organizations',
  '/about-khudii',
  '/golden-people',
  '/contact',
  '/contribute-your-story',
  '/donate-now',
  '/success-stories',
  '/social-media',
  '/videos',
  '/testimonials',
  '/tribute',
  '/certifications',
  '/faqs',
  '/blogs',
  '/jobs',
  '/volunteer',
  '/organization/registration',
];

export default function sitemap() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://khudii.com').replace(/\/$/, '');
  return routes.map((route) => ({
    url: `${site}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
