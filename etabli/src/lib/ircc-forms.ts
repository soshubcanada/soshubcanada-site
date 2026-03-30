// ========================================================
// SOS Hub Canada - Définitions des formulaires IRCC
// Moteur de remplissage automatique à partir du dossier client
// ========================================================

import type { IrccFormDefinition, FormFieldDefinition, Client } from './crm-types';
import { IMMIGRATION_PROGRAMS } from './crm-programs';

// ========================================================
// Formulaires IRCC avec champs complets
// ========================================================
export const IRCC_FORMS: IrccFormDefinition[] = [
  // ==================== IMM 0008 ====================
  {
    id: 'imm0008', code: 'IMM 0008', name: 'Demande générique pour le Canada',
    description: 'Formulaire principal utilisé pour la plupart des demandes de résidence permanente',
    category: 'residence_permanente', version: '2024-01',
    fields: [
      { id: 'section_personal', label: 'INFORMATIONS PERSONNELLES', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_famille', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom', label: 'Prénom(s)', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'date_naissance', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'sexe', label: 'Sexe', type: 'select', required: true, section: 'personnel', width: 'third', options: [
        { value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }, { value: 'X', label: 'Autre' },
      ]},
      { id: 'etat_civil', label: 'État civil', type: 'select', required: true, section: 'personnel', autoFillFrom: 'maritalStatus', width: 'third', options: [
        { value: 'celibataire', label: 'Célibataire' }, { value: 'marie', label: 'Marié(e)' },
        { value: 'conjoint_fait', label: 'Conjoint(e) de fait' }, { value: 'divorce', label: 'Divorcé(e)' },
        { value: 'separe', label: 'Séparé(e)' }, { value: 'veuf', label: 'Veuf/Veuve' },
        { value: 'annule', label: 'Mariage annulé' },
      ]},
      { id: 'citoyennete', label: 'Citoyenneté / Nationalité', type: 'text', required: true, section: 'personnel', autoFillFrom: 'nationality', width: 'half' },
      { id: 'pays_naissance', label: 'Pays de naissance', type: 'text', required: true, section: 'personnel', width: 'half' },
      { id: 'ville_naissance', label: 'Ville de naissance', type: 'text', required: true, section: 'personnel', width: 'half' },

      { id: 'section_passport', label: 'PASSEPORT ET DOCUMENTS DE VOYAGE', type: 'section_header', required: false, section: 'passeport', width: 'full' },
      { id: 'numero_passeport', label: 'Numéro de passeport', type: 'text', required: true, section: 'passeport', autoFillFrom: 'passportNumber', width: 'half' },
      { id: 'pays_delivrance', label: 'Pays de délivrance', type: 'text', required: true, section: 'passeport', autoFillFrom: 'nationality', width: 'half' },
      { id: 'date_delivrance', label: 'Date de délivrance', type: 'date', required: true, section: 'passeport', width: 'half' },
      { id: 'date_expiration', label: 'Date d\'expiration', type: 'date', required: true, section: 'passeport', autoFillFrom: 'passportExpiry', width: 'half' },

      { id: 'section_contact', label: 'COORDONNÉES', type: 'section_header', required: false, section: 'contact', width: 'full' },
      { id: 'adresse', label: 'Adresse actuelle', type: 'text', required: true, section: 'contact', autoFillFrom: 'address', width: 'full' },
      { id: 'ville', label: 'Ville', type: 'text', required: true, section: 'contact', autoFillFrom: 'city', width: 'third' },
      { id: 'province', label: 'Province / État', type: 'text', required: true, section: 'contact', autoFillFrom: 'province', width: 'third' },
      { id: 'code_postal', label: 'Code postal', type: 'text', required: true, section: 'contact', autoFillFrom: 'postalCode', width: 'third' },
      { id: 'pays_residence', label: 'Pays de résidence', type: 'text', required: true, section: 'contact', autoFillFrom: 'currentCountry', width: 'half' },
      { id: 'courriel', label: 'Adresse courriel', type: 'email', required: true, section: 'contact', autoFillFrom: 'email', width: 'half' },
      { id: 'telephone', label: 'Numéro de téléphone', type: 'phone', required: true, section: 'contact', autoFillFrom: 'phone', width: 'half' },

      { id: 'section_education', label: 'ÉDUCATION', type: 'section_header', required: false, section: 'education', width: 'full' },
      { id: 'niveau_education', label: 'Plus haut niveau d\'éducation', type: 'select', required: true, section: 'education', autoFillFrom: 'education', width: 'half', options: [
        { value: 'secondaire', label: 'Diplôme d\'études secondaires' },
        { value: 'collegial', label: 'Diplôme d\'études collégiales (DEC)' },
        { value: 'baccalaureat', label: 'Baccalauréat' },
        { value: 'maitrise', label: 'Maîtrise' },
        { value: 'doctorat', label: 'Doctorat' },
        { value: 'professionnel', label: 'Diplôme professionnel' },
      ]},
      { id: 'domaine_etudes', label: 'Domaine d\'études', type: 'text', required: false, section: 'education', width: 'half' },

      { id: 'section_langues', label: 'COMPÉTENCES LINGUISTIQUES', type: 'section_header', required: false, section: 'langues', width: 'full' },
      { id: 'langue_maternelle', label: 'Langue maternelle', type: 'text', required: true, section: 'langues', width: 'third' },
      { id: 'niveau_anglais', label: 'Niveau d\'anglais (CLB)', type: 'text', required: false, section: 'langues', autoFillFrom: 'languageEnglish', width: 'third' },
      { id: 'niveau_francais', label: 'Niveau de français (NCLC)', type: 'text', required: false, section: 'langues', autoFillFrom: 'languageFrench', width: 'third' },

      { id: 'section_emploi', label: 'EXPÉRIENCE DE TRAVAIL', type: 'section_header', required: false, section: 'emploi', width: 'full' },
      { id: 'emploi_actuel', label: 'Emploi actuel / Titre du poste', type: 'text', required: false, section: 'emploi', autoFillFrom: 'workExperience', width: 'full' },
      { id: 'employeur', label: 'Nom de l\'employeur', type: 'text', required: false, section: 'emploi', width: 'half' },
      { id: 'noc_code', label: 'Code CNP (NOC)', type: 'text', required: false, section: 'emploi', width: 'half' },
      { id: 'date_debut_emploi', label: 'Date de début', type: 'date', required: false, section: 'emploi', width: 'half' },
      { id: 'date_fin_emploi', label: 'Date de fin (ou en cours)', type: 'text', required: false, section: 'emploi', width: 'half' },
    ],
  },

  // ==================== IMM 0008 Schedule 1 ====================
  {
    id: 'imm0008-schedule1', code: 'IMM 0008 - Annexe 1', name: 'Antécédents / Déclaration',
    description: 'Questions de vérification des antécédents et déclaration solennelle',
    category: 'residence_permanente', version: '2024-01',
    fields: [
      { id: 'section_antecedents', label: 'ANTÉCÉDENTS', type: 'section_header', required: false, section: 'antecedents', width: 'full' },
      { id: 'nom_famille_s1', label: 'Nom de famille', type: 'text', required: true, section: 'antecedents', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_s1', label: 'Prénom(s)', type: 'text', required: true, section: 'antecedents', autoFillFrom: 'firstName', width: 'half' },
      { id: 'date_naissance_s1', label: 'Date de naissance', type: 'date', required: true, section: 'antecedents', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'uci', label: 'Numéro UCI (si connu)', type: 'text', required: false, section: 'antecedents', width: 'half' },

      { id: 'section_questions', label: 'QUESTIONS DE VÉRIFICATION', type: 'section_header', required: false, section: 'questions', width: 'full' },
      { id: 'q_crime', label: 'Avez-vous déjà été reconnu coupable d\'un crime ou d\'une infraction?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'q_crime_detail', label: 'Si oui, fournir les détails', type: 'textarea', required: false, section: 'questions', width: 'full' },
      { id: 'q_militaire', label: 'Avez-vous servi dans une armée, une milice ou une force de défense civile?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'q_gouvernement', label: 'Avez-vous occupé un poste gouvernemental?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'q_refus_anterieur', label: 'Vous a-t-on déjà refusé un visa, un permis ou l\'entrée au Canada ou dans un autre pays?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'q_renvoi', label: 'Avez-vous déjà fait l\'objet d\'une mesure de renvoi du Canada ou d\'un autre pays?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'q_demande_asile', label: 'Avez-vous déjà présenté une demande d\'asile au Canada ou dans un autre pays?', type: 'radio', required: true, section: 'questions', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },

      { id: 'section_adresses', label: 'ADRESSES DES 10 DERNIÈRES ANNÉES', type: 'section_header', required: false, section: 'adresses', width: 'full' },
      { id: 'adresse_1', label: 'Adresse 1 (actuelle)', type: 'text', required: true, section: 'adresses', autoFillFrom: 'address', width: 'full' },
      { id: 'adresse_1_ville', label: 'Ville', type: 'text', required: true, section: 'adresses', autoFillFrom: 'city', width: 'third' },
      { id: 'adresse_1_pays', label: 'Pays', type: 'text', required: true, section: 'adresses', autoFillFrom: 'currentCountry', width: 'third' },
      { id: 'adresse_1_dates', label: 'De - À', type: 'text', required: true, section: 'adresses', width: 'third', placeholder: 'Ex: 2020-01 à présent' },
      { id: 'adresse_2', label: 'Adresse 2', type: 'text', required: false, section: 'adresses', width: 'full' },
      { id: 'adresse_2_ville', label: 'Ville', type: 'text', required: false, section: 'adresses', width: 'third' },
      { id: 'adresse_2_pays', label: 'Pays', type: 'text', required: false, section: 'adresses', width: 'third' },
      { id: 'adresse_2_dates', label: 'De - À', type: 'text', required: false, section: 'adresses', width: 'third' },
    ],
  },

  // ==================== IMM 5669 ====================
  {
    id: 'imm5669', code: 'IMM 5669', name: 'Annexe A - Antécédents / Déclaration',
    description: 'Renseignements personnels détaillés et déclaration',
    category: 'residence_permanente', version: '2024-01',
    fields: [
      { id: 'section_id_5669', label: 'IDENTIFICATION', type: 'section_header', required: false, section: 'identification', width: 'full' },
      { id: 'nom_5669', label: 'Nom de famille', type: 'text', required: true, section: 'identification', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5669', label: 'Prénom(s)', type: 'text', required: true, section: 'identification', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_5669', label: 'Date de naissance', type: 'date', required: true, section: 'identification', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'uci_5669', label: 'Numéro UCI', type: 'text', required: false, section: 'identification', width: 'half' },
      { id: 'section_education_5669', label: 'ÉDUCATION (depuis l\'âge de 18 ans)', type: 'section_header', required: false, section: 'education', width: 'full' },
      { id: 'edu_1_etablissement', label: 'Nom de l\'établissement', type: 'text', required: true, section: 'education', width: 'half' },
      { id: 'edu_1_ville_pays', label: 'Ville et pays', type: 'text', required: true, section: 'education', width: 'half' },
      { id: 'edu_1_dates', label: 'Dates (de - à)', type: 'text', required: true, section: 'education', width: 'half' },
      { id: 'edu_1_diplome', label: 'Diplôme obtenu', type: 'text', required: true, section: 'education', autoFillFrom: 'education', width: 'half' },
      { id: 'section_historique_5669', label: 'HISTORIQUE PERSONNEL (10 dernières années)', type: 'section_header', required: false, section: 'historique', width: 'full' },
      { id: 'hist_1_activite', label: 'Activité (emploi, études, chômage, etc.)', type: 'text', required: true, section: 'historique', width: 'full' },
      { id: 'hist_1_dates', label: 'Dates', type: 'text', required: true, section: 'historique', width: 'half' },
      { id: 'hist_1_ville_pays', label: 'Ville et pays', type: 'text', required: true, section: 'historique', width: 'half' },
      { id: 'section_organisations', label: 'ORGANISATIONS / ASSOCIATIONS', type: 'section_header', required: false, section: 'organisations', width: 'full' },
      { id: 'org_membre', label: 'Êtes-vous ou avez-vous été membre d\'une organisation?', type: 'radio', required: true, section: 'organisations', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'org_details', label: 'Si oui, détails', type: 'textarea', required: false, section: 'organisations', width: 'full' },
    ],
  },

  // ==================== IMM 5645 ====================
  {
    id: 'imm5645', code: 'IMM 5645', name: 'Renseignements sur la famille',
    description: 'Informations sur tous les membres de la famille du demandeur',
    category: 'general', version: '2024-01',
    fields: [
      { id: 'section_demandeur', label: 'DEMANDEUR PRINCIPAL', type: 'section_header', required: false, section: 'demandeur', width: 'full' },
      { id: 'dem_nom', label: 'Nom de famille', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'lastName', width: 'half' },
      { id: 'dem_prenom', label: 'Prénom(s)', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dem_dob', label: 'Date de naissance', type: 'date', required: true, section: 'demandeur', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'dem_etat_civil', label: 'État civil', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'maritalStatus', width: 'third' },
      { id: 'dem_citoyennete', label: 'Citoyenneté', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'nationality', width: 'third' },

      { id: 'section_epoux', label: 'ÉPOUX / CONJOINT DE FAIT', type: 'section_header', required: false, section: 'epoux', width: 'full' },
      { id: 'epoux_nom', label: 'Nom de famille', type: 'text', required: false, section: 'epoux', width: 'half', autoFillFrom: '_family_spouse_lastName' },
      { id: 'epoux_prenom', label: 'Prénom(s)', type: 'text', required: false, section: 'epoux', width: 'half', autoFillFrom: '_family_spouse_firstName' },
      { id: 'epoux_dob', label: 'Date de naissance', type: 'date', required: false, section: 'epoux', width: 'third', autoFillFrom: '_family_spouse_dateOfBirth' },
      { id: 'epoux_citoyennete', label: 'Citoyenneté', type: 'text', required: false, section: 'epoux', width: 'third', autoFillFrom: '_family_spouse_nationality' },
      { id: 'epoux_passeport', label: 'Numéro de passeport', type: 'text', required: false, section: 'epoux', width: 'third', autoFillFrom: '_family_spouse_passportNumber' },
      { id: 'epoux_accompagne', label: 'Accompagne le demandeur?', type: 'radio', required: false, section: 'epoux', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },

      { id: 'section_mere', label: 'MÈRE', type: 'section_header', required: false, section: 'mere', width: 'full' },
      { id: 'mere_nom', label: 'Nom de famille de la mère', type: 'text', required: true, section: 'mere', width: 'half' },
      { id: 'mere_prenom', label: 'Prénom(s) de la mère', type: 'text', required: true, section: 'mere', width: 'half' },
      { id: 'mere_dob', label: 'Date de naissance', type: 'date', required: false, section: 'mere', width: 'half' },
      { id: 'mere_citoyennete', label: 'Citoyenneté', type: 'text', required: false, section: 'mere', width: 'half' },

      { id: 'section_pere', label: 'PÈRE', type: 'section_header', required: false, section: 'pere', width: 'full' },
      { id: 'pere_nom', label: 'Nom de famille du père', type: 'text', required: true, section: 'pere', width: 'half' },
      { id: 'pere_prenom', label: 'Prénom(s) du père', type: 'text', required: true, section: 'pere', width: 'half' },
      { id: 'pere_dob', label: 'Date de naissance', type: 'date', required: false, section: 'pere', width: 'half' },
      { id: 'pere_citoyennete', label: 'Citoyenneté', type: 'text', required: false, section: 'pere', width: 'half' },

      { id: 'section_enfants', label: 'ENFANTS', type: 'section_header', required: false, section: 'enfants', width: 'full' },
      { id: 'enfant_1_nom', label: 'Enfant 1 - Nom de famille', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_0_lastName' },
      { id: 'enfant_1_prenom', label: 'Enfant 1 - Prénom', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_0_firstName' },
      { id: 'enfant_1_dob', label: 'Enfant 1 - Date de naissance', type: 'date', required: false, section: 'enfants', width: 'third', autoFillFrom: '_family_child_0_dateOfBirth' },
      { id: 'enfant_1_citoyennete', label: 'Enfant 1 - Citoyenneté', type: 'text', required: false, section: 'enfants', width: 'third', autoFillFrom: '_family_child_0_nationality' },
      { id: 'enfant_1_accompagne', label: 'Accompagne?', type: 'radio', required: false, section: 'enfants', width: 'third', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'enfant_2_nom', label: 'Enfant 2 - Nom de famille', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_1_lastName' },
      { id: 'enfant_2_prenom', label: 'Enfant 2 - Prénom', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_1_firstName' },
      { id: 'enfant_2_dob', label: 'Enfant 2 - Date de naissance', type: 'date', required: false, section: 'enfants', width: 'third', autoFillFrom: '_family_child_1_dateOfBirth' },
      { id: 'enfant_2_citoyennete', label: 'Enfant 2 - Citoyenneté', type: 'text', required: false, section: 'enfants', width: 'third', autoFillFrom: '_family_child_1_nationality' },
      { id: 'enfant_3_nom', label: 'Enfant 3 - Nom de famille', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_2_lastName' },
      { id: 'enfant_3_prenom', label: 'Enfant 3 - Prénom', type: 'text', required: false, section: 'enfants', width: 'half', autoFillFrom: '_family_child_2_firstName' },
      { id: 'enfant_3_dob', label: 'Enfant 3 - Date de naissance', type: 'date', required: false, section: 'enfants', width: 'third', autoFillFrom: '_family_child_2_dateOfBirth' },
    ],
  },

  // ==================== IMM 5406 ====================
  {
    id: 'imm5406', code: 'IMM 5406', name: 'Renseignements additionnels sur la famille',
    description: 'Informations détaillées sur tous les membres de la famille incluant ceux qui n\'accompagnent pas',
    category: 'general', version: '2024-01',
    fields: [
      { id: 'section_5406_id', label: 'IDENTIFICATION DU DEMANDEUR', type: 'section_header', required: false, section: 'id', width: 'full' },
      { id: 'nom_5406', label: 'Nom de famille', type: 'text', required: true, section: 'id', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5406', label: 'Prénom', type: 'text', required: true, section: 'id', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_5406', label: 'Date de naissance', type: 'date', required: true, section: 'id', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'section_5406_membres', label: 'TOUS LES MEMBRES DE LA FAMILLE', type: 'section_header', required: false, section: 'membres', width: 'full' },
      { id: 'membre_1_nom', label: 'Membre 1 - Nom complet', type: 'text', required: false, section: 'membres', width: 'half' },
      { id: 'membre_1_lien', label: 'Lien de parenté', type: 'text', required: false, section: 'membres', width: 'half' },
      { id: 'membre_1_dob', label: 'Date de naissance', type: 'date', required: false, section: 'membres', width: 'third' },
      { id: 'membre_1_pays', label: 'Pays de résidence', type: 'text', required: false, section: 'membres', width: 'third' },
      { id: 'membre_1_accompagne', label: 'Accompagne?', type: 'radio', required: false, section: 'membres', width: 'third', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'membre_2_nom', label: 'Membre 2 - Nom complet', type: 'text', required: false, section: 'membres', width: 'half' },
      { id: 'membre_2_lien', label: 'Lien de parenté', type: 'text', required: false, section: 'membres', width: 'half' },
      { id: 'membre_2_dob', label: 'Date de naissance', type: 'date', required: false, section: 'membres', width: 'third' },
      { id: 'membre_2_pays', label: 'Pays de résidence', type: 'text', required: false, section: 'membres', width: 'third' },
    ],
  },

  // ==================== IMM 5476 ====================
  {
    id: 'imm5476', code: 'IMM 5476', name: 'Recours aux services d\'un représentant',
    description: 'Autorisation de désigner SOS Hub Canada comme représentant autorisé',
    category: 'general', version: '2024-01',
    fields: [
      { id: 'section_5476_dem', label: 'RENSEIGNEMENTS SUR LE DEMANDEUR', type: 'section_header', required: false, section: 'demandeur', width: 'full' },
      { id: 'dem_nom_5476', label: 'Nom de famille', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'lastName', width: 'half' },
      { id: 'dem_prenom_5476', label: 'Prénom', type: 'text', required: true, section: 'demandeur', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dem_dob_5476', label: 'Date de naissance', type: 'date', required: true, section: 'demandeur', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'dem_uci_5476', label: 'Numéro UCI', type: 'text', required: false, section: 'demandeur', width: 'half' },

      { id: 'section_5476_rep', label: 'RENSEIGNEMENTS SUR LE REPRÉSENTANT', type: 'section_header', required: false, section: 'representant', width: 'full' },
      { id: 'rep_nom', label: 'Nom du représentant / Cabinet', type: 'text', required: true, section: 'representant', width: 'full', autoFillFrom: '_rep_name' },
      { id: 'rep_type', label: 'Type de représentant', type: 'select', required: true, section: 'representant', width: 'half', options: [
        { value: 'rcic', label: 'Consultant réglementé (RCIC)' },
        { value: 'avocat', label: 'Avocat membre du barreau' },
        { value: 'notaire', label: 'Notaire (Québec)' },
        { value: 'non_remunere', label: 'Non rémunéré' },
      ]},
      { id: 'rep_licence', label: 'Numéro de licence / membre', type: 'text', required: true, section: 'representant', width: 'half', autoFillFrom: '_rep_licence' },
      { id: 'rep_adresse', label: 'Adresse du représentant', type: 'text', required: true, section: 'representant', width: 'full', autoFillFrom: '_rep_address' },
      { id: 'rep_telephone', label: 'Téléphone', type: 'phone', required: true, section: 'representant', width: 'half', autoFillFrom: '_rep_phone' },
      { id: 'rep_courriel', label: 'Courriel', type: 'email', required: true, section: 'representant', width: 'half', autoFillFrom: '_rep_email' },

      { id: 'section_5476_auth', label: 'AUTORISATION', type: 'section_header', required: false, section: 'autorisation', width: 'full' },
      { id: 'auth_confirm', label: 'J\'autorise le représentant désigné ci-dessus à me représenter auprès d\'IRCC', type: 'checkbox', required: true, section: 'autorisation', width: 'full' },
      { id: 'auth_date', label: 'Date de signature', type: 'date', required: true, section: 'autorisation', width: 'half' },
    ],
  },

  // ==================== IMM 5562 ====================
  {
    id: 'imm5562', code: 'IMM 5562', name: 'Renseignements supplémentaires - Voyages',
    description: 'Historique de voyages des 10 dernières années',
    category: 'general', version: '2024-01',
    fields: [
      { id: 'section_5562_id', label: 'IDENTIFICATION', type: 'section_header', required: false, section: 'id', width: 'full' },
      { id: 'nom_5562', label: 'Nom de famille', type: 'text', required: true, section: 'id', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5562', label: 'Prénom', type: 'text', required: true, section: 'id', autoFillFrom: 'firstName', width: 'half' },
      { id: 'section_5562_voyages', label: 'VOYAGES DES 10 DERNIÈRES ANNÉES', type: 'section_header', required: false, section: 'voyages', width: 'full' },
      { id: 'voyage_1_pays', label: 'Pays visité', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_1_dates', label: 'Dates (de - à)', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_1_but', label: 'But du voyage', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_2_pays', label: 'Pays visité', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_2_dates', label: 'Dates', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_2_but', label: 'But', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_3_pays', label: 'Pays visité', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_3_dates', label: 'Dates', type: 'text', required: false, section: 'voyages', width: 'third' },
      { id: 'voyage_3_but', label: 'But', type: 'text', required: false, section: 'voyages', width: 'third' },
    ],
  },

  // ==================== IMM 1294 ====================
  {
    id: 'imm1294', code: 'IMM 1294', name: 'Demande de permis d\'études',
    description: 'Formulaire de demande de permis d\'études au Canada',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_1294_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_1294', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_1294', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_1294', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'citoyennete_1294', label: 'Citoyenneté', type: 'text', required: true, section: 'personnel', autoFillFrom: 'nationality', width: 'third' },
      { id: 'passeport_1294', label: 'Numéro de passeport', type: 'text', required: true, section: 'personnel', autoFillFrom: 'passportNumber', width: 'third' },
      { id: 'courriel_1294', label: 'Courriel', type: 'email', required: true, section: 'personnel', autoFillFrom: 'email', width: 'half' },
      { id: 'tel_1294', label: 'Téléphone', type: 'phone', required: true, section: 'personnel', autoFillFrom: 'phone', width: 'half' },

      { id: 'section_1294_etudes', label: 'DÉTAILS DES ÉTUDES', type: 'section_header', required: false, section: 'etudes', width: 'full' },
      { id: 'eed_nom', label: 'Nom de l\'établissement d\'enseignement désigné (EED)', type: 'text', required: true, section: 'etudes', width: 'full' },
      { id: 'eed_dli', label: 'Numéro DLI de l\'établissement', type: 'text', required: true, section: 'etudes', width: 'half' },
      { id: 'eed_programme', label: 'Nom du programme d\'études', type: 'text', required: true, section: 'etudes', width: 'half' },
      { id: 'eed_niveau', label: 'Niveau d\'études', type: 'select', required: true, section: 'etudes', width: 'third', options: [
        { value: 'secondaire', label: 'Secondaire' }, { value: 'collegial', label: 'Collégial / Cégep' },
        { value: 'baccalaureat', label: 'Baccalauréat' }, { value: 'maitrise', label: 'Maîtrise' },
        { value: 'doctorat', label: 'Doctorat' }, { value: 'certificat', label: 'Certificat / Diplôme' },
      ]},
      { id: 'eed_debut', label: 'Date de début prévue', type: 'date', required: true, section: 'etudes', width: 'third' },
      { id: 'eed_fin', label: 'Date de fin prévue', type: 'date', required: true, section: 'etudes', width: 'third' },

      { id: 'section_1294_finance', label: 'SITUATION FINANCIÈRE', type: 'section_header', required: false, section: 'finance', width: 'full' },
      { id: 'fonds_disponibles', label: 'Fonds disponibles (CAD)', type: 'number', required: true, section: 'finance', width: 'half' },
      { id: 'source_fonds', label: 'Source des fonds', type: 'select', required: true, section: 'finance', width: 'half', options: [
        { value: 'personnel', label: 'Épargne personnelle' }, { value: 'famille', label: 'Aide familiale' },
        { value: 'bourse', label: 'Bourse d\'études' }, { value: 'pret', label: 'Prêt bancaire' },
        { value: 'gouvernement', label: 'Subvention gouvernementale' },
      ]},
    ],
  },

  // ==================== IMM 1295 ====================
  {
    id: 'imm1295', code: 'IMM 1295', name: 'Demande de permis de travail hors Canada',
    description: 'Formulaire de demande de permis de travail présenté de l\'extérieur du Canada',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_1295_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_1295', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_1295', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_1295', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'citoyennete_1295', label: 'Citoyenneté', type: 'text', required: true, section: 'personnel', autoFillFrom: 'nationality', width: 'third' },
      { id: 'passeport_1295', label: 'Passeport', type: 'text', required: true, section: 'personnel', autoFillFrom: 'passportNumber', width: 'third' },
      { id: 'section_1295_emploi', label: 'DÉTAILS DE L\'EMPLOI', type: 'section_header', required: false, section: 'emploi', width: 'full' },
      { id: 'employeur_nom', label: 'Nom de l\'employeur', type: 'text', required: true, section: 'emploi', width: 'half' },
      { id: 'employeur_adresse', label: 'Adresse de l\'employeur', type: 'text', required: true, section: 'emploi', width: 'half' },
      { id: 'poste', label: 'Titre du poste offert', type: 'text', required: true, section: 'emploi', width: 'half' },
      { id: 'noc', label: 'Code CNP (NOC)', type: 'text', required: true, section: 'emploi', width: 'half' },
      { id: 'salaire', label: 'Salaire annuel (CAD)', type: 'number', required: true, section: 'emploi', width: 'third' },
      { id: 'date_debut_travail', label: 'Date de début', type: 'date', required: true, section: 'emploi', width: 'third' },
      { id: 'duree_emploi', label: 'Durée de l\'emploi', type: 'text', required: true, section: 'emploi', width: 'third' },
      { id: 'numero_eimt', label: 'Numéro d\'EIMT (si applicable)', type: 'text', required: false, section: 'emploi', width: 'half' },
      { id: 'type_permis', label: 'Type de permis de travail', type: 'select', required: true, section: 'emploi', width: 'half', options: [
        { value: 'ferme', label: 'Fermé (employeur spécifique)' },
        { value: 'ouvert', label: 'Ouvert' },
        { value: 'ptpd', label: 'Post-diplôme (PTPD)' },
      ]},
    ],
  },

  // ==================== IMM 5257 ====================
  {
    id: 'imm5257', code: 'IMM 5257', name: 'Demande de visa de résident temporaire',
    description: 'Formulaire pour visiter le Canada (tourisme, affaires, famille)',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_5257_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_5257', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5257', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_5257', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'citoyennete_5257', label: 'Citoyenneté', type: 'text', required: true, section: 'personnel', autoFillFrom: 'nationality', width: 'third' },
      { id: 'passeport_5257', label: 'Passeport', type: 'text', required: true, section: 'personnel', autoFillFrom: 'passportNumber', width: 'third' },
      { id: 'section_5257_voyage', label: 'DÉTAILS DU VOYAGE', type: 'section_header', required: false, section: 'voyage', width: 'full' },
      { id: 'but_voyage', label: 'But du voyage', type: 'select', required: true, section: 'voyage', width: 'half', options: [
        { value: 'tourisme', label: 'Tourisme' }, { value: 'affaires', label: 'Affaires' },
        { value: 'famille', label: 'Visite familiale' }, { value: 'medical', label: 'Traitement médical' },
        { value: 'super_visa', label: 'Super visa' }, { value: 'autre', label: 'Autre' },
      ]},
      { id: 'duree_sejour', label: 'Durée de séjour prévue', type: 'text', required: true, section: 'voyage', width: 'half' },
      { id: 'date_arrivee', label: 'Date d\'arrivée prévue', type: 'date', required: true, section: 'voyage', width: 'half' },
      { id: 'adresse_canada', label: 'Adresse au Canada', type: 'text', required: true, section: 'voyage', width: 'half' },
      { id: 'fonds_voyage', label: 'Fonds disponibles pour le voyage (CAD)', type: 'number', required: true, section: 'voyage', width: 'half' },
    ],
  },

  // ==================== IMM 1344 ====================
  {
    id: 'imm1344', code: 'IMM 1344', name: 'Demande de parrainage (catégorie familiale)',
    description: 'Formulaire de parrainage pour époux, conjoint, parents ou enfants',
    category: 'family', version: '2024-01',
    fields: [
      { id: 'section_1344_parrain', label: 'RENSEIGNEMENTS SUR LE PARRAIN', type: 'section_header', required: false, section: 'parrain', width: 'full' },
      { id: 'parrain_nom', label: 'Nom de famille du parrain', type: 'text', required: true, section: 'parrain', width: 'half' },
      { id: 'parrain_prenom', label: 'Prénom du parrain', type: 'text', required: true, section: 'parrain', width: 'half' },
      { id: 'parrain_dob', label: 'Date de naissance', type: 'date', required: true, section: 'parrain', width: 'third' },
      { id: 'parrain_statut', label: 'Statut au Canada', type: 'select', required: true, section: 'parrain', width: 'third', options: [
        { value: 'citoyen', label: 'Citoyen canadien' }, { value: 'rp', label: 'Résident permanent' },
      ]},
      { id: 'parrain_revenu', label: 'Revenu annuel brut (CAD)', type: 'number', required: true, section: 'parrain', width: 'third' },
      { id: 'section_1344_parraine', label: 'PERSONNE PARRAINÉE', type: 'section_header', required: false, section: 'parraine', width: 'full' },
      { id: 'parraine_nom', label: 'Nom de famille', type: 'text', required: true, section: 'parraine', autoFillFrom: 'lastName', width: 'half' },
      { id: 'parraine_prenom', label: 'Prénom', type: 'text', required: true, section: 'parraine', autoFillFrom: 'firstName', width: 'half' },
      { id: 'parraine_dob', label: 'Date de naissance', type: 'date', required: true, section: 'parraine', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'parraine_citoyennete', label: 'Citoyenneté', type: 'text', required: true, section: 'parraine', autoFillFrom: 'nationality', width: 'third' },
      { id: 'lien_parente', label: 'Lien de parenté avec le parrain', type: 'select', required: true, section: 'parraine', width: 'third', options: [
        { value: 'epoux', label: 'Époux/Épouse' }, { value: 'conjoint', label: 'Conjoint(e) de fait' },
        { value: 'parent', label: 'Parent' }, { value: 'grand_parent', label: 'Grand-parent' },
        { value: 'enfant', label: 'Enfant à charge' }, { value: 'autre', label: 'Autre' },
      ]},
    ],
  },

  // ==================== IMM 5532 ====================
  {
    id: 'imm5532', code: 'IMM 5532', name: 'Évaluation de la relation et du parrainage',
    description: 'Renseignements détaillés sur la relation entre le parrain et la personne parrainée',
    category: 'family', version: '2024-01',
    fields: [
      { id: 'section_rencontre', label: 'COMMENT VOUS ÊTES-VOUS RENCONTRÉS?', type: 'section_header', required: false, section: 'rencontre', width: 'full' },
      { id: 'lieu_rencontre', label: 'Lieu de la première rencontre', type: 'text', required: true, section: 'rencontre', width: 'half' },
      { id: 'date_rencontre', label: 'Date de la première rencontre', type: 'date', required: true, section: 'rencontre', width: 'half' },
      { id: 'circonstances', label: 'Circonstances de la rencontre', type: 'textarea', required: true, section: 'rencontre', width: 'full' },
      { id: 'section_relation', label: 'DÉVELOPPEMENT DE LA RELATION', type: 'section_header', required: false, section: 'relation', width: 'full' },
      { id: 'evolution', label: 'Comment la relation a-t-elle évolué?', type: 'textarea', required: true, section: 'relation', width: 'full' },
      { id: 'date_mariage', label: 'Date du mariage / union', type: 'date', required: false, section: 'relation', width: 'half' },
      { id: 'lieu_mariage', label: 'Lieu du mariage / union', type: 'text', required: false, section: 'relation', width: 'half' },
      { id: 'cohabitation_debut', label: 'Date de début de cohabitation', type: 'date', required: false, section: 'relation', width: 'half' },
      { id: 'communication', label: 'Moyens de communication utilisés', type: 'textarea', required: true, section: 'relation', width: 'full', helpText: 'Téléphone, vidéo, courriel, voyages, etc.' },
    ],
  },

  // ==================== IMM 5409 ====================
  {
    id: 'imm5409', code: 'IMM 5409', name: 'Déclaration solennelle d\'union de fait',
    description: 'Déclaration prouvant la relation de fait entre deux personnes',
    category: 'family', version: '2024-01',
    fields: [
      { id: 'section_declarants', label: 'DÉCLARANTS', type: 'section_header', required: false, section: 'declarants', width: 'full' },
      { id: 'declarant_1_nom', label: 'Déclarant 1 - Nom complet', type: 'text', required: true, section: 'declarants', width: 'half' },
      { id: 'declarant_2_nom', label: 'Déclarant 2 - Nom complet', type: 'text', required: true, section: 'declarants', width: 'half' },
      { id: 'date_cohabitation', label: 'Date de début de cohabitation continue', type: 'date', required: true, section: 'declarants', width: 'half' },
      { id: 'adresse_commune', label: 'Adresse commune', type: 'text', required: true, section: 'declarants', width: 'half' },
      { id: 'section_preuves', label: 'PREUVES DE LA RELATION', type: 'section_header', required: false, section: 'preuves', width: 'full' },
      { id: 'preuves_financieres', label: 'Preuves d\'interdépendance financière', type: 'textarea', required: true, section: 'preuves', width: 'full', helpText: 'Comptes conjoints, baux, propriété, assurances, etc.' },
      { id: 'enfants_communs', label: 'Enfants communs (si applicable)', type: 'textarea', required: false, section: 'preuves', width: 'full' },
    ],
  },

  // ==================== IMM 5540 ====================
  {
    id: 'imm5540', code: 'IMM 5540', name: 'Questionnaire du parrain',
    description: 'Questions détaillées pour le parrain dans le cadre du parrainage conjugal',
    category: 'family', version: '2024-01',
    fields: [
      { id: 'section_q_parrain', label: 'QUESTIONNAIRE', type: 'section_header', required: false, section: 'questionnaire', width: 'full' },
      { id: 'q1', label: 'Comment vous êtes-vous rencontrés?', type: 'textarea', required: true, section: 'questionnaire', width: 'full' },
      { id: 'q2', label: 'Décrivez votre relation et son évolution', type: 'textarea', required: true, section: 'questionnaire', width: 'full' },
      { id: 'q3', label: 'Combien de fois vous êtes-vous vus en personne?', type: 'textarea', required: true, section: 'questionnaire', width: 'full' },
      { id: 'q4', label: 'Comment communiquez-vous au quotidien?', type: 'textarea', required: true, section: 'questionnaire', width: 'full' },
      { id: 'q5', label: 'Quels sont vos projets communs?', type: 'textarea', required: true, section: 'questionnaire', width: 'full' },
    ],
  },

  // ==================== IMM 5768 ====================
  {
    id: 'imm5768', code: 'IMM 5768', name: 'Évaluation financière (PGP)',
    description: 'Évaluation financière pour le parrainage des parents et grands-parents',
    category: 'family', version: '2024-01',
    fields: [
      { id: 'section_revenu', label: 'REVENU DU PARRAIN', type: 'section_header', required: false, section: 'revenu', width: 'full' },
      { id: 'revenu_annee_1', label: 'Revenu année 1 (dernière année)', type: 'number', required: true, section: 'revenu', width: 'half' },
      { id: 'revenu_annee_2', label: 'Revenu année 2', type: 'number', required: true, section: 'revenu', width: 'half' },
      { id: 'revenu_annee_3', label: 'Revenu année 3', type: 'number', required: true, section: 'revenu', width: 'half' },
      { id: 'taille_menage', label: 'Taille du ménage (incluant personnes parrainées)', type: 'number', required: true, section: 'revenu', width: 'half' },
      { id: 'sfr_minimum', label: 'Seuil de faible revenu (SFR) + 30% requis', type: 'number', required: false, section: 'revenu', width: 'half', helpText: 'Calculé automatiquement selon la taille du ménage' },
    ],
  },

  // ==================== BOC Form ====================
  {
    id: 'boc-form', code: 'FDA / BOC', name: 'Fondement de la demande d\'asile',
    description: 'Formulaire narratif détaillant les motifs de la demande d\'asile - CRITIQUE pour l\'audience CISR',
    category: 'refugie', version: '2024-01',
    fields: [
      { id: 'section_boc_id', label: 'IDENTIFICATION', type: 'section_header', required: false, section: 'id', width: 'full' },
      { id: 'boc_nom', label: 'Nom de famille', type: 'text', required: true, section: 'id', autoFillFrom: 'lastName', width: 'half' },
      { id: 'boc_prenom', label: 'Prénom', type: 'text', required: true, section: 'id', autoFillFrom: 'firstName', width: 'half' },
      { id: 'boc_dob', label: 'Date de naissance', type: 'date', required: true, section: 'id', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'boc_citoyennete', label: 'Citoyenneté', type: 'text', required: true, section: 'id', autoFillFrom: 'nationality', width: 'third' },
      { id: 'boc_numero', label: 'Numéro de dossier CISR', type: 'text', required: false, section: 'id', width: 'third' },

      { id: 'section_boc_pays', label: 'PAYS DE RÉFÉRENCE', type: 'section_header', required: false, section: 'pays', width: 'full' },
      { id: 'pays_nationalite', label: 'Pays de nationalité', type: 'text', required: true, section: 'pays', autoFillFrom: 'nationality', width: 'half' },
      { id: 'pays_residence_habituelle', label: 'Pays de résidence habituelle antérieure', type: 'text', required: true, section: 'pays', width: 'half' },

      { id: 'section_boc_recit', label: 'RÉCIT / NARRATIF DE LA DEMANDE', type: 'section_header', required: false, section: 'recit', width: 'full' },
      { id: 'narratif', label: 'Décrivez en détail les événements qui vous ont amené à demander l\'asile au Canada', type: 'textarea', required: true, section: 'recit', width: 'full', helpText: 'Incluez les dates, les lieux, les personnes impliquées et les événements chronologiques. Soyez aussi détaillé que possible.' },

      { id: 'section_boc_motifs', label: 'MOTIFS DE PERSÉCUTION', type: 'section_header', required: false, section: 'motifs', width: 'full' },
      { id: 'motif_race', label: 'Race', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_religion', label: 'Religion', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_nationalite', label: 'Nationalité', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_opinion_politique', label: 'Opinion politique', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_groupe_social', label: 'Appartenance à un groupe social particulier', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_torture', label: 'Risque de torture', type: 'checkbox', required: false, section: 'motifs', width: 'third' },
      { id: 'motif_details', label: 'Détails des motifs de persécution', type: 'textarea', required: true, section: 'motifs', width: 'full' },

      { id: 'section_boc_protection', label: 'PROTECTION DE L\'ÉTAT', type: 'section_header', required: false, section: 'protection', width: 'full' },
      { id: 'protection_cherchee', label: 'Avez-vous cherché la protection de l\'État dans votre pays?', type: 'radio', required: true, section: 'protection', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
      { id: 'protection_details', label: 'Détails', type: 'textarea', required: false, section: 'protection', width: 'full' },
      { id: 'refuge_interieur', label: 'Existe-t-il une possibilité de refuge intérieur (PRI)?', type: 'textarea', required: true, section: 'protection', width: 'full', helpText: 'Expliquez pourquoi vous ne pouvez pas vivre en sécurité dans une autre partie de votre pays' },
    ],
  },

  // ==================== IMM 5611 ====================
  {
    id: 'imm5611', code: 'IMM 5611', name: 'Liste de contrôle des documents - Demandeur d\'asile',
    description: 'Liste des documents requis pour la demande d\'asile',
    category: 'refugie', version: '2024-01',
    fields: [
      { id: 'section_docs', label: 'DOCUMENTS REQUIS', type: 'section_header', required: false, section: 'documents', width: 'full' },
      { id: 'doc_passeport', label: 'Copie du passeport ou document de voyage', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_photos', label: 'Photos d\'identité (2)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_fda', label: 'Formulaire FDA complété', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_annexe_a', label: 'Annexe A (IMM 5669) complétée', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_famille', label: 'Renseignements sur la famille (IMM 5645)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_preuves', label: 'Preuves documentaires à l\'appui', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_certificats', label: 'Certificats (naissance, mariage, etc.)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_representant', label: 'Formulaire de représentant (IMM 5476) si applicable', type: 'checkbox', required: false, section: 'documents', width: 'full' },
    ],
  },

  // ==================== CIT 0002 ====================
  {
    id: 'cit0002', code: 'CIT 0002', name: 'Demande de citoyenneté canadienne - Adulte',
    description: 'Demande de citoyenneté pour les résidents permanents de 18 ans et plus',
    category: 'citoyennete', version: '2024-01',
    fields: [
      { id: 'section_cit_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'cit_nom', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'cit_prenom', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'cit_dob', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'third' },
      { id: 'cit_pays_naissance', label: 'Pays de naissance', type: 'text', required: true, section: 'personnel', width: 'third' },
      { id: 'cit_citoyennete', label: 'Citoyenneté actuelle', type: 'text', required: true, section: 'personnel', autoFillFrom: 'nationality', width: 'third' },
      { id: 'cit_numero_rp', label: 'Numéro de carte RP', type: 'text', required: true, section: 'personnel', width: 'half' },
      { id: 'cit_date_rp', label: 'Date d\'obtention de la RP', type: 'date', required: true, section: 'personnel', width: 'half' },
      { id: 'section_cit_presence', label: 'PRÉSENCE PHYSIQUE AU CANADA', type: 'section_header', required: false, section: 'presence', width: 'full' },
      { id: 'jours_presence', label: 'Nombre de jours de présence physique (5 dernières années)', type: 'number', required: true, section: 'presence', width: 'half', helpText: 'Minimum requis: 1095 jours' },
      { id: 'section_cit_absences', label: 'ABSENCES DU CANADA', type: 'section_header', required: false, section: 'absences', width: 'full' },
      { id: 'absence_1_pays', label: 'Pays', type: 'text', required: false, section: 'absences', width: 'third' },
      { id: 'absence_1_dates', label: 'Dates', type: 'text', required: false, section: 'absences', width: 'third' },
      { id: 'absence_1_raison', label: 'Raison', type: 'text', required: false, section: 'absences', width: 'third' },
      { id: 'section_cit_langue', label: 'COMPÉTENCES LINGUISTIQUES', type: 'section_header', required: false, section: 'langue', width: 'full' },
      { id: 'cit_langue', label: 'Langue officielle choisie pour le test', type: 'select', required: true, section: 'langue', width: 'half', options: [
        { value: 'francais', label: 'Français' }, { value: 'anglais', label: 'Anglais' },
      ]},
      { id: 'section_cit_impots', label: 'DÉCLARATIONS DE REVENUS', type: 'section_header', required: false, section: 'impots', width: 'full' },
      { id: 'impots_produits', label: 'Avez-vous produit vos déclarations de revenus pour les 3 dernières années?', type: 'radio', required: true, section: 'impots', width: 'full', options: [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }] },
    ],
  },

  // ==================== CIT 0003 ====================
  {
    id: 'cit0003', code: 'CIT 0003', name: 'Demande de citoyenneté canadienne - Mineur',
    description: 'Demande de citoyenneté pour les enfants de moins de 18 ans',
    category: 'citoyennete', version: '2024-01',
    fields: [
      { id: 'section_mineur', label: 'RENSEIGNEMENTS SUR L\'ENFANT', type: 'section_header', required: false, section: 'enfant', width: 'full' },
      { id: 'mineur_nom', label: 'Nom de famille', type: 'text', required: true, section: 'enfant', width: 'half' },
      { id: 'mineur_prenom', label: 'Prénom', type: 'text', required: true, section: 'enfant', width: 'half' },
      { id: 'mineur_dob', label: 'Date de naissance', type: 'date', required: true, section: 'enfant', width: 'half' },
      { id: 'mineur_citoyennete', label: 'Citoyenneté actuelle', type: 'text', required: true, section: 'enfant', width: 'half' },
      { id: 'section_parent', label: 'PARENT / TUTEUR', type: 'section_header', required: false, section: 'parent', width: 'full' },
      { id: 'parent_nom', label: 'Nom du parent/tuteur', type: 'text', required: true, section: 'parent', width: 'half' },
      { id: 'parent_statut', label: 'Statut du parent', type: 'select', required: true, section: 'parent', width: 'half', options: [
        { value: 'citoyen', label: 'Citoyen canadien' }, { value: 'rp', label: 'Résident permanent' },
      ]},
    ],
  },

  // ==================== IMM 5444 ====================
  {
    id: 'imm5444', code: 'IMM 5444', name: 'Demande de carte de résident permanent',
    description: 'Renouvellement ou remplacement de la carte RP',
    category: 'residence_permanente', version: '2024-01',
    fields: [
      { id: 'section_5444_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_5444', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5444', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_5444', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'numero_rp_5444', label: 'Numéro de client (UCI)', type: 'text', required: true, section: 'personnel', width: 'half' },
      { id: 'adresse_5444', label: 'Adresse actuelle', type: 'text', required: true, section: 'personnel', autoFillFrom: 'address', width: 'full' },
      { id: 'section_5444_presence', label: 'PRÉSENCE PHYSIQUE', type: 'section_header', required: false, section: 'presence', width: 'full' },
      { id: 'jours_5_ans', label: 'Jours de présence physique au Canada (5 dernières années)', type: 'number', required: true, section: 'presence', width: 'half', helpText: 'Minimum requis: 730 jours' },
      { id: 'raison_demande', label: 'Raison de la demande', type: 'select', required: true, section: 'presence', width: 'half', options: [
        { value: 'renouvellement', label: 'Renouvellement (carte expirée)' },
        { value: 'premiere', label: 'Première carte' },
        { value: 'remplacement', label: 'Remplacement (perdue/volée)' },
      ]},
    ],
  },

  // ==================== IMM 5709 ====================
  {
    id: 'imm5709', code: 'IMM 5709', name: 'Demande de modification / prolongation de séjour',
    description: 'Modifier les conditions, prolonger le séjour ou rester au Canada comme résident temporaire',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_5709_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_5709', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5709', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'dob_5709', label: 'Date de naissance', type: 'date', required: true, section: 'personnel', autoFillFrom: 'dateOfBirth', width: 'half' },
      { id: 'passeport_5709', label: 'Passeport', type: 'text', required: true, section: 'personnel', autoFillFrom: 'passportNumber', width: 'half' },
      { id: 'section_5709_demande', label: 'TYPE DE DEMANDE', type: 'section_header', required: false, section: 'demande', width: 'full' },
      { id: 'type_demande', label: 'Type de demande', type: 'select', required: true, section: 'demande', width: 'half', options: [
        { value: 'prolongation_visiteur', label: 'Prolongation de séjour (visiteur)' },
        { value: 'prolongation_etudiant', label: 'Prolongation de permis d\'études' },
        { value: 'prolongation_travail', label: 'Prolongation de permis de travail' },
        { value: 'retablissement', label: 'Rétablissement de statut' },
        { value: 'modification', label: 'Modification de conditions' },
      ]},
      { id: 'statut_actuel', label: 'Statut actuel au Canada', type: 'text', required: true, section: 'demande', autoFillFrom: 'currentStatus', width: 'half' },
      { id: 'date_entree_canada', label: 'Date d\'entrée au Canada', type: 'date', required: true, section: 'demande', width: 'half' },
      { id: 'date_expiration_statut', label: 'Date d\'expiration du statut actuel', type: 'date', required: true, section: 'demande', width: 'half' },
    ],
  },

  // ==================== IMM 5373 ====================
  {
    id: 'imm5373', code: 'IMM 5373', name: 'Engagement de parrainage privé de réfugiés',
    description: 'Engagement du groupe de parrainage envers le réfugié parrainé',
    category: 'refugie', version: '2024-01',
    fields: [
      { id: 'section_groupe', label: 'GROUPE DE PARRAINAGE', type: 'section_header', required: false, section: 'groupe', width: 'full' },
      { id: 'nom_groupe', label: 'Nom du groupe / organisation', type: 'text', required: true, section: 'groupe', width: 'half' },
      { id: 'type_groupe', label: 'Type', type: 'select', required: true, section: 'groupe', width: 'half', options: [
        { value: 'g5', label: 'Groupe de 5 (G5)' },
        { value: 'sah', label: 'Signataire d\'entente de parrainage (SAH)' },
        { value: 'gc', label: 'Groupe communautaire' },
      ]},
      { id: 'section_engage', label: 'ENGAGEMENT', type: 'section_header', required: false, section: 'engagement', width: 'full' },
      { id: 'duree_engagement', label: 'Durée de l\'engagement (mois)', type: 'number', required: true, section: 'engagement', width: 'half' },
      { id: 'montant_engagement', label: 'Montant total de l\'engagement financier (CAD)', type: 'number', required: true, section: 'engagement', width: 'half' },
      { id: 'plan_etablissement', label: 'Plan d\'établissement', type: 'textarea', required: true, section: 'engagement', width: 'full', helpText: 'Décrivez le plan d\'accueil, d\'hébergement et d\'intégration' },
    ],
  },

  // ==================== IMM 1444 ====================
  {
    id: 'imm1444', code: 'IMM 1444', name: 'Demande de PST / Réhabilitation criminelle',
    description: 'Permis de séjour temporaire ou demande de réhabilitation pour inadmissibilité criminelle',
    category: 'humanitaire', version: '2024-01',
    fields: [
      { id: 'section_1444_perso', label: 'RENSEIGNEMENTS PERSONNELS', type: 'section_header', required: false, section: 'personnel', width: 'full' },
      { id: 'nom_1444', label: 'Nom de famille', type: 'text', required: true, section: 'personnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_1444', label: 'Prénom', type: 'text', required: true, section: 'personnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'section_1444_inadm', label: 'INADMISSIBILITÉ', type: 'section_header', required: false, section: 'inadmissibilite', width: 'full' },
      { id: 'type_inadmissibilite', label: 'Type d\'inadmissibilité', type: 'select', required: true, section: 'inadmissibilite', width: 'half', options: [
        { value: 'criminalite', label: 'Criminalité' },
        { value: 'sante', label: 'Santé' },
        { value: 'securite', label: 'Sécurité' },
        { value: 'autre', label: 'Autre' },
      ]},
      { id: 'details_inadmissibilite', label: 'Détails de l\'inadmissibilité', type: 'textarea', required: true, section: 'inadmissibilite', width: 'full' },
      { id: 'motifs_imperieux', label: 'Motifs impérieux justifiant l\'entrée au Canada', type: 'textarea', required: true, section: 'inadmissibilite', width: 'full' },
    ],
  },

  // ==================== IMM 5257B ====================
  {
    id: 'imm5257b', code: 'IMM 5257B', name: 'Renseignements additionnels - VRT (bureau spécifique)',
    description: 'Informations supplémentaires requises par certains bureaux de visa',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_5257b', label: 'RENSEIGNEMENTS ADDITIONNELS', type: 'section_header', required: false, section: 'additionnel', width: 'full' },
      { id: 'nom_5257b', label: 'Nom de famille', type: 'text', required: true, section: 'additionnel', autoFillFrom: 'lastName', width: 'half' },
      { id: 'prenom_5257b', label: 'Prénom', type: 'text', required: true, section: 'additionnel', autoFillFrom: 'firstName', width: 'half' },
      { id: 'emploi_actuel_5257b', label: 'Emploi actuel', type: 'text', required: false, section: 'additionnel', autoFillFrom: 'workExperience', width: 'full' },
      { id: 'education_5257b', label: 'Éducation', type: 'text', required: false, section: 'additionnel', autoFillFrom: 'education', width: 'full' },
      { id: 'voyages_anterieurs', label: 'Voyages antérieurs au Canada', type: 'textarea', required: false, section: 'additionnel', width: 'full' },
    ],
  },

  // ==================== IMM 5484 ====================
  {
    id: 'imm5484', code: 'IMM 5484', name: 'Liste de contrôle - Super visa',
    description: 'Documents requis pour la demande de super visa parents/grands-parents',
    category: 'temporaire', version: '2024-01',
    fields: [
      { id: 'section_5484', label: 'DOCUMENTS REQUIS', type: 'section_header', required: false, section: 'documents', width: 'full' },
      { id: 'doc_passeport_sv', label: 'Passeport valide', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_photos_sv', label: 'Photos', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_invitation', label: 'Lettre d\'invitation de l\'enfant/petit-enfant', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_preuve_revenu', label: 'Preuve de revenu de l\'enfant (SFR)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_assurance', label: 'Assurance médicale (100 000$ min, 1 an)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
      { id: 'doc_examen_medical', label: 'Examen médical d\'immigration (EMI)', type: 'checkbox', required: false, section: 'documents', width: 'full' },
    ],
  },

  // ==================== CIT 0007 ====================
  {
    id: 'cit0007', code: 'CIT 0007', name: 'Calculateur de présence physique - Citoyenneté',
    description: 'Feuille de calcul des jours de présence physique au Canada',
    category: 'citoyennete', version: '2024-01',
    fields: [
      { id: 'section_calcul', label: 'CALCUL DE PRÉSENCE PHYSIQUE', type: 'section_header', required: false, section: 'calcul', width: 'full' },
      { id: 'date_rp', label: 'Date d\'obtention de la résidence permanente', type: 'date', required: true, section: 'calcul', width: 'half' },
      { id: 'date_demande', label: 'Date de la demande de citoyenneté', type: 'date', required: true, section: 'calcul', width: 'half' },
      { id: 'jours_rp', label: 'Jours au Canada comme RP (dans les 5 ans)', type: 'number', required: true, section: 'calcul', width: 'half' },
      { id: 'jours_rt', label: 'Jours au Canada comme RT (avant RP, max 365)', type: 'number', required: false, section: 'calcul', width: 'half', helpText: 'Comptés à demi-valeur, max 365 jours crédités' },
      { id: 'total_jours', label: 'Total des jours crédités', type: 'number', required: false, section: 'calcul', width: 'half', helpText: 'Minimum requis: 1095 jours' },
    ],
  },
];

// ========================================================
// REMPLISSAGE AUTOMATIQUE INTELLIGENT
// Lit le dossier client et remplit tous les champs sans intervention humaine
// ========================================================

const SOS_HUB_INFO = {
  _rep_name: 'SOS Hub Canada - Services d\'immigration',
  _rep_licence: 'RCIC-XXXXXXX',
  _rep_address: '1234 Boulevard Saint-Laurent, Bureau 200, Montréal, QC H2X 2S6',
  _rep_phone: '+1-514-555-0000',
  _rep_email: 'immigration@soshub.ca',
};

export function autoFillFormFromClient(form: IrccFormDefinition, client: Client): Record<string, string> {
  const data: Record<string, string> = {};

  // Trouver l'époux/conjoint dans les membres de la famille
  const spouse = client.familyMembers.find(
    fm => fm.relationship === 'Épouse' || fm.relationship === 'Époux' || fm.relationship === 'Conjoint(e)'
  );

  // Trouver les enfants
  const children = client.familyMembers.filter(
    fm => fm.relationship === 'Fils' || fm.relationship === 'Fille' || fm.relationship === 'Enfant'
  );

  // Mapping étendu pour les membres de la famille
  const familyMap: Record<string, string> = {};
  if (spouse) {
    familyMap['_family_spouse_firstName'] = spouse.firstName;
    familyMap['_family_spouse_lastName'] = spouse.lastName;
    familyMap['_family_spouse_dateOfBirth'] = spouse.dateOfBirth;
    familyMap['_family_spouse_nationality'] = spouse.nationality;
    familyMap['_family_spouse_passportNumber'] = spouse.passportNumber;
  }
  children.forEach((child, idx) => {
    familyMap[`_family_child_${idx}_firstName`] = child.firstName;
    familyMap[`_family_child_${idx}_lastName`] = child.lastName;
    familyMap[`_family_child_${idx}_dateOfBirth`] = child.dateOfBirth;
    familyMap[`_family_child_${idx}_nationality`] = child.nationality;
  });

  // Fusionner toutes les sources
  const allSources: Record<string, string> = {
    ...SOS_HUB_INFO,
    ...familyMap,
    firstName: client.firstName,
    lastName: client.lastName,
    dateOfBirth: client.dateOfBirth,
    email: client.email,
    phone: client.phone,
    nationality: client.nationality,
    passportNumber: client.passportNumber,
    passportExpiry: client.passportExpiry,
    address: client.address,
    city: client.city,
    province: client.province,
    postalCode: client.postalCode,
    currentCountry: client.currentCountry,
    currentStatus: client.currentStatus,
    maritalStatus: client.maritalStatus,
    education: client.education,
    workExperience: client.workExperience,
    languageEnglish: client.languageEnglish,
    languageFrench: client.languageFrench,
  };

  // Remplir chaque champ qui a un autoFillFrom
  for (const field of form.fields) {
    if (field.autoFillFrom && allSources[field.autoFillFrom]) {
      data[field.id] = allSources[field.autoFillFrom];
    }
  }

  return data;
}

export function getFormsForProgram(programId: string): IrccFormDefinition[] {
  const program = IMMIGRATION_PROGRAMS.find(p => p.id === programId);
  if (!program) return [];
  return program.requiredForms
    .map(formId => IRCC_FORMS.find(f => f.id === formId))
    .filter((f): f is IrccFormDefinition => f !== undefined);
}

export function getFormById(formId: string): IrccFormDefinition | undefined {
  return IRCC_FORMS.find(f => f.id === formId);
}
