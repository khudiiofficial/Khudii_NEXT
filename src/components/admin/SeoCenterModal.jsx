'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Eye,
  Save,
  Search,
  Image as ImageIcon,
  Zap,
  MessageSquare,
  FileCode,
  Sliders,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Plus,
  Loader2,
  Trash2,
  Tag,
} from 'lucide-react';

export function extractEntityImages(entityType = 'page', pageData = null) {
  if (!pageData) return [];
  const images = [];
  const seen = new Set();

  const add = (url, label = 'Image', defaultAlt = '', key = '') => {
    if (!url || typeof url !== 'string') return;
    const clean = url.trim();
    if (!clean || clean.endsWith('/khudiilogo.png') || seen.has(clean)) return;
    seen.add(clean);
    images.push({
      url: clean,
      label,
      alt: defaultAlt || `${label} for ${pageData.title || pageData.name || pageData.Name || 'Khudii'}`,
      key: key || label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    });
  };

  const raw = pageData.raw || pageData;
  const type = (entityType || pageData.entityType || 'page').toLowerCase();

  if (type === 'organization' || type === 'organizations') {
    add(raw.partner_image || raw.image, 'Partner Logo', raw.heroAlt || '', 'logo');
    add(raw.introductory_image_path, 'Introductory Presentation Image', '', 'intro');
    if (Array.isArray(raw.item_images)) {
      raw.item_images.forEach((img, idx) => {
        const u = typeof img === 'string' ? img : img?.image_path || img?.url;
        add(u, `Organization Gallery Image ${idx + 1}`, '', `gallery_${idx + 1}`);
      });
    }
  } else if (type === 'blog' || type === 'blogs') {
    add(raw.image_path || raw.featuredImage || raw.image, 'Blog Featured Image', raw.heroAlt || '', 'hero');
    const content = String(raw.intro || raw.content || '');
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let m;
    let imgIdx = 1;
    while ((m = imgRegex.exec(content)) !== null) {
      add(m[1], `Blog Body Image ${imgIdx++}`, '', `body_${imgIdx}`);
    }
  } else if (type === 'story' || type === 'stories') {
    if (raw.youtube_id) {
      add(`https://img.youtube.com/vi/${raw.youtube_id}/hqdefault.jpg`, 'Story Video Thumbnail', '', 'youtube');
    }
    add(raw.image || raw.image_path, 'Story Cover Image', '', 'cover');
  } else {
    // Page
    add(raw.bannerBgImage || raw.banner_settings?.bg_image || raw.banner_settings?.image, 'Page Banner Image', raw.heroAlt || '', 'hero');
    let secList = raw.sections;
    if (typeof secList === 'string') {
      try { secList = JSON.parse(secList); } catch {}
    }
    if (Array.isArray(secList)) {
      secList.forEach((sec, idx) => {
        if (sec.bgImage) add(sec.bgImage, `Section ${idx + 1} Background`, '', `sec_${idx + 1}_bg`);
        if (sec.image) add(sec.image, `Section ${idx + 1} Image`, '', `sec_${idx + 1}_img`);
        if (Array.isArray(sec.images)) {
          sec.images.forEach((img, iIdx) => {
            const u = typeof img === 'string' ? img : img?.url || img?.src;
            add(u, `Section ${idx + 1} Image ${iIdx + 1}`, '', `sec_${idx + 1}_img_${iIdx + 1}`);
          });
        }
      });
    }
  }

  return images;
}

export default function SeoCenterModal({
  isOpen,
  onClose,
  pageData,
  onSaveSuccess,
}) {
  const [activeTab, setActiveTab] = useState('traditional');
  const mainRef = useRef(null);

  // Form State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [heroAlt, setHeroAlt] = useState('');
  const [ogCardAlt, setOgCardAlt] = useState('');
  const [entityImages, setEntityImages] = useState([]);
  const [geoSummary, setGeoSummary] = useState('');
  const [geoClusters, setGeoClusters] = useState('');
  const [aeoFaqs, setAeoFaqs] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [showRawFaqs, setShowRawFaqs] = useState(false);
  const [schemaType, setSchemaType] = useState('WebPage');
  const [jsonLdPayload, setJsonLdPayload] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Generation & Save state
  const [generatingSection, setGeneratingSection] = useState(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  const scrollToSection = (tabKey, sectionId) => {
    setActiveTab(tabKey);
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const parseFaqsFromString = (str) => {
    if (!str || !String(str).trim()) return [];
    const result = [];
    const regex = /(?:^|\n)\s*(?:Q|Question):\s*(.+?)\s*(?:\n|\r\n)\s*(?:A|Answer):\s*([\s\S]+?)(?=(?:\n\s*(?:Q|Question):|$))/gi;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match[1]?.trim() && match[2]?.trim()) {
        result.push({ question: match[1].trim(), answer: match[2].trim() });
      }
    }
    return result;
  };

  const handleFaqChange = (index, field, value) => {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: value };
    setFaqs(next);
    const formatted = next.filter((f) => f.question || f.answer).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
    setAeoFaqs(formatted);
  };

  const handleAddFaq = () => {
    const next = [...faqs, { question: '', answer: '' }];
    setFaqs(next);
  };

  const handleRemoveFaq = (index) => {
    const next = faqs.filter((_, i) => i !== index);
    setFaqs(next);
    const formatted = next.filter((f) => f.question || f.answer).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
    setAeoFaqs(formatted);
  };

  const normalizeKeywords = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return Array.from(
        new Set(
          val
            .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
            .map((k) => k.trim().replace(/^#+/, ''))
            .filter(Boolean)
        )
      );
    }
    if (typeof val === 'string') {
      return Array.from(
        new Set(
          val
            .split(',')
            .map((k) => k.trim().replace(/^#+/, ''))
            .filter(Boolean)
        )
      );
    }
    return [];
  };

  const handleAddKeyword = (rawToAdd) => {
    const toProcess = (rawToAdd !== undefined ? rawToAdd : keywordInput).trim();
    if (!toProcess) return;

    const tokens = toProcess
      .split(',')
      .map((t) => t.trim().replace(/^#+/, ''))
      .filter(Boolean);

    if (tokens.length === 0) return;

    setMetaKeywords((prev) => {
      const existingLower = new Set(prev.map((k) => k.toLowerCase()));
      const next = [...prev];
      for (const tok of tokens) {
        if (!existingLower.has(tok.toLowerCase())) {
          existingLower.add(tok.toLowerCase());
          next.push(tok);
        }
      }
      return next;
    });

    if (rawToAdd === undefined) {
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (indexToRemove) => {
    setMetaKeywords((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllKeywords = () => {
    setMetaKeywords([]);
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    } else if (e.key === 'Backspace' && !keywordInput && metaKeywords.length > 0) {
      handleRemoveKeyword(metaKeywords.length - 1);
    }
  };

  const getSuggestedKeywords = () => {
    const title = (pageData?.title || pageData?.Name || pageData?.name || '').trim();
    const type = (pageData?.entityType || 'page').toLowerCase();
    const base = [];
    if (title) base.push(title);

    if (type === 'organization' || type === 'organizations') {
      base.push('Pakistan Charities', 'Verified NGOs', 'Welfare Organizations', 'Donate Online', 'Zakat Pakistan', 'Khudii Directory');
    } else if (type === 'blog' || type === 'blogs') {
      base.push('Pakistan Social Welfare', 'Charity Insights', 'Philanthropy Blog', 'Community Relief', 'Grassroots Impact');
    } else if (type === 'story' || type === 'stories') {
      base.push('Inspiring Stories', 'Real Life Heroes', 'Pakistan Welfare Stories', 'Community Transformation', 'Hope in Pakistan');
    } else if (type === 'faqs' || pageData?.slug === '/faqs') {
      base.push('Khudii Help', 'Charity Verification', 'How to Donate', 'Volunteer Guidelines', 'NGO Registration');
    } else {
      base.push('Digital Welfare Network', 'Charity Portal', 'Verified Welfare Pakistan', 'Donate & Volunteer', 'Civic Action');
    }

    const lowerActive = new Set(metaKeywords.map((k) => k.toLowerCase()));
    return base.filter((kw) => !lowerActive.has(kw.toLowerCase()));
  };

  const fitText = (text, maxLen) => {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLen) return cleaned;
    const truncated = cleaned.slice(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 20) {
      return `${truncated.slice(0, lastSpace)}...`;
    }
    return `${truncated}...`;
  };

  const generateOptimalTitle = (rawTitle) => {
    const title = (rawTitle || 'Khudii Platform').trim();
    const brand = ' | Khudii';
    const candidate = `${title}${brand}`;
    if (candidate.length <= 60) return candidate;
    return fitText(title, 60);
  };

  const generateOptimalDescription = (rawTitle) => {
    const title = (rawTitle || 'Khudii Platform').trim();
    const candidate = `Discover verified welfare programs, donations, active humanitarian campaigns, and inspiring community work for ${title} on Khudii Pakistan.`;
    if (candidate.length <= 160) return candidate;
    return fitText(candidate, 160);
  };

  // Populate data on pageData change
  useEffect(() => {
    if (!pageData) return;
    const raw = pageData.raw || pageData;
    const entityType = (pageData.entityType || 'page').toLowerCase();
    const pageTitle = pageData.title || pageData.Name || pageData.name || raw.title || raw.Name || raw.name || 'Khudii';
    const pageSlug = pageData.slug || raw.slug || '/';
    const path = pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;
    const domain = 'https://www.khudii.com';
    const canonical = `${domain}${path}`;

    const existingSeo = pageData.seoData || raw.seoSettings || {};

    setMetaTitle(
      existingSeo.metaTitle ||
      raw.meta_title ||
      pageData.metaTitle ||
      generateOptimalTitle(pageTitle)
    );

    setMetaDescription(
      existingSeo.metaDescription ||
      raw.meta_description ||
      pageData.metaDescription ||
      generateOptimalDescription(pageTitle)
    );

    const rawKws =
      existingSeo.metaKeywords ||
      raw.meta_keywords ||
      pageData.metaKeywords ||
      [];
    setMetaKeywords(normalizeKeywords(rawKws));

    setHeroAlt(
      existingSeo.heroAlt ||
      raw.heroAlt ||
      `Official visual illustration and hero presentation for ${pageTitle} on Khudii`
    );

    setOgCardAlt(
      existingSeo.ogCardAlt ||
      `Official social preview card for ${pageTitle} on Khudii platform`
    );

    // Harvest genuine entity images
    const extractedImages = extractEntityImages(entityType, pageData);
    const savedAlts = existingSeo.imageAlts || raw.imageAlts || {};
    const mergedImages = extractedImages.map((img) => ({
      ...img,
      alt: savedAlts[img.key] || savedAlts[img.url] || img.alt,
    }));
    setEntityImages(mergedImages);

    setGeoSummary(
      existingSeo.geoSummary ||
      raw.geo_summary ||
      `Comprehensive official overview of ${pageTitle} published on Khudii, Pakistan's dedicated social welfare discovery and philanthropic verification network.`
    );

    setGeoClusters(
      existingSeo.geoClusters ||
      raw.geo_entities ||
      `${pageTitle}, Khudii Pakistan, Verified Welfare, Charity Directory, Humanitarian Assistance, Community Impact`
    );

    const rawAeoFaqs = existingSeo.aeoFaqs ||
      `Q: What information is available regarding ${pageTitle} on Khudii?\nA: This page provides official details, verified credentials, and direct actions regarding ${pageTitle}.\n\nQ: How does Khudii ensure welfare transparency?\nA: Khudii reviews organizational legitimacy, contact credentials, and verified social programs across Pakistan.`;
    setAeoFaqs(rawAeoFaqs);

    let initialFaqs = [];
    if (Array.isArray(existingSeo.faqs) && existingSeo.faqs.length > 0) {
      initialFaqs = existingSeo.faqs.map((f) => ({
        question: String(f.question || '').trim(),
        answer: String(f.answer || '').trim(),
      })).filter((f) => f.question && f.answer);
    } else if (existingSeo.aeoFaqs) {
      initialFaqs = parseFaqsFromString(existingSeo.aeoFaqs);
    }

    if (initialFaqs.length === 0) {
      initialFaqs = [
        {
          question: `What information is available regarding ${pageTitle} on Khudii?`,
          answer: `This page provides official details, verified credentials, and direct actions regarding ${pageTitle}.`,
        },
        {
          question: `How does Khudii ensure welfare transparency?`,
          answer: `Khudii reviews organizational legitimacy, contact credentials, and verified social programs across Pakistan.`,
        },
      ];
    }
    setFaqs(initialFaqs);

    const defaultSchema =
      entityType === 'organization' || entityType === 'organizations'
        ? 'NGO'
        : entityType === 'blog' || entityType === 'blogs' || entityType === 'story' || entityType === 'stories'
          ? 'Article'
          : entityType === 'faqs' || pageSlug === '/faqs'
            ? 'FAQPage'
            : 'WebPage';

    setSchemaType(existingSeo.schemaType || defaultSchema);

    // Initial schema JSON
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': defaultSchema,
      name: `${pageTitle} | Khudii`,
      description: generateOptimalDescription(pageTitle),
      url: canonical,
      publisher: {
        '@type': 'Organization',
        name: 'Khudii',
        url: domain,
        logo: `${domain}/khudiilogo.png`,
      },
    };
    setJsonLdPayload(existingSeo.jsonLdPayload || JSON.stringify(schemaObj, null, 2));
    setCanonicalUrl(existingSeo.canonicalUrl || canonical);
    setNoIndex(existingSeo.noIndex || false);
    setOgImageUrl(existingSeo.ogImageUrl || extractedImages[0]?.url || `${domain}/khudiilogo.png`);

    // Fetch from backend API if available to ensure latest synced DB state
    const apiPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
    const entityId = pageData.id || pageData.slug;
    if (entityId) {
      fetch(`${apiPath}/admin/seo/entity?type=${encodeURIComponent(entityType)}&id=${encodeURIComponent(entityId)}`, {
        credentials: 'include',
        headers: { 'x-khudii-surface': 'admin' },
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((resp) => {
          if (resp.success && resp.data) {
            const d = resp.data;
            if (d.metaTitle) setMetaTitle(d.metaTitle);
            if (d.metaDescription) setMetaDescription(d.metaDescription);
            if (d.metaKeywords) setMetaKeywords(normalizeKeywords(d.metaKeywords));
            if (d.heroAlt) setHeroAlt(d.heroAlt);
            if (d.ogCardAlt) setOgCardAlt(d.ogCardAlt);
            if (d.geoSummary) setGeoSummary(d.geoSummary);
            if (d.geoClusters) setGeoClusters(d.geoClusters);
            if (Array.isArray(d.faqs) && d.faqs.length > 0) setFaqs(d.faqs);
            if (d.schemaType) setSchemaType(d.schemaType);
            if (d.jsonLdPayload) setJsonLdPayload(d.jsonLdPayload);
            if (d.canonicalUrl) setCanonicalUrl(d.canonicalUrl);
            if (typeof d.noIndex === 'boolean') setNoIndex(d.noIndex);
          }
        })
        .catch(() => {});
    }
  }, [pageData, isOpen]);

  // Context builder for generation
  const buildGenerationContext = () => {
    const raw = pageData?.raw || pageData || {};
    const entityType = (pageData?.entityType || 'page').toLowerCase();
    const pageTitle = pageData?.title || pageData?.Name || pageData?.name || raw.title || 'Khudii';
    const pageSlug = pageData?.slug || raw.slug || '/';
    return {
      entityType,
      pageTitle,
      pageSlug,
      description: metaDescription || raw.intro || raw.description || raw.story || '',
      heroImageUrl: entityImages[0]?.url || ogImageUrl,
      ogImageUrl,
      existingContent: {
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords.join(', '),
        heroAlt,
        ogCardAlt,
        geoSummary,
        geoClusters,
        aeoFaqs,
      },
      siteContext: {
        brandName: 'Khudii',
        domain: 'https://www.khudii.com',
        industry: "Pakistan's digital welfare and verified charity network",
        logoUrl: 'https://www.khudii.com/khudiilogo.png',
      },
    };
  };

  // Section generators
  const handleGenerateSection = async (section) => {
    if (!pageData) return;
    setGeneratingSection(section);
    const apiPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
    const ctx = buildGenerationContext();
    try {
      const res = await fetch(`${apiPath}/admin/seo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        credentials: 'include',
        body: JSON.stringify({ section, context: ctx }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (section === 'traditional' || section === 'all') {
          if (d.metaTitle) setMetaTitle(d.metaTitle);
          if (d.metaDescription) setMetaDescription(d.metaDescription);
          if (d.metaKeywords) setMetaKeywords(normalizeKeywords(d.metaKeywords));
        }
        if (section === 'alt' || section === 'all') {
          if (d.heroAlt) setHeroAlt(d.heroAlt);
          if (d.ogCardAlt) setOgCardAlt(d.ogCardAlt);
          setEntityImages((prev) => prev.map((img) => ({
            ...img,
            alt: `${img.label} - ${ctx.pageTitle} | Khudii`,
          })));
        }
        if (section === 'geo' || section === 'all') {
          if (d.geoSummary) setGeoSummary(d.geoSummary);
          if (d.geoClusters) setGeoClusters(d.geoClusters);
        }
        if (section === 'aeo' || section === 'all') {
          if (d.formattedFaqs) {
            setAeoFaqs(d.formattedFaqs);
            setFaqs(parseFaqsFromString(d.formattedFaqs));
          }
        }
        if (section === 'schema' || section === 'all') {
          if (d.schemaType) setSchemaType(d.schemaType);
          if (d.jsonLdPayload) setJsonLdPayload(d.jsonLdPayload);
        }
        if (section === 'technical' || section === 'all') {
          if (d.canonicalUrl) setCanonicalUrl(d.canonicalUrl);
          if (typeof d.noIndex === 'boolean') setNoIndex(d.noIndex);
        }
        setSaveToast(`✓ ${section.toUpperCase()} SEO generated! Review and click Save All SEO.`);
        setTimeout(() => setSaveToast(''), 3500);
      }
    } catch (e) {
      console.warn('AI generation error, applying smart local generator:', e);
      // Fallback local logic
      const title = pageData.title || pageData.Name || pageData.name || 'Khudii';
      if (section === 'traditional' || section === 'all') {
        setMetaTitle(generateOptimalTitle(title));
        setMetaDescription(generateOptimalDescription(title));
        setMetaKeywords(getSuggestedKeywords());
      }
      if (section === 'alt' || section === 'all') {
        setHeroAlt(`Official presentation and hero image for ${title} on Khudii`);
        setOgCardAlt(`Official preview card for ${title} on Khudii`);
        setEntityImages((prev) => prev.map((img) => ({
          ...img,
          alt: `${img.label} for ${title} on Khudii`,
        })));
      }
      if (section === 'geo' || section === 'all') {
        setGeoSummary(`Comprehensive overview of ${title} published on Khudii, Pakistan's dedicated social welfare discovery network.`);
        setGeoClusters(`${title}, Khudii Pakistan, Verified Welfare, Charity Directory, Humanitarian Assistance`);
      }
      if (section === 'aeo' || section === 'all') {
        const fallbackFaqs = [
          { question: `What is the objective of ${title}?`, answer: `${title} works to foster community welfare and transparent social development in Pakistan.` },
          { question: `How can I connect with ${title} on Khudii?`, answer: `You can view verified credentials, mission details, and direct contact options on Khudii.` },
        ];
        setFaqs(fallbackFaqs);
        setAeoFaqs(fallbackFaqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'));
      }
      if (section === 'schema' || section === 'all') {
        const canonical = canonicalUrl || `https://www.khudii.com/${pageData.slug || ''}`;
        setJsonLdPayload(JSON.stringify({
          '@context': 'https://schema.org',
          '@type': schemaType,
          name: `${title} | Khudii`,
          url: canonical,
          description: generateOptimalDescription(title),
        }, null, 2));
      }
      setSaveToast('✓ Generated tailored SEO fields for this entity.');
      setTimeout(() => setSaveToast(''), 3500);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    await handleGenerateSection('all');
    setIsGeneratingAll(false);
  };

  // Live Audit Scoring
  const titleStr = (metaTitle || '').trim();
  const descStr = (metaDescription || '').trim();
  const heroAltStr = (heroAlt || '').trim();
  const ogAltStr = (ogCardAlt || '').trim();
  const geoSummaryStr = (geoSummary || '').trim();
  const geoClustersStr = (geoClusters || '').trim();
  const aeoFaqsStr = (aeoFaqs || '').trim();
  const canonicalUrlStr = (canonicalUrl || '').trim();

  const isTitleOk = titleStr.length >= 20 && titleStr.length <= 70;
  const isDescOk = descStr.length >= 50 && descStr.length <= 165;
  const isKeywordsOk = metaKeywords.length >= 1;
  const isHeroAltOk = heroAltStr.length >= 8;
  const isOgAltOk = ogAltStr.length >= 8;
  const isGeoOk = geoSummaryStr.length >= 20 && geoClustersStr.length >= 5;
  const isAeoOk = aeoFaqsStr.length >= 30 && aeoFaqsStr.includes('Q:');

  let isSchemaOk = false;
  try {
    const parsed = JSON.parse(jsonLdPayload);
    if (parsed && parsed['@context'] && parsed['@type']) isSchemaOk = true;
  } catch {}

  const isTechnicalOk = Boolean(canonicalUrlStr && canonicalUrlStr.length >= 8);

  const traditionalScore = Math.round(
    (isTitleOk ? 45 : titleStr.length > 0 ? 25 : 0) +
    (isDescOk ? 45 : descStr.length > 0 ? 25 : 0) +
    (isKeywordsOk ? 10 : 0)
  );

  const altScore = Math.round(
    (isHeroAltOk ? 50 : heroAltStr.length > 0 ? 25 : 0) +
    (isOgAltOk ? 50 : ogAltStr.length > 0 ? 25 : 0)
  );

  const aeoGeoScore = Math.round(
    (isGeoOk ? 50 : geoSummaryStr.length > 0 ? 25 : 0) +
    (isAeoOk ? 50 : aeoFaqsStr.length > 0 ? 25 : 0)
  );

  const schemaScore = isSchemaOk ? 100 : jsonLdPayload.trim().length > 10 ? 40 : 0;
  const technicalScore = isTechnicalOk ? 100 : 40;

  // Overall Score (0-100)
  let overallScore = 0;
  if (isTitleOk) overallScore += 20;
  else if (titleStr.length > 0) overallScore += 10;
  if (isDescOk) overallScore += 20;
  else if (descStr.length > 0) overallScore += 10;
  if (isKeywordsOk) overallScore += 10;
  if (isHeroAltOk) overallScore += 10;
  if (isOgAltOk) overallScore += 10;
  if (isGeoOk) overallScore += 10;
  if (isAeoOk) overallScore += 10;
  if (isSchemaOk) overallScore += 5;
  if (isTechnicalOk) overallScore += 5;
  overallScore = Math.min(100, Math.max(overallScore, 15));

  // Checklist items
  const criticalIssues = [];
  const warningIssues = [];
  const passedChecks = [];

  if (!isTitleOk) {
    criticalIssues.push({ text: titleStr.length === 0 ? 'Meta Title is missing' : `Meta Title length (${titleStr.length}/60 chars) outside recommended 20-70`, category: 'Traditional SEO', tab: 'traditional' });
  } else {
    passedChecks.push({ text: `Meta Title is optimally formatted (${titleStr.length} chars)`, category: 'Traditional SEO' });
  }

  if (!isDescOk) {
    criticalIssues.push({ text: descStr.length === 0 ? 'Meta Description is missing' : `Meta Description length (${descStr.length}/160 chars) outside recommended 50-165`, category: 'Traditional SEO', tab: 'traditional' });
  } else {
    passedChecks.push({ text: `Meta Description is optimally formatted (${descStr.length} chars)`, category: 'Traditional SEO' });
  }

  if (!isKeywordsOk) {
    warningIssues.push({ text: 'Meta Keywords not defined — Recommended 3-8 target queries', category: 'Traditional SEO', tab: 'traditional' });
  } else {
    passedChecks.push({ text: `Meta Keywords configured (${metaKeywords.length} target search tags defined)`, category: 'Traditional SEO' });
  }

  if (!isHeroAltOk) {
    criticalIssues.push({ text: 'Hero Image Alt text is missing', category: 'Alt Texts', tab: 'alt' });
  } else {
    passedChecks.push({ text: 'Hero Image Alt text is descriptive and accessible', category: 'Alt Texts' });
  }

  if (!isSchemaOk) {
    criticalIssues.push({ text: 'JSON-LD Schema missing or invalid JSON structured entity markup', category: 'JSON-LD Schema', tab: 'schema' });
  } else {
    passedChecks.push({ text: `JSON-LD Schema is valid ${schemaType} structured entity markup`, category: 'JSON-LD Schema' });
  }

  if (!isOgAltOk) {
    warningIssues.push({ text: 'Social OG Card Alt text missing — Recommended for high CTR previews', category: 'Alt Texts', tab: 'alt' });
  } else {
    passedChecks.push({ text: 'Social OG Card Alt text configured for social previews', category: 'Alt Texts' });
  }

  if (!isGeoOk) {
    warningIssues.push({ text: 'GEO AI Summary & Facts missing', category: 'GEO Search', tab: 'geo' });
  } else {
    passedChecks.push({ text: 'GEO Knowledge graph semantic context & entity clusters defined', category: 'GEO Search' });
  }

  if (!isAeoOk) {
    warningIssues.push({ text: 'AEO Voice Search Q&A pairs missing', category: 'AEO Search', tab: 'aeo' });
  } else {
    passedChecks.push({ text: 'AEO Voice Search & conversational answer pairs structured', category: 'AEO Search' });
  }

  if (!isTechnicalOk) {
    warningIssues.push({ text: 'Canonical URL is not configured', category: 'Technical SEO', tab: 'technical' });
  } else {
    passedChecks.push({ text: `Canonical URL configured (${canonicalUrlStr})`, category: 'Technical SEO' });
  }

  const handleSaveSeo = async () => {
    setIsSaving(true);
    setSaveToast('');

    const imageAlts = {};
    entityImages.forEach((img) => {
      if (img.alt) imageAlts[img.key] = img.alt;
    });

    const payload = {
      type: pageData.entityType || 'pages',
      id: pageData.id || pageData.slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      heroAlt,
      ogCardAlt,
      imageAlts,
      geoSummary,
      geoClusters,
      aeoFaqs,
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      schemaType,
      jsonLdPayload,
      canonicalUrl,
      noIndex,
      ogImageUrl,
    };

    try {
      const apiPath = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';
      const res = await fetch(`${apiPath}/admin/seo/entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Save failed (HTTP ${res.status})`);
      }
      setSaveToast(`✓ SEO saved successfully in database for ${pageData.title || pageData.name || 'entity'}!`);
      if (onSaveSuccess) onSaveSuccess(payload);
      setTimeout(() => setSaveToast(''), 4000);
    } catch (err) {
      console.error('handleSaveSeo error:', err);
      setSaveToast(`✕ Error saving to DB: ${err.message || 'Operation failed'}`);
      setTimeout(() => setSaveToast(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !pageData) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#F8FAFC] w-full max-w-6xl h-[88vh] max-h-[850px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-[#02236E] my-auto">
        {/* Header Bar matching Image 1 */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#064E3B] to-[#d97706] flex items-center justify-center text-white shadow-md shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#02236E] m-0 tracking-tight">SEO Center</h2>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full truncate max-w-[220px]">
                  {pageData.title || pageData.Name || pageData.name || 'Page'}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                  NEXT-GEN INTELLIGENCE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 m-0 mt-0.5 truncate">
                Real-time automated diagnostic health &amp; AI search engine indexability suite
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerateAll}
              disabled={isGeneratingAll || isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm border border-amber-400/40 shrink-0 disabled:opacity-60"
              title="Auto-generate complete metadata, Alt texts, GEO, AEO, and JSON-LD Schema"
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating Complete SEO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-100" />
                  <span>Auto-Generate Complete SEO</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('score', 'seo-sec-score')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#02236E] hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>Live Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSeo}
              disabled={isSaving || isGeneratingAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-xs border border-emerald-600/40 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save All SEO</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer border-none ml-1"
              title="Close SEO Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {saveToast && (
          <div className="bg-[#064E3B] text-white text-xs font-bold px-6 py-2 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> {saveToast}
            </span>
            <button type="button" onClick={() => setSaveToast('')} className="text-white hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-60 min-w-[240px] bg-white border-r border-slate-200 p-4 space-y-1.5 overflow-y-auto shrink-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-2">
              SEO Categories
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('traditional', 'seo-sec-traditional')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'traditional'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'traditional' ? 'text-white' : 'text-[#064E3B]'}`} />
                <span className="truncate">Traditional SEO</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'traditional'
                  ? 'bg-white/20 text-white'
                  : isTitleOk && isDescOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isTitleOk && isDescOk ? '✓ 100%' : `${traditionalScore}%`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('alt', 'seo-sec-alt')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'alt'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'alt' ? 'text-white' : 'text-blue-600'}`} />
                <span className="truncate">Alt Texts</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'alt'
                  ? 'bg-white/20 text-white'
                  : isHeroAltOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isHeroAltOk ? '✓ Active' : `${altScore}%`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('geo', 'seo-sec-geo')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'geo'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Zap className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'geo' ? 'text-white' : 'text-amber-500'}`} />
                <span className="truncate">GEO (Generative...)</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'geo'
                  ? 'bg-white/20 text-white'
                  : isGeoOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isGeoOk ? '✓ 100%' : 'Needs Data'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('aeo', 'seo-sec-aeo')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'aeo'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'aeo' ? 'text-white' : 'text-indigo-600'}`} />
                <span className="truncate">AEO (Voice &amp; A...)</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'aeo'
                  ? 'bg-white/20 text-white'
                  : isAeoOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isAeoOk ? '✓ 100%' : `${faqs.length} FAQs`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('schema', 'seo-sec-schema')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'schema' ? 'text-white' : 'text-emerald-600'}`} />
                <span className="truncate">JSON-LD Schema</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'schema'
                  ? 'bg-white/20 text-white'
                  : isSchemaOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
              }`}>
                {isSchemaOk ? '✓ Valid' : '● Fix'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('technical', 'seo-sec-technical')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'technical'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sliders className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'technical' ? 'text-white' : 'text-purple-600'}`} />
                <span className="truncate">Technical SEO</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'technical'
                  ? 'bg-white/20 text-white'
                  : isTechnicalOk
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isTechnicalOk ? '✓ Ready' : '● Setup'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('score', 'seo-sec-score')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                activeTab === 'score'
                  ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'score' ? 'text-white' : 'text-red-500'}`} />
                <span className="truncate">Validation &amp; Score</span>
              </div>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'score'
                  ? 'bg-white/20 text-white'
                  : overallScore >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : overallScore >= 70
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-700'
              }`}>
                {overallScore}%
              </span>
            </button>
          </aside>

          {/* Right Scrollable Content Panel */}
          <main ref={mainRef} className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#F8FAFC] scroll-smooth">
            {/* 1. Meta Data Management */}
            <section id="seo-sec-traditional" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">Meta Data Management</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Optimize title, description, and target keywords for standard search engines (strictly within 60 &amp; 160 characters).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('traditional')}
                  disabled={generatingSection === 'traditional'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  {generatingSection === 'traditional' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate Traditional SEO</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <label className="font-extrabold text-[#02236E]">Meta Title</label>
                      <span className="text-[10px] text-slate-400 font-normal">(Search Result Headline)</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md font-bold border text-[10px] ${
                        metaTitle.length >= 50 && metaTitle.length <= 60
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          : metaTitle.length >= 30 && metaTitle.length < 50
                            ? 'text-sky-700 bg-sky-50 border-sky-300'
                            : metaTitle.length > 60 && metaTitle.length <= 70
                              ? 'text-amber-700 bg-amber-50 border-amber-300'
                              : 'text-red-700 bg-red-50 border-red-300'
                      }`}>
                        {metaTitle.length >= 50 && metaTitle.length <= 60
                          ? '✓ Optimal Length'
                          : metaTitle.length < 50
                            ? '• Good Length'
                            : '⚠ Too Long'}{' '}
                        {metaTitle.length}/60 chars
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={metaTitle || ''}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Enter SEO title..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:bg-white transition-all font-medium"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                    <span>Google Standard: 50 – 60 characters (safe limit before truncation)</span>
                    <span>{60 - metaTitle.length >= 0 ? `${60 - metaTitle.length} chars left` : `${metaTitle.length - 60} chars over`}</span>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <label className="font-extrabold text-[#02236E]">Meta Description</label>
                      <span className="text-[10px] text-slate-400 font-normal">(Search Snippet Summary)</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md font-bold border text-[10px] ${
                        metaDescription.length >= 120 && metaDescription.length <= 160
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          : metaDescription.length >= 80 && metaDescription.length < 120
                            ? 'text-sky-700 bg-sky-50 border-sky-300'
                            : 'text-amber-700 bg-amber-50 border-amber-300'
                      }`}>
                        {metaDescription.length >= 120 && metaDescription.length <= 160
                          ? '✓ Optimal (120-160)'
                          : '• Acceptable'}{' '}
                        {metaDescription.length}/160 chars
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription || ''}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Enter meta description..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:bg-white transition-all resize-y font-medium"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                    <span>Google Standard: 120 – 160 characters (snippet visibility threshold)</span>
                    <span>{160 - metaDescription.length >= 0 ? `${160 - metaDescription.length} chars left` : `${metaDescription.length - 160} chars over`}</span>
                  </div>
                </div>

                {/* Meta Keywords */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#064E3B]" />
                      <label className="font-extrabold text-[#02236E]">Meta Keywords</label>
                      <span className="text-[10px] text-slate-400 font-normal">(Target Search Queries &amp; Indexation Tags)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold border text-[10px] ${
                        metaKeywords.length >= 3
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                          : 'text-amber-700 bg-amber-50 border-amber-300'
                      }`}>
                        {metaKeywords.length >= 3 ? `✓ Optimal (${metaKeywords.length} tags)` : `${metaKeywords.length} tags`}
                      </span>
                      {metaKeywords.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllKeywords}
                          className="text-[10px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Keyword Input */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput || ''}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder="Type keyword and press Enter or comma (e.g., Welfare, Education, Charity, Health)..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddKeyword()}
                      disabled={!keywordInput.trim()}
                      className="px-4 py-2 bg-[#02236E] hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {metaKeywords.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No search keywords defined yet.</span>
                    ) : (
                      metaKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-900 border border-emerald-300 shadow-xs"
                        >
                          <span># {kw}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(idx)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                            title={`Remove #${kw}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick Add Suggestions */}
                  {getSuggestedKeywords().length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-600 mr-1.5">QUICK ADD:</span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {getSuggestedKeywords().slice(0, 6).map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleAddKeyword(sug)}
                            className="px-2 py-0.5 bg-slate-200/80 hover:bg-emerald-100 hover:text-emerald-900 hover:border-emerald-300 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Smart Accessibility Engine */}
            <section id="seo-sec-alt" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">Smart Accessibility Engine</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Automatically analyze page images, OpenGraph social cards, and generate descriptive, SEO-friendly alt text.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateSection('alt')}
                    disabled={generatingSection === 'alt'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                  >
                    {generatingSection === 'alt' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Generate Alt Texts</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...entityImages, { url: '', label: `Image ${entityImages.length + 1}`, alt: '', key: `custom_${Date.now()}` }];
                      setEntityImages(next);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Image / Card</span>
                  </button>
                </div>
              </div>

              {/* Extracted Images List */}
              <div className="space-y-3">
                {entityImages.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                    No images detected on this entity. Click &quot;Add Image / Card&quot; to configure custom alt descriptions.
                  </div>
                ) : (
                  entityImages.map((img, idx) => (
                    <div key={img.key || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <div className="w-16 h-12 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.url} alt={img.alt || 'Thumbnail'} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#02236E]">{img.label}</span>
                          {idx === 0 && <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">HERO</span>}
                          {img.alt && <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">✓ Alt Defined</span>}
                        </div>
                        <input
                          type="text"
                          value={img.alt || ''}
                          onChange={(e) => {
                            const next = [...entityImages];
                            next[idx] = { ...next[idx], alt: e.target.value };
                            setEntityImages(next);
                            if (idx === 0) setHeroAlt(e.target.value);
                          }}
                          placeholder="Descriptive alt text for accessibility and search..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEntityImages(entityImages.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded cursor-pointer shrink-0"
                        title="Remove image entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* 3. GEO (Generative Engine Optimization) */}
            <section id="seo-sec-geo" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">GEO (Generative Engine Optimization)</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Optimize content discoverability for LLMs (ChatGPT, Gemini, Claude, Perplexity).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('geo')}
                  disabled={generatingSection === 'geo'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  {generatingSection === 'geo' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate GEO</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#02236E] mb-1">AI Page Summary &amp; Facts</label>
                  <textarea
                    rows={3}
                    value={geoSummary || ''}
                    onChange={(e) => setGeoSummary(e.target.value)}
                    placeholder="Comprehensive AI-readable factual summary..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#02236E] mb-1">Entity &amp; Topic Clusters</label>
                  <input
                    type="text"
                    value={geoClusters || ''}
                    onChange={(e) => setGeoClusters(e.target.value)}
                    placeholder="Topic clusters and entity tags..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </section>

            {/* 4. AEO (Answer Engine Optimization) */}
            <section id="seo-sec-aeo" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">AEO (Answer Engine Optimization)</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Optimize for Featured Snippets, Voice Search, and &quot;People Also Ask&quot; blocks.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRawFaqs(!showRawFaqs)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold border border-slate-300 cursor-pointer"
                  >
                    {showRawFaqs ? 'Card View' : 'Raw Text View'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateSection('aeo')}
                    disabled={generatingSection === 'aeo'}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                  >
                    {generatingSection === 'aeo' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Generate AEO FAQs</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {showRawFaqs ? (
                <div>
                  <textarea
                    rows={8}
                    value={aeoFaqs || ''}
                    onChange={(e) => {
                      setAeoFaqs(e.target.value);
                      setFaqs(parseFaqsFromString(e.target.value));
                    }}
                    placeholder="Q: Question\nA: Answer..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-600">Configured FAQs ({faqs.length})</div>
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase text-[#064E3B]">QUESTION #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question || ''}
                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                        placeholder="Enter Question..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-[#02236E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer || ''}
                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                        placeholder="Enter Answer..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-[#02236E] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 5. Dynamic JSON-LD Schema */}
            <section id="seo-sec-schema" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">Dynamic JSON-LD Schema</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Manage structured data to help search engines understand page context.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('schema')}
                  disabled={generatingSection === 'schema'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  {generatingSection === 'schema' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate JSON-LD Schema</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#02236E] mb-1">Primary Schema Type</label>
                  <select
                    value={schemaType || 'WebPage'}
                    onChange={(e) => setSchemaType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  >
                    <option value="WebPage">WebPage</option>
                    <option value="Organization">Organization</option>
                    <option value="NGO">NGO / Charity</option>
                    <option value="Article">Article / BlogPost</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="CollectionPage">CollectionPage</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-extrabold text-[#02236E]">JSON-LD</label>
                    <span className={`text-[10px] font-bold ${isSchemaOk ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isSchemaOk ? '✓ Valid JSON-LD' : '✕ Invalid JSON syntax'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={jsonLdPayload || ''}
                    onChange={(e) => setJsonLdPayload(e.target.value)}
                    className="w-full p-3 bg-[#02236E] text-emerald-400 font-mono text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                    spellCheck={false}
                  />
                </div>
              </div>
            </section>

            {/* 6. Technical SEO & Social Cards */}
            <section id="seo-sec-technical" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-[#02236E] m-0">Technical SEO &amp; Social Cards</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Canonical URLs, Indexing rules, and Open Graph attributes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('technical')}
                  disabled={generatingSection === 'technical'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Technical SEO</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#02236E] mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={canonicalUrl || ''}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://www.khudii.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#02236E] font-medium focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#02236E] mb-1">Robots Meta</label>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(noIndex)}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B] w-4 h-4"
                    />
                    <span>Prevent search engines from indexing (noindex)</span>
                  </label>
                </div>
              </div>
            </section>

            {/* 7. AI Search Readiness Score & Issues Audit */}
            <section id="seo-sec-score" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6 scroll-mt-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#02236E] m-0">AI Search Readiness Score &amp; Issues Audit</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Real-time automated diagnostic audit and issue checklist for this page.
                </p>
              </div>

              {/* Gauge and Category Bars matching Image 5 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-6">
                {/* Circular Score Ring */}
                <div className="flex flex-col items-center justify-center shrink-0 mx-auto md:mx-0">
                  <div className="w-28 h-28 rounded-full border-[7px] border-emerald-500 bg-white flex flex-col items-center justify-center shadow-sm">
                    <span className="text-3xl font-bold text-[#02236E]">{overallScore}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">OVERALL SCORE</span>
                  </div>
                </div>

                {/* Horizontal Progress Bars */}
                <div className="flex-1 w-full space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Traditional SEO (Title &amp; Meta)</span>
                      <span className="text-emerald-700">{traditionalScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${traditionalScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Image Alt Texts (Hero &amp; Social Card)</span>
                      <span className="text-emerald-700">{altScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${altScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Generative &amp; Answer SEO (AEO / GEO)</span>
                      <span className="text-emerald-700">{aeoGeoScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${aeoGeoScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Structured JSON-LD Schema</span>
                      <span className="text-emerald-700">{schemaScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${schemaScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Technical &amp; Index Directives</span>
                      <span className="text-emerald-700">{technicalScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${technicalScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE GOOGLE SEARCH RESULT SNIPPET PREVIEW */}
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#02236E]">
                    <Search className="w-3.5 h-3.5 text-[#064E3B]" />
                    <span>LIVE GOOGLE SEARCH RESULT SNIPPET PREVIEW</span>
                  </div>
                  <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                        previewDevice === 'desktop' ? 'bg-white shadow-xs text-[#02236E]' : 'text-slate-500 hover:text-[#02236E]'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                        previewDevice === 'mobile' ? 'bg-white shadow-xs text-[#02236E]' : 'text-slate-500 hover:text-[#02236E]'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Snippet Card */}
                <div className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1.5 ${
                  previewDevice === 'mobile' ? 'max-w-[420px] mx-auto' : 'w-full'
                }`}>
                  <div className="text-[11px] text-emerald-800 font-mono truncate">
                    {canonicalUrl || `https://www.khudii.com${pageData.slug || ''}`}
                  </div>
                  <div className="text-base font-bold text-blue-700 hover:underline cursor-pointer leading-tight">
                    {metaTitle || pageData.title || 'Khudii Platform'}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {metaDescription || 'No meta description configured for this page snippet.'}
                  </p>
                  {metaKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {metaKeywords.slice(0, 4).map((kw, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Pills & Checklist Cards matching Image 6 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    criticalIssues.length > 0
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ● {criticalIssues.length} Critical Fixes
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    warningIssues.length > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    ● {warningIssues.length} Warnings
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ● {passedChecks.length} Passed
                  </span>
                </div>

                <div className="space-y-2">
                  {criticalIssues.map((issue, idx) => (
                    <div key={`crit-${idx}`} className="flex items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-900">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{issue.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 bg-white/60 px-2 py-0.5 rounded-full shrink-0">
                        {issue.category}
                      </span>
                    </div>
                  ))}

                  {warningIssues.map((issue, idx) => (
                    <div key={`warn-${idx}`} className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{issue.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-white/60 px-2 py-0.5 rounded-full shrink-0">
                        {issue.category}
                      </span>
                    </div>
                  ))}

                  {passedChecks.map((item, idx) => (
                    <div key={`pass-${idx}`} className="flex items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
