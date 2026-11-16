import './globals.css';
import { getPublicSeoDefaults } from '@/server/public-seo-defaults';

export async function generateMetadata() {
  const settings=await getPublicSeoDefaults();
  const site=(settings.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khudii.com').replace(/\/+$/,'');
  const title=settings.meta_title||'Khudii';
  const description=settings.meta_description||"Pakistan's digital platform for welfare organizations";
  return {
    metadataBase:new URL(site),
    title:{default:title,template:'%s | Khudii'},description,
    keywords:settings.meta_keywords||'khudii, pakistan, welfare, charity, community support',
    robots:{index:settings.allow_indexing!==false,follow:settings.allow_indexing!==false},
    verification:{...(settings.google_site_verification?{google:settings.google_site_verification}:{}),...(settings.bing_site_verification?{other:{'msvalidate.01':settings.bing_site_verification}}:{})},
    icons:{icon:'/siteicon.png',apple:'/siteicon.png'},
    openGraph:{type:'website',siteName:'Khudii',title:settings.og_title||title,description:settings.og_description||description,images:[settings.og_image||'/Khudii.webp']},
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://rsms.me" />
        <link rel="preconnect" href="https://media.khudii.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://media.khudii.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
