/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diğer ayarların varsa koru
  allowedDevOrigins: ["http://192.168.1.101:3000"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'easyordercdn-segfault.fra1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
