"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCrm, getUserName } from "@/lib/crm-store";
import { CASE_STATUS_LABELS, ROLE_PERMISSIONS } from "@/lib/crm-types";
import { IMMIGRATION_PROGRAMS, PROGRAM_CATEGORIES } from "@/lib/crm-programs";
import { IRCC_FORMS } from "@/lib/ircc-forms";
import {
  Bot, Send, User, Sparkles, FileText, FolderOpen, Users, Clock,
  AlertTriangle, CheckCircle2, Lightbulb, RotateCcw, Shield, BookOpen,
  ChevronDown, ChevronRight, Copy, Check, ListChecks, Mail, Scale,
  Bell, ClipboardList, Globe, MapPin, GraduationCap, Briefcase,
  Heart, FileCheck, Timer, MessageSquare, ExternalLink, Info,
} from "lucide-react";

// ========================================================
// TYPES
// ========================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

// ========================================================
// BASE DE CONNAISSANCES IRCC / MIFI
// ========================================================

const PROCESSING_TIMES_IRCC: Record<string, { label: string; time: string; link: string }> = {
  "ee-fsw": { label: "Entree express - FSW", time: "4-8 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express.html" },
  "ee-cec": { label: "Entree express - CEC", time: "4-8 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/admissibilite/categorie-experience-canadienne.html" },
  "ee-fst": { label: "Entree express - Metiers specialises", time: "4-8 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/admissibilite/travailleurs-metiers-specialises.html" },
  "pnp": { label: "Programme des candidats provinciaux (PNP)", time: "6-18 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/candidats-provinces.html" },
  "study-inside": { label: "Permis d'etudes (au Canada)", time: "3-4 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada.html" },
  "study-outside": { label: "Permis d'etudes (hors Canada)", time: "6-16 semaines", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada.html" },
  "wp-lmia": { label: "Permis de travail (avec EIMT)", time: "2-6 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/permis.html" },
  "wp-exempt": { label: "Permis de travail (dispense EIMT)", time: "2-4 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/permis.html" },
  "pgwp": { label: "Permis de travail postdiplome (PTPD)", time: "2-3 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/travail/apres-obtention-diplome.html" },
  "spousal-inland": { label: "Parrainage conjoint (interieur)", time: "12-18 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/parrainer-membre-famille/epoux-conjoint-fait-enfant.html" },
  "spousal-outland": { label: "Parrainage conjoint (exterieur)", time: "12-15 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/parrainer-membre-famille/epoux-conjoint-fait-enfant.html" },
  "parent": { label: "Parrainage parents et grands-parents", time: "24-36 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/parrainer-membre-famille/parents-grands-parents.html" },
  "citizenship": { label: "Citoyennete canadienne", time: "8-14 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/citoyennete-canadienne.html" },
  "asylum": { label: "Demande d'asile (audience + decision)", time: "12-24 mois (audience), puis 6-12 mois (decision)", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/refugies/demande-asile.html" },
  "super-visa": { label: "Super visa (parents/grands-parents)", time: "3-6 mois", link: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/visiter-canada/super-visa-parents-grands-parents.html" },
};

const PROCESSING_TIMES_QUEBEC: Record<string, { label: string; time: string; link: string; note?: string }> = {
  "pstq-arrima": { label: "PSTQ / Arrima", time: "12-18 mois", link: "https://www.quebec.ca/immigration/programmes-immigration/travailleurs-qualifies" },
  "peq": { label: "PEQ - Programme de l'experience quebecoise", time: "Programme TERMINE", link: "https://www.quebec.ca/immigration", note: "Le PEQ a pris fin en novembre 2025. Les demandes deja deposees continuent d'etre traitees." },
  "caq-etudes": { label: "CAQ (etudes)", time: "4-8 semaines", link: "https://www.quebec.ca/immigration/etudier-au-quebec" },
  "caq-travail": { label: "CAQ (travail)", time: "2-4 semaines", link: "https://www.quebec.ca/immigration/travailler-au-quebec" },
  "csq": { label: "Certificat de selection du Quebec (CSQ)", time: "6-12 mois", link: "https://www.quebec.ca/immigration" },
};

const COMMON_FAQ: { question: string; answer: string; keywords: string[] }[] = [
  {
    question: "Combien de temps pour mon permis de travail?",
    answer: "Le delai depend du type de permis :\n- **Avec EIMT (LMIA)** : 2 a 6 mois\n- **Dispense d'EIMT** : 2 a 4 mois\n- **PTPD (post-diplome)** : 2 a 3 mois\n- **Mobilite francophone** : 2 a 4 mois\n\nCes delais sont des estimations basees sur les donnees recentes d'IRCC. Les delais reels peuvent varier selon le pays d'origine et le volume de demandes.\n\n**Source** : IRCC.gc.ca - Delais de traitement",
    keywords: ["temps", "permis", "travail", "delai", "combien"],
  },
  {
    question: "Quels documents dois-je apporter pour ma consultation?",
    answer: "Voici la liste des documents a apporter lors de votre consultation :\n\n**Documents d'identite :**\n- Passeport valide (toutes les pages)\n- Carte de resident permanent (si applicable)\n- Permis de travail ou d'etudes actuel\n\n**Documents d'immigration :**\n- Lettres de decision anterieures d'IRCC\n- Certificat de selection du Quebec (CSQ), si applicable\n- Resultats de tests linguistiques (TEF, TCF, IELTS)\n\n**Documents personnels :**\n- Certificat de naissance\n- Certificat de mariage (si applicable)\n- Evaluation des diplomes (EDE/WES)\n\n**Documents d'emploi :**\n- Lettres d'employeur\n- Contrats de travail\n- Releves d'emploi\n\nApportez les **originaux** et des **copies** de chaque document.",
    keywords: ["document", "apporter", "consultation", "papier", "quoi"],
  },
  {
    question: "Comment suivre ma demande aupres d'IRCC?",
    answer: "Vous pouvez suivre votre demande de plusieurs facons :\n\n1. **Portail Mon compte IRCC** : Connectez-vous a votre compte en ligne sur le site d'IRCC pour voir les mises a jour en temps reel.\n\n2. **Formulaire Web d'IRCC** : Utilisez le formulaire en ligne pour poser des questions sur votre demande (delai de reponse : 5-10 jours ouvrables).\n\n3. **Ligne telephonique IRCC** : 1-888-242-2100 (du lundi au vendredi, 8h a 16h HE).\n\n4. **Via notre cabinet** : Nous pouvons verifier le statut de votre dossier si vous nous avez designe comme representant (formulaire IMM 5476).\n\n**Conseil** : Attendez les delais normaux de traitement avant de faire un suivi. Les demandes de statut repetees ne font pas avancer le dossier.\n\n**Source** : IRCC.gc.ca",
    keywords: ["suivre", "demande", "suivi", "statut", "tracker", "ircc"],
  },
  {
    question: "Mon permis expire bientot, que faire?",
    answer: "**Actions immediates si votre permis expire bientot :**\n\n1. **Verifiez la date d'expiration exacte** sur votre permis.\n\n2. **Soumettez votre demande de renouvellement AVANT l'expiration.** Si vous deposez avant l'expiration, vous beneficiez du **statut implicite** qui vous permet de rester au Canada aux memes conditions pendant le traitement.\n\n3. **Delais de depot recommandes :**\n   - Permis de travail : au moins **4 mois** avant l'expiration\n   - Permis d'etudes : au moins **3 mois** avant l'expiration\n   - Statut de visiteur : au moins **30 jours** avant l'expiration\n\n4. **Si votre permis est deja expire :**\n   - Vous pouvez demander un retablissement de statut dans les **90 jours** suivant l'expiration.\n   - Frais de retablissement : 229 $\n\n**Important** : Ne travaillez pas et n'etudiez pas si votre permis est expire et que vous n'avez pas de statut implicite.\n\n**Source** : IRCC.gc.ca - Prolonger votre sejour",
    keywords: ["expire", "expiration", "renouveler", "renouvellement", "prolonger"],
  },
  {
    question: "Puis-je travailler pendant l'attente de ma demande?",
    answer: "Cela depend de votre situation :\n\n**Vous pouvez travailler si :**\n- Vous avez un **permis de travail valide** et etes en statut implicite (renouvellement depose avant expiration)\n- Vous etes **demandeur d'asile** avec un permis de travail ou apres le delai de 180 jours (si eligible)\n- Vous etes **etudiant** avec un permis qui autorise le travail hors campus\n- Vous avez un **permis de travail ouvert** valide\n\n**Vous ne pouvez PAS travailler si :**\n- Vous etes en attente d'un premier permis de travail (pas encore autorise)\n- Votre statut de visiteur ne permet pas le travail\n- Votre permis est expire et vous n'avez pas de statut implicite\n\n**Source** : IRCC.gc.ca",
    keywords: ["travailler", "attente", "travail", "pendant", "interim"],
  },
  {
    question: "Mon dossier est-il en retard?",
    answer: "Pour verifier si votre dossier est en retard :\n\n1. **Comparez les delais normaux** de traitement pour votre type de demande (disponibles sur IRCC.gc.ca).\n\n2. **Verifiez votre compte IRCC** pour toute correspondance non lue ou demande de documents supplementaires.\n\n3. **Signes que votre dossier pourrait etre retarde :**\n   - Aucune mise a jour apres les delais normaux\n   - Demande de renseignements supplementaires (lettre d'equite procedurale)\n   - Controle de securite prolonge\n\n4. **Si le delai normal est depasse :**\n   - Utilisez le formulaire Web d'IRCC\n   - Contactez notre cabinet pour une verification\n\n**Important** : Les delais publies par IRCC sont des estimations. Certains dossiers peuvent prendre plus longtemps en raison de controles de securite ou de volume de demandes.\n\n**Source** : IRCC.gc.ca - Delais de traitement",
    keywords: ["retard", "delai", "attente", "depasse", "long", "lent"],
  },
  {
    question: "Comment renouveler mon permis de travail?",
    answer: "**Etapes pour renouveler votre permis de travail :**\n\n1. **Verifiez votre admissibilite** au renouvellement selon votre situation.\n\n2. **Rassemblez les documents requis :**\n   - Copie du permis actuel\n   - Passeport valide\n   - EIMT valide (si applicable) ou preuve de dispense\n   - Photos d'immigration\n   - Frais de traitement (155 $ + 100 $ privilege du droit de RP ouvert si applicable)\n\n3. **Soumettez en ligne** via votre compte IRCC au moins **4 mois avant** l'expiration.\n\n4. **Statut implicite** : Si soumis avant expiration, vous pouvez continuer a travailler aux memes conditions.\n\n**Formulaires principaux :** IMM 5710 (en ligne) ou IMM 1295 (papier)\n\n**Frais :** 155 $ (traitement) + 100 $ (privilege du droit de RP ouvert, si applicable)\n\n**Source** : IRCC.gc.ca",
    keywords: ["renouveler", "renouvellement", "prolonger", "permis", "travail"],
  },
  {
    question: "Quelle est la difference entre residence permanente et citoyennete?",
    answer: "**Residence permanente (RP) vs Citoyennete :**\n\n| | Resident permanent | Citoyen |\n|---|---|---|\n| **Droit de vote** | Non | Oui |\n| **Passeport canadien** | Non | Oui |\n| **Obligation de residence** | 730 jours / 5 ans | Aucune |\n| **Risque de perte de statut** | Oui (non-conformite) | Tres rare |\n| **Acces aux emplois federaux** | Limite | Complet |\n| **Droits sociaux** | Oui (sante, education) | Oui |\n\n**Pour obtenir la citoyennete, un RP doit :**\n- Avoir ete present au Canada **1 095 jours** sur les 5 dernieres annees\n- Avoir produit ses declarations de revenus\n- Demontrer ses competences linguistiques (NCLC 4 en francais ou CLB 4 en anglais)\n- Reussir l'examen de citoyennete (18-54 ans)\n\n**Delai de traitement** : 8-14 mois\n**Frais** : 630 $ (adulte) / 100 $ (mineur)\n\n**Source** : IRCC.gc.ca - Citoyennete",
    keywords: ["difference", "residence", "permanente", "citoyennete", "rp", "citoyen"],
  },
  {
    question: "Comment parrainer mon conjoint?",
    answer: "**Parrainage de conjoint - Guide rapide :**\n\n**Conditions du parrain :**\n- Citoyen canadien ou resident permanent\n- 18 ans ou plus\n- Resider au Canada (ou prevoir y resider pour la demande interieure)\n- Pas d'engagement de parrainage en defaut\n- Pas en faillite\n\n**Options :**\n- **Demande interieure** (conjoint au Canada) : 12-18 mois, permis de travail ouvert possible\n- **Demande exterieure** (conjoint a l'etranger) : 12-15 mois\n\n**Documents requis :**\n- Preuve de la relation (photos, communications, etc.)\n- Formulaires IMM 1344, IMM 0008, IMM 5532, IMM 5669\n- Certificat de mariage ou declaration de conjoint de fait\n- Preuves financieres\n\n**Frais gouvernementaux :** 1 365 $ (traitement + frais de RP)\n\n**Source** : IRCC.gc.ca - Parrainer votre conjoint",
    keywords: ["parrainer", "conjoint", "parrainage", "epoux", "epouse", "mariage", "couple"],
  },
  {
    question: "Qu'est-ce que l'Entree express?",
    answer: "**Entree express - Vue d'ensemble :**\n\nEntree express est le systeme de gestion des demandes de residence permanente du Canada pour les travailleurs qualifies. Ce n'est **pas un programme**, mais un **systeme de selection** qui gere trois programmes :\n\n1. **Travailleurs qualifies federaux (FSW)** - Experience de travail a l'etranger\n2. **Categorie de l'experience canadienne (CEC)** - Experience de travail au Canada\n3. **Travailleurs de metiers specialises (TFMS)** - Gens de metier\n\n**Comment ca fonctionne :**\n1. Creer un profil dans le bassin\n2. Recevoir un score CRS (Systeme de classement global)\n3. Attendre une invitation a presenter une demande (IPD)\n4. Soumettre la demande complete dans les 60 jours\n\n**Score CRS :** Base sur l'age, l'education, les langues, l'experience de travail et d'autres facteurs. Scores recents d'invitation : **470-530+** (varie selon les rondes).\n\n**Delai** : 4-8 mois apres la soumission\n\n**Source** : IRCC.gc.ca - Entree express",
    keywords: ["entree", "express", "ee", "crs", "fsw", "cec", "bassin", "invitation"],
  },
  {
    question: "Qu'est-ce que le CSQ et comment l'obtenir?",
    answer: "**Certificat de selection du Quebec (CSQ) :**\n\nLe CSQ est un document emis par le ministere de l'Immigration, de la Francisation et de l'Integration (MIFI) du Quebec qui confirme que le Quebec vous a selectionne pour l'immigration.\n\n**Voies d'obtention :**\n- **PSTQ via Arrima** : Programme regulier pour travailleurs qualifies (12-18 mois)\n- **PEQ** : Programme termine en novembre 2025\n\n**Apres le CSQ :**\n1. Soumettre une demande de RP au federal (IRCC)\n2. Delai additionnel de 6-12 mois au federal\n3. Examen medical et verification de securite\n\n**Important** : Le CSQ ne donne **pas** la residence permanente. Il faut ensuite soumettre au federal.\n\n**Source** : MIFI - quebec.ca/immigration",
    keywords: ["csq", "certificat", "selection", "quebec", "arrima", "mifi"],
  },
  {
    question: "Quels sont les frais gouvernementaux?",
    answer: "**Frais gouvernementaux principaux (2025-2026) :**\n\n**Residence permanente :**\n- Traitement de la demande : 850 $\n- Frais de residence permanente : 515 $\n- **Total (demandeur principal) : 1 365 $**\n\n**Permis de travail :**\n- Traitement : 155 $\n- Privilege du droit de RP ouvert (si applicable) : 100 $\n\n**Permis d'etudes :**\n- Traitement : 150 $\n\n**Citoyennete :**\n- Adulte : 630 $\n- Mineur : 100 $\n\n**Parrainage familial :**\n- Frais du parrain : 75 $\n- Frais du demandeur : 490 $ (traitement) + 515 $ (RP) = 1 080 $\n\n**Quebec (MIFI) :**\n- CAQ etudes : 127 $\n- CAQ travail : 222 $\n- CSQ : 836 $ (demandeur principal)\n\n**Source** : IRCC.gc.ca - Bareme des frais / MIFI - Quebec.ca",
    keywords: ["frais", "cout", "prix", "gouvernement", "combien", "payer", "tarif"],
  },
  {
    question: "Je suis demandeur d'asile, quels sont mes droits?",
    answer: "**Droits des demandeurs d'asile au Canada :**\n\n**Vous avez droit a :**\n- Rester au Canada pendant le traitement de votre demande\n- L'aide juridique (selon la province)\n- Les soins de sante via le Programme federal de sante intermediaire (PFSI)\n- L'education pour vos enfants\n- Un permis de travail (apres 180 jours ou si eligible a une dispense)\n- L'aide sociale (selon la province)\n\n**Vos obligations :**\n- Vous presenter a toutes les audiences de la CISR\n- Informer IRCC de tout changement d'adresse\n- Respecter les conditions de votre sejour\n\n**Etapes du processus :**\n1. Depot de la demande (port d'entree ou bureau interieur)\n2. Entrevue de recevabilite\n3. Audience devant la Section de la protection des refugies (SPR)\n4. Decision (12-24 mois pour l'audience)\n5. Si refuse : possibilite d'appel a la SAR\n\n**Source** : IRCC.gc.ca / CISR-IRB.gc.ca",
    keywords: ["asile", "refugie", "demandeur", "protection", "cisr", "persecution"],
  },
  {
    question: "Comment fonctionne l'EIMT (LMIA)?",
    answer: "**Etude d'impact sur le marche du travail (EIMT/LMIA) :**\n\nL'EIMT est un document qu'un employeur canadien doit obtenir avant d'embaucher un travailleur etranger temporaire.\n\n**Processus pour l'employeur :**\n1. Publier l'offre d'emploi au Canada pendant 4 semaines minimum\n2. Demontrer qu'aucun Canadien/RP n'est disponible\n3. Soumettre la demande d'EIMT a Emploi et Developpement social Canada (EDSC)\n4. Payer les frais de traitement (1 000 $ par poste)\n\n**Delai de traitement :** Variable (2-6 mois)\n\n**Dispenses d'EIMT :** Certaines categories n'en ont pas besoin :\n- Mobilite francophone (hors Quebec)\n- Accords internationaux (ACEUM, etc.)\n- Transferts intra-entreprise\n- Interets canadiens significatifs\n\n**Apres l'EIMT positive :**\nLe travailleur peut demander son permis de travail avec l'EIMT.\n\n**Source** : Canada.ca/EIMT",
    keywords: ["eimt", "lmia", "employeur", "marche", "travail", "embaucher", "impact"],
  },
  {
    question: "Quand puis-je demander la citoyennete?",
    answer: "**Conditions pour demander la citoyennete canadienne :**\n\n**Presence physique :**\n- **1 095 jours** (3 ans) de presence physique au Canada dans les **5 annees** precedant la demande\n- Le temps passe au Canada en tant que resident temporaire ou personne protegee avant la RP compte a 50 % (max 365 jours)\n\n**Autres conditions :**\n- Etre resident permanent\n- Avoir produit vos declarations de revenus (3 ans sur 5)\n- Competences linguistiques (NCLC 4+ en francais ou CLB 4+ en anglais) - pour les 18-54 ans\n- Reussir l'examen de citoyennete (18-54 ans)\n- Pas de criminalite ou d'interdiction\n\n**Delai de traitement :** 8-14 mois\n**Frais :** 630 $ (adulte), 100 $ (mineur)\n\n**Outil utile :** Calculateur de presence physique sur IRCC.gc.ca\n\n**Source** : IRCC.gc.ca - Citoyennete",
    keywords: ["citoyennete", "citoyen", "naturalisation", "quand", "eligible", "presence"],
  },
  {
    question: "Comment obtenir un permis d'etudes?",
    answer: "**Permis d'etudes au Canada :**\n\n**Etapes :**\n1. Obtenir une **lettre d'acceptation** d'un etablissement designe (DLI)\n2. **Au Quebec** : Obtenir un CAQ (Certificat d'acceptation du Quebec) - 4-8 semaines\n3. Soumettre la demande de **permis d'etudes** a IRCC\n4. Fournir les preuves financieres (20 635 $/an + frais de scolarite)\n5. Examen medical (si requis)\n6. Donnees biometriques\n\n**Delais :**\n- Depuis le Canada : 3-4 mois\n- Depuis l'etranger : 6-16 semaines (variable selon le pays)\n\n**Travail pendant les etudes :**\n- Hors campus : 20h/semaine pendant les sessions (temps plein pendant les conges)\n- Sur campus : illimite\n\n**Frais :** 150 $ (permis d'etudes) + 85 $ (biometrie) + 127 $ (CAQ Quebec)\n\n**Source** : IRCC.gc.ca - Etudier au Canada",
    keywords: ["etudes", "etudiant", "permis", "etudier", "universite", "college", "dli"],
  },
  {
    question: "Qu'est-ce que la mobilite francophone?",
    answer: "**Mobilite francophone - Dispense d'EIMT :**\n\nLa mobilite francophone est une voie privilegiee pour les travailleurs francophones qui souhaitent travailler au Canada **hors Quebec**.\n\n**Avantages :**\n- Pas besoin d'EIMT (economie de 1 000 $ pour l'employeur)\n- Processus plus rapide (2-4 mois)\n- Points bonus Entree express (+25 a +50 points CRS)\n\n**Conditions :**\n- Offre d'emploi dans une province **autre que le Quebec** (TEER 0, 1, 2 ou 3)\n- Competences en francais : NCLC 5 minimum\n- Permis de travail ferme lie a l'employeur\n\n**Exemption depuis 2023 :** Elargie aux postes TEER 4 et 5 dans certains cas.\n\n**Source** : IRCC.gc.ca - Mobilite francophone",
    keywords: ["mobilite", "francophone", "francais", "hors", "quebec", "dispense"],
  },
  {
    question: "Mon employeur peut-il me parrainer?",
    answer: "**Clarification importante :**\n\nAu Canada, un employeur **ne parraine pas** directement un employe pour la residence permanente (contrairement aux Etats-Unis). Voici les voies impliquant un employeur :\n\n**Voies temporaires :**\n- **EIMT + permis de travail** : L'employeur obtient une EIMT, vous demandez le permis\n- **Mobilite francophone** : Pas d'EIMT necessaire (hors Quebec)\n- **Transfert intra-entreprise** : Pour les employes transferes\n\n**Voies permanentes :**\n- **Entree express** : L'offre d'emploi validee par EIMT donne **50-200 points CRS** bonus\n- **PNP** : Certaines provinces ont des volets employeur (nomination provinciale)\n- **Programme pilote** : Certains programmes sectoriels existent\n\n**L'employeur peut aider en :**\n- Fournissant une offre d'emploi\n- Obtenant une EIMT\n- Supportant une nomination provinciale\n\n**Source** : IRCC.gc.ca",
    keywords: ["employeur", "parrainer", "sponsor", "travail", "offre", "embauche"],
  },
  {
    question: "Quels tests de langue sont acceptes?",
    answer: "**Tests de langue reconnus par IRCC :**\n\n**Francais :**\n- **TEF Canada** (Test d'evaluation de francais) - Chambre de commerce de Paris\n- **TCF Canada** (Test de connaissance du francais) - France Education International\n- Valides : **2 ans** apres la date du test\n\n**Anglais :**\n- **IELTS General Training** - (pas Academic pour l'immigration)\n- **CELPIP General** - (pas CELPIP LS pour la citoyennete uniquement)\n- Valides : **2 ans** apres la date du test\n\n**Equivalences :**\n- NCLC 7 (francais) = CLB 7 (anglais) = IELTS 6.0 chaque section\n- NCLC 5 (francais) = CLB 5 (anglais) = IELTS 5.0 chaque section\n\n**Conseil :** Faites vos tests **tot** dans le processus. Les resultats expirent apres 2 ans et sont necessaires pour la plupart des programmes.\n\n**Source** : IRCC.gc.ca - Tests linguistiques",
    keywords: ["langue", "test", "tef", "tcf", "ielts", "celpip", "nclc", "clb", "francais", "anglais"],
  },
  {
    question: "Comment fonctionne le systeme Arrima?",
    answer: "**Systeme Arrima - Selection du Quebec :**\n\nArrima est le portail en ligne du MIFI pour gerer les demandes d'immigration permanente au Quebec.\n\n**Fonctionnement :**\n1. **Creer un profil** dans la banque de candidatures (declaration d'interet)\n2. **Recevoir une invitation** a presenter une demande (basee sur la grille de selection)\n3. **Soumettre la demande** de CSQ dans les delais prescrits\n4. **Obtenir le CSQ** apres evaluation\n5. **Soumettre au federal** (IRCC) pour la RP\n\n**Criteres de selection principaux :**\n- Formation (diplome et domaine)\n- Experience professionnelle\n- Age\n- Connaissances linguistiques (francais primordial)\n- Sejour et famille au Quebec\n- Offre d'emploi validee\n- Conjoint accompagnateur\n\n**Delai total :** 12-18 mois (CSQ) + 6-12 mois (federal)\n\n**Source** : MIFI - Quebec.ca / Arrima",
    keywords: ["arrima", "quebec", "pstq", "selection", "portail", "declaration", "interet"],
  },
];

const RESPONSE_TEMPLATES: { id: string; title: string; content: string; category: string }[] = [
  {
    id: "tpl-suivi",
    title: "Courriel de suivi client",
    category: "Suivi",
    content: `Objet : Suivi de votre dossier d'immigration — [NOM DU PROGRAMME]\n\nBonjour [PRENOM],\n\nNous esperons que vous allez bien. Nous vous contactons pour faire le suivi de votre dossier d'immigration.\n\n**Etat actuel de votre dossier :**\n- Programme : [NOM DU PROGRAMME]\n- Statut : [STATUT]\n- Derniere mise a jour : [DATE]\n\n**Prochaines etapes :**\n[DECRIRE LES PROCHAINES ETAPES]\n\nSi vous avez des questions, n'hesitez pas a nous contacter.\n\nCordialement,\n[NOM DU CONSEILLER]\nSOS Hub Canada\nTel : 514-XXX-XXXX`,
  },
  {
    id: "tpl-docs-manquants",
    title: "Rappel de documents manquants",
    category: "Documents",
    content: `Objet : Documents requis — Action necessaire\n\nBonjour [PRENOM],\n\nNous vous ecrivons pour vous rappeler que certains documents sont encore necessaires pour completer votre dossier :\n\n**Documents manquants :**\n1. [DOCUMENT 1]\n2. [DOCUMENT 2]\n3. [DOCUMENT 3]\n\n**Date limite recommandee :** [DATE]\n\nVeuillez nous faire parvenir ces documents par courriel ou via votre portail client des que possible. Tout retard pourrait affecter les delais de traitement de votre demande.\n\n**Format accepte :** PDF, JPEG (max 10 Mo par fichier)\n\nCordialement,\n[NOM DU CONSEILLER]\nSOS Hub Canada`,
  },
  {
    id: "tpl-reception",
    title: "Confirmation de reception de dossier",
    category: "Confirmation",
    content: `Objet : Confirmation — Dossier recu\n\nBonjour [PRENOM],\n\nNous confirmons la reception de votre dossier pour le programme [NOM DU PROGRAMME].\n\n**Resume :**\n- Numero de dossier : [NUMERO]\n- Programme : [PROGRAMME]\n- Conseiller(ere) assigne(e) : [NOM]\n- Documents recus : [NOMBRE] / [TOTAL REQUIS]\n\n**Prochaine etape :** Votre conseiller(ere) examinera votre dossier et vous contactera dans les prochains [X] jours ouvrables pour planifier la suite.\n\n**Important :** Veuillez conserver ce courriel comme reference. Si vous devez nous contacter, mentionnez votre numero de dossier.\n\nCordialement,\n[NOM]\nSOS Hub Canada`,
  },
  {
    id: "tpl-statut",
    title: "Mise a jour de statut",
    category: "Statut",
    content: `Objet : Mise a jour — Votre demande de [PROGRAMME]\n\nBonjour [PRENOM],\n\nNous avons une mise a jour concernant votre dossier d'immigration :\n\n**Changement de statut :**\n- Ancien statut : [ANCIEN STATUT]\n- Nouveau statut : [NOUVEAU STATUT]\n- Date du changement : [DATE]\n\n**Ce que cela signifie :**\n[EXPLICATION]\n\n**Actions requises de votre part :**\n[ACTIONS OU \"Aucune action requise pour le moment.\"]\n\nN'hesitez pas a nous contacter si vous avez des questions.\n\nCordialement,\n[NOM]\nSOS Hub Canada`,
  },
  {
    id: "tpl-entrevue",
    title: "Preparation a l'entrevue",
    category: "Entrevue",
    content: `Objet : Preparation a votre entrevue — [TYPE D'ENTREVUE]\n\nBonjour [PRENOM],\n\nVotre entrevue est prevue pour le [DATE] a [HEURE].\n\n**Details :**\n- Type : [TYPE]\n- Lieu : [LIEU OU EN LIGNE]\n- Duree estimee : [DUREE]\n\n**Documents a apporter :**\n1. Passeport original\n2. Tous les documents soumis avec la demande (originaux)\n3. Piece d'identite avec photo\n4. [DOCUMENTS SPECIFIQUES]\n\n**Conseils de preparation :**\n- Arrivez 15 minutes a l'avance\n- Soyez honnete et coherent avec les informations de votre demande\n- Repondez clairement et directement aux questions\n- Demandez des clarifications si vous ne comprenez pas une question\n\n**Important :** Si vous ne pouvez pas vous presenter, informez-nous **immediatement**.\n\nCordialement,\n[NOM]\nSOS Hub Canada`,
  },
];

const DOCUMENT_CHECKLISTS: Record<string, { program: string; documents: string[] }> = {
  "ee-fsw": {
    program: "Entree express - Travailleurs qualifies (FSW)",
    documents: [
      "Passeport valide (toutes les pages)",
      "Resultats tests linguistiques (TEF/TCF et/ou IELTS/CELPIP) - moins de 2 ans",
      "Evaluation des diplomes etrangers (EDE) - WES, IQAS, etc.",
      "Lettres de reference d'employeurs (experience de travail qualifiee)",
      "Preuve de fonds d'etablissement (releves bancaires 6 derniers mois)",
      "Photos d'immigration (format IRCC)",
      "Certificats de police (pays de residence 6+ mois depuis 18 ans)",
      "Examen medical (medecin designe)",
      "Formulaire IMM 0008 - Demande generique",
      "Annexe 1 - Antecedents / Declaration (IMM 0008-Schedule 1)",
      "IMM 5669 - Annexe A - Antecedents",
      "IMM 5645 - Renseignements sur la famille",
      "IMM 5406 - Renseignements supplementaires - Personnes a charge",
      "IMM 5476 - Recours aux services d'un representant",
      "Certificat de naissance",
      "Certificat de mariage ou preuve de conjoint de fait (si applicable)",
      "Formulaire IMM 5562 - Renseignements supplementaires - Conjoints",
    ],
  },
  "parrainage-conjoint": {
    program: "Parrainage de conjoint",
    documents: [
      "IMM 1344 - Demande de parrainage et engagement",
      "IMM 0008 - Demande generique",
      "IMM 5532 - Relation entre le repondant et la personne parrainee",
      "IMM 5669 - Annexe A",
      "IMM 5645 - Renseignements sur la famille",
      "Certificat de mariage / preuve union de fait (12 mois cohabitation)",
      "Preuves de relation genuine (photos, communications, billets d'avion)",
      "Passeports des deux parties",
      "Certificats de police",
      "Examen medical du demandeur",
      "Photos d'immigration",
      "Preuve de statut du repondant (citoyennete ou RP)",
      "Preuve financiere du repondant (avis de cotisation)",
    ],
  },
  "asile": {
    program: "Demande d'asile",
    documents: [
      "Formulaire de fondement de la demande d'asile (FDA / BOC)",
      "Passeport ou document de voyage (si disponible)",
      "Piece d'identite",
      "Preuves de persecution (documents, photos, rapports medicaux)",
      "Temoignages et declarations ecrites",
      "Articles de presse ou rapports d'organisations (Amnesty, HRW, etc.)",
      "Documentation sur le pays d'origine (conditions actuelles)",
      "Certificats de naissance des enfants (si applicable)",
      "Preuves de parcours migratoire",
      "IMM 5476 - Designation de representant",
    ],
  },
  "permis-travail": {
    program: "Permis de travail",
    documents: [
      "Passeport valide",
      "EIMT positive (si applicable) ou preuve de dispense",
      "Offre d'emploi / contrat de travail",
      "CV a jour",
      "Preuves de qualifications (diplomes, certifications)",
      "Resultats tests linguistiques (si requis)",
      "Photos d'immigration",
      "Examen medical (si requis - certains pays/professions)",
      "Certificat de police (si requis)",
      "IMM 1295 ou demande en ligne",
      "Frais de traitement (155 $)",
      "CAQ travail (si Quebec) - 2-4 semaines de traitement",
    ],
  },
  "permis-etudes": {
    program: "Permis d'etudes",
    documents: [
      "Lettre d'acceptation d'un etablissement designe (DLI)",
      "CAQ (si Quebec) - a obtenir AVANT le permis d'etudes",
      "Passeport valide",
      "Preuves financieres (20 635 $/an + frais de scolarite)",
      "Photos d'immigration",
      "Examen medical (certains pays)",
      "Certificat de police (si requis)",
      "Relevés de notes et diplomes",
      "Lettre d'explication / plan d'etudes",
      "Donnees biometriques (85 $)",
      "Frais de traitement (150 $)",
    ],
  },
  "citoyennete": {
    program: "Citoyennete canadienne",
    documents: [
      "CIT 0002 - Demande de citoyennete (adulte)",
      "Photocopie de la carte RP (recto-verso)",
      "Photocopie du passeport (toutes les pages utilisees)",
      "2 photos d'identite (format citoyennete)",
      "Preuve de competences linguistiques (NCLC 4+ ou CLB 4+)",
      "Copies des declarations de revenus (3 des 5 dernieres annees)",
      "Calculateur de presence physique (rempli)",
      "Documents de voyage (pour prouver la presence physique)",
      "Frais : 630 $ (adulte) / 100 $ (mineur)",
    ],
  },
};

const IRCC_USEFUL_LINKS: Record<string, string> = {
  "Delais de traitement IRCC": "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/demande/verifier-delais-traitement.html",
  "Mon compte IRCC": "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/demande/compte.html",
  "Formulaire Web IRCC": "https://www.canada.ca/fr/immigration-refugies-citoyennete/corporate/communiquer/formulaire-web.html",
  "Portail Arrima (Quebec)": "https://www.quebec.ca/immigration/arrima",
  "MIFI Quebec": "https://www.quebec.ca/immigration",
  "Medecins designes": "https://secure.cic.gc.ca/pp-md/pp-list.aspx",
  "Bareme des frais IRCC": "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/demande/frais-traitement.html",
};

// ========================================================
// QUICK ACTIONS
// ========================================================

const QUICK_ACTIONS = [
  { id: "resume", label: "Resume client", icon: Users, prompt: "Donne-moi un resume complet du client selectionne", color: "bg-blue-50 text-blue-700 border-blue-200", consultantOnly: false },
  { id: "programme", label: "Recommander programme", icon: Sparkles, prompt: "Quel programme d'immigration recommander pour ce client?", color: "bg-purple-50 text-purple-700 border-purple-200", consultantOnly: true },
  { id: "checklist", label: "Checklist documents", icon: ListChecks, prompt: "Genere la checklist de documents pour ce dossier", color: "bg-green-50 text-green-700 border-green-200", consultantOnly: true },
  { id: "etapes", label: "Prochaines etapes", icon: Lightbulb, prompt: "Quelles sont les prochaines etapes pour le dossier?", color: "bg-amber-50 text-amber-700 border-amber-200", consultantOnly: false },
  { id: "delais", label: "Delais de traitement", icon: Clock, prompt: "Quels sont les delais de traitement actuels?", color: "bg-cyan-50 text-cyan-700 border-cyan-200", consultantOnly: false },
  { id: "modele", label: "Modele de reponse", icon: Mail, prompt: "Affiche les modeles de reponse disponibles", color: "bg-pink-50 text-pink-700 border-pink-200", consultantOnly: true },
  { id: "eligibilite", label: "Verifier admissibilite", icon: Scale, prompt: "Verifie l'admissibilite du client aux differents programmes", color: "bg-indigo-50 text-indigo-700 border-indigo-200", consultantOnly: false },
  { id: "alertes", label: "Alertes urgentes", icon: Bell, prompt: "Y a-t-il des dossiers en retard ou des alertes urgentes?", color: "bg-red-50 text-red-700 border-red-200", consultantOnly: true },
];

// ========================================================
// KNOWLEDGE BASE SECTIONS
// ========================================================

interface KBSection {
  id: string;
  title: string;
  icon: typeof Clock;
  items: { label: string; prompt: string }[];
}

const KB_SECTIONS: KBSection[] = [
  {
    id: "delais-ircc",
    title: "Delais de traitement IRCC",
    icon: Clock,
    items: Object.entries(PROCESSING_TIMES_IRCC).map(([, v]) => ({
      label: `${v.label} : ${v.time}`,
      prompt: `Donne-moi les details sur les delais pour ${v.label}`,
    })),
  },
  {
    id: "delais-quebec",
    title: "Delais Quebec (MIFI)",
    icon: MapPin,
    items: Object.entries(PROCESSING_TIMES_QUEBEC).map(([, v]) => ({
      label: `${v.label} : ${v.time}${v.note ? " *" : ""}`,
      prompt: `Donne-moi les details sur ${v.label}`,
    })),
  },
  {
    id: "faq",
    title: "FAQ communes",
    icon: MessageSquare,
    items: COMMON_FAQ.map(f => ({
      label: f.question,
      prompt: f.question,
    })),
  },
  {
    id: "modeles",
    title: "Modeles de reponse",
    icon: Mail,
    items: RESPONSE_TEMPLATES.map(t => ({
      label: `${t.title} (${t.category})`,
      prompt: `Affiche le modele de reponse : ${t.title}`,
    })),
  },
];

// ========================================================
// DISCLAIMER
// ========================================================

const DISCLAIMER = "\n\n---\n**Avis** : Les informations sont fournies a titre indicatif uniquement. Consultez IRCC.gc.ca ou le MIFI (Quebec.ca) pour les donnees officielles.";

// ========================================================
// MAIN COMPONENT
// ========================================================

export default function AgentAIPage() {
  const { currentUser, clients, cases, appointments } = useCrm();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedContext, setSelectedContext] = useState<"general" | "client" | "dossier">("general");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!currentUser) return null;

  const perms = ROLE_PERMISSIONS[currentUser.role] || {};
  const isConsultantMode = perms.canAccessSOSIAConsultant === true;

  const getClientName = (id: string) => {
    const c = clients.find(cl => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Inconnu";
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ========================================================
  // RESPONSE GENERATION ENGINE
  // ========================================================

  const generateResponse = (userMsg: string): { content: string; suggestions?: string[] } => {
    const lowerMsg = userMsg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // === RESPONSE TEMPLATES ===
    if (lowerMsg.includes("modele") || lowerMsg.includes("template") || lowerMsg.includes("gabarit")) {
      const specificTemplate = RESPONSE_TEMPLATES.find(t =>
        lowerMsg.includes(t.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
        lowerMsg.includes(t.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );

      if (specificTemplate) {
        return {
          content: `**Modele : ${specificTemplate.title}**\n\n${specificTemplate.content}\n\n---\n*Copiez ce modele et remplacez les champs entre [CROCHETS] par les informations du client.*`,
          suggestions: ["Autre modele", "Personnaliser pour le client", "Envoyer par courriel"],
        };
      }

      return {
        content: `**Modeles de reponse disponibles :**\n\n` +
          RESPONSE_TEMPLATES.map((t, i) =>
            `${i + 1}. **${t.title}** (${t.category})\n   _Utilisation : ${t.category === "Suivi" ? "Suivi regulier du dossier client" : t.category === "Documents" ? "Rappel pour documents manquants" : t.category === "Confirmation" ? "Confirmer la reception du dossier" : t.category === "Statut" ? "Informer le client d'un changement" : "Preparer le client pour une entrevue"}_`
          ).join("\n\n") +
          `\n\nDites-moi lequel vous souhaitez utiliser et je vous le fournirai pre-rempli si un client est selectionne.`,
        suggestions: RESPONSE_TEMPLATES.map(t => t.title),
      };
    }

    // === DOCUMENT CHECKLISTS ===
    if (lowerMsg.includes("checklist") || lowerMsg.includes("liste de documents") || (lowerMsg.includes("document") && lowerMsg.includes("requis"))) {
      // If a case is selected, use the case program
      if (selectedCaseId) {
        const caseItem = cases.find(c => c.id === selectedCaseId);
        if (caseItem) {
          const prog = IMMIGRATION_PROGRAMS.find(p => p.id === caseItem.programId);
          const checklistKey = Object.keys(DOCUMENT_CHECKLISTS).find(k =>
            caseItem.programId.toLowerCase().includes(k.replace(/-/g, "")) ||
            k.includes(caseItem.programId.split("-")[0])
          );
          const checklist = checklistKey ? DOCUMENT_CHECKLISTS[checklistKey] : null;

          if (checklist) {
            // Cross-reference with existing documents
            const client = clients.find(c => c.id === caseItem.clientId);
            const existingDocs = client?.documents || [];

            return {
              content: `**Checklist de documents — ${checklist.program}**\n` +
                `Client : ${client ? `${client.firstName} ${client.lastName}` : "N/A"}\n\n` +
                checklist.documents.map((doc, i) => {
                  const hasDoc = existingDocs.some(d =>
                    d.name.toLowerCase().includes(doc.split("(")[0].trim().toLowerCase().substring(0, 15)) ||
                    doc.toLowerCase().includes((d.category || "").toLowerCase())
                  );
                  return `${hasDoc ? "[ OK ]" : "[ -- ]"} ${i + 1}. ${doc}`;
                }).join("\n") +
                `\n\n**Formulaires du dossier :**\n` +
                caseItem.forms.map(f => {
                  const formDef = IRCC_FORMS.find(fd => fd.id === f.formId);
                  const statusIcon = f.status === "vide" ? "[ -- ]" : f.status === "en_cours" ? "[...]" : f.status === "rempli" ? "[OK ]" : f.status === "approuve" ? "[ V ]" : f.status === "signe" ? "[ S ]" : "[?? ]";
                  return `${statusIcon} ${formDef?.code || f.formId} - ${formDef?.name || "Formulaire"}`;
                }).join("\n") +
                DISCLAIMER,
              suggestions: ["Documents manquants seulement", "Envoyer rappel au client", "Prochaines etapes"],
            };
          }
        }
      }

      // Generic checklist display
      return {
        content: `**Checklists de documents disponibles :**\n\n` +
          Object.entries(DOCUMENT_CHECKLISTS).map(([, v]) =>
            `- **${v.program}** (${v.documents.length} documents)`
          ).join("\n") +
          `\n\nSelectionnez un dossier pour voir la checklist personnalisee avec le statut de chaque document, ou demandez une checklist specifique par programme.`,
        suggestions: Object.values(DOCUMENT_CHECKLISTS).map(v => `Checklist ${v.program}`),
      };
    }

    // === PROCESSING TIMES ===
    if (lowerMsg.includes("delai") || lowerMsg.includes("traitement") || lowerMsg.includes("temps") || lowerMsg.includes("combien de temps") || lowerMsg.includes("duree")) {
      // Check for specific program
      const matchedIRCC = Object.entries(PROCESSING_TIMES_IRCC).find(([, v]) =>
        lowerMsg.includes(v.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 20))
      );
      const matchedQC = Object.entries(PROCESSING_TIMES_QUEBEC).find(([, v]) =>
        lowerMsg.includes(v.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 15))
      );

      if (matchedIRCC) {
        const [, v] = matchedIRCC;
        return {
          content: `**Delais de traitement — ${v.label}**\n\n` +
            `Delai estime : **${v.time}**\n\n` +
            `Ces delais sont bases sur les donnees publiees par IRCC pour 2025-2026. Les delais reels varient selon :\n` +
            `- Le volume de demandes\n` +
            `- Le pays d'origine\n` +
            `- La completude du dossier\n` +
            `- Les controles de securite\n\n` +
            `**Lien officiel** : ${v.link}\n` +
            `**Verifier les delais en temps reel** : ${IRCC_USEFUL_LINKS["Delais de traitement IRCC"]}` +
            DISCLAIMER,
          suggestions: ["Tous les delais", "Delais Quebec", "Comment accelerer le traitement"],
        };
      }
      if (matchedQC) {
        const [, v] = matchedQC;
        return {
          content: `**Delais de traitement Quebec — ${v.label}**\n\n` +
            `Delai estime : **${v.time}**\n` +
            (v.note ? `\n**Note importante** : ${v.note}\n` : "") +
            `\n**Lien officiel** : ${v.link}` +
            DISCLAIMER,
          suggestions: ["Delais IRCC", "Processus Arrima", "CSQ"],
        };
      }

      // Show all processing times
      return {
        content: `**Delais de traitement estimes 2025-2026**\n\n` +
          `**IRCC (federal) :**\n` +
          Object.values(PROCESSING_TIMES_IRCC).map(v => `- ${v.label} : **${v.time}**`).join("\n") +
          `\n\n**Quebec (MIFI) :**\n` +
          Object.values(PROCESSING_TIMES_QUEBEC).map(v =>
            `- ${v.label} : **${v.time}**${v.note ? " *" : ""}`
          ).join("\n") +
          (PROCESSING_TIMES_QUEBEC["peq"]?.note ? `\n\n_* ${PROCESSING_TIMES_QUEBEC["peq"].note}_` : "") +
          `\n\n**Liens utiles :**\n` +
          `- Verifier les delais IRCC : ${IRCC_USEFUL_LINKS["Delais de traitement IRCC"]}\n` +
          `- MIFI Quebec : ${IRCC_USEFUL_LINKS["MIFI Quebec"]}` +
          DISCLAIMER,
        suggestions: ["Delai pour un programme specifique", "Comment accelerer", "Verifier un retard"],
      };
    }

    // === FORM GUIDANCE ===
    if (lowerMsg.includes("formulaire") || lowerMsg.includes("imm ") || lowerMsg.includes("imm0") || lowerMsg.includes("imm5") || lowerMsg.includes("cit ")) {
      // Search for specific form
      const matchedForm = IRCC_FORMS.find(f =>
        lowerMsg.includes(f.code.toLowerCase().replace(/\s/g, "")) ||
        lowerMsg.includes(f.code.toLowerCase()) ||
        lowerMsg.includes(f.id.toLowerCase())
      );

      if (matchedForm) {
        const usedBy = IMMIGRATION_PROGRAMS.filter(p => p.requiredForms.includes(matchedForm.id));
        return {
          content: `**Formulaire : ${matchedForm.code} — ${matchedForm.name}**\n\n` +
            `**Description** : ${matchedForm.description}\n` +
            `**Categorie** : ${matchedForm.category}\n` +
            `**Version** : ${matchedForm.version}\n\n` +
            `**Champs principaux** (${matchedForm.fields.filter(f => f.type !== "section_header").length} champs) :\n` +
            matchedForm.fields
              .filter(f => f.type === "section_header")
              .map(f => `- ${f.label}`)
              .join("\n") +
            `\n\n**Utilise par les programmes** :\n` +
            (usedBy.length > 0
              ? usedBy.map(p => `- ${p.name}`).join("\n")
              : "- Information non disponible") +
            `\n\n**Remplissage automatique** : Les champs marques avec auto-remplissage seront pre-remplis a partir du profil client si disponible.` +
            DISCLAIMER,
          suggestions: ["Remplir automatiquement", "Autre formulaire", "Formulaires du dossier"],
        };
      }

      // If a case is selected, show its forms
      if (selectedCaseId) {
        const caseItem = cases.find(c => c.id === selectedCaseId);
        if (caseItem) {
          return {
            content: `**Formulaires du dossier "${caseItem.title}" :**\n\n` +
              caseItem.forms.map(f => {
                const formDef = IRCC_FORMS.find(fd => fd.id === f.formId);
                const statusLabel = f.status === "vide" ? "Vide" : f.status === "en_cours" ? "En cours" : f.status === "rempli" ? "Rempli" : f.status === "revise" ? "Revise" : f.status === "approuve" ? "Approuve" : f.status === "signe" ? "Signe" : f.status;
                return `- **${formDef?.code || f.formId}** — ${formDef?.name || "Formulaire"}\n  Statut : ${statusLabel} | Derniere mise a jour : ${f.lastUpdated || "N/A"}`;
              }).join("\n") +
              DISCLAIMER,
            suggestions: ["Remplir les formulaires", "Details d'un formulaire", "Checklist documents"],
          };
        }
      }

      // List available forms
      return {
        content: `**Formulaires IRCC disponibles dans le systeme :**\n\n` +
          IRCC_FORMS.slice(0, 10).map(f => `- **${f.code}** — ${f.name}`).join("\n") +
          (IRCC_FORMS.length > 10 ? `\n- ... et ${IRCC_FORMS.length - 10} autres formulaires` : "") +
          `\n\nDemandez des details sur un formulaire specifique (ex: "Details sur IMM 0008") ou selectionnez un dossier pour voir ses formulaires.`,
        suggestions: ["IMM 0008", "IMM 5669", "IMM 5476", "Formulaires du dossier"],
      };
    }

    // === FAQ MATCHING ===
    const matchedFaq = COMMON_FAQ.find(f =>
      f.keywords.some(k => lowerMsg.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
    );
    if (matchedFaq && !lowerMsg.includes("resume") && !lowerMsg.includes("dossier") && !lowerMsg.includes("programme")) {
      return {
        content: `**${matchedFaq.question}**\n\n${matchedFaq.answer}` + DISCLAIMER,
        suggestions: ["Autre question", "Parler a un conseiller", "Delais de traitement"],
      };
    }

    // === CONTEXT: SPECIFIC CLIENT ===
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (!client) return { content: "Client introuvable dans le systeme." };

      const clientCases = cases.filter(c => c.clientId === selectedClientId);
      const clientAppts = appointments.filter(a => a.clientId === selectedClientId);

      // Client Summary
      if (lowerMsg.includes("resume") || lowerMsg.includes("profil") || lowerMsg.includes("sommaire") || lowerMsg.includes("complet")) {
        const overdueItems: string[] = [];
        clientCases.forEach(c => {
          if (c.deadline && new Date(c.deadline) < new Date() && !["ferme", "approuve", "refuse"].includes(c.status)) {
            overdueItems.push(`Dossier "${c.title}" — Echeance depassee (${c.deadline})`);
          }
          c.forms.forEach(f => {
            if (f.status === "vide") {
              const fd = IRCC_FORMS.find(x => x.id === f.formId);
              overdueItems.push(`Formulaire ${fd?.code || f.formId} — Non commence`);
            }
          });
        });

        const docsExpiring = client.documents.filter(d => {
          if (!d.expiryDate) return false;
          const daysLeft = (new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysLeft > 0 && daysLeft <= 90;
        });

        return {
          content: `**Resume du client : ${client.firstName} ${client.lastName}**\n\n` +
            `**Informations personnelles :**\n` +
            `- Nationalite : ${client.nationality}\n` +
            `- Date de naissance : ${client.dateOfBirth}\n` +
            `- Etat civil : ${client.maritalStatus}\n` +
            `- Personnes a charge : ${client.dependants}\n` +
            `- Membres de famille : ${client.familyMembers.length}\n\n` +
            `**Immigration :**\n` +
            `- Statut actuel : ${client.currentStatus}\n` +
            `- Pays actuel : ${client.currentCountry}\n` +
            `- Anglais : ${client.languageEnglish || "Non evalue"}\n` +
            `- Francais : ${client.languageFrench || "Non evalue"}\n` +
            `- Education : ${client.education || "Non renseigne"}\n` +
            `- Experience : ${client.workExperience || "Non renseignee"}\n\n` +
            `**Documents :** ${client.documents.length} document(s) au dossier\n` +
            `- Verifies : ${client.documents.filter(d => d.status === "verifie").length}\n` +
            `- En attente : ${client.documents.filter(d => d.status === "televerse").length}\n` +
            (docsExpiring.length > 0 ? `- **Expirent bientot** : ${docsExpiring.map(d => `${d.name} (${d.expiryDate})`).join(", ")}\n` : "") +
            `\n**Dossiers (${clientCases.length}) :**\n` +
            (clientCases.length > 0
              ? clientCases.map(c => `- ${c.title} — ${CASE_STATUS_LABELS[c.status]} | Priorite : ${c.priority} | Assigne : ${getUserName(c.assignedTo)}`).join("\n")
              : "Aucun dossier actif") +
            `\n\n**Rendez-vous :** ${clientAppts.length} planifie(s)\n` +
            (overdueItems.length > 0
              ? `\n**Alertes :**\n` + overdueItems.map(i => `- ${i}`).join("\n")
              : "\nAucune alerte active.") +
            DISCLAIMER,
          suggestions: ["Recommander programme", "Checklist documents", "Prochaines etapes", "Verifier admissibilite"],
        };
      }

      // Program Recommendation
      if (lowerMsg.includes("programme") || lowerMsg.includes("recommand") || lowerMsg.includes("admissibilite") || lowerMsg.includes("eligible") || lowerMsg.includes("eligibilite")) {
        const recs: { name: string; reason: string; priority: string }[] = [];

        if (client.currentStatus === "demandeur_asile" || client.currentStatus === "personne_protegee") {
          recs.push({ name: "Demande d'asile / Protection", reason: "Statut actuel de demandeur d'asile", priority: "Haute" });
          if (client.currentStatus === "personne_protegee") {
            recs.push({ name: "Residence permanente — Personne protegee", reason: "Peut demander la RP en tant que personne protegee", priority: "Haute" });
          }
        }
        if (client.languageFrench && parseInt(client.languageFrench.replace(/\D/g, "")) >= 7) {
          if (client.currentCountry === "Canada" && client.workExperience) {
            recs.push({ name: "Mobilite francophone", reason: `Bon niveau de francais (${client.languageFrench}) + experience au Canada`, priority: "Haute" });
          }
          recs.push({ name: "Entree express (bonus francophone)", reason: `NCLC ${client.languageFrench} donne des points bonus CRS importants`, priority: "Moyenne" });
        }
        if (client.education?.toLowerCase().includes("maitrise") || client.education?.toLowerCase().includes("doctorat")) {
          recs.push({ name: "Entree express — Travailleurs qualifies (FSW)", reason: `Haut niveau d'education (${client.education})`, priority: "Haute" });
        }
        if (client.workExperience && client.currentCountry === "Canada") {
          recs.push({ name: "Categorie de l'experience canadienne (CEC)", reason: "Experience de travail au Canada", priority: "Haute" });
          recs.push({ name: "PSTQ / Arrima (Quebec)", reason: "Peut etre eligible au programme quebecois", priority: "Moyenne" });
        }
        if (client.familyMembers.some(fm => fm.relationship === "Epouse" || fm.relationship === "Epoux")) {
          recs.push({ name: "Parrainage de conjoint(e)", reason: "Membre de famille conjoint(e) identifie(e)", priority: "A verifier" });
        }
        if (recs.length === 0) {
          recs.push({ name: "Entree express — FSW", reason: "Programme general pour travailleurs qualifies", priority: "A evaluer" });
          recs.push({ name: "Programme des candidats provinciaux (PNP)", reason: "Voie alternative si score CRS insuffisant", priority: "A evaluer" });
        }

        return {
          content: `**Recommandations de programmes pour ${client.firstName} ${client.lastName} :**\n\n` +
            `_Profil : ${client.nationality} | ${client.currentStatus} | ${client.education || "Education N/A"} | Francais : ${client.languageFrench || "N/A"}_\n\n` +
            recs.map((r, i) =>
              `**${i + 1}. ${r.name}**\n   Raison : ${r.reason}\n   Priorite : ${r.priority}`
            ).join("\n\n") +
            `\n\n**Prochaines etapes recommandees :**\n` +
            `1. Verifier les exigences detaillees de chaque programme\n` +
            `2. S'assurer que les tests linguistiques sont a jour\n` +
            `3. Rassembler les documents requis\n` +
            `4. Planifier une consultation pour confirmer la strategie` +
            DISCLAIMER,
          suggestions: ["Details sur un programme", "Checklist documents", "Calculer score CRS", "Formulaires requis"],
        };
      }

      // Client forms
      if (lowerMsg.includes("formulaire")) {
        if (clientCases.length === 0) {
          return { content: `Aucun dossier actif pour ${client.firstName}. Creez d'abord un dossier pour voir les formulaires requis.`, suggestions: ["Creer un dossier", "Recommander programme"] };
        }
        const formInfo = clientCases.map(c => {
          const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
          const caseFormStatuses = c.forms.map(f => {
            const formDef = IRCC_FORMS.find(fd => fd.id === f.formId);
            const statusIcon = f.status === "vide" ? "[ -- ]" : f.status === "en_cours" ? "[...]" : f.status === "rempli" ? "[OK ]" : f.status === "approuve" ? "[ V ]" : f.status === "signe" ? "[ S ]" : "[?? ]";
            return `  ${statusIcon} ${formDef?.code || f.formId} — ${formDef?.name || "Formulaire"}`;
          });
          return `**${c.title}** (${CASE_STATUS_LABELS[c.status]}) — ${prog?.name || "Programme inconnu"}\n${caseFormStatuses.join("\n")}`;
        });
        return {
          content: `**Formulaires pour ${client.firstName} ${client.lastName} :**\n\n${formInfo.join("\n\n")}` + DISCLAIMER,
          suggestions: ["Remplir automatiquement", "Prochaines etapes", "Details d'un formulaire"],
        };
      }
    }

    // === CONTEXT: SPECIFIC CASE ===
    if (selectedCaseId) {
      const caseItem = cases.find(c => c.id === selectedCaseId);
      if (!caseItem) return { content: "Dossier introuvable dans le systeme." };
      const client = clients.find(c => c.id === caseItem.clientId);
      const prog = IMMIGRATION_PROGRAMS.find(p => p.id === caseItem.programId);

      if (lowerMsg.includes("etat") || lowerMsg.includes("statut") || lowerMsg.includes("resume") || lowerMsg.includes("sommaire")) {
        const formsDone = caseItem.forms.filter(f => ["rempli", "revise", "approuve", "signe"].includes(f.status)).length;
        const formsTotal = caseItem.forms.length;
        const isOverdue = caseItem.deadline && new Date(caseItem.deadline) < new Date();
        const daysToDeadline = caseItem.deadline ? Math.ceil((new Date(caseItem.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

        return {
          content: `**Dossier : ${caseItem.title}**\n\n` +
            `| Champ | Valeur |\n|---|---|\n` +
            `| Client | ${client?.firstName} ${client?.lastName} |\n` +
            `| Programme | ${prog?.name || "Inconnu"} |\n` +
            `| Statut | **${CASE_STATUS_LABELS[caseItem.status]}** |\n` +
            `| Priorite | ${caseItem.priority} |\n` +
            `| Assigne a | ${getUserName(caseItem.assignedTo)} |\n` +
            `| Avocat | ${caseItem.assignedLawyer ? getUserName(caseItem.assignedLawyer) : "Non assigne"} |\n` +
            `| Echeance | ${caseItem.deadline || "Non definie"} ${isOverdue ? "**EN RETARD**" : daysToDeadline !== null && daysToDeadline <= 30 ? `(${daysToDeadline} jours)` : ""} |\n` +
            `| UCI | ${caseItem.uciNumber || "Non attribue"} |\n` +
            `| N. IRCC | ${caseItem.irccAppNumber || "Non attribue"} |\n\n` +
            `**Progression des formulaires :** ${formsDone}/${formsTotal} completes (${formsTotal > 0 ? Math.round((formsDone / formsTotal) * 100) : 0}%)\n` +
            `${"=".repeat(Math.round((formsDone / Math.max(formsTotal, 1)) * 20))}${"_".repeat(20 - Math.round((formsDone / Math.max(formsTotal, 1)) * 20))} ${formsDone}/${formsTotal}\n\n` +
            `**Derniers evenements :**\n` +
            caseItem.timeline.slice(-5).reverse().map(e => `- ${e.date} : ${e.description}`).join("\n") +
            (prog ? `\n\n**Delai de traitement estime :** ${prog.processingTime}` : "") +
            DISCLAIMER,
          suggestions: ["Prochaines etapes", "Checklist documents", "Formulaires manquants", "Modele de suivi"],
        };
      }

      if (lowerMsg.includes("prochaine") || lowerMsg.includes("etape") || lowerMsg.includes("next") || lowerMsg.includes("suivant")) {
        const statusFlow: Record<string, { action: string; details: string[] }> = {
          nouveau: {
            action: "Planifier la consultation initiale",
            details: [
              "Contacter le client pour fixer un rendez-vous",
              "Preparer le dossier de pre-evaluation",
              "Verifier les documents d'identite disponibles",
              "Evaluer l'admissibilite preliminaire",
            ],
          },
          consultation: {
            action: "Recueillir les documents et evaluer l'admissibilite",
            details: [
              "Analyser le profil complet du client",
              "Recommander le programme le plus adapte",
              "Envoyer la liste des documents requis",
              "Planifier les tests linguistiques si necessaires",
              "Etablir le devis et le contrat de service",
            ],
          },
          en_preparation: {
            action: "Completer les formulaires IRCC",
            details: [
              "Remplir les formulaires requis avec les donnees du client",
              "Verifier la coherence des informations",
              "Demander les documents manquants",
              "Preparer la lettre de soumission",
            ],
          },
          formulaires_remplis: {
            action: "Soumettre pour revision",
            details: [
              "Faire reviser par la technicienne juridique",
              "Verifier tous les champs obligatoires",
              "S'assurer que les frais sont payes",
              "Obtenir les signatures necessaires",
            ],
          },
          revision: {
            action: "Obtenir l'approbation et soumettre",
            details: [
              "Obtenir l'approbation finale de l'avocat/consultant",
              "Recueillir les signatures du client",
              "Soumettre la demande via le portail IRCC",
              "Conserver le numero de confirmation",
              "Confirmer la reception au client",
            ],
          },
          soumis: {
            action: "Surveiller le traitement",
            details: [
              "Verifier le portail IRCC regulierement",
              "Repondre rapidement aux demandes de renseignements supplementaires",
              "Preparer le client pour une entrevue eventuelle",
              "Mettre a jour le client sur les delais",
            ],
          },
          en_traitement_ircc: {
            action: "Attendre la decision et preparer la suite",
            details: [
              "Verifier le compte IRCC pour les mises a jour",
              "Repondre a toute lettre d'equite procedurale dans les delais",
              "Preparer les prochaines etapes selon le resultat attendu",
              "Maintenir le client informe",
            ],
          },
        };

        const step = statusFlow[caseItem.status] || { action: "Verifier l'etat du dossier", details: ["Le dossier est dans un etat final. Verifiez s'il y a des actions a prendre."] };
        const pendingForms = caseItem.forms.filter(f => f.status === "vide" || f.status === "en_cours");

        return {
          content: `**Prochaines etapes — "${caseItem.title}"**\n\n` +
            `**Statut actuel :** ${CASE_STATUS_LABELS[caseItem.status]}\n\n` +
            `**Action principale :** ${step.action}\n\n` +
            `**Details :**\n` +
            step.details.map((d, i) => `${i + 1}. ${d}`).join("\n") +
            (pendingForms.length > 0
              ? `\n\n**Formulaires a completer (${pendingForms.length}) :**\n` +
                pendingForms.map(f => {
                  const fd = IRCC_FORMS.find(x => x.id === f.formId);
                  return `- ${fd?.code || f.formId} — ${fd?.name || "Formulaire"} (${f.status === "vide" ? "pas commence" : "en cours"})`;
                }).join("\n")
              : "\n\nTous les formulaires sont completes.") +
            (prog ? `\n\n**Delai estime restant :** ${prog.processingTime}` : "") +
            DISCLAIMER,
          suggestions: ["Remplir les formulaires", "Envoyer rappel au client", "Changer le statut", "Modele de suivi"],
        };
      }
    }

    // === ALERTS & DEADLINES ===
    if (lowerMsg.includes("retard") || lowerMsg.includes("echeance") || lowerMsg.includes("urgent") || lowerMsg.includes("alerte") || lowerMsg.includes("deadline")) {
      const overdueCases = cases.filter(c => {
        if (!c.deadline || ["ferme", "approuve", "refuse"].includes(c.status)) return false;
        return new Date(c.deadline) < new Date();
      });
      const urgentCases = cases.filter(c => c.priority === "urgente" && !["ferme", "approuve", "refuse"].includes(c.status));
      const upcomingDeadlines = cases.filter(c => {
        if (!c.deadline || ["ferme", "approuve", "refuse"].includes(c.status)) return false;
        const days = (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days > 0 && days <= 30;
      });

      // Check for expiring documents
      const expiringDocs: { client: string; doc: string; expiry: string; daysLeft: number }[] = [];
      clients.forEach(cl => {
        cl.documents.forEach(d => {
          if (d.expiryDate) {
            const daysLeft = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft > 0 && daysLeft <= 90) {
              expiringDocs.push({ client: `${cl.firstName} ${cl.lastName}`, doc: d.name, expiry: d.expiryDate, daysLeft });
            }
          }
        });
      });

      // Stalled cases (no update in 30+ days)
      const stalledCases = cases.filter(c => {
        if (["ferme", "approuve", "refuse"].includes(c.status)) return false;
        const lastUpdate = c.timeline.length > 0 ? new Date(c.timeline[c.timeline.length - 1].date) : new Date(c.createdAt);
        return (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24) > 30;
      });

      return {
        content: `**Tableau de bord des alertes**\n\n` +
          `**Dossiers en retard (${overdueCases.length}) :**\n` +
          (overdueCases.length > 0
            ? overdueCases.map(c => `- [RETARD] ${c.title} — ${getClientName(c.clientId)} | Echeance : ${c.deadline}`).join("\n")
            : "Aucun dossier en retard.") +
          `\n\n**Dossiers priorite urgente (${urgentCases.length}) :**\n` +
          (urgentCases.length > 0
            ? urgentCases.map(c => `- [URGENT] ${c.title} — ${getClientName(c.clientId)} | ${CASE_STATUS_LABELS[c.status]}`).join("\n")
            : "Aucun dossier urgent.") +
          `\n\n**Echeances prochaines - 30 jours (${upcomingDeadlines.length}) :**\n` +
          (upcomingDeadlines.length > 0
            ? upcomingDeadlines.map(c => {
                const days = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return `- [${days}j] ${c.title} — ${getClientName(c.clientId)}`;
              }).join("\n")
            : "Aucune echeance imminente.") +
          (expiringDocs.length > 0
            ? `\n\n**Documents expirant bientot (${expiringDocs.length}) :**\n` +
              expiringDocs.map(d => `- [${d.daysLeft}j] ${d.doc} — ${d.client} (expire le ${d.expiry})`).join("\n")
            : "") +
          (stalledCases.length > 0
            ? `\n\n**Dossiers sans activite 30+ jours (${stalledCases.length}) :**\n` +
              stalledCases.map(c => `- [INACTIF] ${c.title} — ${getClientName(c.clientId)} | ${CASE_STATUS_LABELS[c.status]}`).join("\n")
            : ""),
        suggestions: ["Dossiers en retard", "Envoyer rappels", "Resume general", "Prochaines etapes"],
      };
    }

    // === GENERAL OVERVIEW / STATISTICS ===
    if (lowerMsg.includes("resume") || lowerMsg.includes("tableau") || lowerMsg.includes("statistique") || lowerMsg.includes("overview") || lowerMsg.includes("general")) {
      const activeClients = clients.filter(c => c.status === "actif").length;
      const openCases = cases.filter(c => !["ferme", "approuve", "refuse"].includes(c.status)).length;
      const todayStr = new Date().toISOString().split("T")[0];
      const todayAppts = appointments.filter(a => a.date === todayStr).length;
      const pendingForms = cases.reduce((acc, c) => acc + c.forms.filter(f => f.status === "vide" || f.status === "en_cours").length, 0);
      const overdueCasesCount = cases.filter(c => {
        if (!c.deadline || ["ferme", "approuve", "refuse"].includes(c.status)) return false;
        return new Date(c.deadline) < new Date();
      }).length;

      return {
        content: `**Resume general — SOS Hub Canada**\n\n` +
          `| Indicateur | Valeur |\n|---|---|\n` +
          `| Clients actifs | **${activeClients}** / ${clients.length} |\n` +
          `| Dossiers en cours | **${openCases}** / ${cases.length} |\n` +
          `| Rendez-vous aujourd'hui | **${todayAppts}** |\n` +
          `| Formulaires en attente | **${pendingForms}** |\n` +
          `| Dossiers en retard | **${overdueCasesCount}** |\n\n` +
          `**Repartition des dossiers :**\n` +
          Object.entries(CASE_STATUS_LABELS).map(([status, label]) => {
            const count = cases.filter(c => c.status === status).length;
            return count > 0 ? `- ${label} : **${count}**` : null;
          }).filter(Boolean).join("\n") +
          `\n\n**Repartition par programme :**\n` +
          (() => {
            const progCounts: Record<string, number> = {};
            cases.forEach(c => {
              const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
              const name = prog?.name || c.programId;
              progCounts[name] = (progCounts[name] || 0) + 1;
            });
            return Object.entries(progCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => `- ${name} : **${count}**`)
              .join("\n");
          })(),
        suggestions: ["Alertes urgentes", "Dossiers en retard", "Prochains rendez-vous"],
      };
    }

    // === PROGRAM DETAILS ===
    if (lowerMsg.includes("programme") && (lowerMsg.includes("quel") || lowerMsg.includes("info") || lowerMsg.includes("detail") || lowerMsg.includes("liste"))) {
      const found = IMMIGRATION_PROGRAMS.filter(p =>
        lowerMsg.includes(p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 20)) ||
        lowerMsg.includes(p.id.toLowerCase())
      );
      if (found.length > 0) {
        return {
          content: found.map(p =>
            `**${p.name}**\n\n` +
            `| | |\n|---|---|\n` +
            `| Categorie | ${PROGRAM_CATEGORIES[p.category] || p.category} |\n` +
            `| Description | ${p.description} |\n` +
            `| Frais gouvernementaux | ${p.fees.government} $ |\n` +
            `| Honoraires | ${p.fees.service} $ |\n` +
            `| Delai de traitement | ${p.processingTime} |\n` +
            `| Formulaires requis | ${p.requiredForms.length} |\n\n` +
            `**Exigences :**\n` +
            p.requirements.map(r => `- ${r}`).join("\n") +
            `\n\n**Formulaires :**\n` +
            p.requiredForms.map(fId => {
              const form = IRCC_FORMS.find(f => f.id === fId);
              return form ? `- ${form.code} — ${form.name}` : `- ${fId}`;
            }).join("\n")
          ).join("\n\n---\n\n") +
          DISCLAIMER,
          suggestions: ["Checklist documents", "Verifier admissibilite", "Autre programme"],
        };
      }

      // List all programs by category
      const byCategory: Record<string, typeof IMMIGRATION_PROGRAMS> = {};
      IMMIGRATION_PROGRAMS.forEach(p => {
        const cat = PROGRAM_CATEGORIES[p.category] || p.category;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      });

      return {
        content: `**Programmes d'immigration disponibles (${IMMIGRATION_PROGRAMS.length}) :**\n\n` +
          Object.entries(byCategory).map(([cat, progs]) =>
            `**${cat} :**\n` + progs.map(p => `- ${p.name} (${p.processingTime})`).join("\n")
          ).join("\n\n") +
          `\n\nDemandez des details sur un programme specifique.`,
        suggestions: ["Entree express", "Parrainage familial", "Programmes Quebec", "Permis de travail"],
      };
    }

    // === USEFUL LINKS ===
    if (lowerMsg.includes("lien") || lowerMsg.includes("site") || lowerMsg.includes("portail") || lowerMsg.includes("url")) {
      return {
        content: `**Liens utiles — Immigration Canada et Quebec**\n\n` +
          Object.entries(IRCC_USEFUL_LINKS).map(([label, url]) => `- **${label}** : ${url}`).join("\n") +
          `\n\n**Sites officiels :**\n` +
          `- IRCC : https://www.canada.ca/fr/immigration-refugies-citoyennete.html\n` +
          `- MIFI : https://www.quebec.ca/immigration\n` +
          `- CISR (refugies) : https://irb.gc.ca/fr/\n` +
          `- EDSC (EIMT) : https://www.canada.ca/fr/emploi-developpement-social.html`,
        suggestions: ["Delais de traitement", "Formulaires", "FAQ"],
      };
    }

    // === DEFAULT / WELCOME ===
    return {
      content: `Bonjour ${currentUser.name.split(" ")[0]}! Je suis l'assistant IA specialiste IRCC/MIFI de SOS Hub Canada. Voici comment je peux vous aider :\n\n` +
        `**Analyse et dossiers :**\n` +
        `- Resume et analyse de profils clients\n` +
        `- Recommandation de programmes d'immigration\n` +
        `- Suivi de l'etat des dossiers\n\n` +
        `**Documents et formulaires :**\n` +
        `- Checklists de documents par programme\n` +
        `- Guide des formulaires IRCC\n` +
        `- Remplissage automatique\n\n` +
        `**Informations :**\n` +
        `- Delais de traitement IRCC et MIFI\n` +
        `- FAQ immigration (en francais)\n` +
        `- Liens et ressources utiles\n\n` +
        `**Gestion :**\n` +
        `- Alertes et echeances\n` +
        `- Modeles de reponse professionnels\n` +
        `- Statistiques du cabinet\n\n` +
        `Selectionnez un contexte (client ou dossier) dans la barre laterale pour des reponses personnalisees, ou posez-moi une question!`,
      suggestions: ["Resume general", "Delais de traitement", "Alertes urgentes", "Programmes disponibles"],
    };
  };

  // ========================================================
  // SEND MESSAGE
  // ========================================================

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMessage: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(msg);
      const aiMessage: Message = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 600 + Math.random() * 1000);
  };

  const resetConversation = () => {
    setMessages([]);
    setSelectedContext("general");
    setSelectedClientId("");
    setSelectedCaseId("");
  };

  // ========================================================
  // RENDER MARKDOWN-LIKE CONTENT
  // ========================================================

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  {tableRows[0].map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-[#1B2559] border-b border-gray-200">{cell.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-1.5 border-b border-gray-100">{renderInline(cell.trim())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
    };

    const renderInline = (text: string): React.ReactNode => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Bold
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>);
          }
          parts.push(<strong key={key++} className="font-semibold text-[#1B2559]">{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          continue;
        }
        // Italic
        const italicMatch = remaining.match(/_(.+?)_/);
        if (italicMatch && italicMatch.index !== undefined) {
          if (italicMatch.index > 0) {
            parts.push(<span key={key++}>{remaining.substring(0, italicMatch.index)}</span>);
          }
          parts.push(<em key={key++} className="text-gray-500 italic">{italicMatch[1]}</em>);
          remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
          continue;
        }
        // Link
        const linkMatch = remaining.match(/(https?:\/\/[^\s)]+)/);
        if (linkMatch && linkMatch.index !== undefined) {
          if (linkMatch.index > 0) {
            parts.push(<span key={key++}>{remaining.substring(0, linkMatch.index)}</span>);
          }
          const url = linkMatch[1];
          const display = url.length > 50 ? url.substring(0, 47) + "..." : url;
          parts.push(
            <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="text-[#D4A03C] hover:underline inline-flex items-center gap-0.5">
              {display}<ExternalLink size={10} className="inline ml-0.5" />
            </a>
          );
          remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
          continue;
        }
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    lines.forEach((line, lineIdx) => {
      // Table detection
      if (line.trim().startsWith("|")) {
        if (!inTable) inTable = true;
        const cells = line.split("|").filter(c => c.trim() !== "");
        if (!line.includes("---")) {
          tableRows.push(cells);
        } else {
          tableRows.push(cells); // separator row
        }
        return;
      } else if (inTable) {
        inTable = false;
        flushTable();
      }

      // Horizontal rule
      if (line.trim() === "---") {
        elements.push(<hr key={lineIdx} className="my-3 border-gray-200" />);
        return;
      }

      // Progress bar
      if (line.match(/^[=_]+\s/)) {
        const filled = (line.match(/=/g) || []).length;
        const total = filled + (line.match(/_/g) || []).length;
        const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
        elements.push(
          <div key={lineIdx} className="my-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#22c55e" : pct >= 50 ? "#D4A03C" : "#ef4444" }} />
            </div>
            <span className="text-xs text-gray-500 mt-0.5">{line.split(/[=_]+\s/)[1]}</span>
          </div>
        );
        return;
      }

      // Empty line
      if (line.trim() === "") {
        elements.push(<div key={lineIdx} className="h-2" />);
        return;
      }

      // List items with status markers
      if (line.match(/^\s*-\s*\[(OK |-- |\.\.\.| V | S |\?\? |RETARD|URGENT|INACTIF|\d+j)\]/)) {
        const markerMatch = line.match(/\[(.+?)\]/);
        const marker = markerMatch ? markerMatch[1].trim() : "";
        const rest = line.replace(/^\s*-\s*\[.+?\]\s*/, "");
        let markerColor = "bg-gray-100 text-gray-500";
        if (marker === "OK") markerColor = "bg-green-100 text-green-700";
        else if (marker === "--") markerColor = "bg-gray-100 text-gray-400";
        else if (marker === "...") markerColor = "bg-amber-100 text-amber-700";
        else if (marker === "V") markerColor = "bg-blue-100 text-blue-700";
        else if (marker === "S") markerColor = "bg-indigo-100 text-indigo-700";
        else if (marker === "RETARD") markerColor = "bg-red-100 text-red-700";
        else if (marker === "URGENT") markerColor = "bg-orange-100 text-orange-700";
        else if (marker === "INACTIF") markerColor = "bg-yellow-100 text-yellow-700";
        else if (marker.endsWith("j")) markerColor = "bg-amber-100 text-amber-700";

        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 ml-2 my-0.5">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${markerColor} shrink-0 mt-0.5`}>{marker}</span>
            <span className="text-sm">{renderInline(rest)}</span>
          </div>
        );
        return;
      }

      // Regular list items
      if (line.match(/^\s*[-*]\s/)) {
        const indent = line.match(/^(\s*)/)?.[1].length || 0;
        const text = line.replace(/^\s*[-*]\s/, "");
        elements.push(
          <div key={lineIdx} className="flex items-start gap-2 my-0.5" style={{ marginLeft: `${Math.max(8, indent * 4)}px` }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A03C] shrink-0 mt-1.5" />
            <span className="text-sm">{renderInline(text)}</span>
          </div>
        );
        return;
      }

      // Numbered list
      if (line.match(/^\s*\d+\.\s/)) {
        const numMatch = line.match(/^(\s*)(\d+)\.\s(.*)$/);
        if (numMatch) {
          const indent = numMatch[1].length;
          const num = numMatch[2];
          const text = numMatch[3];
          elements.push(
            <div key={lineIdx} className="flex items-start gap-2 my-0.5" style={{ marginLeft: `${Math.max(8, indent * 4)}px` }}>
              <span className="text-xs font-bold text-[#1B2559] bg-[#EAEDF5] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{num}</span>
              <span className="text-sm">{renderInline(text)}</span>
            </div>
          );
          return;
        }
      }

      // Default text
      elements.push(<p key={lineIdx} className="text-sm my-0.5">{renderInline(line)}</p>);
    });

    if (inTable) {
      flushTable();
    }

    return <>{elements}</>;
  };

  // ========================================================
  // JSX
  // ========================================================

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#2A3670] rounded-xl p-4 mb-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-[#D4A03C]/40">
              <Bot size={24} className="text-[#D4A03C]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SOSIA — {isConsultantMode ? 'Consultante IA Senior' : 'Assistante IA'}
              </h1>
              <p className="text-xs text-white/70">
                {isConsultantMode
                  ? 'Experte IRCC / MIFI / EIMT — Niveau consultant senior 10+ ans'
                  : 'Assistant immigration — Recherche et outils de base'}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                isConsultantMode
                  ? 'bg-[#D4A03C]/20 text-[#D4A03C] border border-[#D4A03C]/30'
                  : 'bg-white/10 text-white/70 border border-white/20'
              }`}>
                {isConsultantMode ? 'MODE CONSULTANT' : 'MODE CLIENT'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <Shield size={12} className="text-[#D4A03C]" />
              <span className="text-[10px] font-medium text-white/80">Sources : IRCC, MIFI, CICC</span>
            </div>
            <button onClick={resetConversation} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition">
              <RotateCcw size={12} /> Nouvelle conversation
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Chat */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* LEFT SIDEBAR (30%) */}
        <div className="w-[30%] flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Context Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contexte</span>
            <div className="flex gap-1 mt-2 bg-gray-100 rounded-lg p-0.5">
              {(["general", "client", "dossier"] as const).map(ctx => (
                <button
                  key={ctx}
                  onClick={() => {
                    setSelectedContext(ctx);
                    if (ctx === "general") { setSelectedClientId(""); setSelectedCaseId(""); }
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition ${
                    selectedContext === ctx ? "bg-[#1B2559] text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {ctx === "general" ? "General" : ctx === "client" ? "Client" : "Dossier"}
                </button>
              ))}
            </div>
            {selectedContext === "client" && (
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full mt-2 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] bg-white"
              >
                <option value="">Selectionner un client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.nationality}</option>
                ))}
              </select>
            )}
            {selectedContext === "dossier" && (
              <select
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
                className="w-full mt-2 text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] bg-white"
              >
                <option value="">Selectionner un dossier...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title} — {getClientName(c.clientId)}</option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions rapides</span>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {QUICK_ACTIONS.filter(a => isConsultantMode || !a.consultantOnly).map(action => (
                <button
                  key={action.id}
                  onClick={() => handleSend(action.prompt)}
                  className={`flex items-center gap-1.5 p-2 text-left rounded-lg border text-[11px] font-medium transition hover:shadow-sm ${action.color}`}
                >
                  <action.icon size={13} className="shrink-0" />
                  <span className="leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Base Browser */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3 overflow-y-auto min-h-0">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={12} className="text-[#D4A03C]" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Base de connaissances</span>
            </div>
            <div className="space-y-1">
              {KB_SECTIONS.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    {expandedSections[section.id] ? <ChevronDown size={12} className="text-gray-400 shrink-0" /> : <ChevronRight size={12} className="text-gray-400 shrink-0" />}
                    <section.icon size={13} className="text-[#1B2559] shrink-0" />
                    <span className="text-xs font-medium text-gray-700">{section.title}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{section.items.length}</span>
                  </button>
                  {expandedSections[section.id] && (
                    <div className="ml-7 space-y-0.5 pb-1">
                      {section.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(item.prompt)}
                          className="w-full text-left text-[11px] text-gray-600 hover:text-[#1B2559] hover:bg-[#F7F3E8] px-2 py-1 rounded transition truncate"
                          title={item.label}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT INTERFACE (70%) */}
        <div className="w-[70%] flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B2559] to-[#D4A03C] flex items-center justify-center mb-5 shadow-lg">
                  <Bot size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#1B2559] mb-2">Comment puis-je vous aider?</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-lg">
                  Specialiste IRCC et MIFI, je vous assiste dans l&apos;analyse de profils, la recommandation de programmes, le suivi des dossiers et la gestion des documents d&apos;immigration.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full max-w-2xl">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleSend(action.prompt)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:bg-[#F7F3E8] transition-all group"
                    >
                      <action.icon size={20} className="text-gray-400 group-hover:text-[#D4A03C]" />
                      <span className="text-xs text-gray-600 group-hover:text-[#1B2559] font-medium text-center leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-6 max-w-md">
                  Avis : Les informations sont fournies a titre indicatif uniquement. Consultez IRCC.gc.ca ou le MIFI pour les donnees officielles.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B2559] to-[#D4A03C] flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[#1B2559] text-white rounded-br-md text-sm"
                        : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
                    }`}
                  >
                    {msg.role === "assistant" ? renderContent(msg.content) : <span className="whitespace-pre-wrap">{msg.content}</span>}
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition"
                        title="Copier la reponse"
                      >
                        {copiedId === msg.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                        {copiedId === msg.id ? "Copie!" : "Copier"}
                      </button>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                    </div>
                  )}
                  {msg.role === "user" && (
                    <span className="text-[10px] text-gray-400 mt-1 block text-right">{msg.timestamp}</span>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-[#D4A03C]/30 text-[#1B2559] hover:bg-[#F7F3E8] hover:border-[#D4A03C]/60 transition font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-[#EAEDF5] flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-[#1B2559]" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B2559] to-[#D4A03C] flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-[#D4A03C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#D4A03C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#D4A03C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-gray-400 ml-2">Analyse en cours...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="mt-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={
                selectedContext === "client" && selectedClientId
                  ? `Question sur ${getClientName(selectedClientId)}...`
                  : selectedContext === "dossier" && selectedCaseId
                    ? "Question sur ce dossier..."
                    : "Posez une question sur l'immigration, les delais, les programmes..."
              }
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] bg-white placeholder:text-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 bg-[#1B2559] text-white rounded-xl hover:bg-[#242E6B] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send size={16} />
              <span className="text-sm font-medium hidden sm:inline">Envoyer</span>
            </button>
          </div>

          {/* Footer disclaimer */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Info size={10} className="text-gray-300" />
            <span className="text-[10px] text-gray-400">
              Sources : IRCC.gc.ca | MIFI Quebec.ca | CICC | Donnees indicatives 2025-2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
