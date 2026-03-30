"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  Sparkles,
  Trophy,
  GraduationCap,
  Globe,
  Briefcase,
  Calendar,
  Timer,
  ChevronRight,
  Star,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  Play,
  Square,
  CircleDot,
} from "lucide-react";

// ─── TYPES ───
type Phase = "survey" | "assessment" | "results";
type SurveyStep = 0 | 1 | 2 | 3;
type Skill = "CO" | "CE" | "EE" | "EO";
type CEFRLevel = "A1" | "A2" | "B1" | "B2";

interface SurveyAnswers {
  motivation: string;
  currentLevel: string;
  targetDate: string;
  dailyMinutes: string;
}

interface AssessmentQuestion {
  id: string;
  skill: Skill;
  level: CEFRLevel;
  questionFr: string;
  questionEn: string;
  options: { fr: string; en: string }[];
  correctIndex: number;
  passageFr?: string;
  passageEn?: string;
}

interface SkillResult {
  score: number;
  total: number;
  level: CEFRLevel;
  nclc: number;
}

// ─── SURVEY OPTIONS ───
const MOTIVATIONS = [
  { id: "pstq", iconLabel: "PSTQ", fr: "Immigration au Qu\u00e9bec (PSTQ / Arrima)", en: "Quebec Immigration (PSTQ / Arrima)" },
  { id: "express", iconLabel: "EE", fr: "Entr\u00e9e express (f\u00e9d\u00e9ral)", en: "Express Entry (federal)" },
  { id: "citizenship", iconLabel: "CIT", fr: "Citoyennet\u00e9 canadienne", en: "Canadian Citizenship" },
  { id: "work", iconLabel: "JOB", fr: "Am\u00e9liorer mon fran\u00e7ais au travail", en: "Improve my French at work" },
  { id: "study", iconLabel: "UNI", fr: "\u00c9tudes en fran\u00e7ais", en: "Study in French" },
  { id: "personal", iconLabel: "ME", fr: "D\u00e9veloppement personnel", en: "Personal development" },
];

const LEVELS = [
  { id: "never", fr: "Je n'ai jamais \u00e9tudi\u00e9 le fran\u00e7ais", en: "I have never studied French", emoji: "A0" },
  { id: "beginner", fr: "D\u00e9butant \u2014 je connais quelques mots", en: "Beginner \u2014 I know a few words", emoji: "A1" },
  { id: "intermediate", fr: "Interm\u00e9diaire \u2014 je peux avoir une conversation simple", en: "Intermediate \u2014 I can have a simple conversation", emoji: "B1" },
  { id: "advanced", fr: "Avanc\u00e9 \u2014 je suis \u00e0 l'aise en fran\u00e7ais", en: "Advanced \u2014 I am comfortable in French", emoji: "B2" },
];

const TARGET_DATES = [
  { id: "1-3", fr: "1 \u00e0 3 mois", en: "1 to 3 months" },
  { id: "3-6", fr: "3 \u00e0 6 mois", en: "3 to 6 months" },
  { id: "6-12", fr: "6 \u00e0 12 mois", en: "6 to 12 months" },
  { id: "none", fr: "Pas de date pr\u00e9cise", en: "No specific date" },
];

const DAILY_MINUTES = [
  { id: "10", fr: "10 minutes", en: "10 minutes", label: "10 min" },
  { id: "20", fr: "20 minutes", en: "20 minutes", label: "20 min" },
  { id: "30", fr: "30 minutes", en: "30 minutes", label: "30 min" },
  { id: "60", fr: "60+ minutes", en: "60+ minutes", label: "60+ min" },
];

// ─── ASSESSMENT QUESTIONS ───
const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // CO (Listening) - 5 questions A1 -> B2
  {
    id: "co-1", skill: "CO", level: "A1",
    questionFr: "Vous entendez \u00e0 la radio : \u00ab Bienvenue \u00e0 Montr\u00e9al, la temp\u00e9rature est de -5 degr\u00e9s. \u00bb Quelle est la temp\u00e9rature?",
    questionEn: "You hear on the radio: 'Bienvenue \u00e0 Montr\u00e9al, la temp\u00e9rature est de -5 degr\u00e9s.' What is the temperature?",
    options: [
      { fr: "5 degr\u00e9s", en: "5 degrees" },
      { fr: "-5 degr\u00e9s", en: "-5 degrees" },
      { fr: "15 degr\u00e9s", en: "15 degrees" },
      { fr: "-15 degr\u00e9s", en: "-15 degrees" },
    ],
    correctIndex: 1,
  },
  {
    id: "co-2", skill: "CO", level: "A2",
    questionFr: "Au guichet du m\u00e9tro, on vous dit : \u00ab La station Berri-UQAM est ferm\u00e9e pour travaux. Prenez l'autobus 15 comme remplacement. \u00bb Que devez-vous faire?",
    questionEn: "At the metro counter, you are told: 'La station Berri-UQAM est ferm\u00e9e pour travaux. Prenez l\u2019autobus 15 comme remplacement.' What should you do?",
    options: [
      { fr: "Attendre \u00e0 la station", en: "Wait at the station" },
      { fr: "Prendre l'autobus 15", en: "Take bus 15" },
      { fr: "Aller \u00e0 pied", en: "Walk" },
      { fr: "Appeler un taxi", en: "Call a taxi" },
    ],
    correctIndex: 1,
  },
  {
    id: "co-3", skill: "CO", level: "B1",
    questionFr: "Votre propri\u00e9taire dit : \u00ab Je vais augmenter le loyer de 3% au renouvellement du bail le 1er juillet. Vous avez un mois pour me r\u00e9pondre. \u00bb Quel est le d\u00e9lai pour r\u00e9pondre?",
    questionEn: "Your landlord says: 'I will raise the rent by 3% at the lease renewal on July 1st. You have one month to respond.' What is the deadline to respond?",
    options: [
      { fr: "Une semaine", en: "One week" },
      { fr: "Deux semaines", en: "Two weeks" },
      { fr: "Un mois", en: "One month" },
      { fr: "Trois mois", en: "Three months" },
    ],
    correctIndex: 2,
  },
  {
    id: "co-4", skill: "CO", level: "B1",
    questionFr: "Un conseiller en emploi vous explique : \u00ab Pour faire reconna\u00eetre votre dipl\u00f4me \u00e9tranger, vous devez d\u2019abord obtenir une \u00e9valuation comparative des \u00e9tudes aupr\u00e8s du MIFI. \u00bb Que faut-il obtenir?",
    questionEn: "An employment counselor explains: 'To have your foreign diploma recognized, you must first obtain a comparative education evaluation from the MIFI.' What do you need?",
    options: [
      { fr: "Un nouveau dipl\u00f4me qu\u00e9b\u00e9cois", en: "A new Quebec diploma" },
      { fr: "Une \u00e9valuation comparative du MIFI", en: "A comparative evaluation from MIFI" },
      { fr: "Un permis de travail", en: "A work permit" },
      { fr: "Une lettre de recommandation", en: "A letter of recommendation" },
    ],
    correctIndex: 1,
  },
  {
    id: "co-5", skill: "CO", level: "B2",
    questionFr: "Au bulletin de nouvelles : \u00ab Le gouvernement du Qu\u00e9bec a annonc\u00e9 que les seuils d\u2019immigration seront r\u00e9duits de 20% pour l\u2019ann\u00e9e prochaine, tout en priorisant les profils francophones et les travailleurs dans les domaines de la sant\u00e9 et de la construction. \u00bb Quel est l\u2019objectif principal?",
    questionEn: "On the news: The Quebec government announced a 20% reduction in immigration thresholds for next year, while prioritizing French-speaking profiles and workers in health and construction. What is the main goal?",
    options: [
      { fr: "Augmenter le nombre total d\u2019immigrants", en: "Increase total number of immigrants" },
      { fr: "Fermer compl\u00e8tement l\u2019immigration", en: "Completely close immigration" },
      { fr: "R\u00e9duire les seuils en priorisant certains profils", en: "Reduce thresholds while prioritizing certain profiles" },
      { fr: "Abolir l\u2019exigence du fran\u00e7ais", en: "Abolish the French requirement" },
    ],
    correctIndex: 2,
  },

  // CE (Reading) - 5 questions with passages
  {
    id: "ce-1", skill: "CE", level: "A1",
    passageFr: "AVIS \u2014 Le bureau de Service Canada sera ferm\u00e9 le lundi 24 juin (F\u00eate nationale du Qu\u00e9bec). Horaire r\u00e9gulier le mardi 25 juin.",
    passageEn: "NOTICE \u2014 The Service Canada office will be closed on Monday June 24 (Qu\u00e9bec National Holiday). Regular hours on Tuesday June 25.",
    questionFr: "Quand le bureau sera-t-il ferm\u00e9?",
    questionEn: "When will the office be closed?",
    options: [
      { fr: "Le mardi 25 juin", en: "Tuesday June 25" },
      { fr: "Le lundi 24 juin", en: "Monday June 24" },
      { fr: "Toute la semaine", en: "The whole week" },
      { fr: "Le vendredi", en: "Friday" },
    ],
    correctIndex: 1,
  },
  {
    id: "ce-2", skill: "CE", level: "A2",
    passageFr: "Cher locataire, votre bail se termine le 30 juin 2026. Si vous souhaitez renouveler, aucune action n\u2019est n\u00e9cessaire. Si vous d\u00e9sirez quitter, veuillez nous aviser par \u00e9crit avant le 31 mars 2026.",
    passageEn: "Dear tenant, your lease ends June 30, 2026. If you wish to renew, no action is needed. If you wish to leave, please notify us in writing before March 31, 2026.",
    questionFr: "Que faire si vous voulez garder votre logement?",
    questionEn: "What should you do if you want to keep your apartment?",
    options: [
      { fr: "Envoyer une lettre au propri\u00e9taire", en: "Send a letter to the landlord" },
      { fr: "Rien \u2014 le bail se renouvelle automatiquement", en: "Nothing \u2014 the lease renews automatically" },
      { fr: "Payer un frais de renouvellement", en: "Pay a renewal fee" },
      { fr: "Signer un nouveau bail", en: "Sign a new lease" },
    ],
    correctIndex: 1,
  },
  {
    id: "ce-3", skill: "CE", level: "B1",
    passageFr: "Pour obtenir votre carte d\u2019assurance maladie (RAMQ), vous devez vous pr\u00e9senter en personne avec votre passeport, votre preuve de r\u00e9sidence au Qu\u00e9bec (bail ou facture), et votre permis de travail ou votre confirmation de r\u00e9sidence permanente. Le d\u00e9lai de carence est de trois mois \u00e0 partir de votre date d\u2019arriv\u00e9e.",
    passageEn: "To obtain your health insurance card (RAMQ), you must appear in person with your passport, proof of residence in Quebec (lease or utility bill), and your work permit or permanent residence confirmation. The waiting period is three months from your date of arrival.",
    questionFr: "Lequel de ces documents n\u2019est PAS mentionn\u00e9 comme n\u00e9cessaire?",
    questionEn: "Which of these documents is NOT mentioned as required?",
    options: [
      { fr: "Passeport", en: "Passport" },
      { fr: "Preuve de r\u00e9sidence", en: "Proof of residence" },
      { fr: "Relev\u00e9 bancaire", en: "Bank statement" },
      { fr: "Permis de travail", en: "Work permit" },
    ],
    correctIndex: 2,
  },
  {
    id: "ce-4", skill: "CE", level: "B1",
    passageFr: "Le Programme r\u00e9gulier des travailleurs qualifi\u00e9s (PRTQ) utilise la plateforme Arrima. Les candidats soumettent une d\u00e9claration d\u2019int\u00e9r\u00eat et sont class\u00e9s selon un syst\u00e8me de pointage. Les facteurs incluent l\u2019\u00e2ge, la formation, l\u2019exp\u00e9rience, les comp\u00e9tences linguistiques et la pr\u00e9sence d\u2019une offre d\u2019emploi valid\u00e9e.",
    passageEn: "The Regular Skilled Worker Program (RSWP) uses the Arrima platform. Candidates submit an expression of interest and are ranked by a points system. Factors include age, education, experience, language skills, and a validated job offer.",
    questionFr: "Comment les candidats sont-ils s\u00e9lectionn\u00e9s?",
    questionEn: "How are candidates selected?",
    options: [
      { fr: "Par ordre d\u2019arriv\u00e9e", en: "By order of arrival" },
      { fr: "Par tirage au sort", en: "By lottery" },
      { fr: "Par un syst\u00e8me de pointage", en: "By a points system" },
      { fr: "Par entrevue", en: "By interview" },
    ],
    correctIndex: 2,
  },
  {
    id: "ce-5", skill: "CE", level: "B2",
    passageFr: "Le Tribunal administratif du logement (TAL) est l\u2019instance comp\u00e9tente pour r\u00e9soudre les conflits entre propri\u00e9taires et locataires. Il peut ordonner des r\u00e9parations, fixer le montant du loyer en cas de litige, et m\u00eame r\u00e9silier un bail dans des circonstances exceptionnelles. Le locataire peut contester une hausse de loyer jug\u00e9e excessive en d\u00e9posant une demande dans les 30 jours suivant la r\u00e9ception de l\u2019avis d\u2019augmentation.",
    passageEn: "The Tribunal administratif du logement (TAL) is the competent body to resolve disputes between landlords and tenants. It can order repairs, set the rent amount in case of dispute, and even terminate a lease in exceptional circumstances. The tenant can contest an excessive rent increase by filing a claim within 30 days of receiving the increase notice.",
    questionFr: "Dans quel d\u00e9lai un locataire doit-il contester une hausse de loyer?",
    questionEn: "Within what timeframe must a tenant contest a rent increase?",
    options: [
      { fr: "7 jours", en: "7 days" },
      { fr: "15 jours", en: "15 days" },
      { fr: "30 jours", en: "30 days" },
      { fr: "60 jours", en: "60 days" },
    ],
    correctIndex: 2,
  },

  // EE (Writing) - 5 questions simulating writing assessment via MCQ
  {
    id: "ee-1", skill: "EE", level: "A1",
    questionFr: "Compl\u00e9tez ce courriel : \u00ab Bonjour, je m\u2019appelle Maria. Je ___ un rendez-vous pour mon NAS. \u00bb",
    questionEn: "Complete this email: 'Bonjour, je m\u2019appelle Maria. Je ___ un rendez-vous pour mon NAS.'",
    options: [
      { fr: "voudrais prendre", en: "would like to make" },
      { fr: "vouloir prend", en: "want takes" },
      { fr: "veux prenant", en: "want taking" },
      { fr: "voudrait prends", en: "would like take" },
    ],
    correctIndex: 0,
  },
  {
    id: "ee-2", skill: "EE", level: "A2",
    questionFr: "Quelle phrase est correcte dans un courriel formel \u00e0 votre propri\u00e9taire?",
    questionEn: "Which sentence is correct in a formal email to your landlord?",
    options: [
      { fr: "Salut! C\u2019est quand que tu r\u00e9pares \u00e7a?", en: "Hey! When are you gonna fix that?" },
      { fr: "Je vous \u00e9cris pour signaler un probl\u00e8me de chauffage dans mon logement.", en: "I am writing to report a heating problem in my apartment." },
      { fr: "Faut r\u00e9parer le chauffage l\u00e0.", en: "Gotta fix the heating now." },
      { fr: "Chauffage cass\u00e9. Merci.", en: "Heating broken. Thanks." },
    ],
    correctIndex: 1,
  },
  {
    id: "ee-3", skill: "EE", level: "B1",
    questionFr: "Choisissez la meilleure formule de politesse pour terminer une lettre au MIFI :",
    questionEn: "Choose the best closing formula for a letter to the MIFI:",
    options: [
      { fr: "Bye!", en: "Bye!" },
      { fr: "Veuillez agr\u00e9er, Madame, Monsieur, l\u2019expression de mes salutations distingu\u00e9es.", en: "Please accept, Madam, Sir, the expression of my distinguished greetings." },
      { fr: "Salut et bonne journ\u00e9e", en: "Hi and have a good day" },
      { fr: "Merci beaucoup, \u00e0 bient\u00f4t!", en: "Thanks a lot, see you soon!" },
    ],
    correctIndex: 1,
  },
  {
    id: "ee-4", skill: "EE", level: "B1",
    questionFr: "Pour contester une hausse de loyer, quelle information est essentielle dans votre lettre?",
    questionEn: "To contest a rent increase, what information is essential in your letter?",
    options: [
      { fr: "Votre couleur pr\u00e9f\u00e9r\u00e9e", en: "Your favourite colour" },
      { fr: "Votre adresse, le montant actuel et le montant demand\u00e9", en: "Your address, the current amount and the requested amount" },
      { fr: "Le nom de votre animal de compagnie", en: "Your pet's name" },
      { fr: "La m\u00e9t\u00e9o du jour", en: "Today's weather" },
    ],
    correctIndex: 1,
  },
  {
    id: "ee-5", skill: "EE", level: "B2",
    questionFr: "R\u00e9digez une phrase de transition pour un texte argumentatif sur l\u2019int\u00e9gration au march\u00e9 du travail. Quelle option est la plus adapt\u00e9e?",
    questionEn: "Write a transition sentence for an argumentative text on labour market integration. Which option is most appropriate?",
    options: [
      { fr: "Et pis, c\u2019est comme \u00e7a", en: "And well, that's how it is" },
      { fr: "Par cons\u00e9quent, la reconnaissance des dipl\u00f4mes constitue un enjeu central pour l\u2019int\u00e9gration professionnelle des nouveaux arrivants.", en: "Consequently, diploma recognition constitutes a central issue for the professional integration of newcomers." },
      { fr: "En tout cas, les immigrants travaillent beaucoup", en: "Anyway, immigrants work a lot" },
      { fr: "Bon, c\u2019est compliqu\u00e9 tout \u00e7a", en: "Well, all that is complicated" },
    ],
    correctIndex: 1,
  },

  // EO (Speaking) - 5 self-evaluation style questions
  {
    id: "eo-1", skill: "EO", level: "A1",
    questionFr: "Imaginez que vous devez vous pr\u00e9senter \u00e0 un voisin. Pourriez-vous dire : votre nom, votre pays d\u2019origine et depuis combien de temps vous \u00eates au Qu\u00e9bec?",
    questionEn: "Imagine you need to introduce yourself to a neighbour. Could you say: your name, your country of origin, and how long you\u2019ve been in Quebec?",
    options: [
      { fr: "Non, je ne pourrais pas du tout", en: "No, I could not do this at all" },
      { fr: "Difficilement, avec beaucoup d\u2019h\u00e9sitation", en: "With difficulty, lots of hesitation" },
      { fr: "Oui, avec quelques erreurs", en: "Yes, with some errors" },
      { fr: "Oui, couramment et sans probl\u00e8me", en: "Yes, fluently and without issues" },
    ],
    correctIndex: 2,
  },
  {
    id: "eo-2", skill: "EO", level: "A2",
    questionFr: "Pourriez-vous expliquer au t\u00e9l\u00e9phone \u00e0 Service Canada que vous avez besoin d\u2019un rendez-vous pour votre NAS?",
    questionEn: "Could you explain on the phone to Service Canada that you need an appointment for your SIN?",
    options: [
      { fr: "Non, je ne comprendrais pas la conversation t\u00e9l\u00e9phonique", en: "No, I wouldn\u2019t understand the phone conversation" },
      { fr: "Je pourrais dire quelques mots mais pas expliquer clairement", en: "I could say a few words but not explain clearly" },
      { fr: "Oui, je pourrais expliquer mon besoin avec des phrases simples", en: "Yes, I could explain my need with simple sentences" },
      { fr: "Oui, je serais \u00e0 l\u2019aise et pourrais r\u00e9pondre aux questions", en: "Yes, I would be comfortable and could answer questions" },
    ],
    correctIndex: 2,
  },
  {
    id: "eo-3", skill: "EO", level: "B1",
    questionFr: "Lors d\u2019une entrevue d\u2019emploi en fran\u00e7ais, pourriez-vous d\u00e9crire votre exp\u00e9rience professionnelle et expliquer pourquoi vous \u00eates qualifi\u00e9(e)?",
    questionEn: "During a job interview in French, could you describe your professional experience and explain why you are qualified?",
    options: [
      { fr: "Non, c\u2019est trop difficile pour moi actuellement", en: "No, it\u2019s too difficult for me right now" },
      { fr: "Partiellement, mais je manquerais de vocabulaire sp\u00e9cifique", en: "Partially, but I would lack specific vocabulary" },
      { fr: "Oui, je pourrais me d\u00e9brouiller en structurant mes id\u00e9es", en: "Yes, I could manage by structuring my ideas" },
      { fr: "Oui, avec aisance et pr\u00e9cision", en: "Yes, with ease and precision" },
    ],
    correctIndex: 2,
  },
  {
    id: "eo-4", skill: "EO", level: "B2",
    questionFr: "Pourriez-vous participer \u00e0 une r\u00e9union d\u2019\u00e9quipe en fran\u00e7ais, donner votre opinion et r\u00e9pondre \u00e0 des arguments oppos\u00e9s?",
    questionEn: "Could you participate in a team meeting in French, give your opinion and respond to opposing arguments?",
    options: [
      { fr: "Non, je ne pourrais pas suivre la discussion", en: "No, I couldn\u2019t follow the discussion" },
      { fr: "Je pourrais comprendre mais pas intervenir facilement", en: "I could understand but not easily contribute" },
      { fr: "Je pourrais participer avec un peu de pr\u00e9paration", en: "I could participate with some preparation" },
      { fr: "Oui, je suis \u00e0 l\u2019aise dans ce type de situation", en: "Yes, I am comfortable in this type of situation" },
    ],
    correctIndex: 2,
  },
  {
    id: "eo-5", skill: "EO", level: "B2",
    questionFr: "Pourriez-vous expliquer un probl\u00e8me complexe (ex: contester une d\u00e9cision d\u2019immigration) au t\u00e9l\u00e9phone avec un fonctionnaire?",
    questionEn: "Could you explain a complex issue (e.g., contesting an immigration decision) on the phone with a government official?",
    options: [
      { fr: "Non, c\u2019est bien au-del\u00e0 de mon niveau actuel", en: "No, this is well beyond my current level" },
      { fr: "Je pourrais essayer mais avec beaucoup de difficult\u00e9s", en: "I could try but with a lot of difficulty" },
      { fr: "Oui, en pr\u00e9parant mes arguments \u00e0 l\u2019avance", en: "Yes, by preparing my arguments in advance" },
      { fr: "Oui, sans probl\u00e8me, m\u00eame de fa\u00e7on spontan\u00e9e", en: "Yes, no problem, even spontaneously" },
    ],
    correctIndex: 2,
  },
];

// ─── HELPERS ───
function estimateCEFR(score: number, total: number): CEFRLevel {
  const pct = (score / total) * 100;
  if (pct >= 80) return "B2";
  if (pct >= 60) return "B1";
  if (pct >= 35) return "A2";
  return "A1";
}

function cefrToNCLC(level: CEFRLevel): number {
  switch (level) {
    case "A1": return 2;
    case "A2": return 4;
    case "B1": return 6;
    case "B2": return 8;
  }
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getImmigrationMatch(avgNCLC: number, fr: boolean): { program: string; status: string; color: string }[] {
  const programs = [];
  if (avgNCLC >= 7) {
    programs.push({
      program: fr ? "PSTQ / Arrima (Qu\u00e9bec)" : "PSTQ / Arrima (Quebec)",
      status: fr ? "Niveau comp\u00e9titif" : "Competitive level",
      color: "text-emerald-600",
    });
  } else if (avgNCLC >= 5) {
    programs.push({
      program: fr ? "PSTQ / Arrima (Qu\u00e9bec)" : "PSTQ / Arrima (Quebec)",
      status: fr ? "Niveau minimum atteint" : "Minimum level reached",
      color: "text-amber-600",
    });
  } else {
    programs.push({
      program: fr ? "PSTQ / Arrima (Qu\u00e9bec)" : "PSTQ / Arrima (Quebec)",
      status: fr ? "En dessous du minimum" : "Below minimum",
      color: "text-red-500",
    });
  }

  if (avgNCLC >= 7) {
    programs.push({
      program: fr ? "Entr\u00e9e express (CRS +70 pts)" : "Express Entry (CRS +70 pts)",
      status: fr ? "Excellent \u2014 points maximaux" : "Excellent \u2014 maximum points",
      color: "text-emerald-600",
    });
  } else if (avgNCLC >= 5) {
    programs.push({
      program: fr ? "Entr\u00e9e express (CRS)" : "Express Entry (CRS)",
      status: fr ? "Points partiels" : "Partial points",
      color: "text-amber-600",
    });
  }

  if (avgNCLC >= 4) {
    programs.push({
      program: fr ? "Citoyennet\u00e9 canadienne" : "Canadian Citizenship",
      status: fr ? "Niveau suffisant (NCLC 4+)" : "Sufficient level (NCLC 4+)",
      color: "text-emerald-600",
    });
  } else {
    programs.push({
      program: fr ? "Citoyennet\u00e9 canadienne" : "Canadian Citizenship",
      status: fr ? "NCLC 4 requis" : "NCLC 4 required",
      color: "text-red-500",
    });
  }

  return programs;
}

// ─── RADAR CHART (SVG) ───
function RadarChart({ results }: { results: Record<Skill, SkillResult> }) {
  const skills: Skill[] = ["CO", "CE", "EE", "EO"];
  const labels = ["CO", "CE", "\u00c9E", "\u00c9O"];
  const center = 120;
  const maxR = 90;
  const levels = [1, 2, 3, 4]; // A1=1, A2=2, B1=3, B2=4
  const levelLabels = ["A1", "A2", "B1", "B2"];

  function getPoint(index: number, value: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2;
    const r = (value / 4) * maxR;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  }

  function levelToNum(lv: CEFRLevel): number {
    switch (lv) {
      case "A1": return 1;
      case "A2": return 2;
      case "B1": return 3;
      case "B2": return 4;
    }
  }

  const dataPoints = skills.map((sk, i) => getPoint(i, levelToNum(results[sk].level)));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px] mx-auto">
      {/* Grid rings */}
      {levels.map((lv) => {
        const pts = skills.map((_, i) => getPoint(i, lv));
        return (
          <polygon
            key={lv}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      {/* Axes */}
      {skills.map((_, i) => {
        const p = getPoint(i, 4);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={polygonPoints} fill="rgba(29,158,117,0.2)" stroke="#1D9E75" strokeWidth="2.5" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#1D9E75" stroke="white" strokeWidth="2" />
      ))}
      {/* Labels */}
      {skills.map((_, i) => {
        const p = getPoint(i, 4.6);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#085041]">
            {labels[i]}
          </text>
        );
      })}
      {/* Level labels on first axis */}
      {levels.map((lv) => {
        const p = getPoint(0, lv);
        return (
          <text key={lv} x={p.x + 12} y={p.y - 4} textAnchor="start" className="text-[9px] fill-gray-400">
            {levelLabels[lv - 1]}
          </text>
        );
      })}
    </svg>
  );
}

// ─── MAIN PAGE ───
export default function PlacementPage() {
  return (
    <Shell>
      <PlacementContent />
    </Shell>
  );
}

function PlacementContent() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { addXP } = useProgress();

  // Phase state machine
  const [phase, setPhase] = useState<Phase>("survey");
  const [transitioning, setTransitioning] = useState(false);

  // Survey state
  const [surveyStep, setSurveyStep] = useState<SurveyStep>(0);
  const [survey, setSurvey] = useState<SurveyAnswers>({
    motivation: "",
    currentLevel: "",
    targetDate: "",
    dailyMinutes: "",
  });

  // Assessment state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(20).fill(null));
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Results state
  const [results, setResults] = useState<Record<Skill, SkillResult> | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  // ─── TIMER ───
  useEffect(() => {
    if (phase === "assessment") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // ─── PHASE TRANSITION ───
  const goToPhase = useCallback((next: Phase) => {
    setTransitioning(true);
    setTimeout(() => {
      setPhase(next);
      setTransitioning(false);
    }, 400);
  }, []);

  // ─── SURVEY HANDLERS ───
  const surveyQuestions = [
    {
      titleFr: "Pourquoi apprenez-vous le fran\u00e7ais?",
      titleEn: "Why are you learning French?",
      key: "motivation" as keyof SurveyAnswers,
      options: MOTIVATIONS.map((m) => ({ id: m.id, label: fr ? m.fr : m.en, badge: m.iconLabel })),
    },
    {
      titleFr: "Quel est votre niveau actuel?",
      titleEn: "What is your current level?",
      key: "currentLevel" as keyof SurveyAnswers,
      options: LEVELS.map((l) => ({ id: l.id, label: fr ? l.fr : l.en, badge: l.emoji })),
    },
    {
      titleFr: "Quand est votre examen cible?",
      titleEn: "When is your target exam date?",
      key: "targetDate" as keyof SurveyAnswers,
      options: TARGET_DATES.map((t) => ({ id: t.id, label: fr ? t.fr : t.en, badge: "" })),
    },
    {
      titleFr: "Combien de minutes par jour?",
      titleEn: "How many minutes per day?",
      key: "dailyMinutes" as keyof SurveyAnswers,
      options: DAILY_MINUTES.map((d) => ({ id: d.id, label: fr ? d.fr : d.en, badge: d.label })),
    },
  ];

  function handleSurveySelect(key: keyof SurveyAnswers, value: string) {
    setSurvey((prev) => ({ ...prev, [key]: value }));
  }

  function nextSurveyStep() {
    if (surveyStep < 3) {
      setSurveyStep((s) => (s + 1) as SurveyStep);
    } else {
      // Save survey to localStorage
      try {
        localStorage.setItem("etabli_placement", JSON.stringify(survey));
      } catch {}
      goToPhase("assessment");
    }
  }

  function prevSurveyStep() {
    if (surveyStep > 0) setSurveyStep((s) => (s - 1) as SurveyStep);
  }

  // ─── ASSESSMENT HANDLERS ───
  function selectAnswer(qIndex: number, optionIndex: number) {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  function finishAssessment() {
    if (timerRef.current) clearInterval(timerRef.current);

    const skillScores: Record<Skill, { score: number; total: number }> = {
      CO: { score: 0, total: 5 },
      CE: { score: 0, total: 5 },
      EE: { score: 0, total: 5 },
      EO: { score: 0, total: 5 },
    };

    ASSESSMENT_QUESTIONS.forEach((q, i) => {
      const userAnswer = answers[i];
      if (userAnswer === q.correctIndex) {
        skillScores[q.skill].score++;
      }
    });

    const skillResults: Record<Skill, SkillResult> = {} as Record<Skill, SkillResult>;
    (["CO", "CE", "EE", "EO"] as Skill[]).forEach((sk) => {
      const { score, total } = skillScores[sk];
      const level = estimateCEFR(score, total);
      skillResults[sk] = { score, total, level, nclc: cefrToNCLC(level) };
    });

    setResults(skillResults);

    // Save to localStorage
    try {
      localStorage.setItem(
        "etabli_placement_result",
        JSON.stringify({
          skills: skillResults,
          survey,
          elapsed,
          date: new Date().toISOString(),
        })
      );
    } catch {}

    goToPhase("results");
  }

  function awardXP() {
    if (!xpAwarded) {
      addXP(100);
      setXpAwarded(true);
    }
  }

  // Award XP when results are shown
  useEffect(() => {
    if (phase === "results" && !xpAwarded) {
      awardXP();
    }
  }, [phase]);

  // ─── PROGRESS BAR ───
  const totalSteps = 4 + 20; // 4 survey + 20 questions
  const currentStep = phase === "survey" ? surveyStep : phase === "assessment" ? 4 + currentQ : totalSteps;
  const progressPct = phase === "results" ? 100 : (currentStep / totalSteps) * 100;

  // ─── SURVEY ICONS ───
  const surveyIcons = [
    <Target key="0" className="w-6 h-6" />,
    <BarChart3 key="1" className="w-6 h-6" />,
    <Calendar key="2" className="w-6 h-6" />,
    <Timer key="3" className="w-6 h-6" />,
  ];

  // ─── SKILL ICONS ───
  function SkillIcon({ skill, className }: { skill: Skill; className?: string }) {
    switch (skill) {
      case "CO": return <Headphones className={className} />;
      case "CE": return <BookOpen className={className} />;
      case "EE": return <PenLine className={className} />;
      case "EO": return <Mic className={className} />;
    }
  }

  function skillLabel(skill: Skill): string {
    switch (skill) {
      case "CO": return fr ? "Compr\u00e9hension orale" : "Listening";
      case "CE": return fr ? "Compr\u00e9hension \u00e9crite" : "Reading";
      case "EE": return fr ? "Expression \u00e9crite" : "Writing";
      case "EO": return fr ? "Expression orale" : "Speaking";
    }
  }

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQ];
  const currentSkill = currentQuestion?.skill;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf7] via-white to-[#f8fafc]">
      {/* Top progress bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-medium text-[#085041] whitespace-nowrap">
            {phase === "survey"
              ? fr ? "Profil" : "Profile"
              : phase === "assessment"
              ? fr ? "\u00c9valuation" : "Assessment"
              : fr ? "R\u00e9sultats" : "Results"}
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #1D9E75, #D97706)",
              }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {Math.round(progressPct)}%
          </span>
          {phase === "assessment" && (
            <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatElapsed(elapsed)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`max-w-3xl mx-auto px-4 py-8 transition-all duration-400 ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* ═══════════════ SURVEY PHASE ═══════════════ */}
        {phase === "survey" && (
          <div>
            {/* Header */}
            {surveyStep === 0 && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#085041] to-[#1D9E75] mb-5">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-3">
                  {fr ? "Test de placement" : "Placement Test"}
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto text-lg">
                  {fr
                    ? "En quelques minutes, d\u00e9couvrez votre niveau et obtenez un plan personnalis\u00e9."
                    : "In just a few minutes, discover your level and get a personalized plan."}
                </p>
              </div>
            )}

            {/* Survey step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    step === surveyStep
                      ? "border-[#1D9E75] bg-[#1D9E75] text-white scale-110"
                      : step < surveyStep
                      ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {step < surveyStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Current question */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#085041]/5 text-[#085041]">
                  {surveyIcons[surveyStep]}
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-heading)] text-[#085041]">
                  {fr ? surveyQuestions[surveyStep].titleFr : surveyQuestions[surveyStep].titleEn}
                </h2>
              </div>

              <div className="space-y-3">
                {surveyQuestions[surveyStep].options.map((opt) => {
                  const isSelected = survey[surveyQuestions[surveyStep].key] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSurveySelect(surveyQuestions[surveyStep].key, opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-[#1D9E75] bg-[#1D9E75]/5 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {opt.badge && (
                        <span
                          className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isSelected ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <span className={`flex-1 font-medium ${isSelected ? "text-[#085041]" : "text-gray-700"}`}>
                        {opt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1D9E75] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={prevSurveyStep}
                  disabled={surveyStep === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    surveyStep === 0
                      ? "opacity-0 pointer-events-none"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {fr ? "Pr\u00e9c\u00e9dent" : "Back"}
                </button>
                <button
                  onClick={nextSurveyStep}
                  disabled={!survey[surveyQuestions[surveyStep].key]}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    survey[surveyQuestions[surveyStep].key]
                      ? "bg-gradient-to-r from-[#085041] to-[#1D9E75] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {surveyStep === 3 ? (fr ? "Commencer le test" : "Start the test") : (fr ? "Suivant" : "Next")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ ASSESSMENT PHASE ═══════════════ */}
        {phase === "assessment" && currentQuestion && (
          <div>
            {/* Skill tabs */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {(["CO", "CE", "EE", "EO"] as Skill[]).map((sk) => {
                const startIdx = ASSESSMENT_QUESTIONS.findIndex((q) => q.skill === sk);
                const isActive = currentSkill === sk;
                const isDone = currentQ > startIdx + 4;
                return (
                  <div
                    key={sk}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#085041] text-white"
                        : isDone
                        ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <SkillIcon skill={sk} className="w-3.5 h-3.5" />
                    {sk}
                  </div>
                );
              })}
            </div>

            {/* Question number and skill label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#085041] text-white text-sm font-bold">
                  {currentQ + 1}
                </span>
                <span className="text-sm font-medium text-gray-500">/ 20</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <SkillIcon skill={currentSkill} className="w-4 h-4" />
                {skillLabel(currentSkill)}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                  {currentQuestion.level}
                </span>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Passage (for CE questions) */}
              {currentQuestion.passageFr && (
                <div className="px-6 py-5 bg-gradient-to-r from-[#085041]/[0.03] to-[#1D9E75]/[0.03] border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#085041] uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    {fr ? "Lisez ce texte" : "Read this text"}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[15px] italic">
                    {fr ? currentQuestion.passageFr : currentQuestion.passageEn}
                  </p>
                </div>
              )}

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-[#085041] mb-6 font-[family-name:var(--font-heading)]">
                  {fr ? currentQuestion.questionFr : currentQuestion.questionEn}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, oi) => {
                    const isSelected = answers[currentQ] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => selectAnswer(currentQ, oi)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-[#1D9E75] bg-[#1D9E75]/5 shadow-md"
                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                            isSelected
                              ? "border-[#1D9E75] bg-[#1D9E75] text-white"
                              : "border-gray-300 text-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className={`flex-1 ${isSelected ? "text-[#085041] font-medium" : "text-gray-700"}`}>
                          {fr ? opt.fr : opt.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  if (currentQ > 0) setCurrentQ(currentQ - 1);
                }}
                disabled={currentQ === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  currentQ === 0
                    ? "opacity-30 pointer-events-none text-gray-400"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                {fr ? "Pr\u00e9c\u00e9dent" : "Back"}
              </button>

              {currentQ < 19 ? (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  disabled={answers[currentQ] === null}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    answers[currentQ] !== null
                      ? "bg-gradient-to-r from-[#085041] to-[#1D9E75] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {fr ? "Suivant" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finishAssessment}
                  disabled={answeredCount < 20}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    answeredCount >= 20
                      ? "bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {fr ? "Voir mes r\u00e9sultats" : "See my results"}
                  <Trophy className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Question grid */}
            <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
                {fr ? "Vos r\u00e9ponses" : "Your answers"}
              </p>
              <div className="grid grid-cols-10 gap-2">
                {ASSESSMENT_QUESTIONS.map((_, i) => {
                  const isCurrent = i === currentQ;
                  const isAnswered = answers[i] !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        isCurrent
                          ? "bg-[#085041] text-white ring-2 ring-[#1D9E75] ring-offset-2"
                          : isAnswered
                          ? "bg-[#1D9E75]/10 text-[#1D9E75]"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ RESULTS PHASE ═══════════════ */}
        {phase === "results" && results && (
          <div>
            {/* Hero header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] mb-5 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-2">
                {fr ? "Vos r\u00e9sultats" : "Your Results"}
              </h1>
              <p className="text-gray-500">
                {fr ? `Termin\u00e9 en ${formatElapsed(elapsed)}` : `Completed in ${formatElapsed(elapsed)}`}
              </p>

              {/* XP Banner */}
              <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D97706]/10 to-[#F59E0B]/10 border border-[#D97706]/20">
                <Zap className="w-5 h-5 text-[#D97706]" />
                <span className="font-bold text-[#D97706]">+100 XP</span>
                <span className="text-sm text-[#D97706]/70">
                  {fr ? "pour le test de placement" : "for the placement test"}
                </span>
              </div>
            </div>

            {/* Radar Chart + Scores */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 mb-6">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-6 text-center">
                {fr ? "Votre profil linguistique" : "Your Language Profile"}
              </h2>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <RadarChart results={results} />

                <div className="space-y-4">
                  {(["CO", "CE", "EE", "EO"] as Skill[]).map((sk) => {
                    const r = results[sk];
                    const pct = (r.score / r.total) * 100;
                    return (
                      <div key={sk} className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#085041]/5 text-[#085041]">
                          <SkillIcon skill={sk} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{skillLabel(sk)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#085041]">{r.level}</span>
                              <span className="text-xs text-gray-400">NCLC {r.nclc}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct >= 80
                                    ? "#1D9E75"
                                    : pct >= 60
                                    ? "#D97706"
                                    : pct >= 35
                                    ? "#F59E0B"
                                    : "#EF4444",
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {r.score}/{r.total} {fr ? "bonnes r\u00e9ponses" : "correct answers"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* NCLC Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 mb-6">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {fr ? "Niveau estim\u00e9" : "Estimated Level"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {(["CO", "CE", "EE", "EO"] as Skill[]).map((sk) => {
                  const r = results[sk];
                  return (
                    <div
                      key={sk}
                      className="text-center p-4 rounded-xl bg-gradient-to-b from-[#085041]/[0.03] to-transparent border border-gray-100"
                    >
                      <p className="text-xs font-semibold text-gray-500 mb-1">{sk}</p>
                      <p className="text-2xl font-bold text-[#085041]">{r.level}</p>
                      <p className="text-xs text-gray-400">NCLC {r.nclc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Average */}
              {(() => {
                const avgNCLC = Math.round(
                  (["CO", "CE", "EE", "EO"] as Skill[]).reduce((sum, sk) => sum + results[sk].nclc, 0) / 4
                );
                return (
                  <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-[#085041]/5">
                    <Award className="w-6 h-6 text-[#085041]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {fr ? "Moyenne g\u00e9n\u00e9rale estim\u00e9e" : "Estimated overall average"}
                      </p>
                      <p className="text-xl font-bold text-[#085041]">NCLC {avgNCLC}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Immigration Program Match */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 mb-6">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {fr ? "Correspondance programmes" : "Program Match"}
              </h2>

              {(() => {
                const avgNCLC = Math.round(
                  (["CO", "CE", "EE", "EO"] as Skill[]).reduce((sum, sk) => sum + results[sk].nclc, 0) / 4
                );
                const programs = getImmigrationMatch(avgNCLC, fr);
                return (
                  <div className="space-y-3">
                    {programs.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <span className="font-medium text-gray-700 text-sm">{p.program}</span>
                        <span className={`text-sm font-semibold ${p.color}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Study Plan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#085041] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {fr ? "Votre plan d\u2019\u00e9tude personnalis\u00e9" : "Your Personalized Study Plan"}
              </h2>

              {(() => {
                const minutes = survey.dailyMinutes || "20";
                const hoursPerWeek = Math.round((parseInt(minutes) * 7) / 60);

                // Find weakest skills
                const sorted = (["CO", "CE", "EE", "EO"] as Skill[]).sort(
                  (a, b) => results[a].nclc - results[b].nclc
                );
                const weakest = sorted[0];
                const secondWeakest = sorted[1];

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#D97706]/5 to-[#F59E0B]/5 border border-[#D97706]/10">
                      <Star className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#D97706]">
                          {fr ? `${hoursPerWeek}h par semaine recommand\u00e9es` : `${hoursPerWeek}h per week recommended`}
                        </strong>
                        {" \u2014 "}
                        {fr
                          ? `${minutes} minutes par jour, 7 jours sur 7`
                          : `${minutes} minutes per day, 7 days a week`}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
                          {fr ? "Priorit\u00e9 n\u00b01" : "Priority #1"}
                        </p>
                        <div className="flex items-center gap-2">
                          <SkillIcon skill={weakest} className="w-4 h-4 text-[#085041]" />
                          <span className="font-medium text-gray-700 text-sm">{skillLabel(weakest)}</span>
                          <span className="text-xs text-gray-400">(NCLC {results[weakest].nclc})</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-1">
                          {fr ? "Priorit\u00e9 n\u00b02" : "Priority #2"}
                        </p>
                        <div className="flex items-center gap-2">
                          <SkillIcon skill={secondWeakest} className="w-4 h-4 text-[#085041]" />
                          <span className="font-medium text-gray-700 text-sm">{skillLabel(secondWeakest)}</span>
                          <span className="text-xs text-gray-400">(NCLC {results[secondWeakest].nclc})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      {fr
                        ? "Votre parcours personnalis\u00e9 se concentrera sur vos comp\u00e9tences les plus faibles tout en renfor\u00e7ant vos points forts."
                        : "Your personalized path will focus on your weakest skills while reinforcing your strengths."}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/francisation/parcours"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-[#085041] to-[#1D9E75] text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                {fr ? "Commencer mon parcours personnalis\u00e9" : "Start my personalized journey"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="mt-4 text-sm text-gray-400">
                {fr
                  ? "Votre premier cours adapt\u00e9 \u00e0 votre niveau vous attend."
                  : "Your first course adapted to your level is waiting for you."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
