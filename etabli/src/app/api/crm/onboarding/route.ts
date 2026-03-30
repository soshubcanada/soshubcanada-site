// ========================================================
// API Route: Inscription client (onboarding public)
// POST /api/crm/onboarding
// Crée un client + dossier + envoie courriel de confirmation
// ========================================================
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateOrigin } from "@/lib/api-auth";

const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

/* -- Validation helpers -- */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s()+-]{7,20}$/.test(phone);
}

/* -- Supabase detection -- */

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return Boolean(url && !url.includes("VOTRE-PROJET") && !url.includes("placeholder"));
}

async function getSupabaseServiceClient() {
  const { createServiceClient } = await import("@/lib/supabase");
  // Cast to any to bypass strict generated types (same pattern as crm-data-service)
  return createServiceClient() as ReturnType<typeof createServiceClient> & { from: (table: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/* -- POST Handler -- */

export async function POST(request: NextRequest) {
  // Origin check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisee" }, { status: 403 });
  }
  // Rate limit: max 3 submissions per minute per IP
  const rl = checkRateLimit(request, 3, 60000, 'onboarding');
  if (!rl.allowed) return rl.error!;

  try {
    const body = await request.json();

    // -- Required field validation --
    const { prenom, nom, courriel, telephone, paysResidence, statutActuel, programmeInteret, referenceNumber } = body;

    const missing: string[] = [];
    if (!prenom?.trim()) missing.push("prenom");
    if (!nom?.trim()) missing.push("nom");
    if (!courriel?.trim()) missing.push("courriel");
    if (!telephone?.trim()) missing.push("telephone");
    if (!paysResidence?.trim()) missing.push("paysResidence");
    if (!statutActuel) missing.push("statutActuel");
    if (!programmeInteret) missing.push("programmeInteret");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs requis manquants: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (!isValidEmail(courriel)) {
      return NextResponse.json({ error: "Format de courriel invalide" }, { status: 400 });
    }

    if (!isValidPhone(telephone)) {
      return NextResponse.json({ error: "Format de téléphone invalide" }, { status: 400 });
    }

    // Input length validation
    if (prenom.trim().length > 100 || nom.trim().length > 100) {
      return NextResponse.json({ error: "Nom ou prénom trop long (max 100 caractères)" }, { status: 400 });
    }

    if (courriel.trim().length > 254) {
      return NextResponse.json({ error: "Courriel trop long" }, { status: 400 });
    }

    // Contract acceptance
    if (!body.acceptConditions || !body.acceptFrais || !body.acceptRepresentation) {
      return NextResponse.json(
        { error: "Toutes les conditions doivent être acceptées" },
        { status: 400 }
      );
    }

    // Payment method
    if (!body.paymentMethod) {
      return NextResponse.json({ error: "Mode de paiement requis" }, { status: 400 });
    }

    const ref = referenceNumber || `SOS-${Date.now()}`;
    const now = new Date().toISOString();
    let clientId: string | null = null;
    let caseId: string | null = null;

    // -- Supabase persistence --
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getSupabaseServiceClient();

        // Create client record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;

        const { data: clientData, error: clientError } = await db
          .from("clients")
          .insert({
            first_name: prenom.trim(),
            last_name: nom.trim(),
            email: courriel.trim().toLowerCase(),
            phone: telephone.trim(),
            date_of_birth: body.dateNaissance || null,
            nationality: body.nationalite || null,
            marital_status: body.situationMatrimoniale || null,
            address: body.adresseRue || null,
            city: body.adresseVille || null,
            province: body.adresseProvince || null,
            postal_code: body.adresseCodePostal || null,
            current_country: paysResidence.trim(),
            current_status: statutActuel,
            language_french: body.niveauFrancais || null,
            language_english: body.niveauAnglais || null,
            education: body.education || null,
            work_experience: body.anneesExperience ? parseInt(body.anneesExperience, 10) : null,
            status: "nouveau",
            notes: body.descriptionSituation || null,
            created_at: now,
            updated_at: now,
          })
          .select("id")
          .single();

        if (clientError) {
          if (process.env.NODE_ENV === 'development') console.error("Supabase client insert error:", clientError);
        } else if (clientData) {
          clientId = (clientData as { id: string }).id;
        }

        // Create case (dossier) record
        if (clientId) {
          const { data: caseData, error: caseError } = await db
            .from("cases")
            .insert({
              client_id: clientId,
              program: programmeInteret,
              status: "nouveau",
              reference_number: ref,
              payment_method: body.paymentMethod,
              payment_status: body.paymentMethod === "interac" ? "en_attente_verification" : body.paymentMethod === "en_personne" ? "en_attente" : "non_paye",
              payment_confirmation: body.interacConfirmation || null,
              amount_due: 250,
              contract_accepted: true,
              contract_accepted_at: now,
              created_at: now,
              updated_at: now,
            })
            .select("id")
            .single();

          if (caseError) {
            if (process.env.NODE_ENV === 'development') console.error("Supabase case insert error:", caseError);
          } else if (caseData) {
            caseId = (caseData as { id: string }).id;
          }
        }
      } catch (dbErr) {
        if (process.env.NODE_ENV === 'development') console.error("Supabase error (falling back to demo):", dbErr);
      }
    } else {
      // Demo mode — generate fake IDs
      clientId = `demo-cli-${Date.now()}`;
      caseId = `demo-case-${Date.now()}`;
      if (process.env.NODE_ENV === 'development') {
        console.log("[DEMO] Client créé:", { clientId, ref, prenom, nom, courriel, programmeInteret });
      }
    }

    // -- Send confirmation email via EmailJS --
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_ONBOARDING_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        const res = await fetch(EMAILJS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
              to_email: courriel.trim().toLowerCase(),
              to_name: `${prenom} ${nom}`,
              subject: `Confirmation d'inscription — Dossier ${ref}`,
              reference_number: ref,
              program: programmeInteret,
              payment_method: body.paymentMethod,
              message: `Bonjour ${prenom},\n\nMerci pour votre inscription chez SOS Hub Canada Inc.\n\nVotre numéro de référence est : ${ref}\nProgramme : ${programmeInteret}\n\nNotre équipe vous contactera dans les 24 à 48 heures pour la suite de votre dossier.\n\nCordialement,\nSOS Hub Canada Inc.`,
              from_name: "SOS Hub Canada",
            },
          }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => 'unknown');
          if (process.env.NODE_ENV === 'development') console.error(`EmailJS responded with status ${res.status}:`, errBody);
        }
      } catch (emailErr) {
        if (process.env.NODE_ENV === 'development') console.error("EmailJS error:", emailErr);
        // Non-blocking — we still return success
      }
    } else {
      if (process.env.NODE_ENV === 'development') console.log("[DEMO] Email non envoyé (EmailJS non configuré)");
    }

    return NextResponse.json({
      success: true,
      referenceNumber: ref,
      clientId,
      caseId,
      message: "Inscription complétée avec succès",
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') console.error("Onboarding POST error:", err);
    const message = err instanceof Error ? err.message : "Erreur serveur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
