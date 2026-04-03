/**
 * etabli. Chatbot Knowledge Base
 * Complete product knowledge for the AI assistant to answer any user question.
 */

export interface BotResponse {
  keywords: string[];
  fr: string;
  en: string;
  quickActions?: { label: string; labelEn: string; href: string }[];
  followUpsFr?: string[];
  followUpsEn?: string[];
  priority?: number; // higher = matched first when multiple match
}

// ─── KNOWLEDGE BASE ─────────────────────────────────────────────────

export const KNOWLEDGE_BASE: BotResponse[] = [
  // ═══════════════════════════════════════════
  //  ARRIMA / PSTQ SIMULATOR
  // ═══════════════════════════════════════════
  {
    keywords: ["arrima", "pstq", "québec sélection", "selection quebec", "quebec selection"],
    priority: 10,
    fr: "Le **simulateur Arrima** calcule votre score au Programme de sélection des travailleurs qualifiés (PSTQ) du Québec.\n\n⚠️ **Depuis novembre 2025, le PSTQ est le SEUL programme de sélection permanente économique au Québec** (le PEQ a été fermé).\n\n**Score max:** ~800 pts\n**Score compétitif:** 590-760 pts (selon le volet)\n**Dernier tirage (mars 2026):** 2 522 invitations\n\n**4 catégories:**\n- Capital humain (âge, études, français, anglais, expérience) — max 72 pts\n- Connexion Québec (diplôme QC, expérience QC, famille) — max 190 pts\n- Marché du travail (offre d'emploi validée) — max 430 pts\n- Conjoint(e) — max 17 pts\n\n**Le levier #1:** Une offre d'emploi validée hors Montréal = **380 pts** (presque la moitié du score!)",
    en: "The **Arrima simulator** calculates your score for Quebec's Skilled Worker Selection Program (PSTQ).\n\n⚠️ **Since November 2025, the PSTQ is the ONLY economic permanent selection program in Quebec** (PEQ was closed).\n\n**Max score:** ~800 pts\n**Competitive score:** 590-760 pts (depending on stream)\n**Latest draw (March 2026):** 2,522 invitations\n\n**4 categories:**\n- Human Capital (age, education, French, English, experience) — max 72 pts\n- Quebec Connection (QC diploma, QC experience, family) — max 190 pts\n- Labour Market (validated job offer) — max 430 pts\n- Spouse — max 17 pts\n\n**#1 lever:** A validated job offer outside Montreal = **380 pts** (almost half the total score!)",
    quickActions: [{ label: "Simulateur Arrima", labelEn: "Arrima Simulator", href: "/simulateur-arrima" }],
    followUpsFr: ["Comment améliorer mon score Arrima?", "Qu'est-ce qu'une offre d'emploi validée?", "Score Arrima vs CRS?"],
    followUpsEn: ["How to improve my Arrima score?", "What's a validated job offer?", "Arrima vs CRS score?"],
  },
  {
    keywords: ["améliorer score arrima", "improve arrima", "augmenter arrima", "boost arrima", "monter score"],
    priority: 9,
    fr: "**Comment améliorer votre score Arrima:**\n\n1. **Offre d'emploi validée (VJO)** — Jusqu'à +380 pts hors MTL, +200 pts à MTL\n2. **Français oral NCLC 7+** — +16 pts direct + débloque PSTQ\n3. **S'installer hors Montréal** — +50 pts (Québec, Sherbrooke, Gatineau...)\n4. **Diplôme québécois** — +30 pts\n5. **Expérience de travail au QC** — +40 à +80 pts (1 à 3+ ans)\n6. **Profession prioritaire** — +50 pts (santé, TI, ingénierie, éducation)\n\n**Conseil:** Concentrez-vous sur le français (NCLC 7) ET une offre d'emploi — ensemble, ils valent 400+ pts!",
    en: "**How to improve your Arrima score:**\n\n1. **Validated Job Offer (VJO)** — Up to +380 pts outside MTL, +200 pts in MTL\n2. **French oral NCLC 7+** — +16 pts direct + unlocks PSTQ\n3. **Settle outside Montreal** — +50 pts (Quebec City, Sherbrooke, Gatineau...)\n4. **Quebec diploma** — +30 pts\n5. **QC work experience** — +40 to +80 pts (1 to 3+ years)\n6. **Priority profession** — +50 pts (healthcare, IT, engineering, education)\n\n**Tip:** Focus on French (NCLC 7) AND a job offer — together they're worth 400+ pts!",
    quickActions: [{ label: "Simulateur Arrima", labelEn: "Arrima Simulator", href: "/simulateur-arrima" }],
    followUpsFr: ["Quelles sont les professions prioritaires?", "Comment trouver une offre d'emploi validée?"],
    followUpsEn: ["What are priority professions?", "How to find a validated job offer?"],
  },

  // ═══════════════════════════════════════════
  //  CRS SIMULATOR / EXPRESS ENTRY
  // ═══════════════════════════════════════════
  {
    keywords: ["crs", "express entry", "entrée express", "federal", "fédéral", "comprehensive ranking"],
    priority: 10,
    fr: "Le **simulateur CRS** calcule votre score pour le système fédéral Entrée Express.\n\n**Score max:** 1 200 pts\n⚠️ **Plus aucun tirage général depuis avril 2024** — uniquement des tirages par catégorie.\n**CEC:** 515-547 pts | **Francophones:** 379-446 pts | **STEM:** ~496 pts | **Santé:** ~476 pts\n\n**Nouvelles catégories 2026:** Médecins, gestionnaires seniors, chercheurs (avec exp. canadienne), militaires qualifiés\n\n**4 catégories de points:**\n- Capital humain (âge, études, langues, expérience) — max 500 pts\n- Facteurs conjoint(e) — max 40 pts\n- Transférabilité des compétences — max 100 pts\n- Points additionnels — max 600 pts\n\n**Le levier #1:** Nomination provinciale (PN) = **+600 pts** (invitation garantie!)\n**Levier #2:** Français NCLC 7+ toutes compétences = **+50 pts** bonus\n⚠️ **Points offre d'emploi retirés** en mars 2025 (plus de +50/+200 pts)",
    en: "The **CRS simulator** calculates your score for the federal Express Entry system.\n\n**Max score:** 1,200 pts\n⚠️ **No more general draws since April 2024** — only category-based draws.\n**CEC:** 515-547 pts | **Francophone:** 379-446 pts | **STEM:** ~496 pts | **Healthcare:** ~476 pts\n\n**New 2026 categories:** Physicians, senior managers, researchers (with Canadian experience), skilled military recruits\n\n**4 point categories:**\n- Core/Human Capital (age, education, languages, experience) — max 500 pts\n- Spouse factors — max 40 pts\n- Skill Transferability — max 100 pts\n- Additional points — max 600 pts\n\n**#1 lever:** Provincial Nomination (PN) = **+600 pts** (guaranteed invitation!)\n**#2 lever:** French NCLC 7+ all abilities = **+50 pts** bonus\n⚠️ **Job offer points removed** in March 2025 (no more +50/+200 pts)",
    quickActions: [{ label: "Simulateur CRS", labelEn: "CRS Simulator", href: "/simulateur-crs" }],
    followUpsFr: ["Comment obtenir une nomination provinciale?", "Améliorer mon CRS rapidement?", "Différence CRS vs Arrima?"],
    followUpsEn: ["How to get a provincial nomination?", "Improve my CRS quickly?", "CRS vs Arrima difference?"],
  },
  {
    keywords: ["différence crs arrima", "crs vs arrima", "arrima vs crs", "quebec vs federal", "federal vs quebec"],
    priority: 9,
    fr: "**CRS (Fédéral) vs Arrima (Québec):**\n\n| | CRS | Arrima |\n|---|---|---|\n| **Juridiction** | Canada (fédéral) | Québec |\n| **Score max** | 1 200 pts | ~800 pts |\n| **Score compétitif** | 470-560 | 590-620 |\n| **Levier #1** | Nomination provinciale (+600) | Offre emploi validée (+380) |\n| **Français** | Bonus +50 pts | Obligatoire NCLC 7 |\n| **Résidence** | Toute province | Québec seulement |\n\n**Conseil:** Le Québec est souvent plus accessible pour les francophones grâce aux tirages dédiés CRS francophones (380-420 pts) et au programme Arrima qui valorise fortement le français.",
    en: "**CRS (Federal) vs Arrima (Quebec):**\n\n| | CRS | Arrima |\n|---|---|---|\n| **Jurisdiction** | Canada (federal) | Quebec |\n| **Max score** | 1,200 pts | ~800 pts |\n| **Competitive score** | 470-560 | 590-620 |\n| **#1 lever** | Provincial nomination (+600) | Validated job offer (+380) |\n| **French** | Bonus +50 pts | Required NCLC 7 |\n| **Residence** | Any province | Quebec only |\n\n**Tip:** Quebec is often more accessible for francophones thanks to dedicated CRS francophone draws (380-420 pts) and the Arrima program which highly values French.",
    quickActions: [
      { label: "Simulateur CRS", labelEn: "CRS Simulator", href: "/simulateur-crs" },
      { label: "Simulateur Arrima", labelEn: "Arrima Simulator", href: "/simulateur-arrima" },
    ],
  },

  // ═══════════════════════════════════════════
  //  PRICING / TARIFS
  // ═══════════════════════════════════════════
  {
    keywords: ["tarif", "prix", "cost", "price", "pricing", "forfait", "plan", "abonnement", "subscription", "combien", "how much"],
    priority: 10,
    fr: "**Nos forfaits:**\n\n**Gratuit** — 0$/mois\n- Parcours 6 piliers, checklists de base\n- Tuteur AI (5 msg/jour), score CRS de base\n\n**Standard** — à partir de **34,99$/mois** (12 mois)\n- AI illimitée 24/7, rapport CRS complet\n- Éligibilité 10 programmes, tuteur français illimité\n- CV canadien AI, simulation entrevue\n\n**Premium** — à partir de **89,99$/mois** (12 mois)\n- Tout Standard + cours TCF/TEF live\n- 10% rabais marketplace, consultation gratuite 30 min\n- Rendez-vous bureau Montréal, conseiller dédié\n- Support prioritaire (<4h)\n\n**Meilleure valeur:** Premium 12 mois = économisez jusqu'à 60%!",
    en: "**Our plans:**\n\n**Free** — $0/month\n- 6-pillar pathway, basic checklists\n- AI tutor (5 msg/day), basic CRS score\n\n**Standard** — from **$34.99/month** (12 months)\n- Unlimited AI 24/7, full CRS report\n- 10-program eligibility, unlimited French tutor\n- Canadian résumé AI, interview simulation\n\n**Premium** — from **$89.99/month** (12 months)\n- All Standard + live TCF/TEF classes\n- 10% marketplace discount, free 30-min consultation\n- Montreal office meetings, dedicated advisor\n- Priority support (<4h)\n\n**Best value:** Premium 12 months = save up to 60%!",
    quickActions: [{ label: "Voir les tarifs", labelEn: "View Pricing", href: "/tarifs" }],
    followUpsFr: ["Différence Standard vs Premium?", "Y a-t-il un essai gratuit?", "Cours TCF/TEF live?"],
    followUpsEn: ["Standard vs Premium difference?", "Is there a free trial?", "Live TCF/TEF classes?"],
  },
  {
    keywords: ["standard vs premium", "différence standard premium", "premium vs standard", "standard premium difference"],
    priority: 9,
    fr: "**Standard vs Premium:**\n\n**Ce que Premium ajoute:**\n- **Cours TCF/TEF live** avec instructeurs (valeur 499$+)\n- **10% rabais** sur tous les professionnels du marketplace\n- **1 consultation gratuite** de 30 min avec un professionnel\n- **Bureau Montréal** — rendez-vous en personne\n- **Conseiller dédié** pour votre parcours\n- **Support prioritaire** — réponse en <4h\n- **Scénarios CRS what-if** — simulez différentes options\n- **Webinaires experts** mensuels\n- **Certificat de complétion**\n- **Plan d'action AI mensuel** personnalisé\n\n**Notre recommandation:** Si vous préparez le TCF/TEF, le Premium est le meilleur investissement. Les cours live seuls valent 499$+.",
    en: "**Standard vs Premium:**\n\n**What Premium adds:**\n- **Live TCF/TEF classes** with instructors (worth $499+)\n- **10% discount** on all marketplace professionals\n- **1 free consultation** (30 min) with a professional\n- **Montreal office** — in-person meetings\n- **Dedicated advisor** for your journey\n- **Priority support** — response in <4h\n- **CRS what-if scenarios** — simulate different options\n- **Monthly expert webinars**\n- **Completion certificate**\n- **Monthly AI action plan** personalized\n\n**Our recommendation:** If you're preparing for TCF/TEF, Premium is the best investment. Live classes alone are worth $499+.",
    quickActions: [{ label: "Voir les tarifs", labelEn: "View Pricing", href: "/tarifs" }],
  },
  {
    keywords: ["essai gratuit", "free trial", "tester", "try", "demo", "gratuit"],
    priority: 8,
    fr: "**Le plan Gratuit** est notre essai permanent!\n\nIl inclut:\n- Parcours 6 piliers complet\n- Checklists de base\n- Tuteur AI (5 messages/jour)\n- Score CRS de base\n- Marketplace (consultation seulement)\n\nVous pouvez aussi acheter le **Rapport CRS complet** à 49,99$ sans abonnement.\n\nPas de carte de crédit requise pour commencer!",
    en: "**The Free plan** is our permanent trial!\n\nIt includes:\n- Full 6-pillar pathway\n- Basic checklists\n- AI tutor (5 messages/day)\n- Basic CRS score\n- Marketplace (browse only)\n\nYou can also buy the **Full CRS Report** for $49.99 without a subscription.\n\nNo credit card required to get started!",
    quickActions: [{ label: "Commencer gratuitement", labelEn: "Start for Free", href: "/portail/inscription" }],
  },

  // ═══════════════════════════════════════════
  //  FRANCISATION / FRENCH COURSES
  // ═══════════════════════════════════════════
  {
    keywords: ["français", "french", "francisation", "cours", "course", "apprendre", "learn"],
    priority: 8,
    fr: "**Notre module de francisation** est conçu pour l'immigration!\n\n**390+ exercices** couvrant:\n- Compréhension orale (63 exercices + audio TTS)\n- Compréhension écrite (38 exercices)\n- Grammaire interactive (65+ exercices)\n- Vocabulaire d'établissement (100 mots clés)\n- Dictée (12 niveaux A1-C1)\n- Expression orale et écrite\n- Prononciation (voyelles nasales, R, liaisons)\n\n**Outils uniques:**\n- Test de placement CECR\n- Révision espacée (Leitner SRS)\n- Examens blancs TCF/TEF complets\n- Assistant AI francisation\n- Tableau de bord avec streaks et XP\n\n**Pourquoi c'est différent:** Vocabulaire réel d'établissement (bail, RAMQ, entrevue...), pas du français générique!",
    en: "**Our francisation module** is designed for immigration!\n\n**390+ exercises** covering:\n- Listening comprehension (63 exercises + TTS audio)\n- Reading comprehension (38 exercises)\n- Interactive grammar (65+ exercises)\n- Settlement vocabulary (100 key words)\n- Dictation (12 levels A1-C1)\n- Oral and written expression\n- Pronunciation (nasal vowels, R, liaisons)\n\n**Unique tools:**\n- CEFR placement test\n- Spaced review (Leitner SRS)\n- Full TCF/TEF mock exams\n- AI French assistant\n- Dashboard with streaks and XP\n\n**Why it's different:** Real settlement vocabulary (lease, RAMQ, interview...), not generic French!",
    quickActions: [
      { label: "Cours de français", labelEn: "French Courses", href: "/francisation" },
      { label: "Test de placement", labelEn: "Placement Test", href: "/francisation/placement" },
    ],
    followUpsFr: ["Combien de temps pour le NCLC 7?", "TCF ou TEF?", "Quel est mon niveau?"],
    followUpsEn: ["How long to reach NCLC 7?", "TCF or TEF?", "What's my level?"],
  },
  {
    keywords: ["tcf", "tef", "examen", "exam", "test langue", "language test"],
    priority: 9,
    fr: "**TCF Canada vs TEF Canada:**\n\n**TCF Canada** (France Éducation International)\n- Coût: ~300-400$ CAD\n- 4 épreuves: CO (39Q/35min), CE (39Q/60min), EO (3 tâches/12min), EE (3 tâches/60min)\n- Centres: Montréal, Québec, Ottawa\n\n**TEF Canada** (CCI Paris Île-de-France)\n- Coût: ~350-450$ CAD\n- 4 épreuves: CO (60Q/40min), CE (50Q/60min), EO (2 sections/15min), EE (2 sections/60min)\n- Centres: McGill, Alliance Française\n\n**Lequel choisir?** Les deux sont acceptés pour l'immigration. Le TCF est souvent considéré légèrement plus facile pour la compréhension. Le TEF est souvent mieux pour l'expression.\n\n**Sur etabli:** Examens blancs complets pour les deux formats!",
    en: "**TCF Canada vs TEF Canada:**\n\n**TCF Canada** (France Éducation International)\n- Cost: ~$300-400 CAD\n- 4 components: CO (39Q/35min), CE (39Q/60min), EO (3 tasks/12min), EE (3 tasks/60min)\n- Centers: Montreal, Quebec, Ottawa\n\n**TEF Canada** (CCI Paris Île-de-France)\n- Cost: ~$350-450 CAD\n- 4 components: CO (60Q/40min), CE (50Q/60min), EO (2 sections/15min), EE (2 sections/60min)\n- Centers: McGill, Alliance Française\n\n**Which to choose?** Both are accepted for immigration. TCF is often considered slightly easier for comprehension. TEF is often better for expression.\n\n**On etabli:** Full mock exams for both formats!",
    quickActions: [{ label: "Examen blanc", labelEn: "Mock Exam", href: "/francisation/examen-blanc" }],
    followUpsFr: ["Préparer le TCF en combien de temps?", "Cours TCF/TEF live?"],
    followUpsEn: ["How long to prepare for TCF?", "Live TCF/TEF classes?"],
  },
  {
    keywords: ["nclc", "clb", "niveau", "level", "combien temps", "how long", "durée", "duration"],
    priority: 8,
    fr: "**Niveaux NCLC et temps estimé pour NCLC 7:**\n\n- **A1 (Débutant)** → NCLC 7: ~18 mois (15 min/jour)\n- **A2 (Élémentaire)** → NCLC 7: ~12 mois\n- **B1 (Intermédiaire)** → NCLC 7: ~6 mois\n- **B2 (Avancé)** → NCLC 7: ~3 mois\n- **C1 (Expert)** → Déjà atteint!\n\n**Pourquoi NCLC 7?**\n- Requis pour le PSTQ (Arrima)\n- +50 pts bonus CRS (Entrée Express)\n- Minimum pour le CAQ après 3 ans\n\n**Conseil:** Avec 30 min/jour au lieu de 15, divisez ces temps par 2!\n\nFaites notre **test de placement** pour connaître votre niveau exact.",
    en: "**NCLC levels and estimated time to NCLC 7:**\n\n- **A1 (Beginner)** → NCLC 7: ~18 months (15 min/day)\n- **A2 (Elementary)** → NCLC 7: ~12 months\n- **B1 (Intermediate)** → NCLC 7: ~6 months\n- **B2 (Advanced)** → NCLC 7: ~3 months\n- **C1 (Expert)** → Already there!\n\n**Why NCLC 7?**\n- Required for PSTQ (Arrima)\n- +50 pts CRS bonus (Express Entry)\n- Minimum for CAQ after 3 years\n\n**Tip:** With 30 min/day instead of 15, cut these times in half!\n\nTake our **placement test** to know your exact level.",
    quickActions: [{ label: "Test de placement", labelEn: "Placement Test", href: "/francisation/placement" }],
  },
  {
    keywords: ["cours live", "live class", "tcf live", "tef live", "instructeur", "instructor", "zoom"],
    priority: 9,
    fr: "**Cours TCF/TEF live** (inclus dans Premium):\n\n1. **Intensif** — 499$ | 4 semaines | 20h live | 1 examen blanc\n2. **Standard** — 799$ | 8 semaines | 40h live | 3 examens blancs\n3. **Hybride QC** — 1 199$ | 12 semaines | 60h live + présentiel MTL | 5 examens blancs\n4. **Hybride Canada** — 1 499$ | 16 semaines | 80h live + présentiel | Examens illimités | Garantie de réussite\n\nTous les cours sont en mini-groupes via Zoom avec des instructeurs certifiés.\n\n**Avec le forfait Premium**, ces cours sont **inclus** dans votre abonnement!",
    en: "**Live TCF/TEF classes** (included in Premium):\n\n1. **Intensive** — $499 | 4 weeks | 20h live | 1 mock exam\n2. **Standard** — $799 | 8 weeks | 40h live | 3 mock exams\n3. **Hybrid QC** — $1,199 | 12 weeks | 60h live + in-person MTL | 5 mock exams\n4. **Hybrid Canada** — $1,499 | 16 weeks | 80h live + in-person | Unlimited mock exams | Success guarantee\n\nAll classes are mini-groups via Zoom with certified instructors.\n\n**With Premium plan**, these classes are **included** in your subscription!",
    quickActions: [{ label: "Voir les tarifs", labelEn: "View Pricing", href: "/tarifs" }],
  },

  // ═══════════════════════════════════════════
  //  MARKETPLACE
  // ═══════════════════════════════════════════
  {
    keywords: ["marketplace", "professionnel", "professional", "avocat", "lawyer", "rcic", "consultant", "notaire", "notary"],
    priority: 8,
    fr: "**Le Marketplace etabli.** connecte les nouveaux arrivants avec des **professionnels vérifiés:**\n\n- **Avocats en immigration** (vérifiés Barreau du Québec)\n- **Consultants RCIC** (vérifiés registre CICC)\n- **Notaires** (Chambre des notaires)\n- **Traducteurs** agréés\n\n**Pourquoi nous choisir:**\n- Tous les profils vérifiés via registres publics\n- Notes et avis (4.6 à 4.9/5 en moyenne)\n- Taux de succès affichés (94-97%)\n- Temps de réponse garanti (<1h à <24h)\n- Tarifs: 85$ à 300$/heure\n- Filtres: langue, spécialité, ville\n\n**Premium:** 10% de rabais sur tous les professionnels!",
    en: "**The etabli. Marketplace** connects newcomers with **verified professionals:**\n\n- **Immigration lawyers** (verified Quebec Bar)\n- **RCIC consultants** (verified CICC registry)\n- **Notaries** (Chamber of Notaries)\n- **Certified translators**\n\n**Why choose us:**\n- All profiles verified via public registries\n- Ratings and reviews (4.6 to 4.9/5 average)\n- Success rates displayed (94-97%)\n- Guaranteed response time (<1h to <24h)\n- Rates: $85 to $300/hour\n- Filters: language, specialty, city\n\n**Premium:** 10% discount on all professionals!",
    quickActions: [{ label: "Marketplace", labelEn: "Marketplace", href: "/marketplace" }],
    followUpsFr: ["Comment choisir un consultant?", "Combien coûte un avocat?"],
    followUpsEn: ["How to choose a consultant?", "How much does a lawyer cost?"],
  },

  // ═══════════════════════════════════════════
  //  SETTLEMENT GUIDE / 6 PILLARS
  // ═══════════════════════════════════════════
  {
    keywords: ["guide", "établissement", "settlement", "installation", "pilier", "pillar", "arrivée", "arrival"],
    priority: 7,
    fr: "**Le Guide d'établissement** couvre vos **6 piliers** essentiels:\n\n1. **Logement** — Guide locataire QC, droits TAL, quartiers MTL, détection arnaques\n2. **Emploi** — CV canadien AI, prep entrevue, offres vérifiées\n3. **Francisation** — 390+ exercices, tuteur AI, cours live TCF/TEF\n4. **Administration** — NAS, RAMQ, permis conduire, impôts, banque\n5. **Vie quotidienne** — Transport STM, hiver, santé, culture\n6. **Parcours immigration** — Simulateurs CRS+Arrima, 10 programmes, marketplace pros\n\nChaque pilier inclut des **checklists personnalisées** et un assistant AI dédié!",
    en: "**The Settlement Guide** covers your **6 essential pillars:**\n\n1. **Housing** — QC tenant guide, TAL rights, MTL neighborhoods, scam detection\n2. **Employment** — AI Canadian résumé, interview prep, verified job offers\n3. **French** — 390+ exercises, AI tutor, live TCF/TEF classes\n4. **Administration** — SIN, RAMQ, driver's license, taxes, banking\n5. **Daily Life** — STM transit, winter prep, healthcare, culture\n6. **Immigration Path** — CRS+Arrima simulators, 10 programs, pro marketplace\n\nEach pillar includes **personalized checklists** and a dedicated AI assistant!",
    quickActions: [{ label: "Guide d'établissement", labelEn: "Settlement Guide", href: "/guide-etablissement" }],
  },
  {
    keywords: ["logement", "housing", "appartement", "apartment", "bail", "lease", "loyer", "rent", "déménagement", "moving"],
    priority: 7,
    fr: "**Logement au Québec:**\n\n**Le bail québécois:**\n- Durée standard: 1er juillet au 30 juin\n- Le 1er juillet = jour de déménagement au QC!\n- Le propriétaire ne peut pas augmenter le loyer sans limites\n- La Régie du logement (TAL) protège vos droits\n\n**Types d'appartements:**\n- 3½ = studio/1 chambre (salon, cuisine, chambre, SDB)\n- 4½ = 2 chambres\n- 5½ = 3 chambres\n\n**Prix moyens à Montréal (2024):**\n- 3½: 900-1 400$/mois\n- 4½: 1 200-1 800$/mois\n- 5½: 1 500-2 200$/mois\n\n**Attention aux arnaques!** Notre AI détecte les annonces suspectes sur Kijiji/Marketplace.",
    en: "**Housing in Quebec:**\n\n**Quebec lease:**\n- Standard term: July 1 to June 30\n- July 1 = Moving Day in QC!\n- Landlord cannot raise rent without limits\n- The Régie du logement (TAL) protects your rights\n\n**Apartment types:**\n- 3½ = studio/1 bedroom (living room, kitchen, bedroom, bathroom)\n- 4½ = 2 bedrooms\n- 5½ = 3 bedrooms\n\n**Average prices in Montreal (2024):**\n- 3½: $900-1,400/month\n- 4½: $1,200-1,800/month\n- 5½: $1,500-2,200/month\n\n**Watch for scams!** Our AI detects suspicious listings on Kijiji/Marketplace.",
    quickActions: [{ label: "Guide logement", labelEn: "Housing Guide", href: "/guide-etablissement" }],
  },
  {
    keywords: ["emploi", "job", "travail", "work", "cv", "résumé", "resume", "entrevue", "interview", "carrière", "career"],
    priority: 7,
    fr: "**Emploi au Québec:**\n\n**CV format canadien:**\n- Pas de photo, pas d'âge, pas d'état civil\n- Maximum 2 pages\n- Expérience en format inversé (récent en premier)\n- Notre AI génère votre CV automatiquement!\n\n**Recherche d'emploi:**\n- Indeed.ca, LinkedIn, Jobillico (QC)\n- Guichet-Emplois (gouvernement)\n- Notre marketplace de professionnels\n\n**Simulation d'entrevue AI:**\n- Questions fréquentes adaptées au QC\n- Feedback en temps réel\n- Vocabulaire professionnel français\n\n**Le saviez-vous?** Au Québec, on dit \"entrevue\" (pas \"interview\") et \"courriel\" (pas \"email\")!",
    en: "**Employment in Quebec:**\n\n**Canadian résumé format:**\n- No photo, no age, no marital status\n- Maximum 2 pages\n- Experience in reverse chronological order\n- Our AI generates your résumé automatically!\n\n**Job search:**\n- Indeed.ca, LinkedIn, Jobillico (QC)\n- Job Bank (government)\n- Our professional marketplace\n\n**AI interview simulation:**\n- Common questions adapted to QC\n- Real-time feedback\n- Professional French vocabulary\n\n**Did you know?** In Quebec, they say \"entrevue\" (not \"interview\") and \"courriel\" (not \"email\")!",
    quickActions: [{ label: "Guide emploi", labelEn: "Employment Guide", href: "/guide-etablissement" }],
  },
  {
    keywords: ["nas", "sin", "ramq", "carte soleil", "health card", "administration", "impôt", "tax", "banque", "bank", "permis conduire", "driver"],
    priority: 7,
    fr: "**Démarches administratives au Québec:**\n\n**1. NAS (Numéro d'assurance sociale)**\n- Demande en ligne ou en personne (Service Canada)\n- Nécessaire pour travailler\n\n**2. RAMQ (Carte d'assurance maladie)**\n- Demande dès l'arrivée\n- Délai de carence: 3 mois (prenez une assurance privée!)\n\n**3. Permis de conduire**\n- Échange possible selon votre pays d'origine\n- Sinon: examen théorique + pratique (SAAQ)\n\n**4. Compte bancaire**\n- Ouvrir rapidement (Desjardins, RBC, TD...)\n- Pack nouvel arrivant disponible dans la plupart des banques\n\n**5. Déclaration d'impôts**\n- Obligatoire même la première année partielle\n- Fédéral (ARC) + Provincial (Revenu Québec)\n\nNotre AI vous guide étape par étape avec des checklists personnalisées!",
    en: "**Administrative steps in Quebec:**\n\n**1. SIN (Social Insurance Number)**\n- Apply online or in person (Service Canada)\n- Required to work\n\n**2. RAMQ (Health Insurance Card)**\n- Apply upon arrival\n- Waiting period: 3 months (get private insurance!)\n\n**3. Driver's License**\n- Exchange possible depending on your home country\n- Otherwise: theory + road test (SAAQ)\n\n**4. Bank Account**\n- Open quickly (Desjardins, RBC, TD...)\n- Newcomer package available at most banks\n\n**5. Tax Return**\n- Mandatory even for first partial year\n- Federal (CRA) + Provincial (Revenu Québec)\n\nOur AI guides you step by step with personalized checklists!",
    quickActions: [{ label: "Guide admin", labelEn: "Admin Guide", href: "/guide-etablissement" }],
  },

  // ═══════════════════════════════════════════
  //  IMMIGRATION PROGRAMS
  // ═══════════════════════════════════════════
  {
    keywords: ["programme", "program", "immigration", "voie", "pathway", "résidence permanente", "permanent residence", "rp", "pr"],
    priority: 8,
    fr: "**10+ programmes d'immigration couverts (mis à jour 2026):**\n\n**Fédéral (Entrée Express):**\n1. Travailleurs qualifiés fédéral (FSW)\n2. Métiers qualifiés fédéral (FST)\n3. Catégorie expérience canadienne (CEC)\n4. Mobilité francophone\n\n**Québec:**\n5. PSTQ via Arrima (seul programme de sélection permanente depuis nov. 2025)\n6. ~~PEQ~~ — FERMÉ depuis le 19 novembre 2025\n\n**Autres:**\n7. Parrainage familial (conjoint, parents)\n8. Programme des candidats des provinces (PNP)\n9. Permis de travail (EIMT + dispenses)\n10. Permis d'études + PTPD\n\nNotre simulateur évalue votre éligibilité et recommande le meilleur programme pour votre profil!",
    en: "**10+ immigration programs covered (updated 2026):**\n\n**Federal (Express Entry):**\n1. Federal Skilled Worker (FSW)\n2. Federal Skilled Trades (FST)\n3. Canadian Experience Class (CEC)\n4. Francophone Mobility\n\n**Quebec:**\n5. PSTQ via Arrima (sole permanent selection program since Nov. 2025)\n6. ~~PEQ~~ — CLOSED since November 19, 2025\n\n**Other:**\n7. Family Sponsorship (spouse, parents)\n8. Provincial Nominee Program (PNP)\n9. Work Permits (LMIA + exemptions)\n10. Study Permits + PGWP\n\nOur simulator evaluates your eligibility and recommends the best program for your profile!",
    quickActions: [{ label: "Parcours immigration", labelEn: "Immigration Paths", href: "/parcours" }],
    followUpsFr: ["Quel programme me convient?", "PEQ vs PSTQ?"],
    followUpsEn: ["Which program suits me?", "PEQ vs PSTQ?"],
  },
  {
    keywords: ["peq", "programme expérience", "experience program", "quebec experience"],
    priority: 9,
    fr: "⚠️ **PEQ — PROGRAMME FERMÉ DEPUIS LE 19 NOVEMBRE 2025**\n\nLe Programme de l'expérience québécoise (PEQ) a officiellement pris fin. Les deux volets (diplômés et travailleurs) sont fermés.\n\n**Les demandes déjà soumises** continuent d'être traitées par le MIFI.\n\n**Que faire maintenant?**\n- Les anciens candidats PEQ peuvent déclarer leur intérêt sur **Arrima** pour le **PSTQ**\n- Le PSTQ est désormais le **seul programme** de sélection permanente économique au Québec\n- Votre français NCLC 7 reste un atout majeur pour le PSTQ!\n\n**Conseil:** Contactez-nous pour évaluer votre profil PSTQ et maximiser vos chances.",
    en: "⚠️ **PEQ — PROGRAM CLOSED SINCE NOVEMBER 19, 2025**\n\nThe Quebec Experience Program (PEQ) has officially ended. Both streams (graduates and workers) are closed.\n\n**Applications already submitted** continue to be processed by MIFI.\n\n**What to do now?**\n- Former PEQ candidates can declare their interest on **Arrima** for the **PSTQ**\n- The PSTQ is now the **only program** for economic permanent selection in Quebec\n- Your French NCLC 7 remains a major asset for the PSTQ!\n\n**Tip:** Contact us to evaluate your PSTQ profile and maximize your chances.",
    quickActions: [{ label: "Cours de français", labelEn: "French Courses", href: "/francisation" }],
  },
  {
    keywords: ["citoyenneté", "citizenship", "citoyen", "citizen", "passeport", "passport"],
    priority: 7,
    fr: "**Citoyenneté canadienne:**\n\n**Conditions:**\n- Résident permanent depuis 3+ ans (1 095 jours sur 5 ans)\n- Déclarations d'impôts produites\n- Français OU anglais NCLC 4+ (18-54 ans)\n- Réussir l'examen de citoyenneté (Découvrir le Canada)\n\n**Examen:**\n- 20 questions à choix multiples\n- Sujets: histoire, géographie, droits, responsabilités\n- Note de passage: 75% (15/20)\n\n**Délai de traitement:** ~12-18 mois après la demande\n\n**Le saviez-vous?** Le Québec valorise les candidats francophones — votre français est un atout pour toute la démarche!",
    en: "**Canadian Citizenship:**\n\n**Requirements:**\n- Permanent resident for 3+ years (1,095 days over 5 years)\n- Tax returns filed\n- French OR English NCLC 4+ (ages 18-54)\n- Pass citizenship test (Discover Canada)\n\n**Test:**\n- 20 multiple-choice questions\n- Topics: history, geography, rights, responsibilities\n- Passing grade: 75% (15/20)\n\n**Processing time:** ~12-18 months after application\n\n**Did you know?** Quebec values francophone candidates — your French is an asset throughout the entire process!",
  },

  // ═══════════════════════════════════════════
  //  ABOUT ETABLI / GENERAL
  // ═══════════════════════════════════════════
  {
    keywords: ["etabli", "qui êtes", "who are", "about", "à propos", "c'est quoi", "what is"],
    priority: 6,
    fr: "**etabli.** est la plateforme complète d'établissement et de francisation pour les nouveaux arrivants au Québec.\n\n**Ce qu'on offre:**\n- 2 simulateurs (CRS + Arrima)\n- 390+ exercices de français\n- Marketplace de professionnels vérifiés\n- Guide d'établissement 6 piliers\n- Assistant AI Claude 24/7\n- Cours TCF/TEF live\n\n**Notre mission:** Rendre le parcours d'immigration simple, clair et motivant.\n\n**Nos chiffres:** 105K+ arrivants/an au QC, 10 programmes couverts, 55+ pages de contenu.",
    en: "**etabli.** is the complete settlement and francisation platform for newcomers to Quebec.\n\n**What we offer:**\n- 2 simulators (CRS + Arrima)\n- 390+ French exercises\n- Marketplace of verified professionals\n- 6-pillar settlement guide\n- Claude AI assistant 24/7\n- Live TCF/TEF classes\n\n**Our mission:** Make the immigration journey simple, clear, and motivating.\n\n**Our numbers:** 105K+ newcomers/year in QC, 10 programs covered, 55+ pages of content.",
  },
  {
    keywords: ["inscription", "register", "signup", "sign up", "compte", "account", "créer", "create"],
    priority: 6,
    fr: "**Créer votre compte:**\n\n1. Allez sur le **Portail** etabli.\n2. Choisissez votre forfait (Gratuit, Standard ou Premium)\n3. Complétez l'**onboarding** en 4 étapes (profil, niveau, objectifs, plan)\n4. Recevez votre parcours personnalisé!\n\n**Le plan Gratuit** ne nécessite aucune carte de crédit.",
    en: "**Create your account:**\n\n1. Go to the etabli. **Portal**\n2. Choose your plan (Free, Standard, or Premium)\n3. Complete the **onboarding** in 4 steps (profile, level, goals, plan)\n4. Get your personalized pathway!\n\n**The Free plan** requires no credit card.",
    quickActions: [
      { label: "S'inscrire", labelEn: "Sign Up", href: "/portail/inscription" },
      { label: "Onboarding", labelEn: "Onboarding", href: "/onboarding" },
    ],
  },
  {
    keywords: ["partenaire", "partner", "employeur", "employer", "organisme", "organization"],
    priority: 6,
    fr: "**Devenir partenaire etabli.:**\n\n**Employeurs:**\n- Publiez des offres gratuitement\n- Accès au bassin LMIA de candidats internationaux\n\n**Professionnels (avocats, RCIC, notaires):**\n- Essentiel: 299$/mois (10% commission)\n- Pro: 599$/mois (7% commission) — Le plus populaire\n- Premium: 999$/mois (5% commission) + bureau MTL\n\n**Organismes communautaires:**\n- Inscription 100% gratuite\n- Visibilité dans le répertoire\n\nTous les partenaires sont vérifiés et la plateforme est entièrement bilingue.",
    en: "**Become an etabli. partner:**\n\n**Employers:**\n- Post job offers for free\n- Access LMIA international talent pool\n\n**Professionals (lawyers, RCIC, notaries):**\n- Essential: $299/month (10% commission)\n- Pro: $599/month (7% commission) — Most popular\n- Premium: $999/month (5% commission) + MTL office\n\n**Community organizations:**\n- 100% free registration\n- Visibility in directory\n\nAll partners are verified and the platform is fully bilingual.",
    quickActions: [{ label: "Portail partenaire", labelEn: "Partner Portal", href: "/portail" }],
  },

  // ═══════════════════════════════════════════
  //  GREETINGS / HELP / CATCH-ALL
  // ═══════════════════════════════════════════
  {
    keywords: ["bonjour", "hello", "hi", "salut", "allo", "hey", "bonsoir"],
    priority: 3,
    fr: "Bonjour! Je suis l'assistant etabli. Je connais tout sur nos services:\n\n- **Simulateurs** CRS et Arrima\n- **Cours de français** (390+ exercices)\n- **Marketplace** de professionnels vérifiés\n- **Guide d'établissement** (6 piliers)\n- **Tarifs** et forfaits\n\nQue souhaitez-vous savoir?",
    en: "Hello! I'm the etabli. assistant. I know everything about our services:\n\n- **Simulators** CRS and Arrima\n- **French courses** (390+ exercises)\n- **Marketplace** of verified professionals\n- **Settlement guide** (6 pillars)\n- **Pricing** and plans\n\nWhat would you like to know?",
    followUpsFr: ["Quels sont vos tarifs?", "Comment fonctionne Arrima?", "Par où commencer?"],
    followUpsEn: ["What are your prices?", "How does Arrima work?", "Where to start?"],
  },
  {
    keywords: ["merci", "thank", "thanks"],
    priority: 3,
    fr: "Bienvenue! (C'est la façon québécoise de dire \"de rien\"!)\n\nN'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider!",
    en: "You're welcome!\n\nFeel free to ask if you have more questions. I'm here to help!",
    followUpsFr: ["Voir les tarifs", "Commencer les cours de français", "Simuler mon score"],
    followUpsEn: ["View pricing", "Start French courses", "Simulate my score"],
  },
  {
    keywords: ["aide", "help", "question", "comment", "how"],
    priority: 2,
    fr: "Je peux vous aider avec:\n\n- **Score CRS/Arrima** — Comment améliorer, comprendre le système\n- **Cours de français** — Niveaux, TCF/TEF, temps estimé\n- **Tarifs** — Gratuit vs Standard vs Premium\n- **Marketplace** — Trouver un avocat, consultant RCIC\n- **Logement** — Bail, quartiers, prix\n- **Emploi** — CV canadien, entrevues, recherche\n- **Administration** — NAS, RAMQ, impôts, permis\n- **Programmes d'immigration** — 10 programmes, PEQ, PSTQ\n\nPosez votre question!",
    en: "I can help you with:\n\n- **CRS/Arrima score** — How to improve, understand the system\n- **French courses** — Levels, TCF/TEF, estimated time\n- **Pricing** — Free vs Standard vs Premium\n- **Marketplace** — Find a lawyer, RCIC consultant\n- **Housing** — Lease, neighborhoods, prices\n- **Employment** — Canadian résumé, interviews, job search\n- **Administration** — SIN, RAMQ, taxes, license\n- **Immigration programs** — 10 programs, PEQ, PSTQ\n\nAsk your question!",
  },
];

// ─── MATCHER FUNCTION ─────────────────────────────────────────────

export function findBestResponse(userText: string, isFr: boolean): {
  text: string;
  quickActions?: { label: string; href: string }[];
  followUps?: { label: string; query: string }[];
} {
  const lower = userText.toLowerCase();
  let bestMatch: BotResponse | null = null;
  let bestScore = 0;
  let bestPriority = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) score++;
    }
    const priority = entry.priority || 1;
    // Prefer higher score, then higher priority
    if (score > bestScore || (score === bestScore && priority > bestPriority)) {
      if (score > 0) {
        bestScore = score;
        bestPriority = priority;
        bestMatch = entry;
      }
    }
  }

  if (bestMatch) {
    const text = isFr ? bestMatch.fr : bestMatch.en;
    const quickActions = bestMatch.quickActions?.map(qa => ({
      label: isFr ? qa.label : qa.labelEn,
      href: qa.href,
    }));
    const followUps = (isFr ? bestMatch.followUpsFr : bestMatch.followUpsEn)?.map(f => ({
      label: f,
      query: f,
    }));
    return { text, quickActions, followUps };
  }

  // Default fallback
  const defaultText = isFr
    ? "Je n'ai pas trouvé de réponse exacte, mais voici comment je peux vous aider:\n\n- **Simulateurs** — CRS et Arrima\n- **Français** — 390+ exercices, TCF/TEF\n- **Tarifs** — Gratuit, Standard, Premium\n- **Marketplace** — Avocats et consultants vérifiés\n- **Guide** — Logement, emploi, administration\n\nEssayez de poser votre question différemment ou choisissez un sujet ci-dessous!"
    : "I couldn't find an exact answer, but here's how I can help:\n\n- **Simulators** — CRS and Arrima\n- **French** — 390+ exercises, TCF/TEF\n- **Pricing** — Free, Standard, Premium\n- **Marketplace** — Verified lawyers and consultants\n- **Guide** — Housing, employment, administration\n\nTry rephrasing your question or choose a topic below!";

  return {
    text: defaultText,
    quickActions: [
      { label: isFr ? "Simulateur Arrima" : "Arrima Simulator", href: "/simulateur-arrima" },
      { label: isFr ? "Cours de français" : "French Courses", href: "/francisation" },
      { label: isFr ? "Voir les tarifs" : "View Pricing", href: "/tarifs" },
      { label: isFr ? "Marketplace" : "Marketplace", href: "/marketplace" },
    ],
    followUps: [
      { label: isFr ? "Quels sont vos tarifs?" : "What are your prices?", query: isFr ? "Quels sont vos tarifs?" : "What are your prices?" },
      { label: isFr ? "Par où commencer?" : "Where to start?", query: isFr ? "Par où commencer mon immigration?" : "Where to start my immigration?" },
    ],
  };
}
