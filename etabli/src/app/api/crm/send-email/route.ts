// ========================================================
// API Route: Envoi de courriel CRM via EmailJS
// POST /api/crm/send-email
// ========================================================
import { NextRequest, NextResponse } from 'next/server';
import { insertEmailRecord } from '@/lib/crm-data-service';
import { authenticateRequest, checkRateLimit, isValidEmail, validateOrigin } from '@/lib/api-auth';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Origine non autorisee' }, { status: 403 });
  const rl = checkRateLimit(request, 20, 60000); // Max 20 emails/minute
  if (!rl.allowed) return rl.error!;
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await request.json();
    const { clientId, caseId, toEmail, subject, emailBody, type, sentBy, from_name, reply_to } = body;

    if (!toEmail || !subject || !emailBody) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    if (!isValidEmail(toEmail)) {
      return NextResponse.json({ error: 'Email destinataire invalide' }, { status: 400 });
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: 'Sujet trop long (max 200 caractères)' }, { status: 400 });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey) {
      // Envoyer via EmailJS REST API
      const emailjsRes = await fetch(EMAILJS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            to_email: toEmail,
            subject: subject,
            message: emailBody,
            from_name: from_name || 'SOS Hub Canada',
            reply_to: reply_to || 'info@soshubcanada.com',
          },
        }),
      });

      if (!emailjsRes.ok) {
        const errText = await emailjsRes.text();
        if (process.env.NODE_ENV === 'development') console.error('EmailJS error:', errText);
        return NextResponse.json({ error: `Erreur EmailJS: ${errText}` }, { status: 500 });
      }
    } else {
      // Mode simulation si EmailJS non configuré
      if (process.env.NODE_ENV === 'development') console.log(`[SIMULATION] Courriel à ${toEmail}: ${subject}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Enregistrer dans la base de données
    await insertEmailRecord({
      clientId,
      caseId,
      toEmail,
      subject,
      body: emailBody,
      type: type || 'general',
      sentBy,
    });

    return NextResponse.json({
      success: true,
      message: `Courriel envoyé à ${toEmail}`,
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('send-email error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
