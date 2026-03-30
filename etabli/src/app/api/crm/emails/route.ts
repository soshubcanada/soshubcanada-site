// ========================================================
// SOS Hub Canada - Internal API: Email logs
// GET: fetch sent emails from emails_sent table
// Used by CRM dashboard + client detail for email tracking
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, checkRateLimit } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: NextRequest) {
  // Rate limit: 30 requests/min
  const rl = checkRateLimit(req, 30, 60000, 'emails');
  if (!rl.allowed) return rl.error!;

  // Authentication required — CRM internal data
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return auth.error!;

  if (!isSupabaseReady()) {
    return NextResponse.json({ emails: [], total: 0 });
  }

  try {
    const db = createServiceClient() as any;
    const clientId = req.nextUrl.searchParams.get('client_id');
    const type = req.nextUrl.searchParams.get('type');
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    let query = db
      .from('emails_sent')
      .select('*, clients!emails_sent_client_id_fkey(first_name, last_name, email)', { count: 'exact' })
      .order('sent_at', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);
    if (type) query = query.eq('type', type);

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      // Fallback: try without join
      let fallbackQuery = db
        .from('emails_sent')
        .select('*', { count: 'exact' })
        .order('sent_at', { ascending: false });

      if (clientId) fallbackQuery = fallbackQuery.eq('client_id', clientId);
      if (type) fallbackQuery = fallbackQuery.eq('type', type);

      const { data: fallbackData, error: fallbackErr, count: fallbackCount } = await fallbackQuery.range(offset, offset + limit - 1);

      if (fallbackErr) {
        return NextResponse.json({ emails: [], total: 0, error: fallbackErr.message });
      }

      return NextResponse.json({
        emails: (fallbackData || []).map((e: any) => ({
          id: e.id,
          clientId: e.client_id,
          clientName: null,
          toEmail: e.to_email,
          subject: e.subject,
          type: e.type,
          sentBy: e.sent_by,
          sentAt: e.sent_at,
        })),
        total: fallbackCount || 0,
      });
    }

    const emails = (data || []).map((e: any) => ({
      id: e.id,
      clientId: e.client_id,
      clientName: e.clients
        ? `${e.clients.first_name || ''} ${e.clients.last_name || ''}`.trim()
        : null,
      toEmail: e.to_email,
      subject: e.subject,
      type: e.type,
      sentBy: e.sent_by,
      sentAt: e.sent_at,
    }));

    return NextResponse.json({ emails, total: count || 0 });
  } catch {
    return NextResponse.json({ emails: [], total: 0 });
  }
}
