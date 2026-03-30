"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  PenLine,
  GraduationCap,
  Languages,
  MapPin,
  Lightbulb,
  Crown,
  ArrowRight,
  RotateCcw,
  Zap,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

type QuickAction =
  | "grammar"
  | "rule"
  | "conversation"
  | "study"
  | "translate"
  | "quebec";

/* ──────────────────────────────────────────────
   Pre-built response engine
   ────────────────────────────────────────────── */
interface ResponsePattern {
  keywords: string[];
  responseFr: string;
  responseEn: string;
}

const RESPONSE_PATTERNS: ResponsePattern[] = [
  // 1 - Article errors
  {
    keywords: ["le", "la", "un", "une", "article", "gender", "genre"],
    responseFr: `Bonne question sur les articles!\n\nEn français, chaque nom a un genre (masculin ou feminin). Voici les règles essentielles:\n\n**Articles définis:**\n- le (masculin) : le livre, le bureau\n- la (feminin) : la maison, la ville\n- l' (devant voyelle) : l'école, l'hopital\n- les (pluriel) : les enfants\n\n**Articles indéfinis:**\n- un (masculin) : un ami\n- une (feminin) : une amie\n- des (pluriel) : des amis\n\n**Astuce Québec:** Au Québec, on dit \"la job\" (feminin) alors qu'en France c'est \"le job\" (masculin). Écoutez comment les Québécois utilisent les articles!\n\n+5 XP pour cette question!`,
    responseEn: `Great question about articles!\n\nIn French, every noun has a gender (masculine or feminine). Here are the essential rules:\n\n**Definite articles:**\n- le (masculine): le livre, le bureau\n- la (feminine): la maison, la ville\n- l' (before vowel): l'école, l'hopital\n- les (plural): les enfants\n\n**Indefinite articles:**\n- un (masculine): un ami\n- une (feminine): une amie\n- des (plural): des amis\n\n**Québec tip:** In Québec, they say "la job" (feminine) while in France it's "le job" (masculine). Listen to how Quebecers use articles!\n\n+5 XP for this question!`,
  },
  // 2 - Verb conjugation / tenses
  {
    keywords: [
      "conjugaison", "conjugation", "verbe", "verb", "tense", "temps",
      "present", "passe", "futur", "imparfait", "composé",
    ],
    responseFr: `Parlons conjugaison!\n\nLes temps les plus importants pour le NCLC:\n\n**1. Present de l'indicatif**\nJe parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent\n\n**2. Passe composé** (actions terminees)\nJ'ai parle, j'ai fini, je suis alle(e)\nAstuce: être avec les verbes de mouvement (aller, venir, partir...)\n\n**3. Imparfait** (habitudes, descriptions)\nJe parlais, tu parlais, il parlait...\nFormation: radical du \"nous\" au present + -ais, -ais, -ait, -ions, -iez, -aient\n\n**4. Futur simple**\nJe parlerai, tu parleras...\nFormation: infinitif + -ai, -as, -a, -ons, -ez, -ont\n\n**Au Québec:** On utilise beaucoup le futur proche (je vais parler) au lieu du futur simple dans la conversation.\n\n+5 XP pour cette question!`,
    responseEn: `Let's talk conjugation!\n\nThe most important tenses for NCLC:\n\n**1. Present indicative**\nJe parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent\n\n**2. Passe composé** (completed actions)\nJ'ai parle, j'ai fini, je suis alle(e)\nTip: use "être" with movement verbs (aller, venir, partir...)\n\n**3. Imparfait** (habits, descriptions)\nJe parlais, tu parlais, il parlait...\nFormation: "nous" stem in present + -ais, -ais, -ait, -ions, -iez, -aient\n\n**4. Futur simple**\nJe parlerai, tu parleras...\nFormation: infinitive + -ai, -as, -a, -ons, -ez, -ont\n\n**In Québec:** The near future (je vais parler) is used much more than the simple future in conversation.\n\n+5 XP for this question!`,
  },
  // 3 - Subjunctive
  {
    keywords: ["subjonctif", "subjunctive", "que je", "il faut que", "veuille"],
    responseFr: `Le subjonctif - le mode que tout le monde redoute!\n\n**Quand l'utiliser?**\n- Apres les expressions de volonte: Je veux que tu **viennes**\n- Apres les expressions de doute: Je doute qu'il **soit** la\n- Apres les expressions de sentiment: Je suis content que vous **ayez** reussi\n- Apres \"il faut que\": Il faut que je **fasse** mes devoirs\n- Apres \"bien que / pour que / avant que\"\n\n**Formation:**\nRadical de la 3e personne du pluriel au present + -e, -es, -e, -ions, -iez, -ent\n\n**Verbes irreguliers courants:**\n- être: que je sois, que tu sois...\n- avoir: que j'aie, que tu aies...\n- aller: que j'aille, que tu ailles...\n- faire: que je fasse...\n- pouvoir: que je puisse...\n\n**Astuce:** Au Québec, dans la langue parlee, on evite souvent le subjonctif. Mais pour le NCLC, il faut le connaître!\n\n+5 XP pour cette question!`,
    responseEn: `The subjunctive - the mood everyone dreads!\n\n**When to use it?**\n- After expressions of will: Je veux que tu **viennes**\n- After expressions of doubt: Je doute qu'il **soit** la\n- After expressions of feeling: Je suis content que vous **ayez** reussi\n- After "il faut que": Il faut que je **fasse** mes devoirs\n- After "bien que / pour que / avant que"\n\n**Formation:**\n3rd person plural present stem + -e, -es, -e, -ions, -iez, -ent\n\n**Common irregular verbs:**\n- être: que je sois, que tu sois...\n- avoir: que j'aie, que tu aies...\n- aller: que j'aille, que tu ailles...\n- faire: que je fasse...\n- pouvoir: que je puisse...\n\n**Tip:** In Québec spoken French, the subjunctive is often avoided. But for the NCLC, you need to know it!\n\n+5 XP for this question!`,
  },
  // 4 - Québec expressions
  {
    keywords: [
      "quebec", "québécois", "expression", "joual", "slang",
      "icitte", "pantoute", "tabarnac",
    ],
    responseFr: `Voici des expressions québécoises essentielles!\n\n**Expressions courantes:**\n- **Allo!** = Salut! (informel)\n- **C'est correct** = C'est bon / Pas de problème\n- **Bienvenue** = De rien (réponse a \"merci\")\n- **Icitte** = Ici\n- **Pantoute** = Pas du tout\n- **Avoir de la misere** = Avoir de la difficulté\n- **Être tanne(e)** = En avoir assez\n- **Char** = Voiture\n- **Blonde / Chum** = Petite amie / Petit ami\n- **Depanneur** = Petit magasin de quartier\n- **Tuque** = Bonnet d'hiver\n- **Magasiner** = Faire du shopping\n\n**Expressions imagees:**\n- **Il fait frette!** = Il fait tres froid!\n- **C'est pas pire** = C'est bien / pas mal\n- **Lacher son fou** = S'amuser, se detendre\n- **Être aux oiseaux** = Être tres content\n\n**Au travail:**\n- **Prendre une break** = Prendre une pause\n- **Faire du overtime** = Faire des heures supplémentaires\n\n+5 XP pour cette question!`,
    responseEn: `Here are essential Québec French expressions!\n\n**Common expressions:**\n- **Allo!** = Hi! (informal)\n- **C'est correct** = It's fine / No problem\n- **Bienvenue** = You're welcome (response to "merci")\n- **Icitte** = Here (ici)\n- **Pantoute** = Not at all\n- **Avoir de la misere** = To have difficulty\n- **Être tanne(e)** = To be fed up\n- **Char** = Car\n- **Blonde / Chum** = Girlfriend / Boyfriend\n- **Depanneur** = Corner store\n- **Tuque** = Winter hat\n- **Magasiner** = To go shopping\n\n**Colorful expressions:**\n- **Il fait frette!** = It's very cold!\n- **C'est pas pire** = It's good / not bad\n- **Lacher son fou** = To have fun, let loose\n- **Être aux oiseaux** = To be very happy\n\n**At work:**\n- **Prendre une break** = To take a break\n- **Faire du overtime** = To work overtime\n\n+5 XP for this question!`,
  },
  // 5 - Study plan / NCLC
  {
    keywords: [
      "plan", "étude", "study", "nclc", "niveau", "level", "objectif",
      "goal", "programme", "schedule", "calendrier",
    ],
    responseFr: `Voici un plan d'étude personnalise pour atteindre le NCLC 7!\n\n**Semaine type (15-20h):**\n\n**Lundi - Grammaire (2h)**\n- Reviser un point de grammaire sur etabli.\n- Faire les exercices interactifs\n- Objectif: 1 leçon complété\n\n**Mardi - Compréhension orale (2h)**\n- Écouter 2-3 dialogues sur etabli.\n- Regarder un episode de tele quebecoise\n- Prendre des notes sur le vocabulaire nouveau\n\n**Mercredi - Expression écrite (2h)**\n- Ecrire un courriel formel (plainte, demandé)\n- Pratiquer la redaction avec nos exercices\n\n**Jeudi - Vocabulaire (2h)**\n- Apprendre 20 mots nouveaux\n- Pratiquer avec les flashcards\n- Focus: vocabulaire de l'immigration\n\n**Vendredi - Expression orale (2h)**\n- Pratiquer la prononciation\n- S'enregistrer et s'écouter\n- Decrire des images\n\n**Samedi - Examen blanc (3h)**\n- Faire un test complet sur etabli.\n- Analyser ses erreurs\n\n**Dimanche - Immersion (2h)**\n- Lire le journal (Le Devoir, La Presse)\n- Écouter la radio quebecoise\n\n**Conseil:** La regularite est plus importante que la duree. 30 minutes par jour > 4 heures le weekend!\n\n+5 XP pour cette question!`,
    responseEn: `Here's a personalized study plan to reach NCLC 7!\n\n**Typical week (15-20h):**\n\n**Monday - Grammar (2h)**\n- Review one grammar point on etabli.\n- Complete interactive exercises\n- Goal: 1 complété lesson\n\n**Tuesday - Listening compréhension (2h)**\n- Listen to 2-3 dialogues on etabli.\n- Watch a Québec TV episode\n- Note down new vocabulary\n\n**Wednesday - Written expression (2h)**\n- Write a formal email (complaint, request)\n- Practice writing with our exercises\n\n**Thursday - Vocabulary (2h)**\n- Learn 20 new words\n- Practice with flashcards\n- Focus: immigration vocabulary\n\n**Friday - Oral expression (2h)**\n- Practice pronunciation\n- Record yourself and listen back\n- Describe images\n\n**Saturday - Mock exam (3h)**\n- Take a full test on etabli.\n- Analyze your mistakes\n\n**Sunday - Immersion (2h)**\n- Read newspapers (Le Devoir, La Presse)\n- Listen to Québec radio\n\n**Tip:** Consistency matters more than duration. 30 minutes/day > 4 hours on the weekend!\n\n+5 XP for this question!`,
  },
  // 6 - Translation help
  {
    keywords: [
      "traduire", "translate", "translation", "traduction", "anglais",
      "english", "français", "french", "comment dit", "how to say",
    ],
    responseFr: `Aide a la traduction!\n\nVoici des phrases essentielles pour la vie quotidienne au Québec:\n\n**Au bureau / travail:**\n- I have a meeting = J'ai une reunion\n- Can you send me the file? = Pouvez-vous m'envoyer le dossier?\n- I'll follow up on this = Je vais faire un suivi\n- The deadline is Friday = La date limite est vendredi\n\n**A la banque:**\n- I'd like to open an account = J'aimerais ouvrir un compte\n- What's the interest rate? = Quel est le taux d'intérêt?\n- I need to transfer money = Je dois faire un virement\n\n**Chez le médecin:**\n- I have an appointment = J'ai un rendez-vous\n- I don't feel well = Je ne me sens pas bien\n- I need a prescription = J'ai besoin d'une ordonnance\n- My health insurance card = Ma carte d'assurance maladie (carte RAMQ)\n\n**A l'epicerie:**\n- A bag, please = Un sac, s'il vous plait\n- Is this on sale? = Est-ce en solde?\n- Where is the...? = Ou se trouve le/la...?\n\n**Conseil:** Essayez de penser directement en français plutot que de traduire mot a mot!\n\n+5 XP pour cette question!`,
    responseEn: `Translation help!\n\nHere are essential phrases for daily life in Québec:\n\n**At the office / work:**\n- J'ai une reunion = I have a meeting\n- Pouvez-vous m'envoyer le dossier? = Can you send me the file?\n- Je vais faire un suivi = I'll follow up on this\n- La date limite est vendredi = The deadline is Friday\n\n**At the bank:**\n- J'aimerais ouvrir un compte = I'd like to open an account\n- Quel est le taux d'intérêt? = What's the interest rate?\n- Je dois faire un virement = I need to transfer money\n\n**At the doctor:**\n- J'ai un rendez-vous = I have an appointment\n- Je ne me sens pas bien = I don't feel well\n- J'ai besoin d'une ordonnance = I need a prescription\n- Ma carte d'assurance maladie = My health insurance card (RAMQ card)\n\n**At the grocery store:**\n- Un sac, s'il vous plait = A bag, please\n- Est-ce en solde? = Is this on sale?\n- Ou se trouve le/la...? = Where is the...?\n\n**Tip:** Try to think directly in French rather than translating word by word!\n\n+5 XP for this question!`,
  },
  // 7 - Pronunciation
  {
    keywords: [
      "prononciation", "pronunciation", "prononcer", "pronounce", "accent",
      "son", "sound", "phonetique", "r", "nasal",
    ],
    responseFr: `Guide de prononciation du français québécois!\n\n**Sons difficiles:**\n\n**1. Le \"R\" français**\nC'est un son guttural (au fond de la gorge). Essayez de gargariser doucement.\nExemple: \"rouge\", \"Paris\", \"merci\"\n\n**2. Les voyelles nasales**\n- \"an/en\" [a~] : enfant, dans, comment\n- \"on\" [o~] : bon, maison, pont\n- \"in/ain\" [e~] : vin, pain, matin\n- \"un\" [oe~] : un, brun (rare au Québec)\n\n**3. Le \"u\" français**\nArrondir les levres comme pour \"ou\" mais dire \"i\"\nExemple: \"tu\", \"rue\", \"voiture\"\n\n**Particularites québécoises:**\n- Le \"tu\" se prononce souvent \"tsu\"\n- Le \"du\" se prononce souvent \"dzu\"\n- Les voyelles longues: \"pate\" [pa:t], \"fete\" [fe:t]\n- Le \"-oi\" : \"moi\" peut sonner comme \"moue\"\n\n**Exercice pratique:**\nRepetez: \"Rue de la rue, le mur murmure\"\nRepetez: \"Bonjour monsieur, comment allez-vous aujourd'hui?\"\n\nVisitez notre module de prononciation pour des exercices audio!\n\n+5 XP pour cette question!`,
    responseEn: `Québec French pronunciation guide!\n\n**Difficult sounds:**\n\n**1. The French "R"**\nIt's a guttural sound (back of the throat). Try gargling gently.\nExample: "rouge", "Paris", "merci"\n\n**2. Nasal vowels**\n- "an/en" [a~]: enfant, dans, comment\n- "on" [o~]: bon, maison, pont\n- "in/ain" [e~]: vin, pain, matin\n- "un" [oe~]: un, brun (rare in Québec)\n\n**3. The French "u"**\nRound your lips as if saying "oo" but say "ee"\nExample: "tu", "rue", "voiture"\n\n**Québec particularities:**\n- "tu" is often pronounced "tsu"\n- "du" is often pronounced "dzu"\n- Long vowels: "pate" [pa:t], "fete" [fe:t]\n- The "-oi": "moi" can sound like "moue"\n\n**Practice exercise:**\nRepeat: "Rue de la rue, le mur murmure"\nRepeat: "Bonjour monsieur, comment allez-vous aujourd'hui?"\n\nVisit our pronunciation module for audio exercises!\n\n+5 XP for this question!`,
  },
  // 8 - Settlement vocabulary
  {
    keywords: [
      "immigration", "installation", "settlement", "permis", "visa",
      "residant", "permanent", "citoyennete", "citizenship",
      "caq", "csq", "arrima", "logement", "housing", "emploi",
    ],
    responseFr: `Vocabulaire de l'immigration et de l'installation au Québec!\n\n**Demarches administratives:**\n- CSQ (Certificat de sélection du Québec)\n- CAQ (Certificat d'acceptation du Québec)\n- NAS (Numéro d'assurance sociale) = SIN\n- RAMQ (Regie de l'assurance maladie du Québec)\n- Carte de resident permanent\n- Permis de travail / Permis d'études\n\n**Logement:**\n- Un bail = A lease\n- Un 4 1/2 = Appartement avec 2 chambres (salon, cuisine, 2 chambres, salle de bain)\n- Le loyer = The rent\n- La Regie du logement = Housing board\n- Le déménagement du 1er juillet = Moving day!\n- Chauffage inclus = Heating included\n\n**Emploi:**\n- Un CV = Resume\n- Une entrevue = An interview (au Québec, pas \"interview\")\n- Emploi Québec = Job service center\n- Le salaire minimum\n- Les avantages sociaux = Benefits\n- Un stage = Internship\n\n**Services:**\n- CLSC = Centre de sante local\n- SAQ = Magasin d'alcool\n- SAAQ = Permis de conduire et immatriculation\n- STM / RTC = Transport en commun\n\n+5 XP pour cette question!`,
    responseEn: `Immigration and settlement vocabulary for Québec!\n\n**Administrative procedures:**\n- CSQ (Québec Sélection Certificate)\n- CAQ (Québec Acceptance Certificate)\n- NAS/SIN (Social Insurance Number)\n- RAMQ (Québec Health Insurance Board)\n- Permanent resident card\n- Work permit / Study permit\n\n**Housing:**\n- Un bail = A lease\n- Un 4 1/2 = 2-bedroom apartment (living room, kitchen, 2 bedrooms, bathroom)\n- Le loyer = The rent\n- La Regie du logement = Housing board\n- Le déménagement du 1er juillet = Moving day!\n- Chauffage inclus = Heating included\n\n**Employment:**\n- Un CV = Resume\n- Une entrevue = An interview (in Québec, not "interview")\n- Emploi Québec = Job service center\n- Le salaire minimum = Minimum wage\n- Les avantages sociaux = Benefits\n- Un stage = Internship\n\n**Services:**\n- CLSC = Local health center\n- SAQ = Liquor store\n- SAAQ = Driver's license and registration\n- STM / RTC = Public transit\n\n+5 XP for this question!`,
  },
  // 9 - Formal / informal
  {
    keywords: [
      "formel", "formal", "informel", "informal", "tu", "vous",
      "politesse", "politeness", "courriel", "email", "lettre",
    ],
    responseFr: `Le registre formel vs informel en français!\n\n**Quand utiliser \"vous\":**\n- Avec des inconnus, des aines\n- Au travail (surtout avec les superieurs)\n- Dans les courriels professionnels\n- Avec les fonctionnaires\n- A l'entrevue d'embauche\n\n**Quand utiliser \"tu\":**\n- Avec des amis, la famille\n- Entre collegues du meme niveau (souvent au Québec!)\n- Quand quelqu'un vous dit \"on peut se tutoyer\"\n\n**Particularite quebecoise:** Au Québec, le tutoiement est beaucoup plus repandu qu'en France. On tutoie souvent les serveurs, les vendeurs, et meme parfois les patrons!\n\n**Modeles de courriels:**\n\n*Formel:*\nObjet: Demande de renseignements\nMadame, Monsieur,\nJe me permets de vous ecrire afin de...\nJe vous prie d'agreer mes salutations distinguees.\n\n*Semi-formel:*\nBonjour Madame Tremblay,\nJ'aimerais savoir si...\nCordialement,\n\n*Informel:*\nSalut Marie!\nAs-tu eu le temps de regarder...?\nA bientot!\n\n+5 XP pour cette question!`,
    responseEn: `Formal vs informal register in French!\n\n**When to use "vous":**\n- With strangers, elders\n- At work (especially with superiors)\n- In professional emails\n- With government officials\n- At job interviews\n\n**When to use "tu":**\n- With friends, family\n- Between colleagues at the same level (common in Québec!)\n- When someone says "on peut se tutoyer"\n\n**Québec particularity:** In Québec, "tu" is much more widespread than in France. People often use "tu" with servers, salespeople, and even sometimes with bosses!\n\n**Email templates:**\n\n*Formal:*\nSubject: Request for information\nMadame, Monsieur,\nJe me permets de vous ecrire afin de...\nJe vous prie d'agreer mes salutations distinguees.\n\n*Semi-formal:*\nBonjour Madame Tremblay,\nJ'aimerais savoir si...\nCordialement,\n\n*Informal:*\nSalut Marie!\nAs-tu eu le temps de regarder...?\nA bientot!\n\n+5 XP for this question!`,
  },
  // 10 - Grammar correction
  {
    keywords: [
      "corriger", "correct", "correction", "erreur", "error", "mistake",
      "faute", "verifier", "check", "texte", "text", "phrase", "sentence",
    ],
    responseFr: `Mode correction active!\n\nEnvoyez-moi une phrase ou un texte en français et je vous aiderai a identifier les erreurs courantes.\n\n**Erreurs frequentes chez les apprenants:**\n\n1. **Genre des noms:** \"le problème\" (masculin!), \"la personne\" (toujours feminin)\n2. **Accord des adjectifs:** \"une belle maison\" (pas \"un beau maison\")\n3. **Prepositions:** \"a Montreal\" (pas \"en Montreal\"), \"au Québec\" (pas \"en Québec\")\n4. **Négation:** \"Je ne sais **pas**\" (ne... pas toujours ensemble)\n5. **Auxiliaire être/avoir:** \"Je suis alle\" vs \"J'ai mange\"\n6. **Accord du participe passe:** \"Elle est allee\", \"Les lettres que j'ai ecrites\"\n\n**Astuce:** Relisez toujours votre texte en verifiant:\n- Les accords sujet-verbe\n- Les accords nom-adjectif\n- Les prepositions\n- L'orthographe des mots frequents\n\nEcrivez votre texte ci-dessous et je le corrigerai!\n\n+5 XP pour cette question!`,
    responseEn: `Correction mode activated!\n\nSend me a sentence or text in French and I'll help identify common errors.\n\n**Frequent learner mistakes:**\n\n1. **Noun gender:** "le problème" (masculine!), "la personne" (always feminine)\n2. **Adjective agreement:** "une belle maison" (not "un beau maison")\n3. **Prepositions:** "a Montreal" (not "en Montreal"), "au Québec" (not "en Québec")\n4. **Négation:** "Je ne sais **pas**" (ne... pas always together)\n5. **Être/avoir auxiliary:** "Je suis alle" vs "J'ai mange"\n6. **Past participle agreement:** "Elle est allee", "Les lettres que j'ai ecrites"\n\n**Tip:** Always reread your text checking:\n- Subject-verb agreement\n- Noun-adjective agreement\n- Prepositions\n- Spelling of frequent words\n\nWrite your text below and I'll correct it!\n\n+5 XP for this question!`,
  },
];

/* ── Grammar correction patterns ── */
interface CorrectionRule {
  pattern: RegExp;
  correctionFr: string;
  correctionEn: string;
}

const CORRECTION_RULES: CorrectionRule[] = [
  {
    pattern: /\bje suis\s+(\d+)\s+ans\b/i,
    correctionFr: `**Correction:** On dit \"J'ai ... ans\" (pas \"je suis ... ans\").\nEn français, on utilise le verbe **avoir** pour exprimer l'age.\n- Correct: \"J'ai 30 ans\"\n- Incorrect: \"Je suis 30 ans\"`,
    correctionEn: `**Correction:** Say "J'ai ... ans" (not "je suis ... ans").\nIn French, the verb **avoir** (to have) is used for age.\n- Correct: "J'ai 30 ans"\n- Incorrect: "Je suis 30 ans"`,
  },
  {
    pattern: /\ben montreal\b/i,
    correctionFr: `**Correction:** On dit \"**a** Montreal\" (pas \"en Montreal\").\nOn utilise \"a\" devant les noms de villes: a Québec, a Toronto, a Montreal.\nOn utilise \"en\" devant les pays feminins: en France, en Italie.\nOn utilise \"au\" devant les pays masculins: au Canada, au Québec (province).`,
    correctionEn: `**Correction:** Say "**a** Montreal" (not "en Montreal").\nUse "a" before city names: a Québec, a Toronto, a Montreal.\nUse "en" before feminine countries: en France, en Italie.\nUse "au" before masculine countries/provinces: au Canada, au Québec.`,
  },
  {
    pattern: /\bje suis froid\b/i,
    correctionFr: `**Correction:** On dit \"J'ai froid\" (pas \"je suis froid\").\nEn français, les sensations physiques utilisent **avoir**:\n- J'ai froid / J'ai chaud\n- J'ai faim / J'ai soif\n- J'ai sommeil\n- J'ai peur`,
    correctionEn: `**Correction:** Say "J'ai froid" (not "je suis froid").\nIn French, physical sensations use **avoir**:\n- J'ai froid / J'ai chaud (I'm cold / I'm hot)\n- J'ai faim / J'ai soif (I'm hungry / I'm thirsty)\n- J'ai sommeil (I'm sleepy)\n- J'ai peur (I'm afraid)`,
  },
  {
    pattern: /\bje suis (faim|soif|sommeil|chaud|peur)\b/i,
    correctionFr: `**Correction:** On dit \"J'**ai** $1\" (pas \"je suis $1\").\nEn français, les sensations physiques utilisent le verbe **avoir**, pas **être**:\n- J'ai faim / J'ai soif\n- J'ai chaud / J'ai froid\n- J'ai sommeil / J'ai peur`,
    correctionEn: `**Correction:** Say "J'**ai** $1" (not "je suis $1").\nIn French, physical sensations use **avoir** (to have), not **être** (to be):\n- J'ai faim / J'ai soif\n- J'ai chaud / J'ai froid\n- J'ai sommeil / J'ai peur`,
  },
  {
    pattern: /\bil y a\s+beaucoup\s+des?\b/i,
    correctionFr: `**Correction:** Apres \"beaucoup\", on utilise \"**de**\" (pas \"des\").\n- Correct: \"Il y a beaucoup **de** personnes\"\n- Incorrect: \"Il y a beaucoup **des** personnes\"\n\nC'est la meme règle pour: peu de, assez de, trop de, plus de, moins de.`,
    correctionEn: `**Correction:** After "beaucoup", use "**de**" (not "des").\n- Correct: "Il y a beaucoup **de** personnes"\n- Incorrect: "Il y a beaucoup **des** personnes"\n\nSame rule for: peu de, assez de, trop de, plus de, moins de.`,
  },
];

/* ── Recommended exercises based on topics ── */
interface ExerciseLink {
  titleFr: string;
  titleEn: string;
  href: string;
  icon: typeof BookOpen;
}

const RECOMMENDED_EXERCISES: Record<string, ExerciseLink[]> = {
  grammar: [
    { titleFr: "Leçons de grammaire", titleEn: "Grammar Lessons", href: "/francisation/grammaire", icon: BookOpen },
    { titleFr: "Exercices interactifs", titleEn: "Interactive Exercises", href: "/francisation/exercices", icon: PenLine },
  ],
  vocabulary: [
    { titleFr: "Vocabulaire thematique", titleEn: "Thematic Vocabulary", href: "/francisation/vocabulaire", icon: BookOpen },
    { titleFr: "Pratique rapide", titleEn: "Quick Practice", href: "/francisation/pratique-rapide", icon: Zap },
  ],
  listening: [
    { titleFr: "Compréhension orale", titleEn: "Listening Comprehension", href: "/francisation/comprehension-orale", icon: MessageSquare },
  ],
  pronunciation: [
    { titleFr: "Exercices de prononciation", titleEn: "Pronunciation Exercises", href: "/francisation/prononciation", icon: MessageSquare },
  ],
  writing: [
    { titleFr: "Expression écrite", titleEn: "Written Expression", href: "/francisation/expression-ecrite", icon: PenLine },
    { titleFr: "Dictee", titleEn: "Dictation", href: "/francisation/dictee", icon: PenLine },
  ],
  exam: [
    { titleFr: "Examen blanc NCLC", titleEn: "NCLC Mock Exam", href: "/francisation/examen-blanc", icon: GraduationCap },
    { titleFr: "Auto-évaluation", titleEn: "Self-Assessment", href: "/francisation/auto-evaluation", icon: GraduationCap },
  ],
};

/* ──────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────── */
function AssistantPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { addXP } = useProgress();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeAction, setActiveAction] = useState<QuickAction | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message on first load
  useEffect(() => {
    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      text: fr
        ? "Bonjour! Je suis votre assistant de francisation. Je peux vous aider avec la grammaire, le vocabulaire, la prononciation, les expressions québécoises, et bien plus encore!\n\nChoisissez une action rapide ci-dessus ou posez-moi directement une question."
        : "Hello! I'm your French language assistant. I can help you with grammar, vocabulary, pronunciation, Québec expressions, and much more!\n\nChoose a quick action above or ask me a question directly.",
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, [fr]);

  /* ── Quick action definitions ── */
  const quickActions: {
    key: QuickAction;
    labelFr: string;
    labelEn: string;
    icon: typeof BookOpen;
    promptFr: string;
    promptEn: string;
  }[] = [
    {
      key: "grammar",
      labelFr: "Corriger mon texte",
      labelEn: "Grammar check",
      icon: PenLine,
      promptFr: "Je voudrais faire corriger un texte en français",
      promptEn: "I'd like to have a French text corrected",
    },
    {
      key: "rule",
      labelFr: "Expliquer une règle",
      labelEn: "Explain a rule",
      icon: Lightbulb,
      promptFr: "Peux-tu m'expliquer une règle de grammaire?",
      promptEn: "Can you explain a grammar rule?",
    },
    {
      key: "conversation",
      labelFr: "Pratiquer conversation",
      labelEn: "Practice conversation",
      icon: MessageSquare,
      promptFr: "Je veux pratiquer la conversation en français",
      promptEn: "I want to practice French conversation",
    },
    {
      key: "study",
      labelFr: "Plan d'étude",
      labelEn: "Study plan",
      icon: GraduationCap,
      promptFr: "Aide-moi a creer un plan d'étude pour le NCLC",
      promptEn: "Help me create a study plan for NCLC",
    },
    {
      key: "translate",
      labelFr: "Traduire",
      labelEn: "Translate",
      icon: Languages,
      promptFr: "J'ai besoin d'aide pour traduire des phrases",
      promptEn: "I need help translating phrases",
    },
    {
      key: "quebec",
      labelFr: "Expressions québécoises",
      labelEn: "Québec expressions",
      icon: MapPin,
      promptFr: "Quelles sont les expressions québécoises courantes?",
      promptEn: "What are common Québec expressions?",
    },
  ];

  /* ── Response matching logic ── */
  function findResponse(userText: string): { fr: string; en: string } {
    const lower = userText.toLowerCase();

    // Check grammar correction rules first
    for (const rule of CORRECTION_RULES) {
      if (rule.pattern.test(lower)) {
        const matchedFr = userText.replace(rule.pattern, rule.correctionFr);
        const matchedEn = userText.replace(rule.pattern, rule.correctionEn);
        const prefix_fr = `J'ai analyse votre texte: \"${userText}\"\n\n`;
        const prefix_en = `I analyzed your text: "${userText}"\n\n`;
        return {
          fr: prefix_fr + (matchedFr !== userText ? rule.correctionFr : rule.correctionFr),
          en: prefix_en + (matchedEn !== userText ? rule.correctionEn : rule.correctionEn),
        };
      }
    }

    // Pattern matching on keywords
    let bestMatch: ResponsePattern | null = null;
    let bestScore = 0;
    for (const pattern of RESPONSE_PATTERNS) {
      let score = 0;
      for (const kw of pattern.keywords) {
        if (lower.includes(kw.toLowerCase())) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    if (bestMatch && bestScore > 0) {
      return { fr: bestMatch.responseFr, en: bestMatch.responseEn };
    }

    // Conversation practice
    if (
      lower.includes("bonjour") ||
      lower.includes("salut") ||
      lower.includes("allo") ||
      lower.includes("hello") ||
      lower.includes("hi")
    ) {
      return {
        fr: "Bonjour! Comment allez-vous aujourd'hui?\n\nPour pratiquer la conversation, essayez de me decrire votre journee en français. Par exemple:\n- Qu'avez-vous fait ce matin?\n- Qu'allez-vous faire ce soir?\n- Comment est la meteo chez vous?\n\nJe suis la pour vous aider!\n\n+5 XP pour cette interaction!",
        en: "Hello! How are you today?\n\nTo practice conversation, try describing your day in French. For example:\n- What did you do this morning?\n- What are you going to do tonight?\n- What's the weather like where you are?\n\nI'm here to help!\n\n+5 XP for this interaction!",
      };
    }

    if (
      lower.includes("merci") ||
      lower.includes("thank")
    ) {
      return {
        fr: "Bienvenue! (C'est la facon quebecoise de dire \"de rien\"!)\n\nN'hesitez pas a me poser d'autres questions. Je suis la pour vous aider dans votre apprentissage du français.\n\n+5 XP pour cette interaction!",
        en: "Bienvenue! (That's the Québec way of saying \"you're welcome\"!)\n\nFeel free to ask me more questions. I'm here to help with your French learning journey.\n\n+5 XP for this interaction!",
      };
    }

    // Default fallback
    return {
      fr: `Merci pour votre message! Voici ce que je peux faire pour vous:\n\n**Grammaire** - Posez des questions sur les articles, les verbes, le subjonctif, etc.\n**Vocabulaire** - Demandez du vocabulaire sur un theme (travail, logement, sante...)\n**Correction** - Ecrivez un texte en français et je vous aiderai a le corriger\n**Traduction** - Demandez comment dire quelque chose en français\n**Expressions québécoises** - Decouvrez le français du Québec\n**Plan d'étude** - Obtenez un plan personnalise pour le NCLC\n\nEssayez l'un des boutons d'action rapide ci-dessus!\n\n+5 XP pour cette interaction!`,
      en: `Thanks for your message! Here's what I can do for you:\n\n**Grammar** - Ask about articles, verbs, subjunctive, etc.\n**Vocabulary** - Request vocabulary on a topic (work, housing, health...)\n**Correction** - Write a text in French and I'll help correct it\n**Translation** - Ask how to say something in French\n**Québec expressions** - Discover Québec French\n**Study plan** - Get a personalized NCLC plan\n\nTry one of the quick action buttons above!\n\n+5 XP for this interaction!`,
    };
  }

  /* ── Get recommended exercises based on recent messages ── */
  function getRecommendedExercises(): ExerciseLink[] {
    const allText = messages.map((m) => m.text.toLowerCase()).join(" ");
    const links: ExerciseLink[] = [];
    const seen = new Set<string>();

    const topicMap: [string[], string][] = [
      [["grammaire", "grammar", "conjugaison", "conjugation", "verbe", "verb", "article", "subjonctif"], "grammar"],
      [["vocabulaire", "vocabulary", "mot", "word", "expression"], "vocabulary"],
      [["écouter", "listen", "oral", "compréhension", "audio"], "listening"],
      [["prononc", "accent", "son", "sound", "phonetique"], "pronunciation"],
      [["ecrire", "write", "ecrit", "courriel", "email", "lettre"], "writing"],
      [["nclc", "examen", "exam", "test", "évaluation", "niveau", "level"], "exam"],
    ];

    for (const [keywords, category] of topicMap) {
      if (keywords.some((kw) => allText.includes(kw)) && RECOMMENDED_EXERCISES[category]) {
        for (const ex of RECOMMENDED_EXERCISES[category]) {
          if (!seen.has(ex.href)) {
            seen.add(ex.href);
            links.push(ex);
          }
        }
      }
    }

    // Always show at least grammar and vocabulary
    if (links.length === 0) {
      links.push(...(RECOMMENDED_EXERCISES.grammar || []), ...(RECOMMENDED_EXERCISES.vocabulary || []));
    }

    return links.slice(0, 4);
  }

  /* ── Send message ── */
  function handleSend(text?: string) {
    const msgText = (text || input).trim();
    if (!msgText) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = findResponse(msgText);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: fr ? response.fr : response.en,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      setInteractionCount((c) => c + 1);
      addXP(5);
    }, 800 + Math.random() * 700);
  }

  /* ── Quick action handler ── */
  function handleQuickAction(action: (typeof quickActions)[number]) {
    setActiveAction(action.key);
    handleSend(fr ? action.promptFr : action.promptEn);
  }

  /* ── Reset chat ── */
  function handleReset() {
    setMessages([]);
    setActiveAction(null);
    setInteractionCount(0);
    // Re-trigger welcome message
    setTimeout(() => {
      const welcome: Message = {
        id: "welcome-" + Date.now(),
        role: "assistant",
        text: fr
          ? "Conversation reintialisee! Comment puis-je vous aider?"
          : "Chat reset! How can I help you?",
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }, 100);
  }

  /* ── Render markdown-like bold ── */
  function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  }

  const recommendations = getRecommendedExercises();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6b56] to-[#1D9E75] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-200 mb-6">
            <Link
              href="/francisation"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Assistant IA" : "AI Assistant"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Bot size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Assistant de francisation" : "French Language Assistant"}
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
                {fr
                  ? "Posez vos questions sur la grammaire, le vocabulaire, la prononciation et la vie au Québec. Votre tuteur personnel est pret!"
                  : "Ask your questions about grammar, vocabulary, pronunciation, and life in Québec. Your personal tutor is ready!"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {/* Quick action buttons */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    const isActive = activeAction === action.key;
                    return (
                      <button
                        key={action.key}
                        onClick={() => handleQuickAction(action)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                          isActive
                            ? "bg-[#085041] text-white border-[#085041] shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#1D9E75] hover:bg-emerald-50 hover:text-[#085041]"
                        }`}
                      >
                        <Icon size={15} />
                        {fr ? action.labelFr : action.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages container */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col" style={{ minHeight: "480px" }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "520px" }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end chat-msg-user" : "justify-start chat-msg-bot"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gray-100 text-gray-800 rounded-br-md"
                            : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center">
                              <Bot size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-semibold text-[#085041]">
                              {fr ? "Assistant etabli." : "etabli. Assistant"}
                            </span>
                          </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {renderText(msg.text)}
                        </div>
                        <div className={`text-xs mt-2 ${msg.role === "user" ? "text-gray-400 text-right" : "text-emerald-400"}`}>
                          {msg.timestamp.toLocaleTimeString(fr ? "fr-CA" : "en-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center">
                            <Bot size={12} className="text-white" />
                          </div>
                          <span className="text-xs font-semibold text-[#085041]">
                            {fr ? "Assistant etabli." : "etabli. Assistant"}
                          </span>
                        </div>
                        <div className="typing-indicator flex gap-1.5">
                          <span style={{ background: "#1D9E75" }} />
                          <span style={{ background: "#1D9E75" }} />
                          <span style={{ background: "#1D9E75" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="border-t border-gray-100 p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={
                        fr
                          ? "Posez une question en français ou en anglais..."
                          : "Ask a question in French or English..."
                      }
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-emerald-200 transition-all placeholder:text-gray-400"
                      style={{ minHeight: "42px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        input.trim() && !isTyping
                          ? "bg-[#1D9E75] text-white hover:bg-[#178a65] shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
                      title={fr ? "Nouvelle conversation" : "New conversation"}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {fr
                      ? "Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne"
                      : "Press Enter to send, Shift+Enter for a new line"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 space-y-4">
              {/* XP counter */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-[#D97706]" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {fr ? "Session d'aujourd'hui" : "Today's Session"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)]">
                      {interactionCount * 5}
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">XP</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-[#D97706] font-[family-name:var(--font-heading)]">
                      {interactionCount}
                    </div>
                    <div className="text-xs text-amber-600 font-medium">
                      {fr ? "Echanges" : "Exchanges"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended exercises */}
              {messages.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={18} className="text-[#085041]" />
                    <h3 className="text-sm font-bold text-gray-900">
                      {fr ? "Exercices recommandes" : "Recommended Exercises"}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {recommendations.map((ex) => {
                      const Icon = ex.icon;
                      return (
                        <Link
                          key={ex.href}
                          href={ex.href}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <Icon size={14} className="text-[#1D9E75]" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#085041] transition-colors">
                            {fr ? ex.titleFr : ex.titleEn}
                          </span>
                          <ArrowRight size={12} className="ml-auto text-gray-300 group-hover:text-[#1D9E75] transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pro tip / Premium */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={18} className="text-[#D97706]" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {fr ? "Version demo" : "Demo Version"}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {fr
                    ? "Cet assistant utilise des réponses pre-construites pour vous aider. Avec le forfait Premium, accedez a des conversations IA illimitees et personnalisees pour un apprentissage encore plus efficace."
                    : "This assistant uses pre-built responses to help you. With the Premium plan, access unlimited personalized AI conversations for even more effective learning."}
                </p>
                <Link
                  href="/tarifs"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-[#D97706] text-white text-sm font-semibold rounded-xl hover:bg-[#b86505] transition-colors shadow-sm"
                >
                  <Sparkles size={14} />
                  {fr ? "Decouvrir Premium" : "Discover Premium"}
                </Link>
              </div>

              {/* Suggested prompts */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {fr ? "Essayez ces questions" : "Try these questions"}
                </h3>
                <div className="space-y-1.5">
                  {[
                    {
                      fr: "Quand utiliser le subjonctif?",
                      en: "When to use the subjunctive?",
                    },
                    {
                      fr: "Vocabulaire pour l'immigration",
                      en: "Immigration vocabulary",
                    },
                    {
                      fr: "Comment prononcer le R?",
                      en: "How to pronounce the French R?",
                    },
                    {
                      fr: "Tu vs vous au Québec?",
                      en: "Tu vs vous in Québec?",
                    },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(fr ? prompt.fr : prompt.en)}
                      disabled={isTyping}
                      className="w-full text-left text-xs text-gray-500 hover:text-[#085041] hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      &quot;{fr ? prompt.fr : prompt.en}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={22} className="text-[#1D9E75]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr
                  ? "Pret pour un examen blanc complet?"
                  : "Ready for a full mock exam?"}
              </h3>
              <p className="text-sm text-gray-500">
                {fr
                  ? "Testez votre niveau avec notre simulation d'examen NCLC complète."
                  : "Test your level with our complete NCLC exam simulation."}
              </p>
            </div>
            <Link
              href="/francisation/examen-blanc"
              className="px-5 py-2.5 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              {fr ? "Examen blanc" : "Mock Exam"}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/francisation"
              className="text-sm text-gray-400 hover:text-[#085041] transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              {fr ? "Retour a Francisation" : "Back to Francisation"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <AssistantPage />
    </Shell>
  );
}
