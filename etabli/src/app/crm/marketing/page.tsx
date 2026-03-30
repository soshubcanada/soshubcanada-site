"use client";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm } from "@/lib/crm-store";
import { ROLE_PERMISSIONS } from "@/lib/crm-types";
import type { Client } from "@/lib/crm-types";
import {
  Mail, Send, Users, BarChart3, FileText, Clock, ShieldX,
  Eye, EyeOff, ChevronDown, Check, Search, X, Sparkles,
  Copy, RefreshCw, Loader2, CheckCircle2, AlertCircle, Plus,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";

// ============================================================
// Types
// ============================================================
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  body: string;
}

interface CampaignRecord {
  id: string;
  date: string;
  templateName: string;
  subject: string;
  recipientCount: number;
  segment: string;
  status: "envoye" | "en_cours" | "echoue";
  sentBy: string;
}

type TabKey = "campagnes" | "templates" | "historique";
type Segment = "tous" | "actifs" | "prospects" | "inactifs" | "programme" | "custom";

// ============================================================
// Brand constants
// ============================================================
const NAVY = "#1B2559";
const GOLD = "#D4A03C";
const NAVY_LIGHT = "#243070";
const GOLD_LIGHT = "#F0C46A";

// Logo HTML pur — technique Apple/Stripe — aucune image, rendu parfait dans TOUS les clients email
// Gmail bloque SVG, Outlook bloque certains PNG base64, mais le HTML texte est TOUJOURS rendu
function logoHtml(variant: "white" | "navy", size: "lg" | "md" | "sm" = "lg"): string {
  const txtColor = variant === "white" ? "#FFFFFF" : NAVY;
  const goldColor = GOLD;
  const sizes = {
    lg:  { sos: "36px", hub: "20px", bracket: "52px", hubSpacing: "8px", pad: "4px 8px" },
    md:  { sos: "22px", hub: "13px", bracket: "32px", hubSpacing: "5px", pad: "2px 4px" },
    sm:  { sos: "14px", hub: "8px",  bracket: "20px", hubSpacing: "3px", pad: "1px 2px" },
  };
  const s = sizes[size];
  return '<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>' +
    '<td valign="middle" style="color:' + txtColor + ';font-size:' + s.bracket + ';font-weight:900;font-family:Arial Black,Arial,sans-serif;line-height:1;padding:' + s.pad + ';">&#91;</td>' +
    '<td valign="middle" style="text-align:center;padding:' + s.pad + ';">' +
      '<p style="margin:0;color:' + txtColor + ';font-size:' + s.sos + ';font-weight:900;font-family:Arial Black,Arial,sans-serif;letter-spacing:2px;line-height:1.1;">SOS</p>' +
      '<p style="margin:0;color:' + goldColor + ';font-size:' + s.hub + ';font-weight:900;font-family:Arial Black,Arial,sans-serif;letter-spacing:' + s.hubSpacing + ';line-height:1.1;">HUB</p>' +
    '</td>' +
    '<td valign="middle" style="color:' + txtColor + ';font-size:' + s.bracket + ';font-weight:900;font-family:Arial Black,Arial,sans-serif;line-height:1;padding:' + s.pad + ';">&#93;</td>' +
  '</tr></table>';
}

const HEADER_HTML = `
<tr><td style="background:${NAVY};padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:28px 32px 20px;text-align:center;">
      ${logoHtml("white", "lg")}
    </td></tr>
    <tr><td style="padding:0 32px;">
      <div style="height:1px;background:${GOLD};opacity:0.35;"></div>
    </td></tr>
    <tr><td style="padding:8px 32px 0;text-align:center;">
      <p style="margin:0;color:#64748b;font-size:9px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">RELOCALISATION &amp; SERVICES</p>
    </td></tr>
  </table>
</td></tr>`;

const FOOTER_HTML = `
<tr><td style="background:#f8fafc;padding:28px 32px 20px;border-top:1px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="text-align:center;padding-bottom:14px;">
      ${logoHtml("navy", "md")}
    </td></tr>
    <tr><td style="text-align:center;padding-bottom:12px;">
      <a href="tel:+14386302869" style="color:${NAVY};text-decoration:none;font-size:13px;font-weight:600;font-family:Arial,sans-serif;">+1 (438) 630-2869</a>
      <span style="color:#cbd5e1;margin:0 8px;">|</span>
      <a href="mailto:info@soshubcanada.com" style="color:${NAVY};text-decoration:none;font-size:13px;font-weight:600;font-family:Arial,sans-serif;">info@soshubcanada.com</a>
    </td></tr>
    <tr><td style="text-align:center;padding-bottom:16px;">
      <p style="margin:0;color:#94a3b8;font-size:11px;font-family:Arial,sans-serif;">3737 Cr&#233;mazie Est #402, Montr&#233;al QC H1Z 2K4</p>
    </td></tr>
    <tr><td style="text-align:center;">
      <p style="margin:0;color:#cbd5e1;font-size:10px;line-height:1.6;font-family:Arial,sans-serif;">
        Vous recevez ce message car vous &#234;tes client ou prospect de SOS Hub Canada.<br/>
        Pour vous d&#233;sinscrire, r&#233;pondez avec la mention <strong>STOP</strong>.
      </p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="background:${NAVY};padding:10px 32px;text-align:center;">
  <p style="margin:0;color:#334155;font-size:9px;letter-spacing:1px;font-family:Arial,sans-serif;">&#169; 2026 SOS Hub Canada Inc. &mdash; Tous droits r&#233;serv&#233;s.</p>
</td></tr>`;

function btn(label: string, href: string = "#", bg: string = GOLD, color: string = NAVY): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr><td style="background:${bg};border-radius:6px;padding:0;">
      <a href="${href}" style="display:inline-block;color:${color};text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;letter-spacing:0.5px;">${label}</a>
    </td></tr>
  </table>`;
}

function infoBox(content: string, borderColor: string = GOLD, bg: string = "#fffbf0"): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td style="background:${bg};border-left:4px solid ${borderColor};border-radius:0 8px 8px 0;padding:16px 20px;">
      ${content}
    </td></tr>
  </table>`;
}

function stepRow(num: string, title: string, desc: string): string {
  return `<tr>
    <td valign="top" style="width:40px;padding-right:16px;padding-bottom:20px;">
      <div style="width:32px;height:32px;background:${NAVY};border-radius:50%;text-align:center;line-height:32px;color:${GOLD};font-weight:800;font-size:14px;">${num}</div>
    </td>
    <td style="padding-bottom:20px;">
      <p style="margin:0 0 4px;color:${NAVY};font-weight:700;font-size:14px;">${title}</p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">${desc}</p>
    </td>
  </tr>`;
}

function signature(name: string = "L&#39;&#233;quipe SOS Hub Canada", title: string = "Votre conseiller d&#233;di&#233;"): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:20px;">
    <tr>
      <td valign="middle" style="width:60px;padding-right:14px;">
        ${logoHtml("navy", "sm")}
      </td>
      <td>
        <p style="margin:0;color:${NAVY};font-weight:700;font-size:14px;font-family:Arial,sans-serif;">${name}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:12px;font-family:Arial,sans-serif;">${title} &mdash; SOS Hub Canada</p>
      </td>
    </tr>
  </table>`;
}

function wrapHtml(innerRows: string, heroBg: string = NAVY): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SOS Hub Canada</title></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;">
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(27,37,89,0.12);">
${HEADER_HTML}
${innerRows}
${FOOTER_HTML}
</table>
</td></tr></table>
</body></html>`;
}

// ============================================================
// Templates
// ============================================================
const EMAIL_TEMPLATES: EmailTemplate[] = [
  // 1. BIENVENUE
  {
    id: "bienvenue",
    name: "Bienvenue nouveau client",
    subject: "Bienvenue chez SOS Hub Canada, {{prenom}} \u2014 Votre parcours commence ici",
    category: "Onboarding",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:40px 32px 36px;text-align:center;">
  <p style="margin:0 0 12px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Confirmation d&#39;inscription</p>
  <h1 style="margin:0 0 12px;color:#ffffff;font-size:28px;font-weight:900;line-height:1.2;font-family:Georgia,serif;">Bienvenue, {{prenom}}&#160;!</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:15px;line-height:1.6;">Vous avez fait le bon choix. Notre &#233;quipe est l&#224; pour vous.</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}} {{nom}}</strong>,</p>
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Nous sommes honor&#233;s de vous accueillir au sein de <strong style="color:${NAVY};">SOS Hub Canada</strong>. Votre dossier a &#233;t&#233; cr&#233;&#233; et un conseiller d&#233;di&#233; vous contactera dans les <strong>24 heures</strong> pour planifier votre premi&#232;re consultation.</p>
  <p style="margin:0 0 28px;color:#334155;font-size:14px;line-height:1.7;font-weight:600;color:${NAVY};">Voici les 3 prochaines &#233;tapes&#160;:</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${stepRow("1", "Consultation initiale", "Votre conseiller vous appellera pour comprendre votre projet et vos objectifs.")}
    ${stepRow("2", "Analyse de votre dossier", "Nous &#233;valuons votre admissibilit&#233; et les programmes les plus adapt&#233;s &#224; votre profil.")}
    ${stepRow("3", "Plan d&#39;action personnalis&#233;", "Vous recevrez une feuille de route claire avec les &#233;tapes, d&#233;lais et co&#251;ts.")}
  </table>
  ${infoBox(`<p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">&#128276; &#192; pr&#233;parer pour votre consultation</p>
  <p style="margin:6px 0 0;color:#78350f;font-size:13px;line-height:1.6;">Passeport en cours de validit&#233; &bull; Diplômes et transcriptions &bull; Historique d&#39;emploi des 5 derni&#232;res ann&#233;es &bull; R&#233;sultats de tests linguistiques (si disponibles)</p>`, "#f59e0b", "#fffbeb")}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">${btn("Acc&#233;der &#224; mon espace client", "#")}</td></tr>
  </table>
  ${signature("L&#39;&#233;quipe SOS Hub Canada", "Accompagnement &amp; Relocalisation")}
</td></tr>`),
  },

  // 2. CONFIRMATION DOCUMENTS
  {
    id: "confirmation_documents",
    name: "Confirmation de r\u00e9ception de documents",
    subject: "&#10003; Documents re\u00e7us \u2014 Dossier {{prenom}} {{nom}}",
    category: "Suivi",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:36px 32px 32px;text-align:center;">
  <div style="display:inline-block;background:#166534;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;margin-bottom:14px;">
    <span style="color:#ffffff;font-size:26px;">&#10003;</span>
  </div>
  <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:900;font-family:Georgia,serif;">Documents re&#231;us avec succ&#232;s</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:14px;">Confirmation de r&#233;ception &mdash; Dossier {{prenom}} {{nom}}</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">Nous confirmons la bonne r&#233;ception de vos documents. Notre &#233;quipe juridique proc&#233;dera &#224; leur v&#233;rification dans un d&#233;lai de <strong>48 heures ouvrables</strong>.</p>

  ${infoBox(`<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding-bottom:8px;">
        <p style="margin:0;color:#1e3a5f;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Statut du dossier</p>
        <p style="margin:4px 0 0;color:${NAVY};font-size:15px;font-weight:700;">{{statut_dossier}}</p>
      </td>
      <td style="padding-bottom:8px;text-align:right;">
        <p style="margin:0;color:#1e3a5f;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Programme</p>
        <p style="margin:4px 0 0;color:${NAVY};font-size:15px;font-weight:700;">{{programme}}</p>
      </td>
    </tr>
    <tr><td colspan="2"><div style="height:1px;background:#d4a03c;opacity:0.4;margin:8px 0;"></div></td></tr>
    <tr><td colspan="2">
      <p style="margin:0;color:#78350f;font-size:13px;">Date de r&#233;ception&#160;: <strong>{{date}}</strong></p>
    </td></tr>
  </table>`, GOLD, "#fffbeb")}

  <p style="margin:0 0 8px;color:${NAVY};font-size:14px;font-weight:700;">&#128203; Prochaines &#233;tapes</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${stepRow("1", "V&#233;rification", "Nos experts v&#233;rifient la conformit&#233; et l&#39;authenticit&#233; de chaque document.")}
    ${stepRow("2", "Confirmation", "Si des documents suppl&#233;mentaires sont requis, nous vous contacterons imm&#233;diatement.")}
    ${stepRow("3", "Soumission", "Votre dossier complet est soumis au programme s&#233;lectionn&#233;.")}
  </table>
  ${signature()}
</td></tr>`),
  },

  // 3. RAPPEL RDV
  {
    id: "rappel_rdv",
    name: "Rappel de rendez-vous",
    subject: "&#128197; Rappel \u2014 Votre rendez-vous est dans 24h",
    category: "Rappel",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:36px 32px 32px;text-align:center;">
  <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Rappel de rendez-vous</p>
  <h1 style="margin:0 0 10px;color:#ffffff;font-size:26px;font-weight:900;font-family:Georgia,serif;">C&#39;est demain,&#160;{{prenom}}&#160;!</h1>
  <div style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:800;font-size:20px;padding:10px 28px;border-radius:6px;margin-top:6px;">{{date}}</div>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">Nous vous rappelons votre rendez-vous avec votre conseiller SOS Hub Canada. Merci de vous pr&#233;senter <strong>10 minutes avant</strong> l&#39;heure convenue.</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <tr><td style="background:${NAVY};padding:10px 20px;">
      <p style="margin:0;color:${GOLD};font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">D&#233;tails du rendez-vous</p>
    </td></tr>
    <tr><td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;width:100px;">&#128197; Date</td>
          <td style="padding:6px 0;color:${NAVY};font-size:13px;font-weight:700;">{{date}}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;">&#128205; Adresse</td>
          <td style="padding:6px 0;color:${NAVY};font-size:13px;font-weight:700;">3737 Cr&#233;mazie Est #402<br/>Montr&#233;al QC H1Z 2K4</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;">&#128222; T&#233;l.</td>
          <td style="padding:6px 0;color:${NAVY};font-size:13px;font-weight:700;">+1 (438) 630-2869</td>
        </tr>
      </table>
    </td></tr>
  </table>

  ${infoBox(`<p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">&#128203; Documents &#224; apporter</p>
  <p style="margin:8px 0 0;color:#78350f;font-size:13px;line-height:1.7;">
    &#10003; Pi&#232;ce d&#39;identit&#233; valide (passeport de pr&#233;f&#233;rence)<br/>
    &#10003; Copies de tous les documents soumis<br/>
    &#10003; Questions &#224; poser &#224; votre conseiller<br/>
    &#10003; Carte de cr&#233;dit ou m&#233;thode de paiement
  </p>`, "#f59e0b", "#fffbeb")}

  <p style="margin:0 0 20px;color:#64748b;font-size:13px;line-height:1.7;">En cas d&#39;emp&#234;chement, veuillez nous pr&#233;venir au moins <strong>24 heures &#224; l&#39;avance</strong> par t&#233;l&#233;phone ou courriel.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td align="center">${btn("Voir l&#39;itin&#233;raire", "#")}</td></tr>
  </table>
  ${signature()}
</td></tr>`),
  },

  // 4. MAJ DOSSIER
  {
    id: "maj_dossier",
    name: "Mise \u00e0 jour du dossier",
    subject: "&#128260; Mise &#224; jour de votre dossier \u2014 {{programme}}",
    category: "Suivi",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:36px 32px 32px;text-align:center;">
  <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Mise &#224; jour de dossier</p>
  <h1 style="margin:0 0 10px;color:#ffffff;font-size:26px;font-weight:900;font-family:Georgia,serif;">Une mise &#224; jour vous concerne</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:14px;">Programme&#160;: {{programme}}</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">Nous avons le plaisir de vous informer d&#39;une <strong>mise &#224; jour importante</strong> concernant votre dossier. Voici le nouveau statut&#160;:</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:8px;overflow:hidden;border:1px solid #d1fae5;">
    <tr><td style="background:#064e3b;padding:10px 20px;">
      <p style="margin:0;color:#6ee7b7;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Nouveau statut</p>
    </td></tr>
    <tr><td style="background:#f0fdf4;padding:20px;">
      <p style="margin:0 0 6px;color:#166534;font-size:22px;font-weight:900;">{{statut_dossier}}</p>
      <p style="margin:0;color:#4ade80;font-size:12px;">Mis &#224; jour le {{date}}</p>
    </td></tr>
  </table>

  ${infoBox(`<p style="margin:0 0 6px;color:${NAVY};font-size:14px;font-weight:700;">Que se passe-t-il maintenant&#160;?</p>
  <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">Votre conseiller va analyser cette mise &#224; jour et vous pr&#233;senter les prochaines &#233;tapes lors de votre prochain contact. N&#39;h&#233;sitez pas &#224; nous contacter si vous avez des questions urgentes.</p>`, GOLD)}

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">${btn("Voir mon dossier complet", "#")}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:4px 8px;">
        <a href="tel:+14386302869" style="display:inline-block;color:${NAVY};text-decoration:none;font-size:13px;border:1px solid ${NAVY};padding:10px 24px;border-radius:6px;font-weight:600;">&#128222; Appeler un conseiller</a>
      </td>
      <td align="center" style="padding:4px 8px;">
        <a href="mailto:info@soshubcanada.com" style="display:inline-block;color:#64748b;text-decoration:none;font-size:13px;border:1px solid #e2e8f0;padding:10px 24px;border-radius:6px;font-weight:600;">&#9993; Envoyer un courriel</a>
      </td>
    </tr>
  </table>
  ${signature()}
</td></tr>`),
  },

  // 5. RESULTAT ADMISSIBILITE
  {
    id: "resultat_admissibilite",
    name: "R\u00e9sultat d\u2019admissibilit\u00e9 disponible",
    subject: "&#127775; Votre rapport d\u2019admissibilit\u00e9 est pr\u00eat \u2014 {{prenom}} {{nom}}",
    category: "R\u00e9sultat",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:40px 32px 36px;text-align:center;">
  <div style="display:inline-block;border:3px solid ${GOLD};border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:14px;">
    <span style="color:${GOLD};font-size:30px;">&#127775;</span>
  </div>
  <h1 style="margin:0 0 10px;color:#ffffff;font-size:26px;font-weight:900;font-family:Georgia,serif;">Votre rapport est pr&#234;t !</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:14px;line-height:1.6;">Notre &#233;quipe a analys&#233; votre profil et identifi&#233; des opportunit&#233;s pour vous.</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">Bonne nouvelle ! Votre <strong>analyse compl&#232;te d&#39;admissibilit&#233;</strong> est maintenant disponible. Votre conseiller a &#233;valu&#233; votre profil et identifi&#233; les meilleurs programmes adapt&#233;s &#224; votre situation.</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="padding:4px;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0 0 4px;color:#166534;font-size:22px;font-weight:900;">&#10003;</p>
          <p style="margin:0;color:#166534;font-size:12px;font-weight:700;">Programmes identifi&#233;s</p>
        </div>
      </td>
      <td style="padding:4px;">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0 0 4px;color:#1e40af;font-size:22px;font-weight:900;">24h</p>
          <p style="margin:0;color:#1e40af;font-size:12px;font-weight:700;">Suivi garanti</p>
        </div>
      </td>
      <td style="padding:4px;">
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0 0 4px;color:#92400e;font-size:22px;font-weight:900;">100%</p>
          <p style="margin:0;color:#92400e;font-size:12px;font-weight:700;">Personnalis&#233;</p>
        </div>
      </td>
    </tr>
  </table>

  ${infoBox(`<p style="margin:0 0 8px;color:${NAVY};font-size:14px;font-weight:700;">&#128161; Ce que contient votre rapport</p>
  <p style="margin:0;color:#475569;font-size:13px;line-height:1.9;">
    &#10003; Analyse d&#233;taill&#233;e de votre profil<br/>
    &#10003; Programmes recommand&#233;s avec cote d&#39;admissibilit&#233;<br/>
    &#10003; Points forts et am&#233;liorations possibles<br/>
    &#10003; Plan d&#39;action &#233;tape par &#233;tape<br/>
    &#10003; Estimation des d&#233;lais et co&#251;ts
  </p>`, GOLD)}

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">${btn("&#128196; Consulter mon rapport complet", "#")}</td></tr>
  </table>
  <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">Votre conseiller vous contactera dans les 24h pour discuter des r&#233;sultats.</p>
  ${signature()}
</td></tr>`),
  },

  // 6. PROMOTION
  {
    id: "promotion",
    name: "Promotion / Offre sp\u00e9ciale",
    subject: "&#127381; Offre exclusive r&#233;serv&#233;e &#224; nos clients \u2014 Valide jusqu&#39;au {{date}}",
    category: "Marketing",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="background:${GOLD};padding:12px 32px;text-align:center;">
      <p style="margin:0;color:${NAVY};font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">&#9201; OFFRE LIMIT&#201;E &mdash; Expire le {{date}}</p>
    </td></tr>
    <tr><td style="padding:36px 32px 32px;text-align:center;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Client privil&#233;gi&#233;</p>
      <h1 style="margin:0 0 10px;color:#ffffff;font-size:32px;font-weight:900;font-family:Georgia,serif;">Offre Exclusive</h1>
      <p style="margin:0;color:${GOLD_LIGHT};font-size:15px;">R&#233;serv&#233;e &#224; nos clients &mdash; Non transf&#233;rable</p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">En tant que client privil&#233;gi&#233; de SOS Hub Canada, nous vous r&#233;servons une offre exceptionnelle sur nos services de consultation et d&#39;accompagnement.</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:2px solid ${GOLD};border-radius:8px;overflow:hidden;">
    <tr><td style="background:${GOLD};padding:12px 20px;text-align:center;">
      <p style="margin:0;color:${NAVY};font-weight:800;font-size:13px;letter-spacing:2px;">CE QUE VOUS OBTENEZ</p>
    </td></tr>
    <tr><td style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.6;">&#10003;&#160; Consultation approfondie (90 min) avec un conseiller senior</td></tr>
        <tr><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.6;">&#10003;&#160; Analyse compl&#232;te de tous les programmes applicables</td></tr>
        <tr><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.6;">&#10003;&#160; Plan d&#39;action d&#233;taill&#233; avec &#233;ch&#233;ancier personnalis&#233;</td></tr>
        <tr><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.6;">&#10003;&#160; Suivi prioritaire pendant 30 jours</td></tr>
        <tr><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.6;">&#10003;&#160; Rev&#233;rification de tous vos documents</td></tr>
      </table>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">${btn("&#127381; Profiter de cette offre", "#")}</td></tr>
  </table>
  <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-align:center;">Offre valide jusqu&#39;au <strong>{{date}}</strong></p>
  <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">Places limit&#233;es &mdash; R&#233;servez maintenant pour garantir votre cr&#233;neau</p>
  ${signature("Patrick Cadet", "Directeur g&#233;n&#233;ral &mdash; SOS Hub Canada")}
</td></tr>`),
  },

  // 7. NEWSLETTER
  {
    id: "newsletter",
    name: "Newsletter mensuelle",
    subject: "&#128240; La Lettre de SOS Hub \u2014 {{date}}",
    category: "Newsletter",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:36px 32px 32px;text-align:center;">
  <p style="margin:0 0 6px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Bulletin mensuel</p>
  <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:900;font-family:Georgia,serif;">La Lettre de SOS Hub</h1>
  <p style="margin:0;color:${GOLD};font-size:14px;font-weight:600;">{{date}}</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 0;">
  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>, voici les derni&#232;res nouvelles et conseils de votre &#233;quipe SOS Hub Canada.</p>
</td></tr>

<tr><td style="background:#ffffff;padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <tr><td style="background:${NAVY};padding:10px 16px;">
      <p style="margin:0;color:${GOLD};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">&#128240; ACTUALIT&#201;S DU MOIS</p>
    </td></tr>
    <tr><td style="padding:16px;">
      <p style="margin:0 0 6px;color:${NAVY};font-size:15px;font-weight:700;line-height:1.4;">Nouvelles r&#232;gles pour les permis de travail ouverts</p>
      <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.6;">Le gouvernement f&#233;d&#233;ral vient d&#39;annoncer des changements importants affectant les permis de travail post-&#233;tudes. Votre conseiller peut &#233;valuer l&#39;impact sur votre situation.</p>
      <a href="#" style="color:${GOLD};font-size:13px;font-weight:700;text-decoration:none;">Lire la suite &#8594;</a>
    </td></tr>
  </table>
</td></tr>

<tr><td style="background:#ffffff;padding:0 32px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#166534;padding:10px 16px;">
      <p style="margin:0;color:#6ee7b7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">&#128161; CONSEIL DU MOIS</p>
    </td></tr>
    <tr><td style="padding:16px;">
      <p style="margin:0 0 6px;color:${NAVY};font-size:15px;font-weight:700;">Optimisez votre profil Express Entr&#233;e</p>
      <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.6;">Saviez-vous qu&#39;un emploi r&#233;serv&#233; (avec ou sans EIMT) peut ajouter jusqu&#39;&#224; 200 points &#224; votre CRS? SOS Hub peut vous aider &#224; explorer cette option.</p>
      <a href="#" style="color:#166534;font-size:13px;font-weight:700;text-decoration:none;">En savoir plus &#8594;</a>
    </td></tr>
  </table>
</td></tr>

<tr><td style="background:#ffffff;padding:0 32px 28px;">
  ${infoBox(`<p style="margin:0 0 8px;color:${NAVY};font-size:14px;font-weight:700;">&#128197; &#192; venir en {{date}}</p>
  <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">
    &#10003; S&#233;ances d&#39;information gratuites &mdash; Montr&#233;al<br/>
    &#10003; Mise &#224; jour des crit&#232;res du programme Arriv&#233;e Canada<br/>
    &#10003; Nouvelles r&#232;gles MIFI pour les candidats du Qu&#233;bec
  </p>`, GOLD)}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td align="center">${btn("Voir toutes les actualit&#233;s", "#")}</td></tr>
  </table>
  ${signature()}
</td></tr>`),
  },

  // 8. RELANCE
  {
    id: "relance",
    name: "Relance client inactif",
    subject: "{{prenom}}, votre projet ne peut pas attendre \u2014 SOS Hub Canada",
    category: "Relance",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:40px 32px 36px;text-align:center;">
  <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Nous pensons &#224; vous</p>
  <h1 style="margin:0 0 12px;color:#ffffff;font-size:28px;font-weight:900;font-family:Georgia,serif;">{{prenom}}, votre dossier vous attend.</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:14px;line-height:1.6;">Il n&#39;est jamais trop tard pour reprendre votre projet.</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Nous avons remarqu&#233; que votre dossier est en attente depuis quelque temps. Nous comprenons que la vie soit parfois charg&#233;e, mais nous voulons que vous sachiez&#160;: <strong>votre projet de relocalisation m&#233;rite votre attention.</strong></p>

  ${infoBox(`<p style="margin:0 0 10px;color:${NAVY};font-size:15px;font-weight:700;">&#128161; Pourquoi agir maintenant&#160;?</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:4px 0;color:#475569;font-size:13px;line-height:1.6;">&#9650; Les seuils d&#39;invitation Express Entr&#233;e changent fr&#233;quemment</td></tr>
    <tr><td style="padding:4px 0;color:#475569;font-size:13px;line-height:1.6;">&#9650; Les quotas de certains programmes se remplissent rapidement</td></tr>
    <tr><td style="padding:4px 0;color:#475569;font-size:13px;line-height:1.6;">&#9650; Votre situation peut s&#39;&#234;tre am&#233;lio r&#233;e depuis votre derni&#232;re &#233;valuation</td></tr>
  </table>`, GOLD)}

  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:8px;padding:20px;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-style:italic;">&#8220; Je ne savais pas que ma situation avait autant chang&#233;. SOS Hub m&#39;a aid&#233; &#224; identifier de nouvelles options que je n&#39;aurais jamais trouv&#233;es seul. &#8221;</p>
      <p style="margin:8px 0 0;color:${NAVY};font-size:12px;font-weight:700;">&#8212; Client SOS Hub Canada, Montr&#233;al</p>
    </td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">${btn("Reprendre mon dossier", "#")}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <a href="tel:+14386302869" style="color:${NAVY};text-decoration:none;font-size:13px;font-weight:600;">Ou appelez-nous au +1 (438) 630-2869</a>
    </td></tr>
  </table>
  ${signature()}
</td></tr>`),
  },

  // 9. ANNIVERSAIRE CANADA
  {
    id: "anniversaire_canada",
    name: "Joyeux anniversaire au Canada",
    subject: "&#127470;&#127462; Bonne ann&#233;e canadienne, {{prenom}} ! Nous sommes fiers de vous",
    category: "F\u00e9licitations",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background:#dc2626;width:33%;height:6px;"></td>
      <td style="background:#ffffff;width:34%;height:6px;"></td>
      <td style="background:#dc2626;width:33%;height:6px;"></td>
    </tr>
    <tr><td colspan="3" style="padding:36px 32px 32px;text-align:center;">
      <p style="margin:0 0 10px;font-size:48px;">&#127464;&#127462;</p>
      <h1 style="margin:0 0 10px;color:#ffffff;font-size:28px;font-weight:900;font-family:Georgia,serif;">F&#233;licitations, {{prenom}}&#160;!</h1>
      <p style="margin:0;color:${GOLD_LIGHT};font-size:15px;">Votre anniversaire canadien est une fierti pour nous.</p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;text-align:center;">
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Bonjour <strong>{{prenom}}</strong>,</p>
  <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.7;">Toute l&#39;&#233;quipe de <strong style="color:${NAVY};">SOS Hub Canada</strong> est heureuse de c&#233;l&#233;brer avec vous votre anniversaire d&#39;arriv&#233;e au Canada. C&#39;est un jalon important dans votre parcours, et nous sommes fiers d&#39;avoir fait partie de cette aventure.</p>

  ${infoBox(`<p style="margin:0;color:${NAVY};font-size:15px;font-weight:700;text-align:center;">&#127873; Un cadeau pour votre anniversaire</p>
  <p style="margin:10px 0 0;color:#475569;font-size:14px;line-height:1.7;text-align:center;">
    B&#233;n&#233;ficiez d&#39;une <strong>consultation gratuite de 30 minutes</strong> avec l&#39;un de nos conseillers seniors pour faire le point sur votre situation et explorer les prochaines &#233;tapes (citoyennet&#233;, parrainage, etc.).
  </p>`, GOLD)}

  <p style="margin:20px 0;color:#334155;font-size:15px;line-height:1.7;">Nous vous souhaitons une merveilleuse continuation dans votre vie canadienne, remplie de succ&#232;s, de sant&#233; et de bonheur !</p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td align="center">${btn("R&#233;clamer ma consultation offerte", "#")}</td></tr>
  </table>
  ${signature("Toute l&#39;&#233;quipe SOS Hub Canada", "Votre partenaire de relocalisation depuis le d&#233;but")}
</td></tr>`),
  },

  // 10. CUSTOM
  {
    id: "custom",
    name: "Custom (libre)",
    subject: "",
    category: "Personnalis\u00e9",
    body: wrapHtml(`
<tr><td style="background:${NAVY};padding:36px 32px 32px;text-align:center;">
  <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:900;font-family:Georgia,serif;">[ Titre de votre message ]</h1>
  <p style="margin:0;color:${GOLD_LIGHT};font-size:14px;">[ Sous-titre optionnel ]</p>
</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px 28px;">
  <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;">Bonjour {{prenom}},</p>
  <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.7;">[ Votre message principal ici ]</p>
  <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.7;">[ Informations compl&#233;mentaires ]</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr><td align="center">${btn("[ Bouton d&#39;action ]", "#")}</td></tr>
  </table>
  ${signature()}
</td></tr>`),
  },
];

const SEGMENT_LABELS: Record<Segment, string> = {
  tous: "Tous les clients",
  actifs: "Clients actifs",
  prospects: "Prospects seulement",
  inactifs: "Clients inactifs (relance)",
  programme: "Par programme",
  custom: "S\u00e9lection manuelle",
};

// ============================================================
// Helpers
// ============================================================
const LS_KEY = "soshub_campaign_history";

function loadHistory(): CampaignRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { console.error("Erreur chargement historique campagnes:", e); return []; }
}

function saveHistory(records: CampaignRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

function replaceVars(text: string, client?: Partial<Client>): string {
  const today = new Date().toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
  return text
    .replace(/\{\{prenom\}\}/g, client?.firstName || "Pr\u00e9nom")
    .replace(/\{\{nom\}\}/g, client?.lastName || "Nom")
    .replace(/\{\{programme\}\}/g, client?.programmeInteret || "Programme")
    .replace(/\{\{statut_dossier\}\}/g, client?.status || "En cours")
    .replace(/\{\{date\}\}/g, today);
}

function filterBySegment(clients: Client[], segment: Segment, programme: string, selectedIds: Set<string>): Client[] {
  switch (segment) {
    case "tous": return clients;
    case "actifs": return clients.filter(c => c.status === "actif");
    case "prospects": return clients.filter(c => c.status === "prospect");
    case "inactifs": return clients.filter(c => ["en_attente", "archive"].includes(c.status));
    case "programme": return clients.filter(c => c.programmeInteret === programme);
    case "custom": return clients.filter(c => selectedIds.has(c.id));
    default: return clients;
  }
}

// ============================================================
// Component
// ============================================================
export default function MarketingPage() {
  const { currentUser, clients, cases } = useCrm();

  // --- State ---
  const [tab, setTab] = useState<TabKey>("campagnes");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [bodyHtml, setBodyHtml] = useState(EMAIL_TEMPLATES[0].body);
  const [showHtml, setShowHtml] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [segment, setSegment] = useState<Segment>("tous");
  const [programme, setProgramme] = useState("");
  const [customSelected, setCustomSelected] = useState<Set<string>>(new Set());
  const [searchClient, setSearchClient] = useState("");
  const [history, setHistory] = useState<CampaignRecord[]>([]);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendTotal, setSendTotal] = useState(0);
  const [sendResult, setSendResult] = useState<{ ok: number; fail: number } | null>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  // Permission check
  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  if (!perms.canViewReports) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-4 rounded-full bg-red-50 mb-4"><ShieldX className="w-12 h-12 text-red-400" /></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acc&egrave;s refus&eacute;</h1>
        <p className="text-gray-500">Vous n&apos;avez pas la permission d&apos;acc&eacute;der au module Marketing.</p>
      </div>
    );
  }

  // Derived
  const recipients = filterBySegment(clients, segment, programme, customSelected);
  const programmes = [...new Set(clients.map(c => c.programmeInteret).filter(Boolean))];
  const thisMonth = history.filter(h => {
    const d = new Date(h.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSentMonth = thisMonth.reduce((s, h) => s + h.recipientCount, 0);
  const activeCampaigns = history.filter(h => h.status === "en_cours").length;
  const reachRate = clients.length > 0 ? Math.round((recipients.length / clients.length) * 100) : 0;

  // --- Handlers ---
  function selectTemplate(tpl: EmailTemplate) {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setBodyHtml(tpl.body);
  }

  function toggleCustomClient(id: string) {
    setCustomSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (recipients.length === 0 || sending) return;
    setSending(true);
    setSendProgress(0);
    setSendTotal(recipients.length);
    setSendResult(null);
    let ok = 0, fail = 0;

    for (let i = 0; i < recipients.length; i++) {
      const client = recipients[i];
      const finalSubject = replaceVars(subject, client);
      const finalBody = replaceVars(bodyHtml, client);
      try {
        const res = await crmFetch("/api/crm/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toEmail: client.email,
            subject: finalSubject,
            emailBody: finalBody,
            type: selectedTemplate.id,
            sentBy: currentUser?.email || 'system',
          }),
        });
        if (res.ok) ok++; else fail++;
      } catch (err) {
        fail++;
        console.error(`Echec envoi a ${client.email}:`, err);
      }
      setSendProgress(i + 1);
    }

    const record: CampaignRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      templateName: selectedTemplate.name,
      subject,
      recipientCount: recipients.length,
      segment: SEGMENT_LABELS[segment],
      status: fail === 0 ? "envoye" : "echoue",
      sentBy: currentUser?.name || 'Système',
    };
    const updated = [record, ...history];
    setHistory(updated);
    saveHistory(updated);
    setSendResult({ ok, fail });
    setSending(false);
  }

  // --- Stats cards ---
  const stats = [
    { label: "Emails ce mois", value: totalSentMonth, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Campagnes actives", value: activeCampaigns, icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Templates", value: EMAIL_TEMPLATES.length, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Taux de couverture", value: `${reachRate}%`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Marketing &amp; Courriels</h1>
          <p className="text-gray-500 text-sm mt-1">Campagnes email, templates et historique d&apos;envoi</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: `${GOLD}22`, color: GOLD }}>
          <Sparkles className="w-3.5 h-3.5" /> Module Marketing
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: "campagnes" as TabKey, label: "Campagnes", icon: Send },
          { key: "templates" as TabKey, label: "Templates", icon: FileText },
          { key: "historique" as TabKey, label: "Historique", icon: Clock },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ============ TAB: Campagnes ============ */}
      {tab === "campagnes" && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border">
          <Users className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">Aucun contact disponible</p>
          <p className="text-gray-400 text-xs mt-1">Ajoutez des clients dans le module Clients pour commencer vos campagnes.</p>
        </div>
      )}
      {tab === "campagnes" && clients.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Editor */}
          <div className="xl:col-span-2 space-y-5">
            {/* Template selector + Subject */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: GOLD }} /> Composer un courriel
              </h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Template</label>
                <select value={selectedTemplate.id} onChange={e => {
                  const tpl = EMAIL_TEMPLATES.find(t => t.id === e.target.value)!;
                  selectTemplate(tpl);
                }} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none">
                  {EMAIL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Objet du courriel</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
                  placeholder="Objet..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-500">Contenu {showHtml ? "(HTML)" : "(Visuel)"}</label>
                  <button onClick={() => setShowHtml(!showHtml)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                    {showHtml ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showHtml ? "Mode visuel" : "Mode HTML"}
                  </button>
                </div>
                {showHtml ? (
                  <textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)}
                    rows={14}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none resize-y" />
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                    style={{ minHeight: 340 }}>
                    <iframe srcDoc={replaceVars(bodyHtml)}
                      className="w-full border-0" style={{ height: 340 }}
                      sandbox="allow-same-origin" title="Email preview" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400">Variables :</span>
                {["{{prenom}}", "{{nom}}", "{{programme}}", "{{statut_dossier}}", "{{date}}"].map(v => (
                  <button key={v} onClick={() => {
                    navigator.clipboard.writeText(v);
                  }} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-mono flex items-center gap-1">
                    <Copy className="w-3 h-3" />{v}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPreview(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-[660px] w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Aper\u00e7u du courriel</h3>
                    <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2"><strong>Objet :</strong> {replaceVars(subject)}</p>
                    <iframe srcDoc={replaceVars(bodyHtml)} className="w-full border-0" style={{ height: 500 }}
                      sandbox="allow-same-origin" title="Full preview" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Segment + Send */}
          <div className="space-y-5">
            {/* Segment */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: GOLD }} /> Destinataires
              </h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Segment</label>
                <select value={segment} onChange={e => setSegment(e.target.value as Segment)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none">
                  {Object.entries(SEGMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {segment === "programme" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Programme</label>
                  <select value={programme} onChange={e => setProgramme(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none">
                    <option value="">-- Choisir --</option>
                    {programmes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              {segment === "custom" && (
                <div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchClient} onChange={e => setSearchClient(e.target.value)}
                      placeholder="Rechercher un client..."
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none" />
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {clients.filter(c => {
                      const q = searchClient.toLowerCase();
                      return !q || `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q);
                    }).map(c => (
                      <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                        <input type="checkbox" checked={customSelected.has(c.id)}
                          onChange={() => toggleCustomClient(c.id)}
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
                        <span className="truncate">{c.firstName} {c.lastName}</span>
                        <span className="text-xs text-gray-400 ml-auto truncate">{c.email}</span>
                      </label>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">Aucun client disponible</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Destinataires</span>
                <span className="text-lg font-bold" style={{ color: NAVY }}>{recipients.length}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-3">
              <button onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" /> Aper\u00e7u
              </button>
              <button onClick={handleSend} disabled={sending || recipients.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: recipients.length > 0 && !sending ? NAVY : undefined }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Envoi en cours..." : `Envoyer (${recipients.length})`}
              </button>

              {/* CASL/CAN-SPAM compliance notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Conformite LCAP/CAN-SPAM : Tous les templates incluent un lien de desabonnement dans le pied de page. Assurez-vous que le contenu personnalise respecte aussi la reglementation.</span>
              </div>

              {/* Progress */}
              {sending && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(sendProgress / sendTotal) * 100}%`, background: GOLD }} />
                  </div>
                  <p className="text-xs text-center text-gray-500">{sendProgress} / {sendTotal}</p>
                </div>
              )}

              {/* Result */}
              {sendResult && !sending && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  sendResult.fail === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {sendResult.fail === 0
                    ? <><CheckCircle2 className="w-4 h-4" /> {sendResult.ok} courriel(s) envoy\u00e9(s) avec succ\u00e8s</>
                    : <><AlertCircle className="w-4 h-4" /> {sendResult.ok} envoy\u00e9(s), {sendResult.fail} \u00e9chou\u00e9(s)</>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: Templates ============ */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {EMAIL_TEMPLATES.map(tpl => (
            <div key={tpl.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Preview thumbnail */}
              <div className="h-44 overflow-hidden bg-gray-50 border-b border-gray-100 relative">
                <iframe srcDoc={replaceVars(tpl.body)}
                  className="w-full border-0 pointer-events-none scale-[0.55] origin-top-left"
                  style={{ height: 600, width: "182%" }}
                  sandbox="allow-same-origin" title={tpl.name} />
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${GOLD}22`, color: GOLD }}>{tpl.category}</span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{tpl.name}</h3>
                <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-2">Objet : {tpl.subject || "(personnalisable)"}</p>
                <button onClick={() => { selectTemplate(tpl); setTab("campagnes"); }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg transition-colors hover:opacity-90 text-white"
                  style={{ background: NAVY }}>
                  <Send className="w-3.5 h-3.5" /> Utiliser ce template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ TAB: Historique ============ */}
      {tab === "historique" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: GOLD }} /> Historique des campagnes
            </h2>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); saveHistory([]); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">Effacer tout</button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aucune campagne envoy\u00e9e pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Template</th>
                    <th className="px-5 py-3 font-medium">Objet</th>
                    <th className="px-5 py-3 font-medium">Segment</th>
                    <th className="px-5 py-3 font-medium text-right">Destinataires</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Envoy\u00e9 par</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-600">{new Date(h.date).toLocaleDateString("fr-CA")}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{h.templateName}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{h.subject}</td>
                      <td className="px-5 py-3 text-gray-600">{h.segment}</td>
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: NAVY }}>{h.recipientCount}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          h.status === "envoye" ? "bg-green-50 text-green-700"
                          : h.status === "en_cours" ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-700"
                        }`}>
                          {h.status === "envoye" ? <CheckCircle2 className="w-3 h-3" /> : h.status === "en_cours" ? <Loader2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {h.status === "envoye" ? "Envoy\u00e9" : h.status === "en_cours" ? "En cours" : "\u00c9chou\u00e9"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{h.sentBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
