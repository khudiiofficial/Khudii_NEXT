/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['basic-ftp', 'bcrypt', 'mysql2', 'nodemailer'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'media.khudii.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
