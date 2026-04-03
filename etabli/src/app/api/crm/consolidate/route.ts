// ========================================================
// SOS Hub Canada — API: Consolidate Duplicates
// Finds and merges duplicate leads/clients by email.
// Keeps the OLDEST record as primary, merges data from newer ones.
// Admin only.
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { authenticateRequest, requireCrmRole } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST: Consolidate duplicate records
 * Body: { dryRun?: boolean } — if true, only report duplicates (don't merge)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;
    const roleCheck = await requireCrmRole(auth.userId!, ['superadmin']);
    if (!roleCheck.authorized) return roleCheck.error!;
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* empty body OK */ }
  const dryRun = body.dryRun !== false; // Default to dry run for safety

  try {
    const db = createServiceClient() as any;
    const results = {
      dryRun,
      leads: { duplicateGroups: 0, merged: 0, deleted: 0, details: [] as string[] },
      clients: { duplicateGroups: 0, merged: 0, deleted: 0, details: [] as string[] },
    };

    // ============================================================
    // 1. CONSOLIDATE LEADS — merge by email
    // ============================================================
    const { data: allLeads } = await db
      .from('leads')
      .select('id, email, name, phone, source, form_data, subject, message, status, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (allLeads && allLeads.length > 0) {
      // Group leads by email (lowercase)
      const leadsByEmail = new Map<string, any[]>();
      for (const lead of allLeads) {
        const email = lead.email?.toLowerCase();
        if (!email) continue;
        if (!leadsByEmail.has(email)) leadsByEmail.set(email, []);
        leadsByEmail.get(email)!.push(lead);
      }

      for (const [email, leads] of leadsByEmail) {
        if (leads.length <= 1) continue;
        results.leads.duplicateGroups++;

        // Keep the oldest lead (first created), merge data from others
        const primary = leads[0]; // oldest
        const duplicates = leads.slice(1);

        // Merge sources
        const allSources = leads.map((l: any) => l.source).filter(Boolean);
        const mergedSource = [...new Set(allSources)].join(', ');

        // Merge form data (all fields, newer takes priority)
        let mergedFormData = primary.form_data || {};
        for (const dup of duplicates) {
          if (dup.form_data) mergedFormData = { ...mergedFormData, ...dup.form_data };
        }

        // Merge other fields (fill blanks from any record)
        const mergedName = leads.find((l: any) => l.name && l.name.length > 2)?.name || primary.name;
        const mergedPhone = leads.find((l: any) => l.phone)?.phone || primary.phone;
        const mergedSubject = [...new Set(leads.map((l: any) => l.subject).filter(Boolean))].join(' | ');

        // Best status (prefer contacted/qualified over new)
        const statusOrder: Record<string, number> = { new: 0, stale: 0, contacted: 1, qualified: 2, converted: 3 };
        const bestStatus = leads.reduce((best: string, l: any) => {
          return (statusOrder[l.status] ?? 0) > (statusOrder[best] ?? 0) ? l.status : best;
        }, primary.status);

        results.leads.details.push(
          `${email}: ${leads.length} leads → merged (sources: ${mergedSource})`
        );

        if (!dryRun) {
          // Update primary lead with merged data
          await db.from('leads').update({
            source: mergedSource,
            name: mergedName,
            phone: mergedPhone,
            subject: mergedSubject.slice(0, 2000),
            form_data: Object.keys(mergedFormData).length > 0 ? mergedFormData : null,
            status: bestStatus,
            updated_at: new Date().toISOString(),
          }).eq('id', primary.id);

          // Delete duplicate leads
          const dupIds = duplicates.map((d: any) => d.id);
          const { error: delErr } = await db.from('leads').delete().in('id', dupIds);
          if (!delErr) {
            results.leads.merged++;
            results.leads.deleted += dupIds.length;
          }
        } else {
          results.leads.merged++;
          results.leads.deleted += duplicates.length;
        }
      }
    }

    // ============================================================
    // 2. CONSOLIDATE CLIENTS — merge by email
    // ============================================================
    const { data: allClients } = await db
      .from('clients')
      .select('id, email, first_name, last_name, phone, status, current_status, source, notes, language_french, language_english, education, work_experience, marital_status, nationality, created_at, updated_at, assigned_to')
      .order('created_at', { ascending: true });

    if (allClients && allClients.length > 0) {
      const clientsByEmail = new Map<string, any[]>();
      for (const client of allClients) {
        const email = client.email?.toLowerCase();
        if (!email) continue;
        if (!clientsByEmail.has(email)) clientsByEmail.set(email, []);
        clientsByEmail.get(email)!.push(client);
      }

      for (const [email, clients] of clientsByEmail) {
        if (clients.length <= 1) continue;
        results.clients.duplicateGroups++;

        // Keep the oldest client (first created), merge data from others
        const primary = clients[0];
        const duplicates = clients.slice(1);

        // Merge: fill blank fields from any record, keep existing values
        const mergedData: Record<string, any> = {};
        const fields = ['first_name', 'last_name', 'phone', 'source', 'language_french',
          'language_english', 'education', 'work_experience', 'marital_status', 'nationality', 'assigned_to'];

        for (const field of fields) {
          // Use primary's value, or first non-empty from duplicates
          mergedData[field] = primary[field] ||
            clients.find((c: any) => c[field])?.[ field] || null;
        }

        // Merge sources
        const allSources = clients.map((c: any) => c.source).filter(Boolean);
        mergedData.source = [...new Set(allSources.flatMap((s: string) => s.split(',').map((x: string) => x.trim())))].join(', ');

        // Merge notes (combine all unique notes, separated by divider)
        const allNotes = clients.map((c: any) => c.notes).filter(Boolean);
        if (allNotes.length > 1) {
          // Deduplicate notes by checking if the core content is already in the primary
          const primaryNotes = primary.notes || '';
          const newNotes = allNotes.slice(1).filter((n: string) => {
            // Check if this note's first line is already in primary notes
            const firstLine = n.split('\n')[0];
            return !primaryNotes.includes(firstLine);
          });
          if (newNotes.length > 0) {
            mergedData.notes = primaryNotes + '\n\n' + newNotes.join('\n\n');
          }
        }

        // Best status (highest priority wins)
        const statusPriority: Record<string, number> = {
          lead: 0, prospect: 1, nouveau: 2, actif: 3, en_traitement: 4
        };
        const bestStatus = clients.reduce((best: string, c: any) => {
          return (statusPriority[c.status] ?? 0) > (statusPriority[best] ?? 0) ? c.status : best;
        }, primary.status);
        mergedData.status = bestStatus;
        mergedData.current_status = bestStatus;

        results.clients.details.push(
          `${email}: ${clients.length} clients → merged (status: ${bestStatus})`
        );

        if (!dryRun) {
          // Update primary client with merged data
          mergedData.updated_at = new Date().toISOString();
          await db.from('clients').update(mergedData).eq('id', primary.id);

          // Reassign related records from duplicates to primary
          const dupIds = duplicates.map((d: any) => d.id);
          for (const dupId of dupIds) {
            // Move cases
            await db.from('cases').update({ client_id: primary.id }).eq('client_id', dupId);
            // Move appointments
            await db.from('appointments').update({ client_id: primary.id }).eq('client_id', dupId);
            // Move contracts
            await db.from('contracts').update({ client_id: primary.id }).eq('client_id', dupId);
            // Move documents
            await db.from('client_documents').update({ client_id: primary.id }).eq('client_id', dupId);
            // Move family members
            await db.from('family_members').update({ client_id: primary.id }).eq('client_id', dupId);
          }

          // Delete duplicate clients
          const { error: delErr } = await db.from('clients').delete().in('id', dupIds);
          if (!delErr) {
            results.clients.merged++;
            results.clients.deleted += dupIds.length;
          } else {
            results.clients.details.push(`⚠️ Delete error for ${email}: ${delErr.message}`);
          }
        } else {
          results.clients.merged++;
          results.clients.deleted += duplicates.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: dryRun
        ? `Simulation: ${results.leads.duplicateGroups} groupes de leads en double, ${results.clients.duplicateGroups} groupes de clients en double trouvés. Relancez avec dryRun: false pour consolider.`
        : `Consolidation terminée: ${results.leads.deleted} leads et ${results.clients.deleted} clients en double supprimés.`,
    });
  } catch (err: any) {
    console.error('[consolidate] Error:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
