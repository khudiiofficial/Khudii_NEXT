export const MAX_TITLE_LENGTH = 60;
export const MIN_TITLE_LENGTH = 30;
export const MAX_DESCRIPTION_LENGTH = 160;

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com'
).replace(/\/+$/, '');

export function plainText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clampText(value, maxLength) {
  const text = plainText(value);
  if (text.length <= maxLength) return text;
  const limit = Math.max(1, maxLength - 1);
  const boundary = text.slice(0, limit).lastIndexOf(' ');
  const cut = boundary > Math.floor(limit * 0.6) ? boundary : limit;
  return `${text.slice(0, cut).trim()}…`;
}

export function formatSeoTitle(rawTitle) {
  const clean = plainText(rawTitle);
  if (!clean) return "Khudii - Pakistan's Digital Welfare Platform";
  if (clean.toLowerCase().includes('khudii')) {
    return clampText(clean, MAX_TITLE_LENGTH);
  }
  let candidate = `${clean} | Khudii`;
  if (candidate.length < MIN_TITLE_LENGTH) {
    candidate = `${clean} | Khudii Pakistan Welfare`;
  }
  return clampText(candidate, MAX_TITLE_LENGTH);
}

export function formatSeoDescription(rawDesc, fallback = '') {
  let text = plainText(rawDesc || fallback);
  if (!text) {
    text = "Pakistan's digital welfare platform connecting donors, volunteers, and verified humanitarian organizations to create lasting community impact across Pakistan.";
  } else if (text.length < 50) {
    text = `${text}. Discover verified charities, volunteer initiatives, and welfare projects across Pakistan on Khudii.`;
  }
  return clampText(text, 155);
}

export function getCanonicalUrl(slug = '', override = null, siteOrigin = SITE_ORIGIN) {
  const base = (siteOrigin || SITE_ORIGIN).replace(/\/+$/, '');
  const normalized = (slug || '').replace(/^\/+|\/+$/g, '').trim();
  const defaultPath = normalized && normalized !== 'home' ? `/${normalized}` : '/';
  const fallback = `${base}${defaultPath}`;
  if (!override?.trim()) return fallback;
  try {
    const input = override.trim();
    if (input.startsWith('//') || input.includes('\\')) return fallback;
    const candidate = new URL(input, base);
    if (candidate.protocol !== 'https:' || candidate.origin !== base || candidate.search || candidate.hash) return fallback;
    return `${candidate.origin}${candidate.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return fallback;
  }
}

/**
 * Strips dangerous head-only tags (link, meta, style, script, base) from CMS HTML
 * preventing canonical and meta tags from leaking into the document body.
 * Also normalizes target="_blank" links with rel="noopener noreferrer".
 */
export function sanitizeCmsHtml(value) {
  if (typeof value !== 'string' || !value) return '';
  return value
    .replace(/<\s*(link|meta|style|script|base)\b[^>]*>(?:[\s\S]*?<\/\s*\1\s*>)?/gi, '')
    .replace(/<a\b[^>]*\btarget\s*=\s*(['"])_blank\1[^>]*>/gi, (tag) => {
      if (/\brel\s*=/i.test(tag)) {
        return tag.replace(/\brel\s*=\s*(['"])[^'"]*\1/i, 'rel="noopener noreferrer"');
      }
      return tag.replace(/>$/, ' rel="noopener noreferrer">');
    })
    .replace(/\sstyle\s*=\s*("(?:[^"]|"")*"|'(?:[^']|'')*')/gi, '');
}

export function getPageJsonLd(slug, entity = {}, siteOrigin = SITE_ORIGIN) {
  const base = (siteOrigin || SITE_ORIGIN).replace(/\/+$/, '');
  const canonicalUrl = getCanonicalUrl(slug, entity?.canonical_url, base);
  const type = entity?.type || 'WebPage';

  const defaultWebsite = {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: `${base}/`,
    name: 'Khudii',
    description: "Pakistan's digital platform for welfare organizations",
    publisher: {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: 'Khudii',
      url: `${base}/`,
      logo: `${base}/siteicon.png`
    }
  };

  if (type === 'Organization' || type === 'NGO') {
    return {
      '@context': 'https://schema.org',
      '@type': 'NGO',
      '@id': `${canonicalUrl}#organization`,
      url: canonicalUrl,
      name: entity.name || entity.title || 'Welfare Organization',
      description: formatSeoDescription(entity.description, entity.name),
      image: entity.image || `${base}/siteicon.png`,
      address: entity.address ? {
        '@type': 'PostalAddress',
        streetAddress: entity.address,
        addressLocality: entity.city || 'Pakistan',
        addressCountry: 'PK'
      } : undefined,
      telephone: entity.phone || undefined,
      email: entity.email || undefined,
      sameAs: entity.website ? [entity.website] : undefined,
      isPartOf: defaultWebsite
    };
  }

  if (type === 'Article' || type === 'BlogPosting') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${canonicalUrl}#article`,
      url: canonicalUrl,
      headline: entity.title || 'Khudii Welfare Article',
      description: formatSeoDescription(entity.description, entity.title),
      image: entity.image ? [entity.image] : [`${base}/siteicon.png`],
      datePublished: entity.created_at || undefined,
      dateModified: entity.updated_at || entity.created_at || undefined,
      author: {
        '@type': 'Organization',
        name: 'Khudii'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Khudii',
        logo: {
          '@type': 'ImageObject',
          url: `${base}/siteicon.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      isPartOf: defaultWebsite
    };
  }

  if (type === 'VideoObject') {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${canonicalUrl}#video`,
      name: entity.title || 'Khudii Video',
      description: formatSeoDescription(entity.description, entity.title),
      thumbnailUrl: entity.thumbnailUrl || (entity.youtube_id ? `https://i.ytimg.com/vi/${entity.youtube_id}/hqdefault.jpg` : `${base}/siteicon.png`),
      uploadDate: entity.created_at || undefined,
      embedUrl: entity.youtube_id ? `https://www.youtube-nocookie.com/embed/${entity.youtube_id}` : undefined,
      isPartOf: defaultWebsite
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: entity.title || 'Khudii - Pakistan Digital Welfare',
    description: formatSeoDescription(entity.description, entity.title),
    isPartOf: defaultWebsite
  };
}

export const SEO_PAGE_CONTENT = {
  home: {
    h1: "Khudii - Pakistan's Digital Welfare Platform",
    h2: "Connecting Donors, Volunteers & Welfare Organizations Across Pakistan",
    paragraphs: [
      "Khudii is Pakistan's dedicated non-profit digital welfare ecosystem designed to unite donors, humanitarian organizations, and passionate volunteers under a single transparent umbrella. Across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, and Gilgit-Baltistan, thousands of humanitarian causes operate daily to provide healthcare, free education, clean water, hunger relief, disability assistance, and emergency response.",
      "Our mission is to bring complete transparency and digital visibility to welfare initiatives throughout the country. Donors can discover verified non-governmental organizations (NGOs), examine institutional credentials, review ongoing community projects, and contribute directly with confidence.",
      "Beyond monetary assistance, Khudii empowers local communities through active volunteer engagement, student internships, and skills-based philanthropy. We work closely with grassroots social workers, hospital foundations, educational trusts, and disability rehabilitation centers to highlight urgent community needs.",
      "Explore our nationwide directory of verified organizations, listen to insightful conversations on the Khudii Podcast, watch transformative success stories, and join us in building an inclusive, compassionate Pakistan where no one is left behind."
    ]
  },
  'about-khudii': {
    h1: "About Khudii - Our Vision, Mission & Values",
    h2: "Empowering Humanitarian Welfare and Social Impact Across Pakistan",
    paragraphs: [
      "Founded with the vision of digitalizing social welfare in Pakistan, Khudii serves as a bridge connecting those who wish to help with those who need it most. We believe that technology can break down geographical and informational barriers, enabling efficient charitable giving and volunteer mobilisation.",
      "Our core values are integrity, transparency, empathy, and collective community action. Every organization listed on Khudii undergoes strict administrative vetting to ensure authentic welfare operations, legitimate registration with relevant authorities such as the Punjab Charity Commission, and direct benefit delivery.",
      "Through digital storytelling, comprehensive organizational profiles, and multimedia podcasts, we amplify the voices of unsung heroes, social pioneers, and welfare activists dedicated to lifting vulnerable families out of poverty and crisis.",
      "Join us on our journey to elevate social impact. Whether you are an individual donor, corporate CSR partner, or volunteer looking to dedicate your time, Khudii provides the platform, resources, and connections to make your efforts count."
    ]
  },
  organizations: {
    h1: "Directory of Verified Welfare Organizations in Pakistan",
    h2: "Find Trusted Charities, Healthcare Trusts & Non-Profits",
    paragraphs: [
      "Discover authenticated welfare organizations operating across all four provinces and territories of Pakistan. From Karachi's bustling health foundations to educational initiatives in Swat, Gwadar, and Gilgit, Khudii maintains a comprehensive, categorised directory.",
      "Filter non-profit organizations by key sectors including Health, Education, Clean Water & Food, Orphanage & Child Welfare, Disability Support, Thalassemia Care, and Disaster Relief. Each profile includes verified phone contacts, physical addresses, executive leadership, registration numbers, and official bank details.",
      "By standardising organizational data and providing direct communication channels, Khudii makes charitable giving direct, safe, and impactful. Review institutional achievements and support the causes closest to your heart."
    ]
  },
  blogs: {
    h1: "Khudii Welfare Insights, Stories & Community News",
    h2: "In-Depth Articles on Social Welfare, Health Awareness & Philanthropy in Pakistan",
    paragraphs: [
      "Stay informed with the Khudii Blog, featuring research-backed articles, humanitarian field dispatches, and public awareness campaigns. Our articles explore critical socio-economic topics including cancer early detection, flood crisis management, inclusive disability education, and water conservation.",
      "Learn how community leaders and philanthropists collaborate to solve grassroots challenges in Pakistan. Our editorial team spotlights innovative social enterprises, charitable giving best practices, and policy developments shaping the non-profit sector.",
      "Bookmark our blog for regular updates on volunteer drives, community welfare guides, and educational resources aimed at fostering social responsibility and humanitarian leadership across Pakistan."
    ]
  },
  podcast: {
    h1: "Khudii Podcast - Voices of Pakistan's Welfare Leaders",
    h2: "Inspiring Interviews with Social Activists, Doctors & Philanthropists",
    paragraphs: [
      "The Khudii Podcast is Pakistan's premier audio-visual platform dedicated to candid conversations with legendary humanitarians, medical directors, institutional founders, and social reform advocates. Each episode dives deep into personal journeys of service, sacrifice, and overcoming systemic obstacles.",
      "Tune in to hear how pioneering hospitals, rural education trusts, and rehabilitation centers were built from the ground up. Our guests share valuable lessons on non-profit leadership, donor stewardship, crisis response, and spiritual resilience.",
      "Available across video and audio channels, the Khudii Podcast provides vital historical and practical context for anyone interested in social work, public welfare, and national development in Pakistan."
    ]
  },
  'success-stories': {
    h1: "Khudii Success Stories - Real Lives Changed Across Pakistan",
    h2: "Witness the Direct Impact of Generosity, Healing & Community Support",
    paragraphs: [
      "Read and watch verified real-world success stories made possible by donors, volunteers, and welfare organizations on the Khudii platform. From life-saving medical surgeries and free prosthetic limbs to clean drinking water handpumps installed in arid villages, every story reflects the power of human compassion.",
      "See how marginalized students gain access to quality schooling, how families displaced by natural calamities receive shelter, and how individuals with disabilities reclaim independence through specialized vocational training and custom wheelchairs.",
      "These uplifting journeys demonstrate that every donation, no matter the size, makes a measurable difference in Pakistan. Be inspired by the resilience of our people and celebrate the victories of our collective welfare network."
    ]
  },
  faqs: {
    h1: "Frequently Asked Questions - Khudii Welfare Network",
    h2: "Common Questions About Donating, Volunteering & Registering Organizations",
    paragraphs: [
      "Have questions about how Khudii operates? Find clear answers regarding our verification criteria, donation procedures, volunteer applications, and organizational listings.",
      "Khudii does not charge commissions on donations. All funds transferred through verified organization bank accounts go directly to the respective welfare bodies. We provide transparent information so donors can give with total peace of mind.",
      "If you represent a welfare organization or social initiative in Pakistan, learn how to submit your documentation for directory listing, promotional feature stories, and volunteer recruitment assistance."
    ]
  },
  contact: {
    h1: "Contact Khudii - Connect With Our Welfare Support Team",
    h2: "Get in Touch for Inquiries, Partnerships, or Community Assistance",
    paragraphs: [
      "We welcome inquiries from donors, welfare representatives, media partners, and prospective volunteers. Whether you need assistance verifying an organization, wish to propose an institutional partnership, or have feedback on our platform, our team is here to assist.",
      "Reach out via our official contact form, email address, or telephone helpline. We respond to all public inquiries within 24 to 48 business hours to ensure timely coordination and support.",
      "Our team is committed to facilitating meaningful connections across Pakistan's welfare ecosystem. Let us know how we can collaborate to create positive community outcomes."
    ]
  },
  'donate-now': {
    h1: "Donate Now - Support Verified Welfare Causes in Pakistan",
    h2: "Direct, Secure & Transparent Charitable Giving for Zakat & Sadqa",
    paragraphs: [
      "Your charitable contributions provide immediate relief to families facing extreme poverty, health crises, and lack of basic necessities across Pakistan. Whether fulfilling your Zakat obligations, offering Sadqa, or supporting general welfare drives, your support transforms lives.",
      "Khudii connects you directly with verified welfare bank accounts, ensuring that 100% of your contribution reaches legitimate causes without intermediaries or deduction fees.",
      "Explore critical campaign areas including emergency medical treatments, clean water filtration plants, child education sponsorships, and ration bag distributions for vulnerable households."
    ]
  },
  'contribute-your-story': {
    h1: "Contribute Your Story - Share Community Impact on Khudii",
    h2: "Amplify Your Humanitarian Work and Inspire Change Across Pakistan",
    paragraphs: [
      "Are you a social worker, volunteer, or organization representative with an inspiring story of human resilience and impact? Share your experience on Khudii to reach tens of thousands of potential donors and supporters.",
      "By documenting grassroots struggles and positive outcomes, you shine a light on challenges that need urgent attention and motivate others to take action in their own neighbourhoods.",
      "Submit your narrative, high-resolution photographs, or video links through our easy contribution form. Our editorial team reviews submissions promptly to ensure respectful, authentic storytelling."
    ]
  },
  testimonials: {
    h1: "Community Testimonials & Partner Endorsements | Khudii",
    h2: "Hear From Donors, Volunteers & Welfare Leaders Across Pakistan",
    paragraphs: [
      "Read genuine testimonials from philanthropists, grassroots social workers, hospital administrators, and volunteers who collaborate with Khudii to create measurable humanitarian impact across Pakistan.",
      "Our partners value Khudii's digital transparency, thorough organizational vetting, and zero-commission model that ensures maximum resources reach deserving beneficiaries.",
      "Explore community reflections and discover how Khudii's technology and public outreach are transforming the way Pakistanis give, volunteer, and advocate for vulnerable communities."
    ]
  },
  jobs: {
    h1: "Careers & Employment Opportunities at Khudii | Join Our Team",
    h2: "Work With Purpose in Pakistan's Premier Digital Welfare Organization",
    paragraphs: [
      "Explore rewarding career opportunities with Khudii. We are looking for mission-driven professionals in technology, community relations, content creation, investigative vetting, and non-profit administration.",
      "At Khudii, your daily work directly supports vulnerable children, hospital patients, persons with disabilities, and underserved families across Pakistan.",
      "Review current job openings, application criteria, and submission details. Join a team dedicated to transparency, technological innovation, and national social uplift."
    ]
  },
  volunteer: {
    h1: "Become a Volunteer with Khudii | Pakistan Welfare Movement",
    h2: "Dedicate Your Time, Skills & Compassion to Grassroots Communities",
    paragraphs: [
      "Volunteering with Khudii offers a powerful opportunity to serve humanity on the ground. Whether helping organize medical camps, distributing emergency rations, mentoring students, or assisting with disability welfare, your time creates lasting change.",
      "We match passionate volunteers with verified partner organizations in their local cities across Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, and beyond.",
      "Submit your volunteer registration today and become part of a nationwide network of active change-makers working for a brighter, more compassionate Pakistan."
    ]
  },
  'golden-people': {
    h1: "Golden People of Pakistan - Honoring Selfless Welfare Champions",
    h2: "Celebrating the Living Legends and Grassroots Social Heroes of Pakistan",
    paragraphs: [
      "Pakistan is blessed with extraordinary individuals who dedicate their lives to serving the destitute, the sick, and the marginalized without expecting personal gain or public accolades. Khudii's Golden People initiative honors these remarkable souls.",
      "From humble ambulance drivers and village teachers to tireless community organizers, we celebrate the human spirit that defines our nation's resilience.",
      "Read their inspiring biographical profiles, discover their lifetime contributions, and learn how their legacy inspires the next generation of social welfare pioneers."
    ]
  },
  tribute: {
    h1: "Tribute to Pakistan's Welfare Pioneers | In Loving Memory",
    h2: "Honoring the Giants of Philanthropy Who Laid the Foundations of Care",
    paragraphs: [
      "We pay solemn tribute to the visionary men and women whose compassion shaped Pakistan's welfare landscape, including Abdul Sattar Edhi, Dr. Ruth Pfau, and countless selfless humanitarians.",
      "Their enduring legacy continues to guide our mission at Khudii. We remember their sacrifice, their unwavering moral courage, and their lifelong commitment to protecting human dignity.",
      "May their memory continue to ignite the flame of kindness, generosity, and social justice across every corner of Pakistan."
    ]
  },
  videos: {
    h1: "Khudii Video Gallery - Documentaries, Reviews & Impact Films",
    h2: "Watch Engaging Multimedia Stories of Pakistani Humanitarian Work",
    paragraphs: [
      "Explore Khudii's curated collection of video documentaries, hospital walkthroughs, rural welfare missions, and beneficiary interviews from every province of Pakistan.",
      "Visual storytelling brings the realities of community challenges and the triumphs of welfare intervention to life. See how clean water projects, specialized orphanages, and free eye clinics operate.",
      "Subscribe to our YouTube channel and share these videos across your social networks to raise crucial awareness for verified Pakistani causes."
    ]
  },
  certifications: {
    h1: "Khudii Certifications, Non-Profit Registration & Governance",
    h2: "Verified Legal Compliance, Statutory Approvals & Official Documents",
    paragraphs: [
      "Transparency is the cornerstone of Khudii's mission. We maintain complete compliance with government regulatory frameworks, statutory registration standards, and tax exemption guidelines.",
      "Review official certification documents, registration credentials with the Punjab Charity Commission and federal welfare authorities, and independent compliance audits.",
      "We adhere to international non-profit best practices, ensuring all operations, data protections, and partner integrations maintain highest standards of fiduciary responsibility."
    ]
  },
  'social-media': {
    h1: "Khudii Social Media Channels | Follow & Connect Online",
    h2: "Join Our Growing Community on Facebook, Instagram, LinkedIn & YouTube",
    paragraphs: [
      "Connect with Khudii across our official digital platforms to receive daily welfare updates, emergency relief alerts, volunteer call-outs, and uplifting community stories.",
      "Engage with fellow philanthropists, ask questions, and share verified welfare appeals with your family, friends, and colleagues worldwide.",
      "Follow our verified handles on Facebook, Instagram, LinkedIn, YouTube, and X (Twitter) to help spread hope and humanitarian action across Pakistan."
    ]
  }
};
