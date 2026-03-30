// Preview the auto-followup email template — DEV ONLY
import { NextRequest, NextResponse } from 'next/server';
import { DEMO_EMPLOYERS } from '@/lib/crm-employers';

/* eslint-disable @typescript-eslint/no-explicit-any */

function matchPositions(client: any) {
  const matches: { employer: string; position: string; wage: number; industry: string; nocCode: string }[] = [];
  const exp = (client.work_experience || '').toLowerCase();
  const edu = (client.education || '').toLowerCase();
  for (const emp of DEMO_EMPLOYERS) {
    if (emp.status !== 'actif') continue;
    for (const lmia of emp.lmiaApplications) {
      if (!['approuve', 'en_traitement', 'soumis'].includes(lmia.status)) continue;
      const pos = lmia.position.toLowerCase();
      const match =
        (pos.includes('develop') && (exp.includes('develop') || exp.includes('logiciel') || edu.includes('informatique'))) ||
        (pos.includes('cyber') && (exp.includes('cyber') || exp.includes('securit'))) ||
        (pos.includes('cuisin') && (exp.includes('cuisin') || exp.includes('restaur'))) ||
        (pos.includes('agricol') && (exp.includes('agricol') || exp.includes('ferme'))) ||
        (pos.includes('analys') && (exp.includes('analys') || exp.includes('financ')));
      if (match) matches.push({ employer: emp.companyName, position: lmia.position, wage: lmia.wageOffered, industry: emp.industry, nocCode: lmia.nocCode });
    }
  }
  return matches;
}

export async function GET(request: NextRequest) {
  // Dev only — block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'Patrick';
  const fullName = url.searchParams.get('fullName') || 'Patrick Cadet';
  const email = url.searchParams.get('email') || 'cadetpatrick@gmail.com';
  const frLevel = url.searchParams.get('fr') || 'NCLC 8';
  const enLevel = url.searchParams.get('en') || 'CLB 7';
  const education = url.searchParams.get('edu') || 'Baccalauréat en administration';
  const experience = url.searchParams.get('exp') || '5 ans — Analyste financier';

  const client = { first_name: name, work_experience: experience, education, email };
  const positions = matchPositions(client);
  const hasPositions = positions.length > 0;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Votre analyse d'admissibilité — SOS Hub Canada</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF">

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#1B2559 0%,#242E6B 100%);padding:32px 24px;text-align:center">
  <div style="font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-1px">[ SOS <span style="color:#D4A03C">HUB</span> ]</div>
  <div style="color:#D4A03C;font-size:11px;font-weight:700;letter-spacing:4px;margin-top:4px">RELOCALISATION & SERVICES</div>
</div>

<!-- URGENCY BAR -->
<div style="background:linear-gradient(90deg,#D4A03C,#F59E0B);padding:12px 24px;text-align:center">
  <span style="color:#FFFFFF;font-size:13px;font-weight:700">⚡ VOTRE ANALYSE D'ADMISSIBILITÉ EST PRÊTE</span>
</div>

<!-- GREETING -->
<div style="padding:32px 24px 16px">
  <h1 style="color:#1B2559;font-size:22px;margin:0 0 12px">Bonjour ${name},</h1>
  <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0">
    Suite à votre test d'admissibilité, nos experts ont analysé votre profil en détail.
    <strong style="color:#1B2559">Bonne nouvelle</strong> — votre profil présente des opportunités réelles pour immigrer au Canada.
  </p>
</div>

<!-- PROFILE SNAPSHOT -->
<div style="margin:0 24px;background:#F8FAFC;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
  <div style="font-size:11px;color:#D4A03C;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Votre profil</div>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;width:40%">Français</td><td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${frLevel}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Anglais</td><td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${enLevel}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Éducation</td><td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${education}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;font-size:13px">Expérience</td><td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${experience}</td></tr>
  </table>
</div>

${hasPositions ? `
<!-- EMPLOYER MATCH -->
<div style="margin:24px;background:linear-gradient(135deg,#1B2559,#242E6B);border-radius:12px;padding:24px;color:#FFFFFF">
  <div style="text-align:center;margin-bottom:16px">
    <div style="display:inline-block;background:#D4A03C;color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px">Opportunité exclusive</div>
  </div>
  <h2 style="color:#FFFFFF;font-size:18px;text-align:center;margin:0 0 8px">${positions.length} poste${positions.length > 1 ? 's' : ''} disponible${positions.length > 1 ? 's' : ''} chez nos employeurs partenaires</h2>
  <p style="color:rgba(255,255,255,0.7);font-size:13px;text-align:center;margin:0 0 20px">Ces employeurs ont déjà une EIMT approuvée ou en cours — le processus est accéléré.</p>
  ${positions.map(p => `
  <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:8px;border-left:3px solid #D4A03C">
    <div style="font-size:15px;font-weight:700;color:#FFFFFF">${p.position}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px">${p.employer} — ${p.industry}</div>
    <div style="font-size:12px;color:#D4A03C;font-weight:600;margin-top:4px">${p.wage.toFixed(2)} $/h | NOC ${p.nocCode}</div>
  </div>`).join('')}
  <div style="text-align:center;margin-top:20px"><div style="color:rgba(255,255,255,0.5);font-size:11px">Ces postes se remplissent rapidement — agissez maintenant</div></div>
</div>
` : ''}

<!-- WHAT WE CAN DO -->
<div style="padding:0 24px 16px">
  <h2 style="color:#1B2559;font-size:16px;margin:24px 0 12px">Ce que <strong>SOS Hub Canada</strong> peut faire pour vous</h2>
  <table style="width:100%;border-collapse:collapse">
    ${[
      { n: '1', t: 'Analyse approfondie de votre admissibilité à tous les programmes' },
      { n: '2', t: 'Jumelage avec un employeur partenaire pour un permis de travail' },
      { n: '3', t: 'Préparation et dépôt de votre demande auprès d\'IRCC' },
      { n: '4', t: 'Suivi complet jusqu\'à l\'obtention de votre visa' },
    ].map(s => `<tr><td style="padding:8px 12px 8px 0;vertical-align:top;width:36px"><div style="width:28px;height:28px;background:#D4A03C;border-radius:50%;text-align:center;line-height:28px;color:#FFFFFF;font-size:13px;font-weight:800">${s.n}</div></td><td style="padding:8px 0;color:#4B5563;font-size:13px;line-height:1.5">${s.t}</td></tr>`).join('')}
  </table>
</div>

<!-- URGENCY BLOCK -->
<div style="margin:0 24px;background:#FEF3C7;border:2px solid #D4A03C;border-radius:12px;padding:20px;text-align:center">
  <div style="font-size:20px;margin-bottom:8px">⏰</div>
  <div style="color:#92400E;font-size:14px;font-weight:700;margin-bottom:4px">Les délais de traitement augmentent chaque mois</div>
  <div style="color:#92400E;font-size:12px;line-height:1.5">Les programmes d'immigration ont des places limitées. Plus vous attendez, plus le processus sera long. <strong>Chaque semaine compte.</strong></div>
</div>

<!-- OFFRE PREMIUM -->
<div style="margin:24px;background:linear-gradient(135deg,#1B2559,#242E6B);border-radius:16px;padding:28px;text-align:center;position:relative;overflow:hidden">
  <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(212,160,60,0.15)"></div>
  <div style="position:relative">
    <div style="display:inline-block;background:linear-gradient(90deg,#D4A03C,#F59E0B);color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Offre spéciale — Durée limitée</div>
    <h2 style="color:#FFFFFF;font-size:20px;font-weight:900;margin:0 0 8px">Rapport complet + Consultation gratuite</h2>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0 0 16px;line-height:1.5">
      Recevez votre analyse détaillée de 12 programmes avec recommandations personnalisées,<br>
      <strong style="color:#D4A03C">incluant une consultation gratuite de 30 minutes</strong> avec un de nos experts.
    </p>
    <div style="margin:16px 0">
      <span style="color:rgba(255,255,255,0.4);font-size:14px;text-decoration:line-through">149,99 $</span>
      <span style="color:#D4A03C;font-size:36px;font-weight:900;margin:0 8px">49,99 $</span>
      <span style="color:rgba(255,255,255,0.5);font-size:12px">taxes incluses</span>
    </div>
    <div style="margin-bottom:16px">
      <table style="width:100%;max-width:380px;margin:0 auto;text-align:left">
        <tr><td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px">✓ Analyse détaillée de 12 programmes fédéraux et provinciaux</td></tr>
        <tr><td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px">✓ Score CRS et MIFI avec plan d'amélioration personnalisé</td></tr>
        <tr><td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px">✓ Jumelage avec employeurs partenaires (EIMT approuvée)</td></tr>
        <tr><td style="padding:4px 0;color:rgba(255,255,255,0.8);font-size:12px">✓ Liste de documents requis pour votre programme</td></tr>
        <tr><td style="padding:4px 0;color:#D4A03C;font-size:12px;font-weight:700">✓ Consultation gratuite de 30 min avec un expert</td></tr>
      </table>
    </div>
    <a href="https://soshubca.vercel.app/achat-rapport?plan=analyse-premium&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}"
       style="display:inline-block;background:linear-gradient(90deg,#D4A03C,#F59E0B);color:#FFFFFF;font-size:16px;font-weight:900;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 15px rgba(212,160,60,0.4)">
      Obtenir mon rapport complet — 49,99 $
    </a>
    <div style="margin-top:12px;color:rgba(255,255,255,0.4);font-size:10px">Paiement sécurisé par Square | Rapport livré en 24h</div>
    <div style="margin-top:8px;color:rgba(255,255,255,0.3);font-size:10px">⚡ Cette offre expire dans 72 heures</div>
  </div>
</div>

<!-- OU CONTACTEZ-NOUS -->
<div style="padding:16px 24px;text-align:center">
  <div style="color:#9CA3AF;font-size:12px;margin-bottom:12px">— ou contactez-nous directement —</div>
  <a href="https://wa.me/14386302869?text=${encodeURIComponent(`Bonjour, je suis ${fullName}. J'ai reçu mon analyse d'admissibilité et j'aimerais obtenir le rapport complet.`)}"
     style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:14px;font-weight:800;padding:12px 28px;border-radius:12px;text-decoration:none;margin-right:8px">
    WhatsApp
  </a>
  <a href="mailto:info@soshubcanada.com?subject=${encodeURIComponent(`Rapport complet - ${fullName}`)}"
     style="display:inline-block;background:#1B2559;color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">
    Courriel
  </a>
  <div style="margin-top:12px;color:#9CA3AF;font-size:11px"><strong style="color:#1B2559">SOS Hub Canada</strong> | +1 (438) 630-2869 | info@soshubcanada.com</div>
</div>

<!-- SOCIAL PROOF -->
<div style="background:#F8FAFC;padding:20px 24px;text-align:center;border-top:1px solid #E2E8F0">
  <div style="display:inline-block;margin:0 12px;text-align:center"><div style="font-size:22px;font-weight:900;color:#1B2559">500+</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Familles accompagnées</div></div>
  <div style="display:inline-block;margin:0 12px;text-align:center"><div style="font-size:22px;font-weight:900;color:#D4A03C">94%</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Taux de réussite</div></div>
  <div style="display:inline-block;margin:0 12px;text-align:center"><div style="font-size:22px;font-weight:900;color:#1B2559">24h</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Temps de réponse</div></div>
</div>

<!-- FOOTER -->
<div style="background:#1B2559;padding:24px;text-align:center">
  <div style="font-size:18px;font-weight:900;color:#FFFFFF">SOS <span style="color:#D4A03C">Hub</span> Canada</div>
  <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:8px">3737 Crémazie Est #402, Montréal QC H1Z 2K4<br>info@soshubcanada.com | +1 (438) 630-2869</div>
  <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:12px">Vous recevez ce courriel suite à votre test d'admissibilité sur soshub.ca</div>
</div>

</div>
</body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
