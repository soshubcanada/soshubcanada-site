// ========================================================
// SOS Hub Canada - Portail Employeurs
// Données, types, formulaires LMIA et MIFI
// ========================================================

// --- Types ---
export interface EmployerCredentials {
  platform: string;
  username: string;
  password: string;
  lastAccessed: string;
  notes: string;
}

export interface EmployerFinancials {
  year: number;
  revenuBrut: number;
  revenuNet: number;
  actifTotal: number;
  passifTotal: number;
  capitauxPropres: number;
  masseSalariale: number;
  cotisationsCNESST: number;
  impotProvincial: number;
  impotFederal: number;
  tpsTvqPercu: number;
}

export interface LmiaApplication {
  id: string;
  employerId: string;
  position: string;
  nocCode: string;
  wageOffered: number;
  medianWage: number;
  status: 'brouillon' | 'en_preparation' | 'soumis' | 'en_traitement' | 'approuve' | 'refuse' | 'expire';
  lmiaNumber: string;
  submittedAt: string;
  expiresAt: string;
  workersRequested: number;
  workersFound: number;
  transitionPlan: boolean;
  notes: string;
}

export interface Employer {
  id: string;
  companyName: string;
  companyNameLegal: string;
  neq: string; // Numéro d'entreprise du Québec
  bnFederal: string; // Business Number federal (CRA)
  naicsCode: string;
  naicsDescription: string;
  industry: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  dateIncorporation: string;
  nombreEmployes: number;
  nombreEmployesTempo: number;
  syndicat: boolean;
  conventionCollective: string;
  cnesst: string;
  revenuQuebec: string; // numéro TVQ
  tpsGst: string; // TPS/GST
  status: 'actif' | 'inactif' | 'prospect' | 'suspendu' | 'en_attente';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  financials: EmployerFinancials[];
  credentials: EmployerCredentials[];
  lmiaApplications: LmiaApplication[];
}

export const EMPLOYER_STATUS_LABELS: Record<string, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  prospect: 'Prospect',
  suspendu: 'Suspendu',
  en_attente: 'En attente',
};

export const EMPLOYER_STATUS_COLORS: Record<string, string> = {
  actif: 'bg-green-100 text-green-700',
  inactif: 'bg-red-100 text-red-700',
  prospect: 'bg-blue-100 text-blue-700',
  suspendu: 'bg-gray-100 text-gray-700',
  en_attente: 'bg-yellow-100 text-yellow-700',
};

export const LMIA_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_preparation: 'En préparation',
  soumis: 'Soumis',
  en_traitement: 'En traitement EDSC',
  approuve: 'Approuvée',
  refuse: 'Refusée',
  expire: 'Expirée',
};

export const LMIA_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  en_preparation: 'bg-amber-100 text-amber-700',
  soumis: 'bg-indigo-100 text-indigo-700',
  en_traitement: 'bg-yellow-100 text-yellow-700',
  approuve: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
  expire: 'bg-orange-100 text-orange-700',
};

export const CREDENTIAL_PLATFORMS = [
  { id: 'revenu_quebec', name: 'Mon dossier - Revenu Québec', url: 'https://www.revenuquebec.ca' },
  { id: 'arc_affaires', name: 'Mon dossier d\'affaires - ARC/CRA', url: 'https://www.canada.ca/fr/agence-revenu' },
  { id: 'cnesst', name: 'Mon espace CNESST', url: 'https://www.cnesst.gouv.qc.ca' },
  { id: 'edsc_lmia', name: 'EDSC - Portail LMIA/EIMT', url: 'https://www.canada.ca/fr/emploi-developpement-social' },
  { id: 'mifi_arrima', name: 'MIFI Arrima', url: 'https://www.quebec.ca/immigration' },
  { id: 'registraire', name: 'Registraire des entreprises du Québec', url: 'https://www.registreentreprises.gouv.qc.ca' },
  { id: 'source_deductions', name: 'Source des retenues - RQ', url: 'https://www.revenuquebec.ca' },
];

// --- Formulaires LMIA (EDSC/ESDC) ---
export interface LmiaFormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'section_header';
  required: boolean;
  section: string;
  width?: 'full' | 'half' | 'third';
  options?: { value: string; label: string }[];
  autoFillFrom?: string; // key from Employer
  helpText?: string;
}

export interface LmiaFormDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  fields: LmiaFormField[];
}

export const LMIA_FORMS: LmiaFormDefinition[] = [
  {
    id: 'emp5593',
    code: 'EMP 5593',
    name: 'Demande d\'étude d\'impact sur le marché du travail (EIMT)',
    description: 'Formulaire principal pour demander une EIMT/LMIA auprès d\'EDSC',
    fields: [
      { id: 'sec_employer', label: 'RENSEIGNEMENTS SUR L\'EMPLOYEUR', type: 'section_header', required: false, section: 'employeur', width: 'full' },
      { id: 'company_legal_name', label: 'Raison sociale', type: 'text', required: true, section: 'employeur', autoFillFrom: 'companyNameLegal', width: 'full' },
      { id: 'company_operating_name', label: 'Nom commercial', type: 'text', required: true, section: 'employeur', autoFillFrom: 'companyName', width: 'full' },
      { id: 'bn_cra', label: 'Numéro d\'entreprise (NE) - ARC', type: 'text', required: true, section: 'employeur', autoFillFrom: 'bnFederal', width: 'half' },
      { id: 'neq', label: 'NEQ (Québec)', type: 'text', required: true, section: 'employeur', autoFillFrom: 'neq', width: 'half' },
      { id: 'address', label: 'Adresse de l\'entreprise', type: 'text', required: true, section: 'employeur', autoFillFrom: 'address', width: 'full' },
      { id: 'city', label: 'Ville', type: 'text', required: true, section: 'employeur', autoFillFrom: 'city', width: 'third' },
      { id: 'province', label: 'Province', type: 'text', required: true, section: 'employeur', autoFillFrom: 'province', width: 'third' },
      { id: 'postal_code', label: 'Code postal', type: 'text', required: true, section: 'employeur', autoFillFrom: 'postalCode', width: 'third' },
      { id: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'employeur', autoFillFrom: 'phone', width: 'half' },
      { id: 'email', label: 'Courriel', type: 'text', required: true, section: 'employeur', autoFillFrom: 'email', width: 'half' },
      { id: 'naics', label: 'Code SCIAN/NAICS', type: 'text', required: true, section: 'employeur', autoFillFrom: 'naicsCode', width: 'half' },
      { id: 'num_employees', label: 'Nombre total d\'employés', type: 'number', required: true, section: 'employeur', autoFillFrom: 'nombreEmployes', width: 'half' },
      { id: 'date_incorporation', label: 'Date de constitution', type: 'date', required: true, section: 'employeur', autoFillFrom: 'dateIncorporation', width: 'half' },
      { id: 'gross_revenue', label: 'Revenu brut annuel ($)', type: 'number', required: true, section: 'employeur', width: 'half', helpText: 'Dernier exercice fiscal' },

      { id: 'sec_position', label: 'RENSEIGNEMENTS SUR LE POSTE', type: 'section_header', required: false, section: 'poste', width: 'full' },
      { id: 'job_title', label: 'Titre du poste', type: 'text', required: true, section: 'poste', width: 'full' },
      { id: 'noc_code', label: 'Code CNP/NOC 2021', type: 'text', required: true, section: 'poste', width: 'half' },
      { id: 'noc_teer', label: 'Niveau FEER/TEER', type: 'select', required: true, section: 'poste', width: 'half', options: [
        { value: '0', label: 'TEER 0 - Gestion' }, { value: '1', label: 'TEER 1 - Universitaire' },
        { value: '2', label: 'TEER 2 - Collégial / Apprentissage' }, { value: '3', label: 'TEER 3 - Secondaire / Formation' },
        { value: '4', label: 'TEER 4 - Formation en cours d\'emploi' }, { value: '5', label: 'TEER 5 - Aucune exigence' },
      ]},
      { id: 'num_positions', label: 'Nombre de postes', type: 'number', required: true, section: 'poste', width: 'third' },
      { id: 'wage', label: 'Salaire horaire offert ($)', type: 'number', required: true, section: 'poste', width: 'third' },
      { id: 'median_wage', label: 'Salaire médian (Guichet emploi)', type: 'number', required: true, section: 'poste', width: 'third', helpText: 'Selon le Guichet-Emplois pour la région' },
      { id: 'hours_week', label: 'Heures par semaine', type: 'number', required: true, section: 'poste', width: 'third' },
      { id: 'duration', label: 'Durée de l\'emploi (mois)', type: 'number', required: true, section: 'poste', width: 'third' },
      { id: 'start_date', label: 'Date de début prévue', type: 'date', required: true, section: 'poste', width: 'third' },
      { id: 'work_location', label: 'Lieu de travail', type: 'text', required: true, section: 'poste', width: 'full' },
      { id: 'job_duties', label: 'Description des tâches principales', type: 'textarea', required: true, section: 'poste', width: 'full' },
      { id: 'education_req', label: 'Exigences de scolarité', type: 'text', required: true, section: 'poste', width: 'half' },
      { id: 'experience_req', label: 'Expérience requise (années)', type: 'number', required: true, section: 'poste', width: 'half' },
      { id: 'language_req', label: 'Langues requises', type: 'select', required: true, section: 'poste', width: 'half', options: [
        { value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' },
        { value: 'fr_en', label: 'Français et anglais' }, { value: 'aucune', label: 'Aucune exigence' },
      ]},

      { id: 'sec_recruitment', label: 'EFFORTS DE RECRUTEMENT', type: 'section_header', required: false, section: 'recrutement', width: 'full' },
      { id: 'guichet_emploi', label: 'Annonce sur Guichet-Emplois', type: 'checkbox', required: false, section: 'recrutement', width: 'half' },
      { id: 'guichet_emploi_number', label: 'Numéro d\'avis Guichet-Emplois', type: 'text', required: false, section: 'recrutement', width: 'half' },
      { id: 'other_recruitment', label: 'Autres méthodes de recrutement utilisées', type: 'textarea', required: true, section: 'recrutement', width: 'full', helpText: 'Sites d\'emploi, journaux, agences, réseautage, etc.' },
      { id: 'canadians_applied', label: 'Nombre de Canadiens/RP ayant postulé', type: 'number', required: true, section: 'recrutement', width: 'half' },
      { id: 'canadians_interviewed', label: 'Nombre de Canadiens/RP interviewés', type: 'number', required: true, section: 'recrutement', width: 'half' },
      { id: 'reasons_not_hired', label: 'Raisons pour lesquelles les candidats canadiens n\'ont pas été embauchés', type: 'textarea', required: true, section: 'recrutement', width: 'full' },
    ],
  },
  {
    id: 'emp5627',
    code: 'EMP 5627',
    name: 'Plan de transition',
    description: 'Plan de transition requis pour les postes à haut salaire (EIMT)',
    fields: [
      { id: 'sec_plan', label: 'PLAN DE TRANSITION', type: 'section_header', required: false, section: 'plan', width: 'full' },
      { id: 'activities', label: 'Activités prévues pour recruter/former des Canadiens', type: 'textarea', required: true, section: 'plan', width: 'full', helpText: 'Décrivez les mesures concrètes pour réduire la dépendance aux TET' },
      { id: 'timeline', label: 'Échéancier des activités', type: 'textarea', required: true, section: 'plan', width: 'full' },
      { id: 'training_investment', label: 'Investissement en formation ($)', type: 'number', required: true, section: 'plan', width: 'half' },
      { id: 'canadian_hires_target', label: 'Nombre d\'embauches canadiennes ciblées', type: 'number', required: true, section: 'plan', width: 'half' },
      { id: 'previous_lmia', label: 'EIMT antérieures pour ce poste', type: 'checkbox', required: false, section: 'plan', width: 'half' },
      { id: 'previous_transition_results', label: 'Résultats du plan de transition précédent', type: 'textarea', required: false, section: 'plan', width: 'full' },
    ],
  },
];

// --- Formulaires MIFI (Québec) ---
export const MIFI_FORMS: LmiaFormDefinition[] = [
  {
    id: 'mifi_caq_tt',
    code: 'MIFI - CAQ TT',
    name: 'Demande de Certificat d\'acceptation du Québec (CAQ) - Travailleur temporaire',
    description: 'Formulaire pour obtenir un CAQ pour un travailleur étranger temporaire au Québec',
    fields: [
      { id: 'sec_employer_mifi', label: 'RENSEIGNEMENTS SUR L\'EMPLOYEUR', type: 'section_header', required: false, section: 'employeur', width: 'full' },
      { id: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true, section: 'employeur', autoFillFrom: 'companyName', width: 'full' },
      { id: 'neq', label: 'NEQ', type: 'text', required: true, section: 'employeur', autoFillFrom: 'neq', width: 'half' },
      { id: 'address', label: 'Adresse', type: 'text', required: true, section: 'employeur', autoFillFrom: 'address', width: 'full' },
      { id: 'city', label: 'Ville', type: 'text', required: true, section: 'employeur', autoFillFrom: 'city', width: 'half' },
      { id: 'postal_code', label: 'Code postal', type: 'text', required: true, section: 'employeur', autoFillFrom: 'postalCode', width: 'half' },
      { id: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'employeur', autoFillFrom: 'phone', width: 'half' },
      { id: 'contact_name', label: 'Personne-ressource', type: 'text', required: true, section: 'employeur', autoFillFrom: 'contactName', width: 'half' },
      { id: 'naics', label: 'Secteur d\'activité (SCIAN)', type: 'text', required: true, section: 'employeur', autoFillFrom: 'naicsCode', width: 'half' },
      { id: 'num_employees', label: 'Nombre d\'employés', type: 'number', required: true, section: 'employeur', autoFillFrom: 'nombreEmployes', width: 'half' },

      { id: 'sec_poste_mifi', label: 'RENSEIGNEMENTS SUR LE POSTE', type: 'section_header', required: false, section: 'poste', width: 'full' },
      { id: 'job_title', label: 'Titre du poste', type: 'text', required: true, section: 'poste', width: 'full' },
      { id: 'noc_code', label: 'Code CNP', type: 'text', required: true, section: 'poste', width: 'half' },
      { id: 'salary', label: 'Salaire annuel ($)', type: 'number', required: true, section: 'poste', width: 'half' },
      { id: 'work_region', label: 'Région administrative du Québec', type: 'select', required: true, section: 'poste', width: 'half', options: [
        { value: 'montreal', label: 'Montréal' }, { value: 'capitale_nationale', label: 'Capitale-Nationale' },
        { value: 'laval', label: 'Laval' }, { value: 'monteregie', label: 'Montérégie' },
        { value: 'laurentides', label: 'Laurentides' }, { value: 'lanaudiere', label: 'Lanaudière' },
        { value: 'outaouais', label: 'Outaouais' }, { value: 'estrie', label: 'Estrie' },
        { value: 'centre_du_quebec', label: 'Centre-du-Québec' }, { value: 'mauricie', label: 'Mauricie' },
        { value: 'chaudiere_appalaches', label: 'Chaudière-Appalaches' }, { value: 'saguenay', label: 'Saguenay-Lac-Saint-Jean' },
        { value: 'bas_st_laurent', label: 'Bas-Saint-Laurent' }, { value: 'abitibi', label: 'Abitibi-Témiscamingue' },
        { value: 'cote_nord', label: 'Côte-Nord' }, { value: 'gaspesie', label: 'Gaspésie-Îles-de-la-Madeleine' },
        { value: 'nord_du_quebec', label: 'Nord-du-Québec' },
      ]},
      { id: 'language_work', label: 'Langue de travail', type: 'select', required: true, section: 'poste', width: 'half', options: [
        { value: 'fr', label: 'Français' }, { value: 'en', label: 'Anglais' }, { value: 'fr_en', label: 'Bilingue' },
      ]},
      { id: 'duration_months', label: 'Durée prévue (mois)', type: 'number', required: true, section: 'poste', width: 'half' },
      { id: 'start_date', label: 'Date de début', type: 'date', required: true, section: 'poste', width: 'half' },

      { id: 'sec_worker_mifi', label: 'RENSEIGNEMENTS SUR LE TRAVAILLEUR', type: 'section_header', required: false, section: 'travailleur', width: 'full' },
      { id: 'worker_name', label: 'Nom complet du travailleur', type: 'text', required: true, section: 'travailleur', width: 'full' },
      { id: 'worker_nationality', label: 'Nationalité', type: 'text', required: true, section: 'travailleur', width: 'half' },
      { id: 'worker_dob', label: 'Date de naissance', type: 'date', required: true, section: 'travailleur', width: 'half' },
      { id: 'worker_current_country', label: 'Pays de résidence actuel', type: 'text', required: true, section: 'travailleur', width: 'half' },
    ],
  },
  {
    id: 'mifi_dst',
    code: 'MIFI - DST',
    name: 'Demande de sélection temporaire',
    description: 'Formulaire de sélection temporaire pour les travailleurs étrangers au Québec (volet PTET)',
    fields: [
      { id: 'sec_dst_employer', label: 'IDENTIFICATION DE L\'EMPLOYEUR', type: 'section_header', required: false, section: 'employeur', width: 'full' },
      { id: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true, section: 'employeur', autoFillFrom: 'companyName', width: 'full' },
      { id: 'neq', label: 'NEQ', type: 'text', required: true, section: 'employeur', autoFillFrom: 'neq', width: 'half' },
      { id: 'bn_federal', label: 'NE fédéral (ARC)', type: 'text', required: true, section: 'employeur', autoFillFrom: 'bnFederal', width: 'half' },
      { id: 'address', label: 'Adresse complète', type: 'text', required: true, section: 'employeur', autoFillFrom: 'address', width: 'full' },
      { id: 'phone', label: 'Téléphone', type: 'text', required: true, section: 'employeur', autoFillFrom: 'phone', width: 'half' },
      { id: 'email', label: 'Courriel', type: 'text', required: true, section: 'employeur', autoFillFrom: 'email', width: 'half' },

      { id: 'sec_dst_offer', label: 'OFFRE D\'EMPLOI', type: 'section_header', required: false, section: 'offre', width: 'full' },
      { id: 'job_title', label: 'Titre du poste offert', type: 'text', required: true, section: 'offre', width: 'full' },
      { id: 'noc', label: 'Code CNP', type: 'text', required: true, section: 'offre', width: 'half' },
      { id: 'salary_annual', label: 'Salaire annuel brut ($)', type: 'number', required: true, section: 'offre', width: 'half' },
      { id: 'hours_per_week', label: 'Heures/semaine', type: 'number', required: true, section: 'offre', width: 'third' },
      { id: 'duration', label: 'Durée (mois)', type: 'number', required: true, section: 'offre', width: 'third' },
      { id: 'start_date', label: 'Date de début', type: 'date', required: true, section: 'offre', width: 'third' },
      { id: 'lmia_number', label: 'Numéro EIMT/LMIA', type: 'text', required: true, section: 'offre', width: 'half', helpText: 'Requis si EIMT positive obtenue' },
      { id: 'work_conditions', label: 'Conditions de travail et avantages', type: 'textarea', required: true, section: 'offre', width: 'full' },

      { id: 'sec_dst_francisation', label: 'FRANCISATION', type: 'section_header', required: false, section: 'francisation', width: 'full' },
      { id: 'french_level', label: 'Niveau de français du travailleur', type: 'select', required: true, section: 'francisation', width: 'half', options: [
        { value: 'avance', label: 'Avancé' }, { value: 'intermediaire', label: 'Intermédiaire' },
        { value: 'debutant', label: 'Débutant' }, { value: 'aucun', label: 'Aucune connaissance' },
      ]},
      { id: 'francisation_plan', label: 'Plan de francisation prévu', type: 'textarea', required: false, section: 'francisation', width: 'full', helpText: 'Mesures pour l\'apprentissage du français si nécessaire' },
    ],
  },
];

// --- Données démo employeurs ---
export const DEMO_EMPLOYERS: Employer[] = [
  {
    id: 'emp1',
    companyName: 'Technologies Boréales Inc.',
    companyNameLegal: '9876543 Québec Inc. (Technologies Boréales)',
    neq: '1143567890',
    bnFederal: '123456789RC0001',
    naicsCode: '541514',
    naicsDescription: 'Conception de systèmes informatiques',
    industry: 'Technologies de l\'information',
    address: '1200 Boul. René-Lévesque Ouest, Bureau 500',
    city: 'Montréal',
    province: 'QC',
    postalCode: 'H3B 4W8',
    phone: '+1-514-555-8001',
    email: 'rh@techboreales.ca',
    website: 'www.techboreales.ca',
    contactName: 'Isabelle Gagnon',
    contactTitle: 'Directrice des ressources humaines',
    contactPhone: '+1-514-555-8002',
    contactEmail: 'isabelle.gagnon@techboreales.ca',
    dateIncorporation: '2015-06-15',
    nombreEmployes: 85,
    nombreEmployesTempo: 12,
    syndicat: false,
    conventionCollective: '',
    cnesst: 'CNESST-2015-87654',
    revenuQuebec: '1234567890TQ0001',
    tpsGst: '123456789RT0001',
    status: 'actif',
    assignedTo: 'u3',
    createdAt: '2023-09-01',
    updatedAt: '2024-03-10',
    notes: 'Client régulier pour LMIA développeurs. 3 EIMT approuvées en 2023.',
    financials: [
      {
        year: 2023,
        revenuBrut: 12500000,
        revenuNet: 1850000,
        actifTotal: 8200000,
        passifTotal: 3100000,
        capitauxPropres: 5100000,
        masseSalariale: 7200000,
        cotisationsCNESST: 115200,
        impotProvincial: 203500,
        impotFederal: 277500,
        tpsTvqPercu: 1243750,
      },
      {
        year: 2022,
        revenuBrut: 10800000,
        revenuNet: 1520000,
        actifTotal: 7100000,
        passifTotal: 2800000,
        capitauxPropres: 4300000,
        masseSalariale: 6400000,
        cotisationsCNESST: 102400,
        impotProvincial: 182400,
        impotFederal: 228000,
        tpsTvqPercu: 1074600,
      },
    ],
    credentials: [
      { platform: 'arc_affaires', username: 'tech_boreales_cra', password: '••••••••', lastAccessed: '2024-03-01', notes: 'Accès au portail T2' },
      { platform: 'revenu_quebec', username: 'tech_boreales_rq', password: '••••••••', lastAccessed: '2024-02-28', notes: 'Déclarations TVQ et retenues à la source' },
      { platform: 'edsc_lmia', username: 'tech_boreales_edsc', password: '••••••••', lastAccessed: '2024-03-05', notes: 'Portail EIMT en ligne' },
    ],
    lmiaApplications: [
      {
        id: 'lmia1', employerId: 'emp1', position: 'Développeur Full Stack Senior',
        nocCode: '21232', wageOffered: 52.00, medianWage: 48.08,
        status: 'approuve', lmiaNumber: 'LMIA-2024-QC-001234',
        submittedAt: '2024-01-15', expiresAt: '2024-07-15',
        workersRequested: 2, workersFound: 1,
        transitionPlan: true, notes: 'Approuvée le 2024-02-28. 1 travailleur embauché, recherche pour le 2e en cours.',
      },
      {
        id: 'lmia2', employerId: 'emp1', position: 'Analyste en cybersécurité',
        nocCode: '21220', wageOffered: 55.00, medianWage: 50.00,
        status: 'en_traitement', lmiaNumber: '',
        submittedAt: '2024-03-01', expiresAt: '',
        workersRequested: 1, workersFound: 0,
        transitionPlan: true, notes: 'Soumise le 1er mars. En attente de décision EDSC.',
      },
    ],
  },
  {
    id: 'emp2',
    companyName: 'Groupe Restauration Montréal',
    companyNameLegal: '1234567 Québec Inc. (Groupe Restauration Montréal)',
    neq: '1198765432',
    bnFederal: '987654321RC0001',
    naicsCode: '722511',
    naicsDescription: 'Restaurants à service complet',
    industry: 'Restauration et hôtellerie',
    address: '450 Rue Saint-Paul Ouest',
    city: 'Montréal',
    province: 'QC',
    postalCode: 'H2Y 2A4',
    phone: '+1-514-555-9001',
    email: 'admin@grpmtl.ca',
    website: 'www.grpmtl.ca',
    contactName: 'Philippe Deschênes',
    contactTitle: 'Propriétaire-gérant',
    contactPhone: '+1-514-555-9002',
    contactEmail: 'philippe@grpmtl.ca',
    dateIncorporation: '2018-03-22',
    nombreEmployes: 45,
    nombreEmployesTempo: 8,
    syndicat: false,
    conventionCollective: '',
    cnesst: 'CNESST-2018-54321',
    revenuQuebec: '9876543210TQ0001',
    tpsGst: '987654321RT0001',
    status: 'actif',
    assignedTo: 'u2',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-12',
    notes: 'Cherche cuisiniers et serveurs. Pénurie de main-d\'oeuvre dans le secteur.',
    financials: [
      {
        year: 2023,
        revenuBrut: 3800000,
        revenuNet: 285000,
        actifTotal: 1900000,
        passifTotal: 1200000,
        capitauxPropres: 700000,
        masseSalariale: 1650000,
        cotisationsCNESST: 49500,
        impotProvincial: 42750,
        impotFederal: 42750,
        tpsTvqPercu: 378100,
      },
    ],
    credentials: [
      { platform: 'revenu_quebec', username: 'grp_resto_rq', password: '••••••••', lastAccessed: '2024-02-15', notes: '' },
      { platform: 'arc_affaires', username: 'grp_resto_cra', password: '••••••••', lastAccessed: '2024-02-15', notes: '' },
    ],
    lmiaApplications: [
      {
        id: 'lmia3', employerId: 'emp2', position: 'Cuisinier',
        nocCode: '63200', wageOffered: 22.00, medianWage: 18.65,
        status: 'soumis', lmiaNumber: '',
        submittedAt: '2024-03-05', expiresAt: '',
        workersRequested: 3, workersFound: 0,
        transitionPlan: false, notes: 'Volet bas salaire. 3 cuisiniers demandés.',
      },
    ],
  },
  {
    id: 'emp3',
    companyName: 'Ferme Maraîchère Lanaudière',
    companyNameLegal: 'Ferme Maraîchère Lanaudière S.E.N.C.',
    neq: '3356789012',
    bnFederal: '567890123RC0001',
    naicsCode: '111219',
    naicsDescription: 'Culture de légumes et de melons',
    industry: 'Agriculture',
    address: '2800 Rang Saint-Pierre',
    city: 'Joliette',
    province: 'QC',
    postalCode: 'J6E 0L5',
    phone: '+1-450-555-7001',
    email: 'info@fermemaraichere.qc.ca',
    website: '',
    contactName: 'Marc-André Lavoie',
    contactTitle: 'Propriétaire',
    contactPhone: '+1-450-555-7002',
    contactEmail: 'marc@fermemaraichere.qc.ca',
    dateIncorporation: '2008-04-01',
    nombreEmployes: 15,
    nombreEmployesTempo: 25,
    syndicat: false,
    conventionCollective: '',
    cnesst: 'CNESST-2008-11111',
    revenuQuebec: '5678901234TQ0001',
    tpsGst: '567890123RT0001',
    status: 'actif',
    assignedTo: 'u3',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-08',
    notes: 'Programme des travailleurs agricoles saisonniers (PTAS). Besoin annuel de 20-25 travailleurs.',
    financials: [
      {
        year: 2023,
        revenuBrut: 2100000,
        revenuNet: 180000,
        actifTotal: 3500000,
        passifTotal: 1800000,
        capitauxPropres: 1700000,
        masseSalariale: 780000,
        cotisationsCNESST: 31200,
        impotProvincial: 27000,
        impotFederal: 27000,
        tpsTvqPercu: 0,
      },
    ],
    credentials: [
      { platform: 'revenu_quebec', username: 'ferme_lanau_rq', password: '••••••••', lastAccessed: '2024-01-20', notes: '' },
    ],
    lmiaApplications: [
      {
        id: 'lmia4', employerId: 'emp3', position: 'Ouvrier agricole saisonnier',
        nocCode: '85100', wageOffered: 16.50, medianWage: 15.75,
        status: 'approuve', lmiaNumber: 'LMIA-2024-QC-005678',
        submittedAt: '2024-01-20', expiresAt: '2024-12-31',
        workersRequested: 20, workersFound: 18,
        transitionPlan: false, notes: 'PTAS - volet agricole. 18 travailleurs recrutés via le Guatemala.',
      },
    ],
  },
];

// --- Auto-remplissage des formulaires employeur ---
export function autoFillEmployerForm(employer: Employer, fields: LmiaFormField[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.autoFillFrom && field.autoFillFrom in employer) {
      data[field.id] = (employer as unknown as Record<string, unknown>)[field.autoFillFrom];
    }
  }
  return data;
}
