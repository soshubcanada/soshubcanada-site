import { NextRequest, NextResponse } from "next/server";

// ─── AI Language Assistant API ───
// Provides grammar corrections, explanations, and study recommendations
// In production: connect to Claude API or fine-tuned model
// For MVP: pattern-matching with curated expert responses

interface AssistantRequest {
  message: string;
  context?: "grammar" | "vocabulary" | "pronunciation" | "study-plan" | "quebec" | "general";
  userLevel?: string; // CEFR level
  lang?: "fr" | "en";
}

interface AssistantResponse {
  reply: string;
  type: "correction" | "explanation" | "recommendation" | "vocabulary" | "conversation";
  suggestions?: string[];
  relatedExercises?: { title: string; href: string }[];
}

// POST /api/assistant
export async function POST(request: NextRequest) {
  try {
    const body: AssistantRequest = await request.json();

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const msg = body.message.toLowerCase().trim();
    const lang = body.lang || "fr";
    const isFr = lang === "fr";

    // Generate response based on context and patterns
    const response = generateResponse(msg, body.context, body.userLevel, isFr);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

function generateResponse(
  msg: string,
  context: string | undefined,
  level: string | undefined,
  isFr: boolean
): AssistantResponse {
  // Grammar correction context
  if (context === "grammar" || msg.includes("corrig") || msg.includes("correct")) {
    return {
      reply: isFr
        ? "Voici mon analyse grammaticale:\n\nVotre texte contient quelques points a améliorer:\n\n1. **Accord sujet-verbe**: Vérifiez que le verbe s'accorde avec le sujet en nombre et en personne.\n2. **Articles**: En français, chaque nom est precede d'un article (le, la, les, un, une, des).\n3. **Accent**: N'oubliez pas les accents — ils changent le sens (a/a, ou/ou, sur/sur).\n\nConseil: Relisez votre texte a voix haute. Les erreurs s'entendent souvent mieux qu'elles ne se voient."
        : "Here is my grammar analysis:\n\nYour text has a few areas for improvement:\n\n1. **Subject-verb agreement**: Check that verbs agree with subjects in number and person.\n2. **Articles**: In French, every noun needs an article (le, la, les, un, une, des).\n3. **Accents**: Don't forget accents — they change meaning (a/a, ou/ou, sur/sur).\n\nTip: Read your text aloud. Errors are often heard better than seen.",
      type: "correction",
      suggestions: isFr
        ? ["Vérifiez les accords", "Ajoutez les articles manquants", "Attention aux accents"]
        : ["Check agreements", "Add missing articles", "Watch for accents"],
      relatedExercises: [
        { title: isFr ? "Grammaire — Articles" : "Grammar — Articles", href: "/francisation/grammaire" },
        { title: isFr ? "Dictee" : "Dictation", href: "/francisation/dictee" },
      ],
    };
  }

  // Vocabulary context
  if (context === "vocabulary" || msg.includes("vocab") || msg.includes("mot") || msg.includes("word")) {
    return {
      reply: isFr
        ? "Voici du vocabulaire utile pour l'établissement au Québec:\n\n**Logement**: bail, loyer, propriétaire, locataire, chauffage, déménagement\n**Emploi**: CV, entrevue, poste, salaire, contrat, probation\n**Administration**: NAS, RAMQ, formulaire, rendez-vous, délai\n**Sante**: clinique sans rendez-vous, médecin de famille, ordonnance, urgence\n**Transport**: carte OPUS, passe mensuelle, correspondance\n\nConseil: Apprenez les mots dans leur contexte (ex: 'signer un bail') plutot qu'en isolation."
        : "Here is useful vocabulary for settling in Québec:\n\n**Housing**: lease, rent, landlord, tenant, heating, moving\n**Employment**: résumé, interview, position, salary, contract, probation\n**Administration**: SIN, RAMQ, form, appointment, delay\n**Health**: walk-in clinic, family doctor, prescription, emergency\n**Transport**: OPUS card, monthly pass, transfer\n\nTip: Learn words in context (e.g., 'sign a lease') rather than in isolation.",
      type: "vocabulary",
      relatedExercises: [
        { title: isFr ? "Vocabulaire d'établissement" : "Settlement Vocabulary", href: "/francisation/vocabulaire" },
        { title: isFr ? "Révision espacee" : "Spaced Review", href: "/francisation/revision" },
      ],
    };
  }

  // Study plan context
  if (context === "study-plan" || msg.includes("plan") || msg.includes("étude") || msg.includes("study") || msg.includes("nclc")) {
    const targetLevel = level || "B2";
    return {
      reply: isFr
        ? `Plan d'étude personnalise pour atteindre le niveau ${targetLevel} (NCLC 7):\n\n**Semaines 1-4 — Fondation (A1-A2)**\n- 30 min/jour: Vocabulaire + Répétition espacee\n- 2x/semaine: Compréhension orale (CO)\n- 1x/semaine: Grammaire de base\n\n**Semaines 5-8 — Intermédiaire (A2-B1)**\n- 45 min/jour: Exercices interactifs\n- 3x/semaine: Expression écrite + orale\n- 1x/semaine: Examen blanc partiel\n\n**Semaines 9-12 — Avance (B1-B2)**\n- 60 min/jour: Pratique mixte\n- Immersion: Radio-Canada, Tou.tv, Le Devoir\n- 1x/semaine: Examen blanc complet\n\n**Semaines 13-16 — Préparation examen**\n- Examens blancs: 2x/semaine\n- Focus sur les faiblesses identifiees\n- Stratégies d'examen TCF/TEF\n\nRessources quotidiennes:\n- etabli. → Pratique rapide (5 min)\n- etabli. → Révision espacee (10 min)\n- Immersion passive (20+ min)`
        : `Personalized study plan to reach level ${targetLevel} (NCLC 7):\n\n**Weeks 1-4 — Foundation (A1-A2)**\n- 30 min/day: Vocabulary + Spaced répétition\n- 2x/week: Listening compréhension (CO)\n- 1x/week: Basic grammar\n\n**Weeks 5-8 — Intermediate (A2-B1)**\n- 45 min/day: Interactive exercises\n- 3x/week: Written + oral expression\n- 1x/week: Partial mock exam\n\n**Weeks 9-12 — Advanced (B1-B2)**\n- 60 min/day: Mixed practice\n- Immersion: Radio-Canada, Tou.tv, Le Devoir\n- 1x/week: Full mock exam\n\n**Weeks 13-16 — Exam préparation**\n- Mock exams: 2x/week\n- Focus on identified weaknesses\n- TCF/TEF exam stratégies\n\nDaily resources:\n- etabli. → Quick Practice (5 min)\n- etabli. → Spaced Review (10 min)\n- Passive immersion (20+ min)`,
      type: "recommendation",
      relatedExercises: [
        { title: isFr ? "Parcours immigration" : "Immigration Paths", href: "/francisation/parcours" },
        { title: isFr ? "Pratique rapide" : "Quick Practice", href: "/francisation/pratique-rapide" },
        { title: isFr ? "Examen blanc" : "Mock Exam", href: "/francisation/examen-blanc" },
      ],
    };
  }

  // Québec French context
  if (context === "quebec" || msg.includes("quebec") || msg.includes("québécois") || msg.includes("expression")) {
    return {
      reply: isFr
        ? "Expressions québécoises utiles pour les nouveaux arrivants:\n\n**Au quotidien:**\n- \"C'est correct\" = C'est bien / D'accord\n- \"Icitte\" = Ici\n- \"Pantoute\" = Pas du tout\n- \"C'est plate\" = C'est ennuyeux\n- \"Faire du pouce\" = Faire de l'auto-stop\n\n**Au travail:**\n- \"Un chum\" = Un ami proche (masculin)\n- \"Être brule\" = Être epuise\n- \"Le 5 a 7\" = Apero entre collegues\n- \"Faire la file\" = Faire la queue\n\n**Prononciation:**\n- \"Tu\" → [tsu] devant voyelle\n- \"Dire\" → [dzir]\n- Le 'e' muet est plus souvent omis\n\nNote: Le TCF/TEF accepte le français international. Mais comprendre ces expressions vous aidera a vous integrer au Québec."
        : "Useful Québec French expressions for newcomers:\n\n**Daily life:**\n- \"C'est correct\" = It's fine / OK\n- \"Icitte\" = Here\n- \"Pantoute\" = Not at all\n- \"C'est plate\" = It's boring\n- \"Faire du pouce\" = Hitchhike\n\n**At work:**\n- \"Un chum\" = A close friend (male)\n- \"Être brule\" = To be exhausted\n- \"Le 5 a 7\" = After-work drinks\n- \"Faire la file\" = To stand in line\n\n**Pronunciation:**\n- \"Tu\" → [tsu] before vowels\n- \"Dire\" → [dzir]\n- Silent 'e' dropped more often\n\nNote: TCF/TEF accepts international French. But understanding these expressions will help you integrate in Québec.",
      type: "explanation",
      relatedExercises: [
        { title: isFr ? "Prononciation" : "Pronunciation", href: "/francisation/prononciation" },
        { title: isFr ? "Vocabulaire" : "Vocabulary", href: "/francisation/vocabulaire" },
      ],
    };
  }

  // Pronunciation context
  if (context === "pronunciation" || msg.includes("pronon") || msg.includes("phon") || msg.includes("accent")) {
    return {
      reply: isFr
        ? "Guide de prononciation du français:\n\n**Les sons difficiles:**\n\n1. **Voyelles nasales** [ɔ̃] [ɑ̃] [ɛ̃]\n   - 'bon' [bɔ̃], 'dans' [dɑ̃], 'bien' [bjɛ̃]\n   - L'air passe par le nez. Ne prononcez PAS le 'n' final.\n\n2. **Le R français** [ʁ]\n   - Se prononce dans la gorge (uvulaire)\n   - Pas comme le R anglais ou espagnol\n\n3. **U vs OU** [y] vs [u]\n   - 'rue' [ʁy] vs 'roue' [ʁu]\n   - Pour [y]: dites 'i' et arrondissez les levres\n\n4. **Les liaisons**\n   - 'les amis' → [le.z‿ami]\n   - Obligatoire apres les articles et pronoms\n\nConseil: Écoutez Radio-Canada 15 min/jour pour habituer votre oreille."
        : "French pronunciation guide:\n\n**Difficult sounds:**\n\n1. **Nasal vowels** [ɔ̃] [ɑ̃] [ɛ̃]\n   - 'bon' [bɔ̃], 'dans' [dɑ̃], 'bien' [bjɛ̃]\n   - Air passes through the nose. Do NOT pronounce the final 'n'.\n\n2. **French R** [ʁ]\n   - Pronounced in the throat (uvular)\n   - Not like English or Spanish R\n\n3. **U vs OU** [y] vs [u]\n   - 'rue' [ʁy] vs 'roue' [ʁu]\n   - For [y]: say 'ee' and round your lips\n\n4. **Liaisons**\n   - 'les amis' → [le.z‿ami]\n   - Mandatory after articles and pronouns\n\nTip: Listen to Radio-Canada 15 min/day to train your ear.",
      type: "explanation",
      relatedExercises: [
        { title: isFr ? "Guide de prononciation" : "Pronunciation Guide", href: "/francisation/prononciation" },
        { title: isFr ? "Expression orale" : "Oral Expression", href: "/francisation/expression-orale" },
      ],
    };
  }

  // Default / general response
  return {
    reply: isFr
      ? "Je suis votre assistant de francisation! Je peux vous aider avec:\n\n- **Grammaire**: Corrigez vos textes et comprenez les règles\n- **Vocabulaire**: Apprenez le vocabulaire d'établissement au Québec\n- **Prononciation**: Maitrisez les sons du français\n- **Plan d'étude**: Obtenez un programme personnalise pour votre NCLC cible\n- **Expressions québécoises**: Comprenez le français du Québec\n\nPosez-moi une question ou tapez un mot-clé comme 'grammaire', 'vocabulaire', ou 'plan d'étude'."
      : "I'm your French learning assistant! I can help with:\n\n- **Grammar**: Get your texts corrected and understand rules\n- **Vocabulary**: Learn Québec settlement vocabulary\n- **Pronunciation**: Master French sounds\n- **Study plan**: Get a personalized program for your NCLC target\n- **Québec expressions**: Understand Québec French\n\nAsk me a question or type a keyword like 'grammar', 'vocabulary', or 'study plan'.",
    type: "conversation",
    suggestions: isFr
      ? ["Corrige mon texte", "Vocabulaire logement", "Plan d'étude NCLC 7", "Expressions québécoises", "Prononciation"]
      : ["Correct my text", "Housing vocabulary", "NCLC 7 study plan", "Québec expressions", "Pronunciation"],
    relatedExercises: [
      { title: isFr ? "Pratique rapide" : "Quick Practice", href: "/francisation/pratique-rapide" },
      { title: isFr ? "Auto-évaluation CECR" : "CEFR Self-Assessment", href: "/francisation/auto-evaluation" },
    ],
  };
}
