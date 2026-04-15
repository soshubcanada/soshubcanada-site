// ========================================================
// SOS Hub Canada - Envoi automatise d'analyse 23h apres reception lead
// Cron: execute toutes les heures, envoie aux leads de 23h+
// Inclut: resultats admissibilite condenses + recommandations
// ========================================================
import { NextResponse } from 'next/server';
import { isSupabaseReady, createServiceClient } from '@/lib/supabase';
import { DEMO_EMPLOYERS } from '@/lib/crm-employers';
import { analyzeEligibility, descriptiveToNCLC, descriptiveToCLB } from '@/lib/eligibility-engine';
import type { ClientProfile, ProgramEligibility } from '@/lib/eligibility-engine';

/* eslint-disable @typescript-eslint/no-explicit-any */

// On envoie a J+1 apres creation du lead (23h = "un peu moins de 24h"
// pour que le cron qui tourne a `0 * * * *` ne rate pas la fenetre).
// On garde aussi une borne de rattrapage a J+3 : si un tick du cron
// a ete manque (erreur Vercel, deploiement, etc.), les leads non encore
// contactes sont rattrapes automatiquement.
const FOLLOWUP_DELAY_HOURS = 23;
const FOLLOWUP_CATCHUP_HOURS = 72;

// ─── Build ClientProfile from DB client record ────────────
function buildProfileFromClient(client: any): ClientProfile {
  const frLevel = (client.language_french || 'none').toLowerCase();
  const enLevel = (client.language_english || 'none').toLowerCase();
  const edu = (client.education || '').toLowerCase();

  const educationMap: Record<string, ClientProfile['highestEducation']> = {
    'secondaire': 'secondary', 'secondary': 'secondary', 'high_school': 'secondary',
    'dep': 'one_year_diploma', 'aec': 'one_year_diploma', 'one_year': 'one_year_diploma',
    'dec': 'two_year_diploma', 'college': 'two_year_diploma', 'two_year': 'two_year_diploma',
    'three_year': 'three_year_diploma', 'trois_ans': 'three_year_diploma',
    'baccalaureat': 'bachelors', 'bachelors': 'bachelors', 'bachelor': 'bachelors', 'licence': 'bachelors',
    'maitrise': 'masters', 'masters': 'masters', 'master': 'masters',
    'doctorat': 'phd', 'phd': 'phd',
  };

  let highestEdu: ClientProfile['highestEducation'] = 'secondary';
  for (const [key, val] of Object.entries(educationMap)) {
    if (edu.includes(key)) { highestEdu = val; break; }
  }

  const age = client.date_of_birth
    ? Math.floor((Date.now() - new Date(client.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 30;

  return {
    age,
    nationality: client.nationality || client.country_of_residence || 'other',
    maritalStatus: 'single',
    hasSpouse: false,
    numberOfDependents: 0,
    currentCountry: client.country_of_residence || 'other',
    isInCanada: (client.current_status === 'worker' || client.current_status === 'student' || client.country_of_residence === 'Canada'),
    isInQuebec: (client.province === 'QC' || client.province === 'Quebec'),
    yearsInCanada: client.canadian_work_experience_years || 0,
    yearsInQuebec: client.quebec_work_experience_years || 0,
    highestEducation: highestEdu,
    hasCanadianEducation: !!client.has_canadian_education,
    hasECA: false,
    frenchLevel: frLevel.includes('avance') || frLevel.includes('advanced') || frLevel.includes('native') ? 'advanced'
      : frLevel.includes('inter') ? 'intermediate'
      : frLevel.includes('basic') || frLevel.includes('debutant') ? 'basic' : 'none',
    frenchNCLC: descriptiveToNCLC(frLevel),
    englishLevel: enLevel.includes('avance') || enLevel.includes('advanced') || enLevel.includes('native') ? 'advanced'
      : enLevel.includes('inter') ? 'intermediate'
      : enLevel.includes('basic') || enLevel.includes('debutant') ? 'basic' : 'none',
    englishCLB: descriptiveToCLB(enLevel),
    hasLanguageTest: false,
    totalWorkExperienceYears: client.total_work_experience_years || 2,
    canadianWorkExperienceYears: client.canadian_work_experience_years || 0,
    quebecWorkExperienceYears: client.quebec_work_experience_years || 0,
    hasJobOffer: false,
    hasRelativeInCanada: false,
    hasSpouseInCanada: false,
    currentStatus: client.current_status || 'citizen_other',
    hasValidPermit: client.current_status === 'worker' || client.current_status === 'student',
    settlementFunds: 15000,
    isRefugee: false,
    hasCriminalRecord: false,
    hasMedicalIssue: false,
    hasBusinessExperience: false,
  };
}

// ─── Eligibility badge color ──────────────────────────────
function eligibilityColor(e: string): { bg: string; text: string; label: string } {
  switch (e) {
    case 'eligible': return { bg: '#059669', text: '#FFFFFF', label: 'ÉLIGIBLE' };
    case 'likely_eligible': return { bg: '#2563EB', text: '#FFFFFF', label: 'PROBABLEMENT ÉLIGIBLE' };
    case 'possibly_eligible': return { bg: '#D97706', text: '#FFFFFF', label: 'POSSIBLEMENT ÉLIGIBLE' };
    default: return { bg: '#9CA3AF', text: '#FFFFFF', label: 'À ÉVALUER' };
  }
}

// Match client experience to employer positions
function matchPositions(client: any): { employer: string; position: string; wage: number; industry: string; nocCode: string }[] {
  const matches: { employer: string; position: string; wage: number; industry: string; nocCode: string }[] = [];
  const exp = (client.work_experience || client.notes || '').toLowerCase();
  const edu = (client.education || '').toLowerCase();

  for (const emp of DEMO_EMPLOYERS) {
    if (emp.status !== 'actif') continue;
    for (const lmia of emp.lmiaApplications) {
      if (lmia.status !== 'approuve' && lmia.status !== 'en_traitement' && lmia.status !== 'soumis') continue;
      if (lmia.workersFound >= lmia.workersRequested && lmia.status === 'approuve') continue;

      const pos = lmia.position.toLowerCase();
      const match =
        (pos.includes('develop') && (exp.includes('develop') || exp.includes('logiciel') || exp.includes('program') || edu.includes('informatique'))) ||
        (pos.includes('cyber') && (exp.includes('cyber') || exp.includes('securit') || exp.includes('reseau'))) ||
        (pos.includes('cuisin') && (exp.includes('cuisin') || exp.includes('restaur') || exp.includes('chef'))) ||
        (pos.includes('agricol') && (exp.includes('agricol') || exp.includes('ferme') || exp.includes('maraich'))) ||
        (pos.includes('analys') && (exp.includes('analys') || exp.includes('financ') || exp.includes('comptab')));

      if (match) {
        matches.push({ employer: emp.companyName, position: lmia.position, wage: lmia.wageOffered, industry: emp.industry, nocCode: lmia.nocCode });
      }
    }
  }
  return matches;
}

// ─── Generate Premium HTML Email WITH Eligibility Results ──
function generatePremiumEmail(client: any, positions: ReturnType<typeof matchPositions>): string {
  const name = client.first_name || client.name?.split(' ')[0] || 'Candidat';
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.name || 'Candidat';
  const frLevel = client.language_french || 'N/A';
  const enLevel = client.language_english || 'N/A';
  const education = client.education || 'N/A';
  const experience = client.work_experience || 'N/A';
  const hasPositions = positions.length > 0;

  // ── Run eligibility analysis ──
  const profile = buildProfileFromClient(client);
  const analysis = analyzeEligibility(profile, fullName);

  // Sort: eligible first, then by priority, put Permis travail first
  const sortedPrograms = [...analysis.programs]
    .filter(p => p.eligibility !== 'not_eligible' && p.eligibility !== 'ended')
    .sort((a, b) => {
      // Permis travail always first
      if (a.programId.includes('work_permit') || a.programId.includes('permis_travail')) return -1;
      if (b.programId.includes('work_permit') || b.programId.includes('permis_travail')) return 1;
      // Then permis etudes
      if (a.programId.includes('study_permit') || a.programId.includes('permis_etudes')) return -1;
      if (b.programId.includes('study_permit') || b.programId.includes('permis_etudes')) return 1;
      // Then by eligibility score
      const eligOrder = { eligible: 0, likely_eligible: 1, possibly_eligible: 2 };
      const aO = eligOrder[a.eligibility as keyof typeof eligOrder] ?? 3;
      const bO = eligOrder[b.eligibility as keyof typeof eligOrder] ?? 3;
      if (aO !== bO) return aO - bO;
      return b.score - a.score;
    })
    .slice(0, 6); // Top 6 programs max for email

  const eligibleCount = sortedPrograms.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible').length;
  const totalAnalyzed = analysis.programs.length;

  // Collect top 4 recommendations across all programs
  const allRecs = new Set<string>();
  for (const p of sortedPrograms) {
    for (const r of p.recommendations.slice(0, 2)) {
      allRecs.add(r);
      if (allRecs.size >= 4) break;
    }
    if (allRecs.size >= 4) break;
  }
  const topRecommendations = Array.from(allRecs).slice(0, 4);

  // Collect key strengths
  const allStrengths = new Set<string>();
  for (const p of sortedPrograms) {
    for (const s of p.keyStrengths.slice(0, 2)) {
      allStrengths.add(s);
      if (allStrengths.size >= 3) break;
    }
    if (allStrengths.size >= 3) break;
  }
  const topStrengths = Array.from(allStrengths).slice(0, 3);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Votre analyse d'admissibilite - SOS Hub Canada</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF">

<!-- HEADER -->
<div style="background-color:#1B2559;padding:32px 24px;text-align:center">
  <div style="font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-1px">[ SOS <span style="color:#D4A03C">HUB</span> ]</div>
  <div style="color:#D4A03C;font-size:11px;font-weight:700;letter-spacing:4px;margin-top:4px">RELOCALISATION & SERVICES</div>
</div>

<!-- URGENCY BAR -->
<div style="background-color:#D4A03C;padding:12px 24px;text-align:center">
  <span style="color:#FFFFFF;font-size:13px;font-weight:700">VOTRE ANALYSE D'ADMISSIBILITÉ EST PRÊTE</span>
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
    <tr>
      <td style="padding:6px 0;color:#6B7280;font-size:13px;width:40%">Francais</td>
      <td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${frLevel}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#6B7280;font-size:13px">Anglais</td>
      <td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${enLevel}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#6B7280;font-size:13px">Éducation</td>
      <td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${education}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#6B7280;font-size:13px">Expérience</td>
      <td style="padding:6px 0;color:#1B2559;font-size:13px;font-weight:600">${experience}</td>
    </tr>
    ${analysis.crsEstimate ? `<tr>
      <td style="padding:6px 0;color:#6B7280;font-size:13px">Score CRS estimé</td>
      <td style="padding:6px 0;color:#D4A03C;font-size:15px;font-weight:800">${analysis.crsEstimate} / 1200</td>
    </tr>` : ''}
  </table>
</div>

<!-- ═══════════════════════════════════════════════════ -->
<!-- RÉSULTATS D'ADMISSIBILITÉ — SECTION CONDENSÉE     -->
<!-- ═══════════════════════════════════════════════════ -->
<div style="margin:24px">
  <div style="text-align:center;margin-bottom:16px">
    <div style="display:inline-block;background:#059669;color:#FFFFFF;font-size:10px;font-weight:800;padding:5px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:1px">Résultats de votre évaluation</div>
  </div>

  <!-- Summary stats -->
  <div style="display:flex;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="text-align:center;padding:8px;width:33%">
          <div style="font-size:28px;font-weight:900;color:#059669">${eligibleCount}</div>
          <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:1px">Programme${eligibleCount > 1 ? 's' : ''} éligible${eligibleCount > 1 ? 's' : ''}</div>
        </td>
        <td style="text-align:center;padding:8px;width:33%;border-left:1px solid #BBF7D0;border-right:1px solid #BBF7D0">
          <div style="font-size:28px;font-weight:900;color:#1B2559">${totalAnalyzed}</div>
          <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:1px">Programmes analysés</div>
        </td>
        <td style="text-align:center;padding:8px;width:33%">
          <div style="font-size:28px;font-weight:900;color:#D4A03C">${analysis.crsEstimate || '—'}</div>
          <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:1px">Score CRS</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Eligible Programs List -->
  <div style="margin-bottom:16px">
    <div style="font-size:12px;color:#1B2559;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #D4A03C">Programmes pour lesquels vous êtes éligible</div>
    ${sortedPrograms.map((p, i) => {
      const color = eligibilityColor(p.eligibility);
      const isFirst = i === 0;
      return `
    <div style="background:${isFirst ? '#F0FDF4' : '#F8FAFC'};border-radius:8px;padding:14px;margin-bottom:8px;border-left:4px solid ${color.bg};${isFirst ? 'border:2px solid #059669;' : ''}">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="vertical-align:top">
            <div style="font-size:14px;font-weight:700;color:#1B2559;margin-bottom:2px">${isFirst ? '★ ' : ''}${p.programNameFr}</div>
            <div style="font-size:11px;color:#6B7280;margin-bottom:6px">Délai estimé : ${p.estimatedProcessingTime}</div>
            ${p.keyStrengths.length > 0 ? `<div style="font-size:11px;color:#059669">✓ ${p.keyStrengths.slice(0, 2).join(' • ')}</div>` : ''}
            ${isFirst && hasPositions ? `<div style="font-size:11px;color:#D4A03C;font-weight:700;margin-top:4px">→ <strong>SOS Hub Canada</strong> peut vous aider à déposer votre demande avec un employeur partenaire</div>` : ''}
          </td>
          <td style="width:110px;text-align:right;vertical-align:top">
            <div style="display:inline-block;background:${color.bg};color:${color.text};font-size:9px;font-weight:800;padding:4px 8px;border-radius:12px;text-transform:uppercase;white-space:nowrap">${color.label}</div>
            ${p.score > 0 ? `<div style="font-size:10px;color:#6B7280;margin-top:4px">Score : ${p.score}%</div>` : ''}
          </td>
        </tr>
      </table>
    </div>`;
    }).join('')}
  </div>

  ${topStrengths.length > 0 ? `
  <!-- Points forts -->
  <div style="background:#F0FDF4;border-radius:8px;padding:14px;margin-bottom:12px;border:1px solid #BBF7D0">
    <div style="font-size:11px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✓ Vos points forts</div>
    ${topStrengths.map(s => `<div style="font-size:12px;color:#374151;padding:3px 0">• ${s}</div>`).join('')}
  </div>` : ''}

  ${topRecommendations.length > 0 ? `
  <!-- Recommandations -->
  <div style="background:#FEF3C7;border-radius:8px;padding:14px;margin-bottom:12px;border:1px solid #FDE68A">
    <div style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💡 Recommandations pour renforcer votre dossier</div>
    ${topRecommendations.map(r => `<div style="font-size:12px;color:#374151;padding:3px 0">→ ${r}</div>`).join('')}
  </div>` : ''}

  <!-- Blurred premium teaser -->
  <div style="background:#F1F5F9;border-radius:12px;padding:20px;text-align:center;border:2px dashed #CBD5E1;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background-color:rgba(241,245,249,0.9);pointer-events:none"></div>
    <div style="position:relative">
      <div style="font-size:11px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Rapport détaillé premium</div>
      <div style="color:#64748B;font-size:12px;line-height:1.6">
        Score CRS détaillé par catégorie • Plan d'amélioration personnalisé<br>
        Analyse des 12 programmes restants • Checklist de documents<br>
        Graphiques comparatifs • Stratégie recommandée
      </div>
      <div style="margin-top:12px;font-size:10px;color:#94A3B8">Débloquez avec l'offre ci-dessous ↓</div>
    </div>
  </div>
</div>

${hasPositions ? `
<!-- EMPLOYER MATCH — KEY CONVERSION SECTION -->
<div style="margin:24px;background-color:#1B2559;border-radius:12px;padding:24px;color:#FFFFFF">
  <div style="text-align:center;margin-bottom:16px">
    <div style="display:inline-block;background:#D4A03C;color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px">Opportunité exclusive</div>
  </div>
  <h2 style="color:#FFFFFF;font-size:18px;text-align:center;margin:0 0 8px">
    ${positions.length} poste${positions.length > 1 ? 's' : ''} disponible${positions.length > 1 ? 's' : ''} chez nos employeurs partenaires
  </h2>
  <p style="color:rgba(255,255,255,0.7);font-size:13px;text-align:center;margin:0 0 20px">
    Ces employeurs ont déjà une EIMT approuvée ou en cours — le processus est accéléré.
  </p>
  ${positions.map(p => `
  <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:16px;margin-bottom:8px;border-left:3px solid #D4A03C">
    <div style="font-size:15px;font-weight:700;color:#FFFFFF">${p.position}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px">${p.employer} — ${p.industry}</div>
    <div style="font-size:12px;color:#D4A03C;font-weight:600;margin-top:4px">${p.wage.toFixed(2)} $/h | NOC ${p.nocCode}</div>
  </div>`).join('')}
  <div style="text-align:center;margin-top:20px">
    <div style="color:rgba(255,255,255,0.5);font-size:11px">Ces postes se remplissent rapidement — agissez maintenant</div>
  </div>
</div>
` : ''}

<!-- WHAT WE CAN DO -->
<div style="padding:0 24px 16px">
  <h2 style="color:#1B2559;font-size:16px;margin:24px 0 12px">Ce que <strong>SOS Hub Canada</strong> peut faire pour vous</h2>
  <table style="width:100%;border-collapse:collapse">
    ${[
      { icon: '1', text: 'Analyse approfondie de votre admissibilité à tous les programmes' },
      { icon: '2', text: 'Jumelage avec un employeur partenaire pour un permis de travail' },
      { icon: '3', text: 'Préparation et dépôt de votre demande auprès d\'IRCC' },
      { icon: '4', text: 'Suivi complet jusqu\'à l\'obtention de votre visa' },
    ].map(s => `
    <tr>
      <td style="padding:8px 12px 8px 0;vertical-align:top;width:36px">
        <div style="width:28px;height:28px;background:#D4A03C;border-radius:50%;text-align:center;line-height:28px;color:#FFFFFF;font-size:13px;font-weight:800">${s.icon}</div>
      </td>
      <td style="padding:8px 0;color:#4B5563;font-size:13px;line-height:1.5">${s.text}</td>
    </tr>`).join('')}
  </table>
</div>

<!-- URGENCY BLOCK -->
<div style="margin:0 24px;background:#FEF3C7;border:2px solid #D4A03C;border-radius:12px;padding:20px;text-align:center">
  <div style="font-size:20px;margin-bottom:8px">⏰</div>
  <div style="color:#92400E;font-size:14px;font-weight:700;margin-bottom:4px">
    Les délais de traitement augmentent chaque mois
  </div>
  <div style="color:#92400E;font-size:12px;line-height:1.5">
    Les programmes d'immigration ont des places limitées. Plus vous attendez, plus le processus sera long.
    <strong>Chaque semaine compte.</strong>
  </div>
</div>

<!-- OFFRE PREMIUM — RAPPORT COMPLET + CONSULTATION -->
<div style="margin:24px;background-color:#1B2559;border-radius:16px;padding:28px;text-align:center;position:relative;overflow:hidden">
  <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(212,160,60,0.15)"></div>
  <div style="position:absolute;bottom:-15px;left:-15px;width:60px;height:60px;border-radius:50%;background:rgba(212,160,60,0.1)"></div>
  <div style="position:relative">
    <div style="display:inline-block;background-color:#D4A03C;color:#FFFFFF;font-size:10px;font-weight:800;padding:4px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Offre spéciale — Durée limitée</div>
    <h2 style="color:#FFFFFF;font-size:20px;font-weight:900;margin:0 0 8px">Rapport complet + Consultation gratuite</h2>
    <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0 0 16px;line-height:1.5">
      Recevez votre analyse détaillée de 12 programmes avec recommandations personnalisées,<br>
      <strong style="color:#D4A03C">incluant une consultation gratuite de 30 minutes</strong> avec un de nos experts en immigration.
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
    <a href="https://soshubca.vercel.app/achat-rapport?plan=analyse-premium&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(client.email || '')}"
       style="display:inline-block;background-color:#D4A03C;color:#FFFFFF;font-size:16px;font-weight:900;padding:16px 40px;border-radius:12px;text-decoration:none">
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
     style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:14px;font-weight:800;padding:12px 28px;border-radius:12px;text-decoration:none;margin-bottom:8px">
    WhatsApp
  </a>
  &nbsp;
  <a href="mailto:info@soshubcanada.com?subject=${encodeURIComponent(`Rapport complet - ${fullName}`)}"
     style="display:inline-block;background:#1B2559;color:#FFFFFF;font-size:14px;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">
    Courriel
  </a>
  <div style="margin-top:12px;color:#9CA3AF;font-size:11px">
    <strong style="color:#1B2559">SOS Hub Canada</strong> | +1 (438) 630-2869 | info@soshubcanada.com
  </div>
</div>

<!-- SOCIAL PROOF -->
<div style="background:#F8FAFC;padding:20px 24px;text-align:center;border-top:1px solid #E2E8F0">
  <div style="display:inline-block;margin:0 12px;text-align:center">
    <div style="font-size:22px;font-weight:900;color:#1B2559">500+</div>
    <div style="font-size:10px;color:#6B7280;text-transform:uppercase">Familles accompagnées</div>
  </div>
  <div style="display:inline-block;margin:0 12px;text-align:center">
    <div style="font-size:22px;font-weight:900;color:#D4A03C">94%</div>
    <div style="font-size:10px;color:#6B7280;text-transform:uppercase">Taux de réussite</div>
  </div>
  <div style="display:inline-block;margin:0 12px;text-align:center">
    <div style="font-size:22px;font-weight:900;color:#1B2559">24h</div>
    <div style="font-size:10px;color:#6B7280;text-transform:uppercase">Temps de réponse</div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#1B2559;padding:24px;text-align:center">
  <div style="font-size:18px;font-weight:900;color:#FFFFFF">SOS <span style="color:#D4A03C">Hub</span> Canada</div>
  <div style="color:rgba(255,255,255,0.6);font-size:12px;margin-top:8px">
    3737 Cremazie Est #402, Montreal QC H1Z 2K4<br>
    info@soshubcanada.com | +1 (438) 630-2869
  </div>
  <div style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:12px">
    Vous recevez ce courriel suite à votre test d'admissibilité sur soshub.ca
  </div>
</div>

</div>
</body></html>`;
}

export async function GET(request: Request) {
  // Verify cron secret or allow in dev
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  // Fail closed: if no secret configured, block access
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseReady()) {
    return NextResponse.json({ message: 'Supabase not configured — skipping', sent: 0 });
  }

  const db = createServiceClient() as any;
  const now = new Date();
  // Fenetre [J+3 ; J+1] avec rattrapage automatique des ticks rates.
  const catchupCutoff = new Date(now.getTime() - FOLLOWUP_CATCHUP_HOURS * 60 * 60 * 1000);
  const cutoffMax = new Date(now.getTime() - FOLLOWUP_DELAY_HOURS * 60 * 60 * 1000);

  // Find clients created in the window [J-3, J-1] still in prospect stage
  // and not yet emailed. On prend large pour rattraper les ticks rates.
  const { data: recentClients, error: fetchErr } = await db
    .from('clients')
    .select('*')
    .eq('status', 'prospect')
    .gte('created_at', catchupCutoff.toISOString())
    .lte('created_at', cutoffMax.toISOString());

  if (fetchErr || !recentClients) {
    return NextResponse.json({ error: fetchErr?.message || 'No clients found', sent: 0 });
  }

  let sent = 0;
  const results: { email: string; status: string }[] = [];

  for (const client of recentClients) {
    // Dedupe : on ne renvoie pas si le staff a deja envoye manuellement
    // une analyse (type='analysis') OU si le cron est deja passe
    // (type='scoring_results')
    const { data: existingEmails } = await db
      .from('emails_sent')
      .select('id, type')
      .eq('client_id', client.id)
      .in('type', ['scoring_results', 'analysis'])
      .limit(1);

    if (existingEmails && existingEmails.length > 0) {
      results.push({ email: client.email, status: 'already_sent' });
      continue;
    }

    if (!client.email) {
      results.push({ email: 'no_email', status: 'skipped' });
      continue;
    }

    // Match positions
    const positions = matchPositions(client);

    // Generate email
    const emailHtml = generatePremiumEmail(client, positions);
    const subject = positions.length > 0
      ? `${client.first_name || 'Candidat'}, ${positions.length} poste${positions.length > 1 ? 's' : ''} disponible${positions.length > 1 ? 's' : ''} pour vous — SOS Hub Canada`
      : `${client.first_name || 'Candidat'}, votre analyse d'admissibilité est prête — SOS Hub Canada`;

    // Send via EmailJS
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
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
              to_email: client.email,
              subject,
              message: emailHtml,
              from_name: 'SOS Hub Canada',
              reply_to: 'info@soshubcanada.com',
            },
          }),
        });

        // Log email
        await db.from('emails_sent').insert({
          client_id: client.id,
          to_email: client.email,
          subject,
          body: emailHtml,
          type: 'scoring_results',
          sent_by: null, // envoi automatique par le cron (pas d'utilisateur staff)
        });

        sent++;
        results.push({ email: client.email, status: 'sent' });
      } catch (err) {
        results.push({ email: client.email, status: `error: ${err instanceof Error ? err.message : 'unknown'}` });
      }
    } else {
      // Simulation mode
      if (process.env.NODE_ENV === 'development') console.log(`[AUTO-FOLLOWUP] Would send to ${client.email}: ${subject}`);
      await db.from('emails_sent').insert({
        client_id: client.id,
        to_email: client.email,
        subject,
        body: emailHtml,
        type: 'scoring_results',
        sent_by: null, // envoi automatique par le cron (pas d'utilisateur staff)
      });
      sent++;
      results.push({ email: client.email, status: 'simulated' });
    }
  }

  return NextResponse.json({
    message: `Auto-followup completed`,
    checked: recentClients.length,
    sent,
    results,
    timestamp: now.toISOString(),
  });
}
