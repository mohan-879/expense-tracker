/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    const rawBackend =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      '';
    // Clean target URL (strip trailing /api and trailing slashes)
    const cleaned = rawBackend
      .trim()
      .replace(/\/api\/?$/, '')
      .replace(/\/$/, '');

    // In production on Vercel, default to the live deployed backend; on localhost default to 5000
    const defaultBackend =
      process.env.NODE_ENV === 'production'
        ? 'https://expense-tracker-orcin-three.vercel.app'
        : 'http://localhost:5000';

    const backendUrl = cleaned || defaultBackend;

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
