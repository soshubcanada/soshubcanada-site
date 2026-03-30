"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";

const STORAGE_KEY = "etabli_last_reminder_date";
const SHOW_DELAY = 3000;
const AUTO_DISMISS = 8000;

export default function DailyReminder() {
  const { lang } = useLang();
  const { progress } = useProgress();
  const fr = lang === "fr";

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown === today) return; // already shown today
    } catch {
      return;
    }

    const showTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, today);
      } catch { /* noop */ }
      setMounted(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, SHOW_DELAY);

    return () => clearTimeout(showTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dismiss(), AUTO_DISMISS);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setMounted(false), 300); // wait for slide-out animation
  };

  if (!mounted) return null;

  // Determine message based on user state
  const today = new Date().toISOString().slice(0, 10);
  const practicedToday = progress.lastPractice === today;
  const goalMet = progress.dailyXP >= progress.dailyGoal;
  const xpRemaining = progress.dailyGoal - progress.dailyXP;

  let message: string;
  if (!practicedToday) {
    message = fr
      ? `N'oublie pas de pratiquer! Ta s\u00e9rie est de ${progress.streak} jour${progress.streak !== 1 ? "s" : ""}.`
      : `Don't forget to practice! Your streak is ${progress.streak} day${progress.streak !== 1 ? "s" : ""}.`;
  } else if (!goalMet) {
    message = fr
      ? `Plus que ${xpRemaining} XP pour atteindre ton objectif!`
      : `Only ${xpRemaining} XP left to reach your goal!`;
  } else {
    message = fr
      ? "Bravo! Objectif quotidien atteint!"
      : "Great job! Daily goal reached!";
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 bg-[#085041] text-white px-5 py-3 rounded-xl shadow-lg max-w-md">
        <p className="text-sm font-medium leading-snug flex-1">{message}</p>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-white/15 transition-colors"
          aria-label={fr ? "Fermer" : "Close"}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
