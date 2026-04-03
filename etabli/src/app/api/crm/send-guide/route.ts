// ========================================================
// SOS Hub Canada - Envoi automatique du guide immigration
// POST /api/crm/send-guide
// Public endpoint (no auth) - rate limited - sends guide PDF link by email
// ========================================================
import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/api-auth';

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

// ─── Rate limiting ────────────────────────────────────
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkPublicRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 5) return false; // 5 per minute max
  entry.count++;
  return true;
}

// ─── Email validation ─────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Guide email templates by source ──────────────────
function getGuideEmail(source: string, email: string): { subject: string; body: string } {
  const isLatino = source.includes('latino');
  const isMaghreb = source.includes('maghreb');

  const greeting = isLatino
    ? '¡Hola!'
    : isMaghreb
      ? 'Bonjour,'
      : 'Bonjour,';

  const title = isLatino
    ? 'Los 10 errores fatales de los latinos que emigran a Canadá'
    : isMaghreb
      ? 'Les 10 erreurs fatales des Maghrébins qui immigrent au Canada'
      : 'Les 10 erreurs fatales qui font rejeter votre demande d\'immigration';

  const subject = isLatino
    ? '🎁 Su guía gratuita: 10 errores fatales al emigrar a Canadá'
    : `🎁 Votre guide gratuit: ${title}`;

  const lang = isLatino ? 'es' : 'fr';

  const body = `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#1B2A4A 0%,#2C3E6A 100%);padding:40px 40px 30px;text-align:center;">
  <h1 style="color:#C8A35F;font-size:28px;margin:0 0 8px;">SOS Hub Canada</h1>
  <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0;">Votre nouvelle vie au Canada</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">${greeting}</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">
    ${isLatino
      ? 'Gracias por su interés en emigrar a Canadá. Aquí está su guía gratuita con los errores más comunes que cometen los latinos al solicitar la inmigración canadiense.'
      : 'Merci pour votre intérêt pour l\'immigration au Canada. Voici votre guide gratuit avec les erreurs les plus courantes qui font rejeter les demandes d\'immigration.'}
  </p>

  <!-- Guide Title Card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border:2px solid #C8A35F;border-radius:12px;margin:24px 0;">
  <tr><td style="padding:24px;text-align:center;">
    <p style="color:#C8A35F;font-size:14px;font-weight:700;letter-spacing:1px;margin:0 0 8px;">📖 ${isLatino ? 'GUÍA GRATUITA' : 'GUIDE GRATUIT'}</p>
    <h2 style="color:#1B2A4A;font-size:20px;margin:0 0 16px;line-height:1.3;">«${title}»</h2>
  </td></tr>
  </table>

  <!-- 10 Tips -->
  <h3 style="color:#1B2A4A;font-size:18px;margin:32px 0 16px;">${isLatino ? 'Los 10 errores a evitar:' : 'Les 10 erreurs à éviter:'}</h3>

  ${isLatino ? `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>1.</strong> No verificar su elegibilidad antes de aplicar</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>2.</strong> Elegir el programa equivocado (hay más de 50)</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>3.</strong> No preparar la evaluación de credenciales (ECA/WES)</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>4.</strong> Subestimar el nivel de francés requerido</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>5.</strong> Enviar documentos incompletos o mal traducidos</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>6.</strong> Ignorar los plazos y fechas límite de IRCC</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>7.</strong> No demostrar fondos suficientes correctamente</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>8.</strong> Omitir antecedentes médicos o penales requeridos</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>9.</strong> No tener una carta de intención bien redactada</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>10.</strong> Intentar hacer todo sin ayuda profesional</td></tr>
  </table>
  ` : `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>1.</strong> Ne pas vérifier son admissibilité avant de postuler</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>2.</strong> Choisir le mauvais programme (il y en a plus de 50)</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>3.</strong> Ne pas préparer l'évaluation des diplômes (ECA/WES)</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>4.</strong> Sous-estimer le niveau de français ou d'anglais requis</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>5.</strong> Envoyer des documents incomplets ou mal traduits</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>6.</strong> Ignorer les délais et dates limites d'IRCC</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>7.</strong> Ne pas démontrer les fonds suffisants correctement</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>8.</strong> Omettre les antécédents médicaux ou judiciaires requis</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>9.</strong> Ne pas avoir une lettre d'intention bien rédigée</td></tr>
    <tr><td style="padding:8px 0;color:#333;font-size:15px;line-height:1.5;">❌ <strong>10.</strong> Essayer de tout faire sans aide professionnelle</td></tr>
  </table>
  `}

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr><td align="center">
    <a href="https://soshubcanada.com/${isLatino ? 'latino' : isMaghreb ? 'maghreb' : ''}#${isLatino ? 'inscripcion' : 'inscription'}"
       style="display:inline-block;background:linear-gradient(135deg,#C8A35F,#b8933f);color:#fff;padding:16px 40px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:700;">
      ${isLatino ? '→ Evaluar mi admisibilidad gratis' : '→ Évaluer mon admissibilité gratuitement'}
    </a>
  </td></tr>
  </table>

  <p style="color:#333;font-size:15px;line-height:1.6;margin:24px 0 0;">
    ${isLatino
      ? '¿Preguntas? Responda a este correo o contáctenos por WhatsApp:'
      : 'Des questions? Répondez à ce courriel ou contactez-nous par WhatsApp:'}
  </p>
  <p style="margin:8px 0 0;">
    <a href="https://wa.me/15148000135" style="color:#25D366;font-size:15px;font-weight:600;text-decoration:none;">
      📱 WhatsApp: +1 (514) 800-0135
    </a>
  </p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">

  <p style="color:#1B2A4A;font-size:15px;font-weight:600;margin:0 0 8px;">
    ${isLatino ? 'El equipo de SOS Hub Canada' : 'L\'équipe SOS Hub Canada'}
  </p>
  <p style="color:#888;font-size:13px;margin:0;">
    3737 Boul. Crémazie Est, Bureau 210, Montréal, QC H2A 1B6
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="background:#1B2A4A;padding:24px 40px;text-align:center;">
  <p style="color:rgba(255,255,255,.6);font-size:12px;margin:0 0 8px;">
    © ${new Date().getFullYear()} SOS Hub Canada — soshubcanada.com
  </p>
  <p style="color:rgba(255,255,255,.4);font-size:11px;margin:0;">
    ${isLatino
      ? 'Recibió este correo porque solicitó nuestra guía gratuita.'
      : 'Vous recevez ce courriel car vous avez demandé notre guide gratuit.'}
    <a href="https://soshubcanada.com" style="color:#C8A35F;text-decoration:none;">
      ${isLatino ? 'Cancelar suscripción' : 'Se désinscrire'}
    </a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, body };
}

// ─── CORS ─────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
}

// ─── POST: Send guide email (public) ──────────────────
export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req);
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  if (!checkPublicRate(ip)) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez dans une minute.' },
      { status: 429, headers: cors }
    );
  }

  try {
    const body = await req.json();
    const { email, source } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Adresse courriel invalide' },
        { status: 400, headers: cors }
      );
    }

    const { subject, body: emailBody } = getGuideEmail(source || 'homepage', email);

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('[send-guide] EmailJS not configured');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 500, headers: cors }
      );
    }

    const emailjsRes = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: email,
          subject: subject,
          message: emailBody,
          from_name: 'SOS Hub Canada',
          reply_to: 'info@soshubcanada.com',
        },
      }),
    });

    if (!emailjsRes.ok) {
      const errText = await emailjsRes.text();
      console.error('[send-guide] EmailJS error:', errText);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du courriel' },
        { status: 500, headers: cors }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Guide envoyé par courriel' },
      { headers: cors }
    );
  } catch (err) {
    console.error('[send-guide] Error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: cors }
    );
  }
}
