"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Flame, Target, BookOpen, Award, TrendingUp, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";

/* ─── Types ─── */

type NotificationType = "streak_reminder" | "goal_progress" | "new_content" | "level_up" | "streak_milestone";

interface Notification {
  id: string;
  type: NotificationType;
  messageFr: string;
  messageEn: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = "etabli_notifications";
const MAX_NOTIFICATIONS = 10;

/* ─── Icon per type ─── */

function NotifIcon({ type }: { type: NotificationType }) {
  const cls = "shrink-0";
  switch (type) {
    case "streak_reminder":
      return <Flame size={18} className={`${cls} text-orange-500`} />;
    case "goal_progress":
      return <Target size={18} className={`${cls} text-[#1D9E75]`} />;
    case "new_content":
      return <BookOpen size={18} className={`${cls} text-blue-500`} />;
    case "level_up":
      return <Award size={18} className={`${cls} text-yellow-500`} />;
    case "streak_milestone":
      return <TrendingUp size={18} className={`${cls} text-purple-500`} />;
  }
}

/* ─── Time-ago helper ─── */

function timeAgo(timestamp: string, fr: boolean): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return fr ? "maintenant" : "just now";
  if (mins < 60) return fr ? `il y a ${mins} min` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return fr ? `il y a ${hrs}h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return fr ? `il y a ${days}j` : `${days}d ago`;
}

/* ─── Load / save helpers ─── */

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch { /* noop */ }
  return [];
}

function saveNotifications(notifs: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFICATIONS)));
  } catch { /* noop */ }
}

/* ─── Component ─── */

export default function NotificationCenter() {
  const { lang } = useLang();
  const { progress } = useProgress();
  const fr = lang === "fr";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // On mount + progress change: generate notifications
  useEffect(() => {
    const existing = loadNotifications();
    const existingIds = new Set(existing.map((n) => n.id));
    const newNotifs: Notification[] = [];
    const today = new Date().toISOString().slice(0, 10);

    // Streak reminder: has a streak but no practice today
    if (progress.streak > 0 && progress.lastPractice !== today) {
      const id = `streak_reminder_${today}`;
      if (!existingIds.has(id)) {
        newNotifs.push({
          id,
          type: "streak_reminder",
          messageFr: "Tu n'as pas pratiqu\u00e9 aujourd'hui!",
          messageEn: "You haven't practiced today!",
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }

    // Goal progress: reached 50% of daily goal
    if (progress.dailyXP >= progress.dailyGoal / 2 && progress.dailyXP < progress.dailyGoal) {
      const id = `goal_progress_${today}`;
      if (!existingIds.has(id)) {
        newNotifs.push({
          id,
          type: "goal_progress",
          messageFr: "Tu as atteint 50% de ton objectif quotidien!",
          messageEn: "You've reached 50% of your daily goal!",
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }

    // Streak milestone: multiple of 7
    if (progress.streak > 0 && progress.streak % 7 === 0) {
      const id = `streak_milestone_${progress.streak}`;
      if (!existingIds.has(id)) {
        newNotifs.push({
          id,
          type: "streak_milestone",
          messageFr: `S\u00e9rie de ${progress.streak} jours! Continue!`,
          messageEn: `${progress.streak}-day streak! Keep going!`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }

    // Level up: check if level changed (compare with stored last-notified level)
    try {
      const lastNotifiedLevel = parseInt(localStorage.getItem("etabli_last_notified_level") || "1", 10);
      if (progress.level > lastNotifiedLevel) {
        const id = `level_up_${progress.level}`;
        if (!existingIds.has(id)) {
          newNotifs.push({
            id,
            type: "level_up",
            messageFr: `F\u00e9licitations! Tu as atteint le niveau ${progress.level}!`,
            messageEn: `Congratulations! You reached level ${progress.level}!`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
        localStorage.setItem("etabli_last_notified_level", String(progress.level));
      }
    } catch { /* noop */ }

    // New content: show once (static announcement)
    const contentId = "new_content_listening_v1";
    if (!existingIds.has(contentId)) {
      newNotifs.push({
        id: contentId,
        type: "new_content",
        messageFr: "Nouveau: 60+ exercices de compr\u00e9hension orale ajout\u00e9s!",
        messageEn: "New: 60+ listening exercises added!",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (newNotifs.length > 0) {
      const merged = [...newNotifs, ...existing].slice(0, MAX_NOTIFICATIONS);
      setNotifications(merged);
      saveNotifications(merged);
    } else {
      setNotifications(existing);
    }
  }, [progress.streak, progress.dailyXP, progress.level, progress.lastPractice, progress.dailyGoal]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveNotifications(updated);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-600 hover:text-[#085041] hover:bg-gray-50 transition-colors"
        aria-label={fr ? "Notifications" : "Notifications"}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full badge-pop">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden dropdown-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#085041]">
              {fr ? "Notifications" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#085041] font-medium transition-colors"
              >
                <Check size={14} />
                {fr ? "Tout lu" : "Mark all read"}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                {fr ? "Aucune notification" : "No notifications"}
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    !n.read ? "bg-[#E1F5EE]/40" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-medium text-gray-900" : "text-gray-600"}`}>
                      {fr ? n.messageFr : n.messageEn}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(n.timestamp, fr)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1D9E75] shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
