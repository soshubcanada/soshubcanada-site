// ========================================================
// SOS Hub Canada — API: Sync Client (Supabase ↔ CRM)
// Point unique pour créer/mettre à jour un client dans Supabase
// depuis n'importe quelle source: paiement, analyse, formulaire
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { getCorsHeaders } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Rate limiting simple
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
}

/**
 * POST: Synchroniser un client dans Supabase
 *
 * Body:
 *   email (string, required) — clé de recherche unique
 *   firstName (string)
 *   lastName (string)
 *   phone (string)
 *   status (string) — prospect | actif | nouveau
 *   source (string) — test_admissibilite | ouverture_dossier | achat_rapport | site_web
 *   paymentType (string) — ouverture_dossier | rapport_premium
 *   paymentId (string) — Square/Stripe payment ID
 *   paymentAmount (number)
 *   formData (object) — données d'analyse immigration
 *   notes (string) — notes additionnelles
 *
 * Logique:
 *   1. Cherche le client par email dans Supabase
 *   2. Si existe → met à jour statut + notes + date contact
 *   3. Si n'existe pas → crée un nouveau client
 *   4. Retourne le client ID (pour usage downstream)
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes.' },
      { status: 429, headers: getCorsHeaders(req) }
    );
  }

  try {
    const body = await req.json();
    const {
      email, firstName, lastName, phone,
      status, source, paymentType, paymentId, paymentAmount,
      formData, notes,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // --- Supabase ---
    if (!isSupabaseReady()) {
      return NextResponse.json(
        { success: false, error: 'Base de données non configurée', clientId: null },
        { status: 503, headers: getCorsHeaders(req) }
      );
    }

    const db = createServiceClient() as any;

    // 1. Chercher le client existant par email (use limit(1) instead of single() to avoid error on duplicates)
    const { data: existingList, error: findErr } = await db
      .from('clients')
      .select('id, status, notes, first_name, last_name, phone')
      .eq('email', sanitizedEmail)
      .order('created_at', { ascending: true })
      .limit(1);

    if (findErr) {
      console.error('[sync-client] Find error:', findErr.message);
    }
    const existing = existingList?.[0] || null;

    let clientId: string | null = null;

    if (existing) {
      // --- CLIENT EXISTANT: Mettre à jour ---
      clientId = existing.id;

      const updates: Record<string, unknown> = {
        updated_at: now,
        date_dernier_contact: today,
      };

      // Mise à jour du statut (escalade seulement: prospect → actif, pas de downgrade)
      const statusPriority: Record<string, number> = {
        lead: 0, prospect: 1, nouveau: 2, actif: 3, en_traitement: 4,
      };
      const currentPriority = statusPriority[existing.status] ?? 0;
      const requestedPriority = statusPriority[status] ?? 0;
      if (status && requestedPriority > currentPriority) {
        updates.status = status;
        updates.current_status = status;
      }

      // Compléter les champs manquants (ne pas écraser les données existantes)
      if (firstName && !existing.first_name) updates.first_name = firstName;
      if (lastName && !existing.last_name) updates.last_name = lastName;
      if (phone && !existing.phone) updates.phone = phone;

      // Ajouter note de paiement ou d'activité
      const noteLines: string[] = [];
      if (paymentType) {
        const payLabel = paymentType === 'ouverture_dossier' ? 'Ouverture de dossier (250 $)' :
          paymentType === 'rapport_premium' ? 'Rapport premium (49,99 $)' : paymentType;
        noteLines.push(`\n\n═══ PAIEMENT REÇU ═══`);
        noteLines.push(`Date: ${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
        noteLines.push(`Type: ${payLabel}`);
        if (paymentAmount) noteLines.push(`Montant: ${paymentAmount} $`);
        if (paymentId) noteLines.push(`ID paiement: ${paymentId}`);
        updates.date_inscription = today;
      }
      if (notes) noteLines.push(`\n${notes}`);
      if (noteLines.length > 0) {
        updates.notes = (existing.notes || '') + noteLines.join('\n');
      }

      // Données d'analyse immigration
      if (formData) {
        if (formData.education) updates.education = formData.education;
        if (formData.workExperience) updates.work_experience = formData.workExperience;
        if (formData.frenchLevel) updates.language_french = formData.frenchLevel;
        if (formData.englishLevel) updates.language_english = formData.englishLevel;
        if (formData.maritalStatus) updates.marital_status = formData.maritalStatus;
        if (formData.nationality) updates.nationality = formData.nationality;
        if (formData.age && formData.age > 0) {
          const birthYear = new Date().getFullYear() - formData.age;
          updates.date_of_birth = `${birthYear}-01-01`;
        }
      }

      const { error: updateErr } = await db
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (updateErr) {
        console.error('[sync-client] Update error:', updateErr.message);
      }

    } else {
      // --- NOUVEAU CLIENT: Créer ---
      const nameParts = (firstName && lastName) ? null : (body.name || '').split(' ');
      const fName = firstName || nameParts?.[0] || '';
      const lName = lastName || nameParts?.slice(1).join(' ') || '';

      const noteLines: string[] = [`═══ NOUVEAU CLIENT ═══`];
      noteLines.push(`Date: ${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
      noteLines.push(`Source: ${source || 'website'}`);
      if (paymentType) {
        const payLabel = paymentType === 'ouverture_dossier' ? 'Ouverture de dossier (250 $)' :
          paymentType === 'rapport_premium' ? 'Rapport premium (49,99 $)' : paymentType;
        noteLines.push(`Paiement: ${payLabel}`);
        if (paymentId) noteLines.push(`ID paiement: ${paymentId}`);
      }
      if (notes) noteLines.push(`\n${notes}`);
      noteLines.push(`\n── Notes de suivi ──\n(Ajouter vos notes ici)`);

      const clientData: Record<string, unknown> = {
        first_name: fName,
        last_name: lName,
        email: sanitizedEmail,
        phone: phone || null,
        status: status || 'prospect',
        current_status: status || 'prospect',
        source: source || 'website',
        notes: noteLines.join('\n'),
        date_dernier_contact: today,
        created_at: now,
      };

      if (paymentType) {
        clientData.date_inscription = today;
      }

      // Données d'analyse immigration
      if (formData) {
        if (formData.education) clientData.education = formData.education;
        if (formData.workExperience) clientData.work_experience = formData.workExperience;
        if (formData.frenchLevel) clientData.language_french = formData.frenchLevel;
        if (formData.englishLevel) clientData.language_english = formData.englishLevel;
        if (formData.maritalStatus) clientData.marital_status = formData.maritalStatus;
        if (formData.nationality) clientData.nationality = formData.nationality;
        if (formData.age && formData.age > 0) {
          const birthYear = new Date().getFullYear() - formData.age;
          clientData.date_of_birth = `${birthYear}-01-01`;
        }
      }

      const { data: newClient, error: insertErr } = await db
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();

      if (insertErr) {
        console.error('[sync-client] Insert error:', insertErr.message);
        return NextResponse.json(
          { success: false, error: 'Erreur création client', clientId: null },
          { status: 500, headers: getCorsHeaders(req) }
        );
      }

      clientId = newClient?.id;
    }

    return NextResponse.json(
      {
        success: true,
        clientId,
        isNew: !existing,
        message: existing ? 'Client mis à jour' : 'Nouveau client créé',
      },
      { status: 200, headers: getCorsHeaders(req) }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('[sync-client] Exception:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}
