"use client";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  ProgressContext,
  DEFAULT_PROGRESS,
  loadProgress,
  saveProgress,
  getLevel,
  XP_REWARDS,
  type UserProgress,
} from "@/lib/learning-system";

// Helper: log activity for dashboard feed
function logActivity(msgFn: (fr: boolean) => string) {
  try {
    const log = JSON.parse(localStorage.getItem("etabli_activity_log") || "[]");
    log.unshift({ ts: new Date().toISOString(), msgFr: msgFn(true), msgEn: msgFn(false) });
    localStorage.setItem("etabli_activity_log", JSON.stringify(log.slice(0, 50)));
  } catch { /* noop */ }
}

// Helper: log daily XP for calendar heatmap
function logDailyXP(amount: number) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem("etabli_daily_xp") || "{}");
    data[today] = (data[today] || 0) + amount;
    localStorage.setItem("etabli_daily_xp", JSON.stringify(data));
  } catch { /* noop */ }
}

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveProgress(progress);
  }, [progress, loaded]);

  // Check and update streak on load + streak freeze logic
  useEffect(() => {
    if (!loaded) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = progress.lastPractice;
    if (last && last !== today) {
      const lastDate = new Date(last);
      const diff = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
      if (diff > 1) {
        // Check for streak freeze
        const freezeData = JSON.parse(localStorage.getItem("etabli_streak_freeze") || '{"available":2,"lastEarned":""}');
        if (freezeData.available > 0 && diff === 2) {
          freezeData.available -= 1;
          localStorage.setItem("etabli_streak_freeze", JSON.stringify(freezeData));
          setProgress((p) => ({ ...p, dailyXP: 0 }));
          logActivity(fr => fr ? "Gel de série utilisé automatiquement" : "Streak freeze used automatically");
        } else {
          setProgress((p) => ({ ...p, streak: 0, dailyXP: 0 }));
          logActivity(fr => fr ? "Série perdue" : "Streak lost");
        }
      } else if (diff === 1) {
        setProgress((p) => ({ ...p, dailyXP: 0 }));
      }
    }
    // Award streak freeze at 7-day intervals
    const streak = progress.streak;
    if (streak > 0 && streak % 7 === 0) {
      const freezeData = JSON.parse(localStorage.getItem("etabli_streak_freeze") || '{"available":0,"lastEarned":""}');
      if (freezeData.lastEarned !== today) {
        freezeData.available = Math.min(freezeData.available + 1, 2);
        freezeData.lastEarned = today;
        localStorage.setItem("etabli_streak_freeze", JSON.stringify(freezeData));
      }
    }
  }, [loaded, progress.lastPractice]); // eslint-disable-line react-hooks/exhaustive-deps

  const addXP = useCallback((amount: number) => {
    logDailyXP(amount);
    setProgress((p) => {
      const today = new Date().toISOString().slice(0, 10);
      const newXP = p.xp + amount;
      const newDailyXP = p.dailyXP + amount;
      const newLevel = getLevel(newXP);
      const newStreak = p.lastPractice === today ? p.streak : p.streak + 1;
      const dailyGoalReached = p.dailyXP < p.dailyGoal && newDailyXP >= p.dailyGoal;
      return {
        ...p,
        xp: newXP + (dailyGoalReached ? XP_REWARDS.dailyGoalReached : 0),
        dailyXP: newDailyXP,
        level: newLevel,
        streak: newStreak,
        lastPractice: today,
      };
    });
  }, []);

  const completeExercise = useCallback((skillId: string) => {
    setProgress((p) => ({
      ...p,
      exercisesCompleted: p.exercisesCompleted + 1,
      skillLevels: {
        ...p.skillLevels,
        [skillId]: Math.min((p.skillLevels[skillId] || 0) + 1, 5),
      },
    }));
    addXP(XP_REWARDS.exerciseComplete);
    logActivity(() => `Exercise completed: ${skillId}`);
  }, [addXP]);

  const completeLesson = useCallback(() => {
    setProgress((p) => ({
      ...p,
      lessonsCompleted: p.lessonsCompleted + 1,
    }));
    addXP(XP_REWARDS.lessonComplete);
    logActivity(fr => fr ? "Leçon terminée" : "Lesson completed");
  }, [addXP]);

  const learnWord = useCallback((wordId: string) => {
    setProgress((p) => {
      if (p.wordsLearned.includes(wordId)) return p;
      return { ...p, wordsLearned: [...p.wordsLearned, wordId] };
    });
    addXP(XP_REWARDS.vocabMastered);
  }, [addXP]);

  const earnBadge = useCallback((badgeId: string) => {
    setProgress((p) => {
      if (p.badges.includes(badgeId)) return p;
      return { ...p, badges: [...p.badges, badgeId] };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, addXP, completeExercise, completeLesson, learnWord, earnBadge, resetProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
