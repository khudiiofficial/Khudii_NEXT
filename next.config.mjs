/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['basic-ftp', 'bcrypt', 'mysql2', 'nodemailer'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.khudii.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/khudii-about', destination: '/about-khudii', permanent: true },
    ];
  },
};

export default nextConfig;
