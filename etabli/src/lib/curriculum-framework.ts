"use client";
import { createContext, useContext } from "react";

// ─── CEFR/NCLC CURRICULUM FRAMEWORK ───
// Based on: CEFR (Council of Europe), CLB/NCLC (Canada),
// Communicative Language Teaching (CLT), Task-Based Language Teaching (TBLT),
// Krashen's Input Hypothesis, Swain's Output Hypothesis,
// Leitner Spaced Repetition System, Bloom's Taxonomy

// ─── CEFR CAN-DO SELF-ASSESSMENT ───
// Official CEFR descriptors adapted for Québec settlement context

export interface CanDoStatement {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  skill: "CO" | "CE" | "EO" | "EE";
  descFr: string;
  descEn: string;
  immigrationContext: string; // How it applies to immigration
}

export const CAN_DO_STATEMENTS: CanDoStatement[] = [
  // A1 — Découverte
  { id: "cd-a1-co-1", level: "A1", skill: "CO", descFr: "Je peux comprendre des mots familiers et des expressions tres courantes.", descEn: "I can understand familiar words and very basic phrases.", immigrationContext: "Comprendre les annonces simples dans le metro" },
  { id: "cd-a1-co-2", level: "A1", skill: "CO", descFr: "Je peux comprendre des consignes simples (allez tout droit, signez ici).", descEn: "I can understand simple directions (go straight, sign here).", immigrationContext: "Suivre des instructions a Service Canada" },
  { id: "cd-a1-ce-1", level: "A1", skill: "CE", descFr: "Je peux comprendre des noms familiers, des mots et des phrases simples.", descEn: "I can understand familiar names, words and simple sentences.", immigrationContext: "Lire un formulaire d'identite simple" },
  { id: "cd-a1-ce-2", level: "A1", skill: "CE", descFr: "Je peux lire des panneaux, des affiches et des catalogues simples.", descEn: "I can read simple notices, posters and catalogues.", immigrationContext: "Lire les panneaux dans un CLSC" },
  { id: "cd-a1-eo-1", level: "A1", skill: "EO", descFr: "Je peux me presenter et presenter quelqu'un.", descEn: "I can introduce myself and others.", immigrationContext: "Se presenter a un voisin ou collegue" },
  { id: "cd-a1-eo-2", level: "A1", skill: "EO", descFr: "Je peux poser des questions simples (ou, quand, combien).", descEn: "I can ask simple questions (where, when, how much).", immigrationContext: "Demander le prix du loyer" },
  { id: "cd-a1-ee-1", level: "A1", skill: "EE", descFr: "Je peux ecrire une carte postale simple et remplir un formulaire.", descEn: "I can write a simple postcard and fill in forms.", immigrationContext: "Remplir un formulaire d'inscription" },
  { id: "cd-a1-co-3", level: "A1", skill: "CO", descFr: "Je peux comprendre des chiffres, des prix et des horaires simples.", descEn: "I can understand numbers, prices and simple schedules.", immigrationContext: "Comprendre le prix du loyer ou l'heure d'un rendez-vous" },
  { id: "cd-a1-eo-3", level: "A1", skill: "EO", descFr: "Je peux demander de l'aide et signaler un probleme urgent.", descEn: "I can ask for help and report an urgent problem.", immigrationContext: "Appeler le 911 ou expliquer un probleme de sante" },
  { id: "cd-a1-ce-3", level: "A1", skill: "CE", descFr: "Je peux comprendre un formulaire simple (nom, adresse, date de naissance).", descEn: "I can understand a simple form (name, address, date of birth).", immigrationContext: "Remplir un formulaire de Service Canada" },
  { id: "cd-a1-ee-2", level: "A1", skill: "EE", descFr: "Je peux ecrire mon nom, mon adresse et mon numéro de telephone.", descEn: "I can write my name, address and phone number.", immigrationContext: "Remplir un formulaire d'ouverture de compte bancaire" },

  // A2 — Survie
  { id: "cd-a2-co-1", level: "A2", skill: "CO", descFr: "Je peux comprendre des expressions liees a la vie quotidienne (achats, travail, environnement proche).", descEn: "I can understand phrases related to daily life (shopping, work, surroundings).", immigrationContext: "Comprendre un propriétaire expliquant le bail" },
  { id: "cd-a2-ce-1", level: "A2", skill: "CE", descFr: "Je peux lire des textes courts et simples (lettres, menus, horaires).", descEn: "I can read short simple texts (letters, menus, timetables).", immigrationContext: "Lire une offre d'emploi simple sur Emploi Québec" },
  { id: "cd-a2-eo-1", level: "A2", skill: "EO", descFr: "Je peux decrire ma famille, mes conditions de vie, ma formation.", descEn: "I can describe my family, living conditions, education.", immigrationContext: "Expliquer sa situation a un agent d'immigration" },
  { id: "cd-a2-ee-1", level: "A2", skill: "EE", descFr: "Je peux ecrire des notes et messages simples.", descEn: "I can write short simple notes and messages.", immigrationContext: "Ecrire un courriel a son propriétaire" },
  { id: "cd-a2-co-2", level: "A2", skill: "CO", descFr: "Je peux comprendre des messages simples au telephone.", descEn: "I can understand simple phone messages.", immigrationContext: "Comprendre un message vocal de la clinique" },
  { id: "cd-a2-ce-2", level: "A2", skill: "CE", descFr: "Je peux comprendre un courriel ou une lettre simple.", descEn: "I can understand a simple email or letter.", immigrationContext: "Lire un avis de la RAMQ ou de Revenu Québec" },
  { id: "cd-a2-eo-2", level: "A2", skill: "EO", descFr: "Je peux faire des achats simples et commander au restaurant.", descEn: "I can make simple purchases and order at a restaurant.", immigrationContext: "Commander au depanneur ou au restaurant" },
  { id: "cd-a2-ee-2", level: "A2", skill: "EE", descFr: "Je peux remplir un formulaire avec mes informations personnelles.", descEn: "I can fill in a form with my personal details.", immigrationContext: "Remplir un formulaire de demande de RAMQ" },

  // B1 — Seuil
  { id: "cd-b1-co-1", level: "B1", skill: "CO", descFr: "Je peux comprendre les points essentiels quand un langage standard est utilise.", descEn: "I can understand main points when clear standard language is used.", immigrationContext: "Comprendre une entrevue d'embauche" },
  { id: "cd-b1-ce-1", level: "B1", skill: "CE", descFr: "Je peux comprendre des textes sur des sujets concrets ou abstraits.", descEn: "I can understand texts on concrete or abstract subjects.", immigrationContext: "Lire un article de La Presse sur l'immigration" },
  { id: "cd-b1-eo-1", level: "B1", skill: "EO", descFr: "Je peux raconter des experiences, decrire des espoirs et donner des raisons.", descEn: "I can narrate experiences, describe hopes and give reasons.", immigrationContext: "Expliquer son parcours migratoire" },
  { id: "cd-b1-ee-1", level: "B1", skill: "EE", descFr: "Je peux ecrire un texte simple sur des sujets familiers.", descEn: "I can write simple connected text on familiar topics.", immigrationContext: "Ecrire une lettre de motivation" },
  { id: "cd-b1-co-2", level: "B1", skill: "CO", descFr: "Je peux comprendre l'essentiel d'une emission de radio ou de television sur l'actualite.", descEn: "I can understand the main points of radio or TV news.", immigrationContext: "Suivre les nouvelles sur Radio-Canada" },
  { id: "cd-b1-ce-2", level: "B1", skill: "CE", descFr: "Je peux comprendre une lettre personnelle ou administrative standard.", descEn: "I can understand a standard personal or administrative letter.", immigrationContext: "Comprendre une lettre du MIFI concernant sa demande" },
  { id: "cd-b1-eo-2", level: "B1", skill: "EO", descFr: "Je peux exprimer mon opinion et la justifier brièvement.", descEn: "I can express and briefly justify my opinion.", immigrationContext: "Expliquer pourquoi on veut s'etablir au Québec" },
  { id: "cd-b1-ee-2", level: "B1", skill: "EE", descFr: "Je peux ecrire un courriel formel pour demander des informations.", descEn: "I can write a formal email to request information.", immigrationContext: "Ecrire a un ordre professionnel pour la reconnaissance de diplôme" },

  // B2 — Avance (NCLC 7 — Required for PSTQ)
  { id: "cd-b2-co-1", level: "B2", skill: "CO", descFr: "Je peux comprendre des conferences et des discours assez longs.", descEn: "I can understand extended speech and lectures.", immigrationContext: "Suivre une formation professionnelle en français" },
  { id: "cd-b2-ce-1", level: "B2", skill: "CE", descFr: "Je peux lire des articles sur des problèmes contemporains.", descEn: "I can read articles about contemporary problems.", immigrationContext: "Analyser les critères du PSTQ dans le règlement" },
  { id: "cd-b2-eo-1", level: "B2", skill: "EO", descFr: "Je peux m'exprimer de facon claire et detaillee sur de nombreux sujets.", descEn: "I can express myself clearly and in detail on a wide range of subjects.", immigrationContext: "Participer a une reunion professionnelle" },
  { id: "cd-b2-ee-1", level: "B2", skill: "EE", descFr: "Je peux ecrire des textes clairs et detailles, des essais ou rapports.", descEn: "I can write clear, detailed text, essays or reports.", immigrationContext: "Rédiger une plainte au TAL" },
  { id: "cd-b2-co-2", level: "B2", skill: "CO", descFr: "Je peux comprendre la plupart des emissions de television et des films en langue standard.", descEn: "I can understand most TV broadcasts and films in standard language.", immigrationContext: "Suivre une formation professionnelle donnee en français" },
  { id: "cd-b2-ce-2", level: "B2", skill: "CE", descFr: "Je peux lire des articles et rapports sur des questions contemporaines.", descEn: "I can read articles and reports on contemporary issues.", immigrationContext: "Lire et comprendre les conditions du PSTQ sur le site du MIFI" },
  { id: "cd-b2-eo-2", level: "B2", skill: "EO", descFr: "Je peux participer activement a une discussion et defendre mon point de vue.", descEn: "I can participate actively in a discussion and defend my point of view.", immigrationContext: "Negocier les conditions d'un bail avec un propriétaire" },
  { id: "cd-b2-ee-2", level: "B2", skill: "EE", descFr: "Je peux ecrire une lettre formelle pour contester une decision administrative.", descEn: "I can write a formal letter to contest an administrative decision.", immigrationContext: "Contester un refus de permis de travail par ecrit" },

  // C1 — Autonome (NCLC 9)
  { id: "cd-c1-co-1", level: "C1", skill: "CO", descFr: "Je peux comprendre un long discours meme s'il n'est pas clairement structure.", descEn: "I can understand extended speech even when not clearly structured.", immigrationContext: "Suivre des debats médiatiques sur la politique d'immigration" },
  { id: "cd-c1-ce-1", level: "C1", skill: "CE", descFr: "Je peux comprendre des textes longs et complexes, y compris les styles différents.", descEn: "I can understand long complex texts, including different styles.", immigrationContext: "Lire des textes juridiques (LIPR, règlement)" },
  { id: "cd-c1-eo-1", level: "C1", skill: "EO", descFr: "Je peux m'exprimer spontanement et couramment sans trop chercher mes mots.", descEn: "I can express myself fluently and spontaneously.", immigrationContext: "Animer une reunion, negocier un contrat" },
  { id: "cd-c1-ee-1", level: "C1", skill: "EE", descFr: "Je peux ecrire des textes bien structures et detailles sur des sujets complexes.", descEn: "I can write well-structured detailed text on complex subjects.", immigrationContext: "Rédiger un memoire, un rapport professionnel" },
  { id: "cd-c1-co-2", level: "C1", skill: "CO", descFr: "Je peux suivre des interventions d'une certaine longueur sur des sujets abstraits ou complexes.", descEn: "I can follow extended speech on abstract or complex topics.", immigrationContext: "Comprendre une audience au tribunal administratif" },
  { id: "cd-c1-ce-2", level: "C1", skill: "CE", descFr: "Je peux comprendre en detail des textes longs et complexes, meme s'ils ne relevent pas de mon domaine.", descEn: "I can understand in detail long complex texts, even outside my field.", immigrationContext: "Analyser un contrat de travail detaille" },
  { id: "cd-c1-eo-2", level: "C1", skill: "EO", descFr: "Je peux presenter un sujet complexe de facon claire et structuree.", descEn: "I can present a complex subject clearly and in a structured way.", immigrationContext: "Faire une presentation professionnelle devant un comite" },
  { id: "cd-c1-ee-2", level: "C1", skill: "EE", descFr: "Je peux rediger des textes argumentatifs en soulignant les points significatifs.", descEn: "I can write argumentative texts highlighting significant points.", immigrationContext: "Rédiger une demande de reconsideration d'une decision d'immigration" },

  // C2 — Maîtrise (NCLC 10+)
  { id: "cd-c2-co-1", level: "C2", skill: "CO", descFr: "Je peux comprendre sans effort tout type de langue orale.", descEn: "I can understand any kind of spoken language without effort.", immigrationContext: "Comprendre l'humour québécois, les expressions regionales" },
  { id: "cd-c2-ce-1", level: "C2", skill: "CE", descFr: "Je peux lire sans effort tout type de texte.", descEn: "I can read any form of written language effortlessly.", immigrationContext: "Lire de la litterature quebecoise" },
  { id: "cd-c2-eo-1", level: "C2", skill: "EO", descFr: "Je peux presenter une argumentation claire et fluide dans un style adapte.", descEn: "I can present a clear, smoothly-flowing argument in an appropriate style.", immigrationContext: "Donner une conference professionnelle" },
  { id: "cd-c2-ee-1", level: "C2", skill: "EE", descFr: "Je peux ecrire des textes complexes dans un style clair et fluide.", descEn: "I can write complex texts in a clear, flowing style.", immigrationContext: "Rédiger un article academique" },
];

// ─── IMMIGRATION PROGRAM LEARNING PATHS ───
// Each path defines the NCLC requirement and recommended study plan

export interface LearningPath {
  id: string;
  program: string;
  programFr: string;
  programEn: string;
  descFr: string;
  descEn: string;
  nclcRequired: number;
  cefrEquiv: string;
  skills: { skill: string; minNCLC: number }[];
  estimatedHours: number; // from zero to target
  milestones: PathMilestone[];
  color: string;
}

export interface PathMilestone {
  nclc: number;
  labelFr: string;
  labelEn: string;
  skills: string[];
  exercises: number; // recommended count
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "pstq",
    program: "PSTQ (Arrima)",
    programFr: "Programme de sélection des travailleurs qualifies (PSTQ)",
    programEn: "Québec Skilled Worker Program (PSTQ)",
    descFr: "Requis: NCLC 7 dans les 4 compétences. C'est le programme principal d'immigration permanente au Québec.",
    descEn: "Required: NCLC 7 in all 4 skills. This is the main permanent immigration program in Québec.",
    nclcRequired: 7,
    cefrEquiv: "B2",
    skills: [
      { skill: "CO", minNCLC: 7 },
      { skill: "CE", minNCLC: 7 },
      { skill: "EO", minNCLC: 7 },
      { skill: "EE", minNCLC: 7 },
    ],
    estimatedHours: 600,
    milestones: [
      { nclc: 4, labelFr: "Base fonctionnelle", labelEn: "Functional base", skills: ["salutations", "formulaires", "directions"], exercises: 50 },
      { nclc: 5, labelFr: "Intermédiaire", labelEn: "Intermediate", skills: ["conversations", "courriels", "descriptions"], exercises: 80 },
      { nclc: 6, labelFr: "Pre-avancé", labelEn: "Pre-advanced", skills: ["arguments", "rapports", "negociation"], exercises: 100 },
      { nclc: 7, labelFr: "Objectif PSTQ atteint", labelEn: "PSTQ target reached", skills: ["debats", "textes complexes", "presentations"], exercises: 120 },
    ],
    color: "#1D9E75",
  },
  {
    id: "express-entry",
    program: "Express Entry (Federal)",
    programFr: "Entrée Express (Programme federal)",
    programEn: "Express Entry (Federal Program)",
    descFr: "Bonus CRS: NCLC 7+ en français = jusqu'a 50 points bonus. Tirages francophones 380-420 pts.",
    descEn: "CRS bonus: NCLC 7+ in French = up to 50 bonus points. Francophone draws 380-420 pts.",
    nclcRequired: 7,
    cefrEquiv: "B2",
    skills: [
      { skill: "CO", minNCLC: 7 },
      { skill: "CE", minNCLC: 7 },
      { skill: "EO", minNCLC: 7 },
      { skill: "EE", minNCLC: 7 },
    ],
    estimatedHours: 600,
    milestones: [
      { nclc: 5, labelFr: "Eligible de base", labelEn: "Basic eligibility", skills: ["conversations", "courriels"], exercises: 60 },
      { nclc: 7, labelFr: "+50 pts CRS", labelEn: "+50 CRS pts", skills: ["debats", "rapports"], exercises: 120 },
      { nclc: 9, labelFr: "Maximum CRS français", labelEn: "Maximum French CRS", skills: ["analyse", "redaction avancee"], exercises: 150 },
    ],
    color: "#003DA5",
  },
  {
    id: "caq-perm",
    program: "CAQ Permanent",
    programFr: "CAQ permanent (apres 3 ans)",
    programEn: "Permanent CAQ (after 3 years)",
    descFr: "Minimum: NCLC 4 en oral (CO + EO) apres 3 ans de résidence. Obligatoire depuis 2025.",
    descEn: "Minimum: NCLC 4 in oral (CO + EO) after 3 years of residence. Mandatory since 2025.",
    nclcRequired: 4,
    cefrEquiv: "A2",
    skills: [
      { skill: "CO", minNCLC: 4 },
      { skill: "EO", minNCLC: 4 },
    ],
    estimatedHours: 200,
    milestones: [
      { nclc: 3, labelFr: "Débutant actif", labelEn: "Active beginner", skills: ["salutations", "besoins de base"], exercises: 30 },
      { nclc: 4, labelFr: "Objectif CAQ atteint", labelEn: "CAQ target reached", skills: ["conversations quotidiennes", "compréhension de base"], exercises: 50 },
    ],
    color: "#D97706",
  },
  {
    id: "citizenship",
    program: "Citizenship",
    programFr: "Citoyennete canadienne",
    programEn: "Canadian Citizenship",
    descFr: "Requis: CLB/NCLC 4 dans au moins 2 compétences (CO/CE ou EO/EE). Test de connaissances en français possible.",
    descEn: "Required: CLB/NCLC 4 in at least 2 skills (CO/CE or EO/EE). Knowledge test available in French.",
    nclcRequired: 4,
    cefrEquiv: "A2",
    skills: [
      { skill: "CO", minNCLC: 4 },
      { skill: "EO", minNCLC: 4 },
    ],
    estimatedHours: 200,
    milestones: [
      { nclc: 4, labelFr: "Eligible citoyennete", labelEn: "Citizenship eligible", skills: ["compréhension", "expression de base"], exercises: 50 },
    ],
    color: "#DC2626",
  },
];

// ─── SPACED REPETITION SYSTEM (Leitner) ───
// Based on: Leitner System, Ebbinghaus Forgetting Curve,
// Pimsleur's Graduated Interval Recall

export interface SRSCard {
  id: string;
  type: "vocab" | "grammar" | "phrase";
  front: string; // question/prompt
  back: string; // answer
  frontLang: "fr" | "en";
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  category: string;
  box: number; // Leitner box 1-5
  nextReview: string; // ISO date
  lastReview: string;
  correctCount: number;
  incorrectCount: number;
}

// Review intervals in days for each Leitner box
export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30] as const;

export function getNextReviewDate(box: number): string {
  const days = LEITNER_INTERVALS[Math.min(box, 5)];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function reviewCard(card: SRSCard, correct: boolean): SRSCard {
  const today = new Date().toISOString().slice(0, 10);
  if (correct) {
    const newBox = Math.min(card.box + 1, 5);
    return {
      ...card,
      box: newBox,
      nextReview: getNextReviewDate(newBox),
      lastReview: today,
      correctCount: card.correctCount + 1,
    };
  }
  return {
    ...card,
    box: 1, // back to box 1
    nextReview: today, // review again today
    lastReview: today,
    incorrectCount: card.incorrectCount + 1,
  };
}

export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const today = new Date().toISOString().slice(0, 10);
  return cards.filter((c) => c.nextReview <= today).sort((a, b) => a.box - b.box);
}

// ─── DEFAULT SRS CARDS (Settlement-themed) ───
export const DEFAULT_SRS_CARDS: SRSCard[] = [
  // A1 — Absolute beginner vocabulary
  { id: "srs-a1-1", type: "vocab", front: "Bonjour", back: "Hello", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-2", type: "vocab", front: "Merci", back: "Thank you", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-3", type: "vocab", front: "S'il vous plait", back: "Please", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-4", type: "vocab", front: "Excuse me", back: "Excusez-moi", frontLang: "en", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-5", type: "vocab", front: "Je m'appelle...", back: "My name is...", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-6", type: "vocab", front: "Oui / Non", back: "Yes / No", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-7", type: "vocab", front: "Combien?", back: "How much?", frontLang: "fr", level: "A1", category: "vie-quotidienne", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-8", type: "vocab", front: "Ou est...?", back: "Where is...?", frontLang: "fr", level: "A1", category: "vie-quotidienne", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-9", type: "vocab", front: "Je ne comprends pas", back: "I don't understand", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-10", type: "vocab", front: "Je suis nouveau ici", back: "I'm new here", frontLang: "fr", level: "A1", category: "immigration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-11", type: "phrase", front: "Je voudrais un rendez-vous", back: "I would like an appointment", frontLang: "fr", level: "A1", category: "administration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a1-12", type: "phrase", front: "Pouvez-vous répéter?", back: "Can you repeat?", frontLang: "fr", level: "A1", category: "salutations", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },

  // A2 — Settlement basics
  { id: "srs-a2-1", type: "vocab", front: "Le loyer", back: "The rent", frontLang: "fr", level: "A2", category: "logement", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-2", type: "vocab", front: "Le bail", back: "The lease", frontLang: "fr", level: "A2", category: "logement", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-3", type: "vocab", front: "L'emploi", back: "The job", frontLang: "fr", level: "A2", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-4", type: "vocab", front: "Une entrevue", back: "An interview", frontLang: "fr", level: "A2", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-5", type: "phrase", front: "J'ai besoin d'aide", back: "I need help", frontLang: "fr", level: "A2", category: "vie-quotidienne", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-6", type: "vocab", front: "La carte OPUS", back: "Transit card", frontLang: "fr", level: "A2", category: "transport", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-7", type: "vocab", front: "La clinique sans rendez-vous", back: "Walk-in clinic", frontLang: "fr", level: "A2", category: "sante", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-a2-8", type: "vocab", front: "Le NAS", back: "Social Insurance Number (SIN)", frontLang: "fr", level: "A2", category: "administration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },

  // B1 — Intermediate
  { id: "srs-b1-1", type: "vocab", front: "Le préavis", back: "Notice period", frontLang: "fr", level: "B1", category: "logement", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b1-2", type: "vocab", front: "Le délai de carence", back: "Waiting period", frontLang: "fr", level: "B1", category: "sante", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b1-3", type: "phrase", front: "Je voudrais faire reconnaitre mon diplôme", back: "I would like to have my diploma recognized", frontLang: "fr", level: "B1", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b1-4", type: "grammar", front: "Si + imparfait → ?", back: "conditionnel (Si j'avais... j'aurais...)", frontLang: "fr", level: "B1", category: "grammaire", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b1-5", type: "vocab", front: "L'évaluation comparative", back: "Comparative evaluation (diploma equivalence)", frontLang: "fr", level: "B1", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b1-6", type: "vocab", front: "La déclaration d'intérêt", back: "Expression of interest (Arrima)", frontLang: "fr", level: "B1", category: "immigration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },

  // B2 — Advanced
  { id: "srs-b2-1", type: "vocab", front: "Les normes du travail", back: "Labour standards", frontLang: "fr", level: "B2", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b2-2", type: "vocab", front: "L'offre d'emploi validee (OEV)", back: "Validated job offer (VJO)", frontLang: "fr", level: "B2", category: "immigration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b2-3", type: "grammar", front: "Il faut que + ?", back: "subjonctif (Il faut que je fasse...)", frontLang: "fr", level: "B2", category: "grammaire", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-b2-4", type: "phrase", front: "J'aimerais contester la hausse de loyer", back: "I would like to contest the rent increase", frontLang: "fr", level: "B2", category: "logement", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },

  // C1 — Mastery
  { id: "srs-c1-1", type: "vocab", front: "La francisation en milieu de travail", back: "Workplace francization", frontLang: "fr", level: "C1", category: "emploi", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-c1-2", type: "phrase", front: "Les enjeux socioeconomiques de l'immigration", back: "Socioeconomic issues of immigration", frontLang: "fr", level: "C1", category: "immigration", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
  { id: "srs-c1-3", type: "grammar", front: "Ne serait-ce que = ?", back: "If only / Even if just (formal concessive)", frontLang: "fr", level: "C1", category: "grammaire", box: 1, nextReview: "", lastReview: "", correctCount: 0, incorrectCount: 0 },
];

// ─── SRS STORAGE ───
export function loadSRSCards(): SRSCard[] {
  if (typeof window === "undefined") return DEFAULT_SRS_CARDS;
  try {
    const saved = localStorage.getItem("etabli-srs-cards");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SRS_CARDS.map((c) => ({ ...c, nextReview: new Date().toISOString().slice(0, 10) }));
}

export function saveSRSCards(cards: SRSCard[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("etabli-srs-cards", JSON.stringify(cards));
  } catch {}
}

// ─── SELF-ASSESSMENT STORAGE ───
export interface SelfAssessment {
  completedStatements: string[]; // can-do statement IDs user has checked
  lastAssessment: string;
  estimatedLevel: string;
}

export function loadSelfAssessment(): SelfAssessment {
  if (typeof window === "undefined") return { completedStatements: [], lastAssessment: "", estimatedLevel: "A1" };
  try {
    const saved = localStorage.getItem("etabli-self-assessment");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { completedStatements: [], lastAssessment: "", estimatedLevel: "A1" };
}

export function saveSelfAssessment(assessment: SelfAssessment) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("etabli-self-assessment", JSON.stringify(assessment));
  } catch {}
}

export function estimateLevel(completedIds: string[]): string {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const statements = CAN_DO_STATEMENTS;
  for (let i = levels.length - 1; i >= 0; i--) {
    const levelStatements = statements.filter((s) => s.level === levels[i]);
    const completed = levelStatements.filter((s) => completedIds.includes(s.id));
    if (completed.length >= levelStatements.length * 0.75) {
      return levels[i];
    }
  }
  return "A1";
}

// ─── WEAK AREA TRACKING ───
export interface ErrorLog {
  exerciseId: string;
  skill: string;
  topic: string;
  level: string;
  timestamp: string;
  correct: boolean;
}

export function loadErrorLog(): ErrorLog[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("etabli-error-log");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveErrorLog(log: ErrorLog[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep last 500 entries
    const trimmed = log.slice(-500);
    localStorage.setItem("etabli-error-log", JSON.stringify(trimmed));
  } catch {}
}

export function getWeakAreas(log: ErrorLog[]): { topic: string; skill: string; errorRate: number }[] {
  const groups: Record<string, { correct: number; total: number; skill: string }> = {};
  for (const entry of log) {
    const key = `${entry.topic}-${entry.skill}`;
    if (!groups[key]) groups[key] = { correct: 0, total: 0, skill: entry.skill };
    groups[key].total++;
    if (entry.correct) groups[key].correct++;
  }
  return Object.entries(groups)
    .map(([key, val]) => ({
      topic: key.split("-")[0],
      skill: val.skill,
      errorRate: 1 - val.correct / val.total,
    }))
    .filter((a) => a.errorRate > 0.4 && groups[`${a.topic}-${a.skill}`].total >= 3)
    .sort((a, b) => b.errorRate - a.errorRate);
}

// ─── A1 BEGINNER EXERCISES ───
// Based on: Total beginner methodology (Alter Ego+, Edito A1)
// Focus: survival French for newcomers

export interface A1Exercise {
  id: string;
  type: "match-image" | "listen-select" | "complete-dialogue" | "fill-blank" | "true-false";
  category: string;
  questionFr: string;
  questionEn: string;
  options?: string[];
  answer: string;
  audioDesc?: string; // simulated audio context
  imageryDesc?: string; // visual context description
}

export const A1_EXERCISES: A1Exercise[] = [
  // Salutations & Presentations
  { id: "a1-1", type: "complete-dialogue", category: "salutations", questionFr: "— Bonjour, je m'appelle Marie. Et vous?\n— Bonjour, ___ Pierre.", questionEn: "Complete the dialogue", answer: "je m'appelle", options: ["je m'appelle", "il s'appelle", "tu t'appelles", "je suis appele"] },
  { id: "a1-2", type: "fill-blank", category: "salutations", questionFr: "— Comment allez-vous?\n— ___, merci.", questionEn: "How do you answer 'How are you?'", answer: "Bien", options: ["Bien", "Bonjour", "Merci", "Pardon"] },
  { id: "a1-3", type: "complete-dialogue", category: "salutations", questionFr: "— Vous etes d'ou?\n— Je ___ du Maroc.", questionEn: "Where are you from?", answer: "suis", options: ["suis", "ai", "vais", "fais"] },
  { id: "a1-4", type: "fill-blank", category: "salutations", questionFr: "— ___ vous parlez anglais?\n— Oui, un peu.", questionEn: "Ask if someone speaks English", answer: "Est-ce que", options: ["Est-ce que", "Pourquoi", "Quand", "Comment"] },

  // Chiffres & Temps
  { id: "a1-5", type: "fill-blank", category: "chiffres", questionFr: "Le loyer est de mille deux cents dollars. Ecrivez le nombre: ___$", questionEn: "Write the number: $___", answer: "1 200", options: ["1 200", "12 000", "120", "1 020"] },
  { id: "a1-6", type: "fill-blank", category: "chiffres", questionFr: "Mon rendez-vous est a ___ heures. (14:00)", questionEn: "My appointment is at ___ o'clock.", answer: "quatorze", options: ["quatorze", "quatre", "quarante", "quinze"] },
  { id: "a1-7", type: "fill-blank", category: "chiffres", questionFr: "Nous sommes le ___ mars 2026. (15)", questionEn: "Today is March ___, 2026.", answer: "quinze", options: ["quinze", "cinq", "cinquante", "quince"] },

  // Lieux & Directions
  { id: "a1-8", type: "fill-blank", category: "lieux", questionFr: "Pour obtenir votre NAS, allez a ___.", questionEn: "To get your SIN, go to ___.", answer: "Service Canada", options: ["Service Canada", "la pharmacie", "l'école", "la bibliotheque"] },
  { id: "a1-9", type: "fill-blank", category: "lieux", questionFr: "Le metro est a ___ (gauche/droite).", questionEn: "The metro is on the ___ (left/right).", answer: "gauche", options: ["gauche", "haut", "bas", "loin"] },
  { id: "a1-10", type: "complete-dialogue", category: "lieux", questionFr: "— Excusez-moi, ___ le metro?\n— C'est tout droit.", questionEn: "Ask where the metro is", answer: "ou est", options: ["ou est", "comment est", "quand est", "qui est"] },

  // Besoins de base
  { id: "a1-11", type: "fill-blank", category: "besoins", questionFr: "J'ai ___ d'un médecin. (besoin)", questionEn: "I ___ a doctor.", answer: "besoin", options: ["besoin", "envie", "peur", "faim"] },
  { id: "a1-12", type: "complete-dialogue", category: "besoins", questionFr: "— Je voudrais ___ un rendez-vous.\n— Pour quel jour?", questionEn: "I would like to make an appointment.", answer: "prendre", options: ["prendre", "manger", "dormir", "partir"] },
  { id: "a1-13", type: "fill-blank", category: "besoins", questionFr: "Je cherche un ___ pour ma famille. (logement)", questionEn: "I'm looking for a ___ for my family.", answer: "logement", options: ["logement", "travail", "passeport", "autobus"] },

  // Formulaires simples
  { id: "a1-14", type: "fill-blank", category: "formulaires", questionFr: "Nom: ___\nPrenom: ___\nDate de naissance: ___\n\nQuel est le 'prenom'?", questionEn: "Which is the 'first name'?", answer: "Le prenom est le premier nom (given name)", options: ["Le prenom est le premier nom (given name)", "Le prenom est le nom de famille", "Le prenom est le surnom", "Le prenom est le nom du pere"] },
  { id: "a1-15", type: "fill-blank", category: "formulaires", questionFr: "'Adresse' signifie ___.", questionEn: "'Adresse' means ___.", answer: "address", options: ["address", "phone number", "email", "name"] },
  { id: "a1-16", type: "true-false", category: "formulaires", questionFr: "Au Québec, l'adresse s'ecrit: numéro + rue + ville + province + code postal.", questionEn: "In Québec, the address format is: number + street + city + province + postal code.", answer: "vrai", options: ["vrai", "faux"] },

  // Jours & Mois
  { id: "a1-17", type: "fill-blank", category: "temps", questionFr: "Les jours de la semaine: lundi, ___, mercredi, jeudi, vendredi, samedi, dimanche.", questionEn: "Fill in the missing day.", answer: "mardi", options: ["mardi", "mars", "mai", "midi"] },
  { id: "a1-18", type: "fill-blank", category: "temps", questionFr: "Janvier, février, ___, avril, mai...", questionEn: "Fill in the missing month.", answer: "mars", options: ["mars", "mardi", "merci", "matin"] },

  // Urgences
  { id: "a1-19", type: "fill-blank", category: "urgences", questionFr: "Pour une urgence au Québec, appelez le ___.", questionEn: "For emergencies in Québec, call ___.", answer: "911", options: ["911", "411", "311", "611"] },
  { id: "a1-20", type: "fill-blank", category: "urgences", questionFr: "Pour des informations municipales (ville), appelez le ___.", questionEn: "For municipal information, call ___.", answer: "311", options: ["311", "911", "411", "711"] },

  // ─── SALUTATIONS (additional) ───
  { id: "a1-21", type: "complete-dialogue", category: "salutations", questionFr: "— Bonsoir, comment vous ___?\n— Je m'appelle Ahmed.", questionEn: "Good evening, what is your name?", answer: "appelez-vous", options: ["appelez-vous", "allez-vous", "etes-vous", "habitez-vous"] },
  { id: "a1-22", type: "fill-blank", category: "salutations", questionFr: "— Au revoir, bonne ___!\n— Merci, a vous aussi!", questionEn: "Goodbye, have a good ___!", answer: "journee", options: ["journee", "matin", "soir", "midi"] },
  { id: "a1-23", type: "complete-dialogue", category: "salutations", questionFr: "— Enchante de ___ connaitre.\n— Moi aussi!", questionEn: "Pleased to meet you.", answer: "vous", options: ["vous", "me", "le", "se"] },
  { id: "a1-24", type: "true-false", category: "salutations", questionFr: "Au Québec, on dit souvent 'Allo' au lieu de 'Bonjour' dans un contexte informel.", questionEn: "In Québec, people often say 'Allo' instead of 'Bonjour' informally.", answer: "vrai", options: ["vrai", "faux"] },
  { id: "a1-25", type: "fill-blank", category: "salutations", questionFr: "— Parlez-vous ___?\n— Oui, je parle français et anglais.", questionEn: "Do you speak ___?", answer: "français", options: ["français", "France", "Français", "francais"] },

  // ─── CHIFFRES (additional) ───
  { id: "a1-26", type: "fill-blank", category: "chiffres", questionFr: "Le café coute trois dollars et ___. Ecrivez: 3,50$", questionEn: "The coffee costs three dollars and ___.", answer: "cinquante", options: ["cinquante", "quinze", "cinq", "cent"] },
  { id: "a1-27", type: "fill-blank", category: "chiffres", questionFr: "Mon numéro de téléphone est le 514-___-3456. (sept cent quatre-vingt-neuf)", questionEn: "My phone number is 514-___-3456.", answer: "789", options: ["789", "798", "879", "987"] },
  { id: "a1-28", type: "fill-blank", category: "chiffres", questionFr: "Le magasin ouvre a ___ heures. (9h00)", questionEn: "The store opens at ___ o'clock.", answer: "neuf", options: ["neuf", "dix", "huit", "onze"] },
  { id: "a1-29", type: "fill-blank", category: "chiffres", questionFr: "Mon anniversaire est le ___ juillet. (1er)", questionEn: "My birthday is July ___.", answer: "premier", options: ["premier", "un", "premiere", "deux"] },
  { id: "a1-30", type: "fill-blank", category: "chiffres", questionFr: "Le billet de metro coute ___ dollars et soixante-quinze. (3)", questionEn: "The metro ticket costs ___ dollars and seventy-five cents.", answer: "trois", options: ["trois", "treize", "trente", "quatre"] },

  // ─── LIEUX (additional) ───
  { id: "a1-31", type: "fill-blank", category: "lieux", questionFr: "Pour acheter des medicaments, allez a la ___.", questionEn: "To buy medicine, go to the ___.", answer: "pharmacie", options: ["pharmacie", "boulangerie", "bibliotheque", "banque"] },
  { id: "a1-32", type: "complete-dialogue", category: "lieux", questionFr: "— Pardon, je cherche la station de metro ___.\n— C'est la prochaine rue a droite.", questionEn: "Excuse me, I'm looking for the metro station.", answer: "Berri-UQAM", options: ["Berri-UQAM", "Tour Eiffel", "Central Park", "Times Square"] },
  { id: "a1-33", type: "fill-blank", category: "lieux", questionFr: "Le CLSC est dans le quartier ___. (Cote-des-Neiges)", questionEn: "The CLSC is in the ___ neighborhood.", answer: "Cote-des-Neiges", options: ["Cote-des-Neiges", "Paris", "Ottawa", "Toronto"] },
  { id: "a1-34", type: "complete-dialogue", category: "lieux", questionFr: "— Pour aller a la bibliotheque, tournez a ___.\n— Merci beaucoup!", questionEn: "To go to the library, turn ___.", answer: "droite", options: ["droite", "manger", "dormir", "parler"] },
  { id: "a1-35", type: "fill-blank", category: "lieux", questionFr: "Je prends l'autobus numéro ___ pour aller au centre-ville. (55)", questionEn: "I take bus number ___ to go downtown.", answer: "cinquante-cinq", options: ["cinquante-cinq", "quinze", "cinq", "soixante-cinq"] },

  // ─── BESOINS (additional) ───
  { id: "a1-36", type: "complete-dialogue", category: "besoins", questionFr: "— Bonjour, je voudrais ouvrir un ___ bancaire.\n— Bien sur, avez-vous une piece d'identite?", questionEn: "I would like to open a bank ___.", answer: "compte", options: ["compte", "bureau", "livre", "billet"] },
  { id: "a1-37", type: "fill-blank", category: "besoins", questionFr: "A la pharmacie: Je voudrais quelque chose pour le mal de ___.", questionEn: "At the pharmacy: I would like something for a ___ache.", answer: "tete", options: ["tete", "bras", "pied", "dos"] },
  { id: "a1-38", type: "complete-dialogue", category: "besoins", questionFr: "— A l'epicerie: Ou sont les ___, s'il vous plait?\n— Au fond, a gauche.", questionEn: "At the grocery: Where are the ___, please?", answer: "fruits", options: ["fruits", "voitures", "maisons", "chaussures"] },
  { id: "a1-39", type: "fill-blank", category: "besoins", questionFr: "Je voudrais ___ de l'argent a la banque. (deposer)", questionEn: "I would like to ___ money at the bank.", answer: "deposer", options: ["deposer", "manger", "dormir", "courir"] },
  { id: "a1-40", type: "complete-dialogue", category: "besoins", questionFr: "— Je suis malade. J'ai besoin de voir un ___.\n— Allez a la clinique sans rendez-vous.", questionEn: "I'm sick. I need to see a ___.", answer: "médecin", options: ["médecin", "professeur", "policier", "chauffeur"] },

  // ─── FORMULAIRES (additional) ───
  { id: "a1-41", type: "fill-blank", category: "formulaires", questionFr: "'Code postal' au Canada a le format ___. (exemple: H2X 1Y4)", questionEn: "Canadian postal codes have the format ___.", answer: "lettre-chiffre-lettre chiffre-lettre-chiffre", options: ["lettre-chiffre-lettre chiffre-lettre-chiffre", "cinq chiffres", "quatre chiffres", "six chiffres"] },
  { id: "a1-42", type: "fill-blank", category: "formulaires", questionFr: "Sur un formulaire, 'Etat civil' signifie: celibataire, ___, divorce...", questionEn: "On a form, 'Etat civil' means: single, ___, divorced...", answer: "marie(e)", options: ["marie(e)", "heureux(se)", "fatigue(e)", "occupe(e)"] },
  { id: "a1-43", type: "true-false", category: "formulaires", questionFr: "Au Québec, le numéro de téléphone a 10 chiffres (ex: 514-555-1234).", questionEn: "In Québec, phone numbers have 10 digits (e.g., 514-555-1234).", answer: "vrai", options: ["vrai", "faux"] },
  { id: "a1-44", type: "fill-blank", category: "formulaires", questionFr: "'Courriel' est le mot québécois pour ___.", questionEn: "'Courriel' is the Québec word for ___.", answer: "email", options: ["email", "telephone", "adresse", "nom"] },
  { id: "a1-45", type: "fill-blank", category: "formulaires", questionFr: "Sur un formulaire gouvernemental, 'Sexe' signifie ___.", questionEn: "On a government form, 'Sexe' means ___.", answer: "gender", options: ["gender", "age", "name", "address"] },

  // ─── URGENCES (additional) ───
  { id: "a1-46", type: "complete-dialogue", category: "urgences", questionFr: "— 911, quelle est votre ___?\n— 1234 rue Saint-Denis, Montreal.", questionEn: "911, what is your ___?", answer: "urgence", options: ["urgence", "nom", "travail", "question"] },
  { id: "a1-47", type: "fill-blank", category: "urgences", questionFr: "J'ai besoin d'une ___! Mon voisin est tombe. (ambulance)", questionEn: "I need an ___! My neighbor fell.", answer: "ambulance", options: ["ambulance", "automobile", "autobus", "avion"] },
  { id: "a1-48", type: "fill-blank", category: "urgences", questionFr: "Il y a un ___ dans l'immeuble! Appelez les pompiers!", questionEn: "There is a ___ in the building! Call the firefighters!", answer: "incendie", options: ["incendie", "animal", "enfant", "autobus"] },
  { id: "a1-49", type: "complete-dialogue", category: "urgences", questionFr: "— Je ne me sens pas bien. J'ai mal au ___.\n— Asseyez-vous, je vais appeler le 911.", questionEn: "I don't feel well. My ___ hurts.", answer: "coeur", options: ["coeur", "chapeau", "sac", "livre"] },
  { id: "a1-50", type: "fill-blank", category: "urgences", questionFr: "En cas d'urgence, dites: 'J'ai besoin d'___ immediatement!'", questionEn: "In an emergency, say: 'I need ___ immediately!'", answer: "aide", options: ["aide", "argent", "café", "pain"] },
];

// ─── C1 ADVANCED EXERCISES ───
// Based on: DALF C1 préparation, academic French, professional contexts

export interface C1Exercise {
  id: string;
  type: "fill-blank" | "reformulation" | "argumentation" | "comprehension";
  category: string;
  level: "C1";
  questionFr: string;
  questionEn: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export const C1_EXERCISES: C1Exercise[] = [
  // Registres de langue
  { id: "c1-1", type: "reformulation", category: "registres", level: "C1", questionFr: "Reformulez en registre soutenu: 'Le gouvernement va couper dans les budgets d'immigration.'", questionEn: "Reformulate in formal register", answer: "Le gouvernement entend proceder a des compressions budgetaires en matière d'immigration.", options: ["Le gouvernement entend proceder a des compressions budgetaires en matière d'immigration.", "Le gouvernement va reduire l'immigration.", "Le gouvernement coupe les budgets.", "Le gouvernement n'aime pas l'immigration."] },
  { id: "c1-2", type: "reformulation", category: "registres", level: "C1", questionFr: "Transformez a la voix passive: 'Le MIFI a approuve ma demande de CSQ.'", questionEn: "Transform to passive voice", answer: "Ma demande de CSQ a ete approuvee par le MIFI.", options: ["Ma demande de CSQ a ete approuvee par le MIFI.", "Le MIFI m'a approuve.", "Ma CSQ est approuvee.", "On a approuve ma demande."] },

  // Connecteurs logiques
  { id: "c1-3", type: "fill-blank", category: "connecteurs", level: "C1", questionFr: "___ les critères du PSTQ soient exigeants, le programme attire de nombreux candidats.", questionEn: "Although the PSTQ criteria are demanding...", answer: "Bien que", options: ["Bien que", "Parce que", "Puisque", "Etant donne que"] },
  { id: "c1-4", type: "fill-blank", category: "connecteurs", level: "C1", questionFr: "L'immigration contribue a l'économie; ___, certains secteurs manquent de main-d'oeuvre qualifiee.", questionEn: "Immigration contributes to the economy; ___, some sectors lack skilled workers.", answer: "neanmoins", options: ["neanmoins", "donc", "car", "parce que"] },
  { id: "c1-5", type: "fill-blank", category: "connecteurs", level: "C1", questionFr: "Le candidat a déposé sa demande ___ respecter le délai de 90 jours.", questionEn: "The candidate submitted their application ___ meet the 90-day deadline.", answer: "afin de", options: ["afin de", "a cause de", "malgre", "au lieu de"] },

  // Nominalisation
  { id: "c1-6", type: "reformulation", category: "nominalisation", level: "C1", questionFr: "Nominalisez: 'Les immigrants s'integrent au marche du travail.'", questionEn: "Nominalize the sentence", answer: "L'intégration des immigrants au marche du travail", options: ["L'intégration des immigrants au marche du travail", "Les immigrants integrent le marche", "Le travail des immigrants", "L'immigration au travail"] },
  { id: "c1-7", type: "reformulation", category: "nominalisation", level: "C1", questionFr: "Nominalisez: 'Le gouvernement a decide de réformer le système d'immigration.'", questionEn: "Nominalize the sentence", answer: "La decision du gouvernement de réformer le système d'immigration", options: ["La decision du gouvernement de réformer le système d'immigration", "Le gouvernement réforme l'immigration", "La réforme de l'immigration", "La decision est faite"] },

  // Compréhension avancee
  { id: "c1-8", type: "comprehension", category: "analyse", level: "C1", questionFr: "Texte: 'Force est de constater que les seuils d'immigration, bien qu'ambitieux, ne sauraient a eux seuls combler le deficit démographique du Québec.'\n\nQue signifie 'force est de constater'?", questionEn: "What does 'force est de constater' mean?", answer: "On doit admettre / Il faut reconnaitre", options: ["On doit admettre / Il faut reconnaitre", "C'est une force", "C'est impossible", "On refuse de constater"] },
  { id: "c1-9", type: "comprehension", category: "analyse", level: "C1", questionFr: "'Les retombees économiques de l'immigration sont indeniables, a fortiori dans un contexte de vieillissement de la population.'\n\nQue signifie 'a fortiori'?", questionEn: "What does 'a fortiori' mean?", answer: "A plus forte raison / D'autant plus", options: ["A plus forte raison / D'autant plus", "Par contre", "Malheureusement", "Sans doute"] },
  { id: "c1-10", type: "comprehension", category: "analyse", level: "C1", questionFr: "'Le ministre a fait valoir que la politique d'immigration doit être repensee en amont.'\n\nQue signifie 'en amont'?", questionEn: "What does 'en amont' mean?", answer: "Au prealable / Avant la mise en oeuvre", options: ["Au prealable / Avant la mise en oeuvre", "En aval / Apres", "En urgence", "En secret"] },

  // Argumentation
  { id: "c1-11", type: "argumentation", category: "debat", level: "C1", questionFr: "Quel connecteur introduit une concession suivie d'une opposition?\n'___ le Québec ait besoin d'immigrants, les delais de traitement restent longs.'", questionEn: "Which connector introduces a concession followed by opposition?", answer: "Quoique", options: ["Quoique", "Parce que", "Si bien que", "De sorte que"] },
  { id: "c1-12", type: "fill-blank", category: "debat", level: "C1", questionFr: "Il serait ___ de pretendre que l'immigration n'a aucun impact sur le marche du logement.", questionEn: "It would be ___ to claim that immigration has no impact on housing.", answer: "hasardeux", options: ["hasardeux", "facile", "normal", "inutile"] },
];

// ─── DICTATION EXERCISES ───
// Based on: TCF EE methodology, French school tradition (dictee)

export interface DictationExercise {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  titleFr: string;
  titleEn: string;
  text: string; // the text to dictate (shown word by word)
  audioDesc: string; // description of what would be heard
  focusPoints: string[]; // grammar/spelling focus
  topic: string;
}

export const DICTATION_EXERCISES: DictationExercise[] = [
  { id: "dict-a1-1", level: "A1", titleFr: "Se presenter", titleEn: "Introducing yourself", text: "Bonjour, je m'appelle Maria. Je suis du Bresil. J'habite a Montreal.", audioDesc: "Slow, clear pronunciation of each word", focusPoints: ["apostrophe (m'appelle, j'habite)", "accents (a)"], topic: "salutations" },
  { id: "dict-a1-2", level: "A1", titleFr: "A la pharmacie", titleEn: "At the pharmacy", text: "Bonjour, je voudrais du sirop pour la toux. Combien ca coute?", audioDesc: "Slow, clear pronunciation", focusPoints: ["du (article partitif)", "ca vs sa"], topic: "sante" },
  { id: "dict-a2-1", level: "A2", titleFr: "Appeler pour un logement", titleEn: "Calling about housing", text: "Je cherche un appartement a louer pres du metro. Le loyer est de combien par mois?", audioDesc: "Normal speed, clear articulation", focusPoints: ["a (preposition vs avoir)", "pres du (contraction)"], topic: "logement" },
  { id: "dict-a2-2", level: "A2", titleFr: "A l'epicerie", titleEn: "At the grocery store", text: "Est-ce que vous avez du lait et des oeufs? Je voudrais aussi une baguette.", audioDesc: "Normal speed", focusPoints: ["articles partitifs (du, des)", "oeufs (pronunciation)"], topic: "vie-quotidienne" },
  { id: "dict-b1-1", level: "B1", titleFr: "Entrevue d'embauche", titleEn: "Job interview", text: "J'ai travaille pendant trois ans dans le domaine de la sante. Je voudrais obtenir une équivalence de diplôme au Québec.", audioDesc: "Natural speed with liaisons", focusPoints: ["passe composé", "équivalence (orthographe)"], topic: "emploi" },
  { id: "dict-b1-2", level: "B1", titleFr: "Au bureau de la RAMQ", titleEn: "At the RAMQ office", text: "Je suis arrive au Québec il y a deux mois. Est-ce que le délai de carence est toujours de trois mois?", audioDesc: "Natural speed", focusPoints: ["il y a (expression de temps)", "est-ce que (inversion)"], topic: "sante" },
  { id: "dict-b2-1", level: "B2", titleFr: "Lettre au TAL", titleEn: "Letter to the TAL", text: "Par la présente, je souhaite contester la hausse de loyer proposee par mon propriétaire. Conformement aux dispositions du Code civil, cette augmentation dépasse le taux recommandé.", audioDesc: "Formal, measured pace", focusPoints: ["vocabulaire juridique", "accord du participe passe"], topic: "logement" },
  { id: "dict-c1-1", level: "C1", titleFr: "Analyse politique", titleEn: "Political analysis", text: "Force est de constater que les politiques d'immigration, bien qu'elles visent a combler les besoins du marche du travail, ne sauraient a elles seules resoudre la problematique du vieillissement démographique.", audioDesc: "Academic pace with complex syntax", focusPoints: ["subjonctif (qu'elles visent)", "conditionnel (ne sauraient)", "nominalisation"], topic: "immigration" },

  // ─── ADDITIONAL DICTATION EXERCISES ───
  { id: "dict-a1-3", level: "A1", titleFr: "Saluer un voisin", titleEn: "Greeting a neighbor", text: "Bonjour, je suis votre nouveau voisin. Je m'appelle Ahmed. J'habite au troisieme etage.", audioDesc: "Slow, clear pronunciation with pauses between sentences", focusPoints: ["possessif (votre)", "apostrophe (m'appelle, j'habite)", "nombres ordinaux (troisieme)"], topic: "salutations" },
  { id: "dict-a1-4", level: "A1", titleFr: "Chez le médecin", titleEn: "At the doctor", text: "Bonjour docteur. J'ai mal a la tete et j'ai de la fievre depuis deux jours.", audioDesc: "Slow, clear pronunciation", focusPoints: ["contraction (a la)", "article partitif (de la)", "depuis + duree"], topic: "sante" },
  { id: "dict-a1-5", level: "A1", titleFr: "Au telephone", titleEn: "On the phone", text: "Allo, je voudrais parler a madame Tremblay, s'il vous plait. C'est pour un rendez-vous.", audioDesc: "Slow, clear telephone voice", focusPoints: ["politesse (s'il vous plait)", "a (preposition)", "c'est pour"], topic: "administration" },
  { id: "dict-a2-3", level: "A2", titleFr: "Demande d'emploi", titleEn: "Job application", text: "Je vous ecris pour poser ma candidature au poste de commis. J'ai deux ans d'experience dans le service a la clientele.", audioDesc: "Normal speed, formal tone", focusPoints: ["vocabulaire formel (poser ma candidature)", "preposition (au poste de)", "dans le + domaine"], topic: "emploi" },
  { id: "dict-a2-4", level: "A2", titleFr: "A la banque", titleEn: "At the bank", text: "Je voudrais ouvrir un compte d'epargne. Est-ce que je peux aussi commander une carte de debit?", audioDesc: "Normal speed, clear articulation", focusPoints: ["vocabulaire bancaire (compte, epargne, debit)", "est-ce que (question)"], topic: "administration" },
  { id: "dict-a2-5", level: "A2", titleFr: "Chercher un logement", titleEn: "Looking for housing", text: "Je cherche un quatre et demi dans le quartier Villeray. Mon budget est de mille dollars par mois, tout compris.", audioDesc: "Normal speed with Québec housing vocabulary", focusPoints: ["quatre et demi (Québec housing term)", "preposition (dans le quartier)", "tout compris"], topic: "logement" },
  { id: "dict-b1-3", level: "B1", titleFr: "Reclamation au propriétaire", titleEn: "Complaint to landlord", text: "Je vous informe que le chauffage ne fonctionne pas depuis une semaine. Conformement au bail, vous devez effectuer les reparations dans un délai raisonnable.", audioDesc: "Natural speed, semi-formal tone", focusPoints: ["ne...pas (negation)", "conformement a", "vocabulaire du bail"], topic: "logement" },
  { id: "dict-b1-4", level: "B1", titleFr: "Inscription a la francisation", titleEn: "Francization enrollment", text: "Je souhaite m'inscrire aux cours de francisation a temps plein. J'ai le droit a une allocation de participation, n'est-ce pas?", audioDesc: "Natural speed with administrative vocabulary", focusPoints: ["m'inscrire a", "a temps plein", "n'est-ce pas (tag question)"], topic: "administration" },
  { id: "dict-b2-2", level: "B2", titleFr: "Analyse du marche de l'emploi", titleEn: "Job market analysis", text: "Malgre les efforts de reconnaissance des diplômes etrangers, de nombreux immigrants qualifies se heurtent a des obstacles systemiques qui les empechent d'exercer leur profession au Québec.", audioDesc: "Formal, measured pace with complex vocabulary", focusPoints: ["malgre (preposition)", "se heurter a", "empêcher de + infinitif", "accord du participe"], topic: "emploi" },
  { id: "dict-c1-2", level: "C1", titleFr: "Debat sur le logement", titleEn: "Housing debate", text: "Il est indeniable que la crise du logement, exacerbee par une croissance démographique soutenue, nécessite des mesures structurelles qui depassent le cadre des interventions ponctuelles.", audioDesc: "Academic pace with formal register", focusPoints: ["il est indeniable que", "participe passe adjectival (exacerbee)", "subordonnee relative (qui depassent)", "vocabulaire soutenu"], topic: "logement" },
];

// ─── STUDY METHODOLOGY TIPS ───
export interface StudyTip {
  id: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  source: string; // methodology reference
  icon: string;
  level: "all" | "beginner" | "intermediate" | "advanced";
}

export const STUDY_TIPS: StudyTip[] = [
  { id: "tip-1", titleFr: "Répétition espacee", titleEn: "Spaced Repetition", descFr: "Revisez les cartes memoire chaque jour. Le système Leitner deplace les cartes maitrisees vers des intervalles plus longs (1→3→7→14→30 jours).", descEn: "Review flashcards daily. The Leitner system moves mastered cards to longer intervals (1→3→7→14→30 days).", source: "Leitner System / Ebbinghaus", icon: "brain", level: "all" },
  { id: "tip-2", titleFr: "Immersion quotidienne", titleEn: "Daily Immersion", descFr: "Écoutez Radio-Canada, regardez Tou.tv, lisez Le Devoir ou La Presse. 30 min/jour minimum.", descEn: "Listen to Radio-Canada, watch Tou.tv, read Le Devoir or La Presse. 30 min/day minimum.", source: "Krashen's Input Hypothesis", icon: "headphones", level: "all" },
  { id: "tip-3", titleFr: "Parler des le debut", titleEn: "Speak from Day 1", descFr: "N'attendez pas d'être 'pret'. Parlez en français au depanneur, au metro, au travail. Les erreurs font partie de l'apprentissage.", descEn: "Don't wait to be 'ready'. Speak French at the store, metro, work. Mistakes are part of learning.", source: "Swain's Output Hypothesis", icon: "mic", level: "beginner" },
  { id: "tip-4", titleFr: "Objectifs SMART", titleEn: "SMART Goals", descFr: "Fixez un objectif précis: 'NCLC 7 d'ici 6 mois' plutot que 'améliorer mon français'.", descEn: "Set a precise goal: 'NCLC 7 within 6 months' rather than 'improve my French'.", source: "Goal Setting Theory (Locke & Latham)", icon: "target", level: "all" },
  { id: "tip-5", titleFr: "Apprentissage contextuel", titleEn: "Contextual Learning", descFr: "Apprenez le vocabulaire dans son contexte (bail, loyer, RAMQ) plutot que des listes isolees.", descEn: "Learn vocabulary in context (lease, rent, RAMQ) rather than isolated lists.", source: "Task-Based Language Teaching", icon: "book", level: "all" },
  { id: "tip-6", titleFr: "La règle des 4 compétences", titleEn: "The 4-Skills Rule", descFr: "Chaque session doit toucher au moins 2 compétences (CO/CE/EO/EE). Le TCF/TEF teste les 4.", descEn: "Each session should touch at least 2 skills (CO/CE/EO/EE). TCF/TEF tests all 4.", source: "Communicative Language Teaching", icon: "layers", level: "intermediate" },
  { id: "tip-7", titleFr: "Corriger ses erreurs", titleEn: "Error Correction", descFr: "Notez vos erreurs recurrentes. Le système detecte vos faiblesses et vous propose des exercices cibles.", descEn: "Note your recurring errors. The system detects weaknesses and suggests targeted exercises.", source: "Error Analysis (Corder)", icon: "alert", level: "all" },
  { id: "tip-8", titleFr: "Le français québécois", titleEn: "Québec French", descFr: "Le TCF/TEF accepte le français international, mais vivre au Québec demande de comprendre les expressions locales (icitte, pantoute, correct).", descEn: "TCF/TEF accepts international French, but living in Québec requires understanding local expressions.", source: "Sociolinguistic Competence", icon: "flag", level: "intermediate" },
];
