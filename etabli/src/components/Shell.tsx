"use client";
import { type ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import LangProvider from "./LangProvider";
import ProgressProvider from "./ProgressProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import DailyReminder from "./DailyReminder";
import { useLang } from "@/lib/i18n";

/* ─── Onboarding Banner (shown on home for first-time visitors) ─── */

function OnboardingBanner() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      const done = localStorage.getItem("etabli_onboarding");
      const dismissed = localStorage.getItem("etabli_onboarding_dismissed");
      if (!done && !dismissed) setShow(true);
    } catch {
      // SSR or localStorage unavailable
    }
  }, [pathname]);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("etabli_onboarding_dismissed", "1");
    } catch {}
  };

  return (
    <div className="bg-[#085041] text-white px-4 py-2.5 text-center text-sm relative">
      <span>
        {fr
          ? "Nouveau sur etabli? "
          : "New to etabli? "}
      </span>
      <Link
        href="/onboarding"
        className="underline underline-offset-2 font-semibold hover:text-[#1D9E75] transition-colors"
      >
        {fr ? "Commencez par le guide d'onboarding" : "Start with the onboarding guide"}
      </Link>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* ─── Shell ─── */

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <ProgressProvider>
        <div className="min-h-screen flex flex-col">
          <OnboardingBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <DailyReminder />
          <ChatWidget />
        </div>
      </ProgressProvider>
    </LangProvider>
  );
}
