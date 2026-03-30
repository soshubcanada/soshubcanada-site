import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide X-Powered-By header
  poweredByHeader: false,

  // Security headers for all pages (proxy.ts handles API/CRM specifics)
  async headers() {
    return [
      // Pages de booking publiques — embeddables via iframe sur soshubcanada.com
      {
        source: '/rdv/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors https://soshubcanada.com https://www.soshubcanada.com' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      // Toutes les autres pages — non embeddables
      {
        source: '/((?!rdv).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
