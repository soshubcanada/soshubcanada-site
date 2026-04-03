// ========================================================
// SOS Hub Canada - API Authentication & Security Middleware
// JWT verification, rate limiting, CSRF, input sanitization
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseReady } from './supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Allowed origins ───────────────────────────────────
const PROD_ORIGINS = [
  'https://soshubca.vercel.app',
  'https://crm.soshub.ca',
  'https://soshub.ca',
  'https://www.soshub.ca',
  'https://soshubcanada.com',
  'https://www.soshubcanada.com',
];
const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

function getAllowedOrigins(): string[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const origins = [...PROD_ORIGINS];
  if (base && !origins.includes(base)) origins.push(base);
  if (vercelUrl && !origins.includes(vercelUrl)) origins.push(vercelUrl);
  if (process.env.NODE_ENV === 'development') origins.push(...DEV_ORIGINS);
  return origins;
}

// ─── Authentication ────────────────────────────────────

/**
 * Verifies API request authentication via Supabase JWT.
 * Returns the authenticated user or a 401 error.
 */
export async function authenticateRequest(req: NextRequest): Promise<{
  authenticated: boolean;
  userId?: string;
  email?: string;
  error?: NextResponse;
}> {
  // Production without Supabase = always reject (never fall back to demo)
  if (!isSupabaseReady()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[api-auth] CRITICAL: Supabase not configured in production!');
      return { authenticated: false, error: NextResponse.json({ error: 'Service non disponible — configuration manquante' }, { status: 503 }) };
    }
    // Dev only: demo mode with explicit opt-in
    if (process.env.ALLOW_DEMO_AUTH === 'true') {
      return { authenticated: true, userId: 'demo', email: 'demo@soshub.ca' };
    }
    console.warn('[api-auth] Supabase not configured. Set ALLOW_DEMO_AUTH=true to enable demo bypass.');
    return { authenticated: false, error: NextResponse.json({ error: 'Service non disponible' }, { status: 503 }) };
  }

  // Extract Bearer token
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Also check Supabase session cookies
  const cookieToken = req.cookies.get('sb-access-token')?.value
    || Array.from(req.cookies.getAll()).find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))?.value;

  const accessToken = token || cookieToken;

  if (!accessToken) {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Non authentifie' }, { status: 401 }),
    };
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(url, anonKey);

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return {
        authenticated: false,
        error: NextResponse.json({ error: 'Token invalide' }, { status: 401 }),
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      email: user.email || '',
    };
  } catch {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 }),
    };
  }
}

// ─── Role-Based Access Control ─────────────────────────

/**
 * Verifies the user has one of the allowed CRM roles.
 * Must be called after authenticateRequest.
 */
export async function requireCrmRole(
  userId: string,
  allowedRoles: string[]
): Promise<{ authorized: boolean; role?: string; error?: NextResponse }> {
  // Demo mode in dev only — requires explicit opt-in and grants limited role
  if (userId === 'demo' && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEMO_AUTH === 'true') {
    // Grant 'agent' role in demo mode instead of 'superadmin' to limit blast radius
    const demoRole = 'agent';
    if (!allowedRoles.includes(demoRole)) {
      return { authorized: false, error: NextResponse.json({ error: 'Permission insuffisante (demo)' }, { status: 403 }) };
    }
    return { authorized: true, role: demoRole };
  }

  // Session users must still be verified against DB
  if (!isSupabaseReady()) {
    return { authorized: false, error: NextResponse.json({ error: 'Service non disponible' }, { status: 503 }) };
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const db = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) as any;

    const { data: user } = await db
      .from('users')
      .select('role')
      .eq('auth_id', userId)
      .single();

    if (!user) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Profil CRM introuvable' }, { status: 403 }),
      };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 }),
      };
    }

    return { authorized: true, role: user.role };
  } catch {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Erreur de permission' }, { status: 403 }),
    };
  }
}

// ─── Input Sanitization ────────────────────────────────

/**
 * Sanitizes a string to prevent XSS — HTML entity encoding + control chars removal.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove null bytes and other control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Sanitizes input with length limit — prevents oversized payloads.
 */
export function sanitizeField(input: string, maxLength = 500): string {
  return sanitizeInput(input.slice(0, maxLength));
}

// ─── Email Validation ──────────────────────────────────

/**
 * Validates email format with stricter regex + length check.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254 || email.length < 5) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
  return re.test(email);
}

/**
 * Block known disposable/temporary email providers.
 */
const BLOCKED_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.net',
  'sharklasers.com', 'grr.la', 'mailinator.com', 'maildrop.cc',
  'yopmail.com', 'yopmail.fr', 'throwaway.email', 'getnada.com',
  'trashmail.com', 'trashmail.net', 'mailnesia.com', 'tempail.com',
  'mohmal.com', 'discard.email', 'fakeinbox.com', '10minutemail.com',
  'minutemail.com', 'temp-mail.io', 'burnermail.io', 'dropmail.me',
  'mailsac.com', 'spambox.us', 'example.com', 'example.org',
  'test.com', 'test.org', 'fake.com', 'noemail.com', 'invalid.com',
  'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'bccto.me',
  'dispostable.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return true;
  if (/\b(test|temp|fake|spam|trash|junk|throw|dispos|jetable)\b/i.test(domain)) return true;
  return false;
}

// ─── Rate Limiting ─────────────────────────────────────

/**
 * Enhanced in-memory rate limiter.
 * Uses composite key (IP + optional route) for per-endpoint limiting.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  req: NextRequest,
  maxRequests = 30,
  windowMs = 60000,
  routeKey?: string
): { allowed: boolean; remaining?: number; error?: NextResponse } {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  // Composite key: IP + route for per-endpoint limits
  const key = routeKey ? `${ip}:${routeKey}` : ip;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      error: NextResponse.json(
        { error: 'Trop de requetes. Reessayez dans un moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true, remaining };
}

// Cleanup expired rate limit entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }, 300000);
}

// ─── Origin / CSRF Validation ──────────────────────────

/**
 * Validates the request origin for CSRF protection.
 * MUST be called on all state-changing (POST/PUT/DELETE) endpoints.
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const allowed = getAllowedOrigins();

  // If origin header is present, it must match
  if (origin) return allowed.some(o => origin.startsWith(o));

  // If referer is present (fallback), it must match
  if (referer) return allowed.some(o => referer.startsWith(o));

  // No origin AND no referer: reject for mutating requests.
  // Legitimate browser POST/PUT/DELETE always include origin or referer.
  // Only same-origin GET can omit both — and GET should not mutate state.
  return false;
}

/**
 * Combined security check for authenticated CRM API routes.
 * Validates origin + auth + optional role in one call.
 */
export async function secureCrmRoute(
  req: NextRequest,
  options: {
    allowedRoles?: string[];
    rateLimit?: { max: number; windowMs?: number };
    skipOriginCheck?: boolean;
  } = {}
): Promise<{
  authorized: boolean;
  userId?: string;
  email?: string;
  role?: string;
  error?: NextResponse;
}> {
  // 1. Rate limit
  if (options.rateLimit) {
    const rl = checkRateLimit(req, options.rateLimit.max, options.rateLimit.windowMs);
    if (!rl.allowed) return { authorized: false, error: rl.error };
  }

  // 2. Origin check for mutating requests
  const method = req.method.toUpperCase();
  if (!options.skipOriginCheck && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!validateOrigin(req)) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 }),
      };
    }
  }

  // 3. Authentication
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return { authorized: false, error: auth.error };

  // 4. Role check (optional)
  if (options.allowedRoles && auth.userId) {
    const roleCheck = await requireCrmRole(auth.userId, options.allowedRoles);
    if (!roleCheck.authorized) return { authorized: false, error: roleCheck.error };
    return { authorized: true, userId: auth.userId, email: auth.email, role: roleCheck.role };
  }

  return { authorized: true, userId: auth.userId, email: auth.email };
}

/**
 * Validates and returns CORS headers for public endpoints.
 * Restricts to known origins instead of wildcard.
 */
export function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = getAllowedOrigins();
  const matchedOrigin = allowed.find(o => origin.startsWith(o));

  // Only reflect matched origin; never fall back to a default origin
  // when the request origin does not match any allowed origin
  if (!matchedOrigin) {
    return {
      'Access-Control-Allow-Origin': '',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }

  return {
    'Access-Control-Allow-Origin': matchedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/**
 * Validates that a string contains only expected characters.
 * For UUIDs, slugs, status values, etc.
 */
export function isValidSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]?$/.test(value);
}

export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isValidStatus(value: string, allowed: string[]): boolean {
  return allowed.includes(value);
}
