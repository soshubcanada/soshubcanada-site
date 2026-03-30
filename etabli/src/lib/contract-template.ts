// ========================================================
// SOS Hub Canada - Generateur de contrat de service HTML
// Conforme RCIC/CICC - 20 articles obligatoires
// Tout en francais (Quebec) - Aucun nom de consultant/avocat
// ========================================================

import { IMMIGRATION_PROGRAMS } from './crm-programs';
import { PROGRAM_CATEGORIES } from './crm-programs';
import type { Client } from './crm-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============ Types ============

export interface ContractGenerationParams {
  contractNumber?: string;
  client: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    email: string;
    passportNumber: string;
  };
  programId: string;
  programName?: string;
  createdDate?: string;
}

// ============ Helpers ============

export function generateContractNumber(): string {
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `CS-2026-${seq}`;
}

export function getServicesForProgram(programId: string): string[] {
  const program = IMMIGRATION_PROGRAMS.find(p => p.id === programId);
  const base = [
    'Evaluation du dossier et admissibilite',
    'Preparation et revision des formulaires',
    'Compilation et verification des documents',
    'Soumission de la demande',
    'Suivi aupres d\'IRCC/MIFI',
    'Communication et mises a jour regulieres',
  ];

  if (!program) return base;

  // Add programme-specific services
  const cat = program.category;
  if (cat === 'refugie') {
    base.push('Preparation du Formulaire de fondement de la demande d\'asile (FDA)');
    base.push('Preparation de l\'audience devant la SPR/SAR si applicable');
  }
  if (cat === 'family') {
    base.push('Preparation de la preuve de relation authentique');
    base.push('Coordination entre le parrain et la personne parrainee');
  }
  if (cat === 'pnp' && programId.includes('quebec')) {
    base.push('Suivi aupres du MIFI pour le CSQ');
    base.push('Demande de residence permanente federale apres obtention du CSQ');
  }
  if (cat === 'express_entry') {
    base.push('Creation et gestion du profil Entree express');
    base.push('Optimisation du score CRS');
  }
  if (cat === 'temporaire') {
    base.push('Support pour la biometrie et examen medical si requis');
  }

  return base;
}

// ============ SVG Logo ============

const SOS_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="180" height="77">
  <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#1B2559"/>
  <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#1B2559"/>
  <text x="140" y="72" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#1B2559" letter-spacing="-1">SOS</text>
  <text x="140" y="105" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#D4A03C" letter-spacing="8">HUB</text>
</svg>`;

// ============ HTML Generator ============

export function generateContractHTML(params: ContractGenerationParams): string {
  const {
    contractNumber = generateContractNumber(),
    client,
    programId,
    programName,
    createdDate,
  } = params;

  const program = IMMIGRATION_PROGRAMS.find(p => p.id === programId);
  const displayProgramName = programName || program?.name || 'Programme d\'immigration';
  const categoryLabel = program ? (PROGRAM_CATEGORIES[program.category] || program.category) : '';
  const services = getServicesForProgram(programId);
  const dateStr = createdDate || new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const clientFullName = `${client.firstName} ${client.lastName}`;
  const clientAddress = [client.address, client.city, client.province, client.postalCode].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrat de service - ${contractNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 20mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }
    .contract { max-width: 800px; margin: 0 auto; padding: 40px 30px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #1B2559; padding-bottom: 20px; margin-bottom: 30px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .company-info h1 { font-size: 18pt; color: #1B2559; font-weight: 700; margin-bottom: 2px; }
    .company-info p { font-size: 9pt; color: #555; line-height: 1.4; }
    .contract-number-box { text-align: right; }
    .contract-number-box .label { font-size: 9pt; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .contract-number-box .number { font-size: 14pt; font-weight: 700; color: #1B2559; }
    .contract-number-box .date { font-size: 9pt; color: #555; margin-top: 4px; }
    .contract-title { text-align: center; margin: 30px 0; }
    .contract-title h2 { font-size: 16pt; color: #1B2559; text-transform: uppercase; letter-spacing: 1px; border-top: 2px solid #D4A03C; border-bottom: 2px solid #D4A03C; padding: 12px 0; display: inline-block; }
    .article { margin-bottom: 24px; page-break-inside: avoid; }
    .article h3 { font-size: 12pt; color: #1B2559; border-left: 4px solid #D4A03C; padding-left: 12px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
    .article p { margin-bottom: 8px; text-align: justify; }
    .article ul { margin: 8px 0 8px 24px; }
    .article li { margin-bottom: 4px; }
    .article ol { margin: 8px 0 8px 24px; }
    .article ol li { margin-bottom: 4px; }
    .party-block { background: #f8f9fc; border: 1px solid #e2e5f0; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
    .party-block .party-label { font-weight: 700; color: #1B2559; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .party-block .party-detail { font-size: 10pt; line-height: 1.5; }
    .fee-box { background: #fffbf0; border: 1px solid #D4A03C; border-radius: 6px; padding: 16px; margin: 12px 0; }
    .fee-box .fee-amount { font-size: 16pt; font-weight: 700; color: #1B2559; }
    .fee-box .fee-note { font-size: 9pt; color: #666; margin-top: 4px; }
    .highlight-box { background: #f0f4ff; border-left: 4px solid #1B2559; padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; }
    .info-box { background: #f8f9fc; border: 1px solid #e2e5f0; border-radius: 6px; padding: 12px 16px; margin: 10px 0; font-size: 10pt; }
    .signatures { display: flex; gap: 40px; margin-top: 40px; page-break-inside: avoid; }
    .sig-block { flex: 1; }
    .sig-block h4 { font-size: 10pt; color: #1B2559; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    .sig-block .sig-name { font-weight: 600; margin-bottom: 8px; }
    .sig-line { border-bottom: 1px solid #333; margin: 30px 0 6px; }
    .sig-label { font-size: 9pt; color: #666; }
    .sig-date-line { margin-top: 16px; }
    .footer-note { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 8pt; color: #999; text-align: center; }
    strong { color: #1B2559; }
    .designated-person-block { background: #f8f9fc; border: 1px solid #e2e5f0; border-radius: 6px; padding: 16px; margin: 12px 0; }
    .designated-person-block .field-line { margin-bottom: 6px; font-size: 10pt; }
    .designated-person-block .blank { display: inline-block; min-width: 200px; border-bottom: 1px solid #999; }
    @media print {
      body { font-size: 10pt; }
      .contract { padding: 0; }
      .article { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="contract">

  <!-- EN-TETE -->
  <div class="header">
    <div class="header-left">
      ${SOS_LOGO_SVG}
      <div class="company-info">
        <h1>SOS Hub Canada Inc.</h1>
        <p>3737, boul. Cr\u00e9mazie Est, bureau 402<br>Montr\u00e9al (Qu\u00e9bec) H1Z 2K4<br>T\u00e9l. : (438) 630-2869 | info@soshubcanada.com</p>
      </div>
    </div>
    <div class="contract-number-box">
      <div class="label">Contrat N&deg;</div>
      <div class="number">${contractNumber}</div>
      <div class="date">${dateStr}</div>
    </div>
  </div>

  <!-- TITRE -->
  <div class="contract-title">
    <h2>Contrat de service professionnel en immigration</h2>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 1 - PARTIES ET IDENTIFICATION -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 1 &mdash; Parties et identification</h3>
    <p>Le pr\u00e9sent contrat de service (ci-apr\u00e8s le &laquo; Contrat &raquo;) est conclu en date du <strong>${dateStr}</strong> entre les parties suivantes :</p>
    <div class="party-block">
      <div class="party-label">Le Prestataire de services (ci-apr\u00e8s le &laquo; Prestataire &raquo;)</div>
      <div class="party-detail">
        <strong>SOS Hub Canada Inc.</strong>, soci\u00e9t\u00e9 constitu\u00e9e selon les lois du Qu\u00e9bec<br>
        3737, boul. Cr\u00e9mazie Est, bureau 402, Montr\u00e9al (Qu\u00e9bec) H1Z 2K4<br>
        T\u00e9l\u00e9phone : (438) 630-2869 | Courriel : info@soshubcanada.com
      </div>
    </div>
    <div class="party-block">
      <div class="party-label">Le Client (ci-apr\u00e8s le &laquo; Client &raquo;)</div>
      <div class="party-detail">
        <strong>${clientFullName}</strong><br>
        Adresse : ${clientAddress}<br>
        T\u00e9l\u00e9phone : ${client.phone}<br>
        Courriel : ${client.email}<br>
        Num\u00e9ro de passeport : ${client.passportNumber}
      </div>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 2 - LANGUE DE SERVICE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 2 &mdash; Langue de service</h3>
    <p>Les services professionnels vis\u00e9s par le pr\u00e9sent Contrat seront fournis en <strong>fran\u00e7ais</strong>.</p>
    <p>Le Client peut \u00e9galement demander que les services soient fournis en <strong>anglais</strong>, auquel cas les communications et documents de travail seront r\u00e9dig\u00e9s dans cette langue, sous r\u00e9serve de la disponibilit\u00e9 des ressources.</p>
    <p>Si le Client ne ma\u00eetrise ni le fran\u00e7ais ni l'anglais, le Prestataire pourra, au besoin, recourir aux services d'un interpr\u00e8te ou d'un traducteur agr\u00e9\u00e9 afin d'assurer une compr\u00e9hension ad\u00e9quate des \u00e9changes. Les frais d'interpr\u00e9tation ou de traduction, le cas \u00e9ch\u00e9ant, seront \u00e0 la charge du Client et feront l'objet d'une entente pr\u00e9alable.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 3 - ROLE DU COLLEGE (CICC) -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 3 &mdash; R\u00f4le du Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes (CICC)</h3>
    <p>Le Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes (ci-apr\u00e8s le &laquo; Coll\u00e8ge &raquo; ou &laquo; CICC &raquo;) est l'organisme de r\u00e9glementation d\u00e9sign\u00e9 par le gouvernement f\u00e9d\u00e9ral du Canada pour superviser les consultants r\u00e9glement\u00e9s en immigration canadienne (CRIC).</p>
    <p>Le Coll\u00e8ge a pour mandat de :</p>
    <ul>
      <li>R\u00e9glementer les consultants en immigration dans l'int\u00e9r\u00eat public</li>
      <li>Veiller au respect du Code de d\u00e9ontologie par les titulaires de permis</li>
      <li>Prot\u00e9ger les consommateurs de services d'immigration</li>
    </ul>
    <p>Le Coll\u00e8ge peut exiger la production de documents relatifs au dossier du Client dans le cadre de son mandat de surveillance et d'enqu\u00eate.</p>
    <p>Le Client peut d\u00e9poser une plainte aupr\u00e8s du Coll\u00e8ge s'il estime que le Prestataire a contrevenu \u00e0 ses obligations d\u00e9ontologiques.</p>
    <div class="info-box">
      <strong>Site Web du Coll\u00e8ge :</strong> <a href="https://college-ic.ca" style="color: #1B2559;">college-ic.ca</a>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 4 - EVALUATION D'ADMISSIBILITE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 4 &mdash; \u00c9valuation d'admissibilit\u00e9</h3>
    <p>Le Prestataire a proc\u00e9d\u00e9 \u00e0 une \u00e9valuation pr\u00e9liminaire de l'admissibilit\u00e9 du Client au programme d'immigration suivant :</p>
    <div class="highlight-box">
      <strong>${displayProgramName}</strong>${categoryLabel ? ` &mdash; ${categoryLabel}` : ''}
    </div>
    <p>Cette \u00e9valuation est fond\u00e9e sur les renseignements et documents fournis par le Client au moment de la consultation initiale et sur les crit\u00e8res d'admissibilit\u00e9 en vigueur \u00e0 la date du pr\u00e9sent Contrat.</p>
    <p>Le Client reconna\u00eet et comprend que :</p>
    <ul>
      <li>Les crit\u00e8res d'admissibilit\u00e9 sont \u00e9tablis par les autorit\u00e9s gouvernementales comp\u00e9tentes (IRCC, MIFI ou tout autre organisme applicable) et peuvent \u00eatre modifi\u00e9s \u00e0 tout moment sans pr\u00e9avis</li>
      <li>L'admissibilit\u00e9 est sensible au facteur temps et peut varier en fonction des d\u00e9lais de traitement et des changements r\u00e9glementaires</li>
      <li>L'\u00e9valuation initiale ne constitue en aucun cas une <strong>garantie de r\u00e9sultat</strong> ni d'acceptation de la demande par les autorit\u00e9s comp\u00e9tentes</li>
      <li>Des renseignements inexacts ou incomplets fournis par le Client peuvent affecter l'\u00e9valuation et l'issue de la demande</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 5 - DESCRIPTION DES SERVICES -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 5 &mdash; Description des services</h3>
    <p>Le Prestataire s'engage \u00e0 fournir au Client les services professionnels de consultation en immigration suivants dans le cadre du programme indiqu\u00e9 \u00e0 l'article 4 :</p>
    <ul>
${services.map(s => `      <li>${s}</li>`).join('\n')}
    </ul>
    <p>Tout service non express\u00e9ment inclus dans la liste ci-dessus est exclu du pr\u00e9sent Contrat. Toute demande de service additionnel fera l'objet d'un avenant \u00e9crit sign\u00e9 par les deux parties.</p>
    <p>Le Prestataire ne fournit pas de services juridiques au sens du <em>Barreau du Qu\u00e9bec</em>. Les services sont limit\u00e9s \u00e0 la consultation en immigration conform\u00e9ment \u00e0 la <em>Loi sur le Coll\u00e8ge des consultants en immigration et en citoyennet\u00e9</em>.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 6 - FRAIS D'OUVERTURE DE DOSSIER -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 6 &mdash; Frais d'ouverture de dossier</h3>
    <div class="fee-box">
      <div class="fee-amount">250,00 $ CAD</div>
      <div class="fee-note">Payable \u00e0 la signature du pr\u00e9sent Contrat &mdash; NON REMBOURSABLE</div>
    </div>
    <p>Le Client s'engage \u00e0 verser au Prestataire des frais d'ouverture de dossier d'un montant de <strong>deux cent cinquante dollars (250,00 $ CAD)</strong>, payables \u00e0 la signature du pr\u00e9sent Contrat.</p>
    <p>Ces frais sont <strong>non remboursables en tout temps</strong>, peu importe l'issue du dossier, la d\u00e9cision rendue par les autorit\u00e9s gouvernementales ou la r\u00e9siliation du pr\u00e9sent Contrat par l'une ou l'autre des parties.</p>
    <p>Les frais d'ouverture de dossier couvrent :</p>
    <ul>
      <li>L'ouverture et la constitution du dossier du Client</li>
      <li>L'\u00e9valuation initiale de l'admissibilit\u00e9 du Client au programme vis\u00e9</li>
      <li>Les frais administratifs li\u00e9s \u00e0 la gestion et \u00e0 l'organisation du dossier</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 7 - HONORAIRES ET MODALITES DE PAIEMENT -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 7 &mdash; Honoraires et modalit\u00e9s de paiement</h3>
    <p><strong>7.1 M\u00e9thode de facturation :</strong> Les honoraires professionnels du Prestataire sont \u00e9tablis sur une base <strong>forfaitaire</strong> (montant fixe) pour l'ensemble des services d\u00e9crits \u00e0 l'article 5.</p>
    <p><strong>7.2 Facture distincte :</strong> Le d\u00e9tail des honoraires, les \u00e9tapes de paiement et les montants exigibles seront pr\u00e9cis\u00e9s dans une <strong>facture distincte</strong> \u00e9mise au Client. Le Client s'engage \u00e0 respecter l'\u00e9ch\u00e9ancier de paiement indiqu\u00e9 sur ladite facture.</p>
    <p><strong>7.3 \u00c9tapes de r\u00e9alisation :</strong> Les honoraires sont acquis au Prestataire \u00e0 mesure que les \u00e9tapes de travail sont compl\u00e9t\u00e9es. Les principales \u00e9tapes comprennent :</p>
    <ol>
      <li>\u00c9valuation du dossier et ouverture du fichier</li>
      <li>Pr\u00e9paration et compilation des documents</li>
      <li>R\u00e9daction et r\u00e9vision des formulaires</li>
      <li>Soumission de la demande aupr\u00e8s des autorit\u00e9s comp\u00e9tentes</li>
      <li>Suivi post-soumission et correspondance avec les autorit\u00e9s</li>
    </ol>
    <p><strong>7.4 Taxes applicables :</strong> Le Prestataire n'est pas inscrit aux fichiers de la TPS et de la TVQ. Aucune taxe de vente n'est applicable aux honoraires professionnels.</p>
    <p><strong>7.5 Facturation au r\u00e9sultat :</strong> Aucune facturation n'est effectu\u00e9e sur une base contingente (au r\u00e9sultat). Les honoraires sont dus ind\u00e9pendamment de l'issue de la demande d'immigration.</p>
    <p><strong>7.6 D\u00e9bours\u00e9s gouvernementaux :</strong> Les frais gouvernementaux (frais de traitement IRCC, frais biom\u00e9triques, frais d'examen m\u00e9dical, etc.) sont pay\u00e9s directement par le Client ou rembours\u00e9s au Prestataire sur pr\u00e9sentation de re\u00e7us. Ces d\u00e9bours\u00e9s <strong>ne sont pas assujettis aux taxes</strong>.</p>
    <p><strong>7.7 Avances :</strong> Si le Prestataire per\u00e7oit une avance de fonds du Client, ladite somme sera d\u00e9tenue <strong>en fiducie</strong> jusqu'\u00e0 ce qu'elle soit appliqu\u00e9e aux services rendus ou aux d\u00e9bours\u00e9s effectu\u00e9s.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 8 - OBLIGATIONS DU PRESTATAIRE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 8 &mdash; Obligations du Prestataire</h3>
    <p>Le Prestataire s'engage \u00e0 :</p>
    <ul>
      <li>Agir avec diligence, comp\u00e9tence et professionnalisme dans le traitement du dossier du Client</li>
      <li>Respecter les lois et r\u00e8glements applicables en mati\u00e8re d'immigration canadienne</li>
      <li>Maintenir la confidentialit\u00e9 de l'ensemble des renseignements et documents du Client</li>
      <li>Tenir le Client inform\u00e9 de l'avancement de son dossier de mani\u00e8re r\u00e9guli\u00e8re et en temps opportun</li>
      <li>Ne faire aucune fausse repr\u00e9sentation quant \u00e0 l'issue probable ou possible de la demande d'immigration</li>
      <li>Fournir au Client une copie du <strong>Code de conduite professionnelle</strong> du Coll\u00e8ge (CICC)</li>
      <li>Obtenir les services d'un interpr\u00e8te ou d'un traducteur qualifi\u00e9 lorsque n\u00e9cessaire pour assurer la compr\u00e9hension du Client</li>
      <li>Respecter les r\u00e8gles d\u00e9ontologiques \u00e9tablies par le Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 9 - OBLIGATIONS DU CLIENT -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 9 &mdash; Obligations du Client</h3>
    <p>Le Client s'engage \u00e0 :</p>
    <ul>
      <li>Fournir des renseignements <strong>v\u00e9ridiques, complets et exacts</strong> au Prestataire</li>
      <li>Remettre les documents requis dans les d\u00e9lais convenus entre les parties</li>
      <li>Informer le Prestataire <strong>sans d\u00e9lai</strong> de tout changement de situation personnelle, professionnelle, familiale ou financi\u00e8re pouvant avoir une incidence sur le dossier</li>
      <li>Collaborer activement et de bonne foi au traitement du dossier</li>
      <li>S'acquitter des paiements selon l'\u00e9ch\u00e9ancier convenu dans la facture</li>
      <li>Divulguer au Prestataire tous les <strong>faits importants</strong> susceptibles d'affecter l'issue de la demande, y compris tout refus ant\u00e9rieur, mesure de renvoi, interdiction de territoire ou proc\u00e9dure p\u00e9nale en cours</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 10 - PERSONNE DESIGNEE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 10 &mdash; Personne d\u00e9sign\u00e9e</h3>
    <p>Si une personne autre que le Client est autoris\u00e9e \u00e0 communiquer avec le Prestataire au nom du Client, les renseignements suivants doivent \u00eatre fournis :</p>
    <div class="designated-person-block">
      <div class="field-line">Nom complet : <span class="blank">&nbsp;</span></div>
      <div class="field-line">Lien avec le Client : <span class="blank">&nbsp;</span></div>
      <div class="field-line">T\u00e9l\u00e9phone : <span class="blank">&nbsp;</span></div>
      <div class="field-line">Courriel : <span class="blank">&nbsp;</span></div>
      <div class="field-line">Niveau d'acc\u00e8s autoris\u00e9 : <span class="blank">&nbsp;</span></div>
    </div>
    <p>La personne d\u00e9sign\u00e9e ne peut recevoir aucune r\u00e9mun\u00e9ration ni compensation en lien avec le pr\u00e9sent Contrat. Le Client demeure seul responsable de ses obligations contractuelles.</p>
    <p><em>Si aucune personne d\u00e9sign\u00e9e n'est applicable, cette section peut \u00eatre laiss\u00e9e en blanc.</em></p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 11 - CONFIDENTIALITE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 11 &mdash; Confidentialit\u00e9</h3>
    <p>Le Prestataire s'engage \u00e0 traiter de mani\u00e8re <strong>strictement confidentielle</strong> l'ensemble des renseignements personnels, documents et informations communiqu\u00e9s par le Client dans le cadre du pr\u00e9sent Contrat.</p>
    <p>Ces renseignements ne seront divulgu\u00e9s \u00e0 aucun tiers sans le <strong>consentement \u00e9crit pr\u00e9alable</strong> du Client, sauf dans les cas suivants :</p>
    <ul>
      <li>Lorsque la divulgation est exig\u00e9e par une disposition l\u00e9gislative ou r\u00e9glementaire applicable</li>
      <li>Lorsqu'elle est ordonn\u00e9e par un tribunal comp\u00e9tent</li>
      <li>Lorsque le Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes exige la production de documents dans le cadre de son mandat de surveillance, d'inspection ou d'enqu\u00eate, conform\u00e9ment \u00e0 la <em>Loi sur le Coll\u00e8ge des consultants en immigration et en citoyennet\u00e9</em></li>
    </ul>
    <p>Le Prestataire respecte les obligations pr\u00e9vues par la <em>Loi sur la protection des renseignements personnels dans le secteur priv\u00e9</em> (Qu\u00e9bec) et la <em>Loi sur la protection des renseignements personnels et les documents \u00e9lectroniques</em> (Canada).</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 12 - RESILIATION ET REMBOURSEMENT -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 12 &mdash; R\u00e9siliation et remboursement</h3>
    <p><strong>12.1 Droit de r\u00e9siliation :</strong> Le Client peut r\u00e9silier le pr\u00e9sent Contrat \u00e0 tout moment par <strong>avis \u00e9crit</strong> transmis au Prestataire. Le Prestataire peut \u00e9galement r\u00e9silier le Contrat pour motif valable, moyennant un pr\u00e9avis \u00e9crit raisonnable.</p>
    <p><strong>12.2 Frais non remboursables :</strong> Les frais d'ouverture de dossier de <strong>250,00 $ CAD</strong> sont non remboursables en toute circonstance.</p>
    <p><strong>12.3 Honoraires acquis :</strong> Seuls les honoraires correspondant aux \u00e9tapes de travail d\u00fbment compl\u00e9t\u00e9es par le Prestataire au moment de la r\u00e9siliation sont consid\u00e9r\u00e9s comme acquis.</p>
    <p><strong>12.4 Remboursement :</strong> Tout honoraire ou d\u00e9bours\u00e9 non encore utilis\u00e9 au moment de la r\u00e9siliation sera rembours\u00e9 au Client dans un d\u00e9lai de trente (30) jours suivant la date de r\u00e9siliation. Le remboursement est calcul\u00e9 au prorata des \u00e9tapes compl\u00e9t\u00e9es selon l'\u00e9ch\u00e9ancier pr\u00e9vu \u00e0 l'article 7.3.</p>
    <p><strong>12.5 Restitution des documents :</strong> En cas de r\u00e9siliation, le Prestataire remettra au Client l'ensemble des documents originaux et copies en sa possession relatifs au dossier, dans un d\u00e9lai de trente (30) jours.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 13 - INCAPACITE DU PRESTATAIRE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 13 &mdash; Incapacit\u00e9 du Prestataire</h3>
    <p>Advenant que le Prestataire se trouve dans l'incapacit\u00e9 de poursuivre la prestation des services (d\u00e9c\u00e8s, maladie grave, suspension ou r\u00e9vocation du permis, cessation d'activit\u00e9s ou toute autre cause), les mesures suivantes s'appliqueront :</p>
    <ul>
      <li>Le dossier du Client sera transf\u00e9r\u00e9 \u00e0 un autre repr\u00e9sentant autoris\u00e9 en immigration d\u00fbment titulaire d'un permis du Coll\u00e8ge, avec le consentement du Client</li>
      <li>Le Client sera avis\u00e9 <strong>dans les plus brefs d\u00e9lais</strong> de la situation et des d\u00e9marches de transfert</li>
      <li>Si aucun transfert n'est possible ou souhait\u00e9 par le Client, les dispositions de r\u00e9siliation et de remboursement pr\u00e9vues \u00e0 l'article 12 s'appliqueront</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 14 - RESOLUTION DES DIFFERENDS -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 14 &mdash; R\u00e9solution des diff\u00e9rends</h3>
    <p><strong>14.1 Avis \u00e9crit :</strong> En cas de diff\u00e9rend d\u00e9coulant du pr\u00e9sent Contrat, le Client doit d'abord adresser un <strong>avis \u00e9crit</strong> au Prestataire d\u00e9crivant la nature du diff\u00e9rend. Le Prestataire dispose d'un d\u00e9lai de <strong>trente (30) jours</strong> pour r\u00e9pondre et proposer une r\u00e9solution.</p>
    <p><strong>14.2 Plainte au Coll\u00e8ge :</strong> Si le diff\u00e9rend n'est pas r\u00e9solu de mani\u00e8re satisfaisante, le Client peut suivre le processus de plainte du Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes.</p>
    <div class="info-box">
      <strong>Pour d\u00e9poser une plainte :</strong> <a href="https://college-ic.ca" style="color: #1B2559;">college-ic.ca</a>
    </div>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 15 - FORCE MAJEURE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 15 &mdash; Force majeure</h3>
    <p>Le Prestataire ne peut \u00eatre tenu responsable de tout retard ou de toute impossibilit\u00e9 d'ex\u00e9cuter ses obligations en vertu du pr\u00e9sent Contrat lorsque ce retard ou cette impossibilit\u00e9 r\u00e9sulte de circonstances ind\u00e9pendantes de sa volont\u00e9, notamment :</p>
    <ul>
      <li>Restrictions, fermetures ou retards impos\u00e9s par les autorit\u00e9s gouvernementales</li>
      <li>Modifications l\u00e9gislatives ou r\u00e9glementaires affectant les programmes d'immigration</li>
      <li>Conflits arm\u00e9s, actes de terrorisme ou situations d'urgence nationale</li>
      <li>Gr\u00e8ves, lock-out ou conflits de travail affectant les services gouvernementaux</li>
      <li>Catastrophes naturelles, \u00e9pid\u00e9mies, pand\u00e9mies ou autres cas de force majeure au sens du droit civil qu\u00e9b\u00e9cois</li>
    </ul>
    <p>En cas de force majeure, les d\u00e9lais d'ex\u00e9cution seront prolong\u00e9s d'une p\u00e9riode \u00e9quivalente \u00e0 la dur\u00e9e de l'\u00e9v\u00e9nement de force majeure.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 16 - MODIFICATION DU CONTRAT -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 16 &mdash; Modification du contrat</h3>
    <p>Toute modification au pr\u00e9sent Contrat doit faire l'objet d'un <strong>avenant \u00e9crit sign\u00e9 par les deux parties</strong>. Aucune modification verbale ne sera consid\u00e9r\u00e9e comme valide.</p>
    <p>Un changement important dans la situation du Client (changement d'\u00e9tat civil, d'emploi, de statut d'immigration, obtention d'un casier judiciaire, etc.) peut n\u00e9cessiter une modification du Contrat ou un r\u00e9ajustement des services et des honoraires.</p>
    <p>Les modifications apport\u00e9es aux programmes d'immigration par les autorit\u00e9s gouvernementales pourront \u00e9galement n\u00e9cessiter un avenant au pr\u00e9sent Contrat si elles affectent la nature ou la port\u00e9e des services convenus.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 17 - DISPOSITIONS GENERALES -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 17 &mdash; Dispositions g\u00e9n\u00e9rales</h3>
    <p><strong>17.1 Int\u00e9gralit\u00e9 :</strong> Le pr\u00e9sent Contrat, y compris ses annexes et avenants le cas \u00e9ch\u00e9ant, constitue l'<strong>entente compl\u00e8te et int\u00e9grale</strong> entre les parties relativement \u00e0 son objet et remplace toute entente ant\u00e9rieure, verbale ou \u00e9crite.</p>
    <p><strong>17.2 Droit applicable :</strong> Le pr\u00e9sent Contrat est r\u00e9gi et interpr\u00e9t\u00e9 conform\u00e9ment aux <strong>lois du Qu\u00e9bec</strong> et aux lois f\u00e9d\u00e9rales du Canada qui y sont applicables.</p>
    <p><strong>17.3 Juridiction :</strong> Les parties conviennent que tout litige d\u00e9coulant du pr\u00e9sent Contrat sera soumis \u00e0 la <strong>comp\u00e9tence exclusive des tribunaux du district judiciaire de Montr\u00e9al</strong> (Qu\u00e9bec).</p>
    <p><strong>17.4 Divisibilit\u00e9 :</strong> Si une disposition du pr\u00e9sent Contrat est d\u00e9clar\u00e9e invalide, ill\u00e9gale ou inapplicable par un tribunal comp\u00e9tent, les autres dispositions demeureront pleinement en vigueur et de plein effet. La disposition invalide sera remplac\u00e9e par une disposition valide se rapprochant le plus possible de l'intention originale des parties.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 18 - CODE DE CONDUITE PROFESSIONNELLE -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 18 &mdash; Code de conduite professionnelle</h3>
    <p>Le Client reconna\u00eet avoir re\u00e7u une copie du <strong>Code de conduite professionnelle</strong> du Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes (CICC) et en avoir pris connaissance.</p>
    <p>Le Client comprend que le Prestataire est r\u00e9glement\u00e9 par le Coll\u00e8ge et que tout manquement aux obligations d\u00e9ontologiques peut faire l'objet d'une enqu\u00eate et de sanctions disciplinaires.</p>
    <p>Le Client est inform\u00e9 du processus de plainte du Coll\u00e8ge et sait qu'il peut communiquer directement avec le Coll\u00e8ge pour toute question ou pr\u00e9occupation relative \u00e0 la conduite du Prestataire.</p>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 19 - CONSENTEMENTS ET DECLARATIONS DU CLIENT -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 19 &mdash; Consentements et d\u00e9clarations du Client</h3>
    <p>Par la signature du pr\u00e9sent Contrat, le Client d\u00e9clare et consent \u00e0 ce qui suit :</p>
    <ul>
      <li>L'ensemble des renseignements fournis au Prestataire sont <strong>v\u00e9ridiques, complets et exacts</strong> \u00e0 sa connaissance</li>
      <li>Le Client consent \u00e0 ce que le Prestataire le repr\u00e9sente aupr\u00e8s des autorit\u00e9s gouvernementales comp\u00e9tentes en mati\u00e8re d'immigration</li>
      <li>Le Client autorise le Prestataire \u00e0 soumettre en son nom toute demande, formulaire ou correspondance n\u00e9cessaire dans le cadre du programme d'immigration vis\u00e9</li>
      <li>Le Client comprend qu'aucune <strong>garantie de r\u00e9sultat</strong> n'est offerte quant \u00e0 l'issue de sa demande d'immigration, la d\u00e9cision finale relevant exclusivement des autorit\u00e9s gouvernementales comp\u00e9tentes</li>
      <li>Le Client comprend que la dissimulation ou la falsification de renseignements peut entra\u00eener le rejet de la demande et des cons\u00e9quences juridiques graves</li>
    </ul>
  </div>

  <!-- ================================================================ -->
  <!-- ARTICLE 20 - SIGNATURES -->
  <!-- ================================================================ -->
  <div class="article">
    <h3>Article 20 &mdash; Signatures</h3>
    <p>Les parties d\u00e9clarent avoir lu et compris l'ensemble des clauses du pr\u00e9sent Contrat et s'engagent \u00e0 les respecter int\u00e9gralement. Chaque partie reconna\u00eet avoir re\u00e7u une copie sign\u00e9e du pr\u00e9sent Contrat.</p>
  </div>

  <!-- BLOCS DE SIGNATURES -->
  <div class="signatures">
    <div class="sig-block">
      <h4>Le Prestataire</h4>
      <div class="sig-name">SOS Hub Canada Inc.</div>
      <p>Personne autoris\u00e9e</p>
      <div class="sig-line"></div>
      <div class="sig-label">Signature</div>
      <div class="sig-date-line">
        <div class="sig-line"></div>
        <div class="sig-label">Date</div>
      </div>
    </div>
    <div class="sig-block">
      <h4>Le Client</h4>
      <div class="sig-name">${clientFullName}</div>
      <div class="sig-line" id="client-signature-line"></div>
      <div class="sig-label">Signature</div>
      <div class="sig-date-line">
        <div class="sig-line"></div>
        <div class="sig-label">Date</div>
      </div>
      <p style="margin-top: 16px; font-size: 9pt; font-style: italic; color: #555;">
        &laquo; Lu et approuv\u00e9 &raquo;
      </p>
    </div>
  </div>

  <div class="info-box" style="margin-top: 20px; text-align: center;">
    <strong>Important :</strong> Les deux parties doivent conserver un exemplaire sign\u00e9 du pr\u00e9sent Contrat.
  </div>

  <!-- PIED DE PAGE -->
  <div class="footer-note">
    SOS Hub Canada Inc. &mdash; Contrat ${contractNumber} &mdash; ${dateStr}<br>
    Ce contrat est soumis aux lois du Qu\u00e9bec et du Canada. | Coll\u00e8ge de l'immigration et de la citoyennet\u00e9 canadiennes : college-ic.ca
  </div>

</div>
</body>
</html>`;
}
