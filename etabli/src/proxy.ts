// ========================================================
// SOS Hub Canada - Security Proxy (Next.js Middleware)
// Applies security headers to all responses
// ========================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // ─── Security Headers ────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS — enforce HTTPS (1 year, include subdomains)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Hide server identity
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // ─── Booking pages (/rdv/*) — embeddable on soshubcanada.com ──
  const isBookingPage = pathname.startsWith('/rdv');

  if (!isBookingPage) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // ─── Content Security Policy ─────────────────────────
  const frameAncestors = isBookingPage
    ? `frame-ancestors https://soshubcanada.com https://www.soshubcanada.com`
    : `frame-ancestors 'none'`;

  const csp = [
    "default-src 'self'",
    // unsafe-inline needed for Next.js inline scripts + Tailwind
    // unsafe-eval needed for Square SDK
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.emailjs.com https://api.anthropic.com https://connect.squareup.com https://connect.squareupsandbox.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com`,
    `frame-src 'self' https://web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    frameAncestors,
    `upgrade-insecure-requests`,
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // ─── API-specific headers ────────────────────────────
  if (pathname.startsWith('/api/')) {
    // No caching for API responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // ─── CRM pages — additional protection ───────────────
  if (pathname.startsWith('/crm/')) {
    // Prevent search engines from indexing CRM
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    // No caching for CRM pages (sensitive data)
    response.headers.set('Cache-Control', 'no-store, private');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/crm/:path*',
    '/client/:path*',
    '/employeur/:path*',
    '/rdv/:path*',
  ],
};
