"use client";
import { createContext, useContext } from "react";

export type Lang = "fr" | "en";

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "fr", setLang: () => {} });

export function useLang() {
  return useContext(LangContext);
}

export function t(fr: string, en: string, lang: Lang) {
  return lang === "fr" ? fr : en;
}
