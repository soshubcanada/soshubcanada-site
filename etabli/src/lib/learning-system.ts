"use client";
import { createContext, useContext } from "react";

// ─── GAMIFICATION & PROGRESS SYSTEM ───
// Inspired by Duolingo, Babbel, Busuu best practices

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  dailyGoal: number; // XP target per day
  dailyXP: number; // XP earned today
  lessonsCompleted: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  wordsLearned: string[]; // vocab IDs mastered
  skillLevels: Record<string, number>; // skill -> level (0-5)
  weakAreas: string[]; // topics needing review
  lastPractice: string; // ISO date
  badges: string[];
}

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  dailyGoal: 50,
  dailyXP: 0,
  lessonsCompleted: 0,
  exercisesCompleted: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  wordsLearned: [],
  skillLevels: {
    "grammaire-base": 0,
    "vocabulaire-logement": 0,
    "vocabulaire-emploi": 0,
    "vocabulaire-admin": 0,
    "vocabulaire-sante": 0,
    "vocabulaire-immigration": 0,
    "compréhension-orale": 0,
    "compréhension-écrite": 0,
    "expression-écrite": 0,
    "expression-orale": 0,
    "grammaire-intermédiaire": 0,
    "conjugaison": 0,
    "prononciation": 0,
    "culture-qc": 0,
  },
  weakAreas: [],
  lastPractice: "",
  badges: [],
};

// XP rewards
export const XP_REWARDS = {
  correctAnswer: 10,
  exerciseComplete: 25,
  lessonComplete: 50,
  perfectScore: 100,
  streakBonus: 15,
  dailyGoalReached: 50,
  mockExamComplete: 200,
  vocabMastered: 5,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
  6500, 8000, 10000, 12500, 15000, 18000, 22000, 27000, 33000, 40000,
];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 1000;
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, progress: (current / needed) * 100 };
}

// Badges
export const BADGES = [
  { id: "first-lesson", icon: "🎯", nameFr: "Premier pas", nameEn: "First step", descFr: "Complete ta première leçon", descEn: "Complete your first lesson", condition: (p: UserProgress) => p.lessonsCompleted >= 1 },
  { id: "streak-3", icon: "🔥", nameFr: "3 jours de suite", nameEn: "3-day streak", descFr: "Pratique 3 jours consécutifs", descEn: "Practice 3 consécutive days", condition: (p: UserProgress) => p.streak >= 3 },
  { id: "streak-7", icon: "⚡", nameFr: "Semaine parfaite", nameEn: "Perfect week", descFr: "Pratique 7 jours consécutifs", descEn: "Practice 7 consécutive days", condition: (p: UserProgress) => p.streak >= 7 },
  { id: "vocab-10", icon: "📚", nameFr: "10 mots", nameEn: "10 words", descFr: "Apprends 10 mots de vocabulaire", descEn: "Learn 10 vocabulary words", condition: (p: UserProgress) => p.wordsLearned.length >= 10 },
  { id: "vocab-25", icon: "🧠", nameFr: "25 mots", nameEn: "25 words", descFr: "Apprends 25 mots de vocabulaire", descEn: "Learn 25 vocabulary words", condition: (p: UserProgress) => p.wordsLearned.length >= 25 },
  { id: "perfect-score", icon: "💯", nameFr: "Score parfait", nameEn: "Perfect score", descFr: "Obtiens 100% dans un exercice", descEn: "Get 100% in an exercise", condition: (p: UserProgress) => p.badges.includes("perfect-score") },
  { id: "level-5", icon: "⭐", nameFr: "Niveau 5", nameEn: "Level 5", descFr: "Atteins le niveau 5", descEn: "Reach level 5", condition: (p: UserProgress) => p.level >= 5 },
  { id: "level-10", icon: "🏆", nameFr: "Niveau 10", nameEn: "Level 10", descFr: "Atteins le niveau 10", descEn: "Reach level 10", condition: (p: UserProgress) => p.level >= 10 },
  { id: "mock-exam", icon: "🎓", nameFr: "Examen blanc", nameEn: "Mock exam", descFr: "Complete un examen blanc", descEn: "Complete a mock exam", condition: (p: UserProgress) => p.badges.includes("mock-exam") },
  { id: "all-skills", icon: "🌟", nameFr: "Polyvalent", nameEn: "Well-rounded", descFr: "Pratique les 4 compétences", descEn: "Practice all 4 skills", condition: (p: UserProgress) => ["compréhension-orale", "compréhension-écrite", "expression-écrite", "expression-orale"].every(s => (p.skillLevels[s] || 0) >= 1) },
];

// ─── GRAMMAR LESSONS DATA ───
export interface GrammarLesson {
  id: string;
  titleFr: string;
  titleEn: string;
  level: "A2" | "B1" | "B2";
  category: string;
  points: GrammarPoint[];
  exercises: GrammarExercise[];
}

export interface GrammarPoint {
  ruleFr: string;
  ruleEn: string;
  examples: { fr: string; en: string }[];
}

export interface GrammarExercise {
  type: "fill-blank" | "word-order" | "matching" | "conjugation";
  questionFr: string;
  questionEn: string;
  answer: string;
  options?: string[];
  hint?: string;
}

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "articles-base",
    titleFr: "Les articles (le, la, les, un, une, des)",
    titleEn: "Articles (le, la, les, un, une, des)",
    level: "A2",
    category: "grammaire-base",
    points: [
      {
        ruleFr: "Les articles définis (le, la, les) designent quelque chose de précis ou deja mentionné.",
        ruleEn: "Definite articles (le, la, les) refer to something specific or already mentioned.",
        examples: [
          { fr: "Le propriétaire a augmenté le loyer.", en: "The landlord raised the rent." },
          { fr: "La clinique est ouverte le lundi.", en: "The clinic is open on Mondays." },
          { fr: "Les documents sont prets.", en: "The documents are ready." },
        ],
      },
      {
        ruleFr: "Les articles indéfinis (un, une, des) designent quelque chose de non spécifique.",
        ruleEn: "Indefinite articles (un, une, des) refer to something non-specific.",
        examples: [
          { fr: "J'ai trouve un appartement.", en: "I found an apartment." },
          { fr: "J'ai une entrevue demain.", en: "I have an interview tomorrow." },
          { fr: "Il y a des autobus de remplacement.", en: "There are replacement buses." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "J'ai visite ___ appartement sur Kijiji.", questionEn: "I visited ___ apartment on Kijiji.", answer: "un", options: ["un", "le", "la", "des"], hint: "Non spécifique, première mention" },
      { type: "fill-blank", questionFr: "___ loyer est de 1 200$ par mois.", questionEn: "___ rent is $1,200 per month.", answer: "Le", options: ["Le", "Un", "La", "Des"], hint: "Specifique, on parle d'un loyer précis" },
      { type: "fill-blank", questionFr: "J'ai besoin de ___ carte RAMQ.", questionEn: "I need ___ RAMQ card.", answer: "la", options: ["la", "une", "le", "des"], hint: "Specifique — il n'y a qu'une carte RAMQ" },
      { type: "fill-blank", questionFr: "Il y a ___ cliniques sans rendez-vous pres de chez moi.", questionEn: "There are ___ walk-in clinics near my home.", answer: "des", options: ["des", "les", "un", "la"], hint: "Pluriel, non spécifique" },
    ],
  },
  {
    id: "negation",
    titleFr: "La négation (ne...pas, ne...plus, ne...jamais)",
    titleEn: "Negation (ne...pas, ne...plus, ne...jamais)",
    level: "A2",
    category: "grammaire-base",
    points: [
      {
        ruleFr: "La négation standard: ne + verbe + pas. A l'oral au Québec, le 'ne' est souvent omis.",
        ruleEn: "Standard negation: ne + verb + pas. In spoken Québec French, 'ne' is often dropped.",
        examples: [
          { fr: "Je n'ai pas de carte RAMQ. (ecrit) / J'ai pas de carte. (oral QC)", en: "I don't have a RAMQ card." },
          { fr: "Il ne travaille pas le dimanche.", en: "He doesn't work on Sundays." },
        ],
      },
      {
        ruleFr: "Autres negations: ne...plus (no longer), ne...jamais (never), ne...rien (nothing).",
        ruleEn: "Other negations: ne...plus (no longer), ne...jamais (never), ne...rien (nothing).",
        examples: [
          { fr: "Je ne fume plus.", en: "I no longer smoke." },
          { fr: "Il n'a jamais visite le Québec.", en: "He has never visited Québec." },
          { fr: "Je ne comprends rien.", en: "I don't understand anything." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "Je ___ ai ___ mon NAS encore.", questionEn: "I don't have my SIN yet.", answer: "n' / pas", options: ["n' / pas", "ne / plus", "n' / jamais", "ne / rien"] },
      { type: "fill-blank", questionFr: "Il ___ habite ___ a Montreal.", questionEn: "He no longer lives in Montreal.", answer: "n' / plus", options: ["n' / plus", "ne / pas", "n' / jamais", "ne / rien"] },
      { type: "word-order", questionFr: "Remettez dans l'ordre:", questionEn: "Put in order:", answer: "Je ne comprends pas le français.", options: ["comprends", "français.", "ne", "le", "pas", "Je"] },
    ],
  },
  {
    id: "passe-composé",
    titleFr: "Le passe composé (j'ai fait, je suis alle)",
    titleEn: "Past tense (passe composé)",
    level: "B1",
    category: "conjugaison",
    points: [
      {
        ruleFr: "Le passe composé = auxiliaire (avoir ou être) au present + participe passe. La majorite des verbes utilisent 'avoir'.",
        ruleEn: "Passe composé = auxiliary (avoir or être) in present + past participle. Most verbs use 'avoir'.",
        examples: [
          { fr: "J'ai obtenu mon NAS a Service Canada.", en: "I got my SIN at Service Canada." },
          { fr: "Nous avons signe le bail hier.", en: "We signed the lease yesterday." },
          { fr: "Elle a envoye son CV par courriel.", en: "She sent her resume by email." },
        ],
      },
      {
        ruleFr: "Les verbes de mouvement et les verbes pronominaux utilisent 'être'. Le participe s'accorde avec le sujet.",
        ruleEn: "Movement verbs and reflexive verbs use 'être'. The participle agrees with the subject.",
        examples: [
          { fr: "Je suis arrive au Québec en janvier.", en: "I arrived in Québec in January." },
          { fr: "Elle est allee a la clinique.", en: "She went to the clinic." },
          { fr: "Nous nous sommes installes a Montreal.", en: "We settled in Montreal." },
        ],
      },
    ],
    exercises: [
      { type: "conjugation", questionFr: "Je ___ (obtenir) ma carte RAMQ la semaine dernière.", questionEn: "I ___ (obtain) my RAMQ card last week.", answer: "ai obtenu", hint: "auxiliaire avoir + participe passe" },
      { type: "conjugation", questionFr: "Elle ___ (arriver) au Canada en 2025.", questionEn: "She ___ (arrive) in Canada in 2025.", answer: "est arrivee", hint: "verbe de mouvement → être + accord feminin" },
      { type: "conjugation", questionFr: "Nous ___ (s'inscrire) au cours de français.", questionEn: "We ___ (register) for the French class.", answer: "nous sommes inscrits", hint: "verbe pronominal → être" },
      { type: "fill-blank", questionFr: "Ils ___ demenage le 1er juillet.", questionEn: "They moved on July 1st.", answer: "ont", options: ["ont", "sont", "avons", "a"], hint: "demenager utilise 'avoir'" },
    ],
  },
  {
    id: "conditionnel",
    titleFr: "Le conditionnel (je voudrais, j'aimerais)",
    titleEn: "Conditional tense (I would like)",
    level: "B1",
    category: "conjugaison",
    points: [
      {
        ruleFr: "Le conditionnel sert a exprimer une demande polie, un souhait ou une hypothese. Formation: radical du futur + terminaisons de l'imparfait (-ais, -ais, -ait, -ions, -iez, -aient).",
        ruleEn: "The conditional expresses polite requests, wishes, or hypotheses. Formation: future stem + imperfect endings.",
        examples: [
          { fr: "Je voudrais prendre rendez-vous, s'il vous plait.", en: "I would like to make an appointment, please." },
          { fr: "Pourriez-vous m'envoyer le formulaire?", en: "Could you send me the form?" },
          { fr: "J'aimerais travailler dans le domaine de la sante.", en: "I would like to work in the health field." },
        ],
      },
      {
        ruleFr: "Avec 'si' + imparfait, on utilise le conditionnel dans la clause principale.",
        ruleEn: "With 'si' + imperfect, use the conditional in the main clause.",
        examples: [
          { fr: "Si j'avais un OEV, j'aurais 380 points de plus.", en: "If I had a VJO, I would have 380 more points." },
          { fr: "Si je parlais mieux français, je trouverais un emploi plus facilement.", en: "If I spoke better French, I would find a job more easily." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "Je ___ savoir quand ma carte RAMQ sera prete.", questionEn: "I would like to know when my RAMQ card will be ready.", answer: "voudrais", options: ["voudrais", "veux", "voulais", "voulu"] },
      { type: "fill-blank", questionFr: "___ -vous me donner des informations sur le PSTQ?", questionEn: "Could you give me information about the PSTQ?", answer: "Pourriez", options: ["Pourriez", "Pouvez", "Pouviez", "Pourrez"] },
      { type: "conjugation", questionFr: "Si je ___ (avoir) un diplôme québécois, je ___ (obtenir) 30 points de plus.", questionEn: "If I had a Québec diploma, I would get 30 more points.", answer: "avais / obtiendrais", hint: "si + imparfait → conditionnel" },
    ],
  },
  {
    id: "subjonctif",
    titleFr: "Le subjonctif (il faut que, je veux que)",
    titleEn: "Subjunctive mood (it is necessary that)",
    level: "B2",
    category: "conjugaison",
    points: [
      {
        ruleFr: "Le subjonctif s'utilise apres des expressions de necessite (il faut que), de volonte (je veux que), de doute (je doute que), et d'emotion (je suis content que).",
        ruleEn: "The subjunctive is used after expressions of necessity, will, doubt, and emotion.",
        examples: [
          { fr: "Il faut que je fasse ma déclaration de revenus avant le 30 avril.", en: "I need to do my tax return before April 30." },
          { fr: "Je veux que mon dossier soit complet.", en: "I want my file to be complete." },
          { fr: "Il est important que vous ayez votre NAS.", en: "It is important that you have your SIN." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "Il faut que je ___ (aller) a Service Canada.", questionEn: "I need to go to Service Canada.", answer: "aille", options: ["aille", "vais", "irai", "allais"] },
      { type: "fill-blank", questionFr: "Il est important que vous ___ (avoir) votre carte RAMQ.", questionEn: "It is important that you have your RAMQ card.", answer: "ayez", options: ["ayez", "avez", "aurez", "aviez"] },
      { type: "fill-blank", questionFr: "Je veux que mon CV ___ (être) au format canadien.", questionEn: "I want my résumé to be in Canadian format.", answer: "soit", options: ["soit", "est", "sera", "etait"] },
    ],
  },
  {
    id: "pronoms-relatifs",
    titleFr: "Les pronoms relatifs (qui, que, dont, ou)",
    titleEn: "Relative pronouns (qui, que, dont, ou)",
    level: "A2",
    category: "grammaire-base",
    points: [
      {
        ruleFr: "'Qui' remplace le sujet du verbe qui suit. 'Que' remplace le complément d'objet direct.",
        ruleEn: "'Qui' replaces the subject of the following verb. 'Que' replaces the direct object.",
        examples: [
          { fr: "L'agent qui m'a aide etait tres gentil.", en: "The agent who helped me was very kind." },
          { fr: "Le formulaire que j'ai rempli est en ligne.", en: "The form that I filled out is online." },
          { fr: "C'est la clinique qui est ouverte le samedi.", en: "It's the clinic that is open on Saturdays." },
        ],
      },
      {
        ruleFr: "'Dont' remplace un complement introduit par 'de'. 'Ou' indique un lieu ou un moment.",
        ruleEn: "'Dont' replaces a complement introduced by 'de'. 'Ou' indicates a place or time.",
        examples: [
          { fr: "Le document dont j'ai besoin est au bureau.", en: "The document I need is at the office." },
          { fr: "C'est l'organisme dont je t'ai parle.", en: "It's the organization I told you about." },
          { fr: "Le quartier ou j'habite est pres du metro.", en: "The neighbourhood where I live is near the metro." },
          { fr: "Le jour ou je suis arrive, il neigeait.", en: "The day when I arrived, it was snowing." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "C'est l'appartement ___ je veux visiter.", questionEn: "It's the apartment ___ I want to visit.", answer: "que", options: ["que", "qui", "dont", "ou"], hint: "Complément d'objet direct du verbe 'visiter'" },
      { type: "fill-blank", questionFr: "Le conseiller ___ travaille ici parle anglais.", questionEn: "The advisor ___ works here speaks English.", answer: "qui", options: ["qui", "que", "dont", "ou"], hint: "Sujet du verbe 'travaille'" },
      { type: "fill-blank", questionFr: "Le programme ___ j'ai besoin s'appelle le PSTQ.", questionEn: "The program ___ I need is called the PSTQ.", answer: "dont", options: ["dont", "que", "qui", "ou"], hint: "'Avoir besoin de' → dont" },
      { type: "fill-blank", questionFr: "La ville ___ je me suis installe est Montreal.", questionEn: "The city ___ I settled is Montreal.", answer: "ou", options: ["ou", "qui", "que", "dont"], hint: "Indique un lieu" },
      { type: "word-order", questionFr: "Remettez dans l'ordre:", questionEn: "Put in order:", answer: "C'est le bureau ou j'ai obtenu mon NAS.", options: ["NAS.", "ou", "mon", "j'ai", "C'est", "obtenu", "le", "bureau"] },
      { type: "conjugation", questionFr: "Complete: La personne ___ m'a accueilli etait l'agente d'immigration.", questionEn: "Complete: The person ___ welcomed me was the immigration agent.", answer: "qui", hint: "Sujet du verbe 'accueillir'" },
    ],
  },
  {
    id: "imparfait-vs-pc",
    titleFr: "L'imparfait vs le passe composé",
    titleEn: "Imperfect vs Past Composite",
    level: "B1",
    category: "conjugaison",
    points: [
      {
        ruleFr: "L'imparfait decrit une situation, une habitude ou un etat dans le passe. Le passe composé decrit une action precise, terminee, avec un debut et une fin.",
        ruleEn: "The imperfect describes a situation, habit, or state in the past. The passe composé describes a specific, completed action with a beginning and end.",
        examples: [
          { fr: "Quand j'habitais en France, je parlais français tous les jours. (habitude)", en: "When I lived in France, I spoke French every day. (habit)" },
          { fr: "Hier, j'ai visite trois appartements. (action terminee)", en: "Yesterday, I visited three apartments. (completed action)" },
          { fr: "Il faisait froid quand je suis arrive a Montreal. (description + action)", en: "It was cold when I arrived in Montreal. (description + action)" },
        ],
      },
      {
        ruleFr: "Formation de l'imparfait: radical de la 1re personne du pluriel au present + terminaisons -ais, -ais, -ait, -ions, -iez, -aient. Exception: être → j'etais.",
        ruleEn: "Imperfect formation: stem of 1st person plural present + endings -ais, -ais, -ait, -ions, -iez, -aient. Exception: être → j'etais.",
        examples: [
          { fr: "nous parlons → je parlais, tu parlais, il parlait...", en: "nous parlons → je parlais, tu parlais, il parlait..." },
          { fr: "nous finissons → je finissais", en: "nous finissons → je finissais" },
          { fr: "être → j'etais, tu etais, il etait, nous etions...", en: "être → j'etais, tu etais, il etait, nous etions..." },
        ],
      },
      {
        ruleFr: "Marqueurs temporels: imparfait → avant, autrefois, chaque jour, d'habitude, souvent. Passe composé → hier, la semaine derniere, soudain, tout a coup.",
        ruleEn: "Time markers: imperfect → before, formerly, every day, usually, often. Passe composé → yesterday, last week, suddenly, all of a sudden.",
        examples: [
          { fr: "D'habitude, je prenais le bus. Mais hier, j'ai pris le metro.", en: "Usually, I took the bus. But yesterday, I took the metro." },
          { fr: "Je lisais le journal quand le telephone a sonne.", en: "I was reading the newspaper when the phone rang." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "Quand je ___ (habiter) a Quebec, je ___ (prendre) le bus chaque jour.", questionEn: "When I lived in Quebec City, I took the bus every day.", answer: "habitais / prenais", options: ["habitais / prenais", "ai habite / ai pris", "habite / prends", "habitais / ai pris"], hint: "Deux habitudes dans le passe → imparfait" },
      { type: "fill-blank", questionFr: "Hier, j' ___ (envoyer) mon CV a trois entreprises.", questionEn: "Yesterday, I sent my resume to three companies.", answer: "ai envoye", options: ["ai envoye", "envoyais", "envoie", "avais envoye"], hint: "'Hier' = action terminee → passe composé" },
      { type: "fill-blank", questionFr: "Il ___ (neiger) quand nous ___ (arriver) a l'aeroport.", questionEn: "It was snowing when we arrived at the airport.", answer: "neigeait / sommes arrives", options: ["neigeait / sommes arrives", "a neige / arrivions", "neige / arrivons", "neigeait / arrivions"], hint: "Description (imparfait) + action ponctuelle (passe composé)" },
      { type: "conjugation", questionFr: "Avant, je ___ (travailler) dans un restaurant. L'annee derniere, j' ___ (obtenir) un poste de bureau.", questionEn: "Before, I worked in a restaurant. Last year, I got an office job.", answer: "travaillais / ai obtenu", hint: "Habitude passee (imparfait) + evenement précis (passe composé)" },
      { type: "conjugation", questionFr: "Quand j' ___ (être) jeune, je ___ (vouloir) devenir medecin.", questionEn: "When I was young, I wanted to become a doctor.", answer: "etais / voulais", hint: "Description d'un etat passe → imparfait pour les deux" },
      { type: "fill-blank", questionFr: "Tout a coup, le telephone ___ (sonner) pendant que je ___ (dormir).", questionEn: "Suddenly, the phone rang while I was sleeping.", answer: "a sonne / dormais", options: ["a sonne / dormais", "sonnait / ai dormi", "sonne / dors", "a sonne / ai dormi"], hint: "'Tout a coup' = action soudaine (PC), action en cours (imparfait)" },
    ],
  },
  {
    id: "prepositions-lieu",
    titleFr: "Les prepositions de lieu (a, en, au, aux, chez, dans)",
    titleEn: "Prepositions of place (a, en, au, aux, chez, dans)",
    level: "A2",
    category: "grammaire-base",
    points: [
      {
        ruleFr: "'A' s'utilise devant les villes. 'En' devant les pays feminins ou commencant par une voyelle. 'Au' devant les pays masculins. 'Aux' devant les pays pluriels.",
        ruleEn: "'A' is used before cities. 'En' before feminine countries or those starting with a vowel. 'Au' before masculine countries. 'Aux' before plural countries.",
        examples: [
          { fr: "J'habite a Montreal.", en: "I live in Montreal." },
          { fr: "Je viens du Maroc. J'habite au Canada.", en: "I come from Morocco. I live in Canada." },
          { fr: "Elle est nee en France.", en: "She was born in France." },
          { fr: "Ils ont voyage aux Etats-Unis.", en: "They travelled to the United States." },
        ],
      },
      {
        ruleFr: "'Chez' s'utilise devant une personne ou un professionnel. 'Dans' indique l'intérieur d'un espace delimite.",
        ruleEn: "'Chez' is used before a person or professional. 'Dans' indicates inside a delimited space.",
        examples: [
          { fr: "Je vais chez le medecin.", en: "I'm going to the doctor's." },
          { fr: "Tu habites chez ton ami?", en: "Do you live at your friend's place?" },
          { fr: "Les documents sont dans le tiroir.", en: "The documents are in the drawer." },
          { fr: "Il travaille dans un bureau au centre-ville.", en: "He works in an office downtown." },
        ],
      },
      {
        ruleFr: "'Sur' = on/on top of. 'Sous' = under. 'Devant' = in front of. 'Derriere' = behind. 'A cote de' = next to. 'Entre' = between.",
        ruleEn: "'Sur' = on. 'Sous' = under. 'Devant' = in front of. 'Derriere' = behind. 'A cote de' = next to. 'Entre' = between.",
        examples: [
          { fr: "La pharmacie est a cote de la clinique.", en: "The pharmacy is next to the clinic." },
          { fr: "Le bureau de poste est entre la banque et le metro.", en: "The post office is between the bank and the metro." },
          { fr: "Mon CV est sur la table.", en: "My resume is on the table." },
        ],
      },
    ],
    exercises: [
      { type: "fill-blank", questionFr: "J'habite ___ Montreal depuis deux ans.", questionEn: "I've lived ___ Montreal for two years.", answer: "a", options: ["a", "en", "au", "dans"], hint: "Devant une ville → a" },
      { type: "fill-blank", questionFr: "Ma famille habite ___ Algerie.", questionEn: "My family lives ___ Algeria.", answer: "en", options: ["en", "a", "au", "aux"], hint: "Pays feminin commencant par une voyelle → en" },
      { type: "fill-blank", questionFr: "Je suis ne ___ Mexique.", questionEn: "I was born ___ Mexico.", answer: "au", options: ["au", "en", "a", "dans"], hint: "Pays masculin → au" },
      { type: "fill-blank", questionFr: "J'ai un rendez-vous ___ le dentiste demain.", questionEn: "I have an appointment ___ the dentist tomorrow.", answer: "chez", options: ["chez", "a", "dans", "au"], hint: "Devant un professionnel → chez" },
      { type: "fill-blank", questionFr: "Les papiers sont ___ l'enveloppe.", questionEn: "The papers are ___ the envelope.", answer: "dans", options: ["dans", "sur", "a", "chez"], hint: "A l'interieur d'un espace ferme → dans" },
      { type: "word-order", questionFr: "Remettez dans l'ordre:", questionEn: "Put in order:", answer: "La pharmacie est a cote de la clinique.", options: ["cote", "La", "clinique.", "a", "de", "est", "la", "pharmacie"] },
    ],
  },
];

// ─── FILL-IN-THE-BLANK EXERCISES (Settlement themed) ───
export interface FillBlankExercise {
  id: string;
  level: "A2" | "B1" | "B2";
  sentenceFr: string; // with ___ for blank
  sentenceEn: string;
  answer: string;
  options: string[];
  topic: string;
}

export const FILL_BLANK_EXERCISES: FillBlankExercise[] = [
  { id: "fb-1", level: "A2", topic: "logement", sentenceFr: "Je cherche un ___ a louer pres du metro.", sentenceEn: "I'm looking for an ___ to rent near the metro.", answer: "appartement", options: ["appartement", "autobus", "emploi", "hopital"] },
  { id: "fb-2", level: "A2", topic: "emploi", sentenceFr: "Mon ___ commence a 9 heures du matin.", sentenceEn: "My ___ starts at 9 in the morning.", answer: "travail", options: ["travail", "loyer", "bail", "rendez-vous"] },
  { id: "fb-3", level: "A2", topic: "transport", sentenceFr: "Je dois ___ ma carte OPUS pour le mois prochain.", sentenceEn: "I need to ___ my OPUS card for next month.", answer: "recharger", options: ["recharger", "signer", "appeler", "envoyer"] },
  { id: "fb-4", level: "A2", topic: "administration", sentenceFr: "Le ___ d'assurance sociale est nécessaire pour travailler.", sentenceEn: "The social insurance ___ is necessary to work.", answer: "numéro", options: ["numéro", "bail", "loyer", "permis"] },
  { id: "fb-5", level: "B1", topic: "logement", sentenceFr: "Le propriétaire doit donner un ___ de 24 heures avant d'entrer dans le logement.", sentenceEn: "The landlord must give 24 hours' ___ before entering the apartment.", answer: "préavis", options: ["préavis", "bail", "dépôt", "loyer"] },
  { id: "fb-6", level: "B1", topic: "emploi", sentenceFr: "Pour faire reconnaitre mon diplôme, j'ai besoin d'une évaluation ___.", sentenceEn: "To have my diploma recognized, I need a ___ évaluation.", answer: "comparative", options: ["comparative", "médicale", "financiere", "orale"] },
  { id: "fb-7", level: "B1", topic: "sante", sentenceFr: "Le ___ de carence pour la RAMQ est de trois mois.", sentenceEn: "The ___ period for RAMQ is three months.", answer: "délai", options: ["délai", "bail", "prix", "taux"] },
  { id: "fb-8", level: "B1", topic: "immigration", sentenceFr: "J'ai soumis ma ___ d'intérêt sur la plateforme Arrima.", sentenceEn: "I submitted my expression of ___ on the Arrima platform.", answer: "déclaration", options: ["déclaration", "demande", "lettre", "offre"] },
  { id: "fb-9", level: "B2", topic: "immigration", sentenceFr: "L'offre d'emploi ___ (OEV) peut valoir jusqu'a 380 points dans Arrima.", sentenceEn: "The ___ job offer (VJO) can be worth up to 380 points in Arrima.", answer: "validee", options: ["validee", "permanente", "temporaire", "gratuite"] },
  { id: "fb-10", level: "B2", topic: "emploi", sentenceFr: "Les ___ du travail protegent les employés contre les abus.", sentenceEn: "Labour ___ protect employees against abuse.", answer: "normes", options: ["normes", "salaires", "bureaux", "formulaires"] },
  // Articles
  { id: "fb-11", level: "A2", topic: "articles", sentenceFr: "J'ai besoin de ___ passeport valide pour voyager.", sentenceEn: "I need ___ valid passport to travel.", answer: "un", options: ["un", "le", "la", "des"] },
  { id: "fb-12", level: "A2", topic: "articles", sentenceFr: "___ enfants jouent dans le parc.", sentenceEn: "___ children are playing in the park.", answer: "Les", options: ["Les", "Des", "Un", "La"] },
  { id: "fb-13", level: "A2", topic: "articles", sentenceFr: "Elle a achete ___ maison pres du fleuve.", sentenceEn: "She bought ___ house near the river.", answer: "une", options: ["une", "la", "le", "des"] },
  { id: "fb-14", level: "A2", topic: "articles", sentenceFr: "Il y a ___ bons restaurants dans ce quartier.", sentenceEn: "There are ___ good restaurants in this neighbourhood.", answer: "de", options: ["de", "des", "les", "un"] },
  { id: "fb-15", level: "B1", topic: "articles", sentenceFr: "Je ne bois pas ___ cafe le soir.", sentenceEn: "I don't drink ___ coffee in the evening.", answer: "de", options: ["de", "du", "le", "un"] },
  // Prepositions
  { id: "fb-16", level: "A2", topic: "prepositions", sentenceFr: "Je vais ___ l'epicerie acheter du lait.", sentenceEn: "I'm going ___ the grocery store to buy milk.", answer: "a", options: ["a", "en", "au", "dans"] },
  { id: "fb-17", level: "A2", topic: "prepositions", sentenceFr: "Mon frere habite ___ Toronto.", sentenceEn: "My brother lives ___ Toronto.", answer: "a", options: ["a", "en", "au", "dans"] },
  { id: "fb-18", level: "A2", topic: "prepositions", sentenceFr: "Nous allons ___ Portugal cet ete.", sentenceEn: "We are going ___ Portugal this summer.", answer: "au", options: ["au", "en", "a", "aux"] },
  { id: "fb-19", level: "A2", topic: "prepositions", sentenceFr: "Elle travaille ___ un hopital depuis cinq ans.", sentenceEn: "She has worked ___ a hospital for five years.", answer: "dans", options: ["dans", "a", "en", "chez"] },
  { id: "fb-20", level: "B1", topic: "prepositions", sentenceFr: "Le bureau est ___ du supermarche.", sentenceEn: "The office is ___ the supermarket.", answer: "pres", options: ["pres", "dans", "sur", "sous"] },
  { id: "fb-21", level: "A2", topic: "prepositions", sentenceFr: "Les cles sont ___ la table.", sentenceEn: "The keys are ___ the table.", answer: "sur", options: ["sur", "sous", "dans", "a"] },
  // Conjugation
  { id: "fb-22", level: "A2", topic: "conjugation", sentenceFr: "Nous ___ le français chaque jour.", sentenceEn: "We ___ French every day.", answer: "parlons", options: ["parlons", "parle", "parlez", "parlent"] },
  { id: "fb-23", level: "A2", topic: "conjugation", sentenceFr: "Tu ___ a quelle heure demain matin?", sentenceEn: "What time do you ___ tomorrow morning?", answer: "pars", options: ["pars", "part", "partez", "partent"] },
  { id: "fb-24", level: "B1", topic: "conjugation", sentenceFr: "Ils ___ deja quand je suis arrive.", sentenceEn: "They had already ___ when I arrived.", answer: "etaient partis", options: ["etaient partis", "sont partis", "partaient", "partent"] },
  { id: "fb-25", level: "B1", topic: "conjugation", sentenceFr: "Si j'___ le temps, je ferais du benevolat.", sentenceEn: "If I ___ time, I would volunteer.", answer: "avais", options: ["avais", "ai", "aurais", "aurai"] },
  { id: "fb-26", level: "B1", topic: "conjugation", sentenceFr: "Il faut que tu ___ ton formulaire avant vendredi.", sentenceEn: "You must ___ your form before Friday.", answer: "finisses", options: ["finisses", "finis", "finiras", "finissais"] },
  { id: "fb-27", level: "A2", topic: "conjugation", sentenceFr: "Je ___ au bureau a velo tous les jours.", sentenceEn: "I ___ to the office by bike every day.", answer: "vais", options: ["vais", "va", "allons", "vont"] },
  // Pronouns
  { id: "fb-28", level: "A2", topic: "pronouns", sentenceFr: "Ce livre est a toi? Oui, c'est ___ mien.", sentenceEn: "Is this book yours? Yes, it's ___.", answer: "le", options: ["le", "la", "les", "mon"] },
  { id: "fb-29", level: "A2", topic: "pronouns", sentenceFr: "Tu connais Marie? Oui, je ___ connais bien.", sentenceEn: "Do you know Marie? Yes, I know ___ well.", answer: "la", options: ["la", "le", "lui", "les"] },
  { id: "fb-30", level: "B1", topic: "pronouns", sentenceFr: "J'ai parle a mon proprietaire. Je ___ ai demande de reparer le chauffage.", sentenceEn: "I spoke to my landlord. I asked ___ to fix the heating.", answer: "lui", options: ["lui", "le", "la", "leur"] },
  { id: "fb-31", level: "B1", topic: "pronouns", sentenceFr: "Tu as besoin de ces documents? Oui, j'___ ai besoin.", sentenceEn: "Do you need these documents? Yes, I need ___.", answer: "en", options: ["en", "y", "les", "leur"] },
  { id: "fb-32", level: "B1", topic: "pronouns", sentenceFr: "Tu vas a la clinique? Oui, j'___ vais tout de suite.", sentenceEn: "Are you going to the clinic? Yes, I'm going ___ right away.", answer: "y", options: ["y", "en", "la", "lui"] },
  // Negation
  { id: "fb-33", level: "A2", topic: "negation", sentenceFr: "Je ___ veux ___ demenager en hiver.", sentenceEn: "I don't want to move in winter.", answer: "ne / pas", options: ["ne / pas", "ne / plus", "ne / jamais", "ne / rien"] },
  { id: "fb-34", level: "A2", topic: "negation", sentenceFr: "Il ___ y a ___ de places disponibles.", sentenceEn: "There are no longer any spots available.", answer: "n' / plus", options: ["n' / plus", "ne / pas", "n' / jamais", "ne / rien"] },
  { id: "fb-35", level: "B1", topic: "negation", sentenceFr: "Je ___ ai vu ___ d'interessant dans les offres d'emploi.", sentenceEn: "I didn't see anything interesting in the job postings.", answer: "n' / rien", options: ["n' / rien", "ne / pas", "n' / jamais", "ne / plus"] },
  { id: "fb-36", level: "B1", topic: "negation", sentenceFr: "___ ne m'a appele pour l'entrevue.", sentenceEn: "Nobody called me for the interview.", answer: "Personne", options: ["Personne", "Rien", "Jamais", "Plus"] },
  { id: "fb-37", level: "A2", topic: "negation", sentenceFr: "Elle ___ a ___ visite le Vieux-Quebec.", sentenceEn: "She has never visited Old Quebec.", answer: "n' / jamais", options: ["n' / jamais", "ne / pas", "n' / plus", "ne / rien"] },
  // Agreement
  { id: "fb-38", level: "A2", topic: "agreement", sentenceFr: "Ma voisine est tres ___. (gentil)", sentenceEn: "My neighbour (f.) is very ___.", answer: "gentille", options: ["gentille", "gentil", "gentils", "gentilles"] },
  { id: "fb-39", level: "A2", topic: "agreement", sentenceFr: "Les nouvelles etudiantes sont ___ (arrive) hier.", sentenceEn: "The new students (f.) ___ yesterday.", answer: "arrivees", options: ["arrivees", "arrive", "arrives", "arrivee"] },
  { id: "fb-40", level: "B1", topic: "agreement", sentenceFr: "La lettre que j'ai ___ (ecrit) est sur le bureau.", sentenceEn: "The letter I wrote is on the desk.", answer: "ecrite", options: ["ecrite", "ecrit", "ecrites", "ecrits"] },
  { id: "fb-41", level: "B1", topic: "agreement", sentenceFr: "Les documents sont ___ (pret). Vous pouvez les chercher.", sentenceEn: "The documents are ___. You can pick them up.", answer: "prets", options: ["prets", "pret", "prete", "pretes"] },
  { id: "fb-42", level: "A2", topic: "agreement", sentenceFr: "Cette rue est tres ___ (long).", sentenceEn: "This street is very ___.", answer: "longue", options: ["longue", "long", "longs", "longues"] },
];

// ─── MATCHING EXERCISES ───
export interface MatchingExercise {
  id: string;
  level: "A2" | "B1" | "B2";
  topic: string;
  titleFr: string;
  titleEn: string;
  pairs: { left: string; right: string }[];
}

export const MATCHING_EXERCISES: MatchingExercise[] = [
  {
    id: "match-1", level: "A2", topic: "administration",
    titleFr: "Associe le document a sa description",
    titleEn: "Match the document to its description",
    pairs: [
      { left: "NAS", right: "Numéro pour travailler au Canada" },
      { left: "RAMQ", right: "Carte d'assurance maladie du Québec" },
      { left: "Permis de conduire", right: "Document pour conduire un vehicule" },
      { left: "Bail", right: "Contrat de location d'un logement" },
      { left: "CAQ", right: "Certificat d'acceptation du Québec" },
    ],
  },
  {
    id: "match-2", level: "A2", topic: "logement",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Loyer", right: "Rent" },
      { left: "Propriétaire", right: "Landlord" },
      { left: "Locataire", right: "Tenant" },
      { left: "Chauffage", right: "Heating" },
      { left: "Déménagement", right: "Moving" },
    ],
  },
  {
    id: "match-3", level: "B1", topic: "immigration",
    titleFr: "Associe l'acronyme a sa signification",
    titleEn: "Match the acronym to its meaning",
    pairs: [
      { left: "PSTQ", right: "Programme de sélection des travailleurs qualifies" },
      { left: "CRS", right: "Comprehensive Ranking System (federal)" },
      { left: "RCIC", right: "Consultant réglementé en immigration" },
      { left: "OEV", right: "Offre d'emploi validee" },
      { left: "CSQ", right: "Certificat de sélection du Québec" },
    ],
  },
  {
    id: "match-4", level: "B1", topic: "emploi",
    titleFr: "Associe l'action a l'endroit",
    titleEn: "Match the action to the place",
    pairs: [
      { left: "Obtenir un NAS", right: "Service Canada" },
      { left: "Demander la RAMQ", right: "Bureau de la RAMQ" },
      { left: "Contester le loyer", right: "Tribunal administratif du logement" },
      { left: "Faire reconnaitre un diplôme", right: "MIFI (évaluation comparative)" },
      { left: "Simuler son score", right: "etabli. (plateforme)" },
    ],
  },
  {
    id: "match-5", level: "A2", topic: "sante",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Medecin", right: "Doctor" },
      { left: "Ordonnance", right: "Prescription" },
      { left: "Urgences", right: "Emergency room" },
      { left: "Rendez-vous", right: "Appointment" },
      { left: "Pharmacie", right: "Pharmacy" },
    ],
  },
  {
    id: "match-6", level: "A2", topic: "transport",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Autobus", right: "Bus" },
      { left: "Correspondance", right: "Transfer" },
      { left: "Arret", right: "Stop" },
      { left: "Carte OPUS", right: "Transit pass" },
      { left: "Trajet", right: "Route / Trip" },
    ],
  },
  {
    id: "match-7", level: "A2", topic: "logement",
    titleFr: "Associe le mot a sa definition",
    titleEn: "Match the word to its definition",
    pairs: [
      { left: "Studio", right: "Logement d'une seule piece" },
      { left: "3 et demi", right: "Salon, chambre, cuisine, salle de bain" },
      { left: "Concierge", right: "Personne qui s'occupe de l'immeuble" },
      { left: "Préavis", right: "Avis ecrit avant de quitter le logement" },
      { left: "Depot", right: "Montant verse en garantie" },
    ],
  },
  {
    id: "match-8", level: "B1", topic: "emploi",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Salaire", right: "Salary" },
      { left: "Entrevue", right: "Interview" },
      { left: "Poste", right: "Position / Job" },
      { left: "Horaire", right: "Schedule" },
      { left: "Conge", right: "Leave / Time off" },
      { left: "Syndicat", right: "Union" },
    ],
  },
  {
    id: "match-9", level: "B1", topic: "administration",
    titleFr: "Associe le service a sa fonction",
    titleEn: "Match the service to its function",
    pairs: [
      { left: "Revenu Quebec", right: "Declaration d'impots provinciale" },
      { left: "SAAQ", right: "Permis de conduire et immatriculation" },
      { left: "MIFI", right: "Immigration et francisation" },
      { left: "Emploi-Quebec", right: "Aide a la recherche d'emploi" },
      { left: "Hydro-Quebec", right: "Service d'electricite" },
    ],
  },
  {
    id: "match-10", level: "A2", topic: "vie-quotidienne",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Epicerie", right: "Grocery store" },
      { left: "Depanneur", right: "Convenience store" },
      { left: "Caisse populaire", right: "Credit union" },
      { left: "Garderie", right: "Daycare" },
      { left: "Bibliotheque", right: "Library" },
    ],
  },
  {
    id: "match-11", level: "B1", topic: "logement",
    titleFr: "Associe le probleme a la solution",
    titleEn: "Match the problem to the solution",
    pairs: [
      { left: "Loyer trop eleve", right: "Contester au Tribunal du logement" },
      { left: "Chauffage en panne", right: "Aviser le proprietaire par ecrit" },
      { left: "Insectes dans le logement", right: "Appeler un exterminateur (frais du proprio)" },
      { left: "Voisin trop bruyant", right: "Envoyer une mise en demeure" },
      { left: "Besoin de quitter le bail", right: "Trouver un cessionnaire ou sous-locataire" },
    ],
  },
  {
    id: "match-12", level: "A2", topic: "grammaire",
    titleFr: "Associe le pronom au mot qu'il remplace",
    titleEn: "Match the pronoun to what it replaces",
    pairs: [
      { left: "le / la / les", right: "Complement d'objet direct" },
      { left: "lui / leur", right: "Complement d'objet indirect" },
      { left: "y", right: "Un lieu (la-bas)" },
      { left: "en", right: "Une quantite ou 'de + nom'" },
      { left: "qui", right: "Le sujet dans une relative" },
    ],
  },
  {
    id: "match-13", level: "B1", topic: "conjugaison",
    titleFr: "Associe le temps verbal a son usage",
    titleEn: "Match the tense to its usage",
    pairs: [
      { left: "Present", right: "Action habituelle ou en cours" },
      { left: "Passe composé", right: "Action terminee dans le passe" },
      { left: "Imparfait", right: "Description ou habitude passee" },
      { left: "Futur simple", right: "Action prevue dans l'avenir" },
      { left: "Conditionnel", right: "Hypothese ou demande polie" },
    ],
  },
  {
    id: "match-14", level: "A2", topic: "prepositions",
    titleFr: "Associe la preposition au contexte",
    titleEn: "Match the preposition to the context",
    pairs: [
      { left: "a", right: "Devant une ville (a Montreal)" },
      { left: "en", right: "Devant un pays feminin (en France)" },
      { left: "au", right: "Devant un pays masculin (au Canada)" },
      { left: "aux", right: "Devant un pays pluriel (aux Etats-Unis)" },
      { left: "chez", right: "Devant une personne (chez le medecin)" },
    ],
  },
  {
    id: "match-15", level: "B1", topic: "immigration",
    titleFr: "Associe le terme a sa definition",
    titleEn: "Match the term to its definition",
    pairs: [
      { left: "Residence permanente", right: "Statut permettant de vivre au Canada indefiniment" },
      { left: "Permis de travail ferme", right: "Lie a un employeur specifique" },
      { left: "Permis de travail ouvert", right: "Permet de travailler pour n'importe quel employeur" },
      { left: "CSQ", right: "Premiere etape de la selection par le Quebec" },
      { left: "Citoyennete", right: "Statut final avec droit de vote" },
    ],
  },
  {
    id: "match-16", level: "A2", topic: "meteo",
    titleFr: "Associe le mot a sa traduction",
    titleEn: "Match the word to its translation",
    pairs: [
      { left: "Il neige", right: "It's snowing" },
      { left: "Il fait froid", right: "It's cold" },
      { left: "La canicule", right: "Heat wave" },
      { left: "Le verglas", right: "Freezing rain / Ice" },
      { left: "La tempete", right: "Storm" },
    ],
  },
  {
    id: "match-17", level: "B1", topic: "emploi",
    titleFr: "Associe le document a son usage",
    titleEn: "Match the document to its purpose",
    pairs: [
      { left: "CV", right: "Resume de l'experience professionnelle" },
      { left: "Lettre de motivation", right: "Expliquer pourquoi on veut le poste" },
      { left: "Releve d'emploi", right: "Preuve de travail pour l'assurance-emploi" },
      { left: "Talon de paie", right: "Detail du salaire et des deductions" },
      { left: "Contrat de travail", right: "Conditions d'emploi signees" },
    ],
  },
  {
    id: "match-18", level: "B2", topic: "immigration",
    titleFr: "Associe le critere Arrima a sa description",
    titleEn: "Match the Arrima criterion to its description",
    pairs: [
      { left: "Niveau de français", right: "Jusqu'a 260 points selon le TEFAQ/TCF" },
      { left: "Experience de travail", right: "Points pour les annees d'emploi qualifie" },
      { left: "Age", right: "Points maximaux entre 18 et 35 ans" },
      { left: "Scolarite", right: "Points selon le niveau de diplome" },
      { left: "OEV", right: "Jusqu'a 380 points pour une offre validee" },
    ],
  },
];

// ─── WORD ORDER EXERCISES ───
export interface WordOrderExercise {
  id: string;
  level: "A2" | "B1" | "B2";
  topic: string;
  hintFr: string;
  hintEn: string;
  correctSentence: string;
  words: string[]; // shuffled words
}

export const WORD_ORDER_EXERCISES: WordOrderExercise[] = [
  { id: "wo-1", level: "A2", topic: "logement", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Je cherche un appartement a Montreal.", words: ["un", "Montreal.", "cherche", "Je", "appartement", "a"] },
  { id: "wo-2", level: "A2", topic: "emploi", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Mon entrevue est demain matin.", words: ["matin.", "Mon", "demain", "est", "entrevue"] },
  { id: "wo-3", level: "A2", topic: "transport", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Le metro est en panne ce matin.", words: ["matin.", "Le", "en", "ce", "est", "metro", "panne"] },
  { id: "wo-4", level: "B1", topic: "administration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Je dois renouveler mon permis de travail avant mars.", words: ["permis", "travail", "Je", "mars.", "avant", "renouveler", "mon", "de", "dois"] },
  { id: "wo-5", level: "B1", topic: "immigration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Le score minimum pour être invite est de 590 points.", words: ["points.", "Le", "590", "score", "de", "minimum", "est", "invite", "être", "pour"] },
  { id: "wo-6", level: "B2", topic: "immigration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Il faut que je soumette ma déclaration d'intérêt sur Arrima.", words: ["soumette", "faut", "déclaration", "Arrima.", "Il", "d'intérêt", "que", "ma", "je", "sur"] },
  { id: "wo-7", level: "A2", topic: "sante", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "J'ai un rendez-vous chez le medecin demain.", words: ["chez", "demain.", "J'ai", "rendez-vous", "le", "un", "medecin"] },
  { id: "wo-8", level: "A2", topic: "logement", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Le loyer comprend le chauffage et l'eau chaude.", words: ["chaude.", "Le", "et", "loyer", "le", "comprend", "l'eau", "chauffage"] },
  { id: "wo-9", level: "A2", topic: "vie-quotidienne", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Je vais a l'epicerie acheter du pain.", words: ["pain.", "a", "acheter", "vais", "du", "l'epicerie", "Je"] },
  { id: "wo-10", level: "A2", topic: "transport", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "L'autobus numero 55 passe toutes les dix minutes.", words: ["les", "L'autobus", "toutes", "55", "dix", "passe", "minutes.", "numero"] },
  { id: "wo-11", level: "B1", topic: "emploi", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "J'aimerais postuler pour le poste de comptable.", words: ["de", "postuler", "le", "J'aimerais", "comptable.", "pour", "poste"] },
  { id: "wo-12", level: "B1", topic: "logement", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Le proprietaire ne peut pas augmenter le loyer sans préavis.", words: ["augmenter", "loyer", "Le", "le", "peut", "préavis.", "sans", "ne", "proprietaire", "pas"] },
  { id: "wo-13", level: "B1", topic: "sante", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Le delai de carence pour la RAMQ est de trois mois.", words: ["mois.", "Le", "la", "trois", "est", "carence", "de", "RAMQ", "delai", "de", "pour"] },
  { id: "wo-14", level: "A2", topic: "administration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Il faut apporter deux pieces d'identite avec photo.", words: ["faut", "photo.", "d'identite", "avec", "deux", "Il", "pieces", "apporter"] },
  { id: "wo-15", level: "B1", topic: "immigration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Mon permis de travail expire dans six mois.", words: ["mois.", "permis", "travail", "Mon", "six", "expire", "de", "dans"] },
  { id: "wo-16", level: "A2", topic: "negation", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Je ne parle pas encore très bien français.", words: ["très", "français.", "pas", "parle", "ne", "encore", "bien", "Je"] },
  { id: "wo-17", level: "B1", topic: "emploi", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Pourriez-vous m'envoyer la description du poste par courriel?", words: ["par", "du", "m'envoyer", "courriel?", "Pourriez-vous", "description", "poste", "la"] },
  { id: "wo-18", level: "B2", topic: "immigration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "L'evaluation comparative des etudes est necessaire pour certains emplois.", words: ["est", "certains", "etudes", "L'evaluation", "des", "emplois.", "pour", "comparative", "necessaire"] },
  { id: "wo-19", level: "A2", topic: "logement", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Nous avons signe le bail pour un an.", words: ["le", "un", "signe", "pour", "Nous", "bail", "an.", "avons"] },
  { id: "wo-20", level: "B1", topic: "conjugaison", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Quand j'habitais en France, je prenais le metro chaque jour.", words: ["chaque", "France,", "en", "le", "prenais", "jour.", "Quand", "j'habitais", "metro", "je"] },
  { id: "wo-21", level: "A2", topic: "pronoms", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "C'est le quartier ou j'habite depuis deux ans.", words: ["deux", "j'habite", "ou", "le", "C'est", "ans.", "depuis", "quartier"] },
  { id: "wo-22", level: "B1", topic: "administration", hintFr: "Formez la phrase correcte", hintEn: "Form the correct sentence", correctSentence: "Vous devez remplir le formulaire en ligne avant la date limite.", words: ["la", "le", "en", "limite.", "devez", "date", "remplir", "Vous", "formulaire", "ligne", "avant"] },
];

// ─── PRONUNCIATION GUIDE ───
export interface PronunciationRule {
  id: string;
  soundFr: string;
  soundEn: string;
  phonetic: string;
  examples: { word: string; phonetic: string; meaning: string }[];
  tip: string;
}

export const PRONUNCIATION_GUIDE: PronunciationRule[] = [
  { id: "pr-1", soundFr: "Les voyelles nasales (on, an, in)", soundEn: "Nasal vowels (on, an, in)", phonetic: "[ɔ̃] [ɑ̃] [ɛ̃]",
    examples: [{ word: "bon", phonetic: "[bɔ̃]", meaning: "good" }, { word: "dans", phonetic: "[dɑ̃]", meaning: "in" }, { word: "bien", phonetic: "[bjɛ̃]", meaning: "well" }],
    tip: "L'air passe par le nez. Ne prononcez pas le 'n' final." },
  { id: "pr-2", soundFr: "Le 'r' français", soundEn: "The French 'r'", phonetic: "[ʁ]",
    examples: [{ word: "loyer", phonetic: "[lwaje]", meaning: "rent" }, { word: "travail", phonetic: "[tʁavaj]", meaning: "work" }, { word: "rendez-vous", phonetic: "[ʁɑ̃devu]", meaning: "appointment" }],
    tip: "Le 'r' français se prononce dans la gorge (uvulaire), pas avec la langue comme en anglais." },
  { id: "pr-3", soundFr: "Le 'u' français vs 'ou'", soundEn: "French 'u' vs 'ou'", phonetic: "[y] vs [u]",
    examples: [{ word: "rue", phonetic: "[ʁy]", meaning: "street" }, { word: "roue", phonetic: "[ʁu]", meaning: "wheel" }, { word: "bureau", phonetic: "[byʁo]", meaning: "office" }],
    tip: "Pour le [y]: dites 'i' et arrondissez les levres. C'est entre 'ee' et 'oo' anglais." },
  { id: "pr-4", soundFr: "Les liaisons", soundEn: "Liaisons (linking)", phonetic: "—",
    examples: [{ word: "les amis", phonetic: "[le.z‿ami]", meaning: "the friends" }, { word: "un appartement", phonetic: "[œ̃.n‿apaʁtəmɑ̃]", meaning: "an apartment" }, { word: "c'est important", phonetic: "[sɛ.t‿ɛ̃pɔʁtɑ̃]", meaning: "it's important" }],
    tip: "La consonne finale muette se prononce devant une voyelle. Obligatoire apres les articles et pronoms." },
  { id: "pr-5", soundFr: "Le 'e' muet", soundEn: "Silent 'e'", phonetic: "[ə] ou silence",
    examples: [{ word: "je", phonetic: "[ʒə]", meaning: "I" }, { word: "samedi", phonetic: "[samdi]", meaning: "Saturday" }, { word: "boulangerie", phonetic: "[bulɑ̃ʒʁi]", meaning: "bakery" }],
    tip: "En français parle, le 'e' sans accent a la fin des mots est souvent muet. Au Québec, il est encore plus souvent omis." },
  { id: "pr-6", soundFr: "Particularites québécoises", soundEn: "Québec French features", phonetic: "—",
    examples: [{ word: "tu (devant voyelle)", phonetic: "[ts]", meaning: "you" }, { word: "dire", phonetic: "[dzir]", meaning: "to say" }, { word: "icitte (ici)", phonetic: "[isit]", meaning: "here" }],
    tip: "Au Québec, 't' et 'd' devant 'i' et 'u' se prononcent [ts] et [dz]. C'est normal et accepte dans le contexte oral." },
];

// Storage helpers
export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const saved = localStorage.getItem("etabli-progress");
    if (saved) return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PROGRESS;
}

export function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("etabli-progress", JSON.stringify(progress));
  } catch {}
}

// Context
export const ProgressContext = createContext<{
  progress: UserProgress;
  addXP: (amount: number) => void;
  completeExercise: (skillId: string) => void;
  completeLesson: () => void;
  learnWord: (wordId: string) => void;
  earnBadge: (badgeId: string) => void;
  resetProgress: () => void;
}>({
  progress: DEFAULT_PROGRESS,
  addXP: () => {},
  completeExercise: () => {},
  completeLesson: () => {},
  learnWord: () => {},
  earnBadge: () => {},
  resetProgress: () => {},
});

export function useProgress() {
  return useContext(ProgressContext);
}
