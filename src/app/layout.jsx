import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://khudii.com'),
  title: { default: 'Khudii', template: '%s | Khudii' },
  description: "Pakistan's largest digital platform for welfare organizations",
  keywords: ['khudii', 'pakistan', 'welfare', 'charity', 'community support'],
  icons: { icon: '/siteicon.png', apple: '/siteicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'Khudii',
    images: ['/Khudii.webp'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://rsms.me" />
        <link rel="preconnect" href="https://media.khudii.com" crossOrigin="anonymous" />
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
