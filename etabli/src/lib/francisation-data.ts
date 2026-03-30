// ─── TCF/TEF EXAM FORMAT REFERENCE ───
// TCF Canada: 4 épreuves
//   CO: 39 questions, 35 min (audio MCQ)
//   CE: 39 questions, 60 min (reading MCQ)
//   EO: 3 tâches, 12 min (interview)
//   EE: 3 tâches, 60 min (writing)
//
// TEF Canada: 4 épreuves
//   CO: 60 questions, 40 min
//   CE: 50 questions, 60 min
//   EO: 2 sections, 15 min
//   EE: 2 sections, 60 min
//
// NCLC mapping:
//   NCLC 4 = A2 (minimum CAQ after 3 years)
//   NCLC 5 = B1
//   NCLC 7 = B2 (required for PSTQ, +50 CRS bonus)
//   NCLC 9 = C1
//   NCLC 10+ = C2

export type ExerciseLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type Skill = "CO" | "CE" | "EO" | "EE";

export interface MCQQuestion {
  id: string;
  level: ExerciseLevel;
  context: string; // passage or audio transcript description
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
  skill: Skill;
  topic?: string;
}

export interface WritingPrompt {
  id: string;
  level: ExerciseLevel;
  type: "message" | "article" | "argumentatif";
  prompt_fr: string;
  prompt_en: string;
  wordCount: { min: number; max: number };
  criteria: string[];
  sampleResponse?: string;
  topic?: string;
}

export interface SpeakingTask {
  id: string;
  level: ExerciseLevel;
  type: "entretien" | "interaction" | "opinion";
  prompt_fr: string;
  prompt_en: string;
  duration: number; // seconds
  criteria: string[];
  samplePoints?: string[];
  topic?: string;
}

export interface VocabWord {
  fr: string;
  en: string;
  category: string;
  example: string;
  nclc: number;
}

// ─── NCLC ↔ SCORE MAPPING ───
export const NCLC_MAP = {
  TCF: {
    CO: { 4: 331, 5: 369, 6: 398, 7: 453, 8: 499, 9: 523, 10: 549 },
    CE: { 4: 342, 5: 375, 6: 406, 7: 453, 8: 499, 9: 524, 10: 549 },
    EO: { 4: 4, 5: 6, 6: 10, 7: 12, 8: 14, 9: 16, 10: 18 },
    EE: { 4: 4, 5: 6, 6: 10, 7: 12, 8: 14, 9: 16, 10: 18 },
  },
  TEF: {
    CO: { 4: 145, 5: 181, 6: 217, 7: 249, 8: 280, 9: 316, 10: 349 },
    CE: { 4: 121, 5: 151, 6: 181, 7: 207, 8: 233, 9: 263, 10: 291 },
    EO: { 4: 181, 5: 226, 6: 271, 7: 310, 8: 349, 9: 393, 10: 436 },
    EE: { 4: 181, 5: 226, 6: 271, 7: 310, 8: 349, 9: 393, 10: 436 },
  },
} as const;

// ─── COMPREHENSION ORALE EXERCISES ───
export const CO_EXERCISES: MCQQuestion[] = [
  // === A2 Level ===
  {
    id: "co-a2-1", level: "A2", skill: "CO", topic: "logement",
    context: "Vous écoutez un message vocal de votre propriétaire: « Bonjour, c'est M. Tremblay. Je vous appelle pour vous informer que le chauffage sera coupe demain entre 9h et 14h pour des reparations. Merci de bien vouloir vous habiller chaudement. Bonne journee. »",
    question: "Pourquoi le propriétaire appelle-t-il?",
    options: ["Pour augmenter le loyer", "Pour annoncer une coupure de chauffage", "Pour inviter le locataire a souper", "Pour demander le paiement du loyer"],
    correct: 1, explanation: "M. Tremblay informe d'une coupure de chauffage pour reparations."
  },
  {
    id: "co-a2-2", level: "A2", skill: "CO", topic: "transport",
    context: "Annonce dans le metro: « Attention voyageurs, en raison d'un incident technique, la ligne orange est interrompue entre les stations Berri-UQAM et Montmorency. Un service d'autobus de remplacement est disponible. Nous nous excusons pour les inconvenients. »",
    question: "Que doivent faire les passagers de la ligne orange?",
    options: ["Attendre dans la station", "Prendre un autobus de remplacement", "Changer a la ligne verte", "Appeler la STM"],
    correct: 1, explanation: "L'annonce indique qu'un service d'autobus de remplacement est disponible."
  },
  {
    id: "co-a2-3", level: "A2", skill: "CO", topic: "administration",
    context: "Message telephonique: « Vous avez joint le bureau de Service Canada. Pour obtenir votre numéro d'assurance sociale, appuyez sur le 1. Pour des questions relatives a l'assurance-emploi, appuyez sur le 2. Pour parler a un agent, restez en ligne. Le temps d'attente estimé est de 15 minutes. »",
    question: "Combien de temps faut-il attendre pour parler a un agent?",
    options: ["5 minutes", "10 minutes", "15 minutes", "30 minutes"],
    correct: 2, explanation: "Le message indique un temps d'attente estimé de 15 minutes."
  },
  {
    id: "co-a2-4", level: "A2", skill: "CO", topic: "emploi",
    context: "Conversation au telephone: « — Bonjour, j'appelle pour le poste de caissier annoncé sur Indeed. — Oui, le poste est toujours disponible. C'est un temps partiel, 20 heures par semaine, les fins de semaine. Le salaire est de 16,50$ de l'heure. Pouvez-vous envoyer votre CV par courriel? »",
    question: "Quel est l'horaire de travail?",
    options: ["Temps plein, du lundi au vendredi", "Temps partiel, les fins de semaine", "De nuit, 40 heures", "Temps plein, les fins de semaine"],
    correct: 1, explanation: "C'est un poste a temps partiel, 20 heures par semaine, les fins de semaine."
  },
  // === B1 Level ===
  {
    id: "co-b1-1", level: "B1", skill: "CO", topic: "sante",
    context: "Appel au CLSC: « Bonjour, je suis infirmiere au CLSC de Cote-des-Neiges. Votre carte d'assurance maladie RAMQ sera prete dans 3 semaines. En attendant, vous pouvez consulter un médecin dans une clinique sans rendez-vous, mais vous devrez payer les frais de consultation et demander un remboursement ensuite a la RAMQ avec vos reçus. Le délai de carence de 3 mois s'applique a tous les nouveaux arrivants. »",
    question: "Que doit faire le nouvel arrivant pour consulter un médecin avant de recevoir sa carte RAMQ?",
    options: ["Attendre d'avoir sa carte RAMQ", "Aller a l'urgence seulement", "Payer la consultation et demander un remboursement apres", "Appeler le 811 uniquement"],
    correct: 2, explanation: "Il doit payer et demander un remboursement avec ses reçus."
  },
  {
    id: "co-b1-2", level: "B1", skill: "CO", topic: "logement",
    context: "Entrevue radio: « Le Tribunal administratif du logement a annoncé une hausse moyenne des loyers de 5,9% pour 2025, un record en 30 ans. Les locataires ont le droit de refuser une augmentation excessive. Si le propriétaire insiste, le locataire peut déposer une demande au TAL dans les 30 jours suivant la reception de l'avis d'augmentation. Le formulaire est disponible en ligne sur le site du TAL. »",
    question: "Que peut faire un locataire qui refuse une augmentation de loyer?",
    options: ["Quitter le logement immediatement", "Deposer une demande au TAL dans les 30 jours", "Negocier directement avec le propriétaire seulement", "Appeler la police"],
    correct: 1, explanation: "Le locataire peut déposer une demande au TAL dans les 30 jours."
  },
  {
    id: "co-b1-3", level: "B1", skill: "CO", topic: "emploi",
    context: "Présentation dans un centre d'emploi: « Au Québec, le CV canadien est différent du CV europeen ou africain. Il ne contient pas de photo, pas d'age, pas de statut matrimonial, pas de nationalite. Il fait idealement 2 pages maximum et met l'accent sur les réalisations quantifiables plutot que sur les responsabilites. Par exemple, au lieu d'ecrire 'responsable des ventes', ecrivez 'augmenté les ventes de 25% en 6 mois'. »",
    question: "Quelle est la principale difference du CV canadien?",
    options: ["Il doit inclure une photo professionnelle", "Il met l'accent sur les réalisations quantifiables", "Il fait 5 pages minimum", "Il doit être ecrit en anglais seulement"],
    correct: 1, explanation: "Le CV canadien met l'accent sur les réalisations quantifiables, pas les responsabilites."
  },
  // === B2 Level ===
  {
    id: "co-b2-1", level: "B2", skill: "CO", topic: "immigration",
    context: "Conference d'un consultant en immigration: « Depuis la fermeture du PEQ en novembre 2025, le PSTQ via Arrima est devenu le seul programme de sélection permanente au Québec. Le système de pointage favorise trois facteurs principaux: premierement, le français — un NCLC 7 en oral est pratiquement obligatoire; deuxiemement, l'experience de travail au Québec — chaque annee vaut entre 40 et 80 points; et troisiemement, l'offre d'emploi validee, surtout hors Montreal, qui peut valoir jusqu'a 380 points. Les candidats qui combinent ces trois facteurs ont les meilleures chances d'être invites. »",
    question: "Selon le consultant, quel facteur peut rapporter le plus de points dans Arrima?",
    options: ["Le niveau de français", "L'experience de travail au Québec", "L'offre d'emploi validee hors Montreal", "Le diplôme québécois"],
    correct: 2, explanation: "L'OEV hors Montreal peut valoir jusqu'a 380 points, le facteur le plus élève."
  },
  {
    id: "co-b2-2", level: "B2", skill: "CO", topic: "culture",
    context: "Podcast sur la culture quebecoise: « Le Québec a une culture distincte en Amerique du Nord. Les Québécois tutoient facilement, meme en milieu professionnel — ce qui surprend souvent les Français ou les Africains francophones habitues au vouvoiement. En revanche, la ponctualite est tres valorisee. Arriver en retard a une entrevue d'emploi ou a un rendez-vous d'affaires est tres mal percu. On recommandé meme d'arriver 5 a 10 minutes en avancé. Le 5 a 7 — un apéro entre collegues apres le travail — est un moment clé pour le reseautage professionnel au Québec. »",
    question: "Quelle pratique culturelle pourrait surprendre un Français arrivant au Québec?",
    options: ["La ponctualite stricte", "L'utilisation facile du tutoiement", "Les horaires de travail", "La tenue vestimentaire"],
    correct: 1, explanation: "Le tutoiement facile, meme en milieu professionnel, surprend souvent les francophones d'autres pays."
  },
  {
    id: "co-b2-3", level: "B2", skill: "CO", topic: "finances",
    context: "Entrevue avec un comptable: « La première déclaration de revenus au Canada est cruciale pour les nouveaux arrivants. Meme si vous n'avez eu aucun revenu, vous devez produire une déclaration pour bénéficier du credit de TPS/TVH, de l'Allocation canadienne pour enfants et du credit de solidarite du Québec. La date limite est le 30 avril. Je recommandé d'utiliser un logiciel gratuit comme Wealthsimple Impots ou de consulter un benevole dans une clinique d'impots communautaire. N'oubliez pas de declarer vos comptes bancaires a l'étranger si leur solde total dépassé 100 000 dollars canadiens. »",
    question: "Pourquoi un nouvel arrivant sans revenu devrait-il produire une déclaration de revenus?",
    options: ["C'est obligatoire sous peine d'amende", "Pour bénéficier de credits et allocations", "Pour obtenir la citoyennete plus vite", "Pour ouvrir un compte bancaire"],
    correct: 1, explanation: "Produire une déclaration permet de bénéficier du credit de TPS/TVH, de l'ACE et du credit de solidarite."
  },
  // === C1 Level ===
  {
    id: "co-c1-1", level: "C1", skill: "CO", topic: "société",
    context: "Debat télévisé sur l'intégration: « La question de l'intégration des nouveaux arrivants au Québec souleve des enjeux complexes. D'un cote, le modèle interculturel québécois, distinct du multiculturalisme canadien, propose un contrat moral ou les immigrants s'engagent a apprendre le français et a respecter les valeurs communes, notamment la laïcité de l'État. De l'autre, les critiques soulignent que les barrieres systemiques — non-reconnaissance des diplômes, discrimination a l'embauche, difficulté d'acces au logement — nuisent a l'intégration davantage que la volonte individuelle des immigrants. Le taux de chomage des immigrants recents au Québec reste le double de celui de la population nee au Canada, malgre des niveaux de scolarité souvent superieurs. »",
    question: "Selon les critiques mentionnes dans le debat, qu'est-ce qui nuit le plus a l'intégration?",
    options: ["Le manque de volonte des immigrants", "Le modèle interculturel québécois", "Les barrieres systemiques comme la non-reconnaissance des diplômes", "Le multiculturalisme canadien"],
    correct: 2, explanation: "Les critiques soulignent que les barrieres systemiques nuisent davantage que la volonte individuelle."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Logement (10)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-5", level: "A2", skill: "CO" as const, topic: "logement",
    context: "Message vocal: « Bonjour, je vous appelle au sujet de l'appartement 4 et demi sur Kijiji. Le loyer est de 1 350 dollars par mois. Le chauffage est inclus, mais pas l'électricité. Il y a une laveuse et une sécheuse dans le sous-sol. L'appartement est disponible a partir du 1er juillet. Rappelez-moi au 514-555-4321 si vous etes intéressé. »",
    question: "Qu'est-ce qui n'est PAS inclus dans le loyer?",
    options: ["Le chauffage", "L'électricité", "La laveuse", "La sécheuse"],
    correct: 1, explanation: "Le chauffage est inclus mais pas l'électricité."
  },
  {
    id: "co-a2-6", level: "A2", skill: "CO" as const, topic: "logement",
    context: "Conversation entre voisins: « — Excusez-moi, est-ce que c'est vous qui faites du bruit apres 22 heures? J'ai de la difficulté a dormir a cause de la musique. — Ah, je suis désolé, c'etait la fete d'anniversaire de mon fils. Ca ne se reproduira pas. — Merci, j'apprecie. Si jamais ca continue, je devrai contacter le propriétaire. »",
    question: "Pourquoi le voisin se plaint-il?",
    options: ["L'appartement est trop froid", "Il y a du bruit apres 22 heures", "La musique est trop forte le matin", "Le propriétaire ne fait pas de reparations"],
    correct: 1, explanation: "Le voisin se plaint du bruit (musique) apres 22 heures."
  },
  {
    id: "co-b1-4", level: "B1", skill: "CO" as const, topic: "logement",
    context: "Appel a un propriétaire: « — Bonjour, j'appelle pour le 3 et demi a Verdun. — Oui, le logement est toujours disponible. C'est au deuxième étage, pas d'ascenseur. Le loyer est de 1 100$ par mois, chauffage et eau chaude inclus. J'exige le premier mois a la signature du bail. — Et le dépôt de sécurité? — Il n'y a pas de dépôt, c'est illegal au Québec. Mais je demande une enquete de credit et deux references. La visite est possible samedi a 10 heures. »",
    question: "Pourquoi le propriétaire ne demande-t-il pas de dépôt de sécurité?",
    options: ["Parce qu'il est gentil", "Parce qu'il fait confiance au locataire", "Parce que c'est illegal au Québec", "Parce que le loyer est trop cher"],
    correct: 2, explanation: "Les dépôts de sécurité sont illegaux au Québec."
  },
  {
    id: "co-b1-5", level: "B1", skill: "CO" as const, topic: "logement",
    context: "Message du concierge de l'immeuble: « Chers résidents, je vous rappelle que la journee de nettoyage des conduits de ventilation aura lieu le mercredi 12 mars. Un technicien passera dans chaque logement entre 8h et 17h. Vous n'avez pas besoin d'etre presents, mais assurez-vous que les bouches de ventilation sont dégagées. Si vous avez des animaux de compagnie, gardez-les dans une piece fermee. Merci de votre collaboration. »",
    question: "Que doivent faire les résidents avant la visite du technicien?",
    options: ["Nettoyer tout l'appartement", "Dégager les bouches de ventilation", "Etre presents obligatoirement", "Fermer toutes les fenetres"],
    correct: 1, explanation: "Les résidents doivent dégager les bouches de ventilation et garder les animaux dans une piece fermee."
  },
  {
    id: "co-b2-4", level: "B2", skill: "CO" as const, topic: "logement",
    context: "Emission de radio sur le marche locatif: « La crise du logement a Montreal atteint des niveaux sans précédent. Le taux d'inoccupation est tombe a 1,5%, bien en dessous du 3% considere comme un marche equilibre. Les locataires rapportent des pratiques abusives: visites avec 30 personnes en meme temps, exigences illegales de six mois de loyer d'avance, discrimination envers les familles avec enfants. Le Regroupement des comites logement et associations de locataires (RCLALQ) rappelle que les locataires peuvent déposer une plainte a la Commission des droits de la personne si un propriétaire refuse de leur louer en raison de leur situation familiale, de leur origine ou de leur source de revenus. »",
    question: "Quelle est la situation du marche locatif a Montreal selon l'emission?",
    options: ["Le marche est equilibre avec un taux d'inoccupation de 3%", "Il y a trop de logements vides", "Le taux d'inoccupation est a 1,5%, indiquant une crise", "Les loyers sont en baisse"],
    correct: 2, explanation: "Le taux d'inoccupation est a 1,5%, bien en dessous du 3% d'equilibre."
  },
  {
    id: "co-b2-5", level: "B2", skill: "CO" as const, topic: "logement",
    context: "Conversation entre amis: « — Tu savais que le bail au Québec se renouvelle automatiquement? Si tu veux partir, tu dois envoyer un avis de non-renouvellement au moins 3 mois avant la fin du bail pour un bail de 12 mois. — Ah oui? Et si je veux juste contester l'augmentation? — Tu as un mois apres avoir reçu l'avis d'augmentation pour refuser par ecrit. Si tu ne fais rien, l'augmentation est consideree comme acceptee. — Et si le propriétaire veut me mettre dehors? — Il ne peut pas, sauf pour des raisons tres precises: reprise du logement pour un membre de sa famille, subdivision, agrandissement ou si tu ne paies pas ton loyer. »",
    question: "Que se passe-t-il si le locataire ne repond pas a un avis d'augmentation?",
    options: ["Le bail est annule", "L'augmentation est consideree comme acceptee", "Le propriétaire doit envoyer un deuxième avis", "Le locataire peut contester a tout moment"],
    correct: 1, explanation: "Si le locataire ne repond pas, l'augmentation est consideree comme acceptee."
  },
  {
    id: "co-c1-2", level: "C1", skill: "CO" as const, topic: "logement",
    context: "Conference sur le droit du logement: « La jurisprudence recente du TAL montre une tendance preoccupante. Les reprises de logement — ou un propriétaire evince un locataire en pretendant vouloir y habiter lui-meme ou y loger un proche — sont de plus en plus utilisees comme stratégie pour augmenter les loyers. Apres la reprise, le logement est souvent remis en location a un prix considerablement plus élève. Depuis 2022, les locataires qui soupconnent une fausse reprise peuvent déposer une plainte au TAL et reclamer des dommages pouvant atteindre 25 000 dollars. La charge de la preuve repose toutefois sur le locataire, ce qui créé un desequilibre significatif dans le rapport de force. »",
    question: "Quel desequilibre la conference identifie-t-elle dans les cas de fausse reprise?",
    options: ["Les propriétaires n'ont pas le droit de reprendre un logement", "Le montant des dommages est insuffisant", "La charge de la preuve repose sur le locataire", "Le TAL ne traite pas ces cas"],
    correct: 2, explanation: "La charge de la preuve repose sur le locataire, creant un desequilibre."
  },
  {
    id: "co-a2-7", level: "A2", skill: "CO" as const, topic: "logement",
    context: "Annonce enregistree: « Bienvenue chez Demenagement Econo. Nos tarifs commencent a 75 dollars de l'heure pour deux demenageurs et un camion. Le tarif du 1er juillet est majore de 50%. Reservez au moins deux semaines a l'avance. Nous offrons aussi des boites de déménagement a 3 dollars chacune. Pour une soumission gratuite, appuyez sur le 1. »",
    question: "Combien coute le service de base?",
    options: ["50 dollars de l'heure", "75 dollars de l'heure", "100 dollars de l'heure", "3 dollars de l'heure"],
    correct: 1, explanation: "Le tarif de base est de 75 dollars de l'heure."
  },
  {
    id: "co-b1-6", level: "B1", skill: "CO" as const, topic: "logement",
    context: "Emission televisee: « Le 1er juillet au Québec, c'est la journee nationale du déménagement. Environ 200 000 menages demenagent ce jour-la. L'origine de cette tradition remonte a une loi de 1974 qui a fixe la fin des baux au 30 juin pour eviter les demenagements en plein hiver et pour proteger les familles avec enfants pendant l'annee scolaire. Si vous demenagez, n'oubliez pas de faire un changement d'adresse aupres de la SAAQ, de Revenu Québec, de Postes Canada et de votre banque. »",
    question: "Pourquoi les baux se terminent-ils le 30 juin au Québec?",
    options: ["Pour augmenter les loyers chaque annee", "Pour eviter les demenagements en hiver et proteger les familles", "Parce que c'est la fete nationale", "Pour faciliter le travail des demenageurs"],
    correct: 1, explanation: "La loi de 1974 a fixe cette date pour eviter les demenagements en hiver et proteger les familles."
  },
  {
    id: "co-c1-3", level: "C1", skill: "CO" as const, topic: "logement",
    context: "Entrevue avec un urbaniste: « La financiarisation du logement au Québec transforme profondement le paysage urbain. Des fonds d'investissement immobilier, souvent bases a l'exterieur du Québec, acquierent massivement des immeubles locatifs a Montreal et Gatineau, puis augmentent les loyers apres des renovations cosmetiques — un phenomene appele 'renovictions'. Le projet de loi 31, adopte en 2024, a introduit certaines protections, notamment le droit au maintien dans les lieux pendant les renovations et un registre des loyers que les propriétaires doivent remplir a chaque changement de locataire. Cependant, les groupes de defense des locataires estiment que ces mesures sont insuffisantes sans un veritable controle obligatoire des loyers. »",
    question: "Selon l'urbaniste, quel mecanisme les fonds d'investissement utilisent-ils pour augmenter les loyers?",
    options: ["Ils construisent de nouveaux immeubles", "Ils font des renovations cosmetiques puis augmentent les loyers", "Ils negocient avec les locataires", "Ils attendent l'expiration des baux"],
    correct: 1, explanation: "Les fonds font des renovations cosmetiques pour justifier des augmentations — les 'renovictions'."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Emploi (10)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-8", level: "A2", skill: "CO" as const, topic: "emploi",
    context: "Message vocal d'un employeur: « Bonjour, c'est Nathalie Gagnon du restaurant Le Pied de Cochon. J'ai bien reçu votre CV pour le poste de plongeur. J'aimerais vous rencontrer pour une courte entrevue jeudi prochain a 14 heures. Apportez une piece d'identite et votre numéro d'assurance sociale. L'entrevue durera environ 15 minutes. Confirmez votre présence au 514-555-6789. Merci. »",
    question: "Quels documents doit apporter le candidat?",
    options: ["Son diplôme et son CV", "Une piece d'identite et son NAS", "Son permis de travail et un passeport", "Une lettre de recommendation"],
    correct: 1, explanation: "L'employeur demande une piece d'identite et le NAS."
  },
  {
    id: "co-a2-9", level: "A2", skill: "CO" as const, topic: "emploi",
    context: "Conversation au travail: « — Salut, c'est ta première journee, hein? Je m'appelle Marc, je suis le gérant. Ton horaire est du lundi au vendredi, de 8h a 16h30. Tu as une pause de 30 minutes pour le dîner. Le vestiaire est au sous-sol. Tu dois porter des bottes de sécurité et un casque en tout temps. On va te donner une formation de sécurité ce matin. Des questions? »",
    question: "Quel équipement l'employé doit-il porter?",
    options: ["Un uniforme et des gants", "Des bottes de sécurité et un casque", "Une cravate et des chaussures de ville", "Un tablier et un chapeau"],
    correct: 1, explanation: "Marc mentionne des bottes de sécurité et un casque en tout temps."
  },
  {
    id: "co-b1-7", level: "B1", skill: "CO" as const, topic: "emploi",
    context: "Présentation au centre d'emploi: « La CNESST, c'est la Commission des normes, de l'equite, de la sante et de la sécurité du travail. Elle protege tous les travailleurs du Québec, meme ceux qui n'ont pas de résidence permanente. Si vous vous blessez au travail, vous devez le signaler a votre employeur dans les 24 heures et consulter un médecin. La CNESST couvrira vos frais médicaux et vous versera des indemnites pendant votre convalescence. Attention: si votre employeur vous dit que vous n'etes pas couvert parce que vous etes un travailleur temporaire, c'est faux. Tous les travailleurs sont proteges. »",
    question: "Que doit faire un travailleur qui se blesse au travail?",
    options: ["Attendre que la douleur passe", "Le signaler a l'employeur dans les 24 heures et consulter un médecin", "Appeler la police", "Demander a un collegue de l'aider"],
    correct: 1, explanation: "Il faut signaler a l'employeur dans les 24 heures et consulter un médecin."
  },
  {
    id: "co-b1-8", level: "B1", skill: "CO" as const, topic: "emploi",
    context: "Entrevue d'embauche: « — Parlez-moi de votre experience avec le service a la clientele. — Dans mon pays, j'ai travaille cinq ans comme receptionniste dans un hotel quatre etoiles. Je gérais les reservations, les plaintes des clients et la coordination avec les différents departements. — Tres bien. Ici au Québec, le service a la clientele est tres important. Les clients s'attendent a un accueil chaleureux. On dit souvent 'le client a toujours raison'. Etes-vous a l'aise avec le tutoiement? — Je commence a m'y habituer, oui. »",
    question: "Quelle particularite culturelle l'employeur mentionne-t-il?",
    options: ["Les clients ne parlent qu'anglais", "Le service au Québec exige un accueil chaleureux et le tutoiement est courant", "Les pourboires ne sont pas importants", "Il faut toujours vouvoyer les clients"],
    correct: 1, explanation: "L'employeur souligne l'importance de l'accueil chaleureux et du tutoiement."
  },
  {
    id: "co-b1-9", level: "B1", skill: "CO" as const, topic: "emploi",
    context: "Annonce radio: « Vous cherchez un emploi? Le Salon de l'emploi de Montreal aura lieu les 22 et 23 mars au Palais des congres. Plus de 150 employeurs seront presents, dans des secteurs comme la sante, les technologies de l'information, la construction et le commerce de detail. Apportez plusieurs copies de votre CV. Des ateliers gratuits sur la preparation a l'entrevue et la redaction du CV canadien sont offerts sur place. Inscription gratuite sur salonemploimontreal.com. »",
    question: "Combien d'employeurs seront presents au salon?",
    options: ["50", "100", "150", "200"],
    correct: 2, explanation: "Plus de 150 employeurs seront presents."
  },
  {
    id: "co-b2-6", level: "B2", skill: "CO" as const, topic: "emploi",
    context: "Entrevue radio avec un conseiller en emploi: « Les immigrants qualifies font face a un phenomene qu'on appelle la dequalification professionnelle. Un ingenieur qui devient chauffeur de taxi, une médecin qui travaille comme preposee aux beneficiaires — ces histoires sont malheureusement frequentes. Les causes sont multiples: la non-reconnaissance des diplômes, le manque d'experience canadienne — une exigence souvent discriminatoire — et les reseaux professionnels limites. Des programmes comme Interconnexion de la Chambre de commerce de Montreal permettent aux immigrants de faire des stages en entreprise pour acquérir cette fameuse experience canadienne. Je recommandé aussi fortement le mentorat professionnel via des organismes comme Mentorat Québec. »",
    question: "Qu'est-ce que la dequalification professionnelle selon le conseiller?",
    options: ["Le fait de changer de carriere volontairement", "Le fait de travailler dans un domaine inferieur a ses qualifications", "L'impossibilite de trouver un emploi", "Le manque de formation continue"],
    correct: 1, explanation: "La dequalification est le fait de travailler dans un domaine inferieur a ses qualifications (ex: ingenieur devenu chauffeur de taxi)."
  },
  {
    id: "co-b2-7", level: "B2", skill: "CO" as const, topic: "emploi",
    context: "Presentation syndicale: « Si votre employeur ne vous paie pas vos heures supplementaires, il viole les normes du travail. Au Québec, apres 40 heures par semaine, chaque heure doit être payee a temps et demi — c'est-a-dire votre taux horaire multiplie par 1,5. Les jours feries, c'est le taux double. De plus, votre employeur ne peut pas vous obliger a travailler plus de 14 heures par jour ni vous refuser deux jours de repos consecutifs par semaine. Si vous etes dans cette situation, deposez une plainte a la CNESST. C'est confidentiel et gratuit, et votre statut d'immigration n'a aucune incidence sur votre droit de porter plainte. »",
    question: "Comment sont payees les heures supplementaires au Québec?",
    options: ["Au meme taux que les heures regulieres", "A temps et demi apres 40 heures par semaine", "Au taux double apres 35 heures", "Les heures supplementaires ne sont pas obligatoirement payees"],
    correct: 1, explanation: "Apres 40 heures par semaine, chaque heure est payee a temps et demi (1,5 fois le taux)."
  },
  {
    id: "co-c1-4", level: "C1", skill: "CO" as const, topic: "emploi",
    context: "Débat sur l'integration economique: « Le concept d'experience canadienne comme critere d'embauche a été qualifie de discriminatoire par la Commission des droits de la personne de l'Ontario des 2013, mais au Québec, cette pratique persiste dans les faits. Les employeurs la justifient par la connaissance du contexte d'affaires local, des normes professionnelles canadiennes et de la culture organisationnelle. En réalité, c'est souvent un proxy pour d'autres formes de discrimination. Les données montrent que les immigrants qui obtiennent un premier emploi qualifie dans les 5 premieres annees s'integrent durablement au marche du travail, alors que ceux qui sont confines a des emplois dequalifies pendant plus de 3 ans ont une probabilite significativement reduite de retrouver un emploi a la hauteur de leurs competences. »",
    question: "Selon le debat, quelle est la consequence d'une dequalification prolongee?",
    options: ["Les immigrants retournent dans leur pays", "Les immigrants s'adaptent eventuellement", "La probabilite de retrouver un emploi qualifie diminue significativement", "Les employeurs finissent par reconnaitre les competences"],
    correct: 2, explanation: "Apres plus de 3 ans de dequalification, la probabilite de retrouver un emploi qualifie diminue significativement."
  },
  {
    id: "co-a2-10", level: "A2", skill: "CO" as const, topic: "emploi",
    context: "Conversation telephonique: « — Bonjour, je voudrais savoir si vous acceptez les candidatures pour le poste d'aide-cuisinier. — Oui, mais vous devez avoir votre carte de manieur d'aliments. C'est une formation en ligne de 6 heures qui coute 25 dollars. Apres, vous recevez votre carte par courriel. — D'accord. Et le salaire? — C'est 17 dollars de l'heure plus les repas gratuits pendant votre quart de travail. »",
    question: "Que faut-il avoir pour postuler au poste d'aide-cuisinier?",
    options: ["Un diplôme en cuisine", "Une carte de manieur d'aliments", "Trois ans d'experience", "Un permis de conduire"],
    correct: 1, explanation: "Il faut avoir la carte de manieur d'aliments (formation en ligne de 6 heures)."
  },
  {
    id: "co-b2-8", level: "B2", skill: "CO" as const, topic: "emploi",
    context: "Conference sur le reseautage professionnel: « Au Québec, on estime que 60 a 80% des emplois qualifies ne sont jamais affiches publiquement — c'est ce qu'on appelle le marche cache de l'emploi. Ces postes sont pourvus par le bouche-a-oreille, les recommandations internes et le reseautage. Pour les nouveaux arrivants, qui n'ont souvent aucun reseau local, c'est un obstacle majeur. Je vous recommandé trois stratégies: premierement, participez aux 5 a 7 professionnels dans votre domaine; deuxiemement, rejoignez des associations professionnelles comme le Reseau des Professionnels en Immigration du Québec; et troisiemement, utilisez LinkedIn activement en contactant directement des recruteurs et des professionnels de votre secteur. »",
    question: "Quel pourcentage des emplois qualifies ne sont jamais affiches publiquement?",
    options: ["20 a 40%", "40 a 60%", "60 a 80%", "80 a 100%"],
    correct: 2, explanation: "On estime que 60 a 80% des emplois qualifies ne sont jamais affiches publiquement."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Sante (8)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-11", level: "A2", skill: "CO" as const, topic: "sante",
    context: "Appel au 811 (Info-Sante): « — Info-Sante, bonjour. Comment puis-je vous aider? — Bonjour, mon enfant a de la fievre depuis hier soir. Il a 38,5 degrés. — Est-ce qu'il a d'autres symptomes? Toux, vomissements, mal de gorge? — Il tousse un peu. — D'accord. Pour le moment, donnez-lui du Tylenol pour enfants selon la posologie sur la boite. Faites-le boire beaucoup d'eau. Si la fievre dépassé 39 degrés ou si elle persiste plus de 48 heures, consultez une clinique sans rendez-vous. Vous n'avez pas besoin d'aller a l'urgence pour l'instant. »",
    question: "Quand faut-il consulter une clinique selon l'infirmiere?",
    options: ["Tout de suite", "Si la fievre dépassé 39 degrés ou persiste plus de 48 heures", "Si l'enfant a faim", "Seulement si l'enfant vomit"],
    correct: 1, explanation: "L'infirmiere recommandé de consulter si la fievre dépassé 39 degrés ou persiste plus de 48 heures."
  },
  {
    id: "co-a2-12", level: "A2", skill: "CO" as const, topic: "sante",
    context: "A la pharmacie: « — Bonjour, j'ai une ordonnance de mon médecin. — D'accord, je peux la voir? Tres bien. Ce médicament est couvert par la RAMQ, vous n'aurez qu'a payer la franchise de 3,72 dollars. Votre médicament sera pret dans 15 minutes. En attendant, voici les instructions: prenez un comprime deux fois par jour, matin et soir, avec de la nourriture. Ne buvez pas d'alcool avec ce médicament. »",
    question: "Combien le patient doit-il payer pour son médicament?",
    options: ["Le prix total du médicament", "La franchise de 3,72 dollars", "Rien, c'est entierement gratuit", "50% du prix"],
    correct: 1, explanation: "Le patient ne paie que la franchise de 3,72 dollars, le reste est couvert par la RAMQ."
  },
  {
    id: "co-b1-10", level: "B1", skill: "CO" as const, topic: "sante",
    context: "Message de la clinique: « Bonjour, vous etes inscrit au Guichet d'acces a un médecin de famille, le GAMF. Nous vous informons qu'un médecin de famille est maintenant disponible pour vous prendre en charge. Votre premier rendez-vous est fixe au 15 avril a 10h30 au GMF Cote-des-Neiges. Apportez votre carte RAMQ, la liste de vos médicaments et vos resultats d'examens recents si vous en avez. Pour confirmer ou annuler, appelez le 514-555-8901 avant le 10 avril. Si vous n'appelez pas, votre place sera donnee a quelqu'un d'autre. »",
    question: "Que doit faire le patient avant le 10 avril?",
    options: ["Aller a la clinique", "Confirmer ou annuler son rendez-vous", "Obtenir de nouveaux examens", "Changer de médecin"],
    correct: 1, explanation: "Le patient doit confirmer ou annuler avant le 10 avril, sinon sa place sera donnee a quelqu'un d'autre."
  },
  {
    id: "co-b1-11", level: "B1", skill: "CO" as const, topic: "sante",
    context: "Conversation a la clinique de vaccination: « — Bonjour, je suis nouvel arrivant et j'aimerais savoir quels vaccins je dois recevoir au Québec. — Avez-vous votre carnet de vaccination de votre pays d'origine? — Oui, le voici. — Merci. Selon le calendrier de vaccination du Québec, vous avez besoin d'un rappel pour la diphterie et le tetanos, et possiblement pour la grippe saisonniere. La vaccination est gratuite pour tous les résidents du Québec. Si vos enfants vont a l'ecole, ils doivent aussi être a jour dans leurs vaccins. Apportez leur carnet a l'ecole. »",
    question: "Quels vaccins le nouvel arrivant doit-il recevoir?",
    options: ["Tous les vaccins depuis le debut", "Un rappel diphterie-tetanos et possiblement la grippe saisonniere", "Seulement la COVID-19", "Aucun vaccin n'est requis"],
    correct: 1, explanation: "Selon le carnet, il a besoin d'un rappel diphterie-tetanos et possiblement la grippe saisonniere."
  },
  {
    id: "co-b2-9", level: "B2", skill: "CO" as const, topic: "sante",
    context: "Emission sur le système de sante: « Le système de sante québécois fait face a une penurie critique de personnel. Le temps d'attente moyen aux urgences dépassé 12 heures dans certains hopitaux de Montreal. Pour desengorger les urgences, le gouvernement a lance les guichets d'acces premiere ligne, le GAP, qui permettent d'obtenir un rendez-vous avec un médecin dans les 36 heures pour les cas semi-urgents. Il y a aussi les super-cliniques qui offrent des soins de soir et de fin de semaine sans rendez-vous. Malgre ces initiatives, le vrai problème reste le manque de médecins de famille — plus d'un million de Québécois n'en ont pas. Pour les nouveaux arrivants, l'attente sur la liste du GAMF peut atteindre 2 a 3 ans. »",
    question: "Quel est le délai d'attente pour obtenir un médecin de famille via le GAMF?",
    options: ["1 a 2 mois", "6 mois a 1 an", "2 a 3 ans", "C'est immediat"],
    correct: 2, explanation: "L'attente sur la liste du GAMF peut atteindre 2 a 3 ans."
  },
  {
    id: "co-b2-10", level: "B2", skill: "CO" as const, topic: "sante",
    context: "Appel de la RAMQ: « Bonjour, je vous appelle pour vous informer que votre demande de carte d'assurance maladie a été traitee. Cependant, comme vous etes en période de délai de carence, votre couverture ne debutera que le 15 mai. D'ici la, je vous recommandé de souscrire une assurance privee pour les soins de sante. Si vous consultez un médecin avant le 15 mai, conservez tous vos reçus. Vous pourrez demander un remboursement retroactif pour les consultations médicales, mais attention: les soins dentaires et la pharmacie ne sont pas rembourses retroactivement. »",
    question: "Que n'est PAS rembourse retroactivement apres le délai de carence?",
    options: ["Les consultations médicales", "Les soins dentaires et la pharmacie", "Les visites a l'urgence", "Les radiographies"],
    correct: 1, explanation: "Les soins dentaires et la pharmacie ne sont pas rembourses retroactivement."
  },
  {
    id: "co-c1-5", level: "C1", skill: "CO" as const, topic: "sante",
    context: "Debat sur la sante mentale des immigrants: « La migration est un facteur de stress majeur qui affecte la sante mentale. Les études montrent que les immigrants presentent des taux plus élèves de depression et d'anxiete, particulierement dans les 3 a 5 premieres annees d'etablissement. Le deuil migratoire — la perte du réseau social, de la langue maternelle comme langue dominante, du statut professionnel et des reperes culturels — est un phenomene bien documente mais insuffisamment pris en compte par le système de sante. Les barrieres a l'acces aux soins en sante mentale pour les immigrants sont multiples: le manque de professionnels formes a l'approche interculturelle, les listes d'attente de 6 a 18 mois en santé mentale publique, et le fait que la psychothérapie n'est couverte par la RAMQ que si elle est dispensee par un médecin ou un psychologue en milieu hospitalier. »",
    question: "Pourquoi l'acces a la sante mentale est-il difficile pour les immigrants?",
    options: ["Les immigrants ne veulent pas consulter", "Le manque de professionnels interculturels, les longues listes d'attente et la couverture limitee de la RAMQ", "La psychothérapie est entierement gratuite", "Il n'y a pas de psychologues au Québec"],
    correct: 1, explanation: "Les barrieres incluent le manque de professionnels interculturels, les listes d'attente et la couverture limitee de la RAMQ."
  },
  {
    id: "co-a2-13", level: "A2", skill: "CO" as const, topic: "sante",
    context: "Receptionniste a la clinique: « — Bonjour, avez-vous rendez-vous? — Non, c'est une clinique sans rendez-vous? — Oui. Avez-vous votre carte RAMQ? — Non, je ne l'ai pas encore recue. — Dans ce cas, il y aura des frais de 200 dollars. Vous pouvez payer par carte de debit ou de credit. Vous pourrez demander un remboursement a la RAMQ quand vous aurez votre carte. Le temps d'attente est d'environ 2 heures. Asseyez-vous dans la salle d'attente. »",
    question: "Pourquoi le patient doit-il payer 200 dollars?",
    options: ["Parce que c'est une clinique privee", "Parce qu'il n'a pas de carte RAMQ", "Parce qu'il n'a pas de rendez-vous", "Parce qu'il est dimanche"],
    correct: 1, explanation: "Sans carte RAMQ, le patient doit payer les frais de consultation."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Administration (8)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-14", level: "A2", skill: "CO" as const, topic: "admin",
    context: "Bureau de Service Canada: « — Bonjour, je viens demander mon numéro d'assurance sociale. — Tres bien. Avez-vous votre permis de travail? — Oui, le voici. — Et une piece d'identite avec photo? Un passeport? — Oui. — Parfait. Je vais traiter votre demande maintenant. Votre NAS sera pret dans environ 20 minutes. Comme votre permis de travail est temporaire, votre NAS commencera par le chiffre 9. Il deviendra permanent si vous obtenez la résidence permanente. »",
    question: "Pourquoi le NAS commencera-t-il par le chiffre 9?",
    options: ["Parce que c'est le numéro standard", "Parce que le permis de travail est temporaire", "Parce que c'est un nouveau NAS", "Parce qu'il habite au Québec"],
    correct: 1, explanation: "Un NAS commencant par 9 est temporaire, lie au permis de travail."
  },
  {
    id: "co-a2-15", level: "A2", skill: "CO" as const, topic: "admin",
    context: "Appel a la SAAQ: « — SAAQ, bonjour. Comment puis-je vous aider? — Bonjour, je suis nouvel arrivant et je voudrais savoir si je peux conduire avec mon permis étranger. — Oui, vous pouvez utiliser votre permis international ou votre permis étranger pendant les 6 premiers mois au Québec. Apres, vous devez obtenir un permis québécois. Si votre pays a une entente avec le Québec — comme la France, la Belgique ou la Suisse — vous pouvez échanger votre permis sans examen. Sinon, vous devrez passer l'examen theorique et l'examen pratique. »",
    question: "Combien de temps un nouvel arrivant peut-il conduire avec son permis étranger?",
    options: ["1 mois", "3 mois", "6 mois", "12 mois"],
    correct: 2, explanation: "On peut conduire avec un permis étranger pendant les 6 premiers mois."
  },
  {
    id: "co-b1-12", level: "B1", skill: "CO" as const, topic: "admin",
    context: "Conversation au bureau de Revenu Québec: « — Bonjour, c'est ma première déclaration de revenus au Canada. Je ne sais pas par ou commencer. — D'accord. Comme vous etes arrive en cours d'annee, vous devez declarer seulement les revenus gagnes au Canada depuis votre arrivee. Les revenus étrangers gagnes avant votre arrivee ne sont pas imposables au Canada. Vous avez droit a plusieurs crédits: le credit de TPS/TVH, le credit de solidarite du Québec et possiblement l'Allocation canadienne pour enfants si vous avez des enfants. Meme si vos revenus sont faibles, il est tres important de produire une déclaration pour recevoir ces crédits. »",
    question: "Les revenus gagnes a l'étranger avant l'arrivee sont-ils imposables au Canada?",
    options: ["Oui, tous les revenus mondiaux sont imposables", "Non, seulement les revenus gagnes au Canada depuis l'arrivee", "Oui, mais avec un taux reduit", "Ca depend du pays d'origine"],
    correct: 1, explanation: "Seuls les revenus gagnes au Canada depuis l'arrivee sont imposables."
  },
  {
    id: "co-b1-13", level: "B1", skill: "CO" as const, topic: "admin",
    context: "Message automatise du gouvernement: « Bienvenue sur le portail Mon Dossier de Service Canada. Pour acceder a votre dossier en ligne, vous devez vous inscrire avec votre CLE GC, votre identifiant bancaire ou votre identifiant provincial. Une fois connecté, vous pouvez consulter votre releve d'emploi, vérifier votre historique de cotisations au RPC, demander votre pension de vieillesse et mettre a jour vos informations personnelles. Si vous avez perdu votre NAS, vous pouvez en demander une copie ici. Le portail est disponible 24 heures sur 24, 7 jours sur 7. »",
    question: "Que peut-on faire sur le portail Mon Dossier de Service Canada?",
    options: ["Renouveler son passeport", "Demander un permis de travail", "Consulter son releve d'emploi et demander une copie de son NAS", "Réserver un rendez-vous a l'hopital"],
    correct: 2, explanation: "Le portail permet de consulter le releve d'emploi, verifier le RPC, et demander une copie du NAS."
  },
  {
    id: "co-b2-11", level: "B2", skill: "CO" as const, topic: "admin",
    context: "Atelier sur les impots: « La particularite du système fiscal canadien, c'est que vous devez produire deux déclarations de revenus si vous vivez au Québec: une fédérale pour l'ARC et une provinciale pour Revenu Québec. Les logiciels gratuits comme Wealthsimple Impots remplissent les deux en meme temps. Sachez que le Québec est la seule province a percevoir son propre impot provincial. L'impot total peut surprendre: le taux marginal combine fédéral-provincial atteint 53,31% pour les revenus les plus élèves. Pour les nouveaux arrivants, les cliniques d'impots communautaires offrent un service gratuit si votre revenu est inferieur a 35 000 dollars. La date limite est le 30 avril, mais si vous devez de l'argent et que vous produisez en retard, des penalites et des interets s'appliquent des le 1er mai. »",
    question: "Quelle est la particularite fiscale du Québec par rapport aux autres provinces?",
    options: ["Le Québec n'a pas d'impot provincial", "Le Québec est la seule province a percevoir son propre impot provincial", "Les impots sont plus bas qu'ailleurs", "Il n'y a pas de date limite au Québec"],
    correct: 1, explanation: "Le Québec est la seule province qui percoit son propre impot provincial (Revenu Québec)."
  },
  {
    id: "co-a2-16", level: "A2", skill: "CO" as const, topic: "admin",
    context: "Bureau de Postes Canada: « — Bonjour, je voudrais faire un changement d'adresse. — Tres bien. Vous pouvez le faire en ligne sur le site de Postes Canada. Ca coute 47 dollars pour 12 mois. On va rediriger tout votre courrier vers votre nouvelle adresse. — Est-ce que je dois aussi changer mon adresse aupres du gouvernement? — Oui, il faut aussi faire un changement d'adresse a la SAAQ, a la RAMQ et a Revenu Québec. Vous pouvez tout faire en une seule fois sur le site du gouvernement du Québec avec le service Quebec.ca/changementsadresse. »",
    question: "Combien coute le service de suivi de courrier de Postes Canada?",
    options: ["C'est gratuit", "25 dollars", "47 dollars", "100 dollars"],
    correct: 2, explanation: "Le service coute 47 dollars pour 12 mois."
  },
  {
    id: "co-b2-12", level: "B2", skill: "CO" as const, topic: "admin",
    context: "Présentation sur les droits des travailleurs temporaires: « Les travailleurs temporaires au Québec ont les memes droits fondamentaux que les résidents permanents en matiere de travail, de sante et de logement. Vous avez droit a la RAMQ apres le délai de carence, a l'aide juridique si vos revenus sont faibles, et a l'aide sociale en cas d'urgence. Ce que beaucoup ne savent pas, c'est que vos enfants ont droit a l'ecole publique gratuite en français, peu importe votre statut. Si votre employeur ne respecte pas vos droits, vous pouvez porter plainte a la CNESST sans craindre de represailles — c'est protege par la loi. Par contre, vous devez respecter les conditions de votre permis de travail: travailler seulement pour l'employeur indiqué et dans la profession indiquee, sauf si vous avez un permis ouvert. »",
    question: "Quelle limite s'applique aux travailleurs avec un permis de travail ferme?",
    options: ["Ils n'ont pas droit a la RAMQ", "Ils ne peuvent pas porter plainte a la CNESST", "Ils doivent travailler seulement pour l'employeur et la profession indiques", "Leurs enfants n'ont pas acces a l'ecole publique"],
    correct: 2, explanation: "Avec un permis ferme, on doit travailler seulement pour l'employeur et dans la profession indiques."
  },
  {
    id: "co-c1-6", level: "C1", skill: "CO" as const, topic: "admin",
    context: "Conference sur les enjeux bureaucratiques: « La complexite administrative au Canada constitue un obstacle sous-estime pour les nouveaux arrivants. Un immigrant doit naviguer entre trois paliers de gouvernement — fédéral, provincial et municipal — chacun avec ses propres formulaires, portails en ligne et delais. Pour une simple installation, il faut obtenir le NAS (fédéral), la carte RAMQ (provincial), le permis de conduire (SAAQ, provincial), ouvrir un compte bancaire (secteur prive), inscrire les enfants a l'ecole (commission scolaire), trouver un logement (marche prive), et produire deux déclarations de revenus. Chaque étape a ses propres exigences documentaires, et l'information est dispersee sur des dizaines de sites web. Les organismes communautaires jouent un role essentiel de navigateur dans ce labyrinthe, mais leur financement est chroniquement insuffisant — le Québec n'investit que 1 600 dollars par immigrant en services d'accueil, contre 3 500 dollars en Ontario. »",
    question: "Quelle comparaison est faite sur le financement des services d'accueil?",
    options: ["Le Québec investit plus que l'Ontario", "Le Québec investit 1 600 dollars par immigrant contre 3 500 en Ontario", "Les deux provinces investissent le meme montant", "Le fédéral finance entierement les services"],
    correct: 1, explanation: "Le Québec investit 1 600 dollars par immigrant en services d'accueil contre 3 500 en Ontario."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Transport (6)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-17", level: "A2", skill: "CO" as const, topic: "transport",
    context: "Annonce dans l'autobus: « Prochain arret: station de métro Berri-UQAM. Correspondance avec les lignes orange et jaune. N'oubliez pas vos effets personnels. Merci d'utiliser les portes arrieres pour descendre. Bonne fin de journee. »",
    question: "Quelles lignes de métro peut-on prendre a Berri-UQAM?",
    options: ["Les lignes verte et bleue", "Les lignes orange et jaune", "Les lignes verte et orange", "Toutes les lignes"],
    correct: 1, explanation: "L'annonce mentionne les correspondances avec les lignes orange et jaune."
  },
  {
    id: "co-a2-18", level: "A2", skill: "CO" as const, topic: "transport",
    context: "Conversation au guichet STM: « — Bonjour, j'aimerais acheter une passe mensuelle. — Vous avez une carte OPUS? — Non, c'est quoi? — C'est la carte rechargeable pour le transport en commun a Montreal. Elle coute 6 dollars et vous la gardez pour toujours. Ensuite, vous chargez votre passe mensuelle dessus chaque mois. La passe mensuelle tous modes coute 97 dollars. Vous avez aussi la passe weekend a 15,25 dollars qui est valide du vendredi 18h au lundi 5h. »",
    question: "Combien coute la carte OPUS elle-meme?",
    options: ["C'est gratuit", "6 dollars", "97 dollars", "15,25 dollars"],
    correct: 1, explanation: "La carte OPUS coute 6 dollars."
  },
  {
    id: "co-b1-14", level: "B1", skill: "CO" as const, topic: "transport",
    context: "Information sur Bixi: « Bixi, c'est le système de velo en libre-service de Montreal. La saison va d'avril a novembre. L'abonnement annuel coute 99 dollars et vous donne des trajets illimites de 45 minutes. Si vous dépassez 45 minutes, ca coute 3 dollars pour chaque tranche de 15 minutes supplementaire. L'abonnement mensuel est de 19 dollars. Il y a aussi le tarif a l'utilisation: 1,25 dollar pour debloquer un velo plus 15 cents par minute. Depuis 2023, Bixi offre aussi des velos electriques. Le deblocage d'un velo electrique coute un dollar de plus. L'application Bixi vous montre les stations disponibles en temps reel. »",
    question: "Combien de temps dure un trajet inclus dans l'abonnement annuel?",
    options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
    correct: 2, explanation: "L'abonnement annuel donne des trajets illimites de 45 minutes."
  },
  {
    id: "co-b1-15", level: "B1", skill: "CO" as const, topic: "transport",
    context: "Appel a un service de covoiturage: « — Bonjour, j'aimerais réserver une place pour Montreal-Quebec le samedi 22 mars. — Nous avons un depart a 8 heures du matin depuis la station de métro Berri. Le tarif est de 25 dollars par personne. Le trajet dure environ 2 heures 30. On vous déposé a la gare du Palais a Québec. — Est-ce que je peux apporter une valise? — Oui, une valise de taille standard est incluse. Pour une valise supplementaire, c'est 5 dollars de plus. Le paiement se fait par virement Interac avant le depart. »",
    question: "Comment se fait le paiement pour le covoiturage?",
    options: ["En especes au chauffeur", "Par carte de credit dans l'application", "Par virement Interac avant le depart", "A l'arrivee a destination"],
    correct: 2, explanation: "Le paiement se fait par virement Interac avant le depart."
  },
  {
    id: "co-b2-13", level: "B2", skill: "CO" as const, topic: "transport",
    context: "Reportage radio: « Le REM, le Réseau express metropolitain, a transforme le paysage du transport en commun dans le Grand Montreal. Avec ses 67 kilometres de voies automatisees, c'est le plus long système de métro léger automatise au monde. Les trains circulent toutes les 2 a 4 minutes en heure de pointe. Le REM relie maintenant l'aéroport Trudeau au centre-ville en 25 minutes, et la Rive-Sud en 15 minutes. L'integration avec le réseau existant — STM, exo, RTL — se fait avec la carte OPUS et un tarif unique de 3,75 dollars. Cependant, les critiques soulignent que le projet, finance a 60% par la Caisse de dépôt, opère selon une logique de rentabilite qui ne dessert pas les quartiers les plus defavorises. »",
    question: "Quelle critique est formulee a l'egard du REM?",
    options: ["Les trains sont trop lents", "Le tarif est trop élève", "Le projet ne dessert pas les quartiers les plus defavorises", "Le REM n'est pas connecte au réseau existant"],
    correct: 2, explanation: "Le projet, finance pour la rentabilite, ne dessert pas les quartiers les plus defavorises."
  },
  {
    id: "co-a2-19", level: "A2", skill: "CO" as const, topic: "transport",
    context: "Annonce STM: « En raison des travaux de maintenance, la station de métro Jean-Talon sera fermee ce weekend, samedi et dimanche. Les passagers sont invites a descendre a Beaubien ou a De Castelnau. Un autobus navette gratuit fait la liaison entre les deux stations toutes les 5 minutes. Nous nous excusons pour les inconvenients. Pour planifier votre trajet, consultez stm.info ou l'application Transit. »",
    question: "Que propose la STM pour remplacer la station fermee?",
    options: ["Un taxi gratuit", "Un autobus navette gratuit toutes les 5 minutes", "Un remboursement du billet", "Rien, les passagers doivent marcher"],
    correct: 1, explanation: "Un autobus navette gratuit fait la liaison toutes les 5 minutes."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Immigration (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-b1-16", level: "B1", skill: "CO" as const, topic: "immigration",
    context: "Appel au MIFI: « — Ministere de l'Immigration, bonjour. — Bonjour, j'ai soumis ma déclaration d'intérêt sur Arrima il y a 6 mois et je n'ai toujours pas été invite. — Quel est votre score approximatif? — Environ 540 points. — Le score de coupure des dernieres rondes se situe autour de 590 points. Je vous suggere d'ameliorer votre pointage. Les moyens les plus efficaces sont: ameliorer votre niveau de français, obtenir une offre d'emploi validee — surtout hors Montreal — ou obtenir un diplôme québécois. — Et si je demenage en region? — Avoir une intention de résidence hors Montreal ne rapporte pas de points dans Arrima, mais une offre d'emploi validee hors Montreal vaut beaucoup plus de points qu'a Montreal. »",
    question: "Quel est le score de coupure approximatif dans les rondes recentes d'Arrima?",
    options: ["450 points", "540 points", "590 points", "700 points"],
    correct: 2, explanation: "Le score de coupure se situe autour de 590 points."
  },
  {
    id: "co-b2-14", level: "B2", skill: "CO" as const, topic: "immigration",
    context: "Webinaire sur le CSQ: « Apres avoir reçu votre invitation d'Arrima, vous disposez de 60 jours pour soumettre votre demande de CSQ avec tous les documents requis. Le délai de traitement actuel du CSQ est d'environ 12 a 18 mois. Une fois le CSQ obtenu, vous devez ensuite soumettre votre demande de résidence permanente au fédéral via IRCC. Le délai fédéral est d'environ 12 mois supplémentaires. Au total, du depôt sur Arrima a l'obtention de la RP, comptez entre 2 et 4 ans. Pendant ce temps, vous devez maintenir un statut valide au Canada — que ce soit un permis de travail, un permis d'études ou un statut implicite. Si votre permis expire pendant le processus, demandez un renouvellement ou un pont d'attente avant l'expiration. »",
    question: "Combien de temps faut-il compter entre le depôt sur Arrima et l'obtention de la RP?",
    options: ["6 mois a 1 an", "1 a 2 ans", "2 a 4 ans", "5 a 7 ans"],
    correct: 2, explanation: "Du depôt sur Arrima a la RP, il faut compter entre 2 et 4 ans."
  },
  {
    id: "co-a2-20", level: "A2", skill: "CO" as const, topic: "immigration",
    context: "Bureau d'accueil pour immigrants: « — Bonjour, je suis arrive la semaine derniere avec un permis de travail. Quelles sont les premieres choses a faire? — Bienvenue au Québec! Voici les étapes les plus urgentes: premierement, obtenez votre NAS a Service Canada — vous en avez besoin pour travailler. Deuxiemement, inscrivez-vous a la RAMQ pour l'assurance maladie. Troisiemement, ouvrez un compte bancaire — je recommandé Desjardins, c'est la caisse populaire du Québec. Et quatriemement, inscrivez-vous a des cours de français gratuits au MIFI si votre français a besoin d'amélioration. »",
    question: "Quelle est la premiere étape a faire selon l'agent?",
    options: ["Ouvrir un compte bancaire", "S'inscrire a la RAMQ", "Obtenir son NAS a Service Canada", "Trouver un logement"],
    correct: 2, explanation: "La premiere étape est d'obtenir le NAS a Service Canada pour pouvoir travailler."
  },
  {
    id: "co-b2-15", level: "B2", skill: "CO" as const, topic: "immigration",
    context: "Entrevue avec un avocat en immigration: « Le permis de travail ouvert pour conjoint est un avantage significatif pour les travailleurs temporaires qualifies au Québec. Si vous avez un permis de travail lie a un employeur au niveau de competence TEER 0, 1, 2 ou 3, votre conjoint peut obtenir un permis de travail ouvert. Ce permis lui permet de travailler pour n'importe quel employeur au Canada. Les demandes se font en ligne via IRCC et le délai est actuellement d'environ 3 a 6 mois. C'est un facteur important dans la planification financiere du couple, car les premiers mois au Canada sont souvent difficiles avec un seul revenu. »",
    question: "Quelle condition faut-il remplir pour que le conjoint obtienne un permis ouvert?",
    options: ["Avoir un diplôme canadien", "Avoir un permis de travail qualifie (TEER 0, 1, 2 ou 3)", "Avoir obtenu la résidence permanente", "Avoir vecu au Canada pendant 2 ans"],
    correct: 1, explanation: "Le conjoint peut obtenir un permis ouvert si le travailleur a un permis lie au TEER 0, 1, 2 ou 3."
  },
  {
    id: "co-c1-7", level: "C1", skill: "CO" as const, topic: "immigration",
    context: "Analyse politique: « La politique d'immigration du Québec oscille entre deux imperatifs contradictoires: la protection du français et les besoins economiques. Le moratoire sur les permis de travail temporaire dans le Grand Montreal, instaure en 2024 et prolonge en 2025, a eu des effets pervers inattendus. Plutot que de reduire l'immigration temporaire, il a pousse les employeurs a recruter des travailleurs sans permis ou a se tourner vers des agences de placement qui contournent le système. De plus, la centralisation du processus de sélection via Arrima — un système algorithmique opaque — souleve des questions de transparence et d'equite. Les candidats ne peuvent pas savoir exactement comment leur pointage est calcule ni comprendre pourquoi ils ne sont pas invites malgre un profil apparemment competitif. L'absence de mecanisme d'appel renforce ce sentiment d'impuissance. »",
    question: "Quels effets pervers du moratoire sur les EIMT sont mentionnes?",
    options: ["Les immigrants sont partis vers d'autres provinces", "Les employeurs ont recrute sans permis ou via des agences qui contournent le système", "Les salaires ont augmenté", "Le français a progresse a Montreal"],
    correct: 1, explanation: "Le moratoire a pousse les employeurs a recruter sans permis ou via des agences contournant le système."
  },

  // ════════════════════════════════════════════════════════════
  // NEW QUESTIONS — Finances (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "co-a2-21", level: "A2", skill: "CO" as const, topic: "finances",
    context: "Conversation a la banque: « — Bonjour, je suis nouvel arrivant et j'aimerais ouvrir un compte bancaire. — Bienvenue! Nous avons un forfait pour nouveaux arrivants: pas de frais mensuels pendant la premiere annee, une carte de debit gratuite et une carte de credit avec une limite de 1 000 dollars. — J'ai besoin de mon NAS pour ouvrir un compte? — Non, vous pouvez ouvrir un compte avec votre passeport et votre permis de travail. Le NAS sera necessaire seulement quand vous voudrez ajouter un compte d'epargne CELI ou REER. »",
    question: "Quels documents sont necessaires pour ouvrir un compte bancaire de base?",
    options: ["Le NAS et un passeport", "Le passeport et le permis de travail", "La carte RAMQ et le NAS", "Un permis de conduire québécois"],
    correct: 1, explanation: "Le passeport et le permis de travail suffisent pour ouvrir un compte de base."
  },
  {
    id: "co-b1-17", level: "B1", skill: "CO" as const, topic: "finances",
    context: "Atelier financier: « Parlons du crédit au Canada. Quand vous arrivez, vous n'avez aucun historique de crédit — c'est comme si vous n'existiez pas financierement. Pour batir votre crédit, voici mes trois conseils: premierement, prenez une carte de credit securisee — vous deposez 500 dollars et la banque vous donne une limite de 500 dollars. Utilisez-la pour de petits achats et payez le solde au complet chaque mois. Deuxiemement, mettez tous vos paiements recurrents — telephone, internet — sur cette carte. Troisiemement, ne demandez pas trop de cartes de credit en meme temps, car chaque demande fait baisser votre score. Apres 6 a 12 mois de bon comportement, votre score sera suffisant pour obtenir une carte reguliere. »",
    question: "Qu'est-ce qu'une carte de credit securisee?",
    options: ["Une carte avec une protection contre le vol", "Une carte ou vous deposez un montant comme garantie et la limite est egale a ce montant", "Une carte avec une limite tres élevee", "Une carte qui ne nécessite pas de verification de credit"],
    correct: 1, explanation: "On déposé un montant (ex: 500$) et la banque donne une limite egale a ce montant."
  },
  {
    id: "co-b1-18", level: "B1", skill: "CO" as const, topic: "finances",
    context: "Caissiere chez Desjardins: « — Je vois que vous avez un CELI avec nous. Saviez-vous que vos droits de cotisation CELI commencent l'annee de votre arrivee au Canada? Si vous etes arrive en 2025, vos droits sont de 7 000 dollars pour 2025 et 7 000 pour 2026, donc 14 000 au total. L'argent que vous mettez dans un CELI n'est pas imposable — ni les interets, ni les gains en capital. C'est le meilleur outil d'epargne pour les nouveaux arrivants. — Et le REER? — Le REER est deduit de vos impots, mais vous le paierez quand vous le retirerez. Pour les premières annees, je recommandé le CELI en priorite. »",
    question: "Combien de droits de cotisation CELI un immigrant arrive en 2025 a-t-il pour 2025-2026?",
    options: ["7 000 dollars", "14 000 dollars", "21 000 dollars", "Les droits s'accumulent depuis 2009"],
    correct: 1, explanation: "7 000 pour 2025 + 7 000 pour 2026 = 14 000 dollars."
  },
  {
    id: "co-b2-16", level: "B2", skill: "CO" as const, topic: "finances",
    context: "Presentation sur les impots: « Une erreur frequente des nouveaux arrivants est de ne pas declarer leurs comptes bancaires a l'étranger. Si la valeur totale de vos comptes étrangers dépassé 100 000 dollars canadiens a un moment quelconque dans l'annee, vous devez remplir le formulaire T1135 — Bilan de verification du revenu étranger. Les penalites pour non-declaration sont severes: 2 500 dollars pour un retard de production, et jusqu'a 12 000 dollars par annee pour chaque manquement. De plus, sachez que le Canada a des ententes de partage d'information financiere avec plus de 100 pays. Donc meme si vous ne declarez pas vos comptes, il y a de fortes chances que l'ARC soit informee de leur existence. »",
    question: "A partir de quel seuil doit-on declarer ses comptes étrangers?",
    options: ["50 000 dollars", "75 000 dollars", "100 000 dollars", "200 000 dollars"],
    correct: 2, explanation: "Le seuil de declaration est de 100 000 dollars canadiens."
  },
  {
    id: "co-c1-8", level: "C1", skill: "CO" as const, topic: "finances",
    context: "Conference economique: « Le paradoxe economique des immigrants au Québec se manifeste clairement dans les données. Les immigrants de la categorie economique — selectionnes pour leurs competences — gagnent en moyenne 35% de moins que les travailleurs nes au Canada pendant les 5 premieres annees. Cet ecart persiste meme a competences egales et s'explique par trois facteurs: la non-reconnaissance des diplômes, la discrimination systemique a l'embauche et le manque de réseau professionnel. Paradoxalement, les études longitudinales montrent que les immigrants rattrapent et dépassent souvent la moyenne canadienne apres 10 a 15 ans. Le coût economique de cette sous-utilisation des talents immigrants est estime a 30 milliards de dollars par an pour l'ensemble du Canada. La question n'est donc pas de savoir si les immigrants contribuent a l'economie, mais pourquoi nous perdons tant de valeur pendant leurs premieres annees d'etablissement. »",
    question: "Quel est le coût economique annuel de la sous-utilisation des talents immigrants au Canada?",
    options: ["5 milliards de dollars", "15 milliards de dollars", "30 milliards de dollars", "50 milliards de dollars"],
    correct: 2, explanation: "La sous-utilisation des talents immigrants coute 30 milliards de dollars par an au Canada."
  },
];

// ─── COMPREHENSION ECRITE EXERCISES ───
export const CE_EXERCISES: MCQQuestion[] = [
  // === A2 Level ===
  {
    id: "ce-a2-1", level: "A2", skill: "CE", topic: "logement",
    context: "AVIS AUX LOCATAIRES\n\nLe propriétaire informe les locataires de l'immeuble situe au 4520 rue Saint-Denis que les travaux de peinture des corridors auront lieu du 15 au 22 mars 2026. L'acces principal sera limite. Veuillez utiliser l'entrée arriere pendant cette période. Les poussettes et velos devront être retires des corridors avant le 14 mars. Pour toute question, contactez le concierge au 514-555-0123.",
    question: "Que doivent faire les locataires avant le 14 mars?",
    options: ["Peindre leur appartement", "Retirer poussettes et velos des corridors", "Contacter le propriétaire", "Demenager temporairement"],
    correct: 1, explanation: "L'avis demande de retirer les poussettes et velos des corridors avant le 14 mars."
  },
  {
    id: "ce-a2-2", level: "A2", skill: "CE", topic: "emploi",
    context: "OFFRE D'EMPLOI — Commis de boulangerie\n\nBoulangerie Au Pain Dore — Montreal (Plateau Mont-Royal)\nPoste: Commis de boulangerie\nHoraire: Temps partiel, samedi et dimanche, 6h a 14h\nSalaire: 17,50$/heure + pourboires\nExigences: Français fonctionnel, experience en service a la clientele un atout, capacite de soulever 15 kg\nAvantages: Pain gratuit a la fin du quart, 20% de rabais sur tous les produits\nEnvoyez votre CV a: emploi@aupaindore.ca",
    question: "Quel est l'horaire de travail pour ce poste?",
    options: ["Du lundi au vendredi, 9h a 17h", "Samedi et dimanche, 6h a 14h", "Tous les jours, 6h a 12h", "Les soirs de semaine"],
    correct: 1, explanation: "Le poste est les samedi et dimanche, de 6h a 14h."
  },
  {
    id: "ce-a2-3", level: "A2", skill: "CE", topic: "sante",
    context: "CLINIQUE SANS RENDEZ-VOUS — CLSC Cote-des-Neiges\n\nHoraire: Lundi au vendredi, 8h a 16h\nDocuments requis:\n- Carte d'assurance maladie RAMQ (ou preuve de demande en cours)\n- Piece d'identite avec photo\n- Liste de vos médicaments actuels\n\nIMPORTANT: Si vous n'avez pas encore votre carte RAMQ, des frais de 150$ a 300$ seront exiges. Vous pourrez demander un remboursement a la RAMQ une fois votre carte recue.\n\nPour les urgences, composez le 911.\nPour des conseils de sante, composez le 811 (Info-Sante).",
    question: "Combien coute une consultation sans carte RAMQ?",
    options: ["C'est gratuit", "Entre 50$ et 100$", "Entre 150$ et 300$", "Plus de 500$"],
    correct: 2, explanation: "Sans carte RAMQ, des frais de 150$ a 300$ sont exiges."
  },
  // === B1 Level ===
  {
    id: "ce-b1-1", level: "B1", skill: "CE", topic: "administration",
    context: "GUIDE: OBTENIR VOTRE NUMERO D'ASSURANCE SOCIALE (NAS)\n\nLe NAS est un numéro a 9 chiffres nécessaire pour travailler au Canada et acceder aux programmes gouvernementaux.\n\nEtapes:\n1. Rendez-vous a un bureau de Service Canada (pas de rendez-vous nécessaire)\n2. Apportez votre permis de travail ou votre confirmation de résidence permanente ET un document d'identite avec photo\n3. Le NAS est emis sur place, meme jour\n4. Vous recevrez une lettre de confirmation par la poste dans 10 jours ouvrables\n\nATTENTION: Ne partagez jamais votre NAS par courriel ou telephone. Seuls votre employeur, votre banque et le gouvernement peuvent le demander. En cas de fraude, appelez le 1-800-206-7218.\n\nLe NAS commencant par 9 est temporaire (lie au permis de travail). Il deviendra permanent si vous obtenez la résidence permanente.",
    question: "A qui pouvez-vous donner votre NAS en toute sécurité?",
    options: ["A n'importe qui par courriel", "A votre employeur, votre banque et le gouvernement", "A votre propriétaire", "A tout le monde qui le demande"],
    correct: 1, explanation: "Seuls l'employeur, la banque et le gouvernement peuvent legitimement demander votre NAS."
  },
  {
    id: "ce-b1-2", level: "B1", skill: "CE", topic: "logement",
    context: "DROITS DES LOCATAIRES AU QUEBEC — Guide du TAL\n\nVotre propriétaire NE PEUT PAS:\n- Vous demander un dépôt de sécurité (illegal au Québec)\n- Entrer dans votre logement sans préavis de 24 heures (sauf urgence)\n- Refuser de vous louer en raison de votre origine ethnique, religion, orientation sexuelle ou situation familiale\n- Augmenter votre loyer sans suivre la méthode de calcul du TAL\n\nVotre propriétaire PEUT:\n- Demander une verification de credit et des references\n- Exiger le premier mois de loyer a la signature du bail\n- Acceder au logement pour des reparations avec un préavis de 24h\n\nEn cas de conflit, deposez une demandé au Tribunal administratif du logement (TAL): tal.gouv.qc.ca\nLigne d'aide: 1-800-683-2245",
    question: "Laquelle de ces pratiques est illegale au Québec?",
    options: ["Demander une verification de credit", "Demander un dépôt de sécurité", "Exiger le premier mois de loyer", "Demander des references"],
    correct: 1, explanation: "Les dépôts de sécurité sont illegaux au Québec."
  },
  // === B2 Level ===
  {
    id: "ce-b2-1", level: "B2", skill: "CE", topic: "immigration",
    context: "COMPRENDRE LE SYSTEME ARRIMA\n\nDepuis la fermeture du Programme de l'experience quebecoise (PEQ) en novembre 2025, le Programme de sélection des travailleurs qualifies (PSTQ) via la plateforme Arrima est devenu le seul programme de sélection permanente au Québec.\n\nLe PSTQ fonctionne par déclaration d'intérêt: le candidat créé un profil sur Arrima et reçoit un score base sur quatre catégories: capital humain (age, scolarité, langues, experience), connexion Québec (diplôme QC, experience QC, famille), marche du travail (offre d'emploi validee, profession prioritaire), et facteurs du conjoint.\n\nLes rondes d'invitation ont lieu toutes les 2 a 4 semaines, avec environ 2 500 invitations par mois. Le score competitif se situe entre 590 et 620 points. La ronde de janvier 2026 a revele que 64,5% des invites possedaient un diplôme québécois et 65,9% prévoyaient s'etablir hors de Montreal.\n\nLa maîtrise du français est le facteur le plus déterminant: un NCLC 7 en oral est pratiquement indispensable pour atteindre un score competitif. Chaque amélioration du niveau de français se traduit directement en points supplémentaires dans Arrima.",
    question: "D'apres la ronde de janvier 2026, quel profil de candidat est le plus souvent invite?",
    options: ["Les candidats anglophones de Montreal", "Les candidats avec diplôme québécois prévoyant s'etablir hors Montreal", "Les candidats avec uniquement de l'experience internationale", "Les candidats sans offre d'emploi validee"],
    correct: 1, explanation: "64,5% avaient un diplôme QC et 65,9% prévoyaient s'etablir hors Montreal."
  },
  {
    id: "ce-b2-2", level: "B2", skill: "CE", topic: "emploi",
    context: "LA RECONNAISSANCE DES DIPLOMES AU CANADA\n\nPour les immigrants qualifies, la non-reconnaissance des diplômes étrangers represente un obstacle majeur a l'intégration professionnelle. Le processus comporte plusieurs étapes:\n\n1. Évaluation comparative des études effectuees hors du Québec (ECA): le ministere de l'Immigration (MIFI) compare le diplôme étranger au système éducatif québécois. Coût: 130$ a 175$. Délai: 8 a 12 semaines.\n\n2. Pour les professions reglementees (ingenieurs, medecins, comptables, infirmieres, etc.), l'ECA ne suffit pas. Il faut obtenir un permis de l'ordre professionnel concerne — un processus qui peut prendre de 6 mois a 3 ans, incluant des examens complementaires, des stages et des formations d'appoint.\n\n3. Alternative stratégique: certains immigrants choisissent d'obtenir un diplôme québécois court (DEP ou DEC technique de 1 a 2 ans) pour contourner les obstacles de la reconnaissance. Cette stratégie offre un double avantage: le diplôme est automatiquement reconnu par les employeurs ET il rapporte 30 points bonus dans Arrima.\n\nRessource: le service Qualifications Québec (qualificationsquebec.com) offre un accompagnement gratuit.",
    question: "Pourquoi certains immigrants choisissent-ils d'obtenir un diplôme québécois court?",
    options: ["Parce que c'est obligatoire", "Pour contourner les obstacles de la reconnaissance et obtenir des points Arrima", "Parce que l'ECA est impossible a obtenir", "Pour eviter de travailler"],
    correct: 1, explanation: "Le diplôme QC est reconnu par les employeurs ET rapporte 30 points bonus Arrima."
  },
  // === C1 Level ===
  {
    id: "ce-c1-1", level: "C1", skill: "CE", topic: "société",
    context: "EDITORIAL: LE PARADOXE DE L'IMMIGRATION ECONOMIQUE AU QUEBEC\n\nLe Québec se trouve dans une situation paradoxale: il a désespérément besoin de main-d'oeuvre — 150 000 postes vacants selon le Conseil du patronat — tout en reduisant ses seuils d'immigration permanente de 59 500 a 45 000 admissions en 2026. Le gouvernement Legault mise sur une immigration « plus francophone, mieux integree, mieux répartie sur le territoire », mais les mécanismes en place semblent parfois contradictoires.\n\nD'un cote, le moratoire sur les EIMT dans la region metropolitaine de Montreal, prolonge jusqu'en décembre 2026, vise a reduire l'immigration temporaire dans la metropole. De l'autre, la bonification massive des points Arrima pour les offres d'emploi hors Montreal (380 points contre 200 a Montreal) tente de rediriger les flux vers les regions. Or, la majorite des emplois qualifies, des universites, des communautés culturelles et des services aux immigrants se concentrent a Montreal.\n\nLe résultat est un système qui favorise theoriquement le profil ideal — francophone, diplôme du Québec, pret a s'installer en region — mais qui neglige la realite vecue par la majorite des candidats a l'immigration. Comme le souligne la professeure Mireille Paquet de l'Universite Concordia: 'On ne peut pas pretendre vouloir attirer les meilleurs talents du monde tout en rendant le parcours d'immigration toujours plus complexe et restrictif.'",
    question: "Quel est le paradoxe principal identifié par l'editorialiste?",
    options: ["Le Québec veut plus d'immigration mais reduit les seuils et complique le parcours", "Les immigrants ne veulent pas s'installer au Québec", "Le français n'est plus important pour l'immigration", "Les regions ont trop d'immigrants"],
    correct: 0, explanation: "Le paradoxe est que le Québec a besoin de main-d'oeuvre mais reduit l'immigration et complique le processus."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Avis de logement (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-a2-4", level: "A2", skill: "CE" as const, topic: "logement",
    context: "AVIS D'AUGMENTATION DE LOYER\n\nDate: 15 janvier 2026\nDestinataire: Locataire du 4520, rue Saint-Denis, app. 3\n\nMadame, Monsieur,\n\nConformement a l'article 1942 du Code civil du Québec, je vous avise que votre loyer mensuel passera de 1 100$ a 1 180$, soit une augmentation de 7,3%, a compter du 1er juillet 2026.\n\nCette augmentation est justifiee par la hausse des taxes municipales (+12%), l'augmentation des primes d'assurance (+8%) et les travaux de renovation effectues en 2025 (remplacement des fenetres: 15 000$).\n\nVous disposez d'un délai d'un mois a compter de la reception de cet avis pour accepter ou refuser l'augmentation. En l'absence de reponse, l'augmentation sera consideree comme acceptee.\n\nSi vous refusez l'augmentation, le propriétaire pourra s'adresser au Tribunal administratif du logement (TAL).\n\nCordialement,\nJean-Pierre Lavoie, Propriétaire",
    question: "Que se passe-t-il si le locataire ne repond pas a cet avis?",
    options: ["Le loyer reste le meme", "L'augmentation est annulee", "L'augmentation est consideree comme acceptee", "Le bail est annule"],
    correct: 2, explanation: "En l'absence de reponse dans le délai d'un mois, l'augmentation est consideree comme acceptee."
  },
  {
    id: "ce-a2-5", level: "A2", skill: "CE" as const, topic: "logement",
    context: "ANNONCE — APPARTEMENT A LOUER\n\n3 1/2 lumineux — Rosemont-La Petite-Patrie\n\nLoyer: 1 250$/mois (chauffage inclus, électricité non incluse)\nDisponible: 1er juillet 2026\nÉtage: 3e (pas d'ascenseur)\nPlancher: bois franc\nLaveuse/sécheuse: dans l'appartement\nStationnement: non disponible\nAnimaux: chats acceptes, pas de chiens\nProximite: métro Beaubien (5 min a pied), parc Molson, ecole primaire\n\nExigences: verification de credit, 2 references, premier mois a la signature du bail\n\nVisites: samedi 15 mars, 10h a 12h\nContact: Marie-Claude, 514-555-7890",
    question: "Quels animaux sont acceptes dans cet appartement?",
    options: ["Les chiens seulement", "Les chats seulement", "Tous les animaux", "Aucun animal"],
    correct: 1, explanation: "L'annonce precise: chats acceptes, pas de chiens."
  },
  {
    id: "ce-b1-3", level: "B1", skill: "CE" as const, topic: "logement",
    context: "SECTION G — BAIL DE LOGEMENT (extrait)\n\nCLAUSES OBLIGATOIRES:\n\n1. Le loyer est payable le premier jour de chaque mois.\n2. Le locataire est responsable de l'entretien menager du logement et des menues reparations (ampoules, filtres, etc.).\n3. Le propriétaire est responsable des reparations majeures (plomberie, électricité, structure).\n4. Le locataire ne peut pas sous-louer ou ceder son bail sans le consentement ecrit du propriétaire. Le propriétaire ne peut pas refuser sans motif serieux.\n5. Le locataire peut héberger temporairement des visiteurs (moins de 30 jours) sans autorisation.\n6. Le locataire doit permettre au propriétaire d'acceder au logement pour des reparations, avec un préavis de 24 heures.\n7. A la fin du bail, le locataire doit remettre le logement dans l'etat ou il l'a reçu, a l'exception de l'usure normale.\n\nATTENTION: Toute clause contraire au Code civil du Québec ou a la Loi sur le TAL est nulle et non avenue.",
    question: "Le locataire peut-il sous-louer son appartement?",
    options: ["Non, c'est interdit dans tous les cas", "Oui, mais seulement avec le consentement ecrit du propriétaire", "Oui, sans aucune condition", "Seulement pendant les vacances d'ete"],
    correct: 1, explanation: "Le locataire peut sous-louer avec le consentement ecrit du propriétaire, qui ne peut pas refuser sans motif serieux."
  },
  {
    id: "ce-b2-3", level: "B2", skill: "CE" as const, topic: "logement",
    context: "LETTRE DE CONTESTATION D'UNE REPRISE DE LOGEMENT\n\nMontreal, le 5 fevrier 2026\n\nTribunal administratif du logement\nObjet: Contestation de la reprise du logement situe au 3245, rue Beaubien Est, app. 6\n\nMadame, Monsieur,\n\nJe, soussigne Ahmed Benali, locataire depuis 8 ans au logement indique ci-dessus, conteste la demande de reprise formulee par M. Robert Gagnon, propriétaire de l'immeuble.\n\nLe propriétaire pretend vouloir reprendre le logement pour y loger sa fille adulte. Or, j'ai de bonnes raisons de croire qu'il s'agit d'une fausse reprise destinee a augmenter le loyer. En effet:\n1. Le propriétaire a augmenté les loyers de tous les autres logements de l'immeuble de 30% apres eviction des locataires precedents.\n2. Sa fille possede deja un condo dans le meme quartier (preuve en annexe).\n3. Le propriétaire m'a offert 5 000$ pour partir volontairement, ce qui suggere un motif financier.\n\nJe demande au Tribunal de rejeter la demande de reprise et de m'accorder des dommages-interets conformement a l'article 1968 du Code civil.\n\nPieces jointes: Bail, avis de reprise, preuves.\n\nAhmed Benali",
    question: "Quel argument principal le locataire utilise-t-il pour contester la reprise?",
    options: ["Le logement est en mauvais etat", "La fille du propriétaire possede deja un condo dans le meme quartier", "Le propriétaire ne lui a pas donne assez de préavis", "Le locataire ne veut pas déménager en hiver"],
    correct: 1, explanation: "Le locataire argumente que la fille possede deja un condo, ce qui suggere une fausse reprise."
  },
  {
    id: "ce-b1-4", level: "B1", skill: "CE" as const, topic: "logement",
    context: "GUIDE DU LOCATAIRE — COUPURE DE SERVICES\n\nSi votre propriétaire ne fournit pas les services essentiels (chauffage, eau chaude, électricité dans les aires communes), voici les étapes a suivre:\n\n1. Envoyez une mise en demeure ecrite a votre propriétaire par courrier recommande. Decrivez le problème et donnez un délai raisonnable (7 a 10 jours) pour le corriger.\n2. Si le problème persiste, deposez une demande au Tribunal administratif du logement (TAL) en ligne ou par telephone.\n3. En cas d'urgence (chauffage en hiver, pas d'eau), vous pouvez demander une ordonnance d'urgence au TAL. Le délai de traitement est de 1 a 3 jours.\n4. Conservez toutes les preuves: photos, courriels, releves de temperature, temoignages de voisins.\n5. NE CESSEZ JAMAIS de payer votre loyer, meme si les services ne sont pas fournis. Le non-paiement du loyer peut entrainer votre eviction.\n\nLigne d'aide juridique gratuite: 1-800-842-2224",
    question: "Que ne faut-il JAMAIS faire meme si les services ne sont pas fournis?",
    options: ["Contacter le TAL", "Cesser de payer le loyer", "Prendre des photos", "Envoyer une mise en demeure"],
    correct: 1, explanation: "Il ne faut jamais cesser de payer le loyer, meme si les services ne sont pas fournis."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Offres d'emploi (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-a2-6", level: "A2", skill: "CE" as const, topic: "emploi",
    context: "OFFRE D'EMPLOI — Guichet-Emplois\n\nTitre: Prepose(e) a l'entretien menager\nEntreprise: Hotel Fairmont Reine Elizabeth, Montreal\nSalaire: 18,75$/heure\nType: Temps plein permanent\nHoraire: Lundi au vendredi, 7h a 15h (possibilite de fins de semaine)\n\nTaches:\n- Nettoyage des chambres et des aires communes\n- Changement de la literie et des serviettes\n- Signalement des bris et reparations nécessaires\n- Reapprovisionnement des produits d'accueil\n\nExigences:\n- Français fonctionnel (niveau minimal)\n- Capacite de travailler debout et de soulever 10 kg\n- Experience en entretien menager: un atout\n- Permis de travail valide\n\nAvantages: Repas gratuit par quart, assurance collective apres 3 mois, rabais hotel 50%\n\nPostuler: emplois@fairmont.ca avant le 31 mars 2026",
    question: "Quel avantage est offert immédiatement (sans période d'attente)?",
    options: ["L'assurance collective", "Le rabais hotel", "Le repas gratuit par quart de travail", "Les conges payes"],
    correct: 2, explanation: "Le repas gratuit est offert par quart. L'assurance collective n'est offerte qu'apres 3 mois."
  },
  {
    id: "ce-b1-5", level: "B1", skill: "CE" as const, topic: "emploi",
    context: "OFFRE D'EMPLOI — Guichet-Emplois\n\nTitre: Technicien(ne) en informatique — niveau 1\nEntreprise: CGI, bureau de Montreal\nSalaire: 52 000$ a 58 000$/annee selon experience\nType: Temps plein permanent\n\nDescription:\nNous recherchons un(e) technicien(ne) en soutien informatique pour notre equipe de service a la clientele interne. Vous serez responsable de resoudre les problèmes techniques des employes (postes de travail, reseaux, logiciels).\n\nExigences:\n- DEC en informatique ou equivalent\n- 1 a 3 ans d'experience en soutien technique\n- Bilinguisme (français et anglais) requis\n- Connaissances Windows, macOS, Active Directory, Office 365\n- Certification CompTIA A+ ou equivalent: un atout majeur\n\nConditions:\n- Horaire: lundi au vendredi, 8h30 a 17h\n- Teletravail hybride: 3 jours bureau, 2 jours maison\n- 3 semaines de vacances des la premiere annee\n- REER collectif avec contribution de l'employeur\n\nProcessus: CV + lettre de motivation a carrieres@cgi.com\nDate limite: 15 avril 2026",
    question: "Quel mode de travail est offert pour ce poste?",
    options: ["100% en personne au bureau", "100% en teletravail", "Hybride: 3 jours bureau, 2 jours maison", "Hybride: 2 jours bureau, 3 jours maison"],
    correct: 2, explanation: "Le poste offre un teletravail hybride: 3 jours bureau, 2 jours maison."
  },
  {
    id: "ce-b2-4", level: "B2", skill: "CE" as const, topic: "emploi",
    context: "OFFRE D'EMPLOI — Guichet-Emplois\n\nTitre: Ingenieur(e) en genie civil — infrastructures\nEntreprise: WSP Canada, Québec (ville)\nSalaire: 75 000$ a 95 000$/annee\nType: Temps plein permanent\n\nDescription:\nWSP recherche un(e) ingenieur(e) en genie civil pour rejoindre son equipe de conception d'infrastructures municipales dans la region de Québec. Le candidat retenu participera a la conception de systèmes de drainage, de routes et d'ouvrages d'art.\n\nExigences obligatoires:\n- Baccalaureat en genie civil ou equivalent\n- Membre en regle de l'Ordre des ingenieurs du Québec (OIQ) ou processus d'admission en cours\n- 3 a 7 ans d'experience pertinente\n- Maîtrise du français (oral et ecrit)\n- Maîtrise des logiciels AutoCAD Civil 3D et MicroStation\n\nAtouts:\n- Experience avec les normes municipales québécoises\n- Permis de conduire classe 5\n- Experience en gestion de projets\n\nAvantages:\n- Programme de mentorat pour ingenieurs formes a l'étranger\n- Remboursement des frais d'admission a l'OIQ\n- Programme de formation continue\n- Horaire flexible et teletravail 2 jours/semaine\n\nNOTE: Les candidats en processus d'obtention de leur permis de l'OIQ sont encourages a postuler. WSP offre un accompagnement personnalise pour faciliter l'integration des ingenieurs formes a l'étranger.",
    question: "Que propose WSP aux ingenieurs formes a l'étranger?",
    options: ["Un salaire plus élève", "Un programme de mentorat et le remboursement des frais d'admission a l'OIQ", "Un poste sans exigence de l'OIQ", "Un transfert dans un autre pays"],
    correct: 1, explanation: "WSP offre un programme de mentorat et le remboursement des frais d'admission a l'OIQ."
  },
  {
    id: "ce-a2-7", level: "A2", skill: "CE" as const, topic: "emploi",
    context: "OFFRE D'EMPLOI — Kijiji\n\nTitre: Livreur/livreuse a velo\nEntreprise: Livraison Montreal Express\nSalaire: A la commission — moyenne 18$ a 25$/heure\nType: Travailleur autonome, horaires flexibles\n\nDescription: Livraison de repas et de colis dans le centre-ville de Montreal.\n\nExigences:\n- Avoir son propre velo (velo electrique accepte)\n- Telephone intelligent avec forfait de données\n- Connaissance des rues de Montreal\n- Disponible au moins 15 heures par semaine\n- NAS valide\n\nAvantages: Horaires 100% flexibles, pourboires en plus de la commission.\n\nATTENTION: Comme travailleur autonome, vous etes responsable de vos propres impots et vous n'avez pas d'assurance de la CNESST.\n\nContact: livraisonmtl@gmail.com",
    question: "Quel est le statut d'emploi pour ce poste?",
    options: ["Employe a temps plein", "Employe a temps partiel", "Travailleur autonome", "Stagiaire"],
    correct: 2, explanation: "Le poste est a titre de travailleur autonome, avec ses propres responsabilites fiscales."
  },
  {
    id: "ce-b1-6", level: "B1", skill: "CE" as const, topic: "emploi",
    context: "OFFRE D'EMPLOI — Emploi Québec\n\nTitre: Educateur/educatrice en garderie\nEntreprise: CPE Les Petits Explorateurs, Laval\nSalaire: 21,71$ a 29,93$/heure (selon echelon)\nType: Temps plein permanent\n\nDescription: Planifier et animer des activites educatives pour un groupe de 8 enfants de 18 mois a 3 ans.\n\nExigences:\n- DEC en techniques d'education a l'enfance OU évaluation comparative (ECA) d'un diplôme équivalent\n- Absence d'empechement judiciaire (verification d'antecedents)\n- Certification en premiers soins adaptee a la petite enfance\n- Français avance (oral et ecrit)\n\nAvantages:\n- Regime de retraite a prestations determinees (RREGOP)\n- 4 semaines de vacances apres 1 an\n- Journees de maladie payees\n- Formation continue payee par l'employeur\n- Fermeture pendant les Fetes (2 semaines payees)\n\nPostuler: rh@cpepetitsexplorateurs.ca avec CV et copie des diplômes",
    question: "Quelle verification est obligatoire pour ce poste?",
    options: ["Verification de credit", "Verification des references", "Verification d'antecedents judiciaires", "Verification du permis de conduire"],
    correct: 2, explanation: "L'absence d'empechement judiciaire (verification d'antecedents) est requise pour travailler en garderie."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Articles de journal (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-b2-5", level: "B2", skill: "CE" as const, topic: "société",
    context: "LA PENURIE DE MAIN-D'OEUVRE FRAPPE LES REGIONS\n\nLe Devoir — 10 mars 2026\n\nAlors que Montreal lutte contre la surdensification et la crise du logement, les regions du Québec font face au problème inverse: un manque chronique de travailleurs qui menace la survie d'entreprises etablies depuis des decennies.\n\nA Rimouski, l'usine de transformation alimentaire Aliments Whyte's a dû reduire sa production de 30% faute de personnel. « On a des commandes, on a les machines, mais on n'a pas les bras », deplore le directeur general. La situation est similaire a Sherbrooke, Trois-Rivieres et Saguenay.\n\nLe gouvernement tente de rediriger l'immigration vers ces regions avec des incitatifs dans Arrima. Mais les critiques sont nombreuses: manque de services d'accueil en region, absence de communautés culturelles, isolement, et des emplois souvent precaires ou saisonniers.\n\n« On demande aux immigrants de s'installer la ou meme les Québécois de souche ne veulent plus vivre », ironise un chercheur de l'INRS. « Sans investissements massifs dans le logement, les services de garde et le transport en region, la regionalisation de l'immigration restera un voeu pieux. »",
    question: "Pourquoi la regionalisation de l'immigration est-elle difficile selon l'article?",
    options: ["Les immigrants ne parlent pas français", "Il manque de services d'accueil, de logements et de transport en region", "Les entreprises regionales n'embauchent pas d'immigrants", "Le gouvernement interdit l'immigration en region"],
    correct: 1, explanation: "L'article cite le manque de services d'accueil, l'absence de communautés, l'isolement et les emplois precaires."
  },
  {
    id: "ce-b2-6", level: "B2", skill: "CE" as const, topic: "société",
    context: "FRANÇAIS AU TRAVAIL: LA LOI 96 CHANGE LA DONNE\n\nLe Journal de Montreal — 2 mars 2026\n\nDepuis l'entree en vigueur progressive de la loi 96 (Loi sur la langue officielle et commune du Québec), les entreprises de 25 employés et plus doivent obtenir un certificat de francisation de l'OQLF. Auparavant, ce seuil etait fixe a 50 employés.\n\nConcrètement, cela signifie que des milliers de PME doivent désormais demontrer que le français est la langue normale de travail: communications internes, affichage, logiciels, formation et service a la clientele. Les entreprises disposent d'un délai de 3 ans pour se conformer.\n\nPour les travailleurs immigrants, l'impact est double. D'un cote, la loi renforce l'importance du français pour l'employabilite — les offres d'emploi ne peuvent plus exiger l'anglais sans justification. De l'autre, certains employeurs anglophones de Montreal craignent de perdre des talents bilingues au profit de l'Ontario ou de la Colombie-Britannique.\n\nL'OQLF a embauche 100 inspecteurs supplementaires pour surveiller l'application de la loi.",
    question: "Quel changement majeur la loi 96 apporte-t-elle pour les PME?",
    options: ["Les entreprises doivent payer une taxe sur l'anglais", "Les entreprises de 25 employés et plus doivent obtenir un certificat de francisation", "Toutes les entreprises doivent embaucher des francophones", "L'anglais est interdit au travail"],
    correct: 1, explanation: "Le seuil est passe de 50 a 25 employés pour l'obligation de certificat de francisation."
  },
  {
    id: "ce-c1-2", level: "C1", skill: "CE" as const, topic: "société",
    context: "DOSSIER: LA SANTE MENTALE DES IMMIGRANTS, L'ANGLE MORT DU SYSTEME\n\nLe Devoir — 18 mars 2026\n\nDerriere les statistiques sur l'integration economique se cache une realite moins quantifiable mais tout aussi preoccupante: la detresse psychologique des nouveaux arrivants.\n\nUne etude de l'Universite de Montreal revele que 40% des immigrants economiques presentent des symptomes de depression ou d'anxiete dans les deux premieres annees d'etablissement — un taux trois fois superieur a celui de la population generale.\n\nLe deuil migratoire, concept theorise par le psychologue Joseba Achotegui, designe la perte simultanee de plusieurs reperes: famille, langue, statut social, reseau professionnel et identite culturelle. Contrairement a un deuil classique, il est ambigu — la personne n'a pas perdu ces elements definitivement, mais y a difficilement acces.\n\nLe système de sante québécois est mal equipe pour repondre a cette realite. Les listes d'attente en sante mentale publique depassent 18 mois, les psychologues en pratique privee coutent entre 120 et 200 dollars la seance, et les professionnels formes en approche interculturelle sont rares. Le Programme d'aide aux nouveaux arrivants (PANA) offre 5 seances gratuites, mais les intervenants sont souvent debourdes.\n\n« On investit dans l'enseignement du français et l'integration au marche du travail, mais on neglige completement le bien-etre psychologique », conclut la chercheuse Marie-Josee Drolet.",
    question: "Pourquoi le deuil migratoire est-il qualifie d'ambigu?",
    options: ["Parce que les immigrants ne savent pas s'ils sont tristes", "Parce que la personne n'a pas perdu ces elements definitivement mais y a difficilement acces", "Parce que les medecins ne le reconnaissent pas", "Parce qu'il disparait rapidement"],
    correct: 1, explanation: "Le deuil est ambigu car la personne n'a pas perdu ses reperes definitivement, mais y a difficilement acces."
  },
  {
    id: "ce-b1-7", level: "B1", skill: "CE" as const, topic: "société",
    context: "LA CONSTRUCTION MANQUE DE BRAS\n\nRadio-Canada — 5 mars 2026\n\nL'industrie de la construction au Québec a besoin de 15 000 nouveaux travailleurs par an pour les 5 prochaines annees, selon la Commission de la construction du Québec (CCQ).\n\nLes metiers les plus recherches: electricien, plombier, charpentier-menuisier, soudeur et operateur de machinerie lourde. Les salaires sont attrayants — un electricien gagne en moyenne 38 dollars de l'heure — mais les barrieres d'entree sont elevees.\n\nPour travailler sur un chantier de construction au Québec, il faut obligatoirement detenir une carte de competence de la CCQ. Pour les immigrants, le processus passe par la reconnaissance de l'experience acquise a l'étranger, un examen theorique et un examen pratique.\n\nLe programme Integrer la construction, lance en 2024, offre un parcours accelere de 6 mois qui combine formation, stage en entreprise et accompagnement pour l'obtention de la carte CCQ. Le programme est gratuit pour les résidents permanents et les refugies.",
    question: "Qu'est-ce qui est obligatoire pour travailler sur un chantier au Québec?",
    options: ["Un diplôme universitaire", "Une carte de competence de la CCQ", "5 ans d'experience minimum", "La citoyennete canadienne"],
    correct: 1, explanation: "Il faut obligatoirement detenir une carte de competence de la CCQ."
  },
  {
    id: "ce-c1-3", level: "C1", skill: "CE" as const, topic: "société",
    context: "OPINION: LE MYTHE DE L'IMMIGRANT IDEAL\n\nLa Presse — 12 mars 2026\n\nLe Québec recherche l'immigrant ideal: francophone, jeune, diplôme, pret a s'installer en region et disposant d'une offre d'emploi validee. Ce profil existe — mais il represente moins de 5% des candidats reels a l'immigration.\n\nLe système Arrima, concu comme un outil de sélection meritocratique, produit en realite des effets discriminatoires structurels. Les points attribues a l'age (maximum entre 18 et 35 ans), au diplôme québécois et a l'offre d'emploi validee creent un biais systematique en faveur des jeunes etudiants internationaux qui ont les moyens de financer des études au Québec — souvent des individus issus de classes privilegiees dans leur pays d'origine.\n\nParallèlement, un travailleur experimental de 42 ans, ayant 15 ans d'experience dans son domaine, parlant français couramment mais n'ayant pas les moyens de retourner aux études, se retrouve avec un score insuffisant pour être invite.\n\nLe résultat: un système qui pretend selectionner les « meilleurs » candidats mais qui, en pratique, reproduit les inegalites socioeconomiques mondiales sous couvert de critères objectifs.",
    question: "Quelle critique principale l'auteur formule-t-il contre le système Arrima?",
    options: ["Il ne selectionne pas assez d'immigrants", "Il est trop lent", "Il produit des effets discriminatoires structurels en favorisant les jeunes etudiants privilegies", "Il est trop facile a manipuler"],
    correct: 2, explanation: "L'auteur argumente qu'Arrima créé un biais en faveur des jeunes etudiants privilegies, reproduisant les inegalites."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Documents administratifs (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-a2-8", level: "A2", skill: "CE" as const, topic: "administration",
    context: "FORMULAIRE DE DEMANDE — CARTE D'ASSURANCE MALADIE DU QUEBEC (RAMQ)\n\nINFORMATIONS REQUISES:\n- Nom de famille (tel qu'il apparait sur votre document d'immigration)\n- Prénom(s)\n- Date de naissance\n- Sexe\n- Adresse au Québec (adresse temporaire acceptee)\n- Numéro de telephone\n\nDOCUMENTS A JOINDRE:\n- Copie de votre permis de travail, permis d'études OU confirmation de résidence permanente\n- Copie de votre passeport (page photo)\n- Preuve d'adresse au Québec (bail, facture Hydro-Québec, releve bancaire)\n\nDELAIS:\n- Délai de carence: 3 mois a partir de la date d'arrivee au Québec (ne s'applique pas aux refugies et a certaines categories)\n- Délai de traitement: 4 a 6 semaines apres la fin du délai de carence\n- Vous recevrez une carte temporaire par courriel et une carte avec photo par la poste\n\nFRAIS: Aucun frais pour l'inscription a la RAMQ",
    question: "Combien de temps dure le délai de carence pour la RAMQ?",
    options: ["1 mois", "2 mois", "3 mois", "6 mois"],
    correct: 2, explanation: "Le délai de carence est de 3 mois a partir de la date d'arrivee."
  },
  {
    id: "ce-b1-8", level: "B1", skill: "CE" as const, topic: "administration",
    context: "GUIDE: ECHANGE DE PERMIS DE CONDUIRE A LA SAAQ\n\nLe Québec a des ententes de reciprocite avec 32 pays et territoires. Si votre pays figure sur la liste, vous pouvez échanger votre permis sans passer d'examen.\n\nPAYS AVEC ENTENTE (exemples): France, Belgique, Suisse, Royaume-Uni, Autriche, Allemagne, Japon, Coree du Sud, Taïwan.\n\nPROCEDURE POUR LES PAYS AVEC ENTENTE:\n1. Prenez rendez-vous a un point de service SAAQ\n2. Apportez: permis de conduire étranger original, traduction certifiee (si non en français/anglais), passeport, preuve de résidence au Québec\n3. Frais: 12$ pour la verification + 27,25$ pour le nouveau permis = 39,25$ total\n4. Votre permis étranger sera conserve par la SAAQ et retourne a votre pays d'origine\n\nPROCEDURE POUR LES PAYS SANS ENTENTE:\n1. Examen theorique (en français, anglais ou avec interprete): 12$\n2. Cours de conduite obligatoire (si moins de 2 ans d'experience): environ 900$\n3. Examen pratique: 30$\n4. Vous devez vous inscrire a une ecole de conduite agrée par la SAAQ\n\nATTENTION: Vous pouvez conduire avec votre permis étranger ou international pendant les 6 premiers mois seulement.",
    question: "Qu'arrive-t-il au permis étranger original apres l'echange?",
    options: ["Le conducteur le garde comme souvenir", "Il est détruit", "Il est conserve par la SAAQ et retourne au pays d'origine", "Il devient un document supplementaire valide"],
    correct: 2, explanation: "Le permis étranger est conserve par la SAAQ et retourne au pays d'origine."
  },
  {
    id: "ce-b2-7", level: "B2", skill: "CE" as const, topic: "administration",
    context: "AVIS — ALLOCATION CANADIENNE POUR ENFANTS (ACE)\n\nAgence du revenu du Canada\n\nMadame, Monsieur,\n\nVotre demande d'Allocation canadienne pour enfants a été traitee. Voici le détail de vos versements:\n\nEnfant 1 (Yasmine, nee le 15/03/2020): 583,08$/mois\nEnfant 2 (Omar, ne le 22/07/2023): 583,08$/mois\nTotal mensuel: 1 166,16$\n\nVos versements seront deposes le 20 de chaque mois dans votre compte bancaire.\n\nIMPORTANT:\n- L'ACE est calculee en fonction de votre revenu familial net de l'annee precedente. Elle sera recalculee en juillet de chaque annee.\n- Si votre revenu familial augmente, le montant de l'ACE pourrait diminuer.\n- L'ACE est non imposable — vous n'avez pas a la declarer comme revenu.\n- Vous devez produire une déclaration de revenus chaque annee pour continuer a recevoir l'ACE, meme si vous n'avez aucun revenu.\n- Si votre situation familiale change (separation, nouvel enfant, demenagement), informez l'ARC dans les 30 jours.\n\nPour toute question: 1-800-387-1193",
    question: "Que doit-on faire pour continuer a recevoir l'ACE chaque annee?",
    options: ["Renouveler la demande chaque annee", "Produire une déclaration de revenus meme sans revenu", "Envoyer les bulletins scolaires des enfants", "Prouver que les enfants vivent toujours au Canada"],
    correct: 1, explanation: "Il faut produire une déclaration de revenus chaque annee pour continuer a recevoir l'ACE."
  },
  {
    id: "ce-a2-9", level: "A2", skill: "CE" as const, topic: "administration",
    context: "INSCRIPTION — COURS DE FRANÇAIS GRATUITS (MIFI)\n\nLe ministere de l'Immigration, de la Francisation et de l'Integration offre des cours de français gratuits aux personnes immigrantes.\n\nQUI PEUT S'INSCRIRE:\n- Résidents permanents\n- Travailleurs temporaires (avec permis valide)\n- Refugies\n- Conjoints de Canadiens/résidents permanents\n\nTYPES DE COURS:\n- Temps plein: 30 heures/semaine, du lundi au vendredi (allocation de 230$/semaine pour la participation)\n- Temps partiel: 4 a 12 heures/semaine (soir ou fin de semaine)\n- En ligne: 4 heures/semaine, a votre rythme\n\nNIVEAUX: Debutant a avance (1 a 12)\n\nINSCRIPTION: Appelez le 1-877-643-4505 ou visitez un bureau du MIFI\n\nDOCUMENTS: Piece d'identite, document d'immigration, preuve d'adresse",
    question: "Combien recoit un etudiant qui suit les cours a temps plein?",
    options: ["Les cours sont gratuits mais sans allocation", "115 dollars par semaine", "230 dollars par semaine", "500 dollars par mois"],
    correct: 2, explanation: "Les etudiants a temps plein reçoivent une allocation de 230 dollars par semaine."
  },
  {
    id: "ce-b2-8", level: "B2", skill: "CE" as const, topic: "administration",
    context: "AVIS DE COTISATION — REVENU QUEBEC\n\nAnnee d'imposition: 2025\nContribuable: Maria Gonzalez\nNAS: ***-***-789\n\nRevenu total declare: 42 500$\nRetenues a la source: 8 750$\nImpot provincial calcule: 7 200$\n\nCredits d'impot:\n- Credit personnel de base: 1 878$\n- Credit pour frais de scolarite (transfere): 650$\n- Credit de solidarite: 1 200$/annee (verse mensuellement)\n- Crédit pour frais médicaux: 420$\n\nResultat: Remboursement de 2 298$\n\nCe remboursement sera déposé dans votre compte bancaire d'ici 10 jours ouvrables.\n\nVERIFICATION: Revenu Québec se reserve le droit de verifier votre déclaration dans les 3 annees suivant l'avis de cotisation. Conservez tous vos reçus et documents justificatifs.\n\nPour contester cet avis: Vous disposez de 90 jours pour deposer un avis d'opposition.",
    question: "Combien de temps a le contribuable pour contester l'avis de cotisation?",
    options: ["30 jours", "60 jours", "90 jours", "1 an"],
    correct: 2, explanation: "Le contribuable dispose de 90 jours pour deposer un avis d'opposition."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Courriels professionnels (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-a2-10", level: "A2", skill: "CE" as const, topic: "emploi",
    context: "De: rh@restaurantcheznous.ca\nA: ahmed.hassan@gmail.com\nObjet: Confirmation de votre embauche\n\nBonjour Ahmed,\n\nNous avons le plaisir de vous confirmer votre embauche au poste d'aide-cuisinier a compter du lundi 24 mars 2026.\n\nVoici les détails:\n- Horaire: mercredi a dimanche, 11h a 19h (conge lundi et mardi)\n- Salaire: 17,50$/heure\n- Période d'essai: 3 mois\n- Uniforme: fourni par le restaurant (2 chemises, 1 tablier, 1 filet a cheveux)\n\nVeuillez apporter le premier jour:\n- Votre NAS\n- Une piece d'identite avec photo\n- Un specimen de cheque (pour le dépôt direct)\n- Votre carte de manieur d'aliments\n\nPrésentez-vous a 10h30 le 24 mars pour la formation.\n\nBienvenue dans l'equipe!\n\nSylvie Tremblay\nResponsable des ressources humaines",
    question: "A quelle heure Ahmed doit-il se presenter le premier jour?",
    options: ["8h", "10h30", "11h", "12h"],
    correct: 1, explanation: "Ahmed doit se presenter a 10h30 pour la formation."
  },
  {
    id: "ce-b1-9", level: "B1", skill: "CE" as const, topic: "emploi",
    context: "De: direction@cpelespommiers.ca\nA: fatou.diallo@outlook.com\nObjet: Suivi de votre candidature — poste d'educatrice\n\nBonjour Madame Diallo,\n\nNous accusons reception de votre candidature pour le poste d'educatrice a la petite enfance.\n\nApres examen de votre dossier, nous constatons que votre diplôme en education de la petite enfance obtenu au Senegal necessite une évaluation comparative des études effectuees hors du Québec (ECA) delivree par le MIFI. Cette étape est obligatoire pour l'obtention d'un poste qualifie en CPE.\n\nEn attendant, nous pouvons vous offrir un poste d'aide-educatrice (sans exigence d'ECA) au salaire de 19,25$/heure. Ce poste vous permettrait de commencer a travailler immédiatement tout en completant vos demarches de reconnaissance.\n\nSi vous etes intéressée, veuillez nous contacter avant le 20 mars.\n\nCordialement,\nAnne-Marie Bouchard\nDirectrice",
    question: "Pourquoi Mme Diallo ne peut-elle pas obtenir le poste d'educatrice immédiatement?",
    options: ["Elle n'a pas assez d'experience", "Son diplôme étranger necessite une évaluation comparative (ECA)", "Elle ne parle pas français", "Le poste a été pourvu"],
    correct: 1, explanation: "Son diplôme du Senegal necessite une ECA du MIFI pour un poste qualifie en CPE."
  },
  {
    id: "ce-b2-9", level: "B2", skill: "CE" as const, topic: "emploi",
    context: "De: paul.levesque@wsp.com\nA: ingenieur.omar@gmail.com\nObjet: Processus d'admission a l'OIQ — mise a jour\n\nBonjour Omar,\n\nSuite a notre conversation, voici un résumé du processus d'admission a l'Ordre des ingenieurs du Québec (OIQ) pour les ingenieurs formes a l'étranger:\n\n1. Demande de permis (frais: 574,34$): Soumettez votre dossier avec diplôme, releve de notes, descriptions de cours et attestations d'experience.\n2. Analyse du dossier (délai: 4 a 8 mois): L'OIQ compare votre formation avec le programme canadien.\n3. Examens de controle (si requis): Jusqu'a 7 examens techniques selon les lacunes identifiees. Coût: 150$ par examen.\n4. Examen professionnel obligatoire: Porte sur la deontologie, l'ethique et le cadre legal de la pratique au Québec. Doit être reussi meme si aucun examen technique n'est requis.\n5. Stage de juniorat (12 mois minimum): Sous la supervision d'un ingenieur membre de l'OIQ.\n\nBonne nouvelle: WSP est pret a vous accueillir en stage de juniorat pendant ce processus. Votre salaire sera ajuste a l'echelon d'ingenieur junior (68 000$/annee).\n\nN'hesitez pas si vous avez des questions.\n\nPaul Levesque, ing.\nDirecteur technique — Infrastructures",
    question: "Combien coute un examen technique de controle a l'OIQ?",
    options: ["50 dollars", "100 dollars", "150 dollars", "574,34 dollars"],
    correct: 2, explanation: "Chaque examen technique de controle coute 150 dollars."
  },
  {
    id: "ce-a2-11", level: "A2", skill: "CE" as const, topic: "emploi",
    context: "De: gerant@depanneurbonjour.ca\nA: li.wei@gmail.com\nObjet: Votre horaire de la semaine prochaine\n\nBonjour Wei,\n\nVoici votre horaire pour la semaine du 24 au 30 mars:\n\nLundi: 15h a 23h\nMardi: conge\nMercredi: 7h a 15h\nJeudi: 15h a 23h\nVendredi: conge\nSamedi: 7h a 15h\nDimanche: 7h a 15h\n\nTotal: 40 heures\n\nRappel: La livraison de Coca-Cola arrive mercredi matin a 8h. Assurez-vous d'etre disponible pour la recevoir et la ranger.\n\nMerci,\nFrançois",
    question: "Combien de jours de conge Wei a-t-il cette semaine?",
    options: ["1 jour", "2 jours", "3 jours", "Aucun"],
    correct: 1, explanation: "Wei a 2 jours de conge: mardi et vendredi."
  },
  {
    id: "ce-b1-10", level: "B1", skill: "CE" as const, topic: "emploi",
    context: "De: info@emploiquebec.gouv.qc.ca\nA: juan.martinez@gmail.com\nObjet: Votre admissibilite au programme Subvention salariale\n\nBonjour Monsieur Martinez,\n\nSuite a votre entrevue avec votre conseiller en emploi, nous confirmons votre admissibilite au programme de Subvention salariale d'Emploi-Québec.\n\nCe programme permet a un employeur de recevoir une subvention couvrant jusqu'a 50% de votre salaire pendant les 6 premiers mois d'emploi. L'objectif est de faciliter votre integration professionnelle.\n\nPour beneficier du programme:\n1. Trouvez un employeur pret a vous embaucher\n2. L'employeur doit remplir une demande aupres d'Emploi-Québec AVANT votre premier jour de travail\n3. L'emploi doit être d'une duree minimale de 30 heures/semaine\n4. Le salaire doit être d'au moins 20$/heure\n\nCe programme est tres apprecie des employeurs car il reduit leur risque financier. N'hesitez pas a le mentionner lors de vos entrevues.\n\nVotre conseiller: Marie-Eve Fournier, 514-555-3456",
    question: "Quelle proportion du salaire le programme couvre-t-il?",
    options: ["25%", "50%", "75%", "100%"],
    correct: 1, explanation: "Le programme couvre jusqu'a 50% du salaire pendant les 6 premiers mois."
  },

  // ════════════════════════════════════════════════════════════
  // NEW CE QUESTIONS — Publicites et annonces locales (5)
  // ════════════════════════════════════════════════════════════
  {
    id: "ce-a2-12", level: "A2", skill: "CE" as const, topic: "logement",
    context: "PUBLICITE — MEUBLES USAGES\n\nVENTE DE GARAGE — Demenagement!\n\nTout doit partir avant le 28 juin!\n\n- Sofa 3 places (bon etat): 150$\n- Table de cuisine + 4 chaises: 100$\n- Lit double avec matelas (2 ans): 200$\n- Commode 6 tiroirs: 75$\n- Micro-ondes Samsung: 30$\n- Aspirateur Dyson (comme neuf): 120$\n- Bureau d'ordinateur: 50$\n\nLivraison possible dans un rayon de 10 km (frais supplementaires de 40$)\n\nAdresse: 3456 rue Ontario Est, app. 5 (Hochelaga)\nDisponible pour visites: samedi et dimanche, 10h a 16h\nContact: Yves, 438-555-2345 (texto seulement)\n\nPaiement: argent comptant ou virement Interac",
    question: "Combien coute la livraison?",
    options: ["C'est gratuit", "20 dollars", "40 dollars", "Pas de livraison disponible"],
    correct: 2, explanation: "La livraison coute 40 dollars supplementaires dans un rayon de 10 km."
  },
  {
    id: "ce-a2-13", level: "A2", skill: "CE" as const, topic: "sante",
    context: "PUBLICITE — CLINIQUE DENTAIRE SOURIRE PLUS\n\nBienvenue aux nouveaux patients!\n\nNos services:\n- Examen et nettoyage complet: 250$\n- Radiographies panoramiques: 80$\n- Plombage (obturation): a partir de 150$\n- Blanchiment des dents: 350$\n\nHoraire: Lundi a vendredi, 8h a 20h | Samedi, 9h a 15h\n\nIMPORTANT: Les soins dentaires ne sont PAS couverts par la RAMQ pour les adultes. Verifiez si votre assurance privee couvre les soins dentaires.\n\nEXCEPTION: Les soins dentaires sont gratuits pour les enfants de moins de 10 ans avec la carte RAMQ.\n\nPaiement: Nous facturons directement votre assurance privee si possible.\n\nAdresse: 1200 rue Sainte-Catherine Ouest, bureau 300\nMetro: Peel (sortie nord)\n\nAppellez le 514-555-DENT pour un rendez-vous.",
    question: "Pour qui les soins dentaires sont-ils gratuits avec la RAMQ?",
    options: ["Tous les résidents du Québec", "Les personnes agees de 65 ans et plus", "Les enfants de moins de 10 ans", "Les nouveaux arrivants pendant 1 an"],
    correct: 2, explanation: "Les soins dentaires sont gratuits pour les enfants de moins de 10 ans avec la RAMQ."
  },
  {
    id: "ce-b1-11", level: "B1", skill: "CE" as const, topic: "finances",
    context: "PUBLICITE — DESJARDINS — FORFAIT NOUVEAUX ARRIVANTS\n\nBienvenue au Québec! Desjardins vous accompagne.\n\nFORFAIT DEPART: Gratuit pendant 2 ans\n\nInclus:\n- Compte cheques avec transactions illimitees\n- Carte de debit Interac\n- Carte de credit Visa Desjardins (limite de 500$ a 1 500$ selon votre profil)\n- Aucuns frais mensuels pendant 24 mois\n- Application Desjardins pour la gestion en ligne\n- AccesD Internet et mobile\n\nBONUS EXCLUSIF:\n- 100$ en argent a l'ouverture du compte (avec dépôt de 1 000$ ou plus)\n- Taux privilegie pour l'envoi d'argent a l'étranger (frais reduits de 50%)\n- 1 consultation gratuite avec un conseiller financier spécialise en immigration\n\nDOCUMENTS REQUIS:\n- Passeport valide\n- Document d'immigration (permis de travail, RP ou statut de refugie)\n- Preuve d'adresse au Québec (bail ou lettre d'hebergement)\n\nPrenez rendez-vous dans votre caisse populaire la plus proche: desjardins.com/nouveauxarrivants",
    question: "Pendant combien de temps le forfait est-il gratuit?",
    options: ["6 mois", "12 mois", "24 mois", "C'est gratuit pour toujours"],
    correct: 2, explanation: "Le forfait Depart est gratuit pendant 24 mois (2 ans)."
  },
  {
    id: "ce-b1-12", level: "B1", skill: "CE" as const, topic: "transport",
    context: "PUBLICITE — ECOLE DE CONDUITE TECNIC\n\nOBTENEZ VOTRE PERMIS DE CONDUIRE AU QUEBEC!\n\nCours complet de conduite (obligatoire pour les nouveaux conducteurs):\n- 24 heures de theorie en classe ou en ligne\n- 15 heures de conduite pratique avec moniteur\n- Acces au simulateur de conduite\n- Duree du programme: 12 mois minimum\n\nPrix: 899$ (paiement en 4 versements de 224,75$)\n\nPOUR LES NOUVEAUX ARRIVANTS:\n- Si vous avez 2 ans ou plus d'experience de conduite dans votre pays, vous n'avez PAS besoin du cours complet.\n- Vous devez cependant passer l'examen theorique et l'examen pratique a la SAAQ.\n- Nous offrons un cours de preparation a l'examen pratique de 5 heures: 350$\n- Ce cours couvre les particularites de la conduite au Québec: virage a droite au feu rouge (interdit a Montreal!), priorite aux pietons, conduite hivernale.\n\nInscription: tecnic.ca | 1-800-555-TECNIC\n5 succursales a Montreal",
    question: "Qu'est-ce qui est interdit a Montreal en ce qui concerne la conduite?",
    options: ["Conduire la nuit", "Le virage a droite au feu rouge", "Stationner dans la rue", "Utiliser un GPS"],
    correct: 1, explanation: "Le virage a droite au feu rouge est interdit a Montreal."
  },
  {
    id: "ce-b2-10", level: "B2", skill: "CE" as const, topic: "société",
    context: "ANNONCE — ORGANISME COMMUNAUTAIRE\n\nLE CENTRE D'AIDE AUX NOUVEAUX ARRIVANTS (CANA)\nVos allies dans votre parcours d'integration\n\nSERVICES GRATUITS:\n\n1. Accueil et orientation (premiere semaine)\n   - Évaluation de vos besoins\n   - Plan d'integration personnalise\n   - Aide aux demarches urgentes (NAS, RAMQ, inscription scolaire)\n\n2. Accompagnement en emploi\n   - Ateliers de redaction de CV et preparation aux entrevues\n   - Programme de mentorat professionnel (jumelage avec un professionnel de votre domaine)\n   - Acces au programme de Subvention salariale\n\n3. Francisation et integration\n   - Jumelage interculturel avec une famille québécoise\n   - Ateliers de comprehension de la culture québécoise\n   - Sorties de groupe (cabane a sucre, festivals, activites sportives)\n\n4. Soutien psychosocial\n   - 5 seances de soutien psychologique (Programme PANA)\n   - Groupes de soutien pour femmes immigrantes\n   - Groupe de parole pour hommes en transition\n\nADMISSIBILITE: Résidents permanents, refugies, travailleurs temporaires\nADRESSE: 5000 rue Jean-Talon Est, bureau 200 (metro Saint-Michel)\nTELEPHONE: 514-555-CANA | SITE: www.cana-mtl.org\n\nFinance par le MIFI et IRCC",
    question: "Quel service de sante mentale est offert aux nouveaux arrivants?",
    options: ["Therapie illimitee gratuite", "5 seances de soutien psychologique via le PANA", "Hospitalisation psychiatrique", "Médicaments gratuits"],
    correct: 1, explanation: "Le Programme PANA offre 5 seances de soutien psychologique."
  },
];

// ─── EXPRESSION ECRITE EXERCISES ───
export const EE_EXERCISES: WritingPrompt[] = [
  // === A2 ===
  {
    id: "ee-a2-1", level: "A2", type: "message", topic: "logement",
    prompt_fr: "Vous etes nouvel arrivant au Québec. Ecrivez un courriel a votre propriétaire pour signaler un problème dans votre appartement (chauffage, eau chaude, bruit, etc.). Decrivez le problème, dites depuis quand il existe, et demandez une intervention.",
    prompt_en: "You are a newcomer to Québec. Write an email to your landlord to report a problem in your apartment (heating, hot water, noise, etc.). Describe the problem, say how long it has existed, and request an intervention.",
    wordCount: { min: 60, max: 120 },
    criteria: ["Formule de politesse appropriee", "Description claire du problème", "Indication de duree", "Demande d'intervention", "Registre formel (vouvoiement)"],
  },
  {
    id: "ee-a2-2", level: "A2", type: "message", topic: "emploi",
    prompt_fr: "Vous avez vu une offre d'emploi sur Indeed pour un poste de serveur dans un restaurant. Ecrivez un court courriel pour postuler. Presentez-vous brievement, mentionnez votre experience et votre disponibilite.",
    prompt_en: "You saw a job posting on Indeed for a waiter position at a restaurant. Write a short email to apply. Briefly introduce yourself, mention your experience and availability.",
    wordCount: { min: 60, max: 120 },
    criteria: ["Objet du courriel clair", "Présentation personnelle", "Mention de l'experience", "Disponibilites", "Formule de politesse"],
  },
  // === B1 ===
  {
    id: "ee-b1-1", level: "B1", type: "article", topic: "vie-quotidienne",
    prompt_fr: "Vous ecrivez un article pour le blogue de votre organisme communautaire sur le theme: « Comment survivre a son premier hiver au Québec ». Donnez au moins 3 conseils pratiques (vetements, transport, alimentation, sante mentale, etc.) et partagez une anecdote personnelle.",
    prompt_en: "You are writing a blog post for your community organization on the topic: 'How to survive your first winter in Québec'. Give at least 3 practical tips (clothing, transport, food, mental health, etc.) and share a personal anecdote.",
    wordCount: { min: 120, max: 200 },
    criteria: ["Introduction accrocheuse", "3+ conseils pratiques detailles", "Anecdote personnelle", "Connecteurs logiques (d'abord, ensuite, enfin)", "Conclusion ou conseil final", "Vocabulaire adapte au sujet"],
  },
  {
    id: "ee-b1-2", level: "B1", type: "message", topic: "administration",
    prompt_fr: "Vous avez reçu un avis d'augmentation de loyer de votre propriétaire de 15%. Vous trouvez cette augmentation excessive. Ecrivez une lettre au Tribunal administratif du logement (TAL) pour contester cette augmentation. Expliquez votre situation, mentionnez le pourcentage d'augmentation autorise par le TAL (environ 5,9% en 2025), et demandez une audience.",
    prompt_en: "You received a 15% rent increase notice from your landlord. You find this excessive. Write a letter to the Tribunal administratif du logement (TAL) to contest this increase. Explain your situation, mention the TAL-authorized increase percentage (about 5.9% in 2025), and request a hearing.",
    wordCount: { min: 120, max: 200 },
    criteria: ["Registre formel", "Description claire de la situation", "Reference au taux autorise", "Arguments structures", "Demande formelle d'audience", "Coordonnees"],
  },
  // === B2 ===
  {
    id: "ee-b2-1", level: "B2", type: "argumentatif", topic: "immigration",
    prompt_fr: "Le gouvernement du Québec a ferme le PEQ et reduit les seuils d'immigration permanente. Ecrivez un texte argumentatif (pour ou contre cette decision) en presentant au moins 2 arguments de chaque cote et en donnant votre position personnelle. Utilisez des exemples concrets lies au marche du travail québécois.",
    prompt_en: "The Québec government closed the PEQ and reduced permanent immigration levels. Write an argumentative text (for or against this decision) presenting at least 2 arguments on each side and giving your personal position. Use concrete examples related to Québec's labour market.",
    wordCount: { min: 200, max: 300 },
    criteria: ["Introduction avec these claire", "2+ arguments pour", "2+ arguments contre", "Exemples concrets", "Connecteurs d'argumentation (cependant, neanmoins, en revanche)", "Conclusion avec position personnelle", "Registre soutenu"],
  },
  {
    id: "ee-b2-2", level: "B2", type: "argumentatif", topic: "francisation",
    prompt_fr: "« L'exigence d'un niveau de français NCLC 7 pour obtenir la sélection permanente au Québec est-elle justifiee? ». Rédigez un texte argumentatif en discutant des avantages (intégration, emploi, cohesion sociale) et des inconvenients (barriere pour les talents, temps d'apprentissage, injustice) de cette exigence.",
    prompt_en: "'Is the requirement of French level NCLC 7 for permanent selection in Québec justified?' Write an argumentative text discussing the advantages (integration, employment, social cohesion) and disadvantages (barrier for talent, learning time, unfairness) of this requirement.",
    wordCount: { min: 200, max: 300 },
    criteria: ["These annoncee clairement", "Arguments pour (intégration, cohesion)", "Arguments contre (barriere, temps)", "Nuance et complexite", "Vocabulaire de l'argumentation", "Conclusion equilibree"],
  },
  // === C1 ===
  {
    id: "ee-c1-1", level: "C1", type: "argumentatif", topic: "société",
    prompt_fr: "Rédigez une lettre d'opinion destinee au journal Le Devoir sur le theme: « Le modèle d'intégration québécois (interculturalisme) est-il adapte aux realites du 21e siecle? ». Comparez avec le multiculturalisme canadien, donnez des exemples concrets et proposez des pistes d'amélioration.",
    prompt_en: "Write a letter to the editor for Le Devoir on the topic: 'Is Québec's intégration model (interculturalism) adapted to 21st century realities?' Compare with Canadian multiculturalism, give concrete examples, and propose improvements.",
    wordCount: { min: 250, max: 400 },
    criteria: ["Registre soutenu et academique", "Comparaison structuree des modèles", "Exemples concrets et actuels", "Propositions d'amélioration", "Vocabulaire sociologique", "Argumentation nuancee", "Conclusion prospective"],
  },
];

// ─── EXPRESSION ORALE EXERCISES ───
export const EO_EXERCISES: SpeakingTask[] = [
  // === A2 ===
  {
    id: "eo-a2-1", level: "A2", type: "entretien", topic: "présentation", duration: 120,
    prompt_fr: "Presentez-vous: votre nom, votre pays d'origine, depuis quand vous etes au Québec, ce que vous faites (travail ou études), et ce que vous aimez au Québec.",
    prompt_en: "Introduce yourself: your name, country of origin, how long you've been in Québec, what you do (work or studies), and what you like about Québec.",
    criteria: ["Informations personnelles claires", "Phrases simples et correctes", "Pronunciation comprehensible", "Vocabulaire de base maîtrise"],
    samplePoints: ["Je m'appelle... je viens de...", "Je suis au Québec depuis...", "Je travaille comme... / J'étudié...", "J'aime le Québec parce que..."],
  },
  {
    id: "eo-a2-2", level: "A2", type: "interaction", topic: "logement", duration: 120,
    prompt_fr: "Vous appelez pour visiter un appartement annoncé sur Kijiji. Demandez: le prix du loyer, si le chauffage et l'eau chaude sont inclus, quand vous pouvez visiter, et le nombre de chambres.",
    prompt_en: "You are calling to visit an apartment listed on Kijiji. Ask about: the rent price, whether heating and hot water are included, when you can visit, and the number of bedrooms.",
    criteria: ["Questions bien formulees", "Vocabulaire du logement", "Registre poli (vouvoiement)", "Enchainement logique des questions"],
    samplePoints: ["Bonjour, j'appelle pour l'annonce sur Kijiji...", "Quel est le loyer mensuel?", "Est-ce que le chauffage est inclus?", "Quand est-ce que je pourrais visiter?"],
  },
  // === B1 ===
  {
    id: "eo-b1-1", level: "B1", type: "interaction", topic: "emploi", duration: 180,
    prompt_fr: "Vous passez une entrevue d'emploi pour un poste de service a la clientele. L'employeur vous demande: 1) Parlez-moi de votre parcours professionnel, 2) Pourquoi voulez-vous travailler chez nous? 3) Quelles sont vos forces et vos faiblesses?",
    prompt_en: "You are doing a job interview for a customer service position. The employer asks: 1) Tell me about your professional background, 2) Why do you want to work here? 3) What are your strengths and weaknesses?",
    criteria: ["Reponses structurees", "Vocabulaire professionnel", "Exemples concrets", "Confiance et clarte", "Registre formel"],
    samplePoints: ["J'ai travaille pendant X ans dans...", "J'ai choisi votre entreprise parce que...", "Ma force principale est... Par exemple,...", "J'ai tendance a... mais je travaille pour m'améliorer"],
  },
  {
    id: "eo-b1-2", level: "B1", type: "opinion", topic: "vie-quotidienne", duration: 180,
    prompt_fr: "Donnez votre opinion: « Est-il difficile de s'adapter a l'hiver québécois? ». Parlez de votre experience, des defis (froid, neige, transport, moral) et des stratégies pour s'adapter.",
    prompt_en: "Give your opinion: 'Is it difficult to adapt to Québec winter?' Talk about your experience, challenges (cold, snow, transport, morale) and strategies to adapt.",
    criteria: ["Opinion clairement exprimee", "Exemples personnels", "Vocabulaire de l'hiver et du climat", "Connecteurs (premierement, de plus, en revanche)", "Conclusion"],
    samplePoints: ["A mon avis, l'hiver au Québec est...", "Personnellement, j'ai trouve que...", "Le plus grand defi, c'est...", "Pour s'adapter, je recommandé de..."],
  },
  // === B2 ===
  {
    id: "eo-b2-1", level: "B2", type: "opinion", topic: "immigration", duration: 240,
    prompt_fr: "Debat: « Le Québec devrait-il augmenter ou diminuer ses seuils d'immigration? ». Presentez les deux cotes du debat avec des arguments précis (main-d'oeuvre, logement, services publics, français, demographie, économie) puis donnez votre position personnelle argumentee.",
    prompt_en: "Debate: 'Should Québec increase or decrease its immigration levels?' Present both sides with specific arguments (labour, housing, public services, French, demographics, economy) then give your argued personal position.",
    criteria: ["Présentation equilibree des deux positions", "Arguments précis et documentes", "Vocabulaire sociopolitique", "Transitions fluides", "Position personnelle argumentee", "Registre soutenu"],
    samplePoints: ["D'un cote, les partisans de l'augmentation soutiennent que...", "En revanche, ceux qui pronnent une reduction arguent que...", "Les donnees montrent que...", "Personnellement, je considere que..."],
  },
  // === C1 ===
  {
    id: "eo-c1-1", level: "C1", type: "opinion", topic: "société", duration: 300,
    prompt_fr: "Analysez la situation suivante: « Le Québec exigé le français pour l'immigration permanente, mais de nombreux employeurs de Montreal fonctionnent principalement en anglais. » Comment resoleriez-vous cette contradiction? Proposez des solutions concretes en tenant compte des perspectives économiques, linguistiques et sociales.",
    prompt_en: "Analyze: 'Québec requires French for permanent immigration, but many Montreal employers operate primarily in English.' How would you resolve this contradiction? Propose concrete solutions considering economic, linguistic, and social perspectives.",
    criteria: ["Analyse nuancee de la contradiction", "Multiples perspectives (économique, linguistique, sociale)", "Solutions concretes et realisables", "Vocabulaire riche et précis", "Argumentation structuree", "Capacite de synthese"],
    samplePoints: ["Ce paradoxe illustre...", "Du point de vue économique...", "Sur le plan linguistique...", "Je proposerais donc..."],
  },
];

// ─── VOCABULAIRE ETABLISSEMENT ───
export const VOCAB_CATEGORIES = [
  "logement", "emploi", "administration", "sante", "transport", "finances", "immigration", "vie-quotidienne"
] as const;

export const VOCABULARY: VocabWord[] = [
  // Logement
  { fr: "bail", en: "lease", category: "logement", example: "J'ai signe un bail de 12 mois.", nclc: 4 },
  { fr: "propriétaire", en: "landlord", category: "logement", example: "Le propriétaire a augmenté le loyer.", nclc: 4 },
  { fr: "locataire", en: "tenant", category: "logement", example: "Les locataires ont des droits au Québec.", nclc: 4 },
  { fr: "loyer", en: "rent", category: "logement", example: "Le loyer est de 1 200$ par mois.", nclc: 4 },
  { fr: "dépôt", en: "deposit", category: "logement", example: "Les dépôts de sécurité sont illegaux au Québec.", nclc: 5 },
  { fr: "chauffage", en: "heating", category: "logement", example: "Le chauffage est inclus dans le loyer.", nclc: 4 },
  { fr: "concierge", en: "superintendent", category: "logement", example: "Appelez le concierge pour les reparations.", nclc: 5 },
  { fr: "déménagement", en: "moving", category: "logement", example: "Le 1er juillet est la journee nationale du déménagement au Québec.", nclc: 5 },
  { fr: "préavis", en: "notice", category: "logement", example: "Le propriétaire doit donner un préavis de 24 heures.", nclc: 6 },
  { fr: "Tribunal administratif du logement (TAL)", en: "Administrative Housing Tribunal", category: "logement", example: "J'ai déposé une plainte au TAL.", nclc: 7 },
  // Emploi
  { fr: "curriculum vitae (CV)", en: "resume / CV", category: "emploi", example: "Mon CV fait deux pages.", nclc: 4 },
  { fr: "entrevue / entretien", en: "interview", category: "emploi", example: "J'ai une entrevue d'emploi demain.", nclc: 4 },
  { fr: "salaire minimum", en: "minimum wage", category: "emploi", example: "Le salaire minimum au Québec est de 15,75$.", nclc: 4 },
  { fr: "poste", en: "position", category: "emploi", example: "Je postule pour un poste de comptable.", nclc: 4 },
  { fr: "temps plein / temps partiel", en: "full-time / part-time", category: "emploi", example: "C'est un poste a temps partiel.", nclc: 4 },
  { fr: "normes du travail", en: "labour standards", category: "emploi", example: "Les normes du travail protegent les employés.", nclc: 6 },
  { fr: "reconnaissance des diplômes", en: "credential recognition", category: "emploi", example: "La reconnaissance des diplômes prend plusieurs mois.", nclc: 7 },
  { fr: "évaluation comparative (ECA)", en: "comparative evaluation", category: "emploi", example: "J'ai fait mon évaluation comparative au MIFI.", nclc: 7 },
  { fr: "ordre professionnel", en: "professional order", category: "emploi", example: "Les ingenieurs doivent être membres de l'Ordre des ingenieurs.", nclc: 7 },
  // Administration
  { fr: "numéro d'assurance sociale (NAS)", en: "social insurance number (SIN)", category: "administration", example: "J'ai obtenu mon NAS a Service Canada.", nclc: 4 },
  { fr: "carte d'assurance maladie (RAMQ)", en: "health insurance card", category: "administration", example: "Ma carte RAMQ sera prete dans 3 semaines.", nclc: 4 },
  { fr: "permis de conduire", en: "driver's licence", category: "administration", example: "Je dois échanger mon permis de conduire.", nclc: 4 },
  { fr: "déclaration de revenus", en: "tax return", category: "administration", example: "La date limite pour la déclaration est le 30 avril.", nclc: 5 },
  { fr: "délai de carence", en: "waiting period", category: "administration", example: "Le délai de carence pour la RAMQ est de 3 mois.", nclc: 6 },
  { fr: "formulaire", en: "form", category: "administration", example: "J'ai rempli le formulaire en ligne.", nclc: 4 },
  // Sante
  { fr: "clinique sans rendez-vous", en: "walk-in clinic", category: "sante", example: "Je suis alle a la clinique sans rendez-vous.", nclc: 4 },
  { fr: "médecin de famille", en: "family doctor", category: "sante", example: "Je n'ai pas encore de médecin de famille.", nclc: 4 },
  { fr: "urgence", en: "emergency room", category: "sante", example: "Allez a l'urgence seulement pour les cas graves.", nclc: 4 },
  { fr: "ordonnance", en: "prescription", category: "sante", example: "Le médecin m'a donne une ordonnance.", nclc: 5 },
  { fr: "assurance médicaments", en: "drug insurance", category: "sante", example: "L'assurance médicaments est obligatoire au Québec.", nclc: 6 },
  // Transport
  { fr: "carte OPUS", en: "OPUS card", category: "transport", example: "J'ai recharge ma carte OPUS.", nclc: 4 },
  { fr: "correspondance", en: "transfer", category: "transport", example: "La correspondance est gratuite pendant 2 heures.", nclc: 4 },
  { fr: "passe mensuelle", en: "monthly pass", category: "transport", example: "La passe mensuelle STM coute 97$.", nclc: 4 },
  { fr: "pneus d'hiver", en: "winter tires", category: "transport", example: "Les pneus d'hiver sont obligatoires du 1er décembre au 15 mars.", nclc: 5 },
  // Immigration
  { fr: "résidence permanente (RP)", en: "permanent résidence (PR)", category: "immigration", example: "J'ai obtenu ma résidence permanente.", nclc: 5 },
  { fr: "permis de travail", en: "work permit", category: "immigration", example: "Mon permis de travail expire dans 6 mois.", nclc: 4 },
  { fr: "déclaration d'intérêt", en: "expression of interest", category: "immigration", example: "J'ai soumis ma déclaration d'intérêt sur Arrima.", nclc: 6 },
  { fr: "certificat de sélection du Québec (CSQ)", en: "Québec selection certificate", category: "immigration", example: "Le CSQ est la première étape pour la RP au Québec.", nclc: 7 },
  { fr: "offre d'emploi validee (OEV)", en: "validated job offer (VJO)", category: "immigration", example: "Une OEV vaut jusqu'a 380 points dans Arrima.", nclc: 7 },
  { fr: "ronde d'invitation", en: "invitation round", category: "immigration", example: "La dernière ronde d'invitation avait un seuil de 595 points.", nclc: 7 },

  // ═══ NEW VOCABULARY — Logement (10) ═══
  { fr: "4 et demi / 3 et demi", en: "apartment size (rooms + bathroom)", category: "logement", example: "Je cherche un 4 et demi a Rosemont.", nclc: 4 },
  { fr: "sous-location", en: "subletting", category: "logement", example: "La sous-location est permise avec l'accord du propriétaire.", nclc: 5 },
  { fr: "cession de bail", en: "lease transfer", category: "logement", example: "J'ai fait une cession de bail a un ami.", nclc: 6 },
  { fr: "avis de non-renouvellement", en: "notice of non-renewal", category: "logement", example: "Envoyez l'avis de non-renouvellement 3 mois avant la fin du bail.", nclc: 6 },
  { fr: "reprise de logement", en: "repossession of dwelling", category: "logement", example: "Le propriétaire a fait une reprise de logement pour sa fille.", nclc: 7 },
  { fr: "mise en demeure", en: "formal notice / demand letter", category: "logement", example: "J'ai envoyé une mise en demeure au propriétaire.", nclc: 7 },
  { fr: "taux d'inoccupation", en: "vacancy rate", category: "logement", example: "Le taux d'inoccupation a Montreal est de 1,5%.", nclc: 8 },
  { fr: "buanderie", en: "laundry room", category: "logement", example: "La buanderie est au sous-sol de l'immeuble.", nclc: 4 },
  { fr: "plomberie", en: "plumbing", category: "logement", example: "Il y a un problème de plomberie dans la salle de bain.", nclc: 5 },
  { fr: "renoviction", en: "renoviction (eviction via renovation)", category: "logement", example: "La renoviction est un problème croissant a Montreal.", nclc: 8 },

  // ═══ NEW VOCABULARY — Emploi (10) ═══
  { fr: "lettre de présentation", en: "cover letter", category: "emploi", example: "Envoyez votre CV avec une lettre de présentation.", nclc: 5 },
  { fr: "période d'essai / probation", en: "probation period", category: "emploi", example: "La période d'essai dure 3 mois.", nclc: 5 },
  { fr: "heures supplémentaires", en: "overtime", category: "emploi", example: "Les heures supplémentaires sont payées a temps et demi.", nclc: 5 },
  { fr: "dépôt direct", en: "direct deposit", category: "emploi", example: "Mon salaire est versé par dépôt direct.", nclc: 4 },
  { fr: "relevé d'emploi (RE)", en: "record of employment (ROE)", category: "emploi", example: "L'employeur doit émettre un relevé d'emploi a la fin du contrat.", nclc: 6 },
  { fr: "assurance-emploi (AE)", en: "employment insurance (EI)", category: "emploi", example: "J'ai fait une demande d'assurance-emploi.", nclc: 5 },
  { fr: "marché caché de l'emploi", en: "hidden job market", category: "emploi", example: "60% des emplois sont dans le marché caché.", nclc: 7 },
  { fr: "réseautage / 5 a 7", en: "networking / after-work social", category: "emploi", example: "Le 5 a 7 est un moment clé pour le réseautage.", nclc: 6 },
  { fr: "carte de compétence (CCQ)", en: "competency card (construction)", category: "emploi", example: "La carte de compétence CCQ est obligatoire sur les chantiers.", nclc: 7 },
  { fr: "déqualification professionnelle", en: "professional deskilling", category: "emploi", example: "La déqualification professionnelle touche beaucoup d'immigrants.", nclc: 8 },

  // ═══ NEW VOCABULARY — Santé (8) ═══
  { fr: "CLSC (centre local de services communautaires)", en: "local community service centre", category: "sante", example: "Prenez rendez-vous au CLSC de votre quartier.", nclc: 4 },
  { fr: "guichet d'accès (GAMF)", en: "family doctor access registry", category: "sante", example: "Inscrivez-vous au guichet d'accès pour un médecin de famille.", nclc: 6 },
  { fr: "carnet de vaccination", en: "vaccination record / booklet", category: "sante", example: "Apportez votre carnet de vaccination de votre pays.", nclc: 5 },
  { fr: "franchise (pharmacie)", en: "copay / deductible (pharmacy)", category: "sante", example: "La franchise pour les médicaments est de 3,72 dollars.", nclc: 6 },
  { fr: "Info-Santé 811", en: "health info hotline 811", category: "sante", example: "Appelez le 811 pour des conseils de santé.", nclc: 4 },
  { fr: "préposé(e) aux bénéficiaires", en: "patient care attendant", category: "sante", example: "Le préposé aux bénéficiaires travaille dans les CHSLD.", nclc: 6 },
  { fr: "chirurgie d'un jour", en: "day surgery / outpatient surgery", category: "sante", example: "La chirurgie d'un jour ne nécessite pas d'hospitalisation.", nclc: 6 },
  { fr: "triage (urgence)", en: "triage (emergency room)", category: "sante", example: "A l'urgence, le triage détermine l'ordre de priorité.", nclc: 5 },

  // ═══ NEW VOCABULARY — Administration (8) ═══
  { fr: "CLÉ GC (identifiant gouvernemental)", en: "GCKey (government login)", category: "administration", example: "Créez votre CLÉ GC pour accéder a Mon Dossier.", nclc: 5 },
  { fr: "changement d'adresse", en: "change of address", category: "administration", example: "Faites un changement d'adresse a la SAAQ et a la RAMQ.", nclc: 4 },
  { fr: "spécimen de chèque", en: "void cheque", category: "administration", example: "L'employeur demande un spécimen de chèque pour le dépôt direct.", nclc: 5 },
  { fr: "acte de naissance", en: "birth certificate", category: "administration", example: "Faites traduire votre acte de naissance par un traducteur agréé.", nclc: 5 },
  { fr: "traduction certifiée / agréée", en: "certified translation", category: "administration", example: "Une traduction certifiée est requise pour les documents officiels.", nclc: 6 },
  { fr: "avis de cotisation", en: "notice of assessment (taxes)", category: "administration", example: "L'avis de cotisation confirme votre remboursement d'impôts.", nclc: 6 },
  { fr: "aide juridique", en: "legal aid", category: "administration", example: "L'aide juridique est gratuite si vos revenus sont faibles.", nclc: 6 },
  { fr: "statut implicite", en: "implied status", category: "administration", example: "Le statut implicite permet de rester au Canada en attendant le renouvellement.", nclc: 7 },

  // ═══ NEW VOCABULARY — Transport (7) ═══
  { fr: "REM (Réseau express métropolitain)", en: "metropolitan express network", category: "transport", example: "Le REM relie l'aéroport au centre-ville.", nclc: 5 },
  { fr: "navette / autobus navette", en: "shuttle bus", category: "transport", example: "L'autobus navette remplace le métro pendant les travaux.", nclc: 4 },
  { fr: "exo (réseau de trains de banlieue)", en: "commuter train network", category: "transport", example: "Les trains exo relient les banlieues a Montreal.", nclc: 5 },
  { fr: "Bixi", en: "bike-sharing system (Montreal)", category: "transport", example: "J'utilise Bixi pour me déplacer l'été.", nclc: 4 },
  { fr: "covoiturage", en: "carpooling / ridesharing", category: "transport", example: "Le covoiturage Montreal-Québec coûte environ 25 dollars.", nclc: 5 },
  { fr: "vignette de stationnement", en: "parking permit sticker", category: "transport", example: "La vignette de stationnement coûte 175 dollars par année.", nclc: 5 },
  { fr: "borne de recharge", en: "EV charging station", category: "transport", example: "Il y a une borne de recharge dans le stationnement.", nclc: 6 },

  // ═══ NEW VOCABULARY — Finances (10) ═══
  { fr: "caisse populaire (Desjardins)", en: "credit union (Desjardins)", category: "finances", example: "J'ai ouvert un compte a la caisse populaire Desjardins.", nclc: 4 },
  { fr: "carte de crédit sécurisée", en: "secured credit card", category: "finances", example: "Une carte de crédit sécurisée aide a bâtir son historique.", nclc: 5 },
  { fr: "historique de crédit", en: "credit history / score", category: "finances", example: "Les nouveaux arrivants n'ont aucun historique de crédit.", nclc: 6 },
  { fr: "virement Interac", en: "Interac e-transfer", category: "finances", example: "Envoyez le paiement par virement Interac.", nclc: 4 },
  { fr: "CELI (compte d'épargne libre d'impôt)", en: "TFSA (tax-free savings account)", category: "finances", example: "Les gains dans un CELI sont non imposables.", nclc: 6 },
  { fr: "REER (régime enregistré d'épargne-retraite)", en: "RRSP (registered retirement savings plan)", category: "finances", example: "Les cotisations au REER réduisent votre impôt.", nclc: 6 },
  { fr: "crédit de solidarité", en: "solidarity tax credit (Quebec)", category: "finances", example: "Le crédit de solidarité est versé mensuellement.", nclc: 5 },
  { fr: "TPS / TVQ", en: "GST / QST (sales tax)", category: "finances", example: "La TPS est de 5% et la TVQ est de 9,975%.", nclc: 5 },
  { fr: "retenue à la source", en: "tax withholding / source deduction", category: "finances", example: "Les retenues à la source sont prélevées sur chaque paie.", nclc: 6 },
  { fr: "envoi d'argent à l'étranger", en: "international money transfer / remittance", category: "finances", example: "Desjardins offre des tarifs réduits pour l'envoi d'argent à l'étranger.", nclc: 5 },

  // ═══ NEW VOCABULARY — Immigration supplémentaire (7) ═══
  { fr: "pont d'attente (PPTOE)", en: "post-graduation open work permit / bridging permit", category: "immigration", example: "Demandez un pont d'attente avant l'expiration de votre permis.", nclc: 7 },
  { fr: "EIMT (étude d'impact sur le marché du travail)", en: "LMIA (labour market impact assessment)", category: "immigration", example: "L'employeur doit obtenir une EIMT pour embaucher un travailleur étranger.", nclc: 7 },
  { fr: "moratoire", en: "moratorium", category: "immigration", example: "Le moratoire sur les EIMT s'applique dans le Grand Montréal.", nclc: 8 },
  { fr: "PSTQ (Programme de sélection des travailleurs qualifiés)", en: "Qualified Worker Selection Program", category: "immigration", example: "Le PSTQ est le seul programme de sélection permanente au Québec.", nclc: 7 },
  { fr: "parrainage", en: "sponsorship (immigration)", category: "immigration", example: "Le parrainage familial permet de faire venir sa famille.", nclc: 6 },
  { fr: "biométrie", en: "biometrics", category: "immigration", example: "La biométrie est requise pour la demande de résidence permanente.", nclc: 6 },
  { fr: "regroupement familial", en: "family reunification", category: "immigration", example: "Le regroupement familial prend environ 12 mois.", nclc: 7 },
];
