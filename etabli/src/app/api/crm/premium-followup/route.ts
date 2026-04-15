// ========================================================
// SOS Hub Canada — Envoi rapport PREMIUM COMPLET 23h après achat
// Inclut: scores CRS/MIFI détaillés, tous les programmes,
// plan d'amélioration, jumelage employeurs, upsell consultation
// ========================================================
import { NextResponse } from 'next/server';
import { isSupabaseReady, createServiceClient } from '@/lib/supabase';
import { DEMO_EMPLOYERS } from '@/lib/crm-employers';
import { analyzeEligibility, descriptiveToNCLC, descriptiveToCLB } from '@/lib/eligibility-engine';
import type { ClientProfile, ProgramEligibility } from '@/lib/eligibility-engine';

/* eslint-disable @typescript-eslint/no-explicit-any */

const FOLLOWUP_DELAY_HOURS = 23;

// ─── Build profile from client record ──────────────────
function buildProfile(client: any): ClientProfile {
  const frLevel = (client.language_french || 'none').toLowerCase();
  const enLevel = (client.language_english || 'none').toLowerCase();
  const edu = (client.education || '').toLowerCase();
  const educationMap: Record<string, ClientProfile['highestEducation']> = {
    'secondaire': 'secondary', 'secondary': 'secondary', 'dep': 'one_year_diploma',
    'dec': 'two_year_diploma', 'college': 'two_year_diploma', 'baccalaureat': 'bachelors',
    'bachelors': 'bachelors', 'licence': 'bachelors', 'maitrise': 'masters', 'masters': 'masters',
    'doctorat': 'phd', 'phd': 'phd',
  };
  let highestEdu: ClientProfile['highestEducation'] = 'secondary';
  for (const [key, val] of Object.entries(educationMap)) { if (edu.includes(key)) { highestEdu = val; break; } }
  const age = client.date_of_birth ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25*24*60*60*1000)) : 30;
  return {
    age, nationality: client.nationality || 'other', maritalStatus: 'single', hasSpouse: false, numberOfDependents: 0,
    currentCountry: client.country_of_residence || 'other',
    isInCanada: (client.current_status === 'worker' || client.current_status === 'student'),
    isInQuebec: (client.province === 'QC'), yearsInCanada: client.canadian_work_experience_years || 0,
    yearsInQuebec: client.quebec_work_experience_years || 0, highestEducation: highestEdu,
    hasCanadianEducation: !!client.has_canadian_education, hasECA: false,
    frenchLevel: frLevel.includes('avance') ? 'advanced' : frLevel.includes('inter') ? 'intermediate' : frLevel.includes('basic') ? 'basic' : 'none',
    frenchNCLC: descriptiveToNCLC(frLevel),
    englishLevel: enLevel.includes('avance') ? 'advanced' : enLevel.includes('inter') ? 'intermediate' : enLevel.includes('basic') ? 'basic' : 'none',
    englishCLB: descriptiveToCLB(enLevel),
    hasLanguageTest: false, totalWorkExperienceYears: client.total_work_experience_years || 2,
    canadianWorkExperienceYears: client.canadian_work_experience_years || 0,
    quebecWorkExperienceYears: client.quebec_work_experience_years || 0,
    hasJobOffer: false, hasRelativeInCanada: false, hasSpouseInCanada: false,
    currentStatus: client.current_status || 'citizen_other',
    hasValidPermit: client.current_status === 'worker' || client.current_status === 'student',
    settlementFunds: 15000, isRefugee: false, hasCriminalRecord: false, hasMedicalIssue: false, hasBusinessExperience: false,
  };
}

function matchPositions(client: any) {
  const matches: { employer: string; position: string; wage: number; industry: string; nocCode: string }[] = [];
  const exp = (client.work_experience || client.notes || '').toLowerCase();
  const edu = (client.education || '').toLowerCase();
  for (const emp of DEMO_EMPLOYERS) {
    if (emp.status !== 'actif') continue;
    for (const lmia of emp.lmiaApplications) {
      if (!['approuve','en_traitement','soumis'].includes(lmia.status)) continue;
      const pos = lmia.position.toLowerCase();
      const match = (pos.includes('develop') && (exp.includes('develop') || exp.includes('logiciel') || edu.includes('informatique'))) ||
        (pos.includes('cyber') && (exp.includes('cyber') || exp.includes('securit'))) ||
        (pos.includes('cuisin') && (exp.includes('cuisin') || exp.includes('restaur'))) ||
        (pos.includes('analys') && (exp.includes('analys') || exp.includes('financ')));
      if (match) matches.push({ employer: emp.companyName, position: lmia.position, wage: lmia.wageOffered, industry: emp.industry, nocCode: lmia.nocCode });
    }
  }
  return matches;
}

function eligBadge(e: string): { bg: string; label: string } {
  switch (e) {
    case 'eligible': return { bg: '#059669', label: 'ÉLIGIBLE' };
    case 'likely_eligible': return { bg: '#2563EB', label: 'PROBABLEMENT ÉLIGIBLE' };
    case 'possibly_eligible': return { bg: '#D97706', label: 'POSSIBLEMENT ÉLIGIBLE' };
    case 'not_eligible': return { bg: '#DC2626', label: 'NON ÉLIGIBLE' };
    default: return { bg: '#9CA3AF', label: 'À ÉVALUER' };
  }
}

// ─── Generate FULL PREMIUM report email ──────────────────
function generateFullPremiumEmail(client: any, positions: ReturnType<typeof matchPositions>): string {
  const name = client.first_name || 'Candidat';
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Candidat';
  const profile = buildProfile(client);
  const analysis = analyzeEligibility(profile, fullName);

  // Sort ALL programs — work permit first
  const allPrograms = [...analysis.programs].sort((a, b) => {
    if (a.programId.includes('work_permit')) return -1;
    if (b.programId.includes('work_permit')) return 1;
    if (a.programId.includes('study_permit')) return -1;
    if (b.programId.includes('study_permit')) return 1;
    const order = { eligible: 0, likely_eligible: 1, possibly_eligible: 2, not_eligible: 3, ended: 4 };
    return (order[a.eligibility as keyof typeof order] ?? 3) - (order[b.eligibility as keyof typeof order] ?? 3) || b.score - a.score;
  });

  const eligible = allPrograms.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
  const possible = allPrograms.filter(p => p.eligibility === 'possibly_eligible');
  const notElig = allPrograms.filter(p => p.eligibility === 'not_eligible' || p.eligibility === 'ended');

  // Collect all recommendations
  const allRecs = new Set<string>();
  for (const p of allPrograms) { for (const r of p.recommendations) { allRecs.add(r); if (allRecs.size >= 8) break; } }
  const strengths = new Set<string>();
  for (const p of eligible) { for (const s of p.keyStrengths) { strengths.add(s); if (strengths.size >= 5) break; } }

  // CRS estimate
  const crsEstimate = Math.min(1200, Math.round(
    (profile.age >= 20 && profile.age <= 29 ? 110 : profile.age <= 35 ? 100 : 70) +
    (profile.highestEducation === 'masters' ? 135 : profile.highestEducation === 'bachelors' ? 120 : 90) +
    ((profile.frenchNCLC || 5) >= 9 ? 120 : (profile.frenchNCLC || 5) >= 7 ? 92 : 60) +
    ((profile.englishCLB || 4) >= 9 ? 24 : (profile.englishCLB || 4) >= 7 ? 16 : 6) +
    (profile.canadianWorkExperienceYears >= 3 ? 64 : profile.canadianWorkExperienceYears >= 1 ? 40 : 0)
  ));

  // Programs HTML — FULL details (not teaser)
  const programsHtml = allPrograms.map((p, i) => {
    const { bg, label } = eligBadge(p.eligibility);
    const isTop = p.eligibility === 'eligible' || p.eligibility === 'likely_eligible';
    const isWork = p.programNameFr.toLowerCase().includes('travail');
    return `
    <div style="background:${isTop ? '#F0FDF4' : '#F8FAFC'};border-radius:10px;padding:16px;margin-bottom:10px;border-left:4px solid ${bg}">
      <table style="width:100%;border-collapse:collapse"><tr>
        <td style="vertical-align:top">
          <div style="font-size:14px;font-weight:700;color:#1B2559">${i < 3 ? '★ ' : ''}${p.programNameFr}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:2px">Délai : ${p.estimatedProcessingTime} | Score : ${p.score}%</div>
          ${p.keyStrengths.length > 0 ? '<div style="font-size:11px;color:#059669;margin-top:4px">✓ ' + p.keyStrengths.slice(0, 3).join(' • ') + '</div>' : ''}
          ${p.missingRequirements.length > 0 ? '<div style="font-size:11px;color:#DC2626;margin-top:3px">✗ ' + p.missingRequirements.slice(0, 2).join(' • ') + '</div>' : ''}
          ${p.recommendations.length > 0 ? '<div style="font-size:11px;color:#2563EB;margin-top:3px">💡 ' + p.recommendations.slice(0, 2).join(' | ') + '</div>' : ''}
          ${isWork && isTop ? '<div style="font-size:11px;color:#D4A03C;font-weight:700;margin-top:4px">→ <strong>SOS Hub Canada</strong> peut vous jumeler avec un employeur partenaire</div>' : ''}
        </td>
        <td style="width:110px;text-align:right;vertical-align:top">
          <div style="display:inline-block;background:${bg};color:#FFF;font-size:9px;font-weight:800;padding:4px 8px;border-radius:12px">${label}</div>
        </td>
      </tr></table>
    </div>`;
  }).join('');

  const recsHtml = [...allRecs].map(r => '<div style="font-size:12px;color:#374151;padding:4px 0">→ ' + r + '</div>').join('');
  const strengthsHtml = [...strengths].map(s => '<div style="font-size:12px;color:#374151;padding:4px 0">✓ ' + s + '</div>').join('');

  const positionsHtml = positions.length > 0 ? positions.map(p => `
    <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:14px;margin-bottom:8px;border-left:3px solid #D4A03C">
      <div style="font-size:14px;font-weight:700;color:#FFFFFF">${p.position}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px">${p.employer} — ${p.industry}</div>
      <div style="font-size:12px;color:#D4A03C;font-weight:600;margin-top:3px">${p.wage.toFixed(2)} $/h | NOC ${p.nocCode}</div>
    </div>`).join('') : '';

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF">

<!-- HEADER -->
<div style="background:#1B2559;padding:32px 24px;text-align:center">
  <div style="font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-1px">[ SOS <span style="color:#D4A03C">HUB</span> ]</div>
  <div style="color:#D4A03C;font-size:11px;font-weight:700;letter-spacing:4px;margin-top:4px">RELOCALISATION & SERVICES</div>
</div>

<!-- PREMIUM BADGE -->
<div style="background:#D4A03C;padding:12px 24px;text-align:center">
  <span style="color:#FFFFFF;font-size:13px;font-weight:700">★ RAPPORT PREMIUM COMPLET — Merci pour votre achat ★</span>
</div>

<!-- GREETING -->
<div style="padding:28px 24px 16px">
  <h1 style="color:#1B2559;font-size:22px;margin:0 0 12px">Bonjour ${name},</h1>
  <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0">Merci pour votre confiance ! Voici votre <strong style="color:#1B2559">rapport d'analyse premium complet</strong>. Ce rapport a été préparé par <strong>SOSIA</strong>, notre IA experte, avec l'équivalent de l'analyse d'un consultant senior.</p>
</div>

<!-- PROFILE -->
<div style="margin:0 24px;background:#F8FAFC;border-radius:12px;padding:20px;border:1px solid #E2E8F0">
  <div style="font-size:11px;color:#D4A03C;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Votre profil</div>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:5px 0;color:#6B7280;font-size:13px;width:40%">Français</td><td style="padding:5px 0;color:#1B2559;font-size:13px;font-weight:600">${client.language_french || 'N/A'}</td></tr>
    <tr><td style="padding:5px 0;color:#6B7280;font-size:13px">Anglais</td><td style="padding:5px 0;color:#1B2559;font-size:13px;font-weight:600">${client.language_english || 'N/A'}</td></tr>
    <tr><td style="padding:5px 0;color:#6B7280;font-size:13px">Éducation</td><td style="padding:5px 0;color:#1B2559;font-size:13px;font-weight:600">${client.education || 'N/A'}</td></tr>
    <tr><td style="padding:5px 0;color:#6B7280;font-size:13px">Expérience</td><td style="padding:5px 0;color:#1B2559;font-size:13px;font-weight:600">${client.work_experience || 'N/A'}</td></tr>
    <tr><td style="padding:5px 0;color:#6B7280;font-size:13px">Score CRS estimé</td><td style="padding:5px 0;color:#D4A03C;font-size:15px;font-weight:800">${crsEstimate} / 1200</td></tr>
  </table>
</div>

<!-- STATS -->
<div style="margin:20px 24px">
  <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px">
    <table style="width:100%;border-collapse:collapse"><tr>
      <td style="text-align:center;padding:8px;width:33%"><div style="font-size:28px;font-weight:900;color:#059669">${eligible.length}</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Éligibles</div></td>
      <td style="text-align:center;padding:8px;width:33%;border-left:1px solid #BBF7D0;border-right:1px solid #BBF7D0"><div style="font-size:28px;font-weight:900;color:#D97706">${possible.length}</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Possibles</div></td>
      <td style="text-align:center;padding:8px;width:33%"><div style="font-size:28px;font-weight:900;color:#1B2559">${allPrograms.length}</div><div style="font-size:10px;color:#6B7280;text-transform:uppercase">Analysés</div></td>
    </tr></table>
  </div>
</div>

<!-- SUMMARY -->
<div style="margin:0 24px 16px;padding:16px;background:#FEF3C7;border-radius:10px;border:1px solid #FDE68A">
  <div style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;margin-bottom:6px">Recommandation principale</div>
  <div style="font-size:13px;color:#1B2559;font-weight:600">${analysis.topRecommendation}</div>
</div>

<!-- ALL PROGRAMS (FULL — not teaser) -->
<div style="margin:0 24px 16px">
  <div style="font-size:12px;color:#1B2559;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #D4A03C">
    Analyse complète — ${allPrograms.length} programmes
  </div>
  ${programsHtml}
</div>

<!-- STRENGTHS -->
${strengthsHtml ? `
<div style="margin:0 24px 12px;background:#F0FDF4;border-radius:8px;padding:14px;border:1px solid #BBF7D0">
  <div style="font-size:11px;color:#059669;font-weight:700;text-transform:uppercase;margin-bottom:8px">✓ Vos points forts</div>
  ${strengthsHtml}
</div>` : ''}

<!-- RECOMMENDATIONS (FULL) -->
<div style="margin:0 24px 12px;background:#EFF6FF;border-radius:8px;padding:14px;border:1px solid #BFDBFE">
  <div style="font-size:11px;color:#1E40AF;font-weight:700;text-transform:uppercase;margin-bottom:8px">💡 Plan d'amélioration personnalisé</div>
  ${recsHtml}
</div>

${positions.length > 0 ? `
<!-- EMPLOYER MATCH -->
<div style="margin:24px;background:#1B2559;border-radius:12px;padding:24px;color:#FFFFFF">
  <div style="text-align:center;margin-bottom:16px"><div style="display:inline-block;background:#D4A03C;color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px">Jumelage employeur</div></div>
  <h2 style="color:#FFFFFF;font-size:18px;text-align:center;margin:0 0 8px">${positions.length} poste${positions.length > 1 ? 's' : ''} disponible${positions.length > 1 ? 's' : ''} chez nos partenaires</h2>
  <p style="color:rgba(255,255,255,0.7);font-size:13px;text-align:center;margin:0 0 16px">Ces employeurs ont une EIMT en cours — processus accéléré possible.</p>
  ${positionsHtml}
</div>` : ''}

<!-- CTA CONSULTATION GRATUITE -->
<div style="margin:24px;background:#1B2559;border-radius:16px;padding:28px;text-align:center">
  <div style="display:inline-block;background:#D4A03C;color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Inclus dans votre achat</div>
  <h2 style="color:#FFFFFF;font-size:20px;font-weight:900;margin:0 0 8px">Votre consultation gratuite de 30 min</h2>
  <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0 0 20px">Un expert SOS Hub Canada vous contactera dans les prochaines 24h pour planifier votre consultation personnalisée.</p>
  <a href="https://soshubca.vercel.app/rdv/patrick-cadet"
     style="display:inline-block;background:#D4A03C;color:#FFFFFF;font-size:16px;font-weight:900;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 15px rgba(212,160,60,0.4)">
    Réserver ma consultation maintenant
  </a>
  <div style="margin-top:12px;color:rgba(255,255,255,0.5);font-size:11px">Ou attendez notre appel dans les 24h</div>
</div>

<!-- CTA OUVERTURE DE DOSSIER 250$ -->
<div style="margin:0 24px 24px;background:#FFFFFF;border-radius:16px;padding:24px;text-align:center;border:2px solid #D4A03C">
  <div style="font-size:11px;color:#D4A03C;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Prochaine étape</div>
  <h3 style="color:#1B2559;font-size:18px;font-weight:900;margin:0 0 8px">Ouvrir votre dossier officiel</h3>
  <p style="color:#4B5563;font-size:12px;line-height:1.6;margin:0 0 6px">Frais d'ouverture de dossier : <strong style="color:#1B2559;font-size:16px">250 $ CAD</strong></p>
  <p style="color:#059669;font-size:11px;font-weight:600;margin:0 0 16px">✓ Ce montant est déduit de vos honoraires de service lors de la signature du contrat</p>
  <table style="width:100%;max-width:350px;margin:0 auto 16px;text-align:left">
    <tr><td style="padding:3px 0;color:#4B5563;font-size:11px">✓ Analyse complète de votre dossier par un consultant</td></tr>
    <tr><td style="padding:3px 0;color:#4B5563;font-size:11px">✓ Vérification de tous vos documents</td></tr>
    <tr><td style="padding:3px 0;color:#4B5563;font-size:11px">✓ Stratégie personnalisée de demande</td></tr>
    <tr><td style="padding:3px 0;color:#4B5563;font-size:11px">✓ Accès au portail client pour suivi en temps réel</td></tr>
    <tr><td style="padding:3px 0;color:#4B5563;font-size:11px">✓ Jumelage avec employeur partenaire (si applicable)</td></tr>
  </table>
  <a href="https://soshubca.vercel.app/ouverture-dossier?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(client.email || '')}"
     style="display:inline-block;background:#1B2559;color:#FFFFFF;font-size:15px;font-weight:900;padding:14px 36px;border-radius:12px;text-decoration:none;box-shadow:0 4px 15px rgba(27,37,89,0.3)">
    Ouvrir mon dossier — 250 $
  </a>
  <div style="margin-top:10px;color:#9CA3AF;font-size:10px">Paiement sécurisé par Square | Déduit des honoraires finaux</div>
</div>

${positions.length > 0 ? `
<!-- UPSELL JUMELAGE -->
<div style="margin:0 24px 24px;background:#FEF3C7;border-radius:12px;padding:20px;text-align:center;border:2px solid #FDE68A">
  <div style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;margin-bottom:8px">Service exclusif</div>
  <h3 style="color:#1B2559;font-size:16px;margin:0 0 8px">Jumelage avec employeur partenaire</h3>
  <p style="color:#4B5563;font-size:12px;margin:0 0 12px">Nous pouvons déposer votre demande de permis de travail avec un employeur qui a déjà une EIMT approuvée. Processus accéléré.</p>
  <a href="https://wa.me/14386302869?text=${encodeURIComponent(`Bonjour, je suis ${fullName}. J'ai acheté le rapport premium et je suis intéressé par le jumelage avec un employeur partenaire.`)}"
     style="display:inline-block;background:#1B2559;color:#FFFFFF;font-size:13px;font-weight:700;padding:10px 24px;border-radius:10px;text-decoration:none">
    En savoir plus sur le jumelage
  </a>
</div>` : ''}

<!-- CONTACT -->
<div style="padding:16px 24px;text-align:center">
  <div style="color:#9CA3AF;font-size:12px;margin-bottom:12px">— Questions sur votre rapport ? —</div>
  <a href="https://wa.me/14386302869" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:14px;font-weight:800;padding:12px 28px;border-radius:12px;text-decoration:none">WhatsApp</a>
  &nbsp;
  <a href="mailto:info@soshubcanada.com" style="display:inline-block;background:#1B2559;color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">Courriel</a>
  <div style="margin-top:12px;color:#9CA3AF;font-size:11px">
    <strong style="color:#1B2559">SOS Hub Canada</strong> | +1 (438) 630-2869 | info@soshubcanada.com<br>
    3737 Crémazie Est #402, Montréal QC H1Z 2K4
  </div>
</div>

<!-- FOOTER -->
<div style="background:#1B2559;padding:24px;text-align:center">
  <div style="font-size:18px;font-weight:900;color:#FFFFFF">SOS <span style="color:#D4A03C">Hub</span> Canada</div>
  <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:8px">3737 Crémazie Est #402, Montréal QC H1Z 2K4</div>
  <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:12px">Rapport premium — Analyse par SOSIA, IA experte SOS Hub Canada</div>
</div>

</div></body></html>`;
}

// ─── API HANDLER ──────────────────────────────────────────
export async function GET(request: Request) {
  // Auth : Vercel cron header OU Bearer CRON_SECRET (voir auto-followup)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const hasValidBearer = cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!isVercelCron && !hasValidBearer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ message: 'Supabase not configured', sent: 0 });
  }

  const db = createServiceClient() as any;
  const now = new Date();
  const cutoffMin = new Date(now.getTime() - (FOLLOWUP_DELAY_HOURS + 1) * 60 * 60 * 1000);
  const cutoffMax = new Date(now.getTime() - FOLLOWUP_DELAY_HOURS * 60 * 60 * 1000);

  // Find clients who PAID (status = actif) and were created 23-24h ago
  const { data: paidClients, error: fetchErr } = await db
    .from('clients')
    .select('*')
    .eq('status', 'actif')
    .gte('updated_at', cutoffMin.toISOString())
    .lte('updated_at', cutoffMax.toISOString());

  if (fetchErr || !paidClients) {
    return NextResponse.json({ error: fetchErr?.message || 'No clients found', sent: 0 });
  }

  let sent = 0;
  const results: { email: string; status: string }[] = [];

  for (const client of paidClients) {
    // Check if premium report already sent
    const { data: existingEmails } = await db.from('emails_sent').select('id')
      .eq('client_id', client.id).eq('type', 'premium_report').limit(1);

    if (existingEmails && existingEmails.length > 0) {
      results.push({ email: client.email, status: 'already_sent' });
      continue;
    }
    if (!client.email) { results.push({ email: 'no_email', status: 'skipped' }); continue; }

    const positions = matchPositions(client);
    const emailHtml = generateFullPremiumEmail(client, positions);
    const subject = `${client.first_name || 'Candidat'}, votre rapport premium complet est prêt — ${positions.length > 0 ? positions.length + ' poste' + (positions.length > 1 ? 's' : '') + ' disponible' + (positions.length > 1 ? 's' : '') + ' — ' : ''}SOS Hub Canada`;

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId, template_id: templateId, user_id: publicKey, accessToken: privateKey,
            template_params: { to_email: client.email, subject, message: emailHtml, from_name: 'SOS Hub Canada — SOSIA', reply_to: 'info@soshubcanada.com' },
          }),
        });
        await db.from('emails_sent').insert({
          client_id: client.id, to_email: client.email, subject, body: emailHtml, type: 'premium_report', sent_by: null, // envoi automatique par le cron (pas d'utilisateur staff)
        });
        sent++;
        results.push({ email: client.email, status: 'sent' });
      } catch (err) {
        results.push({ email: client.email, status: `error: ${err instanceof Error ? err.message : 'unknown'}` });
      }
    } else {
      await db.from('emails_sent').insert({
        client_id: client.id, to_email: client.email, subject, body: emailHtml, type: 'premium_report', sent_by: null, // envoi automatique par le cron (pas d'utilisateur staff)
      });
      sent++;
      results.push({ email: client.email, status: 'simulated' });
    }
  }

  return NextResponse.json({ message: 'Premium followup completed', checked: paidClients?.length || 0, sent, results, timestamp: now.toISOString() });
}

// Manual trigger from CRM
export async function POST(request: Request) {
  try {
    const { clientId, clientEmail, clientData } = await request.json();
    if (!clientEmail) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    const client = clientData || { email: clientEmail, first_name: 'Client' };
    const positions = matchPositions(client);
    const emailHtml = generateFullPremiumEmail(client, positions);
    const subject = `${client.first_name || 'Candidat'}, votre rapport premium complet — SOS Hub Canada`;

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (serviceId && templateId && publicKey) {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId, template_id: templateId, user_id: publicKey, accessToken: privateKey,
          template_params: { to_email: clientEmail, subject, message: emailHtml, from_name: 'SOS Hub Canada — SOSIA', reply_to: 'info@soshubcanada.com' },
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: `EmailJS: ${errText}` }, { status: 502 });
      }
    }

    return NextResponse.json({ success: true, message: 'Rapport premium envoyé' });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
