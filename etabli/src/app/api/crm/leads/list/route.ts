// ========================================================
// SOS Hub Canada - Internal API: List leads (server-side, no auth)
// Used by CRM frontend to display leads dashboard
// Protected by same-origin check + service role (server-side only)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
  // Basic same-origin protection: check referer/origin
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const allowedOrigins = [
    'https://soshubca.vercel.app',
    'https://crm.soshub.ca',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  const isAllowed = allowedOrigins.some(o => origin.startsWith(o)) || !origin; // server-side fetches have no origin
  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isSupabaseReady()) {
    // Return empty array if Supabase not configured (demo mode)
    return NextResponse.json([]);
  }

  try {
    const db = createServiceClient() as any;
    const status = req.nextUrl.searchParams.get('status');

    // Try leads table first
    let query = db.from('leads').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query.limit(200);

    if (error) {
      // Fallback: get prospects from clients table
      const { data: clients, error: cErr } = await db
        .from('clients')
        .select('id, first_name, last_name, email, phone, source, status, notes, created_at')
        .in('status', ['prospect', 'lead'])
        .order('created_at', { ascending: false })
        .limit(200);

      if (cErr) return NextResponse.json([]);

      // Map clients to lead-like format
      const mapped = (clients || []).map((c: any) => ({
        id: c.id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        email: c.email,
        phone: c.phone,
        source: c.source || 'website',
        status: c.status === 'prospect' ? 'new' : c.status,
        created_at: c.created_at,
        form_data: null,
      }));
      return NextResponse.json(mapped);
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}
