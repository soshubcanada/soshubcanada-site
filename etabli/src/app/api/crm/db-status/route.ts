// ========================================================
// SOS Hub Canada — API: Database Status & Recovery
// Diagnostic endpoint for admins to check DB health,
// verify data counts, and recover lost data.
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, requireCrmRole } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Admin only
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;
    const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice']);
    if (!roleCheck.authorized) return roleCheck.error!;
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({
      status: 'error',
      supabaseConfigured: false,
      message: 'Supabase non configuré',
    }, { status: 503 });
  }

  try {
    const db = createServiceClient() as any;

    // Run all counts in parallel
    const [
      { count: clientCount, error: cErr },
      { count: caseCount, error: csErr },
      { count: leadCount, error: lErr },
      { count: appointmentCount, error: aErr },
      { count: contractCount, error: ctErr },
      { count: userCount, error: uErr },
    ] = await Promise.all([
      db.from('clients').select('*', { count: 'exact', head: true }),
      db.from('cases').select('*', { count: 'exact', head: true }),
      db.from('leads').select('*', { count: 'exact', head: true }),
      db.from('appointments').select('*', { count: 'exact', head: true }),
      db.from('contracts').select('*', { count: 'exact', head: true }),
      db.from('users').select('*', { count: 'exact', head: true }),
    ]);

    // Get recent clients (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentClients, error: rcErr } = await db
      .from('clients')
      .select('id, first_name, last_name, email, status, source, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent leads (last 7 days)
    const { data: recentLeads, error: rlErr } = await db
      .from('leads')
      .select('id, email, name, source, status, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    // Check orphaned leads (leads without matching clients)
    const { data: allLeads } = await db.from('leads').select('email');
    const { data: allClientEmails } = await db.from('clients').select('email');

    const clientEmailSet = new Set(
      (allClientEmails || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean)
    );
    const orphanedLeadCount = (allLeads || []).filter(
      (l: any) => l.email && !clientEmailSet.has(l.email.toLowerCase())
    ).length;

    // Check for errors in any query
    const errors = [cErr, csErr, lErr, aErr, ctErr, uErr, rcErr, rlErr].filter(Boolean);

    return NextResponse.json({
      status: errors.length > 0 ? 'partial' : 'healthy',
      supabaseConfigured: true,
      timestamp: new Date().toISOString(),
      counts: {
        clients: clientCount ?? 0,
        cases: caseCount ?? 0,
        leads: leadCount ?? 0,
        appointments: appointmentCount ?? 0,
        contracts: contractCount ?? 0,
        users: userCount ?? 0,
      },
      orphanedLeads: orphanedLeadCount,
      recentClients: recentClients || [],
      recentLeads: recentLeads || [],
      errors: errors.map((e: any) => e?.message),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err?.message || 'Erreur serveur',
    }, { status: 500 });
  }
}
