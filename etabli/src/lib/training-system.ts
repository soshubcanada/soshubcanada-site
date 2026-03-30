"use client";

// ─── ON-SITE TRAINING SYSTEM ───
// Based on: Communicative Language Teaching (CLT), Task-Based Language Teaching (TBLT),
// Alliance Francaise methodology, CEFR action-oriented approach,
// Universite Laval ELUL francisation program, MIDI francisation standards,
// McGill SCS TESL best practices, Goethe-Institut blended learning model

// ─── TRAINER LESSON PLANS ───
// 16-week curriculum from A1 to B2 (NCLC 4 to NCLC 7)

export interface LessonPlan {
  id: string;
  week: number;
  sessionNumber: number; // 1 or 2 per week
  titleFr: string;
  titleEn: string;
  level: "A1" | "A2" | "B1" | "B2";
  nclcTarget: number;
  duration: number; // minutes
  objectives: { fr: string; en: string }[];
  warmUp: ActivityBlock;
  mainActivities: ActivityBlock[];
  practice: ActivityBlock;
  coolDown: ActivityBlock;
  homework: { fr: string; en: string }[];
  materials: string[];
  trainerNotes: { fr: string; en: string }[];
  assessmentCriteria: string[];
  onlineCompanion: string; // link to online exercise
}

export interface ActivityBlock {
  titleFr: string;
  titleEn: string;
  duration: number; // minutes
  type: "individual" | "pair" | "group" | "plenary" | "role-play" | "presentation";
  methodology: string; // CLT, TBLT, etc.
  instructionsFr: string;
  instructionsEn: string;
  materials?: string[];
  differentiation?: { fr: string; en: string }; // for mixed-level groups
}

export const LESSON_PLANS: LessonPlan[] = [
  // ─── WEEKS 1-4: A1 Foundation ───
  {
    id: "lp-w1-s1",
    week: 1, sessionNumber: 1,
    titleFr: "Premiers contacts — Se presenter",
    titleEn: "First Contacts — Introducing yourself",
    level: "A1", nclcTarget: 2, duration: 120,
    objectives: [
      { fr: "Se presenter (nom, origine, profession)", en: "Introduce yourself (name, origin, profession)" },
      { fr: "Utiliser les formules de politesse de base", en: "Use basic politeness formulas" },
      { fr: "Comprendre les salutations formelles et informelles", en: "Understand formal and informal greetings" },
    ],
    warmUp: {
      titleFr: "Tour de table", titleEn: "Icebreaker round",
      duration: 15, type: "plenary", methodology: "CLT — Communicative warm-up",
      instructionsFr: "Chaque participant se présente: 'Bonjour, je m'appelle [nom], je viens de [pays].' Le formateur corrige la prononciation en douceur (feedback positif d'abord).",
      instructionsEn: "Each participant introduces themselves. Trainer corrects pronunciation gently (positive feedback first).",
      differentiation: { fr: "A0: accepter les réponses en anglais avec traduction. A1+: ajouter 'j'habite a...'", en: "A0: accept English answers with translation. A1+: add 'I live in...'" },
    },
    mainActivities: [
      {
        titleFr: "Les salutations — formel vs informel", titleEn: "Greetings — formal vs informal",
        duration: 25, type: "plenary", methodology: "CLT — Présentation phase",
        instructionsFr: "Presenter au tableau: Bonjour/Bonsoir (formel) vs Salut/Allo (informel, typique QC). Expliquer le tutoiement vs vouvoiement au Québec (plus decontracte qu'en France).",
        instructionsEn: "Present on board: formal vs informal greetings. Explain tu/vous in Québec context.",
        materials: ["Tableau/projecteur", "Fiche 1A — Salutations"],
      },
      {
        titleFr: "Dialogues modèles", titleEn: "Model dialogues",
        duration: 20, type: "pair", methodology: "TBLT — Controlled practice",
        instructionsFr: "En paires, pratiquer 3 mini-dialogues: (1) A la reception d'un organisme, (2) Rencontrer un voisin, (3) Premier jour au travail. Changer de partenaire apres chaque dialogue.",
        instructionsEn: "In pairs, practice 3 mini-dialogues. Switch partners after each.",
        materials: ["Fiche 1B — Dialogues modèles"],
        differentiation: { fr: "Debutants: lire les dialogues. Avances: improviser a partir du canevas.", en: "Beginners: read dialogues. Advanced: improvise from outline." },
      },
      {
        titleFr: "Les chiffres 0-20 + telephone", titleEn: "Numbers 0-20 + phone",
        duration: 20, type: "group", methodology: "TPR — Total Physical Response",
        instructionsFr: "Jeu: le formateur dit un chiffre, les participants levent le bon nombre de doigts. Puis: dicter des numéros de telephone (format QC: 514-XXX-XXXX). Chaque participant dicte son numéro a un partenaire.",
        instructionsEn: "Game: trainer says number, participants show fingers. Then: dictate phone numbers in QC format.",
      },
    ],
    practice: {
      titleFr: "Jeu de role — S'inscrire a un organisme", titleEn: "Role-play — Registering at an organization",
      duration: 25, type: "role-play", methodology: "TBLT — Free practice",
      instructionsFr: "Simulation: un participant est l'agent d'accueil, l'autre est le nouvel arrivant. Remplir un formulaire d'inscription simple (nom, prenom, telephone, pays d'origine). Inverser les roles.",
      instructionsEn: "Simulation: one is receptionist, other is newcomer. Fill simple registration form. Switch roles.",
      materials: ["Formulaire d'inscription vierge (photocopie)"],
    },
    coolDown: {
      titleFr: "Bilan et vocabulaire clé", titleEn: "Review and key vocabulary",
      duration: 15, type: "plenary", methodology: "Metacognitive reflection",
      instructionsFr: "Revoir les 10 mots/expressions clés du jour. Chaque participant dit une chose qu'il a apprise aujourd'hui.",
      instructionsEn: "Review 10 key words. Each participant says one thing they learned today.",
    },
    homework: [
      { fr: "Pratiquer les salutations avec 3 personnes cette semaine", en: "Practice greetings with 3 people this week" },
      { fr: "Compléter les exercices en ligne: etabli. → Francisation → Débutant A1", en: "Complete online exercises: etabli. → French → Beginner A1" },
    ],
    materials: ["Tableau blanc / projecteur", "Fiche 1A — Salutations", "Fiche 1B — Dialogues modèles", "Formulaires d'inscription vierges", "Marqueurs de couleur"],
    trainerNotes: [
      { fr: "Creer une atmosphere bienveillante des le premier cours. Beaucoup de participants ont de l'anxiete linguistique.", en: "Create a welcoming atmosphere from day one. Many participants have language anxiety." },
      { fr: "Au Québec, le tutoiement est plus courant qu'en France. Mentionnez-le pour les francophones d'Afrique ou d'Europe.", en: "In Québec, 'tu' is more common than in France. Mention this for African or European francophones." },
    ],
    assessmentCriteria: ["Peut se presenter (nom, origine)", "Peut saluer formellement et informellement", "Peut dicter un numéro de telephone"],
    onlineCompanion: "/francisation/debutant",
  },
  {
    id: "lp-w1-s2",
    week: 1, sessionNumber: 2,
    titleFr: "S'orienter — Le quartier et les services",
    titleEn: "Getting Around — Neighborhood and Services",
    level: "A1", nclcTarget: 2, duration: 120,
    objectives: [
      { fr: "Nommer les lieux importants (CLSC, metro, epicerie, pharmacie)", en: "Name important places (CLSC, metro, grocery, pharmacy)" },
      { fr: "Demander son chemin", en: "Ask for directions" },
      { fr: "Comprendre des indications simples", en: "Understand simple directions" },
    ],
    warmUp: {
      titleFr: "Révision — Salutations en chaine", titleEn: "Review — Greeting chain",
      duration: 10, type: "plenary", methodology: "Spiral review",
      instructionsFr: "Chaque participant salue son voisin de gauche et se présente. En chaine autour de la salle.",
      instructionsEn: "Each participant greets their left neighbor and introduces themselves. Chain around the room.",
    },
    mainActivities: [
      {
        titleFr: "Vocabulaire des lieux", titleEn: "Places vocabulary",
        duration: 25, type: "plenary", methodology: "CLT — Visual-aided presentation",
        instructionsFr: "Projeter une carte du quartier (ou dessiner au tableau). Placer les lieux: metro, autobus, CLSC, Service Canada, epicerie, pharmacie, bibliotheque, école, parc. Prononciation en choeur.",
        instructionsEn: "Project a neighborhood map. Place key locations. Choral pronunciation practice.",
        materials: ["Carte du quartier (projetee)", "Etiquettes des lieux"],
      },
      {
        titleFr: "Demander son chemin", titleEn: "Asking for directions",
        duration: 25, type: "pair", methodology: "TBLT — Information gap",
        instructionsFr: "Partenaire A a une carte avec certains lieux, Partenaire B a les autres. Ils doivent s'échanger les informations: 'Ou est le metro?' → 'C'est tout droit / a gauche / a droite.' Verifier ensemble.",
        instructionsEn: "Information gap: Partner A has some locations, Partner B has others. Exchange: 'Where is the metro?'",
        materials: ["Fiches information gap A et B"],
      },
    ],
    practice: {
      titleFr: "Rallye du quartier (simulation)", titleEn: "Neighborhood rally (simulation)",
      duration: 25, type: "group", methodology: "TBLT — Task completion",
      instructionsFr: "En equipes de 3: une liste de 5 missions ('Trouvez ou obtenir un NAS', 'Trouvez ou recharger la carte OPUS'). Utiliser la carte pour donner les directions.",
      instructionsEn: "Teams of 3: list of 5 missions. Use the map to give directions.",
    },
    coolDown: {
      titleFr: "Bilan + 5 phrases essentielles", titleEn: "Review + 5 essential phrases",
      duration: 15, type: "plenary", methodology: "Scaffolded review",
      instructionsFr: "Les 5 phrases de survie: 'Ou est...?', 'C'est a gauche/droite', 'C'est tout droit', 'C'est pres d'ici?', 'Excusez-moi, je cherche...'",
      instructionsEn: "5 survival phrases for directions.",
    },
    homework: [
      { fr: "Identifier 5 lieux importants pres de chez vous sur Google Maps", en: "Identify 5 important places near your home on Google Maps" },
      { fr: "Exercices en ligne: etabli. → Francisation → Vocabulaire → Transport", en: "Online exercises: etabli. → French → Vocabulary → Transport" },
    ],
    materials: ["Carte du quartier", "Fiches information gap", "Liste de missions"],
    trainerNotes: [
      { fr: "Utiliser des photos reelles de Montreal/Québec pour ancrer l'apprentissage dans le contexte local.", en: "Use real photos of Montreal/Québec to anchor learning in local context." },
    ],
    assessmentCriteria: ["Peut nommer 8+ lieux", "Peut demander son chemin", "Peut donner une direction simple"],
    onlineCompanion: "/francisation/vocabulaire",
  },
  // Week 2
  {
    id: "lp-w2-s1",
    week: 2, sessionNumber: 1,
    titleFr: "Administration — Obtenir ses documents essentiels",
    titleEn: "Administration — Getting Essential Documents",
    level: "A1", nclcTarget: 3, duration: 120,
    objectives: [
      { fr: "Connaître les documents essentiels (NAS, RAMQ, permis de conduire)", en: "Know essential documents (SIN, RAMQ, driver's licence)" },
      { fr: "Comprendre un formulaire administratif simple", en: "Understand a simple administrative form" },
      { fr: "Prendre rendez-vous par telephone (phrases clés)", en: "Make an appointment by phone (key phrases)" },
    ],
    warmUp: {
      titleFr: "Quiz rapide — Lieux et services", titleEn: "Quick quiz — Places and services",
      duration: 10, type: "plenary", methodology: "Retrieval practice",
      instructionsFr: "Questions flash: 'Ou obtenez-vous votre NAS?' → 'Service Canada'. 10 questions, mains levees.",
      instructionsEn: "Flash questions about places and services. Hands up format.",
    },
    mainActivities: [
      {
        titleFr: "Les documents d'immigration", titleEn: "Immigration documents",
        duration: 30, type: "plenary", methodology: "CLT — Authentic materials",
        instructionsFr: "Presenter les vrais documents (copies): NAS, carte RAMQ, CSQ, permis de travail, permis de conduire. Pour chaque: a quoi il sert, ou l'obtenir, quels documents apporter. Vocabulaire: 'demande', 'formulaire', 'délai', 'rendez-vous'.",
        instructionsEn: "Present real document copies. For each: purpose, where to get it, what to bring.",
        materials: ["Copies de documents", "Fiche 2A — Documents essentiels"],
      },
      {
        titleFr: "Remplir un formulaire", titleEn: "Fill out a form",
        duration: 25, type: "individual", methodology: "TBLT — Authentic task",
        instructionsFr: "Distribuer un formulaire simplifie de demande de NAS. Chaque participant le remplit avec ses propres informations. Le formateur circule et aide individuellement.",
        instructionsEn: "Distribute simplified SIN application form. Each participant fills it with their info.",
        materials: ["Formulaire NAS simplifie"],
        differentiation: { fr: "A0: formulaire pre-rempli a compléter. A1: formulaire vierge.", en: "A0: partially filled form. A1: blank form." },
      },
    ],
    practice: {
      titleFr: "Telephone — Prendre rendez-vous", titleEn: "Phone call — Making an appointment",
      duration: 25, type: "pair", methodology: "TBLT — Role-play with script",
      instructionsFr: "En paires, simuler un appel telephonique a Service Canada. Un script est fourni avec les phrases clés. Apres 2 essais avec script, tenter sans script.",
      instructionsEn: "In pairs, simulate a phone call to Service Canada. Script provided, then attempt without.",
      materials: ["Script telephonique — Prendre rendez-vous"],
    },
    coolDown: {
      titleFr: "Checklist de survie administrative", titleEn: "Administrative survival checklist",
      duration: 10, type: "plenary", methodology: "Scaffolded summary",
      instructionsFr: "Distribuer la checklist: les 5 premieres demarches a l'arrivee. Cocher ensemble celles deja faites.",
      instructionsEn: "Distribute checklist: first 5 steps upon arrival. Check off completed ones together.",
    },
    homework: [
      { fr: "Appeler le 311 (info municipale) et poser une question simple", en: "Call 311 (municipal info) and ask a simple question" },
      { fr: "Exercices en ligne: etabli. → Francisation → Vocabulaire → Administration", en: "Online exercises: etabli. → French → Vocabulary → Administration" },
    ],
    materials: ["Copies de documents officiels", "Formulaire NAS simplifie", "Script telephonique", "Checklist administrative"],
    trainerNotes: [
      { fr: "Cette leçon est cruciale — les participants doivent répartir avec une compréhension claire des demarches. Prendre le temps de repondre aux questions individuelles.", en: "This lesson is crucial — participants must leave understanding the steps. Take time for individual questions." },
      { fr: "Attention: certains participants peuvent être anxieux par rapport a leur statut. Rester factuel et bienveillant.", en: "Note: some participants may be anxious about their status. Stay factual and kind." },
    ],
    assessmentCriteria: ["Peut nommer 4 documents essentiels", "Peut remplir un formulaire simple", "Peut prendre rendez-vous par telephone (phrases de base)"],
    onlineCompanion: "/francisation/debutant",
  },
  // Week 3-4: A1/A2 transition
  {
    id: "lp-w3-s1",
    week: 3, sessionNumber: 1,
    titleFr: "Le logement — Chercher et comprendre un bail",
    titleEn: "Housing — Searching and Understanding a Lease",
    level: "A2", nclcTarget: 4, duration: 120,
    objectives: [
      { fr: "Comprendre une annonce de logement (Kijiji, Marketplace)", en: "Understand a housing ad (Kijiji, Marketplace)" },
      { fr: "Connaître ses droits de locataire au Québec", en: "Know tenant rights in Québec" },
      { fr: "Vocabulaire du logement: bail, loyer, chauffage, 4 1/2", en: "Housing vocabulary: lease, rent, heating, 4 1/2" },
    ],
    warmUp: {
      titleFr: "Activite — Votre logement actuel", titleEn: "Activity — Your current housing",
      duration: 10, type: "pair", methodology: "CLT — Personalization",
      instructionsFr: "En paires: decrire votre logement (nombre de pieces, quartier, loyer). Utiliser: 'J'habite dans un 3 1/2 a Cote-des-Neiges. Le loyer est de...'",
      instructionsEn: "In pairs: describe your housing. Use: 'I live in a 3 1/2 in CDN...'",
    },
    mainActivities: [
      {
        titleFr: "Lire une annonce de logement", titleEn: "Read a housing ad",
        duration: 30, type: "group", methodology: "CLT — Authentic document analysis",
        instructionsFr: "Distribuer 4 annonces reelles de Kijiji. En groupes de 3, repondre aux questions: Combien coute le loyer? Le chauffage est inclus? C'est un combien de pieces? Ou est-ce situe? Comparer les annonces.",
        instructionsEn: "Distribute 4 real Kijiji ads. In groups of 3, answer compréhension questions.",
        materials: ["4 annonces Kijiji imprimees", "Fiche compréhension logement"],
      },
      {
        titleFr: "Droits du locataire — Ce que votre proprio NE PEUT PAS faire", titleEn: "Tenant rights — What your landlord CANNOT do",
        duration: 25, type: "plenary", methodology: "CLT — Rights literacy",
        instructionsFr: "Presenter les 5 droits essentiels: pas de dépôt de sécurité, préavis 24h, pas de discrimination, augmentation encadrée, droit au maintien dans les lieux. Discussion: quelqu'un a-t-il eu un problème?",
        instructionsEn: "Present 5 essential rights. Discussion: has anyone had an issue?",
        materials: ["Affiche droits des locataires (TAL)"],
      },
    ],
    practice: {
      titleFr: "Simulation — Visiter un appartement", titleEn: "Simulation — Visiting an apartment",
      duration: 25, type: "role-play", methodology: "TBLT — Transactional role-play",
      instructionsFr: "Role-play: un participant est le propriétaire, l'autre est le locataire potentiel. Le locataire doit poser au moins 5 questions (loyer, chauffage inclus, bail, animaux, stationnement). Fiche aide-memoire fournie.",
      instructionsEn: "Role-play apartment visit. Tenant must ask at least 5 questions.",
      materials: ["Fiche aide-memoire — Questions logement"],
    },
    coolDown: {
      titleFr: "Quiz Kahoot — Vocabulaire du logement", titleEn: "Kahoot Quiz — Housing vocabulary",
      duration: 10, type: "plenary", methodology: "Gamified review",
      instructionsFr: "Quiz interactif de 10 questions sur le vocabulaire et les droits du logement.",
      instructionsEn: "Interactive 10-question quiz on housing vocabulary and rights.",
    },
    homework: [
      { fr: "Trouver 3 annonces de logement en ligne et noter: prix, grandeur, quartier", en: "Find 3 housing ads online and note: price, size, neighborhood" },
      { fr: "Exercices en ligne: etabli. → Francisation → Compréhension écrite", en: "Online: etabli. → French → Reading Comprehension" },
    ],
    materials: ["Annonces Kijiji", "Affiche TAL", "Fiche aide-memoire logement"],
    trainerNotes: [
      { fr: "Le logement est un sujet sensible — certains participants vivent des situations precaires. Être empathique tout en donnant les outils pour se defendre.", en: "Housing is sensitive — some participants may be in precarious situations. Be empathetic while giving tools." },
      { fr: "Rappeler que le 1er juillet est la 'Journee nationale du déménagement' au Québec.", en: "Remind that July 1st is Québec's 'National Moving Day'." },
    ],
    assessmentCriteria: ["Peut comprendre une annonce de logement", "Peut nommer 3 droits du locataire", "Peut poser 5 questions lors d'une visite"],
    onlineCompanion: "/francisation/comprehension-ecrite",
  },
  // Week 5-8: A2/B1 — Employment & Intégration
  {
    id: "lp-w5-s1",
    week: 5, sessionNumber: 1,
    titleFr: "L'emploi — Le CV canadien et l'entrevue",
    titleEn: "Employment — Canadian Resume and Interview",
    level: "A2", nclcTarget: 5, duration: 120,
    objectives: [
      { fr: "Connaître le format du CV canadien (pas de photo, réalisations)", en: "Know the Canadian résumé format (no photo, achievements)" },
      { fr: "Se presenter en entrevue d'emploi", en: "Introduce yourself in a job interview" },
      { fr: "Vocabulaire professionnel de base", en: "Basic professional vocabulary" },
    ],
    warmUp: {
      titleFr: "Brise-glace — Votre parcours professionnel", titleEn: "Icebreaker — Your career path",
      duration: 10, type: "pair", methodology: "CLT — Personalization",
      instructionsFr: "En paires: 'Dans mon pays, je travaillais comme... Au Québec, je voudrais...' 2 minutes chacun.",
      instructionsEn: "In pairs: career in home country vs goals in Québec. 2 minutes each.",
    },
    mainActivities: [
      {
        titleFr: "Le CV canadien — Les règles", titleEn: "Canadian résumé — The rules",
        duration: 30, type: "plenary", methodology: "CLT — Contrastive analysis",
        instructionsFr: "Comparer un CV europeen/africain et un CV canadien. Pas de photo, pas d'age, pas de statut matrimonial. Focus sur les réalisations quantifiables. Donner un gabarit et le remplir ensemble.",
        instructionsEn: "Compare international CV vs Canadian résumé. Focus on quantifiable achievements.",
        materials: ["CV modèle canadien", "CV modèle international (pour comparaison)"],
      },
      {
        titleFr: "Simulation d'entrevue", titleEn: "Interview simulation",
        duration: 30, type: "role-play", methodology: "TBLT — Professional simulation",
        instructionsFr: "Questions classiques: (1) Parlez-moi de vous, (2) Pourquoi ce poste? (3) Forces/faiblesses, (4) Ou vous voyez-vous dans 5 ans? En paires, puis feedback du groupe.",
        instructionsEn: "Classic questions. In pairs, then group feedback.",
        materials: ["Fiche — 10 questions d'entrevue"],
      },
    ],
    practice: {
      titleFr: "Atelier CV — Rédiger votre profil", titleEn: "Resume workshop — Write your profile",
      duration: 25, type: "individual", methodology: "TBLT — Authentic production",
      instructionsFr: "Chaque participant redige la section 'Profil professionnel' de son CV (3-4 lignes). Le formateur circule et corrige individuellement.",
      instructionsEn: "Each participant writes their 'Professional Profile' section. Trainer helps individually.",
    },
    coolDown: {
      titleFr: "Vocabulaire professionnel — 15 mots clés", titleEn: "Professional vocabulary — 15 key words",
      duration: 10, type: "plenary", methodology: "Vocabulary consolidation",
      instructionsFr: "Revoir: poste, emploi, compétence, experience, formation, équipe, horaire, salaire, avantages, contrat, probation, temps plein/partiel, quart de travail, paie, conge.",
      instructionsEn: "Review 15 professional vocabulary words.",
    },
    homework: [
      { fr: "Rédiger votre CV complet au format canadien (2 pages max)", en: "Write your complete Canadian-format resume (2 pages max)" },
      { fr: "Exercices en ligne: etabli. → Francisation → Expression orale", en: "Online: etabli. → French → Oral Expression" },
    ],
    materials: ["CV gabarit canadien", "Fiche entrevue", "Fiche vocabulaire professionnel"],
    trainerNotes: [
      { fr: "La non-reconnaissance des diplômes est un sujet douloureux. Mentionner les alternatives: ECA, diplôme QC, Qualifications Québec.", en: "Credential non-recognition is painful. Mention alternatives: ECA, QC diploma, Qualifications Québec." },
    ],
    assessmentCriteria: ["Peut decrire son parcours professionnel", "Peut repondre a 3 questions d'entrevue", "Peut rédiger un profil CV de 3-4 lignes"],
    onlineCompanion: "/francisation/expression-orale",
  },
  // Week 9-12: B1 — Intermediate Intégration
  {
    id: "lp-w9-s1",
    week: 9, sessionNumber: 1,
    titleFr: "Argumentation — Defendre ses droits",
    titleEn: "Argumentation — Defending your Rights",
    level: "B1", nclcTarget: 6, duration: 120,
    objectives: [
      { fr: "Exprimer un desaccord poliment", en: "Express disagreement politely" },
      { fr: "Structurer un argument (premierement, de plus, en conclusion)", en: "Structure an argument (firstly, moreover, in conclusion)" },
      { fr: "Rédiger une lettre formelle de plainte", en: "Write a formal complaint letter" },
    ],
    warmUp: {
      titleFr: "Debat eclair — Pour ou contre", titleEn: "Lightning debate — For or against",
      duration: 10, type: "plenary", methodology: "CLT — Opinion exchange",
      instructionsFr: "Question: 'Le propriétaire a-t-il le droit d'augmenter le loyer de 15%?' Lever la main pour/contre. 3 participants de chaque cote donnent un argument.",
      instructionsEn: "Question: 'Can the landlord raise rent 15%?' Hands up for/against. 3 per side give an argument.",
    },
    mainActivities: [
      {
        titleFr: "Les connecteurs d'argumentation", titleEn: "Argumentative connectors",
        duration: 25, type: "plenary", methodology: "CLT — Discourse analysis",
        instructionsFr: "Presenter les connecteurs par fonction: introduire (premierement, d'abord), ajouter (de plus, en outre), opposer (cependant, neanmoins, en revanche), conclure (en conclusion, pour conclure). Exercice: classer 15 connecteurs.",
        instructionsEn: "Present connectors by function. Exercise: classify 15 connectors.",
        materials: ["Fiche — Connecteurs logiques"],
      },
      {
        titleFr: "Rédiger une lettre au TAL", titleEn: "Write a letter to the TAL",
        duration: 35, type: "individual", methodology: "TBLT — Authentic writing task",
        instructionsFr: "Scenario: votre propriétaire veut augmenter le loyer de 15%. Le taux recommandé est ~5,9%. Rédiger une lettre au TAL en utilisant le gabarit: (1) Objet, (2) Description, (3) Arguments, (4) Demande. Le formateur circule et corrige.",
        instructionsEn: "Scenario: landlord wants 15% increase. Write a TAL complaint letter using template.",
        materials: ["Gabarit de lettre TAL", "Fiche taux d'augmentation 2025-2026"],
      },
    ],
    practice: {
      titleFr: "Mini-tribunal — Simulation de mediation", titleEn: "Mini-tribunal — Mediation simulation",
      duration: 30, type: "group", methodology: "TBLT — Problem-solving simulation",
      instructionsFr: "Groupes de 4: un juge (TAL), un locataire, un propriétaire, un observateur. Le locataire présente sa plainte, le propriétaire defend sa position. Le juge decide. L'observateur note les arguments. Rotation des roles.",
      instructionsEn: "Groups of 4: judge, tenant, landlord, observer. Present case, defend, decide. Rotate roles.",
    },
    coolDown: {
      titleFr: "Auto-évaluation — Mes compétences argumentatives", titleEn: "Self-assessment — My argumentation skills",
      duration: 10, type: "individual", methodology: "Metacognitive reflection",
      instructionsFr: "Échelle de 1 a 5: (1) Je peux exprimer mon opinion, (2) Je peux donner un argument, (3) Je peux structurer 3 arguments, (4) Je peux contrer un argument, (5) Je peux ecrire une lettre formelle.",
      instructionsEn: "Scale 1-5 self-rating of argumentation skills.",
    },
    homework: [
      { fr: "Ecrire un texte argumentatif de 150 mots: 'Le loyer au Québec est-il trop cher?'", en: "Write 150-word argumentative text: 'Is rent too expensive in Québec?'" },
      { fr: "Exercices en ligne: etabli. → Francisation → Expression écrite", en: "Online: etabli. → French → Written Expression" },
    ],
    materials: ["Fiche connecteurs", "Gabarit lettre TAL", "Scenarios de mediation"],
    trainerNotes: [
      { fr: "Cette leçon est clé pour le NCLC 7. L'argumentation structuree est testee au TCF et TEF.", en: "This lesson is key for NCLC 7. Structured argumentation is tested in TCF and TEF." },
    ],
    assessmentCriteria: ["Peut utiliser 5+ connecteurs logiques", "Peut structurer un argument en 3 parties", "Peut rédiger une lettre formelle"],
    onlineCompanion: "/francisation/expression-ecrite",
  },
  // Week 13-16: B2 — Advanced & Exam Prep
  {
    id: "lp-w13-s1",
    week: 13, sessionNumber: 1,
    titleFr: "Préparation TCF/TEF — Stratégies d'examen",
    titleEn: "TCF/TEF Prep — Exam Strategies",
    level: "B2", nclcTarget: 7, duration: 120,
    objectives: [
      { fr: "Comprendre le format des examens TCF et TEF", en: "Understand TCF and TEF exam formats" },
      { fr: "Maitriser les stratégies de compréhension orale (anticipation, mots-clés)", en: "Master listening strategies (anticipation, keywords)" },
      { fr: "Gestion du temps en situation d'examen", en: "Time management in exam conditions" },
    ],
    warmUp: {
      titleFr: "Quiz — Format TCF vs TEF", titleEn: "Quiz — TCF vs TEF format",
      duration: 10, type: "plenary", methodology: "Schema activation",
      instructionsFr: "Quiz rapide: Combien de questions en CO au TCF? (39) Au TEF? (60). Duree EE? (60 min les deux). Coût approximatif? (300-450$).",
      instructionsEn: "Quick quiz on exam format details.",
    },
    mainActivities: [
      {
        titleFr: "Stratégies de compréhension orale", titleEn: "Listening strategies",
        duration: 30, type: "plenary", methodology: "Strategy training",
        instructionsFr: "Enseigner les 5 stratégies: (1) Lire les questions AVANT l'écoute, (2) Reperer les mots-clés, (3) Anticiper les réponses, (4) Eliminer les distracteurs, (5) Ne pas paniquer si un mot est inconnu. Pratiquer avec 3 extraits.",
        instructionsEn: "Teach 5 listening strategies. Practice with 3 audio extracts.",
        materials: ["Extraits audio TCF (simulation)", "Fiche stratégies CO"],
      },
      {
        titleFr: "Examen blanc chronometré — CO", titleEn: "Timed mock exam — Listening",
        duration: 35, type: "individual", methodology: "Exam simulation",
        instructionsFr: "Simulation de 15 questions CO en conditions reelles (chronometre, pas de pause, une seule écoute). Correction collective et analyse des erreurs.",
        instructionsEn: "Simulate 15 CO questions under real conditions. Collective correction and error analysis.",
        materials: ["Fiches examen blanc CO"],
      },
    ],
    practice: {
      titleFr: "Analyse d'erreurs — Mes points faibles", titleEn: "Error analysis — My weak spots",
      duration: 25, type: "pair", methodology: "Metacognitive — Error pattern analysis",
      instructionsFr: "En paires: échanger les copies et analyser les types d'erreurs (vocabulaire? grammaire? vitesse? piege?). Definir 3 objectifs personnels d'amélioration.",
      instructionsEn: "In pairs: exchange copies and analyze error types. Set 3 personal improvement goals.",
    },
    coolDown: {
      titleFr: "Plan d'étude personnalise", titleEn: "Personalized study plan",
      duration: 10, type: "individual", methodology: "Self-directed learning",
      instructionsFr: "Chaque participant créé son plan de révision: compétences a travailler, nombre d'heures par semaine, date d'examen visee. Utiliser la plateforme etabli. comme support quotidien.",
      instructionsEn: "Each participant creates their study plan using etabli. as daily support.",
    },
    homework: [
      { fr: "Compléter un examen blanc complet sur etabli. → Francisation → Examen blanc", en: "Complete a full mock exam on etabli. → French → Mock Exam" },
      { fr: "Pratiquer 30 min/jour sur la plateforme pendant 2 semaines avant l'examen reel", en: "Practice 30 min/day on the platform for 2 weeks before the real exam" },
    ],
    materials: ["Fiches examen blanc", "Fiche stratégies", "Plan d'étude vierge"],
    trainerNotes: [
      { fr: "Rappeler que le TCF et le TEF sont des examens de NIVEAU, pas de réussite/echec. L'objectif est d'atteindre NCLC 7, pas de 'réussir'.", en: "Remind that TCF/TEF are LEVEL exams, not pass/fail. Goal is reaching NCLC 7." },
      { fr: "Encourager l'utilisation quotidienne de la plateforme etabli. pour la pratique espacee et les exercices interactifs.", en: "Encourage daily use of the etabli. platform for spaced practice and interactive exercises." },
    ],
    assessmentCriteria: ["Peut appliquer 3+ stratégies de CO", "Score >= 70% sur l'examen blanc CO", "Peut analyser ses propres erreurs"],
    onlineCompanion: "/francisation/examen-blanc",
  },
];

// ─── ASSESSMENT RUBRICS ───
// Based on: NCLC descriptors, TCF/TEF scoring, DELF/DALF évaluation grids

export interface AssessmentRubric {
  id: string;
  skill: "CO" | "CE" | "EO" | "EE";
  nclcLevel: number;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  nameFr: string;
  nameEn: string;
  weight: number; // percentage
  levels: {
    score: number; // 0-4
    descFr: string;
    descEn: string;
  }[];
}

export const ASSESSMENT_RUBRICS: AssessmentRubric[] = [
  {
    id: "rubric-eo", skill: "EO", nclcLevel: 7,
    criteria: [
      {
        nameFr: "Aisance et fluidite", nameEn: "Fluency",
        weight: 25,
        levels: [
          { score: 0, descFr: "Incapable de former des phrases", descEn: "Unable to form sentences" },
          { score: 1, descFr: "Phrases tres courtes avec pauses longues", descEn: "Very short sentences with long pauses" },
          { score: 2, descFr: "Phrases simples avec quelques hesitations", descEn: "Simple sentences with some hesitations" },
          { score: 3, descFr: "Discours assez fluide avec quelques hesitations naturelles", descEn: "Fairly fluent speech with natural hesitations" },
          { score: 4, descFr: "Discours fluide, naturel, rythme constant", descEn: "Fluent, natural speech, steady rhythm" },
        ],
      },
      {
        nameFr: "Correction grammaticale", nameEn: "Grammar accuracy",
        weight: 25,
        levels: [
          { score: 0, descFr: "Erreurs constantes empechant la compréhension", descEn: "Constant errors preventing comprehension" },
          { score: 1, descFr: "Erreurs frequentes sur les structures de base", descEn: "Frequent errors on basic structures" },
          { score: 2, descFr: "Structures de base correctes, erreurs sur les complexes", descEn: "Basic structures correct, errors on complex ones" },
          { score: 3, descFr: "Bonne maîtrise avec erreurs occasionnelles", descEn: "Good control with occasional errors" },
          { score: 4, descFr: "Tres bonne maîtrise, erreurs rares et non systematiques", descEn: "Very good control, rare non-systematic errors" },
        ],
      },
      {
        nameFr: "Richesse du vocabulaire", nameEn: "Vocabulary range",
        weight: 25,
        levels: [
          { score: 0, descFr: "Vocabulaire tres limite", descEn: "Very limited vocabulary" },
          { score: 1, descFr: "Vocabulaire de base seulement", descEn: "Basic vocabulary only" },
          { score: 2, descFr: "Vocabulaire suffisant pour les sujets quotidiens", descEn: "Sufficient vocabulary for daily topics" },
          { score: 3, descFr: "Bon répertoire, peut nuancer", descEn: "Good range, can nuance" },
          { score: 4, descFr: "Vocabulaire riche et précis, registre adapte", descEn: "Rich, precise vocabulary, appropriate register" },
        ],
      },
      {
        nameFr: "Coherence et structuration", nameEn: "Coherence and structure",
        weight: 25,
        levels: [
          { score: 0, descFr: "Propos incoherent", descEn: "Incoherent speech" },
          { score: 1, descFr: "Idees juxtaposees sans liens", descEn: "Ideas listed without connections" },
          { score: 2, descFr: "Utilisation de connecteurs simples (et, mais, parce que)", descEn: "Uses simple connectors" },
          { score: 3, descFr: "Discours bien structure avec connecteurs varies", descEn: "Well-structured with varied connectors" },
          { score: 4, descFr: "Argumentation claire, logique, bien articulee", descEn: "Clear, logical, well-articulated argumentation" },
        ],
      },
    ],
  },
  {
    id: "rubric-ee", skill: "EE", nclcLevel: 7,
    criteria: [
      {
        nameFr: "Respect de la consigne", nameEn: "Task completion",
        weight: 20,
        levels: [
          { score: 0, descFr: "Hors sujet", descEn: "Off topic" },
          { score: 1, descFr: "Partiellement conforme", descEn: "Partially on topic" },
          { score: 2, descFr: "Conforme mais incomplet", descEn: "On topic but incomplete" },
          { score: 3, descFr: "Conforme et complet", descEn: "On topic and complete" },
          { score: 4, descFr: "Parfaitement conforme, dépasse les attentes", descEn: "Perfectly on topic, exceeds expectations" },
        ],
      },
      {
        nameFr: "Correction linguistique", nameEn: "Language accuracy",
        weight: 30,
        levels: [
          { score: 0, descFr: "Incomprehensible", descEn: "Incomprehensible" },
          { score: 1, descFr: "Erreurs frequentes (conjugaison, accords, orthographe)", descEn: "Frequent errors (conjugation, agreements, spelling)" },
          { score: 2, descFr: "Erreurs non systematiques, texte comprehensible", descEn: "Non-systematic errors, text comprehensible" },
          { score: 3, descFr: "Bonne maîtrise, quelques erreurs sur les structures complexes", descEn: "Good control, some errors on complex structures" },
          { score: 4, descFr: "Maîtrise quasi parfaite de la langue écrite", descEn: "Near-perfect written language control" },
        ],
      },
      {
        nameFr: "Organisation et coherence", nameEn: "Organization and coherence",
        weight: 25,
        levels: [
          { score: 0, descFr: "Pas de structure visible", descEn: "No visible structure" },
          { score: 1, descFr: "Structure rudimentaire", descEn: "Rudimentary structure" },
          { score: 2, descFr: "Introduction et conclusion, paragraphes", descEn: "Introduction and conclusion, paragraphs" },
          { score: 3, descFr: "Bien organise avec transitions fluides", descEn: "Well organized with smooth transitions" },
          { score: 4, descFr: "Excellente organisation, argumentation progressive", descEn: "Excellent organization, progressive argumentation" },
        ],
      },
      {
        nameFr: "Richesse lexicale et registre", nameEn: "Lexical richness and register",
        weight: 25,
        levels: [
          { score: 0, descFr: "Vocabulaire insuffisant", descEn: "Insufficient vocabulary" },
          { score: 1, descFr: "Vocabulaire repetitif et basique", descEn: "Repetitive, basic vocabulary" },
          { score: 2, descFr: "Vocabulaire adéquat pour le sujet", descEn: "Adequate vocabulary for the topic" },
          { score: 3, descFr: "Vocabulaire varie avec registre adapte", descEn: "Varied vocabulary with appropriate register" },
          { score: 4, descFr: "Vocabulaire riche, précis, nuance, registre soutenu", descEn: "Rich, precise, nuanced vocabulary, formal register" },
        ],
      },
    ],
  },
];

// ─── CLASSROOM ACTIVITY TEMPLATES ───
export interface ClassroomActivity {
  id: string;
  nameFr: string;
  nameEn: string;
  type: "warm-up" | "main" | "practice" | "review" | "assessment";
  methodology: string;
  duration: number;
  groupSize: string;
  levels: string[];
  descFr: string;
  descEn: string;
  steps: { fr: string; en: string }[];
  materials: string[];
  variations: { fr: string; en: string }[];
}

export const CLASSROOM_ACTIVITIES: ClassroomActivity[] = [
  {
    id: "act-1",
    nameFr: "Speed dating linguistique", nameEn: "Language speed dating",
    type: "warm-up", methodology: "CLT — Communicative fluency", duration: 15,
    groupSize: "pairs (rotating)", levels: ["A1", "A2", "B1"],
    descFr: "Les participants changent de partenaire toutes les 2 minutes et repondent a une question différente.",
    descEn: "Participants switch partners every 2 minutes and answer a different question.",
    steps: [
      { fr: "Preparer 8 questions sur des cartes (niveau adapte)", en: "Prepare 8 questions on cards (level-adapted)" },
      { fr: "Disposer les chaises en deux rangees face a face", en: "Arrange chairs in two facing rows" },
      { fr: "Chronometre: 2 minutes par tour", en: "Timer: 2 minutes per round" },
      { fr: "Signal: une rangee se deplace d'une place", en: "Signal: one row shifts one seat" },
    ],
    materials: ["Cartes de questions", "Chronometre"],
    variations: [
      { fr: "A1: questions fermees (oui/non, choix)", en: "A1: closed questions (yes/no, choice)" },
      { fr: "B1: questions ouvertes + argumentation", en: "B1: open questions + argumentation" },
    ],
  },
  {
    id: "act-2",
    nameFr: "Dictee negociee", nameEn: "Negotiated dictation",
    type: "practice", methodology: "Socioconstructivism — Peer learning", duration: 25,
    groupSize: "groups of 3-4", levels: ["A2", "B1", "B2"],
    descFr: "Le formateur dicte un texte. Les participants ecrivent individuellement, puis comparent en groupe et negocient l'orthographe correcte.",
    descEn: "Trainer dictates. Participants write individually, then compare in groups and negotiate correct spelling.",
    steps: [
      { fr: "Dicter le texte a vitesse normale (2 lectures)", en: "Dictate text at normal speed (2 readings)" },
      { fr: "Écriture individuelle (pas de correction)", en: "Individual writing (no correction)" },
      { fr: "Groupes: comparer les textes, debattre de l'orthographe", en: "Groups: compare texts, debate spelling" },
      { fr: "Chaque groupe produit un texte final consensuel", en: "Each group produces a final consensual text" },
      { fr: "Correction collective au tableau", en: "Collective correction on the board" },
    ],
    materials: ["Texte de dictee (adapte au niveau)", "Feuilles blanches"],
    variations: [
      { fr: "A2: texte court (3-4 phrases), vocabulaire d'établissement", en: "A2: short text (3-4 sentences), settlement vocabulary" },
      { fr: "B2: texte formel (lettre, article)", en: "B2: formal text (letter, article)" },
    ],
  },
  {
    id: "act-3",
    nameFr: "Jeu de role — Situations d'établissement", nameEn: "Role-play — Settlement situations",
    type: "practice", methodology: "TBLT — Simulated authentic tasks", duration: 30,
    groupSize: "pairs or groups of 3", levels: ["A1", "A2", "B1", "B2"],
    descFr: "Simulations de situations reelles: visite de logement, entrevue d'emploi, rendez-vous medical, plainte au TAL.",
    descEn: "Simulations of real situations: apartment visit, job interview, medical appointment, TAL complaint.",
    steps: [
      { fr: "Distribuer les fiches de role (situation + role + objectif)", en: "Distribute role cards (situation + role + goal)" },
      { fr: "5 min de préparation", en: "5 min preparation" },
      { fr: "10 min de jeu de role", en: "10 min role-play" },
      { fr: "Feedback du groupe (points positifs d'abord)", en: "Group feedback (positive points first)" },
      { fr: "Reprise avec corrections integrees", en: "Redo with corrections integrated" },
    ],
    materials: ["Fiches de role", "Accessoires (telephone, formulaires)"],
    variations: [
      { fr: "A1: dialogues guides avec script", en: "A1: guided dialogues with script" },
      { fr: "B2: improvisation totale + registre soutenu", en: "B2: full improvisation + formal register" },
    ],
  },
  {
    id: "act-4",
    nameFr: "Analyse de document authentique", nameEn: "Authentic document analysis",
    type: "main", methodology: "CLT — Document-based learning", duration: 30,
    groupSize: "groups of 3-4", levels: ["A2", "B1", "B2", "C1"],
    descFr: "Analyser un document reel: annonce Kijiji, article La Presse, formulaire gouvernemental, contrat de bail.",
    descEn: "Analyze a real document: Kijiji ad, La Presse article, government form, lease.",
    steps: [
      { fr: "Distribuer le document (un par groupe)", en: "Distribute document (one per group)" },
      { fr: "Phase 1: lecture silencieuse (5 min)", en: "Phase 1: silent reading (5 min)" },
      { fr: "Phase 2: reperer les informations clés en groupe", en: "Phase 2: identify key information in groups" },
      { fr: "Phase 3: repondre aux questions de compréhension", en: "Phase 3: answer comprehension questions" },
      { fr: "Phase 4: présentation au groupe — 'Voici ce que nous avons compris'", en: "Phase 4: present to class — 'Here's what we understood'" },
    ],
    materials: ["Documents authentiques imprimes", "Questions de compréhension"],
    variations: [
      { fr: "A2: texte court avec aide visuelle", en: "A2: short text with visual aids" },
      { fr: "C1: editorial, texte juridique, rapport", en: "C1: editorial, legal text, report" },
    ],
  },
  {
    id: "act-5",
    nameFr: "Carousel d'écriture", nameEn: "Writing carousel",
    type: "practice", methodology: "Cooperative learning — Round Robin", duration: 25,
    groupSize: "groups of 4-5", levels: ["A2", "B1", "B2"],
    descFr: "Chaque participant ecrit le debut d'un texte, puis passe sa feuille au voisin qui continue.",
    descEn: "Each participant writes the beginning of a text, then passes to the next person to continue.",
    steps: [
      { fr: "Donner un theme d'écriture (ex: 'Ma première semaine au Québec')", en: "Give a writing topic (e.g.: 'My first week in Québec')" },
      { fr: "Chacun ecrit 3-4 phrases, puis passe la feuille a droite", en: "Each writes 3-4 sentences, then passes paper to the right" },
      { fr: "Lire ce que le predecesseur a ecrit, puis continuer l'histoire", en: "Read predecessor's text, then continue the story" },
      { fr: "4 rotations, puis lecture a voix haute du texte final", en: "4 rotations, then read final text aloud" },
    ],
    materials: ["Feuilles A4", "Themes d'écriture"],
    variations: [
      { fr: "A2: phrases simples, meme theme", en: "A2: simple sentences, same topic" },
      { fr: "B2: styles varies (formel → informel → argumentatif)", en: "B2: varied styles (formal → informal → argumentative)" },
    ],
  },
];

// ─── TEACHING METHODOLOGY REFERENCE ───
export interface TeachingMethod {
  id: string;
  nameFr: string;
  nameEn: string;
  abbr: string;
  descFr: string;
  descEn: string;
  principles: { fr: string; en: string }[];
  source: string;
  bestFor: string[];
}

export const TEACHING_METHODS: TeachingMethod[] = [
  {
    id: "clt", nameFr: "Approche communicative (CLT)", nameEn: "Communicative Language Teaching (CLT)",
    abbr: "CLT",
    descFr: "L'apprentissage se fait par la communication reelle. L'objectif est de developper la compétence communicative, pas seulement la precision grammaticale.",
    descEn: "Learning happens through real communication. The goal is communicative competence, not just grammar accuracy.",
    principles: [
      { fr: "La communication est le but ET le moyen", en: "Communication is both the goal AND the means" },
      { fr: "La fluidite est aussi importante que la precision", en: "Fluency is as important as accuracy" },
      { fr: "Les erreurs sont normales et font partie de l'apprentissage", en: "Errors are normal and part of learning" },
      { fr: "Les activités doivent avoir un objectif communicatif reel", en: "Activities must have a real communicative purpose" },
    ],
    source: "Hymes (1972), Canale & Swain (1980)",
    bestFor: ["Expression orale", "Interaction", "Dialogues"],
  },
  {
    id: "tblt", nameFr: "Approche actionnelle / par tâches (TBLT)", nameEn: "Task-Based Language Teaching (TBLT)",
    abbr: "TBLT",
    descFr: "Les apprenants accomplissent des tâches reelles (remplir un formulaire, ecrire une plainte, passer une entrevue) qui necessitent l'utilisation de la langue.",
    descEn: "Learners complete real-world tasks (fill a form, write a complaint, have an interview) that require language use.",
    principles: [
      { fr: "La tâche est l'unite d'enseignement, pas la règle grammaticale", en: "The task is the teaching unit, not the grammar rule" },
      { fr: "Pre-tâche → Tâche → Post-tâche (reflexion)", en: "Pre-task → Task → Post-task (reflection)" },
      { fr: "Le contenu est lie aux besoins reels des apprenants", en: "Content is linked to learners' real needs" },
      { fr: "Focus on form dans le contexte de la tâche", en: "Focus on form within the task context" },
    ],
    source: "Ellis (2003), Nunan (2004), CECR (Conseil de l'Europe, 2001)",
    bestFor: ["Situations reelles", "Formulaires", "Role-plays", "Productions ecrites"],
  },
  {
    id: "srs", nameFr: "Répétition espacee (SRS)", nameEn: "Spaced Repetition System (SRS)",
    abbr: "SRS",
    descFr: "Les elements a memoriser sont revises a des intervalles croissants. Base sur la courbe de l'oubli d'Ebbinghaus.",
    descEn: "Items to memorize are reviewed at increasing intervals. Based on Ebbinghaus's forgetting curve.",
    principles: [
      { fr: "Intervalles croissants: 1 jour → 3 → 7 → 14 → 30", en: "Increasing intervals: 1 day → 3 → 7 → 14 → 30" },
      { fr: "Reponse incorrecte = retour au debut", en: "Incorrect answer = back to start" },
      { fr: "20 min/jour > 2h une fois par semaine", en: "20 min/day > 2h once a week" },
      { fr: "Ideal pour: vocabulaire, conjugaisons, expressions", en: "Ideal for: vocabulary, conjugations, expressions" },
    ],
    source: "Ebbinghaus (1885), Leitner (1972), Pimsleur (1967)",
    bestFor: ["Vocabulaire", "Memorisation", "Révision quotidienne"],
  },
  {
    id: "scaffolding", nameFr: "Etayage (Scaffolding)", nameEn: "Scaffolding",
    abbr: "ZPD",
    descFr: "Le formateur fournit un soutien temporaire (modèles, aides, scripts) qui est progressivement retire a mesure que l'apprenant gagne en autonomie.",
    descEn: "Trainer provides temporary support (models, aids, scripts) that is gradually removed as the learner gains autonomy.",
    principles: [
      { fr: "Zone proximale de developpement (Vygotsky): ce que l'apprenant peut faire AVEC aide", en: "Zone of Proximal Development: what the learner can do WITH help" },
      { fr: "Support → Guidage → Autonomie", en: "Support → Guidance → Autonomy" },
      { fr: "Modelisation avant production libre", en: "Modeling before free production" },
      { fr: "Differenciation: adapter le niveau d'aide au besoin", en: "Differentiation: adapt help level to need" },
    ],
    source: "Vygotsky (1978), Bruner (1983)",
    bestFor: ["Groupes mixtes", "A1-A2", "Transition d'une activité guidee a libre"],
  },
];

// ─── TRAINER EVALUATION FORM ───
export interface TrainerEvaluation {
  category: string;
  criteria: { fr: string; en: string; weight: number }[];
}

export const TRAINER_EVALUATION: TrainerEvaluation[] = [
  {
    category: "Préparation",
    criteria: [
      { fr: "Plan de leçon suivi et adapte", en: "Lesson plan followed and adapted", weight: 10 },
      { fr: "Materiel préparé a l'avancé", en: "Materials prepared in advance", weight: 5 },
      { fr: "Objectifs clairs communiques aux apprenants", en: "Clear objectives communicated to learners", weight: 10 },
    ],
  },
  {
    category: "Delivery",
    criteria: [
      { fr: "Instructions claires et comprehensibles", en: "Clear, understandable instructions", weight: 15 },
      { fr: "Equilibre entre precision et fluidite", en: "Balance between accuracy and fluency", weight: 10 },
      { fr: "Variete des activités (individuel, paire, groupe)", en: "Activity variety (individual, pair, group)", weight: 10 },
      { fr: "Gestion du temps respectee", en: "Time management respected", weight: 10 },
    ],
  },
  {
    category: "Interaction",
    criteria: [
      { fr: "Atmosphere bienveillante et inclusive", en: "Welcoming and inclusive atmosphere", weight: 10 },
      { fr: "Correction des erreurs positive et constructive", en: "Positive, constructive error correction", weight: 10 },
      { fr: "Differenciation pour les niveaux mixtes", en: "Differentiation for mixed levels", weight: 5 },
      { fr: "Feedback regulier et personnalise", en: "Regular, personalized feedback", weight: 5 },
    ],
  },
];
