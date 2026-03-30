import { NextRequest, NextResponse } from "next/server";

// ─── Assessment API ───
// Handles submitting and retrieving assessment results
// Supports: self-assessment, exercise scores, mock exams, trainer evaluations

export interface AssessmentResult {
  userId: string;
  type: "self-assessment" | "exercise" | "mock-exam" | "trainer-evaluation";
  skill?: "CO" | "CE" | "EO" | "EE";
  level?: string;
  score: number;
  maxScore: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

// GET /api/assessment?userId=xxx&type=xxx
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const type = request.nextUrl.searchParams.get("type");

  if (!userId) {
    return NextResponse.json(
      { error: "userId parameter is required" },
      { status: 400 }
    );
  }

  // In production: fetch from database
  // const results = await db.assessments.findMany({
  //   where: { userId, ...(type ? { type } : {}) },
  //   orderBy: { timestamp: 'desc' },
  // });

  return NextResponse.json({
    success: true,
    data: {
      userId,
      results: [],
      summary: {
        totalAssessments: 0,
        averageScore: 0,
        estimatedNCLC: 4,
        estimatedCEFR: "A2",
        skillBreakdown: {
          CO: { score: 0, level: "A1" },
          CE: { score: 0, level: "A1" },
          EO: { score: 0, level: "A1" },
          EE: { score: 0, level: "A1" },
        },
      },
    },
    message: type
      ? `${type} results loaded`
      : "All assessment results loaded",
  });
}

// POST /api/assessment
export async function POST(request: NextRequest) {
  try {
    const body: AssessmentResult = await request.json();

    // Validate
    if (!body.userId || !body.type) {
      return NextResponse.json(
        { error: "userId and type are required" },
        { status: 400 }
      );
    }

    if (body.score === undefined || body.maxScore === undefined) {
      return NextResponse.json(
        { error: "score and maxScore are required" },
        { status: 400 }
      );
    }

    if (body.score < 0 || body.score > body.maxScore) {
      return NextResponse.json(
        { error: "score must be between 0 and maxScore" },
        { status: 400 }
      );
    }

    const percentage = Math.round((body.score / body.maxScore) * 100);

    // Calculate estimated NCLC from score
    let estimatedNCLC = 2;
    if (percentage >= 90) estimatedNCLC = 10;
    else if (percentage >= 80) estimatedNCLC = 9;
    else if (percentage >= 70) estimatedNCLC = 7;
    else if (percentage >= 60) estimatedNCLC = 6;
    else if (percentage >= 50) estimatedNCLC = 5;
    else if (percentage >= 40) estimatedNCLC = 4;
    else if (percentage >= 25) estimatedNCLC = 3;

    const nclcToCefr: Record<number, string> = {
      2: "A1", 3: "A1+", 4: "A2", 5: "B1", 6: "B1+",
      7: "B2", 8: "B2+", 9: "C1", 10: "C2",
    };

    // In production: save to database
    // await db.assessments.create({ data: { ...body, timestamp: new Date() } });

    return NextResponse.json({
      success: true,
      message: "Assessment saved successfully",
      data: {
        ...body,
        timestamp: body.timestamp || new Date().toISOString(),
        percentage,
        estimatedNCLC,
        estimatedCEFR: nclcToCefr[estimatedNCLC] || "A1",
        feedback: generateFeedback(body.type, percentage, body.skill),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// Generate contextual feedback based on assessment results
function generateFeedback(
  type: string,
  percentage: number,
  skill?: string
): { fr: string; en: string } {
  if (type === "mock-exam") {
    if (percentage >= 80) {
      return {
        fr: "Excellent résultat! Vous etes pret pour l'examen reel. Continuez a pratiquer pour maintenir votre niveau.",
        en: "Excellent result! You are ready for the real exam. Keep practicing to maintain your level.",
      };
    }
    if (percentage >= 60) {
      return {
        fr: "Bon résultat. Concentrez-vous sur vos points faibles et refaites les exercices du meme niveau.",
        en: "Good result. Focus on your weak points and redo exercises at the same level.",
      };
    }
    return {
      fr: "Continuez a pratiquer regulierement. Recommandation: 30 minutes par jour sur la plateforme.",
      en: "Keep practicing regularly. Recommendation: 30 minutes per day on the platform.",
    };
  }

  if (type === "exercise" && skill) {
    const skillNames: Record<string, { fr: string; en: string }> = {
      CO: { fr: "compréhension orale", en: "listening comprehension" },
      CE: { fr: "compréhension écrite", en: "reading comprehension" },
      EO: { fr: "expression orale", en: "oral expression" },
      EE: { fr: "expression écrite", en: "written expression" },
    };
    const name = skillNames[skill] || { fr: skill, en: skill };

    if (percentage >= 80) {
      return {
        fr: `Excellente maîtrise en ${name.fr}. Passez au niveau superieur!`,
        en: `Excellent mastery in ${name.en}. Move to the next level!`,
      };
    }
    return {
      fr: `Continuez a travailler votre ${name.fr}. Utilisez la répétition espacee pour consolider.`,
      en: `Keep working on your ${name.en}. Use spaced repetition to consolidate.`,
    };
  }

  return {
    fr: "Continuez vos efforts! Chaque minute de pratique compte.",
    en: "Keep going! Every minute of practice counts.",
  };
}
