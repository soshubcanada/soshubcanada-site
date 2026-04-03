// ========================================================
// SOS Hub Canada - API: Leads from website
// POST: receive leads from website forms (admissibility, contact, CRS)
// GET: list leads for CRM dashboard
// PUT: update lead status
//
// DEDUP: Same email within 24h → MERGE (update existing lead, not create new)
// CLIENT: Same email → UPDATE existing client (never create duplicate)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseReady } from '@/lib/supabase';
import { getCorsHeaders, validateOrigin, authenticateRequest, requireCrmRole } from '@/lib/api-auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Format form data for readable notes
function formatFormData(data: any): string {
  if (!data) return '';
  const labels: Record<string, string> = {
    age: 'Âge', education: 'Éducation', workExperience: 'Expérience travail',
    canadianExperience: 'Expérience canadienne', frenchLevel: 'Français',
    englishLevel: 'Anglais', destination: 'Destination', jobOffer: 'Offre emploi',
    familyInCanada: 'Famille au Canada', maritalStatus: 'Statut matrimonial',
    funds: 'Fonds disponibles',
  };
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === 'results' && Array.isArray(value)) {
      lines.push('Résultats:');
      (value as any[]).forEach((r: any) => {
        lines.push(`  ${r.eligible ? '✅' : '❌'} ${r.name}: ${r.score}%`);
      });
    } else if (typeof value === 'string' || typeof value === 'number') {
      lines.push(`${labels[key] || key}: ${value}`);
    }
  }
  return lines.join('\n');
}

// Rate limiting for public endpoint
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkPublicRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false; // 10 submissions/minute
  entry.count++;
  return true;
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
}

// POST: Receive lead from website (public - no auth required)
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkPublicRate(ip)) {
    return NextResponse.json(
      { error: 'Trop de soumissions. Veuillez patienter.' },
      { status: 429, headers: getCorsHeaders(req) }
    );
  }

  try {
    const body = await req.json();
    const { source, email, phone, subject, message, formData } = body;
    // Accept 'name' from multiple possible field names (landing pages use different formats)
    const name = body.name || body.nom || body.full_name || (email ? email.split('@')[0] : '');

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Anti-spam: Block disposable email domains (server-side)
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const blockedDomains = new Set([
      'tempmail.com','temp-mail.org','guerrillamail.com','guerrillamail.net','sharklasers.com',
      'grr.la','mailinator.com','maildrop.cc','yopmail.com','yopmail.fr','throwaway.email',
      'getnada.com','trashmail.com','trashmail.net','mailnesia.com','tempail.com',
      'mohmal.com','discard.email','fakeinbox.com','10minutemail.com','minutemail.com',
      'temp-mail.io','burnermail.io','dropmail.me','mailsac.com','spambox.us',
      'example.com','example.org','test.com','test.org','fake.com','noemail.com','invalid.com',
      'guerrillamailblock.com','pokemail.net','spam4.me','bccto.me','dispostable.com',
    ]);
    const isBlocked = emailDomain && (
      blockedDomains.has(emailDomain) ||
      /\b(test|temp|fake|spam|trash|junk|throw|dispos|jetable)\b/i.test(emailDomain)
    );
    if (isBlocked) {
      return NextResponse.json(
        { error: 'Les adresses courriel temporaires ou de test ne sont pas acceptées.' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Anti-spam: Block honeypot field
    if (body.website_url) {
      // Bot detected — silently accept (don't save)
      return NextResponse.json({ success: true, id: 'filtered' }, { status: 200, headers: getCorsHeaders(req) });
    }

    // Anti-spam: Name validation (skip if name is auto-derived from email)
    if (name && name.includes('@') === false && (/https?:\/\/|www\.|<script/i.test(name))) {
      return NextResponse.json(
        { error: 'Nom invalide' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Sanitize inputs
    const sanitize = (s: string) => s?.replace(/[<>]/g, '').trim().slice(0, 2000) || '';

    // Normalize form data from different landing page formats
    const normalizedFormData = formData || {};
    if (body.age_range && !normalizedFormData.age) normalizedFormData.age = body.age_range;
    if (body.education && !normalizedFormData.education) normalizedFormData.education = body.education;
    if (body.experience && !normalizedFormData.workExperience) normalizedFormData.workExperience = body.experience;
    if (body.french_level && !normalizedFormData.frenchLevel) normalizedFormData.frenchLevel = body.french_level;
    if (body.english_level && !normalizedFormData.englishLevel) normalizedFormData.englishLevel = body.english_level;
    if (body.referral) normalizedFormData.referral = body.referral;
    if (body.interest) normalizedFormData.interest = body.interest;

    const lead = {
      source: sanitize(source || body.interest || 'website'),
      name: sanitize(name || ''),
      email: sanitize(email).toLowerCase(),
      phone: sanitize(phone || body.telephone || ''),
      subject: sanitize(subject || ''),
      message: sanitize(message || ''),
      form_data: Object.keys(normalizedFormData).length > 0 ? normalizedFormData : null,
      status: 'new',
      ip_address: ip,
      created_at: new Date().toISOString(),
    };

    // Try to save to Supabase if configured
    if (isSupabaseReady()) {
      try {
        const db = createServiceClient() as any;

        // ============================================================
        // DEDUP CHECK: Same email within 24h → MERGE into existing lead
        // ============================================================
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentLead } = await db
          .from('leads')
          .select('id, source, form_data, name, phone, subject, message')
          .eq('email', lead.email)
          .gte('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        let leadId: string | null = null;

        if (recentLead) {
          // ── MERGE: Update existing lead with new data ──
          leadId = recentLead.id;

          // Merge sources (track all sources this person came from)
          const existingSources = (recentLead.source || '').split(',').map((s: string) => s.trim());
          if (!existingSources.includes(lead.source)) {
            existingSources.push(lead.source);
          }
          const mergedSource = [...new Set(existingSources.filter(Boolean))].join(', ');

          // Merge form data (new data takes priority, but keep old fields)
          const mergedFormData = { ...(recentLead.form_data || {}), ...(lead.form_data || {}) };

          // Merge other fields (fill blanks, don't overwrite)
          const mergedName = lead.name || recentLead.name || '';
          const mergedPhone = lead.phone || recentLead.phone || '';
          const mergedSubject = [recentLead.subject, lead.subject].filter(Boolean).join(' | ');
          const mergedMessage = [recentLead.message, lead.message].filter(Boolean).join('\n---\n');

          await db.from('leads').update({
            source: mergedSource,
            name: mergedName,
            phone: mergedPhone,
            subject: mergedSubject.slice(0, 2000),
            message: mergedMessage.slice(0, 4000),
            form_data: Object.keys(mergedFormData).length > 0 ? mergedFormData : null,
            updated_at: new Date().toISOString(),
          }).eq('id', leadId);

          console.log(`[leads] DEDUP: Merged lead ${lead.email} (source: ${lead.source}) into existing lead ${leadId}`);
        } else {
          // ── NEW LEAD: Insert fresh record ──
          const { data: leadData, error: insertError } = await db
            .from('leads')
            .insert({ ...lead, tag: 'prospect' })
            .select('id')
            .single();

          leadId = leadData?.id;

          if (insertError) {
            // Fallback: try without tag column
            const { data: fallbackLead } = await db
              .from('leads')
              .insert(lead)
              .select('id')
              .single();
            leadId = fallbackLead?.id;
          }
        }

        // ============================================================
        // CLIENT UPSERT: Find by email → update OR create (never duplicate)
        // ============================================================
        const nameParts = lead.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Detect source for CRM tagging
        const isFromTest = lead.source === 'admissibility_test' || lead.source === 'test_admissibilite';
        const isFromSite = ['website_contact', 'contact_form', 'site_web', 'exit_popup_homepage',
          'exit_popup_maghreb', 'exit_popup_latino', 'lp_maghreb', 'lp_latino', 'lp_main',
          'guide_immigration', 'hero_form', 'newsletter'].includes(lead.source);
        const clientSource = isFromTest ? 'test_admissibilite' : isFromSite ? 'site_web' : 'autre';

        const initialNote = `═══ NOUVEAU PROSPECT ═══\n` +
          `Date: ${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` +
          `Source: ${lead.source}\n` +
          `${lead.subject ? `Sujet: ${lead.subject}\n` : ''}` +
          `${lead.message ? `Message: ${lead.message}\n` : ''}` +
          `${lead.form_data ? `\n── Données du formulaire ──\n${formatFormData(lead.form_data)}\n` : ''}` +
          `\n── Notes de suivi ──\n(Ajouter vos notes ici)\n`;

        // Check if client already exists by email
        const { data: existingClient } = await db
          .from('clients')
          .select('id, notes, status, first_name, last_name, phone, language_french, language_english, education, work_experience, marital_status, source')
          .eq('email', lead.email)
          .limit(1)
          .single();

        let clientId = existingClient?.id;

        if (existingClient) {
          // ── UPDATE existing client — enrich data, never overwrite ──
          const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            date_dernier_contact: new Date().toISOString().split('T')[0],
          };

          // Fill blank fields only (never overwrite existing data)
          if (firstName && !existingClient.first_name) updates.first_name = firstName;
          if (lastName && !existingClient.last_name) updates.last_name = lastName;
          if (lead.phone && !existingClient.phone) updates.phone = lead.phone;
          if (lead.form_data?.frenchLevel && !existingClient.language_french) updates.language_french = lead.form_data.frenchLevel;
          if (lead.form_data?.englishLevel && !existingClient.language_english) updates.language_english = lead.form_data.englishLevel;
          if (lead.form_data?.education && !existingClient.education) updates.education = lead.form_data.education;
          if (lead.form_data?.workExperience && !existingClient.work_experience) updates.work_experience = lead.form_data.workExperience;
          if (lead.form_data?.maritalStatus && !existingClient.marital_status) updates.marital_status = lead.form_data.maritalStatus;

          // Track all sources
          const existingSrc = existingClient.source || '';
          if (clientSource && !existingSrc.includes(clientSource)) {
            updates.source = existingSrc ? `${existingSrc}, ${clientSource}` : clientSource;
          }

          // Escalate status only (lead → prospect, never downgrade)
          const statusPriority: Record<string, number> = { lead: 0, prospect: 1, nouveau: 2, actif: 3, en_traitement: 4 };
          if ((statusPriority[existingClient.status] ?? 5) < (statusPriority['prospect'] ?? 0)) {
            updates.status = 'prospect';
            updates.current_status = 'prospect';
          }

          // Append note only if this is a new source (avoid duplicate notes from dedup)
          if (!recentLead) {
            const updatedNotes = (existingClient.notes || '') + '\n\n' + initialNote;
            updates.notes = updatedNotes;
          }

          await db.from('clients').update(updates).eq('id', clientId);
          console.log(`[leads] Client ${lead.email} updated (existing ID: ${clientId})`);
        } else {
          // ── CREATE new client as prospect ──
          const { data: newClient, error: clientError } = await db.from('clients').insert({
            first_name: firstName,
            last_name: lastName,
            email: lead.email,
            phone: lead.phone,
            status: 'prospect',
            source: clientSource,
            notes: initialNote,
            current_status: 'prospect',
            language_french: lead.form_data?.frenchLevel || null,
            language_english: lead.form_data?.englishLevel || null,
            education: lead.form_data?.education || null,
            work_experience: lead.form_data?.workExperience || null,
            marital_status: lead.form_data?.maritalStatus || null,
          }).select('id').single();

          if (clientError) {
            // Handle race condition: another request created this client simultaneously
            if (clientError.code === '23505') {
              // Unique constraint violation — client was just created, fetch it
              const { data: raceClient } = await db
                .from('clients')
                .select('id')
                .eq('email', lead.email)
                .single();
              clientId = raceClient?.id;
              console.log(`[leads] Race condition resolved for ${lead.email} → ${clientId}`);
            } else {
              console.error('[leads] Client create error:', clientError.message);
            }
          } else {
            clientId = newClient?.id;
            console.log(`[leads] New client created: ${lead.email} → ${clientId}`);
          }
        }

        // ============================================================
        // FOLLOW-UP TASK: Only create if this is the FIRST lead (not a dedup merge)
        // ============================================================
        if (clientId && !recentLead) {
          const dueDate = new Date();
          dueDate.setHours(dueDate.getHours() + 24);

          const taskData = {
            client_id: clientId,
            lead_id: leadId || null,
            title: `📞 Suivi prospect: ${lead.name}`,
            description: `Contacter ${lead.name} (${lead.email}${lead.phone ? ', ' + lead.phone : ''}).\n` +
              `Source: ${lead.source}\n` +
              `${lead.form_data?.results ? `Programmes éligibles: ${lead.form_data.results.filter((r: any) => r.eligible).map((r: any) => r.name).join(', ')}` : ''}`,
            status: 'pending',
            priority: 'high',
            due_date: dueDate.toISOString(),
            created_at: new Date().toISOString(),
          };

          const { error: taskError } = await db.from('tasks').insert(taskData);
          if (taskError) {
            // Fallback: create timeline event instead
            if (clientId) {
              const { data: existingCase } = await db
                .from('cases')
                .select('id')
                .eq('client_id', clientId)
                .single();

              if (existingCase?.id) {
                await db.from('timeline_events').insert({
                  case_id: existingCase.id,
                  date: new Date().toISOString(),
                  type: 'task',
                  description: `[TÂCHE] ${taskData.title} — ${taskData.description}`,
                });
              }
            }
          }
        }

      } catch (dbErr) {
        console.error('[leads] DB error:', dbErr);
      }
    }

    // Always return success (even if DB fails - don't expose internal errors)
    return NextResponse.json(
      { success: true, message: 'Votre demande a été reçue. Nous vous contacterons sous 24h.' },
      { status: 200, headers: getCorsHeaders(req) }
    );
  } catch (err: any) {
    console.error('[leads] API error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// GET: List leads (authenticated CRM users only)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;
    const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice', 'receptionniste']);
    if (!roleCheck.authorized) return roleCheck.error!;
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const db = createServiceClient() as any;
    const status = req.nextUrl.searchParams.get('status');

    let query = db.from('leads').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query.limit(200);
    if (error) {
      const { data: clients, error: cErr } = await db
        .from('clients')
        .select('*')
        .eq('status', 'lead')
        .order('created_at', { ascending: false })
        .limit(200);
      if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
      return NextResponse.json(clients || []);
    }
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update lead status (authenticated)
export async function PUT(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) return auth.error!;
    const roleCheck = await requireCrmRole(auth.userId!, ['superadmin', 'coordinatrice', 'receptionniste', 'conseiller']);
    if (!roleCheck.authorized) return roleCheck.error!;
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    const { leadId, status, assignedTo, notes } = await req.json();
    if (!leadId) {
      return NextResponse.json({ error: 'leadId requis' }, { status: 400 });
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const db = createServiceClient() as any;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assignedTo) updates.assigned_to = assignedTo;
    if (notes) updates.notes = notes;

    const { error } = await db.from('leads').update(updates).eq('id', leadId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
