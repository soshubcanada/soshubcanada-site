// =============================================================================
// ACTION PLAN ENGINE — Standards IRCC / MIFI / Gouvernement du Canada
// Génère un plan d'action personnalisé basé sur le profil du client
// =============================================================================

export interface ActionStep {
  title: string;
  description: string;
  documents?: string[];
  forms?: string[];
  timeline?: string;
  sosHubService?: string;
  tips?: string[];
  warning?: string;
}

export interface ActionPhase {
  phase: number;
  title: string;
  icon: string; // emoji for simple rendering
  steps: ActionStep[];
}

export interface ProgramActionPlan {
  programName: string;
  priority: number; // 1 = meilleure option
  tagline: string;
  eligibilityNote: string;
  estimatedTimeline: string;
  phases: ActionPhase[];
  nextStepWithSosHub: string;
}

export interface FullActionPlan {
  clientName: string;
  generatedDate: string;
  profileSummary: ProfileSummary;
  recommendation: string;
  programs: ProgramActionPlan[];
  globalPreparation: ActionPhase;
  disclaimer: string;
}

interface ProfileSummary {
  age: number;
  education: string;
  workExperience: string;
  frenchLevel: string;
  englishLevel: string;
  destination: string;
  canadianExperience: string;
  jobOffer: boolean;
  familyInCanada: string;
  strengths: string[];
  weaknesses: string[];
}

interface FormData {
  age: string;
  education: string;
  workExperience: string;
  canadianExperience: string;
  frenchLevel: string;
  englishLevel: string;
  jobOffer: string;
  familyInCanada: string;
  maritalStatus: string;
  spouseEducation: string;
  funds: string;
  destination: string;
  name: string;
}

interface ProgramResult {
  name: string;
  eligible: boolean;
  score: number;
}

// Mappings lisibles
const educationLabels: Record<string, string> = {
  secondary: 'Diplôme secondaire (DES)',
  diploma2: 'Diplôme/Certificat (1-2 ans)',
  diploma3: 'Diplôme/Certificat (3 ans+)',
  bachelor: 'Baccalauréat (licence)',
  master: 'Maîtrise (master)',
  phd: 'Doctorat (PhD)',
};

const frenchLabels: Record<string, string> = {
  none: 'Aucun / Débutant',
  a2: 'Élémentaire (A2)',
  b1: 'Intermédiaire (B1)',
  'b2+': 'Avancé (B2+)',
};

const englishLabels: Record<string, string> = {
  none: 'Aucun / Débutant',
  clb4: 'CLB 4-5',
  'clb5-6': 'CLB 5-6',
  'clb7-8': 'CLB 7-8',
  'clb9+': 'CLB 9+',
};

const destLabels: Record<string, string> = {
  quebec: 'Québec',
  ontario: 'Ontario',
  bc: 'Colombie-Britannique',
  prairies: 'Prairies (AB/SK/MB)',
  atlantic: 'Provinces atlantiques',
  anywhere: 'Partout au Canada',
};

// =============================================================================
// ANALYSE DU PROFIL — Forces et faiblesses
// =============================================================================
function analyzeProfile(form: FormData): ProfileSummary {
  const age = parseInt(form.age) || 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Âge
  if (age >= 20 && age <= 29) strengths.push('Tranche d\'âge optimale (20-29 ans) — score CRS maximal');
  else if (age >= 30 && age <= 35) strengths.push('Âge compétitif pour l\'Entrée Express');
  else if (age >= 36 && age <= 44) weaknesses.push(`À ${age} ans, chaque année réduit votre score CRS de 5 à 11 points`);
  else if (age >= 45) weaknesses.push('La plupart des programmes économiques exigent moins de 45 ans');

  // Éducation
  if (form.education === 'phd' || form.education === 'master') strengths.push('Niveau d\'études supérieur — maximum de points');
  else if (form.education === 'bachelor') strengths.push('Baccalauréat — bon niveau pour la plupart des programmes');
  else if (form.education === 'secondary') weaknesses.push('Un diplôme postsecondaire augmenterait significativement vos chances');

  // Langues
  if (form.frenchLevel === 'b2+') strengths.push('Français avancé — accès aux programmes francophones et bonus CRS');
  else if (form.frenchLevel === 'b1') strengths.push('Français intermédiaire — améliorable pour le PEQ/PRTQ');
  else if (form.frenchLevel === 'none' || form.frenchLevel === 'a2') {
    if (form.destination === 'quebec') weaknesses.push('Français requis (B2 minimum) pour les programmes québécois');
    else weaknesses.push('Le français donnerait un bonus significatif de 50+ points CRS');
  }

  if (form.englishLevel === 'clb9+') strengths.push('Anglais supérieur (CLB 9+) — score maximal');
  else if (form.englishLevel === 'clb7-8') strengths.push('Anglais avancé — bon niveau pour l\'Entrée Express');
  else if (form.englishLevel === 'none' || form.englishLevel === 'clb4') {
    weaknesses.push('L\'anglais CLB 7+ est recommandé pour l\'Entrée Express');
  }

  // Expérience
  if (form.workExperience === '6+') strengths.push('6+ ans d\'expérience — profil senior recherché');
  else if (form.workExperience === '0') weaknesses.push('Sans expérience qualifiée, les options économiques sont limitées');

  // Canada
  if (form.canadianExperience === 'quebec_work' || form.canadianExperience === 'quebec_study') {
    strengths.push('Expérience au Québec — éligibilité au PEQ');
  }
  if (form.jobOffer === 'yes') strengths.push('Offre d\'emploi validée — bonus de 50-200 points CRS');
  if (form.familyInCanada === 'spouse') strengths.push('Conjoint citoyen/RP — parrainage familial disponible');

  // Fonds
  if (form.funds === '20k+') strengths.push('Fonds suffisants pour la preuve financière');
  else if (form.funds === '<10k') weaknesses.push('Fonds insuffisants — minimum requis selon la taille de la famille');

  return {
    age,
    education: educationLabels[form.education] || form.education,
    workExperience: form.workExperience,
    frenchLevel: frenchLabels[form.frenchLevel] || form.frenchLevel,
    englishLevel: englishLabels[form.englishLevel] || form.englishLevel,
    destination: destLabels[form.destination] || form.destination,
    canadianExperience: form.canadianExperience,
    jobOffer: form.jobOffer === 'yes',
    familyInCanada: form.familyInCanada,
    strengths,
    weaknesses,
  };
}

// =============================================================================
// PRÉPARATION GLOBALE — Applicable à tous les programmes
// =============================================================================
function buildGlobalPreparation(form: FormData, profile: ProfileSummary): ActionPhase {
  const steps: ActionStep[] = [];

  // Étape 1: Tests de langue
  const langTests: string[] = [];
  if (form.destination === 'quebec' || form.frenchLevel === 'b2+' || form.frenchLevel === 'b1') {
    langTests.push('TCF Canada ou TEF Canada (français) — Résultats valides 2 ans');
  }
  if (form.englishLevel !== 'none') {
    langTests.push('IELTS General Training ou CELPIP General (anglais) — Résultats valides 2 ans');
  }

  steps.push({
    title: 'Passer les tests de langue officiels',
    description: 'Les résultats de tests linguistiques sont obligatoires pour la quasi-totalité des programmes d\'immigration. Planifiez vos tests au moins 2-3 mois à l\'avance car les places se remplissent vite.',
    documents: langTests,
    timeline: '2 à 6 semaines pour obtenir les résultats',
    sosHubService: 'SOS Hub Canada vous aide à choisir le bon test, vous oriente vers les centres agréés et vérifie que vos scores correspondent aux NCLC requis.',
    tips: [
      'Réservez votre test dès maintenant — les dates se remplissent rapidement',
      'Pour le Québec: le français B2 (NCLC 7) est le minimum obligatoire',
      'L\'IELTS et le CELPIP sont les seuls tests acceptés par IRCC pour l\'anglais',
      'Le TCF Canada et le TEF Canada sont les seuls tests acceptés par IRCC pour le français',
    ],
  });

  // Étape 2: ECA (Évaluation des diplômes)
  steps.push({
    title: 'Obtenir l\'évaluation des diplômes étrangers (ECA/ÉDE)',
    description: 'Vos diplômes obtenus à l\'étranger doivent être évalués par un organisme désigné par IRCC pour être reconnus au Canada. C\'est obligatoire pour l\'Entrée Express et recommandé pour tous les programmes.',
    documents: [
      'Diplômes originaux et relevés de notes officiels',
      'Traductions certifiées si non en anglais ou français',
      'Formulaire de demande de l\'organisme d\'évaluation choisi',
    ],
    forms: ['Demande auprès de WES, IQAS, CES, MCC, ou PEBC (selon le domaine)'],
    timeline: '4 à 12 semaines (WES standard), 2-3 semaines (WES express)',
    sosHubService: 'SOS Hub Canada identifie l\'organisme approprié pour votre domaine d\'études, prépare votre demande et suit le dossier.',
    tips: [
      'WES (World Education Services) est le plus rapide et le plus utilisé',
      'Demandez vos relevés de notes officiels à votre université MAINTENANT — c\'est souvent l\'étape la plus longue',
      'L\'évaluation ECA est valide 5 ans à partir de la date d\'émission',
      'Pour les professions réglementées (médecin, ingénieur, infirmier), des évaluations supplémentaires peuvent être nécessaires',
    ],
  });

  // Étape 3: Documents de base
  steps.push({
    title: 'Rassembler les documents de base',
    description: 'Préparez dès maintenant les documents qui seront requis pour TOUT programme d\'immigration. Avoir ces documents prêts accélère considérablement votre dossier.',
    documents: [
      'Passeport valide (minimum 6 mois de validité restante recommandé)',
      'Acte de naissance (copie certifiée + traduction assermentée)',
      'Certificat de mariage ou preuve d\'union de fait (si applicable)',
      'Certificat de divorce ou décès du conjoint précédent (si applicable)',
      'Preuve de fonds: relevés bancaires des 6 derniers mois',
      'Lettres de référence d\'employeurs (sur papier à en-tête, signées)',
      'Certificat de police / vérification de casier judiciaire (tous les pays où vous avez vécu 6+ mois après l\'âge de 18 ans)',
      'Photos format passeport selon les spécifications IRCC (50mm x 70mm)',
    ],
    tips: [
      'Les certificats de police peuvent prendre 4 à 16 semaines selon le pays — commencez immédiatement',
      'Toutes les traductions doivent être faites par un traducteur agréé',
      'Gardez des copies numériques de haute qualité (scan couleur) de tous vos documents',
      'Les lettres d\'employeurs doivent inclure: titre du poste, description des tâches, dates d\'emploi, heures/semaine, salaire',
    ],
    sosHubService: 'SOS Hub Canada vérifie la conformité de tous vos documents, identifie les pièces manquantes et coordonne les traductions certifiées.',
  });

  // Étape 4: Preuve de fonds
  steps.push({
    title: 'Préparer la preuve financière',
    description: `Le gouvernement canadien exige une preuve de fonds suffisants pour vous établir au Canada. Les montants minimums sont fixés annuellement par IRCC selon la taille de votre famille. SOS Hub Canada vous indiquera le montant exact requis pour votre situation.`,
    documents: [
      'Montant minimum requis selon la taille de votre famille (fixé par IRCC)',
      'Relevés bancaires des 6 derniers mois (nom, numéro de compte, solde)',
      'Lettre officielle de la banque confirmant le solde et l\'historique',
      'Relevés d\'investissement ou placements (si applicable)',
    ],
    warning: form.funds === '<10k'
      ? 'Vos fonds actuels semblent insuffisants. Vous devrez augmenter votre épargne ou démontrer un revenu canadien si vous avez une offre d\'emploi.'
      : undefined,
    tips: [
      'L\'argent doit être disponible et non encombré (pas de dettes associées)',
      'Les fonds empruntés ne sont PAS acceptés comme preuve',
      'Si vous avez une offre d\'emploi valide au Canada, la preuve de fonds peut ne pas être requise pour l\'Entrée Express',
      'Convertissez en CAD pour faciliter la vérification',
    ],
    sosHubService: 'SOS Hub Canada vous guide sur la documentation financière requise et vérifie que vos preuves sont conformes aux exigences d\'IRCC.',
  });

  return {
    phase: 0,
    title: 'Préparation commune — Obligatoire pour tous les programmes',
    icon: '📋',
    steps,
  };
}

// =============================================================================
// PLANS PAR PROGRAMME
// =============================================================================

function buildFSWPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  return {
    programName: 'Entrée Express — Travailleurs qualifiés fédéraux (FSW)',
    priority: 1,
    tagline: 'La voie la plus rapide vers la résidence permanente au Canada',
    eligibilityNote: `Avec votre profil (${profile.education}, ${profile.workExperience} ans d'expérience, français ${profile.frenchLevel}), vous avez un potentiel pour l'Entrée Express. Le score CRS minimum varie à chaque tirage (généralement entre 450 et 550 points).`,
    estimatedTimeline: '6 à 12 mois (du profil au COPR)',
    phases: [
      {
        phase: 1,
        title: 'Créer votre profil Entrée Express',
        icon: '🎯',
        steps: [
          {
            title: 'Calculer votre score CRS (Comprehensive Ranking System)',
            description: 'Le score CRS détermine votre classement dans le bassin de l\'Entrée Express. Il est basé sur l\'âge, les études, l\'expérience, les langues, et les facteurs complémentaires.',
            documents: [
              'Résultats de tests linguistiques (IELTS/CELPIP et/ou TEF/TCF)',
              'Rapport ECA de vos diplômes',
              'Lettres de référence d\'emploi détaillées',
            ],
            tips: [
              `Votre score estimé actuel: consultez le calculateur CRS de SOS Hub Canada pour une estimation précise`,
              'Score moyen des tirages récents: ~480-530 points (catégorie générale)',
              'Chaque point compte — une amélioration de langue peut valoir 30-50 points',
              form.frenchLevel === 'b2+' ? 'BONUS: Votre français avancé vous donne des points supplémentaires significatifs!' : 'Améliorer votre français à B2+ ajouterait des dizaines de points CRS',
            ],
            sosHubService: 'SOS Hub Canada calcule votre score CRS exact, identifie les stratégies d\'optimisation et crée votre profil Entrée Express.',
          },
          {
            title: 'Soumettre votre profil dans le bassin Entrée Express',
            description: 'Créez votre compte sur le portail IRCC et soumettez votre profil Entrée Express. Votre profil reste actif 12 mois dans le bassin.',
            forms: [
              'Compte IRCC en ligne (ircc.canada.ca)',
              'Profil Entrée Express — toutes sections complétées',
            ],
            timeline: '1 à 3 jours pour compléter le profil',
            tips: [
              'Vérifiez TOUTES les informations — une erreur peut invalider votre dossier',
              'Gardez votre profil à jour si votre situation change (emploi, langue, etc.)',
              'Les tirages ont lieu environ toutes les 2 semaines',
            ],
          },
        ],
      },
      {
        phase: 2,
        title: 'Invitation à présenter une demande (ITA)',
        icon: '✉️',
        steps: [
          {
            title: 'Recevoir votre Invitation à présenter une demande (ITA)',
            description: 'Si votre score CRS est supérieur ou égal au score de coupure d\'un tirage, vous recevez une ITA. Vous avez alors 60 jours pour soumettre votre demande complète de résidence permanente.',
            warning: 'Délai strict de 60 jours. Tout dépassement = annulation de l\'invitation.',
            tips: [
              'Préparez vos documents AVANT de recevoir l\'ITA — 60 jours c\'est serré',
              'Les tirages catégorie française donnent souvent des scores plus bas',
              profile.jobOffer ? 'Votre offre d\'emploi pourrait vous qualifier pour un tirage catégoriel' : '',
            ].filter(Boolean),
          },
          {
            title: 'Soumettre la demande de résidence permanente',
            description: 'Complétez et soumettez votre demande avec tous les documents requis dans le portail IRCC.',
            forms: [
              'IMM 0008 — Demande de résidence permanente (formulaire générique)',
              'IMM 0008 Schedule A — Antécédents et déclaration',
              'IMM 5669 — Calendrier A: Antécédents',
              'IMM 5406 — Renseignements supplémentaires sur la famille',
              'IMM 5562 — Renseignements supplémentaires — Membres de la famille (si applicable)',
              'IMM 5409 — Déclaration solennelle d\'union de fait (si applicable)',
            ],
            documents: [
              'Tous les documents de la préparation globale',
              'Certificats de police de tous les pays (6+ mois après 18 ans)',
              'Photos format IRCC (numérique + papier)',
              'Preuve de fonds actualisée',
              'Lettre de nomination provinciale (si applicable)',
            ],
            timeline: 'Soumission dans les 60 jours suivant l\'ITA',
            sosHubService: 'SOS Hub Canada prépare l\'intégralité de votre dossier, vérifie chaque document et formulaire, et soumet dans les délais.',
          },
        ],
      },
      {
        phase: 3,
        title: 'Traitement et examens',
        icon: '🔍',
        steps: [
          {
            title: 'Données biométriques',
            description: 'Vous recevrez une lettre d\'instruction biométrique (LIB). Vous avez 30 jours pour fournir vos empreintes digitales et photo dans un centre de collecte agréé.',
            timeline: '30 jours maximum après réception de la LIB',
            tips: [
              'Au Canada: centres de Service Canada désignés',
              'À l\'étranger: centres de demande de visa (CRDV/VAC)',
              'Rendez-vous requis — ne vous présentez pas sans confirmation',
            ],
          },
          {
            title: 'Examen médical d\'immigration (EMI)',
            description: 'Passez un examen médical auprès d\'un médecin désigné par IRCC (panel physician). L\'examen comprend un examen physique, analyses sanguines, et radiographie pulmonaire.',
            documents: [
              'Formulaire IMM 1017 (fourni dans le portail IRCC)',
              'Passeport original',
              'Photos format passeport',
              'Carnet de vaccination',
            ],
            timeline: 'Résultats valides 12 mois — passez-le rapidement après la soumission',
            tips: [
              'Trouvez un médecin désigné sur le site d\'IRCC: canada.ca/designated-doctors',
              'L\'examen médical est transmis directement par le médecin à IRCC',
              'Certaines conditions médicales peuvent retarder ou bloquer la demande',
            ],
          },
          {
            title: 'Vérification de sécurité et antécédents',
            description: 'IRCC effectue des vérifications de sécurité, de criminalité et d\'admissibilité. Cette étape est automatique — vous n\'avez rien à faire sauf attendre.',
            timeline: '2 à 6 mois (selon la complexité et le pays d\'origine)',
          },
        ],
      },
      {
        phase: 4,
        title: 'Confirmation et établissement au Canada',
        icon: '🍁',
        steps: [
          {
            title: 'Recevoir la Confirmation de résidence permanente (COPR)',
            description: 'Si votre demande est approuvée, vous recevez votre COPR et votre visa de résident permanent (si applicable). La COPR a une date d\'expiration — vous devez vous établir au Canada avant cette date.',
            documents: [
              'COPR (Confirmation of Permanent Residence)',
              'Visa de résident permanent (apposé dans le passeport si requis)',
            ],
            tips: [
              'La date d\'expiration de la COPR est basée sur votre examen médical — planifiez votre arrivée',
              'Vous devenez résident permanent au moment de franchir la frontière canadienne',
              'Conservez précieusement votre COPR — c\'est votre preuve de statut',
            ],
          },
          {
            title: 'Établissement au Canada — Premiers pas',
            description: 'À votre arrivée au Canada, plusieurs démarches administratives sont nécessaires pour vous installer.',
            documents: [
              'Demande de NAS (Numéro d\'assurance sociale) — Service Canada',
              'Inscription à la RAMQ (assurance maladie du Québec) — si au Québec',
              'Ouverture de compte bancaire canadien',
              'Obtention du permis de conduire provincial',
              'Inscription des enfants à l\'école (si applicable)',
              'Demande de carte de résident permanent (automatique par courrier)',
            ],
            timeline: 'Premières 2-4 semaines après l\'arrivée',
            sosHubService: 'SOS Hub Canada offre un service de relocalisation clé en main: accueil à l\'aéroport, recherche de logement, accompagnement administratif, orientation professionnelle et intégration communautaire.',
          },
        ],
      },
    ],
    nextStepWithSosHub: 'Prenez rendez-vous avec SOS Hub Canada pour calculer votre score CRS exact, optimiser votre profil et créer votre profil Entrée Express. Notre équipe gère tout le processus de A à Z.',
  };
}

function buildPEQPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  const isWorker = form.canadianExperience === 'quebec_work';
  const isStudent = form.canadianExperience === 'quebec_study';
  const volet = isWorker ? 'Travailleur temporaire' : isStudent ? 'Diplômé du Québec' : 'À déterminer';

  return {
    programName: `PEQ — Programme de l'expérience québécoise (volet ${volet})`,
    priority: form.destination === 'quebec' ? 1 : 3,
    tagline: 'Voie accélérée vers la résidence permanente pour les diplômés et travailleurs au Québec',
    eligibilityNote: isWorker
      ? 'Avec votre expérience de travail au Québec, vous pouvez accéder au PEQ volet travailleur temporaire. Un minimum de 12 mois d\'emploi à temps plein au Québec est requis.'
      : isStudent
        ? 'Avec votre diplôme québécois, vous pouvez accéder au PEQ volet diplômé. Un diplôme admissible d\'un établissement québécois est requis.'
        : 'Le PEQ offre deux volets: diplômé du Québec ou travailleur temporaire. Contactez SOS Hub Canada pour identifier le meilleur volet.',
    estimatedTimeline: '6 à 12 mois (CSQ + demande fédérale de RP)',
    phases: [
      {
        phase: 1,
        title: 'Vérifier les conditions d\'admissibilité PEQ',
        icon: '✅',
        steps: [
          {
            title: `Confirmer l'admissibilité au PEQ — volet ${volet}`,
            description: isWorker
              ? 'Le volet travailleur temporaire exige: 12 mois d\'emploi à temps plein au Québec (dans les 24 derniers mois), niveau de français oral B2 (NCLC 7), et connaissance des valeurs québécoises.'
              : 'Le volet diplômé exige: diplôme admissible d\'un établissement québécois (DEC technique, AEC 1800h+, baccalauréat, maîtrise, doctorat), français oral B2 (NCLC 7), et 50% du programme fait au Québec.',
            documents: isWorker
              ? [
                  'Relevés de paie des 12 derniers mois au Québec',
                  'Contrat de travail ou lettres d\'employeur',
                  'Permis de travail valide au moment de la demande',
                  'Avis de cotisation (T4/Relevé 1)',
                  'Preuve de résidence au Québec',
                ]
              : [
                  'Diplôme québécois admissible ou lettre de confirmation d\'études',
                  'Relevé de notes officiel de l\'établissement québécois',
                  'Preuve que 50% du programme a été fait au Québec',
                  'Permis d\'études ou PGWP valide',
                ],
            warning: form.frenchLevel !== 'b2+' ? 'Le français B2 oral est OBLIGATOIRE pour le PEQ. Vous devez atteindre ce niveau avant de soumettre votre demande.' : undefined,
            sosHubService: 'SOS Hub Canada vérifie chaque critère d\'admissibilité, identifie les documents manquants et prépare votre dossier PEQ.',
          },
          {
            title: 'Passer le test de français standardisé',
            description: 'Le MIFI exige un résultat de français oral au niveau B2 (NCLC 7 minimum) pour la compréhension orale ET la production orale. Les tests acceptés sont le TCF Canada, TEF Canada, ou DELF/DALF.',
            tips: [
              'Seuls les résultats de COMPRÉHENSION ORALE et PRODUCTION ORALE comptent pour le PEQ',
              'Le résultat doit être de niveau 7 ou plus sur l\'échelle NCLC pour chacune des deux compétences',
              'Les résultats sont valides 2 ans — planifiez en conséquence',
              form.frenchLevel === 'b1' ? 'Avec votre niveau B1 actuel, une préparation ciblée de 2-3 mois pourrait suffire pour atteindre le B2' : '',
            ].filter(Boolean),
            sosHubService: 'SOS Hub Canada peut vous orienter vers des cours de francisation pour atteindre le niveau B2 requis.',
          },
          {
            title: 'Réussir l\'évaluation des valeurs démocratiques et québécoises',
            description: 'Depuis 2020, tous les candidats PEQ doivent passer une évaluation en ligne sur les valeurs québécoises (Attestation d\'apprentissage des valeurs démocratiques). Cette évaluation est gratuite et disponible sur le site du MIFI.',
            forms: ['Attestation d\'apprentissage des valeurs démocratiques et des valeurs québécoises (disponible en ligne sur le site du MIFI)'],
            tips: [
              'L\'évaluation est disponible en français et en anglais',
              'Elle peut être complétée en ligne à votre rythme',
              'L\'attestation est valide et n\'expire pas',
            ],
          },
        ],
      },
      {
        phase: 2,
        title: 'Demande de CSQ (Certificat de sélection du Québec)',
        icon: '⚜️',
        steps: [
          {
            title: 'Soumettre la demande de CSQ via Arrima',
            description: 'La demande de Certificat de sélection du Québec (CSQ) pour le PEQ se fait via le portail Arrima du MIFI. Le CSQ confirme que le Québec vous a sélectionné comme immigrant.',
            forms: [
              'Portail Arrima (arrima.immigration-quebec.gouv.qc.ca)',
              'Formulaire de demande de CSQ — PEQ',
              'Déclaration statutaire de l\'employeur (si volet travailleur)',
            ],
            documents: [
              'Résultats des tests de langue (B2 oral minimum)',
              'Attestation des valeurs québécoises',
              'Tous les documents d\'identité et d\'état civil',
              'Preuve d\'expérience de travail ou diplôme québécois',
              'Photos format MIFI',
            ],
            timeline: '1 à 6 mois pour le traitement de la demande de CSQ',
            sosHubService: 'SOS Hub Canada prépare et soumet votre demande de CSQ, s\'assure que chaque document est conforme et suit le traitement de votre dossier.',
          },
        ],
      },
      {
        phase: 3,
        title: 'Demande fédérale de résidence permanente',
        icon: '🍁',
        steps: [
          {
            title: 'Soumettre la demande de RP fédérale avec le CSQ',
            description: 'Une fois le CSQ obtenu, vous soumettez votre demande de résidence permanente auprès d\'IRCC. Le CSQ vous exempte du système de points Entrée Express — vous êtes sélectionné directement.',
            forms: [
              'IMM 0008 — Demande de résidence permanente',
              'IMM 0008 Schedule A — Antécédents',
              'IMM 5406 — Renseignements sur la famille',
              'IMM 5669 — Calendrier A',
              'CSQ original',
            ],
            timeline: '6 à 12 mois pour le traitement fédéral',
            sosHubService: 'SOS Hub Canada gère la demande fédérale de A à Z et assure la coordination avec le dossier provincial.',
          },
          {
            title: 'Examen médical et biométriques',
            description: 'Mêmes exigences que pour l\'Entrée Express: examen médical par un médecin désigné IRCC et collecte de données biométriques.',
            timeline: 'Dans les 30 jours suivant la demande biométrique',
          },
        ],
      },
      {
        phase: 4,
        title: 'Confirmation et établissement',
        icon: '🏠',
        steps: [
          {
            title: 'Recevoir la COPR et s\'établir au Québec',
            description: 'Une fois approuvé, vous recevez votre COPR. Vous devez vous établir au Québec (condition du CSQ).',
            sosHubService: 'SOS Hub Canada offre un service d\'installation complet à Montréal: logement, démarches RAMQ/NAS, inscription scolaire, orientation emploi.',
          },
        ],
      },
    ],
    nextStepWithSosHub: 'Le PEQ est un programme rapide mais exigeant en documentation. Contactez SOS Hub Canada pour une vérification complète de votre admissibilité et la préparation de votre dossier CSQ.',
  };
}

function buildWorkPermitPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  const hasFrench = form.frenchLevel === 'b2+' || form.frenchLevel === 'b1';
  const hasJobOffer = form.jobOffer === 'yes';

  return {
    programName: 'Permis de travail au Canada',
    priority: hasJobOffer ? 1 : 3,
    tagline: hasJobOffer ? 'Votre offre d\'emploi est votre passeport pour le Canada' : 'Plusieurs voies pour travailler au Canada',
    eligibilityNote: hasJobOffer
      ? 'Avec une offre d\'emploi, vous avez accès à un permis de travail fermé (EIMT) ou potentiellement à la Mobilité francophone si vous êtes francophone.'
      : 'Sans offre d\'emploi actuelle, nous pouvons vous orienter vers des voies alternatives: Mobilité francophone, EIC (Jeunes professionnels), ou PGWP.',
    estimatedTimeline: '2 à 6 mois',
    phases: [
      {
        phase: 1,
        title: 'Identifier la meilleure voie',
        icon: '🔎',
        steps: [
          {
            title: 'Déterminer le type de permis de travail approprié',
            description: 'Il existe plusieurs catégories de permis de travail au Canada. Le choix dépend de votre situation.',
            documents: hasFrench
              ? [
                  'Mobilité francophone (C16): Pour les francophones avec une offre d\'emploi hors Québec — EXEMPTÉ d\'EIMT',
                  'EIMT/LMIA: Permis fermé avec un employeur spécifique — l\'employeur doit démontrer qu\'il ne trouve pas de Canadien',
                  'Permis ouvert pour conjoint de travailleur/étudiant',
                  'EIC (Expérience internationale Canada): JP, Stage, VIE — pour les 18-35 ans selon le pays',
                ]
              : [
                  'EIMT/LMIA: Permis fermé avec un employeur spécifique',
                  'Transfert intra-société (ICT): Si votre employeur actuel a un bureau au Canada',
                  'EIC (Expérience internationale Canada): Jeunes professionnels, Stage coop',
                  'Permis ouvert pour conjoint de travailleur/étudiant',
                ],
            tips: [
              hasFrench ? 'AVANTAGE MAJEUR: Votre français vous qualifie potentiellement pour la Mobilité francophone — exemption d\'EIMT!' : '',
              'Le permis de travail est souvent la première étape vers la résidence permanente',
              hasJobOffer ? 'Votre offre d\'emploi doit être d\'un employeur canadien légitime avec un numéro d\'entreprise valide' : 'SOS Hub Canada peut vous aider à trouver un employeur via son réseau de partenaires',
            ].filter(Boolean),
            sosHubService: 'SOS Hub Canada analyse votre profil et identifie la voie de permis de travail la plus rapide et la plus avantageuse pour vous.',
          },
          ...(hasJobOffer ? [{
            title: 'Processus EIMT (pour l\'employeur)',
            description: 'Votre employeur canadien doit obtenir une Étude d\'impact sur le marché du travail (EIMT/LMIA) positive d\'Emploi et Développement social Canada (EDSC). Cette étape est à la charge de l\'employeur.',
            forms: [
              'EMP 5593 — Demande d\'EIMT (employeur)',
              'EMP 5627 — Annexe d\'emploi',
              'Plan de transition (si applicable)',
              'Preuve de recrutement (annonces d\'emploi au Canada)',
            ],
            timeline: '2 à 4 mois pour le traitement de l\'EIMT',
            sosHubService: 'SOS Hub Canada accompagne votre employeur dans la demande d\'EIMT: préparation du dossier, annonces de recrutement conformes, et suivi avec EDSC.',
            tips: [
              'L\'employeur ne peut PAS vous faire payer les frais d\'EIMT — c\'est illégal',
              'L\'employeur doit prouver qu\'il a cherché à embaucher un Canadien/RP d\'abord',
              'L\'EIMT est valide 6 mois — le permis de travail doit être demandé avant l\'expiration',
            ],
          } as ActionStep] : []),
        ],
      },
      {
        phase: 2,
        title: 'Demande de permis de travail',
        icon: '📝',
        steps: [
          {
            title: 'Soumettre la demande de permis de travail',
            description: 'Une fois l\'EIMT obtenue (ou si exempté), soumettez votre demande de permis de travail auprès d\'IRCC.',
            forms: [
              'IMM 1295 — Demande de permis de travail présentée à l\'extérieur du Canada',
              'IMM 5645 — Recours aux services d\'un représentant (si applicable)',
              'IMM 5409 — Déclaration d\'union de fait (si applicable)',
            ],
            documents: [
              'EIMT positive ou preuve d\'exemption (Mobilité francophone, EIC, etc.)',
              'Contrat de travail ou offre d\'emploi',
              'Passeport valide',
              'Preuve de qualifications (diplômes, certifications)',
              'Certificat de police',
              'Photos format IRCC',
            ],
            timeline: '2 à 12 semaines selon le pays de résidence',
            sosHubService: 'SOS Hub Canada prépare et soumet votre demande de permis de travail, gère la correspondance avec IRCC.',
          },
        ],
      },
      {
        phase: 3,
        title: 'Transition vers la résidence permanente',
        icon: '🎯',
        steps: [
          {
            title: 'Planifier la transition vers la RP',
            description: 'Un permis de travail est temporaire. Planifiez dès maintenant votre transition vers la résidence permanente via l\'Entrée Express (CEC), le PEQ, ou un PNP.',
            tips: [
              '12 mois d\'expérience canadienne qualifiée → éligibilité CEC (Entrée Express)',
              'Au Québec: 12 mois de travail → éligibilité PEQ',
              'L\'expérience canadienne donne un ÉNORME bonus de points CRS (+200 pts possible)',
              'Commencez à préparer votre dossier de RP dès les premiers mois de travail',
            ],
            sosHubService: 'SOS Hub Canada planifie votre transition dès l\'obtention du permis de travail. Nous créons un calendrier personnalisé pour maximiser vos chances de RP.',
          },
        ],
      },
    ],
    nextStepWithSosHub: hasJobOffer
      ? 'Contactez SOS Hub Canada immédiatement pour commencer le processus d\'EIMT avec votre employeur et préparer votre demande de permis de travail.'
      : 'Contactez SOS Hub Canada pour identifier la meilleure voie de permis de travail et être mis en relation avec des employeurs partenaires.',
  };
}

function buildStudyPermitPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  return {
    programName: 'Permis d\'études au Canada',
    priority: 2,
    tagline: 'Étudier au Canada: la voie stratégique vers la résidence permanente',
    eligibilityNote: 'Étudier au Canada est une excellente stratégie d\'immigration: après votre diplôme, le PGWP vous permet de travailler, puis de demander la RP via le PEQ ou l\'Entrée Express (CEC).',
    estimatedTimeline: '3 à 6 mois (permis) + durée des études + PGWP',
    phases: [
      {
        phase: 1,
        title: 'Choisir le programme et l\'établissement',
        icon: '🎓',
        steps: [
          {
            title: 'Sélectionner un programme d\'études stratégique',
            description: 'Le choix du programme et de l\'établissement est CRUCIAL pour votre parcours d\'immigration. Tous les programmes ne mènent pas au PGWP et certains sont plus avantageux pour le PEQ.',
            tips: [
              'Choisissez un établissement d\'enseignement désigné (DLI/EED) — seuls ceux-ci donnent droit au permis d\'études',
              form.destination === 'quebec' ? 'Au Québec: un DEC technique (3 ans) ou AEC (1800h+) donne accès au PEQ diplômé' : '',
              'Les programmes de 2+ ans donnent droit à un PGWP de 3 ans',
              'Les programmes de 1 an donnent droit à un PGWP de 1 an',
              'Vérifiez que le programme est admissible au PGWP sur le site d\'IRCC',
              'Privilégiez un domaine en demande au Canada (TI, santé, génie, éducation)',
            ].filter(Boolean),
            sosHubService: 'SOS Hub Canada vous aide à choisir le programme d\'études le plus stratégique pour votre parcours d\'immigration, avec nos établissements partenaires.',
          },
          {
            title: 'Obtenir une lettre d\'acceptation (LOA)',
            description: 'Postulez auprès de l\'établissement choisi et obtenez votre lettre d\'acceptation officielle. C\'est le document clé pour votre demande de permis d\'études.',
            documents: [
              'Dossier scolaire (relevés de notes, diplômes)',
              'Preuve de compétences linguistiques',
              'Lettre de motivation',
              'CV / portfolio (selon le programme)',
              'Frais de candidature (variable selon l\'établissement)',
            ],
            timeline: '2 à 8 semaines pour recevoir la LOA',
          },
        ],
      },
      {
        phase: 2,
        title: form.destination === 'quebec' ? 'Obtenir le CAQ puis le permis d\'études' : 'Obtenir le permis d\'études',
        icon: '📄',
        steps: [
          ...(form.destination === 'quebec' ? [{
            title: 'Demander le CAQ (Certificat d\'acceptation du Québec)',
            description: 'Pour étudier au Québec, vous devez OBLIGATOIREMENT obtenir un CAQ du MIFI AVANT de demander votre permis d\'études à IRCC. Le CAQ confirme que le Québec vous accepte comme étudiant.',
            forms: ['Demande en ligne sur le portail du MIFI (immigration-quebec.gouv.qc.ca)'],
            documents: [
              'Lettre d\'acceptation de l\'établissement québécois',
              'Passeport valide',
              'Preuve de capacité financière',
              'Photos format MIFI',
            ],
            timeline: '2 à 4 semaines',
            warning: 'Ne soumettez PAS votre demande de permis d\'études à IRCC avant d\'avoir reçu votre CAQ.',
          } as ActionStep] : []),
          {
            title: 'Soumettre la demande de permis d\'études',
            description: 'Avec votre LOA (et CAQ si Québec), soumettez votre demande de permis d\'études à IRCC via le portail en ligne.',
            forms: [
              'IMM 1294 — Demande de permis d\'études',
              'IMM 5645 — Recours aux services d\'un représentant',
              'IMM 1295 — Permis de travail (coop/stage, si applicable)',
            ],
            documents: [
              'Lettre d\'acceptation (LOA) de l\'établissement DLI',
              form.destination === 'quebec' ? 'CAQ approuvé' : '',
              'Passeport valide',
              'Preuve de fonds: frais de scolarité + montant annuel de subsistance requis par IRCC',
              'Lettre explicative (motif des études, plan de retour ou plan d\'immigration)',
              'Certificat de police',
              'Examen médical (selon le pays d\'origine et la durée des études)',
            ].filter(Boolean),
            timeline: '4 à 16 semaines selon le pays',
            sosHubService: 'SOS Hub Canada prépare votre demande complète de permis d\'études, rédige votre lettre explicative et soumet le dossier.',
          },
        ],
      },
      {
        phase: 3,
        title: 'Pendant les études — Préparer la suite',
        icon: '📚',
        steps: [
          {
            title: 'Travailler pendant les études et préparer le PGWP',
            description: 'En tant qu\'étudiant international, vous pouvez travailler jusqu\'à 24 heures/semaine hors campus pendant les sessions et à temps plein pendant les vacances.',
            tips: [
              'Travaillez dans votre domaine d\'études autant que possible — ça compte pour l\'expérience canadienne',
              'Obtenez votre NAS (Numéro d\'assurance sociale) dès votre arrivée',
              'Maintenez vos études à temps plein — condition obligatoire de votre permis',
              'Préparez votre demande de PGWP AVANT la fin de vos études — vous avez 180 jours',
              form.destination === 'quebec' ? 'Améliorez votre français à B2+ pendant vos études pour le PEQ' : '',
            ].filter(Boolean),
            sosHubService: 'SOS Hub Canada vous accompagne tout au long de vos études: renouvellements, transition vers le PGWP, et planification de la RP.',
          },
        ],
      },
      {
        phase: 4,
        title: 'Post-diplôme → Résidence permanente',
        icon: '🍁',
        steps: [
          {
            title: 'PGWP → Expérience canadienne → Résidence permanente',
            description: 'Après votre diplôme, demandez votre PGWP (Permis de travail post-diplôme). Après 12 mois de travail qualifié au Canada, vous serez éligible à la RP via le PEQ (Québec) ou l\'Entrée Express CEC (reste du Canada).',
            timeline: 'PGWP: 1 à 3 ans selon la durée des études | RP: 6-12 mois additionnels',
            sosHubService: 'SOS Hub Canada gère votre transition complète: PGWP → expérience de travail → demande de RP. Un accompagnement continu de l\'admission à la citoyenneté.',
          },
        ],
      },
    ],
    nextStepWithSosHub: 'Contactez SOS Hub Canada pour une orientation académique personnalisée et la préparation de votre dossier d\'études. Nous avons des partenariats avec des établissements DLI au Québec et au Canada.',
  };
}

function buildFamilySponsorshipPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  const isSpouse = form.familyInCanada === 'spouse';

  return {
    programName: 'Parrainage familial',
    priority: isSpouse ? 1 : 2,
    tagline: isSpouse ? 'Rejoindre votre conjoint(e) au Canada' : 'Réunification familiale au Canada',
    eligibilityNote: isSpouse
      ? 'Le parrainage de conjoint est l\'un des programmes les plus rapides. Votre conjoint(e) citoyen(ne) canadien(ne) ou résident(e) permanent(e) peut vous parrainer.'
      : 'Le parrainage familial permet de réunir votre famille au Canada. Le parrain doit être citoyen canadien ou résident permanent.',
    estimatedTimeline: isSpouse ? '12 à 18 mois' : '12 à 24 mois (parents/grands-parents: 24-36 mois)',
    phases: [
      {
        phase: 1,
        title: 'Vérifier l\'admissibilité du parrain',
        icon: '🔍',
        steps: [
          {
            title: 'Confirmer l\'admissibilité du parrain',
            description: 'Le parrain (votre famille au Canada) doit remplir certaines conditions: être citoyen canadien ou résident permanent, avoir 18 ans+, résider au Canada, et démontrer une capacité financière suffisante.',
            documents: [
              'Preuve de citoyenneté ou statut de RP du parrain',
              'Preuve de résidence au Canada du parrain',
              'Avis de cotisation (T4) du parrain — 3 dernières années',
              'Engagement de parrainage (ne pas être en défaut d\'un parrainage précédent)',
            ],
            warning: 'Le parrain ne doit pas être en faillite, avoir de casier judiciaire non purgé, ou être en défaut d\'un parrainage antérieur.',
            sosHubService: 'SOS Hub Canada vérifie l\'admissibilité complète du parrain et du parrainé avant de commencer le processus.',
          },
        ],
      },
      {
        phase: 2,
        title: 'Soumettre la demande de parrainage',
        icon: '💝',
        steps: [
          {
            title: 'Préparer et soumettre le dossier de parrainage',
            description: isSpouse
              ? 'La demande de parrainage de conjoint comprend deux volets: la demande du parrain et la demande de RP du parrainé. Les deux sont soumises ensemble.'
              : 'La demande de parrainage familial comprend la demande du parrain et la demande de résidence permanente du parrainé.',
            forms: [
              'IMM 1344 — Demande de parrainage et engagement',
              'IMM 0008 — Demande de résidence permanente',
              'IMM 5532 — Évaluation de la relation (conjoint/partenaire)',
              'IMM 5406 — Renseignements supplémentaires sur la famille',
              'IMM 5669 — Calendrier A: Antécédents',
            ],
            documents: [
              'Certificat de mariage ou preuve d\'union de fait (12 mois+ de cohabitation)',
              'Preuves de relation authentique (photos, billets, communication, comptes conjoints)',
              'Documents d\'identité des deux parties',
              'Certificats de police (parrainé et parrain)',
              'Examen médical du parrainé',
            ],
            timeline: 'Traitement: 12 à 18 mois (conjoint) | 24-36 mois (parents)',
            sosHubService: 'SOS Hub Canada prépare un dossier de parrainage solide avec des preuves de relation convaincantes, gère les deux volets de la demande.',
            tips: [
              'La QUALITÉ des preuves de relation est cruciale — IRCC évalue l\'authenticité',
              'Incluez un historique chronologique de votre relation',
              isSpouse ? 'Le parrainage de conjoint permet un permis de travail ouvert pendant le traitement' : '',
              'N\'exagérez et ne falsifiez jamais — la fausse déclaration = interdiction de 5 ans',
            ].filter(Boolean),
          },
        ],
      },
      {
        phase: 3,
        title: 'Traitement et suivi',
        icon: '⏳',
        steps: [
          {
            title: 'Suivi du traitement de la demande',
            description: 'Après la soumission, IRCC traite la demande. Vous recevrez des mises à jour via votre compte IRCC. Des documents supplémentaires peuvent être demandés.',
            tips: [
              'Surveillez votre compte IRCC régulièrement',
              'Répondez rapidement à toute demande de documents supplémentaires',
              isSpouse ? 'Demandez un permis de travail ouvert pendant le traitement (IMM 5710)' : '',
              'Ne voyagez pas hors du Canada pendant le traitement si vous y êtes déjà',
            ].filter(Boolean),
            sosHubService: 'SOS Hub Canada suit votre dossier, répond aux demandes d\'IRCC et vous informe de chaque étape.',
          },
        ],
      },
    ],
    nextStepWithSosHub: 'Le parrainage familial est un processus qui requiert une documentation impeccable, surtout les preuves de relation. Contactez SOS Hub Canada pour une préparation complète de votre dossier.',
  };
}

function buildPRTQPlan(form: FormData, profile: ProfileSummary): ProgramActionPlan {
  return {
    programName: 'PRTQ via Arrima — Travailleurs qualifiés du Québec',
    priority: form.destination === 'quebec' ? 2 : 4,
    tagline: 'Le programme régulier du Québec pour les travailleurs qualifiés',
    eligibilityNote: 'Le PRTQ via le portail Arrima est le programme régulier du Québec. Vous déposez une déclaration d\'intérêt et le MIFI sélectionne les meilleurs profils selon les besoins du marché du travail québécois.',
    estimatedTimeline: '12 à 24 mois (invitation + CSQ + RP fédérale)',
    phases: [
      {
        phase: 1,
        title: 'Préparer et déposer la déclaration d\'intérêt',
        icon: '📋',
        steps: [
          {
            title: 'Créer votre profil sur le portail Arrima',
            description: 'Arrima est le système de gestion des candidatures d\'immigration du Québec. Vous y créez un profil détaillé qui sera évalué selon la grille de sélection du Québec.',
            forms: ['Déclaration d\'intérêt sur arrima.immigration-quebec.gouv.qc.ca'],
            documents: [
              'Résultats de tests de français (TCF/TEF — B2 minimum recommandé)',
              'Évaluation comparative des études du MIFI (différent de l\'ECA fédérale!)',
              'CV détaillé avec descriptions de postes selon la CNP',
              'Offre d\'emploi validée (si disponible — énorme bonus)',
            ],
            tips: [
              'L\'évaluation comparative des études doit être demandée au MIFI, pas à WES',
              'Le français est le facteur le plus important dans la grille Arrima',
              'Une offre d\'emploi validée au Québec augmente massivement vos chances',
              'Votre domaine de formation/expérience doit correspondre aux besoins du Québec',
            ],
            sosHubService: 'SOS Hub Canada optimise votre déclaration d\'intérêt Arrima pour maximiser votre score et vos chances d\'invitation.',
          },
          {
            title: 'Obtenir l\'évaluation comparative des études (ECE) du MIFI',
            description: 'Le Québec utilise son propre système d\'évaluation des diplômes étrangers, distinct de l\'ECA fédérale. L\'ECE est requis pour la grille Arrima.',
            forms: ['Demande d\'évaluation comparative sur le site du MIFI'],
            timeline: '4 à 8 semaines',
            warning: 'L\'ECE du MIFI est différente de l\'ECA (WES) — les deux peuvent être nécessaires si vous visez aussi l\'Entrée Express.',
          },
        ],
      },
      {
        phase: 2,
        title: 'Invitation et demande de CSQ',
        icon: '⚜️',
        steps: [
          {
            title: 'Recevoir une invitation à présenter une demande de CSQ',
            description: 'Le MIFI organise des rondes d\'invitation périodiques. Si votre score est suffisant, vous recevez une invitation avec un délai de 60 jours pour soumettre votre demande complète de CSQ.',
            timeline: 'Variable — les rondes d\'invitation dépendent des besoins du Québec',
            tips: [
              'Gardez votre profil Arrima à jour — toute amélioration (langue, emploi) augmente votre score',
              'Les invitations ciblent souvent des domaines spécifiques (TI, santé, construction)',
            ],
          },
          {
            title: 'Soumettre la demande de CSQ',
            description: 'Identique au processus PEQ — soumission complète via Arrima dans les 60 jours.',
            timeline: '6 à 12 mois pour le traitement',
            sosHubService: 'SOS Hub Canada prépare votre dossier CSQ complet et le soumet dans les délais.',
          },
        ],
      },
      {
        phase: 3,
        title: 'Demande fédérale de résidence permanente',
        icon: '🍁',
        steps: [
          {
            title: 'Soumettre la RP fédérale avec le CSQ',
            description: 'Même processus que pour le PEQ — le CSQ vous qualifie directement pour la RP fédérale sans passer par l\'Entrée Express.',
            timeline: '6 à 12 mois',
            sosHubService: 'SOS Hub Canada gère la demande fédérale et votre installation au Québec.',
          },
        ],
      },
    ],
    nextStepWithSosHub: 'Le PRTQ nécessite une stratégie d\'optimisation du profil Arrima. Contactez SOS Hub Canada pour maximiser votre score et vos chances d\'invitation.',
  };
}

// =============================================================================
// GÉNÉRATION DU PLAN D'ACTION COMPLET
// =============================================================================
export function generateActionPlan(form: FormData, results: ProgramResult[]): FullActionPlan {
  const profile = analyzeProfile(form);
  const eligiblePrograms = results.filter(r => r.eligible);

  // Sélectionner les plans pour les programmes éligibles
  const programs: ProgramActionPlan[] = [];
  let priority = 1;

  // Trier par score décroissant
  const sortedEligible = [...eligiblePrograms].sort((a, b) => b.score - a.score);

  for (const prog of sortedEligible) {
    let plan: ProgramActionPlan | null = null;

    if (prog.name.includes('FSW') || prog.name.includes('Entrée Express')) {
      plan = buildFSWPlan(form, profile);
    } else if (prog.name.includes('PEQ')) {
      plan = buildPEQPlan(form, profile);
    } else if (prog.name.includes('PRTQ') || prog.name.includes('Arrima')) {
      plan = buildPRTQPlan(form, profile);
    } else if (prog.name.includes('Permis de travail')) {
      plan = buildWorkPermitPlan(form, profile);
    } else if (prog.name.includes('études')) {
      plan = buildStudyPermitPlan(form, profile);
    } else if (prog.name.includes('Parrainage')) {
      plan = buildFamilySponsorshipPlan(form, profile);
    }

    if (plan) {
      plan.priority = priority++;
      programs.push(plan);
    }
  }

  // Recommandation globale
  let recommendation = '';
  if (programs.length === 0) {
    recommendation = 'Votre profil actuel ne correspond pas directement aux critères des programmes évalués. Cependant, des options existent toujours. Contactez SOS Hub Canada pour une analyse approfondie et des stratégies alternatives (amélioration du profil, études au Canada, etc.).';
  } else if (programs.length === 1) {
    recommendation = `Votre meilleure option est le programme "${programs[0].programName}". Nous recommandons de commencer immédiatement les étapes de préparation ci-dessous.`;
  } else {
    recommendation = `Vous avez ${programs.length} programmes accessibles. Nous recommandons de prioriser "${programs[0].programName}" comme voie principale, tout en gardant "${programs[1].programName}" comme alternative. SOS Hub Canada peut vous aider à déterminer la stratégie optimale.`;
  }

  return {
    clientName: form.name,
    generatedDate: new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
    profileSummary: profile,
    recommendation,
    programs,
    globalPreparation: buildGlobalPreparation(form, profile),
    disclaimer: 'Ce plan d\'action est généré à titre informatif uniquement et ne constitue pas un avis juridique en matière d\'immigration. Les critères et délais sont basés sur les informations publiques d\'IRCC et du MIFI et peuvent changer sans préavis. Pour un accompagnement professionnel, personnalisé et un devis détaillé, contactez SOS Hub Canada.',
  };
}
