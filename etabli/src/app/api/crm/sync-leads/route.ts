// ========================================================
// SOS Hub Canada — API: Sync Leads → Clients
// Finds leads without corresponding client records and creates them.
// Called by: cron-sync (hourly), manual "Synchroniser" button (admin)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, requireCrmRole } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cron authorization (same as cron-sync) : Vercel cron header non
// spoofable OU Bearer CRON_SECRET (backup + dev)
function isCronAuthorized(req: NextRequest): boolean {
  if (req.headers.get('x-vercel-cron') === '1') return true;
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  return process.env.NODE_ENV === 'development';
}

/**
 * POST: Sync orphaned leads → clients (admin or cron only)
 *
 * Finds all leads whose email doesn't exist in the clients table,
 * then creates a client record for each one.
 *
 * Returns: { synced: number, skipped: number, errors: number, details: [] }
 */
export async function POST(req: NextRequest) {
  // Auth: either cron secret OR authenticated admin
  const isCron = isCronAuthorized(req);

  if (!isCron) {
    try {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated) return auth.error!;
      const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice']);
      if (!roleCheck.authorized) return roleCheck.error!;
    } catch {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const db = createServiceClient() as any;
    const results = { synced: 0, skipped: 0, errors: 0, alreadyExist: 0, details: [] as string[] };

    // 1. Get all leads
    const { data: leads, error: leadsErr } = await db
      .from('leads')
      .select('id, email, name, phone, source, form_data, subject, message, created_at, status')
      .order('created_at', { ascending: true });

    if (leadsErr) {
      return NextResponse.json({ error: 'Erreur lecture leads: ' + leadsErr.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ ...results, message: 'Aucun lead trouvé' });
    }

    // 2. Get all client emails for comparison
    const { data: clientEmails, error: clientErr } = await db
      .from('clients')
      .select('email');

    if (clientErr) {
      return NextResponse.json({ error: 'Erreur lecture clients: ' + clientErr.message }, { status: 500 });
    }

    const existingEmails = new Set(
      (clientEmails || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean)
    );

    // 3. Find orphaned leads (email not in clients table)
    const orphanedLeads = leads.filter(
      (l: any) => l.email && !existingEmails.has(l.email.toLowerCase())
    );

    // Deduplicate by email (keep earliest lead per email)
    const seenEmails = new Set<string>();
    const uniqueOrphans = orphanedLeads.filter((l: any) => {
      const email = l.email.toLowerCase();
      if (seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    results.skipped = orphanedLeads.length - uniqueOrphans.length;
    results.alreadyExist = leads.length - orphanedLeads.length;

    // 4. Create client records for orphaned leads
    for (const lead of uniqueOrphans) {
      try {
        const nameParts = (lead.name || '').split(' ');
        const firstName = nameParts[0] || lead.email.split('@')[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const isFromTest = lead.source === 'admissibility_test' || lead.source === 'test_admissibilite';
        const isFromSite = ['website_contact', 'contact_form', 'site_web', 'exit_popup_homepage', 'lp_maghreb', 'lp_latino', 'lp_main', 'guide_immigration'].includes(lead.source);
        const clientSource = isFromTest ? 'test_admissibilite' : isFromSite ? 'site_web' : 'autre';

        const noteLines = [
          `═══ PROSPECT (sync automatique) ═══`,
          `Date lead: ${new Date(lead.created_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          `Source: ${lead.source || 'website'}`,
        ];
        if (lead.subject) noteLines.push(`Sujet: ${lead.subject}`);
        if (lead.message) noteLines.push(`Message: ${lead.message}`);
        if (lead.form_data) {
          const fd = lead.form_data;
          if (fd.results && Array.isArray(fd.results)) {
            noteLines.push('Résultats:');
            fd.results.forEach((r: any) => {
              noteLines.push(`  ${r.eligible ? '✅' : '❌'} ${r.name}: ${r.score}%`);
            });
          }
        }
        noteLines.push(`\n── Notes de suivi ──\n(Ajouter vos notes ici)`);

        const clientData: Record<string, unknown> = {
          first_name: firstName,
          last_name: lastName,
          email: lead.email.toLowerCase(),
          phone: lead.phone || null,
          status: 'prospect',
          current_status: 'prospect',
          source: clientSource,
          notes: noteLines.join('\n'),
          created_at: lead.created_at,
        };

        // Map form data fields
        const fd = lead.form_data;
        if (fd) {
          if (fd.frenchLevel) clientData.language_french = fd.frenchLevel;
          if (fd.englishLevel) clientData.language_english = fd.englishLevel;
          if (fd.education) clientData.education = fd.education;
          if (fd.workExperience) clientData.work_experience = fd.workExperience;
          if (fd.maritalStatus) clientData.marital_status = fd.maritalStatus;
        }

        const { error: insertErr } = await db
          .from('clients')
          .insert(clientData);

        if (insertErr) {
          // Duplicate email race condition — skip
          if (insertErr.code === '23505') {
            results.skipped++;
          } else {
            results.errors++;
            results.details.push(`Erreur ${lead.email}: ${insertErr.message}`);
          }
        } else {
          results.synced++;
        }
      } catch (e: any) {
        results.errors++;
        results.details.push(`Exception ${lead.email}: ${e.message}`);
      }
    }

    // 5. Also sync lead statuses: mark leads as "contacted" if their client exists and was updated
    const { error: statusErr } = await db
      .from('leads')
      .update({ status: 'contacted', updated_at: new Date().toISOString() })
      .eq('status', 'new')
      .in('email', Array.from(existingEmails).slice(0, 500));

    if (statusErr) {
      results.details.push(`Status sync warning: ${statusErr.message}`);
    }

    return NextResponse.json({
      success: true,
      ...results,
      totalLeads: leads.length,
      message: `Synchronisation terminée: ${results.synced} créés, ${results.alreadyExist} déjà existants, ${results.skipped} doublons ignorés, ${results.errors} erreurs`,
    });

  } catch (err: any) {
    console.error('[sync-leads] Exception:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
