/** @type {import('next').NextConfig} */

// Origin of the Express backend. Derived from NEXT_PUBLIC_API_URL, e.g. https://api.example.com/api/store
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/store').replace(/\/api\/store\/?$/, '').replace(/\/$/, '');

// Where /uploads/* files actually live. In production that's the Vercel Blob store
// (e.g. https://<store>.public.blob.vercel-storage.com). It must answer 200 directly: the image
// optimizer won't follow the API's /uploads → Blob redirect. Locally it's the Express server.
const UPLOADS_ORIGIN = (process.env.UPLOADS_ORIGIN || API_ORIGIN).replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      // Local admin uploads (dev)
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
    ],
    // Next 16 blocks private/local IPs by default; needed only in development
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    qualities: [75, 85],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/fragrances', destination: '/shop', permanent: true },
      { source: '/fragrances/:category', destination: '/shop/:category', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${UPLOADS_ORIGIN}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Static brand imagery: cache for a week, refresh in the background
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
};

export default nextConfig;
