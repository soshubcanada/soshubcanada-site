import { NextRequest, NextResponse } from "next/server";

// ─── Progress API ───
// Handles saving and loading user learning progress
// In production, this would connect to a database (PostgreSQL, Supabase, etc.)
// For now, it provides the API contract and returns mock responses

export interface ProgressPayload {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  dailyGoal: number;
  dailyXP: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  wordsLearned: string[];
  skillLevels: Record<string, number>;
  weakAreas: string[];
  lastPractice: string;
  badges: string[];
}

// GET /api/progress?userId=xxx
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId parameter is required" },
      { status: 400 }
    );
  }

  // In production: fetch from database
  // const progress = await db.progress.findUnique({ where: { userId } });

  return NextResponse.json({
    success: true,
    data: {
      userId,
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
      skillLevels: {},
      weakAreas: [],
      lastPractice: "",
      badges: [],
    },
    message: "Progress loaded successfully",
  });
}

// POST /api/progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["xp", "level", "streak"];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // In production: save to database
    // await db.progress.upsert({
    //   where: { userId: body.userId },
    //   update: body,
    //   create: body,
    // });

    return NextResponse.json({
      success: true,
      message: "Progress saved successfully",
      data: body,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// PUT /api/progress — Partial update (add XP, complete exercise, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { action } = body;

    switch (action) {
      case "addXP":
        // In production: atomic increment
        return NextResponse.json({
          success: true,
          message: `Added ${body.amount || 0} XP`,
          data: { xp: body.amount || 0 },
        });

      case "completeExercise":
        return NextResponse.json({
          success: true,
          message: `Exercise completed: ${body.skillId}`,
          data: { skillId: body.skillId },
        });

      case "completeLesson":
        return NextResponse.json({
          success: true,
          message: "Lesson completed",
          data: { lessonsCompleted: 1 },
        });

      case "earnBadge":
        return NextResponse.json({
          success: true,
          message: `Badge earned: ${body.badgeId}`,
          data: { badgeId: body.badgeId },
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
