// ========================================================
// SOS Hub Canada - Grille tarifaire 2026
// Basée sur les tarifs maximum des avocats en immigration au Québec
// Positionnement premium — marché montréalais 2026
// ========================================================

export interface PricingTier {
  id: string;
  programId: string;
  name: string;
  category: string;
  description: string;
  location: 'canada' | 'etranger' | 'les_deux';
  serviceFee: number; // Honoraires professionnels (non inscrit TPS/TVQ — aucune taxe)
  governmentFee: number; // Déboursés gouvernementaux (non taxables)
  governmentFeePayeur: 'client' | 'employeur'; // Qui assume les frais gouvernementaux
  consultationInitiale: number;
  includes: string[];
  addOns?: { name: string; price: number }[];
  paymentOptions: {
    type: 'immediat' | 'acompte_50' | '3_versements' | 'sur_mesure';
    label: string;
  }[];
  estimatedTimeline: string;
  notes?: string;
}

export const CONSULTATION_FEE_2026 = 0; // Consultation initiale GRATUITE 2026
export const FRAIS_OUVERTURE_DOSSIER = 250; // Frais d'ouverture de dossier — déductible si contrat signé

export const PRICING_CATEGORIES_2026: Record<string, string> = {
  temporaire: 'Résidence temporaire',
  residence_permanente: 'Résidence permanente',
  express_entry: 'Entrée express',
  quebec: 'Programmes du Québec',
  parrainage: 'Parrainage familial',
  refugie: 'Réfugiés et asile',
  citoyennete: 'Citoyenneté',
  affaires: 'Immigration d\'affaires',
  employeur: 'Services aux employeurs',
  additionnel: 'Services additionnels',
};

// ========================================================
// GRILLE TARIFAIRE 2026 — SOS HUB CANADA
// Conforme à l'art. 17 du Règlement sur les consultants en
// immigration du Québec et à la section 24 du Code CICC.
// Les honoraires et déboursés sont ventilés séparément.
// Les frais d'EIMT sont à la charge exclusive de l'employeur
// (art. 209.2 RIPR).
// ========================================================
export const PRICING_2026: PricingTier[] = [
  // ============ RÉSIDENCE TEMPORAIRE ============
  {
    id: 'price-pt-canada',
    programId: 'work-permit-lmia',
    name: 'Permis de travail — Depuis le Canada',
    category: 'temporaire',
    description: 'Demande de permis de travail fermé ou ouvert pour personne déjà au Canada',
    location: 'canada',
    serviceFee: 3000, // Permis travail Canada
    governmentFee: 255, // Déboursés: frais IRCC permis de travail
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation complète du profil',
      'Préparation de tous les formulaires IRCC',
      'Révision des documents justificatifs',
      'Soumission en ligne de la demande',
      'Suivi du dossier jusqu\'à la décision',
      'Communication avec IRCC si nécessaire',
      'Support pour la biométrie',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '4-12 semaines',
  },
  {
    id: 'price-pt-etranger',
    programId: 'work-permit-lmia',
    name: 'Permis de travail — Depuis l\'étranger',
    category: 'temporaire',
    description: 'Demande de permis de travail pour personne à l\'extérieur du Canada',
    location: 'etranger',
    serviceFee: 4500, // Permis travail étranger
    governmentFee: 255,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation complète du profil',
      'Préparation de tous les formulaires IRCC',
      'Lettre d\'offre d\'emploi et contrat de travail',
      'Coordination avec l\'employeur canadien',
      'Révision des documents justificatifs',
      'Soumission de la demande (en ligne ou au VAC)',
      'Suivi du dossier jusqu\'à l\'obtention du visa',
      'Accompagnement pour le port d\'entrée',
      'Support pour la biométrie et examen médical',
    ],
    addOns: [
      { name: 'Demande CAQ/CSQ Québec', price: 1500 },
      { name: 'Préparation entrevue ambassade', price: 500 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '4-16 semaines',
  },
  {
    id: 'price-pt-ouvert',
    programId: 'work-permit-open',
    name: 'Permis de travail ouvert (conjoint, PTPD, vulnérable)',
    category: 'temporaire',
    description: 'Permis de travail ouvert sans employeur spécifique',
    location: 'les_deux',
    serviceFee: 1500, // Mid-premium — permis ouvert
    governmentFee: 255,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité',
      'Préparation des formulaires',
      'Soumission en ligne',
      'Suivi jusqu\'à la décision',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral à la signature' },
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
    ],
    estimatedTimeline: '4-12 semaines',
  },
  {
    id: 'price-ptpd',
    programId: 'pgwp',
    name: 'Permis de travail post-diplôme (PTPD)',
    category: 'temporaire',
    description: 'Demande de PTPD après graduation d\'un EED',
    location: 'canada',
    serviceFee: 1200, // Mid-premium — PTPD
    governmentFee: 255,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Vérification de l\'admissibilité',
      'Préparation des formulaires',
      'Soumission en ligne',
      'Suivi du dossier',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
    ],
    estimatedTimeline: '4-12 semaines',
  },
  {
    id: 'price-etudes-canada',
    programId: 'study-permit',
    name: 'Permis d\'études — Depuis le Canada (CAQ + inscription)',
    category: 'temporaire',
    description: 'Demande de permis d\'études depuis le Canada incluant CAQ et coordination d\'inscription',
    location: 'canada',
    serviceFee: 2500, // Études depuis le Canada
    governmentFee: 150,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation du profil et programme d\'études',
      'Préparation des formulaires',
      'Plan financier et preuve de fonds',
      'Soumission en ligne',
      'Suivi du dossier',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
    ],
    estimatedTimeline: '4-16 semaines',
  },
  {
    id: 'price-etudes-etranger',
    programId: 'study-permit',
    name: 'Permis d\'études — Depuis l\'étranger (CAQ + inscription)',
    category: 'temporaire',
    description: 'Demande de permis d\'études depuis l\'étranger incluant CAQ Québec et coordination d\'inscription',
    location: 'etranger',
    serviceFee: 3500, // Études depuis l'étranger
    governmentFee: 150,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation du profil et orientation programme',
      'Préparation de tous les formulaires',
      'Plan financier et preuve de fonds',
      'Lettre de motivation',
      'Coordination avec l\'EED',
      'Demande de CAQ (Québec)',
      'Soumission au VAC',
      'Préparation entrevue si nécessaire',
      'Suivi jusqu\'à l\'obtention du visa',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '8-16 semaines',
  },
  {
    id: 'price-vrt',
    programId: 'trv-visitor',
    name: 'Visa de résident temporaire (visiteur)',
    category: 'temporaire',
    description: 'Demande de visa visiteur pour le Canada',
    location: 'etranger',
    serviceFee: 1000, // Mid-premium — visa visiteur
    governmentFee: 100,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité',
      'Préparation des formulaires',
      'Lettre de motivation',
      'Soumission de la demande',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
    ],
    estimatedTimeline: '2-12 semaines',
  },
  {
    id: 'price-eta',
    programId: 'eta-visitor',
    name: 'eTA — Autorisation de voyage électronique',
    category: 'temporaire',
    description: 'Demande d\'autorisation de voyage électronique (eTA) pour visiteurs exemptés de visa',
    location: 'etranger',
    serviceFee: 250, // Mid-premium — eTA
    governmentFee: 7,
    governmentFeePayeur: 'client',
    consultationInitiale: 0,
    includes: [
      'Vérification de l\'admissibilité',
      'Préparation et soumission de la demande eTA',
      'Suivi de la demande',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
    ],
    estimatedTimeline: '24-72 heures',
  },
  {
    id: 'price-super-visa',
    programId: 'super-visa',
    name: 'Super visa (parents/grands-parents)',
    category: 'temporaire',
    description: 'Visa multi-entrées avec séjours prolongés',
    location: 'etranger',
    serviceFee: 1500, // Mid-premium — super visa
    governmentFee: 100,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation profil financier du garant',
      'Préparation des formulaires',
      'Lettre d\'invitation',
      'Coordination assurance médicale',
      'Soumission et suivi',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
      { type: 'acompte_50', label: '50% + 50%' },
    ],
    estimatedTimeline: '4-16 semaines',
  },
  {
    id: 'price-mobilite-francophone',
    programId: 'mobilite-francophone',
    name: 'Mobilité francophone (sans EIMT)',
    category: 'temporaire',
    description: 'Permis de travail pour francophones hors Québec sans EIMT',
    location: 'les_deux',
    serviceFee: 2500, // Mid-premium — mobilité francophone
    governmentFee: 155,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Vérification de l\'admissibilité',
      'Coordination avec l\'employeur',
      'Préparation des formulaires',
      'Soumission de la demande',
      'Suivi du dossier',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
    ],
    estimatedTimeline: '4-8 semaines',
  },

  // ============ ENTRÉE EXPRESS ============
  {
    id: 'price-ee-fsw',
    programId: 'ee-fsw',
    name: 'Entrée express — Travailleurs qualifiés fédéral (FSW)',
    category: 'express_entry',
    description: 'Service complet pour le programme des travailleurs qualifiés fédéral',
    location: 'les_deux',
    serviceFee: 3500, // Mid-premium — Entrée express FSW
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation complète du profil CRS',
      'Stratégie d\'optimisation du score CRS',
      'Création du profil Entrée express',
      'Préparation de tous les formulaires de RP',
      'Révision et certification des documents',
      'Soumission de la demande de RP',
      'Suivi avec IRCC jusqu\'à la décision finale',
      'Accompagnement pour l\'examen médical',
      'Support pour le confirmation de résidence permanente (COPR)',
    ],
    addOns: [
      { name: 'Évaluation des diplômes (ECA/WES)', price: 350 },
      { name: 'Conjoint/partenaire inclus', price: 2500 },
      { name: 'Enfant à charge (par enfant)', price: 750 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à l\'ITA' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '6-8 mois',
  },
  {
    id: 'price-ee-cec',
    programId: 'ee-cec',
    name: 'Entrée express — Catégorie expérience canadienne (CEC)',
    category: 'express_entry',
    description: 'Service complet pour la catégorie de l\'expérience canadienne',
    location: 'canada',
    serviceFee: 3000, // Mid-premium — EE CEC
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation du profil CRS',
      'Création du profil Entrée express',
      'Préparation des formulaires de RP',
      'Soumission et suivi complet',
      'Support COPR',
    ],
    addOns: [
      { name: 'Conjoint/partenaire inclus', price: 2500 },
      { name: 'Enfant à charge (par enfant)', price: 750 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à l\'ITA' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '6-8 mois',
  },

  // ============ PROGRAMMES DU QUÉBEC ============
  {
    id: 'price-peq',
    programId: 'pnp-peq',
    name: 'PEQ — Programme de l\'expérience québécoise',
    category: 'quebec',
    description: 'CSQ + RP pour travailleurs ou diplômés du Québec',
    location: 'canada',
    serviceFee: 4000, // Mid-premium — EE 2 demandes
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité PEQ',
      'Préparation de la demande de CSQ',
      'Soumission au MIFI',
      'Suivi du CSQ',
      'Préparation de la demande de RP fédérale',
      'Soumission à IRCC',
      'Suivi complet jusqu\'au COPR',
    ],
    addOns: [
      { name: 'Conjoint/partenaire inclus', price: 2500 },
      { name: 'Enfant à charge (par enfant)', price: 750 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission fédérale' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '12-16 mois',
    notes: 'Inclut les deux étapes: CSQ (provincial) + RP (fédéral)',
  },
  {
    id: 'price-pstq',
    programId: 'pnp-quebec-pstq',
    name: 'PSTQ / Arrima — Sélection permanente Québec',
    category: 'quebec',
    description: 'Programme de sélection via le portail Arrima',
    location: 'les_deux',
    serviceFee: 3500, // Mid-premium — PEQ $ tout inclus
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Création du profil Arrima',
      'Stratégie d\'optimisation du score',
      'Préparation de la demande de CSQ',
      'Soumission au MIFI après invitation',
      'Demande de RP fédérale',
      'Suivi complet du processus',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
      { type: '3_versements', label: '3 versements' },
    ],
    estimatedTimeline: '12-18 mois',
  },

  // ============ PARRAINAGE FAMILIAL ============
  {
    id: 'price-parrainage-conjoint',
    programId: 'family-spouse',
    name: 'Parrainage — Époux / Conjoint de fait',
    category: 'parrainage',
    description: 'Parrainage pour la résidence permanente du conjoint',
    location: 'les_deux',
    serviceFee: 3500, // Mid-premium — PSTQ Arrima
    governmentFee: 1625,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité du garant',
      'Préparation du dossier de parrainage',
      'Formulaires du garant et du demandeur',
      'Compilation des preuves de relation',
      'Soumission et suivi complet',
      'Support pour l\'entrevue si nécessaire',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% à la soumission' },
      { type: '3_versements', label: '3 versements égaux' },
    ],
    estimatedTimeline: '12 mois',
  },
  {
    id: 'price-parrainage-parents',
    programId: 'family-parents',
    name: 'Parrainage — Parents et grands-parents',
    category: 'parrainage',
    description: 'Parrainage PGP pour parents et grands-parents',
    location: 'etranger',
    serviceFee: 4500, // Parrainage parents
    governmentFee: 1625,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Inscription au tirage PGP',
      'Évaluation financière du garant',
      'Préparation complète du dossier',
      'Engagement financier 20 ans',
      'Soumission et suivi',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
      { type: '3_versements', label: '3 versements' },
    ],
    estimatedTimeline: '20-24 mois',
  },

  // ============ RÉFUGIÉS ET ASILE ============
  {
    id: 'price-asile',
    programId: 'asile-inland',
    name: 'Demande d\'asile — Représentation complète',
    category: 'refugie',
    description: 'Représentation devant la CISR incluant audience',
    location: 'canada',
    serviceFee: 3000, // Mid-premium — EIMT agricole
    governmentFee: 0,
    governmentFeePayeur: 'client',
    consultationInitiale: 0,
    includes: [
      'Consultation initiale gratuite',
      'Préparation du formulaire FDA (BOC)',
      'Rédaction du récit du demandeur',
      'Compilation de la preuve documentaire',
      'Préparation à l\'audience CISR',
      'Représentation à l\'audience',
      'Suivi post-audience',
    ],
    addOns: [
      { name: 'Traduction certifiée de documents', price: 35 },
      { name: 'Interprète pour l\'audience', price: 500 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% à la signature, 50% avant l\'audience' },
      { type: '3_versements', label: '3 versements' },
      { type: 'sur_mesure', label: 'Plan de paiement personnalisé' },
    ],
    estimatedTimeline: '12-24 mois',
    notes: 'Consultation initiale gratuite pour les demandeurs d\'asile',
  },
  {
    id: 'price-rp-protege',
    programId: 'protected-person-pr',
    name: 'RP — Personne protégée',
    category: 'refugie',
    description: 'Demande de résidence permanente pour personne protégée',
    location: 'canada',
    serviceFee: 2500, // Mid-premium — Citoyennete
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Préparation de la demande de RP',
      'Formulaires et documents justificatifs',
      'Soumission et suivi avec IRCC',
      'Support pour examen médical',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
      { type: '3_versements', label: '3 versements' },
    ],
    estimatedTimeline: '12-18 mois',
  },

  // ============ CITOYENNETÉ ============
  {
    id: 'price-citoyennete',
    programId: 'citizenship-adult',
    name: 'Citoyenneté canadienne — Adulte',
    category: 'citoyennete',
    description: 'Demande de citoyenneté pour adulte (18+)',
    location: 'canada',
    serviceFee: 1500, // Mid-premium — Citoyennete simple
    governmentFee: 630,
    governmentFeePayeur: 'client',
    consultationInitiale: 250,
    includes: [
      'Calcul des jours de présence physique',
      'Vérification de l\'admissibilité',
      'Préparation des formulaires',
      'Soumission de la demande',
      'Préparation au test de citoyenneté',
      'Suivi jusqu\'à la cérémonie',
    ],
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
      { type: 'acompte_50', label: '50% + 50%' },
    ],
    estimatedTimeline: '12 mois',
  },

  // ============ IMMIGRATION D'AFFAIRES ============
  {
    id: 'price-startup',
    programId: 'startup-visa',
    name: 'Visa démarrage d\'entreprise (Start-up Visa)',
    category: 'affaires',
    description: 'RP pour entrepreneurs innovants',
    location: 'les_deux',
    serviceFee: 8000, // Mid-premium — Immigration affaires
    governmentFee: 2140,
    governmentFeePayeur: 'client',
    consultationInitiale: 500,
    includes: [
      'Évaluation du projet d\'affaires',
      'Mise en relation avec organisations désignées',
      'Préparation du plan d\'affaires',
      'Obtention de la lettre d\'appui',
      'Préparation de la demande de RP',
      'Soumission et suivi complet',
    ],
    paymentOptions: [
      { type: '3_versements', label: '3 versements' },
      { type: 'sur_mesure', label: 'Plan personnalisé' },
    ],
    estimatedTimeline: '12-16 mois',
  },

  // ============ SERVICES AUX EMPLOYEURS ============
  {
    id: 'price-lmia-haut',
    programId: 'work-permit-lmia',
    name: 'EIMT/LMIA — Volet haut salaire',
    category: 'employeur',
    description: 'Demande d\'EIMT pour poste à haut salaire (au-dessus du salaire médian)',
    location: 'canada',
    serviceFee: 5000, // EIMT haute
    governmentFee: 1000,
    governmentFeePayeur: 'employeur',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité de l\'employeur',
      'Rédaction de l\'annonce Guichet-Emplois',
      'Documentation des efforts de recrutement',
      'Préparation du formulaire EMP 5593',
      'Plan de transition (EMP 5627)',
      'Soumission à EDSC',
      'Suivi jusqu\'à la décision',
    ],
    addOns: [
      { name: 'Demande CAQ/CSQ pour le travailleur', price: 1500 },
      { name: 'Permis de travail du travailleur', price: 5000 },
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
    ],
    estimatedTimeline: '8-16 semaines',
  },
  {
    id: 'price-lmia-bas',
    programId: 'work-permit-lmia',
    name: 'EIMT/LMIA — Volet bas salaire',
    category: 'employeur',
    description: 'Demande d\'EIMT pour poste à bas salaire (sous le salaire médian)',
    location: 'canada',
    serviceFee: 4000, // EIMT basse
    governmentFee: 1000,
    governmentFeePayeur: 'employeur',
    consultationInitiale: 250,
    includes: [
      'Évaluation de l\'admissibilité',
      'Annonce Guichet-Emplois',
      'Documentation du recrutement',
      'Préparation EMP 5593',
      'Soumission à EDSC',
      'Suivi du dossier',
    ],
    paymentOptions: [
      { type: 'acompte_50', label: '50% + 50%' },
    ],
    estimatedTimeline: '8-16 semaines',
  },
  {
    id: 'price-lmia-agricole',
    programId: 'work-permit-lmia',
    name: 'EIMT/LMIA — Programme agricole / PTAS',
    category: 'employeur',
    description: 'Demande d\'EIMT pour le programme des travailleurs agricoles saisonniers',
    location: 'canada',
    serviceFee: 3000, // Mid-premium — EIMT agricole
    governmentFee: 1000,
    governmentFeePayeur: 'employeur',
    consultationInitiale: 250,
    includes: [
      'Préparation de la demande PTAS',
      'Coordination avec les pays source',
      'Soumission à EDSC',
      'Suivi du dossier',
    ],
    notes: 'Par travailleur. Rabais volume disponible pour 5+ travailleurs.',
    paymentOptions: [
      { type: 'immediat', label: 'Paiement intégral' },
    ],
    estimatedTimeline: '6-12 semaines',
  },
];

// ============ SERVICES ADDITIONNELS 2026 ============
export const ADDITIONAL_SERVICES_2026 = [
  { id: 'add-consultation-init', name: 'Consultation initiale (60 min)', price: 250, taxable: true },
  { id: 'add-consultation-suivi', name: 'Consultation de suivi (30 min)', price: 150, taxable: true },
  { id: 'add-consultation-urgente', name: 'Consultation urgente (même jour)', price: 400, taxable: true },
  { id: 'add-traduction', name: 'Traduction certifiée (par page)', price: 45, taxable: true },
  { id: 'add-photos', name: 'Photos d\'identité conformes IRCC', price: 25, taxable: true },
  { id: 'add-notarisation', name: 'Commissaire à l\'assermentation', price: 60, taxable: true },
  { id: 'add-urgence', name: 'Supplément traitement urgent', price: 500, taxable: true },
  { id: 'add-prep-entrevue', name: 'Préparation à l\'entrevue (CISR/IRCC)', price: 500, taxable: true },
  { id: 'add-revision-refus', name: 'Révision d\'un dossier refusé', price: 750, taxable: true },
  { id: 'add-lettre-employeur', name: 'Lettre d\'emploi / contrat de travail', price: 350, taxable: true },
  { id: 'add-conjoint', name: 'Ajout conjoint à une demande de RP', price: 2500, taxable: true },
  { id: 'add-enfant', name: 'Ajout enfant à charge (par enfant)', price: 750, taxable: true },
  { id: 'add-retablissement', name: 'Rétablissement de statut', price: 3000, taxable: true },
  { id: 'add-biometrie', name: 'Frais gouvernementaux - Biométrie', price: 85, taxable: false },
  { id: 'add-examen-medical', name: 'Examen médical (médecin désigné)', price: 300, taxable: false },
];

// ============ CONTRAT DE SERVICE ============
export interface ServiceContract {
  id: string;
  clientId: string;
  caseId?: string;
  pricingTierId: string;
  status: 'brouillon' | 'envoye' | 'signe' | 'actif' | 'complete' | 'annule';
  serviceFee: number;
  governmentFee: number;
  governmentFeePayeur: 'client' | 'employeur';
  addOns: { name: string; price: number }[];
  totalBeforeTax: number;
  tps: number;
  tvq: number;
  grandTotal: number;
  discount?: number;
  discountReason?: string;
  paymentOption: string;
  installments: ContractInstallment[];
  signedAt?: string;
  signedByClient?: string;
  signatureIP?: string;
  signatureData?: string; // PNG base64 dataURL de la signature manuscrite (canvas)
  createdAt: string;
  createdBy: string;
  notes: string;
}

export interface ContractInstallment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'a_venir' | 'facture' | 'paye' | 'en_retard';
  invoiceId?: string;
}

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé au client',
  signe: 'Signé',
  actif: 'Actif',
  complete: 'Complété',
  annule: 'Annulé',
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  envoye: 'bg-blue-100 text-blue-700',
  signe: 'bg-green-100 text-green-700',
  actif: 'bg-indigo-100 text-indigo-700',
  complete: 'bg-emerald-100 text-emerald-700',
  annule: 'bg-red-100 text-red-700',
};

// --- Démo contrats ---
// Non inscrit aux fichiers de la TPS/TVQ - aucune taxe applicable
export const DEMO_CONTRACTS: ServiceContract[] = [
  {
    id: 'contract1',
    clientId: 'c1',
    caseId: 'case1',
    pricingTierId: 'price-peq',
    status: 'actif',
    serviceFee: 5000, // Mid-premium — refugie SPR
    governmentFee: 1365,
    governmentFeePayeur: 'client',
    addOns: [{ name: 'Conjoint/partenaire inclus', price: 2500 }],
    totalBeforeTax: 12865,
    tps: 0,
    tvq: 0,
    grandTotal: 12865,
    paymentOption: '3 versements égaux',
    installments: [
      { id: 'inst1', description: '1er versement — Signature du contrat', amount: 4288.33, dueDate: '2024-01-25', status: 'paye', invoiceId: 'inv1' },
      { id: 'inst2', description: '2e versement — Soumission CSQ', amount: 4288.33, dueDate: '2024-04-25', status: 'paye' },
      { id: 'inst3', description: '3e versement — Soumission RP fédérale', amount: 4288.34, dueDate: '2024-07-25', status: 'a_venir' },
    ],
    signedAt: '2024-01-25',
    signedByClient: 'Carlos Rodriguez',
    signatureIP: '192.168.1.100',
    createdAt: '2024-01-20',
    createdBy: 'u2',
    notes: 'PEQ voie travailleurs + conjoint',
  },
  {
    id: 'contract2',
    clientId: 'c2',
    caseId: 'case2',
    pricingTierId: 'price-asile',
    status: 'actif',
    serviceFee: 6000, // Mid-premium — refugie SAR
    governmentFee: 0,
    governmentFeePayeur: 'client',
    addOns: [],
    totalBeforeTax: 10000,
    tps: 0,
    tvq: 0,
    grandTotal: 10000,
    paymentOption: 'Plan de paiement personnalisé',
    installments: [
      { id: 'inst4', description: 'Acompte — Ouverture du dossier', amount: 3000, dueDate: '2024-02-01', status: 'paye', invoiceId: 'inv2' },
      { id: 'inst5', description: '2e versement — Préparation audience', amount: 4000, dueDate: '2024-03-15', status: 'facture' },
      { id: 'inst6', description: 'Solde — Jour de l\'audience', amount: 3000, dueDate: '2024-04-10', status: 'a_venir' },
    ],
    signedAt: '2024-02-01',
    signedByClient: 'Amina Diallo',
    createdAt: '2024-02-01',
    createdBy: 'u4',
    notes: 'Demande d\'asile — consultation initiale gratuite',
  },
];

// ========================================================
// Génération automatique de contrat à partir d'un dossier
// ========================================================
// Taxes incluses dans le tarif — pratique standard QC petit fournisseur

export function findPricingTierByProgram(programId: string, location?: 'canada' | 'etranger'): PricingTier | undefined {
  const matches = PRICING_2026.filter(p => p.programId === programId);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  // Si plusieurs tiers pour le même programme, filtrer par location
  if (location) {
    const locMatch = matches.find(p => p.location === location || p.location === 'les_deux');
    if (locMatch) return locMatch;
  }
  // Par défaut retourner le premier (canada)
  return matches.find(p => p.location === 'canada') ?? matches[0];
}

export function generateContractFromCase(opts: {
  caseId: string;
  clientId: string;
  programId: string;
  createdBy: string;
  location?: 'canada' | 'etranger';
  fraisOuverturePaye?: boolean;
  discount?: number;
  discountReason?: string;
}): ServiceContract | null {
  const tier = findPricingTierByProgram(opts.programId, opts.location);
  if (!tier) return null;

  const today = new Date().toISOString().split('T')[0];
  const contractId = `contract-${Date.now()}`;

  // Frais de service = honoraires du tier
  // Si les frais d'ouverture ont été payés, on les déduit des honoraires
  const deductionOuverture = opts.fraisOuverturePaye ? FRAIS_OUVERTURE_DOSSIER : 0;
  const serviceFee = tier.serviceFee - deductionOuverture;
  const governmentFee = tier.governmentFee;
  const discountAmount = opts.discount ?? 0;
  const totalBeforeTax = serviceFee + governmentFee - discountAmount;
  // Taxes incluses dans le tarif — pas de TPS/TVQ séparée
  const tps = 0;
  const tvq = 0;
  const grandTotal = totalBeforeTax;

  // Générer les versements selon les options de paiement du tier
  const defaultPayment = tier.paymentOptions[0];
  let installments: ContractInstallment[] = [];

  if (defaultPayment.type === 'immediat') {
    installments = [{
      id: `inst-${Date.now()}-1`,
      description: 'Paiement intégral à la signature',
      amount: grandTotal,
      dueDate: today,
      status: 'a_venir',
    }];
  } else if (defaultPayment.type === 'acompte_50') {
    const half = Math.round(grandTotal / 2 * 100) / 100;
    const remainder = Math.round((grandTotal - half) * 100) / 100;
    installments = [
      {
        id: `inst-${Date.now()}-1`,
        description: '1er versement — 50% à la signature',
        amount: half,
        dueDate: today,
        status: 'a_venir',
      },
      {
        id: `inst-${Date.now()}-2`,
        description: '2e versement — 50% à la soumission',
        amount: remainder,
        dueDate: '',
        status: 'a_venir',
      },
    ];
  } else if (defaultPayment.type === '3_versements') {
    const third = Math.round(grandTotal / 3 * 100) / 100;
    const lastThird = Math.round((grandTotal - third * 2) * 100) / 100;
    installments = [
      {
        id: `inst-${Date.now()}-1`,
        description: '1er versement — Signature du contrat',
        amount: third,
        dueDate: today,
        status: 'a_venir',
      },
      {
        id: `inst-${Date.now()}-2`,
        description: '2e versement',
        amount: third,
        dueDate: '',
        status: 'a_venir',
      },
      {
        id: `inst-${Date.now()}-3`,
        description: '3e versement — Solde final',
        amount: lastThird,
        dueDate: '',
        status: 'a_venir',
      },
    ];
  } else {
    // sur_mesure — un seul versement par défaut, à personnaliser
    installments = [{
      id: `inst-${Date.now()}-1`,
      description: 'Plan de paiement à personnaliser',
      amount: grandTotal,
      dueDate: '',
      status: 'a_venir',
    }];
  }

  return {
    id: contractId,
    clientId: opts.clientId,
    caseId: opts.caseId,
    pricingTierId: tier.id,
    status: 'brouillon',
    serviceFee,
    governmentFee,
    governmentFeePayeur: tier.governmentFeePayeur,
    addOns: [],
    totalBeforeTax,
    tps,
    tvq,
    grandTotal,
    discount: discountAmount > 0 ? discountAmount : undefined,
    discountReason: discountAmount > 0 ? opts.discountReason : undefined,
    paymentOption: defaultPayment.label,
    installments,
    createdAt: today,
    createdBy: opts.createdBy,
    notes: `Contrat généré automatiquement — ${tier.name}${deductionOuverture > 0 ? ` (frais d'ouverture de ${FRAIS_OUVERTURE_DOSSIER} $ déduits)` : ''}`,
  };
}
