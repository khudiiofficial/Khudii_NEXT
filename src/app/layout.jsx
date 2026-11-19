import './globals.css';
import { getPublicSeoDefaults } from '@/server/public-seo-defaults';
import { formatSeoTitle, formatSeoDescription } from '@/lib/seo';

export async function generateMetadata() {
  const settings = await getPublicSeoDefaults();
  const site = (settings.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com').replace(/\/+$/, '');
  const title = formatSeoTitle(settings.meta_title || "Khudii - Pakistan's Digital Welfare Platform");
  const description = formatSeoDescription(settings.meta_description, "Pakistan's digital platform for welfare organizations");
  return {
    metadataBase: new URL(site),
    alternates: {
      canonical: './',
    },
    title: { default: title, template: '%s' },
    description,
    keywords: settings.meta_keywords || 'khudii, pakistan, welfare, charity, community support',
    robots: { index: settings.allow_indexing !== false, follow: settings.allow_indexing !== false },
    verification: {
      ...(settings.google_site_verification ? { google: settings.google_site_verification } : {}),
      ...(settings.bing_site_verification ? { other: { 'msvalidate.01': settings.bing_site_verification } } : {})
    },
    icons: { icon: settings.favicon || '/siteicon.png', apple: settings.favicon || '/siteicon.png' },
    openGraph: {
      type: 'website',
      siteName: 'Khudii',
      title: formatSeoTitle(settings.og_title || title),
      description: formatSeoDescription(settings.og_description || description),
      images: [settings.og_image || '/Khudii.webp']
    },
    twitter: {
      card: 'summary_large_image',
      title: formatSeoTitle(settings.og_title || title),
      description: formatSeoDescription(settings.og_description || description),
      images: [settings.og_image || '/Khudii.webp']
    }
  };
}

export default async function RootLayout({ children }) {
  const settings = await getPublicSeoDefaults();
  const site = (settings.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com').replace(/\/+$/, '');
  const rootWebsiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: `${site}/`,
    name: 'Khudii',
    description: "Pakistan's digital platform for welfare organizations",
    publisher: {
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: 'Khudii',
      url: `${site}/`,
      logo: `${site}/siteicon.png`
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://rsms.me" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://media.khudii.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://media.khudii.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/api/global-css" data-source="cms-global-css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootWebsiteJsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
