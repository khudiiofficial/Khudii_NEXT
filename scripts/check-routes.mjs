import { readFile } from 'node:fs/promises';

const publicText = await readFile('src/server/public-routes.js', 'utf8');
const adminText = await readFile('src/server/admin-routes.js', 'utf8');
const proxyText = await readFile('src/proxy.js', 'utf8');

const requiredPublic = [
  '/items', '/item/:slug', '/icons/:id', '/socials/:item_id', '/itemByCategory/:name',
  '/getSimilarItem', '/getAllSectors', '/getAllBlogs', '/Blog/:slug', '/getsuccessstories',
  '/success-story/:slug', '/getAllVedios', '/certifications', '/testimonials', '/events',
  '/api/events', '/api/stories', '/api/welcome', '/api/vision-mission', '/api/getabout',
  '/api/faqs', '/detail/:slug', '/api/topbar', '/api/telephone', '/api/footer', '/api/seo',
  '/api/bank', '/getCrouselimages', '/api/contact', '/contact-inquiry', '/api/volunteer',
  '/api/job-application', '/api/contribute-story', '/api/donations', '/api/organization/submit',
];

const requiredAdmin = [
  '/auth/login', '/authlogin', '/auth/change-password', '/organizations', '/api/blogs', '/api/success-stories', '/api/videos',
  '/admin/inquiries', '/admin/donations', '/admin/stories', '/admin/job-applications',
  '/admin/volunteers', '/admin/contact-messages', '/api/topbar', '/certifications',
  '/testimonials', '/events', '/sectors/admin', '/api/carousel', '/api/welcome',
  '/api/vision-mission', '/api/content', '/api/seo', '/api/faqs', '/api/footer',
  '/api/bank', '/api/admin/submissions',
];

for (const route of requiredPublic) {
  if (!publicText.includes(`'${route}'`) && !publicText.includes(`\"${route}\"`)) {
    throw new Error(`Missing public route: ${route}`);
  }
}
for (const route of requiredAdmin) {
  if (!adminText.includes(route)) throw new Error(`Missing admin route family: ${route}`);
}
for (const required of ['admin.khudii.com', '/admin-app', '/api-app']) {
  if (!proxyText.includes(required)) throw new Error(`Proxy is missing: ${required}`);
}
if (!proxyText.includes("lower === '/login' ? '/Login'")) {
  throw new Error('Proxy must normalize the case-sensitive admin login route.');
}
console.log('Required public/admin routes and host rewrites are present.');
