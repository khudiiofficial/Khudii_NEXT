import db from './admin-backend/Database/oldDB.js';
import { CMS_PAGES } from '@/lib/cms-registry';

const sql = db.promise();

const stripHtml = (v = '') =>
  String(v || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const clip = (v = '', max = 260) => {
  const s = stripHtml(v);
  return s.length > max ? `${s.slice(0, max - 1).trim()}…` : s;
};

const safeImg = (v = '') => {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || s.startsWith('/')) return s;
  return '';
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out',
  'has', 'have', 'had', 'what', 'when', 'where', 'who', 'why', 'how', 'with', 'this', 'that',
  'from', 'they', 'will', 'would', 'there', 'their', 'about', 'which', 'more', 'some', 'into',
  'than', 'them', 'then', 'your', 'please', 'tell', 'give', 'show', 'find', 'want', 'need',
  'does', 'khudii', 'khudi', 'info', 'information', 'details', 'detail', 'page', 'link', 'links',
]);

function tokenize(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function scoreText(haystack = '', tokens = [], rawLower = '') {
  const h = String(haystack || '').toLowerCase();
  if (!h) return 0;
  let score = 0;
  if (rawLower.length >= 4 && h.includes(rawLower)) score += 60;
  for (const t of tokens) {
    if (h.includes(t)) score += t.length >= 5 ? 18 : 12;
  }
  return score;
}

const STATIC_FRONTEND_PAGES = [
  {
    title: 'Khudii Home',
    url: '/',
    category: 'Platform',
    image: '/Khudii.webp',
    description:
      "Khudii is Pakistan's digital welfare ecosystem uniting verified NGOs, donors, volunteers, stories, blogs, podcasts, and community impact across healthcare, education, orphan care, special needs, and humanitarian relief.",
    keywords: 'home main landing khudii platform overview welfare pakistan',
  },
  {
    title: 'About Khudii — Vision, Mission & Team',
    url: '/about-khudii',
    category: 'About',
    image: '/Khudii.webp',
    description:
      'Learn about Khudii’s dream, purpose, vision, mission, CEO message, expert team, people behind Khudii, and verified social impact across Pakistan.',
    keywords: 'about us who we are vision mission dream purpose ceo founder team behind impact',
  },
  {
    title: 'Verified Organizations & NGOs Directory',
    url: '/organizations',
    category: 'Organizations',
    image: '/Khudii.webp',
    description:
      'Browse all verified welfare organizations, charities, trusts, hospitals, and foundations in Pakistan listed on Khudii with contact details, services, maps, and donation guidance.',
    keywords: 'organizations ngos charities welfare foundations trusts directory verified list search',
  },
  {
    title: 'Donate Now — Official Bank & Support Details',
    url: '/donate-now',
    category: 'Donations',
    image: '/Khudii.webp',
    description:
      'Support verified welfare causes, Zakat, Sadqah, and community initiatives directly through Khudii’s Donate Now page and official bank accounts.',
    keywords: 'donate donation zakat sadqah charity bank account iban transfer give money support fund',
  },
  {
    title: 'Khudii Blogs & Articles',
    url: '/blogs',
    category: 'Blogs',
    image: '/Khudii.webp',
    description:
      'Read insightful blogs, social welfare stories, awareness articles, and community reports published by Khudii.',
    keywords: 'blog blogs article articles post posts read news writing editorial',
  },
  {
    title: 'Khudii Podcast Series',
    url: '/podcast',
    category: 'Podcasts',
    image: '/Khudii.webp',
    description:
      'Watch and listen to Khudii Podcast episodes featuring inspiring social leaders, philanthropists, changemakers, and welfare pioneers.',
    keywords: 'podcast podcasts episode episodes interview interviews youtube audio video show guest',
  },
  {
    title: 'Video Gallery',
    url: '/videos',
    category: 'Videos',
    image: '/Khudii.webp',
    description:
      'Explore Khudii’s curated video gallery showcasing community welfare drives, documentaries, partner highlights, and field stories.',
    keywords: 'video videos gallery youtube watch documentary clip media',
  },
  {
    title: 'Success Stories',
    url: '/success-stories',
    category: 'Impact',
    image: '/Khudii.webp',
    description:
      'Discover real-life transformation and community success stories made possible through verified welfare organizations and supporters.',
    keywords: 'success story stories impact beneficiary transformation real life inspiring',
  },
  {
    title: 'Volunteer with Khudii',
    url: '/volunteer',
    category: 'Get Involved',
    image: '/Khudii.webp',
    description:
      'Register as a volunteer with Khudii by sharing your skills, city, and preferred welfare cause to help communities across Pakistan.',
    keywords: 'volunteer volunteering join help community service register signup',
  },
  {
    title: 'Jobs & Careers at Khudii',
    url: '/jobs',
    category: 'Careers',
    image: '/Khudii.webp',
    description:
      'Apply for career opportunities and social-sector roles with Khudii by submitting your application and CV online.',
    keywords: 'job jobs career careers hiring vacancy apply employment cv resume work',
  },
  {
    title: 'Register Your Organization / NGO',
    url: '/organization/registration',
    category: 'Organizations',
    image: '/Khudii.webp',
    description:
      'Submit your welfare organization or NGO for administrative review, document verification, and listing in Khudii’s public directory.',
    keywords: 'register organization ngo registration list submit charity partner apply verify',
  },
  {
    title: 'Contribute Your Story',
    url: '/contribute-your-story',
    category: 'Community',
    image: '/Khudii.webp',
    description:
      'Share an inspiring humanitarian story, personal welfare experience, or community hero spotlight to be featured on Khudii.',
    keywords: 'contribute story submit share experience write feature spotlight',
  },
  {
    title: 'Frequently Asked Questions (FAQs)',
    url: '/faqs',
    category: 'Help',
    image: '/Khudii.webp',
    description:
      'Find answers to common questions about Khudii’s platform, NGO verification, donations, volunteering, and partnerships.',
    keywords: 'faq faqs question questions help guide how it works common answers',
  },
  {
    title: 'Testimonials & Community Feedback',
    url: '/testimonials',
    category: 'Trust',
    image: '/Khudii.webp',
    description:
      'Read verified testimonials and endorsements from partner organizations, donors, volunteers, and community leaders.',
    keywords: 'testimonial testimonials review reviews feedback endorsement partner quote',
  },
  {
    title: 'Certifications & Verifications',
    url: '/certifications',
    category: 'Trust',
    image: '/Khudii.webp',
    description:
      'View Khudii’s official certifications, awards, legal accreditations, and transparency recognitions.',
    keywords: 'certification certifications certificate award accreditation legal verified registration',
  },
  {
    title: 'Golden People',
    url: '/golden-people',
    category: 'Community',
    image: '/Khudii.webp',
    description:
      'Celebrating extraordinary philanthropists, humanitarians, and everyday heroes transforming lives across Pakistan.',
    keywords: 'golden people heroes philanthropists humanitarians changemakers notable figures',
  },
  {
    title: 'Tribute',
    url: '/tribute',
    category: 'Community',
    image: '/Khudii.webp',
    description:
      'Honoring the enduring legacy of Pakistan’s greatest social welfare pioneers and compassionate leaders.',
    keywords: 'tribute honor memorial legacy pioneers welfare heroes',
  },
  {
    title: 'Social Media Hub',
    url: '/social-media',
    category: 'Connect',
    image: '/Khudii.webp',
    description:
      'Connect with Khudii’s official Facebook, Instagram, YouTube, TikTok, LinkedIn, and community channels.',
    keywords: 'social media facebook instagram youtube tiktok linkedin twitter follow channels',
  },
  {
    title: 'Contact Khudii',
    url: '/contact',
    category: 'Support',
    image: '/Khudii.webp',
    description:
      'Reach the Khudii support team via our contact form, email, telephone, or office address for partnerships, media, or assistance.',
    keywords: 'contact support email phone telephone call address location office reach help',
  },
];

let cachedSnapshot = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

export function invalidateAskKhudiiCache() {
  cachedSnapshot = null;
  cachedAt = 0;
}

async function safeQuery(statement, params = []) {
  try {
    const [rows] = await sql.query(statement, params);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function getFullSiteKnowledge(forceRefresh = false) {
  if (!forceRefresh && cachedSnapshot && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSnapshot;
  }

  const [
    orgs,
    socials,
    orgImages,
    sectors,
    blogs,
    blogSections,
    podcasts,
    videos,
    stories,
    faqs,
    testimonials,
    certifications,
    bankRows,
    welcomeRows,
    whoWeAre,
    dreamPurpose,
    visionItems,
    ceoRows,
    teamRows,
    peopleBehind,
    impactRows,
    eventsRows,
    footerRows,
    phoneRows,
    settingsRows,
    cmsPagesRows,
    pageSeoFaqsRows,
    pageSeoContextRows,
  ] = await Promise.all([
    safeQuery('SELECT id, name, category, slug, description, partner_image, introductory_image_path, search_tags FROM items WHERE status = 1 AND deletestatus = 0 ORDER BY id DESC LIMIT 200'),
    safeQuery('SELECT item_id, phone, email, website, location, facebook, instagram, youtube, twitter, linkedin FROM socials LIMIT 500'),
    safeQuery('SELECT item_id, image_path FROM item_images LIMIT 500'),
    safeQuery('SELECT id, title, slug, description, image FROM sectors WHERE deletestatus = 0 ORDER BY id ASC LIMIT 100'),
    safeQuery('SELECT id, Name, intro, slug, image, created_at FROM document WHERE status = 1 AND deletestatus = 0 ORDER BY id DESC LIMIT 150'),
    safeQuery('SELECT document_id, heading, paragraph FROM documentarr LIMIT 400'),
    safeQuery('SELECT id, title, description, slug, youtube_id, thumbnail_url, guest_name, duration FROM podcast WHERE is_published = 1 ORDER BY sort_order ASC, id DESC LIMIT 100'),
    safeQuery('SELECT id, title, description, video_url, thumbnail FROM videos WHERE deletestatus = 0 ORDER BY id DESC LIMIT 100'),
    safeQuery('SELECT id, title, description, slug, image FROM successstories WHERE deletestatus = 0 ORDER BY id DESC LIMIT 100'),
    safeQuery('SELECT id, question, answer FROM faqs WHERE is_active = 1 ORDER BY display_order ASC, id ASC LIMIT 150'),
    safeQuery('SELECT id, name, designation, message, image FROM testimonials ORDER BY id DESC LIMIT 80'),
    safeQuery('SELECT id, title, description, image FROM certifications ORDER BY id DESC LIMIT 80'),
    safeQuery('SELECT * FROM bankdata ORDER BY id DESC LIMIT 10'),
    safeQuery('SELECT * FROM welcomesection ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM who_we_are ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM dream_and_purpose ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM vision_mission_items ORDER BY sort_order ASC, id ASC LIMIT 20'),
    safeQuery('SELECT * FROM ceo ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM expert_team ORDER BY id ASC LIMIT 30'),
    safeQuery('SELECT * FROM people_behind ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM impact ORDER BY id DESC LIMIT 5'),
    safeQuery('SELECT * FROM events ORDER BY id DESC LIMIT 30'),
    safeQuery('SELECT * FROM footercontents ORDER BY id DESC LIMIT 3'),
    safeQuery('SELECT * FROM telephone ORDER BY id DESC LIMIT 3'),
    safeQuery("SELECT bucket, content FROM khudii_admin_settings WHERE bucket IN ('profile','site_identity','ai_chat')"),
    safeQuery("SELECT id, title, slug, path, status FROM khudii_site_pages WHERE deleted_at IS NULL AND status = 'published' ORDER BY sort_order ASC LIMIT 100"),
    safeQuery("SELECT page_id, question, answer FROM page_seo_faqs WHERE status != 'archived' ORDER BY sort_order ASC LIMIT 200"),
    safeQuery("SELECT page_id, summary, entity_topics FROM page_seo_contexts WHERE status != 'archived' LIMIT 100"),
  ]);

  const socialsByOrg = new Map();
  for (const s of socials) {
    if (!socialsByOrg.has(s.item_id)) socialsByOrg.set(s.item_id, s);
  }
  const imgByOrg = new Map();
  for (const img of orgImages) {
    if (!imgByOrg.has(img.item_id) && img.image_path) imgByOrg.set(img.item_id, safeImg(img.image_path));
  }
  const sectionsByBlog = new Map();
  for (const sec of blogSections) {
    const arr = sectionsByBlog.get(sec.document_id) || [];
    arr.push(`${sec.heading || ''} ${stripHtml(sec.paragraph || '')}`.trim());
    sectionsByBlog.set(sec.document_id, arr);
  }

  const enrichedOrgs = orgs.map((o) => {
    const soc = socialsByOrg.get(o.id) || {};
    const image = safeImg(o.partner_image) || safeImg(o.introductory_image_path) || imgByOrg.get(o.id) || '';
    const cleanCat = String(o.category || 'Welfare').replace(/[\[\]"]/g, '').trim();
    return {
      id: o.id,
      name: o.name || 'Verified Organization',
      category: cleanCat,
      slug: o.slug,
      url: o.slug ? `/organization/${o.slug}` : '/organizations',
      image,
      description: clip(o.description, 260),
      fullText: `${o.name || ''} ${cleanCat} ${o.search_tags || ''} ${stripHtml(o.description)} ${soc.location || ''}`,
      phone: soc.phone || '',
      email: soc.email || '',
      website: soc.website || '',
      location: soc.location || '',
    };
  });

  const enrichedBlogs = blogs.map((b) => {
    const extra = (sectionsByBlog.get(b.id) || []).join(' ');
    return {
      id: b.id,
      title: b.Name || 'Khudii Article',
      slug: b.slug,
      url: b.slug ? `/Blog/${b.slug}` : '/blogs',
      image: safeImg(b.image),
      excerpt: clip(b.intro || extra, 240),
      fullText: `${b.Name || ''} ${stripHtml(b.intro)} ${extra}`,
    };
  });

  const enrichedPodcasts = podcasts.map((p) => ({
    id: p.id,
    title: p.title || 'Khudii Podcast Episode',
    slug: p.slug,
    url: p.slug ? `/podcast/${p.slug}` : '/podcast',
    image: safeImg(p.thumbnail_url) || (p.youtube_id ? `https://img.youtube.com/vi/${p.youtube_id}/hqdefault.jpg` : ''),
    description: clip(p.description, 240),
    guest: p.guest_name || '',
    youtubeId: p.youtube_id || '',
    fullText: `${p.title || ''} ${p.guest_name || ''} ${stripHtml(p.description)}`,
  }));

  const enrichedVideos = videos.map((v) => {
    const ytMatch = String(v.video_url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    const ytThumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : '';
    return {
      id: v.id,
      title: v.title || 'Khudii Video',
      url: '/videos',
      videoUrl: v.video_url || '',
      image: safeImg(v.thumbnail) || ytThumb,
      description: clip(v.description, 220),
      fullText: `${v.title || ''} ${stripHtml(v.description)}`,
    };
  });

  const enrichedStories = stories.map((s) => ({
    id: s.id,
    title: s.title || 'Success Story',
    slug: s.slug,
    url: s.slug ? `/success-stories/${s.slug}` : '/success-stories',
    image: safeImg(s.image),
    description: clip(s.description, 240),
    fullText: `${s.title || ''} ${stripHtml(s.description)}`,
  }));

  const enrichedSectors = sectors.map((sec) => ({
    id: sec.id,
    title: sec.title || 'Welfare Sector',
    slug: sec.slug,
    url: sec.slug ? `/Categories/${sec.slug}` : '/organizations',
    image: safeImg(sec.image),
    description: clip(sec.description, 200),
    fullText: `${sec.title || ''} ${stripHtml(sec.description)}`,
  }));

  const enrichedFaqs = faqs.map((f) => ({
    id: f.id,
    question: stripHtml(f.question),
    answer: stripHtml(f.answer),
    url: '/faqs',
  }));

  for (const pf of (pageSeoFaqsRows || [])) {
    if (pf.question && pf.answer) {
      enrichedFaqs.push({
        id: `page-faq-${pf.page_id}-${pf.id || Math.random()}`,
        question: stripHtml(pf.question),
        answer: stripHtml(pf.answer),
        url: pf.page_id ? (pf.page_id.startsWith('/') ? pf.page_id : `/${pf.page_id}`) : '/faqs',
      });
    }
  }

  const enrichedTestimonials = testimonials.map((t) => ({
    id: t.id,
    name: t.name || 'Community Member',
    designation: t.designation || '',
    message: clip(t.message, 220),
    image: safeImg(t.image),
    url: '/testimonials',
  }));

  const enrichedCerts = certifications.map((c) => ({
    id: c.id,
    title: c.title || 'Official Certification',
    description: clip(c.description, 200),
    image: safeImg(c.image),
    url: '/certifications',
  }));

  const enrichedEvents = eventsRows.map((ev) => ({
    id: ev.id,
    title: ev.title || ev.name || 'Khudii Event',
    description: clip(ev.description || ev.details || '', 220),
    date: ev.date || ev.event_date || '',
    image: safeImg(ev.image || ev.image_url || ''),
    url: '/',
  }));

  const settingsMap = {};
  for (const r of settingsRows) {
    try { settingsMap[r.bucket] = JSON.parse(r.content || '{}'); } catch { settingsMap[r.bucket] = {}; }
  }

  const allPagesMap = new Map();
  for (const p of STATIC_FRONTEND_PAGES) allPagesMap.set(p.url, p);
  for (const p of CMS_PAGES) {
    if (!p.slug || p.slug === '@global' || p.slug.includes('[') || allPagesMap.has(p.slug)) continue;
    allPagesMap.set(p.slug, {
      title: p.title || p.slug,
      url: p.slug,
      category: 'Page',
      image: '/Khudii.webp',
      description: `Visit ${p.title || p.slug} on Khudii.`,
      keywords: `${p.title || ''} ${p.slug}`,
    });
  }
  for (const p of cmsPagesRows) {
    const url = p.path || (p.slug === 'home' ? '/' : `/${p.slug}`);
    if (!allPagesMap.has(url)) {
      allPagesMap.set(url, {
        title: p.title || url,
        url,
        category: 'CMS Page',
        image: '/Khudii.webp',
        description: `Explore ${p.title || url} on Khudii.`,
        keywords: `${p.title || ''} ${url}`,
      });
    }
  }

  const about = {
    welcome: welcomeRows[0] ? { title: stripHtml(welcomeRows[0].title || welcomeRows[0].heading), text: clip(welcomeRows[0].description || welcomeRows[0].paragraph || welcomeRows[0].content, 350), image: safeImg(welcomeRows[0].image || '') } : null,
    whoWeAre: whoWeAre[0] ? { title: stripHtml(whoWeAre[0].heading || whoWeAre[0].title || 'Who We Are'), text: clip(whoWeAre[0].description || whoWeAre[0].paragraph || whoWeAre[0].content, 400), image: safeImg(whoWeAre[0].image || '') } : null,
    dream: dreamPurpose[0] ? { title: stripHtml(dreamPurpose[0].heading || dreamPurpose[0].title || 'Dream & Purpose'), text: clip(dreamPurpose[0].description || dreamPurpose[0].paragraph || dreamPurpose[0].content, 400) } : null,
    visionMission: visionItems.map((v) => ({ title: stripHtml(v.title || v.heading), text: clip(v.description || v.paragraph || v.content, 240) })).filter((v) => v.title || v.text),
    ceo: ceoRows[0] ? { name: stripHtml(ceoRows[0].name || ceoRows[0].heading || 'CEO Message'), text: clip(ceoRows[0].description || ceoRows[0].message || ceoRows[0].paragraph, 360), image: safeImg(ceoRows[0].image || '') } : null,
    team: teamRows.map((m) => ({ name: stripHtml(m.name || m.title), role: stripHtml(m.designation || m.role || ''), bio: clip(m.description || m.bio || '', 180), image: safeImg(m.image || '') })).filter((m) => m.name),
    peopleBehind: peopleBehind[0] ? clip(peopleBehind[0].description || peopleBehind[0].paragraph || '', 300) : '',
    impact: impactRows[0] ? clip(impactRows[0].description || impactRows[0].paragraph || '', 300) : '',
  };

  const contact = {
    email: footerRows[0]?.email || settingsMap.profile?.email || 'info@khudii.com',
    phone: phoneRows[0]?.phone_number || settingsMap.profile?.phone || '',
    address: stripHtml(footerRows[0]?.locationinfo || ''),
    mapUrl: footerRows[0]?.location || '',
    footerText: clip(footerRows[0]?.footertext || '', 240),
    socials: {
      facebook: settingsMap.profile?.facebook_url || settingsMap.profile?.facebook || '',
      instagram: settingsMap.profile?.instagram_url || settingsMap.profile?.instagram || '',
      youtube: settingsMap.profile?.youtube_url || settingsMap.profile?.youtube || '',
      linkedin: settingsMap.profile?.linkedin_url || settingsMap.profile?.linkedin || '',
      twitter: settingsMap.profile?.twitter_url || settingsMap.profile?.twitter || '',
      tiktok: settingsMap.profile?.tiktok_url || settingsMap.profile?.tiktok || '',
      whatsapp: settingsMap.site_identity?.whatsappFloatUrl || settingsMap.profile?.whatsapp_url || '',
    },
  };

  cachedSnapshot = {
    pages: Array.from(allPagesMap.values()),
    organizations: enrichedOrgs,
    sectors: enrichedSectors,
    blogs: enrichedBlogs,
    podcasts: enrichedPodcasts,
    videos: enrichedVideos,
    stories: enrichedStories,
    faqs: enrichedFaqs,
    testimonials: enrichedTestimonials,
    certifications: enrichedCerts,
    events: enrichedEvents,
    banks: bankRows,
    about,
    contact,
    stats: {
      pages: allPagesMap.size,
      organizations: enrichedOrgs.length,
      sectors: enrichedSectors.length,
      blogs: enrichedBlogs.length,
      podcasts: enrichedPodcasts.length,
      videos: enrichedVideos.length,
      stories: enrichedStories.length,
      faqs: enrichedFaqs.length,
      testimonials: enrichedTestimonials.length,
      certifications: enrichedCerts.length,
      events: enrichedEvents.length,
      banks: bankRows.length,
    },
  };
  cachedAt = Date.now();
  return cachedSnapshot;
}

async function logChatQuery(query, source, matchedCount) {
  try {
    await sql.query(
      'INSERT INTO khudii_chat_analytics (query, matched_source, matched_count) VALUES (?, ?, ?)',
      [String(query || '').slice(0, 500), String(source || 'fallback').slice(0, 80), Number(matchedCount || 0)],
    );
  } catch {
    // optional analytics table
  }
}

export async function queryAskKhudii({ message, config = {} }) {
  const rawQuery = String(message || '').trim();
  const lower = rawQuery.toLowerCase();
  const tokens = tokenize(rawQuery);
  const kb = await getFullSiteKnowledge();

  // 1. Greeting check
  if (/^(hi|hello|hey|salam|assalam|aoa|good morning|good evening|good afternoon)[\s!.,?]*$/i.test(lower)) {
    const answer =
      config.welcomeMessage ||
      `Assalam-o-Alaikum! Welcome to **Khudii** — Pakistan's digital welfare network connecting **${kb.stats.organizations}+ verified organizations**, **${kb.stats.blogs} blogs**, **${kb.stats.podcasts} podcast episodes**, and **${kb.stats.stories} success stories**.\n\nAsk me anything about our NGOs, how to donate or volunteer, bank details, podcasts, blogs, jobs, certifications, or how to contact us!`;
    await logChatQuery(rawQuery, 'greeting', 1);
    return {
      success: true,
      answer,
      source: 'greeting',
      cards: [
        { title: 'Explore Verified Organizations', subtitle: `${kb.stats.organizations} Listed NGOs`, url: '/organizations', image: '/Khudii.webp', badge: 'Directory' },
        { title: 'Donate & Support Causes', subtitle: 'Official Bank & Zakat Info', url: '/donate-now', image: '/Khudii.webp', badge: 'Donate' },
      ],
      suggestedChips: config.quickChips?.length ? config.quickChips : ['Explore Verified Organizations', 'How can I donate?', 'Latest Podcasts', 'How to volunteer?', 'Read Khudii Blogs'],
    };
  }

  // 2. Donate / Bank Account intent (LIVE DB bankdata!)
  if (/\b(donate|donation|bank|iban|account|zakat|sadqah|sadaqah|transfer|fund|pay|tax)\b/i.test(lower)) {
    const bankLines = kb.banks.slice(0, 3).map((b) => {
      const bankName = b.bank_name || b.bankName || b.name || 'Official Bank';
      const title = b.account_title || b.accountTitle || b.title || 'Khudii';
      const acct = b.account_number || b.accountNumber || '';
      const iban = b.iban || b.IBAN || '';
      return `• **${bankName}** — Account Title: **${title}**${acct ? ` | Account #: \`${acct}\`` : ''}${iban ? ` | IBAN: \`${iban}\`` : ''}`;
    });
    const cards = [
      {
        title: 'Donate Now',
        subtitle: 'Direct Welfare Contributions',
        description: 'Support verified welfare causes across Pakistan transparently through Khudii.',
        url: '/donate-now',
        image: safeImg(kb.banks[0]?.logo || kb.banks[0]?.bank_logo) || '/Khudii.webp',
        badge: 'Donate',
      },
      {
        title: 'Browse Verified NGOs',
        subtitle: `${kb.stats.organizations} Verified Charities`,
        description: 'Choose specific causes in Healthcare, Education, Orphan Care, or Relief.',
        url: '/organizations',
        image: '/Khudii.webp',
        badge: 'Organizations',
      },
    ];
    const answer =
      `You can contribute directly to verified welfare causes via our [Donate Now](/donate-now) page!\n\n` +
      (bankLines.length
        ? `**Official Bank Details:**\n${bankLines.join('\n')}\n\n`
        : `Visit [Donate Now](/donate-now) to submit your pledge or view official bank transfer details.\n\n`) +
      `You can also browse specific causes in our [Verified Organizations Directory](/organizations).`;
    await logChatQuery(rawQuery, 'live_bank_donate', Math.max(1, bankLines.length));
    return {
      success: true,
      answer,
      source: 'live_bank_donate',
      cards,
      suggestedChips: ['Are organizations verified?', 'How to volunteer?', 'Contact Khudii', 'Read Success Stories'],
    };
  }

  // 3. Specific Entity Match across Organizations, Blogs, Podcasts, Stories, Sectors, FAQs
  const orgMatches = kb.organizations
    .map((o) => ({ item: o, score: scoreText(o.fullText, tokens, lower) + (lower.includes(o.name.toLowerCase()) ? 120 : 0) }))
    .filter((x) => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const blogMatches = kb.blogs
    .map((b) => ({ item: b, score: scoreText(b.fullText, tokens, lower) + (lower.includes(b.title.toLowerCase()) ? 120 : 0) }))
    .filter((x) => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const podcastMatches = kb.podcasts
    .map((p) => ({ item: p, score: scoreText(p.fullText, tokens, lower) + (lower.includes(p.title.toLowerCase()) ? 120 : 0) }))
    .filter((x) => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const storyMatches = kb.stories
    .map((s) => ({ item: s, score: scoreText(s.fullText, tokens, lower) }))
    .filter((x) => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Explicit intent boosts:
  const wantsOrg = /\b(ngo|ngos|organization|organizations|charity|charities|welfare|foundation|trust|hospital|sector|category|categories)\b/i.test(lower);
  const wantsBlog = /\b(blog|blogs|article|articles|post|posts|read)\b/i.test(lower);
  const wantsPodcast = /\b(podcast|podcasts|episode|episodes|interview|guest|youtube)\b/i.test(lower);
  const wantsVideo = /\b(video|videos|watch|documentary|clip)\b/i.test(lower);
  const wantsStory = /\b(success stor|stories|impact stor|beneficiar|contribute.*story)\b/i.test(lower);
  const wantsAbout = /\b(about|who we are|vision|mission|ceo|founder|team|dream|purpose|people behind|golden people|tribute)\b/i.test(lower);
  const wantsVolunteer = /\b(volunteer|volunteering)\b/i.test(lower);
  const wantsJobs = /\b(job|jobs|career|careers|hiring|vacancy|employment|cv|resume)\b/i.test(lower);
  const wantsRegisterOrg = /\b(register.*org|register.*ngo|list.*org|submit.*org|organization registration)\b/i.test(lower);
  const wantsCerts = /\b(certif|accredit|award|legal|verified|verification)\b/i.test(lower);
  const wantsTestimonials = /\b(testimonial|review|feedback|endorsement)\b/i.test(lower);
  const wantsEvents = /\b(event|events|news|drive|seminar|conference)\b/i.test(lower);
  const wantsContact = /\b(contact|phone|telephone|call|email|address|office|location|whatsapp|social media|facebook|instagram|tiktok|linkedin)\b/i.test(lower);
  const wantsSitemap = /\b(all pages|sitemap|sections|menu|navigate|what.*offer|everything)\b/i.test(lower);

  // Direct high-confidence entity hit (e.g. user asked for a specific NGO or Blog by name!)
  if (orgMatches[0]?.score >= 70 && !wantsBlog && !wantsPodcast) {
    const items = orgMatches.map((m) => m.item);
    const lines = items.map(
      (o) =>
        `• **[${o.name}](${o.url})** (${o.category}): ${o.description}` +
        `${o.phone ? ` · Phone: ${o.phone}` : ''}${o.location ? ` · Location: ${o.location}` : ''}`,
    );
    await logChatQuery(rawQuery, 'database_organizations_exact', items.length);
    return {
      success: true,
      answer: `Here are the matching verified organizations on **Khudii**:\n\n${lines.join('\n\n')}\n\nBrowse all **${kb.stats.organizations} organizations** in our [Organizations Directory](/organizations).`,
      source: 'database_organizations',
      cards: items.map((o) => ({
        title: o.name,
        subtitle: o.category,
        description: o.description,
        url: o.url,
        image: o.image,
        badge: 'Verified NGO',
      })),
      suggestedChips: ['How can I donate?', 'Register an Organization', 'Explore Welfare Sectors', 'Contact Support'],
    };
  }

  if (wantsRegisterOrg) {
    await logChatQuery(rawQuery, 'page_org_registration', 1);
    return {
      success: true,
      answer:
        `To list your welfare organization or NGO on **Khudii**, submit your details on our [Organization Registration](/organization/registration) page.\n\n` +
        `Our administrative team reviews your registration documents, mission, services, and contact details before publishing your verified profile in our public [Organizations Directory](/organizations).`,
      source: 'page_org_registration',
      cards: [
        { title: 'Register Your Organization', subtitle: 'NGO Verification & Listing', description: 'Submit organization profile & supporting documents.', url: '/organization/registration', image: '/Khudii.webp', badge: 'Registration' },
        { title: 'View Verified Organizations', subtitle: `${kb.stats.organizations} Active Partners`, url: '/organizations', image: '/Khudii.webp', badge: 'Directory' },
      ],
      suggestedChips: ['Are organizations verified?', 'View Certifications', 'Contact Khudii'],
    };
  }

  if (wantsVolunteer) {
    await logChatQuery(rawQuery, 'page_volunteer', 1);
    return {
      success: true,
      answer:
        `We'd love to have you volunteer with **Khudii**! Visit our [Volunteer Registration](/volunteer) page to sign up.\n\n` +
        `Simply share your name, city, contact details, skills, and areas of interest (such as Healthcare, Education, Community Relief, or Events), and our team will connect you with verified welfare initiatives across Pakistan.`,
      source: 'page_volunteer',
      cards: [
        { title: 'Volunteer with Khudii', subtitle: 'Sign Up Today', description: 'Share your skills and help communities across Pakistan.', url: '/volunteer', image: '/Khudii.webp', badge: 'Volunteer' },
        { title: 'Explore Organizations', subtitle: `${kb.stats.organizations} Verified NGOs`, url: '/organizations', image: '/Khudii.webp', badge: 'Directory' },
      ],
      suggestedChips: ['Explore Jobs & Careers', 'Contribute Your Story', 'How can I donate?', 'Contact Khudii'],
    };
  }

  if (wantsJobs) {
    await logChatQuery(rawQuery, 'page_jobs', 1);
    return {
      success: true,
      answer:
        `Interested in building a career with social impact? Visit our [Jobs & Careers](/jobs) page to submit your job application and CV directly to the Khudii recruitment team.\n\n` +
        `You can also get involved immediately through our [Volunteer Program](/volunteer).`,
      source: 'page_jobs',
      cards: [
        { title: 'Jobs & Careers', subtitle: 'Apply Online', description: 'Submit your career application and resume to Khudii.', url: '/jobs', image: '/Khudii.webp', badge: 'Careers' },
        { title: 'Volunteer Program', subtitle: 'Community Service', url: '/volunteer', image: '/Khudii.webp', badge: 'Volunteer' },
      ],
      suggestedChips: ['How to volunteer?', 'About Khudii & Team', 'Contact Khudii'],
    };
  }

  if (wantsPodcast || podcastMatches[0]?.score >= 60) {
    const items = (podcastMatches.length ? podcastMatches.map((m) => m.item) : kb.podcasts).slice(0, 3);
    const lines = items.map((p) => `• **[${p.title}](${p.url})**${p.guest ? ` (Guest: ${p.guest})` : ''}: ${p.description}`);
    await logChatQuery(rawQuery, 'database_podcasts', items.length);
    return {
      success: true,
      answer:
        (items.length
          ? `Here are featured episodes from the **Khudii Podcast** (${kb.stats.podcasts} published episodes):\n\n${lines.join('\n\n')}\n\n`
          : `Explore inspiring conversations with Pakistan's welfare leaders on the **Khudii Podcast**!\n\n`) +
        `Watch all episodes on our [Khudii Podcast Page](/podcast). Want to suggest a guest? Reach out via [Contact Us](/contact).`,
      source: 'database_podcasts',
      cards: items.map((p) => ({
        title: p.title,
        subtitle: p.guest ? `Guest: ${p.guest}` : 'Khudii Podcast',
        description: p.description,
        url: p.url,
        image: p.image,
        badge: 'Podcast',
      })),
      suggestedChips: ['Watch Khudii Videos', 'Read Latest Blogs', 'Read Success Stories', 'Contact Khudii'],
    };
  }

  if (wantsBlog || blogMatches[0]?.score >= 60) {
    const items = (blogMatches.length ? blogMatches.map((m) => m.item) : kb.blogs).slice(0, 3);
    const lines = items.map((b) => `• **[${b.title}](${b.url})**: ${b.excerpt}`);
    await logChatQuery(rawQuery, 'database_blogs', items.length);
    return {
      success: true,
      answer:
        (items.length
          ? `Here are relevant articles from **Khudii Blogs** (${kb.stats.blogs} published articles):\n\n${lines.join('\n\n')}\n\n`
          : `Discover inspiring welfare articles on **Khudii Blogs**!\n\n`) +
        `Browse every article on our [Blogs Page](/blogs).`,
      source: 'database_blogs',
      cards: items.map((b) => ({
        title: b.title,
        subtitle: 'Khudii Blog',
        description: b.excerpt,
        url: b.url,
        image: b.image,
        badge: 'Article',
      })),
      suggestedChips: ['Watch Latest Podcasts', 'Read Success Stories', 'Contribute Your Story', 'Explore Organizations'],
    };
  }

  if (wantsOrg) {
    const items = (orgMatches.length ? orgMatches.map((m) => m.item) : kb.organizations).slice(0, 4);
    const sectorLinks = kb.sectors.slice(0, 6).map((s) => `[${s.title}](${s.url})`).join(' · ');
    const lines = items.map((o) => `• **[${o.name}](${o.url})** (${o.category}): ${o.description}`);
    await logChatQuery(rawQuery, 'database_organizations', items.length);
    return {
      success: true,
      answer:
        `Khudii currently lists **${kb.stats.organizations} verified welfare organizations** across **${kb.stats.sectors} sectors**:\n\n` +
        `${lines.join('\n\n')}\n\n` +
        (sectorLinks ? `**Popular Sectors:** ${sectorLinks}\n\n` : '') +
        `Explore the complete [Organizations Directory](/organizations) or [Register Your Organization](/organization/registration).`,
      source: 'database_organizations',
      cards: items.map((o) => ({
        title: o.name,
        subtitle: o.category,
        description: o.description,
        url: o.url,
        image: o.image,
        badge: 'Verified NGO',
      })),
      suggestedChips: ['How can I donate?', 'Register an Organization', 'Are organizations verified?', 'How to volunteer?'],
    };
  }

  if (wantsVideo) {
    const items = kb.videos.slice(0, 3);
    const lines = items.map((v) => `• **${v.title}**: ${v.description}`);
    await logChatQuery(rawQuery, 'database_videos', items.length);
    return {
      success: true,
      answer:
        (items.length
          ? `Here are featured videos from **Khudii's Video Gallery** (${kb.stats.videos} videos):\n\n${lines.join('\n\n')}\n\n`
          : `Watch Khudii's community documentaries and welfare highlights on our [Videos Page](/videos).\n\n`) +
        `Visit the full [Video Gallery](/videos) or [Khudii Podcast](/podcast).`,
      source: 'database_videos',
      cards: items.map((v) => ({
        title: v.title,
        subtitle: 'Khudii Video Gallery',
        description: v.description,
        url: '/videos',
        image: v.image,
        badge: 'Video',
      })),
      suggestedChips: ['Latest Podcasts', 'Read Success Stories', 'Explore Organizations'],
    };
  }

  if (wantsStory) {
    if (lower.includes('contribute') || lower.includes('submit') || lower.includes('share my')) {
      await logChatQuery(rawQuery, 'page_contribute_story', 1);
      return {
        success: true,
        answer:
          `You can share your own inspiring welfare experience or community hero story on our [Contribute Your Story](/contribute-your-story) page! Our editorial team reviews submissions and features impactful community stories across Khudii.`,
        source: 'page_contribute_story',
        cards: [
          { title: 'Contribute Your Story', subtitle: 'Share With Khudii', description: 'Submit an inspiring story to be featured on Khudii.', url: '/contribute-your-story', image: '/Khudii.webp', badge: 'Community' },
          { title: 'Read Success Stories', subtitle: `${kb.stats.stories} Published Stories`, url: '/success-stories', image: '/Khudii.webp', badge: 'Impact' },
        ],
        suggestedChips: ['Read Success Stories', 'Read Khudii Blogs', 'How to volunteer?'],
      };
    }
    const items = (storyMatches.length ? storyMatches.map((m) => m.item) : kb.stories).slice(0, 3);
    const lines = items.map((s) => `• **[${s.title}](${s.url})**: ${s.description}`);
    await logChatQuery(rawQuery, 'database_stories', items.length);
    return {
      success: true,
      answer:
        `Discover real-life impact through **Khudii Success Stories** (${kb.stats.stories} stories):\n\n` +
        `${lines.join('\n\n')}\n\n` +
        `Read more on [Success Stories](/success-stories) or [Contribute Your Own Story](/contribute-your-story).`,
      source: 'database_stories',
      cards: items.map((s) => ({
        title: s.title,
        subtitle: 'Success Story',
        description: s.description,
        url: s.url,
        image: s.image,
        badge: 'Impact Story',
      })),
      suggestedChips: ['Contribute Your Story', 'How can I donate?', 'Read Khudii Blogs'],
    };
  }

  if (wantsAbout) {
    const parts = [];
    if (kb.about.whoWeAre?.text) parts.push(`**${kb.about.whoWeAre.title}:** ${kb.about.whoWeAre.text}`);
    if (kb.about.dream?.text) parts.push(`**${kb.about.dream.title}:** ${kb.about.dream.text}`);
    if (kb.about.visionMission.length) {
      parts.push(
        `**Vision & Mission:**\n` +
          kb.about.visionMission.slice(0, 3).map((v) => `• **${v.title}**: ${v.text}`).join('\n'),
      );
    }
    if (kb.about.ceo?.text) parts.push(`**Leadership (${kb.about.ceo.name}):** ${kb.about.ceo.text}`);
    if (kb.about.team.length) {
      parts.push(`**Team Highlights:** ${kb.about.team.slice(0, 5).map((m) => `${m.name}${m.role ? ` (${m.role})` : ''}`).join(', ')}`);
    }
    const cards = [
      { title: 'About Khudii', subtitle: 'Vision, Mission & Team', url: '/about-khudii', image: kb.about.whoWeAre?.image || kb.about.ceo?.image || '/Khudii.webp', badge: 'About' },
      { title: 'Golden People', subtitle: 'Philanthropists & Changemakers', url: '/golden-people', image: '/Khudii.webp', badge: 'Community' },
      { title: 'Tribute', subtitle: 'Honoring Welfare Pioneers', url: '/tribute', image: '/Khudii.webp', badge: 'Tribute' },
    ];
    await logChatQuery(rawQuery, 'database_about', parts.length || 1);
    return {
      success: true,
      answer:
        (parts.length
          ? parts.join('\n\n')
          : `**Khudii** is Pakistan's digital welfare platform connecting verified NGOs, donors, and volunteers to multiply social impact.`) +
        `\n\nExplore [About Khudii](/about-khudii), [Golden People](/golden-people), and [Tribute](/tribute).`,
      source: 'database_about',
      cards,
      suggestedChips: ['Explore Verified Organizations', 'View Certifications', 'Read Testimonials', 'How can I donate?'],
    };
  }

  if (wantsCerts) {
    const items = kb.certifications.slice(0, 4);
    const lines = items.map((c) => `• **${c.title}**${c.description ? `: ${c.description}` : ''}`);
    await logChatQuery(rawQuery, 'database_certifications', items.length);
    return {
      success: true,
      answer:
        `Every organization listed on **Khudii** undergoes administrative verification and documentation review.\n\n` +
        (lines.length ? `**Khudii Certifications & Accreditations (${kb.stats.certifications}):**\n${lines.join('\n')}\n\n` : '') +
        `View our official documents on the [Certifications Page](/certifications).`,
      source: 'database_certifications',
      cards: items.length
        ? items.slice(0, 3).map((c) => ({ title: c.title, subtitle: 'Official Certification', description: c.description, url: '/certifications', image: c.image, badge: 'Verified' }))
        : [{ title: 'Certifications & Verifications', subtitle: 'Trust & Transparency', url: '/certifications', image: '/Khudii.webp', badge: 'Verified' }],
      suggestedChips: ['Explore Verified Organizations', 'Read Testimonials', 'How can I donate?'],
    };
  }

  if (wantsTestimonials) {
    const items = kb.testimonials.slice(0, 3);
    const lines = items.map((t) => `• **${t.name}**${t.designation ? ` (${t.designation})` : ''}: "${t.message}"`);
    await logChatQuery(rawQuery, 'database_testimonials', items.length);
    return {
      success: true,
      answer:
        (lines.length
          ? `Here is what community members and partners say about **Khudii**:\n\n${lines.join('\n\n')}\n\n`
          : `Read verified community feedback on our [Testimonials Page](/testimonials).\n\n`) +
        `Read all endorsements on [Testimonials](/testimonials).`,
      source: 'database_testimonials',
      cards: items.map((t) => ({ title: t.name, subtitle: t.designation || 'Community Testimonial', description: t.message, url: '/testimonials', image: t.image, badge: 'Testimonial' })),
      suggestedChips: ['View Certifications', 'About Khudii', 'How to volunteer?'],
    };
  }

  if (wantsEvents) {
    const items = kb.events.slice(0, 3);
    const lines = items.map((ev) => `• **${ev.title}**${ev.date ? ` (${ev.date})` : ''}: ${ev.description}`);
    await logChatQuery(rawQuery, 'database_events', items.length);
    return {
      success: true,
      answer:
        (lines.length
          ? `Recent **Khudii News & Community Events**:\n\n${lines.join('\n\n')}\n\n`
          : `Stay updated with Khudii's latest community drives and announcements on our [Home Page](/) and [Social Media](/social-media).\n\n`) +
        `Follow live updates on [Social Media](/social-media) or [Blogs](/blogs).`,
      source: 'database_events',
      cards: items.map((ev) => ({ title: ev.title, subtitle: ev.date || 'Khudii Event', description: ev.description, url: '/', image: ev.image, badge: 'Event' })),
      suggestedChips: ['Read Khudii Blogs', 'How to volunteer?', 'Contact Khudii'],
    };
  }

  if (wantsContact) {
    const socialList = Object.entries(kb.contact.socials)
      .filter(([, url]) => Boolean(url))
      .map(([name, url]) => `[${name.charAt(0).toUpperCase() + name.slice(1)}](${url})`)
      .join(' · ');
    await logChatQuery(rawQuery, 'database_contact', 1);
    return {
      success: true,
      answer:
        `You can reach the **Khudii Support Team** directly:\n\n` +
        `• **Email:** ${kb.contact.email}\n` +
        (kb.contact.phone ? `• **Phone:** ${kb.contact.phone}\n` : '') +
        (kb.contact.address ? `• **Address:** ${kb.contact.address}\n` : '') +
        `• **Contact Form:** [Contact Us](/contact)\n` +
        (socialList ? `• **Official Socials:** ${socialList}\n` : `• **Social Channels:** [Social Media Hub](/social-media)\n`),
      source: 'database_contact',
      cards: [
        { title: 'Contact Khudii', subtitle: kb.contact.email, description: kb.contact.address || 'Send us a message anytime.', url: '/contact', image: '/Khudii.webp', badge: 'Support' },
        { title: 'Social Media Hub', subtitle: 'Follow Official Channels', url: '/social-media', image: '/Khudii.webp', badge: 'Connect' },
      ],
      suggestedChips: ['How can I donate?', 'How to volunteer?', 'Register an Organization', 'Browse FAQs'],
    };
  }

  if (wantsSitemap) {
    const directory = kb.pages.slice(0, 12).map((p) => `• **[${p.title}](${p.url})** — ${clip(p.description, 100)}`).join('\n');
    await logChatQuery(rawQuery, 'full_site_directory', kb.pages.length);
    return {
      success: true,
      answer: `Here is a complete guide to **Khudii's** main pages and sections:\n\n${directory}\n\nLet me know which topic or organization you'd like to explore in detail!`,
      source: 'full_site_directory',
      cards: kb.pages.slice(0, 4).map((p) => ({ title: p.title, subtitle: p.category, description: clip(p.description, 110), url: p.url, image: p.image, badge: p.category })),
      suggestedChips: ['Explore Verified Organizations', 'How can I donate?', 'Latest Podcasts', 'Read Khudii Blogs'],
    };
  }

  // 4. Live FAQs Search (Ranked across all active FAQs)
  const faqMatches = kb.faqs
    .map((f) => ({ item: f, score: scoreText(`${f.question} ${f.answer}`, tokens, lower) + (lower.includes(f.question.toLowerCase()) ? 80 : 0) }))
    .filter((x) => x.score >= 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (faqMatches.length > 0 && faqMatches[0].score >= 40) {
    const lines = faqMatches.map((m) => `**${m.item.question}**\n${m.item.answer}`);
    await logChatQuery(rawQuery, 'database_faqs', faqMatches.length);
    return {
      success: true,
      answer: `${lines.join('\n\n')}\n\nExplore all **${kb.stats.faqs} FAQs** on our [FAQs Page](/faqs).`,
      source: 'database_faqs',
      cards: [{ title: 'Frequently Asked Questions', subtitle: `${kb.stats.faqs} Verified Answers`, url: '/faqs', image: '/Khudii.webp', badge: 'FAQ' }],
      suggestedChips: ['Explore Verified Organizations', 'How can I donate?', 'Contact Khudii'],
    };
  }

  // 5. Admin Custom Knowledge Base (`quickPrompts`) Matcher
  const quickPrompts = Array.isArray(config.quickPrompts) ? config.quickPrompts : [];
  let bestPrompt = null;
  let bestPromptScore = 0;
  for (const p of quickPrompts) {
    if (!p?.question || !p?.answer) continue;
    let sc = 0;
    const pq = p.question.toLowerCase();
    const pk = String(p.keywords || '').toLowerCase();
    if (pq === lower) sc += 150;
    else if (lower.length >= 6 && (pq.includes(lower) || lower.includes(pq))) sc += 90;
    for (const t of tokens) {
      if (pk.includes(t)) sc += 22;
      if (pq.includes(t)) sc += 18;
    }
    if (sc > bestPromptScore) {
      bestPromptScore = sc;
      bestPrompt = p;
    }
  }
  if (bestPrompt && bestPromptScore >= 36) {
    await logChatQuery(rawQuery, 'knowledge_base', 1);
    return {
      success: true,
      answer: bestPrompt.answer,
      source: 'knowledge_base',
      cards: bestPrompt.url ? [{ title: bestPrompt.question, subtitle: bestPrompt.category || 'Khudii', url: bestPrompt.url, image: bestPrompt.image || '/Khudii.webp', badge: bestPrompt.category || 'Guide' }] : [],
      suggestedChips: config.quickChips?.length ? config.quickChips : ['Explore Verified Organizations', 'How can I donate?', 'Contact Khudii'],
    };
  }

  // 6. Broad Cross-Site Search (Pages + Orgs + Blogs + Podcasts + Stories + FAQs)
  const broadHits = [
    ...kb.pages.map((p) => ({ title: p.title, subtitle: p.category, description: p.description, url: p.url, image: p.image, badge: p.category, score: scoreText(`${p.title} ${p.description} ${p.keywords}`, tokens, lower) })),
    ...orgMatches.map((m) => ({ title: m.item.name, subtitle: m.item.category, description: m.item.description, url: m.item.url, image: m.item.image, badge: 'Organization', score: m.score })),
    ...blogMatches.map((m) => ({ title: m.item.title, subtitle: 'Khudii Blog', description: m.item.excerpt, url: m.item.url, image: m.item.image, badge: 'Blog', score: m.score })),
    ...podcastMatches.map((m) => ({ title: m.item.title, subtitle: 'Khudii Podcast', description: m.item.description, url: m.item.url, image: m.item.image, badge: 'Podcast', score: m.score })),
    ...storyMatches.map((m) => ({ title: m.item.title, subtitle: 'Success Story', description: m.item.description, url: m.item.url, image: m.item.image, badge: 'Story', score: m.score })),
  ]
    .filter((h) => h.score >= 18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (broadHits.length > 0) {
    const lines = broadHits.map((h) => `• **[${h.title}](${h.url})** (${h.badge}): ${clip(h.description, 160)}`);
    await logChatQuery(rawQuery, 'broad_site_search', broadHits.length);
    return {
      success: true,
      answer: `Here is the closest information I found across **Khudii**:\n\n${lines.join('\n\n')}\n\nNeed something more specific? Try asking about an organization, blog topic, donation bank details, or visit [Contact Us](/contact).`,
      source: 'broad_site_search',
      cards: broadHits,
      suggestedChips: ['Explore Verified Organizations', 'How can I donate?', 'Browse FAQs', 'Contact Khudii'],
    };
  }

  // 7. Helpful Fallback with Directory Cards
  await logChatQuery(rawQuery, 'fallback', 0);
  return {
    success: true,
    answer:
      config.fallbackMessage ||
      `I couldn't find an exact match for that yet, but I can help you explore **${kb.stats.organizations} verified organizations**, **${kb.stats.blogs} blogs**, **${kb.stats.podcasts} podcasts**, donations, volunteering, jobs, or direct support at **${kb.contact.email}** via [Contact Us](/contact).`,
    source: 'fallback',
    cards: [
      { title: 'Verified Organizations', subtitle: `${kb.stats.organizations} Listed NGOs`, url: '/organizations', image: '/Khudii.webp', badge: 'Directory' },
      { title: 'Contact Support', subtitle: kb.contact.email, url: '/contact', image: '/Khudii.webp', badge: 'Support' },
    ],
    suggestedChips: ['All Khudii Pages', 'Explore Verified Organizations', 'How can I donate?', 'How to volunteer?', 'Contact Khudii'],
  };
}

export async function buildDeepKnowledgePrompts() {
  const kb = await getFullSiteKnowledge(true);
  const prompts = [];
  let seq = 1;
  const add = (question, answer, category, keywords, url = '/', image = '/Khudii.webp') => {
    prompts.push({
      id: String(seq++),
      question: question.slice(0, 300),
      answer: answer.slice(0, 2000),
      category: category.slice(0, 50),
      keywords: keywords.slice(0, 500),
      url,
      image,
    });
  };

  add(
    'What is Khudii and what is its mission?',
    `${kb.about.whoWeAre?.text || "Khudii is Pakistan's digital welfare network uniting verified NGOs, donors, and volunteers."} ${kb.about.dream?.text || ''}\n\nExplore [About Khudii](/about-khudii) to learn more about our vision, mission, and social impact.`,
    'About',
    'what, khudii, about, mission, vision, purpose, platform, welfare',
    '/about-khudii',
    kb.about.whoWeAre?.image || '/Khudii.webp',
  );

  add(
    'Who is the CEO and team behind Khudii?',
    `${kb.about.ceo?.text ? `**${kb.about.ceo.name}:** ${kb.about.ceo.text}\n\n` : ''}${kb.about.team.length ? `**Core Team:** ${kb.about.team.slice(0, 8).map((t) => `${t.name}${t.role ? ` (${t.role})` : ''}`).join(', ')}.\n\n` : ''}Meet the people driving Khudii on [About Khudii](/about-khudii) and [Golden People](/golden-people).`,
    'About',
    'ceo, founder, team, leadership, people behind, management, staff',
    '/about-khudii',
    kb.about.ceo?.image || '/Khudii.webp',
  );

  const topOrgs = kb.organizations.slice(0, 8).map((o) => `• **[${o.name}](${o.url})** (${o.category})`).join('\n');
  add(
    'Which verified welfare organizations and NGOs are listed on Khudii?',
    `Khudii features **${kb.stats.organizations} verified welfare organizations** across **${kb.stats.sectors} sectors**.\n\n**Featured Partners:**\n${topOrgs || 'Visit our directory to browse all verified organizations.'}\n\nExplore the full [Organizations Directory](/organizations).`,
    'Organizations',
    'organizations, ngos, charities, directory, verified, foundations, trusts, list',
    '/organizations',
    kb.organizations[0]?.image || '/Khudii.webp',
  );

  if (kb.sectors.length) {
    const sectorText = kb.sectors.slice(0, 12).map((s) => `• **[${s.title}](${s.url})**`).join('\n');
    add(
      'What welfare sectors and categories does Khudii cover?',
      `Khudii organizes verified NGOs across **${kb.stats.sectors} key welfare sectors**:\n\n${sectorText}\n\nBrowse organizations by cause on [Organizations](/organizations).`,
      'Organizations',
      'sectors, categories, causes, healthcare, education, orphan, relief, special needs',
      '/organizations',
      kb.sectors[0]?.image || '/Khudii.webp',
    );
  }

  const bankSummary = kb.banks
    .slice(0, 3)
    .map((b) => `• **${b.bank_name || b.bankName || 'Bank'}** — ${b.account_title || b.accountTitle || 'Khudii'}${b.iban ? ` (IBAN: ${b.iban})` : ''}`)
    .join('\n');
  add(
    'How can I donate and what are the official bank details?',
    `You can donate directly via [Donate Now](/donate-now) to support verified causes, Zakat, and Sadqah.\n\n${bankSummary ? `**Official Bank Accounts:**\n${bankSummary}\n\n` : ''}Visit [Donate Now](/donate-now) for complete donation instructions.`,
    'Donations',
    'donate, donation, bank, iban, account, zakat, sadqah, charity, transfer, fund',
    '/donate-now',
    safeImg(kb.banks[0]?.logo) || '/Khudii.webp',
  );

  const topBlogs = kb.blogs.slice(0, 6).map((b) => `• **[${b.title}](${b.url})**`).join('\n');
  add(
    'What are the latest blogs and articles on Khudii?',
    `Khudii has **${kb.stats.blogs} published blogs and articles** covering social impact and community awareness:\n\n${topBlogs || 'Browse all articles on our Blogs page.'}\n\nRead all posts at [Khudii Blogs](/blogs).`,
    'Blogs',
    'blog, blogs, articles, posts, read, stories, latest, news',
    '/blogs',
    kb.blogs[0]?.image || '/Khudii.webp',
  );

  const topPods = kb.podcasts.slice(0, 5).map((p) => `• **[${p.title}](${p.url})**${p.guest ? ` — Guest: ${p.guest}` : ''}`).join('\n');
  add(
    'What episodes are available on the Khudii Podcast?',
    `Watch **${kb.stats.podcasts} published episodes** of the Khudii Podcast featuring changemakers and social leaders:\n\n${topPods || 'Watch episodes on our Podcast page.'}\n\nExplore all episodes at [Khudii Podcast](/podcast).`,
    'Podcasts',
    'podcast, podcasts, episode, episodes, interview, youtube, guest, watch',
    '/podcast',
    kb.podcasts[0]?.image || '/Khudii.webp',
  );

  add(
    'Where can I watch Khudii videos and documentaries?',
    `Khudii hosts **${kb.stats.videos} videos** showcasing community drives, partner highlights, and impact documentaries. Watch them on our [Video Gallery](/videos) or [Khudii Podcast](/podcast).`,
    'Videos',
    'video, videos, gallery, watch, documentary, youtube, media',
    '/videos',
    kb.videos[0]?.image || '/Khudii.webp',
  );

  const topStories = kb.stories.slice(0, 5).map((s) => `• **[${s.title}](${s.url})**`).join('\n');
  add(
    'Where can I read real Khudii success stories?',
    `Read **${kb.stats.stories} real-life community success stories** on Khudii:\n\n${topStories || 'Explore stories on our Success Stories page.'}\n\nVisit [Success Stories](/success-stories) or [Contribute Your Story](/contribute-your-story).`,
    'Stories',
    'success, stories, story, impact, beneficiary, real life, inspiring',
    '/success-stories',
    kb.stories[0]?.image || '/Khudii.webp',
  );

  add(
    'How can I contribute my own story to Khudii?',
    `Have an inspiring humanitarian story or community hero to highlight? Submit it directly on our [Contribute Your Story](/contribute-your-story) page for review and publication on Khudii.`,
    'Stories',
    'contribute, submit, share, story, write, feature, spotlight',
    '/contribute-your-story',
  );

  add(
    'How can I volunteer with Khudii?',
    `Register as a Khudii volunteer on our [Volunteer Page](/volunteer). Share your skills, city, and preferred welfare sectors to connect with impactful drives across Pakistan.`,
    'Volunteers',
    'volunteer, volunteering, join, help, participate, register, signup',
    '/volunteer',
  );

  add(
    'Are there job or career opportunities at Khudii?',
    `Yes! Apply for open roles and submit your CV through our [Jobs & Careers](/jobs) page to join Khudii's social impact mission.`,
    'Careers',
    'job, jobs, career, careers, hiring, vacancy, apply, cv, resume, employment',
    '/jobs',
  );

  add(
    'How can I register my NGO or welfare organization on Khudii?',
    `Submit your NGO profile, registration documents, and services on our [Organization Registration](/organization/registration) page. Verified organizations are listed in our public [Organizations Directory](/organizations).`,
    'Organizations',
    'register, registration, ngo, organization, list, submit, verify, partner',
    '/organization/registration',
  );

  add(
    'Are Khudii and its listed organizations certified and verified?',
    `Yes — every listed NGO undergoes thorough administrative and document verification. View Khudii's **${kb.stats.certifications} official certifications and accreditations** on our [Certifications Page](/certifications).`,
    'Trust',
    'verified, verification, certifications, certificate, legal, authentic, trust, accredited',
    '/certifications',
    kb.certifications[0]?.image || '/Khudii.webp',
  );

  add(
    'What do donors and partners say about Khudii?',
    `Read **${kb.stats.testimonials} verified community endorsements** on our [Testimonials Page](/testimonials).`,
    'Trust',
    'testimonials, reviews, feedback, endorsements, quotes, partners',
    '/testimonials',
    kb.testimonials[0]?.image || '/Khudii.webp',
  );

  add(
    'What are Golden People and Tribute on Khudii?',
    `[Golden People](/golden-people) celebrates living philanthropists and everyday humanitarians, while [Tribute](/tribute) honors the legacy of Pakistan's welfare pioneers.`,
    'Community',
    'golden people, tribute, heroes, philanthropists, pioneers, legacy, honor',
    '/golden-people',
  );

  add(
    'How can I contact Khudii support and follow on social media?',
    `Reach us anytime via [Contact Us](/contact) or email **${kb.contact.email}**${kb.contact.phone ? ` · Phone: **${kb.contact.phone}**` : ''}${kb.contact.address ? ` · Address: ${kb.contact.address}` : ''}. Follow all official channels on our [Social Media Hub](/social-media).`,
    'Support',
    'contact, phone, email, address, support, help, whatsapp, social media, facebook, instagram',
    '/contact',
  );

  // Add top live FAQs directly into knowledge base
  for (const faq of kb.faqs.slice(0, 12)) {
    if (!faq.question || !faq.answer) continue;
    add(
      faq.question,
      `${faq.answer}\n\nSee more answers on our [FAQs Page](/faqs).`,
      'FAQs',
      tokenize(faq.question).slice(0, 8).join(', ') || 'faq, help',
      '/faqs',
    );
  }

  return {
    prompts,
    quickChips: [
      'Explore Verified Organizations',
      'How can I donate?',
      'Latest Podcasts',
      'Read Khudii Blogs',
      'How to volunteer?',
      'Register an Organization',
      'Jobs & Careers',
      'Contact Support',
    ],
    stats: kb.stats,
  };
}
