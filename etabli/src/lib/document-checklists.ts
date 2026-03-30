// ========================================================
// SOS Hub Canada - Checklists documents par programme
// + Bibliothèque formulaires IRCC / MIFI / EDSC
// ========================================================

import type { DocumentCategory, EmployerDocumentCategory } from './crm-types';

// --- Checklist item ---
export interface DocumentChecklistItem {
  documentType: string;
  label: string;
  category: DocumentCategory;
  required: boolean;
  description: string;
  expiryTracked: boolean;
}

export interface EmployerChecklistItem {
  documentType: string;
  label: string;
  category: EmployerDocumentCategory;
  required: boolean;
  description: string;
}

// --- Checklists par programme immigration ---
const COMMON_DOCS: DocumentChecklistItem[] = [
  { documentType: 'passeport', label: 'Passeport valide', category: 'identite', required: true, description: 'Copie de toutes les pages du passeport', expiryTracked: true },
  { documentType: 'photos', label: 'Photos format immigration', category: 'photos', required: true, description: '2 photos récentes (35mm x 45mm) fond blanc', expiryTracked: false },
  { documentType: 'certificat_naissance', label: 'Certificat de naissance', category: 'identite', required: true, description: 'Avec traduction certifiée si nécessaire', expiryTracked: false },
];

export const PROGRAM_DOCUMENT_CHECKLISTS: Record<string, DocumentChecklistItem[]> = {
  // PEQ - Voie travailleurs
  peq_travailleurs: [
    ...COMMON_DOCS,
    { documentType: 'csq', label: 'CSQ (Certificat de sélection du Québec)', category: 'legal', required: true, description: 'Délivré par le MIFI', expiryTracked: true },
    { documentType: 'tef_tcf', label: 'Résultats TEF/TCF Canada', category: 'langue', required: true, description: 'Niveau B2 minimum en français (NCLC 7)', expiryTracked: true },
    { documentType: 'lettre_emploi', label: 'Lettre d\'employeur', category: 'emploi', required: true, description: 'Confirmation d\'emploi avec titre, salaire et durée', expiryTracked: false },
    { documentType: 'releves_paie', label: 'Relevés de paie', category: 'emploi', required: true, description: '12 derniers mois de talons de paie', expiryTracked: false },
    { documentType: 'permis_travail', label: 'Permis de travail actuel', category: 'legal', required: true, description: 'Copie du permis de travail valide', expiryTracked: true },
    { documentType: 'certificat_police', label: 'Certificat de police', category: 'legal', required: true, description: 'De chaque pays de résidence (6 mois+)', expiryTracked: true },
    { documentType: 'examen_medical', label: 'Examen médical (EMI)', category: 'medical', required: true, description: 'Par un médecin désigné IRCC', expiryTracked: true },
    { documentType: 'preuve_residence_qc', label: 'Preuve de résidence au Québec', category: 'autre', required: true, description: 'Bail, relevé Hydro-Québec, etc.', expiryTracked: false },
  ],
  // Entrée Express - FSW
  entree_express_fsw: [
    ...COMMON_DOCS,
    { documentType: 'eca_wes', label: 'Évaluation des diplômes (ECA/WES)', category: 'education', required: true, description: 'Équivalence canadienne des diplômes', expiryTracked: true },
    { documentType: 'tef_tcf', label: 'Résultats TEF/TCF ou IELTS', category: 'langue', required: true, description: 'Résultats valides (moins de 2 ans)', expiryTracked: true },
    { documentType: 'lettres_emploi', label: 'Lettres d\'emploi antérieures', category: 'emploi', required: true, description: 'Historique d\'emploi des 10 dernières années', expiryTracked: false },
    { documentType: 'preuve_fonds', label: 'Preuve de fonds', category: 'financier', required: true, description: 'Relevés bancaires des 6 derniers mois', expiryTracked: false },
    { documentType: 'certificat_police', label: 'Certificat de police', category: 'legal', required: true, description: 'De chaque pays de résidence (6 mois+)', expiryTracked: true },
    { documentType: 'examen_medical', label: 'Examen médical (EMI)', category: 'medical', required: true, description: 'Par un médecin désigné IRCC', expiryTracked: true },
    { documentType: 'diplomes', label: 'Diplômes et relevés de notes', category: 'education', required: true, description: 'Originaux avec traductions certifiées', expiryTracked: false },
  ],
  // Permis de travail
  permis_travail: [
    ...COMMON_DOCS,
    { documentType: 'offre_emploi', label: 'Offre d\'emploi', category: 'emploi', required: true, description: 'Lettre d\'offre signée par l\'employeur', expiryTracked: false },
    { documentType: 'lmia_confirmation', label: 'Confirmation EIMT/LMIA', category: 'legal', required: false, description: 'Si applicable (certains programmes exemptés)', expiryTracked: true },
    { documentType: 'cv', label: 'CV à jour', category: 'emploi', required: true, description: 'Format canadien recommandé', expiryTracked: false },
    { documentType: 'diplomes', label: 'Diplômes pertinents', category: 'education', required: true, description: 'Avec traductions certifiées', expiryTracked: false },
    { documentType: 'examen_medical', label: 'Examen médical', category: 'medical', required: false, description: 'Si requis selon le pays d\'origine', expiryTracked: true },
  ],
  // Demande d'asile
  demande_asile: [
    ...COMMON_DOCS,
    { documentType: 'formulaire_fondement', label: 'Formulaire Fondement de la demande (FDA)', category: 'legal', required: true, description: 'Récit détaillé des motifs de la demande', expiryTracked: false },
    { documentType: 'preuves_persecution', label: 'Preuves de persécution', category: 'legal', required: true, description: 'Documents, rapports, articles, photos', expiryTracked: false },
    { documentType: 'rapport_pays', label: 'Rapport sur les conditions du pays', category: 'legal', required: false, description: 'Rapports d\'organismes reconnus (HRW, Amnesty)', expiryTracked: false },
    { documentType: 'documents_identite', label: 'Tout document d\'identité disponible', category: 'identite', required: true, description: 'Carte nationale, permis, livret famille', expiryTracked: false },
    { documentType: 'certificat_police', label: 'Certificat de police', category: 'legal', required: false, description: 'Si disponible et sécuritaire à obtenir', expiryTracked: true },
  ],
  // Permis d'études
  permis_etudes: [
    ...COMMON_DOCS,
    { documentType: 'lettre_admission', label: 'Lettre d\'admission (DLI)', category: 'education', required: true, description: 'D\'un établissement désigné (DLI)', expiryTracked: false },
    { documentType: 'caq', label: 'CAQ (Certificat d\'acceptation du Québec)', category: 'legal', required: true, description: 'Si études au Québec', expiryTracked: true },
    { documentType: 'preuve_fonds', label: 'Preuve de fonds suffisants', category: 'financier', required: true, description: 'Frais de scolarité + frais de subsistance', expiryTracked: false },
    { documentType: 'diplomes', label: 'Relevés de notes antérieurs', category: 'education', required: true, description: 'Avec traductions certifiées', expiryTracked: false },
    { documentType: 'tef_tcf', label: 'Résultats tests de langue', category: 'langue', required: false, description: 'Si exigé par l\'établissement', expiryTracked: true },
  ],
  // Citoyenneté
  citoyennete: [
    ...COMMON_DOCS,
    { documentType: 'carte_rp', label: 'Carte de résident permanent', category: 'identite', required: true, description: 'Copie recto-verso', expiryTracked: true },
    { documentType: 'declarations_impots', label: 'Déclarations d\'impôts (3 ans)', category: 'financier', required: true, description: 'Avis de cotisation CRA des 3 dernières années', expiryTracked: false },
    { documentType: 'preuve_langue', label: 'Preuve de compétence linguistique', category: 'langue', required: true, description: 'TEF/TCF ou diplôme en français/anglais', expiryTracked: true },
    { documentType: 'historique_voyages', label: 'Historique des voyages', category: 'autre', required: true, description: 'Liste détaillée des absences du Canada', expiryTracked: false },
  ],
};

// Fallback pour programmes sans checklist spécifique
export const DEFAULT_DOCUMENT_CHECKLIST: DocumentChecklistItem[] = COMMON_DOCS;

// --- Checklist documents employeur (LMIA) ---
export const EMPLOYER_LMIA_CHECKLIST: EmployerChecklistItem[] = [
  { documentType: 'neq', label: 'Certificat NEQ / Incorporation', category: 'incorporation', required: true, description: 'Numéro d\'entreprise du Québec ou certificat fédéral' },
  { documentType: 'etats_financiers', label: 'États financiers récents', category: 'financier', required: true, description: 'Bilan, état des résultats des 2 dernières années' },
  { documentType: 't4_sommaire', label: 'Sommaire T4', category: 'fiscal', required: true, description: 'Relevé des rémunérations payées aux employés' },
  { documentType: 'preuve_recrutement', label: 'Preuves d\'efforts de recrutement', category: 'lmia', required: true, description: 'Annonces Guichet-Emplois (4 semaines min.), autres plateformes' },
  { documentType: 'plan_transition', label: 'Plan de transition', category: 'lmia', required: true, description: 'Plan pour former/recruter des Canadiens à long terme' },
  { documentType: 'licence_affaires', label: 'Licence / permis d\'exploitation', category: 'permis', required: false, description: 'Permis municipal ou provincial si applicable' },
  { documentType: 'cnesst_conformite', label: 'Attestation CNESST', category: 'cnesst', required: true, description: 'Preuve de conformité en santé et sécurité au travail' },
  { documentType: 'assurance_collective', label: 'Preuve d\'assurance maladie', category: 'assurance', required: true, description: 'Couverture santé pour le travailleur étranger' },
  { documentType: 'contrat_travail', label: 'Contrat de travail modèle', category: 'lmia', required: true, description: 'Conditions conformes au salaire médian/prévalent' },
  { documentType: 'organigramme', label: 'Organigramme de l\'entreprise', category: 'autre', required: false, description: 'Structure organisationnelle montrant le poste' },
];

// --- Bibliothèque de formulaires gouvernementaux (liens officiels) ---
export interface GovernmentForm {
  id: string;
  code: string;
  name: string;
  category: 'ircc' | 'mifi' | 'edsc';
  description: string;
  applicableTo: 'client' | 'employer' | 'both';
}

export const GOVERNMENT_FORM_LIBRARY: GovernmentForm[] = [
  // --- IRCC (clients) ---
  { id: 'imm0008', code: 'IMM 0008', name: 'Demande générique pour le Canada', category: 'ircc', description: 'Formulaire principal de demande de résidence permanente', applicableTo: 'client' },
  { id: 'imm0008_sch1', code: 'IMM 0008 - Annexe 1', name: 'Antécédents / Déclaration', category: 'ircc', description: 'Historique personnel, voyages, adresses', applicableTo: 'client' },
  { id: 'imm5669', code: 'IMM 5669', name: 'Annexe A - Vérification des antécédents', category: 'ircc', description: 'Historique détaillé pour vérification sécuritaire', applicableTo: 'client' },
  { id: 'imm5645', code: 'IMM 5645', name: 'Renseignements sur la famille', category: 'ircc', description: 'Informations sur le conjoint, enfants, parents', applicableTo: 'client' },
  { id: 'imm5406', code: 'IMM 5406', name: 'Renseignements additionnels sur la famille', category: 'ircc', description: 'Informations complémentaires sur les membres de la famille', applicableTo: 'client' },
  { id: 'imm1295', code: 'IMM 1295', name: 'Demande de permis de travail', category: 'ircc', description: 'Formulaire de demande de permis de travail temporaire', applicableTo: 'client' },
  { id: 'imm5476', code: 'IMM 5476', name: 'Recours aux services d\'un représentant', category: 'ircc', description: 'Autorisation pour qu\'un représentant agisse au nom du demandeur', applicableTo: 'client' },
  { id: 'imm5562', code: 'IMM 5562', name: 'Renseignements supplémentaires - Réfugiés', category: 'ircc', description: 'Informations additionnelles pour demandes d\'asile', applicableTo: 'client' },
  { id: 'imm5710', code: 'IMM 5710', name: 'Demande de citoyenneté canadienne', category: 'ircc', description: 'Formulaire principal de demande de citoyenneté', applicableTo: 'client' },
  { id: 'imm5257', code: 'IMM 5257', name: 'Demande de visa de visiteur', category: 'ircc', description: 'Visa de résident temporaire (tourisme, affaires)', applicableTo: 'client' },
  { id: 'imm1294', code: 'IMM 1294', name: 'Demande de permis d\'études', category: 'ircc', description: 'Formulaire pour étudier au Canada', applicableTo: 'client' },
  // --- MIFI / Québec ---
  { id: 'mifi_csq', code: 'CSQ', name: 'Certificat de sélection du Québec', category: 'mifi', description: 'Demande de CSQ via le Programme de l\'expérience québécoise (PEQ) ou PRTQ', applicableTo: 'client' },
  { id: 'mifi_caq', code: 'CAQ', name: 'Certificat d\'acceptation du Québec', category: 'mifi', description: 'Requis pour études ou travail temporaire au Québec', applicableTo: 'both' },
  { id: 'mifi_a0520', code: 'A-0520-AF', name: 'Demande de sélection permanente', category: 'mifi', description: 'Formulaire de sélection permanente (volet régulier)', applicableTo: 'client' },
  { id: 'mifi_engagement', code: 'A-0526-CF', name: 'Engagement financier', category: 'mifi', description: 'Engagement de l\'employeur ou du répondant', applicableTo: 'both' },
  { id: 'mifi_arrima', code: 'Arrima', name: 'Déclaration d\'intérêt - Arrima', category: 'mifi', description: 'Portail Arrima pour travailleurs qualifiés du Québec', applicableTo: 'client' },
  // --- EDSC / Employeurs ---
  { id: 'emp5593', code: 'EMP 5593', name: 'Demande d\'EIMT (LMIA)', category: 'edsc', description: 'Formulaire principal de demande d\'Étude d\'impact sur le marché du travail', applicableTo: 'employer' },
  { id: 'emp5627', code: 'EMP 5627', name: 'Annexe EIMT - Salaires élevés', category: 'edsc', description: 'Annexe pour postes à salaire élevé (au-dessus du médian)', applicableTo: 'employer' },
  { id: 'emp5626', code: 'EMP 5626', name: 'Annexe EIMT - Salaires bas', category: 'edsc', description: 'Annexe pour postes à bas salaire (sous le médian)', applicableTo: 'employer' },
  { id: 'emp5575', code: 'EMP 5575', name: 'Offre d\'emploi à un TET', category: 'edsc', description: 'Offre d\'emploi formelle au travailleur étranger temporaire', applicableTo: 'employer' },
  { id: 'emp5598', code: 'EMP 5598', name: 'Contrat de travail (annexe)', category: 'edsc', description: 'Contrat de travail pour travailleur étranger temporaire', applicableTo: 'employer' },
];

// Helper: obtenir la checklist d'un programme
export function getChecklistForProgram(programId: string): DocumentChecklistItem[] {
  return PROGRAM_DOCUMENT_CHECKLISTS[programId] ?? DEFAULT_DOCUMENT_CHECKLIST;
}

// Helper: formulaires par type
export function getFormsForTarget(target: 'client' | 'employer'): GovernmentForm[] {
  return GOVERNMENT_FORM_LIBRARY.filter(f => f.applicableTo === target || f.applicableTo === 'both');
}
