// ========================================================
// SOS Hub Canada — Auto-generated task templates per immigration program
// Délais basés sur les données IRCC/MIFI 2025-2026
// Best practice: HubSpot pipeline automation style
// ========================================================

export interface TaskTemplate {
  title: string;
  /** Jours à partir de l'ouverture du dossier pour la date d'échéance */
  daysOffset: number;
  priority: 'haute' | 'moyenne' | 'basse';
  /** Phase du dossier associée */
  phase: 'preparation' | 'documents' | 'formulaires' | 'revision' | 'soumission' | 'suivi';
  /** Description détaillée */
  description?: string;
}

export interface ProgramTaskConfig {
  programId: string;
  /** Délai total estimé (texte affiché) */
  estimatedTimeline: string;
  /** Jours estimés min-max pour compléter le dossier côté cabinet */
  cabinetDaysMin: number;
  cabinetDaysMax: number;
  /** Délai IRCC/MIFI après soumission */
  processingTime: string;
  tasks: TaskTemplate[];
}

// ────────────────────────────────────────────
// ENTRÉE EXPRESS
// ────────────────────────────────────────────

const EE_BASE_TASKS: TaskTemplate[] = [
  { title: "Consultation initiale avec le client", daysOffset: 0, priority: "haute", phase: "preparation", description: "Évaluer le profil, confirmer l'admissibilité, expliquer le processus" },
  { title: "Collecter tous les documents d'identité", daysOffset: 3, priority: "haute", phase: "documents", description: "Passeport, acte naissance, certificats état civil" },
  { title: "Obtenir les évaluations de diplômes (ECA/WES)", daysOffset: 5, priority: "haute", phase: "documents", description: "Envoyer les diplômes à WES/IQAS. Délai: 4-8 semaines" },
  { title: "Passer les tests de langue (IELTS/TEF)", daysOffset: 5, priority: "haute", phase: "documents", description: "Réserver et passer IELTS ou TEF Canada. Résultats: 2-3 semaines" },
  { title: "Obtenir les lettres d'emploi et références", daysOffset: 7, priority: "moyenne", phase: "documents", description: "Lettres de chaque employeur: titre, tâches, durée, salaire" },
  { title: "Vérifier casier judiciaire / certificat de police", daysOffset: 10, priority: "haute", phase: "documents", description: "Demander certificat de police de chaque pays (180+ jours)" },
  { title: "Créer le profil Entrée express (GCKey)", daysOffset: 45, priority: "haute", phase: "formulaires", description: "Après réception ECA + résultats langue" },
  { title: "Calculer et vérifier le score CRS", daysOffset: 46, priority: "haute", phase: "formulaires", description: "Vérifier chaque section du calcul CRS" },
  { title: "Soumettre le profil dans le bassin EE", daysOffset: 47, priority: "haute", phase: "soumission", description: "Profil actif 12 mois, surveiller les rondes d'invitation" },
  { title: "Préparer la demande RP (si ITA reçue)", daysOffset: 50, priority: "haute", phase: "formulaires", description: "60 jours pour soumettre après ITA" },
  { title: "Examen médical immigration (EMI)", daysOffset: 55, priority: "haute", phase: "documents", description: "Prendre RDV médecin désigné IRCC" },
  { title: "Payer les frais de traitement IRCC", daysOffset: 58, priority: "haute", phase: "soumission", description: "Frais RP + RHDCC si applicable" },
  { title: "Soumettre la demande de RP complète", daysOffset: 60, priority: "haute", phase: "soumission" },
  { title: "Suivi IRCC — vérifier mises à jour du portail", daysOffset: 90, priority: "moyenne", phase: "suivi", description: "Vérifier le portail IRCC chaque 2 semaines" },
  { title: "Répondre aux demandes additionnelles IRCC", daysOffset: 120, priority: "haute", phase: "suivi", description: "Délai de réponse: 30 jours maximum" },
  { title: "Confirmation de RP — préparer COPR", daysOffset: 180, priority: "haute", phase: "suivi", description: "Planifier l'atterrissage si hors Canada" },
];

const EE_FSW: ProgramTaskConfig = {
  programId: "ee-fsw",
  estimatedTimeline: "6-12 mois (préparation: 2-3 mois + IRCC: 4-8 mois)",
  cabinetDaysMin: 45,
  cabinetDaysMax: 90,
  processingTime: "4-8 mois après soumission",
  tasks: EE_BASE_TASKS,
};

const EE_CEC: ProgramTaskConfig = {
  programId: "ee-cec",
  estimatedTimeline: "4-10 mois (préparation: 1-2 mois + IRCC: 4-8 mois)",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "4-8 mois après soumission",
  tasks: [
    { title: "Consultation initiale — vérifier expérience canadienne", daysOffset: 0, priority: "haute", phase: "preparation", description: "Minimum 1 an expérience qualifiée au Canada (TEER 0/1/2/3)" },
    { title: "Collecter les documents d'identité", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Passer les tests de langue (IELTS/TEF)", daysOffset: 5, priority: "haute", phase: "documents", description: "CLB 7 minimum pour TEER 0/1, CLB 5 pour TEER 2/3" },
    { title: "Obtenir les lettres d'emploi canadien", daysOffset: 7, priority: "haute", phase: "documents", description: "Lettres T4, talons de paie, lettre employeur détaillée" },
    { title: "Vérifier casier judiciaire", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Créer le profil Entrée express (CEC)", daysOffset: 30, priority: "haute", phase: "formulaires" },
    { title: "Calculer et vérifier le score CRS", daysOffset: 31, priority: "haute", phase: "formulaires" },
    { title: "Soumettre dans le bassin EE", daysOffset: 32, priority: "haute", phase: "soumission" },
    { title: "Examen médical immigration", daysOffset: 40, priority: "haute", phase: "documents" },
    { title: "Soumettre demande RP (après ITA)", daysOffset: 45, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 90, priority: "moyenne", phase: "suivi" },
  ],
};

const EE_FST: ProgramTaskConfig = {
  programId: "ee-fst",
  estimatedTimeline: "6-12 mois",
  cabinetDaysMin: 45,
  cabinetDaysMax: 90,
  processingTime: "4-8 mois après soumission",
  tasks: EE_BASE_TASKS.map(t =>
    t.title.includes("Consultation") ? { ...t, title: "Consultation initiale — vérifier qualification métier spécialisé", description: "Confirmer métier dans la liste TEER, certificat de qualification, offre d'emploi ou qualification" } : t
  ),
};

// ────────────────────────────────────────────
// PERMIS D'ÉTUDES
// ────────────────────────────────────────────

const STUDY_PERMIT: ProgramTaskConfig = {
  programId: "study-permit",
  estimatedTimeline: "3-6 mois (préparation: 4-8 sem + IRCC: 6-16 sem)",
  cabinetDaysMin: 21,
  cabinetDaysMax: 60,
  processingTime: "6-16 semaines (variable selon pays)",
  tasks: [
    { title: "Consultation initiale — admissibilité études", daysOffset: 0, priority: "haute", phase: "preparation", description: "Vérifier lettre d'acceptation, programme éligible, DLI" },
    { title: "Obtenir la lettre d'acceptation (LOA)", daysOffset: 1, priority: "haute", phase: "documents", description: "De l'établissement d'enseignement désigné (DLI)" },
    { title: "Demander le CAQ (Québec seulement)", daysOffset: 3, priority: "haute", phase: "documents", description: "Certificat d'acceptation du Québec — délai: 4-8 semaines" },
    { title: "Préparer la preuve de fonds", daysOffset: 5, priority: "haute", phase: "documents", description: "Relevés bancaires 4 mois, lettre garant, GIC si applicable (min 20 635$)" },
    { title: "Collecter documents d'identité", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Rédiger la lettre d'intention / plan d'études", daysOffset: 7, priority: "moyenne", phase: "documents", description: "Expliquer le choix du programme et les plans post-études" },
    { title: "Obtenir les relevés de notes / diplômes", daysOffset: 7, priority: "moyenne", phase: "documents" },
    { title: "Demander les certificats de police", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Examen médical (si requis)", daysOffset: 14, priority: "haute", phase: "documents", description: "Requis pour séjours > 6 mois ou pays désignés" },
    { title: "Remplir les formulaires IMM 1294 / portail IRCC", daysOffset: 21, priority: "haute", phase: "formulaires" },
    { title: "Révision finale du dossier complet", daysOffset: 25, priority: "haute", phase: "revision" },
    { title: "Soumettre la demande en ligne", daysOffset: 28, priority: "haute", phase: "soumission" },
    { title: "Données biométriques (si première demande)", daysOffset: 35, priority: "haute", phase: "soumission", description: "RDV au centre VAC dans les 30 jours" },
    { title: "Suivi — vérifier le statut de la demande", daysOffset: 60, priority: "moyenne", phase: "suivi" },
    { title: "Recevoir la lettre d'introduction / visa", daysOffset: 90, priority: "haute", phase: "suivi" },
  ],
};

const STUDY_EXTENSION: ProgramTaskConfig = {
  programId: "study-extension",
  estimatedTimeline: "2-4 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "4-8 semaines",
  tasks: [
    { title: "Vérifier la date d'expiration du permis actuel", daysOffset: 0, priority: "haute", phase: "preparation", description: "Soumettre au moins 30 jours avant expiration" },
    { title: "Obtenir preuve d'inscription active", daysOffset: 2, priority: "haute", phase: "documents" },
    { title: "Préparer preuve de fonds à jour", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Renouveler le CAQ (Québec)", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Remplir le formulaire de prolongation", daysOffset: 10, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande en ligne", daysOffset: 14, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 45, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// PERMIS DE TRAVAIL
// ────────────────────────────────────────────

const WORK_PERMIT_LMIA: ProgramTaskConfig = {
  programId: "work-permit-lmia",
  estimatedTimeline: "4-8 mois (EIMT: 2-4 mois + PT: 2-4 mois)",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "EIMT: 2-4 mois, puis PT: 2-4 mois",
  tasks: [
    { title: "Consultation initiale — évaluer le poste et l'employeur", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Préparer le dossier EIMT (employeur)", daysOffset: 3, priority: "haute", phase: "documents", description: "Plan de transition, preuve de recrutement, annonces d'emploi" },
    { title: "Afficher le poste (4 semaines minimum)", daysOffset: 5, priority: "haute", phase: "documents", description: "Guichet-Emplois + 2 autres plateformes pendant 4 semaines" },
    { title: "Compiler les preuves de recrutement", daysOffset: 35, priority: "haute", phase: "documents" },
    { title: "Soumettre la demande EIMT à EDSC", daysOffset: 40, priority: "haute", phase: "soumission" },
    { title: "Répondre aux questions EDSC si applicable", daysOffset: 70, priority: "haute", phase: "suivi" },
    { title: "Recevoir l'EIMT positive", daysOffset: 90, priority: "haute", phase: "suivi" },
    { title: "Collecter les documents du travailleur", daysOffset: 95, priority: "haute", phase: "documents", description: "Passeport, CV, diplômes, offre d'emploi, EIMT" },
    { title: "Examen médical (si requis)", daysOffset: 100, priority: "haute", phase: "documents" },
    { title: "Soumettre la demande de permis de travail", daysOffset: 105, priority: "haute", phase: "soumission" },
    { title: "Données biométriques", daysOffset: 110, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC — permis de travail", daysOffset: 150, priority: "moyenne", phase: "suivi" },
  ],
};

const WORK_PERMIT_OPEN: ProgramTaskConfig = {
  programId: "work-permit-open",
  estimatedTimeline: "2-4 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "2-4 mois",
  tasks: [
    { title: "Consultation — vérifier admissibilité au permis ouvert", daysOffset: 0, priority: "haute", phase: "preparation", description: "Conjoint de travailleur/étudiant, PTPD en attente, etc." },
    { title: "Collecter les documents d'identité", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Préparer la preuve de statut du conjoint/partenaire", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Remplir les formulaires de demande", daysOffset: 10, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande", daysOffset: 14, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 60, priority: "moyenne", phase: "suivi" },
  ],
};

const PGWP: ProgramTaskConfig = {
  programId: "pgwp",
  estimatedTimeline: "2-4 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "2-3 mois",
  tasks: [
    { title: "Vérifier admissibilité PTPD (programme, DLI, durée)", daysOffset: 0, priority: "haute", phase: "preparation", description: "180 jours après obtention du relevé de notes final" },
    { title: "Obtenir la lettre de confirmation des études / relevé final", daysOffset: 2, priority: "haute", phase: "documents" },
    { title: "Collecter les documents d'identité", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Remplir le formulaire IMM 5710", daysOffset: 7, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande PTPD en ligne", daysOffset: 14, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 60, priority: "moyenne", phase: "suivi" },
  ],
};

const MOBILITE_FRANCOPHONE: ProgramTaskConfig = {
  programId: "mobilite-francophone",
  estimatedTimeline: "2-4 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "2-4 mois",
  tasks: [
    { title: "Consultation — vérifier admissibilité Mobilité francophone", daysOffset: 0, priority: "haute", phase: "preparation", description: "Poste TEER 0-5 hors Québec, francophone" },
    { title: "Confirmer l'offre d'emploi et le numéro d'offre", daysOffset: 3, priority: "haute", phase: "documents", description: "Employeur soumet offre via Portail Employeur IRCC (C16)" },
    { title: "Préparer preuve de compétence en français", daysOffset: 5, priority: "haute", phase: "documents", description: "TEF/TCF CLB 5+ ou preuve de formation en français" },
    { title: "Collecter les documents d'identité + CV", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Remplir la demande de permis de travail", daysOffset: 14, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande", daysOffset: 18, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 60, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// PARRAINAGE FAMILIAL
// ────────────────────────────────────────────

const FAMILY_SPOUSE: ProgramTaskConfig = {
  programId: "family-spouse",
  estimatedTimeline: "12-18 mois",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "12-18 mois (intérieur) / 12-15 mois (extérieur)",
  tasks: [
    { title: "Consultation initiale — évaluer la relation", daysOffset: 0, priority: "haute", phase: "preparation", description: "Vérifier admissibilité du garant et authenticité de la relation" },
    { title: "Collecter les preuves de relation", daysOffset: 5, priority: "haute", phase: "documents", description: "Photos, communications, voyages, comptes joints, bail commun" },
    { title: "Documents d'identité (garant + demandeur)", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Preuve de revenu du garant (avis cotisation)", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Certificats de police (tous les pays 6+ mois)", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Examen médical du demandeur", daysOffset: 14, priority: "haute", phase: "documents" },
    { title: "Remplir formulaires IMM 1344 + IMM 0008 + annexes", daysOffset: 21, priority: "haute", phase: "formulaires" },
    { title: "Rédiger la déclaration sous serment de relation", daysOffset: 25, priority: "haute", phase: "formulaires" },
    { title: "Révision complète du dossier", daysOffset: 30, priority: "haute", phase: "revision" },
    { title: "Soumettre le dossier complet", daysOffset: 35, priority: "haute", phase: "soumission" },
    { title: "Payer les frais (garant + RP + RHDCC)", daysOffset: 35, priority: "haute", phase: "soumission" },
    { title: "Suivi — étape 1 (approbation parrainage)", daysOffset: 120, priority: "moyenne", phase: "suivi" },
    { title: "Suivi — étape 2 (traitement RP)", daysOffset: 240, priority: "moyenne", phase: "suivi" },
    { title: "Entrevue (si requise)", daysOffset: 300, priority: "haute", phase: "suivi" },
    { title: "Décision finale — COPR", daysOffset: 450, priority: "haute", phase: "suivi" },
  ],
};

const FAMILY_PARENTS: ProgramTaskConfig = {
  programId: "family-parents",
  estimatedTimeline: "24-36 mois",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "24-36 mois après soumission",
  tasks: [
    { title: "Consultation — vérifier admissibilité PGP", daysOffset: 0, priority: "haute", phase: "preparation", description: "Revenu minimum (LICO+30%) sur 3 ans" },
    { title: "Soumettre le formulaire d'intérêt (loterie PGP)", daysOffset: 3, priority: "haute", phase: "soumission", description: "Portail IRCC — période limitée" },
    { title: "Compiler les avis de cotisation (3 ans)", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Documents d'identité (garant + parents)", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Certificats de police des parents", daysOffset: 14, priority: "haute", phase: "documents" },
    { title: "Examen médical des parents", daysOffset: 21, priority: "haute", phase: "documents" },
    { title: "Remplir le formulaire complet si invitation reçue", daysOffset: 30, priority: "haute", phase: "formulaires" },
    { title: "Soumettre le dossier complet (60 jours)", daysOffset: 45, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC — très long délai", daysOffset: 180, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// QUÉBEC — PSTQ / PEQ
// ────────────────────────────────────────────

const PSTQ_ARRIMA: ProgramTaskConfig = {
  programId: "pnp-quebec-pstq",
  estimatedTimeline: "18-30 mois (CSQ: 12-18 mois + RP: 6-12 mois)",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "CSQ: 12-18 mois, puis RP: 6-12 mois",
  tasks: [
    { title: "Consultation initiale — admissibilité PSTQ", daysOffset: 0, priority: "haute", phase: "preparation", description: "Vérifier grille Arrima, domaine de formation, expérience" },
    { title: "Passer tests de français (TEF/TEFAQ/TCF)", daysOffset: 5, priority: "haute", phase: "documents", description: "Minimum B2 en français (oral + écrit)" },
    { title: "Obtenir l'évaluation comparative des études (EC)", daysOffset: 5, priority: "haute", phase: "documents", description: "MIFI — délai 8-12 semaines" },
    { title: "Collecter les documents d'identité", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Préparer les preuves d'expérience", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Créer le profil Arrima", daysOffset: 45, priority: "haute", phase: "formulaires", description: "Après réception EC + résultats français" },
    { title: "Vérifier le score Arrima et optimiser", daysOffset: 46, priority: "haute", phase: "formulaires" },
    { title: "Attendre l'invitation à présenter une demande", daysOffset: 60, priority: "moyenne", phase: "suivi", description: "Les rondes sont périodiques — attente variable" },
    { title: "Préparer la demande CSQ (si invité)", daysOffset: 90, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande de CSQ", daysOffset: 100, priority: "haute", phase: "soumission" },
    { title: "Recevoir le CSQ", daysOffset: 360, priority: "haute", phase: "suivi" },
    { title: "Soumettre la demande de RP fédérale", daysOffset: 370, priority: "haute", phase: "soumission" },
    { title: "Examen médical", daysOffset: 375, priority: "haute", phase: "documents" },
    { title: "Suivi IRCC — RP", daysOffset: 450, priority: "moyenne", phase: "suivi" },
  ],
};

const PEQ: ProgramTaskConfig = {
  programId: "pnp-peq",
  estimatedTimeline: "Programme terminé (nov 2025) — dossiers existants seulement",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "CSQ: 6-12 mois (dossiers déjà déposés)",
  tasks: [
    { title: "Vérifier le statut du dossier PEQ existant", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Fournir les documents manquants si demandé", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Suivi MIFI", daysOffset: 30, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// VISITEURS / SUPER VISA
// ────────────────────────────────────────────

const TRV_VISITOR: ProgramTaskConfig = {
  programId: "trv-visitor",
  estimatedTimeline: "2-8 semaines",
  cabinetDaysMin: 7,
  cabinetDaysMax: 21,
  processingTime: "2-8 semaines selon pays",
  tasks: [
    { title: "Consultation — vérifier le besoin de visa", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Collecter les documents (passeport, emploi, finances)", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Préparer la lettre d'invitation", daysOffset: 5, priority: "moyenne", phase: "documents" },
    { title: "Remplir les formulaires IMM 5257", daysOffset: 7, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande + biométrie", daysOffset: 10, priority: "haute", phase: "soumission" },
    { title: "Suivi", daysOffset: 30, priority: "moyenne", phase: "suivi" },
  ],
};

const SUPER_VISA: ProgramTaskConfig = {
  programId: "super-visa",
  estimatedTimeline: "3-6 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "3-6 mois",
  tasks: [
    { title: "Consultation — admissibilité super visa", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Obtenir l'assurance médicale (1 an minimum, 100 000$)", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Préparer la lettre d'invitation détaillée", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Preuves de revenu de l'enfant/petit-enfant (LICO)", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Examen médical", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Remplir et soumettre la demande", daysOffset: 14, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 60, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// CITOYENNETÉ
// ────────────────────────────────────────────

const CITIZENSHIP: ProgramTaskConfig = {
  programId: "citizenship-adult",
  estimatedTimeline: "12-18 mois",
  cabinetDaysMin: 14,
  cabinetDaysMax: 30,
  processingTime: "8-14 mois",
  tasks: [
    { title: "Consultation — vérifier admissibilité (présence physique)", daysOffset: 0, priority: "haute", phase: "preparation", description: "1095 jours sur 5 ans, déclarations T1, obligations RP" },
    { title: "Calculer la présence physique exacte", daysOffset: 3, priority: "haute", phase: "preparation" },
    { title: "Collecter les documents", daysOffset: 5, priority: "haute", phase: "documents", description: "Passeports, déclarations impôt, RP card, pièces identité" },
    { title: "Remplir le formulaire CIT 0002", daysOffset: 10, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande", daysOffset: 14, priority: "haute", phase: "soumission" },
    { title: "Préparer le test de citoyenneté", daysOffset: 90, priority: "moyenne", phase: "suivi", description: "Étudier 'Découvrir le Canada'" },
    { title: "Passer le test de citoyenneté", daysOffset: 180, priority: "haute", phase: "suivi" },
    { title: "Cérémonie de citoyenneté", daysOffset: 360, priority: "haute", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// ASILE / RÉFUGIÉS
// ────────────────────────────────────────────

const ASILE_INLAND: ProgramTaskConfig = {
  programId: "asile-inland",
  estimatedTimeline: "18-36 mois (audience + décision)",
  cabinetDaysMin: 30,
  cabinetDaysMax: 90,
  processingTime: "12-24 mois (audience), puis 6-12 mois (décision)",
  tasks: [
    { title: "Consultation urgente — évaluer la demande d'asile", daysOffset: 0, priority: "haute", phase: "preparation", description: "Déterminer les motifs de protection (Convention, ERAR, torture)" },
    { title: "Formulaire Fondement de la demande d'asile (FDA)", daysOffset: 1, priority: "haute", phase: "formulaires", description: "DÉLAI STRICT: 15 jours ouvrables après la demande" },
    { title: "Collecter les preuves de persécution", daysOffset: 5, priority: "haute", phase: "documents", description: "Rapports médicaux, menaces, articles, rapports pays" },
    { title: "Préparer le narratif personnel détaillé", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Recherche sur les conditions du pays d'origine", daysOffset: 14, priority: "haute", phase: "documents" },
    { title: "Soumettre le FDA dans les délais", daysOffset: 15, priority: "haute", phase: "soumission" },
    { title: "Préparation à l'audience CISR", daysOffset: 60, priority: "haute", phase: "preparation", description: "Simulation d'audience, préparation témoignage" },
    { title: "Audience devant la SPR", daysOffset: 180, priority: "haute", phase: "suivi" },
    { title: "Attendre la décision", daysOffset: 210, priority: "moyenne", phase: "suivi" },
    { title: "Si accepté — demande de RP (personne protégée)", daysOffset: 360, priority: "haute", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// PROGRAMMES ADDITIONNELS — PNP PROVINCES
// ────────────────────────────────────────────

const PNP_GENERIC: ProgramTaskConfig = {
  programId: "pnp-generic",
  estimatedTimeline: "12-24 mois (provincial: 3-8 mois + RP: 6-12 mois)",
  cabinetDaysMin: 30,
  cabinetDaysMax: 60,
  processingTime: "6-18 mois total",
  tasks: [
    { title: "Consultation — évaluer le volet PNP applicable", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Collecter les documents d'identité et CV", daysOffset: 5, priority: "haute", phase: "documents" },
    { title: "Tests de langue (si requis)", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Évaluation des diplômes (si requis)", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Preuves d'expérience et lettres d'emploi", daysOffset: 10, priority: "haute", phase: "documents" },
    { title: "Préparer la demande provinciale", daysOffset: 21, priority: "haute", phase: "formulaires" },
    { title: "Soumettre au programme provincial", daysOffset: 30, priority: "haute", phase: "soumission" },
    { title: "Recevoir la nomination provinciale", daysOffset: 120, priority: "haute", phase: "suivi" },
    { title: "Soumettre la demande de RP fédérale", daysOffset: 130, priority: "haute", phase: "soumission" },
    { title: "Examen médical + certificats de police", daysOffset: 135, priority: "haute", phase: "documents" },
    { title: "Suivi IRCC", daysOffset: 240, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// BUSINESS
// ────────────────────────────────────────────

const STARTUP_VISA: ProgramTaskConfig = {
  programId: "startup-visa",
  estimatedTimeline: "12-24 mois",
  cabinetDaysMin: 60,
  cabinetDaysMax: 120,
  processingTime: "12-18 mois",
  tasks: [
    { title: "Consultation — évaluer le projet d'entreprise", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Préparer le plan d'affaires", daysOffset: 7, priority: "haute", phase: "documents" },
    { title: "Obtenir une lettre de soutien d'un organisme désigné", daysOffset: 30, priority: "haute", phase: "documents", description: "Incubateur, fonds de capital-risque ou investisseur providentiel" },
    { title: "Tests de langue (CLB 5 minimum)", daysOffset: 14, priority: "haute", phase: "documents" },
    { title: "Preuves de fonds d'établissement", daysOffset: 21, priority: "haute", phase: "documents" },
    { title: "Remplir les formulaires de demande RP", daysOffset: 60, priority: "haute", phase: "formulaires" },
    { title: "Examen médical et certificats de police", daysOffset: 65, priority: "haute", phase: "documents" },
    { title: "Soumettre la demande", daysOffset: 75, priority: "haute", phase: "soumission" },
    { title: "Suivi IRCC", daysOffset: 180, priority: "moyenne", phase: "suivi" },
  ],
};

// ────────────────────────────────────────────
// AUTRES
// ────────────────────────────────────────────

const PR_CARD_RENEWAL: ProgramTaskConfig = {
  programId: "pr-card-renewal",
  estimatedTimeline: "2-4 mois",
  cabinetDaysMin: 7,
  cabinetDaysMax: 21,
  processingTime: "1-3 mois",
  tasks: [
    { title: "Vérifier l'obligation de résidence (730j/5ans)", daysOffset: 0, priority: "haute", phase: "preparation" },
    { title: "Collecter les documents (passeport, carte RP, preuves de présence)", daysOffset: 3, priority: "haute", phase: "documents" },
    { title: "Photos aux normes IRCC", daysOffset: 5, priority: "moyenne", phase: "documents" },
    { title: "Remplir le formulaire IMM 5444", daysOffset: 7, priority: "haute", phase: "formulaires" },
    { title: "Soumettre la demande (en personne ou par courrier)", daysOffset: 10, priority: "haute", phase: "soumission" },
    { title: "Suivi", daysOffset: 45, priority: "moyenne", phase: "suivi" },
  ],
};

// ========================================================
// REGISTRE PRINCIPAL — map programId → config
// ========================================================

const PROGRAM_TASK_REGISTRY: ProgramTaskConfig[] = [
  EE_FSW, EE_CEC, EE_FST,
  STUDY_PERMIT, STUDY_EXTENSION,
  WORK_PERMIT_LMIA, WORK_PERMIT_OPEN, PGWP, MOBILITE_FRANCOPHONE,
  FAMILY_SPOUSE, FAMILY_PARENTS,
  PSTQ_ARRIMA, PEQ,
  TRV_VISITOR, SUPER_VISA,
  CITIZENSHIP,
  ASILE_INLAND,
  STARTUP_VISA,
  PR_CARD_RENEWAL,
];

// Map by programId for O(1) lookup
const REGISTRY_MAP = new Map<string, ProgramTaskConfig>();
PROGRAM_TASK_REGISTRY.forEach(c => REGISTRY_MAP.set(c.programId, c));

/**
 * Get the task config for a given program.
 * Falls back to PNP generic for any PNP program not explicitly defined.
 */
export function getTaskConfigForProgram(programId: string): ProgramTaskConfig | null {
  const direct = REGISTRY_MAP.get(programId);
  if (direct) return direct;

  // Fallback for PNP variants
  if (programId.startsWith("pnp-")) return { ...PNP_GENERIC, programId };

  return null;
}

/**
 * Generate tasks for a case based on its program.
 * Returns an array of tasks with calculated due dates.
 */
export function generateTasksForProgram(
  programId: string,
  caseId: string,
  assignee: string,
  startDate?: Date,
): Array<{
  id: string;
  caseId: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'haute' | 'moyenne' | 'basse';
  status: 'a_faire' | 'en_cours' | 'terminee';
  phase: string;
  description: string;
  createdAt: string;
}> {
  const config = getTaskConfigForProgram(programId);
  if (!config) return [];

  const start = startDate || new Date();
  const now = new Date().toISOString();

  return config.tasks.map((t, idx) => {
    const due = new Date(start);
    due.setDate(due.getDate() + t.daysOffset);

    return {
      id: `task_${caseId}_${idx}_${Date.now()}`,
      caseId,
      title: t.title,
      assignee,
      dueDate: due.toISOString().split('T')[0],
      priority: t.priority,
      status: 'a_faire' as const,
      phase: t.phase,
      description: t.description || '',
      createdAt: now,
    };
  });
}

/**
 * Phase labels and colors for display
 */
export const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  preparation: { label: 'Préparation', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  documents: { label: 'Documents', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  formulaires: { label: 'Formulaires', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  revision: { label: 'Révision', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  soumission: { label: 'Soumission', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  suivi: { label: 'Suivi IRCC', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};
