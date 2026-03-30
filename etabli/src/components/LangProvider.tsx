"use client";
import { useState, type ReactNode } from "react";
import { LangContext, type Lang } from "@/lib/i18n";

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
