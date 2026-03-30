"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { PRONUNCIATION_GUIDE } from "@/lib/learning-system";
import Link from "next/link";
import { useState } from "react";
import { SpeakButton } from "@/components/AudioPlayer";
import {
  Mic,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Volume2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

function PronunciationGuide() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(PRONUNCIATION_GUIDE.map((r) => r.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6b56] to-[#1D9E75] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-200 mb-6">
            <Link
              href="/francisation"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Prononciation" : "Pronunciation"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Mic size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr
                  ? "Guide de prononciation"
                  : "Pronunciation Guide"}
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
                {fr
                  ? "Maitrisez les sons du français québécois. Apprenez les voyelles nasales, les liaisons, le 'r' français et les particularites du Québec."
                  : "Master the sounds of Québec French. Learn nasal vowels, liaisons, the French 'r', and Québec-specific features."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-emerald-50 border-b border-emerald-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Volume2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {fr ? "Conseil pratique" : "Practical Tip"}
              </p>
              <p className="text-sm text-emerald-600">
                {fr
                  ? "Cliquez sur chaque règle pour voir les exemples avec la transcription phonetique (API). Repetez les sons a voix haute pour progresser."
                  : "Click each rule to see examples with phonetic transcription (IPA). Repeat the sounds out loud to improve."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Expand/Collapse controls */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {fr
                ? `${PRONUNCIATION_GUIDE.length} règles de prononciation`
                : `${PRONUNCIATION_GUIDE.length} Pronunciation Rules`}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="text-sm text-gray-500 hover:text-[#085041] transition-colors"
              >
                {fr ? "Tout ouvrir" : "Expand all"}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-gray-500 hover:text-[#085041] transition-colors"
              >
                {fr ? "Tout fermer" : "Collapse all"}
              </button>
            </div>
          </div>

          {/* Pronunciation Cards */}
          <div className="space-y-4">
            {PRONUNCIATION_GUIDE.map((rule, index) => {
              const isExpanded = expandedIds.has(rule.id);
              const isQuebec = rule.id === "pr-6";

              return (
                <div
                  key={rule.id}
                  className={`rounded-2xl border-2 transition-all ${
                    isQuebec
                      ? isExpanded
                        ? "border-blue-400 shadow-md bg-white"
                        : "border-blue-200 bg-white hover:border-blue-300"
                      : isExpanded
                      ? "border-emerald-300 shadow-md bg-white"
                      : "border-gray-100 bg-white hover:border-emerald-200"
                  }`}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => toggleCard(rule.id)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <span
                      className={`text-lg font-bold w-8 text-center flex-shrink-0 ${
                        isQuebec ? "text-blue-400" : "text-gray-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* IPA badge */}
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 tracking-wide">
                          {rule.phonetic}
                        </span>
                        {isQuebec && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                            <svg
                              viewBox="0 0 16 16"
                              className="w-3 h-3"
                              fill="currentColor"
                            >
                              <path d="M8 1l1.5 3.5L13 5l-2.5 2.5L11.5 11 8 9l-3.5 2 1-3.5L3 5l3.5-.5z" />
                            </svg>
                            {fr ? "Québec" : "Québec"}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {fr ? rule.soundFr : rule.soundEn}
                      </p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 transition-transform ${
                        isQuebec ? "text-blue-400" : "text-gray-300"
                      } ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-0">
                      <div className="ml-12">
                        {/* Examples Table */}
                        <div className="mb-5 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr
                                className={`border-b ${
                                  isQuebec ? "border-blue-100" : "border-emerald-100"
                                }`}
                              >
                                <th className="text-left py-2 pr-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                                  {fr ? "Mot" : "Word"}
                                </th>
                                <th className="text-left py-2 pr-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                                  {fr ? "Phonetique (API)" : "Phonetic (IPA)"}
                                </th>
                                <th className="text-left py-2 font-semibold text-gray-500 uppercase text-xs tracking-wider">
                                  {fr ? "Sens" : "Meaning"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rule.examples.map((ex, i) => (
                                <tr
                                  key={i}
                                  className={`border-b last:border-b-0 ${
                                    isQuebec
                                      ? "border-blue-50"
                                      : "border-gray-50"
                                  }`}
                                >
                                  <td className="py-3 pr-4 font-semibold text-gray-900">
                                    <span className="inline-flex items-center gap-1.5">
                                      {ex.word}
                                      <SpeakButton text={ex.word} />
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className="font-mono text-sm px-2 py-0.5 rounded bg-gray-50 text-[#085041] font-medium tracking-wide">
                                      {ex.phonetic}
                                    </span>
                                  </td>
                                  <td className="py-3 text-gray-600 italic">
                                    {ex.meaning}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Tip Box */}
                        <div
                          className={`flex items-start gap-3 p-4 rounded-xl border ${
                            isQuebec
                              ? "bg-blue-50 border-blue-200"
                              : "bg-amber-50 border-amber-200"
                          }`}
                        >
                          <Lightbulb
                            size={18}
                            className={`mt-0.5 flex-shrink-0 ${
                              isQuebec ? "text-blue-500" : "text-[#D97706]"
                            }`}
                          />
                          <div>
                            <p
                              className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                isQuebec ? "text-blue-600" : "text-[#D97706]"
                              }`}
                            >
                              {fr ? "Astuce" : "Tip"}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {rule.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr
                  ? "Pratiquez votre expression orale"
                  : "Practice your speaking skills"}
              </h3>
              <p className="text-sm text-gray-500">
                {fr
                  ? "Mettez en pratique ces sons dans des exercices d'expression orale avec des situations reelles du quotidien."
                  : "Put these sounds into practice with speaking exercises based on real daily situations."}
              </p>
            </div>
            <Link
              href="/francisation/expression-orale"
              className="px-5 py-2.5 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#0a6b56] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              {fr ? "Expression orale" : "Speaking Practice"}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/francisation"
              className="text-sm text-gray-400 hover:text-[#085041] transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              {fr ? "Retour a Francisation" : "Back to Francisation"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <PronunciationGuide />
    </Shell>
  );
}
