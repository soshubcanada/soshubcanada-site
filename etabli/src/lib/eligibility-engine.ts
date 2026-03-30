// ========================================================
// SOS Hub Canada - Moteur d'analyse d'admissibilite
// Analyse complete du profil client pour tous les programmes
// d'immigration canadiens - Tout en francais quebecois
// ========================================================

// ─── TYPES CLIENT ───────────────────────────────────────

export interface ClientProfile {
  // Personnel
  age: number;
  nationality: string;
  maritalStatus: 'single' | 'married' | 'common_law' | 'separated' | 'divorced' | 'widowed';
  hasSpouse: boolean;
  numberOfDependents: number;

  // Localisation
  currentCountry: string;
  isInCanada: boolean;
  isInQuebec: boolean;
  yearsInCanada: number;
  yearsInQuebec: number;

  // Education
  highestEducation: 'none' | 'secondary' | 'one_year_diploma' | 'two_year_diploma' | 'three_year_diploma' | 'bachelors' | 'masters' | 'phd';
  hasCanadianEducation: boolean;
  canadianEducationLevel?: string;
  canadianEducationProvince?: string;
  hasECA: boolean;
  fieldOfStudy?: string;

  // Langues
  frenchLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'native';
  frenchNCLC?: number;
  englishLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'native';
  englishCLB?: number;
  hasLanguageTest: boolean;
  languageTestType?: 'TEF' | 'TCF' | 'IELTS' | 'CELPIP';

  // Experience de travail
  totalWorkExperienceYears: number;
  canadianWorkExperienceYears: number;
  quebecWorkExperienceYears: number;
  currentOccupationNOC?: string;
  nocTEER?: 0 | 1 | 2 | 3 | 4 | 5;
  hasJobOffer: boolean;
  jobOfferNOC?: string;
  jobOfferProvince?: string;
  isJobOfferLMIA?: boolean;

  // Liens familiaux
  hasRelativeInCanada: boolean;
  relativeRelationship?: string;
  hasSpouseInCanada: boolean;

  // Statut d'immigration
  currentStatus?: 'citizen_other' | 'visitor' | 'student' | 'worker' | 'refugee_claimant' | 'pr' | 'none';
  hasValidPermit: boolean;

  // Financier
  settlementFunds: number;

  // Spouse details (for CRS spouse factors)
  spouseEducation?: 'none' | 'secondary' | 'one_year_diploma' | 'two_year_diploma' | 'three_year_diploma' | 'bachelors' | 'masters' | 'phd';
  spouseFrenchNCLC?: number;
  spouseEnglishCLB?: number;
  spouseCanadianWorkYears?: number;

  // Credentials
  hasMultipleCredentials?: boolean;
  hasCertificateOfQualification?: boolean;

  // Special
  isRefugee: boolean;
  hasCriminalRecord: boolean;
  hasMedicalIssue: boolean;
  hasBusinessExperience: boolean;
  businessNetWorth?: number;
}

// ─── TYPES RESULTATS ────────────────────────────────────

export interface ProgramEligibility {
  programId: string;
  programName: string;
  programNameFr: string;
  category: 'temporaire' | 'permanent' | 'quebec' | 'refugie' | 'citoyennete';
  eligibility: 'eligible' | 'likely_eligible' | 'possibly_eligible' | 'not_eligible' | 'ended';
  score: number;
  estimatedCRSScore?: number;
  estimatedFSWPoints?: number;
  keyStrengths: string[];
  missingRequirements: string[];
  recommendations: string[];
  priority: number;
  estimatedProcessingTime: string;
  governmentFees: number;
  notes: string;
}

export interface EligibilityAnalysis {
  clientName: string;
  analysisDate: string;
  overallSummary: string;
  programs: ProgramEligibility[];
  topRecommendation: string;
  crsEstimate?: number;
  fswPointsEstimate?: number;
}

export interface CRSBreakdown {
  coreHumanCapital: {
    age: number;
    education: number;
    firstLanguage: number;
    secondLanguage: number;
    canadianWorkExperience: number;
    subtotal: number;
  };
  spouseFactors: {
    education: number;
    firstLanguage: number;
    canadianWorkExperience: number;
    subtotal: number;
  };
  skillTransferability: {
    educationLanguage: number;
    educationCanadianWork: number;
    foreignWorkLanguage: number;
    foreignWorkCanadianWork: number;
    certificateLanguage: number;
    subtotal: number;
  };
  additionalFactors: {
    provincialNomination: number;
    canadianEducation: number;
    frenchLanguageBonus: number;
    sibling: number;
    subtotal: number;
  };
  total: number;
}

export interface FSWBreakdown {
  age: number;
  education: number;
  firstLanguage: number;
  secondLanguage: number;
  workExperience: number;
  arrangedEmployment: number;
  adaptability: number;
  total: number;
}

// ─── CONSTANTES ─────────────────────────────────────────

const SETTLEMENT_FUNDS_REQUIRED: Record<number, number> = {
  1: 14690,
  2: 18288,
  3: 22483,
  4: 27297,
  5: 30956,
  6: 34913,
  7: 38875,
};

// ─── HELPERS NIVEAUX LINGUISTIQUES ──────────────────────

export function descriptiveToNCLC(level: string): number {
  switch (level) {
    case 'none': return 0;
    case 'basic': return 4;
    case 'intermediate': return 6;
    case 'advanced': return 9;
    case 'native': return 12;
    default: return 0;
  }
}

export function descriptiveToCLB(level: string): number {
  switch (level) {
    case 'none': return 0;
    case 'basic': return 4;
    case 'intermediate': return 6;
    case 'advanced': return 9;
    case 'native': return 12;
    default: return 0;
  }
}

function getEffectiveFrenchNCLC(profile: ClientProfile): number {
  if (profile.frenchNCLC !== undefined && profile.frenchNCLC > 0) {
    return profile.frenchNCLC;
  }
  return descriptiveToNCLC(profile.frenchLevel);
}

function getEffectiveEnglishCLB(profile: ClientProfile): number {
  if (profile.englishCLB !== undefined && profile.englishCLB > 0) {
    return profile.englishCLB;
  }
  return descriptiveToCLB(profile.englishLevel);
}

function getRequiredSettlementFunds(familySize: number): number {
  if (familySize >= 7) return SETTLEMENT_FUNDS_REQUIRED[7] + (familySize - 7) * 3900;
  return SETTLEMENT_FUNDS_REQUIRED[familySize] || SETTLEMENT_FUNDS_REQUIRED[1];
}

function getFamilySize(profile: ClientProfile): number {
  let size = 1;
  if (profile.hasSpouse) size++;
  size += profile.numberOfDependents;
  return size;
}

function isSkilledNOC(teer?: 0 | 1 | 2 | 3 | 4 | 5): boolean {
  return teer !== undefined && teer <= 3;
}

function isTradeNOC(teer?: 0 | 1 | 2 | 3 | 4 | 5): boolean {
  return teer !== undefined && (teer === 2 || teer === 3);
}

// ─── CALCULATEUR CRS ────────────────────────────────────

function crsAgePoints(age: number, hasSpouse: boolean): number {
  const table: Record<string, [number, number]> = {
    // [withSpouse, withoutSpouse]
    '17': [0, 0], '18': [90, 99], '19': [95, 105],
    '20': [100, 110], '21': [100, 110], '22': [100, 110],
    '23': [100, 110], '24': [100, 110], '25': [100, 110],
    '26': [100, 110], '27': [100, 110], '28': [100, 110],
    '29': [100, 110], '30': [95, 105], '31': [90, 99],
    '32': [85, 94], '33': [80, 88], '34': [75, 83],
    '35': [70, 77], '36': [65, 72], '37': [60, 66],
    '38': [55, 61], '39': [50, 55], '40': [45, 50],
    '41': [35, 39], '42': [25, 28], '43': [15, 17],
    '44': [5, 6], '45': [0, 0],
  };
  const key = String(Math.min(Math.max(age, 17), 45));
  const entry = table[key];
  if (!entry) return 0;
  return hasSpouse ? entry[0] : entry[1];
}

function crsEducationPoints(education: string, hasSpouse: boolean): number {
  const withSpouse: Record<string, number> = {
    'none': 0, 'secondary': 28, 'one_year_diploma': 84,
    'two_year_diploma': 91, 'three_year_diploma': 112,
    'bachelors': 112, 'masters': 126, 'phd': 140,
  };
  const withoutSpouse: Record<string, number> = {
    'none': 0, 'secondary': 30, 'one_year_diploma': 90,
    'two_year_diploma': 98, 'three_year_diploma': 120,
    'bachelors': 120, 'masters': 135, 'phd': 150,
  };
  const table = hasSpouse ? withSpouse : withoutSpouse;
  return table[education] ?? 0;
}

function crsFirstLanguagePoints(clb: number, hasSpouse: boolean): number {
  // Points per ability (4 abilities: speaking, listening, reading, writing)
  // Simplified: uses same CLB for all 4 abilities
  let perAbility: number;
  if (hasSpouse) {
    if (clb >= 10) perAbility = 32;
    else if (clb === 9) perAbility = 29;
    else if (clb === 8) perAbility = 22;
    else if (clb === 7) perAbility = 16;
    else if (clb === 6) perAbility = 8;
    else if (clb === 5) perAbility = 6;
    else perAbility = 0;
  } else {
    if (clb >= 10) perAbility = 34;
    else if (clb === 9) perAbility = 31;
    else if (clb === 8) perAbility = 23;
    else if (clb === 7) perAbility = 17;
    else if (clb === 6) perAbility = 9;
    else if (clb === 5) perAbility = 6;
    else perAbility = 0;
  }
  return perAbility * 4; // 4 abilities
}

function crsSecondLanguagePoints(clb: number, _hasSpouse: boolean): number {
  let perAbility: number;
  if (clb >= 9) perAbility = 6;
  else if (clb >= 5) perAbility = 3;
  else perAbility = 0;
  // Max 24 regardless of spouse status
  return Math.min(perAbility * 4, 24);
}

function crsCanadianWorkPoints(years: number, hasSpouse: boolean): number {
  if (hasSpouse) {
    if (years >= 5) return 70;
    if (years >= 3) return 64;
    if (years >= 1) return 35;
    return 0;
  } else {
    if (years >= 5) return 80;
    if (years >= 3) return 72;
    if (years >= 1) return 40;
    return 0;
  }
}

function crsSpouseEducation(education?: string): number {
  if (!education) return 0;
  const points: Record<string, number> = {
    'none': 0, 'secondary': 2, 'one_year_diploma': 6,
    'two_year_diploma': 7, 'three_year_diploma': 8,
    'bachelors': 8, 'masters': 10, 'phd': 10,
  };
  return points[education] ?? 0;
}

function crsSpouseLanguage(clb: number): number {
  // Per ability: CLB 9+: 5, CLB 7-8: 3, CLB 5-6: 1, CLB 4-: 0
  let perAbility: number;
  if (clb >= 9) perAbility = 5;
  else if (clb >= 7) perAbility = 3;
  else if (clb >= 5) perAbility = 1;
  else perAbility = 0;
  return perAbility * 4; // 4 abilities
}

function crsSpouseCanadianWork(years: number): number {
  if (years >= 5) return 10;
  if (years >= 3) return 10;
  if (years >= 2) return 10;
  if (years >= 1) return 5;
  return 0;
}

function crsSkillTransferability(profile: ClientProfile): {
  educationLanguage: number;
  educationCanadianWork: number;
  foreignWorkLanguage: number;
  foreignWorkCanadianWork: number;
  certificateLanguage: number;
  subtotal: number;
} {
  const clb = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
  const edu = profile.highestEducation;
  const foreignWork = profile.totalWorkExperienceYears - profile.canadianWorkExperienceYears;
  const canadianWork = profile.canadianWorkExperienceYears;

  const hasPostSecondary = !['none', 'secondary'].includes(edu);
  const hasTwoYearPlus = ['two_year_diploma', 'three_year_diploma', 'bachelors', 'masters', 'phd'].includes(edu);

  // Education + language
  let educationLanguage = 0;
  if (hasPostSecondary && clb >= 9) educationLanguage = hasTwoYearPlus ? 50 : 25;
  else if (hasPostSecondary && clb >= 7) educationLanguage = hasTwoYearPlus ? 25 : 13;

  // Education + Canadian work
  let educationCanadianWork = 0;
  if (hasPostSecondary && canadianWork >= 2) educationCanadianWork = hasTwoYearPlus ? 50 : 25;
  else if (hasPostSecondary && canadianWork >= 1) educationCanadianWork = hasTwoYearPlus ? 25 : 13;

  // Foreign work + language
  let foreignWorkLanguage = 0;
  if (foreignWork >= 3 && clb >= 9) foreignWorkLanguage = 50;
  else if (foreignWork >= 1 && clb >= 9) foreignWorkLanguage = 25;
  else if (foreignWork >= 3 && clb >= 7) foreignWorkLanguage = 25;
  else if (foreignWork >= 1 && clb >= 7) foreignWorkLanguage = 13;

  // Foreign work + Canadian work
  let foreignWorkCanadianWork = 0;
  if (foreignWork >= 3 && canadianWork >= 2) foreignWorkCanadianWork = 50;
  else if (foreignWork >= 1 && canadianWork >= 2) foreignWorkCanadianWork = 25;
  else if (foreignWork >= 3 && canadianWork >= 1) foreignWorkCanadianWork = 25;
  else if (foreignWork >= 1 && canadianWork >= 1) foreignWorkCanadianWork = 13;

  // Certificate of qualification + language (for trades)
  let certificateLanguage = 0;
  if ((profile.hasCertificateOfQualification || isTradeNOC(profile.nocTEER)) && clb >= 7) {
    certificateLanguage = clb >= 9 ? 50 : 25;
  }

  const subtotal = Math.min(
    Math.min(educationLanguage, 50) +
    Math.min(educationCanadianWork, 50) +
    Math.min(foreignWorkLanguage, 50) +
    Math.min(foreignWorkCanadianWork, 50) +
    Math.min(certificateLanguage, 50),
    100
  );

  return {
    educationLanguage,
    educationCanadianWork,
    foreignWorkLanguage,
    foreignWorkCanadianWork,
    certificateLanguage,
    subtotal,
  };
}

function crsAdditionalFactors(profile: ClientProfile): {
  provincialNomination: number;
  canadianEducation: number;
  frenchLanguageBonus: number;
  sibling: number;
  subtotal: number;
} {
  // Provincial nomination: 600 points (not calculable from profile alone)
  const provincialNomination = 0;

  // Canadian education bonus
  let canadianEducation = 0;
  if (profile.hasCanadianEducation) {
    const level = profile.canadianEducationLevel;
    if (level === 'one_year_diploma' || level === 'two_year_diploma') {
      canadianEducation = 15;
    } else if (level === 'three_year_diploma' || level === 'bachelors' || level === 'masters' || level === 'phd') {
      canadianEducation = 30;
    }
  }

  // French language bonus (updated 2024+)
  const nclc = getEffectiveFrenchNCLC(profile);
  const clb = getEffectiveEnglishCLB(profile);
  let frenchLanguageBonus = 0;
  if (nclc >= 7 && clb >= 5) {
    frenchLanguageBonus = 50; // French + English bilingual
  } else if (nclc >= 7) {
    frenchLanguageBonus = 25; // French only strong
  }

  // Sibling in Canada
  const sibling = (profile.hasRelativeInCanada && profile.relativeRelationship === 'sibling') ? 15 : 0;

  // Note: Job offer points removed March 2025
  const subtotal = provincialNomination + canadianEducation + frenchLanguageBonus + sibling;

  return { provincialNomination, canadianEducation, frenchLanguageBonus, sibling, subtotal };
}

export function calculateCRSScore(profile: ClientProfile): { total: number; breakdown: CRSBreakdown } {
  const hasSpouse = profile.hasSpouse;
  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
  const secondaryCLB = Math.min(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));

  const age = crsAgePoints(profile.age, hasSpouse);
  const education = crsEducationPoints(profile.highestEducation, hasSpouse);
  const firstLanguage = crsFirstLanguagePoints(primaryCLB, hasSpouse);
  const secondLanguage = crsSecondLanguagePoints(secondaryCLB, hasSpouse);
  const canadianWork = crsCanadianWorkPoints(profile.canadianWorkExperienceYears, hasSpouse);

  const coreSubtotal = age + education + firstLanguage + secondLanguage + canadianWork;

  // Spouse factors (0 if no spouse or spouse not accompanying)
  const spouseCLB = hasSpouse ? Math.max(profile.spouseEnglishCLB ?? 0, profile.spouseFrenchNCLC ?? 0) : 0;
  const spouseEdu = hasSpouse ? crsSpouseEducation(profile.spouseEducation) : 0;
  const spouseLang = hasSpouse ? crsSpouseLanguage(spouseCLB) : 0;
  const spouseWork = hasSpouse ? crsSpouseCanadianWork(profile.spouseCanadianWorkYears ?? 0) : 0;
  const spouseSubtotal = spouseEdu + spouseLang + spouseWork;

  const skill = crsSkillTransferability(profile);
  const additional = crsAdditionalFactors(profile);

  const total = coreSubtotal + spouseSubtotal + skill.subtotal + additional.subtotal;

  return {
    total: Math.min(total, 1200),
    breakdown: {
      coreHumanCapital: {
        age, education, firstLanguage, secondLanguage,
        canadianWorkExperience: canadianWork,
        subtotal: coreSubtotal,
      },
      spouseFactors: {
        education: spouseEdu,
        firstLanguage: spouseLang,
        canadianWorkExperience: spouseWork,
        subtotal: spouseSubtotal,
      },
      skillTransferability: skill,
      additionalFactors: additional,
      total: Math.min(total, 1200),
    },
  };
}

// ─── CALCULATEUR FSW 67 POINTS ──────────────────────────

function fswAgePoints(age: number): number {
  if (age >= 18 && age <= 35) return 12;
  if (age === 36) return 11;
  if (age === 37) return 10;
  if (age === 38) return 9;
  if (age === 39) return 8;
  if (age === 40) return 7;
  if (age === 41) return 6;
  if (age === 42) return 5;
  if (age === 43) return 4;
  if (age === 44) return 3;
  if (age === 45) return 2;
  if (age === 46) return 1;
  return 0; // 47+
}

function fswEducationPoints(education: string, hasMultipleCredentials?: boolean): number {
  // Two or more credentials, one of which is 3+ years
  if (hasMultipleCredentials && ['three_year_diploma', 'bachelors', 'masters', 'phd'].includes(education)) {
    return 22;
  }
  switch (education) {
    case 'phd': return 25;
    case 'masters': return 23;
    case 'three_year_diploma':
    case 'bachelors': return 21;
    case 'two_year_diploma': return 19;
    case 'one_year_diploma': return 15;
    case 'secondary': return 5;
    default: return 0;
  }
}

function fswFirstLanguagePoints(clb: number): number {
  // Max 24 points for first language (6 per ability x 4)
  if (clb >= 9) return 24; // 6 per ability
  if (clb === 8) return 20; // 5 per ability
  if (clb === 7) return 16; // 4 per ability
  return 0; // Below CLB 7 = not eligible
}

function fswSecondLanguagePoints(clb: number): number {
  // Max 4 points for second language
  if (clb >= 5) return 4;
  return 0;
}

function fswWorkExperiencePoints(years: number): number {
  if (years >= 6) return 15;
  if (years >= 4) return 13;
  if (years >= 2) return 11;
  if (years >= 1) return 9;
  return 0;
}

function fswArrangedEmploymentPoints(profile: ClientProfile): number {
  // LMIA-approved or LMIA-exempt job offers both qualify for FSW 67 grid
  if (profile.hasJobOffer && isSkilledNOC(profile.nocTEER)) return 10;
  return 0;
}

function fswAdaptabilityPoints(profile: ClientProfile): number {
  let points = 0;

  // Spouse/partner language (CLB 4+ in all abilities)
  if (profile.hasSpouse) {
    const spouseLang = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
    if (spouseLang >= 4) points += 5;
  }

  // Previous Canadian study
  if (profile.hasCanadianEducation) points += 5;

  // Previous Canadian work
  if (profile.canadianWorkExperienceYears >= 1) points += 10;

  // Arranged employment
  if (profile.hasJobOffer && profile.isJobOfferLMIA) points += 5;

  // Relative in Canada
  if (profile.hasRelativeInCanada) points += 5;

  return Math.min(points, 10);
}

export function calculateFSWPoints(profile: ClientProfile): { total: number; breakdown: FSWBreakdown } {
  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
  const secondaryCLB = Math.min(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));

  const age = fswAgePoints(profile.age);
  const education = fswEducationPoints(profile.highestEducation, profile.hasMultipleCredentials);
  const firstLanguage = fswFirstLanguagePoints(primaryCLB);
  const secondLanguage = fswSecondLanguagePoints(secondaryCLB);
  const workExperience = fswWorkExperiencePoints(profile.totalWorkExperienceYears);
  const arrangedEmployment = fswArrangedEmploymentPoints(profile);
  const adaptability = fswAdaptabilityPoints(profile);

  const total = age + education + firstLanguage + secondLanguage + workExperience + arrangedEmployment + adaptability;

  return {
    total,
    breakdown: {
      age, education, firstLanguage, secondLanguage,
      workExperience, arrangedEmployment, adaptability, total,
    },
  };
}

// ─── ANALYSES PAR PROGRAMME ─────────────────────────────

function analyzeStudyPermit(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 50; // Base - many criteria are external (acceptance letter, etc.)

  // Already a PR or citizen = no need
  if (profile.currentStatus === 'pr') {
    return {
      programId: 'permis-etudes',
      programName: 'Study Permit',
      programNameFr: 'Permis d\'etudes',
      category: 'temporaire',
      eligibility: 'not_eligible',
      score: 0,
      keyStrengths: [],
      missingRequirements: ['Vous etes deja resident permanent, pas besoin de permis d\'etudes.'],
      recommendations: [],
      priority: 5,
      estimatedProcessingTime: 'N/A',
      governmentFees: 0,
      notes: 'Le client est deja RP.',
    };
  }

  if (profile.settlementFunds >= 20000) {
    strengths.push('Fonds suffisants pour couvrir les frais de scolarite et de subsistance');
    score += 10;
  } else {
    missing.push('Les fonds disponibles pourraient etre insuffisants selon le programme d\'etudes choisi');
    score -= 10;
  }

  const nclc = getEffectiveFrenchNCLC(profile);
  const clb = getEffectiveEnglishCLB(profile);

  if (nclc >= 7 || clb >= 7) {
    strengths.push('Niveau de langue suffisant pour la plupart des institutions');
    score += 10;
  } else if (nclc >= 5 || clb >= 5) {
    strengths.push('Niveau de langue acceptable pour certains programmes');
    score += 5;
  } else {
    missing.push('Niveau de langue possiblement insuffisant - test officiel requis');
    score -= 10;
  }

  if (profile.age >= 18 && profile.age <= 35) {
    strengths.push('Profil d\'age ideal pour un permis d\'etudes');
    score += 5;
  }

  if (!profile.hasCriminalRecord) {
    strengths.push('Aucun antecedent judiciaire');
    score += 5;
  } else {
    missing.push('Antecedents judiciaires pourraient affecter l\'admissibilite');
    score -= 20;
  }

  missing.push('Lettre d\'acceptation d\'un etablissement d\'enseignement designe (EED) requise');
  recommendations.push('Obtenir une lettre d\'acceptation d\'un EED avant de presenter la demande');

  if (profile.isInQuebec || profile.currentCountry === 'Canada') {
    recommendations.push('Si vous etudiez au Quebec, un CAQ (Certificat d\'acceptation du Quebec) sera aussi requis');
  }

  recommendations.push('Fournir la preuve de fonds suffisants pour la premiere annee d\'etudes et les frais de subsistance');
  recommendations.push('Envisager les programmes qui menent a un permis de travail post-diplome (PTPD)');

  const eligibility = profile.hasCriminalRecord ? 'possibly_eligible' as const :
    score >= 60 ? 'likely_eligible' as const : 'possibly_eligible' as const;

  return {
    programId: 'permis-etudes',
    programName: 'Study Permit',
    programNameFr: 'Permis d\'etudes',
    category: 'temporaire',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: 4,
    estimatedProcessingTime: '4-16 semaines',
    governmentFees: 150,
    notes: 'L\'admissibilite depend principalement de la lettre d\'acceptation et de la preuve de fonds.',
  };
}

function analyzeWorkPermit(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 30;

  if (profile.currentStatus === 'pr') {
    return {
      programId: 'permis-travail',
      programName: 'Work Permit',
      programNameFr: 'Permis de travail',
      category: 'temporaire',
      eligibility: 'not_eligible',
      score: 0,
      keyStrengths: [],
      missingRequirements: ['Vous etes deja resident permanent, pas besoin de permis de travail.'],
      recommendations: [],
      priority: 5,
      estimatedProcessingTime: 'N/A',
      governmentFees: 0,
      notes: 'Le client est deja RP.',
    };
  }

  const nclc = getEffectiveFrenchNCLC(profile);

  // LMIA-based
  if (profile.hasJobOffer && profile.isJobOfferLMIA) {
    strengths.push('Offre d\'emploi avec EIMT approuvee - voie principale');
    score += 30;
  } else if (profile.hasJobOffer) {
    strengths.push('Offre d\'emploi existante');
    score += 15;
    recommendations.push('Verifier si l\'employeur peut obtenir une EIMT ou si une exemption s\'applique');
  }

  // Mobilite francophone
  if (nclc >= 5 && profile.jobOfferProvince && profile.jobOfferProvince !== 'QC') {
    strengths.push('Admissible a la Mobilite francophone (NCLC 5+ et emploi hors Quebec)');
    score += 25;
    recommendations.push('La Mobilite francophone offre un permis de travail dispense d\'EIMT - voie privilegiee');
  } else if (nclc >= 5 && !profile.isInQuebec) {
    recommendations.push('Avec votre niveau de francais, explorez la Mobilite francophone pour un emploi hors Quebec');
  }

  // PGWP potential
  if (profile.currentStatus === 'student' && profile.hasCanadianEducation) {
    strengths.push('En tant qu\'etudiant avec diplome canadien, admissible au PTPD (permis de travail post-diplome)');
    score += 20;
  }

  // Spouse open work permit
  if (profile.currentStatus === 'worker' || profile.currentStatus === 'student') {
    recommendations.push('Votre conjoint(e) pourrait etre admissible a un permis de travail ouvert');
  }

  if (profile.totalWorkExperienceYears >= 2) {
    strengths.push(`${profile.totalWorkExperienceYears} ans d'experience de travail`);
    score += 5;
  }

  if (!profile.hasJobOffer) {
    missing.push('Aucune offre d\'emploi - necessaire pour la plupart des permis de travail fermes');
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires pourraient empecher l\'obtention du permis');
    score -= 20;
  }

  const eligibility = score >= 60 ? 'likely_eligible' as const :
    score >= 40 ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'permis-travail',
    programName: 'Work Permit',
    programNameFr: 'Permis de travail',
    category: 'temporaire',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: score >= 50 ? 2 : 4,
    estimatedProcessingTime: '2-12 semaines',
    governmentFees: 155,
    notes: 'Plusieurs voies possibles selon la situation : EIMT, Mobilite francophone, PTPD, permis ouvert.',
  };
}

function analyzePEQ(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  const nclc = getEffectiveFrenchNCLC(profile);

  // PEQ ended November 2025
  if (profile.isInQuebec && nclc >= 7 && (profile.quebecWorkExperienceYears >= 1 || profile.hasCanadianEducation)) {
    strengths.push('Aurait ete admissible au PEQ - verifier si une demande est en traitement');
    score = 40;
  }

  if (profile.isInQuebec && profile.quebecWorkExperienceYears >= 1) {
    strengths.push('Experience de travail au Quebec reconnue');
  }
  if (nclc >= 7) {
    strengths.push('Niveau de francais oral B2+ (NCLC 7+)');
  }

  missing.push('Le PEQ a pris fin en novembre 2025');
  recommendations.push('Presenter plutot une demande via le PSTQ (Arrima) qui a remplace le PEQ');
  recommendations.push('Si vous aviez une demande PEQ en cours avant novembre 2025, verifier son statut');

  return {
    programId: 'peq',
    programName: 'Quebec Experience Program (PEQ)',
    programNameFr: 'Programme de l\'experience quebecoise (PEQ)',
    category: 'quebec',
    eligibility: 'ended',
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: 5,
    estimatedProcessingTime: 'Programme termine',
    governmentFees: 0,
    notes: 'Le PEQ a ete remplace par le PSTQ via le portail Arrima en novembre 2025. Verifier si des demandes anterieures sont toujours en traitement.',
  };
}

function analyzePSTQ(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 30;

  const nclc = getEffectiveFrenchNCLC(profile);

  if (profile.age < 18) {
    return {
      programId: 'pstq-arrima',
      programName: 'Quebec Skilled Worker (PSTQ/Arrima)',
      programNameFr: 'Programme de selection des travailleurs qualifies (PSTQ/Arrima)',
      category: 'quebec',
      eligibility: 'not_eligible',
      score: 0,
      keyStrengths: [],
      missingRequirements: ['Doit avoir 18 ans ou plus'],
      recommendations: [],
      priority: 5,
      estimatedProcessingTime: 'N/A',
      governmentFees: 0,
      notes: 'Age minimum non atteint.',
    };
  }

  // French level - critical for Quebec
  if (nclc >= 10) {
    strengths.push('Excellent niveau de francais (NCLC 10+) - avantage majeur pour Arrima');
    score += 20;
  } else if (nclc >= 7) {
    strengths.push('Bon niveau de francais (NCLC 7-9) - repond aux exigences');
    score += 15;
  } else if (nclc >= 5) {
    strengths.push('Niveau de francais intermediaire (NCLC 5-6)');
    score += 5;
  } else {
    missing.push('Niveau de francais insuffisant - le PSTQ favorise fortement les francophones');
    score -= 15;
  }

  // Education
  if (['masters', 'phd'].includes(profile.highestEducation)) {
    strengths.push('Niveau d\'education eleve (maitrise/doctorat) - excellent pointage');
    score += 15;
  } else if (['bachelors', 'three_year_diploma'].includes(profile.highestEducation)) {
    strengths.push('Diplome postsecondaire de 3 ans ou plus');
    score += 10;
  } else if (['two_year_diploma', 'one_year_diploma'].includes(profile.highestEducation)) {
    strengths.push('Diplome postsecondaire');
    score += 5;
  } else {
    missing.push('Niveau d\'education faible pour le pointage Arrima');
  }

  // Work experience
  if (profile.totalWorkExperienceYears >= 4) {
    strengths.push(`${profile.totalWorkExperienceYears} ans d'experience de travail - excellent`);
    score += 10;
  } else if (profile.totalWorkExperienceYears >= 2) {
    strengths.push(`${profile.totalWorkExperienceYears} ans d'experience de travail`);
    score += 5;
  } else {
    missing.push('Experience de travail limitee');
  }

  // Quebec bonuses
  if (profile.isInQuebec) {
    strengths.push('Actuellement au Quebec - bonus significatif dans le pointage Arrima');
    score += 10;
  }
  if (profile.quebecWorkExperienceYears >= 1) {
    strengths.push('Experience de travail au Quebec - facteur favorable');
    score += 10;
  }
  if (profile.hasCanadianEducation && profile.canadianEducationProvince === 'QC') {
    strengths.push('Diplome obtenu au Quebec - avantage important');
    score += 10;
  }

  // Age
  if (profile.age >= 18 && profile.age <= 35) {
    strengths.push('Tranche d\'age optimale (18-35 ans)');
    score += 5;
  } else if (profile.age <= 43) {
    // Still okay but fewer points
  } else {
    missing.push('Age au-dela de la tranche optimale pour le pointage');
    score -= 5;
  }

  // Job offer in Quebec
  if (profile.hasJobOffer && profile.jobOfferProvince === 'QC') {
    strengths.push('Offre d\'emploi valide au Quebec');
    score += 10;
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires - impact negatif sur l\'admissibilite');
    score -= 20;
  }

  if (!profile.hasECA && !profile.hasCanadianEducation) {
    missing.push('Evaluation comparative des diplomes requise (ECA du WES ou equivalents)');
    recommendations.push('Obtenir une evaluation comparative des etudes etrangeres du MIFI ou organisme reconnu');
  }

  recommendations.push('Creer un profil sur le portail Arrima et attendre une invitation');
  if (nclc < 7) {
    recommendations.push('Ameliorer votre niveau de francais avant de soumettre - c\'est le facteur le plus important');
  }
  recommendations.push('Les invitations sont emises par bassins selon la categorie FEER de votre profession');

  const eligibility = score >= 70 ? 'eligible' as const :
    score >= 50 ? 'likely_eligible' as const :
    score >= 30 ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'pstq-arrima',
    programName: 'Quebec Skilled Worker (PSTQ/Arrima)',
    programNameFr: 'Programme de selection des travailleurs qualifies (PSTQ/Arrima)',
    category: 'quebec',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: eligibility === 'eligible' ? 1 : eligibility === 'likely_eligible' ? 2 : 3,
    estimatedProcessingTime: '12-18 mois (CSQ + demande RP federale)',
    governmentFees: 1365,
    notes: 'Le PSTQ via Arrima est la voie principale pour l\'immigration permanente au Quebec. Le pointage depend fortement du francais et du profil professionnel.',
  };
}

function analyzeFSW(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];

  const fswResult = calculateFSWPoints(profile);
  const crsResult = calculateCRSScore(profile);
  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));

  let score = 30;

  // Minimum requirements check
  const meetsMinCLB = primaryCLB >= 7;
  const meetsMinExperience = profile.totalWorkExperienceYears >= 1 && isSkilledNOC(profile.nocTEER);
  const meetsFSWGrid = fswResult.total >= 67;
  const meetsSettlement = profile.settlementFunds >= getRequiredSettlementFunds(getFamilySize(profile)) || profile.hasJobOffer;
  const hasECAorCanadian = profile.hasECA || profile.hasCanadianEducation;

  if (meetsMinCLB) {
    strengths.push(`Niveau linguistique suffisant (CLB/NCLC ${primaryCLB}) - minimum CLB 7 requis`);
    score += 10;
  } else {
    missing.push(`Niveau linguistique insuffisant (CLB/NCLC ${primaryCLB}) - minimum CLB 7 requis`);
    score -= 15;
  }

  if (meetsMinExperience) {
    strengths.push(`Experience de travail qualifiee de ${profile.totalWorkExperienceYears} an(s) dans une profession NOC TEER 0-3`);
    score += 10;
  } else if (profile.totalWorkExperienceYears >= 1) {
    missing.push('L\'experience de travail doit etre dans une profession NOC TEER 0, 1, 2 ou 3');
  } else {
    missing.push('Minimum 1 an d\'experience de travail continue dans une profession qualifiee requis');
    score -= 15;
  }

  if (meetsFSWGrid) {
    strengths.push(`Score grille FSW : ${fswResult.total}/100 (minimum 67 requis) - ATTEINT`);
    score += 20;
  } else {
    missing.push(`Score grille FSW : ${fswResult.total}/100 (minimum 67 requis) - NON ATTEINT`);
    score -= 10;
  }

  if (meetsSettlement) {
    strengths.push('Fonds d\'etablissement suffisants');
    score += 5;
  } else {
    const required = getRequiredSettlementFunds(getFamilySize(profile));
    missing.push(`Fonds d'etablissement insuffisants : ${profile.settlementFunds} CAD disponibles, ${required} CAD requis`);
  }

  if (hasECAorCanadian) {
    strengths.push('Evaluation des diplomes completee');
    score += 5;
  } else {
    missing.push('Evaluation des titres de competences etrangers (ECA) requise pour les diplomes obtenus a l\'etranger');
    recommendations.push('Obtenir une ECA aupres du WES ou autre organisme designe');
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires - pourrait entrainer l\'interdiction de territoire');
    score -= 20;
  }

  // CRS estimate
  score += Math.min(20, Math.floor(crsResult.total / 25));

  recommendations.push(`Score CRS estime : ${crsResult.total} - les tirages recents se situent entre 470 et 530`);
  if (crsResult.total < 470) {
    recommendations.push('Votre score CRS est sous le seuil recent - envisagez d\'ameliorer votre profil');
    recommendations.push('Pistes d\'amelioration : test de langue (meilleur score), diplome canadien, experience de travail canadienne');
  }

  const isEligible = meetsMinCLB && meetsMinExperience && meetsFSWGrid && !profile.hasCriminalRecord;
  const eligibility = isEligible ? (crsResult.total >= 470 ? 'eligible' as const : 'likely_eligible' as const) :
    (fswResult.total >= 60 && primaryCLB >= 6) ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'ee-fsw',
    programName: 'Express Entry - Federal Skilled Worker (FSW)',
    programNameFr: 'Entree express - Travailleurs qualifies (federal)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    estimatedCRSScore: crsResult.total,
    estimatedFSWPoints: fswResult.total,
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: isEligible ? 1 : 3,
    estimatedProcessingTime: '6 mois',
    governmentFees: 1365,
    notes: `Grille FSW : ${fswResult.total}/100. Score CRS estime : ${crsResult.total}. Les points pour les offres d'emploi ont ete retires en mars 2025.`,
  };
}

function analyzeCEC(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 30;

  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
  const crsResult = calculateCRSScore(profile);

  const hasSkilledCanadianWork = profile.canadianWorkExperienceYears >= 1 && isSkilledNOC(profile.nocTEER);

  // Language requirements differ by TEER
  let meetsLanguage = false;
  if (profile.nocTEER !== undefined && profile.nocTEER <= 1) {
    meetsLanguage = primaryCLB >= 7;
    if (meetsLanguage) {
      strengths.push(`Niveau linguistique suffisant (CLB ${primaryCLB}) pour TEER 0/1 (minimum CLB 7)`);
    } else {
      missing.push(`Niveau linguistique insuffisant (CLB ${primaryCLB}) pour TEER 0/1 - minimum CLB 7 requis`);
    }
  } else if (profile.nocTEER !== undefined && profile.nocTEER <= 3) {
    meetsLanguage = primaryCLB >= 5;
    if (meetsLanguage) {
      strengths.push(`Niveau linguistique suffisant (CLB ${primaryCLB}) pour TEER 2/3 (minimum CLB 5)`);
    } else {
      missing.push(`Niveau linguistique insuffisant (CLB ${primaryCLB}) pour TEER 2/3 - minimum CLB 5 requis`);
    }
  } else {
    meetsLanguage = primaryCLB >= 7;
    if (!meetsLanguage) {
      missing.push('Niveau linguistique insuffisant - minimum CLB 7 (TEER 0/1) ou CLB 5 (TEER 2/3)');
    }
  }

  if (hasSkilledCanadianWork) {
    strengths.push(`${profile.canadianWorkExperienceYears} an(s) d'experience de travail qualifiee au Canada`);
    score += 25;
  } else if (profile.canadianWorkExperienceYears > 0) {
    missing.push('L\'experience canadienne doit etre dans une profession NOC TEER 0, 1, 2 ou 3');
    score -= 5;
  } else {
    missing.push('Aucune experience de travail canadienne qualifiee - minimum 1 an requis');
    score -= 20;
  }

  if (meetsLanguage) score += 15;
  else score -= 15;

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires - pourrait entrainer l\'interdiction de territoire');
    score -= 20;
  }

  // CRS bonus
  score += Math.min(20, Math.floor(crsResult.total / 25));

  // No education or settlement requirement for CEC
  strengths.push('Aucune exigence d\'education minimale pour la CEC');
  strengths.push('Aucune preuve de fonds d\'etablissement requise pour la CEC');

  recommendations.push(`Score CRS estime : ${crsResult.total}`);
  if (crsResult.total < 470) {
    recommendations.push('Ameliorer le score CRS : test de langue, experience supplementaire au Canada');
  }

  const isEligible = hasSkilledCanadianWork && meetsLanguage && !profile.hasCriminalRecord;
  const eligibility = isEligible ? (crsResult.total >= 470 ? 'eligible' as const : 'likely_eligible' as const) :
    (profile.canadianWorkExperienceYears > 0 && primaryCLB >= 5) ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'ee-cec',
    programName: 'Express Entry - Canadian Experience Class (CEC)',
    programNameFr: 'Entree express - Categorie de l\'experience canadienne (CEC)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    estimatedCRSScore: crsResult.total,
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: isEligible ? 1 : 4,
    estimatedProcessingTime: '6 mois',
    governmentFees: 1365,
    notes: `Score CRS estime : ${crsResult.total}. La CEC est ideale pour ceux ayant de l'experience de travail qualifiee au Canada.`,
  };
}

function analyzeFST(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 20;

  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));
  const crsResult = calculateCRSScore(profile);

  // CLB requirements for FST: CLB 5 speaking/listening, CLB 4 reading/writing
  // Simplified: use overall CLB >= 5 (speaking/listening) with CLB >= 4 as a general check
  const meetsLanguage = primaryCLB >= 5;

  // 2 years in skilled trade
  const hasTradeExperience = profile.totalWorkExperienceYears >= 2 && isTradeNOC(profile.nocTEER);

  // Job offer or provincial certificate
  const hasJobOfferOrCert = profile.hasJobOffer;

  if (hasTradeExperience) {
    strengths.push(`${profile.totalWorkExperienceYears} ans d'experience dans un metier specialise`);
    score += 25;
  } else if (profile.totalWorkExperienceYears >= 2) {
    missing.push('L\'experience doit etre dans un metier specialise reconnu (NOC TEER 2/3)');
  } else {
    missing.push('Minimum 2 ans d\'experience dans un metier specialise requis');
    score -= 10;
  }

  if (meetsLanguage) {
    strengths.push(`Niveau linguistique suffisant (CLB ${primaryCLB}) - minimum CLB 5 oral, CLB 4 ecrit`);
    score += 15;
  } else {
    missing.push('Niveau linguistique insuffisant - minimum CLB 5 expression/comprehension orale, CLB 4 lecture/ecriture');
    score -= 10;
  }

  if (hasJobOfferOrCert) {
    strengths.push('Offre d\'emploi dans un metier specialise');
    score += 20;
  } else {
    missing.push('Offre d\'emploi a temps plein OU certificat de qualification provincial/territorial requis');
    recommendations.push('Obtenir une offre d\'emploi ou un certificat de qualification de la province/territoire');
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires problematiques');
    score -= 20;
  }

  const isEligible = hasTradeExperience && meetsLanguage && hasJobOfferOrCert && !profile.hasCriminalRecord;
  const eligibility = isEligible ? 'eligible' as const :
    (hasTradeExperience && meetsLanguage) ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'ee-fst',
    programName: 'Express Entry - Federal Skilled Trades (FST)',
    programNameFr: 'Entree express - Travailleurs de metiers specialises (FST)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    estimatedCRSScore: crsResult.total,
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: isEligible ? 1 : 4,
    estimatedProcessingTime: '6 mois',
    governmentFees: 1365,
    notes: `Score CRS estime : ${crsResult.total}. Le programme FST cible les gens de metier avec experience et qualification.`,
  };
}

function analyzeFamilySponsorship(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 20;

  // Can be sponsored?
  const canBeSponsored = profile.hasSpouseInCanada || profile.hasRelativeInCanada;

  if (profile.hasSpouseInCanada) {
    strengths.push('Conjoint(e) au Canada - voie de parrainage conjugal possible');
    score += 40;
    recommendations.push('Le parrain doit etre citoyen canadien ou resident permanent');
    recommendations.push('Le parrain doit demontrer qu\'il ne recoit pas d\'aide sociale (sauf invalidite)');
  }

  if (profile.hasRelativeInCanada) {
    const rel = profile.relativeRelationship || 'famille';
    if (['spouse', 'partner', 'parent', 'child'].includes(rel)) {
      strengths.push(`Lien familial direct au Canada (${rel})`);
      score += 30;
    } else {
      strengths.push(`Membre de la famille au Canada (${rel})`);
      score += 10;
      recommendations.push('Seuls les conjoints, enfants a charge, parents et grands-parents sont admissibles au parrainage');
    }
  }

  if (!canBeSponsored) {
    missing.push('Aucun lien familial au Canada identifie pour le parrainage');
    score = 5;
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires pourraient affecter l\'admissibilite');
    score -= 10;
  }

  if (profile.hasMedicalIssue) {
    missing.push('Problemes medicaux pourraient necessiter un examen supplementaire');
    recommendations.push('Un examen medical d\'immigration sera requis');
  }

  recommendations.push('Le parrain doit s\'engager a subvenir aux besoins du parraine pendant 3 a 20 ans selon la categorie');

  const eligibility = profile.hasSpouseInCanada ? 'likely_eligible' as const :
    canBeSponsored ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'parrainage-famille',
    programName: 'Family Sponsorship',
    programNameFr: 'Parrainage familial (conjoint/famille)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: profile.hasSpouseInCanada ? 1 : canBeSponsored ? 3 : 5,
    estimatedProcessingTime: '12 mois (conjoint), 24+ mois (parents)',
    governmentFees: 1135,
    notes: 'Le parrainage familial est une voie importante si un membre de la famille est citoyen canadien ou RP.',
  };
}

function analyzeRefugee(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 10;

  if (profile.isRefugee) {
    strengths.push('Le client se declare refugie ou demandeur d\'asile');
    score += 40;

    if (profile.isInCanada) {
      strengths.push('Presentement au Canada - demande d\'asile interieure possible');
      score += 15;
    } else {
      recommendations.push('La demande d\'asile peut se faire au point d\'entree ou depuis l\'interieur du Canada');
    }

    recommendations.push('Consulter un avocat specialise en droit des refugies le plus tot possible');
    recommendations.push('La Commission de l\'immigration et du statut de refugie (CISR) evaluera la demande');
    recommendations.push('Preparer toute preuve documentaire de la persecution subie ou crainte');
  } else {
    missing.push('Le client ne s\'identifie pas comme refugie ou demandeur d\'asile');
    score = 5;
  }

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires graves pourraient exclure de la protection');
    score -= 15;
  }

  const eligibility = profile.isRefugee ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'demande-asile',
    programName: 'Refugee/Asylum Claim',
    programNameFr: 'Demande d\'asile / Protection des refugies',
    category: 'refugie',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: profile.isRefugee ? 1 : 5,
    estimatedProcessingTime: '12-24 mois',
    governmentFees: 0,
    notes: 'La demande d\'asile est un processus juridique complexe qui necessite l\'accompagnement d\'un avocat. Aucune garantie de resultat.',
  };
}

function analyzeCitizenship(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 10;

  const isPR = profile.currentStatus === 'pr';
  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));

  if (!isPR) {
    return {
      programId: 'citoyennete',
      programName: 'Canadian Citizenship',
      programNameFr: 'Citoyennete canadienne',
      category: 'citoyennete',
      eligibility: 'not_eligible',
      score: 0,
      keyStrengths: [],
      missingRequirements: ['Doit d\'abord etre resident permanent du Canada'],
      recommendations: ['Obtenir la residence permanente par l\'une des voies disponibles avant de demander la citoyennete'],
      priority: 5,
      estimatedProcessingTime: 'N/A',
      governmentFees: 0,
      notes: 'La citoyennete requiert d\'abord le statut de RP.',
    };
  }

  strengths.push('Statut de resident permanent confirme');
  score += 20;

  // Physical presence: 1095 days in last 5 years
  const estimatedDaysInCanada = profile.yearsInCanada * 365;
  if (estimatedDaysInCanada >= 1095) {
    strengths.push(`Presence physique estimee suffisante (${Math.round(estimatedDaysInCanada)} jours, 1095 requis)`);
    score += 25;
  } else {
    const daysNeeded = 1095 - estimatedDaysInCanada;
    missing.push(`Presence physique insuffisante : environ ${Math.round(estimatedDaysInCanada)} jours (1095 requis, encore ~${Math.round(daysNeeded)} jours)`);
    score -= 10;
  }

  // Language requirement (ages 18-54)
  if (profile.age >= 18 && profile.age <= 54) {
    if (primaryCLB >= 4) {
      strengths.push(`Niveau linguistique suffisant (CLB ${primaryCLB}) pour la citoyennete (CLB 4 minimum)`);
      score += 15;
    } else {
      missing.push('Niveau linguistique insuffisant - CLB 4 minimum requis pour les personnes de 18 a 54 ans');
      score -= 10;
    }
  } else {
    strengths.push('Aucune exigence linguistique pour votre tranche d\'age');
    score += 10;
  }

  // Criminal record
  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires - certaines condamnations interdisent la citoyennete');
    score -= 20;
  } else {
    strengths.push('Aucun antecedent judiciaire');
    score += 5;
  }

  recommendations.push('S\'assurer d\'avoir produit les declarations de revenus pour au moins 3 des 5 dernieres annees');
  recommendations.push('Preparer la preuve de presence physique au Canada (voyages, emploi, etc.)');

  if (estimatedDaysInCanada >= 1095) {
    recommendations.push('Vous semblez remplir les conditions - envisagez de presenter une demande');
  }

  const isEligible = isPR && estimatedDaysInCanada >= 1095 && primaryCLB >= 4 && !profile.hasCriminalRecord;
  const eligibility = isEligible ? 'eligible' as const :
    (isPR && estimatedDaysInCanada >= 800) ? 'likely_eligible' as const :
    isPR ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'citoyennete',
    programName: 'Canadian Citizenship',
    programNameFr: 'Citoyennete canadienne',
    category: 'citoyennete',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: isEligible ? 1 : 3,
    estimatedProcessingTime: '12-18 mois',
    governmentFees: 630,
    notes: 'La citoyennete est l\'aboutissement du parcours migratoire. Exige la RP, la presence physique, et le respect de la loi.',
  };
}

function analyzeStartUpVisa(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 15;

  const primaryCLB = Math.max(getEffectiveEnglishCLB(profile), getEffectiveFrenchNCLC(profile));

  if (profile.hasBusinessExperience) {
    strengths.push('Experience en affaires - atout important pour le programme Start-up');
    score += 20;
  } else {
    missing.push('Aucune experience entrepreneuriale declaree');
  }

  if (primaryCLB >= 5) {
    strengths.push(`Niveau linguistique suffisant (CLB ${primaryCLB}) - CLB 5 minimum requis`);
    score += 10;
  } else {
    missing.push('Niveau linguistique insuffisant - CLB 5 minimum requis');
    score -= 10;
  }

  if (profile.settlementFunds >= 20000) {
    strengths.push('Fonds disponibles pour l\'etablissement et le projet d\'affaires');
    score += 10;
  } else {
    missing.push('Les fonds pourraient etre insuffisants pour ce programme');
  }

  if (profile.businessNetWorth && profile.businessNetWorth >= 100000) {
    strengths.push(`Valeur nette d'affaires de ${profile.businessNetWorth} CAD`);
    score += 15;
  }

  missing.push('Lettre de soutien d\'un organisme designe (incubateur, fonds de capital-risque ou investisseur providentiel) requise');
  recommendations.push('Obtenir une lettre de soutien d\'un organisme designe avant de presenter la demande');
  recommendations.push('Le projet d\'entreprise doit etre innovant et avoir un potentiel de creation d\'emplois');
  recommendations.push('Possibilite de presenter une demande avec jusqu\'a 5 cofondateurs');

  if (profile.hasCriminalRecord) {
    missing.push('Antecedents judiciaires problematiques');
    score -= 15;
  }

  const eligibility = (profile.hasBusinessExperience && primaryCLB >= 5) ? 'possibly_eligible' as const :
    primaryCLB >= 5 ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'start-up-visa',
    programName: 'Start-Up Visa Program',
    programNameFr: 'Programme de visa pour demarrage d\'entreprise (Start-up)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: profile.hasBusinessExperience ? 3 : 5,
    estimatedProcessingTime: '12-16 mois',
    governmentFees: 1575,
    notes: 'Le programme Start-up vise les entrepreneurs avec un projet d\'affaires innovant soutenu par un organisme designe.',
  };
}

function analyzeHumanitarianAndCompassionate(profile: ClientProfile): ProgramEligibility {
  const strengths: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let score = 15;

  // H&C is highly discretionary
  if (profile.isInCanada) {
    strengths.push('Presentement au Canada - facteur important pour une demande H&C');
    score += 15;
  } else {
    missing.push('Les demandes H&C depuis l\'exterieur sont tres rarement acceptees');
    score -= 10;
  }

  if (profile.yearsInCanada >= 5) {
    strengths.push(`${profile.yearsInCanada} ans d'etablissement au Canada - solide facteur favorable`);
    score += 20;
  } else if (profile.yearsInCanada >= 2) {
    strengths.push(`${profile.yearsInCanada} ans au Canada - etablissement a demontrer`);
    score += 10;
  }

  if (profile.numberOfDependents > 0) {
    strengths.push(`${profile.numberOfDependents} personne(s) a charge - l'interet superieur de l'enfant sera considere`);
    score += 10;
  }

  if (profile.canadianWorkExperienceYears >= 1) {
    strengths.push('Experience de travail au Canada - preuve d\'etablissement');
    score += 5;
  }

  if (profile.hasCanadianEducation) {
    strengths.push('Education au Canada - preuve d\'integration');
    score += 5;
  }

  if (profile.hasRelativeInCanada) {
    strengths.push('Liens familiaux au Canada');
    score += 5;
  }

  recommendations.push('La demande H&C est discretionnaire - il n\'y a pas de criteres fixes');
  recommendations.push('Documenter en detail les difficultes en cas de renvoi dans le pays d\'origine');
  recommendations.push('Demontrer l\'etablissement au Canada : emploi, communaute, liens familiaux');
  if (profile.numberOfDependents > 0) {
    recommendations.push('Fournir une evaluation detaillee de l\'interet superieur des enfants');
  }
  recommendations.push('Consulter un avocat specialise - le taux d\'acceptation est faible');

  const eligibility = (profile.isInCanada && profile.yearsInCanada >= 2) ? 'possibly_eligible' as const :
    profile.isInCanada ? 'possibly_eligible' as const : 'not_eligible' as const;

  return {
    programId: 'h-and-c',
    programName: 'Humanitarian & Compassionate (H&C)',
    programNameFr: 'Residence permanente - Considerations humanitaires (H&C)',
    category: 'permanent',
    eligibility,
    score: Math.max(0, Math.min(score, 100)),
    keyStrengths: strengths,
    missingRequirements: missing,
    recommendations,
    priority: 4,
    estimatedProcessingTime: '24-42 mois',
    governmentFees: 1085,
    notes: 'La demande H&C est une voie discretionnaire sans garantie de resultat. Generalement un dernier recours apres epuisement des autres options.',
  };
}

// ─── GENERATION DU RESUME ───────────────────────────────

function generateOverallSummary(programs: ProgramEligibility[], profile: ClientProfile): string {
  const eligible = programs.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
  const possible = programs.filter(p => p.eligibility === 'possibly_eligible');

  let summary = '';

  if (eligible.length > 0) {
    summary += `Le client presente un profil favorable pour ${eligible.length} programme(s) d'immigration : `;
    summary += eligible.map(p => p.programNameFr).join(', ') + '. ';
  }

  if (possible.length > 0 && eligible.length === 0) {
    summary += `Le client pourrait etre admissible a ${possible.length} programme(s), mais des ameliorations au profil sont recommandees. `;
  }

  if (eligible.length === 0 && possible.length === 0) {
    summary += 'Le profil actuel du client ne correspond pas directement aux criteres des programmes principaux. ';
    summary += 'Des ameliorations sont necessaires, notamment au niveau linguistique et de l\'experience de travail. ';
  }

  // Language commentary
  const nclc = getEffectiveFrenchNCLC(profile);
  const clb = getEffectiveEnglishCLB(profile);
  if (nclc >= 7) {
    summary += 'Le niveau de francais est un atout majeur, surtout pour les voies quebecoises et la Mobilite francophone. ';
  } else if (nclc < 5 && clb < 7) {
    summary += 'L\'amelioration du niveau linguistique (francais ou anglais) est la priorite numero un pour ameliorer l\'admissibilite. ';
  }

  return summary.trim();
}

function generateTopRecommendation(programs: ProgramEligibility[], profile: ClientProfile): string {
  const sorted = [...programs]
    .filter(p => p.eligibility !== 'ended' && p.eligibility !== 'not_eligible')
    .sort((a, b) => a.priority - b.priority || b.score - a.score);

  if (sorted.length === 0) {
    return 'Aucun programme n\'est actuellement accessible avec le profil actuel. Nous recommandons de : ' +
      '(1) passer un test de langue officiel (TEF/TCF pour le francais, IELTS/CELPIP pour l\'anglais), ' +
      '(2) obtenir une evaluation des diplomes etrangers (ECA), et ' +
      '(3) accumuler de l\'experience de travail qualifiee. ' +
      'Un conseiller en immigration peut vous accompagner pour elaborer un plan personnalise.';
  }

  const top = sorted[0];
  let rec = `Notre recommandation principale est le programme "${top.programNameFr}". `;

  if (top.keyStrengths.length > 0) {
    rec += `Vos points forts incluent : ${top.keyStrengths.slice(0, 3).join('; ')}. `;
  }

  if (top.missingRequirements.length > 0) {
    rec += `Cependant, les elements manquants sont : ${top.missingRequirements.slice(0, 2).join('; ')}. `;
  }

  if (top.estimatedCRSScore) {
    rec += `Votre score CRS estime est de ${top.estimatedCRSScore} points. `;
  }

  if (sorted.length > 1) {
    rec += `En alternative, vous pourriez aussi considerer : ${sorted.slice(1, 3).map(p => p.programNameFr).join(' ou ')}. `;
  }

  rec += 'Nous vous invitons a prendre rendez-vous avec un conseiller pour une analyse approfondie de votre dossier.';

  return rec;
}

// ─── FONCTION PRINCIPALE ────────────────────────────────

export function analyzeEligibility(profile: ClientProfile, clientName?: string): EligibilityAnalysis {
  const programs: ProgramEligibility[] = [
    analyzeStudyPermit(profile),
    analyzeWorkPermit(profile),
    analyzePEQ(profile),
    analyzePSTQ(profile),
    analyzeFSW(profile),
    analyzeCEC(profile),
    analyzeFST(profile),
    analyzeFamilySponsorship(profile),
    analyzeRefugee(profile),
    analyzeCitizenship(profile),
    analyzeStartUpVisa(profile),
    analyzeHumanitarianAndCompassionate(profile),
  ];

  // Sort: eligible first, then by priority, then by score
  const eligibilityOrder: Record<string, number> = {
    'eligible': 0,
    'likely_eligible': 1,
    'possibly_eligible': 2,
    'not_eligible': 3,
    'ended': 4,
  };

  programs.sort((a, b) => {
    const eligDiff = (eligibilityOrder[a.eligibility] ?? 4) - (eligibilityOrder[b.eligibility] ?? 4);
    if (eligDiff !== 0) return eligDiff;
    const prioDiff = a.priority - b.priority;
    if (prioDiff !== 0) return prioDiff;
    return b.score - a.score;
  });

  // Reassign priorities based on final sort
  programs.forEach((p, i) => {
    if (p.eligibility === 'eligible' || p.eligibility === 'likely_eligible') {
      p.priority = Math.min(i + 1, 2);
    } else if (p.eligibility === 'possibly_eligible') {
      p.priority = 3;
    } else {
      p.priority = p.eligibility === 'ended' ? 5 : 4;
    }
  });

  const crsResult = calculateCRSScore(profile);
  const fswResult = calculateFSWPoints(profile);

  return {
    clientName: clientName || 'Client',
    analysisDate: new Date().toISOString().split('T')[0],
    overallSummary: generateOverallSummary(programs, profile),
    programs,
    topRecommendation: generateTopRecommendation(programs, profile),
    crsEstimate: crsResult.total,
    fswPointsEstimate: fswResult.total,
  };
}
