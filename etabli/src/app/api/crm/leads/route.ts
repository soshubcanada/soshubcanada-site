// ========================================================
// SOS Hub Canada - API: Leads from website
// POST: receive leads from website forms (admissibility, contact, CRS)
// GET: list leads for CRM dashboard
// PUT: update lead status
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
    const { source, name, email, phone, subject, message, formData } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Nom et email requis' },
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

    // Anti-spam: Name validation
    if (name.length < 2 || /https?:\/\/|www\.|<script/i.test(name)) {
      return NextResponse.json(
        { error: 'Nom invalide' },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Sanitize inputs
    const sanitize = (s: string) => s?.replace(/[<>]/g, '').trim().slice(0, 2000) || '';

    const lead = {
      source: sanitize(source || 'website'),
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      phone: sanitize(phone || ''),
      subject: sanitize(subject || ''),
      message: sanitize(message || ''),
      form_data: formData || null,
      status: 'new',
      ip_address: ip,
      created_at: new Date().toISOString(),
    };

    // Try to save to Supabase if configured
    if (isSupabaseReady()) {
      try {
        const db = createServiceClient() as any;

        // 1. Insert lead into leads table
        const { data: leadData, error: insertError } = await db
          .from('leads')
          .insert({ ...lead, tag: 'prospect' })
          .select('id')
          .single();

        let leadId = leadData?.id;

        if (insertError) {
          if (process.env.NODE_ENV === 'development') console.error('Lead insert error:', insertError.message);
          // Fallback: try without tag column (in case it doesn't exist yet)
          const { data: fallbackLead, error: fallbackErr } = await db
            .from('leads')
            .insert(lead)
            .select('id')
            .single();
          leadId = fallbackLead?.id;
          if (fallbackErr && process.env.NODE_ENV === 'development') console.error('Lead insert fallback error:', fallbackErr.message);
        }

        // 2. Create/update client record tagged as "prospect"
        const nameParts = lead.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Check if client already exists by email
        const { data: existingClient } = await db
          .from('clients')
          .select('id')
          .eq('email', lead.email)
          .single();

        let clientId = existingClient?.id;

        const initialNote = `═══ NOUVEAU PROSPECT ═══\n` +
          `Date: ${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` +
          `Source: ${lead.source}\n` +
          `${lead.subject ? `Sujet: ${lead.subject}\n` : ''}` +
          `${lead.message ? `Message: ${lead.message}\n` : ''}` +
          `${lead.form_data ? `\n── Données du formulaire ──\n${formatFormData(lead.form_data)}\n` : ''}` +
          `\n── Notes de suivi ──\n(Ajouter vos notes ici)\n`;

        // Detect admissibility test source
        const isFromTest = lead.source === 'admissibility_test' || lead.source === 'test_admissibilite';
        const clientSource = isFromTest ? 'test_admissibilite' : (lead.source === 'contact_form' ? 'site_web' : 'autre');

        if (!clientId) {
          // Create new client as prospect
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
            if (process.env.NODE_ENV === 'development') console.error('Client create error:', clientError.message);
          } else {
            clientId = newClient?.id;
          }
        } else {
          // Update existing client — append note
          const { data: clientRecord } = await db
            .from('clients')
            .select('notes, status')
            .eq('id', clientId)
            .single();

          const updatedNotes = (clientRecord?.notes || '') + '\n\n' + initialNote;
          await db.from('clients').update({
            notes: updatedNotes,
            status: clientRecord?.status === 'lead' ? 'prospect' : clientRecord?.status,
          }).eq('id', clientId);
        }

        // 3. Create follow-up task
        if (clientId) {
          const dueDate = new Date();
          dueDate.setHours(dueDate.getHours() + 24); // Due in 24h

          // Try tasks table first, fallback to timeline_events
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
            if (process.env.NODE_ENV === 'development') console.warn('Tasks table not found, using timeline_events:', taskError.message);
            if (clientId) {
              // Find or create a case for this client to attach timeline event
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
        if (process.env.NODE_ENV === 'development') console.error('DB error:', dbErr);
      }
    }

    // Always return success (even if DB fails - don't expose internal errors)
    return NextResponse.json(
      { success: true, message: 'Votre demande a été reçue. Nous vous contacterons sous 24h.' },
      { status: 200, headers: getCorsHeaders(req) }
    );
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') console.error('Lead API error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// GET: List leads (authenticated CRM users only)
export async function GET(req: NextRequest) {
  // Import auth functions dynamically to avoid issues if module not found
  try {
    const { authenticateRequest, requireCrmRole } = await import('@/lib/api-auth');
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
      // Fallback: get leads from clients table
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
