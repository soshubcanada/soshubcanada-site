// ========================================================
// SOS Hub Canada - Système d'analyse de qualification
// CRS (Entrée express / IRCC) & MIFI (PSTQ / Arrima Québec)
// Basé sur les grilles officielles IRCC et MIFI 2024-2026
// ========================================================

// ============================================================
// TYPES COMMUNS
// ============================================================

export type LanguageTestType = 'TEF' | 'TCF' | 'IELTS' | 'CELPIP';

export interface LanguageScores {
  speaking: number;  // NCLC / CLB
  listening: number;
  reading: number;
  writing: number;
}

export interface ScoringProfile {
  // Identité
  age: number;
  maritalStatus: 'single' | 'married_common_law';
  spouseAccompanying: boolean;

  // Éducation
  educationLevel: EducationLevel;
  canadianEducation: CanadianEducationLevel;
  foreignCredentialECA: boolean;

  // Langues
  firstLanguage: 'french' | 'english';
  firstLanguageScores: LanguageScores;
  secondLanguageScores: LanguageScores | null;

  // Expérience
  canadianWorkExperienceYears: number;
  foreignWorkExperienceYears: number;
  nocTeerLevel: 0 | 1 | 2 | 3 | 4 | 5;

  // Facteurs additionnels
  provincialNomination: boolean;
  validJobOffer: boolean;
  jobOfferNocLevel: 0 | 1 | 2 | 3 | 4 | 5;
  siblingInCanada: boolean;

  // Conjoint (si applicable)
  spouseEducation: EducationLevel | null;
  spouseLanguageScores: LanguageScores | null;
  spouseCanadianExperienceYears: number;

  // Québec spécifique (MIFI)
  offreEmploiValidee: boolean;
  domaineFormationDemande: boolean;
  enfants: number;
  sejourQuebec: boolean;
  familleQuebec: boolean;
  capaciteFinanciere: boolean;
  connaissanceQuebec: boolean;
}

export type EducationLevel =
  | 'secondary'
  | 'one_year_post_secondary'
  | 'two_year_post_secondary'
  | 'bachelors'
  | 'two_or_more_post_secondary'
  | 'masters'
  | 'doctoral';

export type CanadianEducationLevel =
  | 'none'
  | 'one_two_year'
  | 'three_year_or_more';

// ============================================================
// CRS - COMPREHENSIVE RANKING SYSTEM (ENTRÉE EXPRESS)
// Source: IRCC - Système de classement global
// Max: 1200 points (600 core + 600 additional)
// ============================================================

export interface CrsBreakdown {
  total: number;
  coreHumanCapital: {
    age: number;
    education: number;
    firstLanguage: number;
    secondLanguage: number;
    canadianExperience: number;
    subtotal: number;
  };
  spouseFactors: {
    education: number;
    language: number;
    canadianExperience: number;
    subtotal: number;
  };
  skillTransferability: {
    educationLanguage: number;
    educationExperience: number;
    foreignCanadianExperience: number;
    certificateLanguage: number;
    certificateExperience: number;
    subtotal: number;
  };
  additional: {
    provincialNomination: number;
    jobOffer: number;
    canadianEducation: number;
    frenchLanguageBonus: number;
    siblingBonus: number;
    subtotal: number;
  };
}

// --- CRS: Points d'âge ---
function crsAgePoints(age: number, withSpouse: boolean): number {
  const table: Record<number, [number, number]> = {
    // [sans conjoint, avec conjoint]
    17: [0, 0], 18: [99, 90], 19: [105, 95],
    20: [110, 100], 21: [110, 100], 22: [110, 100], 23: [110, 100],
    24: [110, 100], 25: [110, 100], 26: [110, 100], 27: [110, 100],
    28: [110, 100], 29: [110, 100],
    30: [105, 95], 31: [99, 90], 32: [94, 85], 33: [88, 80],
    34: [83, 75], 35: [77, 70], 36: [72, 65], 37: [66, 60],
    38: [61, 55], 39: [55, 50], 40: [50, 45], 41: [39, 35],
    42: [28, 25], 43: [17, 15], 44: [6, 5],
  };
  if (age < 18 || age > 44) return 0;
  const idx = withSpouse ? 1 : 0;
  return table[age]?.[idx] ?? 0;
}

// --- CRS: Points d'éducation ---
function crsEducationPoints(level: EducationLevel, withSpouse: boolean): number {
  const table: Record<EducationLevel, [number, number]> = {
    secondary: [30, 28],
    one_year_post_secondary: [90, 84],
    two_year_post_secondary: [98, 91],
    bachelors: [120, 112],
    two_or_more_post_secondary: [128, 119],
    masters: [135, 126],
    doctoral: [150, 140],
  };
  const idx = withSpouse ? 1 : 0;
  return table[level]?.[idx] ?? 0;
}

// --- CRS: Points de langue (premier langue officielle) ---
function crsFirstLanguagePoints(clb: number, withSpouse: boolean): number {
  if (clb < 4) return 0;
  if (clb <= 5) return withSpouse ? 6 : 6;
  if (clb <= 6) return withSpouse ? 8 : 9;
  if (clb <= 7) return withSpouse ? 16 : 17;
  if (clb <= 8) return withSpouse ? 22 : 23;
  if (clb <= 9) return withSpouse ? 29 : 31;
  return withSpouse ? 32 : 34; // CLB 10+
}

function crsFirstLanguageTotal(scores: LanguageScores, withSpouse: boolean): number {
  return crsFirstLanguagePoints(scores.speaking, withSpouse)
    + crsFirstLanguagePoints(scores.listening, withSpouse)
    + crsFirstLanguagePoints(scores.reading, withSpouse)
    + crsFirstLanguagePoints(scores.writing, withSpouse);
}

// --- CRS: Points de deuxième langue officielle ---
function crsSecondLanguagePoints(clb: number, withSpouse: boolean): number {
  if (clb < 5) return 0;
  if (clb <= 6) return withSpouse ? 1 : 1;
  if (clb <= 8) return withSpouse ? 3 : 3;
  return withSpouse ? 6 : 6; // CLB 9+
}

function crsSecondLanguageTotal(scores: LanguageScores | null, withSpouse: boolean): number {
  if (!scores) return 0;
  const total = crsSecondLanguagePoints(scores.speaking, withSpouse)
    + crsSecondLanguagePoints(scores.listening, withSpouse)
    + crsSecondLanguagePoints(scores.reading, withSpouse)
    + crsSecondLanguagePoints(scores.writing, withSpouse);
  return Math.min(total, withSpouse ? 22 : 24);
}

// --- CRS: Expérience canadienne ---
function crsCanadianExperiencePoints(years: number, withSpouse: boolean): number {
  if (years < 1) return 0;
  if (years === 1) return withSpouse ? 35 : 40;
  if (years === 2) return withSpouse ? 46 : 53;
  if (years === 3) return withSpouse ? 56 : 64;
  if (years === 4) return withSpouse ? 63 : 72;
  return withSpouse ? 70 : 80; // 5+
}

// --- CRS: Facteurs du conjoint ---
function crsSpouseEducationPoints(level: EducationLevel | null): number {
  if (!level) return 0;
  const table: Record<EducationLevel, number> = {
    secondary: 2,
    one_year_post_secondary: 6,
    two_year_post_secondary: 7,
    bachelors: 8,
    two_or_more_post_secondary: 9,
    masters: 10,
    doctoral: 10,
  };
  return table[level] ?? 0;
}

function crsSpouseLanguagePoints(clb: number): number {
  if (clb < 5) return 0;
  if (clb <= 6) return 1;
  if (clb <= 8) return 3;
  return 5; // CLB 9+
}

function crsSpouseLanguageTotal(scores: LanguageScores | null): number {
  if (!scores) return 0;
  const total = crsSpouseLanguagePoints(scores.speaking)
    + crsSpouseLanguagePoints(scores.listening)
    + crsSpouseLanguagePoints(scores.reading)
    + crsSpouseLanguagePoints(scores.writing);
  return Math.min(total, 20);
}

function crsSpouseCanadianExperiencePoints(years: number): number {
  if (years < 1) return 0;
  if (years === 1) return 5;
  if (years === 2) return 7;
  if (years === 3) return 8;
  if (years === 4) return 9;
  return 10;
}

// --- CRS: Transférabilité des compétences (max 100) ---
function crsSkillTransferability(profile: ScoringProfile): {
  educationLanguage: number;
  educationExperience: number;
  foreignCanadianExperience: number;
  certificateLanguage: number;
  certificateExperience: number;
} {
  const lang = profile.firstLanguageScores;
  const minCLB = Math.min(lang.speaking, lang.listening, lang.reading, lang.writing);
  const edu = profile.educationLevel;
  const foreignYears = profile.foreignWorkExperienceYears;
  const canadianYears = profile.canadianWorkExperienceYears;

  const hasGoodEducation = ['bachelors', 'two_or_more_post_secondary', 'masters', 'doctoral'].includes(edu);
  const hasModerateEducation = ['one_year_post_secondary', 'two_year_post_secondary'].includes(edu);

  // Éducation + Langues
  let educationLanguage = 0;
  if (hasGoodEducation && minCLB >= 9) educationLanguage = 50;
  else if (hasGoodEducation && minCLB >= 7) educationLanguage = 25;
  else if (hasModerateEducation && minCLB >= 9) educationLanguage = 25;
  else if (hasModerateEducation && minCLB >= 7) educationLanguage = 13;

  // Éducation + Expérience canadienne
  let educationExperience = 0;
  if (hasGoodEducation && canadianYears >= 2) educationExperience = 50;
  else if (hasGoodEducation && canadianYears >= 1) educationExperience = 25;
  else if (hasModerateEducation && canadianYears >= 2) educationExperience = 25;
  else if (hasModerateEducation && canadianYears >= 1) educationExperience = 13;

  // Expérience étrangère + canadienne
  let foreignCanadianExperience = 0;
  if (foreignYears >= 3 && canadianYears >= 2) foreignCanadianExperience = 50;
  else if (foreignYears >= 3 && canadianYears >= 1) foreignCanadianExperience = 25;
  else if (foreignYears >= 1 && canadianYears >= 2) foreignCanadianExperience = 25;
  else if (foreignYears >= 1 && canadianYears >= 1) foreignCanadianExperience = 13;

  // Certificat de qualification + langue (métiers spécialisés)
  let certificateLanguage = 0;
  // Simplifié - applicable seulement si NOC TEER métiers

  // Certificat + expérience canadienne
  let certificateExperience = 0;

  // Cap combiné éducation-langue + éducation-expérience à 50 chacun
  // Cap total à 100
  const total = educationLanguage + educationExperience + foreignCanadianExperience + certificateLanguage + certificateExperience;
  if (total > 100) {
    const ratio = 100 / total;
    educationLanguage = Math.round(educationLanguage * ratio);
    educationExperience = Math.round(educationExperience * ratio);
    foreignCanadianExperience = Math.round(foreignCanadianExperience * ratio);
  }

  return { educationLanguage, educationExperience, foreignCanadianExperience, certificateLanguage, certificateExperience };
}

// --- CRS: Points additionnels (max 600) ---
function crsAdditionalPoints(profile: ScoringProfile): {
  provincialNomination: number;
  jobOffer: number;
  canadianEducation: number;
  frenchLanguageBonus: number;
  siblingBonus: number;
} {
  let jobOffer = 0;
  if (profile.validJobOffer) {
    if (profile.jobOfferNocLevel === 0) jobOffer = 200;
    else if (profile.jobOfferNocLevel <= 3) jobOffer = 50;
  }

  let canadianEducation = 0;
  if (profile.canadianEducation === 'three_year_or_more') canadianEducation = 30;
  else if (profile.canadianEducation === 'one_two_year') canadianEducation = 15;

  // Bonus francophone: CLB 7+ en français + anglais
  let frenchLanguageBonus = 0;
  const frScores = profile.firstLanguage === 'french' ? profile.firstLanguageScores : profile.secondLanguageScores;
  const enScores = profile.firstLanguage === 'english' ? profile.firstLanguageScores : profile.secondLanguageScores;
  if (frScores) {
    const minFr = Math.min(frScores.speaking, frScores.listening, frScores.reading, frScores.writing);
    if (minFr >= 7) {
      if (enScores) {
        const minEn = Math.min(enScores.speaking, enScores.listening, enScores.reading, enScores.writing);
        if (minEn >= 5) frenchLanguageBonus = 50;
        else frenchLanguageBonus = 25;
      } else {
        frenchLanguageBonus = 25;
      }
    }
  }

  return {
    provincialNomination: profile.provincialNomination ? 600 : 0,
    jobOffer,
    canadianEducation,
    frenchLanguageBonus,
    siblingBonus: profile.siblingInCanada ? 15 : 0,
  };
}

// --- CRS: CALCUL PRINCIPAL ---
export function calculateCRS(profile: ScoringProfile): CrsBreakdown {
  const withSpouse = profile.maritalStatus === 'married_common_law' && profile.spouseAccompanying;

  // Core
  const age = crsAgePoints(profile.age, withSpouse);
  const education = crsEducationPoints(profile.educationLevel, withSpouse);
  const firstLanguage = crsFirstLanguageTotal(profile.firstLanguageScores, withSpouse);
  const secondLanguage = crsSecondLanguageTotal(profile.secondLanguageScores, withSpouse);
  const canadianExperience = crsCanadianExperiencePoints(profile.canadianWorkExperienceYears, withSpouse);

  const coreSubtotal = age + education + firstLanguage + secondLanguage + canadianExperience;

  // Spouse
  const spouseEdu = withSpouse ? crsSpouseEducationPoints(profile.spouseEducation) : 0;
  const spouseLang = withSpouse ? crsSpouseLanguageTotal(profile.spouseLanguageScores) : 0;
  const spouseExp = withSpouse ? crsSpouseCanadianExperiencePoints(profile.spouseCanadianExperienceYears) : 0;
  const spouseSubtotal = spouseEdu + spouseLang + spouseExp;

  // Skill transferability
  const st = crsSkillTransferability(profile);
  const stSubtotal = st.educationLanguage + st.educationExperience + st.foreignCanadianExperience + st.certificateLanguage + st.certificateExperience;

  // Additional
  const add = crsAdditionalPoints(profile);
  const addSubtotal = add.provincialNomination + add.jobOffer + add.canadianEducation + add.frenchLanguageBonus + add.siblingBonus;

  return {
    total: coreSubtotal + spouseSubtotal + stSubtotal + addSubtotal,
    coreHumanCapital: { age, education, firstLanguage, secondLanguage, canadianExperience, subtotal: coreSubtotal },
    spouseFactors: { education: spouseEdu, language: spouseLang, canadianExperience: spouseExp, subtotal: spouseSubtotal },
    skillTransferability: { ...st, subtotal: stSubtotal },
    additional: { ...add, subtotal: addSubtotal },
  };
}

// ============================================================
// MIFI - GRILLE PSTQ / ARRIMA (QUÉBEC)
// Source: MIFI - Règlement sur l'immigration au Québec
// ============================================================

export interface MifiBreakdown {
  total: number;
  formation: { niveau: number; domaine: number; subtotal: number };
  experience: { duree: number; domaine: number; subtotal: number };
  age: number;
  langues: { francais: number; anglais: number; subtotal: number };
  sejourEtudes: number;
  offreEmploi: number;
  enfants: number;
  capaciteFinanciere: number;
  valeursDemocratiques: number;
  connexionQuebec: number;
}

// --- MIFI: Formation (max ~14 points niveau) ---
function mifiFormationNiveau(level: EducationLevel): number {
  const table: Record<EducationLevel, number> = {
    secondary: 2,
    one_year_post_secondary: 5,
    two_year_post_secondary: 6,
    bachelors: 10,
    two_or_more_post_secondary: 10,
    masters: 12,
    doctoral: 14,
  };
  return table[level] ?? 0;
}

// --- MIFI: Âge ---
function mifiAgePoints(age: number): number {
  if (age >= 18 && age <= 35) return 16;
  if (age === 36) return 14;
  if (age === 37) return 12;
  if (age === 38) return 10;
  if (age === 39) return 8;
  if (age === 40) return 6;
  if (age === 41) return 4;
  if (age === 42) return 2;
  return 0;
}

// --- MIFI: Français (NCLC) ---
function mifiFrenchPoints(scores: LanguageScores | null): number {
  if (!scores) return 0;
  let total = 0;
  // Oral (écouter + parler)
  const oralAvg = (scores.listening + scores.speaking) / 2;
  if (oralAvg >= 10) total += 7;
  else if (oralAvg >= 8) total += 6;
  else if (oralAvg >= 7) total += 5;
  else if (oralAvg >= 5) total += 1;

  // Écrit (lire + écrire)
  const writtenAvg = (scores.reading + scores.writing) / 2;
  if (writtenAvg >= 10) total += 7;
  else if (writtenAvg >= 8) total += 6;
  else if (writtenAvg >= 7) total += 5;
  else if (writtenAvg >= 5) total += 1;

  // B2 oral minimum requis pour PEQ
  return total;
}

// --- MIFI: Anglais ---
function mifiEnglishPoints(scores: LanguageScores | null): number {
  if (!scores) return 0;
  const avg = (scores.speaking + scores.listening + scores.reading + scores.writing) / 4;
  if (avg >= 8) return 6;
  if (avg >= 6) return 4;
  if (avg >= 5) return 2;
  return 0;
}

// --- MIFI: Expérience de travail ---
function mifiExperiencePoints(years: number): number {
  if (years < 1) return 0;
  if (years < 2) return 4;
  if (years < 4) return 6;
  return 8;
}

// --- MIFI: CALCUL PRINCIPAL ---
export function calculateMIFI(profile: ScoringProfile): MifiBreakdown {
  const formationNiveau = mifiFormationNiveau(profile.educationLevel);
  const formationDomaine = profile.domaineFormationDemande ? 4 : 0;

  const experienceDuree = mifiExperiencePoints(
    profile.canadianWorkExperienceYears + profile.foreignWorkExperienceYears
  );
  const experienceDomaine = profile.domaineFormationDemande ? 2 : 0;

  const age = mifiAgePoints(profile.age);

  const frScores = profile.firstLanguage === 'french' ? profile.firstLanguageScores : profile.secondLanguageScores;
  const enScores = profile.firstLanguage === 'english' ? profile.firstLanguageScores : profile.secondLanguageScores;
  const francais = mifiFrenchPoints(frScores);
  const anglais = mifiEnglishPoints(enScores);

  const sejourEtudes = profile.sejourQuebec ? 5 : 0;
  const offreEmploi = profile.offreEmploiValidee ? 10 : 0;
  const enfants = Math.min(profile.enfants, 3) * 4;
  const capaciteFinanciere = profile.capaciteFinanciere ? 1 : 0;
  const connexionQuebec = profile.familleQuebec ? 3 : 0;
  const valeursDemocratiques = 0; // Attestation obligatoire, non scoré

  return {
    total: formationNiveau + formationDomaine + experienceDuree + experienceDomaine
      + age + francais + anglais + sejourEtudes + offreEmploi + enfants
      + capaciteFinanciere + connexionQuebec + valeursDemocratiques,
    formation: { niveau: formationNiveau, domaine: formationDomaine, subtotal: formationNiveau + formationDomaine },
    experience: { duree: experienceDuree, domaine: experienceDomaine, subtotal: experienceDuree + experienceDomaine },
    age,
    langues: { francais, anglais, subtotal: francais + anglais },
    sejourEtudes,
    offreEmploi,
    enfants,
    capaciteFinanciere,
    valeursDemocratiques,
    connexionQuebec,
  };
}

// ============================================================
// CONSEILS D'AMÉLIORATION
// ============================================================

export interface ImprovementAdvice {
  category: string;
  currentPoints: number;
  maxPoints: number;
  advice: string;
  impact: 'faible' | 'moyen' | 'élevé' | 'très_élevé';
  actionable: boolean;
}

export function getCrsImprovementAdvice(profile: ScoringProfile, breakdown: CrsBreakdown): ImprovementAdvice[] {
  const advice: ImprovementAdvice[] = [];
  const lang = profile.firstLanguageScores;
  const minCLB = Math.min(lang.speaking, lang.listening, lang.reading, lang.writing);

  // Langue - souvent le levier le plus important
  if (minCLB < 10) {
    const potential = minCLB < 7 ? 'très_élevé' : minCLB < 9 ? 'élevé' : 'moyen';
    advice.push({
      category: 'Compétences linguistiques',
      currentPoints: breakdown.coreHumanCapital.firstLanguage,
      maxPoints: 136,
      advice: `Améliorer le score CLB/NCLC de ${minCLB} vers ${Math.min(minCLB + 2, 10)} dans toutes les compétences. Chaque niveau CLB au-dessus de 7 rapporte significativement plus de points. Reprendre le test TEF/IELTS après préparation intensive.`,
      impact: potential as 'faible' | 'moyen' | 'élevé' | 'très_élevé',
      actionable: true,
    });
  }

  // Deuxième langue
  if (!profile.secondLanguageScores || Math.min(
    profile.secondLanguageScores.speaking, profile.secondLanguageScores.listening,
    profile.secondLanguageScores.reading, profile.secondLanguageScores.writing
  ) < 7) {
    advice.push({
      category: 'Deuxième langue officielle',
      currentPoints: breakdown.coreHumanCapital.secondLanguage,
      maxPoints: 24,
      advice: 'Passer un test dans la deuxième langue officielle (TEF si anglophone, IELTS si francophone). CLB 7+ dans les 4 compétences maximise les points.',
      impact: 'moyen',
      actionable: true,
    });
  }

  // Bonus francophone
  if (breakdown.additional.frenchLanguageBonus < 50) {
    const frScores = profile.firstLanguage === 'french' ? profile.firstLanguageScores : profile.secondLanguageScores;
    if (frScores) {
      const minFr = Math.min(frScores.speaking, frScores.listening, frScores.reading, frScores.writing);
      if (minFr >= 5 && minFr < 7) {
        advice.push({
          category: 'Bonus francophone',
          currentPoints: breakdown.additional.frenchLanguageBonus,
          maxPoints: 50,
          advice: 'Atteindre NCLC 7 en français dans les 4 compétences pour obtenir le bonus francophone de 25-50 points additionnels.',
          impact: 'élevé',
          actionable: true,
        });
      }
    } else {
      advice.push({
        category: 'Bonus francophone',
        currentPoints: 0,
        maxPoints: 50,
        advice: 'Passer le TEF Canada pour obtenir le bonus francophone (jusqu\'à 50 points additionnels). NCLC 7+ requis.',
        impact: 'élevé',
        actionable: true,
      });
    }
  }

  // Éducation
  if (profile.educationLevel !== 'doctoral' && profile.educationLevel !== 'masters') {
    advice.push({
      category: 'Éducation',
      currentPoints: breakdown.coreHumanCapital.education,
      maxPoints: 150,
      advice: profile.educationLevel === 'bachelors'
        ? 'Un diplôme de maîtrise canadien ajouterait des points d\'éducation ET des points d\'études canadiennes (+30). Considérer un programme de 1 an.'
        : 'Compléter un diplôme postsecondaire plus avancé pourrait augmenter significativement le score.',
      impact: profile.educationLevel === 'secondary' ? 'très_élevé' : 'moyen',
      actionable: true,
    });
  }

  // Études canadiennes
  if (profile.canadianEducation === 'none') {
    advice.push({
      category: 'Études canadiennes',
      currentPoints: breakdown.additional.canadianEducation,
      maxPoints: 30,
      advice: 'Un diplôme canadien de 3+ ans ajoute 30 points additionnels. Un programme de 1-2 ans en ajoute 15. Stratégie courante pour les candidats proches du seuil.',
      impact: 'moyen',
      actionable: true,
    });
  }

  // Expérience canadienne
  if (profile.canadianWorkExperienceYears < 3) {
    advice.push({
      category: 'Expérience canadienne',
      currentPoints: breakdown.coreHumanCapital.canadianExperience,
      maxPoints: 80,
      advice: profile.canadianWorkExperienceYears === 0
        ? 'Obtenir de l\'expérience de travail canadienne (via permis de travail, PVT, etc.) est un levier majeur pour le CRS et la transférabilité.'
        : `Continuer à accumuler de l\'expérience canadienne. Passer de ${profile.canadianWorkExperienceYears} à ${profile.canadianWorkExperienceYears + 1} an(s) ajoutera des points directs et de transférabilité.`,
      impact: profile.canadianWorkExperienceYears === 0 ? 'très_élevé' : 'élevé',
      actionable: true,
    });
  }

  // Offre d'emploi
  if (!profile.validJobOffer) {
    advice.push({
      category: 'Offre d\'emploi valide',
      currentPoints: 0,
      maxPoints: 200,
      advice: 'Une offre d\'emploi validée par EIMT peut ajouter 50 points (TEER 1-3) ou 200 points (TEER 0). Chercher activement des employeurs au Guichet-Emplois.',
      impact: 'élevé',
      actionable: true,
    });
  }

  // Nomination provinciale
  if (!profile.provincialNomination) {
    advice.push({
      category: 'Nomination provinciale (PNP)',
      currentPoints: 0,
      maxPoints: 600,
      advice: 'Une nomination provinciale ajoute 600 points et garantit pratiquement une ITA. Explorer les programmes PNP alignés avec Entrée express (Ontario, C.-B., Alberta, etc.).',
      impact: 'très_élevé',
      actionable: true,
    });
  }

  // Âge
  if (profile.age >= 30) {
    advice.push({
      category: 'Âge',
      currentPoints: breakdown.coreHumanCapital.age,
      maxPoints: 110,
      advice: 'Les points d\'âge diminuent après 29 ans. Si possible, soumettre la demande rapidement. Chaque année compte.',
      impact: profile.age >= 35 ? 'élevé' : 'moyen',
      actionable: false,
    });
  }

  return advice.sort((a, b) => {
    const impactOrder = { très_élevé: 0, élevé: 1, moyen: 2, faible: 3 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

export function getMifiImprovementAdvice(profile: ScoringProfile, breakdown: MifiBreakdown): ImprovementAdvice[] {
  const advice: ImprovementAdvice[] = [];

  // Français - crucial pour le Québec
  if (breakdown.langues.francais < 14) {
    const frScores = profile.firstLanguage === 'french' ? profile.firstLanguageScores : profile.secondLanguageScores;
    const currentMin = frScores ? Math.min(frScores.speaking, frScores.listening, frScores.reading, frScores.writing) : 0;
    advice.push({
      category: 'Français',
      currentPoints: breakdown.langues.francais,
      maxPoints: 14,
      advice: currentMin < 7
        ? 'Le français oral B2 (NCLC 7) est OBLIGATOIRE pour la plupart des volets PSTQ. Prioriser la préparation au TEF/TCF. Cours intensifs de francisation gratuits au Québec.'
        : 'Améliorer le score de français écrit et oral vers NCLC 10 pour maximiser les points. Le TEF peut être repassé.',
      impact: currentMin < 7 ? 'très_élevé' : 'élevé',
      actionable: true,
    });
  }

  // Offre d'emploi validée
  if (!profile.offreEmploiValidee) {
    advice.push({
      category: 'Offre d\'emploi validée',
      currentPoints: 0,
      maxPoints: 10,
      advice: 'Une offre d\'emploi validée par le MIFI ajoute 10 points importants. Chercher un employeur prêt à faire les démarches EIMT ou de validation MIFI.',
      impact: 'élevé',
      actionable: true,
    });
  }

  // Séjour/études au Québec
  if (!profile.sejourQuebec) {
    advice.push({
      category: 'Séjour au Québec',
      currentPoints: 0,
      maxPoints: 5,
      advice: 'Un séjour d\'études ou de travail au Québec ajoute des points et démontre l\'intégration. Considérer un permis d\'études ou PVT au Québec.',
      impact: 'moyen',
      actionable: true,
    });
  }

  // Formation dans un domaine en demande
  if (!profile.domaineFormationDemande) {
    advice.push({
      category: 'Domaine de formation en demande',
      currentPoints: 0,
      maxPoints: 6,
      advice: 'Les formations dans les domaines privilégiés par le MIFI (santé, TI, génie, éducation) ajoutent des points bonus. Consulter la liste des domaines de formation privilégiés du MIFI.',
      impact: 'moyen',
      actionable: false,
    });
  }

  // Anglais
  if (breakdown.langues.anglais < 6) {
    advice.push({
      category: 'Anglais',
      currentPoints: breakdown.langues.anglais,
      maxPoints: 6,
      advice: 'Améliorer l\'anglais pour obtenir les points supplémentaires. CLB 8+ dans les 4 compétences maximise les 6 points.',
      impact: 'faible',
      actionable: true,
    });
  }

  // Âge
  if (profile.age > 35) {
    advice.push({
      category: 'Âge',
      currentPoints: breakdown.age,
      maxPoints: 16,
      advice: 'Les points d\'âge diminuent après 35 ans au Québec. Soumettre la demande dans Arrima le plus tôt possible.',
      impact: profile.age > 40 ? 'élevé' : 'moyen',
      actionable: false,
    });
  }

  // Capacité financière
  if (!profile.capaciteFinanciere) {
    advice.push({
      category: 'Capacité financière',
      currentPoints: 0,
      maxPoints: 1,
      advice: 'Démontrer la capacité financière d\'établissement (contrat d\'autonomie financière). Obligatoire pour le CSQ.',
      impact: 'faible',
      actionable: true,
    });
  }

  return advice.sort((a, b) => {
    const impactOrder = { très_élevé: 0, élevé: 1, moyen: 2, faible: 3 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

// ============================================================
// SEUILS RÉCENTS (INDICATIFS)
// ============================================================

export const CRS_RECENT_CUTOFFS = [
  // 2026 — Plus aucun tirage général depuis avril 2024, uniquement par catégorie
  { date: '2026-03-18', program: 'Francophone', score: 393, invitations: 4000 },
  { date: '2026-01-26', program: 'CEC', score: 520, invitations: 1000 },
  // 2025
  { date: '2025-12-19', program: 'Francophone', score: 399, invitations: 4750 },
  { date: '2025-12-12', program: 'CEC', score: 515, invitations: 1000 },
  { date: '2025-11-12', program: 'CEC', score: 533, invitations: 1000 },
  { date: '2025-10-29', program: 'Francophone', score: 410, invitations: 3200 },
  { date: '2025-09-19', program: 'Francophone', score: 446, invitations: 4000 },
  { date: '2025-08-27', program: 'STEM', score: 496, invitations: 2000 },
  { date: '2025-08-07', program: 'CEC', score: 534, invitations: 1000 },
  { date: '2025-07-24', program: 'Santé', score: 476, invitations: 3000 },
  { date: '2025-05-31', program: 'Transport', score: 435, invitations: 1000 },
  { date: '2025-03-21', program: 'Francophone', score: 379, invitations: 4000 },
];

// Score compétitif PSTQ/Arrima : 590-760 pts selon le volet (dernier tirage mars 2026 : 2522 invitations)
export const MIFI_THRESHOLD_ESTIMATE = 590; // Score compétitif estimé pour invitation Arrima PSTQ

// ============================================================
// PROFIL PAR DÉFAUT
// ============================================================
export function getDefaultProfile(): ScoringProfile {
  return {
    age: 30,
    maritalStatus: 'single',
    spouseAccompanying: false,
    educationLevel: 'bachelors',
    canadianEducation: 'none',
    foreignCredentialECA: false,
    firstLanguage: 'french',
    firstLanguageScores: { speaking: 7, listening: 7, reading: 7, writing: 7 },
    secondLanguageScores: null,
    canadianWorkExperienceYears: 0,
    foreignWorkExperienceYears: 3,
    nocTeerLevel: 1,
    provincialNomination: false,
    validJobOffer: false,
    jobOfferNocLevel: 1,
    siblingInCanada: false,
    spouseEducation: null,
    spouseLanguageScores: null,
    spouseCanadianExperienceYears: 0,
    offreEmploiValidee: false,
    domaineFormationDemande: false,
    enfants: 0,
    sejourQuebec: false,
    familleQuebec: false,
    capaciteFinanciere: true,
    connaissanceQuebec: false,
  };
}
