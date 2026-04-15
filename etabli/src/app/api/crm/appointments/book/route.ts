// ========================================================
// API Route: Prise de RDV publique (site → CRM)
// POST /api/crm/appointments/book
// - Cree le RDV dans Supabase (appointments table)
// - Auto-cree le client si nouveau (prospect)
// - Envoie courriel a info@soshubcanada.com
// - Envoie courriel de confirmation au client
// - Envoie courriel au membre du staff concerne
// ========================================================
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, isValidEmail, sanitizeInput, validateOrigin } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

// Map public booking types to CRM appointment types
const TYPE_MAP: Record<string, string> = {
  Consultation: "consultation_initiale",
  Suivi: "suivi",
  Juridique: "revision_formulaires",
  Administratif: "autre",
};

// Fallback staff directory (used when channel lookup fails)
const FALLBACK_STAFF: Record<string, { name: string; email: string; ccEmails?: string[]; userId?: string }> = {
  "patrick-cadet": { name: "Patrick Cadet", email: "pcadet@soshubcanada.com", ccEmails: ["info@soshubcanada.com"], userId: "u1" },
  "equipe-sos": { name: "Equipe SOS Hub", email: "info@soshubcanada.com", ccEmails: [] },
};

interface ChannelConfig {
  name: string;
  email: string;
  ccEmails: string[];
  assignToUserId?: string;
  duration?: number;
}

async function resolveChannel(staffId: string): Promise<ChannelConfig | null> {
  // Try Supabase booking_channels table first
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey && !url.includes("VOTRE-PROJET")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data } = await (supabase as any)
        .from("booking_channels")
        .select("name, email, cc_emails, assign_to_user_id, duration")
        .eq("slug", staffId)
        .eq("active", true)
        .maybeSingle();

      if (data) {
        return {
          name: data.name,
          email: data.email,
          ccEmails: data.cc_emails || [],
          assignToUserId: data.assign_to_user_id,
          duration: data.duration,
        };
      }
    } catch (err) {
      console.error("[BOOK] Channel lookup error:", err);
    }
  }

  // Fallback to hardcoded
  const fallback = FALLBACK_STAFF[staffId];
  if (fallback) {
    return {
      name: fallback.name,
      email: fallback.email,
      ccEmails: fallback.ccEmails || [],
      assignToUserId: fallback.userId,
    };
  }

  return null;
}

interface BookingPayload {
  staffId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  notes?: string;
}

async function sendEmailJS(params: {
  to_email: string;
  subject: string;
  message: string;
  from_name?: string;
  reply_to?: string;
}): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.log("[BOOK] EmailJS not configured, skipping:", params.subject);
    return false;
  }

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
          to_email: params.to_email,
          subject: params.subject,
          message: params.message,
          from_name: params.from_name || "SOS Hub Canada",
          reply_to: params.reply_to || "info@soshubcanada.com",
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[BOOK] EmailJS error:", err);
    return false;
  }
}

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildClientEmail(booking: BookingPayload, staffName: string): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1B2559;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:#D4A03C;margin:0;font-size:20px;">[ SOS HUB ]</h1>
    <p style="color:#fff;margin:4px 0 0;font-size:12px;">Relocalisation &amp; Services</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #eee;">
    <h2 style="color:#1B2559;margin:0 0 16px;">Rendez-vous confirme!</h2>
    <p style="color:#555;margin:0 0 16px;">Bonjour ${sanitizeInput(booking.name)},</p>
    <p style="color:#555;margin:0 0 16px;">Votre rendez-vous a ete enregistre avec succes. Voici les details :</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;width:120px;">Date</td><td style="padding:8px 12px;background:#F7F3E8;">${formatDateFr(booking.date)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#1B2559;">Heure</td><td style="padding:8px 12px;">${booking.time} (30 min)</td></tr>
      <tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;">Type</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.type)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#1B2559;">Avec</td><td style="padding:8px 12px;">${sanitizeInput(staffName)}</td></tr>
      ${booking.notes ? `<tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;">Notes</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.notes)}</td></tr>` : ""}
    </table>
    <p style="color:#555;font-size:13px;">Si vous devez modifier ou annuler votre rendez-vous, veuillez nous contacter a <a href="mailto:info@soshubcanada.com" style="color:#D4A03C;">info@soshubcanada.com</a></p>
  </div>
  <div style="background:#f9f9f9;padding:16px;text-align:center;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
    <p style="margin:0;font-size:11px;color:#999;">SOS Hub Canada — Montreal, QC</p>
  </div>
</div>`;
}

function buildStaffEmail(booking: BookingPayload, staffName: string): string {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1B2559;padding:20px;border-radius:12px 12px 0 0;">
    <h1 style="color:#D4A03C;margin:0;font-size:18px;">Nouveau rendez-vous</h1>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #eee;">
    <p style="color:#555;margin:0 0 12px;">Un nouveau rendez-vous a ete pris via le site web :</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;">
      <tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;width:120px;">Client</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.name)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#1B2559;">Courriel</td><td style="padding:8px 12px;"><a href="mailto:${sanitizeInput(booking.email)}" style="color:#D4A03C;">${sanitizeInput(booking.email)}</a></td></tr>
      <tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;">Telephone</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.phone)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#1B2559;">Date</td><td style="padding:8px 12px;">${formatDateFr(booking.date)} a ${booking.time}</td></tr>
      <tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;">Type</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.type)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#1B2559;">Assigne a</td><td style="padding:8px 12px;">${sanitizeInput(staffName)}</td></tr>
      ${booking.notes ? `<tr><td style="padding:8px 12px;background:#F7F3E8;font-weight:bold;color:#1B2559;">Notes</td><td style="padding:8px 12px;background:#F7F3E8;">${sanitizeInput(booking.notes)}</td></tr>` : ""}
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#888;">Ce rendez-vous est visible dans le CRM &gt; Calendrier.</p>
  </div>
</div>`;
}

export async function POST(request: NextRequest) {
  // Origin check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisee" }, { status: 403 });
  }
  // Rate limit: 5 bookings per minute per IP
  const rl = checkRateLimit(request, 5, 60000, 'booking');
  if (!rl.allowed) return rl.error!;

  try {
    const body: BookingPayload = await request.json();
    const { staffId, date, time, name, email, phone, type, notes } = body;

    // Validation
    if (!staffId || !date || !time || !name || !email || !phone || !type) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: "Format d'heure invalide" }, { status: 400 });
    }

    // Resolve channel config dynamically
    const channel = await resolveChannel(staffId);
    if (!channel) {
      return NextResponse.json({ error: "Canal introuvable" }, { status: 404 });
    }

    const appointmentType = TYPE_MAP[type] || "autre";
    const sanitizedName = sanitizeInput(name);
    const sanitizedNotes = notes ? sanitizeInput(notes) : "";

    // Split name into first/last
    const nameParts = sanitizedName.split(" ");
    const firstName = nameParts[0] || sanitizedName;
    const lastName = nameParts.slice(1).join(" ") || "";

    let appointmentId = `rdv-${Date.now()}`;
    let clientId: string | null = null;
    const duration = channel.duration || 30;

    // -------------------------------------------------------
    // Supabase: create client + appointment
    // -------------------------------------------------------
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey && !url.includes("VOTRE-PROJET")) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Check if client exists by email
      const { data: existingClient } = await (supabase as any)
        .from("clients")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Auto-create client as prospect
        const { data: newClient, error: clientErr } = await (supabase as any)
          .from("clients")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            status: "prospect",
            notes: `RDV pris en ligne le ${date} a ${time} (${type})`,
          })
          .select("id")
          .single();

        if (clientErr) {
          console.error("[BOOK] Client creation error:", clientErr);
        } else {
          clientId = newClient.id;
        }
      }

      // Create appointment in Supabase
      if (clientId) {
        // Find staff user ID from channel config
        let userId = channel.assignToUserId;
        if (!userId) {
          // Try to find by email
          const { data: staffUser } = await (supabase as any)
            .from("users")
            .select("id")
            .eq("email", channel.email)
            .maybeSingle();
          userId = staffUser?.id;
        }

        // Fallback to first coordinator if staff not found
        if (!userId) {
          const { data: fallbackUser } = await (supabase as any)
            .from("users")
            .select("id")
            .in("role", ["coordinatrice", "superadmin"])
            .limit(1)
            .single();
          userId = fallbackUser?.id;
        }

        if (userId) {
          const { data: appt, error: apptErr } = await (supabase as any)
            .from("appointments")
            .insert({
              client_id: clientId,
              user_id: userId,
              title: `${type} - ${sanitizedName}`,
              date: date,
              time: time,
              duration: duration,
              type: appointmentType,
              status: "planifie",
              notes: sanitizedNotes || `Pris en ligne via /rdv/${staffId}. Tel: ${phone}`,
            })
            .select("id")
            .single();

          if (apptErr) {
            console.error("[BOOK] Appointment creation error:", apptErr);
          } else {
            appointmentId = appt.id;
          }
        }

        // Log email sent record
        await (supabase as any).from("emails_sent").insert({
          client_id: clientId,
          to_email: email,
          subject: `Confirmation RDV - ${formatDateFr(date)}`,
          body: `RDV ${type} le ${date} a ${time} avec ${channel.name}`,
          type: "appointment",
          sent_by: null, // booking public (pas d'utilisateur staff)
        });
      }
    }

    // -------------------------------------------------------
    // Send emails (async, don't block response)
    // -------------------------------------------------------
    const emailPromises: Promise<boolean>[] = [];

    // 1. Email de confirmation au client
    emailPromises.push(
      sendEmailJS({
        to_email: email,
        subject: `Confirmation de votre rendez-vous - ${formatDateFr(date)}`,
        message: buildClientEmail(body, channel.name),
        reply_to: "info@soshubcanada.com",
      })
    );

    // 2. Email au canal principal (toujours)
    emailPromises.push(
      sendEmailJS({
        to_email: channel.email,
        subject: `Nouveau RDV: ${sanitizedName} - ${type} le ${date} a ${time}`,
        message: buildStaffEmail(body, channel.name),
        reply_to: email,
      })
    );

    // 3. Emails CC (info@, autres departements, etc.)
    for (const ccEmail of channel.ccEmails) {
      if (ccEmail !== channel.email) {
        emailPromises.push(
          sendEmailJS({
            to_email: ccEmail,
            subject: `Nouveau RDV (CC): ${sanitizedName} - ${type} le ${date} a ${time}`,
            message: buildStaffEmail(body, channel.name),
            reply_to: email,
          })
        );
      }
    }

    // Fire emails without blocking
    Promise.allSettled(emailPromises).then((results) => {
      const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
      console.log(`[BOOK] ${sent}/${results.length} emails sent for appointment ${appointmentId}`);
    });

    return NextResponse.json({
      success: true,
      appointmentId,
      clientId,
      message: "Rendez-vous enregistre avec succes",
    });
  } catch (err) {
    console.error("[BOOK] Error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
